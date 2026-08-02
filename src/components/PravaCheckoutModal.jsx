import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShieldCheck, Fingerprint, CheckCircle2, X, Lock, CreditCard, FileText, Printer, RefreshCw, Truck, MapPin, ArrowRight, AlertTriangle } from 'lucide-react';
import { PravaSDK } from '@prava-sdk/core';
import { executeSnapFitPravaCheckout, awaitAndFinalizeCheckout } from '../services/pravaShopping';
import { getPravaConfig } from '../services/pravaApi';

export default function PravaCheckoutModal({ isOpen, onClose, product, selectedSize, deliveryAddress, onOrderSuccess, onAddLog }) {
  // States: 'confirm' | 'creating' | 'card-form' | 'processing' | 'done' | 'error'
  const [step, _setStep] = useState('confirm');
  const setStep = (val) => { const v = typeof val === 'function' ? val(stepRef.current) : val; stepRef.current = v; _setStep(v); };
  const [checkoutCtx, setCheckoutCtx] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [cardFormReady, setCardFormReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pollStatus, setPollStatus] = useState(null); // current poll status text
  const cardFormRef = useRef(null);
  const pravaRef = useRef(null);
  const hasStartedRef = useRef(false);
  const stepRef = useRef('confirm');
  const pollingAbortRef = useRef(null); // AbortController for polling

  // Cleanup SDK and polling on unmount
  useEffect(() => {
    return () => {
      if (pravaRef.current) {
        pravaRef.current.destroy();
        pravaRef.current = null;
      }
      if (pollingAbortRef.current) {
        pollingAbortRef.current.abort();
        pollingAbortRef.current = null;
      }
      hasStartedRef.current = false;
    };
  }, []);

  if (!isOpen || !product) return null;

  const productName = product.name || product.title || 'Exclusive Outfit Item';
  const productImg = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';
  const productPrice = Number(product.price) || 4999;
  const originalPrice = product.originalPrice || Math.round(productPrice * 1.3);

  // ─── Step 1: Create Prava session, then mount card form + start polling ───
  const handleApprove = async () => {
    setStep('creating');
    setErrorMessage(null);
    setCardFormReady(false);
    setPollStatus(null);

    try {
      const ctx = await executeSnapFitPravaCheckout({ product, selectedSize, deliveryAddress, logCallback: onAddLog });
      setCheckoutCtx(ctx);
      setStep('card-form');

      // Mount card form after a brief delay for DOM to render
      setTimeout(() => {
        mountPravaCardForm(ctx);
      }, 300);

      // Start polling in parallel — this runs alongside the iframe
      startPolling(ctx);
    } catch (err) {
      console.error("Session creation error:", err);
      setErrorMessage(`Failed to create payment session: ${err.message}`);
      setStep('error');
    }
  };

  // ─── Mount Prava SDK card form into container ───
  const mountPravaCardForm = async (ctx) => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    try {
      const { publishableKey } = getPravaConfig();
      const sdk = new PravaSDK({ publishableKey });
      pravaRef.current = sdk;

      await sdk.collectPAN({
        sessionToken: ctx.sessionToken,
        iframeUrl: ctx.iframeUrl,
        container: cardFormRef.current || '#prava-card-form',
        onReady: () => {
          setCardFormReady(true);
        },
        onChange: () => {},
        onSuccess: () => {
          // Payment completion is handled by polling — NOT by this callback.
          // The polling loop in startPolling() will detect 'completed' status.
          console.log("[Prava] SDK onSuccess fired — polling will finalize");
        },
        onError: (error) => {
          console.warn("[Prava] SDK card form error:", error?.message || error);
          // Don't auto-complete on error. Show the form as ready so user can see
          // what happened. The iframe may still be functional.
          setCardFormReady(true);
        },
      });

      // Fallback: if onReady doesn't fire within 5s, show the form anyway
      // (MutationObserver-based detection)
      const container = cardFormRef.current;
      if (container) {
        const observer = new MutationObserver(() => {
          if (container.querySelector('iframe')) {
            setCardFormReady(true);
            observer.disconnect();
          }
        });
        observer.observe(container, { childList: true, subtree: true });
        setTimeout(() => {
          observer.disconnect();
          setCardFormReady(true);
        }, 5000);
      }

    } catch (err) {
      console.warn("[Prava] SDK mount error:", err);
      // SDK failed to mount — the iframe URL might work as a direct link
      setCardFormReady(true);
      setErrorMessage(`Card form failed to load: ${err.message}. You can complete payment in a new tab.`);
    }
  };

  // ─── Start polling for real payment completion ───
  const startPolling = async (ctx) => {
    // Create abort controller so we can cancel polling on unmount/close
    const abortController = new AbortController();
    pollingAbortRef.current = abortController;

    setPollStatus('Waiting for card entry...');

    try {
      const orderRes = await awaitAndFinalizeCheckout(ctx, {
        logCallback: onAddLog,
        onPollUpdate: (data, attempt) => {
          const status = data.status;
          if (status === 'pending') {
            setPollStatus(`Waiting for card enrollment... (${attempt})`);
          } else if (status === 'awaiting_result') {
            setPollStatus(`Card enrolled — awaiting passkey verification... (${attempt})`);
          }
        },
        signal: abortController.signal,
      });

      // Payment completed successfully with REAL data
      setOrderResult(orderRes);
      setStep('done');

    } catch (err) {
      if (err.message === 'Polling cancelled') {
        // User closed the modal or navigated away — not an error
        return;
      }
      console.error("[Prava] Payment error:", err);
      setErrorMessage(err.message);
      setStep('error');
    }
  };

  // ─── Open iframe URL in new tab (fallback if embedded iframe has issues) ───
  const handleOpenInNewTab = () => {
    if (checkoutCtx?.iframeUrl) {
      window.open(checkoutCtx.iframeUrl, '_blank');
    }
  };

  // ─── Retry from scratch ───
  const handleRetry = () => {
    // Cancel existing polling
    if (pollingAbortRef.current) {
      pollingAbortRef.current.abort();
      pollingAbortRef.current = null;
    }
    // Destroy SDK
    if (pravaRef.current) {
      pravaRef.current.destroy();
      pravaRef.current = null;
    }
    hasStartedRef.current = false;

    setStep('confirm');
    setCheckoutCtx(null);
    setOrderResult(null);
    setErrorMessage(null);
    setCardFormReady(false);
    setPollStatus(null);
  };

  const handleFinish = () => {
    if (orderResult) onOrderSuccess(orderResult);
    // Cancel polling
    if (pollingAbortRef.current) {
      pollingAbortRef.current.abort();
      pollingAbortRef.current = null;
    }
    // Cleanup
    setStep('confirm');
    setCheckoutCtx(null);
    setOrderResult(null);
    setShowReceipt(false);
    setCardFormReady(false);
    setErrorMessage(null);
    setPollStatus(null);
    hasStartedRef.current = false;
    if (pravaRef.current) {
      pravaRef.current.destroy();
      pravaRef.current = null;
    }
    onClose();
  };

  const handleClose = () => {
    // Cancel polling on close
    if (pollingAbortRef.current) {
      pollingAbortRef.current.abort();
      pollingAbortRef.current = null;
    }
    if (pravaRef.current) {
      pravaRef.current.destroy();
      pravaRef.current = null;
    }
    hasStartedRef.current = false;
    setStep('confirm');
    setCheckoutCtx(null);
    setOrderResult(null);
    setShowReceipt(false);
    setCardFormReady(false);
    setErrorMessage(null);
    setPollStatus(null);
    onClose();
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      {/* Spacious Extra Large Modal Window */}
      <div className="modal-content w-full max-w-4xl lg:max-w-5xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl rounded-3xl border border-violet-200 dark:border-violet-800">

        {/* Top Header */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-violet-600 to-indigo-600 flex-shrink-0" />

        <div className="p-5 border-b border-[var(--sf-border)] flex items-center justify-between flex-shrink-0 bg-[var(--sf-surface-alt)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-violet-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[var(--sf-text)]">Prava Biometric Passkey Checkout</h3>
              <p className="text-xs text-[var(--sf-text-muted)] font-mono">PCI-DSS Level 1 · Real Sandbox Transaction</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[var(--sf-text-muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Body Layout */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Left Column: Product & Delivery Details */}
            <div className="md:col-span-4 space-y-4 border-b md:border-b-0 md:border-r border-[var(--sf-border)] md:pr-6">
              
              {/* Product Preview Card */}
              <div className="p-4 rounded-2xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] space-y-3">
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 relative shadow-md">
                  <img src={productImg} alt={productName} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 badge badge-prava text-[10px]">
                    {product.brand || 'PRĀVA EXCLUSIVE'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-base text-[var(--sf-text)] line-clamp-2">{productName}</h4>
                  <div className="flex items-center justify-between text-xs text-[var(--sf-text-muted)] font-mono">
                    <span>Selected Size: <strong className="text-violet-600 font-bold">{selectedSize}</strong></span>
                    <span>Gender: <strong>{product.gender || 'Unisex'}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--sf-border)] flex items-baseline justify-between">
                  <span className="text-xs text-[var(--sf-text-muted)]">Total Amount</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[var(--sf-text)]">₹{productPrice.toLocaleString('en-IN')}</span>
                    {originalPrice > productPrice && (
                      <span className="block text-xs text-[var(--sf-text-muted)] line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 rounded-2xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] space-y-1.5">
                <p className="font-extrabold text-violet-600 dark:text-violet-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-500" /> Delivery Address
                </p>
                <p className="font-medium text-[var(--sf-text)] text-xs leading-relaxed">{deliveryAddress}</p>
                <p className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1 pt-1">
                  <Truck className="w-3.5 h-3.5" /> Express 2-Day Delivery Guaranteed
                </p>
              </div>

            </div>

            {/* Right Column: Payment Vault & Transaction Form */}
            <div className="md:col-span-8 space-y-4 flex flex-col justify-between">

              {/* ────── Step: Confirm ────── */}
              {step === 'confirm' && (
                <div className="space-y-5 my-auto">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-900 to-indigo-900 text-white space-y-3 shadow-xl">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
                      <ShieldCheck className="w-4 h-4" /> PCI DSS LEVEL 1 SECURE VAULT
                    </div>
                    <h4 className="font-extrabold text-lg">Real Prava Sandbox Checkout</h4>
                    <p className="text-violet-200 text-xs leading-relaxed">
                      Your card details are entered securely in Prava's PCI-compliant iframe. After card enrollment, verify with biometric passkey to generate a one-time network token for this purchase.
                    </p>
                  </div>

                  <button
                    onClick={handleApprove}
                    className="w-full btn-gold py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl hover:scale-[1.02]"
                  >
                    <Fingerprint className="w-6 h-6 text-violet-900" /> Pay with Prava · ₹{productPrice.toLocaleString('en-IN')}
                  </button>
                </div>
              )}

              {/* ────── Step: Creating Session ────── */}
              {step === 'creating' && (
                <div className="p-8 rounded-2xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] text-center space-y-4 my-auto">
                  <RefreshCw className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
                  <p className="font-extrabold text-base text-[var(--sf-text)]">Creating Prava Payment Session...</p>
                  <p className="text-xs text-[var(--sf-text-muted)] font-mono">Connecting to sandbox.api.prava.space</p>
                </div>
              )}

              {/* ────── Step: Card Form (iframe + polling) ────── */}
              {step === 'card-form' && checkoutCtx && (
                <div className="space-y-3 w-full">
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-700 flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] text-amber-400 font-bold tracking-wider">🔒 PRAVA CARD ENROLLMENT VAULT</span>
                      <span className="text-[10px] text-slate-400 truncate">Session: {checkoutCtx.sessionId}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cardFormReady ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {cardFormReady ? 'ENCRYPTED · READY' : 'LOADING...'}
                    </span>
                  </div>

                  {/* Prava SDK Card Form Container */}
                  <div
                    ref={cardFormRef}
                    id="prava-card-form"
                    className="w-full rounded-2xl overflow-hidden border-2 border-violet-400/50 bg-white shadow-inner flex flex-col justify-center items-center relative"
                    style={{ minHeight: '480px', width: '100%' }}
                  >
                    {!cardFormReady && (
                      <div className="flex flex-col items-center justify-center h-[480px] text-[var(--sf-text-muted)] text-xs gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
                        <span>Loading Prava PCI-compliant card form...</span>
                      </div>
                    )}
                  </div>

                  {/* Polling Status Indicator */}
                  {pollStatus && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-xs font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span className="text-indigo-700 dark:text-indigo-300">{pollStatus}</span>
                    </div>
                  )}

                  {/* Error message during card form */}
                  {errorMessage && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-amber-800 dark:text-amber-200">{errorMessage}</span>
                        <button
                          onClick={handleOpenInNewTab}
                          className="block mt-1 text-violet-600 hover:text-violet-800 underline font-bold"
                        >
                          Open card form in new tab →
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-center text-[11px] text-[var(--sf-text-muted)] font-mono bg-[var(--sf-surface-alt)] p-2 rounded-xl border">
                    💡 Sandbox: Enter test card → OTP <strong className="text-violet-600">456789</strong> → Register passkey → Payment auto-completes
                  </p>
                </div>
              )}

              {/* ────── Step: Processing (polling detected completion) ────── */}
              {step === 'processing' && (
                <div className="p-8 rounded-2xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] text-center space-y-4 my-auto">
                  <CreditCard className="w-10 h-10 text-emerald-500 animate-pulse mx-auto" />
                  <p className="font-extrabold text-base text-[var(--sf-text)]">Payment Verified — Generating Credentials...</p>
                  <p className="text-xs text-[var(--sf-text-muted)] font-mono">Prava is issuing your one-time network token</p>
                </div>
              )}

              {/* ────── Step: Error ────── */}
              {step === 'error' && (
                <div className="space-y-4 my-auto">
                  <div className="p-6 rounded-2xl bg-[var(--sf-surface-alt)] border-2 border-red-500/40 text-center space-y-4">
                    <AlertTriangle className="w-14 h-14 text-red-500 mx-auto" />
                    <h4 className="font-extrabold text-xl text-[var(--sf-text)]">Payment Failed</h4>
                    <p className="text-sm text-[var(--sf-text-muted)]">{errorMessage || 'An unexpected error occurred'}</p>
                    <div className="flex gap-3 justify-center pt-2">
                      <button
                        onClick={handleRetry}
                        className="btn-primary py-3 px-6 text-xs font-bold flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" /> Try Again
                      </button>
                      <button
                        onClick={handleClose}
                        className="py-3 px-6 text-xs font-bold rounded-xl border border-[var(--sf-border)] text-[var(--sf-text-muted)] hover:bg-[var(--sf-surface-alt)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ────── Step: Done & Authorized (REAL data) ────── */}
              {step === 'done' && orderResult && (
                <div className="space-y-4 my-auto">
                  <div className="p-6 rounded-2xl bg-[var(--sf-surface-alt)] border-2 border-emerald-500/40 text-center space-y-4 animate-scale-in">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                    <h4 className="font-extrabold text-xl text-[var(--sf-text)]">Prava Payment Authorized!</h4>
                    
                    {/* Real Virtual Card Token Display */}
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs text-left space-y-2 shadow-inner border border-slate-700">
                      <div className="flex justify-between text-[10px] text-amber-400 font-bold border-b border-slate-700 pb-1">
                        <span>PRAVA NETWORK TOKEN (REAL)</span>
                        <span className="text-emerald-400">VERIFIED ✓</span>
                      </div>
                      <p className="text-base font-bold tracking-widest pt-1 text-white">
                        {orderResult.virtualCard?.token
                          ? `${orderResult.virtualCard.token.slice(0, 4)} •••• •••• ${orderResult.virtualCard.token.slice(-4)}`
                          : 'Token not available'}
                      </p>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                        <span>EXP: {orderResult.virtualCard?.expiry || 'N/A'}</span>
                        <span>CVV: {orderResult.virtualCard?.cvv || '***'}</span>
                      </div>
                      {orderResult.txnRefId && (
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                          TXN REF: {orderResult.txnRefId}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowReceipt(true)}
                        className="flex-1 btn-primary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> View Full Receipt
                      </button>
                      <button
                        onClick={handleFinish}
                        className="btn-gold py-3 px-6 text-xs font-extrabold shadow-lg"
                      >
                        Done & Close
                      </button>
                    </div>
                  </div>

                  {/* Receipt Overlay */}
                  {showReceipt && (
                    <div className="p-5 bg-white text-slate-900 rounded-2xl border-2 border-dashed border-violet-300 font-mono text-xs space-y-3 shadow-xl">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-extrabold text-violet-900 text-base">PRĀVA PAYMENT RECEIPT</span>
                        <button onClick={printReceipt} className="text-violet-600 hover:text-violet-900 flex items-center gap-1 font-bold">
                          <Printer className="w-4 h-4" /> Print
                        </button>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <p><strong>Order ID:</strong> {orderResult.orderId}</p>
                        <p><strong>Session ID:</strong> {orderResult.sessionId}</p>
                        <p><strong>Item Purchased:</strong> {productName}</p>
                        <p><strong>Amount Paid:</strong> ₹{productPrice.toLocaleString('en-IN')}</p>
                        <p><strong>Network Token:</strong> {orderResult.virtualCard?.token || 'N/A'}</p>
                        <p><strong>Dynamic CVV:</strong> {orderResult.virtualCard?.cvv || 'N/A'}</p>
                        <p><strong>Token Expiry:</strong> {orderResult.virtualCard?.expiry || 'N/A'}</p>
                        {orderResult.txnRefId && (
                          <p><strong>Txn Ref ID:</strong> {orderResult.txnRefId}</p>
                        )}
                        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-[var(--sf-text-muted)] pt-2 border-t border-[var(--sf-border)] mt-auto">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Card details tokenized securely via Prava's PCI DSS Level 1 Vault</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
