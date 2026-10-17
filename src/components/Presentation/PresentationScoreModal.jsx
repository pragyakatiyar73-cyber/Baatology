import React from 'react';
import {
  Trophy,
  Award,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Volume2,
  FileText,
  X,
} from 'lucide-react';

export default function PresentationScoreModal({
  scorecard = null,
  onClose,
  onRestart,
  userName = 'Pragya',
}) {
  if (!scorecard) return null;

  const {
    overallScore = 88,
    clarityScore = 91,
    confidenceScore = 87,
    paceScore = 93,
    contentCoverage = 100,
    totalFillers = 2,
    avgWpm = 136,
    sessionDuration = 145,
    slidesCompleted = 5,
    totalSlides = 5,
    mistakeList = [],
    improvementTips = [],
  } = scorecard;

  const durationMin = Math.floor(sessionDuration / 60);
  const durationSec = sessionDuration % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e172e] via-[#0b1328] to-[#070b18] border border-blue-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 text-white space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Top Header: Overall Score & Title ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold shadow-md">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Executive Presentation Evaluation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Presentation Scorecard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Great performance, <span className="text-cyan-300 font-bold">{userName}</span>! Here is your real-time delivery and mistake analysis report.
          </p>

          {/* Large Overall Score Ring */}
          <div className="pt-2 flex justify-center items-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-1.5 shadow-xl shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0a1128] flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{overallScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Overall Score
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 Key Delivery Metrics Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Clarity</span>
            <span className="text-xl font-extrabold text-cyan-300 mt-0.5 block">{clarityScore}%</span>
            <span className="text-[10px] text-slate-400 font-medium">{totalFillers} fillers used</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Confidence</span>
            <span className="text-xl font-extrabold text-emerald-300 mt-0.5 block">{confidenceScore}%</span>
            <span className="text-[10px] text-slate-400 font-medium">Strong posture</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Speaking Pace</span>
            <span className="text-xl font-extrabold text-indigo-300 mt-0.5 block">{avgWpm}</span>
            <span className="text-[10px] text-slate-400 font-medium">Words/Min (Optimal)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Slide Coverage</span>
            <span className="text-xl font-extrabold text-teal-300 mt-0.5 block">{contentCoverage}%</span>
            <span className="text-[10px] text-slate-400 font-medium">{slidesCompleted}/{totalSlides} slides</span>
          </div>
        </div>

        {/* ── Detected Mistake & Hesitation Log ── */}
        <div className="p-4 rounded-2xl bg-[#0a1125] border border-blue-950 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Detected Mistakes & Delivery Flaws ({mistakeList.length})</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {mistakeList.length > 0 ? (
              mistakeList.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5"
                >
                  <span className="text-cyan-400 font-mono font-bold shrink-0">Slide {m.slide || 1}:</span>
                  <span>{m.issue}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero major delivery mistakes detected! Flawless execution.</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Executive Recommendations ── */}
        <div className="p-4 rounded-2xl bg-[#0a1125] border border-blue-950 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Delivery Recommendations</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {improvementTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Deck Again</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-extrabold tracking-wide uppercase shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Back to Presentation Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
