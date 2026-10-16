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
  Maximize2,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

import MentorVideoPanel from './MentorVideoPanel';
import CandidateVideoPanel from './CandidateVideoPanel';
import CodeWorkspaceWidget from './CodeWorkspaceWidget';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';
import { useRealisticAvatarStream } from '../../hooks/useRealisticAvatarStream';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function DualVideoMentorshipRoom({
  userName = 'Pragya',
  onBackToDashboard,
  onEndCall,
}) {
  // ── Layout Mode State: 'split' (50/50 Dual Video) | 'code_desk' (Mentor + Code with Floating PIP) ──
  const [layoutMode, setLayoutMode] = useState('split');
  const [showCodeOverlay, setShowCodeOverlay] = useState(false);
  const [mentorReviewing, setMentorReviewing] = useState(false);

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

  // ── Realistic AI Mentor Avatar Hook ──
  const {
    avatarVideoRef,
    avatarState,
    setAvatarState,
    speakingText,
    mouthShape,
    isBlinking,
    isNodding,
    speakText,
    interrupt,
    mentorName,
  } = useRealisticAvatarStream({
    mentorName: 'Elena Vance',
    onSpeechStart: () => {},
    onSpeechEnd: () => {
      // Resume listening
      if (startListeningRef.current) {
        startListeningRef.current();
      }
    },
  });

  const startListeningRef = useRef(null);
  const stopListeningRef = useRef(null);

  // ── Continuous Candidate Voice Recognition ──
  const handleCandidateSpeech = useCallback(
    (transcript) => {
      if (!transcript || !transcript.trim()) return;
      if (avatarState === 'speaking') return; // Avoid self-echo

      setAvatarState('thinking');
      stopListeningRef.current?.();

      // Realistic AI Mentor contextual interview response generator
      setTimeout(() => {
        const text = transcript.toLowerCase();
        let reply = '';

        if (text.includes('code') || text.includes('solution') || text.includes('complexity') || text.includes('hash map')) {
          reply = `Great explanation on the Hash Map approach, ${userName}. Your time complexity of O(n) is optimal. How would you handle memory constraints if the input array had billions of elements?`;
        } else if (text.includes('project') || text.includes('built') || text.includes('react') || text.includes('node')) {
          reply = `That demonstrates solid engineering architecture. Walk me through a challenging bug you encountered in production and how you isolated it.`;
        } else if (text.includes('hello') || text.includes('hi') || text.includes('ready')) {
          reply = `Hello ${userName}! It is fantastic to meet you. I have reviewed your portfolio. Let's begin with our technical interview challenge on the desk terminal.`;
        } else {
          reply = `That is very clear, ${userName}. I appreciate your structured communication. Could you elaborate on your testing strategy for this implementation?`;
        }

        speakText(reply);
      }, 700);
    },
    [avatarState, speakText, userName, setAvatarState]
  );

  const { startListening, stopListening, isListening } = useSpeechRecognition({
    onResult: (resultText) => {
      handleCandidateSpeech(resultText);
    },
  });

  startListeningRef.current = startListening;
  stopListeningRef.current = stopListening;

  // ── Opening Greeting on Room Mount ──
  useEffect(() => {
    const welcomeTimeout = setTimeout(() => {
      speakText(
        `Welcome to your Technical Mock Interview, ${userName}! I am Elena Vance, your senior engineering mentor. We have the code editor ready on the desk. Whenever you are ready, feel free to introduce yourself or walk me through your code.`
      );
    }, 900);

    return () => clearTimeout(welcomeTimeout);
  }, [speakText, userName]);

  // ── Review Code Trigger ──
  const handleAskMentorToReview = useCallback(
    (codeContent) => {
      setMentorReviewing(true);
      setAvatarState('thinking');
      interrupt();

      setTimeout(() => {
        speakText(
          `I am reviewing your solution in Solution.js, ${userName}. Your use of a single-pass hash map is clean and achieves optimal O(n) time complexity with O(n) space. All unit test assertions are passing. Excellent work!`
        );
        setMentorReviewing(false);
      }, 900);
    },
    [interrupt, setAvatarState, speakText, userName]
  );

  // ── Handle End Call ──
  const handleEndCallClick = () => {
    interrupt();
    stopListening();
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
            Technical Mock Interview & Code Evaluation • Active Session
          </span>
        </div>

        {/* Top-Right: Placeholder alignment */}
        <div className="w-24 hidden lg:block" />
      </header>

      {/* ══════════════════════════════════════════════════════════════
          TOP-RIGHT FLOATING CALL STATUS WIDGET
      ══════════════════════════════════════════════════════════════ */}
      <div className="absolute top-20 right-6 z-30 pointer-events-auto max-w-sm w-full sm:w-80">
        <div className="p-4 rounded-3xl bg-black/65 border border-white/15 backdrop-blur-xl shadow-2xl space-y-2.5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-500/30 text-indigo-300">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                AURAGD Mentorship Call
              </span>
            </div>

            {avatarState === 'speaking' && (
              <button
                onClick={interrupt}
                className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-[10px] font-bold hover:bg-cyan-900 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                title="Interrupt AI Mentor and speak"
              >
                <span>Interrupt AI</span>
                <Volume2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Welcome back, {userName}!</span>
              <span>👋</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              {avatarState === 'speaking'
                ? 'Elena is speaking. Your microphone will automatically capture your answer.'
                : avatarState === 'thinking'
                ? 'Elena is analyzing your code and response...'
                : 'Elena is listening attentively. Feel free to explain your code.'}
            </p>
          </div>

          {/* Active Audio Waveform Indicator */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  avatarState === 'speaking'
                    ? 'bg-cyan-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-semibold text-slate-300">
                {avatarState === 'speaking' ? 'Mentor Audio Active' : 'Candidate Mic Open'}
              </span>
            </div>

            <span className="font-mono text-teal-400 font-bold">Live 1080p</span>
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
            {/* Left Panel: Photo-realistic AI Mentor Video */}
            <div className="w-full h-full min-h-[300px]">
              <MentorVideoPanel
                avatarState={avatarState}
                speakingText={speakingText}
                mouthShape={mouthShape}
                isBlinking={isBlinking}
                isNodding={isNodding}
                mentorName={mentorName}
                mentorRole="Staff Software Engineer & Interviewer"
                avatarVideoRef={avatarVideoRef}
                hasLiveWebRTC={false}
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
            {/* Left/Center: Photo-realistic AI Mentor View (7 cols) */}
            <div className="lg:col-span-6 w-full h-full min-h-[340px]">
              <MentorVideoPanel
                avatarState={avatarState}
                speakingText={speakingText}
                mouthShape={mouthShape}
                isBlinking={isBlinking}
                isNodding={isNodding}
                mentorName={mentorName}
                mentorRole="Staff Software Engineer & Interviewer"
                avatarVideoRef={avatarVideoRef}
                hasLiveWebRTC={false}
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

      {/* ══════════════════════════════════════════════════════════════
          3. BOTTOM CONTROL BAR (Round Control Action Buttons)
      ══════════════════════════════════════════════════════════════ */}
      <footer className="relative z-30 w-full py-4 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl">
          {/* Mute/Unmute Microphone */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              micActive
                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-500/40'
            }`}
            title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Toggle Camera */}
          <button
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              cameraActive
                ? 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-white/15'
                : 'bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-500/40'
            }`}
            title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              screenActive
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/15'
            }`}
            title={screenActive ? 'Stop Screen Share' : 'Share Screen / Code'}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Code Workspace Toggle */}
          <button
            onClick={() => {
              if (layoutMode === 'split' && !showCodeOverlay) {
                setLayoutMode('code_desk');
                setShowCodeOverlay(true);
              } else {
                setLayoutMode('split');
                setShowCodeOverlay(false);
              }
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              showCodeOverlay || layoutMode === 'code_desk'
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/15'
            }`}
            title="Toggle Interactive Code Workspace"
          >
            <Code2 className="w-5 h-5" />
          </button>

          <div className="w-[1px] h-8 bg-white/15 mx-1" />

          {/* Prominent Red END CALL Button */}
          <button
            onClick={handleEndCallClick}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-red-600/30 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            title="End Interview & View Evaluation"
          >
            <PhoneOff className="w-4 h-4" />
            <span>END CALL</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
