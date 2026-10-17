import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Code2,
  LayoutGrid,
  Bot,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

import MentorVideoPanel from './MentorVideoPanel';
import CandidateVideoPanel from './CandidateVideoPanel';
import CodeWorkspaceWidget from './CodeWorkspaceWidget';
import EmpatheticAssistantHUD from '../Assistant/EmpatheticAssistantHUD';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';
import { useEmpatheticVoiceAssistant } from '../../hooks/useEmpatheticVoiceAssistant';

export default function DualVideoMentorshipRoom({
  userName = 'Pragya',
  onBackToDashboard,
  onEndCall,
}) {
  // ── Layout Mode State: 'split' (50/50 Dual Video) | 'code_desk' (Mentor + Code with Floating PIP) ──
  const [layoutMode, setLayoutMode] = useState('split');
  const [showCodeOverlay, setShowCodeOverlay] = useState(false);
  const [mentorReviewing, setMentorReviewing] = useState(false);

  const mentorName = 'Dr. Ann Vance';

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

  // ── Real-Time WebRTC Candidate Stream & Audio Analyser Hook ──
  const {
    stream,
    cameraActive,
    micActive,
    screenActive,
    audioLevel,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
  } = useWebRTCInterview({ autoStart: true });

  // ── Opening Greeting on Mount ──
  useEffect(() => {
    const welcomeTimeout = setTimeout(() => {
      playEmpatheticVoice(
        `Welcome to your Technical Mentorship, ${userName}! I am ${mentorName}. I am here to understand your thoughts, guide your reasoning, and support you at every step. Whenever you are ready, talk me through your ideas or start coding.`
      );
    }, 1000);

    return () => clearTimeout(welcomeTimeout);
  }, [playEmpatheticVoice, userName]);

  // ── Review Code Trigger with Deep Empathy Reasoning ──
  const handleAskMentorToReview = useCallback(
    (codeContent) => {
      setMentorReviewing(true);
      interrupt();

      setTimeout(() => {
        submitUserMessage(
          `Candidate ${userName} submitted code for review: \n\`\`\`\n${(codeContent || '').slice(0, 350)}\n\`\`\`\nPlease provide empathetic feedback, validate their effort, and evaluate algorithmic efficiency.`
        );
        setMentorReviewing(false);
      }, 500);
    },
    [interrupt, submitUserMessage, userName]
  );

  // ── Handle End Call ──
  const handleEndCallClick = () => {
    interrupt();
    if (onEndCall) {
      onEndCall();
    } else if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#070b14] overflow-hidden flex flex-col justify-between text-slate-100 select-none">
      {/* ══════════════════════════════════════════════════════════════
          1. TOP NAVIGATION BAR (Dashboard, Evaluation Status Pill)
      ══════════════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Top-Left: Return to Dashboard */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </button>

          {/* Layout Mode Switcher */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
            <button
              onClick={() => {
                setLayoutMode('split');
                setShowCodeOverlay(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                layoutMode === 'split' && !showCodeOverlay
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Split Screen (50/50)</span>
            </button>

            <button
              onClick={() => {
                setLayoutMode('code_desk');
                setShowCodeOverlay(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                layoutMode === 'code_desk' || showCodeOverlay
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Desk & Code (PIP)</span>
            </button>
          </div>
        </div>

        {/* Top-Center: Evaluation Status Pill Badge */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/30 backdrop-blur-md shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-xs font-bold text-slate-200">
            3D Photorealistic AI Mentorship & Code Evaluation • Active Session
          </span>
        </div>

        {/* Top-Right: Placeholder alignment */}
        <div className="w-24 hidden lg:block" />
      </header>

      {/* ══════════════════════════════════════════════════════════════
          TOP-RIGHT FLOATING CALL STATUS & EMPATHY WIDGET
      ══════════════════════════════════════════════════════════════ */}
      <div className="absolute top-20 right-6 z-30 pointer-events-auto max-w-sm w-full sm:w-80">
        <div className="p-4 rounded-3xl bg-black/75 border border-white/15 backdrop-blur-xl shadow-2xl space-y-2.5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-500/30 text-teal-300">
                <Bot className="w-4 h-4 text-teal-300" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                AURAGD Empathetic Mentor
              </span>
            </div>

            {isSpeaking && (
              <button
                onClick={interrupt}
                className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-[10px] font-bold hover:bg-cyan-900 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                title="Interrupt AI Mentor and speak"
              >
                <span>Interrupt</span>
                <Volume2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Welcome, {userName}!</span>
              <span>🌿</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              {isSpeaking
                ? `${mentorName} is speaking with empathetic voice.`
                : isThinking
                ? `${mentorName} is deep-reasoning thoughtfully...`
                : `${mentorName} is listening attentively. Speak naturally into your mic.`}
            </p>
          </div>

          {/* Active Status & Emotional Telemetry Indicator */}
          <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking
                    ? 'bg-cyan-400 animate-pulse'
                    : isThinking
                    ? 'bg-indigo-400 animate-spin'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-semibold text-slate-300">
                {isSpeaking ? 'Voice Active' : isThinking ? 'Reasoning' : 'Microphone Open'}
              </span>
            </div>

            <span className="font-mono text-teal-400 font-bold">
              Stress: {emotionalState?.stressScore || 18}%
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. DUAL VIDEO / SPLIT-SCREEN GRID INTERFACE
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full p-4 sm:p-6 overflow-hidden flex items-center justify-center">
        {layoutMode === 'split' && !showCodeOverlay ? (
          /* ── 50/50 Split Screen Grid (Left Mentor, Right Candidate) ── */
          <div className="w-full h-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Panel: 3D Photorealistic AI Mentor */}
            <div className="w-full h-full min-h-[300px]">
              <MentorVideoPanel
                avatarState={assistantState}
                speakingText={spokenResponse}
                mentorName={mentorName}
                mentorRole="Staff Software Engineer & Evaluator"
              />
            </div>

            {/* Right Panel: Clean HD Candidate Video Feed */}
            <div className="w-full h-full min-h-[300px]">
              <CandidateVideoPanel
                stream={stream}
                cameraActive={cameraActive}
                micActive={micActive}
                candidateName={userName}
                audioLevel={audioLevel}
                eyeContactPct={93}
                isFloatingPIP={false}
              />
            </div>
          </div>
        ) : (
          /* ── Focus Desk & Code View with Floating Candidate PIP ── */
          <div className="w-full h-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 relative">
            {/* Left/Center: 3D Photorealistic AI Mentor View */}
            <div className="lg:col-span-6 w-full h-full min-h-[340px]">
              <MentorVideoPanel
                avatarState={assistantState}
                speakingText={spokenResponse}
                mentorName={mentorName}
                mentorRole="Staff Software Engineer & Evaluator"
              />
            </div>

            {/* Right: Interactive Code Workspace & Terminal (6 cols) */}
            <div className="lg:col-span-6 w-full h-full min-h-[340px]">
              <CodeWorkspaceWidget
                onAskMentorToReview={handleAskMentorToReview}
                mentorReviewing={mentorReviewing}
              />
            </div>

            {/* Floating Candidate Video Preview Box with LIVE tag */}
            <CandidateVideoPanel
              stream={stream}
              cameraActive={cameraActive}
              micActive={micActive}
              candidateName={userName}
              audioLevel={audioLevel}
              eyeContactPct={93}
              isFloatingPIP={true}
            />
          </div>
        )}
      </main>

      {/* ── Empathetic Assistant HUD (Emotional Telemetry, Thought Process Drawer, Live Subtitles) ── */}
      <div className="relative z-30 w-full px-6 flex justify-center pb-2 pointer-events-auto">
        <EmpatheticAssistantHUD
          assistantState={assistantState}
          thoughtProcess={thoughtProcess}
          spokenResponse={spokenResponse}
          userTranscript={userTranscript}
          interimTranscript={interimTranscript}
          emotionalState={emotionalState}
          mentorName={mentorName}
          onSendPresetMessage={(text) => submitUserMessage(text)}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3. BOTTOM CONTROL BAR (Round Control Action Buttons)
      ══════════════════════════════════════════════════════════════ */}
      <footer className="relative z-30 w-full pb-4 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/65 border border-white/15 backdrop-blur-xl shadow-2xl">
          {/* Mute/Unmute Listening Button */}
          <button
            onClick={toggleMic}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              micActive
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-lg shadow-emerald-500/20'
                : 'bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-500/40'
            }`}
            title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micActive ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
            <span>
              {micActive
                ? isSpeaking
                  ? 'Mentor Speaking'
                  : isThinking
                  ? 'Mentor Thinking...'
                  : isListening
                  ? 'Listening (Voice active)'
                  : 'Listening...'
                : 'Muted'}
            </span>
          </button>

          <div className="w-[1px] h-7 bg-white/15 mx-1" />

          {/* Prominent Red END SESSION Button */}
          <button
            onClick={handleEndCallClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600/95 hover:bg-red-500 active:bg-red-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-red-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="End Interview & View Evaluation"
          >
            <PhoneOff className="w-4 h-4" />
            <span>END SESSION</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
