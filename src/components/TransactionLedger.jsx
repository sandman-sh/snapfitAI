import React from 'react';

export default function TransactionLedger({ logs, onClearLogs }) {
  return (
    <div className="bh-card bh-card-yellow">
      <div className="px-6 py-4 border-b border-[var(--bh-border)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--bh-text-strong)] font-['Space_Grotesk'] tracking-tight">Transaction Ledger</h2>
          <p className="text-[12px] text-[var(--bh-text-subtle)] font-['JetBrains_Mono']">{logs.length} events</p>
        </div>
        {logs.length > 0 && (
          <button onClick={onClearLogs} className="text-[11px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] hover:text-[var(--bh-text-strong)] transition-colors">
            Clear
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-[12px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)]">
          No transactions recorded. Trigger a renewal or mandate action above.
        </div>
      ) : (
        <div className="divide-y divide-[var(--bh-border)] max-h-80 overflow-y-auto bg-[var(--bh-card-bg)]">
          {logs.map((log) => (
            <div key={log.id} className="px-6 py-3 font-['JetBrains_Mono'] text-[12px] hover:bg-[var(--bh-surface-raised)] transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--bh-text-subtle)]">{log.time}</span>
                  <span className="text-[var(--bh-text-strong)] font-semibold">{log.title}</span>
                </div>
                <span className={`bh-tag ${
                  log.status === "APPROVED" || log.status === "SUCCESS" ? "bh-tag-teal" :
                  log.status === "PENDING_PASSKEY" ? "bh-tag-yellow" :
                  "bh-tag-blue"
                }`}>
                  {log.status}
                </span>
              </div>
              <p className="text-[var(--bh-text-muted)]">{log.details}</p>
              {log.responseId && (
                <p className="text-[var(--bh-text-subtle)] mt-0.5 font-mono text-[10px]">resp: {log.responseId}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
