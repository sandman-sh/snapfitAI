import React, { useState } from 'react';

export default function RoiCalculator({ onLaunchDashboard }) {
  const [teamSize, setTeamSize] = useState(25);
  const [monthlySpend, setMonthlySpend] = useState(3500);
  const [wastePercent, setWastePercent] = useState(20);

  const monthlyWaste = Math.round((monthlySpend * wastePercent) / 100);
  const annualSavings = Math.round(monthlyWaste * 12 * 0.85);

  return (
    <section className="border-b border-[var(--bh-border)] bg-[var(--bh-surface-raised)]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">

        <div className="flex items-center gap-0 mb-3">
          <div className="h-1 w-8 bg-[#E8B825]"></div>
          <div className="h-1 w-5 bg-[#D42C2C]"></div>
        </div>

        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[var(--bh-text-strong)] tracking-tight">Savings Calculator</h2>
            <p className="text-sm text-[var(--bh-text-subtle)] mt-1">Estimate what RenewIQ recovers from your SaaS portfolio.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-[var(--bh-border)] bg-[var(--bh-card-bg)]">

          {/* Sliders Panel */}
          <div className="lg:col-span-2 p-8 space-y-8 border-r border-[var(--bh-border)]">

            {/* Team Size */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bh-text-muted)] font-medium">Team size</span>
                <span className="font-['JetBrains_Mono'] text-[var(--bh-text-strong)] font-bold">{teamSize}</span>
              </div>
              <input
                type="range" min="5" max="200" step="5"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)]">
                <span>5</span><span>100</span><span>200</span>
              </div>
            </div>

            {/* Monthly Spend */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bh-text-muted)] font-medium">Monthly SaaS spend</span>
                <span className="font-['JetBrains_Mono'] text-[var(--bh-text-strong)] font-bold">${monthlySpend.toLocaleString()}</span>
              </div>
              <input
                type="range" min="500" max="25000" step="500"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)]">
                <span>$500</span><span>$12,500</span><span>$25,000</span>
              </div>
            </div>

            {/* Waste % */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bh-text-muted)] font-medium">Estimated license waste</span>
                <span className="font-['JetBrains_Mono'] text-[var(--bh-text-strong)] font-bold">{wastePercent}%</span>
              </div>
              <input
                type="range" min="5" max="40" step="1"
                value={wastePercent}
                onChange={(e) => setWastePercent(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)]">
                <span>5%</span><span>20%</span><span>40%</span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="p-8 flex flex-col justify-between bg-[var(--bh-surface-raised)]">
            <div className="space-y-6">
              <div>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)] uppercase tracking-widest font-semibold mb-1">Annual Recovery</p>
                <p className="text-4xl font-bold text-[var(--bh-text-strong)] font-['Space_Grotesk'] tracking-tight">
                  ${annualSavings.toLocaleString()}
                </p>
              </div>

              <hr className="bh-divider" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--bh-text-subtle)]">Monthly waste</span>
                  <span className="font-['JetBrains_Mono'] text-[#D42C2C] font-semibold">${monthlyWaste.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--bh-text-subtle)]">Annual waste</span>
                  <span className="font-['JetBrains_Mono'] text-[var(--bh-text-main)]">${(monthlyWaste * 12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--bh-text-subtle)]">Recovery rate</span>
                  <span className="font-['JetBrains_Mono'] text-[#1A8C7E] font-semibold">85%</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLaunchDashboard}
              className="bh-btn bh-btn-red w-full justify-center mt-8"
            >
              Start Recovering
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
