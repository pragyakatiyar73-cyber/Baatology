import React, { useState } from 'react';
import { Share2, MoreHorizontal, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import { COMMUNICATION_ACTIVITY_SCORES } from '../../utils/progressHistory';

export default function CommunicationProgressBarChart({
  scores = COMMUNICATION_ACTIVITY_SCORES,
  className = '',
}) {
  const [hoveredActivity, setHoveredActivity] = useState(null);

  // Y-axis ticks from 100/100 down to 0/100
  const yTicks = [100, 75, 50, 25, 0];

  return (
    <div
      className={`w-full rounded-3xl bg-[#090a0f] border border-[#1f2438] p-6 sm:p-8 text-white shadow-2xl relative select-none overflow-hidden ${className}`}
    >
      {/* ── Top Header (Title, Subtitle & Action Icons) ── */}
      <div className="flex items-start justify-between gap-4 pb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
            Communication Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Illustrative scores out of 100 for three practice activities.
          </p>
        </div>

        {/* Top Right Action Icons (Share & More) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Communication Progress on Baatology',
                  text: 'Check out my progress in Group Discussion, Presentation, and Casual Talk!',
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="p-2.5 rounded-full bg-[#181a24] hover:bg-[#252838] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Share Progress"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            className="p-2.5 rounded-full bg-[#181a24] hover:bg-[#252838] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Chart Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Chart Canvas Area ── */}
      <div className="relative w-full pt-4 pb-2">
        {/* Y-Axis Grid Lines & Numbers */}
        <div className="relative h-64 sm:h-72 w-full flex flex-col justify-between pointer-events-none">
          {yTicks.map((tick) => (
            <div key={tick} className="relative w-full flex items-center">
              <span className="text-[11px] sm:text-xs font-mono font-medium text-slate-400 w-14 text-left shrink-0">
                {tick}/100
              </span>
              <div className="flex-1 border-b border-dashed border-white/10 ml-2" />
            </div>
          ))}
        </div>

        {/* Grouped Bars Overlay (Positioned absolutely over the grid lines) */}
        <div className="absolute inset-x-0 bottom-6 top-4 pl-16 pr-4 sm:pr-8 flex items-end justify-around gap-2 sm:gap-6">
          {scores.map((item) => {
            const isHovered = hoveredActivity === item.activity;
            return (
              <div
                key={item.activity}
                onMouseEnter={() => setHoveredActivity(item.activity)}
                onMouseLeave={() => setHoveredActivity(null)}
                className="flex-1 max-w-[170px] flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Floating Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-10 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/50 text-[11px] font-bold text-white shadow-xl animate-fade-in pointer-events-none z-20 flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-blue-400">{item.previousScore}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-emerald-400 font-extrabold">{item.latestScore}</span>
                    <span className="text-cyan-300 font-mono">({item.growth})</span>
                  </div>
                )}

                {/* The Two Grouped Bars (Previous = Blue, Latest = Green) */}
                <div className="w-full flex items-end justify-center gap-2 sm:gap-3 h-full">
                  {/* Previous Score Bar (Blue) */}
                  <div
                    className="flex-1 max-w-[56px] bg-[#1d4ed8] hover:bg-[#2563eb] rounded-2xl transition-all duration-300 relative group/blue shadow-lg shadow-blue-900/20"
                    style={{
                      height: `${item.previousScore}%`,
                    }}
                    title={`Previous Score: ${item.previousScore}/100`}
                  >
                    <span className="sr-only">Previous {item.previousScore}</span>
                  </div>

                  {/* Latest Score Bar (Green) */}
                  <div
                    className="flex-1 max-w-[56px] bg-[#227e36] hover:bg-[#2aa045] rounded-2xl transition-all duration-300 relative group/green shadow-lg shadow-emerald-950/30"
                    style={{
                      height: `${item.latestScore}%`,
                    }}
                    title={`Latest Score: ${item.latestScore}/100`}
                  >
                    <span className="sr-only">Latest {item.latestScore}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Activity Labels */}
        <div className="pl-16 pr-4 sm:pr-8 pt-3 flex items-center justify-around gap-2 sm:gap-6">
          {scores.map((item) => (
            <div key={item.activity} className="flex-1 text-center truncate">
              <span className="text-xs sm:text-sm font-semibold text-slate-200 block truncate">
                {item.activity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Legend (🔵 Previous Score | 🟢 Latest Score) ── */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1d4ed8] shadow-sm shadow-blue-500/50" />
          <span className="text-xs sm:text-sm font-semibold text-slate-300">
            Previous Score
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#227e36] shadow-sm shadow-emerald-500/50" />
          <span className="text-xs sm:text-sm font-semibold text-slate-300">
            Latest Score
          </span>
        </div>
      </div>
    </div>
  );
}
