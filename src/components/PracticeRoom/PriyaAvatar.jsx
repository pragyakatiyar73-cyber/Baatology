import React, { useEffect, useState } from 'react';

/**
 * Feature 5: AI Mentor Avatar Named Priya
 * Includes:
 * - Subtle breathing float animation
 * - Periodic eye blinking (every ~3.5 seconds)
 * - Attentive listening nodding (when student is speaking)
 * - Synchronized mouth articulation while speaking
 * - High-contrast, polished aesthetic with holographic aura
 */
export default function PriyaAvatar({ state = 'idle', audioLevel = 0 }) {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  // Periodic blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3600);
    return () => clearInterval(blinkInterval);
  }, []);

  // Synchronized mouth articulation while Priya is speaking
  useEffect(() => {
    if (state !== 'speaking') {
      setMouthOpen(false);
      return;
    }
    const mouthInterval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 130);
    return () => clearInterval(mouthInterval);
  }, [state]);

  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';

  // Dynamic Aura border colors
  const auraBorder = isSpeaking
    ? 'border-cyan-400 shadow-[0_0_35px_rgba(0,229,255,0.45)]'
    : isListening
    ? 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.45)]'
    : isThinking
    ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.4)]'
    : 'border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.25)]';

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-[340px]">
      {/* ── Floating Breathing & Nodding Container ── */}
      <div
        className={`relative flex flex-col items-center transition-all duration-300 ${
          isSpeaking
            ? 'animate-pulse'
            : isListening
            ? 'animate-bounce' // subtle attentive listening nod
            : 'animate-float' // smooth breathing float
        }`}
        style={{
          animationDuration: isListening ? '2.4s' : '4s',
        }}
      >
        {/* Mentor Avatar Card with Holographic Aura */}
        <div
          className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0e172a] to-[#0a0f1d] p-3 transition-all duration-500 ${auraBorder}`}
        >
          {/* Inner ambient ring */}
          <div className="w-full h-full rounded-full border border-white/10 relative flex items-center justify-center overflow-hidden bg-gradient-to-tr from-slate-950 via-[#111c33] to-[#0d2138]">
            {/* SVG Avatar Illustration of Priya */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full object-cover"
              style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' }}
            >
              <defs>
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f7d4b2" />
                  <stop offset="100%" stopColor="#e0b18b" />
                </linearGradient>
                <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#241711" />
                  <stop offset="100%" stopColor="#140b06" />
                </linearGradient>
                <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f766e" />
                  <stop offset="100%" stopColor="#042f2e" />
                </linearGradient>
                <linearGradient id="cyanVisor" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#0dd9b8" />
                </linearGradient>
              </defs>

              {/* Background Glow */}
              <circle cx="100" cy="100" r="90" fill="url(#hairGrad)" opacity="0.15" />

              {/* Hair Back */}
              <path
                d="M50 90 Q100 20 150 90 Q165 140 155 170 Q100 160 45 170 Z"
                fill="url(#hairGrad)"
              />

              {/* Shoulders & Professional Teal Blazer */}
              <path
                d="M30 200 L45 145 Q100 135 155 145 L170 200 Z"
                fill="url(#blazerGrad)"
              />
              {/* Inner blouse */}
              <polygon points="85,150 100,180 115,150" fill="#f8fafc" />

              {/* Neck */}
              <rect x="88" y="115" width="24" height="30" rx="6" fill="url(#skinGrad)" />

              {/* Face Shape */}
              <path
                d="M68 75 Q68 128 100 134 Q132 128 132 75 Q132 40 100 40 Q68 40 68 75 Z"
                fill="url(#skinGrad)"
              />

              {/* Eyebrows */}
              <path d="M78 65 Q88 62 95 66" stroke="#241711" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M122 65 Q112 62 105 66" stroke="#241711" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Eyes with Blinking */}
              {blink ? (
                // Closed eyelid line
                <>
                  <path d="M78 77 Q88 82 95 77" stroke="#241711" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M105 77 Q112 82 122 77" stroke="#241711" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
              ) : (
                // Open eyes with sparkle
                <>
                  <ellipse cx="86" cy="76" rx="6.5" ry="5.5" fill="#1e293b" />
                  <circle cx="87.5" cy="74.5" r="2" fill="#ffffff" />
                  <ellipse cx="114" cy="76" rx="6.5" ry="5.5" fill="#1e293b" />
                  <circle cx="115.5" cy="74.5" r="2" fill="#ffffff" />
                </>
              )}

              {/* Nose */}
              <path d="M100 83 L98 94 L102 94" stroke="#d49b6a" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* Animated Mouth (synchronized speech articulation) */}
              {isSpeaking && mouthOpen ? (
                // Mouth Open speaking
                <ellipse cx="100" cy="107" rx="7" ry="5.5" fill="#881337" />
              ) : isSpeaking ? (
                // Mouth half-open speaking
                <ellipse cx="100" cy="106" rx="6" ry="2.5" fill="#9f1239" />
              ) : isListening ? (
                // Attentive gentle smile
                <path d="M92 106 Q100 112 108 106" stroke="#be123c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              ) : (
                // Calm neutral smile
                <path d="M93 105 Q100 110 107 105" stroke="#be123c" strokeWidth="2" fill="none" strokeLinecap="round" />
              )}

              {/* Hair Front Bangs / Modern Framing */}
              <path
                d="M66 65 Q80 32 100 32 Q125 32 134 68 Q118 45 100 48 Q82 45 66 65 Z"
                fill="url(#hairGrad)"
              />
              <path d="M68 65 Q62 95 64 120 Q70 85 74 72 Z" fill="url(#hairGrad)" />
              <path d="M132 65 Q138 95 136 120 Q130 85 126 72 Z" fill="url(#hairGrad)" />

              {/* Subtle Tech Headset / Communication Earpiece */}
              <path d="M130 82 Q138 82 138 90 Q138 98 130 98" stroke="#00e5ff" strokeWidth="2.5" fill="none" />
              <circle cx="138" cy="90" r="3" fill="#00e5ff" />
              <path d="M138 90 Q136 106 122 106" stroke="#00e5ff" strokeWidth="1.6" fill="none" />
            </svg>
          </div>

          {/* Active Audio Wave Ribbon on bottom of avatar frame */}
          {isSpeaking && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 px-3 py-1 rounded-full border border-cyan-400/50">
              {[0.5, 1, 0.7, 1.2, 0.6].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{ height: `${12 * h}px`, animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Priya Name Badge & Mentorship Status */}
        <div className="mt-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">Priya</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
              AI Communication Mentor
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking
                  ? 'bg-cyan-400 pulse-dot shadow-[0_0_8px_#00e5ff]'
                  : isListening
                  ? 'bg-emerald-400 pulse-dot shadow-[0_0_8px_#10b981]'
                  : isThinking
                  ? 'bg-amber-400 pulse-dot shadow-[0_0_8px_#f59e0b]'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold text-slate-300">
              {isSpeaking
                ? 'Speaking with you...'
                : isListening
                ? 'Attentively listening...'
                : isThinking
                ? 'Thinking...'
                : 'Ready for practice'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
