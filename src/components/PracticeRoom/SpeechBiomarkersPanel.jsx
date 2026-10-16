import React from 'react';
import { Activity, Gauge, Mic, PauseCircle, AlertTriangle, FileText } from 'lucide-react';

/**
 * Feature 3: Speech Biomarkers Panel
 *
 * Displays:
 * - Words per minute (WPM)
 * - Filler word count & detected filler word chips
 * - Silence duration & long pauses count (> 2.5s)
 * - Total words spoken
 * - Obvious visual speaking state
 * - Strict high-contrast readable styling
 */
export default function SpeechBiomarkersPanel({
  wpm = 130,
  totalWords = 0,
  fillersCount = 0,
  fillerBreakdown = {},
  silenceSeconds = 0,
  longPausesCount = 0,
  speakingState = 'idle', // 'speaking' | 'paused' | 'listening' | 'idle'
  audioLevel = 0,
}) {
  const isStudentSpeaking = speakingState === 'speaking';
  const isPaused = speakingState === 'paused' || (speakingState === 'listening' && silenceSeconds > 1);

  // WPM Health Color
  const getWpmColor = (val) => {
    if (val >= 120 && val <= 155) return 'text-emerald-400';
    if ((val >= 100 && val < 120) || (val > 155 && val <= 175)) return 'text-amber-400';
    return 'text-red-400';
  };

  // Common filler tokens list
  const TARGET_FILLERS = ['um', 'uh', 'like', 'basically', 'actually', 'you know'];

  return (
    <div className="w-full bg-[#0f172a] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 select-none">
      {/* ── Panel Header & Speaking State Indicator ── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-black text-white tracking-wide uppercase">
            Speech Biomarkers
          </h3>
        </div>

        {/* Visually Obvious Speaking State Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black tracking-wide ${
            isStudentSpeaking
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : isPaused
              ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900 border-slate-700 text-slate-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isStudentSpeaking
                ? 'bg-emerald-400 pulse-dot'
                : isPaused
                ? 'bg-amber-400 pulse-dot'
                : 'bg-slate-500'
            }`}
          />
          <span>
            {isStudentSpeaking
              ? '🎙️ Speaking'
              : isPaused
              ? `⏳ Paused (${silenceSeconds}s)`
              : '👂 Ready'}
          </span>
        </div>
      </div>

      {/* ── Key Biomarkers Grid (WPM, Fillers, Pauses, Total Words) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: WPM */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-bold uppercase">Speed (WPM)</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black tabular-nums ${getWpmColor(wpm)}`}>
              {wpm}
            </span>
            <span className="text-[10px] font-bold text-slate-400">wpm</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Target: 125–150</span>
        </div>

        {/* Metric 2: Filler Count */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-bold uppercase">Filler Words</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black tabular-nums ${
                fillersCount <= 2 ? 'text-emerald-400' : fillersCount <= 5 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {fillersCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400">words</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Goal: ≤ 2</span>
        </div>

        {/* Metric 3: Long Pauses (>2.5s) */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-bold uppercase">Long Pauses</span>
            <PauseCircle className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black tabular-nums ${
                longPausesCount <= 1 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {longPausesCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400">&gt;2.5s</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Silence: {silenceSeconds}s</span>
        </div>

        {/* Metric 4: Total Words Spoken */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-bold uppercase">Total Words</span>
            <FileText className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white tabular-nums">
              {totalWords}
            </span>
            <span className="text-[10px] font-bold text-slate-400">spoken</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Continuous buffer</span>
        </div>
      </div>

      {/* ── Detected Filler Words Breakdown Chips ── */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Detected Fillers Tracking:
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Real-Time Analysis
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TARGET_FILLERS.map((filler) => {
            const count = fillerBreakdown[filler] || 0;
            const isDetected = count > 0;
            return (
              <span
                key={filler}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  isDetected
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <span>"{filler}"</span>
                {isDetected && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-black">
                    {count}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
