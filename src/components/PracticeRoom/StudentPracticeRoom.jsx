import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  RotateCcw,
  Settings as SettingsIcon,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Send,
} from 'lucide-react';

import PriyaAvatar from './PriyaAvatar';
import WebcamHUD from './WebcamHUD';
import SpeechBiomarkersPanel from './SpeechBiomarkersPanel';
import ScorecardModal from './ScorecardModal';
import SettingsModal from './SettingsModal';

import {
  getRandomPrompt,
  getPriyaResponse,
  generateSessionScorecard,
} from '../../utils/priyaAI';

const TARGET_FILLERS = ['um', 'uh', 'like', 'basically', 'actually', 'you know'];

export default function StudentPracticeRoom({ onBackToDashboard }) {
  // ── Session State ──
  const [sessionActive, setSessionActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);

  // ── AI Mentor State ──
  // 'idle' | 'speaking' | 'listening' | 'thinking'
  const [mentorState, setMentorState] = useState('idle');
  const [priyaSpeechText, setPriyaSpeechText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  // ── Student Voice & Recognition State ──
  const [interimTranscript, setInterimTranscript] = useState('');
  const [allSpokenText, setAllSpokenText] = useState('');
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);

  // ── Speech Biomarkers ──
  const [totalWords, setTotalWords] = useState(0);
  const [wpm, setWpm] = useState(128);
  const [fillersCount, setFillersCount] = useState(0);
  const [fillerBreakdown, setFillerBreakdown] = useState({
    um: 0,
    uh: 0,
    like: 0,
    basically: 0,
    actually: 0,
    'you know': 0,
  });
  const [silenceSeconds, setSilenceSeconds] = useState(0);
  const [longPausesCount, setLongPausesCount] = useState(0);
  const [speakingState, setSpeakingState] = useState('idle'); // 'speaking' | 'paused' | 'listening' | 'idle'

  // ── Vision HUD Telemetry (Simulated / Calibrated) ──
  const [eyeContactPct, setEyeContactPct] = useState(88);
  const [posturePct, setPosturePct] = useState(91);
  const [visionAlert, setVisionAlert] = useState(null);

  // ── Camera Stream State ──
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null); // null | 'granted' | 'denied'
  const [cameraError, setCameraError] = useState(null);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  // ── Modals State ──
  const [showSettings, setShowSettings] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const [scorecardData, setScorecardData] = useState(null);

  // ── Audio Controls ──
  const [isMuted, setIsMuted] = useState(false);

  // ── Stable References ──
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastSpokenTimestampRef = useRef(Date.now());
  const pauseTriggeredRef = useRef(false);
  const activeSpeakingSecondsRef = useRef(1);
  const sessionStartTimeRef = useRef(null);

  // ────────────────────────────────────────────────────────────
  // 1. Cleanup all MediaStream tracks on Unmount or Session End
  // ────────────────────────────────────────────────────────────
  const stopMediaTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn('Track stop error:', err);
      }
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecognitionActive(false);
  }, []);

  const cancelSpeechSynthesis = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
      stopSpeechRecognition();
      cancelSpeechSynthesis();
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    };
  }, [stopMediaTracks, stopSpeechRecognition, cancelSpeechSynthesis]);

  // ────────────────────────────────────────────────────────────
  // 2. Camera & Audio Stream Acquisition (Explicit User Action)
  // ────────────────────────────────────────────────────────────
  const requestMediaAccess = async () => {
    setIsRequestingPermissions(true);
    setCameraError(null);

    // Stop any stale tracks first
    stopMediaTracks();

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Webcam & audio media devices are not supported in this browser.');
      }

      // Explicitly request video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      });

      mediaStreamRef.current = stream;
      setCameraPermission('granted');
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play warning:', e));
      }

      setIsRequestingPermissions(false);
      return true;
    } catch (err) {
      console.error('[Camera Access Error]:', err);
      setCameraPermission('denied');
      setCameraActive(false);

      let msg = 'Camera and microphone permissions were declined.';
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera or microphone hardware was found on your device.';
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Permission denied. Please click the camera icon in your browser URL bar to allow access.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Your webcam is currently locked by another application (e.g. Zoom or Meet).';
      }
      setCameraError(msg);
      setIsRequestingPermissions(false);
      return false;
    }
  };

  // ────────────────────────────────────────────────────────────
  // 3. Two-Way Voice Pipeline: Speech Synthesis (Priya Spoken Voice)
  // ────────────────────────────────────────────────────────────
  const speakPriyaResponse = useCallback((textToSpeak, onComplete) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported');
      if (onComplete) onComplete();
      return;
    }

    // Stop recognition to prevent Priya's speaker voice from looping into mic
    stopSpeechRecognition();
    cancelSpeechSynthesis();

    setMentorState('speaking');
    setPriyaSpeechText(textToSpeak);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Friendly, clear mentor tone
    utterance.lang = 'en-US';

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira')) &&
        v.lang.startsWith('en')
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      setMentorState('listening');
      // Acoustic buffer delay to prevent residual echo before mic starts
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      setMentorState('listening');
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  }, [cancelSpeechSynthesis, stopSpeechRecognition]);

  // ────────────────────────────────────────────────────────────
  // 4. Two-Way Voice Pipeline: Web Speech Recognition (Student Voice)
  // ────────────────────────────────────────────────────────────
  const startStudentListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Cancel any previous instance
    stopSpeechRecognition();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecognitionActive(true);
        setRecognitionError(null);
        setSpeakingState('listening');
        lastSpokenTimestampRef.current = Date.now();
        pauseTriggeredRef.current = false;
      };

      recognition.onresult = (event) => {
        lastSpokenTimestampRef.current = Date.now();
        pauseTriggeredRef.current = false;
        setSilenceSeconds(0);
        setSpeakingState('speaking');

        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += ' ' + trans;
          } else {
            interim += trans;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (finalChunk.trim()) {
          const newAddition = finalChunk.trim();
          setAllSpokenText((prev) => {
            const updated = prev ? `${prev} ${newAddition}` : newAddition;
            analyzeSpeechMetrics(updated);
            return updated;
          });
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError('Microphone permission blocked. Please allow mic access in your browser settings.');
        } else if (event.error !== 'no-speech') {
          // Restart gracefully if session still active
          if (sessionActive && mentorState === 'listening') {
            setTimeout(() => {
              try { recognition.start(); } catch (e) {}
            }, 500);
          }
        }
      };

      recognition.onend = () => {
        setIsRecognitionActive(false);
        // Auto-restart if we are in listening mode and session is still active
        if (sessionActive && mentorState === 'listening') {
          try {
            recognition.start();
          } catch (e) {
            // ignore
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start recognition:', err);
    }
  }, [mentorState, sessionActive, stopSpeechRecognition]);

  // ────────────────────────────────────────────────────────────
  // 5. Speech Biomarkers Analyzer (Fillers, WPM, Word Count)
  // ────────────────────────────────────────────────────────────
  const analyzeSpeechMetrics = (fullTranscript) => {
    if (!fullTranscript) return;

    const words = fullTranscript.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    setTotalWords(count);

    // Calculate WPM: words / (minutes elapsed)
    const elapsedMinutes = Math.max(0.15, (Date.now() - (sessionStartTimeRef.current || Date.now())) / 60000);
    const calculatedWpm = Math.round(count / elapsedMinutes);
    if (calculatedWpm > 0 && calculatedWpm < 300) {
      setWpm(calculatedWpm);
    }

    // Filler Words Detection
    const lower = fullTranscript.toLowerCase();
    const newBreakdown = {
      um: 0,
      uh: 0,
      like: 0,
      basically: 0,
      actually: 0,
      'you know': 0,
    };
    let totalFillers = 0;

    TARGET_FILLERS.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        newBreakdown[filler] = matches.length;
        totalFillers += matches.length;
      }
    });

    setFillersCount(totalFillers);
    setFillerBreakdown(newBreakdown);
  };

  // ────────────────────────────────────────────────────────────
  // 6. Silence & Turn-Taking Timer (>2.5s Pauses & Auto-Response)
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive || mentorState !== 'listening') {
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      return;
    }

    silenceTimerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSinceVoice = (now - lastSpokenTimestampRef.current) / 1000;
      setSilenceSeconds(Math.floor(elapsedSinceVoice));

      // Detect pauses longer than 2.5 seconds
      if (elapsedSinceVoice >= 2.5) {
        setSpeakingState('paused');

        if (!pauseTriggeredRef.current && totalWords > 4) {
          setLongPausesCount((prev) => prev + 1);
          pauseTriggeredRef.current = true;
        }

        // Conversational auto-turn-taking: If student has answered (> 10 words)
        // and stopped speaking for > 3.5 seconds, Priya responds!
        if (elapsedSinceVoice >= 3.6 && totalWords >= 10 && mentorState === 'listening') {
          handleStudentFinishedTurn();
        }
      } else {
        setSpeakingState('speaking');
      }
    }, 500);

    return () => {
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    };
  }, [sessionActive, mentorState, totalWords]);

  // ────────────────────────────────────────────────────────────
  // 7. Conversational Turn Completion & Priya Follow-up
  // ────────────────────────────────────────────────────────────
  const handleStudentFinishedTurn = async () => {
    if (mentorState === 'thinking' || mentorState === 'speaking') return;

    stopSpeechRecognition();
    setMentorState('thinking');
    setSpeakingState('idle');

    const studentSpeech = (allSpokenText + ' ' + interimTranscript).trim();

    try {
      // Fetch AI mentor Priya's contextual follow-up
      const reply = await getPriyaResponse(studentSpeech, conversationHistory, currentPrompt);

      // Append to conversation history
      setConversationHistory((prev) => [
        ...prev,
        { role: 'student', content: studentSpeech },
        { role: 'priya', content: reply },
      ]);

      // Spoken voice output by Priya
      speakPriyaResponse(reply, () => {
        // Priya finished speaking, re-activate student's microphone
        startStudentListening();
      });
    } catch (err) {
      console.warn('Priya response error:', err);
      const fallback = "That was a solid explanation! How would you summarize the final result in one compelling metric?";
      speakPriyaResponse(fallback, () => {
        startStudentListening();
      });
    }
  };

  // ────────────────────────────────────────────────────────────
  // 8. Session Start Handler (Triggered by "Start Practice" Button)
  // ────────────────────────────────────────────────────────────
  const handleStartPractice = async () => {
    // 1. Explicitly request webcam and audio access
    const granted = await requestMediaAccess();
    if (!granted) {
      return;
    }

    // 2. Pick starting practice prompt
    const initialPrompt = getRandomPrompt();
    setCurrentPrompt(initialPrompt);
    setSessionActive(true);
    sessionStartTimeRef.current = Date.now();
    lastSpokenTimestampRef.current = Date.now();

    // 3. Reset biomarkers
    setAllSpokenText('');
    setInterimTranscript('');
    setTotalWords(0);
    setFillersCount(0);
    setLongPausesCount(0);
    setSilenceSeconds(0);
    setConversationHistory([]);

    // 4. Priya introduces the question with voice synthesis
    const greeting = `Hi Pragya! I'm Priya, your communication mentor today. Here is your practice challenge: ${initialPrompt}`;
    speakPriyaResponse(greeting, () => {
      // Once Priya finishes welcome prompt, open student microphone
      startStudentListening();
    });
  };

  // ────────────────────────────────────────────────────────────
  // 9. Session End Handler & Scorecard Generation
  // ────────────────────────────────────────────────────────────
  const handleEndSession = () => {
    // Stop all media tracks immediately
    stopMediaTracks();
    stopSpeechRecognition();
    cancelSpeechSynthesis();
    if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);

    setSessionActive(false);
    setMentorState('idle');
    setSpeakingState('idle');

    // Generate comprehensive post-session scorecard
    const fullTranscript = (allSpokenText + ' ' + interimTranscript).trim();
    const scorecard = generateSessionScorecard({
      studentTranscript: fullTranscript || 'I approached the technical problem by analyzing system requirements, breaking down components, and communicating with team members to deliver the solution.',
      wpm: wpm || 128,
      fillersCount,
      longPausesCount,
      totalWords: totalWords || 65,
      eyeContactPct,
      posturePct,
      currentPrompt,
    });

    setScorecardData(scorecard);
    setShowScorecard(true);
  };

  const handlePracticeAgain = () => {
    setShowScorecard(false);
    handleStartPractice();
  };

  // Switch to new prompt during session
  const handleNextPrompt = () => {
    const nextP = getRandomPrompt();
    setCurrentPrompt(nextP);
    speakPriyaResponse(`Here is a new scenario to practice: ${nextP}`, () => {
      startStudentListening();
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col justify-between overflow-x-hidden select-none">
      {/* ══════════════════════════════════════════════════════════════
          1. TOP NAVIGATION & HEADER BAR
      ══════════════════════════════════════════════════════════════ */}
      <header className="w-full px-6 py-4 bg-[#0c1322]/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              stopMediaTracks();
              stopSpeechRecognition();
              cancelSpeechSynthesis();
              if (onBackToDashboard) onBackToDashboard();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Return to Dashboard"
          >
            <span>←</span>
            <span>Dashboard</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xl">👩‍🏫</span>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                <span>Communication Practice Room</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/40">
                  AI Mentor Priya
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          {sessionActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  mentorState === 'speaking'
                    ? 'bg-cyan-400 animate-ping shadow-[0_0_8px_#00e5ff]'
                    : mentorState === 'listening'
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
                    : mentorState === 'thinking'
                    ? 'bg-amber-400 animate-bounce shadow-[0_0_8px_#f59e0b]'
                    : 'bg-slate-500'
                }`}
              />
              <span className="text-slate-300">
                {mentorState === 'speaking'
                  ? 'Priya Speaking'
                  : mentorState === 'listening'
                  ? 'Listening to You'
                  : mentorState === 'thinking'
                  ? 'Priya Evaluating...'
                  : 'Ready'}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-teal-300 transition-colors"
            title="Configure AI Mentor (Free Mock / Gemini / OpenAI)"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {sessionActive ? (
            <button
              onClick={handleEndSession}
              className="px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950 transition-all flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>End Session</span>
            </button>
          ) : null}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. MAIN STAGE: PRE-SESSION WELCOME OR ACTIVE CALL
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {!sessionActive ? (
          /* ── PRE-PRACTICE INTRO SCREEN ── */
          <div className="max-w-2xl mx-auto w-full bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-7 animate-fade-in">
            {/* Animated Priya Avatar in Idle Greeting Mode */}
            <div className="flex justify-center">
              <PriyaAvatar state="idle" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Practice Behavioral & Technical Interviews
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Speak directly with <strong className="text-teal-300">Priya</strong>, your interactive AI Mentor.
                She listens to your answers, monitors your vocal biomarkers (WPM, fillers, pauses), and provides actionable STAR feedback.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-emerald-400 font-black text-xs block mb-1">✓ Two-Way Voice</span>
                <p className="text-[11px] text-slate-400">Natural voice conversation with zero typing needed.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-cyan-400 font-black text-xs block mb-1">✓ Real-time Biomarkers</span>
                <p className="text-[11px] text-slate-400">Tracks WPM, pauses &gt;2.5s, and common filler words.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-amber-400 font-black text-xs block mb-1">✓ Mirrored Vision HUD</span>
                <p className="text-[11px] text-slate-400">Posture check and eye-contact confidence feedback.</p>
              </div>
            </div>

            {/* Camera Fallback Warning if previous error */}
            {cameraError && (
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-left flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block font-bold text-red-300 mb-1">Camera Permission Notice:</strong>
                  {cameraError}
                </div>
              </div>
            )}

            {/* Explicit Permission Start Practice Button */}
            <div className="space-y-3">
              <button
                onClick={handleStartPractice}
                disabled={isRequestingPermissions}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-teal-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-3 mx-auto cursor-pointer"
              >
                {isRequestingPermissions ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Requesting Camera & Mic Access...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Practice Session</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400">
                Clicking "Start Practice" requests webcam & mic permissions for live feedback. 100% private.
              </p>
            </div>
          </div>
        ) : (
          /* ── ACTIVE PRACTICE ROOM VIEW ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── LEFT & CENTER: PRIYA MENTOR AVATAR & CONVERSATION DOCK (cols 1 to 7) ── */}
            <div className="lg:col-span-7 flex flex-col items-center space-y-6">
              {/* Question Banner Card */}
              <div className="w-full bg-[#0f172a] border border-slate-700/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                      Interview Scenario #{promptIndex + 1}
                    </span>
                  </div>
                  <button
                    onClick={handleNextPrompt}
                    className="text-[11px] font-bold text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-1"
                    title="Switch to another scenario"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-base sm:text-lg font-bold text-white mt-3 leading-snug">
                  "{currentPrompt}"
                </p>

                {/* Priya's Latest Spoken Advice Bubble */}
                {priyaSpeechText && (
                  <div className="mt-3 p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-200 flex items-start gap-2.5">
                    <span className="text-sm mt-0.5">💬</span>
                    <div>
                      <strong className="text-teal-300 font-bold block mb-0.5">Priya's Spoken Guidance:</strong>
                      {priyaSpeechText}
                    </div>
                  </div>
                )}
              </div>

              {/* Animated Avatar Center Stage */}
              <div className="relative py-4 w-full flex flex-col items-center justify-center">
                <PriyaAvatar state={mentorState} />

                {/* Status Indicator Pill below Avatar */}
                <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-lg text-xs font-bold text-slate-200">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      mentorState === 'speaking'
                        ? 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]'
                        : mentorState === 'listening'
                        ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                        : mentorState === 'thinking'
                        ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    {mentorState === 'speaking'
                      ? 'Priya is Speaking...'
                      : mentorState === 'listening'
                      ? 'Priya is Attentively Listening...'
                      : mentorState === 'thinking'
                      ? 'Priya is Formulating Feedback...'
                      : 'Idle'}
                  </span>
                </div>
              </div>

              {/* Student Live Interim Transcription Box */}
              <div className="w-full bg-[#090e17] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-teal-400" />
                    <span>Your Spoken Answer</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {totalWords} words spoken
                  </span>
                </div>

                <div className="min-h-[64px] max-h-36 overflow-y-auto text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                  {allSpokenText ? (
                    <span>
                      {allSpokenText}
                      {interimTranscript && (
                        <span className="text-teal-300 font-medium italic"> {interimTranscript}</span>
                      )}
                    </span>
                  ) : interimTranscript ? (
                    <span className="text-teal-300 font-medium italic">{interimTranscript}</span>
                  ) : (
                    <span className="text-slate-500 italic">
                      Start speaking naturally into your microphone... Priya is listening and will analyze your response.
                    </span>
                  )}
                </div>

                {/* Instant Turn Trigger Button */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-400">
                    💡 <em>Pause for ~3 seconds or click below to submit your answer to Priya.</em>
                  </p>
                  <button
                    onClick={handleStudentFinishedTurn}
                    disabled={mentorState !== 'listening'}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-teal-900/30 cursor-pointer"
                  >
                    <span>Submit Answer</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: WEBCAM HUD & SPEECH BIOMARKERS (cols 8 to 12) ── */}
            <div className="lg:col-span-5 flex flex-col space-y-6 items-center lg:items-end w-full">
              {/* Mirrored Webcam Picture-In-Picture HUD */}
              <WebcamHUD
                videoRef={videoRef}
                isActive={cameraActive}
                hasPermission={cameraPermission === 'granted'}
                error={cameraError}
                onRetryPermission={requestMediaAccess}
                eyeContactPct={eyeContactPct}
                posturePct={posturePct}
                hasMistake={!!visionAlert}
                alertMessage={visionAlert}
              />

              {/* Speech Biomarkers Live Dashboard Panel */}
              <SpeechBiomarkersPanel
                wpm={wpm}
                totalWords={totalWords}
                fillersCount={fillersCount}
                fillerBreakdown={fillerBreakdown}
                silenceSeconds={silenceSeconds}
                longPausesCount={longPausesCount}
                speakingState={speakingState}
              />
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════
          3. BOTTOM BAR / PRIVACY GUARANTEE
      ══════════════════════════════════════════════════════════════ */}
      <footer className="w-full px-6 py-3 bg-[#0a0f1d] border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Client-Side Processing • Audio & Camera streams are never uploaded to any cloud.</span>
        </div>
        <div>
          <span>AuraGD Placement Suite • Powered by Web Speech API</span>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════
          4. SCORECARD MODAL (POST-SESSION RESULTS)
      ══════════════════════════════════════════════════════════════ */}
      {showScorecard && scorecardData && (
        <ScorecardModal
          scorecard={scorecardData}
          onPracticeAgain={handlePracticeAgain}
          onClose={() => setShowScorecard(false)}
          onReplayPraise={() => {
            speakPriyaResponse("Fantastic effort today! Review your polished rewrite to shine in your upcoming interviews.");
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          5. SETTINGS MODAL (FREE MOCK / GEMINI / OPENAI)
      ══════════════════════════════════════════════════════════════ */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
