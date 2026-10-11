import React, { useState, useCallback, useRef, useEffect } from 'react';

import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Dashboard/Sidebar';
import ThreeAvatar from './components/AuraGD/ThreeAvatar';
import WebcamPIP from './components/AuraGD/WebcamPIP';
import ControlDock from './components/AuraGD/ControlDock';
import PostureAlertBadge from './components/AuraGD/PostureAlertBadge';
import ScoreModal from './components/AuraGD/ScoreModal';
import ErrorBoundary from './components/ErrorBoundary';

import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useWebcam } from './hooks/useWebcam';
import { useVisionPostureTracker } from './hooks/useVisionPostureTracker';

import {
  getAIResponse,
  MODES,
  resetConversation,
  getCurrentTopic,
  getSmartMorningGreeting,
  generateCongratulationsSpeech,
} from './utils/aiResponses';
import { calculateScores } from './utils/scoreCalculator';
import { recordNewSession } from './utils/progressHistory';

export default function App() {
  const userName = 'Pragya';

  // ── Navigation & View State: 'dashboard' | 'arena'
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentMode, setCurrentMode] = useState(MODES.PRESENTATION);

  // ── Call & Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hasStartedVoice, setHasStartedVoice] = useState(false);

  // ── STT & TTS Coordination Refs
  const startListeningRef = useRef(null);
  const stopListeningRef = useRef(null);

  // ── Screen Share State
  const [screenActive, setScreenActive] = useState(false);
  const screenVideoRef = useRef(null);
  const screenStreamRef = useRef(null);

  // ── Posture HUD Alert State
  const [postureAlert, setPostureAlert] = useState(null);
  const postureCountRef = useRef(0);

  // ── Score Modal State
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scores, setScores] = useState(null);

  // ── Session Metrics Tracking (in background)
  const statsRef = useRef({ turnCount: 0, wordCounts: [], totalWords: 0, fillersCount: 0 });

  // ── Webcam Hook (Enlarged Candidate Camera)
  const { videoRef, isActive: cameraActive, hasPermission, toggleCamera } = useWebcam(true);

  // ── Real-Time Vision Posture & Mistake Detection Hook
  useVisionPostureTracker({
    videoRef,
    isActive: cameraActive && currentView === 'arena',
    onAlert: (alertMsg) => {
      setPostureAlert(alertMsg);
      postureCountRef.current++;
    },
    intervalMs: 3800,
  });

  // ── Natural TTS Hook
  const { speak, stop: stopTTS } = useSpeechSynthesis({
    onStart: () => {
      setIsSpeaking(true);
      setIsThinking(false);
    },
    onEnd: () => {
      setIsSpeaking(false);
      // Auto-resume continuous listening when AI finishes speaking in arena
      if (currentView === 'arena' && !showScoreModal) {
        startListeningRef.current?.();
        setIsListening(true);
      }
    },
  });

  // ── AI Response Trigger
  const triggerAIResponse = useCallback((speechText) => {
    setIsThinking(true);
    setIsListening(false);

    // Track filler words count
    const fillers = (speechText.toLowerCase().match(/\b(umm|um|uh|uhh|like|actually|basically)\b/g) || []).length;
    statsRef.current.fillersCount += fillers;

    setTimeout(() => {
      const reply = getAIResponse(speechText, currentMode, userName);
      speak(reply);
    }, 380);
  }, [currentMode, speak, userName]);

  // ── STT Hook (With Real-time Voice Volume & Silence Debounce)
  const { startListening, stopListening, audioLevel, isSupported: sttSupported } = useSpeechRecognition({
    onResult: (finalText) => {
      if (!finalText || !finalText.trim()) return;

      const words = finalText.trim().split(/\s+/).length;
      statsRef.current.turnCount++;
      statsRef.current.wordCounts.push(words);
      statsRef.current.totalWords += words;

      stopListeningRef.current?.();
      setIsListening(false);
      triggerAIResponse(finalText);
    },

    onEnd: () => {
      if (!isSpeaking && !showScoreModal && hasStartedVoice && currentView === 'arena') {
        setIsListening(true);
      }
    },
  });

  startListeningRef.current = startListening;
  stopListeningRef.current = stopListening;

  // ── Enter Arena View ("kebal bo and me dheku")
  const handleStartArena = useCallback((modeId) => {
    setCurrentMode(modeId);
    setCurrentView('arena');
    setHasStartedVoice(true);
    stopTTS();

    let announcement = '';
    if (modeId === MODES.PRESENTATION) {
      announcement = `Welcome ${userName} to the Project Presentation Arena! Walk me through your architecture and technical stack whenever you are ready. You can also share your slides. I am listening attentively.`;
    } else if (modeId === MODES.SELF_INTRO) {
      announcement = `Welcome ${userName} to the Self Introduction Arena. Please introduce yourself naturally. I will evaluate your opening, structure, and eliminate filler words.`;
    } else if (modeId === MODES.CASUAL) {
      announcement = `Welcome to Casual Talk ${userName}. Take a calm breath. If you are feeling placement anxiety or stress, feel free to talk. I am here as your friend.`;
    } else {
      announcement = `Welcome to the Group Discussion Arena. Today's debate topic is: "${getCurrentTopic()}". Share your perspective whenever you are ready.`;
    }

    setTimeout(() => {
      speak(announcement, () => {
        startListening();
        setIsListening(true);
      });
    }, 400);
  }, [speak, startListening, stopTTS, userName]);

  // ── Return to Dashboard
  const handleBackToDashboard = useCallback(() => {
    stopListening();
    stopTTS();
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
    setCurrentView('dashboard');
  }, [stopListening, stopTTS]);

  // ── Screen Share Toggle
  const toggleScreenShare = useCallback(async () => {
    if (screenActive) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      setScreenActive(false);
    } else {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen sharing is not supported in this browser.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
          await screenVideoRef.current.play();
        }
        setScreenActive(true);

        stream.getVideoTracks()[0].onended = () => {
          setScreenActive(false);
          screenStreamRef.current = null;
        };
      } catch (err) {
        console.warn('Screen share cancelled or not allowed:', err);
      }
    }
  }, [screenActive]);

  // ── Mic Toggle Handler
  const handleToggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      stopTTS();
      startListening();
      setIsListening(true);
      setHasStartedVoice(true);
    }
  }, [isListening, startListening, stopListening, stopTTS]);

  // ── Mode Switch within Arena
  const handleSelectMode = useCallback((newMode) => {
    setCurrentMode(newMode);
    stopTTS();

    let verbalAnnouncement = '';
    if (newMode === MODES.PRESENTATION) {
      verbalAnnouncement = 'Switched to Project Presentation mode. Walk me through your architecture and technical stack whenever you are ready.';
    } else if (newMode === MODES.SELF_INTRO) {
      verbalAnnouncement = 'Switched to Self Introduction mode. Introduce yourself comfortably.';
    } else if (newMode === MODES.CASUAL) {
      verbalAnnouncement = 'Switched to Casual Talk mode. Take a deep breath.';
    } else {
      verbalAnnouncement = `Switched to Group Discussion mode. Our theme is: "${getCurrentTopic()}".`;
    }

    setTimeout(() => {
      speak(verbalAnnouncement, () => {
        startListening();
        setIsListening(true);
      });
    }, 200);
  }, [speak, startListening, stopTTS]);

  // ── End Arena Call & Trigger Verbal Congratulations
  const handleEndCall = useCallback(() => {
    stopListening();
    stopTTS();
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setScreenActive(false);

    const { turnCount, wordCounts, totalWords, fillersCount } = statsRef.current;
    const avgWordsPerTurn = wordCounts.length > 0 ? Math.round(totalWords / wordCounts.length) : 15;

    const computed = calculateScores({
      turnCount: Math.max(turnCount, 1),
      wordCounts,
      avgWordsPerTurn,
      mode: currentMode,
      postureAlertCount: postureCountRef.current,
    });

    // Save session to Date-Wise Progress History
    recordNewSession({
      mode: currentMode,
      score: computed.overall,
      eyeContact: computed.eyeContact || computed.deliveryAndGaze || 88,
      fillers: Math.max(fillersCount, 1),
    });

    setScores(computed);
    setShowScoreModal(true);

    // AI Speaks Verbal Congratulations Out Loud
    const congratsSpeech = generateCongratulationsSpeech(currentMode, computed.overall, userName);
    setTimeout(() => {
      speak(congratsSpeech);
    }, 500);
  }, [currentMode, speak, stopListening, stopTTS, userName]);

  // ── Replay AI Congratulations Speech
  const handleReplayCongratulations = useCallback(() => {
    if (scores) {
      const congratsSpeech = generateCongratulationsSpeech(currentMode, scores.overall, userName);
      speak(congratsSpeech);
    }
  }, [currentMode, scores, speak, userName]);

  // ── Close Score Modal & Return to Dashboard
  const handleCloseScoreModal = useCallback(() => {
    setShowScoreModal(false);
    setScores(null);
    statsRef.current = { turnCount: 0, wordCounts: [], totalWords: 0, fillersCount: 0 };
    postureCountRef.current = 0;
    resetConversation();
    setCurrentView('dashboard');
  }, []);

  // ── Voice Ambient Edge Glow
  const edgeGlowClass = isListening
    ? 'voice-edge-listening'
    : isSpeaking
    ? 'voice-edge-speaking'
    : '';

  return (
    <div className={`relative w-full h-full min-h-screen overflow-hidden bg-[#070b12] text-slate-100 select-none ${edgeGlowClass}`}>

      {/* ══════════════════════════════════════════════════════════════
          VIEW 1: DASHBOARD VIEW (With Syllabus Engine & Consistency Table)
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'dashboard' && (
        <div className="w-full h-screen flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={(viewId) => setCurrentView(viewId)}
            onStartArena={handleStartArena}
          />

          {/* Main Dashboard Content */}
          <Dashboard
            onStartArena={handleStartArena}
            cameraActive={cameraActive}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW 2: ARENA 1-ON-1 CALL VIEW ("kebal bo and me dheku")
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'arena' && (
        <div className="w-full h-screen relative overflow-hidden">
          {/* Top Minimal HUD with Arena Status & Back to Dashboard */}
          <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToDashboard}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>←</span>
                <span>Dashboard</span>
              </button>

              <div className="text-xl font-black tracking-tight leading-none ml-2">
                <span className="text-white">Aura</span>
                <span className="text-teal-400">GD</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-[10px] font-bold tracking-widest uppercase">
                {currentMode === MODES.PRESENTATION
                  ? 'Project Presentation Arena'
                  : currentMode === MODES.SELF_INTRO
                  ? 'Self Introduction Arena'
                  : currentMode === MODES.CASUAL
                  ? 'Casual Talk Arena'
                  : 'Group Discussion Arena'}
              </span>
            </div>

            {/* Live Status Pill with Speech Detection Alert */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs font-semibold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking
                      ? 'bg-cyan-400 pulse-dot'
                      : isListening
                      ? 'bg-emerald-400 pulse-dot'
                      : isThinking
                      ? 'bg-sky-400 pulse-dot'
                      : 'bg-slate-500'
                  }`}
                />
                <span
                  className={
                    isSpeaking
                      ? 'text-cyan-300 font-bold'
                      : isListening
                      ? 'text-emerald-300 font-bold'
                      : isThinking
                      ? 'text-sky-300'
                      : 'text-slate-400'
                  }
                >
                  {isSpeaking
                    ? 'AI Speaking...'
                    : isListening
                    ? audioLevel > 15
                      ? 'Listening to you (Speech detected)...'
                      : 'Listening to you...'
                    : isThinking
                    ? 'AI Thinking...'
                    : 'Standby'}
                </span>
              </div>
            </div>
          </header>

          {/* Full-Screen 3D Robot Evaluator ("bo") */}
          <main className="w-full h-full absolute inset-0 z-10">
            <ErrorBoundary>
              <ThreeAvatar
                isSpeaking={isSpeaking}
                isListening={isListening}
                isThinking={isThinking}
              />
            </ErrorBoundary>
          </main>

          {/* Vision Posture Alert Badge HUD (Slouching, Face-Touch, Gaze) */}
          <PostureAlertBadge
            alert={postureAlert}
            onDismiss={() => setPostureAlert(null)}
          />

          {/* Floating Bottom Control Dock */}
          <ControlDock
            currentMode={currentMode}
            onSelectMode={handleSelectMode}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleMic={handleToggleMic}
            cameraActive={cameraActive}
            onToggleCamera={toggleCamera}
            screenActive={screenActive}
            onToggleScreenShare={toggleScreenShare}
            onEndCall={handleEndCall}
            onBackToDashboard={handleBackToDashboard}
            audioLevel={audioLevel}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ENLARGED CANDIDATE WEBCAM PIP ("me") - Always visible in both views
      ══════════════════════════════════════════════════════════════ */}
      <WebcamPIP
        videoRef={videoRef}
        isActive={cameraActive}
        hasPermission={hasPermission}
        screenVideoRef={screenVideoRef}
        screenActive={screenActive}
      />

      {/* ══════════════════════════════════════════════════════════════
          PERFORMANCE EVALUATION REPORT MODAL WITH VERBAL CONGRATULATIONS
      ══════════════════════════════════════════════════════════════ */}
      {showScoreModal && (
        <ScoreModal
          scores={scores}
          onClose={handleCloseScoreModal}
          onReplayCongratulations={handleReplayCongratulations}
        />
      )}
    </div>
  );
}
