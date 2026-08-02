/**
 * Prava REST API Client — SnapFit AI
 * Auto-detects environment:
 *   - Vercel deployment: uses /api/prava (serverless functions)
 *   - Local dev: uses http://localhost:3001/api/prava (Express proxy)
 */

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const PROXY_URL = isLocalhost ? 'http://localhost:3001/api/prava' : '/api/prava';

const STORAGE_PUB_KEY = "prava_publishable_key";

export const getPravaConfig = () => {
  const publishableKey = localStorage.getItem(STORAGE_PUB_KEY) || import.meta.env.VITE_PRAVA_PUBLISHABLE_KEY || "pk_test_Lr3UPWAZFN6NBzSt2UxyEILvvXH2JhxDTllGtrRib9Q";
  return { publishableKey };
};

// ─── API Functions (via proxy) ────────────────────────────────────

/**
 * Create a Prava Payment Session
 */
export async function createPravaSession({
  totalAmount,
  currency = "INR",
  description = "SnapFit AI Purchase",
  userId = "user_snapfit",
  userEmail = "shopper@snapfit.ai",
  merchantName = "SnapFit AI",
  merchantUrl = "https://snapfit.ai",
  merchantCountry = "IN",
  products = []
}) {
  const purchaseContext = [
    {
      merchant_details: {
        name: merchantName,
        url: merchantUrl,
        country_code_iso2: merchantCountry,
      },
      product_details: products.length > 0 ? products.map(p => ({
        description: p.description || p.name || "Apparel Item",
        unit_price: String(p.unit_price || totalAmount),
        quantity: p.quantity || 1
      })) : [
        {
          description: description,
          unit_price: String(totalAmount),
          quantity: 1
        }
      ],
    }
  ];

  try {
    const res = await fetch(`${PROXY_URL}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        user_email: userEmail,
        total_amount: String(totalAmount),
        currency,
        description,
        purchase_context: purchaseContext
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Prava session error:", res.status, data);
      return { success: false, error: data };
    }

    console.log("✅ Prava session created:", data.session_id);
    return {
      success: true,
      data,
      isSimulated: false
    };
  } catch (err) {
    console.error("Prava session fetch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Poll for Payment Credentials
 */
export async function pollPaymentResult(sessionId) {
  try {
    const res = await fetch(`${PROXY_URL}/${sessionId}`);
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.warn("Prava poll error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Report Outcome Back to Prava
 */
export async function reportPravaStatus(sessionId, txnRefId = null, status = "APPROVED") {
  try {
    const res = await fetch(`${PROXY_URL}/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txn_ref_id: txnRefId || `txref_${Date.now()}`,
        txn_status: status,
      })
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.warn("Prava report error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Health Check
 */
export async function checkPravaHealth() {
  try {
    const res = await fetch(`${PROXY_URL}/health`);
    const data = await res.json();
    return data;
  } catch {
    return { healthy: false };
  }
}
