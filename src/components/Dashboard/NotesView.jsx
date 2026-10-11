import React, { useState } from 'react';
import { SYLLABUS_SUBJECTS, SYLLABUS_NOTES } from '../../utils/syllabusData';

export default function NotesView({ onStartArena }) {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState('dsa-1');

  const filteredNotes = SYLLABUS_NOTES.filter((note) => {
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    const matchesQuery =
      note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.gdTalkingPoint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  return (
    <div className="flex-1 h-full overflow-y-auto px-10 py-8 space-y-8 bg-[#0a0f1d] text-slate-100 select-none pb-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📚</span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Academic Syllabus &amp; Tech Notes
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Curated CS &amp; Software Engineering cheat sheets for Group Discussions and Technical Rounds.
          </p>
        </div>

        {/* Quick Launch Action */}
        <button
          onClick={() => onStartArena('presentation')}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all flex items-center gap-2"
        >
          <span>📽️</span>
          <span>Practice Project Walkthrough</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SYLLABUS_SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubject === sub.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search concepts, CAP theorem, indexing, sliding window..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNotes.map((note) => {
          const isExpanded = expandedId === note.id;
          return (
            <div
              key={note.id}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                isExpanded
                  ? 'bg-[#11192e] border-teal-500/40 shadow-xl'
                  : 'bg-[#0f172a]/70 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => setExpandedId(isExpanded ? null : note.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {note.subjectLabel}
                  </span>
                  <h3 className="text-base font-bold text-white hover:text-teal-300 transition-colors">
                    {note.topic}
                  </h3>
                </div>
                <span className="text-slate-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mt-3">
                {note.summary}
              </p>

              {isExpanded && (
                <div className="space-y-4 pt-4 mt-4 border-t border-slate-800/80 fade-in text-sm">
                  <div>
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                      Key Technical Architectural Takeaways:
                    </h4>
                    <ul className="list-disc list-inside text-slate-300 space-y-1.5 leading-relaxed pl-1">
                      {note.keyPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-100 text-xs leading-relaxed">
                    <span className="font-black text-teal-300">🗣️ High-Impact Interview &amp; GD Talking Point: </span>
                    {note.gdTalkingPoint}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
