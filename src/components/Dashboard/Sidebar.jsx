import React, { useState } from 'react';
import { MODES } from '../../utils/aiResponses';

export default function Sidebar({
  currentView,
  onNavigate,
  onStartArena,
}) {
  const [mentorSpeech, setMentorSpeech] = useState(null);

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: '📊' },
    { id: 'history', label: 'Journey & Growth History', icon: '📈' },
  ];

  const arenaNav = [
    { id: MODES.GD, label: 'Group Discussion', icon: '🗣️', tag: 'Debate' },
    { id: MODES.SELF_INTRO, label: 'Self Introduction', icon: '🎯', tag: 'STAR' },
    { id: MODES.PRESENTATION, label: 'Project Presentation', icon: '📽️', tag: 'Tech' },
    { id: MODES.CASUAL, label: 'Casual Talk', icon: '☕', tag: 'Mentor' },
  ];

  const handleRobotClick = () => {
    const tips = [
      '“Remember Pragya, steady 85%+ eye contact conveys natural authority in interviews!”',
      '“Pause for 1 second instead of saying ‘umm’ — silence creates positive suspense!”',
      '“In project pitches, always quantify your impact with latency or benchmark metrics!”',
    ];
    const picked = tips[Math.floor(Math.random() * tips.length)];
    setMentorSpeech(picked);
    setTimeout(() => setMentorSpeech(null), 4500);
  };

  return (
    <aside className="w-72 h-full bg-[#0c1222] border-r border-slate-800/80 flex flex-col p-5 shrink-0 select-none z-20">
      {/* ── 1. Interactive 3D Robot Mentor Badge Card ── */}
      <div
        onClick={handleRobotClick}
        className="p-4 rounded-2xl bg-gradient-to-b from-[#172238] to-[#0f172a] border border-amber-500/40 hover:border-amber-400 shadow-xl shadow-amber-500/10 cursor-pointer transition-all duration-300 group relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 bg-amber-500/20 blur-xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          {/* Golden Robot Icon with Glowing Cyan Visor */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[2px] shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#111827] rounded-[10px] flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-2xl leading-none">🤖</span>
              {/* Cyan Visor Glimmer */}
              <div className="w-5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff] mt-0.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-tight group-hover:text-amber-300 transition-colors truncate">
                AuraGD
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                AI Mentor
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-[11px] text-emerald-400 font-bold">Online &amp; Evaluating</span>
            </div>
          </div>
        </div>

        {/* Speech Balloon Bubble if clicked */}
        {mentorSpeech && (
          <div className="mt-3 p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-[11px] text-amber-200 leading-snug fade-in">
            {mentorSpeech}
          </div>
        )}
      </div>

      {/* ── Candidate Profile Card ── */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center font-bold text-sm text-indigo-300">
          P
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-100 truncate">Pragya</h3>
            <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-500/30">Candidate</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Ready for Interview Rounds</p>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <div className="flex-1 overflow-y-auto mt-6 space-y-6 pr-1">
        {/* Main Section */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            General
          </p>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Practice Arenas Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live Practice Arenas
            </p>
            <span className="text-[10px] font-bold text-teal-400">1-on-1 AI</span>
          </div>
          <div className="space-y-1">
            {arenaNav.map((arena) => (
              <button
                key={arena.id}
                onClick={() => onStartArena(arena.id)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{arena.icon}</span>
                  <span className="group-hover:text-teal-300 transition-colors">{arena.label}</span>
                </div>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 group-hover:bg-teal-950 group-hover:text-teal-300 border border-slate-700/60 transition-all">
                  {arena.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sidebar Footer ── */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Aura Core Online</span>
        </span>
        <span>AuraGD 2.5</span>
      </div>
    </aside>
  );
}
