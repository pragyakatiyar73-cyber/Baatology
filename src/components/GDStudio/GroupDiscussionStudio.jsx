import React, { useState, useEffect } from 'react';
import {
  Users,
  ArrowLeft,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Award,
  BookOpen,
  ChevronRight,
  Flame,
  Radio,
  Globe,
  Check,
  UserPlus,
  Clock,
  Bot,
} from 'lucide-react';

import GDTopicModal from './GDTopicModal';
import GDTopicPrepModal from './GDTopicPrepModal';
import AddStudentModal from './AddStudentModal';
import GDReviewAndPracticeModal from './GDReviewAndPracticeModal';
import { useGroupDiscussionSession } from '../../hooks/useGroupDiscussionSession';
import { fireGDFinishCelebration } from '../../utils/celebration';

export default function GroupDiscussionStudio({
  userName = 'Pragya',
  userEmail = 'pragya@baatology.ai',
  onBackToDashboard,
}) {
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [typedArgument, setTypedArgument] = useState('');
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const {
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
    setCustomStudentTopic,
    setRandomAvatarChoiceTopic,
    submitManualArgument,
    promptNextAvatarToSpeak,
    getFullAnalysisReport,
    toggleAvatarVoiceMute,
    selectTopic,
    replaceSeatWithFriend,
    resetSeatsToDefaultAI,
  } = useGroupDiscussionSession({ userName });

  const min = Math.floor(timerSeconds / 60);
  const sec = timerSeconds % 60;
  const timeFormatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  // Automatic celebration and report when 15-minute timer finishes
  useEffect(() => {
    if (timerSeconds === 0 && !hasCelebrated) {
      setHasCelebrated(true);
      fireGDFinishCelebration(userName, () => {
        setShowReviewModal(true);
      });
    }
  }, [timerSeconds, hasCelebrated, userName]);

  const handleSendText = (e) => {
    e?.preventDefault?.();
    if (!typedArgument.trim()) return;
    submitManualArgument(typedArgument.trim());
    setTypedArgument('');
  };

  const handleTopicSelected = (newTopic) => {
    selectTopic(newTopic);
    setShowPrepModal(true);
  };

  const handleAvatarTopicClick = () => {
    setRandomAvatarChoiceTopic();
    setShowPrepModal(true);
  };

  const handleEndDiscussionManual = () => {
    // Fire fireworks, congratulation speech, and open report automatically
    fireGDFinishCelebration(userName, () => {
      setShowReviewModal(true);
    });
  };

  const analysisData = getFullAnalysisReport();

  // Positions for 5 Students in a natural circular roundtable arrangement
  // Symmetrically placed: Top Center, Top Right, Bottom Right, Bottom Left, Top Left
  const getSeatPositionClasses = (index) => {
    switch (index) {
      case 0: // Student 1 (Host - Pragya) -> Top Center
        return 'top-2 sm:top-3 left-1/2 -translate-x-1/2';
      case 1: // Student 2 (Rohan - IIT Delhi) -> Top Right
        return 'top-20 sm:top-24 right-2 sm:right-6';
      case 2: // Student 3 (Ananya - BITS Pilani) -> Bottom Right
        return 'bottom-4 sm:bottom-6 right-8 sm:right-14';
      case 3: // Student 4 (Vikram - NIT Trichy) -> Bottom Left
        return 'bottom-4 sm:bottom-6 left-8 sm:left-14';
      case 4: // Student 5 (Sneha - DTU Delhi) -> Top Left
        return 'top-20 sm:top-24 left-2 sm:left-6';
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#090c14] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* ══════════════════════════════════════════════════════════════
          1. TOP NAVIGATION & TOPIC BAR
      ══════════════════════════════════════════════════════════════ */}
      <header className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-white/10 bg-[#0e1320]/95 backdrop-blur-xl shrink-0 z-30 shadow-md">
        {/* Left: Dashboard Button & Header Title */}
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Users className="w-4 h-4" />
          </div>

          <div>
            <h1 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-2">
              <span>Roundtable GD (5 Students • 15 Min)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            </h1>
            <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
              Proper Circular Table • 1 Host Student + 4 Peers
            </span>
          </div>
        </div>

        {/* Center: Topic Selection & 5-Min Prep Button */}
        <div className="flex items-center gap-2 max-w-xl truncate px-2">
          {/* 5-Min Reading Prep Sheet Button */}
          <button
            onClick={() => setShowPrepModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Open 5-Minute Topic Reading & Points Prep Guide"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>📖 5-Min Prep</span>
          </button>

          {/* Student Topic De Button */}
          <button
            onClick={() => setShowTopicModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Student Topic De: Type your own custom GD topic"
          >
            <span>✍️ Student Topic</span>
          </button>

          {/* Avatar Topic De Button */}
          <button
            onClick={handleAvatarTopicClick}
            className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Avatar Topic De: Let AI avatars suggest a trending topic and 5-min prep points"
          >
            <span>🎲 Avatar Topic</span>
          </button>
        </div>

        {/* Right: Add Friend, Language Toggle, Sound, 15-Min Timer & Finish Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Add Friend Button */}
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Invite real friend via link or replace seat"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">+ Friend / AI</span>
          </button>

          {/* Language Toggle Pill */}
          <button
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Speech Recognition Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hi-IN' ? '🇮🇳 Hinglish' : '🇬🇧 English'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleAvatarVoiceMute}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isAvatarVoiceMuted
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-slate-900 border-white/10 text-cyan-300 hover:text-white'
            }`}
            title={isAvatarVoiceMuted ? 'Unmute Avatar Voices' : 'Mute Avatar Voices'}
          >
            {isAvatarVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* 15-Min Timer Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono font-black text-cyan-300 flex items-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{timeFormatted}</span>
          </div>

          {/* End Discussion & View Report Button */}
          <button
            onClick={handleEndDiscussionManual}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black transition-all shadow-md shadow-red-500/25 cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Finish 15-Min GD, celebrate with fireworks, and view automatic feedback"
          >
            <Award className="w-3.5 h-3.5" />
            <span>End &amp; Get Report</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. MAIN STAGE: PROPER 5-STUDENT CIRCULAR ROUNDTABLE (LEFT) + LIVE FEED (RIGHT)
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full p-2.5 sm:p-4 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* ──────────────────────────────────────────────────────────
            LEFT: PROPER CIRCULAR ROUNDTABLE ARENA (7 Cols)
            (5 Symmetrically Placed Seats around illuminated Table HUD)
        ────────────────────────────────────────────────────────── */}
        <section className="lg:col-span-7 h-full flex flex-col justify-between rounded-3xl bg-[#0e1320]/95 border border-white/10 p-3 sm:p-4 relative shadow-2xl overflow-hidden select-none">
          {/* Header of Circular Arena */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0 z-10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Circular Roundtable (5 Seats)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              15-Min Round • Simple English Debate
            </span>
          </div>

          {/* ── 360° CIRCULAR ROUNDTABLE STAGE ── */}
          <div className="relative flex-1 w-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center my-1 overflow-hidden">
            {/* Center Illuminated Circular Conference Table */}
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-cyan-500/30 bg-gradient-to-tr from-[#111728]/90 via-[#18233c]/80 to-[#121a2c]/90 flex flex-col items-center justify-center p-4 shadow-[0_0_80px_rgba(34,211,238,0.15)] z-0">
              {/* Concentric Neon Circular Track SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  className="opacity-40 animate-spin-slow"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                  className="opacity-30"
                />
              </svg>

              {/* Center Table Info */}
              <div className="text-center z-10 space-y-1 max-w-[150px] sm:max-w-[180px]">
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  <Clock className="w-3 h-3 animate-spin-slow" />
                  <span>15-Min GD Round</span>
                </div>

                <p className="text-[11px] sm:text-xs font-bold text-slate-200 line-clamp-2 leading-tight">
                  &ldquo;{topic?.title}&rdquo;
                </p>

                <span className="text-[10px] font-mono text-emerald-400 block font-extrabold tracking-wide">
                  {timeFormatted} Remaining
                </span>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                5 SYMMETRICALLY ARRANGED CIRCULAR SEATS AROUND TABLE
            ══════════════════════════════════════════════════════════ */}
            {participants.slice(0, 5).map((p, index) => {
              const isThisSpeaker = p.isSpeaking;
              const isStudent = p.isLocalUser;
              const isFriend = p.isRealFriend;
              const seatPos = getSeatPositionClasses(index);

              // Border glow styles based on active speaking
              let borderStyle = 'border-white/15 bg-[#12192a]/95';
              let glowEffect = '';

              if (isThisSpeaker) {
                borderStyle = 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_30px_rgba(52,211,153,0.35)]';
                glowEffect = 'ring-2 ring-emerald-400 scale-105';
              }

              return (
                <div
                  key={p.id}
                  className={`absolute ${seatPos} w-36 sm:w-44 p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center shadow-lg z-10 backdrop-blur-md ${borderStyle} ${glowEffect}`}
                >
                  {/* Top Badges: Seat Number & Role */}
                  <div className="w-full flex items-center justify-between text-[9px] pb-1">
                    <span className="px-1.5 py-0.5 rounded-full font-mono font-extrabold bg-slate-900 border border-white/10 text-cyan-300">
                      {p.seat || `Seat ${index + 1}`}
                    </span>

                    {isStudent ? (
                      <span className="px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Candidate
                      </span>
                    ) : isFriend ? (
                      <span className="px-1.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Friend
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {p.role}
                      </span>
                    )}
                  </div>

                  {/* Circular Avatar Photo */}
                  <div className="relative my-1">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-md ${
                        isThisSpeaker ? 'border-emerald-400 scale-110' : 'border-white/20'
                      }`}
                    >
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Microphone / Speaker Indicator */}
                    <div
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full border shadow-sm ${
                        isThisSpeaker
                          ? 'bg-emerald-500 border-white text-white animate-bounce'
                          : 'bg-slate-900 border-white/20 text-slate-400'
                      }`}
                    >
                      {isStudent ? (
                        isMicActive ? <Mic className="w-2.5 h-2.5 text-emerald-300" /> : <MicOff className="w-2.5 h-2.5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-2.5 h-2.5" />
                      )}
                    </div>
                  </div>

                  {/* Participant Name & College Info */}
                  <div className="space-y-0.5 w-full">
                    <h3 className="text-[11px] sm:text-xs font-black text-white truncate max-w-[120px] sm:max-w-[150px] mx-auto">
                      {p.name}
                    </h3>
                    <span className="text-[9px] text-slate-400 font-semibold block truncate">
                      {p.college || p.perspective}
                    </span>
                    {isThisSpeaker && (
                      <span className="text-[9px] text-emerald-400 font-bold animate-pulse block">
                        ● Speaking Now
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner in Arena: Turn Flow & Quick Controls */}
          <div className="p-2.5 rounded-2xl bg-[#141b2d] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 z-10">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Discussion Mode: 15-Minute Roundtable
              </span>
              <p className="text-[11px] text-slate-300 font-medium">
                {activeSpeakerId === 'student-1'
                  ? 'Your turn to speak! Click mic or type your point.'
                  : 'Peer student is presenting an argument in simple English.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Connect a real friend or reset to AI"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Friend / AI</span>
              </button>

              <button
                onClick={promptNextAvatarToSpeak}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Invite next peer student to speak"
              >
                <span>👉 Ask Next Student</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            RIGHT: LIVE DISCUSSION FEED & STUDENT CONTROLS (5 Cols)
        ────────────────────────────────────────────────────────── */}
        <section className="lg:col-span-5 h-full flex flex-col justify-between rounded-3xl bg-[#0e1320]/95 border border-white/10 p-3 sm:p-4 relative shadow-xl overflow-hidden space-y-2.5">
          {/* Header of Feed */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Live Discussion Feed ({transcripts.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/30 cursor-pointer"
                title="Click to toggle between Hinglish and English voice capture"
              >
                {language === 'hi-IN' ? '🇮🇳 Hinglish' : '🇬🇧 English'}
              </button>
              <span className="text-[11px] text-slate-400">
                {studentContributions.length} points by you
              </span>
            </div>
          </div>

          {/* Scrollable Conversation Stream */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
            {transcripts.map((item) => {
              const isMe = item.speakerId === 'student-1';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${
                    isMe
                      ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-100 ml-3'
                      : item.speakerId === 'rohan'
                      ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100 mr-3'
                      : item.speakerId === 'ananya'
                      ? 'bg-purple-950/20 border-purple-500/30 text-purple-100 mr-3'
                      : item.speakerId === 'sneha'
                      ? 'bg-teal-950/20 border-teal-500/30 text-teal-100 mr-3'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-100 mr-3'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-extrabold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{item.speakerName}</span>
                      {item.seat && <span className="text-slate-400 font-semibold font-mono">[{item.seat}]</span>}
                    </span>
                    <span className="text-slate-400 font-mono">{item.timestamp}</span>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Permission Denied Alert Bar */}
          {permissionDenied && (
            <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center justify-between gap-2 shrink-0 animate-bounce">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Browser mic blocked! Please grant microphone access.</span>
              </div>
              <button
                onClick={retryListening}
                className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
              >
                Allow Mic
              </button>
            </div>
          )}

          {/* Live Student Speech Preview Bar */}
          {liveCandidateTranscript && (
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-400/60 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-pulse shrink-0 shadow-md shadow-emerald-500/20">
              <div className="flex items-center gap-2 truncate">
                <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate italic font-medium">
                  Hearing: &ldquo;{liveCandidateTranscript}&rdquo;
                </span>
              </div>
              <button
                onClick={commitSpeech}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
                title="Send current speech immediately"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              STUDENT INPUT DOCK (MIC + TEXT INPUT)
          ────────────────────────────────────────────────────────── */}
          <div className="space-y-2 pt-2 border-t border-white/10 shrink-0">
            {/* Text Input Row */}
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <input
                type="text"
                value={typedArgument}
                onChange={(e) => setTypedArgument(e.target.value)}
                placeholder="Type your point or speak into microphone..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!typedArgument.trim()}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  typedArgument.trim()
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border-white/5 text-slate-600 cursor-not-allowed'
                }`}
                title="Send Point"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Mic Toggle & Instant Actions Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Large Microphone Button */}
              <button
                onClick={toggleMic}
                className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-md ${
                  isMicActive
                    ? audioLevel > 14
                      ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse shadow-emerald-500/30'
                      : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
                title={isMicActive ? 'Mute Microphone' : 'Start Speaking into Microphone'}
              >
                {isMicActive ? (
                  <>
                    <Mic className="w-4 h-4 text-emerald-300" />
                    <span>{audioLevel > 14 ? 'Speaking Now...' : 'Mic Active (Speak Your Point)'}</span>
                    {audioLevel > 5 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
                    )}
                  </>
                ) : (
                  <>
                    <MicOff className="w-4 h-4 text-rose-400" />
                    <span>Mic Muted (Click to Speak)</span>
                  </>
                )}
              </button>

              {/* End Discussion Report Quick Button */}
              <button
                onClick={handleEndDiscussionManual}
                className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="View Mistakes & Sentence Practice"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Feedback Report</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          3. TOPIC SELECTION MODAL (Student Topic De OR Avatar Topic De)
      ══════════════════════════════════════════════════════════════ */}
      <GDTopicModal
        isOpen={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        onSelectTopic={handleTopicSelected}
        currentTopic={topic}
      />

      {/* ══════════════════════════════════════════════════════════════
          4. 5-MINUTE TOPIC PREPARATION & READING TIME MODAL
             ("student ko 5min padne ke liye de jaye jisse usse topic ke
              knowledge ho jaye and important points bhi")
      ══════════════════════════════════════════════════════════════ */}
      <GDTopicPrepModal
        isOpen={showPrepModal}
        onClose={() => setShowPrepModal(false)}
        topic={topic}
        onStartDiscussion={() => {
          setShowPrepModal(false);
          promptNextAvatarToSpeak();
        }}
      />

      {/* ══════════════════════════════════════════════════════════════
          5. ADD FRIEND OR USE AI AVATARS MODAL
             ("student appne friend ko add kare and agar koi na ho toh avatar")
      ══════════════════════════════════════════════════════════════ */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onAddStudent={replaceSeatWithFriend}
        onResetSeatsToAI={resetSeatsToDefaultAI}
      />

      {/* ══════════════════════════════════════════════════════════════
          6. COMPREHENSIVE FEEDBACK & SENTENCE CORRECTION STUDIO
             ("baad me jo bhi student ke mistake hti volcabary, grammar,
              fluency, point mistakes detect and dubara bo sentences bolwaye")
      ══════════════════════════════════════════════════════════════ */}
      <GDReviewAndPracticeModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        analysisData={analysisData}
        topic={topic}
        userName={userName}
        onRestartGD={() => {
          setShowReviewModal(false);
          handleAvatarTopicClick();
        }}
        onBackToDashboard={onBackToDashboard}
      />
    </div>
  );
}
