import React, { useState } from 'react';
import {
  Users,
  Bell,
  ArrowLeft,
  Settings,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';

import Roundtable2DView from './Roundtable2DView';
import GDDigitalScreenBoard from './GDDigitalScreenBoard';
import DiscussionToolsPanel from './DiscussionToolsPanel';
import GDTopicModal from './GDTopicModal';
import { useGroupDiscussionSession } from '../../hooks/useGroupDiscussionSession';

export default function GroupDiscussionStudio({
  userName = 'John Chey',
  userEmail = 'borfa@rgmail.com',
  onBackToDashboard,
}) {
  const [activeTab, setActiveTab] = useState('Discussions');
  const [showTopicModal, setShowTopicModal] = useState(true); // Open initially to match screenshot
  const [isPaused, setIsPaused] = useState(false);

  // Hook managing roundtable, active speakers, timer, and AI analysis
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
    liveCandidateTranscript,
    aiAnalysis,
    copyInviteCode,
    addBulletPoint,
    selectTopic,
    setSessionStatus,
  } = useGroupDiscussionSession({
    userName,
  });

  const handleToggleSession = () => {
    setSessionStatus((prev) => (prev === 'running' ? 'paused' : 'running'));
    setIsPaused((prev) => !prev);
  };

  const handleResetTimer = () => {
    // Reset timer to 10:00
  };

  const handleAddMinutes = () => {
    // Add +2 minutes
  };

  return (
    <div className="relative w-full h-screen bg-[#0b0e14] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* ══════════════════════════════════════════════════════════════
          1. TOP NAVIGATION HEADER BAR (Matching Exact Screenshot)
      ══════════════════════════════════════════════════════════════ */}
      <header className="w-full px-6 py-3.5 flex items-center justify-between border-b border-white/10 bg-[#0d111a]/80 backdrop-blur-xl shrink-0 z-30">
        {/* Left: App Logo & Return Button */}
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer mr-1"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Group Icon (Purple/Cyan gradient) */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Users className="w-4 h-4" />
          </div>

          <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
            Group Discussion Studio
          </h1>
        </div>

        {/* Center: Navigation Tabs (Dashboard, Discussions, Students, Settings, Help) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {['Dashboard', 'Discussions', 'Students', 'Settings', 'Help'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Dashboard' && onBackToDashboard) {
                    onBackToDashboard();
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`relative py-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-cyan-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_#38bdf8]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Notifications & User Profile (John Chey, borfa@rgmail.com) */}
        <div className="flex items-center gap-4">
          {/* Notification Bell with Red Dot */}
          <button
            className="relative p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0d111a]" />
          </button>

          {/* User Profile Pill (Matching Screenshot: John Chey, borfa@rgmail.com) */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-sm shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block">
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
      <main className="flex-1 w-full p-4 sm:p-5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Left Column (4 cols): Roundtable 2D View */}
        <div className="lg:col-span-4 h-full">
          <Roundtable2DView
            participants={participants}
            activeSpeakerId={activeSpeakerId}
            isMicActive={isMicActive}
            liveCandidateTranscript={liveCandidateTranscript}
            onToggleFullscreen={() => {}}
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
            sessionStatus={sessionStatus}
            onToggleSession={handleToggleSession}
          />
        </div>

        {/* Right Column (3 cols): Discussion Tools & AI Telemetry */}
        <div className="lg:col-span-3 h-full">
          <DiscussionToolsPanel
            participants={participants}
            aiAnalysis={aiAnalysis}
            timerSeconds={timerSeconds}
            onResetTimer={handleResetTimer}
            onAddMinutes={handleAddMinutes}
            isPaused={isPaused}
            onTogglePause={handleToggleSession}
          />
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          3. OVERLAID GD TOPIC SELECTION MODAL (Matching Screenshot)
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
    </div>
  );
}
