import React, { useState, useCallback, useRef, useEffect } from 'react';

import ThreeAvatar from './components/AuraGD/ThreeAvatar';
import WebcamPIP from './components/AuraGD/WebcamPIP';
import ControlDock from './components/AuraGD/ControlDock';
import PostureAlertBadge from './components/AuraGD/PostureAlertBadge';
import ScoreModal from './components/AuraGD/ScoreModal';
import ErrorBoundary from './components/ErrorBoundary';

import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useWebcam } from './hooks/useWebcam';

import { getAIResponse, MODES, resetConversation, getCurrentTopic } from './utils/aiResponses';
import { calculateScores } from './utils/scoreCalculator';

export default function App() {
  // ── Call & Mode State
  const [currentMode, setCurrentMode] = useState(MODES.PRESENTATION);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hasStartedVoice, setHasStartedVoice] = useState(false);

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

  // ── Session Metrics Tracking (Zero-text in background)
  const statsRef = useRef({ turnCount: 0, wordCounts: [], totalWords: 0 });

  // ── Webcam Hook
  const { videoRef, isActive: cameraActive, hasPermission, toggleCamera } = useWebcam(true);

  // ── Natural TTS Hook
  const { speak, stop: stopTTS } = useSpeechSynthesis({
    onStart: () => {
      setIsSpeaking(true);
      setIsThinking(false);
    },
    onEnd: () => {
      setIsSpeaking(false);
      // Automatically resume continuous listening once AI finishes speaking
      startListening();
      setIsListening(true);
    },
  });

  // ── AI Response Trigger
  const triggerAIResponse = useCallback((speechText) => {
    setIsThinking(true);
    setIsListening(false);

    // Natural processing pause (300-500ms)
    setTimeout(() => {
      const reply = getAIResponse(speechText, currentMode);
      speak(reply);
    }, 400);
  }, [currentMode, speak]);

  // ── STT Hook (Continuous Background Recognition)
  const { startListening, stopListening, isSupported: sttSupported } = useSpeechRecognition({
    onResult: useCallback((finalText) => {
      if (!finalText || !finalText.trim()) return;

      const words = finalText.trim().split(/\s+/).length;
      statsRef.current.turnCount++;
      statsRef.current.wordCounts.push(words);
      statsRef.current.totalWords += words;

      stopListening();
      setIsListening(false);
      triggerAIResponse(finalText);
    }, [stopListening, triggerAIResponse]),

    onEnd: () => {
      // Keep listening unless AI is speaking or modal is open
      if (!isSpeaking && !showScoreModal && hasStartedVoice) {
        setIsListening(true);
      }
    },
  });

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
        alert('Screen sharing is not supported in this browser environment.');
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

  // ── Mode Switch Handler
  const handleSelectMode = useCallback((newMode) => {
    setCurrentMode(newMode);
    stopTTS();

    let verbalAnnouncement = '';
    if (newMode === MODES.PRESENTATION) {
      verbalAnnouncement = 'Switched to Project Presentation mode. Walk me through your architecture and technical stack whenever you are ready. I am listening.';
    } else if (newMode === MODES.SELF_INTRO) {
      verbalAnnouncement = 'Switched to Self Introduction mode. Introduce yourself comfortably, and I will share structured verbal coaching.';
    } else if (newMode === MODES.CASUAL) {
      verbalAnnouncement = 'Switched to Casual Talk mode. Take a deep breath. We can have a relaxed, supportive conversation.';
    } else {
      verbalAnnouncement = `Switched to Group Discussion mode. Our theme is: "${getCurrentTopic()}". Share your perspective whenever you are ready.`;
    }

    setTimeout(() => {
      speak(verbalAnnouncement);
    }, 200);
  }, [speak, stopTTS]);

  // ── End Call Handler
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

    const { turnCount, wordCounts, totalWords } = statsRef.current;
    const avgWordsPerTurn = wordCounts.length > 0 ? Math.round(totalWords / wordCounts.length) : 12;

    const computed = calculateScores({
      turnCount: Math.max(turnCount, 1),
      wordCounts,
      avgWordsPerTurn,
      mode: currentMode,
      postureAlertCount: postureCountRef.current,
    });

    setScores(computed);
    setShowScoreModal(true);
  }, [currentMode, stopListening, stopTTS]);

  // ── Restart Session
  const handleCloseScoreModal = useCallback(() => {
    setShowScoreModal(false);
    setScores(null);
    statsRef.current = { turnCount: 0, wordCounts: [], totalWords: 0 };
    postureCountRef.current = 0;
    resetConversation();

    const welcomeMsg = 'Welcome back! Let us begin a fresh session. What would you like to explore next?';
    speak(welcomeMsg);
  }, [speak]);

  // ── Periodic Smart Posture / Gaze Simulation Check
  useEffect(() => {
    const postureInterval = setInterval(() => {
      if (cameraActive && Math.random() < 0.22 && !showScoreModal) {
        const alerts = [
          'Steady Eye Contact: Keep looking directly at the camera lens',
          'Avoid touching your face while speaking',
          'Sit upright with relaxed shoulders for confident presence',
        ];
        const chosen = alerts[Math.floor(Math.random() * alerts.length)];
        setPostureAlert(chosen);
        postureCountRef.current++;
      }
    }, 38000);

    return () => clearInterval(postureInterval);
  }, [cameraActive, showScoreModal]);

  // ── Initial Verbal Greeting On Load
  useEffect(() => {
    const initialGreeting =
      'Good morning! How has your day been going so far? I am right here with you. What would you like to talk about today?';

    const timer = setTimeout(() => {
      speak(initialGreeting, () => {
        setHasStartedVoice(true);
        startListening();
        setIsListening(true);
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Active Voice Edge Ambience
  const edgeGlowClass = isListening
    ? 'voice-edge-listening'
    : isSpeaking
    ? 'voice-edge-speaking'
    : '';

  return (
    <div className={`relative w-full h-full min-h-screen overflow-hidden bg-[#070b12] text-slate-100 select-none ${edgeGlowClass}`}>

      {/* ════════════════════ TOP MINIMAL NAV / HUD ════════════════════ */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="text-xl font-black tracking-tight leading-none">
            <span className="text-white">Aura</span>
            <span className="text-teal-400">GD</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-[10px] font-bold tracking-widest uppercase">
            Voice Call Active
          </span>
        </div>

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
                  ? 'text-cyan-300'
                  : isListening
                  ? 'text-emerald-300'
                  : isThinking
                  ? 'text-sky-300'
                  : 'text-slate-400'
              }
            >
              {isSpeaking
                ? 'AI Speaking...'
                : isListening
                ? 'Listening to you...'
                : isThinking
                ? 'AI Thinking...'
                : 'Standby'}
            </span>
          </div>
        </div>
      </header>

      {/* ════════════════════ FULL-SCREEN 3D ROBOT VIEWPORT ════════════════════ */}
      <main className="w-full h-full absolute inset-0 z-10">
        <ErrorBoundary>
          <ThreeAvatar
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
          />
        </ErrorBoundary>
      </main>

      {/* ════════════════════ POSTURE ALERT BADGE (Minimal HUD) ════════════════════ */}
      <PostureAlertBadge
        alert={postureAlert}
        onDismiss={() => setPostureAlert(null)}
      />

      {/* ════════════════════ FLOATING PICTURE-IN-PICTURE WEBCAM & SCREEN ════════════════════ */}
      <WebcamPIP
        videoRef={videoRef}
        isActive={cameraActive}
        hasPermission={hasPermission}
        screenVideoRef={screenVideoRef}
        screenActive={screenActive}
      />

      {/* ════════════════════ FLOATING BOTTOM GLASSMORPHISM CONTROL DOCK ════════════════════ */}
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
      />

      {/* ════════════════════ PERFORMANCE EVALUATION REPORT MODAL ════════════════════ */}
      {showScoreModal && (
        <ScoreModal scores={scores} onClose={handleCloseScoreModal} />
      )}
    </div>
  );
}
