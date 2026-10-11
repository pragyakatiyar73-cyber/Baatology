import React, { useState } from 'react';
import { MODES } from '../../utils/aiResponses';
import { getPracticeHistory } from '../../utils/progressHistory';

export default function Dashboard({
  onStartArena,
  onNavigate,
  cameraActive,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Real persistent data from localStorage
  const historyRecords = getPracticeHistory();
  const latestSession = historyRecords[historyRecords.length - 1] || { score: 86, eyeContact: 88, fillers: 1 };

  // Quick Study Chips Data
  const quickChips = [
    {
      name: 'B-Tree Indexing',
      category: 'DBMS & Storage',
      summary: 'B+ trees maintain sorted key-value pairs at leaf nodes with doubly linked list pointers for O(log N) lookups and high-throughput range scans without random disk seeks.',
      takeaway: 'In high-scale database queries, clustered B+ tree indices prevent table scans and reduce query latency by 90%+.',
    },
    {
      name: 'STAR Framework',
      category: 'Behavioral & Tech Pitch',
      summary: 'Situation (Context), Task (Engineering Objective), Action (Concrete code, tool choices & implementation), Result (Measurable metrics: latency, throughput, users).',
      takeaway: 'Always ground the "Result" with empirical numbers to prove technical business impact to interview panels.',
    },
    {
      name: 'Agentic AI Loops',
      category: 'Generative AI & LLMs',
      summary: 'Autonomous LLM agent systems that combine chain-of-thought reasoning, external API tool execution, long-term memory, and self-reflection (ReAct architecture).',
      takeaway: 'Agentic loops shift software engineering from static procedural code to goal-driven autonomous systems.',
    },
    {
      name: 'Virtual DOM',
      category: 'Web Tech & React',
      summary: 'An in-memory lightweight JavaScript tree representing the browser DOM. When state changes, React diffs previous vs new VDOM (reconciliation) and batches atomic DOM mutations.',
      takeaway: 'Minimizes expensive browser layout repaints and reflows by updating only changed subtrees.',
    },
  ];

  // Modern Practice Arenas
  const arenas = [
    {
      id: MODES.GD,
      title: 'Group Discussion',
      icon: '🗣️',
      badge: 'Debate & Rebuttals',
      description: 'Practice placement GD rounds on topics like Agentic AI, with turn-taking and dynamic counter-arguments.',
      borderColor: 'hover:border-teal-400/60',
      btnColor: 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/30',
      tagColor: 'text-teal-300 bg-teal-950/60 border-teal-500/30',
    },
    {
      id: MODES.SELF_INTRO,
      title: 'Self Introduction',
      icon: '🎯',
      badge: 'Structure & Openings',
      description: 'Evaluates your "Tell me about yourself" pitch, detects weak "Myself..." openings, and eliminates vocal filler words.',
      borderColor: 'hover:border-indigo-400/60',
      btnColor: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30',
      tagColor: 'text-indigo-300 bg-indigo-950/60 border-indigo-500/30',
    },
    {
      id: MODES.PRESENTATION,
      title: 'Project Presentation',
      icon: '📽️',
      badge: 'STAR Architecture',
      description: 'Explain your engineering projects verbally or share demo slides; AI tests your architecture with deep cross-questions.',
      borderColor: 'hover:border-cyan-400/60',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/30',
      tagColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
    },
    {
      id: MODES.CASUAL,
      title: 'Casual Talk',
      icon: '☕',
      badge: 'Anxiety & Poise',
      description: 'Empathetic friend mode to share interview stress, placement anxiety, or speak freely to build vocal rhythm.',
      borderColor: 'hover:border-amber-400/60',
      btnColor: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30',
      tagColor: 'text-amber-300 bg-amber-950/60 border-amber-500/30',
    },
  ];

  const handleChipClick = (chip) => {
    setSelectedTopic(chip);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = quickChips.find((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      setSelectedTopic(match);
    } else {
      setSelectedTopic({
        name: searchQuery,
        category: 'Engineering Concept',
        summary: `Key engineering topic: "${searchQuery}". Review this fundamental concept for technical depth, trade-offs, and architecture justification before speaking in interviews.`,
        takeaway: `Formulate a concise 45-second explanation with a real-world project example.`,
      });
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto px-10 py-8 space-y-10 bg-[#0a0f1d] text-slate-100 select-none pb-32">
      {/* ════════════════ TOP WELCOME ROW ════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Welcome Back, <span className="text-teal-400">Pragya</span>!
            </h1>
            <span className="text-2xl">🎓</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Ready for placement season? Select an interactive arena below to test your verbal confidence and posture.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-emerald-400 pulse-dot' : 'bg-slate-500'}`} />
            <span>{cameraActive ? 'Vision HUD Active' : 'Camera Ready'}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/70 border border-teal-500/30 text-xs font-semibold text-teal-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span>AI Voice Engine Ready</span>
          </div>
        </div>
      </div>

      {/* ════════════════ TOP 3 STATS CARDS ════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Readiness Score */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800/90 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Readiness</p>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-4xl font-black text-cyan-400 tabular-nums">{latestSession.score}</span>
              <span className="text-base text-slate-500 font-bold">/100</span>
            </div>
            <p className="text-xs text-teal-400 font-semibold pt-1 flex items-center gap-1.5">
              <span>✓</span>
              <span>Interview Qualified Benchmark</span>
            </p>
          </div>

          <div className="relative w-18 h-18 flex items-center justify-center">
            <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400"
                strokeDasharray={`${latestSession.score}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-cyan-300">{latestSession.score}%</span>
          </div>
        </div>

        {/* Metric 2: Consistency Streak */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800/90 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consistency Streak</p>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl font-black text-amber-400 tabular-nums">{historyRecords.length}</span>
              <span className="text-base text-amber-300/80 font-bold">Days Active</span>
            </div>
            <p className="text-xs text-amber-300/80 font-semibold pt-1">
              🔥 Daily vocal habit established
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl shadow-inner">
            🔥
          </div>
        </div>

        {/* Metric 3: Eye Contact & Gaze */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800/90 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Eye Contact</p>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-4xl font-black text-emerald-400 tabular-nums">{latestSession.eyeContact}%</span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold pt-1 flex items-center gap-1.5">
              <span>👁️</span>
              <span>Vision HUD verified steady gaze</span>
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl shadow-inner">
            👁️
          </div>
        </div>
      </div>

      {/* ════════════════ PRACTICE ARENA (4 MAIN CARDS) ════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Interactive Practice Arenas</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pure voice-to-voice 1-on-1 simulations with the Embodied 3D Evaluator.
            </p>
          </div>
          <span className="text-xs text-slate-400">Click any card to start call</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {arenas.map((arena) => (
            <div
              key={arena.id}
              className={`p-6 rounded-2xl border border-slate-800 bg-[#0f172a] flex flex-col justify-between transition-all duration-200 shadow-xl hover:-translate-y-1 hover:shadow-2xl ${arena.borderColor}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{arena.icon}</span>
                  <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${arena.tagColor}`}>
                    {arena.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {arena.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2 min-h-[54px]">
                    {arena.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onStartArena(arena.id)}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all mt-5 shadow-lg flex items-center justify-center gap-2 ${arena.btnColor}`}
              >
                <span>Launch Arena</span>
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ 3. DATE-WISE PROGRESS TABLE & VERBAL ENCOURAGEMENT BANNER ════════════════ */}
      <div className="p-7 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-5">
        {/* Celebratory Highlight Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/70 via-slate-900 to-indigo-950/70 border border-teal-500/40 flex items-center gap-3.5 shadow-lg">
          <span className="text-2xl shrink-0">🎉</span>
          <div className="text-xs sm:text-sm text-slate-200 leading-snug">
            <span className="font-black text-teal-300">Today's Win: </span>
            Great progress! Fillers dropped down to 1 and eye contact reached 88%. Keep this momentum going!
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2.5">
              <span>📈</span>
              <span>Date-Wise Progress &amp; Consistency Tracking</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical breakdown of speech fluency, gaze stability, and hesitation reductions across sessions.
            </p>
          </div>

          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>View Full Journey Analytics</span>
            <span>→</span>
          </button>
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1e293b]/60 text-slate-400 font-bold uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Domain</th>
                <th className="py-3.5 px-5">Score (/100)</th>
                <th className="py-3.5 px-5">Eye Contact %</th>
                <th className="py-3.5 px-5">Hesitation Fillers</th>
                <th className="py-3.5 px-5">Milestone Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {historyRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-200">{rec.date}</td>
                  <td className="py-4 px-5 text-white font-semibold flex items-center gap-2">
                    <span>
                      {rec.mode.includes('Discussion') ? '🗣️' : rec.mode.includes('Intro') ? '🎯' : rec.mode.includes('Presentation') ? '📽️' : '☕'}
                    </span>
                    <span>{rec.mode}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`font-black text-base tabular-nums ${rec.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {rec.score}/100
                    </span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-200">
                    <span className="text-emerald-400 font-bold">{rec.eyeContact}%</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${rec.fillers <= 3 ? 'text-emerald-300 bg-emerald-950/60' : 'text-amber-300 bg-amber-950/60'}`}>
                      {rec.fillers} hesitation fillers
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${rec.badgeColor}`}>
                      {rec.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════ 2. ACADEMIC NOTES & SYLLABUS ENGINE WIDGET ════════════════ */}
      <div className="p-7 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2.5">
              <span>📚</span>
              <span>Academic Notes &amp; Syllabus Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant engineering definitions &amp; high-impact interview takeaways for quick reference.
            </p>
          </div>
        </div>

        {/* Live Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search DSA, DBMS, OS, AI topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors shadow-inner"
          />
          <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
          <button
            type="submit"
            className="absolute right-2.5 top-2 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md"
          >
            Search
          </button>
        </form>

        {/* Clickable Quick-Study Chips */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick-Study Topics:
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {quickChips.map((chip) => {
              const isSelected = selectedTopic?.name === chip.name;
              return (
                <button
                  key={chip.name}
                  onClick={() => handleChipClick(chip)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-500/25 text-teal-300 border border-teal-400/60 shadow-md shadow-teal-500/10'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <span>⚡</span>
                  <span>{chip.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Topic Quick Insight Card */}
        {selectedTopic && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/40 text-xs space-y-2.5 fade-in">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-white flex items-center gap-2">
                <span>📘</span>
                <span>{selectedTopic.name}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/30">
                  {selectedTopic.category}
                </span>
              </span>
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {selectedTopic.summary}
            </p>
            <div className="p-2.5 rounded-lg bg-teal-950/50 border border-teal-500/30 text-teal-200 text-xs">
              <span className="font-bold">🗣️ Interview Takeaway: </span>
              {selectedTopic.takeaway}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
