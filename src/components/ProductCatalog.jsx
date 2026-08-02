import React, { useState } from 'react';
import { Star, Filter, Zap, Crown, Flame, Sliders, Palette, Sparkles } from 'lucide-react';

export default function ProductCatalog({ products, visionData, onSelectProduct, selectedUserSize = "M", onOpenMixMatchStudio }) {
  const [filterType, setFilterType] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxBudget, setMaxBudget] = useState(50000);
  const [selectedColor, setSelectedColor] = useState('all');

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const genders = ['all', 'Women', 'Men', 'Kids'];

  const colorSwatches = [
    { key: 'all', label: 'All Colors', bg: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' },
    { key: 'black', label: 'Noir/Black', bg: 'bg-black' },
    { key: 'white', label: 'Cream/White', bg: 'bg-gray-100 border border-gray-300' },
    { key: 'navy', label: 'Navy/Indigo', bg: 'bg-indigo-900' },
    { key: 'emerald', label: 'Emerald', bg: 'bg-emerald-700' },
    { key: 'crimson', label: 'Crimson', bg: 'bg-red-700' },
  ];

  const filtered = products.filter(p => {
    if (filterType === 'exact' && p.type !== 'exact_match') return false;
    if (filterType === 'budget' && p.type !== 'budget_lookalike') return false;
    if (selectedGender !== 'all' && p.gender !== selectedGender) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (p.price > maxBudget) return false;
    if (selectedColor !== 'all') {
      const matchText = (p.name + ' ' + (p.colorPattern || '')).toLowerCase();
      if (!matchText.includes(selectedColor)) return false;
    }
    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-10 space-y-6">

      {/* Vision Result Banner */}
      {visionData && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg animate-fade-up border border-violet-400/30">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold uppercase mb-1">
              <Zap className="w-4 h-4" /> AI Cutout Vision Match
            </div>
            <h3 className="font-extrabold text-lg">{visionData.detectedItem}</h3>
            <p className="text-violet-200 text-xs mt-0.5">{visionData.colorPattern} · {visionData.fabricTexture}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMixMatchStudio}
              className="btn-gold py-2 px-4 text-xs flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-violet-950" /> Mix & Match Studio
            </button>
            <span className="px-4 py-2 rounded-xl bg-amber-400 text-violet-900 font-bold text-xs shadow-md whitespace-nowrap">
              {filtered.length} Matches Found
            </span>
          </div>
        </div>
      )}

      {/* Advanced Filters Bar */}
      <div className="p-4 rounded-2xl bg-[var(--sf-surface)] border border-[var(--sf-border)] shadow-sm space-y-4">
        
        {/* Gender Tabs & Category */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
            {/* Gender Filters */}
            <div className="flex bg-amber-400/20 p-1 rounded-full border border-amber-400/30 gap-1 mr-2">
              {genders.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${selectedGender === g ? 'bg-amber-400 text-violet-950 shadow' : 'text-[var(--sf-text)] hover:text-violet-600'}`}
                >
                  {g === 'all' ? 'All Fashion' : g}
                </button>
              ))}
            </div>

            <Filter className="w-4 h-4 text-[var(--sf-text-muted)]" />
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full capitalize transition-all duration-200 text-xs ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-[var(--sf-surface-alt)] text-[var(--sf-text-secondary)] hover:bg-violet-100 hover:text-violet-700'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex bg-[var(--sf-surface-alt)] p-1 rounded-xl gap-0.5 text-[12px] font-bold">
            {[
              { key: 'all', label: `All (${products.length})` },
              { key: 'exact', label: 'Exact Match', icon: Crown },
              { key: 'budget', label: 'Budget Lookalike', icon: Flame },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterType(f.key)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg transition-all duration-200 ${
                  filterType === f.key
                    ? f.key === 'budget' ? 'bg-amber-400 text-violet-900 shadow-sm' : 'bg-violet-600 text-white shadow-sm'
                    : 'text-[var(--sf-text-secondary)] hover:bg-[var(--sf-surface)]'
                }`}>
                {f.icon && <f.icon className="w-3.5 h-3.5" />}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-[var(--sf-border)]" />

        {/* Budget Target Slider & Color Swatches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
          
          {/* Budget Slider */}
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <span className="text-[var(--sf-text)] whitespace-nowrap">Max Price:</span>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer"
            />
            <span className="font-mono text-violet-600 text-sm font-extrabold whitespace-nowrap min-w-[70px]">
              ₹{maxBudget.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Color Swatch Picker */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-[var(--sf-text)] whitespace-nowrap">Color Tone:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {colorSwatches.map((swatch) => (
                <button
                  key={swatch.key}
                  onClick={() => setSelectedColor(swatch.key)}
                  title={swatch.label}
                  className={`w-6 h-6 rounded-full ${swatch.bg} flex-shrink-0 transition-transform ${selectedColor === swatch.key ? 'scale-125 ring-2 ring-violet-600 ring-offset-1' : 'hover:scale-110 opacity-80'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {filtered.map((prod, i) => {
          const discount = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
          return (
            <div key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className={`product-card flex flex-col animate-fade-up stagger-${Math.min(i + 1, 8)}`}>
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img src={prod.imageUrl || prod.image} alt={prod.name || prod.title} className="product-img w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  {prod.isWebDiscovered ? (
                    <span className="badge bg-gradient-to-r from-amber-400 to-amber-500 text-violet-950 font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3 text-violet-950" /> AI Web Match
                    </span>
                  ) : prod.type === 'exact_match' ? (
                    <span className="badge badge-exact text-[10px] flex items-center gap-1"><Crown className="w-3 h-3 text-violet-600" /> Exact</span>
                  ) : (
                    <span className="badge badge-lookalike text-[10px] flex items-center gap-1"><Flame className="w-3 h-3 text-amber-600" /> Lookalike</span>
                  )}
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="badge badge-discount text-[10px]">{discount}% OFF</span>
                </div>
              </div>

              <div className="p-3 lg:p-4 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold text-violet-600 font-mono">{prod.brand || 'PRĀVA LUXE'}</p>
                  <h4 className="font-bold text-sm text-[var(--sf-text)] line-clamp-1 mt-0.5">{prod.name || prod.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-bold font-mono">
                      {prod.rating || 4.8} <Star className="w-2.5 h-2.5 fill-white" />
                    </span>
                    <span className="text-[11px] text-[var(--sf-text-muted)] font-mono">({prod.reviewsCount || 128})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(prod.sizes || ['S', 'M', 'L', 'XL']).slice(0, 4).map(s => (
                      <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border transition-colors ${
                        s === selectedUserSize
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-[var(--sf-surface-alt)] text-[var(--sf-text-secondary)] border-[var(--sf-border)]'
                      }`}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-lg lg:text-xl font-extrabold text-[var(--sf-text)]">₹{prod.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-[var(--sf-text-muted)] line-through">₹{(prod.originalPrice || prod.price * 1.3).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

