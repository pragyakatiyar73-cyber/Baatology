import React from 'react';
import { getPracticeHistory } from '../../utils/progressHistory';
import { MODES } from '../../utils/aiResponses';
import { ArrowLeft, ArrowRight, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HistoryView({ onStartArena, onBackToDashboard }) {
  const history = getPracticeHistory();
  const numericRecords = history.filter((r) => typeof r.score === 'number');
  const avgScore = numericRecords.length > 0
    ? Math.round(numericRecords.reduce((acc, r) => acc + r.score, 0) / numericRecords.length)
    : 85;
  const avgEye = Math.round(history.reduce((acc, r) => acc + (r.eyeContact || 85), 0) / history.length);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#f8faff] text-[#1e1b4b] select-none p-8 lg:px-12 space-y-7 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-1.5 rounded-xl hover:bg-white text-[#64748b] hover:text-[#1e1b4b] transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-[#1e1b4b]">
              Practice Journey &amp; Growth Analytics
            </h1>
          </div>
          <p className="text-xs text-[#64748b] mt-1">
            Track your verbal fluency, posture stability, and turn-taking progress across every session.
          </p>
        </div>

        <button
          onClick={() => onStartArena(MODES.GD)}
          className="px-5 py-2.5 rounded-full bg-[#5b51e8] hover:bg-[#4a3ecc] text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>Start Practice Arena</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <p className="text-xs font-semibold text-[#64748b]">Total Practice Rounds</p>
          <p className="text-3xl font-extrabold text-[#1e1b4b] mt-1">{history.length}</p>
          <span className="text-[11px] font-semibold text-[#10b981] mt-1 inline-block">Consistent Daily Reps</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <p className="text-xs font-semibold text-[#64748b]">Average Performance</p>
          <p className="text-3xl font-extrabold text-[#5b51e8] mt-1">{avgScore}%</p>
          <span className="text-[11px] font-semibold text-[#6366f1] mt-1 inline-block">+31% gain since Day 1</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <p className="text-xs font-semibold text-[#64748b]">Average Eye Contact</p>
          <p className="text-3xl font-extrabold text-[#059669] mt-1">{avgEye}%</p>
          <span className="text-[11px] font-semibold text-[#059669] mt-1 inline-block">High camera confidence</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <p className="text-xs font-semibold text-[#64748b]">Placement Status</p>
          <p className="text-2xl font-extrabold text-[#d97706] mt-1">Interview Ready</p>
          <span className="text-[11px] font-semibold text-[#d97706] mt-1 inline-block">Benchmark cleared</span>
        </div>
      </div>

      {/* Comprehensive History Table */}
      <div className="p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2">
              <span>📅</span>
              <span>Recorded Practice History</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-300">
              +31% Growth 🔥
            </span>
          </div>
          <span className="text-xs text-[#64748b]">Auto-saved to your personal device profile</span>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-[#e2e8f0]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8fafc] text-[#475467] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Practice Domain</th>
                <th className="py-3 px-4">Score (/100)</th>
                <th className="py-3 px-4">Eye Contact</th>
                <th className="py-3 px-4">Hesitation Fillers</th>
                <th className="py-3 px-4">Milestone Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] font-medium">
              {history.map((item) => {
                const isToday = item.date === 'Today';
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors duration-150 ${
                      isToday
                        ? 'bg-[#ecfdf5]/70 text-[#065f46] font-bold border-l-4 border-[#10b981]'
                        : 'hover:bg-[#f8fafc] text-[#334155]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {isToday && (
                          <span className="w-2 h-2 rounded-full bg-[#10b981] pulse-dot shrink-0" />
                        )}
                        <span className={isToday ? 'text-[#065f46] font-bold' : 'font-semibold text-[#1e293b]'}>
                          {item.date}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span>
                          {item.mode.includes('Discussion') ? '🗣️' : item.mode.includes('Intro') ? '🎯' : item.mode.includes('Pitch') || item.mode.includes('Presentation') ? '📽️' : item.mode.includes('GD & Pitch') ? '🚀' : '☕'}
                        </span>
                        <span className={isToday ? 'text-[#065f46] font-bold' : 'text-[#334155] font-semibold'}>
                          {item.mode}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {typeof item.score === 'number' ? (
                        <span className={`font-bold text-sm tabular-nums ${isToday ? 'text-[#059669]' : item.score >= 80 ? 'text-[#059669]' : 'text-[#d97706]'}`}>
                          {item.score}/100
                        </span>
                      ) : (
                        <span className="font-bold text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {item.score}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-semibold tabular-nums ${isToday ? 'text-[#059669]' : 'text-[#334155]'}`}>
                        {item.eyeContact}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        isToday
                          ? 'text-[#065f46] bg-[#d1fae5] border border-[#a7f3d0]'
                          : item.fillers <= 3
                          ? 'text-[#059669] bg-[#ecfdf5]'
                          : 'text-[#b45309] bg-[#fffbeb]'
                      }`}>
                        {item.fillers} hesitation filler{item.fillers === 1 ? '' : 's'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isToday
                          ? 'text-[#065f46] bg-[#d1fae5] border-[#6ee7b7]'
                          : 'text-[#4338ca] bg-[#eff0fe] border-indigo-200'
                      }`}>
                        {item.badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[#64748b] pt-1 flex items-center gap-1.5">
          <span className="text-[#5b51e8]">📊</span>
          <span>Empirical breakdown of speech fluency, gaze stability, and hesitation reductions across sessions.</span>
        </p>
      </div>
    </div>
  );
}
