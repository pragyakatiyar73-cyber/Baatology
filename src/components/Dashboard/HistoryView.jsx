import React from 'react';
import { getPracticeHistory } from '../../utils/progressHistory';
import { MODES } from '../../utils/aiResponses';
import { ArrowLeft, ArrowRight, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import CommunicationProgressBarChart from './CommunicationProgressBarChart';

export default function HistoryView({ onStartArena, onBackToDashboard }) {
  const history = getPracticeHistory();
  const numericRecords = history.filter((r) => typeof r.score === 'number');
  const avgScore = numericRecords.length > 0
    ? Math.round(numericRecords.reduce((acc, r) => acc + r.score, 0) / numericRecords.length)
    : 85;
  const avgEye = Math.round(history.reduce((acc, r) => acc + (r.eyeContact || 85), 0) / history.length);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#f8faff] text-[#1e1b4b] select-none p-6 sm:p-8 lg:px-12 space-y-7 w-full">
      {/* ── 1. Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#64748b] hover:text-[#1e1b4b] transition-all shadow-xs cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-indigo-600" />
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1e1b4b]">
              Practice Journey &amp; Growth Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1 font-medium">
            Empirical breakdown of speech fluency, gaze stability, and hesitation reductions across every session.
          </p>
        </div>

        <button
          onClick={() => onStartArena(MODES.GD)}
          className="px-5 py-2.5 rounded-full bg-[#5b51e8] hover:bg-[#4a3ecc] text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <span>Start Practice Arena</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── 2. Top Summary KPI Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <p className="text-xs font-semibold text-[#64748b]">Total Practice Rounds</p>
          <p className="text-2xl sm:text-3xl font-black text-[#1e1b4b] mt-1">{history.length}</p>
          <span className="text-[11px] font-bold text-[#10b981] mt-1 inline-block">Consistent Daily Reps</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <p className="text-xs font-semibold text-[#64748b]">Average Performance</p>
          <p className="text-2xl sm:text-3xl font-black text-[#5b51e8] mt-1">{avgScore}%</p>
          <span className="text-[11px] font-bold text-[#6366f1] mt-1 inline-block">+31% gain since Day 1</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <p className="text-xs font-semibold text-[#64748b]">Average Eye Contact</p>
          <p className="text-2xl sm:text-3xl font-black text-[#059669] mt-1">{avgEye}%</p>
          <span className="text-[11px] font-bold text-[#059669] mt-1 inline-block">High camera confidence</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
          <p className="text-xs font-semibold text-[#64748b]">Placement Status</p>
          <p className="text-xl sm:text-2xl font-black text-[#d97706] mt-1">Placement Ready 🚀</p>
          <span className="text-[11px] font-bold text-[#d97706] mt-1 inline-block">Benchmark cleared</span>
        </div>
      </div>

      {/* ── 3. Communication Progress Bar Chart (Matches Image 2) ── */}
      <CommunicationProgressBarChart />

      {/* ── 4. Date-Wise Progress & Consistency Tracking Table (Matches Image 1) ── */}
      <div className="p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
        {/* Table Header with "+31% GROWTH 🔥" Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-[#1e1b4b] flex items-center gap-2">
              <span className="text-indigo-600">📈</span>
              <span>Date-Wise Progress &amp; Consistency Tracking</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-300 shadow-xs flex items-center gap-1">
              +31% GROWTH 🔥
            </span>
          </div>

          <span className="text-xs text-[#64748b]">Auto-saved to your personal device profile</span>
        </div>

        {/* 6-Column Full Width Table */}
        <div className="w-full overflow-x-auto rounded-2xl border border-[#e2e8f0] scrollbar-thin">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-[#f8fafc] text-[#475467] font-bold uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">PRACTICE DOMAIN</th>
                <th className="py-3 px-4">SCORE (/100)</th>
                <th className="py-3 px-4">EYE CONTACT</th>
                <th className="py-3 px-4">HESITATION FILLERS</th>
                <th className="py-3 px-4">MILESTONE BADGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] font-medium">
              {history.map((item) => {
                const isToday = item.date === 'Today' || item.isToday;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors duration-150 ${
                      isToday
                        ? 'bg-[#ecfdf5]/80 text-[#065f46] font-bold border-l-4 border-[#10b981]'
                        : 'hover:bg-[#f8fafc] text-[#334155]'
                    }`}
                  >
                    {/* Date Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isToday ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
                            <span className="text-[#065f46] font-extrabold">Today</span>
                          </>
                        ) : (
                          <span className="font-semibold text-[#1e293b]">{item.date}</span>
                        )}
                      </div>
                    </td>

                    {/* Practice Domain Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {item.mode.includes('Discussion')
                            ? '🗣️'
                            : item.mode.includes('Self Introduction')
                            ? '🎯'
                            : item.mode.includes('GD & Pitch')
                            ? '👥'
                            : item.mode.includes('Pitch') || item.mode.includes('Presentation')
                            ? '📊'
                            : item.mode.includes('Casual')
                            ? '💬'
                            : '🚀'}
                        </span>
                        <span className={isToday ? 'text-[#065f46] font-bold' : 'text-[#334155] font-semibold'}>
                          {item.mode}
                        </span>
                      </div>
                    </td>

                    {/* Score (/100) Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {typeof item.score === 'number' ? (
                        <span
                          className={`font-bold text-sm tabular-nums ${
                            isToday
                              ? 'text-[#059669] font-black'
                              : item.score >= 80
                              ? 'text-[#059669]'
                              : item.score >= 70
                              ? 'text-[#4f46e5]'
                              : 'text-[#d97706]'
                          }`}
                        >
                          {item.score}/100
                        </span>
                      ) : (
                        <span className="font-bold text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {item.score}
                        </span>
                      )}
                    </td>

                    {/* Eye Contact Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-semibold tabular-nums ${isToday ? 'text-[#059669] font-bold' : 'text-[#334155]'}`}>
                        {item.eyeContact}%
                      </span>
                    </td>

                    {/* Hesitation Fillers Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          isToday
                            ? 'text-[#065f46] bg-[#d1fae5] border border-[#a7f3d0]'
                            : item.fillers === 0
                            ? 'text-cyan-700 bg-cyan-50'
                            : item.fillers <= 3
                            ? 'text-[#059669] bg-[#ecfdf5]'
                            : 'text-[#b45309] bg-[#fffbeb]'
                        }`}
                      >
                        {item.fillers} hesitation filler{item.fillers === 1 ? '' : 's'}
                      </span>
                    </td>

                    {/* Milestone Badge Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                          isToday
                            ? 'text-[#065f46] bg-[#d1fae5] border-[#6ee7b7] font-bold'
                            : 'text-[#4338ca] bg-[#eff0fe] border-indigo-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Subtext */}
        <p className="text-[11px] text-[#64748b] pt-1 flex items-center gap-1.5">
          <span className="text-[#5b51e8]">📊</span>
          <span>Empirical breakdown of speech fluency, gaze stability, and hesitation reductions across sessions.</span>
        </p>
      </div>
    </div>
  );
}
