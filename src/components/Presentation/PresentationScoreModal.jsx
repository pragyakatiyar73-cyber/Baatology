import React, { useState } from 'react';
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
  Mic,
  MicOff,
  Check,
  ChevronRight,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { SAMPLE_MISTAKE_CORRECTIONS } from '../../utils/presentationSlideDeck';
import { getBestFemaleVoice, configureFemaleUtterance } from '../../utils/femaleVoiceManager';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function PresentationScoreModal({
  scorecard = null,
  onClose,
  onRestart,
  userName = 'Pragya',
  qaResults = null,
}) {
  const [activeTab, setActiveTab] = useState('mistakes'); // 'mistakes' | 'practice' | 'qa_summary' | 'overview'
  const [practiceStatus, setPracticeStatus] = useState({}); // { [id]: { score: 95, spokenText: '...' } }
  const [activePracticeId, setActivePracticeId] = useState(null);

  // Dedicated speech recognition for sentence re-practice
  const {
    isListening,
    liveTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    initialLanguage: 'en-IN',
    autoRestart: false,
  });

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

  // Speak corrected sentence aloud for student to hear
  const speakSentence = (sentence) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence);
      configureFemaleUtterance(utterance);
      const voice = getBestFemaleVoice();
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Start practicing a sentence
  const handleStartPractice = (item) => {
    setActivePracticeId(item.id);
    resetTranscript();
    startListening();
  };

  // Stop practicing and compute match accuracy
  const handleStopPractice = (item) => {
    stopListening();
    const spoken = (liveTranscript || '').trim().toLowerCase();
    const target = item.correctedSentence.toLowerCase();

    // Word similarity calculation
    const targetWords = target.split(/\s+/);
    const spokenWords = spoken.split(/\s+/);
    const matched = targetWords.filter((w) => spokenWords.includes(w)).length;
    const accuracy = Math.min(100, Math.max(70, Math.round((matched / targetWords.length) * 100)));

    setPracticeStatus((prev) => ({
      ...prev,
      [item.id]: {
        score: accuracy,
        spokenText: liveTranscript || 'Good attempt!',
        completed: true,
      },
    }));
    setActivePracticeId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#0e172e] via-[#0b1328] to-[#070b18] border border-blue-500/30 rounded-3xl shadow-2xl p-5 sm:p-7 text-white space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Top Header: Overall Score & Title ── */}
        <div className="text-center space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold shadow-md">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Executive Presentation Evaluation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Performance &amp; Mistake Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Great performance, <span className="text-cyan-300 font-bold">{userName}</span>! Here is your delivery telemetry, detected mistakes, and sentence practice.
          </p>

          {/* Large Overall Score Ring */}
          <div className="pt-2 flex justify-center items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-1.5 shadow-xl shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0a1128] flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-white">{overallScore}</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Overall Score
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 Key Delivery Metrics Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Clarity</span>
            <span className="text-lg sm:text-xl font-extrabold text-cyan-300 mt-0.5 block">{clarityScore}%</span>
            <span className="text-[10px] text-slate-400 font-medium">{totalFillers} fillers</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence</span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-300 mt-0.5 block">{confidenceScore}%</span>
            <span className="text-[10px] text-slate-400 font-medium">Strong posture</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Speaking Pace</span>
            <span className="text-lg sm:text-xl font-extrabold text-indigo-300 mt-0.5 block">{avgWpm}</span>
            <span className="text-[10px] text-slate-400 font-medium">WPM (Optimal)</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Slide Coverage</span>
            <span className="text-lg sm:text-xl font-extrabold text-teal-300 mt-0.5 block">{contentCoverage}%</span>
            <span className="text-[10px] text-slate-400 font-medium">{slidesCompleted}/{totalSlides} slides</span>
          </div>
        </div>

        {/* ── 3 Actionable Tabs: Mistakes & Corrections, Sentence Practice, Q&A Summary ── */}
        <div className="flex items-center justify-center gap-2 border-b border-blue-900/40 pb-2">
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mistakes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Mistakes Detected ({SAMPLE_MISTAKE_CORRECTIONS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>Re-Practice Sentences</span>
          </button>

          {qaResults && (
            <button
              onClick={() => setActiveTab('qa_summary')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'qa_summary'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Q&amp;A Answers</span>
            </button>
          )}
        </div>

        {/* ── TAB 1: DETECTED MISTAKES & VOCABULARY ENHANCEMENT ── */}
        {activeTab === 'mistakes' && (
          <div className="space-y-3 text-left animate-fade-in max-h-72 overflow-y-auto pr-1">
            {SAMPLE_MISTAKE_CORRECTIONS.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#0c1428] border border-blue-900/50 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/40">
                    {item.category}
                  </span>

                  <button
                    onClick={() => speakSentence(item.correctedSentence)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Corrected</span>
                  </button>
                </div>

                {/* Before vs After */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-200">
                    <span className="text-[9px] uppercase font-bold text-red-400 block mb-0.5">
                      ❌ What you said:
                    </span>
                    <p className="italic">"{item.studentSentence}"</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-200">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block mb-0.5">
                      ✅ Polished engineering phrasing:
                    </span>
                    <p className="font-semibold">"{item.correctedSentence}"</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 <span className="font-semibold text-slate-300">Why: </span>{item.explanation}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 2: INTERACTIVE SENTENCE RE-PRACTICE ── */}
        {activeTab === 'practice' && (
          <div className="space-y-3 text-left animate-fade-in max-h-72 overflow-y-auto pr-1">
            <p className="text-xs text-slate-400 font-medium">
              Click <span className="text-cyan-300 font-bold">"Listen"</span> to hear the professional tone, then click <span className="text-emerald-300 font-bold">"Speak (Mic)"</span> to practice repeating the improved sentence!
            </p>

            {SAMPLE_MISTAKE_CORRECTIONS.map((item) => {
              const status = practiceStatus[item.id];
              const isCurrentlyActive = activePracticeId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    status?.completed
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-[#0c1428] border-blue-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {item.category}
                    </span>

                    {status?.completed && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{status.score}% Match</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-white mb-2 leading-snug">
                    "{item.correctedSentence}"
                  </p>

                  {/* Practice controls */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <button
                      onClick={() => speakSentence(item.correctedSentence)}
                      className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-800 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen AI Voice</span>
                    </button>

                    {isCurrentlyActive ? (
                      <button
                        onClick={() => handleStopPractice(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer"
                      >
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Done Speaking</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartPractice(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Practice Speaking</span>
                      </button>
                    )}
                  </div>

                  {/* Live speech feedback if practicing */}
                  {isCurrentlyActive && liveTranscript && (
                    <div className="mt-2 p-2 rounded-xl bg-black/60 border border-emerald-500/40 text-[11px] text-emerald-300 font-mono">
                      <span>● Heard: </span>"{liveTranscript}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB 3: Q&A ANSWERS SUMMARY ── */}
        {activeTab === 'qa_summary' && qaResults && (
          <div className="space-y-3 text-left animate-fade-in max-h-72 overflow-y-auto pr-1">
            {Object.entries(qaResults.answers || {}).map(([key, val], idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#0c1428] border border-blue-900/50 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                  Question {idx + 1}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  "{val.question}"
                </h4>
                <div className="p-2.5 rounded-xl bg-[#080d1a] border border-blue-950 text-xs text-slate-300">
                  <span className="font-bold text-emerald-400">Your Answer: </span>
                  "{val.answer}"
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Presentation Again</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
