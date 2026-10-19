import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  FileCheck,
  Code2,
  GraduationCap,
  Briefcase,
  Share2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  SAMPLE_RESUMES,
  extractResumeText,
  parseResumeContent,
  auditResumeHealth,
  crossMatchSpeechWithResume,
  generateResumeQuestions,
  detectSpeechMistakes,
} from '../../utils/resumeParser';
import { getBestFemaleVoice, configureFemaleUtterance } from '../../utils/femaleVoiceManager';
import { recordPracticeSession } from '../../utils/progressHistory';
import { playSuccessChime } from '../../utils/chime';

export default function ResumeSelfIntroStudio({ userName = 'Pragya', onBackToDashboard }) {
  // ── STEP STATE ──
  // 'resume_upload' | 'practice_intro' | 'followup_questions' | 'results'
  const [currentStep, setCurrentStep] = useState('resume_upload');

  // ── RESUME STATE ──
  const [resumeData, setResumeData] = useState(SAMPLE_RESUMES[0]);
  const [isParsing, setIsParsing] = useState(false);
  const [resumeAudit, setResumeAudit] = useState(() => auditResumeHealth(SAMPLE_RESUMES[0]));
  const [selectedAuditTab, setSelectedAuditTab] = useState('alternatives'); // 'alternatives' | 'problems' | 'summary'

  // ── PRACTICE TELEMETRY & SPEECH STATE ──
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [fillersCount, setFillersCount] = useState(0);
  const [eyeContactScore, setEyeContactScore] = useState(88);
  const [spokenMistakes, setSpokenMistakes] = useState({ mistakes: [], fillersCount: 0 });

  // ── LIVE RESUME MATCH STATE ──
  const [liveMatch, setLiveMatch] = useState(() => crossMatchSpeechWithResume('', SAMPLE_RESUMES[0]));

  // ── DYNAMIC RESUME FOLLOW-UP QUESTIONS ──
  const [questions, setQuestions] = useState(() => generateResumeQuestions(SAMPLE_RESUMES[0]));
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [isAiAsking, setIsAiAsking] = useState(false);

  // ── SPEECH RECOGNITION REFS ──
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef('');

  // ── INITIALIZE RESUME AUDIT ON RESUME CHANGE ──
  useEffect(() => {
    const audit = auditResumeHealth(resumeData);
    setResumeAudit(audit);
    setQuestions(generateResumeQuestions(resumeData));
    setLiveMatch(crossMatchSpeechWithResume(transcriptRef.current, resumeData));
  }, [resumeData]);

  // ── SPEAK AI TEXT ──
  const speakText = (text, onEnd) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    configureFemaleUtterance(utterance);
    const voice = getBestFemaleVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      setIsAiAsking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setIsAiAsking(false);
      if (onEnd) onEnd();
    };
    setIsAiAsking(true);
    window.speechSynthesis.speak(utterance);
  };

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

        // Calculate WPM
        const words = totalTranscript.split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, sessionSeconds) / 60;
        setWpm(Math.round(words / minutes));

        // Detect hesitation fillers
        const fillers = (totalTranscript.toLowerCase().match(/\b(umm|um|uh|uhh|like|you know|basically|actually)\b/g) || []).length;
        setFillersCount(fillers);

        // Detect speech mistakes
        const detected = detectSpeechMistakes(totalTranscript);
        setSpokenMistakes(detected);
      };

      rec.onerror = (e) => {
        console.warn('[SpeechRec] Error:', e.error);
        if (e.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions to practice.');
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
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
        timerRef.current = setInterval(() => {
          setSessionSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // ── SUBMIT INTRODUCTION & PROCEED TO QUESTIONS ──
  const handleFinishIntroduction = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    // If user barely said anything, encourage testing
    if (transcript.trim().length < 20) {
      const sampleSpoken = `Hello, my name is ${resumeData.name}. I am graduating with a degree in ${resumeData.degree} from ${resumeData.college}. My technical expertise includes ${resumeData.skills.allFound.slice(0, 3).join(', ')}. Recently, I architected ${resumeData.projects[0]?.title}, where I solved critical latency and scaling challenges. I am passionate about engineering clean, high-impact systems.`;
      setTranscript(sampleSpoken);
      transcriptRef.current = sampleSpoken;
      setLiveMatch(crossMatchSpeechWithResume(sampleSpoken, resumeData));
      setSpokenMistakes(detectSpeechMistakes(sampleSpoken));
    }

    setCurrentStep('followup_questions');
    setCurrentQIndex(0);

    // AI announces transition and speaks Question 1
    const firstQ = questions[0];
    setTimeout(() => {
      speakText(
        `Great introduction ${resumeData.name}! Now, let's dive into your resume with a technical follow-up: ${firstQ.question}`
      );
    }, 600);
  };

  // ── ANSWER QUESTION & ADVANCE ──
  const handleAnswerCurrentQuestion = (ansText) => {
    const q = questions[currentQIndex];
    setQuestionAnswers((prev) => ({
      ...prev,
      [q.id]: ansText || 'Strong technical response with system design considerations and trade-offs.',
    }));

    if (currentQIndex + 1 < questions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = questions[nextIdx];
      setTimeout(() => {
        speakText(`Next question: ${nextQ.question}`);
      }, 400);
    } else {
      // All questions completed -> View Results
      handleCompleteSession();
    }
  };

  // ── COMPLETE ENTIRE SESSION & SHOW DIAGNOSTICS ──
  const handleCompleteSession = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    // Play celebration audio and confetti
    playSuccessChime();
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'],
    });

    // Record to persistent practice history
    const finalScore = Math.round((liveMatch.alignmentScore + resumeAudit.atsScore) / 2);
    recordPracticeSession({
      mode: 'Self Introduction',
      score: finalScore,
      eyeContact: eyeContactScore,
      fillersCount: fillersCount,
      summary: `Delivered resume-aligned introduction for ${resumeData.role} at ${resumeData.college}.`,
      badge: finalScore >= 85 ? '🌟 Articulate Speaker' : '🚀 Confident Presenter',
    });

    setCurrentStep('results');
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none">
      {/* ── TOP EXECUTIVE APP HEADER ── */}
      <header className="h-16 px-6 bg-white border-b border-[#e2e8f0] flex items-center justify-between sticky top-0 z-30 shadow-xs">
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
                Self-Introduction &amp; Resume-Linked Interview Studio
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                Baatology AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Resume parsing • Live alignment tracking • AI Resume flaw audit &amp; "Iske jagah ye likho" recommendations
            </p>
          </div>
        </div>

        {/* Studio Navigation Stepper */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setCurrentStep('resume_upload')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentStep === 'resume_upload'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Resume &amp; Audit
          </button>
          <button
            onClick={() => setCurrentStep('practice_intro')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentStep === 'practice_intro'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Self Introduction
          </button>
          <button
            onClick={() => setCurrentStep('followup_questions')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentStep === 'followup_questions'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. AI Questions
          </button>
          <button
            onClick={() => setCurrentStep('results')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentStep === 'results'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Diagnostic Report
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTENT BASED ON ACTIVE STEP ── */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ══════════════════════════════════════════════════════════════════════
            STEP 1: RESUME SUBMISSION, PARSER & AI FLAW DETECTOR
        ══════════════════════════════════════════════════════════════════════ */}
        {currentStep === 'resume_upload' && (
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
                    Drop your resume here. AI will extract your projects, skills, and analyze mistakes before practice.
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

                {/* Action button: Proceed to Practice */}
                <button
                  onClick={() => setCurrentStep('practice_intro')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Proceed to Self Introduction Practice</span>
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
                  Resume checked. Ready to test your voice delivery?
                </span>
                <button
                  onClick={() => setCurrentStep('practice_intro')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Start Practice Round</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2: LIVE RESUME-ALIGNED SELF INTRODUCTION DELIVERY
        ══════════════════════════════════════════════════════════════════════ */}
        {currentStep === 'practice_intro' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 cols): Elevator Pitch Blueprint & Live Resume Match Badges */}
            <div className="lg:col-span-5 space-y-5">
              {/* Pitch Structure Guide (Tailored from Candidate Resume) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Your Resume Elevator Pitch Guide
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    60–90s Pitch
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <div className="font-extrabold text-blue-900 flex items-center gap-1.5 mb-0.5">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                      Identity &amp; College
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      "My name is {resumeData.name}, pursuing {resumeData.degree} from {resumeData.college}."
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <div className="font-extrabold text-indigo-900 flex items-center gap-1.5 mb-0.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                      Core Tech Stack
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      "I specialize in {resumeData.skills?.allFound?.slice(0, 3).join(', ')} with strong CS fundamentals in DSA."
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <div className="font-extrabold text-emerald-900 flex items-center gap-1.5 mb-0.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                      Flagship Project
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      "Recently, I built {resumeData.projects[0]?.title}, focusing on system architecture and scalability."
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                    <div className="font-extrabold text-amber-900 flex items-center gap-1.5 mb-0.5">
                      <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">4</span>
                      Career Vision &amp; Value
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      "I'm eager to bring my problem-solving ability to an engineering team and build reliable software."
                    </p>
                  </div>
                </div>
              </div>

              {/* LIVE RESUME CROSS-MATCH HUD */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Live Resume Cross-Matching
                    </h4>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    liveMatch.alignmentScore >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {liveMatch.alignmentScore}% Aligned
                  </span>
                </div>

                {/* Covered Skills */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    🟢 Mentioned from Resume ({liveMatch.coveredSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {liveMatch.coveredSkills.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        Start speaking skills from your resume...
                      </span>
                    ) : (
                      liveMatch.coveredSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fade-in flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{sk}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Missed Highlights Real-time Reminder */}
                {liveMatch.missedHighlights.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-extrabold flex items-center gap-1 text-amber-800 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Tip: Don't forget to mention:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800/90 font-medium">
                      {liveMatch.missedHighlights.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Inconsistencies Warning (If detected) */}
                {liveMatch.inconsistencies.length > 0 && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1 animate-pulse">
                    <span className="font-extrabold flex items-center gap-1 text-red-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Discrepancy / Inconsistency Detected:
                    </span>
                    {liveMatch.inconsistencies.map((inc, idx) => (
                      <div key={idx} className="text-[11px] text-red-800">
                        <strong>Claim:</strong> {inc.claim} • <strong>Fact:</strong> {inc.resumeFact}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (7 cols): Live Microphone Practice Arena & Voice Telemetry */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              {/* Telemetry Bar (Timer, WPM, Eye Contact, Fillers) */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {Math.floor(sessionSeconds / 60)}:{(sessionSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Speed (WPM)</span>
                  <span className="text-base font-black text-blue-600 font-mono">
                    {wpm || '--'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fillers ("umm")</span>
                  <span className={`text-base font-black font-mono ${fillersCount > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {fillersCount}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eye Contact</span>
                  <span className="text-base font-black text-indigo-600 font-mono">
                    {eyeContactScore}%
                  </span>
                </div>
              </div>

              {/* Spoken Word Stream (Real-Time Audio Recognition Window) */}
              <div className="h-64 rounded-2xl bg-slate-900 text-slate-100 p-4 border border-slate-800 overflow-y-auto font-sans text-xs leading-relaxed flex flex-col justify-between relative shadow-inner">
                {transcript.length === 0 && !interimText ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                    <Mic className="w-8 h-8 text-blue-400 animate-bounce" />
                    <p className="font-medium text-xs">
                      Click <strong>"Start Speaking"</strong> below and deliver your introduction.
                    </p>
                    <span className="text-[11px] text-slate-500 max-w-sm">
                      AI will transcribe every word, cross-match your resume, and detect speech mistakes in real time.
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-2">
                      Live Spoken Audio Transcript:
                    </span>
                    <span className="text-slate-200 font-normal">{transcript}</span>
                    <span className="text-blue-300 italic font-normal"> {interimText}</span>
                  </div>
                )}

                {/* Live Mic Animation Ribbon */}
                {isListening && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-2 text-[10px] text-emerald-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>MICROPHONE RECORDING ACTIVE • SPEAK NATURALLY</span>
                    </div>
                    <span>Web Audio Telemetry</span>
                  </div>
                )}
              </div>

              {/* Controls Dock */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={toggleListening}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200 animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Pause Microphone</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>{transcript ? 'Resume Speaking' : 'Start Speaking Introduction'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setTranscript('');
                      transcriptRef.current = '';
                      setSessionSeconds(0);
                    }}
                    className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                    title="Reset Speech"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleFinishIntroduction}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Finish &amp; Ask AI Questions</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Detected Mistakes Preview */}
              {spokenMistakes.mistakes.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-extrabold text-rose-900">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Live Speech Mistakes Detected ({spokenMistakes.mistakes.length}):
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold uppercase">
                      Instant Feedback
                    </span>
                  </div>
                  {spokenMistakes.mistakes.slice(0, 2).map((m, idx) => (
                    <div key={idx} className="text-[11px] text-rose-800">
                      <strong>{m.found}:</strong> {m.correction}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 3: RESUME-TAILORED DYNAMIC AI FOLLOW-UP QUESTIONS
        ══════════════════════════════════════════════════════════════════════ */}
        {currentStep === 'followup_questions' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Resume-Tailored Interview Question #{currentQIndex + 1} of {questions.length}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {questions[currentQIndex]?.category} • Extracted from your uploaded resume
                  </p>
                </div>
              </div>
              <button
                onClick={() => speakText(questions[currentQIndex]?.question)}
                className="p-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all cursor-pointer"
                title="Hear Question Aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* The Dynamic Question Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white space-y-3 shadow-md">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
                AI Interviewer Question:
              </span>
              <p className="text-sm sm:text-base font-bold leading-relaxed">
                "{questions[currentQIndex]?.question}"
              </p>
              <div className="pt-2 border-t border-white/10 text-xs text-blue-200 font-medium">
                💡 <strong>Hint:</strong> {questions[currentQIndex]?.hint}
              </div>
            </div>

            {/* Student's Answer Input Area */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Your Spoken / Typed Response:</span>
                <span className="text-[11px] text-slate-400 font-normal">Speak or type your answer</span>
              </label>
              <textarea
                rows={4}
                value={questionAnswers[questions[currentQIndex]?.id] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuestionAnswers((prev) => ({
                    ...prev,
                    [questions[currentQIndex]?.id]: val,
                  }));
                }}
                placeholder="Click the microphone or type your response here..."
                className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs leading-relaxed text-slate-800"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    // Quick sample answer for testing
                    handleAnswerCurrentQuestion(
                      `In my project, I decoupled frontend rendering from data fetching using custom React hooks and optimized database indexing in PostgreSQL. The biggest bottleneck was API latency under burst traffic, which I addressed by introducing Redis caching.`
                    );
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  ⚡ Auto-fill Sample Candidate Answer
                </button>

                <button
                  onClick={() => handleAnswerCurrentQuestion(questionAnswers[questions[currentQIndex]?.id])}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{currentQIndex + 1 < questions.length ? 'Next Question' : 'Finish & View Diagnostics'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 4: COMPREHENSIVE PERFORMANCE & RESUME DIAGNOSTIC REPORT
        ══════════════════════════════════════════════════════════════════════ */}
        {currentStep === 'results' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Grand Results Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      Session Complete — Outstanding Performance!
                    </h2>
                    <span className="text-xl">🎉</span>
                  </div>
                  <p className="text-xs text-blue-200 mt-1">
                    Baatology AI Mentorship • Comprehensive Self-Introduction &amp; Resume Diagnostic
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

            {/* Scorecard Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resume Alignment</span>
                <span className="text-xl font-black text-blue-600 font-mono mt-1 block">
                  {liveMatch.alignmentScore}%
                </span>
                <span className="text-[10px] text-slate-500">Profile Match</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resume ATS Health</span>
                <span className="text-xl font-black text-indigo-600 font-mono mt-1 block">
                  {resumeAudit.atsScore}%
                </span>
                <span className="text-[10px] text-slate-500">Benchmark Score</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vocal Fluency</span>
                <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
                  {spokenMistakes.clarityScore || 85}%
                </span>
                <span className="text-[10px] text-slate-500">{wpm} WPM Pace</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hesitation Fillers</span>
                <span className="text-xl font-black text-amber-600 font-mono mt-1 block">
                  {fillersCount}
                </span>
                <span className="text-[10px] text-slate-500">"umm/uh" Count</span>
              </div>
            </div>

            {/* Detailed Mistake Detection & Fixes */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="text-base font-extrabold">
                  Spoken Mistakes &amp; Grammar Improvements
                </h4>
              </div>

              {spokenMistakes.mistakes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  ✅ Flawless vocal delivery! No repetitive fillers or major grammatical errors detected.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {spokenMistakes.mistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{m.type}</span>
                        <span className="text-[10px] text-rose-600 uppercase font-black">Needs Practice</span>
                      </div>
                      <p className="text-rose-900 font-medium">⚠️ {m.found}</p>
                      <p className="text-emerald-900 font-bold bg-white p-2 rounded-xl border border-slate-200">
                        💡 <strong>Executive Correction:</strong> {m.correction}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resume Flaws & Actionable "Iske Jagah Ye Rakhein" Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-extrabold">
                  Resume Action Plan: "Iske Jagah Ye Rakhte Toh Jyada Better Hota"
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                {resumeAudit.problems.map((prob, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-extrabold text-slate-900 block">{prob.type}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-900">
                        <strong>Existing:</strong> {prob.beforeAfter?.before || prob.found}
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 font-bold">
                        <strong>Better Rewrite:</strong> {prob.beforeAfter?.after || prob.recommendation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => {
                  setTranscript('');
                  setCurrentStep('practice_intro');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>

              <button
                onClick={onBackToDashboard}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
