import React from 'react';
import { Maximize2, Mic, MicOff, Users, Sparkles, UserPlus, Volume2 } from 'lucide-react';

export default function Roundtable2DView({
  participants = [],
  activeSpeakerId = 'student-1',
  isMicActive = true,
  audioLevel = 0,
  liveCandidateTranscript = '',
  onToggleFullscreen,
  onOpenAddStudent,
  onSelectSpeaker,
}) {
  const count = Math.max(1, participants.length);
  // Radius percentage for 2D circular arrangement around center (50, 50)
  const radius = count <= 4 ? 37 : count <= 6 ? 39 : 41;

  return (
    <div className="w-full h-full rounded-3xl bg-[#0f1422]/90 border border-white/10 p-4 sm:p-5 flex flex-col justify-between relative shadow-2xl overflow-hidden select-none">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between z-10 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              Roundtable 2D View
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {count} Active Students in Session
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Add Student Button */}
          <button
            onClick={onOpenAddStudent}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Add new student to roundtable"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Student</span>
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fullscreen Roundtable View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main 2D Roundtable Arena with Trigonometric Placement ── */}
      <div className="relative flex-1 w-full min-h-[360px] sm:min-h-[400px] flex items-center justify-center my-2">
        {/* Glowing Gradient Circular Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-transparent bg-origin-border flex items-center justify-center p-1 shadow-[0_0_60px_rgba(59,130,246,0.15)]">
          {/* Circular SVG Ring with Cyan-to-Purple Neon Gradient */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="roundtableNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
              stroke="url(#roundtableNeonGrad)"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              className="opacity-80"
            />
          </svg>

          {/* Central Circular Table HUD */}
          <div className="text-center z-10 pointer-events-none space-y-1">
            <span className="text-sm sm:text-base font-extrabold text-slate-200 block tracking-tight">
              Roundtable
            </span>
            <span className="text-xs sm:text-sm font-semibold text-cyan-400 block">
              2D View
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              {count} Students Connected
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            DYNAMIC CIRCULAR SLOTS FOR EVERY PARTICIPANT
        ══════════════════════════════════════════════════════════════ */}
        {participants.map((p, index) => {
          // Angle in radians: Start at top (-PI/2) and distribute evenly
          const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
          const leftPercent = 50 + radius * Math.cos(angle);
          const topPercent = 50 + radius * Math.sin(angle);

          const isSpeaker = activeSpeakerId === p.id;
          const isHost = p.isLocalUser;

          return (
            <div
              key={p.id}
              onClick={() => onSelectSpeaker?.(p.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer group transition-transform duration-300"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
              }}
              title={`Click to focus on ${p.name}`}
            >
              {/* Floating "Talking" Pill Badge */}
              {isSpeaker && (
                <div className="mb-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/95 border border-emerald-400/60 flex items-center gap-1 shadow-lg shadow-emerald-500/20 animate-bounce">
                  <Mic className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold text-emerald-300">Talking</span>
                </div>
              )}

              {/* Circular Avatar Photo */}
              <div className="relative group">
                <div
                  className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                    isSpeaker
                      ? 'border-emerald-400 ring-4 ring-emerald-500/50 shadow-[0_0_25px_#10b981] scale-110'
                      : isHost
                      ? 'border-cyan-400/80 ring-2 ring-cyan-500/20'
                      : 'border-slate-600 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Status Dot */}
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0f1422] ${
                    isSpeaker
                      ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              {/* Student Name & Role Badge */}
              <div className="text-center mt-1">
                <span className={`text-[11px] font-bold block leading-tight ${isSpeaker ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {p.name}
                </span>
                <span className="text-[9px] text-slate-400 block leading-tight font-medium">
                  {p.role}
                </span>
              </div>

              {/* Live Speech Bubble if Host is speaking interim text */}
              {isHost && liveCandidateTranscript && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-xl bg-black/90 border border-emerald-400/50 text-[11px] text-emerald-200 shadow-xl pointer-events-none z-30 animate-fade-in max-w-xs overflow-hidden text-ellipsis">
                  "{liveCandidateTranscript}"
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom Voice Waveform & Microphone Telemetry ── */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2.5 border-t border-white/10">
        <div className="flex items-center gap-2">
          {/* Animated Mic Audio Level Meter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
            {isMicActive ? (
              <Mic className={`w-3.5 h-3.5 ${audioLevel > 14 ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
            )}

            {/* Live Volume Bars */}
            <div className="flex items-end gap-[2px] h-3 w-7">
              {[0.4, 0.9, 1.2, 0.7, 1.0].map((factor, i) => {
                const barHeight = isMicActive
                  ? Math.max(2, Math.min(12, Math.round((audioLevel / 100) * 12 * factor)))
                  : 2;
                return (
                  <span
                    key={i}
                    className={`w-[3px] rounded-full transition-all duration-75 ${
                      audioLevel > 14 ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  />
                );
              })}
            </div>

            <span className="text-[10px] font-mono text-slate-300">
              {isMicActive ? (audioLevel > 14 ? 'Speaking' : 'Listening...') : 'Muted'}
            </span>
          </div>

          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            {count} Students Connected
          </span>
        </div>

        <button
          onClick={onOpenAddStudent}
          className="text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
        >
          <UserPlus className="w-3 h-3" />
          <span>+ Add Student</span>
        </button>
      </div>
    </div>
  );
}
