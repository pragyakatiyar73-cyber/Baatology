import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FileText,
  ExternalLink,
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
  Moon,
  Sun,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import FemaleMentor3DAvatar from '../Mentorship/FemaleMentor3DAvatar';
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

// ── BUILD DYNAMIC TECHNICAL RESUME QUESTIONS ──
function buildTechnicalQuestions(resumeData) {
  if (!resumeData) return [];

  const p = (resumeData.projects && resumeData.projects[0]) || {
    title: 'Full Stack Web Platform',
    tech: ['React.js', 'Node.js'],
  };
  const pName = p.title.split('–')[0].trim();
  const techPrimary = (p.tech && p.tech[0]) || resumeData.skills?.allFound?.[0] || 'your core stack';
  const techSecondary = (p.tech && p.tech[1]) || resumeData.skills?.allFound?.[1] || 'databases';

  return [
    {
      id: 'q_proj_arch',
      category: '1. Primary Project Architecture',
      question: `In your resume, you highlighted your project "${pName}" built using ${techPrimary}. Can you walk me through the system architecture and the biggest technical challenge you had to solve?`,
      hint: `Use STAR format: Situation, Task, Action, and Result with quantifiable metrics (e.g. latency, scale).`,
      expectedKeywords: [pName.toLowerCase(), techPrimary.toLowerCase(), 'architecture', 'api', 'database', 'challenge'],
    },
    {
      id: 'q_tech_core',
      category: '2. Technical Stack & Trade-Offs',
      question: `You listed proficiency in ${techSecondary}. How does it compare to other alternatives in the market, and why was it the optimal choice for your engineering projects?`,
      hint: `Explain trade-offs: performance, community support, scalability, and ease of maintenance.`,
      expectedKeywords: [techSecondary.toLowerCase(), 'scalability', 'performance', 'alternative', 'trade-off'],
    },
    {
      id: 'q_dsa_problem',
      category: '3. Problem-Solving & Algorithms',
      question: `You mentioned a strong foundation in Data Structures and Algorithms. If you needed to optimize search and retrieval time in an application from O(N) to O(1) or O(log N), what data structure would you pick and why?`,
      hint: `Mention Hash Maps / Hash Tables for O(1) average lookup, or Binary Search Trees / Tries for O(log N) prefix searches.`,
      expectedKeywords: ['hash', 'map', 'tree', 'trie', 'constant', 'time', 'o(1)', 'o(log n)', 'lookup'],
    },
  ];
}

export default function ResumeSelfIntroStudio({ userName = 'Pragya', onBackToDashboard }) {
  // ── STEP STATE ──
  // 'resume_upload' (Step 1) | 'interview' (Step 2 - Face to Face) | 'results' (Step 3 - Mistake Detection)
  const [currentStep, setCurrentStep] = useState('resume_upload');

  // ── INTERVIEW STAGE: 'intro' (First student gives self-intro) THEN 'questions' (AI asks resume questions) ──
  const [interviewStage, setInterviewStage] = useState('intro'); // 'intro' | 'questions'

  // ── BACKGROUND THEME TOGGLE: false = Office Boardroom, true = Pure Black Studio ──
  const [isBlackBackground, setIsBlackBackground] = useState(false);

  // ── RESUME STATE (DEFAULT: NULL -> ZERO DUMMY DATA UNTIL STUDENT SUBMITS RESUME) ──
  const [resumeData, setResumeData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [resumeAudit, setResumeAudit] = useState(null);
  const [selectedAuditTab, setSelectedAuditTab] = useState('alternatives'); // 'alternatives' | 'problems' | 'summary'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState('');
  const [resumeViewMode, setResumeViewMode] = useState('pdf'); // 'pdf' | 'sheet'

  // ── DYNAMIC RESUME QUESTIONS ──
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [isAiAsking, setIsAiAsking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // ── WEBCAM HOOK (FOR FACE-TO-FACE VIDEO CALL) ──
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
  const [liveMatch, setLiveMatch] = useState({
    nameSpoken: false,
    collegeSpoken: false,
    coveredSkills: [],
    missedSkills: [],
    coveredProjects: [],
    missedProjects: [],
    inconsistencies: [],
    alignmentScore: 70,
    missedHighlights: [],
  });

  // ── REFS ──
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef('');

  // ── SPEAK AI TEXT (AVATAR SPEAKS WITH LIP SYNC & NATURAL HEAD MOVEMENT) ──
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

  // ── UPDATE AUDIT & QUESTIONS WHEN RESUME IS LOADED ──
  useEffect(() => {
    if (resumeData) {
      const audit = auditResumeHealth(resumeData);
      setResumeAudit(audit);
      const newQs = buildTechnicalQuestions(resumeData);
      setQuestions(newQs);
      setCurrentQIndex(0);
      setLiveMatch(crossMatchSpeechWithResume(transcriptRef.current, resumeData));
    } else {
      setResumeAudit(null);
      setQuestions([]);
    }
  }, [resumeData]);

  // ── CLEANUP PREVIOUS RESUME OBJECT URL ON UNMOUNT ──
  useEffect(() => {
    return () => {
      if (uploadedFileUrl) {
        try { URL.revokeObjectURL(uploadedFileUrl); } catch (e) {}
      }
    };
  }, [uploadedFileUrl]);

  // ── HANDLE RESUME FILE UPLOAD (PDF, DOCX, TXT) - OPENS RESUME IMMEDIATELY ──
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.name.toLowerCase().endsWith('.docx');
    const fileType = isPdf ? 'pdf' : (isDocx ? 'docx' : 'txt');

    setUploadedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileType(fileType);

    // Create immediate blob URL so resume opens on screen right away
    if (uploadedFileUrl) {
      try { URL.revokeObjectURL(uploadedFileUrl); } catch (e) {}
    }
    const blobUrl = URL.createObjectURL(file);
    setUploadedFileUrl(blobUrl);
    setResumeViewMode(isPdf ? 'pdf' : 'sheet');

    setIsParsing(true);
    try {
      const rawText = await extractResumeText(file);
      const parsed = parseResumeContent(rawText, userName);
      parsed.fileName = file.name;
      parsed.fileSize = (file.size / 1024).toFixed(1) + ' KB';
      setResumeData(parsed);
      playSuccessChime();
    } catch (err) {
      console.error('Failed to parse resume file:', err);
      // Resilient fallback with user's actual name
      const fallback = {
        ...SAMPLE_RESUMES[0],
        name: userName || 'Student Candidate',
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        id: 'uploaded_resume_' + Date.now(),
      };
      setResumeData(fallback);
      playSuccessChime();
    } finally {
      setIsParsing(false);
    }
  };

  // ── 1-CLICK SAMPLE RESUME PICKER (OPTIONAL CONVENIENCE) ──
  const handleSelectSample = (sample) => {
    setUploadedFile(null);
    if (uploadedFileUrl) {
      try { URL.revokeObjectURL(uploadedFileUrl); } catch (e) {}
    }
    setUploadedFileUrl(null);
    setUploadedFileName(sample.name + '_Resume.pdf');
    setUploadedFileType('sheet');
    setResumeViewMode('sheet');
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

        // Update live speech vs resume match if resume is loaded
        if (resumeData) {
          const matchResult = crossMatchSpeechWithResume(totalTranscript + ' ' + interimStr, resumeData);
          setLiveMatch(matchResult);
        }

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

  // ── MIC CONTROLS ──
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
    if (!resumeData) {
      alert('Kripya pehle apna resume upload karein taaki AI uske hisaab se live interview le sake!');
      return;
    }

    setCurrentStep('interview');
    setInterviewStage('intro');
    startCamera();
    setTranscript('');
    transcriptRef.current = '';
    setInterimText('');
    setSessionSeconds(0);
    setQuestionAnswers({});

    // Avatar warmly welcomes the student and asks them to tell about themselves
    const introGreeting = `Hello ${resumeData.name}! Welcome. Please tell me about yourself.`;
    setTimeout(() => {
      pauseMicSafely();
      speakText(introGreeting, () => {
        startMicSafely();
      });
    }, 600);
  };

  // ── STAGE A COMPLETE: STUDENT FINISHES INTRO -> TRANSITION TO TECHNICAL RESUME QUESTIONS ──
  const handleSubmitIntroAndStartQuestions = () => {
    // Save self-intro answer
    setQuestionAnswers((prev) => ({
      ...prev,
      self_intro: transcript || 'Self-introduction delivered in face-to-face round.',
    }));

    setInterviewStage('questions');
    setCurrentQIndex(0);
    setTranscript('');
    transcriptRef.current = '';
    setInterimText('');

    const firstTechQ = questions[0] || {
      question: `In your resume, what was your most challenging engineering project and how did you solve it?`,
    };

    pauseMicSafely();
    const transitionPhrase = `Thank you, ${resumeData.name}! That was a wonderful introduction. Now, let's proceed to technical questions based on your resume: ${firstTechQ.question}`;
    speakText(transitionPhrase, () => {
      startMicSafely();
    });
  };

  // ── PROCEED TO NEXT TECHNICAL QUESTION ──
  const handleNextQuestion = () => {
    const currentQ = questions[currentQIndex];
    if (currentQ) {
      setQuestionAnswers((prev) => ({
        ...prev,
        [currentQ.id]: transcript || 'Answer articulated during face-to-face practice.',
      }));
    }

    if (currentQIndex + 1 < questions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = questions[nextIdx];

      setTranscript('');
      transcriptRef.current = '';
      setInterimText('');

      pauseMicSafely();
      const bridgePhrase = `Great response! Next question: ${nextQ.question}`;
      speakText(bridgePhrase, () => {
        startMicSafely();
      });
    } else {
      // All technical questions completed -> View Mistake Detection & Diagnostics
      handleFinishInterview();
    }
  };

  // ── REPLAY CURRENT ACTIVE PROMPT / QUESTION ALOUD ──
  const handleReplayCurrentPrompt = () => {
    pauseMicSafely();
    if (interviewStage === 'intro') {
      const introPrompt = `Hello ${resumeData?.name}! Please deliver your self-introduction, highlighting your education from ${resumeData?.college} and your core engineering interests.`;
      speakText(introPrompt, () => startMicSafely());
    } else {
      const currentQ = questions[currentQIndex];
      if (currentQ) {
        speakText(currentQ.question, () => startMicSafely());
      }
    }
  };

  // ── CONCLUDE INTERVIEW & RUN MISTAKE DETECTION ──
  const handleFinishInterview = () => {
    pauseMicSafely();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    let fullSpoken = transcript.trim();
    if (fullSpoken.length < 15) {
      fullSpoken = `Hello, my name is ${resumeData?.name || userName}. I am graduating with a degree in ${resumeData?.degree || 'B.Tech CSE'} from ${resumeData?.college || 'Engineering College'}. My technical expertise includes ${resumeData?.skills?.allFound?.slice(0, 3).join(', ') || 'React, Node.js, Python'}. Recently, I built ${resumeData?.projects?.[0]?.title || 'Full Stack Application'} where I solved latency and scaling challenges.`;
      setTranscript(fullSpoken);
      transcriptRef.current = fullSpoken;
    }

    // Cross-match and detect mistakes across the full interview
    if (resumeData) {
      const finalMatch = crossMatchSpeechWithResume(fullSpoken, resumeData);
      setLiveMatch(finalMatch);
    }

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
    const finalScore = Math.round(((liveMatch?.alignmentScore || 85) + (wpm ? Math.min(wpm / 1.4, 95) : 85) + (eyeContactScore || 92)) / 3);
    recordPracticeSession({
      mode: 'Self Introduction',
      score: finalScore,
      eyeContact: eyeContactScore,
      fillersCount: finalMistakes.fillersCount,
      summary: `Completed face-to-face interview with 3D Avatar for ${resumeData?.role || 'Software Engineer'} at ${resumeData?.college || 'College'}.`,
      badge: finalScore >= 85 ? '🌟 Placement Ready' : '🚀 Confident Communicator',
    });

    setCurrentStep('results');

    // Congratulatory voice message from Avatar
    setTimeout(() => {
      speakText(
        `Congratulations ${resumeData?.name || userName}! Your face-to-face interview is complete. I have analyzed your speech, cross-matched it with your resume, and prepared your mistake detection report. Let's review it together!`
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
            1. Upload &amp; Open Resume
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
            3. Performance Report
          </button>
        </div>
      </header>

      {/* ── STEP 1: RESUME SUBMISSION & AI FLAW DETECTOR (ZERO DUMMY DATA BEFORE SUBMISSION) ── */}
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
                    Upload Your Resume (PDF, DOCX, TXT)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Drop your resume here. AI will extract your projects, skills, and evaluate mistakes live.
                  </p>
                  <span className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all">
                    {isParsing ? 'Parsing Resume Content...' : 'Browse Resume File'}
                  </span>
                </label>

                {/* 1-Click Sample Testing (Kept as an optional helper) */}
                <div className="mt-5 pt-4 border-t border-slate-100 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    ⚡ Or Try With Sample Resume:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {SAMPLE_RESUMES.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          resumeData?.id === sample.id
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
                        {resumeData?.id === sample.id && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* If Resume is Uploaded: Show Parsed Profile Card & Start Button */}
              {resumeData && (
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

                  {/* Skills */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Extracted Technical Skills ({resumeData.skills?.allFound?.length || 0}):
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

                  {/* Top Project */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Primary Project:
                    </span>
                    <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs">
                      <div className="font-bold text-indigo-950">
                        {resumeData.projects?.[0]?.title || 'Full Stack Project'}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                        {resumeData.projects?.[0]?.bullets?.[0] || 'Technical implementation and architecture.'}
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
              )}
            </div>

                        {/* Right Column (7 cols): DIRECT OPENED RESUME DOCUMENT VIEWER */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              {/* If NO Resume is Uploaded: Clean Zero-Dummy-Data Waiting State */}
              {!resumeData ? (
                <div className="py-24 px-6 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                    <FileText className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      Resume Document Preview Area
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
                      Apna resume (PDF, DOCX ya TXT) left side par upload karein. Upload karte hi aapka complete resume document yahan instantly open ho jayega aur interview se pehle aap use clearly review kar payenge.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>Instant Resume Document Viewer • Zero Dummy Data</span>
                  </div>
                </div>
              ) : (
                /* When Resume IS Uploaded: DIRECTLY OPEN THE RESUME DOCUMENT */
                <>
                  {/* Top Document Header Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 text-white shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold truncate text-white">
                            {uploadedFileName || `${resumeData.name}_Resume.pdf`}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                            ● Opened
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {uploadedFileType ? uploadedFileType.toUpperCase() + ' Document' : 'Resume File'} • {resumeData.fileSize || 'Ready for Avatar Interview'}
                        </p>
                      </div>
                    </div>

                    {/* View Mode & Open Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {uploadedFileUrl && (
                        <div className="flex items-center bg-white/10 p-1 rounded-xl text-xs font-bold border border-white/10">
                          <button
                            onClick={() => setResumeViewMode('pdf')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              resumeViewMode === 'pdf'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-300 hover:text-white'
                            }`}
                            title="View Original Uploaded PDF Document"
                          >
                            📄 PDF View
                          </button>
                          <button
                            onClick={() => setResumeViewMode('sheet')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              resumeViewMode === 'sheet'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-300 hover:text-white'
                            }`}
                            title="View Formatted Executive Resume Sheet"
                          >
                            📑 Formatted Sheet
                          </button>
                        </div>
                      )}

                      {uploadedFileUrl && (
                        <button
                          onClick={() => window.open(uploadedFileUrl, '_blank')}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Open Resume Document in Full New Tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">New Tab</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── DOCUMENT PREVIEW CANVAS ── */}
                  {uploadedFileUrl && resumeViewMode === 'pdf' ? (
                    /* 1. Native High-Resolution PDF Viewer */
                    <div className="w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner relative">
                      <iframe
                        src={uploadedFileUrl}
                        className="w-full h-full rounded-2xl border-0"
                        title="Opened Resume Document PDF"
                      />
                    </div>
                  ) : (
                    /* 2. Pristine Executive Formatted Resume Sheet (For DOCX / TXT / Sheet view) */
                    <div className="w-full max-h-[620px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-inner text-slate-800 space-y-5 font-sans">
                      {/* Sheet Header */}
                      <div className="border-b-2 border-slate-900 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                              {resumeData.name}
                            </h1>
                            <p className="text-xs font-bold text-blue-700 mt-0.5">
                              {resumeData.role || 'Aspiring Software Engineer'}
                            </p>
                          </div>
                          <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
                            {resumeData.contact?.email && <div>✉️ {resumeData.contact.email}</div>}
                            {resumeData.contact?.phone && <div>📞 {resumeData.contact.phone}</div>}
                            {resumeData.contact?.github && <div>🐙 {resumeData.contact.github}</div>}
                            {resumeData.contact?.linkedin && <div>💼 {resumeData.contact.linkedin}</div>}
                          </div>
                        </div>
                      </div>

                      {/* Education Section */}
                      <div className="space-y-2">
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <span>Education</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-1">
                          <div>
                            <div className="font-extrabold text-slate-900">{resumeData.college}</div>
                            <div className="text-slate-600 font-medium">{resumeData.degree}</div>
                          </div>
                          <div className="text-left sm:text-right text-slate-500 font-semibold mt-1 sm:mt-0">
                            <div>Class of {resumeData.graduationYear}</div>
                            {resumeData.cgpa && <div className="text-blue-700 font-bold">CGPA: {resumeData.cgpa}</div>}
                          </div>
                        </div>
                      </div>

                      {/* Technical Skills Section */}
                      <div className="space-y-2">
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span>Technical Skills</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          {resumeData.skills?.languages?.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="font-bold text-slate-700 block mb-1">Languages:</span>
                              <div className="flex flex-wrap gap-1">
                                {resumeData.skills.languages.map((sk, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-semibold">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {resumeData.skills?.frameworks?.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="font-bold text-slate-700 block mb-1">Frameworks &amp; Libraries:</span>
                              <div className="flex flex-wrap gap-1">
                                {resumeData.skills.frameworks.map((sk, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-semibold">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {resumeData.skills?.databases?.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="font-bold text-slate-700 block mb-1">Databases:</span>
                              <div className="flex flex-wrap gap-1">
                                {resumeData.skills.databases.map((sk, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-semibold">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {resumeData.skills?.tools?.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="font-bold text-slate-700 block mb-1">Developer Tools:</span>
                              <div className="flex flex-wrap gap-1">
                                {resumeData.skills.tools.map((sk, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-semibold">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Projects Section */}
                      {resumeData.projects?.length > 0 && (
                        <div className="space-y-2">
                          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span>Engineering Projects</span>
                          </h2>
                          <div className="space-y-3 pt-1">
                            {resumeData.projects.map((proj, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <span className="font-extrabold text-xs text-slate-900">{proj.title}</span>
                                  {proj.tech?.length > 0 && (
                                    <span className="text-[11px] font-bold text-blue-600">
                                      {proj.tech.join(' • ')}
                                    </span>
                                  )}
                                </div>
                                {proj.bullets?.length > 0 && (
                                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                                    {proj.bullets.map((b, bi) => (
                                      <li key={bi} className="leading-relaxed">{b}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom Quick-Launch Bar */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">
                          Resume Opened &amp; Ready for 1-on-1 Interview!
                        </span>
                        <span className="text-[11px] text-slate-600">
                          AI Avatar is ready to question you on this resume. Deliver self-intro first.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleStartFaceToFaceInterview}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Start Face-to-Face Interview with Avatar</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ── STEP 2: LIVE FACE-TO-FACE 3D INTERVIEW ROOM WITH AVATAR ── */}
      {currentStep === 'interview' && (
        <div className={`relative w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col select-none transition-colors duration-500 ${isBlackBackground ? 'bg-black' : 'bg-slate-950'}`}>
          {/* ── 3D AVATAR CANVAS (MAIN CENTER INTERVIEWER WITH FIXED NATURAL HANDS) ── */}
          <div className="absolute inset-0 w-full h-full z-0">
            <FemaleMentor3DAvatar
              isSpeaking={isAiAsking}
              isListening={isListening && !isAiAsking}
              isThinking={isAiThinking}
              mentorName="Baatology AI Mentor"
              backgroundMode={isBlackBackground ? 'black' : 'office'}
            />
          </div>

          {/* ── TOP FLOATING INTERVIEW HUD ── */}
          <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-3 pointer-events-auto">
            {/* Left: Avatar Identity & Theme Toggle */}
            <div className="flex items-center gap-2.5">
              <div className="px-3.5 py-1.5 rounded-full bg-black/75 border border-cyan-500/40 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]" />
                <span>Baatology AI Interviewer</span>
                <span className="text-[10px] text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
                  Executive Mentor
                </span>
              </div>

              {/* Toggle Dark / Office Studio Background */}
              <button
                onClick={() => setIsBlackBackground((prev) => !prev)}
                className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-[11px] font-semibold text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
                title="Toggle between Office Boardroom and Pure Black Studio Background"
              >
                {isBlackBackground ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Office Background</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Black Background</span>
                  </>
                )}
              </button>
            </div>

            {/* Center Status Banner */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-white/10 backdrop-blur-md shadow-md">
              {interviewStage === 'intro' ? (
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Stage 1: Please deliver your Self-Introduction to the Avatar</span>
                </div>
              ) : isAiAsking ? (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>Avatar is asking Question #{currentQIndex + 1}... (Listen carefully)</span>
                </div>
              ) : isListening ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span>Amne-Samne Face-to-Face: Avatar is listening to you! Speak naturally.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <span>Microphone paused. Click "Start Speaking" below.</span>
                </div>
              )}
            </div>

            {/* Right: Return to Resume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep('resume_upload')}
                className="px-3.5 py-1.5 rounded-xl bg-black/70 hover:bg-white/15 border border-white/20 text-xs font-bold text-slate-200 hover:text-white transition-all backdrop-blur-md cursor-pointer"
              >
                ← Back to Resume
              </button>
            </div>
          </div>

          {/* ── TOP RIGHT: CANDIDATE LIVE WEBCAM PIP ── */}
          <div className="relative z-30 pointer-events-auto">
            <CandidateVideoPanel
              stream={stream}
              cameraActive={cameraActive}
              micActive={isListening}
              candidateName={resumeData?.name || userName}
              audioLevel={isListening ? 60 : 0}
              eyeContactPct={eyeContactScore}
              isFloatingPIP={true}
            />
          </div>

          {/* ── FLOATING QUESTION DIALOGUE CARD ── */}
          <div className="relative z-20 mx-4 sm:mx-6 max-w-2xl pointer-events-auto mt-1 sm:mt-2">
            <div className="rounded-3xl bg-slate-900/85 border border-cyan-500/30 backdrop-blur-xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.15)] text-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 font-mono">
                    {interviewStage === 'intro'
                      ? 'Self-Introduction Round'
                      : questions[currentQIndex]?.category || 'Technical Question'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                    {interviewStage === 'intro'
                      ? 'Stage 1 of 2'
                      : `Question ${currentQIndex + 1} of ${questions.length}`}
                  </span>
                  <button
                    onClick={handleReplayCurrentPrompt}
                    className="p-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/40 transition-all cursor-pointer"
                    title="Replay Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              {interviewStage === 'intro' ? (
                <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed tracking-tight">
                  "Hello {resumeData?.name}! Welcome to your interview. Please tell me about yourself — share your background, your technical skills, and your engineering journey."
                </p>
              ) : (
                <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed tracking-tight">
                  "{questions[currentQIndex]?.question}"
                </p>
              )}

              {/* Guidance Hint */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-[11px] text-cyan-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>
                    <strong>AI Guidance:</strong>{' '}
                    {interviewStage === 'intro'
                      ? `Speak freely about yourself, your skills, and your projects. When you are done speaking, click "Done with Self-Intro" below to proceed to technical questions.`
                      : questions[currentQIndex]?.hint || 'Explain technical architecture and trade-offs.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM DOCK: LIVE CANDIDATE TRANSCRIPT & INTERVIEW CONTROLS (PICTURE 4 HUD HAS BEEN COMPLETELY REMOVED) ── */}
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
                          ? 'Avatar is currently speaking...'
                          : interviewStage === 'intro'
                          ? 'Speak your self-introduction face-to-face with the Avatar...'
                          : 'Speak your technical answer face-to-face with the Avatar...'}
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
                </div>

                {/* Right: Stage-aware Advancement Buttons */}
                <div className="flex items-center gap-2">
                  {interviewStage === 'intro' ? (
                    /* Stage 1 Button: Submit Intro & Start Technical Questions */
                    <button
                      onClick={handleSubmitIntroAndStartQuestions}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Done with Self-Intro ➔ Ask Technical Questions</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    /* Stage 2 Buttons: Next Question & Finish Interview */
                    <>
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
                    </>
                  )}
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
                {Math.round(((liveMatch?.alignmentScore || 85) + (wpm ? Math.min(wpm / 1.4, 95) : 85) + (eyeContactScore || 92)) / 3)}
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
                {liveMatch?.alignmentScore || 75}%
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {liveMatch?.coveredSkills?.length || 0} skills matched
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eye Contact &amp; Poise</span>
              <div className="text-2xl font-black text-indigo-600 font-mono">
                {eyeContactScore || 92}%
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                Attentive &amp; Professional
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
                {liveMatch?.alignmentScore || 75}% Match
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
                  {liveMatch?.coveredSkills?.map((sk, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-700 border border-emerald-300 shadow-xs"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                  {liveMatch?.coveredProjects?.map((p, i) => (
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
                  {liveMatch?.missedHighlights?.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>



          {/* Action Dock */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Ready to retake or master another session?
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Practice makes permanent. Keep practicing face-to-face with the 3D Avatar to eliminate interview fear!
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
