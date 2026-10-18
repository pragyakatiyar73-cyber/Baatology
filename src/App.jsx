import React, { useState, useCallback, useRef } from 'react';

import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Dashboard/Sidebar';
import HistoryView from './components/Dashboard/HistoryView';
import ThreeAvatar from './components/AuraGD/ThreeAvatar';
import HeyGenMentorAvatar from './components/AuraGD/HeyGenMentorAvatar';
import WebcamPIP from './components/AuraGD/WebcamPIP';
import ControlDock from './components/AuraGD/ControlDock';
import PostureAlertBadge from './components/AuraGD/PostureAlertBadge';
import ScoreModal from './components/AuraGD/ScoreModal';
import ErrorBoundary from './components/ErrorBoundary';
import StudentPracticeRoom from './components/PracticeRoom/StudentPracticeRoom';
import SettingsModal from './components/PracticeRoom/SettingsModal';
import LoginModal from './components/Dashboard/LoginModal';
import DualVideoMentorshipRoom from './components/Mentorship/DualVideoMentorshipRoom';
import PresentationStudio from './components/Presentation/PresentationStudio';
import GroupDiscussionStudio from './components/GDStudio/GroupDiscussionStudio';
import { fireLoginCelebration, speakWelcomeGreeting } from './utils/celebration';

import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useWebcam } from './hooks/useWebcam';
import { useVisionPostureTracker } from './hooks/useVisionPostureTracker';

import {
  getAIResponse,
  analyzeSelfIntro,
  analyzeProjectPitch,
  analyzeGDArgument,
  MODES,
  resetConversation,
  getCurrentTopic,
  getSmartMorningGreeting,
  generateCongratulationsSpeech,
  GD_PLACEMENT_TOPIC,
  GD_ROBOT_OPENING,
  GD_ROBOT_COUNTER_ARGUMENT,
  constructVerbalReinforcement,
  CASUAL_ROBOT_WELCOME,
  analyzeCasualWellness,
} from './utils/aiResponses';
import { getChatGPTConversationalResponse } from './utils/chatGptAssistant';
import { unblockSpeechAutoplay } from './utils/femaleVoiceManager';
import { calculateScores } from './utils/scoreCalculator';
import { recordNewSession } from './utils/progressHistory';

export default function App() {
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem('aura_gd_candidate_name') || 'Pragya';
    } catch (e) {
      return 'Pragya';
    }
  });

  // ── Login / Welcome Celebration Modal State
  const [showLoginModal, setShowLoginModal] = useState(() => {
    try {
      return !localStorage.getItem('aura_gd_has_logged_in');
    } catch (e) {
      return false;
    }
  });

  // ── Navigation State: 'dashboard' | 'history' | 'arena'
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentMode, setCurrentMode] = useState(MODES.PRESENTATION);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── Login Completion & Celebration Handlers
  const handleLoginSuccess = useCallback((name) => {
    setUserName(name);
    setShowLoginModal(false);
    try {
      localStorage.setItem('aura_gd_candidate_name', name);
      localStorage.setItem('aura_gd_has_logged_in', 'true');
    } catch (e) {
      console.debug('Failed to persist login session:', e);
    }
  }, []);

  const handleManualCelebration = useCallback(() => {
    speakWelcomeGreeting(userName);
    fireLoginCelebration();
  }, [userName]);

  // ── Feature 9: Exit Sequence State ('CONCLUDING') & Celebratory Banner
  const [isConcluding, setIsConcluding] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState(null);
  const conclusionTimerRef = useRef(null);

  // ── Voice & Audio Call State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentThought, setCurrentThought] = useState('');
  const [showThoughtDetails, setShowThoughtDetails] = useState(false);
  const [hasStartedVoice, setHasStartedVoice] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualInputText, setManualInputText] = useState('');

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

  const currentViewRef = useRef(currentView);
  currentViewRef.current = currentView;
  const showScoreModalRef = useRef(showScoreModal);
  showScoreModalRef.current = showScoreModal;

  // ── Webcam Hook
  const { videoRef, stream, isActive: cameraActive, hasPermission, error: cameraError, toggleCamera, startCamera } = useWebcam(true);

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
  const conversationHistoryRef = useRef([]);
  const latestSelfIntroAnalysisRef = useRef(null);
  const latestProjectPitchAnalysisRef = useRef(null);
  const projectPitchTurnRef = useRef(0);

  // ── Group Discussion Debate Engine State (Feature 7)
  const [gdTurnChoice, setGdTurnChoice] = useState(null); // null | 'user' | 'robot'
  const gdTurnRef = useRef(0);
  const latestGDAnalysisRef = useRef(null);
  const gdSpeakingSecondsRef = useRef(0);
  const [gdTopic, setGdTopic] = useState(GD_PLACEMENT_TOPIC);

  // ── Live Speech & Subtitle States (Instant Speech Transcription & Listing)
  const [liveTranscript, setLiveTranscript] = useState('');
  const [aiSpeechSubtitle, setAiSpeechSubtitle] = useState('');
  const heygenAvatarRef = useRef(null);

  // ── Natural TTS Hook (Fallback for Non-HeyGen views)
  const { speak: rawSpeak, stop: stopTTS } = useSpeechSynthesis({
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
      // Automatically reactivate microphone listener and set mentor state to 'LISTENING'
      if (currentViewRef.current === 'arena' && !showScoreModalRef.current) {
        setTimeout(() => {
          setLiveTranscript('');
          startListeningRef.current?.();
          setIsListening(true);
        }, 400);
      }
    },
  });

  // Mentor Voice Response (Always speaks via rawSpeak with femaleVoiceManager & 3D visemes)
  const speak = useCallback((text, callback) => {
    setAiSpeechSubtitle(text);
    rawSpeak(text, callback);
  }, [rawSpeak]);

  // ── AI Response Trigger (ChatGPT Voice Mode with Thought & Reasoning)
  const triggerAIResponse = useCallback(async (speechText) => {
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

    // Record user speech into conversation history
    conversationHistoryRef.current.push({ role: 'user', content: cleaned });
    if (conversationHistoryRef.current.length > 14) {
      conversationHistoryRef.current = conversationHistoryRef.current.slice(-10);
    }

    // Check if user is asking a question, conversational inquiry, greeting, checking mic, or casual talk
    const isQuestionOrChat =
      cleaned.endsWith('?') ||
      currentMode === MODES.CASUAL ||
      /\b(what|how|why|where|when|who|which|can you|could you|tell me|explain|kya|kaise|kyun|batao|bata|bataiye|kaise ho|namaste|hello|hi|hey|tips|help|sun sakti|hear me|audible|your name|naam|who are you|mistake|grammar|correct|meaning|code|answer|solve|suno|kuch|question|sawal|define|check|difference|translate|reason|kaun|kab|kaha|kitna|kaisi|kaisa)\b/i.test(cleaned);

    // If it's a direct question, conversational query, or casual chat:
    if (isQuestionOrChat) {
      try {
        const result = await getChatGPTConversationalResponse(cleaned, {
          userName,
          currentMode,
          conversationHistory: conversationHistoryRef.current,
        });

        setCurrentThought(result.thoughtProcess);
        lastAITextRef.current = result.spokenText;
        conversationHistoryRef.current.push({ role: 'assistant', content: result.spokenText });

        setTimeout(() => {
          speak(result.spokenText);
        }, 450);
        return;
      } catch (err) {
        console.warn('[ChatGPT AI] Fallback:', err);
      }
    }

    // Mode-specific analysis: Project Presentation (Feature 6: STAR Framework & Tech Follow-up)
    if (currentMode === MODES.PRESENTATION) {
      const isFollowUp = projectPitchTurnRef.current >= 1;
      const priorTech = latestProjectPitchAnalysisRef.current?.detectedTech;
      const analysis = analyzeProjectPitch(cleaned, isFollowUp, priorTech, userName);
      latestProjectPitchAnalysisRef.current = analysis;
      projectPitchTurnRef.current += 1;

      const fillers = (cleaned.toLowerCase().match(/\b(umm|um|uh|uhh|like|actually|basically|you know)\b/g) || []).length;
      statsRef.current.fillersCount = (statsRef.current.fillersCount || 0) + fillers;

      setCurrentThought(`🧠 Step 1 (STAR Architecture Audit): Analyzed technical pitch structure.\n🧠 Step 2 (Tech Stack): Checked framework alignment and problem-solving impact.\n🧠 Step 3 (Coaching): Formulated constructive placement feedback.`);

      setTimeout(() => {
        lastAITextRef.current = analysis.feedback;
        speak(analysis.feedback);
      }, 450);
      return;
    }

    // Mode-specific analysis: Group Discussion (Feature 7: GD Debate Engine)
    if (currentMode === MODES.GD) {
      const words = cleaned.split(/\s+/).length;
      const approxDurationSec = Math.max(Math.round((words / 130) * 60), 6);
      gdSpeakingSecondsRef.current += approxDurationSec;

      const fillers = (cleaned.toLowerCase().match(/\b(umm|um|uh|uhh|like|actually|basically|you know)\b/g) || []).length;
      statsRef.current.fillersCount = (statsRef.current.fillersCount || 0) + fillers;

      const analysis = analyzeGDArgument(cleaned, gdTurnRef.current, userName);
      latestGDAnalysisRef.current = analysis;
      gdTurnRef.current += 1;

      setCurrentThought(`🧠 Step 1 (Debate Analysis): Evaluated argument structure on topic "${gdTopic}".\n🧠 Step 2 (Synthesis): Formulating supportive counter-perspective to stimulate active dialogue.\n🧠 Step 3 (Turn-Taking): Prompting next conversational point.`);

      setTimeout(() => {
        lastAITextRef.current = analysis.feedback;
        speak(analysis.feedback);
      }, 450);
      return;
    }

    // Mode-specific analysis: Self Introduction Evaluation & Mistake Detection (Feature 5)
    if (currentMode === MODES.SELF_INTRO) {
      const analysis = analyzeSelfIntro(cleaned, userName);
      latestSelfIntroAnalysisRef.current = analysis;
      statsRef.current.fillersCount = (statsRef.current.fillersCount || 0) + analysis.fillerCount;

      setCurrentThought(`🧠 Step 1 (Elevator Pitch Audit): Assessed Present-Past-Future coverage.\n🧠 Step 2 (Vocal Flaws): Detected opening phrasing and ${analysis.fillerCount} hesitation fillers.\n🧠 Step 3 (Action Plan): Providing clear recommendations for campus placement rounds.`);

      setTimeout(() => {
        lastAITextRef.current = analysis.feedback;
        speak(analysis.feedback);
      }, 450);
      return;
    }

    // Mode-specific analysis: Casual Talk & Empathetic Mental Wellness (Feature 8)
    if (currentMode === MODES.CASUAL) {
      const analysis = analyzeCasualWellness(cleaned, statsRef.current.turnCount, userName);
      statsRef.current.turnCount++;

      setCurrentThought(`🧠 Step 1 (Empathetic Listening): Detected student mood and emotional tone.\n🧠 Step 2 (Psychological Safety): Validating feelings with unconditional warmth.\n🧠 Step 3 (Caring Cadence): Providing gentle, grounded reassurance.`);

      setTimeout(() => {
        lastAITextRef.current = analysis.feedback;
        speak(analysis.feedback);
      }, 450);
      return;
    }

    // General Conversational Fallback via ChatGPT Assistant
    const fillers = (cleaned.toLowerCase().match(/\b(umm|um|uh|uhh|like|actually|basically|you know)\b/g) || []).length;
    statsRef.current.fillersCount = (statsRef.current.fillersCount || 0) + fillers;

    try {
      const chatResult = await getChatGPTConversationalResponse(cleaned, {
        userName,
        currentMode,
        conversationHistory: conversationHistoryRef.current,
      });
      setCurrentThought(chatResult.thoughtProcess);
      lastAITextRef.current = chatResult.spokenText;
      conversationHistoryRef.current.push({ role: 'assistant', content: chatResult.spokenText });
      setTimeout(() => {
        speak(chatResult.spokenText);
      }, 450);
    } catch (err) {
      const reply = getAIResponse(cleaned, currentMode, userName);
      lastAITextRef.current = reply;
      conversationHistoryRef.current.push({ role: 'assistant', content: reply });
      setTimeout(() => {
        speak(reply);
      }, 450);
    }
  }, [currentMode, gdTopic, isSpeaking, speak, userName]);

  // ── Manual Text Input Fallback Handler
  const handleManualTextSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!manualInputText.trim()) return;
    const text = manualInputText.trim();
    setManualInputText('');
    setShowTextInput(false);
    setLiveTranscript(text);
    triggerAIResponse(text);
  }, [manualInputText, triggerAIResponse]);

  // ── STT Hook (webkitSpeechRecognition continuous listening with VAD energy fallback)
  const {
    startListening,
    stopListening,
    commitSpeech,
    submitText,
    audioLevel,
    isSupported: sttSupported,
    permissionDenied: micPermissionDenied,
    language: speechLang,
    toggleLanguage: toggleSpeechLang,
    micNotice,
    clearMicNotice,
    retryListening,
  } = useSpeechRecognition({
    onInterim: (text) => {
      spokenMemoryRef.current = text;
      setLiveTranscript(text);
    },
    onResult: (finalText) => {
      spokenMemoryRef.current = '';
      if (!finalText || !finalText.trim()) return;

      setLiveTranscript(finalText);
      const words = finalText.trim().split(/\s+/).length;
      statsRef.current.turnCount++;
      statsRef.current.wordCounts.push(words);
      statsRef.current.totalWords += words;

      stopListeningRef.current?.();
      setIsListening(false);
      triggerAIResponse(finalText);
    },

    onEnd: () => {
      if (!isSpeaking && !showScoreModal && hasStartedVoice && currentViewRef.current === 'arena') {
        setIsListening(true);
      }
    },
  });

  startListeningRef.current = startListening;
  stopListeningRef.current = stopListening;

  // ── Interrupt AI and speak immediately
  const handleImmediateSpeak = useCallback(() => {
    unblockSpeechAutoplay();
    stopTTS();
    heygenAvatarRef.current?.interrupt();
    startListeningRef.current?.();
    setIsListening(true);
    setHasStartedVoice(true);
  }, [stopTTS]);

  // ── Turn-Taking Execution (Feature 7: Group Discussion)
  const handleGDTurnChoice = useCallback((choice) => {
    unblockSpeechAutoplay();
    setGdTurnChoice(choice);
    if (choice === 'user') {
      // 2. Turn-Taking Execution: If "I Will Start" is clicked:
      // Robot transitions to 'LISTENING' (green pulse aura). Candidate opens debate.
      stopTTS();
      setIsSpeaking(false);
      setIsThinking(false);
      setIsListening(true);
      startListeningRef.current?.();
    } else {
      // If "You Start First" is clicked:
      // Robot speaks the topic introduction and opening opinion:
      // "Welcome to today's GD on Agentic AI. While autonomous systems boost operational speed, ethical boundaries remain uncertain. Candidate, what is your stance on this?"
      // Robot then switches to 'LISTENING' with mic open.
      stopListeningRef.current?.();
      setIsListening(false);
      setIsThinking(false);
      setIsSpeaking(true);

      const openingSpeech = GD_ROBOT_OPENING;
      lastAITextRef.current = openingSpeech;
      speak(openingSpeech, () => {
        setIsSpeaking(false);
        setTimeout(() => {
          if (currentViewRef.current === 'arena') {
            startListeningRef.current?.();
            setIsListening(true);
          }
        }, 350);
      });
    }
  }, [speak, stopTTS]);

  // ── Enter Arena View ("kebal bo and me dheku")
  const handleStartArena = useCallback((modeId) => {
    unblockSpeechAutoplay();
    currentViewRef.current = 'arena';
    setCurrentMode(modeId);
    setCurrentView('arena');
    setHasStartedVoice(true);
    resetTelemetry();
    postureCountRef.current = 0;
    setPostureAlert(null);
    stopTTS();

    // Proactively activate candidate webcam upon entering the arena
    startCamera();

    // 1. Immediately set 3D Robot state to 'SPEAKING' with mouth movement and cyan visor pulsing
    setIsSpeaking(true);
    setIsListening(false);
    setIsThinking(false);

    // 2. Feature 6: Project Presentation initiation vs Feature 7: GD vs Feature 5: Self-Intro vs Feature 8: Casual vs Feature 4: Time-Aware Greeting
    let greeting = '';
    if (modeId === MODES.PRESENTATION) {
      greeting = "Welcome to Project Presentation. Please walk me through your engineering project, including the problem you solved, your tech stack, and the final results. I'm listening.";
      projectPitchTurnRef.current = 0;
      latestProjectPitchAnalysisRef.current = null;
    } else if (modeId === MODES.GD) {
      setGdTurnChoice('user');
      gdTurnRef.current = 0;
      latestGDAnalysisRef.current = null;
      gdSpeakingSecondsRef.current = 0;
      setGdTopic(GD_PLACEMENT_TOPIC);
      greeting = `Welcome to Group Discussion. Today's debate topic is: ${GD_PLACEMENT_TOPIC}. Whenever you are ready, please share your thoughts, I am listening.`;
    } else if (modeId === MODES.SELF_INTRO) {
      greeting = "Welcome to the Self-Introduction arena. Please deliver your 60 to 90-second elevator pitch. Whenever you are ready, you can start speaking.";
    } else if (modeId === MODES.CASUAL) {
      // Feature 8: Casual Talk & Empathetic Mental Wellness welcome
      greeting = CASUAL_ROBOT_WELCOME;
    } else {
      greeting = getSmartMorningGreeting();
    }
    lastAITextRef.current = greeting;

    // 3. Seamless Audio Triggering: Consume user gesture immediately to invoke speech synthesis
    speak(greeting, () => {
      // 4. On utterance.onend (or graceful fallback if cancelled/interrupted):
      // Smoothly switch 3D Robot state to 'LISTENING' (green pulsing glow)
      // and automatically open and activate the Web Speech Recognition microphone stream
      setIsSpeaking(false);
      setTimeout(() => {
        if (currentViewRef.current === 'arena') {
          startListeningRef.current?.();
          setIsListening(true);
        }
      }, 350);
    });
  }, [resetTelemetry, speak, startCamera, stopTTS]);

  // ── Return to Dashboard
  const handleBackToDashboard = useCallback(() => {
    stopListening();
    stopTTS();
    heygenAvatarRef.current?.interrupt();
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
    unblockSpeechAutoplay();
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

    if (newMode === MODES.GD) {
      setGdTurnChoice(null);
      gdTurnRef.current = 0;
      latestGDAnalysisRef.current = null;
      gdSpeakingSecondsRef.current = 0;
      setGdTopic(GD_PLACEMENT_TOPIC);
      setIsSpeaking(false);
      setIsListening(false);
      setIsThinking(false);
      return;
    }

    let verbalAnnouncement = '';
    if (newMode === MODES.PRESENTATION) {
      verbalAnnouncement = "Welcome to Project Presentation. Please walk me through your engineering project, including the problem you solved, your tech stack, and the final results. I'm listening.";
      projectPitchTurnRef.current = 0;
      latestProjectPitchAnalysisRef.current = null;
    } else if (newMode === MODES.SELF_INTRO) {
      verbalAnnouncement = 'Welcome to the Self-Introduction arena. Please deliver your 60 to 90-second elevator pitch. Whenever you are ready, you can start speaking.';
    } else if (newMode === MODES.CASUAL) {
      verbalAnnouncement = CASUAL_ROBOT_WELCOME;
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

  // ── End Arena Call & Trigger Feature 9: Verbal Reinforcement & Positive Thinking
  const handleEndCall = useCallback(() => {
    if (isConcluding) return;

    // 1. End Call Interception:
    // When the candidate clicks the red "End Call" button in the 3D call room:
    // Do NOT abruptly switch views. Enter an exit sequence state 'CONCLUDING'.
    setIsConcluding(true);
    stopListening();
    setIsListening(false);
    setIsThinking(false);

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setScreenActive(false);

    // 2. Verbal Reinforcement Voice Generation:
    // Calculate candidate highlights from current session:
    // - eyeContact = currentEyeContactPercentage (e.g., 88%)
    // - fillers = totalFillersCount (e.g., 1)
    const { turnCount, wordCounts, totalWords } = statsRef.current;
    const avgWordsPerTurn = wordCounts.length > 0 ? Math.round(totalWords / wordCounts.length) : 15;
    const measuredEyeContact = Math.max(50, Math.min(98, Math.round(getEyeContactPercentage() || 88)));
    const isCasualMode = currentMode === MODES.CASUAL;
    const fillers = isCasualMode ? 0 : Math.max(statsRef.current.fillersCount || 0, 0);

    const computed = calculateScores({
      turnCount: Math.max(turnCount, 1),
      wordCounts,
      avgWordsPerTurn,
      mode: currentMode,
      postureAlertCount: isCasualMode ? 0 : postureCountRef.current,
      eyeContactPercentage: measuredEyeContact,
      fillersCount: fillers,
      selfIntroAnalysis: latestSelfIntroAnalysisRef.current,
      starAnalysis: latestProjectPitchAnalysisRef.current,
      gdAnalysis: latestGDAnalysisRef.current,
      speakingDurationSeconds: isCasualMode ? Math.round((totalWords / 120) * 60) : gdSpeakingSecondsRef.current,
    });

    // Construct speech:
    // "Fantastic effort today! Look at your progress—your eye contact was steady at [eyeContact]%, and you kept vocal hesitations down to just [fillers]. Keep this confidence high for your campus placements!"
    const congratsSpeech = constructVerbalReinforcement({
      eyeContact: measuredEyeContact,
      fillers,
    });

    lastAITextRef.current = congratsSpeech;

    // Save celebratory banner data for Dashboard
    const celebrationData = {
      message: congratsSpeech,
      eyeContact: measuredEyeContact,
      fillers,
      score: computed.overall,
      mode: currentMode,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
    };
    setCelebrationBanner(celebrationData);
    try {
      localStorage.setItem('aura_gd_latest_celebration', JSON.stringify(celebrationData));
    } catch (e) {
      console.debug('Failed to cache celebration data:', e);
    }

    // 3. Animation & Transition:
    // 3D Robot triggers 'SPEAKING' state with an encouraging gentle nod and warm teal glow.
    // Speak the dialogue via speechSynthesis.
    setIsSpeaking(true);

    let hasConcluded = false;
    const finalizeConclusion = () => {
      if (hasConcluded) return;
      hasConcluded = true;

      if (conclusionTimerRef.current) {
        clearTimeout(conclusionTimerRef.current);
        conclusionTimerRef.current = null;
      }

      // Append today's session score and metrics into localStorage.getItem('aura_gd_session_history')
      recordNewSession({
        mode: currentMode,
        score: computed.overall,
        eyeContact: measuredEyeContact,
        fillers,
      });

      // Smoothly route back to the Dashboard view with the celebratory banner displayed above the progress table
      stopTTS();
      setIsSpeaking(false);
      setIsConcluding(false);
      setScores(computed);
      setCurrentView('dashboard');
    };

    // Safety timeout: 4 seconds as specified in requirement 3
    conclusionTimerRef.current = setTimeout(() => {
      finalizeConclusion();
    }, 4000);

    // Speak the dialogue via speechSynthesis, invoking finalizeConclusion on onend
    speak(congratsSpeech, () => {
      finalizeConclusion();
    });
  }, [currentMode, getEyeContactPercentage, isConcluding, speak, stopListening, stopTTS]);

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
    setGdTurnChoice(null);
    gdTurnRef.current = 0;
    latestGDAnalysisRef.current = null;
    gdSpeakingSecondsRef.current = 0;
    resetConversation();
    setCurrentView('dashboard');
  }, []);

  // ── Voice Ambient Edge Glow (Warm amber for casual wellness vs cyan/emerald)
  const edgeGlowClass = currentMode === MODES.CASUAL
    ? (isListening ? 'voice-edge-listening-casual' : isSpeaking ? 'voice-edge-speaking-casual' : '')
    : (isListening ? 'voice-edge-listening' : isSpeaking ? 'voice-edge-speaking' : '');

  return (
    <div
      className={`relative w-full h-full min-h-screen overflow-hidden ${
        currentView === 'arena'
          ? `bg-[#000000] text-slate-100 ${edgeGlowClass}`
          : 'bg-[#f8faff] text-[#1e1b4b]'
      } select-none`}
    >

      {/* ══════════════════════════════════════════════════════════════
          VIEWS: DASHBOARD / HISTORY
      ══════════════════════════════════════════════════════════════ */}
      {currentView !== 'arena' && currentView !== 'practice' && currentView !== 'mentorship' && currentView !== 'presentation_studio' && currentView !== 'gd_studio' && (
        <div className="w-full h-screen flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={(viewId) => setCurrentView(viewId)}
            onStartArena={handleStartArena}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Dynamic Content Views */}
          {currentView === 'dashboard' && (
            <Dashboard
              userName={userName}
              onStartArena={handleStartArena}
              onNavigate={(viewId) => setCurrentView(viewId)}
              cameraActive={cameraActive}
              celebrationBanner={celebrationBanner}
              onViewScorecard={() => setShowScoreModal(true)}
              onOpenLoginModal={() => setShowLoginModal(true)}
              onTriggerCelebration={handleManualCelebration}
            />
          )}

          {currentView === 'history' && (
            <HistoryView
              onStartArena={handleStartArena}
              onBackToDashboard={() => setCurrentView('dashboard')}
            />
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW: STUDENT COMMUNICATION PRACTICE ROOM (AI MENTOR PRIYA)
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'practice' && (
        <StudentPracticeRoom
          onBackToDashboard={() => setCurrentView('dashboard')}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW: DUAL-VIDEO AI MENTORSHIP & INTERVIEW EVALUATION ROOM
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'mentorship' && (
        <DualVideoMentorshipRoom
          userName={userName}
          onBackToDashboard={() => setCurrentView('dashboard')}
          onEndCall={handleEndCall}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW: 2D AI SMART PRESENTATION STUDIO (FIXED CANVAS)
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'presentation_studio' && (
        <PresentationStudio
          userName={userName}
          onBackToDashboard={() => setCurrentView('dashboard')}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW: GROUP DISCUSSION STUDIO (ROUNDTABLE 2D VIEW)
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'gd_studio' && (
        <GroupDiscussionStudio
          userName={userName}
          onBackToDashboard={() => setCurrentView('dashboard')}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW: ARENA 1-ON-1 CALL VIEW ("kebal bo and me dheku")
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'arena' && (
        <div className="w-full h-screen relative overflow-hidden bg-[#000000]">
          {/* ── Top Minimal Floating Controls ── */}
          {/* Top-Left: Minimal Return Button */}
          <div className="absolute top-6 left-6 z-30 pointer-events-auto">
            <button
              onClick={handleBackToDashboard}
              className="px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer"
              title="Return to Dashboard"
            >
              <span>←</span>
              <span>Dashboard</span>
            </button>
          </div>

          {/* Top-Right: Subtle Minimal Floating Voice HUD Pill */}
          <div className="absolute top-6 right-6 z-30 pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                unblockSpeechAutoplay();
                speak("Hello! I am Aura. My audio output is fully active, and I am listening to your voice. Feel free to ask me anything!");
              }}
              className="px-3 py-1.5 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-400/50 text-purple-300 text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
              title="Click to verify avatar voice output"
            >
              <span>🔊 Test Voice</span>
            </button>

            {isSpeaking && (
              <button
                onClick={handleImmediateSpeak}
                className="px-3 py-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
                title="Interrupt AI and speak right away"
              >
                <span>Tap to Speak</span>
                <span>🎙️</span>
              </button>
            )}

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 border border-white/15 backdrop-blur-md shadow-xl text-xs font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking
                    ? 'bg-cyan-400 pulse-dot shadow-[0_0_8px_#00e5ff]'
                    : isListening
                    ? 'bg-emerald-400 pulse-dot shadow-[0_0_8px_#10b981]'
                    : isThinking
                    ? 'bg-purple-400 pulse-dot shadow-[0_0_8px_#c084fc]'
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
                    ? 'text-purple-300'
                    : 'text-slate-300'
                }
              >
                {isSpeaking ? 'Aura Speaking...' : isListening ? '● Listening...' : isThinking ? '🧠 Aura Thinking...' : '● Aura Voice Active'}
              </span>
            </div>
          </div>

          {/* Digital AI Robot Avatar Companion (Aura) on Pure Black Canvas */}
          <main className="w-full h-full absolute inset-0 z-10 bg-[#000000]">
            <ErrorBoundary>
              <HeyGenMentorAvatar
                ref={heygenAvatarRef}
                isSpeaking={isSpeaking}
                isListening={isListening}
                isThinking={isThinking}
                isConcluding={isConcluding}
                mode={currentMode}
                mentorName="Aura"
                speakingText={aiSpeechSubtitle}
                onSpeechStart={() => {
                  setIsSpeaking(true);
                  setIsThinking(false);
                  stopListeningRef.current?.();
                  setIsListening(false);
                }}
                onSpeechEnd={() => {
                  setIsSpeaking(false);
                  if (currentViewRef.current === 'arena' && !showScoreModalRef.current) {
                    setTimeout(() => {
                      setLiveTranscript('');
                      startListeningRef.current?.();
                      setIsListening(true);
                    }, 350);
                  }
                }}
              />
            </ErrorBoundary>
          </main>

          {/* Vision Posture Alert Badge HUD (Slouching, Face-Touch, Gaze) */}
          <PostureAlertBadge
            alert={(currentMode === MODES.CASUAL || isConcluding) ? null : postureAlert}
            onDismiss={() => setPostureAlert(null)}
          />

          {/* ── Live Speech & Subtitle HUD (Shows Live Words & Dialogue) ── */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-xl w-[92vw] sm:w-auto flex flex-col items-center gap-2">
            {/* When Candidate is speaking / mic detects speech */}
            {isListening && (
              <div className="flex flex-col items-center gap-2 max-w-lg w-full">
                <div className="w-full px-5 py-2.5 rounded-2xl bg-black/85 border border-emerald-500/50 backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-fade-in text-left">
                  <span className={`w-2.5 h-2.5 rounded-full ${audioLevel > 14 ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-emerald-500/60'} shrink-0`} />
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      {audioLevel > 14 ? '● You (Speaking...)' : 'Microphone Live'}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                      {liveTranscript ? `"${liveTranscript}"` : 'Listening... Speak your response naturally.'}
                    </p>
                  </div>
                  {liveTranscript && (
                    <button
                      onClick={commitSpeech}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                      title="Send answer to AI now"
                    >
                      <span>Done ➔</span>
                    </button>
                  )}
                  <button
                    onClick={toggleSpeechLang}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 transition-all cursor-pointer shrink-0"
                    title={`Recognition language: ${speechLang || 'en-IN'}. Click to toggle English / Hindi`}
                  >
                    🌐 {speechLang === 'hi-IN' ? 'Hindi (हिन्दी)' : 'English (EN)'}
                  </button>
                  <button
                    onClick={() => setShowTextInput((prev) => !prev)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs cursor-pointer transition-all"
                    title={showTextInput ? 'Hide keyboard input' : 'Type response with keyboard'}
                  >
                    ⌨️
                  </button>
                </div>

                {/* Optional manual text input fallback */}
                {showTextInput && (
                  <form
                    onSubmit={handleManualTextSubmit}
                    className="w-full flex items-center gap-2 p-1.5 rounded-2xl bg-black/90 border border-white/20 backdrop-blur-xl shadow-2xl animate-fade-in"
                  >
                    <input
                      type="text"
                      value={manualInputText}
                      onChange={(e) => setManualInputText(e.target.value)}
                      placeholder="Type your question or response here..."
                      className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!manualInputText.trim()}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Mic Blocked / Denied Banner */}
            {micPermissionDenied && (
              <div className="px-4 py-2 rounded-xl bg-amber-950/90 border border-amber-500/60 text-amber-200 text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
                <span>⚠️</span>
                <span>Microphone blocked in browser. Click the lock/tune icon in the address bar to allow microphone.</span>
              </div>
            )}

            {/* Mic Notice / Troubleshooting Banner */}
            {micNotice && (
              <div className="px-4 py-2 rounded-xl bg-amber-950/90 border border-amber-500/60 text-amber-200 text-xs font-bold shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md animate-fade-in w-full max-w-lg">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{micNotice}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={retryListening}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold cursor-pointer"
                  >
                    Retry Mic
                  </button>
                  <button
                    onClick={clearMicNotice}
                    className="text-amber-400 hover:text-white text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* When AI is Thinking (ChatGPT Thought Process Mode) */}
            {isThinking && (
              <div className="px-5 py-3 rounded-2xl bg-black/90 border border-purple-500/60 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5 animate-fade-in text-left max-w-lg w-full">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc] shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                    Aura Thinking (ChatGPT Mode)...
                  </span>
                </div>
                <div className="text-xs text-purple-100/90 leading-relaxed font-mono whitespace-pre-line bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20 max-h-36 overflow-y-auto">
                  {currentThought || '🧠 Step 1: Processing your speech...\n🧠 Step 2: Formulating intelligent response...'}
                </div>
              </div>
            )}

            {/* When AI is speaking */}
            {isSpeaking && aiSpeechSubtitle && (
              <div className="flex flex-col items-center gap-1.5 max-w-lg w-full">
                <div className="w-full px-5 py-2.5 rounded-2xl bg-black/85 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-fade-in text-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff] shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold text-cyan-200 leading-snug flex-1">
                    "{aiSpeechSubtitle}"
                  </p>
                  {currentThought && (
                    <button
                      onClick={() => setShowThoughtDetails((prev) => !prev)}
                      className="px-2 py-1 rounded-lg bg-purple-900/50 hover:bg-purple-800/60 border border-purple-400/40 text-[10px] font-bold text-purple-200 transition-all shrink-0 cursor-pointer"
                      title="View Thought Process"
                    >
                      🧠 {showThoughtDetails ? 'Hide' : 'Thought'}
                    </button>
                  )}
                </div>

                {/* Optional Expandable Thought Process while speaking */}
                {showThoughtDetails && currentThought && (
                  <div className="w-full px-4 py-2.5 rounded-xl bg-purple-950/90 border border-purple-400/40 text-left backdrop-blur-xl shadow-xl animate-fade-in">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                      🧠 Aura Internal Reasoning Chain:
                    </span>
                    <p className="text-[11px] text-purple-100/90 font-mono whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                      {currentThought}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Bottom Control Dock */}
          <ControlDock
            currentMode={currentMode}
            onSelectMode={handleSelectMode}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isConcluding={isConcluding}
            onToggleMic={handleToggleMic}
            cameraActive={cameraActive}
            onToggleCamera={toggleCamera}
            screenActive={screenActive}
            onToggleScreenShare={toggleScreenShare}
            onEndCall={handleEndCall}
            onBackToDashboard={handleBackToDashboard}
            audioLevel={audioLevel}
            speechLang={speechLang}
            onToggleLanguage={toggleSpeechLang}
            showTextInput={showTextInput}
            onToggleTextInput={() => setShowTextInput((prev) => !prev)}
            manualInputText={manualInputText}
            setManualInputText={setManualInputText}
            handleManualTextSubmit={handleManualTextSubmit}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ENLARGED CANDIDATE WEBCAM PIP ("me") - In Arena Mode
      ══════════════════════════════════════════════════════════════ */}
      {currentView === 'arena' && (
        <WebcamPIP
          videoRef={videoRef}
          stream={stream}
          isActive={cameraActive}
          hasPermission={hasPermission}
          error={cameraError}
          screenVideoRef={screenVideoRef}
          screenActive={screenActive}
          onToggleCamera={toggleCamera}
          hasMistake={(currentMode === MODES.CASUAL || isConcluding) ? false : !!postureAlert}
          alert={(currentMode === MODES.CASUAL || isConcluding) ? null : postureAlert}
        />
      )}

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

      {/* ── Settings Dialog ── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* ── Login / Welcome Celebration Dialog ── */}
      <LoginModal
        isOpen={showLoginModal}
        currentName={userName}
        onLogin={handleLoginSuccess}
        onClose={() => setShowLoginModal(false)}
        canClose={!!localStorage.getItem('aura_gd_has_logged_in')}
      />
    </div>
  );
}
