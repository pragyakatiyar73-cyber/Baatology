import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GD_AVATARS,
  POPULAR_GD_TOPICS,
  getRandomAvatarTopic,
  generateAvatarArgument,
  analyzeStudentGDPerformance,
} from '../utils/gdFeedbackEngine';
import { useSpeechRecognition } from './useSpeechRecognition';

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
  const [isMicActive, setIsMicActive] = useState(true);
  const [liveCandidateTranscript, setLiveCandidateTranscript] = useState('');
  const [studentContributions, setStudentContributions] = useState([]);

  // 4 Core Participants: 1 Student (Host) + 3 AI Avatars (Rohan, Ananya, Vikram)
  // All 4 have distinct, realistic Indian college student personas and photos
  const [participants, setParticipants] = useState(() => [
    {
      id: 'student-1',
      name: `${userName} (You)`,
      seat: 'Student 1',
      role: 'Candidate / Student',
      perspective: 'Your Own Perspective',
      college: 'Host Seat',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces',
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
      seat: 'Student 2',
      role: 'Tech Optimist',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces',
      text: `Hello everyone! Welcome to today's group discussion on: "${initialTopic.title}". I believe rapid technological innovation creates tremendous opportunities for engineers. Let's open the discussion. ${userName}, would you like to present your opening stance?`,
      timestamp: '00:10',
    },
  ]);

  const timerIntervalRef = useRef(null);

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
        setActiveSpeakerId(avatarId);
        setParticipants((prev) =>
          prev.map((p) => ({ ...p, isSpeaking: p.id === avatarId }))
        );
        setTimeout(() => {
          setActiveSpeakerId('student-1');
          setParticipants((prev) => prev.map((p) => ({ ...p, isSpeaking: false })));
        }, 3200);
        return;
      }

      const avatarObj = GD_AVATARS.find((a) => a.id === avatarId) || GD_AVATARS[0];
      const utterance = new SpeechSynthesisUtterance(text);

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

  // ── 3. Trigger an Avatar to Respond to Student's Speech ──
  const triggerAvatarResponse = useCallback(
    (lastStudentSpeech) => {
      const avatarKeys = ['ananya', 'vikram', 'rohan'];
      const chosenAvatarId = avatarKeys[Math.floor(Math.random() * avatarKeys.length)];
      const avatarMeta = GD_AVATARS.find((a) => a.id === chosenAvatarId) || GD_AVATARS[0];

      const argumentText = generateAvatarArgument(chosenAvatarId, topic.title, lastStudentSpeech, userName);

      const newEntry = {
        id: Date.now(),
        speakerId: chosenAvatarId,
        speakerName: avatarMeta.name,
        seat: avatarMeta.seat,
        role: avatarMeta.role,
        college: avatarMeta.college,
        avatar: avatarMeta.avatar,
        text: argumentText,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      };

      setTranscripts((prev) => [...prev, newEntry]);
      speakAvatarSpeech(chosenAvatarId, argumentText);
    },
    [topic.title, userName, speakAvatarSpeech]
  );

  // ── 4. Handle Final Captured Speech from Student ──
  const handleFinalSpeech = useCallback(
    (speechText) => {
      if (!speechText || !speechText.trim()) return;
      const finalCleaned = speechText.trim();

      const newEntry = {
        id: Date.now(),
        speakerId: 'student-1',
        speakerName: `${userName} (You)`,
        seat: 'Student 1',
        role: 'Candidate / Student',
        college: 'Host Seat',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces',
        text: finalCleaned,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      };

      setTranscripts((prev) => [...prev, newEntry]);
      setStudentContributions((prev) => [...prev, newEntry]);
      setLiveCandidateTranscript('');

      // Update student speech seconds
      const wordCount = finalCleaned.split(/\s+/).length;
      const estSecs = Math.max(4, Math.round((wordCount / 135) * 60));
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === 'student-1' ? { ...p, speechSeconds: (p.speechSeconds || 0) + estSecs } : p
        )
      );

      // Trigger Avatar rebuttal/response after 1.5 seconds
      setTimeout(() => {
        triggerAvatarResponse(finalCleaned);
      }, 1500);
    },
    [userName, triggerAvatarResponse]
  );

  // ── 5. Integration of Proven useSpeechRecognition Hook ──
  const {
    startListening,
    stopListening,
    commitSpeech,
    audioLevel,
    language,
    toggleLanguage,
    permissionDenied,
    retryListening,
  } = useSpeechRecognition({
    onResult: handleFinalSpeech,
    onInterim: (interim) => {
      setLiveCandidateTranscript(interim);
      setActiveSpeakerId('student-1');
      setParticipants((prev) =>
        prev.map((p) => ({ ...p, isSpeaking: p.id === 'student-1' }))
      );
    },
    silenceDebounceMs: 1400,
  });

  // Keep recognition synchronized with isMicActive state
  useEffect(() => {
    if (isMicActive && sessionStatus === 'running') {
      startListening();
    } else {
      stopListening();
    }
  }, [isMicActive, sessionStatus, startListening, stopListening]);

  // Reset speaker badge when silence settles
  useEffect(() => {
    if (audioLevel < 10 && !liveCandidateTranscript && activeSpeakerId === 'student-1') {
      const timer = setTimeout(() => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === 'student-1' ? { ...p, isSpeaking: false } : p))
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [audioLevel, liveCandidateTranscript, activeSpeakerId]);

  // ── 6. Student Submits Manual Typed Argument ──
  const submitManualArgument = useCallback(
    (text) => {
      if (!text || !text.trim()) return;
      handleFinalSpeech(text);
    },
    [handleFinalSpeech]
  );

  // ── 7. Manually Prompt Next Avatar to Speak ──
  const promptNextAvatarToSpeak = useCallback(() => {
    const lastStudent = studentContributions[studentContributions.length - 1]?.text || '';
    triggerAvatarResponse(lastStudent);
  }, [studentContributions, triggerAvatarResponse]);

  // ── 8. Change Topic (Student Topic De OR Avatar Topic De) ──
  const setCustomStudentTopic = useCallback(
    (topicTitle, topicDesc = '') => {
      const custom = {
        id: `gd-custom-${Date.now()}`,
        title: topicTitle.trim() || 'Custom Discussion Topic',
        category: 'Student Choice',
        description: topicDesc.trim() || 'Open discussion with AI peers.',
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
          seat: 'Student 2',
          role: 'Tech Optimist',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces',
          text: `Great choice of topic! We are now discussing: "${custom.title}". Let's start the round. Who would like to present their opening point?`,
          timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
        },
      ]);
      speakAvatarSpeech(
        'rohan',
        `Great choice of topic! We are now discussing: ${custom.title}. Please share your opening thoughts.`
      );
    },
    [speakAvatarSpeech]
  );

  const setRandomAvatarChoiceTopic = useCallback(() => {
    const randomTopic = getRandomAvatarTopic();
    setTopic(randomTopic);
    setTimerSeconds(600);
    setTranscripts([
      {
        id: Date.now(),
        speakerId: 'ananya',
        speakerName: 'Ananya Roy',
        seat: 'Student 3',
        role: 'Balanced Analyst',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces',
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

  // Replace seat with friend or reset back to AI
  const replaceSeatWithFriend = useCallback(({ targetSeatId, name, college, avatar }) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === targetSeatId) {
          return {
            ...p,
            name: `${name} (Friend)`,
            college: college || 'College Friend',
            avatar: avatar || p.avatar,
            isRealFriend: true,
            badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          };
        }
        return p;
      })
    );
  }, []);

  const resetSeatsToDefaultAI = useCallback(() => {
    setParticipants([
      {
        id: 'student-1',
        name: `${userName} (You)`,
        seat: 'Student 1',
        role: 'Candidate / Student',
        perspective: 'Your Own Perspective',
        college: 'Host Seat',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces',
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
  }, [userName]);

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
    isAvatarVoiceMuted,
    studentContributions,
    language,
    toggleLanguage,
    permissionDenied,
    retryListening,
    commitSpeech,
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
    replaceSeatWithFriend,
    resetSeatsToDefaultAI,
  };
}
