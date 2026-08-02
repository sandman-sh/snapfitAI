import React, { useState } from 'react';
import { Camera, Search, ShoppingBag, Sun, Moon, User, Menu, X, Package, Sparkles, Scissors } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenProfile, theme, onToggleTheme, onOpenMixMatchStudio }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 transition-colors duration-300"
      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}>

      {/* Announcement Banner */}
      <div className="bg-[#3B1D8E] text-center py-1.5 px-4 text-[11px] font-semibold text-amber-300 tracking-wide flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Capture any outfit, isolate the garment, compare matches, and checkout securely with Prava</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-[60px] flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <button onClick={() => setActiveTab('shop')} className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <Camera className="w-5 h-5 text-violet-900" />
          </div>
          <div className="leading-none text-left">
            <span className="font-extrabold text-[20px] text-white tracking-tight">SnapFit</span>
            <span className="font-mono text-[11px] text-amber-300 font-bold ml-1">AI</span>
            <p className="text-[9px] text-violet-200 font-mono tracking-widest hide-mobile">VISUAL COMMERCE</p>
          </div>
        </button>

        {/* Search Bar - Desktop */}
        <div className="flex-1 max-w-lg relative hide-mobile">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400" />
          <input
            type="text"
            placeholder="Search outfits, jackets, sneakers..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/95 text-[#1A1035] placeholder-violet-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner font-medium"
          />
        </div>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Try-On Studio Direct Button */}
          <button
            onClick={onOpenMixMatchStudio}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-violet-950 font-extrabold text-[12px] shadow-md transition-transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-violet-950" /> Try-On
          </button>

          {/* Tab Switcher */}
          <div className="flex bg-white/10 backdrop-blur-sm p-1 rounded-xl gap-0.5">
            {[
              { key: 'shop', label: 'Shop', icon: ShoppingBag },
              { key: 'orders', label: 'Orders', icon: Package },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-violet-200 hover:text-white hover:bg-white/10'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile */}
          <button onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-violet-100 hover:bg-white/20 text-[12px] font-semibold transition-all">
            <User className="w-4 h-4 text-amber-300" />
            <span className="hide-mobile">Profile</span>
          </button>

          {/* Theme Toggle */}
          <button onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-violet-200 hover:bg-white/20 transition-all"
            title="Toggle Light/Dark Theme">
            {theme === 'light' ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-violet-900/95 backdrop-blur-lg border-t border-white/10 p-4 space-y-2 animate-fade-up">
          <button
            onClick={() => { onOpenMixMatchStudio(); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-amber-400 text-violet-950 font-extrabold text-sm"
          >
            <Sparkles className="w-5 h-5" /> Open Try-On
          </button>

          {[
            { key: 'shop', label: 'Shop', icon: ShoppingBag },
            { key: 'orders', label: 'My Orders', icon: Package },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key ? 'bg-white text-violet-700' : 'text-violet-200 hover:bg-white/10'
              }`}>
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
          <button onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-violet-200 hover:bg-white/10">
            <User className="w-5 h-5 text-amber-300" /> Profile & Delivery
          </button>
          <button onClick={onToggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-violet-200 hover:bg-white/10">
            {theme === 'light' ? <Moon className="w-5 h-5 text-amber-300" /> : <Sun className="w-5 h-5 text-amber-300" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      )}
    </header>
  );
}
