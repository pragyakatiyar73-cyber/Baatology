import React from 'react';
import { Maximize2, Mic, Users, Sparkles } from 'lucide-react';

export default function Roundtable2DView({
  participants = [],
  activeSpeakerId = 'student-1',
  isMicActive = true,
  liveCandidateTranscript = '',
  onToggleFullscreen,
}) {
  return (
    <div className="w-full h-full rounded-3xl bg-[#0f1422]/90 border border-white/10 p-5 flex flex-col justify-between relative shadow-2xl overflow-hidden select-none">
      {/* ── Top Header of Left Panel ── */}
      <div className="flex items-center justify-between z-10">
        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
          Roundtable Layout
        </h3>
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Fullscreen Roundtable View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Main 2D Roundtable Circular Ring Arena ── */}
      <div className="relative flex-1 w-full min-h-[380px] sm:min-h-[420px] flex items-center justify-center my-2">
        {/* Glowing Gradient Circular Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-transparent bg-origin-border flex items-center justify-center p-1 shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          {/* Circular SVG Ring with Cyan-to-Purple Neon Gradient */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="roundtableGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#roundtableGrad)"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              className="opacity-80"
            />
          </svg>

          {/* Center Table Label (Matching Screenshot) */}
          <div className="text-center z-10 pointer-events-none space-y-1">
            <span className="text-sm sm:text-base font-extrabold text-slate-200 block tracking-tight">
              Roundtable
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400 block">
              2D View
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            4 ROUNDTABLE PARTICIPANT AVATARS (Placed around the ring)
        ══════════════════════════════════════════════════════════════ */}

        {/* ── 1. TOP AVATAR: Student 1 (Host / Candidate) ── */}
        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          {/* Talking Pill Badge Above */}
          <div className="mb-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-white/15 flex items-center gap-1 shadow-md">
            <Mic className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-200">Talking</span>
          </div>

          {/* Circular Photo with Green Dot */}
          <div className="relative group">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all ${
                activeSpeakerId === 'student-1'
                  ? 'border-emerald-400 ring-4 ring-emerald-500/40 shadow-[0_0_20px_#10b981]'
                  : 'border-slate-600'
              }`}
            >
              <img
                src={participants[0]?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces'}
                alt="Student 1"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Status Green Circle on Bottom-Right */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1422] shadow-[0_0_8px_#10b981]" />
          </div>

          <span className="text-[11px] font-bold text-slate-200 mt-1">
            Student 1 (Host)
          </span>
        </div>

        {/* ── 2. LEFT AVATAR: Student 2 ── */}
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
          <div className="flex items-center gap-2">
            {/* Talking Pill to the Left */}
            <div className="px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-white/15 flex items-center gap-1 shadow-md">
              <Mic className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-200">Talking</span>
            </div>

            {/* Circular Photo */}
            <div className="relative group">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all ${
                  activeSpeakerId === 'student-2'
                    ? 'border-emerald-400 ring-4 ring-emerald-500/40 shadow-[0_0_20px_#10b981]'
                    : 'border-slate-600'
                }`}
              >
                <img
                  src={participants[1]?.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces'}
                  alt="Student 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1422] shadow-[0_0_8px_#10b981]" />
            </div>
          </div>

          <span className="text-[11px] font-bold text-slate-200 mt-1">
            Student 2
          </span>
        </div>

        {/* ── 3. BOTTOM-LEFT AVATAR: Student 3 ── */}
        <div className="absolute bottom-12 sm:bottom-14 left-6 sm:left-8 flex flex-col items-center z-20">
          <div className="flex items-center gap-2">
            {/* Pill to the Left */}
            <div className="px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-white/15 flex items-center gap-1 shadow-md">
              <Mic className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-200">Student 1</span>
            </div>

            {/* Circular Photo */}
            <div className="relative group">
              <div
                className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 transition-all ${
                  activeSpeakerId === 'student-3'
                    ? 'border-emerald-400 ring-4 ring-emerald-500/40 shadow-[0_0_20px_#10b981]'
                    : 'border-slate-600'
                }`}
              >
                <img
                  src={participants[2]?.avatar || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces'}
                  alt="Student 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1422] shadow-[0_0_8px_#10b981]" />
            </div>
          </div>

          <span className="text-[11px] font-bold text-slate-200 mt-1">
            Student 3
          </span>
        </div>

        {/* ── 4. BOTTOM AVATAR: Student 4 ── */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <span className="text-[11px] font-bold text-slate-200 mb-1">
            Student 4
          </span>

          <div className="relative group">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all ${
                activeSpeakerId === 'student-4'
                  ? 'border-emerald-400 ring-4 ring-emerald-500/40 shadow-[0_0_20px_#10b981]'
                  : 'border-slate-600'
              }`}
            >
              <img
                src={participants[3]?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces'}
                alt="Student 4"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1422] shadow-[0_0_8px_#10b981]" />
          </div>

          {/* Talking Pill Badge Below */}
          <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-white/15 flex items-center gap-1 shadow-md">
            <Mic className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-200">Talking</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Live Audio State ── */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span>Active Roundtable: 4 Students Connected</span>
        </div>
        <span className="text-cyan-400 font-mono font-bold">2D Spatial Ring</span>
      </div>
    </div>
  );
}
