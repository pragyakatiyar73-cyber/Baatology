import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Volume2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { getBestFemaleVoice, configureFemaleUtterance } from '../../utils/femaleVoiceManager';

export default function PresentationQAPanel({
  projectData,
  questions = [],
  userName = 'Pragya',
  onQACompleted,
}) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [aiFeedbackToast, setAiFeedbackToast] = useState('');

  const currentQ = questions[currentQIndex] || {
    question: `Can you walk me through the biggest technical challenge in ${projectData?.title || 'your project'}?`,
    hint: 'Mention a specific bug, library limitation, or performance delay you solved.',
    idealAnswer: 'We optimized our database queries and added caching to handle high traffic.',
  };

  // Dedicated speech recognition for answering questions
  const {
    isListening,
    liveTranscript,
    language,
    toggleLanguage,
    startListening,
    stopListening,
    toggleMic,
    resetTranscript,
  } = useSpeechRecognition({
    initialLanguage: 'en-IN',
    autoRestart: true,
  });

  // Speak the question aloud when question changes
  const speakQuestion = (qText) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      setIsSpeakingAI(true);
      const textToSpeak = `Question ${currentQIndex + 1}: ${qText}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      configureFemaleUtterance(utterance);
      const voice = getBestFemaleVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = () => setIsSpeakingAI(false);
      utterance.onerror = () => setIsSpeakingAI(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeakingAI(false);
    }
  };

  // Speak initial question on mount
  useEffect(() => {
    if (currentQ?.question) {
      speakQuestion(currentQ.question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQIndex]);

  // Handle student answer submission
  const handleSubmitAnswer = () => {
    const finalAnswer = (typedAnswer || liveTranscript || '').trim();
    if (!finalAnswer) {
      alert('Please speak or type your answer before submitting.');
      return;
    }

    const updatedAnswers = {
      ...studentAnswers,
      [currentQIndex]: {
        question: currentQ.question,
        answer: finalAnswer,
      },
    };
    setStudentAnswers(updatedAnswers);
    setTypedAnswer('');
    resetTranscript();

    // AI encouraging praise
    const praiseMessages = [
      'Very well explained! You demonstrated solid technical understanding.',
      'Excellent response! That clearly articulates your engineering approach.',
      'Great answer! Evaluators love hearing specific technical details like that.',
    ];
    const praise = praiseMessages[currentQIndex % praiseMessages.length];
    setAiFeedbackToast(praise);

    // Speak praise
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(praise);
        configureFemaleUtterance(utt);
        const voice = getBestFemaleVoice();
        if (voice) utt.voice = voice;
        window.speechSynthesis.speak(utt);
      } catch (e) {}
    }

    setTimeout(() => {
      setAiFeedbackToast('');
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex((prev) => prev + 1);
      } else {
        // All questions completed!
        stopListening();
        onQACompleted({
          answers: updatedAnswers,
          totalQuestions: questions.length,
        });
      }
    }, 2200);
  };

  return (
    <div className="w-full h-full rounded-3xl bg-[#0b1428]/95 border border-blue-500/30 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative animate-fade-in text-white">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              AI Technical Q&A Round
            </h2>
            <p className="text-xs text-slate-400">
              Project: <span className="text-cyan-300 font-semibold">{projectData?.title || 'Engineering Project'}</span>
            </p>
          </div>
        </div>

        {/* Question Counter Pill */}
        <div className="px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-blue-300 font-mono text-xs font-bold">
          Question {currentQIndex + 1} of {questions.length}
        </div>
      </div>

      {/* ── Center: Question Card & Answer Area ── */}
      <div className="flex-1 py-4 flex flex-col justify-center space-y-4 max-w-2xl mx-auto w-full">
        {/* Question Bubble */}
        <div className="p-5 rounded-2xl bg-[#0f1d3d] border border-blue-700/40 shadow-xl space-y-3 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>AI Evaluator Question</span>
            </span>

            {/* Replay Question Audio Button */}
            <button
              onClick={() => speakQuestion(currentQ.question)}
              className="px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Listen to question again"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeakingAI ? 'animate-pulse text-cyan-400' : ''}`} />
              <span>{isSpeakingAI ? 'Speaking...' : 'Listen'}</span>
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            "{currentQ.question}"
          </h3>

          {/* Hint Card */}
          {currentQ.hint && (
            <div className="p-3 rounded-xl bg-[#091122] border border-blue-900/60 flex items-start gap-2.5 text-xs text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <span className="font-bold text-amber-300">Suggested Approach: </span>
                {currentQ.hint}
              </p>
            </div>
          )}
        </div>

        {/* AI Praise Toast overlay */}
        {aiFeedbackToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-bounce shadow-xl">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{aiFeedbackToast}</span>
          </div>
        )}

        {/* Student Answer Box */}
        <div className="p-4 rounded-2xl bg-[#0c1630] border border-blue-900/40 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Your Answer ({userName}):
            </span>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-bold text-cyan-300 hover:text-white transition-colors"
                title="Toggle Speech Recognition Language"
              >
                Lang: {language === 'hi-IN' ? '🇮🇳 Hinglish' : '🌐 English'}
              </button>

              {/* Mic Toggle Button */}
              <button
                onClick={toggleMic}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isListening
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Mic Live (Listening...)' : 'Start Mic'}</span>
              </button>
            </div>
          </div>

          {/* Live Transcript / Typed Input */}
          <textarea
            rows={3}
            placeholder={
              isListening
                ? 'Listening to your voice... Speak your answer naturally.'
                : 'Speak with microphone or type your answer here...'
            }
            value={typedAnswer || liveTranscript}
            onChange={(e) => setTypedAnswer(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d1a] border border-blue-900/60 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {isListening ? '🎙️ Speak clearly into your microphone' : '⌨️ Type or click "Start Mic" to speak'}
            </span>
            <button
              onClick={handleSubmitAnswer}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Submit Answer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Step Indicator ── */}
      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-500">
        <span>Step 2 of 3: Technical Q&A</span>
        <span>•</span>
        <span>Next: Comprehensive Delivery & Mistake Report</span>
      </div>
    </div>
  );
}
