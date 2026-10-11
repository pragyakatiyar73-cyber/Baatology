import React, { useState } from 'react';
import { MODES } from '../../utils/aiResponses';
import { SYLLABUS_SUBJECTS, SYLLABUS_NOTES } from '../../utils/syllabusData';
import { getPracticeHistory } from '../../utils/progressHistory';

export default function Dashboard({
  onStartArena,
  cameraActive,
}) {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoteId, setExpandedNoteId] = useState('dsa-1');

  // Load persistent real history from localStorage
  const historyRecords = getPracticeHistory();

  // Arena Card Definitions
  const arenas = [
    {
      id: MODES.GD,
      title: 'Group Discussion',
      icon: '🗣️',
      description: 'Placement GD debate on Agentic AI, with turn-taking and dynamic counter-arguments.',
      accentBorder: 'border-teal-500/40 hover:border-teal-400',
      accentBg: 'bg-teal-950/20 hover:bg-teal-950/40',
      btnBg: 'bg-teal-600 hover:bg-teal-500',
    },
    {
      id: MODES.SELF_INTRO,
      title: 'Self Introduction',
      icon: '🎯',
      description: 'Live evaluator catching weak openings like "Myself...", filler words, and structure.',
      accentBorder: 'border-purple-500/40 hover:border-purple-400',
      accentBg: 'bg-purple-950/20 hover:bg-purple-950/40',
      btnBg: 'bg-purple-600 hover:bg-purple-500',
    },
    {
      id: MODES.PRESENTATION,
      title: 'Project Presentation',
      icon: '📽️',
      description: 'Screen-share slides or verbal walkthrough with STAR framework & deep tech questions.',
      accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
      accentBg: 'bg-cyan-950/20 hover:bg-cyan-950/40',
      btnBg: 'bg-cyan-600 hover:bg-cyan-500',
    },
    {
      id: MODES.CASUAL,
      title: 'Casual Talk',
      icon: '☕',
      description: 'Empathetic friend mode for sharing interview anxiety, stress relief & calming reassurance.',
      accentBorder: 'border-amber-600/40 hover:border-amber-500',
      accentBg: 'bg-amber-950/20 hover:bg-amber-950/40',
      btnBg: 'bg-amber-700 hover:bg-amber-600',
    },
  ];

  // Filter Academic Notes
  const filteredNotes = SYLLABUS_NOTES.filter((note) => {
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    const matchesQuery =
      note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.gdTalkingPoint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  // Calculate dynamic metrics based on latest sessions
  const latestSession = historyRecords[historyRecords.length - 1] || { score: 86, eyeContact: 88 };
  const avgScore = Math.round(historyRecords.reduce((acc, r) => acc + r.score, 0) / historyRecords.length);

  return (
    <div className="flex-1 h-full overflow-y-auto px-8 py-6 space-y-8 bg-[#070b12] text-slate-100 select-none pb-24">
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
              Welcome Back, <span className="text-teal-300 font-extrabold">Pragya</span>! 🎓
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-sm">
            <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-400 pulse-dot' : 'bg-slate-500'}`} />
            <span>{cameraActive ? 'Vision HUD Active' : 'Vision Ready'}</span>
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
              <span className="text-3xl font-black text-cyan-400">{latestSession.score}</span>
              <span className="text-sm text-slate-500 font-bold">/100</span>
            </div>
            <p className="text-[11px] text-teal-400/90 font-semibold">
              {latestSession.score >= 80 ? '🎯 Interview Ready' : '📈 Progressing Steady'}
            </p>
          </div>

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
                strokeDasharray={`${latestSession.score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-cyan-300">{latestSession.score}%</span>
          </div>
        </div>

        {/* Metric 2: Practice Streak */}
        <div className="p-5 rounded-2xl bg-[#090e17] border border-amber-900/30 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Practice Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">{historyRecords.length} Days</span>
              <span className="text-xs text-amber-300/80 font-semibold">active</span>
            </div>
            <p className="text-[11px] text-amber-300/80 font-semibold">Daily vocal consistency</p>
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
              <span className="text-3xl font-black text-emerald-400">{latestSession.eyeContact}%</span>
            </div>
            <p className="text-[11px] text-emerald-400/80 font-semibold">Vision HUD verified</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            👁️
          </div>
        </div>
      </div>

      {/* ════════════════ PRACTICE ARENA SECTION ════════════════ */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Practice Arena (Pure Voice-to-Voice)</span>
          </h2>
          <span className="text-xs text-slate-400">Click any arena to launch full-screen 1-on-1 session</span>
        </div>

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
                className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all duration-200 mt-4 shadow-lg ${arena.btnBg}`}
              >
                Start Arena
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ DATE-WISE PROGRESS & CONSISTENCY TABLE ════════════════ */}
      <div className="p-6 rounded-2xl bg-[#090e17] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📅</span>
            <div>
              <h3 className="text-sm font-black text-white">Date-Wise Progress &amp; Consistency Table</h3>
              <p className="text-xs text-slate-400">Live proof of your speech clarity, posture stability &amp; score trajectory</p>
            </div>
          </div>
          <span className="text-xs text-teal-400 font-bold bg-teal-950/60 border border-teal-500/30 px-3 py-1 rounded-full">
            Avg Score: {avgScore}%
          </span>
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Practice Round / Mode</th>
                <th className="py-3 px-4">Score (/100)</th>
                <th className="py-3 px-4">Eye Contact %</th>
                <th className="py-3 px-4">Filler Words</th>
                <th className="py-3 px-4">Growth Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {historyRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-300">{rec.date}</td>
                  <td className="py-3 px-4 text-white font-semibold flex items-center gap-2">
                    <span>
                      {rec.mode.includes('Discussion') ? '🗣️' : rec.mode.includes('Intro') ? '🎯' : rec.mode.includes('Presentation') ? '📽️' : '☕'}
                    </span>
                    <span>{rec.mode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-black text-sm tabular-nums ${rec.score >= 80 ? 'text-emerald-400' : rec.score >= 65 ? 'text-teal-400' : 'text-amber-400'}`}>
                      {rec.score}/100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="font-bold text-emerald-400">{rec.eyeContact}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${rec.fillers <= 3 ? 'text-emerald-300 bg-emerald-950/50' : 'text-amber-300 bg-amber-950/50'}`}>
                      {rec.fillers} fillers
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${rec.badgeColor}`}>
                      {rec.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════ ACADEMIC TOPIC SEARCH & SYLLABUS NOTES ENGINE ════════════════ */}
      <div className="p-6 rounded-2xl bg-[#090e17] border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📚</span>
            <div>
              <h3 className="text-sm font-black text-white">Academic Topic Search &amp; Syllabus Notes Engine</h3>
              <p className="text-xs text-slate-400">Engineering core subjects (DSA, DBMS, OS, Web Tech) for quick GD definitions &amp; interview cheat sheets</p>
            </div>
          </div>
        </div>

        {/* Search Bar + Subject Tabs */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SYLLABUS_SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubject === sub.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search concepts, CAP theorem, indexing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
            />
            <span className="absolute left-3 top-2 text-slate-500 text-xs">🔍</span>
          </div>
        </div>

        {/* Real Academic Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const isExpanded = expandedNoteId === note.id;
            return (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3 cursor-pointer"
                onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-950/80 text-teal-300 border border-teal-500/30">
                      {note.subjectLabel}
                    </span>
                    <h4 className="text-xs font-black text-white hover:text-teal-300 transition-colors">
                      {note.topic}
                    </h4>
                  </div>
                  <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {note.summary}
                </p>

                {isExpanded && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-800 fade-in text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Key Concepts:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1">
                        {note.keyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-200 text-[11px] leading-relaxed">
                      <span className="font-bold">🗣️ GD / Interview Talking Point: </span>
                      {note.gdTalkingPoint}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
