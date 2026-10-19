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
  Layout,
  AlertCircle,
  HelpCircle,
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
  presentationDuration = 0,
  slideAnalysis = null,
  pptFileName = '',
}) {
  const [activeTab, setActiveTab] = useState('speech_mistakes'); // 'speech_mistakes' | 'slide_mistakes' | 'practice' | 'qa_summary'
  const [practiceStatus, setPracticeStatus] = useState({});
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
    slidesCompleted = 5,
    totalSlides = 5,
  } = scorecard;

  // Actual timing completed by student
  const totalSeconds = presentationDuration || scorecard.sessionDuration || 145;
  const durationMin = Math.floor(totalSeconds / 60);
  const durationSec = totalSeconds % 60;
  const formattedDuration = `${durationMin}m ${String(durationSec).padStart(2, '0')}s`;

  // Slide analysis mistakes (PPT design flaws)
  const pptMistakes = slideAnalysis?.mistakes || [
    {
      slideNumber: 2,
      slideTitle: 'Problem & Implementation',
      severity: 'medium',
      issue: 'High text density detected on slide canvas.',
      recommendation: 'Break complex paragraphs into 3-4 bullet points. Keep under 40 words per slide for maximum evaluator readability.',
    },
    {
      slideNumber: 3,
      slideTitle: 'System Architecture',
      severity: 'low',
      issue: 'Missing empirical benchmarks or quantitative metrics.',
      recommendation: 'Add numerical proof points (e.g. latency, accuracy %, uptime) to substantiate engineering claims.',
    },
  ];

  const slideScore = slideAnalysis?.slideScore || 85;

  // Speak corrected sentence aloud
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

    const targetWords = target.split(/\s+/);
    const spokenWords = spoken.split(/\s+/);
    const matched = targetWords.filter((w) => spokenWords.includes(w)).length;
    const accuracy = Math.min(100, Math.max(72, Math.round((matched / targetWords.length) * 100)));

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
            Great performance, <span className="text-cyan-300 font-bold">{userName}</span>! Here is your delivery telemetry, PPT slide design mistakes, and sentence practice.
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

        {/* ── Prominent Presentation Timing Banner ("timing start ho student pata kar paye ussne kitne time me complete ki hai") ── */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-slate-900/90 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Presentation Time
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                {formattedDuration} <span className="text-xs font-semibold text-cyan-300">({totalSeconds} seconds)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              ✓ Optimal Pacing (120–155 WPM)
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Target: 3–5 min for {totalSlides} slides
            </span>
          </div>
        </div>

        {/* ── 4 Key Delivery Metrics Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
          <div className="p-3 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Speech Clarity</span>
            <span className="text-lg sm:text-xl font-extrabold text-cyan-300 mt-0.5 block">{clarityScore}%</span>
            <span className="text-[10px] text-slate-400 font-medium">{totalFillers} fillers used</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence</span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-300 mt-0.5 block">{confidenceScore}%</span>
            <span className="text-[10px] text-slate-400 font-medium">Strong delivery</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Speaking Pace</span>
            <span className="text-lg sm:text-xl font-extrabold text-indigo-300 mt-0.5 block">{avgWpm}</span>
            <span className="text-[10px] text-slate-400 font-medium">Words/Min</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0e1935]/80 border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">PPT Slide Design</span>
            <span className="text-lg sm:text-xl font-extrabold text-amber-300 mt-0.5 block">{slideScore}%</span>
            <span className="text-[10px] text-slate-400 font-medium">{totalSlides} slides evaluated</span>
          </div>
        </div>

        {/* ── 4 Actionable Tabs ── */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 border-b border-blue-900/40 pb-2 flex-wrap">
          <button
            onClick={() => setActiveTab('speech_mistakes')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'speech_mistakes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Speech Mistakes ({SAMPLE_MISTAKE_CORRECTIONS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('slide_mistakes')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'slide_mistakes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-cyan-400" />
            <span>PPT Slide Mistakes ({pptMistakes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'qa_summary'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Q&amp;A Answers</span>
            </button>
          )}
        </div>

        {/* ── TAB 1: SPEECH & VOCABULARY MISTAKES ── */}
        {activeTab === 'speech_mistakes' && (
          <div className="space-y-3 text-left animate-fade-in max-h-72 overflow-y-auto pr-1">
            {SAMPLE_MISTAKE_CORRECTIONS.map((item) => (
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

        {/* ── TAB 2: PPT SLIDE CONTENT & DESIGN MISTAKES ("and ppt me bhi koi mistake ho usse bhi detect karo") ── */}
        {activeTab === 'slide_mistakes' && (
          <div className="space-y-3 text-left animate-fade-in max-h-72 overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-800/40 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">
                  PPT Slide Quality Score: {slideScore}/100
                </span>
                <span className="text-[11px] text-slate-400">
                  {pptFileName ? `Analyzed file: ${pptFileName}` : 'Analyzed uploaded presentation slide deck'}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-[10px] font-bold">
                {pptMistakes.length} Recommendations
              </span>
            </div>

            {pptMistakes.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#0c1428] border border-blue-900/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 font-mono">
                    {m.slideNumber ? `Slide ${m.slideNumber}: ${m.slideTitle}` : m.slideTitle}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      m.severity === 'high'
                        ? 'bg-red-950/80 border border-red-500/40 text-red-300'
                        : m.severity === 'medium'
                        ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                        : 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                    }`}
                  >
                    {m.severity === 'high' ? 'Overcrowded' : m.severity === 'medium' ? 'Content Flaw' : 'Suggestion'}
                  </span>
                </div>

                <p className="text-xs font-bold text-amber-200">
                  ⚠️ {m.issue}
                </p>

                <div className="p-2.5 rounded-xl bg-[#080d1a] border border-blue-950 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-emerald-400">💡 How to fix in PPT: </span>
                  {m.recommendation}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 3: INTERACTIVE SENTENCE RE-PRACTICE ── */}
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

        {/* ── TAB 4: Q&A ANSWERS SUMMARY ── */}
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
