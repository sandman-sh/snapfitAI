import React from 'react';

export default function SubscriptionTable({ subscriptions, onChargeMandate, onSetupMandate, onOptimizeSub }) {
  return (
    <div className="bh-card bh-card-blue">
      <div className="px-6 py-4 border-b border-[var(--bh-border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--bh-text-strong)] font-['Space_Grotesk'] tracking-tight">Subscription Portfolio</h2>
          <p className="text-[12px] text-[var(--bh-text-subtle)] font-['JetBrains_Mono']">{subscriptions.length} services tracked</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-[var(--bh-surface-raised)] text-[var(--bh-text-subtle)] font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider border-b border-[var(--bh-border)]">
              <th className="py-2.5 px-6 font-semibold">Vendor</th>
              <th className="py-2.5 px-4 font-semibold">Cost</th>
              <th className="py-2.5 px-4 font-semibold">Usage</th>
              <th className="py-2.5 px-4 font-semibold">Protection</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--bh-border)]">
            {subscriptions.map((sub) => {
              const isProtected = sub.pravaStatus === "ACTIVE";
              const hasWaste = sub.wasteAmount > 0;
              const healthColor = sub.usageScore > 75 ? '#1A8C7E' : sub.usageScore > 50 ? '#B38600' : '#D42C2C';

              return (
                <tr key={sub.id} className="hover:bg-[var(--bh-surface-raised)] transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 flex items-center justify-center bg-[var(--bh-surface-raised)] border border-[var(--bh-border)] text-[var(--bh-text-strong)] font-['Space_Grotesk'] font-bold text-[11px]">
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[var(--bh-text-main)] font-semibold text-sm">{sub.name}</div>
                        <div className="text-[10px] text-[var(--bh-text-subtle)] font-['JetBrains_Mono']">
                          {sub.category} · {sub.seats}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-['JetBrains_Mono']">
                    <div className="text-[var(--bh-text-strong)] text-sm font-semibold">${sub.monthlyCost.toFixed(2)}</div>
                    <div className="text-[10px] text-[var(--bh-text-subtle)]">{sub.renewalDate}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bh-progress-track">
                        <div className="bh-progress-fill" style={{ width: `${sub.usageScore}%`, background: healthColor }}></div>
                      </div>
                      <span className="font-['JetBrains_Mono'] text-[11px] font-semibold" style={{ color: healthColor }}>
                        {sub.usageScore}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {isProtected ? (
                      <div>
                        <span className="bh-tag bh-tag-teal">Mandate</span>
                        <div className="text-[10px] text-[var(--bh-text-subtle)] font-['JetBrains_Mono'] mt-0.5 font-medium">
                          {sub.mandateId}
                        </div>
                      </div>
                    ) : (
                      <span className="bh-tag bh-tag-yellow">Unprotected</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-[12px] max-w-[200px]">
                    {hasWaste ? (
                      <div className="text-[#D42C2C]">
                        <span className="font-['JetBrains_Mono'] font-bold">${sub.wasteAmount}/mo waste</span>
                      </div>
                    ) : (
                      <span className="text-[var(--bh-text-subtle)] font-medium">Optimal</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isProtected ? (
                        <button
                          onClick={() => onChargeMandate(sub)}
                          className="bh-btn bh-btn-teal text-[11px] py-1.5 px-3"
                        >
                          Renew
                        </button>
                      ) : (
                        <button
                          onClick={() => onSetupMandate(sub)}
                          className="bh-btn bh-btn-blue text-[11px] py-1.5 px-3"
                        >
                          Protect
                        </button>
                      )}
                      {hasWaste && (
                        <button
                          onClick={() => onOptimizeSub(sub)}
                          className="bh-btn bh-btn-red text-[11px] py-1.5 px-3"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
