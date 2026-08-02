import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { askKiroAI } from '../services/kiroService';

/**
 * Clean Asterisk Markdown Renderer for KIRO AI responses
 */
function renderKiroMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    let trimmed = line.trim();
    if (!trimmed) return <div key={lineIdx} className="h-1.5" />;

    const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
    if (isBullet) trimmed = trimmed.substring(2);

    const parts = [];
    let regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(trimmed)) !== null) {
      if (match.index > lastIndex) {
        parts.push(trimmed.substring(lastIndex, match.index));
      }
      const matchText = match[0];
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-extrabold text-violet-700 dark:text-amber-300">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-violet-600 dark:text-violet-300">
            {matchText.slice(1, -1)}
          </em>
        );
      } else {
        parts.push(matchText);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < trimmed.length) {
      parts.push(trimmed.substring(lastIndex));
    }

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 shadow-sm" />
          <span className="flex-1 text-[13px] leading-relaxed">{parts}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="text-[13px] leading-relaxed my-1">
        {parts}
      </p>
    );
  });
}

export default function KiroChatbot({ visionData, onExecuteAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'kiro',
      text: "Hi! I'm **KIRO**, your **Full-Control Agentic Shopping Assistant**! ⚡\n\nAsk me to **try on clothes**, **buy items with Prava**, **view mandates**, or **show order history**."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (visionData && visionData.detectedItem) {
      const styleTipMsg = {
        id: `style_tip_${Date.now()}`,
        sender: 'kiro',
        text: `✨ **Styling Cutout:**\nScanned **${visionData.detectedItem}** (${visionData.colorPattern || 'Custom Tones'})!\n\nSay *"Try on ${visionData.detectedItem}"* to fit on model.`
      };
      setMessages((prev) => [...prev, styleTipMsg]);
    }
  }, [visionData]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg = { id: `user_${Date.now()}`, sender: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const res = await askKiroAI(updatedMessages);
    setIsLoading(false);

    if (res.success) {
      setMessages(prev => [...prev, { id: `kiro_${Date.now()}`, sender: 'kiro', text: res.text }]);

      // Trigger full control action if returned by agent
      if (res.action && onExecuteAction) {
        onExecuteAction(res.action);
      }
    }
  };

  const quickPrompts = [
    { label: '👕 Try On Leather Jacket', text: 'Try on the leather jacket on full body model' },
    { label: '💳 Buy Floral Dress', text: 'Buy the floral wrap dress with Prava' },
    { label: '⚙️ Prava Mandates', text: 'Open my Prava Mandates Manager' },
    { label: '📜 Order History', text: 'Show transaction ledger and orders' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">

      {/* Floating KIRO Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 animate-fade-up border border-white/20"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-violet-950 flex items-center justify-center font-bold shadow-md group-hover:rotate-12 transition-transform">
            <Sparkles className="w-5 h-5 text-violet-900" />
          </div>
          <div className="text-left leading-tight pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight">KIRO</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono font-bold">AGENT</span>
            </div>
            <span className="text-[11px] text-amber-200 font-medium">Full Control Assistant</span>
          </div>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[560px] max-h-[85vh] bg-[var(--sf-surface)] rounded-3xl border border-[var(--sf-border)] shadow-2xl flex flex-col overflow-hidden animate-scale-in">

          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-violet-700 via-indigo-600 to-violet-800 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-violet-950 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-violet-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base tracking-tight">KIRO Full Control</h3>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono font-bold">GPT 5.6 SOL</span>
                </div>
                <p className="text-[11px] text-violet-200 font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Agent • App Controls On
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--sf-bg)]">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-amber-400 text-violet-950'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

                <div className={`max-w-[82%] p-3.5 rounded-2xl text-[13px] shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-[var(--sf-surface)] border border-[var(--sf-border)] text-[var(--sf-text)] rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? msg.text : renderKiroMarkdown(msg.text)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-violet-600 text-xs font-semibold p-2 bg-violet-50 dark:bg-violet-900/20 rounded-xl max-w-[200px] border border-violet-100">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span>KIRO Agent thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Action Chips */}
          <div className="px-3 py-2 bg-[var(--sf-surface)] border-t border-[var(--sf-border)] flex gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp.text)}
                className="px-3 py-1.5 rounded-xl bg-[var(--sf-surface-alt)] hover:bg-violet-100 hover:text-violet-700 text-[11px] font-bold text-[var(--sf-text-secondary)] whitespace-nowrap transition-colors border border-[var(--sf-border)] flex items-center gap-1"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-[var(--sf-surface)] border-t border-[var(--sf-border)] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask KIRO to try on, buy, or control app..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--sf-surface-alt)] text-[var(--sf-text)] text-xs placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-[var(--sf-border)] font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-md flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
