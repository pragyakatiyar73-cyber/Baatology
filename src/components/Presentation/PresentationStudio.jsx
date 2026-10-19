import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Tv,
  Monitor,
  Upload,
  Radio,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  Brain,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Clock,
  Layers,
  BarChart3,
  HelpCircle,
  PlusCircle,
  FolderOpen,
  Laptop,
} from 'lucide-react';

import { parsePresentationFile, parsePPTXFile, analyzeSlideQuality } from '../../utils/pptxParser';
import { getProjectQuestions } from '../../utils/presentationSlideDeck';
import { usePresentationVoiceController } from '../../hooks/usePresentationVoiceController';
import PresentationScoreModal from './PresentationScoreModal';
import PresentationQAPanel from './PresentationQAPanel';
import { firePresentationCelebration } from '../../utils/celebration';

export default function PresentationStudio({
  userName = 'Pragya',
  onBackToDashboard,
}) {
  // Session Phase: 'presentation' | 'qa_round'
  const [sessionPhase, setSessionPhase] = useState('presentation');

  // Slide & PPT state
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideAnalysis, setSlideAnalysis] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Live Presentation Timer State ("timing start ho student pata kar paye ussne kitne time me complete ki hai")
  const [presentationSeconds, setPresentationSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [finalDuration, setFinalDuration] = useState(0);

  // Modals & UI States
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scorecardData, setScorecardData] = useState(null);
  const [qaResults, setQaResults] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const fileInputRef = useRef(null);
  const presentationContainerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const currentSlide = slides[currentSlideIndex] || slides[0] || null;

  // ── 1. Live Presentation Timer ──
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setPresentationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning]);

  const timerMin = Math.floor(presentationSeconds / 60);
  const timerSec = presentationSeconds % 60;
  const formattedTimer = `${String(timerMin).padStart(2, '0')}:${String(timerSec).padStart(2, '0')}`;

  // ── 2. Direct File Upload from Laptop ("me chati hu ppt agar laptop me ho to direct open kar do") ──
  const handleFilesSelected = async (fileListOrFile) => {
    if (!fileListOrFile) return;

    const files = fileListOrFile instanceof FileList || Array.isArray(fileListOrFile)
      ? Array.from(fileListOrFile)
      : [fileListOrFile];

    if (files.length === 0) return;

    setIsProcessingFile(true);
    const displayName = files.length > 1 ? `${files.length} Slide Images` : files[0].name;
    setUploadedFileName(displayName);

    try {
      const result = await parsePresentationFile(files.length === 1 ? files[0] : files);
      if (result.success && result.slides?.length > 0) {
        setSlides(result.slides);
        setSlideAnalysis(result.slideAnalysis);
        setCurrentSlideIndex(0);
        setSessionPhase('presentation');

        // Start presentation timing immediately upon loading PPT
        setPresentationSeconds(0);
        setIsTimerRunning(true);
      } else {
        alert('Could not extract slides from this file. Please ensure it is a valid .pptx, .pdf, or image file.');
      }
    } catch (err) {
      console.error('PPT processing error:', err);
      alert('Error loading presentation: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Quick Demo: Load Pragya Katiyar's Agentic AI presentation with 100% native HD slide
  const handleLoadAgenticDemo = () => {
    setIsProcessingFile(true);
    setUploadedFileName('Agentic_AI_Presentation.pptx');

    const demoSlides = [
      {
        slideNumber: 1,
        title: 'AGENTIC AI: The Future of Smart AI',
        subtitle: 'Maharana Pratap Engineering College, Kanpur • Department of Computer Applications',
        category: 'Title Slide',
        slideImageUrl: '/slides/agentic_ai_slide1.png',
        bullets: [
          'Presented by: Pragya Katiyar',
          'Supervised by: Miss. Somya Shrivastav, Assistant Professor',
          'Autonomous decision-making and intelligent multi-agent systems overview.',
        ],
        metadata: {
          faculty: 'Miss. Somya Shrivastav',
          presenter: 'Pragya Katiyar',
          college: 'Maharana Pratap Engineering College, Kanpur',
        },
        wordCount: 30,
        keyTerms: ['agentic', 'ai', 'pragya', 'autonomous', 'decision-making'],
        metrics: {
          slideNumber: '1 of 4',
          resolution: '100% HD Native',
          status: 'Ready',
        },
      },
      {
        slideNumber: 2,
        title: 'Evolution: Traditional AI vs Agentic AI',
        subtitle: 'From passive predictive models to autonomous task execution agents.',
        category: 'Conceptual Architecture',
        bullets: [
          'Traditional AI acts as passive text/code completion with zero environment action.',
          'Agentic AI plans multi-step trajectories, uses tools, and self-corrects runtime errors.',
          'Reduces human oversight for complex end-to-end workflows by 70%.',
        ],
        wordCount: 38,
        keyTerms: ['evolution', 'autonomous', 'execution', 'trajectories'],
        metrics: { speedup: '3.4x faster', autonomy: '70% gain' },
      },
      {
        slideNumber: 3,
        title: 'System Architecture & Tool Orchestration',
        subtitle: 'Perception, Planning, Memory, and Tool Execution pipeline.',
        category: 'Technical Design',
        bullets: [
          'Perception Engine analyzes incoming multimodal inputs with sub-50ms latency.',
          'Hierarchical planner breaks high-level goals into DAG sub-tasks.',
          'Tool execution runtime with sandboxed shell and safety verification.',
        ],
        wordCount: 34,
        keyTerms: ['architecture', 'pipeline', 'perception', 'planner'],
        metrics: { latency: '< 50ms', safety: '100% sandboxed' },
      },
      {
        slideNumber: 4,
        title: 'Conclusion, Key Takeaways & Q&A',
        subtitle: 'Transforming software development through autonomous AI agents.',
        category: 'Closing & Defense',
        bullets: [
          'Demonstrated practical applicability of agentic workflows in real-world engineering.',
          'Achieved high accuracy and autonomous task completion rates.',
          'Thank you! I welcome your questions and feedback.',
        ],
        wordCount: 28,
        keyTerms: ['conclusion', 'takeaways', 'questions', 'defense'],
        metrics: { status: 'Delivered', score: 'Distinction' },
      },
    ];

    const analysis = analyzeSlideQuality(demoSlides, 'Agentic AI');
    setSlides(demoSlides);
    setSlideAnalysis(analysis);
    setCurrentSlideIndex(0);
    setSessionPhase('presentation');
    setPresentationSeconds(0);
    setIsTimerRunning(true);
    setIsProcessingFile(false);
  };

  // ── 3. Slide Navigation Handlers ──
  const handleNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleGoToSlide = useCallback(
    (slideNum) => {
      const idx = Math.max(0, Math.min(slides.length - 1, slideNum - 1));
      setCurrentSlideIndex(idx);
    },
    [slides.length]
  );

  // ── 4. Voice Controller Hook for Slide Presentation ──
  const {
    isListening,
    liveTranscript,
    lastVoiceCommand,
    audioLevel,
    deliveryAnalytics,
    toggleListening,
    generateScorecard,
  } = usePresentationVoiceController({
    currentSlide,
    currentSlideIndex,
    totalSlides: Math.max(1, slides.length),
    onNextSlide: handleNextSlide,
    onPrevSlide: handlePrevSlide,
    onGoToSlide: handleGoToSlide,
    autoStart: sessionPhase === 'presentation' && slides.length > 0,
  });

  // ── 5. Transition to Q&A Round ──
  const handleStartQARound = () => {
    // Stop live timer and record duration
    setIsTimerRunning(false);
    setFinalDuration(presentationSeconds);
    setSessionPhase('qa_round');
  };

  // ── 6. Handle Q&A Completion ("after ppt claping ke abbaj ayye and feedback and mistakes show ho") ──
  const handleQACompleted = async (results) => {
    setQaResults(results);

    // Compute presentation scorecard
    const scorecard = await generateScorecard();
    scorecard.sessionDuration = finalDuration || presentationSeconds;
    setScorecardData(scorecard);

    // Trigger authentic applause / clapping sound + fireworks + AI congratulations!
    firePresentationCelebration(userName, () => {
      setShowScoreModal(true);
    });
  };

  // ── 7. Toggle Fullscreen ──
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      presentationContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // ── 8. Restart Presentation ──
  const handleRestart = () => {
    setShowScoreModal(false);
    setCurrentSlideIndex(0);
    setPresentationSeconds(0);
    setIsTimerRunning(true);
    setSessionPhase('presentation');
  };

  // Questions tailored to the uploaded PPT
  const qaQuestions = getProjectQuestions({
    title: uploadedFileName.replace(/\.[^/.]+$/, '') || 'your PowerPoint presentation',
    techStack: 'your presentation slides',
  });

  return (
    <div
      ref={presentationContainerRef}
      className="relative w-full h-screen bg-[#0b1329] text-white flex flex-col justify-between overflow-hidden select-none p-3 sm:p-5"
    >
      {/* Hidden file input that directly opens the laptop's OS file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,.ppt,.pdf,.png,.jpg,.jpeg,.webp"
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />

      {/* ══════════════════════════════════════════════════════════════
          1. TOP HEADER (Title, PPT Name, Live Timer, Direct Upload)
      ══════════════════════════════════════════════════════════════ */}
      <header className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-900/30 shrink-0">
        {/* Left: Return, Logo & Title */}
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Blue Rounded Screen Icon */}
          <div className="w-10 h-10 rounded-2xl bg-[#0066ff] shadow-lg shadow-blue-500/25 flex items-center justify-center text-white shrink-0">
            <Tv className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                AI Smart Presentation Studio
              </h1>
              {slides.length > 0 && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-[10px] font-bold text-cyan-300">
                  {sessionPhase === 'presentation' ? '● Slide Presentation' : '● Technical Q&A Round'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-sm sm:max-w-md">
              {uploadedFileName ? (
                <>PPT: <span className="text-cyan-300 font-bold">{uploadedFileName}</span> ({slides.length} slides)</>
              ) : (
                'Upload your PowerPoint (.pptx) or PDF (.pdf) directly from your laptop to begin'
              )}
            </p>
          </div>
        </div>

        {/* Right: Live Presentation Timer & Direct Laptop Upload Button */}
        <div className="flex items-center gap-2.5">
          {/* Live Timer Pill ("timing start ho student pata kar paye") */}
          {slides.length > 0 && (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all ${
                isTimerRunning
                  ? 'bg-blue-950/90 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
              title="Presentation Speaking Duration"
            >
              <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
              <span>⏱️ {formattedTimer}</span>
            </div>
          )}

          {/* Direct Laptop PPT Upload Button ("direct open kar do laptop me ho to") */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-[#2563eb] hover:border-cyan-400 bg-[#0d1b38]/80 hover:bg-[#122247] text-[#38bdf8] hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            title="Directly select PowerPoint (.pptx) or PDF (.pdf) file from your laptop"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span>{uploadedFileName ? 'Change PPT' : 'Select PPT from Laptop'}</span>
          </button>

          {/* Action Button: Finish Presentation & Start Q&A */}
          {slides.length > 0 && sessionPhase === 'presentation' && (
            <button
              onClick={handleStartQARound}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              title="Finish presenting your slides and begin AI Technical Q&A"
            >
              <HelpCircle className="w-4 h-4 text-emerald-200" />
              <span>Finish &amp; Start Q&amp;A ➔</span>
            </button>
          )}

          {slides.length > 0 && sessionPhase === 'qa_round' && (
            <button
              onClick={() => setSessionPhase('presentation')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              <span>← Back to Slides</span>
            </button>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. MAIN CONTENT AREA:
             A) If No Slides Loaded: Direct Laptop Upload Zone
             B) If Slides Loaded: 16:9 Screen Board & Real-Time Telemetry
             C) If Q&A Phase: AI Technical Q&A Panel
      ══════════════════════════════════════════════════════════════ */}
      {slides.length === 0 ? (
        /* ── DIRECT LAPTOP UPLOAD INITIAL VIEW (No dummy slides, direct laptop open) ── */
        <main className="flex-1 w-full flex items-center justify-center p-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFilesSelected(e.dataTransfer.files);
            }}
            className={`w-full max-w-2xl p-8 sm:p-14 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-4 shadow-2xl ${
              dragOver
                ? 'border-cyan-400 bg-cyan-950/30 shadow-cyan-500/20 scale-[1.01]'
                : 'border-blue-700/60 bg-[#0d172e]/90 hover:bg-[#111e3b] hover:border-cyan-400'
            }`}
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-pulse">
              <Laptop className="w-10 h-10" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Upload Your PPT Directly from Laptop
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Click below to select your <span className="text-cyan-300 font-bold">.pptx</span>, <span className="text-cyan-300 font-bold">.pdf</span>, or <span className="text-cyan-300 font-bold">slide images</span> directly from your computer.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse PPT / Slides from Laptop</span>
              </button>

              <button
                type="button"
                onClick={handleLoadAgenticDemo}
                className="px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Directly open Pragya Katiyar's Agentic AI Presentation with 100% native HD slide"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Demo: Open Agentic AI Presentation</span>
              </button>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="px-3 py-1 rounded-xl bg-blue-950/60 border border-blue-800/40">
                📄 Direct Native Slide Extraction
              </span>
              <span className="px-3 py-1 rounded-xl bg-blue-950/60 border border-blue-800/40">
                🎙️ Real-time Voice Navigation
              </span>
              <span className="px-3 py-1 rounded-xl bg-blue-950/60 border border-blue-800/40">
                ⏱️ Auto Presentation Timer
              </span>
              <span className="px-3 py-1 rounded-xl bg-blue-950/60 border border-blue-800/40">
                📊 Slide Mistake Detection
              </span>
            </div>

            {isProcessingFile && (
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold animate-pulse pt-2">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Extracting slides from your presentation file...</span>
              </div>
            )}
          </div>
        </main>
      ) : sessionPhase === 'qa_round' ? (
        /* ── Q&A ROUND STAGE ── */
        <main className="flex-1 w-full py-3 overflow-hidden flex items-center justify-center">
          <PresentationQAPanel
            projectData={{ title: uploadedFileName.replace(/\.[^/.]+$/, '') || 'Your Project Presentation' }}
            questions={qaQuestions}
            userName={userName}
            onQACompleted={handleQACompleted}
          />
        </main>
      ) : (
        /* ── SLIDE PRESENTATION STAGE WITH FIXED 16:9 CANVAS ── */
        <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 py-3 overflow-hidden items-stretch">
          {/* ── LEFT AREA (8 cols): Digital Screen Board ── */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl bg-[#0f1b35]/80 border border-blue-900/30 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
            {/* Top Bar inside Digital Board */}
            <div className="flex items-center justify-between pb-2.5">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span className="text-white">Digital Screen Board</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{currentSlide?.category}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Live timer display on board */}
                <div className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold">
                  ⏱️ {formattedTimer}
                </div>

                {/* Slide Indicator Badge */}
                <div className="px-3 py-1 rounded-full bg-[#0a1226]/90 border border-blue-800/40 text-blue-300 font-mono text-xs font-bold shadow-inner">
                  Slide {currentSlideIndex + 1} / {slides.length}
                </div>
              </div>
            </div>

            {/* ── 16:9 HD Presentation Screen Canvas ("as it is show ho and ppt clear dhekhe") ── */}
            {currentSlide?.slideImageUrl ? (
              <div className="flex-1 w-full bg-[#050811] rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center relative group border border-slate-800">
                <img
                  src={currentSlide.slideImageUrl}
                  alt={currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                  className="w-full h-full object-contain rounded-xl select-none"
                  style={{ imageRendering: 'high-quality' }}
                />
                {/* 100% HD Native Slide Badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1.5 opacity-90 shadow-lg pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>100% HD Native Slide</span>
                </div>
              </div>
            ) : (
              /* Fallback formatted slide canvas with dark modern executive styling */
              <div className="flex-1 w-full bg-[#0d172e] rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between p-5 sm:p-8 text-white relative transition-all duration-300 border border-blue-900/40">
                {/* Slide Header */}
                <div className="border-b border-blue-900/50 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                      {currentSlide?.category || 'Executive Analysis'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">
                      {uploadedFileName || '16:9 HD Board'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 leading-tight text-left">
                    {currentSlide?.title}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium mt-0.5 text-left">
                    {currentSlide?.subtitle}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2.5 flex-1 py-3 text-left overflow-y-auto max-h-[50vh]">
                  {currentSlide?.bullets?.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-400/40 text-cyan-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="font-medium leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>

                {/* Metrics Cards Footer */}
                {currentSlide?.metrics && (
                  <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-blue-900/40">
                    {Object.entries(currentSlide.metrics).map(([key, val], idx) => (
                      <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-blue-900/50 text-left">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-cyan-400 truncate block">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Slide Thumbnails Strip (Click to Jump) ── */}
            <div className="flex items-center gap-2 pt-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 max-w-[170px] border ${
                    currentSlideIndex === idx
                      ? 'bg-blue-600/90 border-cyan-400 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-[#121c36] hover:bg-[#1a284c] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={s.title}
                >
                  {s.slideImageUrl ? (
                    <img
                      src={s.slideImageUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-10 h-6 object-cover rounded-md border border-white/20 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-6 rounded-md bg-slate-800 flex items-center justify-center text-[9px] text-cyan-400 font-mono font-bold shrink-0">
                      #{idx + 1}
                    </div>
                  )}
                  <span className="truncate text-left">{idx + 1}. {s.title}</span>
                </button>
              ))}
            </div>

            {/* ── Bottom Navigation Controls ── */}
            <div className="flex items-center justify-between pt-2">
              {/* Prev and Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlideIndex === 0}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    currentSlideIndex === 0
                      ? 'bg-[#141d33] text-slate-500 border-slate-800 cursor-not-allowed'
                      : 'bg-[#1a233a] hover:bg-[#253252] text-slate-200 border-slate-700/60 cursor-pointer shadow-md'
                  }`}
                  title="Go to previous slide (or say 'Previous slide')"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <button
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
                    currentSlideIndex === slides.length - 1
                      ? 'bg-blue-900/50 text-blue-400/50 cursor-not-allowed'
                      : 'bg-[#0066ff] hover:bg-[#0055dd] text-white shadow-blue-600/30 cursor-pointer active:scale-95'
                  }`}
                  title="Go to next slide (or say 'Next slide')"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right Tools: Fullscreen & Audio Icons */}
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  onClick={handleToggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsAudioMuted((prev) => !prev)}
                  className="p-1.5 rounded-lg hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
                  title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR (4 cols): Two Floating Control Cards ── */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full">
            {/* ══════════════════════════════════════════════════════════
                CARD 1: Voice Assistant & Microphone Status
            ══════════════════════════════════════════════════════════ */}
            <div className="rounded-3xl bg-[#0f1b35]/80 border border-blue-900/30 p-5 flex flex-col items-center justify-center text-center shadow-xl relative min-h-[170px]">
              {/* Glowing Blue Circular Mic Icon */}
              <div
                onClick={toggleListening}
                className={`w-13 h-13 rounded-full flex items-center justify-center mb-2.5 transition-all cursor-pointer shadow-lg ${
                  isListening
                    ? 'bg-blue-600/25 border-2 border-blue-400 text-blue-400 shadow-blue-500/20 animate-pulse'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-400'
                }`}
                title={isListening ? 'Click to Mute Voice Controller' : 'Click to Activate Voice Controller'}
              >
                {isListening ? <Mic className="w-6 h-6 text-blue-400" /> : <MicOff className="w-6 h-6 text-slate-400" />}
              </div>

              {/* Heading */}
              <h3 className="text-sm font-extrabold text-white">
                {isListening ? 'Listening (Voice Active)' : 'Microphone Inactive'}
              </h3>

              {/* Subtext Voice Hint */}
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                "Next slide please" ya "Agli slide" bol kar slide change karein.
              </p>

              {/* Audio Waveform Indicator */}
              {isListening && (
                <div className="flex items-center gap-1 mt-2.5">
                  {[20, 45, 80, 50, 95, 60, 30, 70, 40].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-blue-400 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.max(6, Math.min(22, (h * audioLevel) / 100))}px`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Voice Command Badge Trigger Notification */}
              {lastVoiceCommand && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold animate-fade-in shadow-md">
                  {lastVoiceCommand}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                CARD 2: AI Co-Pilot & Real-Time Delivery Feedback
            ══════════════════════════════════════════════════════════ */}
            <div className="flex-1 rounded-3xl bg-[#0f1b35]/80 border border-blue-900/30 p-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-2.5">
                {/* Card Header: Purple AI Icon + Title */}
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    AI Delivery Telemetry
                  </h3>
                </div>

                {/* Inner Feedback Box */}
                <div className="rounded-2xl bg-[#0c1428] border border-blue-950 p-3.5 space-y-1.5 text-left shadow-inner">
                  <h4 className="text-xs font-bold text-cyan-300 leading-snug">
                    {deliveryAnalytics.feedbackTitle}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                    {deliveryAnalytics.feedbackMessage}
                  </p>
                </div>

                {/* Real-time Mistake Detection Telemetry Badges */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Filler Words Badge */}
                  <div
                    className={`p-2 rounded-xl text-center border text-[11px] font-bold ${
                      deliveryAnalytics.fillersCount > 0
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                        : 'bg-[#0a1122] border-blue-900/40 text-slate-300'
                    }`}
                  >
                    <span className="text-[9px] uppercase text-slate-400 block font-semibold">
                      Fillers
                    </span>
                    <span>{deliveryAnalytics.fillersCount} Used</span>
                  </div>

                  {/* Speaking Pace (WPM) Badge */}
                  <div
                    className={`p-2 rounded-xl text-center border text-[11px] font-bold ${
                      deliveryAnalytics.paceStatus !== 'Optimal'
                        ? 'bg-orange-950/60 border-orange-500/40 text-orange-300'
                        : 'bg-[#0a1122] border-blue-900/40 text-emerald-300'
                    }`}
                  >
                    <span className="text-[9px] uppercase text-slate-400 block font-semibold">
                      Pace
                    </span>
                    <span>{deliveryAnalytics.wpm} WPM</span>
                  </div>

                  {/* Content Alignment Badge */}
                  <div className="p-2 rounded-xl text-center border bg-[#0a1122] border-blue-900/40 text-cyan-300 text-[11px] font-bold">
                    <span className="text-[9px] uppercase text-slate-400 block font-semibold">
                      Alignment
                    </span>
                    <span>{deliveryAnalytics.alignmentScore}% Match</span>
                  </div>

                  {/* Confidence Badge */}
                  <div className="p-2 rounded-xl text-center border bg-[#0a1122] border-blue-900/40 text-teal-300 text-[11px] font-bold">
                    <span className="text-[9px] uppercase text-slate-400 block font-semibold">
                      Confidence
                    </span>
                    <span>{deliveryAnalytics.confidenceScore}%</span>
                  </div>
                </div>
              </div>

              {/* Live Candidate Transcript Ticker */}
              {liveTranscript && (
                <div className="mt-2.5 p-2 rounded-xl bg-black/60 border border-white/10 text-[11px] text-slate-300 font-mono leading-relaxed max-h-16 overflow-y-auto text-left">
                  <span className="text-cyan-400 font-bold block mb-0.5">● Speaking:</span>
                  "{liveTranscript}"
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. POST-PRESENTATION SCORECARD & MISTAKE REPORT MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showScoreModal && (
        <PresentationScoreModal
          scorecard={scorecardData}
          qaResults={qaResults}
          presentationDuration={finalDuration || presentationSeconds}
          slideAnalysis={slideAnalysis}
          pptFileName={uploadedFileName}
          onClose={() => {
            setShowScoreModal(false);
            if (onBackToDashboard) onBackToDashboard();
          }}
          onRestart={handleRestart}
          userName={userName}
        />
      )}
    </div>
  );
}
