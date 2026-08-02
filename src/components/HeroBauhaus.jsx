import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroBauhaus({ onLaunchDashboard }) {
  return (
    <section className="relative bh-grid border-b border-[var(--bh-border)]">
      <div className="max-w-[1280px] mx-auto px-6">

        {/* Top geometric accent bar */}
        <div className="flex items-center gap-0 pt-10 pb-8">
          <div className="h-1 w-16 bg-[#D42C2C]"></div>
          <div className="h-1 w-10 bg-[#1B4FB6]"></div>
          <div className="h-1 w-6 bg-[#E8B825]"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-20">

          {/* Left: Copy */}
          <div className="space-y-8 max-w-xl">
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#D42C2C] uppercase tracking-[0.15em] font-semibold">
              Autonomous subscription intelligence & optimization
            </p>

            <h1 className="text-[clamp(36px,5vw,56px)] font-bold text-[var(--bh-text-strong)] leading-[1.05] tracking-tight">
              Your AI agent<br />
              <span className="text-[#D42C2C]">optimizes</span> and<br />
              <span className="text-[#1B4FB6]">pays</span> for SaaS.
            </h1>

            <p className="text-[16px] text-[var(--bh-text-muted)] leading-relaxed max-w-md">
              RenewIQ scans your subscriptions, downgrades idle seats, 
              and executes renewals using Prava's capped payment mandates. 
              Your card never leaves the vault.
            </p>

            {/* Structured feature list */}
            <div className="space-y-3">
              {[
                ['Prava Mandates', 'Recurring spend caps, no passkey per charge'],
                ['Scoped Cards', 'One-time credentials locked to merchant & amount'],
                ['Guardrails', 'Owner-set rules enforced by Prava on every payment'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#1A8C7E] mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="text-[var(--bh-text-strong)] text-sm font-medium">{title}</span>
                    <span className="text-[var(--bh-text-subtle)] text-sm ml-1.5">— {desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button onClick={onLaunchDashboard} className="bh-btn bh-btn-red">
                Open Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a href="#architecture" className="bh-btn bh-btn-ghost">
                How it works
              </a>
            </div>
          </div>

          {/* Right: Live agent terminal card */}
          <div className="flex items-start justify-end">
            <div className="w-full max-w-md bh-card border-t-3 border-t-[#1B4FB6] border-t-[3px]">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--bh-border)] bg-[var(--bh-surface-raised)]">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)] uppercase tracking-widest font-semibold">RenewIQ Console</span>
                <span className="bh-tag bh-tag-teal">Live</span>
              </div>

              {/* Log entries */}
              <div className="font-['JetBrains_Mono'] text-[12px] divide-y divide-[var(--bh-border)] bg-[var(--bh-card-bg)]">
                <div className="px-5 py-3.5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[#1B4FB6] font-semibold">MANDATE CHARGE</span>
                    <span className="text-[var(--bh-text-subtle)]">01:22:14</span>
                  </div>
                  <p className="text-[var(--bh-text-main)] font-medium">OpenAI API → $450.00</p>
                  <p className="text-[var(--bh-text-subtle)]">mdt_oai_99182 • no passkey required</p>
                </div>

                <div className="px-5 py-3.5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[#D42C2C] font-semibold">WASTE DETECTED</span>
                    <span className="text-[var(--bh-text-subtle)]">01:22:09</span>
                  </div>
                  <p className="text-[var(--bh-text-main)] font-medium">Figma Org — 8 idle seats</p>
                  <p className="text-[var(--bh-text-subtle)]">potential savings $120/mo</p>
                </div>

                <div className="px-5 py-3.5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[#1A8C7E] font-semibold">SETTLED</span>
                    <span className="text-[var(--bh-text-subtle)]">01:21:55</span>
                  </div>
                  <p className="text-[var(--bh-text-main)] font-medium">GitHub Enterprise → $420.00</p>
                  <p className="text-[var(--bh-text-subtle)]">txn_881920 • APPROVED</p>
                </div>

                <div className="px-5 py-3.5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[#B38600] font-semibold">GUARDRAIL</span>
                    <span className="text-[var(--bh-text-subtle)]">01:21:40</span>
                  </div>
                  <p className="text-[var(--bh-text-main)] font-medium">AWS spend cap enforced</p>
                  <p className="text-[var(--bh-text-subtle)]">$1,250 / $1,300 mandate limit</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
