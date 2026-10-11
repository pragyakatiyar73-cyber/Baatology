import React from 'react';
import { MODES } from '../../utils/aiResponses';

export default function Sidebar({
  currentView,
  onNavigate,
  onStartArena,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', isArena: false },
    { id: MODES.GD, label: 'Group Discussion', icon: '🗣️', isArena: true },
    { id: MODES.SELF_INTRO, label: 'Self Introduction', icon: '🎯', isArena: true },
    { id: MODES.PRESENTATION, label: 'Project Presentation', icon: '📽️', isArena: true },
    { id: MODES.CASUAL, label: 'Casual Talk', icon: '☕', isArena: true },
    { id: 'notes', label: 'Syllabus Study Notes', icon: '📚', isArena: false },
    { id: 'history', label: 'Journey History', icon: '📅', isArena: false },
    { id: 'settings', label: 'Settings', icon: '⚙️', isArena: false },
  ];

  return (
    <aside className="w-64 h-full bg-[#090e17] border-r border-slate-800/80 flex flex-col p-4 shrink-0 select-none">
      {/* ── Mascot Profile Card ── */}
      <div className="p-4 rounded-2xl bg-[#0f1726]/80 border border-slate-800 flex flex-col items-center justify-center text-center mb-5 shadow-lg">
        {/* Robot Avatar Icon with Cyan Glow */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-600/30 to-amber-900/40 border border-amber-500/50 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-2 relative">
          <span className="text-3xl leading-none">🤖</span>
          <span className="w-2 h-2 rounded-full bg-teal-400 absolute top-1.5 right-1.5 pulse-dot" />
        </div>
        <h2 className="text-base font-black text-white tracking-wide">AuraGD</h2>
        <p className="text-xs text-slate-400 font-medium">AI Mentor</p>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isArena) {
                  onStartArena(item.id);
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 text-left ${
                isActive
                  ? 'bg-teal-950/70 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {item.isArena && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 opacity-60">
                  LIVE
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer Version ── */}
      <div className="pt-3 border-t border-slate-800/80 text-center">
        <span className="text-[10px] text-slate-500">AuraGD Embodied AI v2.4</span>
      </div>
    </aside>
  );
}
