import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GD_AVATARS,
  POPULAR_GD_TOPICS,
  getRandomAvatarTopic,
  generateAvatarArgument,
  analyzeStudentGDPerformance,
} from '../utils/gdFeedbackEngine';

export const DEFAULT_GD_TOPIC = POPULAR_GD_TOPICS[0];

export function useGroupDiscussionSession({
  userName = 'Pragya',
  initialTopic = DEFAULT_GD_TOPIC,
} = {}) {
  const [topic, setTopic] = useState(initialTopic);
  const [sessionStatus, setSessionStatus] = useState('running'); // 'idle' | 'running' | 'paused'
  const [timerSeconds, setTimerSeconds] = useState(600); // 10:00 mins
  const [activeSpeakerId, setActiveSpeakerId] = useState('student-1');
  const [isAvatarVoiceMuted, setIsAvatarVoiceMuted] = useState(false);

  // 4 Core Participants: 1 Student (Host) + 3 AI Avatars (Rohan, Ananya, Vikram)
  const [participants, setParticipants] = useState(() => [
    {
      id: 'student-1',
      name: `${userName} (You)`,
      role: 'Candidate / Student',
      perspective: 'Your Own Stance',
      college: 'Host Seat',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      isSpeaking: false,
      isLocalUser: true,
      speechSeconds: 25,
      colorTheme: 'emerald',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    ...GD_AVATARS.map((av) => ({
      ...av,
      isLocalUser: false,
      isSpeaking: false,
      speechSeconds: 30,
    })),
  ]);

  // Live Discussion Transcripts
  const [transcripts, setTranscripts] = useState(() => [
    {
      id: 1,
      speakerId: 'rohan',
      speakerName: 'Rohan Sharma',
      role: 'Tech Optimist',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
      text: `Hello everyone! Welcome to today's group discussion on: "${initialTopic.title}". I strongly believe rapid technological adoption drives unprecedented growth, but let's open the floor. ${userName}, what is your initial perspective?`,
      timestamp: '00:10',
    },
  ]);

  // Track student contributions for post-GD grammar & vocabulary feedback
  const [studentContributions, setStudentContributions] = useState([]);

  // Candidate Mic & Live STT
  const [isMicActive, setIsMicActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0); // 0-100 real-time microphone volume level
  const [liveCandidateTranscript, setLiveCandidateTranscript] = useState('');
  const [fillersDetected, setFillersDetected] = useState(0);

  // Avatar turn queue & speech synthesis references
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const currentAvatarUtteranceRef = useRef(null);

  // ── 1. Countdown Timer ──
  useEffect(() => {
    if (sessionStatus === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [sessionStatus]);

  const resetTimer = useCallback(() => setTimerSeconds(600), []);
  const addMinutes = useCallback((mins = 2) => setTimerSeconds((prev) => prev + mins * 60), []);

  // ── 2. Avatar Speech Synthesis with Distinct Voices ──
  const speakAvatarSpeech = useCallback(
    (avatarId, text) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      if (isAvatarVoiceMuted || !text) {
        // Just highlight speaking for 3 seconds if audio muted
        setActiveSpeakerId(avatarId);
        setParticipants((prev) =>
          prev.map((p) => ({ ...p, isSpeaking: p.id === avatarId }))
        );
        setTimeout(() => {
          setActiveSpeakerId('student-1');
          setParticipants((prev) => prev.map((p) => ({ ...p, isSpeaking: false })));
        }, 3500);
        return;
      }

      const avatarObj = GD_AVATARS.find((a) => a.id === avatarId) || GD_AVATARS[0];
      const utterance = new SpeechSynthesisUtterance(text);
      currentAvatarUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      let chosenVoice = null;

      if (avatarObj.voiceGender === 'female') {
        chosenVoice =
          voices.find((v) => v.name.includes('Jenny') || v.name.includes('Zira') || v.name.includes('Neerja') || v.name.includes('Google UK English Female') || v.name.includes('Female')) ||
          voices.find((v) => v.lang.startsWith('en'));
      } else if (avatarObj.voiceGender === 'male_deep') {
        chosenVoice =
          voices.find((v) => v.name.includes('George') || v.name.includes('David') || v.name.includes('Guy') || v.name.includes('Google US English')) ||
          voices.find((v) => v.lang.startsWith('en'));
      } else {
        chosenVoice =
          voices.find((v) => v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Ravi')) ||
          voices.find((v) => v.lang.startsWith('en'));
      }

      if (chosenVoice) utterance.voice = chosenVoice;
      utterance.pitch = avatarObj.voicePitch || 1.0;
      utterance.rate = avatarObj.voiceRate || 1.0;

      utterance.onstart = () => {
        setActiveSpeakerId(avatarId);
        setParticipants((prev) =>
          prev.map((p) => ({ ...p, isSpeaking: p.id === avatarId }))
        );
      };

      utterance.onend = () => {
        setParticipants((prev) => prev.map((p) => ({ ...p, isSpeaking: false })));
        setActiveSpeakerId('student-1');
      };

      utterance.onerror = () => {
        setParticipants((prev) => prev.map((p) => ({ ...p, isSpeaking: false })));
        setActiveSpeakerId('student-1');
      };

      window.speechSynthesis.speak(utterance);
    },
    [isAvatarVoiceMuted]
  );

  // ── 3. Real-Time Web Audio API Mic Analyser (Gauges voice volume) ──
  useEffect(() => {
    let isCancelled = false;

    async function initAudioAnalyser() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        micStreamRef.current = stream;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!isCancelled && analyserRef.current && isMicActive) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((avg / 128) * 100));
            setAudioLevel(normalized);

            if (normalized > 14) {
              setActiveSpeakerId('student-1');
              setParticipants((prev) =>
                prev.map((p) => ({ ...p, isSpeaking: p.id === 'student-1' }))
              );
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                setParticipants((prev) =>
                  prev.map((p) => (p.id === 'student-1' ? { ...p, isSpeaking: false } : p))
                );
              }, 1200);
            }
          } else {
            setAudioLevel(0);
          }
          animFrameRef.current = requestAnimationFrame(checkAudio);
        };

        checkAudio();
      } catch (err) {
        console.warn('[GD Voice Analyser] Could not access microphone stream:', err);
      }
    }

    if (isMicActive) initAudioAnalyser();
    else setAudioLevel(0);

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, [isMicActive]);

  // ── 4. Trigger an Avatar to Respond to Student's Speech ──
  const triggerAvatarResponse = useCallback(
    (lastStudentSpeech) => {
      // Rotate among the 3 AI avatars
      const avatarKeys = ['ananya', 'vikram', 'rohan'];
      const chosenAvatarId = avatarKeys[Math.floor(Math.random() * avatarKeys.length)];
      const avatarMeta = GD_AVATARS.find((a) => a.id === chosenAvatarId) || GD_AVATARS[0];

      const argumentText = generateAvatarArgument(chosenAvatarId, topic.title, lastStudentSpeech, userName);

      const newEntry = {
        id: Date.now(),
        speakerId: chosenAvatarId,
        speakerName: avatarMeta.name,
        role: avatarMeta.role,
        avatar: avatarMeta.avatar,
        text: argumentText,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      };

      setTranscripts((prev) => [...prev, newEntry]);

      // Speak aloud via TTS
      speakAvatarSpeech(chosenAvatarId, argumentText);
    },
    [topic.title, userName, speakAvatarSpeech]
  );

  // ── 5. High-Accuracy Continuous Speech-to-Text STT ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[GD STT] SpeechRecognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      isRecognizingRef.current = true;
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const activeText = (final || interim).trim();
      if (activeText) {
        setLiveCandidateTranscript(activeText);
        setActiveSpeakerId('student-1');

        // Real-time Filler Word Detection
        const fillerList = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'kinda', 'sort of'];
        const words = activeText.toLowerCase().split(/\s+/);
        const count = words.filter((w) => fillerList.includes(w)).length;
        if (count > 0) {
          setFillersDetected((prev) => prev + count);
        }
      }

      if (final) {
        const finalCleaned = final.trim();
        const newEntry = {
          id: Date.now(),
          speakerId: 'student-1',
          speakerName: `${userName} (You)`,
          role: 'Candidate / Student',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
          text: finalCleaned,
          timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
        };

        setTranscripts((prev) => [...prev, newEntry]);
        setStudentContributions((prev) => [...prev, newEntry]);
        setLiveCandidateTranscript('');

        // Recalculate speech seconds
        const wordCount = finalCleaned.split(/\s+/).length;
        const estSecs = Math.max(4, Math.round((wordCount / 135) * 60));
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === 'student-1' ? { ...p, speechSeconds: (p.speechSeconds || 0) + estSecs } : p
          )
        );

        // Avatar responds automatically after 1.8 seconds!
        setTimeout(() => {
          triggerAvatarResponse(finalCleaned);
        }, 1800);
      }
    };

    recognition.onerror = (event) => {
      isRecognizingRef.current = false;
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      if (isMicActive && sessionStatus === 'running') {
        try {
          recognition.start();
        } catch (_) {}
      }
    };

    recognitionRef.current = recognition;

    if (isMicActive && sessionStatus === 'running') {
      try {
        recognition.start();
      } catch (_) {}
    }

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
      isRecognizingRef.current = false;
    };
  }, [isMicActive, sessionStatus, userName, triggerAvatarResponse]);

  // ── 6. Student Submits Manual Typed Argument ──
  const submitManualArgument = useCallback(
    (text) => {
      if (!text || !text.trim()) return;
      const cleaned = text.trim();

      const newEntry = {
        id: Date.now(),
        speakerId: 'student-1',
        speakerName: `${userName} (You)`,
        role: 'Candidate / Student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        text: cleaned,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      };

      setTranscripts((prev) => [...prev, newEntry]);
      setStudentContributions((prev) => [...prev, newEntry]);

      // Trigger Avatar rebuttal/response after 1.5 seconds
      setTimeout(() => {
        triggerAvatarResponse(cleaned);
      }, 1500);
    },
    [userName, triggerAvatarResponse]
  );

  // ── 7. Manually Prompt Next Avatar to Speak ──
  const promptNextAvatarToSpeak = useCallback(() => {
    const lastStudent = studentContributions[studentContributions.length - 1]?.text || '';
    triggerAvatarResponse(lastStudent);
  }, [studentContributions, triggerAvatarResponse]);

  // ── 8. Change Topic (Student Topic De OR Avatar Topic De) ──
  const setCustomStudentTopic = useCallback((topicTitle, topicDesc = '') => {
    const custom = {
      id: `gd-custom-${Date.now()}`,
      title: topicTitle.trim() || 'Custom Discussion Topic',
      category: 'Student Choice',
      description: topicDesc.trim() || 'Open discussion with AI avatars.',
      keyPoints: [
        'Present structured premise with real-world examples.',
        'Address ethical and technical tradeoffs.',
        'Formulate practical roadmap for resolution.',
      ],
    };
    setTopic(custom);
    setTimerSeconds(600);
    setTranscripts([
      {
        id: Date.now(),
        speakerId: 'rohan',
        speakerName: 'Rohan Sharma',
        role: 'Tech Optimist',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
        text: `Great choice of topic! We are now discussing: "${custom.title}". Let's start the round. Who would like to present their opening point?`,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      },
    ]);
    speakAvatarSpeech(
      'rohan',
      `Great choice of topic! We are now discussing: ${custom.title}. Please share your opening thoughts.`
    );
  }, [speakAvatarSpeech]);

  const setRandomAvatarChoiceTopic = useCallback(() => {
    const randomTopic = getRandomAvatarTopic();
    setTopic(randomTopic);
    setTimerSeconds(600);
    setTranscripts([
      {
        id: Date.now(),
        speakerId: 'ananya',
        speakerName: 'Ananya Roy',
        role: 'Balanced Analyst',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        text: `I have picked an engaging topic for us: "${randomTopic.title}". ${randomTopic.description} ${userName}, would you like to lead off with the opening argument?`,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      },
    ]);
    speakAvatarSpeech(
      'ananya',
      `I have selected our discussion topic: ${randomTopic.title}. Pragya, would you like to present your opening point?`
    );
  }, [userName, speakAvatarSpeech]);

  // ── 9. Generate Post-GD Performance Analysis for Modal ──
  const getFullAnalysisReport = useCallback(() => {
    return analyzeStudentGDPerformance(studentContributions, topic);
  }, [studentContributions, topic]);

  // Toggle mic
  const toggleMic = useCallback(() => {
    setIsMicActive((prev) => !prev);
  }, []);

  // Toggle mute avatar voices
  const toggleAvatarVoiceMute = useCallback(() => {
    setIsAvatarVoiceMuted((prev) => {
      if (!prev && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  }, []);

  return {
    topic,
    sessionStatus,
    timerSeconds,
    participants,
    activeSpeakerId,
    transcripts,
    isMicActive,
    audioLevel,
    liveCandidateTranscript,
    fillersDetected,
    isAvatarVoiceMuted,
    studentContributions,
    toggleMic,
    setIsMicActive,
    setSessionStatus,
    resetTimer,
    addMinutes,
    submitManualArgument,
    promptNextAvatarToSpeak,
    setCustomStudentTopic,
    setRandomAvatarChoiceTopic,
    selectTopic: (t) => {
      setTopic(t);
      setTimerSeconds(600);
    },
    getFullAnalysisReport,
    toggleAvatarVoiceMute,
  };
}
