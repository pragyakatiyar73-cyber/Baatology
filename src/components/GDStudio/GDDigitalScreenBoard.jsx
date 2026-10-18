import React, { useState, useEffect, useRef } from 'react';
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
  Trash2,
  Play,
  Pause,
} from 'lucide-react';

export default function GDDigitalScreenBoard({
  topic,
  timerSeconds = 600,
  transcripts = [],
  onOpenTopicModal,
  onAddBulletPoint,
  onRemoveBulletPoint,
  sessionStatus = 'running',
  onToggleSession,
  onSubmitManualArgument,
}) {
  const [newBulletText, setNewBulletText] = useState('');
  const [typedArgument, setTypedArgument] = useState('');
  const transcriptEndRef = useRef(null);

  const min = Math.floor(timerSeconds / 60);
  const sec = timerSeconds % 60;
  const timeFormatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  // Auto-scroll transcript feed on new messages
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [transcripts]);

  const handleAddPoint = (e) => {
    e?.preventDefault?.();
    if (!newBulletText.trim()) return;
    onAddBulletPoint(newBulletText);
    setNewBulletText('');
  };

  const handleSendArgument = (e) => {
    e?.preventDefault?.();
    if (!typedArgument.trim()) return;
    onSubmitManualArgument?.(typedArgument.trim());
    setTypedArgument('');
  };

  return (
    <div className="w-full h-full rounded-3xl bg-[#0f1422]/90 border border-white/10 p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative select-none overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
            Digital Screen Board
          </h3>
          <p className="text-[11px] text-slate-400">
            Active motion topic, live debate points &amp; collaborative transcript
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Topic Button */}
          <button
            onClick={onOpenTopicModal}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            title="Change or select GD topic"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Change Topic</span>
          </button>

          {/* Start / Pause Session Button */}
          <button
            onClick={onToggleSession}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              sessionStatus === 'running'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {sessionStatus === 'running' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Active Session</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Session</span>
              </>
            )}
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
            <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              timerSeconds < 60
                ? 'text-rose-400 bg-rose-950/60 border-rose-500/40 animate-pulse'
                : 'text-cyan-300 bg-black/50 border-cyan-500/20'
            }`}>
              <Clock className="w-3.5 h-3.5" />
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Key Debate Points on Board ({topic?.keyPoints?.length || 0})</span>
            </span>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {topic?.keyPoints?.map((point, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 text-xs text-slate-200 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 group"
              >
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                  <span className="font-medium leading-relaxed">{point}</span>
                </div>
                {onRemoveBulletPoint && (
                  <button
                    onClick={() => onRemoveBulletPoint(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                    title="Remove point"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
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
        <div className="flex-1 min-h-[170px] rounded-2xl bg-[#0c1220] border border-white/5 p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Collaborative Discussion Feed</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Auto-Transcribing Voice
            </span>
          </div>

          {/* Transcript Messages List */}
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 max-h-52">
            {transcripts.map((item) => {
              if (item.isSystem) {
                return (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-center text-[11px] text-purple-300 font-medium"
                  >
                    {item.text}
                  </div>
                );
              }

              const isHost = item.speakerId === 'student-1';

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                    isHost
                      ? 'bg-blue-950/30 border-blue-500/30 text-blue-100'
                      : 'bg-slate-900/70 border-white/5 text-slate-200'
                  }`}
                >
                  {/* Speaker Avatar */}
                  <img
                    src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                    alt={item.speakerName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/15"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-extrabold text-white">
                        {item.speakerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed font-normal">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>

          {/* Quick Typed Argument Input (Allows instant participation alongside mic) */}
          <form onSubmit={handleSendArgument} className="flex items-center gap-2 pt-1 border-t border-white/10">
            <input
              type="text"
              value={typedArgument}
              onChange={(e) => setTypedArgument(e.target.value)}
              placeholder="Type an argument or speak into your microphone..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
