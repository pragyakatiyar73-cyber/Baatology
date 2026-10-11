import React from 'react';
import { MODES } from '../../utils/aiResponses';

export default function Sidebar({
  currentView,
  onNavigate,
  onStartArena,
}) {
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

  return (
    <aside className="w-72 h-full bg-[#0c1222] border-r border-slate-800/80 flex flex-col p-5 shrink-0 select-none z-20">
      {/* ── Brand Header ── */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-teal-500/20">
          🤖
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white">AuraGD</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">AI Soft-Skills &amp; Tech Evaluator</p>
        </div>
      </div>

      {/* ── Candidate Profile Card ── */}
      <div className="mt-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center font-bold text-sm text-indigo-300">
          P
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-100 truncate">Pragya</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" title="Active" />
          </div>
          <p className="text-[11px] text-slate-400 truncate">Placement Candidate</p>
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
          <span>Systems Online</span>
        </span>
        <span>AuraGD 2.5</span>
      </div>
    </aside>
  );
}
