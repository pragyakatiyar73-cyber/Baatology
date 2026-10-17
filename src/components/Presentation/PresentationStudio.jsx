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
} from 'lucide-react';

import { INITIAL_EXECUTIVE_SLIDES, processPresentationFile } from '../../utils/presentationSlideDeck';
import { usePresentationVoiceController } from '../../hooks/usePresentationVoiceController';
import PresentationScoreModal from './PresentationScoreModal';

export default function PresentationStudio({
  userName = 'Pragya',
  onBackToDashboard,
}) {
  const [slides, setSlides] = useState(INITIAL_EXECUTIVE_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLiveSession, setIsLiveSession] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scorecardData, setScorecardData] = useState(null);

  const fileInputRef = useRef(null);
  const presentationContainerRef = useRef(null);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // ── Navigation Handlers ──
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

  // ── Voice Controller Hook ──
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
    autoStart: isLiveSession,
  });

  // ── File Upload Handler (.pptx / .pdf) ──
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const result = await processPresentationFile(file);
    if (result.success && result.slides) {
      setSlides(result.slides);
      setCurrentSlideIndex(0);
    }
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

  // ── End Live Session & Generate Scorecard ──
  const handleEndLiveSession = async () => {
    const scorecard = await generateScorecard();
    setScorecardData(scorecard);
    setShowScoreModal(true);
  };

  return (
    <div
      ref={presentationContainerRef}
      className="relative w-full h-screen bg-[#0b1329] text-white flex flex-col justify-between overflow-hidden select-none p-4 sm:p-6"
    >
      {/* ══════════════════════════════════════════════════════════════
          1. TOP HEADER (Title, Subtitle, Upload PPT/PDF, Live Session)
      ══════════════════════════════════════════════════════════════ */}
      <header className="w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-blue-900/30">
        {/* Left: App Icon & Title */}
        <div className="flex items-center gap-3.5">
          {/* Back to Dashboard Navigation Button */}
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer mr-1"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Blue Rounded Screen Icon */}
          <div className="w-11 h-11 rounded-2xl bg-[#0066ff] shadow-lg shadow-blue-500/25 flex items-center justify-center text-white shrink-0">
            <Tv className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight">
              AI Smart Presentation Studio
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Fixed Studio Canvas with Real-time PPT Display
            </p>
          </div>
        </div>

        {/* Right: Upload PPT/PDF & Live Session Buttons */}
        <div className="flex items-center gap-3">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.ppt,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload PPT/PDF Button (Dashed Border) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[#2563eb] hover:border-blue-400 bg-[#0d1b38]/70 hover:bg-[#122247] text-[#38bdf8] text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            title="Upload Microsoft PowerPoint (.pptx) or PDF (.pdf) slide deck"
          >
            <Upload className="w-4 h-4 text-[#38bdf8]" />
            <span>{uploadedFileName ? uploadedFileName.slice(0, 16) + '...' : 'Upload PPT / PDF'}</span>
          </button>

          {/* Live Session Button */}
          <button
            onClick={isLiveSession ? handleEndLiveSession : () => setIsLiveSession(true)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-extrabold text-xs tracking-wide uppercase transition-all shadow-lg cursor-pointer active:scale-95 ${
              isLiveSession
                ? 'bg-[#0070f3] hover:bg-[#0060df] text-white shadow-blue-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title={isLiveSession ? 'End Session & View Delivery Scorecard' : 'Start Live Presentation'}
          >
            <Radio className={`w-4 h-4 ${isLiveSession ? 'animate-pulse text-cyan-200' : ''}`} />
            <span>{isLiveSession ? 'Live Session' : 'Start Presentation'}</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. MAIN STUDIO LAYOUT: Left (Digital Board), Right (2 Cards)
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 py-4 overflow-hidden items-stretch">
        {/* ── LEFT AREA (8 cols): Digital Screen Board ── */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl bg-[#0f1b35]/80 border border-blue-900/30 p-5 sm:p-6 shadow-2xl relative">
          {/* Top Bar inside Digital Board */}
          <div className="flex items-center justify-between pb-3.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs sm:text-sm font-bold">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span className="text-white">Digital Screen Board</span>
            </div>

            {/* Slide Indicator Badge */}
            <div className="px-3 py-1 rounded-full bg-[#0a1226]/90 border border-blue-800/40 text-blue-300 font-mono text-xs font-bold shadow-inner">
              Slide {currentSlideIndex + 1} / {slides.length}
            </div>
          </div>

          {/* ── 16:9 HD White Presentation Screen Canvas ── */}
          <div className="flex-1 w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 sm:p-10 text-slate-900 relative transition-all duration-300">
            {/* Slide 1: Exact Match to User Screenshot */}
            {currentSlideIndex === 0 ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-xl animate-fade-in">
                {/* Red PPT Bookmark Icon */}
                <div className="w-14 h-16 rounded-xl bg-[#e11d48] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-rose-500/25">
                  <span>P</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a]">
                    {currentSlide.title || 'AI Executive Presentation'}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed max-w-md">
                    {currentSlide.subtitle ||
                      'Aapki uploaded PPT / PDF slides is fixed board par clear HD quality me display hongi.'}
                  </p>
                </div>

                {/* Sub-bullets preview */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    🎙️ Voice Navigation Ready
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    ⚡ Real-time Delivery Flaw Detection
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    📊 16:9 Fixed Studio Canvas
                  </span>
                </div>
              </div>
            ) : (
              /* Subsequent Slides (Detailed Presentation Content) */
              <div className="w-full h-full flex flex-col justify-between text-left animate-fade-in space-y-4">
                {/* Header */}
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {currentSlide.category || 'Executive Analysis'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] mt-1.5">
                    {currentSlide.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {currentSlide.subtitle}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2.5 flex-1 py-1">
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
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                    {Object.entries(currentSlide.metrics).map(([key, val], idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-blue-700">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Bottom Navigation Bar inside Left Card ── */}
          <div className="flex items-center justify-between pt-4">
            {/* Prev and Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
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
            <div className="flex items-center gap-3 text-slate-400">
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
        <div className="lg:col-span-4 flex flex-col gap-5 h-full">
          {/* ══════════════════════════════════════════════════════════
              CARD 1: Voice Assistant Status
          ══════════════════════════════════════════════════════════ */}
          <div className="rounded-3xl bg-[#0f1b35]/80 border border-blue-900/30 p-6 flex flex-col items-center justify-center text-center shadow-xl relative min-h-[190px]">
            {/* Glowing Blue Circular Mic Icon */}
            <div
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all cursor-pointer shadow-lg ${
                isListening
                  ? 'bg-blue-600/25 border-2 border-blue-400 text-blue-400 shadow-blue-500/20 animate-pulse'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-400'
              }`}
              title={isListening ? 'Click to Mute Voice Controller' : 'Click to Activate Voice Controller'}
            >
              {isListening ? <Mic className="w-6 h-6 text-blue-400" /> : <MicOff className="w-6 h-6 text-slate-400" />}
            </div>

            {/* Heading */}
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              {isListening ? 'Listening (Voice Active)' : 'Microphone Inactive'}
            </h3>

            {/* Subtext Voice Hint */}
            <p className="text-xs text-slate-400 mt-1 font-medium">
              "Next slide please" bol kar slide change karein.
            </p>

            {/* Audio Waveform Indicator */}
            {isListening && (
              <div className="flex items-center gap-1 mt-3">
                {[20, 45, 80, 50, 95, 60, 30, 70, 40].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-blue-400 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(6, Math.min(24, (h * audioLevel) / 100))}px`,
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
              CARD 2: AI Thought & Real-time Feedback
          ══════════════════════════════════════════════════════════ */}
          <div className="flex-1 rounded-3xl bg-[#0f1b35]/80 border border-blue-900/30 p-5 sm:p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              {/* Card Header: Purple AI Icon + Title */}
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                  <Brain className="w-4 h-4 text-purple-400" />
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-white">
                  AI Thought &amp; Feedback
                </h3>
              </div>

              {/* Inner Feedback Box matching Screenshot */}
              <div className="rounded-2xl bg-[#0c1428] border border-blue-950 p-4 space-y-2 text-left shadow-inner">
                <h4 className="text-xs sm:text-sm font-bold text-cyan-300 leading-snug">
                  {deliveryAnalytics.feedbackTitle}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
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
                    Hesitations
                  </span>
                  <span>{deliveryAnalytics.fillersCount} Fillers</span>
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
              <div className="mt-3 p-2.5 rounded-xl bg-black/60 border border-white/10 text-[11px] text-slate-300 font-mono leading-relaxed max-h-16 overflow-y-auto">
                <span className="text-cyan-400 font-bold block mb-0.5">● Speaking Transcript:</span>
                "{liveTranscript}"
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          3. POST-PRESENTATION SCORECARD MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showScoreModal && (
        <PresentationScoreModal
          scorecard={scorecardData}
          onClose={() => setShowScoreModal(false)}
          onRestart={() => {
            setShowScoreModal(false);
            setCurrentSlideIndex(0);
          }}
          userName={userName}
        />
      )}
    </div>
  );
}
