import { useState, useEffect, useRef, useCallback } from 'react';

export const DEFAULT_GD_TOPIC = {
  id: 'gd-ai-healthcare',
  title: 'Artificial Intelligence in Healthcare: Boon or Threat?',
  category: 'Technology & Ethics',
  description: 'Debating diagnostic precision, doctor displacement, data privacy, and ethical accountability in automated medical care.',
  keyPoints: [
    'Early cancer detection and radiological precision save thousands of lives.',
    'Risk of algorithmic bias in patient diagnosis and insurance underwriting.',
    'Human doctor empathy vs robotic decision making.',
  ],
};

export const INITIAL_PARTICIPANTS = [
  {
    id: 'student-1',
    name: 'Student 1 (Host)',
    role: 'Host / Candidate',
    college: 'Candidate Seat',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces',
    isSpeaking: false,
    isLocalUser: true,
    speechSeconds: 75,
  },
  {
    id: 'student-2',
    name: 'Student 2',
    role: 'Peer Evaluator',
    college: 'IIT Delhi',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces',
    isSpeaking: false,
    isLocalUser: false,
    speechSeconds: 60,
  },
  {
    id: 'student-3',
    name: 'Student 3',
    role: 'Peer Participant',
    college: 'BITS Pilani',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces',
    isSpeaking: false,
    isLocalUser: false,
    speechSeconds: 50,
  },
  {
    id: 'student-4',
    name: 'Student 4',
    role: "Devil's Advocate",
    college: 'NIT Trichy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
    isSpeaking: false,
    isLocalUser: false,
    speechSeconds: 55,
  },
];

export function useGroupDiscussionSession({
  userName = 'Student 1 (Host)',
  initialTopic = DEFAULT_GD_TOPIC,
} = {}) {
  const [topic, setTopic] = useState(initialTopic);
  const [sessionStatus, setSessionStatus] = useState('running'); // 'idle' | 'running' | 'paused'
  const [timerSeconds, setTimerSeconds] = useState(600); // 10:00 minutes
  const [participants, setParticipants] = useState(() => {
    return INITIAL_PARTICIPANTS.map((p) =>
      p.isLocalUser ? { ...p, name: `${userName} (Host)` } : p
    );
  });
  const [activeSpeakerId, setActiveSpeakerId] = useState('student-1');
  const [inviteCode, setInviteCode] = useState('GD-741-KLP');
  const [codeCopied, setCodeCopied] = useState(false);

  // Live Discussion Transcripts
  const [transcripts, setTranscripts] = useState([
    {
      id: 1,
      speakerId: 'student-1',
      speakerName: `${userName} (Host)`,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces',
      text: 'Good morning everyone. Today we are discussing whether AI in healthcare serves as a boon or a threat to patient outcomes.',
      timestamp: '00:15',
    },
    {
      id: 2,
      speakerId: 'student-2',
      speakerName: 'Student 2',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces',
      text: 'I strongly agree with starting on precision diagnostics. AI radiograms have reduced diagnostic false negatives by 24%.',
      timestamp: '00:45',
    },
    {
      id: 3,
      speakerId: 'student-4',
      speakerName: 'Student 4',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
      text: 'While precision is commendable, ethical accountability and insurance algorithmic bias remain critical hazards.',
      timestamp: '01:20',
    },
  ]);

  // Candidate Mic & Live STT
  const [isMicActive, setIsMicActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0); // 0-100 real-time microphone level
  const [liveCandidateTranscript, setLiveCandidateTranscript] = useState('');
  const [fillersDetected, setFillersDetected] = useState(0);

  // Poll state
  const [activePoll, setActivePoll] = useState({
    id: 'poll-1',
    question: 'Should AI medical decisions require mandatory human doctor oversight?',
    options: [
      { text: 'Yes, mandatory sign-off', votes: 3 },
      { text: 'No, full autonomy for speed', votes: 1 },
    ],
    userVotedIndex: null,
  });

  // Notes state with persistence
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem('gd_session_notes') || '';
    } catch {
      return '';
    }
  });

  // AI Telemetry
  const [aiAnalysis, setAiAnalysis] = useState({
    airTimePct: 28,
    targetAirTimePct: 25,
    airTimeStatus: 'Balanced',
    articulationScore: 92,
    teamPlayerScore: 94,
    fillersCount: 0,
    wpm: 136,
    tip: 'Acknowledge Student 4’s point on ethical accountability before introducing your counter-argument on patient affordability.',
  });

  // Internal refs
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // ── 1. Countdown Timer Controls ──
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

  const resetTimer = useCallback(() => {
    setTimerSeconds(600);
  }, []);

  const addMinutes = useCallback((mins = 2) => {
    setTimerSeconds((prev) => prev + mins * 60);
  }, []);

  // ── 2. Real-Time Web Audio API Mic Analyser (Instant Voice Detection) ──
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
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((avg / 128) * 100));
            setAudioLevel(normalized);

            // If voice level > 12, host student is actively speaking
            if (normalized > 12) {
              setActiveSpeakerId('student-1');
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                // If quiet for 2.5 seconds, leave active or idle
              }, 2500);
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

    if (isMicActive) {
      initAudioAnalyser();
    } else {
      setAudioLevel(0);
    }

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isMicActive]);

  // ── 3. High-Accuracy Continuous Speech-to-Text STT ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[GD STT] SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    // 'en-IN' provides outstanding recognition for Indian English, technical terms, and Hinglish
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
          setFillersDetected((prev) => {
            const updated = prev + count;
            setAiAnalysis((prevAi) => ({ ...prevAi, fillersCount: updated }));
            return updated;
          });
        }
      }

      if (final) {
        const finalCleaned = final.trim();
        // Append candidate contribution to transcript
        const newEntry = {
          id: Date.now(),
          speakerId: 'student-1',
          speakerName: `${userName} (Host)`,
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces',
          text: finalCleaned,
          timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
        };

        setTranscripts((prev) => [...prev, newEntry]);
        setLiveCandidateTranscript('');

        // Recalculate candidate WPM & Air-time
        const wordCount = finalCleaned.split(/\s+/).length;
        const estimatedSeconds = Math.max(4, Math.round((wordCount / 135) * 60));

        setParticipants((prev) =>
          prev.map((p) =>
            p.id === 'student-1'
              ? { ...p, speechSeconds: (p.speechSeconds || 0) + estimatedSeconds }
              : p
          )
        );

        // Update AI Analysis
        setAiAnalysis((prev) => {
          const newWpm = Math.min(180, Math.max(105, Math.round(wordCount > 3 ? (wordCount / (estimatedSeconds / 60)) : prev.wpm)));
          return {
            ...prev,
            wpm: newWpm,
            airTimePct: Math.min(65, prev.airTimePct + 2),
            articulationScore: Math.min(98, prev.articulationScore + (wordCount > 10 ? 1 : 0)),
          };
        });

        // Trigger intelligent peer student rebuttal/support after 3 seconds
        setTimeout(() => {
          triggerPeerResponse(finalCleaned);
        }, 3200);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        console.warn('[GD STT] Mic permission denied.');
      }
      isRecognizingRef.current = false;
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      // Auto-restart watchdog if mic should be active
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
  }, [isMicActive, sessionStatus, userName]);

  // ── 4. Peer Student Dynamic Turn-Taking (Contextual AI Arguments) ──
  const triggerPeerResponse = useCallback(
    async (lastCandidateSpeech) => {
      // Pick a random peer who is NOT the host
      const peerCandidates = participants.filter((p) => !p.isLocalUser);
      if (peerCandidates.length === 0) return;

      const randomPeer = peerCandidates[Math.floor(Math.random() * peerCandidates.length)];
      setActiveSpeakerId(randomPeer.id);

      // Mark peer speaking
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          isSpeaking: p.id === randomPeer.id,
        }))
      );

      try {
        const res = await fetch('http://localhost:3001/api/gd/argument', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic.title,
            speaker: randomPeer.name,
            studentSpeech: lastCandidateSpeech,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.argument) {
            setTranscripts((prev) => [
              ...prev,
              {
                id: Date.now(),
                speakerId: randomPeer.id,
                speakerName: randomPeer.name,
                avatar: randomPeer.avatar,
                text: data.argument,
                timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
              },
            ]);

            // Update peer speaking seconds
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === randomPeer.id
                  ? { ...p, speechSeconds: (p.speechSeconds || 0) + 12 }
                  : p
              )
            );
          }
        }
      } catch (_) {
        // Fallback argument if offline
        const fallbackText = `Building on what was just mentioned regarding ${topic.title}, we must evaluate scalability and accessibility for all stakeholders involved.`;
        setTranscripts((prev) => [
          ...prev,
          {
            id: Date.now(),
            speakerId: randomPeer.id,
            speakerName: randomPeer.name,
            avatar: randomPeer.avatar,
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          },
        ]);
      }

      // Reset speaker indicator to candidate after 4 seconds
      setTimeout(() => {
        setActiveSpeakerId('student-1');
        setParticipants((prev) =>
          prev.map((p) => ({ ...p, isSpeaking: false }))
        );
      }, 4500);
    },
    [participants, topic.title]
  );

  // ── 5. Add Dynamic Student to Roundtable ──
  const addParticipant = useCallback((newStudent) => {
    setParticipants((prev) => [...prev, newStudent]);

    // Add welcoming transcript message
    setTranscripts((prev) => [
      ...prev,
      {
        id: Date.now(),
        isSystem: true,
        speakerName: 'System',
        text: `✨ ${newStudent.name} (${newStudent.role}${newStudent.college ? ` • ${newStudent.college}` : ''}) joined the roundtable!`,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      },
    ]);
  }, []);

  // ── 6. Remove Student from Roundtable ──
  const removeParticipant = useCallback((studentId) => {
    setParticipants((prev) => prev.filter((p) => p.id !== studentId));
  }, []);

  // ── 7. Manual Argument Submission (Text Input) ──
  const submitManualArgument = useCallback(
    (text) => {
      if (!text || !text.trim()) return;
      const clean = text.trim();
      const newEntry = {
        id: Date.now(),
        speakerId: 'student-1',
        speakerName: `${userName} (Host)`,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces',
        text: clean,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      };
      setTranscripts((prev) => [...prev, newEntry]);

      // Trigger peer response
      setTimeout(() => {
        triggerPeerResponse(clean);
      }, 2500);
    },
    [triggerPeerResponse, userName]
  );

  // ── 8. Poll Voting ──
  const votePoll = useCallback((optionIndex) => {
    setActivePoll((prev) => {
      if (prev.userVotedIndex !== null) return prev; // already voted
      const updatedOptions = prev.options.map((opt, i) =>
        i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
      );
      return {
        ...prev,
        options: updatedOptions,
        userVotedIndex: optionIndex,
      };
    });
  }, []);

  // ── 9. Notes Persistence ──
  const updateNotes = useCallback((newText) => {
    setNotes(newText);
    try {
      localStorage.setItem('gd_session_notes', newText);
    } catch (_) {}
  }, []);

  // ── 10. Copy Invite Code ──
  const copyInviteCode = useCallback(() => {
    navigator.clipboard?.writeText?.(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  }, [inviteCode]);

  // ── 11. Add Custom Point to Board ──
  const addBulletPoint = useCallback((newBullet) => {
    if (!newBullet || !newBullet.trim()) return;
    setTopic((prev) => ({
      ...prev,
      keyPoints: [...(prev.keyPoints || []), newBullet.trim()],
    }));
  }, []);

  // ── 12. Delete Point from Board ──
  const removeBulletPoint = useCallback((index) => {
    setTopic((prev) => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index),
    }));
  }, []);

  // ── 13. Select New Topic ──
  const selectTopic = useCallback((newTopic) => {
    setTopic(newTopic);
    setTimerSeconds(600);
    setTranscripts([
      {
        id: Date.now(),
        isSystem: true,
        speakerName: 'System',
        text: `📋 Topic updated to: "${newTopic.title}"`,
        timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      },
    ]);
  }, []);

  // Toggle mic active
  const toggleMic = useCallback(() => {
    setIsMicActive((prev) => !prev);
  }, []);

  return {
    topic,
    sessionStatus,
    timerSeconds,
    participants,
    activeSpeakerId,
    inviteCode,
    codeCopied,
    transcripts,
    isMicActive,
    audioLevel,
    liveCandidateTranscript,
    aiAnalysis,
    fillersDetected,
    activePoll,
    notes,
    toggleMic,
    setIsMicActive,
    setSessionStatus,
    resetTimer,
    addMinutes,
    addParticipant,
    removeParticipant,
    submitManualArgument,
    votePoll,
    updateNotes,
    copyInviteCode,
    addBulletPoint,
    removeBulletPoint,
    selectTopic,
    setActiveSpeakerId,
  };
}
