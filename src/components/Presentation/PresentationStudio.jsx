import React, { useState, useRef, useCallback } from 'react';
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
} from 'lucide-react';

import {
  INITIAL_EXECUTIVE_SLIDES,
  POPULAR_PROJECT_TEMPLATES,
  generateSlidesFromProjectDetails,
  getProjectQuestions,
  processPresentationFile,
} from '../../utils/presentationSlideDeck';
import { usePresentationVoiceController } from '../../hooks/usePresentationVoiceController';
import PresentationScoreModal from './PresentationScoreModal';
import SubmitProjectModal from './SubmitProjectModal';
import PresentationQAPanel from './PresentationQAPanel';
import { firePresentationCelebration } from '../../utils/celebration';

export default function PresentationStudio({
  userName = 'Pragya',
  onBackToDashboard,
}) {
  // Session Phase: 'presentation' | 'qa_round'
  const [sessionPhase, setSessionPhase] = useState('presentation');

  // Project state
  const [currentProject, setCurrentProject] = useState(POPULAR_PROJECT_TEMPLATES[0]);
  const [slides, setSlides] = useState(() => generateSlidesFromProjectDetails(POPULAR_PROJECT_TEMPLATES[0]));
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Modals & UI States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scorecardData, setScorecardData] = useState(null);
  const [qaResults, setQaResults] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const presentationContainerRef = useRef(null);
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // ── Slide Navigation Handlers ──
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

  // ── Voice Controller Hook for Slide Presentation ──
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
    totalSlides: slides.length,
    onNextSlide: handleNextSlide,
    onPrevSlide: handlePrevSlide,
    onGoToSlide: handleGoToSlide,
    autoStart: sessionPhase === 'presentation',
  });

  // ── Handle Project / PPT Loaded from Modal ──
  const handleProjectLoaded = ({ projectData, slides: loadedSlides, projectName }) => {
    setCurrentProject(projectData);
    setSlides(loadedSlides);
    setCurrentSlideIndex(0);
    setSessionPhase('presentation');
  };

  // ── Transition to Q&A Round ──
  const handleStartQARound = () => {
    setSessionPhase('qa_round');
  };

  // ── Handle Q&A Completion ──
  const handleQACompleted = async (results) => {
    setQaResults(results);

    // Compute presentation scorecard
    const scorecard = await generateScorecard();
    setScorecardData(scorecard);

    // Trigger fireworks and AI congratulations
    firePresentationCelebration(userName, () => {
      setShowScoreModal(true);
    });
  };

  // ── Toggle Fullscreen ──
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      presentationContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // ── Restart Presentation ──
  const handleRestart = () => {
    setShowScoreModal(false);
    setCurrentSlideIndex(0);
    setSessionPhase('presentation');
  };

  // Questions for Q&A round
  const qaQuestions = getProjectQuestions(currentProject);

  return (
    <div
      ref={presentationContainerRef}
      className="relative w-full h-screen bg-[#0b1329] text-white flex flex-col justify-between overflow-hidden select-none p-3 sm:p-5"
    >
      {/* ══════════════════════════════════════════════════════════════
          1. TOP HEADER (Title, Project Name, Submit PPT, Action Button)
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
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-[10px] font-bold text-cyan-300">
                {sessionPhase === 'presentation' ? '● Slide Presentation' : '● Technical Q&A Round'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-sm sm:max-w-md">
              Project: <span className="text-cyan-300 font-bold">{currentProject?.title || 'Engineering Project'}</span>
            </p>
          </div>
        </div>

        {/* Right: Submit/Change PPT & Primary Action Button */}
        <div className="flex items-center gap-2.5">
          {/* Submit / Change Project PPT Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-[#2563eb] hover:border-blue-400 bg-[#0d1b38]/70 hover:bg-[#122247] text-[#38bdf8] text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            title="Upload PowerPoint / PDF or enter your project details"
          >
            <Upload className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">Submit / Change PPT</span>
            <span className="sm:hidden">Change PPT</span>
          </button>

          {/* Action Button: Finish Presentation & Start Q&A */}
          {sessionPhase === 'presentation' ? (
            <button
              onClick={handleStartQARound}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              title="Finish presenting your slides and begin AI Technical Q&A"
            >
              <HelpCircle className="w-4 h-4 text-emerald-200" />
              <span>Finish &amp; Start Q&amp;A ➔</span>
            </button>
          ) : (
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
          2. MAIN CONTENT AREA (Presentation Stage OR Q&A Stage)
      ══════════════════════════════════════════════════════════════ */}
      {sessionPhase === 'qa_round' ? (
        <main className="flex-1 w-full py-3 overflow-hidden flex items-center justify-center">
          <PresentationQAPanel
            projectData={currentProject}
            questions={qaQuestions}
            userName={userName}
            onQACompleted={handleQACompleted}
          />
        </main>
      ) : (
        <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 py-3 overflow-hidden items-stretch">
          {/* ── LEFT AREA (8 cols): Digital Screen Board ── */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl bg-[#0f1b35]/80 border border-blue-900/30 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
            {/* Top Bar inside Digital Board */}
            <div className="flex items-center justify-between pb-2.5">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span className="text-white">Digital Screen Board</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{currentSlide.category}</span>
              </div>

              {/* Slide Indicator Badge */}
              <div className="px-3 py-1 rounded-full bg-[#0a1226]/90 border border-blue-800/40 text-blue-300 font-mono text-xs font-bold shadow-inner">
                Slide {currentSlideIndex + 1} / {slides.length}
              </div>
            </div>

            {/* ── 16:9 HD White Presentation Screen Canvas ── */}
            <div className="flex-1 w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between p-5 sm:p-8 text-slate-900 relative transition-all duration-300">
              {/* Slide Header */}
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {currentSlide.category || 'Executive Analysis'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">
                    16:9 Fixed Board
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] mt-1.5 leading-tight">
                  {currentSlide.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Bullet Points */}
              <div className="space-y-2.5 flex-1 py-3 text-left">
                {currentSlide.bullets?.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="font-medium leading-relaxed">{bullet}</p>
                  </div>
                ))}
              </div>

              {/* Metrics Cards Footer */}
              {currentSlide.metrics && (
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                  {Object.entries(currentSlide.metrics).map(([key, val], idx) => (
                    <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-blue-700 truncate block">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Slide Thumbnails Strip (Click to Jump) ── */}
            <div className="flex items-center gap-1.5 pt-2.5 overflow-x-auto pb-1">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 truncate max-w-[120px] ${
                    currentSlideIndex === idx
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[#121c36] hover:bg-[#1a284c] text-slate-400 hover:text-slate-200'
                  }`}
                  title={s.title}
                >
                  {idx + 1}. {s.title.slice(0, 10)}..
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
          3. SUBMIT / UPLOAD PROJECT MODAL
      ══════════════════════════════════════════════════════════════ */}
      <SubmitProjectModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onProjectLoaded={handleProjectLoaded}
      />

      {/* ══════════════════════════════════════════════════════════════
          4. POST-PRESENTATION SCORECARD & MISTAKE REPORT MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showScoreModal && (
        <PresentationScoreModal
          scorecard={scorecardData}
          qaResults={qaResults}
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
