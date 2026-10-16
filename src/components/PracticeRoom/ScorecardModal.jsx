import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Activity,
  X,
  Volume2,
} from 'lucide-react';

/**
 * Feature 6: Post-Session Results Scorecard Modal
 *
 * Displays:
 * - Overall Score & 4 Core Competency Scores (Structure, Engagement, Evidence, Precision)
 * - Average WPM, Filler word count, Silence count (>2.5s)
 * - Specific mistakes & targeted actionable fixes
 * - Before & After: Student's Raw Spoken Answer vs Executive Polished Version
 * - "Practice Again" button
 */
export default function ScorecardModal({
  scorecard,
  onPracticeAgain,
  onClose,
  onReplayPraise,
}) {
  if (!scorecard) return null;

  const {
    overall = 86,
    structureScore = 88,
    engagementScore = 84,
    evidenceScore = 82,
    precisionScore = 90,
    wpm = 132,
    fillersCount = 2,
    longPausesCount = 1,
    totalWords = 145,
    eyeContactPct = 88,
    posturePct = 91,
    mistakes = [],
    originalAnswer = '',
    polishedVersion = '',
  } = scorecard;

  const competencies = [
    { label: 'Structure & Flow', score: structureScore, desc: 'Logical sequence and STAR clarity' },
    { label: 'Audience Engagement', score: engagementScore, desc: 'Eye contact, posture, vocal presence' },
    { label: 'Concrete Evidence', score: evidenceScore, desc: 'Technical metrics, tools, and results' },
    { label: 'Verbal Precision', score: precisionScore, desc: 'Conciseness and filler elimination' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scorecard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto select-none"
    >
      <div className="w-full max-w-4xl bg-[#0c1222] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* ── Top Header Banner ── */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center text-teal-300 shadow-xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                  Practice Evaluation Completed
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="text-xs font-semibold text-slate-300">Priya Mentor AI</span>
              </div>
              <h2 id="scorecard-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                Executive Communication Scorecard
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            title="Close modal"
            aria-label="Close scorecard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="p-6 sm:p-8 space-y-7 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Overall Score Hero Banner & Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Overall Score Badge */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#162033] to-[#0f172a] border border-teal-500/40 shadow-xl flex flex-col justify-between items-center text-center">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Overall Practice Score
              </span>
              <div className="my-2 flex items-baseline gap-1">
                <span className="text-5xl font-black text-white tabular-nums tracking-tight">
                  {overall}
                </span>
                <span className="text-lg font-bold text-teal-400">/100</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold">
                {overall >= 85 ? '🌟 Interview Qualified' : overall >= 75 ? '👍 Solid Delivery' : '📈 Room for Polish'}
              </span>
            </div>

            {/* Biomarker Summary Counters */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase">Avg Speed</span>
                <span className="text-2xl font-black text-cyan-400 tabular-nums my-1">{wpm}</span>
                <span className="text-[10px] text-slate-400 font-medium">Optimal: 125-145 WPM</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase">Fillers</span>
                <span className={`text-2xl font-black tabular-nums my-1 ${fillersCount <= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {fillersCount}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Goal: ≤ 2 words</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase">Eye Contact</span>
                <span className="text-2xl font-black text-emerald-400 tabular-nums my-1">{eyeContactPct}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Vision HUD</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase">Long Pauses</span>
                <span className={`text-2xl font-black tabular-nums my-1 ${longPausesCount <= 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {longPausesCount}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">&gt;2.5s silences</span>
              </div>
            </div>
          </div>

          {/* Section 2: Four Core Competencies Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Competency Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {competencies.map((comp) => (
                <div key={comp.label} className="p-3.5 rounded-xl bg-[#090e17] border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{comp.label}</span>
                    <span className="text-xs font-black text-teal-400 tabular-nums">{comp.score}/100</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{comp.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Specific Mistakes and Actionable Fixes */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Identified Mistakes &amp; Actionable Fixes</span>
            </h3>

            <div className="space-y-2.5">
              {mistakes.map((m, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 flex items-start gap-3"
                >
                  <span className="text-base text-amber-400 shrink-0 mt-0.5">⚠️</span>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-amber-200">{m.issue}</p>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      <span className="font-bold text-teal-300">Actionable Fix: </span>
                      {m.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Answer Polish: What you said vs Executive Polished Version */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#10182b] border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Executive Answer Polish (STAR Framework)</span>
              </h3>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                Priya AI Rewrite
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Spoken Transcript */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  What You Said (Raw Audio):
                </span>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{originalAnswer}"
                </p>
              </div>

              {/* Polished Executive Version */}
              <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-teal-300 block tracking-wider">
                  Polished Executive Delivery:
                </span>
                <p className="text-xs text-slate-100 font-medium leading-relaxed whitespace-pre-line">
                  {polishedVersion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Modal Footer Controls ── */}
        <div className="p-5 sm:p-6 bg-[#080d17] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Consistency is key: 2 sessions daily builds executive interview fluency.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onPracticeAgain}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
