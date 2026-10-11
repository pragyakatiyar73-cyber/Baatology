import React from 'react';
import { getPracticeHistory } from '../../utils/progressHistory';

export default function HistoryView({ onStartArena }) {
  const history = getPracticeHistory();
  const avgScore = Math.round(history.reduce((acc, r) => acc + r.score, 0) / history.length);
  const avgEye = Math.round(history.reduce((acc, r) => acc + r.eyeContact, 0) / history.length);

  return (
    <div className="flex-1 h-full overflow-y-auto px-10 py-8 space-y-8 bg-[#0a0f1d] text-slate-100 select-none pb-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📈</span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Practice Journey &amp; Growth Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track your verbal fluency, posture stability, and turn-taking progress across every session.
          </p>
        </div>

        <button
          onClick={() => onStartArena('gd')}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all flex items-center gap-2"
        >
          <span>🗣️</span>
          <span>Start New GD Session</span>
        </button>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-slate-400">Total Practice Rounds</p>
          <p className="text-3xl font-black text-white mt-1">{history.length}</p>
          <span className="text-[11px] font-bold text-teal-400 mt-1 inline-block">Consistent Daily Reps</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-slate-400">Average Performance</p>
          <p className="text-3xl font-black text-cyan-400 mt-1">{avgScore}%</p>
          <span className="text-[11px] font-bold text-cyan-300 mt-1 inline-block">+31% gain since Day 1</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-slate-400">Average Eye Contact</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">{avgEye}%</p>
          <span className="text-[11px] font-bold text-emerald-300 mt-1 inline-block">High camera confidence</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-slate-400">Placement Status</p>
          <p className="text-2xl font-black text-amber-400 mt-1">Interview Ready</p>
          <span className="text-[11px] font-bold text-amber-300 mt-1 inline-block">All rounds cleared</span>
        </div>
      </div>

      {/* Comprehensive History Table */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>📅</span>
            <span>Recorded Practice History</span>
          </h2>
          <span className="text-xs text-slate-400">Auto-saved to your personal device profile</span>
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1e293b]/70 text-slate-300 font-bold uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Round / Domain</th>
                <th className="py-3.5 px-5">Score</th>
                <th className="py-3.5 px-5">Eye Contact</th>
                <th className="py-3.5 px-5">Hesitations &amp; Fillers</th>
                <th className="py-3.5 px-5">Milestone Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-200">{item.date}</td>
                  <td className="py-4 px-5 text-white font-semibold">{item.mode}</td>
                  <td className="py-4 px-5">
                    <span className={`font-black text-base tabular-nums ${item.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.score}/100
                    </span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-200">{item.eyeContact}%</td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.fillers <= 3 ? 'text-emerald-300 bg-emerald-950/60' : 'text-amber-300 bg-amber-950/60'}`}>
                      {item.fillers} hesitation fillers
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
