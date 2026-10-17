import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  Plus,
  Send,
  Mic,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function GDDigitalScreenBoard({
  topic,
  timerSeconds = 600,
  transcripts = [],
  onOpenTopicModal,
  onAddBulletPoint,
  sessionStatus = 'running',
  onToggleSession,
}) {
  const [newBulletText, setNewBulletText] = useState('');
  const [typedArgument, setTypedArgument] = useState('');

  const min = Math.floor(timerSeconds / 60);
  const sec = timerSeconds % 60;
  const timeFormatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  const handleAddPoint = (e) => {
    e?.preventDefault?.();
    if (!newBulletText.trim()) return;
    onAddBulletPoint(newBulletText);
    setNewBulletText('');
  };

  return (
    <div className="w-full h-full rounded-3xl bg-[#0f1422]/90 border border-white/10 p-5 flex flex-col justify-between shadow-2xl relative select-none overflow-hidden">
      {/* ── Top Bar matching screenshot header: "Roundtable 2D View" & "Start Session v" ── */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
            Roundtable 2D View
          </h3>
          <p className="text-[11px] text-slate-400">
            Active Digital Board &amp; Collaborative Transcript
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Topic Button */}
          <button
            onClick={onOpenTopicModal}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Change or select GD topic"
          >
            <span>Change Topic</span>
          </button>

          {/* Start Session / End Session Dropdown Button (Matching screenshot) */}
          <button
            onClick={onToggleSession}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              sessionStatus === 'running'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <span>{sessionStatus === 'running' ? 'Active Session' : 'Start Session'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Center Digital Screen Board Area ── */}
      <div className="flex-1 w-full flex flex-col gap-3 py-3 overflow-y-auto pr-1">
        {/* Active GD Topic Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#0d1629] to-purple-950/60 border border-blue-500/30 shadow-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              {topic?.category || 'General Discussion'}
            </span>

            {/* Live Countdown Timer */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 bg-black/50 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{timeFormatted}</span>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-black text-white leading-tight">
            {topic?.title || 'Artificial Intelligence in Healthcare: Boon or Threat?'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {topic?.description || 'Debating precision diagnostics, ethical accountability, and patient affordability.'}
          </p>
        </div>

        {/* ── Key Discussion Bullet Points on Board ── */}
        <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Key Debate Points on Board</span>
            </span>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {topic?.keyPoints?.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-200 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5"
              >
                <span className="text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                <span className="font-medium leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          {/* Quick Add Bullet Input */}
          <form onSubmit={handleAddPoint} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newBulletText}
              onChange={(e) => setNewBulletText(e.target.value)}
              placeholder="Add key argument to discussion board..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* ── Live Roundtable Discussion Transcript Feed ── */}
        <div className="flex-1 p-3.5 rounded-2xl bg-[#0a0f1c] border border-white/5 flex flex-col justify-between space-y-2 min-h-[160px]">
          <div className="flex items-center justify-between pb-1 border-b border-white/5 text-[11px] text-slate-400">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Dialogue Stream</span>
            </span>
            <span>{transcripts.length} contributions</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-48 pr-1">
            {transcripts.map((entry) => (
              <div
                key={entry.id}
                className={`p-2.5 rounded-xl text-xs space-y-1 transition-all ${
                  entry.speakerId === 'student-1'
                    ? 'bg-blue-950/40 border border-blue-500/30'
                    : 'bg-slate-900/60 border border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold ${
                      entry.speakerId === 'student-1' ? 'text-cyan-300' : 'text-purple-300'
                    }`}
                  >
                    {entry.speakerName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{entry.timestamp}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-normal">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Candidate Quick Response Bar ── */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="font-semibold text-slate-300">
            Microphone Open • Speak your argument naturally
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400">Turn: Open Floor</span>
      </div>
    </div>
  );
}
