import React, { useState } from 'react';
import { ArrowLeft, Star, ShieldCheck, Truck, Heart, Share2, Package, Check, Crown, Flame, CheckCircle2 } from 'lucide-react';

export default function ProductDetail({ product, onBack, onBuyWithPrava, selectedUserSize, userAddress }) {
  const [selectedSize, setSelectedSize] = useState(selectedUserSize || product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 animate-fade-up">

      {/* Breadcrumb */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800 mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Left: Image Gallery */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4] shadow-lg border border-[var(--sf-border)]">
              {!imgLoaded && <div className="absolute inset-0 skeleton" />}
              <img src={product.imageUrl} alt={product.name}
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.type === 'exact_match'
                  ? <span className="badge badge-exact flex items-center gap-1"><Crown className="w-3.5 h-3.5" /> Exact Match</span>
                  : <span className="badge badge-lookalike flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Budget Lookalike</span>}
                <span className="badge badge-discount">{discount}% OFF</span>
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={() => setLiked(!liked)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 ${
                    liked ? 'bg-rose-500 text-white scale-110' : 'bg-white/90 text-gray-500 hover:text-rose-500'
                  }`}>
                  <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
                </button>
                <button className="w-10 h-10 rounded-xl bg-white/90 text-gray-500 hover:text-violet-600 flex items-center justify-center shadow-md transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand & Title */}
          <div>
            <p className="text-sm font-bold text-violet-600 font-mono">{product.brand}</p>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--sf-text)] mt-1 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-sm font-bold font-mono">
                {product.rating} <Star className="w-3.5 h-3.5 fill-white" />
              </span>
              <span className="text-sm text-[var(--sf-text-muted)] font-mono">{product.reviewsCount.toLocaleString()} Ratings & Reviews</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[var(--sf-text)]">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="text-lg text-[var(--sf-text-muted)] line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              <span className="text-sm font-bold text-emerald-600">{discount}% off</span>
            </div>
            <p className="text-xs text-[var(--sf-text-muted)]">inclusive of all GST and taxes</p>
          </div>

          {/* Size Selector */}
          <div>
            <h3 className="font-bold text-sm text-[var(--sf-text)] mb-3">Select Size</h3>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`min-w-[48px] h-12 px-4 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
                    selectedSize === s
                      ? 'bg-violet-600 text-white border-violet-600 shadow-md scale-105'
                      : 'bg-[var(--sf-surface)] text-[var(--sf-text)] border-[var(--sf-border)] hover:border-violet-400'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <h3 className="font-bold text-sm text-[var(--sf-text)] mb-3">Color: <span className="font-normal text-[var(--sf-text-secondary)]">{selectedColor}</span></h3>
            <div className="flex gap-2">
              {product.colors.map(c => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    selectedColor === c
                      ? 'border-violet-600 bg-violet-50 text-violet-700'
                      : 'border-[var(--sf-border)] text-[var(--sf-text-secondary)] hover:border-violet-300'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={() => onBuyWithPrava(product, selectedSize)}
              className="btn-gold flex-1 py-4 text-[15px] shadow-lg hover:shadow-xl font-extrabold">
              <ShieldCheck className="w-5 h-5 text-violet-900" />
              Buy with Prava Passkey — ₹{product.price.toLocaleString('en-IN')}
            </button>
          </div>

          {/* Delivery Info */}
          <div className="p-4 rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-surface)] space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-violet-600" /> Delivery Details
            </h3>
            <div className="text-sm text-[var(--sf-text-secondary)]">
              <p>Deliver to: <strong className="text-[var(--sf-text)]">{userAddress || 'Connaught Place, New Delhi, 110001'}</strong></p>
              <p className="text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Usually delivered in 2-4 business days
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-sm">Product Details</h3>
            <p className="text-sm text-[var(--sf-text-secondary)] leading-relaxed">{product.description}</p>
            <div className="text-sm space-y-1.5 text-[var(--sf-text-secondary)]">
              <div className="flex gap-2"><span className="font-bold text-[var(--sf-text)] w-28">Category:</span>{product.category}</div>
              <div className="flex gap-2"><span className="font-bold text-[var(--sf-text)] w-28">Merchant:</span><span className="font-mono text-violet-600">{product.merchantDomain}</span></div>
            </div>
          </div>

          {/* Prava Trust Strip */}
          <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-violet-50 border border-violet-100 text-xs font-semibold text-violet-700">
            {[
              { icon: ShieldCheck, text: 'Prava PCI Shield' },
              { icon: Package, text: 'Single-Use Virtual Card' },
              { icon: Check, text: 'Biometric Passkey Auth' },
            ].map(b => (
              <span key={b.text} className="flex items-center gap-1.5">
                <b.icon className="w-4 h-4 text-violet-500" /> {b.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
