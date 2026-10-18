import React, { useState } from 'react';
import {
  Users,
  Bell,
  ArrowLeft,
  Sparkles,
  UserPlus,
  Mic,
  MicOff,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';

import Roundtable2DView from './Roundtable2DView';
import GDDigitalScreenBoard from './GDDigitalScreenBoard';
import DiscussionToolsPanel from './DiscussionToolsPanel';
import GDTopicModal from './GDTopicModal';
import AddStudentModal from './AddStudentModal';
import { useGroupDiscussionSession } from '../../hooks/useGroupDiscussionSession';

export default function GroupDiscussionStudio({
  userName = 'John Chey',
  userEmail = 'borfa@rgmail.com',
  onBackToDashboard,
}) {
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Hook managing roundtable, active speakers, timer, AudioContext mic analyser, STT, and AI analysis
  const {
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
    activePoll,
    notes,
    toggleMic,
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
  } = useGroupDiscussionSession({
    userName,
  });

  const handleToggleSession = () => {
    setSessionStatus((prev) => (prev === 'running' ? 'paused' : 'running'));
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="relative w-full h-screen bg-[#0b0e14] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* ══════════════════════════════════════════════════════════════
          1. TOP NAVIGATION HEADER (Navbar tabs removed as requested)
      ══════════════════════════════════════════════════════════════ */}
      <header className="w-full px-5 py-3 flex items-center justify-between border-b border-white/10 bg-[#0d111a]/90 backdrop-blur-xl shrink-0 z-30">
        {/* Left: App Logo & Return Button */}
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm text-xs font-bold"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          {/* Group Icon (Purple/Cyan gradient) */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Users className="w-4 h-4" />
          </div>

          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Group Discussion Studio
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] text-slate-400 font-medium">
                {participants.length} Students Connected • 2D Spatial Audio
              </span>
            </div>
          </div>
        </div>

        {/* Center: Active Topic Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200 max-w-md truncate">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate font-semibold">{topic?.title}</span>
        </div>

        {/* Right: Add Student, Invite Code, Mic Toggle & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Add Student Button */}
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Add a new student to the discussion"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Student</span>
          </button>

          {/* Student Invite Code Box */}
          <button
            onClick={copyInviteCode}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-mono text-cyan-300 transition-all cursor-pointer shadow-sm"
            title="Copy Student Invite Code"
          >
            <span>Code: {inviteCode}</span>
            {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Mic Toggle Button with Live Volume Level Wave */}
          <button
            onClick={toggleMic}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              isMicActive
                ? audioLevel > 14
                  ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300 shadow-md shadow-emerald-500/20'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
            title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicActive ? (
              <Mic className={`w-3.5 h-3.5 ${audioLevel > 14 ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className="hidden sm:inline">
              {isMicActive ? (audioLevel > 14 ? 'Speaking' : 'Mic Active') : 'Muted'}
            </span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-sm shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-bold text-white block leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {userEmail}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          2. MAIN 3-COLUMN STUDIO LAYOUT
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full p-3 sm:p-4 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Left Column (4 cols): Roundtable 2D View */}
        <div className="lg:col-span-4 h-full">
          <Roundtable2DView
            participants={participants}
            activeSpeakerId={activeSpeakerId}
            isMicActive={isMicActive}
            audioLevel={audioLevel}
            liveCandidateTranscript={liveCandidateTranscript}
            onToggleFullscreen={() => {}}
            onOpenAddStudent={() => setShowAddStudentModal(true)}
            onSelectSpeaker={(speakerId) => setActiveSpeakerId(speakerId)}
          />
        </div>

        {/* Center Column (5 cols): Digital Screen Board */}
        <div className="lg:col-span-5 h-full">
          <GDDigitalScreenBoard
            topic={topic}
            timerSeconds={timerSeconds}
            transcripts={transcripts}
            onOpenTopicModal={() => setShowTopicModal(true)}
            onAddBulletPoint={addBulletPoint}
            onRemoveBulletPoint={removeBulletPoint}
            sessionStatus={sessionStatus}
            onToggleSession={handleToggleSession}
            onSubmitManualArgument={submitManualArgument}
          />
        </div>

        {/* Right Column (3 cols): Discussion Tools & AI Telemetry */}
        <div className="lg:col-span-3 h-full">
          <DiscussionToolsPanel
            participants={participants}
            aiAnalysis={aiAnalysis}
            timerSeconds={timerSeconds}
            onResetTimer={resetTimer}
            onAddMinutes={addMinutes}
            isPaused={isPaused}
            onTogglePause={handleToggleSession}
            activePoll={activePoll}
            onVotePoll={votePoll}
            notes={notes}
            onUpdateNotes={updateNotes}
            onOpenAddStudent={() => setShowAddStudentModal(true)}
            onRemoveParticipant={removeParticipant}
          />
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          3. OVERLAID GD TOPIC SELECTION MODAL
      ══════════════════════════════════════════════════════════════ */}
      <GDTopicModal
        isOpen={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        onSelectTopic={selectTopic}
        currentTopic={topic}
        inviteCode={inviteCode}
        onCopyInviteCode={copyInviteCode}
        codeCopied={codeCopied}
      />

      {/* ══════════════════════════════════════════════════════════════
          4. OVERLAID ADD STUDENT MODAL
      ══════════════════════════════════════════════════════════════ */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onAddStudent={addParticipant}
        currentCount={participants.length}
      />
    </div>
  );
}
