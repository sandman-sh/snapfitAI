import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VisualSearchHero from './components/VisualSearchHero';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import PravaCheckoutModal from './components/PravaCheckoutModal';
import OrderHistory from './components/OrderHistory';
import ProfileModal, { loadProfile } from './components/ProfileModal';
import KiroChatbot from './components/KiroChatbot';
import MixMatchStudio from './components/MixMatchStudio';
import { ECOMMERCE_PRODUCTS } from './data/ecommerceProducts';
import { Scissors, Layers, Sparkles, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('snapfit_theme') || 'light');
  const [activeTab, setActiveTab] = useState('shop');
  const [visionData, setVisionData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutSize, setCheckoutSize] = useState('M');
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState(ECOMMERCE_PRODUCTS);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mixMatchOpen, setMixMatchOpen] = useState(false);

  const handleAddNewProductToCatalog = (newProd) => {
    setCatalogProducts(prev => [newProd, ...prev.filter(p => p.id !== newProd.id)]);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('snapfit_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const profile = loadProfile();
  const defaultAddress = profile.addresses?.find(a => a.isDefault)?.line || '124 Fashion Ave, New York, NY 10001';

  const addLog = (log) => setLogs(prev => [log, ...prev]);

  const handleVisionResult = (data) => {
    setVisionData(data);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyWithPrava = (prod, size) => {
    setCheckoutProduct(prod);
    setCheckoutSize(size);
  };

  const handleOrderSuccess = (result) => {
    setOrders(prev => [result, ...prev]);
    setCheckoutProduct(null);
    setSelectedProduct(null);
  };

  // KIRO Agent Full Control Action Handler
  const handleAgentAction = (action) => {
    if (!action) return;

    switch (action.type) {
      case 'OPEN_TRY_ON': {
        setMixMatchOpen(true);
        if (action.garmentId) {
          const found = ECOMMERCE_PRODUCTS.find(p => p.id === action.garmentId);
          if (found) setSelectedProduct(found);
        }
        break;
      }
      case 'OPEN_CHECKOUT': {
        const found = ECOMMERCE_PRODUCTS.find(p => p.id === action.garmentId) || ECOMMERCE_PRODUCTS[0];
        setCheckoutProduct(found);
        setCheckoutSize('M');
        break;
      }
      case 'OPEN_MANDATES': {
        setProfileOpen(true);
        break;
      }
      case 'OPEN_TRANSACTIONS': {
        setActiveTab('orders');
        break;
      }
      case 'FILTER_CATEGORY': {
        setActiveTab('shop');
        setSelectedProduct(null);
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--sf-bg)] transition-colors duration-300 relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => { setActiveTab(t); setSelectedProduct(null); }}
        onOpenProfile={() => setProfileOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenMixMatchStudio={() => setMixMatchOpen(true)}
      />

      {activeTab === 'shop' && !selectedProduct && (
        <>
          <VisualSearchHero
            onVisionScanResult={handleVisionResult}
            onBuyWithPrava={(prod, size) => handleBuyWithPrava(prod, size || 'M')}
            onOpenMixMatchStudio={() => setMixMatchOpen(true)}
            onAddNewProductToCatalog={handleAddNewProductToCatalog}
          />

          {/* Feature Highlights */}
          <section className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Scissors, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-300', title: 'Outfit Isolation', desc: 'Remove the person and keep a clean garment image for matching' },
                { icon: Layers, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300', title: 'Visual Matching', desc: 'Extract category, color, fabric, price, and similar products' },
                { icon: Sparkles, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300', title: 'Try-On Studio', desc: 'Preview selected pieces on a model before checkout' },
                { icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300', title: 'Prava Checkout', desc: 'Pay securely with Prava-backed virtual card protection' },
              ].map((f, i) => (
                <div key={f.title} className={`p-5 rounded-2xl bg-[var(--sf-surface)] border border-[var(--sf-border)] shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-300 animate-fade-up stagger-${i+1}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${f.color}`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[var(--sf-text)]">{f.title}</h3>
                  <p className="text-xs text-[var(--sf-text-muted)] mt-1 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <ProductCatalog
            products={catalogProducts}
            visionData={visionData}
            onSelectProduct={handleSelectProduct}
            selectedUserSize={profile.apparelSize || 'M'}
            onOpenMixMatchStudio={() => setMixMatchOpen(true)}
          />

          {/* Footer */}
          <footer className="border-t border-[var(--sf-border)] bg-[var(--sf-surface)] mt-12">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-extrabold text-[var(--sf-text)] flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-600 text-amber-300 flex items-center justify-center">
                    <Scissors className="w-4 h-4" />
                  </div>
                  SnapFit AI × Prava
                </h4>
                <p className="text-[var(--sf-text-muted)] text-xs leading-relaxed">AI outfit isolation, visual product matching, try-on previews, and secure Prava-powered checkout.</p>
              </div>
              <div>
                <h5 className="font-bold text-[var(--sf-text)] mb-2">How It Works</h5>
                <ul className="text-xs text-[var(--sf-text-muted)] space-y-2">
                  <li className="flex items-center gap-2"><Scissors className="w-3.5 h-3.5 text-violet-500" /> Upload or capture an outfit photo</li>
                  <li className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-amber-500" /> Isolate the clothing from the person</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Review matches, prices, and try-on previews</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Checkout securely with Prava</li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-[var(--sf-text)] mb-2">Powered By</h5>
                <ul className="text-xs text-[var(--sf-text-muted)] space-y-2">
                  <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-violet-500" /> Prava Agentic Payments API</li>
                  <li className="flex items-center gap-2"><Scissors className="w-3.5 h-3.5 text-amber-500" /> OpenAI Vision + GPT Image workflow</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> PCI DSS Level 1 Compliance</li>
                  <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-indigo-500" /> Biometric Passkey Authentication</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-[var(--sf-border)] text-center py-4 text-[10px] text-[var(--sf-text-muted)] font-mono">
              © 2026 SnapFit AI × Prava — protected checkout for AI-assisted fashion discovery
            </div>
          </footer>
        </>
      )}

      {activeTab === 'shop' && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onBuyWithPrava={handleBuyWithPrava}
          selectedUserSize={profile.apparelSize || 'M'}
          userAddress={defaultAddress}
        />
      )}

      {activeTab === 'orders' && (
        <OrderHistory orders={orders} logs={logs} onClearLogs={() => setLogs([])} />
      )}

      <MixMatchStudio
        isOpen={mixMatchOpen}
        onClose={() => setMixMatchOpen(false)}
        initialCutout={visionData?.cutoutImage}
        products={ECOMMERCE_PRODUCTS}
        onCheckoutFullOutfit={(bundleProduct) => {
          setCheckoutProduct(bundleProduct);
          setCheckoutSize('Bundle');
        }}
      />

      <PravaCheckoutModal
        isOpen={!!checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
        product={checkoutProduct}
        selectedSize={checkoutSize}
        deliveryAddress={defaultAddress}
        onOrderSuccess={handleOrderSuccess}
        onAddLog={addLog}
      />

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* KIRO AI Chatbot with Agent Full Control */}
      <KiroChatbot visionData={visionData} onExecuteAction={handleAgentAction} />
    </div>
  );
}
