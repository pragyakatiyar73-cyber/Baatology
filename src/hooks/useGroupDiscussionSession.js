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
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces',
    isSpeaking: true,
    isLocalUser: true,
    speechSeconds: 75,
  },
  {
    id: 'student-2',
    name: 'Student 2',
    role: 'Peer Evaluator',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces',
    isSpeaking: true,
    isLocalUser: false,
    speechSeconds: 60,
  },
  {
    id: 'student-3',
    name: 'Student 3',
    role: 'Peer Participant',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces',
    isSpeaking: false,
    isLocalUser: false,
    speechSeconds: 50,
  },
  {
    id: 'student-4',
    name: 'Student 4',
    role: 'Peer Participant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
    isSpeaking: true,
    isLocalUser: false,
    speechSeconds: 55,
  },
];

export function useGroupDiscussionSession({
  userName = 'John Chey',
  initialTopic = DEFAULT_GD_TOPIC,
} = {}) {
  const [topic, setTopic] = useState(initialTopic);
  const [sessionStatus, setSessionStatus] = useState('running'); // 'idle' | 'running' | 'paused'
  const [timerSeconds, setTimerSeconds] = useState(600); // 10:00 minutes
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [activeSpeakerId, setActiveSpeakerId] = useState('student-1');
  const [inviteCode, setInviteCode] = useState('GD-741-KLP');
  const [codeCopied, setCodeCopied] = useState(false);

  // Live Discussion Transcripts
  const [transcripts, setTranscripts] = useState([
    {
      id: 1,
      speakerId: 'student-1',
      speakerName: 'Student 1 (Host)',
      text: 'Good morning everyone. Today we are discussing whether AI in healthcare serves as a boon or a threat to patient outcomes.',
      timestamp: '00:15',
    },
    {
      id: 2,
      speakerId: 'student-2',
      speakerName: 'Student 2',
      text: 'I strongly agree with starting on precision diagnostics. AI radiograms have reduced diagnostic false negatives by 24%.',
      timestamp: '00:45',
    },
    {
      id: 3,
      speakerId: 'student-4',
      speakerName: 'Student 4',
      text: 'While precision is commendable, ethical accountability and insurance algorithmic bias remain critical hazards.',
      timestamp: '01:20',
    },
  ]);

  // Candidate Mic & Live STT
  const [isMicActive, setIsMicActive] = useState(true);
  const [liveCandidateTranscript, setLiveCandidateTranscript] = useState('');
  const [fillersDetected, setFillersDetected] = useState(0);

  // AI Thought & Telemetry
  const [aiAnalysis, setAiAnalysis] = useState({
    airTimePct: 31,
    targetAirTimePct: 25,
    airTimeStatus: 'Balanced',
    articulationScore: 92,
    teamPlayerScore: 94,
    fillersCount: 1,
    wpm: 138,
    tip: 'Acknowledge Student 4’s point on ethical accountability before introducing your counter-argument on patient affordability.',
  });

  const recognitionRef = useRef(null);
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

  // ── 2. Speech-to-Text STT for Candidate (Student 1) ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

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

        // Check for fillers
        const fillers = ['um', 'uh', 'like', 'actually', 'basically'];
        const words = activeText.toLowerCase().split(/\s+/);
        const count = words.filter((w) => fillers.includes(w)).length;
        if (count > 0) setFillersDetected((prev) => prev + count);
      }

      if (final) {
        // Append candidate's contribution to transcript feed
        const newEntry = {
          id: Date.now(),
          speakerId: 'student-1',
          speakerName: `${userName} (Host)`,
          text: final.trim(),
          timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
        };
        setTranscripts((prev) => [...prev, newEntry]);
        setLiveCandidateTranscript('');

        // Trigger an AI peer student response after 4-6 seconds
        setTimeout(() => {
          triggerPeerResponse(final.trim());
        }, 3500);
      }
    };

    recognition.onend = () => {
      if (isMicActive && sessionStatus === 'running') {
        try {
          recognition.start();
        } catch (_) {}
      }
    };

    recognitionRef.current = recognition;

    if (isMicActive) {
      try {
        recognition.start();
      } catch (_) {}
    }

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, [isMicActive, sessionStatus, userName]);

  // ── 3. Simulated Peer Student Turn-Taking ──
  const triggerPeerResponse = useCallback(
    async (lastCandidateSpeech) => {
      const peers = ['Student 2', 'Student 3', 'Student 4'];
      const randomSpeaker = peers[Math.floor(Math.random() * peers.length)];
      const speakerId = randomSpeaker === 'Student 2' ? 'student-2' : randomSpeaker === 'Student 3' ? 'student-3' : 'student-4';

      setActiveSpeakerId(speakerId);

      try {
        const res = await fetch('http://localhost:3001/api/gd/argument', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic.title,
            speaker: randomSpeaker,
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
                speakerId,
                speakerName: randomSpeaker,
                text: data.argument,
                timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
              },
            ]);
          }
        }
      } catch (_) {
        // Offline fallback
        const fallbackText = `Building upon the point regarding ${topic.title}, we must ensure equitable deployment across emerging industries.`;
        setTranscripts((prev) => [
          ...prev,
          {
            id: Date.now(),
            speakerId,
            speakerName: randomSpeaker,
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          },
        ]);
      }

      // Reset speaker indicator to active listener after speaking
      setTimeout(() => {
        setActiveSpeakerId('student-1');
      }, 5000);
    },
    [topic.title]
  );

  // ── 4. Copy Invite Code ──
  const copyInviteCode = useCallback(() => {
    navigator.clipboard?.writeText?.(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  }, [inviteCode]);

  // ── 5. Add Custom Point to Board ──
  const addBulletPoint = useCallback((newBullet) => {
    if (!newBullet || !newBullet.trim()) return;
    setTopic((prev) => ({
      ...prev,
      keyPoints: [...prev.keyPoints, newBullet.trim()],
    }));
  }, []);

  // ── 6. Select New Topic ──
  const selectTopic = useCallback((newTopic) => {
    setTopic(newTopic);
    setTimerSeconds(600);
    setTranscripts([]);
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
    liveCandidateTranscript,
    aiAnalysis,
    fillersDetected,
    setIsMicActive,
    setSessionStatus,
    copyInviteCode,
    addBulletPoint,
    selectTopic,
  };
}
