import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function PravaModal({ isOpen, onClose, data, onApprove }) {
  const [step, setStep] = useState('confirm');

  if (!isOpen || !data) return null;

  const handleApprove = () => {
    setStep('verifying');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => {
        onApprove(data);
        setStep('confirm');
      }, 600);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-[var(--bh-card-bg)] border border-[var(--bh-border-strong)] shadow-2xl">

        {/* Header bar with colored stripe */}
        <div className="h-1 bg-[#1B4FB6]"></div>

        <div className="px-6 py-4 border-b border-[var(--bh-border)] flex items-center justify-between bg-[var(--bh-surface-raised)]">
          <span className="font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)] uppercase tracking-widest font-semibold">Prava Authorization</span>
          <button onClick={onClose} className="text-[var(--bh-text-subtle)] hover:text-[var(--bh-text-strong)]"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Transaction summary */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--bh-text-subtle)] font-medium">Merchant</span>
              <span className="text-[var(--bh-text-strong)] font-bold">{data.name || "Vendor"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--bh-text-subtle)] font-medium">Spend cap</span>
              <span className="font-['JetBrains_Mono'] text-[#B38600] font-bold">
                ${data.monthlyCost || data.maxAmount || "100.00"}/mo
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--bh-text-subtle)] font-medium">Type</span>
              <span className="font-['JetBrains_Mono'] text-[#1B4FB6] font-semibold">Standing Mandate</span>
            </div>
          </div>

          <hr className="bh-divider" />

          {/* Action */}
          {step === 'done' ? (
            <div className="py-3 text-center font-['JetBrains_Mono'] text-[13px] text-[#1A8C7E] font-bold">
              ✓ Passkey verified — Mandate issued
            </div>
          ) : (
            <button
              onClick={handleApprove}
              disabled={step === 'verifying'}
              className="bh-btn bh-btn-blue w-full justify-center py-3"
            >
              {step === 'verifying' ? 'Verifying passkey...' : 'Approve with Passkey'}
            </button>
          )}

          <p className="text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] text-center">
            Card numbers never leave Prava's encrypted vault.
          </p>
        </div>
      </div>
    </div>
  );
}
