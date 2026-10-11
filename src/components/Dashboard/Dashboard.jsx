import React, { useState } from 'react';
import { MODES } from '../../utils/aiResponses';

export default function Dashboard({
  onStartArena,
  cameraActive,
  scores,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const arenas = [
    {
      id: MODES.GD,
      title: 'Group Discussion',
      icon: '🗣️',
      description: 'Group discussion and debate simulation with dynamic AI counter-arguments.',
      accentBorder: 'border-teal-500/40 hover:border-teal-400',
      accentBg: 'bg-teal-950/20 hover:bg-teal-950/40',
      btnBg: 'bg-teal-600 hover:bg-teal-500',
    },
    {
      id: MODES.SELF_INTRO,
      title: 'Self Introduction',
      icon: '🎯',
      description: 'Self Introduction coaching and structured feedback on your core skills.',
      accentBorder: 'border-purple-500/40 hover:border-purple-400',
      accentBg: 'bg-purple-950/20 hover:bg-purple-950/40',
      btnBg: 'bg-purple-600 hover:bg-purple-500',
    },
    {
      id: MODES.PRESENTATION,
      title: 'Project Presentation',
      icon: '📽️',
      description: 'Project presentation walkthrough with STAR technical cross-questions.',
      accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
      accentBg: 'bg-cyan-950/20 hover:bg-cyan-950/40',
      btnBg: 'bg-cyan-600 hover:bg-cyan-500',
    },
    {
      id: MODES.CASUAL,
      title: 'Casual Talk',
      icon: '☕',
      description: 'Casual talk and friendly mentor conversation to build natural speaking poise.',
      accentBorder: 'border-amber-600/40 hover:border-amber-500',
      accentBg: 'bg-amber-950/20 hover:bg-amber-950/40',
      btnBg: 'bg-amber-700 hover:bg-amber-600',
    },
  ];

  const syllabusNotes = [
    { tag: 'STAR Pitch Method', desc: 'Situation, Task, Action & Result framework for technical answers' },
    { tag: 'Microservices & Scale', desc: 'Read replicas, distributed caching, and zero-downtime deployments' },
    { tag: 'Gaze & Composure', desc: 'Maintaining center-camera eye contact and eliminating filler words' },
    { tag: 'GD Leadership Phrases', desc: '"Building upon that viewpoint...", "To synthesize both points..."' },
  ];

  const filteredNotes = syllabusNotes.filter(
    (n) =>
      n.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 h-full overflow-y-auto px-8 py-6 space-y-7 bg-[#070b12] text-slate-100 select-none">
      {/* ════════════════ TOP WELCOME ROW ════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-white">
            Aura<span className="text-teal-400">GD</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-[10px] font-black tracking-widest uppercase">
            AI Live Powered
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-base font-bold text-white flex items-center gap-1.5">
              Welcome Back, <span className="text-teal-300">Pragya</span>! 🎓
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-400 pulse-dot' : 'bg-slate-500'}`} />
            <span>{cameraActive ? 'Vision Active' : 'Vision Ready'}</span>
          </div>
        </div>
      </div>

      {/* ════════════════ TOP 3 METRICS CARDS ════════════════ */}
      <div className="grid grid-cols-3 gap-5">
        {/* Metric 1: Placement Readiness */}
        <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Placement Readiness</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-cyan-400">86</span>
              <span className="text-sm text-slate-500 font-bold">/100</span>
            </div>
          </div>
          {/* Circular Progress Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400"
                strokeDasharray="86, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-cyan-300">86%</span>
          </div>
        </div>

        {/* Metric 2: Practice Streak */}
        <div className="p-5 rounded-2xl bg-[#090e17] border border-amber-900/30 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Practice Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">4 Days</span>
              <span className="text-xs text-amber-300/80 font-semibold">active</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            🔥
          </div>
        </div>

        {/* Metric 3: Avg Eye Contact */}
        <div className="p-5 rounded-2xl bg-[#090e17] border border-emerald-900/30 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Avg Eye Contact</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-400">88%</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            👁️
          </div>
        </div>
      </div>

      {/* ════════════════ PRACTICE ARENA SECTION ════════════════ */}
      <div className="space-y-3.5">
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          <span>Practice Arena</span>
        </h2>

        <div className="grid grid-cols-4 gap-4">
          {arenas.map((arena) => (
            <div
              key={arena.id}
              className={`p-5 rounded-2xl border bg-[#090e17] flex flex-col justify-between transition-all duration-300 shadow-xl group ${arena.accentBorder} ${arena.accentBg}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{arena.icon}</span>
                  <h3 className="text-sm font-black text-white group-hover:text-teal-300 transition-colors">
                    {arena.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[48px]">
                  {arena.description}
                </p>
              </div>

              <button
                onClick={() => onStartArena(arena.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all duration-200 mt-4 shadow-lg ${arena.btnBg}`}
              >
                Start Arena
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ BOTTOM PROGRESS & SYLLABUS ROW ════════════════ */}
      <div className="grid grid-cols-2 gap-5 pb-16">
        {/* Card 1: My Progress Journey & Streak History */}
        <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <span>📊</span>
            <span>My Progress Journey & Streak History</span>
          </h3>

          <div className="w-full overflow-hidden rounded-xl border border-slate-800/80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3.5">Dates</th>
                  <th className="py-2.5 px-3.5">Oct 02</th>
                  <th className="py-2.5 px-3.5">Oct 05</th>
                  <th className="py-2.5 px-3.5">Oct 08</th>
                  <th className="py-2.5 px-3.5 text-teal-300">Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr>
                  <td className="py-2.5 px-3.5 text-slate-400 font-bold">Scoring</td>
                  <td className="py-2.5 px-3.5 text-amber-400">55</td>
                  <td className="py-2.5 px-3.5 text-amber-400">50</td>
                  <td className="py-2.5 px-3.5 text-amber-400">55</td>
                  <td className="py-2.5 px-3.5 text-emerald-400 font-black">86/100</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Readiness Target</span>
              <span className="text-teal-400 font-bold">86% achieved</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full w-[86%]" />
            </div>
          </div>
        </div>

        {/* Card 2: Expand Syllabus / Tech Notes Search */}
        <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>📚</span>
              <span>Expand Syllabus / Tech Notes Search</span>
            </h3>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search interview topics, algorithms, or GD prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
            />
            <span className="absolute left-3 top-2 text-slate-500 text-xs">🔍</span>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {filteredNotes.map((note, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/30 transition-all flex items-start gap-2.5"
              >
                <span className="text-xs">⚡</span>
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-teal-300">{note.tag}</span>
                  <p className="text-slate-400 mt-0.5">{note.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
