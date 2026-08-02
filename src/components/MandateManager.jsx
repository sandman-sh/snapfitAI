import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { createPravaMandate } from '../services/pravaApi';

export default function MandateManager({ subscriptions, onMandateCreated, onAddLog }) {
  const [showForm, setShowForm] = useState(false);
  const [merchantName, setMerchantName] = useState('');
  const [merchantUrl, setMerchantUrl] = useState('');
  const [maxAmount, setMaxAmount] = useState('250.00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeMandates = subscriptions.filter(s => s.pravaStatus === "ACTIVE");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!merchantName || !maxAmount) return;

    setIsSubmitting(true);
    onAddLog({
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      type: 'MANDATE_INIT',
      message: `Creating mandate for ${merchantName} ($${maxAmount}/mo cap)`,
      status: 'pending'
    });

    const res = await createPravaMandate({
      merchantName,
      merchantUrl: merchantUrl || `https://${merchantName.toLowerCase().replace(/\s+/g, '')}.com`,
      maxAmount: Number(maxAmount)
    });

    setIsSubmitting(false);
    if (res.success) {
      onMandateCreated({
        name: merchantName,
        maxAmount: Number(maxAmount),
        mandateId: res.data.mandate?.mandateId || `mdt_${Math.random().toString(36).substr(2, 8)}`,
        responseId: res.responseId
      });
      setShowForm(false);
      setMerchantName('');
      setMerchantUrl('');
      setMaxAmount('250.00');
    }
  };

  return (
    <div className="bh-card bh-card-teal">
      <div className="px-6 py-4 border-b border-[var(--bh-border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--bh-text-strong)] font-['Space_Grotesk'] tracking-tight">Prava Mandates</h2>
          <p className="text-[12px] text-[var(--bh-text-subtle)] font-['JetBrains_Mono']">
            {activeMandates.length} active spend caps
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bh-btn bh-btn-teal text-[11px]">
          <Plus className="w-3 h-3" /> New Mandate
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 border-b border-[var(--bh-border)] bg-[var(--bh-surface-raised)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] uppercase tracking-wider mb-1.5 font-semibold">Vendor Name</label>
              <input
                type="text" required placeholder="e.g. Notion"
                value={merchantName} onChange={(e) => setMerchantName(e.target.value)}
                className="bh-input"
              />
            </div>
            <div>
              <label className="block text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] uppercase tracking-wider mb-1.5 font-semibold">Domain</label>
              <input
                type="text" placeholder="e.g. notion.so"
                value={merchantUrl} onChange={(e) => setMerchantUrl(e.target.value)}
                className="bh-input"
              />
            </div>
            <div>
              <label className="block text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] uppercase tracking-wider mb-1.5 font-semibold">Monthly Cap ($)</label>
              <input
                type="number" step="10" required placeholder="250"
                value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)}
                className="bh-input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="bh-btn bh-btn-ghost text-[11px]">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bh-btn bh-btn-teal text-[11px]">
              {isSubmitting ? 'Submitting...' : 'Create Mandate'}
            </button>
          </div>
        </form>
      )}

      {/* Active mandates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--bh-border)] bg-[var(--bh-card-bg)]">
        {activeMandates.map((sub) => (
          <div key={sub.id} className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#1A8C7E] font-bold">{sub.mandateId}</span>
              <span className="bh-tag bh-tag-teal">Active</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--bh-text-strong)] font-['Space_Grotesk']">{sub.name}</h4>
            <div className="text-[11px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] space-y-0.5 font-medium">
              <div>cap: <span className="text-[var(--bh-text-main)] font-semibold">${sub.mandateCap}/mo</span></div>
              <div>scope: <span className="text-[var(--bh-text-main)]">{sub.vendorDomain}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
