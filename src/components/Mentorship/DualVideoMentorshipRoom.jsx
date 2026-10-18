import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Volume2,
  Mic,
  MicOff,
  PhoneOff,
  Smile,
  Heart,
  Video,
  VideoOff,
  Sparkles,
  HelpCircle,
  MessageCircleHeart,
} from 'lucide-react';

import FemaleMentor3DAvatar from './FemaleMentor3DAvatar';
import CandidateVideoPanel from './CandidateVideoPanel';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';
import { useEmpatheticVoiceAssistant } from '../../hooks/useEmpatheticVoiceAssistant';

/**
 * DualVideoMentorshipRoom
 * 
 * 1. Digital AI Robot Avatar (Zero Judgement & Safe Space Companion):
 * - Pure Black Theme (#000000) for zero distraction and maximum comfort
 * - Fullscreen face-to-face conversation ("Amne-samne ek dusre se baat kar rahe hain")
 * - 4 Expressive Emotional States: listening, speaking, empathetic, thinking
 * - High Psychological Comfort: Nervous/introverted students can share mistakes freely
 * - Clean UI with only Listening status and END SESSION button
 */
export default function DualVideoMentorshipRoom({
  userName = 'Student',
  onBackToDashboard,
  onEndCall,
}) {
  const mentorName = 'Aura';
  const [showCandidatePip, setShowCandidatePip] = useState(false);

  // ── Empathetic Voice Assistant Hook (Thought Reasoning + Voice STT/TTS + Sentiment) ──
  const {
    assistantState,
    isListening,
    isThinking,
    isSpeaking,
    userTranscript,
    interimTranscript,
    spokenResponse,
    thoughtProcess,
    emotionalState,
    interrupt,
    submitUserMessage,
    playEmpatheticVoice,
  } = useEmpatheticVoiceAssistant({
    mentorName,
    autoListen: true,
  });

  // ── WebRTC Candidate Camera & Microphone Hook ──
  const {
    stream,
    cameraActive,
    micActive,
    audioLevel,
    toggleCamera,
    toggleMic,
  } = useWebRTCInterview({ autoStart: true });

  // ── Opening Greeting on Mount: Friendly, Empathetic & Zero-Judgement ──
  useEffect(() => {
    const welcomeTimeout = setTimeout(() => {
      playEmpatheticVoice(
        `Hey ${userName}! I'm Aura, your AI companion. You can think of me as a trusted friend who is always in your corner. There is zero pressure and zero judgment here—feel free to share your thoughts, ask anything, or talk about any mistakes or doubts. What's on your mind today?`
      );
    }, 900);

    return () => clearTimeout(welcomeTimeout);
  }, [playEmpatheticVoice, userName]);

  // ── Map Assistant State to Robot Emotional State ──
  const currentRobotState = useMemo(() => {
    const transcriptLower = (userTranscript || '').toLowerCase();
    const hasStressKeywords =
      transcriptLower.includes('nervous') ||
      transcriptLower.includes('mistake') ||
      transcriptLower.includes('afraid') ||
      transcriptLower.includes('hesitate') ||
      transcriptLower.includes('scared') ||
      transcriptLower.includes('confused') ||
      transcriptLower.includes('sorry') ||
      transcriptLower.includes('weak') ||
      transcriptLower.includes('sharam');

    // If candidate shows stress/hesitation or asked for emotional support
    if (
      hasStressKeywords ||
      emotionalState?.primaryEmotion === 'sadness' ||
      emotionalState?.primaryEmotion === 'fear' ||
      (emotionalState?.stressScore && emotionalState.stressScore > 35)
    ) {
      return 'empathetic';
    }

    if (assistantState === 'speaking' || isSpeaking) return 'speaking';
    if (assistantState === 'thinking' || isThinking) return 'thinking';
    return 'listening';
  }, [assistantState, isSpeaking, isThinking, emotionalState, userTranscript]);

  // ── Handle End Call ──
  const handleEndCallClick = () => {
    interrupt();
    if (onEndCall) {
      onEndCall();
    } else if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  // ── Reassuring Quick Comfort Prompts ──
  const quickComfortPrompts = [
    {
      label: 'I feel nervous about mistakes',
      prompt: "I am feeling nervous about making mistakes and not knowing the answer.",
    },
    {
      label: 'Explain this like a friend',
      prompt: "Could you explain the concepts simply and kindly like a supportive friend?",
    },
    {
      label: 'How can I build confidence?',
      prompt: "I struggle with self-confidence in discussions. How should I approach this?",
    },
  ];

  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden flex flex-col justify-between text-slate-100 select-none">
      {/* ══════════════════════════════════════════════════════════════
          1. MINIMAL TOP BAR (Dashboard Back & Zero Judgement Badge)
      ══════════════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full px-5 py-3.5 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-md">
        {/* Top-Left: Return to Dashboard */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {/* Student Comfort Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300">
            <Smile className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold tracking-wide">Aura • AI Friend Companion</span>
          </div>
        </div>

        {/* Top-Center / Right: Zero-Judgement Safe Space Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300">
            <Heart className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Zero Judgement Zone</span>
          </div>

          {/* Optional Toggle for Student Video PIP */}
          <button
            onClick={() => setShowCandidatePip((prev) => !prev)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              showCandidatePip
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={showCandidatePip ? 'Hide my camera' : 'Show my camera preview'}
          >
            {showCandidatePip ? <Video className="w-4 h-4 text-cyan-400" /> : <VideoOff className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. MAIN FULLSCREEN FACE-TO-FACE DIGITAL ROBOT CANVAS
      ══════════════════════════════════════════════════════════════ */}
      <main className="relative flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#000000]">
        {/* Fullscreen 3D Photorealistic Female Mentor */}
        <div className="w-full h-full flex items-center justify-center">
          <FemaleMentor3DAvatar
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
            mentorName={mentorName}
          />
          {isSpeaking && spokenResponse && (
            <div className="absolute bottom-24 left-6 right-6 z-30 flex justify-center pointer-events-none animate-fade-in">
              <div className="max-w-xl px-5 py-2.5 rounded-2xl bg-black/85 border border-cyan-400/40 backdrop-blur-xl shadow-2xl text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block mb-0.5">
                  {mentorName} • Spoken Feedback
                </span>
                <p className="text-xs sm:text-sm font-semibold text-cyan-100 leading-relaxed">
                  "{spokenResponse}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Student Camera PIP (Optional & Minimal) */}
        {showCandidatePip && (
          <div className="absolute bottom-24 right-6 z-40 w-48 sm:w-56 aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black animate-fade-in">
            <CandidateVideoPanel
              stream={stream}
              cameraActive={cameraActive}
              micActive={micActive}
              candidateName={userName}
              audioLevel={audioLevel}
              eyeContactPct={95}
              isFloatingPIP={true}
            />
          </div>
        )}

        {/* Reassuring Quick Prompt Chips (Subtle at bottom of screen) */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 max-w-xl px-4 pointer-events-auto">
          {quickComfortPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => submitUserMessage(item.prompt)}
              className="px-3 py-1.5 rounded-full bg-black/70 hover:bg-cyan-950/70 border border-white/10 hover:border-cyan-400/40 text-[11px] font-medium text-slate-300 hover:text-cyan-200 transition-all backdrop-blur-md cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <MessageCircleHeart className="w-3 h-3 text-cyan-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          3. CLEAN BOTTOM CONTROLS: LISTENING INDICATOR & END SESSION
      ══════════════════════════════════════════════════════════════ */}
      <footer className="relative z-30 w-full pb-6 pt-2 flex items-center justify-center pointer-events-auto bg-[#000000]">
        <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-black/90 border border-white/15 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,0,0,0.9)]">
          {/* Listening Status & Mic Toggle Button */}
          <button
            onClick={toggleMic}
            className={`px-5 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
              micActive
                ? isSpeaking
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/50 shadow-lg shadow-teal-500/20'
                  : isThinking
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                  : currentRobotState === 'empathetic'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-lg shadow-emerald-500/20'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                : 'bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-500/40'
            }`}
            title={micActive ? 'Click to Mute' : 'Click to Unmute'}
          >
            {/* Animated Mic / Speaker Icon */}
            {micActive ? (
              isSpeaking ? (
                <Volume2 className="w-4 h-4 text-teal-400 animate-pulse" />
              ) : isThinking ? (
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              ) : currentRobotState === 'empathetic' ? (
                <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
              )
            ) : (
              <MicOff className="w-4 h-4 text-red-400" />
            )}

            {/* Status Text */}
            <span className="tracking-wide">
              {micActive
                ? isSpeaking
                  ? 'Aura is speaking...'
                  : isThinking
                  ? 'Aura is thinking...'
                  : currentRobotState === 'empathetic'
                  ? 'Aura is listening with care...'
                  : 'Listening to you...'
                : 'Microphone Muted'}
            </span>

            {/* Active Mic Ripple Dot */}
            {micActive && !isSpeaking && !isThinking && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          {/* Divider */}
          <div className="w-[1px] h-7 bg-white/15" />

          {/* Prominent Red END SESSION Button */}
          <button
            onClick={handleEndCallClick}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-red-600/40 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            title="End Session"
          >
            <PhoneOff className="w-4 h-4" />
            <span>END SESSION</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
