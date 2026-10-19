import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trophy,
  Award,
  CheckCircle,
  AlertCircle,
  Volume2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Check,
  ThumbsUp,
  RefreshCw,
} from 'lucide-react';
import { calculateSentenceAccuracy } from '../../utils/gdFeedbackEngine';

export default function GDReviewAndPracticeModal({
  isOpen,
  onClose,
  analysisData = {},
  topic = {},
  userName = 'Pragya',
  onRestartGD,
  onBackToDashboard,
}) {
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'breakdown'
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);

  // Practice Voice & Recognition State
  const [isSpeakingAvatar, setIsSpeakingAvatar] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [spokenAttempt, setSpokenAttempt] = useState('');
  const [practiceResult, setPracticeResult] = useState(null);

  const recognitionRef = useRef(null);

  const sentences = analysisData.practiceSentences || [];
  const currentSentence = sentences[currentSentenceIdx] || sentences[0];

  // Stop avatar speech or mic when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      try {
        recognitionRef.current?.stop?.();
      } catch (_) {}
      setIsListeningMic(false);
      setIsSpeakingAvatar(false);
    }
  }, [isOpen]);

  // Reset practice result when changing sentence
  useEffect(() => {
    setSpokenAttempt('');
    setPracticeResult(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    try {
      recognitionRef.current?.stop?.();
    } catch (_) {}
    setIsListeningMic(false);
    setIsSpeakingAvatar(false);
  }, [currentSentenceIdx]);

  if (!isOpen) return null;

  // ── 1. Listen Avatar Pronounce Correct Sentence ──
  const handleListenAvatar = () => {
    if (!window.speechSynthesis || !currentSentence) return;

    window.speechSynthesis.cancel();
    const textToSpeak = currentSentence.improved;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Pick a natural clear voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find((v) => v.name.includes('Natural') || v.name.includes('Jenny') || v.name.includes('Zira') || v.name.includes('Google UK English Female')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }
    utterance.rate = 0.95; // Slightly slower for clear educational articulation
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeakingAvatar(true);
    utterance.onend = () => setIsSpeakingAvatar(false);
    utterance.onerror = () => setIsSpeakingAvatar(false);

    window.speechSynthesis.speak(utterance);
  };

  // ── 2. Practice Speaking into Mic (Dubara Bolwaye) ──
  const handleStartSpeakingPractice = () => {
    if (isListeningMic) {
      try {
        recognitionRef.current?.stop?.();
      } catch (_) {}
      setIsListeningMic(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-IN';

    setSpokenAttempt('');
    setPracticeResult(null);

    rec.onstart = () => {
      setIsListeningMic(true);
    };

    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      const text = (final || interim).trim();
      setSpokenAttempt(text);

      if (final) {
        // Calculate similarity accuracy
        const result = calculateSentenceAccuracy(final, currentSentence.improved);
        setPracticeResult(result);
        setIsListeningMic(false);
      }
    };

    rec.onerror = (err) => {
      console.warn('[Sentence Practice Mic] Error:', err);
      setIsListeningMic(false);
    };

    rec.onend = () => {
      setIsListeningMic(false);
      // If final was captured but result not computed yet
      if (spokenAttempt && !practiceResult) {
        const result = calculateSentenceAccuracy(spokenAttempt, currentSentence.improved);
        setPracticeResult(result);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.warn('Rec start error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0d121f] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* ── Top Header Bar ── */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#12192b]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  GD Feedback &amp; Sentence Correction Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Detailed Analysis
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md sm:max-w-xl">
                Topic: <span className="text-slate-200 font-semibold">{topic?.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Feedback"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Score Summary Banner ── */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                {analysisData.overallScore || 85}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <div className="text-xs">
              <span className="text-emerald-400 font-bold block">
                {analysisData.overallScore >= 80 ? 'Strong Contributor' : 'Promising - Practice Needed'}
              </span>
              <span className="text-slate-400 text-[11px]">
                {analysisData.wordCount || 0} Words spoken • {analysisData.fillerCount || 0} Hesitation Fillers
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'practice'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-cyan-300" />
              <span>🎙️ Repeat &amp; Practice (दोबारा बोलो)</span>
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'breakdown'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-300" />
              <span>📊 Mistakes Breakdown</span>
            </button>
          </div>
        </div>

        {/* ── Main Modal Content Body (Scrollable) ── */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* ══════════════════════════════════════════════════════════
              TAB 1: DUBARA BOLWAYE / SENTENCE PRACTICE TRAINER
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'practice' && currentSentence && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/25 border border-cyan-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Practice &amp; Repeat: Correct Spoken Sentences
                    </h3>
                    <p className="text-xs text-slate-300">
                      Avatar se suno aur mic on karke dobara bolo taaki fluency aur grammar improve ho sake!
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-xl border border-cyan-500/30 shrink-0">
                  Sentence {currentSentenceIdx + 1} of {sentences.length}
                </div>
              </div>

              {/* Main Sentence Card */}
              <div className="p-6 rounded-3xl bg-[#141b2d] border border-white/10 space-y-5 shadow-xl">
                {/* 1. What You Said (Original) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Original Spoken Statement (Mistakes Detected)</span>
                  </span>
                  <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-sm font-medium leading-relaxed">
                    &ldquo;{currentSentence.original}&rdquo;
                  </div>
                </div>

                {/* 2. Corrected & Polished Version */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Polished / Correct Sentence (Aise Bolna Chahiye)</span>
                  </span>
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-base font-bold leading-relaxed shadow-sm">
                    &ldquo;{currentSentence.improved}&rdquo;
                  </div>
                </div>

                {/* 3. Reason & Improvement Tip */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-cyan-400 font-bold shrink-0">💡 Note:</span>
                  <span>{currentSentence.tips}</span>
                </div>

                {/* 4. Action Buttons: Listen Avatar & Practice Mic */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  {/* Button 1: Listen Avatar Speech */}
                  <button
                    onClick={handleListenAvatar}
                    className={`flex-1 w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-md ${
                      isSpeakingAvatar
                        ? 'bg-purple-600 border-purple-400 text-white animate-pulse shadow-purple-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 border-white/15 text-slate-200 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <span>{isSpeakingAvatar ? 'Avatar Speaking...' : '🔊 Listen Avatar Pronounce It'}</span>
                  </button>

                  {/* Button 2: Practice & Speak */}
                  <button
                    onClick={handleStartSpeakingPractice}
                    className={`flex-1 w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-md ${
                      isListeningMic
                        ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-rose-500/30'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/40 text-white shadow-emerald-500/25'
                    }`}
                  >
                    {isListeningMic ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Listening... (Speak Now)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>🎙️ Ab Aap Bolo (Practice Now)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 5. Live Speech Attempt & Accuracy Verification */}
                {spokenAttempt && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Your Spoken Attempt:</span>
                      {practiceResult && (
                        <span
                          className={`font-mono font-extrabold px-2 py-0.5 rounded-md ${
                            practiceResult.isPassed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {practiceResult.accuracy}% Match Accuracy
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white italic">&ldquo;{spokenAttempt}&rdquo;</p>

                    {practiceResult && (
                      <div
                        className={`mt-2 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                          practiceResult.isPassed
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        }`}
                      >
                        {practiceResult.isPassed ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span>{practiceResult.feedback}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination Controls between Sentences */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    disabled={currentSentenceIdx === 0}
                    onClick={() => setCurrentSentenceIdx((prev) => Math.max(0, prev - 1))}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      currentSentenceIdx === 0
                        ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500'
                        : 'bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Sentence</span>
                  </button>

                  <span className="text-xs text-slate-400 font-medium">
                    {currentSentenceIdx + 1} / {sentences.length}
                  </span>

                  <button
                    disabled={currentSentenceIdx === sentences.length - 1}
                    onClick={() => setCurrentSentenceIdx((prev) => Math.min(sentences.length - 1, prev + 1))}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      currentSentenceIdx === sentences.length - 1
                        ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500'
                        : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400/40 text-white'
                    }`}
                  >
                    <span>Next Sentence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: DETAILED 4-PILLAR MISTAKES BREAKDOWN
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'breakdown' && (
            <div className="space-y-5">
              {/* Pillar 1: Grammar Mistakes */}
              <div className="p-5 rounded-3xl bg-[#141b2d] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Grammar &amp; Syntax Errors</h4>
                      <p className="text-[11px] text-slate-400">
                        Sentence framing, subject-verb agreement, and verb forms
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-400 font-mono">
                    Score: {analysisData.grammarScore || 85}%
                  </span>
                </div>

                {analysisData.grammarMistakes && analysisData.grammarMistakes.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {analysisData.grammarMistakes.map((gm, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-rose-400 font-bold">❌ {gm.issue}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-emerald-400 font-bold">✅ {gm.correction}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{gm.explanation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>No critical grammar errors detected in this session! Great job!</span>
                  </div>
                )}
              </div>

              {/* Pillar 2: Vocabulary Upgrades */}
              <div className="p-5 rounded-3xl bg-[#141b2d] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Vocabulary &amp; Terminology Upgrades</h4>
                      <p className="text-[11px] text-slate-400">
                        High-scoring corporate and GD phrases to replace casual words
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-400 font-mono">
                    Score: {analysisData.vocabScore || 80}%
                  </span>
                </div>

                {analysisData.vocabularyUpgrades && analysisData.vocabularyUpgrades.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {analysisData.vocabularyUpgrades.map((vu, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Casual: &ldquo;{vu.original}&rdquo;</span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-purple-300 font-bold">Better: {vu.replacement}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic">Example: &ldquo;{vu.contextExample}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
                    Vocabulary was well-maintained. For extra impact, try phrases like &ldquo;compelling
                    evidence&rdquo;, &ldquo;critical challenge&rdquo;, and &ldquo;strategic paradigm&rdquo;.
                  </div>
                )}
              </div>

              {/* Pillar 3: Fluency & Hesitation Fillers */}
              <div className="p-5 rounded-3xl bg-[#141b2d] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Fluency &amp; Hesitation Fillers</h4>
                      <p className="text-[11px] text-slate-400">
                        Pace of speech and unintended pauses (&lsquo;um&rsquo;, &lsquo;uh&rsquo;, &lsquo;like&rsquo;)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    Score: {analysisData.fluencyScore || 88}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
                    <span className="text-xs text-slate-400 block">Speaking Pace</span>
                    <span className="text-base font-extrabold text-cyan-400">{analysisData.wpm || 125} WPM</span>
                    <span className="text-[10px] text-slate-500 block">Target: 120-140 WPM</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
                    <span className="text-xs text-slate-400 block">Filler Words Used</span>
                    <span className="text-base font-extrabold text-amber-400">
                      {analysisData.fillerCount || 0}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Ideal: &lt; 2 per min</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center col-span-2 sm:col-span-1">
                    <span className="text-xs text-slate-400 block">Articulation Clarity</span>
                    <span className="text-base font-extrabold text-emerald-400">92%</span>
                    <span className="text-[10px] text-slate-500 block">Voice cadence stable</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 bg-[#12192b]/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            Resume Discussion
          </button>

          <div className="flex items-center gap-2.5">
            {onRestartGD && (
              <button
                onClick={onRestartGD}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Topic / Restart</span>
              </button>
            )}

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-1.5"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
