import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff,
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AI_MODES, getPriyaSettings, savePriyaSettings } from '../../utils/priyaAI';

export default function SettingsModal({ isOpen, onClose }) {
  const [mode, setMode] = useState(AI_MODES.MOCK);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getPriyaSettings();
      setMode(current.mode || AI_MODES.MOCK);
      setGeminiKey(current.geminiKey || '');
      setOpenaiKey(current.openaiKey || '');
      setSaveSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    savePriyaSettings({ mode, geminiKey, openaiKey });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleClearKeys = () => {
    setGeminiKey('');
    setOpenaiKey('');
    setMode(AI_MODES.MOCK);
    savePriyaSettings({ mode: AI_MODES.MOCK, geminiKey: '', openaiKey: '' });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-lg font-black tracking-tight">
                AI Mentor Settings
              </h2>
              <p className="text-xs text-slate-400">Configure AI Intelligence & Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings dialog"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Privacy Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-teal-200 text-xs leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-teal-300 font-bold block mb-0.5">Privacy First Guarantee:</strong>
            API keys are saved <strong>only in your local browser storage</strong>. They are never sent to or stored in any remote server database.
          </div>
        </div>

        {/* AI Engine Selection */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-300">
            Select Conversation Engine
          </label>

          {/* Option 1: Mock Mode (Free) */}
          <label
            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
              mode === AI_MODES.MOCK
                ? 'bg-teal-950/40 border-teal-400/80 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="aiMode"
              value={AI_MODES.MOCK}
              checked={mode === AI_MODES.MOCK}
              onChange={() => setMode(AI_MODES.MOCK)}
              className="mt-1 accent-teal-400 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Built-in Mock Mentor</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-500/40">
                  100% Free
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-900/80 text-teal-300 border border-teal-500/40">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Zero setup required. Powered by client-side STAR interview frameworks, contextual follow-ups, and instant zero-latency speech feedback.
              </p>
            </div>
          </label>

          {/* Option 2: Google Gemini */}
          <label
            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
              mode === AI_MODES.GEMINI
                ? 'bg-indigo-950/40 border-indigo-400/80 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="aiMode"
              value={AI_MODES.GEMINI}
              checked={mode === AI_MODES.GEMINI}
              onChange={() => setMode(AI_MODES.GEMINI)}
              className="mt-1 accent-indigo-400 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Google Gemini API</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-900/80 text-indigo-300 border border-indigo-500/40">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Use your personal Google AI Gemini key for deep generative reasoning and adaptive cross-examination.
              </p>
            </div>
          </label>

          {/* Option 3: OpenAI */}
          <label
            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
              mode === AI_MODES.OPENAI
                ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="aiMode"
              value={AI_MODES.OPENAI}
              checked={mode === AI_MODES.OPENAI}
              onChange={() => setMode(AI_MODES.OPENAI)}
              className="mt-1 accent-cyan-400 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">OpenAI API</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-900/80 text-cyan-300 border border-cyan-500/40">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Use your personal OpenAI API key (GPT-4o mini) for conversational interview roleplay.
              </p>
            </div>
          </label>
        </div>

        {/* Dynamic Key Input Fields */}
        {mode === AI_MODES.GEMINI && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-2">
            <label className="text-xs font-bold text-indigo-300 flex items-center justify-between">
              <span>Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:underline"
              >
                Get Free Gemini Key ↗
              </a>
            </label>
            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {mode === AI_MODES.OPENAI && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-2">
            <label className="text-xs font-bold text-cyan-300 flex items-center justify-between">
              <span>OpenAI API Key</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:underline"
              >
                Get OpenAI Key ↗
              </a>
            </label>
            <div className="relative">
              <input
                type={showOpenaiKey ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClearKeys}
            className="text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear Saved Keys
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
