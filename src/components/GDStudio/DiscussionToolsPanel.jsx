import React, { useState } from 'react';
import {
  Clock,
  BarChart2,
  FileText,
  Users,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  X,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

export default function DiscussionToolsPanel({
  participants = [],
  aiAnalysis = {},
  timerSeconds = 600,
  onResetTimer,
  onAddMinutes,
  isPaused = false,
  onTogglePause,
}) {
  const [activeTool, setActiveTool] = useState(null); // 'timer' | 'polls' | 'notes' | 'participants' | null
  const [notesContent, setNotesContent] = useState('');
  const [pollVotes, setPollVotes] = useState({ for: 3, against: 1, userVoted: null });

  const handleVote = (choice) => {
    if (pollVotes.userVoted) return;
    setPollVotes((prev) => ({
      ...prev,
      [choice]: prev[choice] + 1,
      userVoted: choice,
    }));
  };

  return (
    <div className="w-full h-full rounded-3xl bg-[#0f1422]/90 border border-white/10 p-5 flex flex-col justify-between shadow-2xl relative select-none overflow-hidden space-y-4">
      {/* ── Top Header: "Discussion Tools" (Matching Screenshot) ── */}
      <div className="border-b border-white/10 pb-3">
        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
          Discussion Tools
        </h3>
        <p className="text-[11px] text-slate-400">
          Session controls &amp; Collaborative widgets
        </p>
      </div>

      {/* ── 4 Quick Tools Grid (2x2) Matching Exact Screenshot ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tool 1: Timer */}
        <button
          onClick={() => setActiveTool(activeTool === 'timer' ? null : 'timer')}
          className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeTool === 'timer'
              ? 'bg-blue-600/30 border-blue-400 text-cyan-300 shadow-md shadow-blue-500/20'
              : 'bg-[#141b2d] hover:bg-[#1c263f] border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Open GD Timer Controls"
        >
          <Clock className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-bold">Timer</span>
        </button>

        {/* Tool 2: Polls */}
        <button
          onClick={() => setActiveTool(activeTool === 'polls' ? null : 'polls')}
          className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeTool === 'polls'
              ? 'bg-purple-600/30 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20'
              : 'bg-[#141b2d] hover:bg-[#1c263f] border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Open Live Roundtable Poll"
        >
          <BarChart2 className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-bold">Polls</span>
        </button>

        {/* Tool 3: Notes */}
        <button
          onClick={() => setActiveTool(activeTool === 'notes' ? null : 'notes')}
          className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeTool === 'notes'
              ? 'bg-teal-600/30 border-teal-400 text-teal-300 shadow-md shadow-teal-500/20'
              : 'bg-[#141b2d] hover:bg-[#1c263f] border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Open Rebuttal Scratchpad"
        >
          <FileText className="w-5 h-5 text-teal-400" />
          <span className="text-xs font-bold">Notes</span>
        </button>

        {/* Tool 4: Participants List */}
        <button
          onClick={() => setActiveTool(activeTool === 'participants' ? null : 'participants')}
          className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeTool === 'participants'
              ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/20'
              : 'bg-[#141b2d] hover:bg-[#1c263f] border-white/10 text-slate-300 hover:text-white'
          }`}
          title="View Participants Roster"
        >
          <Users className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-center leading-tight">
            Participants<br />List
          </span>
        </button>
      </div>

      {/* ── Conditional Tool Drawer ── */}
      {activeTool && (
        <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-blue-500/30 text-xs text-white space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-extrabold uppercase text-cyan-400 text-[11px]">
              {activeTool === 'timer' && 'Session Timer Controls'}
              {activeTool === 'polls' && 'Roundtable Motion Poll'}
              {activeTool === 'notes' && 'Candidate Scratchpad'}
              {activeTool === 'participants' && 'Connected Students (4)'}
            </span>
            <button
              onClick={() => setActiveTool(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timer Controls */}
          {activeTool === 'timer' && (
            <div className="flex items-center justify-around gap-2 pt-1">
              <button
                onClick={onTogglePause}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-[11px]"
              >
                {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={onAddMinutes}
                className="px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 border border-blue-500/30 font-bold text-[11px]"
              >
                +2 Mins
              </button>
              <button
                onClick={onResetTimer}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-[11px]"
              >
                <RotateCcw className="w-3 h-3 text-slate-300" />
                <span>Reset</span>
              </button>
            </div>
          )}

          {/* Polls */}
          {activeTool === 'polls' && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] text-slate-300">
                Should AI decision-making require mandatory human oversight?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('for')}
                  className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-1 font-bold text-[11px] transition-all ${
                    pollVotes.userVoted === 'for'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Yes ({pollVotes.for})</span>
                </button>
                <button
                  onClick={() => handleVote('against')}
                  className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-1 font-bold text-[11px] transition-all ${
                    pollVotes.userVoted === 'against'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-900/50'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>No ({pollVotes.against})</span>
                </button>
              </div>
            </div>
          )}

          {/* Scratchpad Notes */}
          {activeTool === 'notes' && (
            <div className="space-y-1.5">
              <textarea
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                placeholder="Draft your key arguments, rebuttal facts, or questions..."
                rows={3}
                className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none"
              />
            </div>
          )}

          {/* Participants */}
          {activeTool === 'participants' && (
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-semibold text-slate-200">{p.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Online</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          LIVE AI THOUGHT & ANALYSIS CARD (Air-Time & Feedback)
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 rounded-2xl bg-[#0c1220] border border-blue-900/40 p-4 flex flex-col justify-between space-y-3 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
              <Brain className="w-4 h-4 text-purple-400" />
            </span>
            <span>AI Real-time GD Telemetry</span>
          </div>

          {/* Air Time Tracker (% Distribution) */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
              <span>Your Air-Time:</span>
              <span className="font-mono text-cyan-300 font-bold">
                {aiAnalysis.airTimePct || 31}% (Target: {aiAnalysis.targetAirTimePct || 25}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, aiAnalysis.airTimePct || 31)}%` }}
              />
            </div>
          </div>

          {/* Speed & Fillers Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5 text-center">
              <span className="text-[9px] uppercase text-slate-400 block font-semibold">Pace</span>
              <span className="font-extrabold text-emerald-300">{aiAnalysis.wpm || 138} WPM</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5 text-center">
              <span className="text-[9px] uppercase text-slate-400 block font-semibold">Fillers</span>
              <span className="font-extrabold text-cyan-300">{aiAnalysis.fillersCount || 1} Used</span>
            </div>
          </div>
        </div>

        {/* Constructive GD Tip */}
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-950/40 to-blue-950/40 border border-purple-500/30 text-[11px] text-slate-200 leading-relaxed">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Moderator Tip:</span>
          </div>
          <p>{aiAnalysis.tip}</p>
        </div>
      </div>
    </div>
  );
}
