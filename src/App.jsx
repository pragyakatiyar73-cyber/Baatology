import React, { useState, useCallback, useRef } from 'react';

import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Dashboard/Sidebar';
import HistoryView from './components/Dashboard/HistoryView';
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

  // ── Navigation State: 'dashboard' | 'history' | 'arena'
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentMode, setCurrentMode] = useState(MODES.PRESENTATION);

  // ── Voice & Audio Call State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hasStartedVoice, setHasStartedVoice] = useState(false);

  // ── Stable Hook Coordination Refs
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

  // ── Metrics Tracking in background
  const statsRef = useRef({ turnCount: 0, wordCounts: [], totalWords: 0, fillersCount: 0 });

  // ── Internal Spoken Speech Memory (Zero-Text: never rendered to DOM)
  const spokenMemoryRef = useRef('');

  // ── Webcam Hook
  const { videoRef, stream, isActive: cameraActive, hasPermission, error: cameraError, toggleCamera } = useWebcam(true);

  // ── Real-Time Vision Posture & Mistake Detection Hook (Feature 3)
  const { getEyeContactPercentage, resetTelemetry } = useVisionPostureTracker({
    videoRef,
    isActive: cameraActive && currentView === 'arena',
    onAlert: (alertMsg) => {
      setPostureAlert(alertMsg);
      postureCountRef.current++;
    },
    intervalMs: 500,
  });

  const lastAITextRef = useRef('');

  // ── Natural TTS Hook
  const { speak, stop: stopTTS } = useSpeechSynthesis({
    onStart: () => {
      setIsSpeaking(true);
      setIsThinking(false);
      // Immediately stop listening so the microphone doesn't capture the AI's own speaker output
      stopListeningRef.current?.();
      setIsListening(false);
      spokenMemoryRef.current = '';
    },
    onEnd: () => {
      setIsSpeaking(false);
      // Automatically reactivate microphone listener and set 3D Robot state to 'LISTENING'
      if (currentView === 'arena' && !showScoreModal) {
        setTimeout(() => {
          startListeningRef.current?.();
          setIsListening(true);
        }, 600);
      }
    },
  });

  // ── AI Response Trigger
  const triggerAIResponse = useCallback((speechText) => {
    // If AI is currently speaking, completely ignore any audio input
    if (isSpeaking) {
      console.debug('[Echo Filter] Discarded sound captured while AI was speaking');
      return;
    }

    const cleaned = speechText.trim();
    if (!cleaned) return;

    // Check if what was heard is just an echo of the AI's own last spoken statement
    const recentAI = lastAITextRef.current.toLowerCase();
    if (recentAI && (recentAI.includes(cleaned.toLowerCase()) || cleaned.toLowerCase().includes(recentAI.slice(0, 25)))) {
      console.debug('[Echo Filter] Discarded self-echo of previous AI speech:', cleaned);
      return;
    }

    setIsThinking(true);
    setIsListening(false);
    spokenMemoryRef.current = '';

    // Track filler words count
    const fillers = (cleaned.toLowerCase().match(/\b(umm|um|uh|uhh|like|actually|basically)\b/g) || []).length;
    statsRef.current.fillersCount += fillers;

    setTimeout(() => {
      const reply = getAIResponse(cleaned, currentMode, userName);
      lastAITextRef.current = reply;
      speak(reply);
    }, 380);
  }, [currentMode, isSpeaking, speak, userName]);

  // ── STT Hook (webkitSpeechRecognition continuous listening in background)
  const { startListening, stopListening, audioLevel, isSupported: sttSupported } = useSpeechRecognition({
    onInterim: (text) => {
      spokenMemoryRef.current = text;
    },
    onResult: (finalText) => {
      spokenMemoryRef.current = '';
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

  // ── Interrupt AI and speak immediately
  const handleImmediateSpeak = useCallback(() => {
    stopTTS();
    startListeningRef.current?.();
    setIsListening(true);
    setHasStartedVoice(true);
  }, [stopTTS]);

  // ── Enter Arena View ("kebal bo and me dheku")
  const handleStartArena = useCallback((modeId) => {
    setCurrentMode(modeId);
    setCurrentView('arena');
    setHasStartedVoice(true);
    resetTelemetry();
    postureCountRef.current = 0;
    setPostureAlert(null);
    stopTTS();

    // ── Feature 4: Smart Time-Aware Greeting & Welcoming
    const greeting = getSmartMorningGreeting();

    // Seamless Audio Triggering: Consume the user gesture immediately to invoke speech synthesis
    speak(greeting, () => {
      // On utterance.onend (or fallback):
      // Smoothly switch 3D Robot to 'LISTENING' and automatically open the microphone stream
      startListeningRef.current?.();
      setIsListening(true);
    });
  }, [resetTelemetry, speak, stopTTS]);

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
    const measuredEyeContact = getEyeContactPercentage();

    const computed = calculateScores({
      turnCount: Math.max(turnCount, 1),
      wordCounts,
      avgWordsPerTurn,
      mode: currentMode,
      postureAlertCount: postureCountRef.current,
      eyeContactPercentage: measuredEyeContact,
    });

    // Save session to Date-Wise Progress History with tracked telemetry
    recordNewSession({
      mode: currentMode,
      score: computed.overall,
      eyeContact: measuredEyeContact,
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
    <div className={`relative w-full h-full min-h-screen overflow-hidden bg-[#0a0f1d] text-slate-100 select-none ${edgeGlowClass}`}>

      {/* ══════════════════════════════════════════════════════════════
          VIEWS: DASHBOARD / HISTORY
      ══════════════════════════════════════════════════════════════ */}
      {currentView !== 'arena' && (
        <div className="w-full h-screen flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={(viewId) => setCurrentView(viewId)}
            onStartArena={handleStartArena}
          />

          {/* Dynamic Content Views */}
          {currentView === 'dashboard' && (
            <Dashboard
              onStartArena={handleStartArena}
              onNavigate={(viewId) => setCurrentView(viewId)}
              cameraActive={cameraActive}
            />
          )}

          {currentView === 'history' && (
            <HistoryView onStartArena={handleStartArena} />
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW: ARENA 1-ON-1 CALL VIEW ("kebal bo and me dheku")
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'arena' && (
        <div className="w-full h-screen relative overflow-hidden">
          {/* ── Top Minimal Floating Controls ── */}
          {/* Top-Left: Minimal Return Button */}
          <div className="absolute top-6 left-6 z-30 pointer-events-auto">
            <button
              onClick={handleBackToDashboard}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md"
              title="Return to Dashboard"
            >
              <span>←</span>
              <span>Dashboard</span>
            </button>
          </div>

          {/* Top-Right: Subtle Minimal Floating Voice HUD Pill */}
          <div className="absolute top-6 right-6 z-30 pointer-events-auto flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={handleImmediateSpeak}
                className="px-3 py-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 backdrop-blur-md"
                title="Interrupt AI and speak right away"
              >
                <span>Tap to Speak</span>
                <span>🎙️</span>
              </button>
            )}

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-xl text-xs font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking
                    ? 'bg-cyan-400 pulse-dot shadow-[0_0_8px_#00e5ff]'
                    : isListening
                    ? 'bg-emerald-400 pulse-dot shadow-[0_0_8px_#10b981]'
                    : isThinking
                    ? 'bg-sky-400 pulse-dot shadow-[0_0_8px_#38bdf8]'
                    : 'bg-emerald-400'
                }`}
              />
              <span
                className={
                  isSpeaking
                    ? 'text-cyan-300'
                    : isListening
                    ? 'text-emerald-300'
                    : isThinking
                    ? 'text-sky-300'
                    : 'text-slate-300'
                }
              >
                {isSpeaking ? 'AI Speaking...' : isListening ? '● Listening...' : '● AI Voice Active'}
              </span>
            </div>
          </div>

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
        stream={stream}
        isActive={cameraActive}
        hasPermission={hasPermission}
        error={cameraError}
        screenVideoRef={screenVideoRef}
        screenActive={screenActive}
        onToggleCamera={toggleCamera}
        hasMistake={!!postureAlert}
        alert={postureAlert}
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
