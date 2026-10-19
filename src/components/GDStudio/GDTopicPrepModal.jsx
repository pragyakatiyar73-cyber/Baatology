import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  BookOpen,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  Plus,
  MessageSquare,
  Edit3,
} from 'lucide-react';
import { getTopicPrepGuide } from '../../utils/gdFeedbackEngine';

export default function GDTopicPrepModal({
  isOpen,
  onClose,
  topic = {},
  onStartDiscussion,
}) {
  const [prepSeconds, setPrepSeconds] = useState(300); // 5 minutes = 300 seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [studentNotes, setStudentNotes] = useState('');

  // Reset timer to 5 mins when topic changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setPrepSeconds(300);
      setIsTimerRunning(true);
    }
  }, [isOpen, topic?.title]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !isTimerRunning) return;

    const timer = setInterval(() => {
      setPrepSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-start discussion when 5 mins finish
          onStartDiscussion?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isTimerRunning, onStartDiscussion]);

  if (!isOpen) return null;

  const prepGuide = getTopicPrepGuide(topic);
  const mins = Math.floor(prepSeconds / 60);
  const secs = prepSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handleStartNow = () => {
    setIsTimerRunning(false);
    onStartDiscussion?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0e1322] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* ── Top Header Bar ── */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#141b2e]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  5-Minute Topic Reading &amp; Prep Time
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Preparation Phase
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Padhiye aur important points samajhiye — timer khatam hote hi GD shuru hoga!
              </p>
            </div>
          </div>

          {/* 5-Min Timer Display & Play/Pause */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-sm sm:text-base shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>{timeFormatted}</span>
            </div>

            <button
              onClick={() => setIsTimerRunning((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Active Topic Title Banner ── */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 max-w-2xl">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
              {prepGuide.title}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300">
            {prepGuide.category}
          </span>
        </div>

        {/* ── Main Content Body (Scrollable) ── */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* 1. Simple 2-Line Overview */}
          <div className="p-4 rounded-2xl bg-cyan-950/25 border border-cyan-500/30 space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 block">
              📌 Topic Summary (Simple Words me)
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {prepGuide.simpleOverview}
            </p>
          </div>

          {/* 2. Pros (In Favor) and Cons (Against) Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros Column */}
            <div className="p-4 rounded-3xl bg-[#131b2e] border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-emerald-300 uppercase tracking-wide">
                  Points in Favor (Pros / Fayde)
                </h4>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                {prepGuide.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/15">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                    <span className="leading-relaxed">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons Column */}
            <div className="p-4 rounded-3xl bg-[#131b2e] border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wide">
                  Points Against (Cons / Challenges)
                </h4>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                {prepGuide.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/15">
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">!</span>
                    <span className="leading-relaxed">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Starter Sentence Lines */}
          <div className="p-4 rounded-3xl bg-[#131b2e] border border-purple-500/30 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <MessageSquare className="w-4 h-4" />
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-purple-300 uppercase tracking-wide">
                🗣️ Easy Opening Lines (Aise Bolna Shuru Karein)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {prepGuide.starterLines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-100 italic leading-relaxed"
                >
                  &ldquo;{line}&rdquo;
                </div>
              ))}
            </div>
          </div>

          {/* 4. Student Scratchpad (My Quick Notes) */}
          <div className="p-4 rounded-3xl bg-[#141b2d] border border-white/10 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>📝 My Quick Notes / Points for Discussion (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="Type 1-2 points you want to speak about during the GD..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>
        </div>

        {/* ── Footer Action Bar ── */}
        <div className="px-6 py-4 bg-[#141b2e]/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            {prepSeconds > 0 ? (
              <span>Remaining Prep Time: <strong className="text-cyan-300 font-mono">{timeFormatted}</strong></span>
            ) : (
              <span className="text-emerald-400 font-bold">Preparation time complete!</span>
            )}
          </div>

          <button
            onClick={handleStartNow}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span>Ready! Start Discussion Now (GD शुरू करें)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
