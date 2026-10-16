import React from 'react';
import { Sparkles, Volume2, ShieldCheck, BookOpen, PenTool } from 'lucide-react';

export default function MentorVideoPanel({
  avatarState = 'listening', // 'speaking' | 'listening' | 'thinking' | 'idle'
  speakingText = '',
  mouthShape = 0,
  isBlinking = false,
  isNodding = false,
  mentorName = 'Elena Vance',
  mentorRole = 'Staff Software Engineer & Interviewer',
  avatarVideoRef,
  hasLiveWebRTC = false,
  showCodeOverlay = false,
  codeOverlayComponent = null,
}) {
  const isSpeaking = avatarState === 'speaking';
  const isListening = avatarState === 'listening';
  const isThinking = avatarState === 'thinking';

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#0a0f1d] via-[#0d1628] to-[#080d18] border border-white/10 shadow-2xl flex flex-col justify-between select-none group">
      {/* ── Background Studio / Modern Office Lighting Atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm key light from upper right */}
        <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        {/* Subtle cool teal rim light from left */}
        <div className="absolute top-1/4 -left-12 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
        {/* Soft background bookshelf & studio texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(30,41,59,0.35)_0%,rgba(10,15,29,0.95)_100%)]" />
      </div>

      {/* ── Top Floating Overlay: Mentor Name & Telemetry Badge ── */}
      <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-lg">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]'
                : isListening
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]'
                : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
            }`}
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-wide">{mentorName}</span>
            <span className="text-[10px] text-teal-300 font-semibold px-2 py-0.5 rounded-full bg-teal-950/70 border border-teal-500/30">
              AI Senior Mentor
            </span>
          </div>
        </div>

        {/* Live Audio & Expression Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isSpeaking ? 'Speaking' : isListening ? 'Attentive Listening' : 'Evaluating'}</span>
        </div>
      </div>

      {/* ── Main Mentor Video Canvas / WebRTC View ── */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {hasLiveWebRTC ? (
          <video
            ref={avatarVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* ── Photorealistic Human AI Mentor Simulation ── */
          <div
            className={`relative w-full h-full max-w-lg flex flex-col items-center justify-end transition-transform duration-700 ${
              isNodding ? 'translate-y-1' : ''
            }`}
          >
            {/* Ambient Mentor Glow */}
            <div
              className={`absolute top-16 w-64 h-64 rounded-full blur-2xl transition-all duration-500 ${
                isSpeaking
                  ? 'bg-cyan-500/15'
                  : isListening
                  ? 'bg-emerald-500/15'
                  : 'bg-indigo-500/15'
              }`}
            />

            {/* Realistic Human Avatar Vector Illustration with Micro-Expressions */}
            <div className="relative w-72 sm:w-80 h-80 sm:h-96 flex items-center justify-center">
              <svg viewBox="0 0 320 360" className="w-full h-full filter drop-shadow-2xl">
                <defs>
                  {/* Skin gradient */}
                  <linearGradient id="mentorSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8d5b8" />
                    <stop offset="50%" stopColor="#ebb794" />
                    <stop offset="100%" stopColor="#d99f79" />
                  </linearGradient>

                  {/* Hair gradient */}
                  <linearGradient id="mentorHair" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2c1d11" />
                    <stop offset="100%" stopColor="#120b06" />
                  </linearGradient>

                  {/* Blazer gradient */}
                  <linearGradient id="mentorBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* Shirt gradient */}
                  <linearGradient id="mentorShirt" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                </defs>

                {/* Torso & Professional Blazer */}
                <path
                  d="M 60,360 L 60,250 C 60,215 100,195 130,190 L 160,240 L 190,190 C 220,195 260,215 260,250 L 260,360 Z"
                  fill="url(#mentorBlazer)"
                />

                {/* Shirt Collar */}
                <path
                  d="M 130,190 L 160,255 L 190,190 C 180,185 140,185 130,190 Z"
                  fill="url(#mentorShirt)"
                />

                {/* Blazer Lapels */}
                <path
                  d="M 120,200 L 160,285 L 140,360 L 95,360 L 95,230 Z"
                  fill="#151e2e"
                />
                <path
                  d="M 200,200 L 160,285 L 180,360 L 225,360 L 225,230 Z"
                  fill="#151e2e"
                />

                {/* Neck */}
                <path
                  d="M 140,165 L 140,200 C 148,205 172,205 180,200 L 180,165 Z"
                  fill="url(#mentorSkin)"
                />

                {/* Back Hair */}
                <path
                  d="M 98,135 C 90,175 90,230 115,250 C 120,225 110,170 120,140 Z"
                  fill="url(#mentorHair)"
                />
                <path
                  d="M 222,135 C 230,175 230,230 205,250 C 200,225 210,170 200,140 Z"
                  fill="url(#mentorHair)"
                />

                {/* Head / Face Oval */}
                <ellipse cx="160" cy="130" rx="52" ry="62" fill="url(#mentorSkin)" />

                {/* Forehead Hair Fringe / Style */}
                <path
                  d="M 108,120 C 105,75 145,55 160,55 C 205,55 215,85 212,120 C 195,85 165,75 130,85 C 118,88 112,105 108,120 Z"
                  fill="url(#mentorHair)"
                />

                {/* Eyebrows */}
                <path
                  d="M 128,108 Q 140,103 150,107"
                  stroke="#2c1d11"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 170,107 Q 180,103 192,108"
                  stroke="#2c1d11"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Eyes - Dynamic Blinking & Center Gaze */}
                {isBlinking ? (
                  <>
                    <path
                      d="M 130,123 Q 140,126 148,123"
                      stroke="#2c1d11"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 172,123 Q 180,126 190,123"
                      stroke="#2c1d11"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </>
                ) : (
                  <>
                    {/* Left Eye */}
                    <ellipse cx="139" cy="122" rx="8.5" ry="5.5" fill="#ffffff" />
                    <circle cx="139.5" cy="122" r="4.2" fill="#3b2518" />
                    <circle cx="140" cy="122" r="2.2" fill="#090503" />
                    <circle cx="141" cy="120.5" r="1.3" fill="#ffffff" />

                    {/* Right Eye */}
                    <ellipse cx="181" cy="122" rx="8.5" ry="5.5" fill="#ffffff" />
                    <circle cx="181.5" cy="122" r="4.2" fill="#3b2518" />
                    <circle cx="182" cy="122" r="2.2" fill="#090503" />
                    <circle cx="183" cy="120.5" r="1.3" fill="#ffffff" />
                  </>
                )}

                {/* Elegant Glasses Frame */}
                <rect
                  x="125"
                  y="112"
                  width="28"
                  height="20"
                  rx="6"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2"
                  opacity="0.85"
                />
                <rect
                  x="167"
                  y="112"
                  width="28"
                  height="20"
                  rx="6"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2"
                  opacity="0.85"
                />
                <path d="M 153,120 L 167,120" stroke="#0f172a" strokeWidth="2" />

                {/* Nose */}
                <path
                  d="M 160,120 L 158,142 Q 160,145 164,144"
                  stroke="#c78c66"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Lips & Mouth - Speech Articulation Lip-Sync */}
                {isSpeaking ? (
                  <ellipse
                    cx="160"
                    cy="162"
                    rx={10 + mouthShape * 4}
                    ry={3 + mouthShape * 7}
                    fill="#b91c1c"
                    stroke="#991b1b"
                    strokeWidth="1.5"
                  />
                ) : (
                  /* Warm encouraging smile while listening */
                  <path
                    d="M 149,161 Q 160,168 171,161"
                    stroke="#b91c1c"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </svg>
            </div>

            {/* ── Realistic Wooden Executive Desk with Notebook & Pen ── */}
            <div className="w-full h-24 bg-gradient-to-t from-[#15110d] via-[#241a12] to-[#3a291c] border-t-2 border-[#543d2b] shadow-2xl relative flex items-center justify-between px-6 sm:px-10 z-10">
              {/* Left Desk Items: Leather Notebook & Metallic Pen */}
              <div className="flex items-center gap-3">
                <div className="w-20 h-14 rounded-lg bg-[#2b1f16] border border-[#6b4e36] shadow-xl p-1.5 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-1 border-b border-[#523b28] pb-0.5">
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span className="text-[9px] font-bold text-amber-200">Notes</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-12 h-1 bg-amber-400/40 rounded-full" />
                    <div className="w-10 h-1 bg-amber-400/30 rounded-full" />
                    <div className="w-14 h-1 bg-amber-400/30 rounded-full" />
                  </div>
                </div>

                <div className="w-1 h-14 bg-gradient-to-b from-slate-200 via-amber-300 to-slate-400 rounded-full shadow-lg transform rotate-12 flex items-center justify-center">
                  <PenTool className="w-2.5 h-2.5 text-slate-800 -rotate-45" />
                </div>
              </div>

              {/* Right Desk Item: Placement Evaluation Pad */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[10px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Rubric: STAR & Tech Accuracy</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Optional Floating Code Workspace Overlay on the Desk ── */}
        {showCodeOverlay && codeOverlayComponent && (
          <div className="absolute inset-x-4 bottom-4 top-20 z-30 animate-fade-in">
            {codeOverlayComponent}
          </div>
        )}
      </div>

      {/* ── Bottom Floating Bar: Real-Time Audio Waveform & Speech Subtitles ── */}
      <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2">
        {speakingText && isSpeaking && (
          <div className="px-4 py-2 rounded-2xl bg-black/75 border border-cyan-500/30 backdrop-blur-md shadow-xl text-xs sm:text-sm text-cyan-200 font-medium leading-relaxed max-w-xl mx-auto text-center animate-fade-in">
            "{speakingText}"
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <div className="flex items-end gap-1 h-3.5">
              {[0.5, 0.9, 1.3, 0.7, 1.1, 0.6, 1.0].map((f, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isSpeaking
                      ? 'bg-cyan-400 animate-pulse'
                      : isListening
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isSpeaking ? `${Math.max(4, Math.sin(i + Date.now() / 200) * 12 + 6)}px` : '4px',
                  }}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-slate-300">
              {isSpeaking ? 'AI Mentor Voice Stream' : 'Attentive Listening Mode'}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            {mentorRole}
          </span>
        </div>
      </div>
    </div>
  );
}
