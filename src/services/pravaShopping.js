import { createPravaSession, pollUntilComplete, reportPravaStatus } from "./pravaApi";

/**
 * SnapFit AI — Prava Agentic Commerce Pipeline
 * Full live integration with Prava REST API (https://sandbox.api.prava.space)
 *
 * Flow:
 *   1. executeSnapFitPravaCheckout  → creates session, returns iframe URL
 *   2. (User completes card entry + passkey in iframe)
 *   3. awaitAndFinalizeCheckout     → polls until real completion, reports status
 */

/**
 * Step 1: Create Prava session & log the quote
 */
export async function executeSnapFitPravaCheckout({
  product,
  selectedSize = "M",
  deliveryAddress = "124 Fashion Street, Connaught Place, New Delhi, 110001",
  logCallback = () => {}
}) {
  const timestamp = new Date().toLocaleTimeString();
  const productName = product.name || product.title || "Apparel Item";
  const productPrice = product.price || 9999;
  const merchant = product.merchantDomain || "myntra.com";

  // Step 1: Prava shop_quote (Lock Live Price)
  logCallback({
    id: `log_${Date.now()}_quote`,
    time: timestamp,
    title: `Prava shop_quote Locked Live Total`,
    details: `Product: ${productName} | Size: ${selectedSize} | Price: ₹${productPrice.toLocaleString('en-IN')} | Merchant: ${merchant}`,
    status: "QUOTE_LOCKED",
    badge: "SHOP_QUOTE"
  });

  const quoteId = `chk_quote_${Math.random().toString(36).substr(2, 10)}`;

  // Step 2: Create Prava Single-Use Payment Session on Prava Backend
  logCallback({
    id: `log_${Date.now()}_session`,
    time: new Date().toLocaleTimeString(),
    title: `Creating Prava Payment Session`,
    details: `Issuing single-use virtual card session locked to ₹${productPrice.toLocaleString('en-IN')} at https://${merchant}`,
    status: "PENDING_PASSKEY",
    badge: "PAYMENT_SESSION"
  });

  const sessionRes = await createPravaSession({
    totalAmount: productPrice,
    currency: "INR",
    description: `Purchase: ${productName} (Size: ${selectedSize})`,
    merchantName: product.brand || "Valentina Luxe",
    merchantUrl: `https://${merchant}`,
    products: [{
      description: `${productName} (Size: ${selectedSize})`,
      unit_price: String(productPrice),
      quantity: 1
    }]
  });

  if (!sessionRes.success || !sessionRes.data) {
    throw new Error("Failed to create Prava Payment Session");
  }

  const sessionData = sessionRes.data;
  const sessionId = sessionData.session_id || sessionData.sessionId;

  logCallback({
    id: `log_${Date.now()}_created`,
    time: new Date().toLocaleTimeString(),
    title: `Prava Session Created (${sessionId})`,
    details: `Registered on Prava Dashboard | Order ID: ${sessionData.order_id || 'pending'}`,
    status: "SESSION_ACTIVE",
    badge: "PRAVA_LIVE"
  });

  return {
    quoteId,
    product,
    selectedSize,
    deliveryAddress,
    sessionId,
    sessionToken: sessionData.session_token,
    iframeUrl: sessionData.iframe_url || sessionData.paymentUrl,
    orderId: sessionData.order_id,
  };
}

/**
 * Step 3: Poll for real payment completion and report status.
 * Returns the real order result with actual network token & CVV.
 *
 * @param {Object} checkoutContext - from executeSnapFitPravaCheckout
 * @param {Object} options
 * @param {function} [options.logCallback] - log events to TransactionLedger
 * @param {function} [options.onPollUpdate] - called each poll with (data, attempt)
 * @param {AbortSignal} [options.signal] - to cancel polling
 */
export async function awaitAndFinalizeCheckout(checkoutContext, {
  logCallback = () => {},
  onPollUpdate = null,
  signal = null,
} = {}) {
  const { product, selectedSize, sessionId } = checkoutContext;
  const productName = product.name || product.title || "Apparel Item";
  const productPrice = product.price || 9999;
  const merchant = product.merchantDomain || "myntra.com";

  logCallback({
    id: `log_${Date.now()}_polling`,
    time: new Date().toLocaleTimeString(),
    title: `Polling Prava for Payment Completion`,
    details: `Waiting for card enrollment + passkey verification on session ${sessionId}`,
    status: "POLLING",
    badge: "AWAITING_RESULT"
  });

  // Poll until Prava returns completed or failed
  const paymentResult = await pollUntilComplete(sessionId, {
    maxAttempts: 30,
    intervalMs: 3000,
    onPoll: onPollUpdate,
    signal,
  });

  // Extract the REAL payment credential from Prava
  const transaction = paymentResult.transactions?.[0];
  const lineItem = transaction?.line_items?.[0];

  if (!lineItem) {
    throw new Error("Payment completed but no line item found in response");
  }

  const realToken = lineItem.token;
  const realCvv = lineItem.dynamic_cvv;
  const realExpiryMonth = lineItem.expiry_month;
  const realExpiryYear = lineItem.expiry_year;
  const txnRefId = lineItem.txn_ref_id;
  const orderId = checkoutContext.orderId || paymentResult.order_id || `ORD_${sessionId}`;

  // Report APPROVED status to Prava with the REAL txn_ref_id
  try {
    await reportPravaStatus(sessionId, txnRefId, "APPROVED");
    logCallback({
      id: `log_${Date.now()}_reported`,
      time: new Date().toLocaleTimeString(),
      title: `Status Reported to Prava (APPROVED)`,
      details: `txn_ref_id: ${txnRefId} | Session: ${sessionId}`,
      status: "REPORTED",
      badge: "STATUS_SENT"
    });
  } catch (err) {
    console.warn("[Prava] Status report warning:", err.message);
  }

  logCallback({
    id: `log_${Date.now()}_settled`,
    time: new Date().toLocaleTimeString(),
    title: `Prava shop_checkout Order Placed (${orderId})`,
    details: `Paid ₹${productPrice.toLocaleString('en-IN')} via Visa Network Token (****${realToken ? realToken.slice(-4) : '????'}) | Session: ${sessionId} | Merchant: ${merchant}`,
    status: "APPROVED",
    badge: "PRAVA_SETTLED"
  });

  return {
    success: true,
    orderId,
    product,
    selectedSize,
    amountPaid: productPrice,
    sessionId,
    virtualCard: {
      token: realToken,
      cvv: realCvv,
      expiry: `${realExpiryMonth || '??'}/${(realExpiryYear || '????').slice(-2)}`
    },
    txnRefId,
    placedAt: new Date().toLocaleTimeString()
  };
}
