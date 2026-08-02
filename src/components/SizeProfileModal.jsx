import React, { useState } from 'react';
import { User, Check, X, MapPin, ShieldCheck } from 'lucide-react';

export default function SizeProfileModal({ isOpen, onClose, userProfile, onSaveProfile }) {
  const [apparelSize, setApparelSize] = useState(userProfile.apparelSize || 'M');
  const [shoeSize, setShoeSize] = useState(userProfile.shoeSize || 'EU 39');
  const [address, setAddress] = useState(userProfile.address || '124 Fashion Ave, New York, NY 10001');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({ apparelSize, shoeSize, address });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="sf-card max-w-md w-full bg-white p-6 space-y-6 relative border-2 border-[#5E35B1]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-[#1E1E2F]">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b pb-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-[#5E35B1] flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#1E1E2F]">Saved Fit & Size Profile</h3>
            <p className="text-xs text-slate-500 font-mono">Prava shop_list_addresses & Preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-['Space_Grotesk']">
          {/* Preferred Apparel Size */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Preferred Apparel Size</label>
            <div className="flex gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setApparelSize(size)}
                  className={`flex-1 py-2 rounded font-mono font-bold text-xs border transition-all ${
                    apparelSize === size
                      ? 'bg-[#5E35B1] text-white border-[#5E35B1] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Shoe Size */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Preferred Shoe Size</label>
            <select
              value={shoeSize}
              onChange={(e) => setShoeSize(e.target.value)}
              className="sf-input font-mono text-xs"
            >
              <option value="EU 37">EU 37 (US 6.5)</option>
              <option value="EU 38">EU 38 (US 7.5)</option>
              <option value="EU 39">EU 39 (US 8.5)</option>
              <option value="EU 40">EU 40 (US 9.5)</option>
              <option value="EU 41">EU 41 (US 10.5)</option>
            </select>
          </div>

          {/* Default Delivery Address */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#5E35B1]" />
              Default Delivery Address (Prava Masked)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="sf-input font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Addresses stay encrypted on Prava servers and are only sent to the checkout merchant.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="sf-btn-ghost text-xs">
              Cancel
            </button>
            <button type="submit" className="sf-btn-primary text-xs">
              {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Fit Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
