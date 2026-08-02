import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Terminal, ExternalLink, Calendar, CheckCircle2, CreditCard, Tag } from 'lucide-react';

export default function OrderHistory({ orders = [], logs = [], onClearLogs }) {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-8 animate-fade-up">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--sf-border)] pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--sf-text)]">My Orders</h1>
          <p className="text-sm text-[var(--sf-text-muted)] font-mono mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed via Prava 1-Click Biometric Checkout
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-[var(--sf-surface)] rounded-3xl border border-[var(--sf-border)] shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-violet-100 dark:bg-violet-950/50 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-violet-500" />
          </div>
          <h3 className="font-extrabold text-xl text-[var(--sf-text)]">No orders placed yet</h3>
          <p className="text-sm text-[var(--sf-text-muted)] max-w-md mx-auto leading-relaxed">
            Snap a selfie or upload an outfit photo to discover exact dress matches, then complete your first 1-click checkout with Prava Passkey!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord, i) => {
            const product = ord.product || {};
            const productName = product.name || product.title || 'Discovered Dress / Outfit';
            const productImg = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';
            const brand = product.brand || 'PRĀVA EXCLUSIVE';
            const amountPaid = Number(ord.amountPaid || product.price || 4999);
            const size = ord.selectedSize || 'M';
            const virtualCardToken = ord.virtualCard?.token || '4622-9431-XXXX-2234';
            const orderId = ord.orderId || `ORD_SNAP_${Date.now()}`;
            const dateStr = ord.placedAt || new Date().toLocaleString();

            return (
              <div
                key={orderId}
                className={`bg-[var(--sf-surface)] rounded-3xl border-2 border-violet-200 dark:border-violet-800 shadow-md overflow-hidden animate-fade-up stagger-${Math.min(i + 1, 4)}`}
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 border-b border-[var(--sf-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-violet-50/80 to-indigo-50/80 dark:from-violet-950/40 dark:to-indigo-950/40">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <span className="font-extrabold text-violet-700 dark:text-violet-300 text-sm">#{orderId}</span>
                    <span className="text-[var(--sf-text-muted)] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-violet-500" /> {dateStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-emerald-500 text-white font-extrabold text-[11px] px-3 py-1 flex items-center gap-1 shadow-sm">
                      <Truck className="w-3.5 h-3.5" /> In Transit · Express Delivery
                    </span>
                    <span className="badge badge-prava text-[10px]">PRAVA CONFIRMED</span>
                  </div>
                </div>

                {/* Main Product Order Detail Card */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Product Cutout Image */}
                  <div className="md:col-span-3 aspect-[4/5] rounded-2xl bg-gray-100 dark:bg-slate-800 overflow-hidden relative shadow-md border border-[var(--sf-border)]">
                    <img src={productImg} alt={productName} className="w-full h-full object-cover" />
                    {product.isWebDiscovered && (
                      <span className="absolute bottom-2 left-2 bg-amber-400 text-violet-950 text-[9px] font-extrabold px-2 py-0.5 rounded shadow">
                        AI WEB DISCOVERED
                      </span>
                    )}
                  </div>

                  {/* Product Specification Details */}
                  <div className="md:col-span-6 space-y-3">
                    <div>
                      <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400 font-mono uppercase tracking-wider block mb-0.5">
                        {brand}
                      </span>
                      <h3 className="font-extrabold text-lg text-[var(--sf-text)] leading-snug">{productName}</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] font-mono">
                        <span className="text-[10px] text-[var(--sf-text-muted)] block">Size Selected</span>
                        <strong className="text-violet-600 dark:text-violet-300 font-bold">{size}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] font-mono">
                        <span className="text-[10px] text-[var(--sf-text-muted)] block">Category</span>
                        <strong className="text-[var(--sf-text)] font-bold">{product.category || 'Apparel'}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] font-mono">
                        <span className="text-[10px] text-[var(--sf-text-muted)] block">Payment Mode</span>
                        <strong className="text-emerald-600 font-bold">Prava Passkey</strong>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-xs text-[var(--sf-text-secondary)] line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Authorization Details */}
                  <div className="md:col-span-3 p-4 rounded-2xl bg-[var(--sf-surface-alt)] border border-[var(--sf-border)] space-y-3 text-right md:text-right flex flex-col justify-between h-full">
                    <div>
                      <span className="text-[11px] text-[var(--sf-text-muted)] font-mono uppercase block">Total Amount Paid</span>
                      <p className="text-2xl font-extrabold text-[var(--sf-text)] mt-0.5">₹{amountPaid.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="pt-2 border-t border-[var(--sf-border)] text-xs font-mono space-y-1">
                      <div className="flex justify-between items-center text-[11px] text-emerald-600 font-bold">
                        <span>Payment Status:</span>
                        <span>Authorized ✓</span>
                      </div>
                      <p className="text-[10px] text-[var(--sf-text-muted)] truncate">Session: {ord.sessionId || 'Active'}</p>
                    </div>
                  </div>

                </div>

                {/* Prava Security Token Bar */}
                <div className="px-5 py-3 border-t border-[var(--sf-border)] bg-slate-900 text-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-amber-300">
                    <CreditCard className="w-4 h-4" />
                    <span>Prava Virtual Card Token: <strong>{virtualCardToken}</strong></span>
                  </div>
                  <span className="badge bg-amber-400 text-violet-950 font-extrabold flex items-center gap-1 text-[10px] shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-950" /> PCI-DSS Encrypted Token
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Prava API Ledger */}
      {logs.length > 0 && (
        <div className="bg-[var(--sf-surface)] rounded-3xl border border-[var(--sf-border)] shadow-sm overflow-hidden mt-8">
          <div className="p-5 border-b border-[var(--sf-border)] flex justify-between items-center bg-[var(--sf-surface-alt)]">
            <h2 className="font-extrabold text-lg text-[var(--sf-text)] flex items-center gap-2">
              <Terminal className="w-5 h-5 text-violet-500" /> Prava Network Transaction Ledger
            </h2>
            <button onClick={onClearLogs} className="text-xs font-bold text-violet-600 hover:text-violet-900 transition-colors">Clear Ledger</button>
          </div>
          <div className="divide-y divide-[var(--sf-border)] max-h-72 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-3.5 text-xs font-mono hover:bg-[var(--sf-surface-alt)] transition-colors">
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
