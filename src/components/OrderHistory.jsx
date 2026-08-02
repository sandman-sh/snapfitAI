import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Terminal, ExternalLink } from 'lucide-react';

export default function OrderHistory({ orders = [], logs = [], onClearLogs }) {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-8 animate-fade-up">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--sf-text)]">My Orders</h1>
          <p className="text-sm text-[var(--sf-text-muted)] font-mono mt-1">{orders.length} orders placed via Prava</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-violet-100 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-violet-400" />
          </div>
          <h3 className="font-extrabold text-xl text-[var(--sf-text)]">No orders yet</h3>
          <p className="text-sm text-[var(--sf-text-muted)] max-w-sm mx-auto">Snap a photo or browse the catalog to place your first 1-click order with Prava!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord, i) => (
            <div key={ord.orderId} className={`bg-[var(--sf-surface)] rounded-2xl border border-[var(--sf-border)] shadow-sm overflow-hidden animate-fade-up stagger-${Math.min(i+1,4)}`}>
              <div className="p-4 sm:p-5 border-b border-[var(--sf-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[var(--sf-surface-alt)]">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-violet-600">#{ord.orderId}</span>
                  <span className="text-[var(--sf-text-muted)]">• {ord.placedAt}</span>
                </div>
                <span className="badge badge-discount flex items-center gap-1">
                  <Truck className="w-3 h-3" /> In Transit
                </span>
              </div>

              <div className="p-4 sm:p-5 flex gap-4 items-center">
                <img src={ord.product.imageUrl} alt={ord.product.name} className="w-16 h-20 rounded-xl object-cover shadow-sm flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-bold text-violet-600 font-mono">{ord.product.brand}</p>
                  <h4 className="font-bold text-[var(--sf-text)] truncate">{ord.product.name}</h4>
                  <p className="text-xs text-[var(--sf-text-muted)] font-mono">Size: {ord.selectedSize}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-extrabold text-[var(--sf-text)]">₹{ord.amountPaid.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold text-emerald-600 font-mono">PRAVA PAID ✓</p>
                </div>
              </div>

              <div className="px-4 sm:px-5 py-3 border-t border-[var(--sf-border)] bg-violet-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono">
                <div className="text-violet-700 space-y-0.5">
                  <p>Virtual Card: <strong>{ord.virtualCard.token}</strong></p>
                  <p className="text-[var(--sf-text-muted)]">X-Response-ID: {ord.pravaResponseId}</p>
                </div>
                <span className="badge badge-prava flex items-center gap-1 text-[10px]">
                  <ShieldCheck className="w-3 h-3" /> Single-Use Token
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prava API Ledger */}
      {logs.length > 0 && (
        <div className="bg-[var(--sf-surface)] rounded-2xl border border-[var(--sf-border)] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[var(--sf-border)] flex justify-between items-center">
            <h2 className="font-extrabold text-lg text-[var(--sf-text)] flex items-center gap-2">
              <Terminal className="w-5 h-5 text-violet-500" /> Prava Network Ledger
            </h2>
            <button onClick={onClearLogs} className="text-xs font-bold text-[var(--sf-text-muted)] hover:text-[var(--sf-text)] transition-colors">Clear</button>
          </div>
          <div className="divide-y divide-[var(--sf-border)] max-h-72 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="px-4 sm:px-5 py-3 text-xs font-mono hover:bg-[var(--sf-surface-alt)] transition-colors">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-violet-600">{log.title}</span>
                  <span className="badge badge-discount text-[10px]">{log.status}</span>
                </div>
                <p className="text-[var(--sf-text-secondary)]">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
