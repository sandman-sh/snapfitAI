import React, { useState, useEffect } from 'react';
import { User, X, MapPin, Check, Plus, Trash2 } from 'lucide-react';

const PROFILE_KEY = 'snapfit_user_profile';

const defaultProfile = {
  name: '',
  apparelSize: 'M',
  shoeSize: 'EU 39',
  addresses: [{ id: 1, label: 'Home', line: '124 Fashion Street, Connaught Place, New Delhi, 110001', isDefault: true }],
};

export function loadProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  } catch { return defaultProfile; }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export default function ProfileModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState(loadProfile());
  const [saved, setSaved] = useState(false);
  const [newAddr, setNewAddr] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isOpen) setProfile(loadProfile());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 600);
  };

  const addAddress = () => {
    if (!newAddr.trim()) return;
    const addr = { id: Date.now(), label: newLabel || 'Address', line: newAddr, isDefault: false };
    setProfile(p => ({ ...p, addresses: [...p.addresses, addr] }));
    setNewAddr('');
    setNewLabel('');
    setShowAddForm(false);
  };

  const removeAddress = (id) => {
    setProfile(p => ({ ...p, addresses: p.addresses.filter(a => a.id !== id) }));
  };

  const setDefault = (id) => {
    setProfile(p => ({
      ...p,
      addresses: p.addresses.map(a => ({ ...a, isDefault: a.id === id }))
    }));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content max-w-lg">

        <div className="flex items-center justify-between p-5 border-b border-[var(--sf-border)] bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[var(--sf-text)]">My Profile</h3>
              <p className="text-xs text-[var(--sf-text-muted)] font-mono">Sizes, fit preferences & delivery addresses</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-violet-100 flex items-center justify-center text-[var(--sf-text-muted)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[var(--sf-text-secondary)] uppercase tracking-wider mb-1.5">Full Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="input-field" />
          </div>

          {/* Apparel Size */}
          <div>
            <label className="block text-xs font-bold text-[var(--sf-text-secondary)] uppercase tracking-wider mb-2">Preferred Apparel Size</label>
            <div className="flex gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                <button key={s} onClick={() => setProfile(p => ({ ...p, apparelSize: s }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                    profile.apparelSize === s
                      ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                      : 'bg-[var(--sf-surface-alt)] text-[var(--sf-text-secondary)] border-[var(--sf-border)] hover:border-violet-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Shoe Size */}
          <div>
            <label className="block text-xs font-bold text-[var(--sf-text-secondary)] uppercase tracking-wider mb-1.5">Shoe Size</label>
            <select value={profile.shoeSize} onChange={e => setProfile(p => ({ ...p, shoeSize: e.target.value }))} className="input-field font-mono text-sm">
              {['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Saved Addresses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[var(--sf-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-violet-500" /> Delivery Addresses
              </label>
              <button onClick={() => setShowAddForm(true)} className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            <div className="space-y-2">
              {profile.addresses.map(addr => (
                <div key={addr.id}
                  className={`p-3.5 rounded-xl border-2 flex items-start justify-between gap-3 transition-all duration-200 ${
                    addr.isDefault ? 'border-violet-500 bg-violet-50' : 'border-[var(--sf-border)] bg-[var(--sf-surface)]'
                  }`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--sf-text)]">{addr.label}</span>
                      {addr.isDefault && <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">Default</span>}
                    </div>
                    <p className="text-sm text-[var(--sf-text-secondary)] mt-0.5 truncate">{addr.line}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!addr.isDefault && (
                      <button onClick={() => setDefault(addr.id)} className="text-[11px] font-bold text-violet-600 hover:underline">Set Default</button>
                    )}
                    <button onClick={() => removeAddress(addr.id)} className="w-7 h-7 rounded-lg hover:bg-rose-50 text-[var(--sf-text-muted)] hover:text-rose-500 flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddForm && (
              <div className="mt-3 p-4 rounded-xl border border-violet-200 bg-violet-50 space-y-2.5 animate-scale-in">
                <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label (e.g. Office)" className="input-field text-sm" />
                <input type="text" value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="Full address..." className="input-field text-sm" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddForm(false)} className="btn-ghost text-xs py-2 px-3">Cancel</button>
                  <button onClick={addAddress} className="btn-primary text-xs py-2 px-4">Add Address</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-[var(--sf-border)] flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-6">
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Profile'}
          </button>
        </div>

      </div>
    </div>
  );
}
