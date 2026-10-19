import React, { useState } from 'react';
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
} from 'lucide-react';

import GDTopicModal from './GDTopicModal';
import GDReviewAndPracticeModal from './GDReviewAndPracticeModal';
import { useGroupDiscussionSession } from '../../hooks/useGroupDiscussionSession';

export default function GroupDiscussionStudio({
  userName = 'Pragya',
  userEmail = 'pragya@auragd.ai',
  onBackToDashboard,
}) {
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [typedArgument, setTypedArgument] = useState('');

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
  } = useGroupDiscussionSession({ userName });

  const min = Math.floor(timerSeconds / 60);
  const sec = timerSeconds % 60;
  const timeFormatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  const handleSendText = (e) => {
    e?.preventDefault?.();
    if (!typedArgument.trim()) return;
    submitManualArgument(typedArgument.trim());
    setTypedArgument('');
  };

  const handleOpenReviewModal = () => {
    setShowReviewModal(true);
  };

  const analysisData = getFullAnalysisReport();

  return (
    <div className="relative w-full h-screen bg-[#0a0d14] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* ══════════════════════════════════════════════════════════════
          1. TOP NAVIGATION & TOPIC BAR
      ══════════════════════════════════════════════════════════════ */}
      <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between border-b border-white/10 bg-[#0e1320]/95 backdrop-blur-xl shrink-0 z-30 shadow-md">
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
              <span>GD Studio (4 Students Roundtable)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            </h1>
            <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
              Student 1 (You), Student 2 (Rohan), Student 3 (Ananya), Student 4 (Vikram)
            </span>
          </div>
        </div>

        {/* Center: Active Topic Pill & Topic Selection Controls */}
        <div className="flex items-center gap-2 max-w-xl truncate px-2">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#141b2d] border border-blue-500/20 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200 truncate max-w-xs">{topic?.title}</span>
          </div>

          {/* Button 1: Student Topic De (Apna Topic Do) */}
          <button
            onClick={() => setShowTopicModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Student Topic De: Type your own custom GD topic"
          >
            <span>✍️ Student Topic</span>
          </button>

          {/* Button 2: Avatar Topic De (AI Topic De) */}
          <button
            onClick={setRandomAvatarChoiceTopic}
            className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Avatar Topic De: Let AI avatars suggest a trending topic"
          >
            <span>🎲 Avatar Topic</span>
          </button>
        </div>

        {/* Right: Language Toggle, Sound, Timer, & "End GD & View Report" Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Pill (Hindi / Hinglish vs English) */}
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

          {/* Timer Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono font-bold text-slate-300 hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{timeFormatted}</span>
          </div>

          {/* End Discussion & View Report Button */}
          <button
            onClick={handleOpenReviewModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-extrabold transition-all shadow-md shadow-red-500/25 cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="End GD and analyze your grammar, vocabulary, and sentence mistakes"
          >
            <Award className="w-3.5 h-3.5" />
            <span>End &amp; Get Report</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. MAIN STAGE: 4 PARTICIPANTS ARENA (LEFT) + LIVE FEED (RIGHT)
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full p-3 sm:p-4 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* ──────────────────────────────────────────────────────────
            LEFT / MAIN: 4 PARTICIPANTS ARENA (7 Cols)
            (3 AI Avatars: Rohan, Ananya, Vikram + 1 Student)
        ────────────────────────────────────────────────────────── */}
        <section className="lg:col-span-7 h-full flex flex-col justify-between rounded-3xl bg-[#0f1422]/90 border border-white/10 p-4 sm:p-5 relative shadow-xl overflow-hidden">
          {/* Header of Left Arena */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Roundtable Discussion (4 Seats)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Click &lsquo;Ask Avatar&rsquo; or Speak into Mic
            </span>
          </div>

          {/* 2x2 Grid for the 4 Participants */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 my-auto py-2">
            {participants.map((p) => {
              const isThisSpeaker = p.isSpeaking;
              const isStudent = p.isLocalUser;

              // Border glow styles based on active speaking
              let borderStyle = 'border-white/10 bg-[#141b2b]';
              let glowEffect = '';

              if (isThisSpeaker) {
                if (p.id === 'rohan') {
                  borderStyle = 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(34,211,238,0.25)]';
                  glowEffect = 'ring-2 ring-cyan-400';
                } else if (p.id === 'ananya') {
                  borderStyle = 'border-purple-400 bg-purple-950/30 shadow-[0_0_25px_rgba(192,132,252,0.25)]';
                  glowEffect = 'ring-2 ring-purple-400';
                } else if (p.id === 'vikram') {
                  borderStyle = 'border-amber-400 bg-amber-950/30 shadow-[0_0_25px_rgba(251,191,36,0.25)]';
                  glowEffect = 'ring-2 ring-amber-400';
                } else {
                  borderStyle = 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_25px_rgba(52,211,153,0.25)]';
                  glowEffect = 'ring-2 ring-emerald-400';
                }
              }

              return (
                <div
                  key={p.id}
                  className={`relative p-3.5 sm:p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-between text-center select-none ${borderStyle} ${glowEffect}`}
                >
                  {/* Top Badges: Seat Number & Role */}
                  <div className="w-full flex items-center justify-between text-[10px] pb-2">
                    <span className="px-2 py-0.5 rounded-full font-extrabold bg-slate-900 border border-white/15 text-cyan-300 font-mono">
                      {p.seat || 'Seat'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold border ${p.badgeColor}`}>
                      {p.role}
                    </span>
                  </div>

                  {/* Avatar Photo with Speaking Pulse Ring */}
                  <div className="relative my-2">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-md ${
                        isThisSpeaker ? 'border-white scale-105' : 'border-white/20'
                      }`}
                    >
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Microphone / Sound Wave Badge */}
                    <div
                      className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border shadow-sm ${
                        isThisSpeaker
                          ? 'bg-emerald-500 border-white text-white animate-bounce'
                          : 'bg-slate-900 border-white/20 text-slate-400'
                      }`}
                    >
                      {isStudent ? (
                        isMicActive ? <Mic className="w-3 h-3 text-emerald-300" /> : <MicOff className="w-3 h-3 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </div>
                  </div>

                  {/* Participant Name & College Info */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                        {p.name}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {p.college || p.perspective}
                    </span>
                    {isThisSpeaker && (
                      <span className="text-[10px] text-emerald-400 font-bold animate-pulse block">
                        ● Speaking Now
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner in Arena: Topic & Quick Avatar Turn Trigger */}
          <div className="p-3 rounded-2xl bg-[#141b2d] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Discussion Stance &amp; Turn Flow
              </span>
              <p className="text-xs text-slate-300 font-medium">
                {activeSpeakerId === 'student-1'
                  ? 'Your turn to speak! Click mic or type your perspective.'
                  : 'AI Avatar is presenting an argument. Listen with audio.'}
              </p>
            </div>

            <button
              onClick={promptNextAvatarToSpeak}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Invite another avatar to respond or argue"
            >
              <span>👉 Ask Avatar to Speak</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            RIGHT: LIVE DISCUSSION FEED & STUDENT CONTROLS (5 Cols)
        ────────────────────────────────────────────────────────── */}
        <section className="lg:col-span-5 h-full flex flex-col justify-between rounded-3xl bg-[#0f1422]/90 border border-white/10 p-4 sm:p-5 relative shadow-xl overflow-hidden space-y-3">
          {/* Header of Feed */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
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
              >
                {language === 'hi-IN' ? '🇮🇳 Hinglish' : '🇬🇧 English'}
              </button>
              <span className="text-[11px] text-slate-400">
                {studentContributions.length} points by you
              </span>
            </div>
          </div>

          {/* Scrollable Conversation Stream */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {transcripts.map((item) => {
              const isMe = item.speakerId === 'student-1';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                    isMe
                      ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-100 ml-3'
                      : item.speakerId === 'rohan'
                      ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100 mr-3'
                      : item.speakerId === 'ananya'
                      ? 'bg-purple-950/20 border-purple-500/30 text-purple-100 mr-3'
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
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center justify-between gap-2 shrink-0 animate-bounce">
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
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!typedArgument.trim()}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-md ${
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
                onClick={handleOpenReviewModal}
                className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
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
        onSelectTopic={selectTopic}
        currentTopic={topic}
      />

      {/* ══════════════════════════════════════════════════════════════
          4. COMPREHENSIVE FEEDBACK & SENTENCE CORRECTION STUDIO
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
          setRandomAvatarChoiceTopic();
        }}
        onBackToDashboard={onBackToDashboard}
      />
    </div>
  );
}
