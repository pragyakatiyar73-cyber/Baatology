import React from 'react';
import {
  Home,
  Users,
  User,
  FileText,
  MessageCircle,
  BarChart2,
  Settings,
  Target,
  ArrowRight,
  Video,
  Tv,
} from 'lucide-react';
import { MODES } from '../../utils/aiResponses';

export default function Sidebar({
  currentView,
  onNavigate,
  onStartArena,
  onOpenSettings,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      action: () => onNavigate('dashboard'),
      isActive: currentView === 'dashboard',
    },
    {
      id: 'presentation_studio',
      label: 'AI Presentation Studio',
      icon: Tv,
      action: () => onNavigate('presentation_studio'),
      isActive: currentView === 'presentation_studio',
    },
    {
      id: 'mentorship',
      label: 'Dual-Video Mentorship',
      icon: Video,
      action: () => onNavigate('mentorship'),
      isActive: currentView === 'mentorship',
    },
    {
      id: 'gd_studio',
      label: 'Group Discussion Studio',
      icon: Users,
      action: () => onNavigate('gd_studio'),
      isActive: currentView === 'gd_studio',
    },
    {
      id: MODES.SELF_INTRO,
      label: 'Self Introduction',
      icon: User,
      action: () => onStartArena(MODES.SELF_INTRO),
      isActive: false,
    },
    {
      id: MODES.PRESENTATION,
      label: 'Project Presentation',
      icon: FileText,
      action: () => onStartArena(MODES.PRESENTATION),
      isActive: false,
    },
    {
      id: MODES.CASUAL,
      label: 'Casual Talk',
      icon: MessageCircle,
      action: () => onStartArena(MODES.CASUAL),
      isActive: false,
    },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-[#eaecf0] flex flex-col p-5 shrink-0 select-none z-20">
      {/* ── Logo & Brand ── */}
      <div
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-3 cursor-pointer py-1"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5b51e8] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            <path d="M8 11.5h8" strokeWidth="2.5" />
            <path d="M8 15h5" strokeWidth="2.5" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1e1b4b] leading-tight">
            AuraGD
          </h1>
          <p className="text-[10px] font-semibold text-[#6366f1] tracking-wider uppercase">
            Speak • Learn • Grow
          </p>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 mt-7 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                item.isActive
                  ? 'bg-[#eff0fe] text-[#4f46e5] font-semibold shadow-xs'
                  : 'text-[#475467] hover:bg-[#f9fafb] hover:text-[#1e1b4b] font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  item.isActive ? 'text-[#4f46e5]' : 'text-[#667085]'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <hr className="my-3 border-t border-[#f2f4f7]" />

        {/* My Progress */}
        <button
          onClick={() => onNavigate('history')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
            currentView === 'history'
              ? 'bg-[#eff0fe] text-[#4f46e5] font-semibold shadow-xs'
              : 'text-[#475467] hover:bg-[#f9fafb] hover:text-[#1e1b4b] font-medium'
          }`}
        >
          <BarChart2
            className={`w-4 h-4 ${
              currentView === 'history' ? 'text-[#4f46e5]' : 'text-[#667085]'
            }`}
          />
          <span className="truncate">My Progress</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[#475467] hover:bg-[#f9fafb] hover:text-[#1e1b4b] font-medium transition-all duration-150"
        >
          <Settings className="w-4 h-4 text-[#667085]" />
          <span className="truncate">Settings</span>
        </button>
      </nav>

      {/* ── Bottom Promo Card: "Better Communication Brighter Opportunities" ── */}
      <div
        onClick={() => onStartArena(MODES.GD)}
        className="mt-auto p-4 rounded-2xl bg-[#f0f3ff] border border-[#e0e7ff] relative cursor-pointer group hover:bg-[#e8edff] transition-all duration-200"
      >
        <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-indigo-100 flex items-center justify-center text-[#5b51e8] group-hover:scale-105 transition-transform">
          <Target className="w-5 h-5 text-[#5b51e8]" />
        </div>
        <div className="mt-3 text-xs font-semibold text-[#1e1b4b] leading-snug">
          Better<br />
          Communication<br />
          Brighter Opportunities
        </div>
        <div className="absolute bottom-4 right-4 text-[#5b51e8] group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </aside>
  );
}
