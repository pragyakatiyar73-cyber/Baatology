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
  UserPlus,
  Copy,
  Trash2,
  Check,
  Plus,
} from 'lucide-react';

export default function DiscussionToolsPanel({
  participants = [],
  aiAnalysis = {},
  timerSeconds = 600,
  onResetTimer,
  onAddMinutes,
  isPaused = false,
  onTogglePause,
  activePoll,
  onVotePoll,
  notes = '',
  onUpdateNotes,
  onOpenAddStudent,
  onRemoveParticipant,
}) {
  const [activeTool, setActiveTool] = useState(null); // 'timer' | 'polls' | 'notes' | 'participants' | null
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [showCustomPollForm, setShowCustomPollForm] = useState(false);
  const [customPollQ, setCustomPollQ] = useState('');

  const min = Math.floor(timerSeconds / 60);
  const sec = timerSeconds % 60;
  const timeFormatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  const handleCopyNotes = () => {
    if (!notes) return;
    navigator.clipboard?.writeText?.(notes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const totalPollVotes = (activePoll?.options || []).reduce((acc, opt) => acc + opt.votes, 0);

  return (
    <div className="w-full h-full rounded-3xl bg-[#0f1422]/90 border border-white/10 p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative select-none overflow-hidden space-y-3.5">
      {/* ── Top Header: Discussion Tools ── */}
      <div className="border-b border-white/10 pb-3">
        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
          Discussion Tools
        </h3>
        <p className="text-[11px] text-slate-400">
          Session controls, dynamic polls &amp; AI analysis
        </p>
      </div>

      {/* ── 4 Quick Tools Grid (2x2) ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Tool 1: Timer */}
        <button
          onClick={() => setActiveTool(activeTool === 'timer' ? null : 'timer')}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeTool === 'timer'
              ? 'bg-blue-600/30 border-blue-400 text-cyan-300 shadow-md shadow-blue-500/20'
              : 'bg-[#141b2d] hover:bg-[#1c263f] border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Open GD Timer Controls"
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold">Timer</span>
        </button>

        {/* Tool 2: Polls */}
        <button
          onClick={() => setActiveTool(activeTool === 'polls' ? null : 'polls')}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeTool === 'polls'
              ? 'bg-purple-600/30 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20'
              : 'bg-[#141b2d] hover:bg-[#1c263f] border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Open Live Roundtable Poll"
        >
          <BarChart2 className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold">Polls</span>
        </button>

        {/* Tool 3: Notes */}
        <button
          onClick={() => setActiveTool(activeTool === 'notes' ? null : 'notes')}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeTool === 'notes'
              ? 'bg-teal-600/30 border-teal-400 text-teal-300 shadow-md shadow-teal-500/20'
              : 'bg-[#141b2d] hover:bg-[#1c263f] border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Open Rebuttal Scratchpad"
        >
          <FileText className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold">Notes</span>
        </button>

        {/* Tool 4: Participants List */}
        <button
          onClick={() => setActiveTool(activeTool === 'participants' ? null : 'participants')}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            activeTool === 'participants'
              ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/20'
              : 'bg-[#141b2d] hover:bg-[#1c263f] border-white/10 text-slate-300 hover:text-white'
          }`}
          title="View Participants Roster"
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-center leading-tight">
            Participants ({participants.length})
          </span>
        </button>
      </div>

      {/* ── Active Tool Drawer ── */}
      {activeTool && (
        <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-blue-500/30 text-xs text-white space-y-2.5 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-extrabold uppercase text-cyan-400 text-[11px] flex items-center gap-1.5">
              {activeTool === 'timer' && <><span>⏱️</span><span>Timer Controls ({timeFormatted})</span></>}
              {activeTool === 'polls' && <><span>📊</span><span>Live Roundtable Poll</span></>}
              {activeTool === 'notes' && <><span>📝</span><span>Rebuttal Scratchpad</span></>}
              {activeTool === 'participants' && <><span>👥</span><span>Connected Students ({participants.length})</span></>}
            </span>
            <button
              onClick={() => setActiveTool(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. Timer Controls */}
          {activeTool === 'timer' && (
            <div className="space-y-2 pt-1">
              <div className="text-center py-1">
                <span className="text-2xl font-mono font-black text-cyan-300 tracking-wider">
                  {timeFormatted}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Status: {isPaused ? 'Paused' : 'Running'}
                </span>
              </div>

              <div className="flex items-center justify-around gap-2">
                <button
                  onClick={onTogglePause}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={() => onAddMinutes?.(2)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 border border-blue-500/30 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  +2 Mins
                </button>
                <button
                  onClick={onResetTimer}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  title="Reset to 10:00"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Polls Tool */}
          {activeTool === 'polls' && (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-slate-200 font-semibold leading-snug">
                {activePoll?.question || 'Should AI decision-making require mandatory human oversight?'}
              </p>

              <div className="space-y-2">
                {activePoll?.options?.map((opt, idx) => {
                  const pct = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
                  const isUserPick = activePoll.userVotedIndex === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => onVotePoll?.(idx)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isUserPick
                          ? 'bg-purple-950/60 border-purple-400'
                          : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          {isUserPick && <Check className="w-3 h-3 text-purple-400" />}
                          <span>{opt.text}</span>
                        </span>
                        <span className="font-mono text-[11px] text-cyan-300 font-bold">
                          {opt.votes} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {activePoll?.userVotedIndex !== null && (
                <p className="text-[10px] text-emerald-400 text-center font-medium">
                  ✓ Your vote has been recorded on the roundtable!
                </p>
              )}
            </div>
          )}

          {/* 3. Notes Scratchpad */}
          {activeTool === 'notes' && (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => onUpdateNotes?.(e.target.value)}
                placeholder="Draft your key arguments, rebuttal facts, or questions..."
                rows={4}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-mono"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Autosaves automatically</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateNotes?.('')}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCopyNotes}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-[10px] text-white font-bold flex items-center gap-1 transition-all"
                  >
                    {copiedNotes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedNotes ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Participants List */}
          {activeTool === 'participants' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-slate-400">Total: {participants.length} Students</span>
                <button
                  onClick={onOpenAddStudent}
                  className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-[10px] font-bold text-white flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ Add Student</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-white/5 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                      <div>
                        <span className="font-bold text-slate-200 block leading-tight">{p.name}</span>
                        <span className="text-[9px] text-slate-400 block leading-tight">{p.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">
                        {p.speechSeconds || 0}s spoken
                      </span>
                      {!p.isLocalUser && onRemoveParticipant && (
                        <button
                          onClick={() => onRemoveParticipant(p.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove student"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          LIVE AI THOUGHT & ANALYSIS CARD (Air-Time & Feedback)
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 rounded-2xl bg-[#0c1220] border border-blue-900/40 p-4 flex flex-col justify-between space-y-2.5 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                <Brain className="w-4 h-4 text-purple-400" />
              </span>
              <span>AI GD Telemetry</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Analysis
            </span>
          </div>

          {/* Air Time Tracker (% Distribution) */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
              <span>Your Air-Time:</span>
              <span className="font-mono text-cyan-300 font-bold">
                {aiAnalysis.airTimePct || 28}% (Target: {aiAnalysis.targetAirTimePct || 25}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, aiAnalysis.airTimePct || 28)}%` }}
              />
            </div>
          </div>

          {/* Speed & Fillers Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5 text-center">
              <span className="text-[9px] uppercase text-slate-400 block font-semibold">Pace</span>
              <span className="font-extrabold text-emerald-300">{aiAnalysis.wpm || 136} WPM</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5 text-center">
              <span className="text-[9px] uppercase text-slate-400 block font-semibold">Fillers</span>
              <span className={`font-extrabold ${aiAnalysis.fillersCount > 2 ? 'text-rose-400' : 'text-cyan-300'}`}>
                {aiAnalysis.fillersCount || 0} Used
              </span>
            </div>
          </div>
        </div>

        {/* Constructive Moderator Tip */}
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
