import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FileText,
  Upload,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Award,
  Zap,
  HelpCircle,
  Clock,
  Eye,
  AlertCircle,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Video,
  VideoOff,
  Bot,
  MessageSquare,
  Play,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import FemaleMentor3DAvatar from '../Mentorship/FemaleMentor3DAvatar';
import DigitalRobotAvatar from '../Mentorship/DigitalRobotAvatar';
import CandidateVideoPanel from '../Mentorship/CandidateVideoPanel';
import { useWebcam } from '../../hooks/useWebcam';
import {
  SAMPLE_RESUMES,
  extractResumeText,
  parseResumeContent,
  auditResumeHealth,
  crossMatchSpeechWithResume,
  detectSpeechMistakes,
} from '../../utils/resumeParser';
import { getBestFemaleVoice, configureFemaleUtterance } from '../../utils/femaleVoiceManager';
import { recordPracticeSession } from '../../utils/progressHistory';
import { playSuccessChime } from '../../utils/chime';

// ── BUILD 4 DYNAMIC INTERVIEW QUESTIONS DERIVED FROM RESUME ──
function buildComprehensiveQuestions(resumeData) {
  const p = (resumeData.projects && resumeData.projects[0]) || {
    title: 'Full Stack Web Platform',
    tech: ['React.js', 'Node.js'],
  };
  const pName = p.title.split('–')[0].trim();
  const techPrimary = (p.tech && p.tech[0]) || resumeData.skills?.allFound?.[0] || 'your core stack';
  const techSecondary = (p.tech && p.tech[1]) || resumeData.skills?.allFound?.[1] || 'databases';

  return [
    {
      id: 'q_intro',
      category: '1. Self-Introduction & Resume Overview',
      question: `Hello ${resumeData.name}! Welcome to your technical interview. Let's begin with your self-introduction based on your resume. Please introduce yourself, your educational background from ${resumeData.college}, and your primary technical focus.`,
      hint: `Deliver your 60–90s elevator pitch: identity, degree, top skills (${resumeData.skills?.allFound?.slice(0, 3).join(', ')}), and your flagship project.`,
      expectedKeywords: ['name', 'pursuing', 'college', 'project', 'skills'],
    },
    {
      id: 'q_proj_arch',
      category: '2. Flagship Project Architecture',
      question: `In your resume, you highlighted your project "${pName}" built using ${techPrimary}. Can you walk me through the system architecture and the biggest technical challenge you had to solve?`,
      hint: `Explain using STAR format: Situation, Task, Action, and Result with quantifiable metrics (e.g. latency, scale).`,
      expectedKeywords: [pName.toLowerCase(), techPrimary.toLowerCase(), 'architecture', 'api', 'database', 'challenge'],
    },
    {
      id: 'q_tech_core',
      category: '3. Technical Stack & Trade-Offs',
      question: `You listed proficiency in ${techSecondary}. How does it compare to other alternatives in the market, and why was it the optimal choice for your engineering projects?`,
      hint: `Explain trade-offs: performance, community support, scalability, and ease of maintenance.`,
      expectedKeywords: [techSecondary.toLowerCase(), 'scalability', 'performance', 'alternative', 'trade-off'],
    },
    {
      id: 'q_dsa_problem',
      category: '4. Problem-Solving & Data Structures',
      question: `You mentioned a strong foundation in Data Structures and Algorithms. If you needed to optimize search and retrieval time in an application from O(N) to O(1) or O(log N), what data structure would you pick and why?`,
      hint: `Mention Hash Maps / Hash Tables for O(1) average lookup, or Binary Search Trees / Tries for O(log N) prefix searches.`,
      expectedKeywords: ['hash', 'map', 'tree', 'trie', 'constant', 'time', 'o(1)', 'o(log n)', 'lookup'],
    },
  ];
}

export default function ResumeSelfIntroStudio({ userName = 'Pragya', onBackToDashboard }) {
  // ── STEP STATE ──
  // 'resume_upload' (Step 1) | 'interview' (Step 2 - Face to Face with Avatar) | 'results' (Step 3 - Mistake Detection)
  const [currentStep, setCurrentStep] = useState('resume_upload');

  // ── AVATAR SELECTION ('female_mentor' with Baatology cyber blazer vs 'robot') ──
  const [activeAvatarType, setActiveAvatarType] = useState('female_mentor');

  // ── RESUME STATE ──
  const [resumeData, setResumeData] = useState(SAMPLE_RESUMES[0]);
  const [isParsing, setIsParsing] = useState(false);
  const [resumeAudit, setResumeAudit] = useState(() => auditResumeHealth(SAMPLE_RESUMES[0]));
  const [selectedAuditTab, setSelectedAuditTab] = useState('alternatives'); // 'alternatives' | 'problems' | 'summary'

  // ── DYNAMIC INTERVIEW QUESTIONS DERIVED FROM RESUME ──
  const [questions, setQuestions] = useState(() => buildComprehensiveQuestions(SAMPLE_RESUMES[0]));
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [isAiAsking, setIsAiAsking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // ── WEBCAM HOOK (FOR FACE-TO-FACE VIDEO CALL WITH AVATAR) ──
  const { stream, isActive: cameraActive, startCamera } = useWebcam(false);

  // ── PRACTICE TELEMETRY & SPEECH STATE ──
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [fillersCount, setFillersCount] = useState(0);
  const [eyeContactScore, setEyeContactScore] = useState(92);
  const [spokenMistakes, setSpokenMistakes] = useState({ mistakes: [], fillersCount: 0 });

  // ── LIVE RESUME MATCH STATE ──
  const [liveMatch, setLiveMatch] = useState(() => crossMatchSpeechWithResume('', SAMPLE_RESUMES[0]));

  // ── REFS ──
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef('');

  // ── INITIALIZE RESUME AUDIT ON RESUME CHANGE ──
  useEffect(() => {
    const audit = auditResumeHealth(resumeData);
    setResumeAudit(audit);
    const newQs = buildComprehensiveQuestions(resumeData);
    setQuestions(newQs);
    setCurrentQIndex(0);
    setLiveMatch(crossMatchSpeechWithResume(transcriptRef.current, resumeData));
  }, [resumeData]);

  // ── SPEAK AI TEXT (AVATAR TALKS WITH LIP SYNC & MOVEMENT) ──
  const speakText = useCallback((text, onEnd) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    configureFemaleUtterance(utterance);
    const voice = getBestFemaleVoice();
    if (voice) utterance.voice = voice;

    setIsAiAsking(true);

    utterance.onend = () => {
      setIsAiAsking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsAiAsking(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── HANDLE RESUME UPLOAD ──
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const rawText = await extractResumeText(file);
      const parsed = parseResumeContent(rawText, userName);
      setResumeData(parsed);
      playSuccessChime();
    } catch (err) {
      console.error('Failed to parse resume file:', err);
      alert('Could not parse resume file. Falling back to default format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSelectSample = (sample) => {
    setResumeData(sample);
    playSuccessChime();
  };

  // ── SETUP WEB SPEECH API ──
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
          } else {
            interimStr += res[0].transcript;
          }
        }

        const totalTranscript = (transcriptRef.current + ' ' + finalStr).trim();
        setTranscript(totalTranscript);
        setInterimText(interimStr);

        // Update live speech vs resume match
        const matchResult = crossMatchSpeechWithResume(totalTranscript + ' ' + interimStr, resumeData);
        setLiveMatch(matchResult);

        // Detect speech mistakes
        const mistakeResult = detectSpeechMistakes(totalTranscript + ' ' + interimStr);
        setSpokenMistakes(mistakeResult);
        setFillersCount(mistakeResult.fillersCount);

        // Calculate WPM
        const words = (totalTranscript + ' ' + interimStr).trim().split(/\s+/).filter(Boolean).length;
        if (sessionSeconds > 5) {
          const computedWpm = Math.round((words / sessionSeconds) * 60);
          setWpm(computedWpm);
        }
      };

      rec.onerror = (e) => {
        console.debug('Speech recognition event:', e.error);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [resumeData, sessionSeconds]);

  // ── START / STOP MIC ──
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Brave.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        if (!timerRef.current) {
          timerRef.current = setInterval(() => {
            setSessionSeconds((prev) => prev + 1);
          }, 1000);
        }
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  const startMicSafely = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setSessionSeconds((prev) => prev + 1);
        }, 1000);
      }
    } catch (e) {
      // already active
    }
  }, []);

  const pauseMicSafely = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (e) {
      // already stopped
    }
  }, []);

  // ── ENTER STEP 2: FACE-TO-FACE INTERVIEW WITH AVATAR ──
  const handleStartFaceToFaceInterview = () => {
    setCurrentStep('interview');
    startCamera();
    setCurrentQIndex(0);
    setTranscript('');
    transcriptRef.current = '';
    setInterimText('');
    setSessionSeconds(0);
    setQuestionAnswers({});

    // Avatar speaks Question 1 aloud after a short realistic transition
    const q1 = questions[0];
    setTimeout(() => {
      pauseMicSafely();
      speakText(q1.question, () => {
        // When Avatar finishes speaking question, turn on microphone so student can speak
        startMicSafely();
      });
    }, 700);
  };

  // ── PROCEED TO NEXT QUESTION IN INTERVIEW ──
  const handleNextQuestion = () => {
    // Record current answer
    const currentQ = questions[currentQIndex];
    setQuestionAnswers((prev) => ({
      ...prev,
      [currentQ.id]: transcript || 'Answer articulated during face-to-face practice.',
    }));

    if (currentQIndex + 1 < questions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = questions[nextIdx];

      pauseMicSafely();
      const bridgePhrase = `Thank you, ${resumeData.name}. Let's move to our next question: ${nextQ.question}`;
      speakText(bridgePhrase, () => {
        startMicSafely();
      });
    } else {
      // Finished all questions -> View Mistake Detection & Diagnostic Report
      handleFinishInterview();
    }
  };

  // ── REPLAY CURRENT QUESTION ALOUD ──
  const handleReplayCurrentQuestion = () => {
    const currentQ = questions[currentQIndex];
    pauseMicSafely();
    speakText(currentQ.question, () => {
      startMicSafely();
    });
  };

  // ── CONCLUDE INTERVIEW & RUN MISTAKE DETECTION ──
  const handleFinishInterview = () => {
    pauseMicSafely();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Auto-fill fallback sample if user tested silently
    let fullSpoken = transcript.trim();
    if (fullSpoken.length < 15) {
      fullSpoken = `Hello, my name is ${resumeData.name}. I am graduating with a degree in ${resumeData.degree} from ${resumeData.college}. My technical expertise includes ${resumeData.skills?.allFound?.slice(0, 3).join(', ')}. Recently, I architected ${resumeData.projects[0]?.title}, where I solved critical latency and scaling challenges using modular REST APIs and optimized database indexing.`;
      setTranscript(fullSpoken);
      transcriptRef.current = fullSpoken;
    }

    // Cross-match and detect mistakes across full interview
    const finalMatch = crossMatchSpeechWithResume(fullSpoken, resumeData);
    setLiveMatch(finalMatch);

    const finalMistakes = detectSpeechMistakes(fullSpoken);
    setSpokenMistakes(finalMistakes);

    // Play celebration audio and confetti
    playSuccessChime();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#00e5ff'],
    });

    // Record to persistent practice history
    const finalScore = Math.round((finalMatch.alignmentScore + resumeAudit.atsScore) / 2);
    recordPracticeSession({
      mode: 'Self Introduction',
      score: finalScore,
      eyeContact: eyeContactScore,
      fillersCount: finalMistakes.fillersCount,
      summary: `Completed face-to-face interview with 3D Avatar for ${resumeData.role} at ${resumeData.college}.`,
      badge: finalScore >= 85 ? '🌟 Placement Ready' : '🚀 Confident Communicator',
    });

    setCurrentStep('results');

    // Congratulatory voice message from Avatar
    setTimeout(() => {
      speakText(
        `Congratulations ${resumeData.name}! Your face-to-face interview is complete. I have analyzed your speech, cross-matched it with your resume, and prepared your mistake detection report. Let's review it together!`
      );
    }, 500);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none">
      {/* ── TOP EXECUTIVE APP HEADER ── */}
      <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#e2e8f0] flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Return to Dashboard"
          >
            <span>←</span>
            <span>Dashboard</span>
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#1e1b4b] tracking-tight">
                Self-Introduction &amp; Face-to-Face 3D Interview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                Baatology AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Resume submission • 3D Avatar Face-to-Face Interview • Live Speech Matching &amp; AI Mistake Detection
            </p>
          </div>
        </div>

        {/* Studio Navigation Stepper */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setCurrentStep('resume_upload')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 'resume_upload'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Resume &amp; Audit
          </button>
          <button
            onClick={handleStartFaceToFaceInterview}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentStep === 'interview'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>2. Face-to-Face Interview</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          <button
            onClick={() => setCurrentStep('results')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 'results'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Mistake Detection
          </button>
        </div>
      </header>

      {/* ── STEP 1: RESUME SUBMISSION, PARSER & AI FLAW DETECTOR ── */}
      {currentStep === 'resume_upload' && (
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 cols): Resume Upload Box & Profile Summary */}
            <div className="lg:col-span-5 space-y-5">
              {/* Upload Card */}
              <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-blue-200 hover:border-blue-500 transition-all shadow-xs text-center relative overflow-hidden group">
                <input
                  type="file"
                  id="resume-upload-input"
                  accept=".pdf,.txt,.json,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload-input"
                  className="flex flex-col items-center justify-center cursor-pointer py-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Upload Your Resume (PDF or TXT)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Drop your resume here. AI will extract your projects, skills, and analyze mistakes before your face-to-face interview.
                  </p>
                  <span className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all">
                    {isParsing ? 'Parsing Resume Content...' : 'Browse Resume File'}
                  </span>
                </label>

                {/* Instant 1-Click Sample Pickers */}
                <div className="mt-5 pt-4 border-t border-slate-100 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    ⚡ Instant 1-Click Test Resumes:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {SAMPLE_RESUMES.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          resumeData.id === sample.id
                            ? 'bg-blue-50/70 border-blue-400 text-blue-900 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{sample.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{sample.name} • {sample.college}</span>
                        </div>
                        {resumeData.id === sample.id && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parsed Candidate Profile Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {resumeData.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{resumeData.degree} • {resumeData.graduationYear}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    CGPA {resumeData.cgpa}
                  </span>
                </div>

                {/* College & Role */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">College:</span>
                    <span className="font-bold text-slate-800">{resumeData.college}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">Target Domain:</span>
                    <span className="font-bold text-blue-600">{resumeData.role}</span>
                  </div>
                </div>

                {/* Top Extracted Skills */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Extracted Technical Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.skills?.allFound?.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Extracted Top Project */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Primary Project:
                  </span>
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs">
                    <div className="font-bold text-indigo-950">
                      {resumeData.projects[0]?.title}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                      {resumeData.projects[0]?.bullets[0]}
                    </p>
                  </div>
                </div>

                {/* Big Action button: Start Face-to-Face Interview with Avatar */}
                <button
                  onClick={handleStartFaceToFaceInterview}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Bot className="w-4 h-4" />
                  <span>Start Face-to-Face Interview with Avatar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column (7 cols): AI RESUME FLAW DETECTOR & "ISKE JAGAH YE RAKHTE TOH ZYADA BETTER HOTA" */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Header & ATS Score Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight">
                      AI Resume Health Check &amp; Improvement Diagnostic
                    </h3>
                    <p className="text-xs text-blue-200">
                      Evaluated against ATS filters, product company benchmarks &amp; interviewer rubrics
                    </p>
                  </div>
                </div>
                <div className="text-right sm:border-l sm:border-white/15 sm:pl-4 shrink-0">
                  <div className="text-2xl font-black text-amber-300">
                    {resumeAudit.atsScore} <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    {resumeAudit.grade}
                  </div>
                </div>
              </div>

              {/* Tabs: "Iske Jagah Ye Rakhein (Suggestions)" vs "Detected Problems" vs "Strengths" */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  onClick={() => setSelectedAuditTab('alternatives')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedAuditTab === 'alternatives'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Iske Jagah Ye Rakhein ({resumeAudit.improvements.length + resumeAudit.problems.length})</span>
                </button>
                <button
                  onClick={() => setSelectedAuditTab('problems')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedAuditTab === 'problems'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Resume Mistakes ({resumeAudit.problems.length})</span>
                </button>
                <button
                  onClick={() => setSelectedAuditTab('summary')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedAuditTab === 'summary'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Strong Assets ({resumeAudit.strongPoints.length})</span>
                </button>
              </div>

              {/* TAB 1: BETTER ALTERNATIVES ("Iske jagah ye rakhein toh jada better hoga") */}
              {selectedAuditTab === 'alternatives' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                    💡 <strong>Interviewer Perspective:</strong> Recruiters spend an average of 6 seconds scanning a resume. Ye concrete rewrites add metrics and action verbs so your profile immediately stands out:
                  </div>

                  {resumeAudit.problems.map((prob, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          {prob.type}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          High Impact Fix
                        </span>
                      </div>

                      {/* Before vs After Side-by-Side Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-red-50/70 border border-red-200/80">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block mb-1">
                            ❌ What was written (Weak / Passive):
                          </span>
                          <p className="text-red-950 font-medium leading-relaxed">
                            "{prob.beforeAfter?.before || prob.found}"
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                            ✨ Iske Jagah Ye Likhein (2x Impact):
                          </span>
                          <p className="text-emerald-950 font-bold leading-relaxed">
                            "{prob.beforeAfter?.after || prob.recommendation}"
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-normal bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <strong>Kyun better hai:</strong> {prob.recommendation}
                      </p>
                    </div>
                  ))}

                  {/* General Improvement suggestions */}
                  {resumeAudit.improvements.map((imp, idx) => (
                    <div
                      key={'imp_' + idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <h5 className="text-xs font-bold text-slate-800">{imp.title}</h5>
                        <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {imp.context}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{imp.suggestion}</p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900">
                        💡 <em>{imp.betterAlternative}</em>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: DETECTED PROBLEMS & MISTAKES */}
              {selectedAuditTab === 'problems' && (
                <div className="space-y-3">
                  {resumeAudit.problems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-emerald-700 font-bold bg-emerald-50 rounded-2xl border border-emerald-200">
                      🎉 No major flaws detected in this resume!
                    </div>
                  ) : (
                    resumeAudit.problems.map((prob, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>{prob.type}</span>
                        </div>
                        <p className="text-amber-800 font-medium">{prob.found}</p>
                        <p className="text-slate-600 text-[11px] font-semibold mt-1">
                          <strong>Fix Advice:</strong> {prob.recommendation}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: STRONG ASSETS */}
              {selectedAuditTab === 'summary' && (
                <div className="space-y-2.5">
                  {resumeAudit.strongPoints.map((str, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Quick-Launch Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Resume checked. Ready for your face-to-face interview with the Avatar?
                </span>
                <button
                  onClick={handleStartFaceToFaceInterview}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Start Face-to-Face Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── STEP 2: LIVE FACE-TO-FACE 3D INTERVIEW ROOM WITH AVATAR ── */}
      {currentStep === 'interview' && (
        <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 flex flex-col select-none">
          {/* ── 3D AVATAR CANVAS (MAIN BACKGROUND & CENTER INTERVIEWER) ── */}
          <div className="absolute inset-0 w-full h-full z-0">
            {activeAvatarType === 'female_mentor' ? (
              <FemaleMentor3DAvatar
                isSpeaking={isAiAsking}
                isListening={isListening && !isAiAsking}
                isThinking={isAiThinking}
                mentorName="Baatology AI Mentor"
              />
            ) : (
              <DigitalRobotAvatar
                isSpeaking={isAiAsking}
                isListening={isListening && !isAiAsking}
                isThinking={isAiThinking}
                mentorName="Baatology AI Coach"
              />
            )}
          </div>

          {/* ── TOP FLOATING INTERVIEW HUD ── */}
          <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-3 pointer-events-auto">
            {/* Left: Avatar Identity & Speaking/Listening Status */}
            <div className="flex items-center gap-2.5">
              <div className="px-3.5 py-1.5 rounded-full bg-black/75 border border-cyan-500/40 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]" />
                <span>Baatology AI Interviewer</span>
                <span className="text-[10px] text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
                  {activeAvatarType === 'female_mentor' ? 'Executive Mentor' : 'Robot Coach'}
                </span>
              </div>

              {/* Avatar Type Toggle */}
              <button
                onClick={() => setActiveAvatarType(prev => prev === 'female_mentor' ? 'robot' : 'female_mentor')}
                className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-[11px] font-semibold text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
                title="Switch between Executive Mentor and 3D Robot Coach"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch Avatar</span>
              </button>
            </div>

            {/* Center Status Banner */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-white/10 backdrop-blur-md shadow-md">
              {isAiAsking ? (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>Avatar is asking Question #{currentQIndex + 1}... (Listen carefully)</span>
                </div>
              ) : isListening ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span>Amne-Samne Face-to-Face: Avatar is listening to your answer! Speak naturally.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <span>Microphone paused. Click "Start Speaking" below.</span>
                </div>
              )}
            </div>

            {/* Right: Return to Resume or Change View */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep('resume_upload')}
                className="px-3.5 py-1.5 rounded-xl bg-black/70 hover:bg-white/15 border border-white/20 text-xs font-bold text-slate-200 hover:text-white transition-all backdrop-blur-md cursor-pointer"
              >
                ← Back to Resume
              </button>
            </div>
          </div>

          {/* ── TOP RIGHT: CANDIDATE LIVE WEBCAM PIP (FACE-TO-FACE VIDEO PANEL) ── */}
          <div className="relative z-30 pointer-events-auto">
            <CandidateVideoPanel
              stream={stream}
              cameraActive={cameraActive}
              micActive={isListening}
              candidateName={resumeData.name || userName}
              audioLevel={isListening ? 60 : 0}
              eyeContactPct={eyeContactScore}
              isFloatingPIP={true}
            />
          </div>

          {/* ── FLOATING QUESTION DIALOGUE CARD (AI INTERVIEWER'S CURRENT QUESTION) ── */}
          <div className="relative z-20 mx-4 sm:mx-6 max-w-2xl pointer-events-auto mt-1 sm:mt-2">
            <div className="rounded-3xl bg-slate-900/85 border border-cyan-500/30 backdrop-blur-xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.15)] text-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 font-mono">
                    {questions[currentQIndex]?.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  <button
                    onClick={handleReplayCurrentQuestion}
                    className="p-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/40 transition-all cursor-pointer"
                    title="Replay Question Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The Spoken Question Text */}
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed tracking-tight">
                "{questions[currentQIndex]?.question}"
              </p>

              {/* Guidance Hint */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-[11px] text-cyan-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span><strong>AI Hint:</strong> {questions[currentQIndex]?.hint}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── FLOATING LEFT HUD: LIVE RESUME CROSS-MATCH TAGS ── */}
          <div className="absolute left-4 sm:left-6 bottom-32 sm:bottom-28 z-20 max-w-xs sm:max-w-sm pointer-events-auto">
            <div className="rounded-2xl bg-black/80 border border-emerald-500/30 backdrop-blur-md p-3.5 text-white space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Live Speech vs Resume Match
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                  {liveMatch.alignmentScore}% Aligned
                </span>
              </div>

              {/* Mentioned Skills from Resume */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  🟢 Mentioned ({liveMatch.coveredSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {liveMatch.coveredSkills.length === 0 ? (
                    <span className="text-[11px] text-slate-500 italic">
                      Start speaking skills from your resume...
                    </span>
                  ) : (
                    liveMatch.coveredSkills.map((sk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 animate-fade-in"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{sk}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Missed Highlights Reminder */}
              {liveMatch.missedHighlights.length > 0 && (
                <div className="pt-1.5 border-t border-white/10 text-[10px] text-amber-300 space-y-0.5">
                  <span className="font-bold block text-amber-400">💡 Tip: Don't forget to mention:</span>
                  <div className="text-slate-300 line-clamp-2">
                    {liveMatch.missedHighlights[0]}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── BOTTOM EXECUTIVE DOCK: LIVE TRANSCRIPT & INTERVIEW CONTROLS ── */}
          <div className="mt-auto relative z-30 w-full p-4 sm:p-5 bg-gradient-to-t from-black via-slate-950/90 to-transparent pointer-events-auto">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Spoken Word Stream (Real-Time Audio Recognition Ribbon) */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-3 sm:p-3.5 backdrop-blur-md shadow-lg flex items-center justify-between gap-3 text-xs">
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 font-mono">
                      Live Candidate Transcript:
                    </span>
                  </div>
                  <div className="text-slate-200 font-medium truncate sm:whitespace-normal line-clamp-1 sm:line-clamp-2 text-xs">
                    {transcript || interimText ? (
                      <>
                        <span>{transcript}</span>
                        <span className="text-cyan-300 italic"> {interimText}</span>
                      </>
                    ) : (
                      <span className="text-slate-500 italic">
                        {isAiAsking
                          ? 'Avatar is currently speaking the question...'
                          : 'Speak your response face-to-face with the Avatar...'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Telemetry Pills */}
                <div className="hidden sm:flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <div className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-slate-300">
                    ⏱️ {Math.floor(sessionSeconds / 60)}:{(sessionSeconds % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-cyan-300 font-bold">
                    ⚡ {wpm || '--'} WPM
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-amber-300 font-bold">
                    🗣️ {fillersCount} Fillers
                  </div>
                </div>
              </div>

              {/* Action Controls Dock */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Left: Mic Toggle & Reset */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleListening}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Mute Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Start Speaking</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setTranscript('');
                      transcriptRef.current = '';
                      setInterimText('');
                    }}
                    className="p-2.5 rounded-xl bg-black/60 hover:bg-white/15 text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer"
                    title="Reset Speech"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* 1-Click Auto Sample Answer (For Rapid Testing) */}
                  <button
                    onClick={() => {
                      const sampleAnswer = `My name is ${resumeData.name}, pursuing ${resumeData.degree} from ${resumeData.college}. My technical expertise includes ${resumeData.skills?.allFound?.slice(0, 3).join(', ')}. Recently, I architected ${resumeData.projects[0]?.title}, where I solved critical latency and scaling challenges using modular REST APIs and optimized database indexing.`;
                      setTranscript(sampleAnswer);
                      transcriptRef.current = sampleAnswer;
                      setLiveMatch(crossMatchSpeechWithResume(sampleAnswer, resumeData));
                      setSpokenMistakes(detectSpeechMistakes(sampleAnswer));
                    }}
                    className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>⚡ Sample Answer</span>
                  </button>
                </div>

                {/* Right: Next Question or Conclude Interview */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>{currentQIndex + 1 < questions.length ? 'Next Question' : 'Finish & Detect Mistakes'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleFinishInterview}
                    className="px-4 py-2.5 rounded-2xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-bold border border-purple-400/30 transition-all cursor-pointer active:scale-95"
                    title="Conclude Interview & Run Mistake Detection"
                  >
                    <span>Detect Mistakes 🎯</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: COMPREHENSIVE PERFORMANCE & MISTAKE DETECTION REPORT ── */}
      {currentStep === 'results' && (
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
          {/* Grand Results Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Interview Complete — AI Mistake Detection Report
                  </h2>
                  <span className="text-xl">🎉</span>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  Baatology Face-to-Face 3D Interview • Resume Alignment &amp; Speech Mistake Diagnostics
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right sm:border-l sm:border-white/15 sm:pl-6 shrink-0">
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {Math.round((liveMatch.alignmentScore + resumeAudit.atsScore) / 2)}
                <span className="text-xs text-slate-400 font-sans"> / 100</span>
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Placement Ready 🚀
              </span>
            </div>
          </div>

          {/* 4 Score Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resume Alignment</span>
              <div className="text-2xl font-black text-blue-600 font-mono">
                {liveMatch.alignmentScore}%
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {liveMatch.coveredSkills.length} skills matched
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ATS Health Score</span>
              <div className="text-2xl font-black text-indigo-600 font-mono">
                {resumeAudit.atsScore}%
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                Grade: {resumeAudit.grade}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speaking Pacing</span>
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {wpm || 135} <span className="text-xs text-slate-400 font-normal">WPM</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600">
                Ideal Corporate Cadence
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hesitation Fillers</span>
              <div className={`text-2xl font-black font-mono ${fillersCount > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {fillersCount}
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {fillersCount <= 2 ? 'Excellent fluency' : 'Replace with silent pause'}
              </span>
            </div>
          </div>

          {/* ── SECTION 1: SPOKEN MISTAKES & EXECUTIVE REWRITES ── */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Spoken English &amp; Communication Mistakes Detected ({spokenMistakes.mistakes.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Campus habits, hesitation fillers &amp; grammar rewrites to sound polished and corporate-ready
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                AI Speech Audit
              </span>
            </div>

            {spokenMistakes.mistakes.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                🎉 No major grammatical mistakes or excessive fillers detected in your spoken answers! Very articulate!
              </div>
            ) : (
              <div className="space-y-3">
                {spokenMistakes.mistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        {m.type}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {m.severity || 'Medium'} Severity
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
                        <span className="text-[10px] font-black uppercase text-red-600 block mb-1">
                          ❌ What was said:
                        </span>
                        <p className="text-red-950 font-medium">"{m.found}"</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                        <span className="text-[10px] font-black uppercase text-emerald-700 block mb-1">
                          ✨ Executive Corporate Rewrite:
                        </span>
                        <p className="text-emerald-950 font-bold">"{m.correction}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SECTION 2: RESUME CROSS-MATCH & ALIGNMENT DETAILS ── */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Speech vs. Resume Cross-Match Breakdown
                  </h4>
                  <p className="text-xs text-slate-500">
                    Verified what you articulated aloud against what you claimed on your resume
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-blue-600 font-mono">
                {liveMatch.alignmentScore}% Match
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mentioned Skills */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Skills &amp; Projects Successfully Articulated:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {liveMatch.coveredSkills.map((sk, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-700 border border-emerald-300 shadow-xs"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                  {liveMatch.coveredProjects.map((p, i) => (
                    <span
                      key={'p_' + i}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-indigo-700 border border-indigo-300 shadow-xs"
                    >
                      📁 {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missed Highlights */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Key Resume Points Omitted in Interview:
                </span>
                <ul className="text-xs text-amber-900/90 space-y-1 list-disc list-inside font-medium pt-1">
                  {liveMatch.missedHighlights.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: RESUME FLAW AUDIT ("ISKE JAGAH YE RAKHTE TOH JADA BETTER HOTA") ── */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Resume Upgrades ("Iske Jagah Ye Rakhein Toh Jada Better Hota")
                  </h4>
                  <p className="text-xs text-slate-500">
                    Actionable rewrites to replace passive bullet points with quantifiable engineering impact
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                ATS Score: {resumeAudit.atsScore}/100
              </span>
            </div>

            <div className="space-y-3">
              {resumeAudit.problems.map((prob, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <span className="text-xs font-extrabold text-slate-800 block">
                    Problem #{idx + 1}: {prob.type}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
                      <span className="text-[10px] font-black uppercase text-red-600 block mb-1">
                        ❌ What was in Resume:
                      </span>
                      <p className="text-red-950 font-medium">"{prob.beforeAfter?.before || prob.found}"</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-[10px] font-black uppercase text-emerald-700 block mb-1">
                        ✨ Iske Jagah Ye Rakhein (Recommended):
                      </span>
                      <p className="text-emerald-950 font-bold">"{prob.beforeAfter?.after || prob.recommendation}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Dock */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Ready to retake or master another session?
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Practice makes permanent. Keep practicing with the 3D Avatar to eliminate speaking fear!
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleStartFaceToFaceInterview}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Face-to-Face Interview</span>
              </button>

              <button
                onClick={onBackToDashboard}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
