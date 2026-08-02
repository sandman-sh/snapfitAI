import React, { useState } from 'react';
import { RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { analyzeSubscriptionsWithOpenAI } from '../services/openaiService';

export default function AgentScanner({ subscriptions, onApplyRecommendation }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [isRealOpenAI, setIsRealOpenAI] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    setScanDone(false);

    const res = await analyzeSubscriptionsWithOpenAI(subscriptions);

    setIsScanning(false);
    setScanDone(true);
    setIsRealOpenAI(res.isRealOpenAI);
  };

  const actionItems = subscriptions.filter(s => s.wasteAmount > 0 || s.pravaStatus !== "ACTIVE");

  return (
    <div className="bh-card bh-card-red">
      <div className="px-6 py-4 border-b border-[var(--bh-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[var(--bh-text-strong)] font-['Space_Grotesk'] tracking-tight">OpenAI Agent Optimizer</h2>
            <span className="bh-tag bh-tag-red">GPT-4o MINIFIED</span>
          </div>
          <p className="text-[12px] text-[var(--bh-text-subtle)] font-['JetBrains_Mono']">
            Scans subscription telemetry to detect seat hoarding, price hikes, and un-mandated vendors
          </p>
        </div>
        <button onClick={handleScan} disabled={isScanning} className="bh-btn bh-btn-red text-[11px]">
          {isScanning ? (
            <><RotateCcw className="w-3 h-3 animate-spin" /> GPT Analyzing...</>
          ) : (
            'Run OpenAI Scan'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--bh-border)] bg-[var(--bh-card-bg)]">
        {actionItems.map((sub) => (
          <div key={sub.id} className="p-5 flex flex-col justify-between">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)] uppercase tracking-wider font-semibold">{sub.category}</span>
                {sub.wasteAmount > 0 ? (
                  <span className="bh-tag bh-tag-red">${sub.wasteAmount}/mo</span>
                ) : (
                  <span className="bh-tag bh-tag-yellow">No mandate</span>
                )}
              </div>
              <h4 className="text-base font-bold text-[var(--bh-text-strong)] font-['Space_Grotesk']">{sub.name}</h4>
              <p className="text-[12px] text-[var(--bh-text-muted)] leading-relaxed">{sub.recommendation}</p>
            </div>

            <button
              onClick={() => onApplyRecommendation(sub)}
              className="bh-btn bh-btn-ghost text-[11px] w-full justify-center"
            >
              Apply Fix <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {scanDone && (
        <div className="px-6 py-3 border-t border-[var(--bh-border)] font-['JetBrains_Mono'] text-[11px] text-[#1A8C7E] bg-[var(--bh-surface-raised)] font-semibold flex justify-between items-center">
          <span>Scan complete — {actionItems.length} items · ${actionItems.reduce((a, c) => a + c.wasteAmount, 0)}/mo recoverable</span>
          <span className="text-[10px] text-[var(--bh-text-subtle)] font-normal">
            {isRealOpenAI ? "Live OpenAI GPT-4o Model Output" : "OpenAI Agent Simulation Active"}
          </span>
        </div>
      )}
    </div>
  );
}
