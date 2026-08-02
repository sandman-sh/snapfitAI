/**
 * Prava REST API Client — SnapFit AI
 * Auto-detects environment:
 *   - Vercel deployment: uses /api/prava (serverless functions)
 *   - Local dev: uses http://localhost:3001/api/prava (Express proxy)
 *
 * All calls go through the server-side proxy — secret key never touches the browser.
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
 * Single poll for payment credentials (one-shot)
 */
export async function pollPaymentResult(sessionId) {
  try {
    const res = await fetch(`${PROXY_URL}/${sessionId}?_t=${Date.now()}`);
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.warn("Prava poll error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Poll for payment credentials until completed or failed.
 * Resolves with the full payment-result response on completion.
 * Rejects on timeout or terminal failure.
 *
 * @param {string} sessionId - The Prava session ID
 * @param {Object} options
 * @param {number} [options.maxAttempts=30] - Max poll attempts (30 × 3s = 90s)
 * @param {number} [options.intervalMs=3000] - Interval between polls
 * @param {function} [options.onPoll] - Called each poll with (data, attempt)
 * @param {AbortSignal} [options.signal] - AbortController signal to cancel polling
 * @returns {Promise<Object>} - Resolves with payment-result data
 */
export function pollUntilComplete(sessionId, {
  maxAttempts = 30,
  intervalMs = 3000,
  onPoll = null,
  signal = null,
} = {}) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    let timer = null;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    // Handle abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
        cleanup();
        reject(new Error('Polling cancelled'));
      }, { once: true });
    }

    const doPoll = async () => {
      if (signal?.aborted) return;

      attempt++;
      try {
        const res = await pollPaymentResult(sessionId);

        if (signal?.aborted) return;

        if (res.success && res.data) {
          const status = res.data.status;

          // Report progress
          if (onPoll) {
            onPoll(res.data, attempt);
          }

          if (status === 'completed') {
            cleanup();
            resolve(res.data);
            return;
          }

          if (status === 'failed') {
            cleanup();
            const errMsg = res.data.transactions?.[0]?.error?.message || 'Payment failed';
            reject(new Error(errMsg));
            return;
          }

          // Still pending or awaiting_result — keep polling
          console.log(`[Prava] Poll #${attempt}: status=${status}`);
        }
      } catch (err) {
        // Transient network error — keep polling
        console.warn(`[Prava] Poll #${attempt} network error:`, err.message);
      }

      if (attempt >= maxAttempts) {
        cleanup();
        reject(new Error(`Payment timed out after ${maxAttempts * intervalMs / 1000}s of polling`));
        return;
      }

      timer = setTimeout(doPoll, intervalMs);
    };

    // Start first poll immediately
    doPoll();
  });
}

/**
 * Report Outcome Back to Prava
 * @param {string} sessionId - The Prava session ID
 * @param {string} txnRefId - The real txn_ref_id from payment-result (REQUIRED)
 * @param {string} status - 'APPROVED' or 'DECLINED'
 */
export async function reportPravaStatus(sessionId, txnRefId, status = "APPROVED") {
  if (!txnRefId) {
    console.warn("[Prava] reportPravaStatus called without txnRefId — skipping");
    return { success: false, error: "Missing txn_ref_id" };
  }

  try {
    const res = await fetch(`${PROXY_URL}/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txn_ref_id: txnRefId,
        txn_status: status,
      })
    });
    const data = await res.json();
    console.log(`[Prava] Status reported: ${status} for txn ${txnRefId}`);
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
