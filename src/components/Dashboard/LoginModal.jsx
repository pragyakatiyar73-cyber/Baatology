import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, X, CheckCircle2 } from 'lucide-react';
import { fireLoginCelebration, speakWelcomeGreeting } from '../../utils/celebration';

export default function LoginModal({
  isOpen,
  currentName,
  onLogin,
  onClose,
  canClose = false,
}) {
  const [candidateName, setCandidateName] = useState(currentName || 'Pragya');

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    const finalName = candidateName.trim() || 'Pragya';

    // Requirement 3: Seamless User Gesture Handling
    // Both speech synthesis and canvas-confetti are invoked synchronously inside
    // this click event handler, guaranteeing 100% bypass of browser autoplay policies!
    speakWelcomeGreeting(finalName);
    fireLoginCelebration();

    if (onLogin) {
      onLogin(finalName);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-white border border-[#e2e8f0] rounded-3xl p-7 shadow-2xl space-y-6 text-[#1e1b4b] overflow-hidden">
        {/* Decorative Top Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#818cf8]/25 to-[#c084fc]/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-[#14b8a6]/20 to-[#38bdf8]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close button (if allowed) */}
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-[#64748b] hover:text-[#1e1b4b] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5b51e8] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              <path d="M8 11.5h8" strokeWidth="2.5" />
              <path d="M8 15h5" strokeWidth="2.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1e1b4b] flex items-center gap-1.5">
              <span>Welcome to AuraGD</span>
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            </h2>
            <p className="text-[11px] font-semibold text-[#6366f1] tracking-wider uppercase">
              Speak • Learn • Grow
            </p>
          </div>
        </div>

        {/* Welcome Subtitle */}
        <div className="space-y-1 relative z-10">
          <h3 className="text-base font-bold text-[#1e1b4b]">
            Get Ready for Campus Placements
          </h3>
          <p className="text-xs text-[#64748b] leading-relaxed">
            Enter your candidate details below to enter your interactive 3D AI interview &amp; group discussion arena.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#5b51e8]" />
              <span>Candidate Name</span>
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter your name (e.g. Pragya)"
              className="w-full px-4 py-3 rounded-2xl bg-[#f8faff] border border-[#cbd5e1] text-sm text-[#1e1b4b] font-semibold focus:outline-none focus:border-[#5b51e8] focus:ring-2 focus:ring-[#5b51e8]/20 transition-all shadow-inner"
              autoFocus
              required
            />
          </div>

          {/* Primary Action Button: Triggers Celebration + Voice */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#5b51e8] via-[#6366f1] to-[#7c3aed] hover:from-[#4f46e5] hover:to-[#6d28d9] text-white font-bold text-sm shadow-lg shadow-indigo-300/40 hover:shadow-indigo-300/70 transition-all flex items-center justify-center gap-2.5 group cursor-pointer active:scale-[0.98]"
            >
              <span>Login &amp; Enter Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        {/* Feature Highlights Pills */}
        <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b] relative z-10">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>3D Robot Coach</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Vision Posture HUD</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Voice Feedback</span>
          </span>
        </div>
      </div>
    </div>
  );
}
