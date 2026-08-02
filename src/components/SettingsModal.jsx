import React, { useState } from 'react';
import { X, Check, Key, Sparkles } from 'lucide-react';
import { getPravaConfig, savePravaConfig } from '../services/pravaApi';
import { getOpenAIKey, saveOpenAIKey } from '../services/openaiService';

export default function SettingsModal({ isOpen, onClose }) {
  const currentConfig = getPravaConfig();
  const [secretKey, setSecretKey] = useState(currentConfig.secretKey);
  const [environment, setEnvironment] = useState(currentConfig.environment);
  const [openAiKey, setOpenAiKey] = useState(getOpenAIKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    savePravaConfig(secretKey, environment);
    saveOpenAIKey(openAiKey);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[var(--bh-card-bg)] border border-[var(--bh-border-strong)] shadow-2xl">
        <div className="h-1 bg-[#E8B825]"></div>

        <div className="px-6 py-4 border-b border-[var(--bh-border)] flex items-center justify-between bg-[var(--bh-surface-raised)]">
          <span className="font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)] uppercase tracking-widest font-semibold">API Settings (Prava + OpenAI)</span>
          <button onClick={onClose} className="text-[var(--bh-text-subtle)] hover:text-[var(--bh-text-strong)]"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Prava Environment */}
          <div>
            <label className="block text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] uppercase tracking-wider mb-2 font-semibold">Prava Environment</label>
            <div className="grid grid-cols-2 gap-0 border border-[var(--bh-border)]">
              <button
                type="button"
                onClick={() => setEnvironment('sandbox')}
                className={`py-2 text-[12px] font-['JetBrains_Mono'] font-semibold transition-colors ${
                  environment === 'sandbox'
                    ? 'bg-[#1A8C7E] text-white'
                    : 'bg-transparent text-[var(--bh-text-subtle)] hover:text-[var(--bh-text-strong)]'
                }`}
              >
                Sandbox
              </button>
              <button
                type="button"
                onClick={() => setEnvironment('production')}
                className={`py-2 text-[12px] font-['JetBrains_Mono'] font-semibold border-l border-[var(--bh-border)] transition-colors ${
                  environment === 'production'
                    ? 'bg-[#D42C2C] text-white'
                    : 'bg-transparent text-[var(--bh-text-subtle)] hover:text-[var(--bh-text-strong)]'
                }`}
              >
                Production
              </button>
            </div>
          </div>

          {/* Prava Secret Key */}
          <div>
            <label className="block text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] uppercase tracking-wider mb-2 font-semibold">Prava Secret Key</label>
            <input
              type="password" required
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
              className="bh-input"
            />
            <p className="text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] mt-1.5 font-medium">
              From <a href="https://dashboard.prava.space" target="_blank" rel="noreferrer" className="text-[#1B4FB6] hover:underline">dashboard.prava.space</a>
            </p>
          </div>

          {/* OpenAI API Key */}
          <div>
            <label className="block text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] uppercase tracking-wider mb-2 font-semibold flex items-center justify-between">
              <span>OpenAI API Key</span>
              <span className="text-[#D42C2C] text-[9px]">GPT 5.6 SOL Powered</span>
            </label>
            <input
              type="password"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="bh-input"
            />
            <p className="text-[10px] font-['JetBrains_Mono'] text-[var(--bh-text-subtle)] mt-1.5 font-medium">
              Used to run live GPT 5.6 SOL AI optimization scans.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="bh-btn bh-btn-ghost text-[11px]">Cancel</button>
            <button type="submit" className="bh-btn bh-btn-teal text-[11px]">
              {saved ? <><Check className="w-3 h-3" /> Saved</> : 'Save Keys'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
