import React from 'react';
import {
  Users,
  User,
  FileText,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Bell,
  ChevronDown,
  Video,
  Tv,
  MessageCircle,
} from 'lucide-react';
import { MODES } from '../../utils/aiResponses';
import { getPracticeHistory } from '../../utils/progressHistory';
import robotMascotImg from '../../assets/robot_mascot_transparent.png';


export default function Dashboard({
  userName = 'Pragya',
  onStartArena,
  onNavigate,
  cameraActive,
  celebrationBanner,
  onViewScorecard,
  onOpenLoginModal,
  onTriggerCelebration,
}) {
  const historyRecords = getPracticeHistory();
  const latestSession = historyRecords[historyRecords.length - 1] || {
    score: 86,
    eyeContact: 88,
    fillers: 1,
  };

  const savedCelebration = typeof window !== 'undefined'
    ? (() => {
        try {
          const raw = localStorage.getItem('aura_gd_latest_celebration');
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      })()
    : null;

  const celebratoryText = celebrationBanner?.message
    || savedCelebration?.message
    || `Fantastic effort today! Look at your progress—your eye contact was steady at ${latestSession.eyeContact || 88}%, and you kept vocal hesitations down to just ${latestSession.fillers ?? 1}. Keep this confidence high for your campus placements!`;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#f8faff] text-[#1e1b4b] select-none flex flex-col justify-between w-full">
      {/* ── Top Header Bar ── */}
      <header className="w-full px-8 lg:px-12 pt-6 pb-2 flex items-center justify-end gap-3 sm:gap-4 shrink-0">
        {/* Replay Welcome Celebration Button */}
        <button
          onClick={onTriggerCelebration}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#eff0fe] to-[#f5f3ff] hover:from-[#e0e7ff] hover:to-[#ede9fe] border border-indigo-200 text-xs font-bold text-[#4f46e5] shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Blast welcome fireworks & AI greeting"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="hidden sm:inline">Welcome Celebration</span>
          <span className="sm:hidden">Celebrate</span>
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 text-[#475467] hover:text-[#1e1b4b] hover:bg-white rounded-full transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
        </button>

        {/* User Profile Pill */}
        <div
          onClick={onOpenLoginModal}
          className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-full hover:bg-white/90 border border-transparent hover:border-slate-200 cursor-pointer transition-all shadow-xs"
          title="Candidate Profile (Click to switch user or edit name)"
        >
          <div className="w-9 h-9 rounded-full bg-[#4f46e5] text-white font-semibold flex items-center justify-center text-sm shadow-xs uppercase">
            {userName ? userName.charAt(0) : 'P'}
          </div>
          <span className="text-sm font-semibold text-[#1e1b4b]">
            {userName}
          </span>
          <ChevronDown className="w-4 h-4 text-[#667085]" />
        </div>
      </header>

      {/* ── Main Full-Width Content Area (No restrictive max-w) ── */}
      <main className="flex-1 px-8 lg:px-12 pb-8 space-y-6 w-full flex flex-col justify-between">
        {/* Top Hero & Sessions Section */}
        <div className="space-y-5">
          {/* Hero Greeting */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1e1b4b] flex items-center gap-3 tracking-tight">
              <span>👋</span>
              <span>Hello {userName}!</span>
            </h1>
            <p className="text-sm text-[#475467] mt-1.5 font-normal max-w-3xl leading-relaxed">
              Your AI Communication Coach is here to help you build confidence, improve your communication skills and get placement ready!
            </p>
          </div>

          {/* Section: Choose Your Practice Session */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-[#1e1b4b] tracking-tight">
              Choose Your Practice Session
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Pick a feature and start practicing today!
            </p>

            {/* 2-Column Responsive Layout: Left (3 Cards + Banner), Right (Large Mascot) */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-center w-full">
              {/* Left Column (8 cols): 3 Cards Grid + Ready to Improve Banner */}
              <div className="lg:col-span-8 flex flex-col gap-4 w-full">
                {/* 3 Practice Session Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-5 w-full">
                  {/* Card 1: Group Discussion Studio */}
                  <div
                    onClick={() => onNavigate('gd_studio')}
                    className="bg-white rounded-[26px] p-6 border-2 border-[#ede9fe] shadow-xs hover:shadow-xl hover:border-[#8b5cf6] transition-all duration-300 flex flex-col items-center text-center justify-between min-h-[250px] group cursor-pointer hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
                      <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-[#1e1b4b] mt-3">
                      Group Discussion Studio
                    </h3>
                    <p className="text-xs text-[#64748b] leading-relaxed mt-1 flex-1">
                      Interactive 2D roundtable with AI participants, topic selection, real-time air-time tracking & delivery telemetry.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('gd_studio');
                      }}
                      className="mt-3 w-9 h-9 rounded-full bg-[#f3f0ff] hover:bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center transition-all group-hover:scale-110 shadow-xs"
                      title="Launch Group Discussion Studio"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card 2: Self Introduction */}
                  <div
                    onClick={() => onStartArena(MODES.SELF_INTRO)}
                    className="bg-white rounded-[26px] p-6 border-2 border-[#e0f2fe] shadow-xs hover:shadow-xl hover:border-[#3b82f6] transition-all duration-300 flex flex-col items-center text-center justify-between min-h-[250px] group cursor-pointer hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#3b82f6] flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                      <User className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-[#1e1b4b] mt-3">
                      Self Introduction
                    </h3>
                    <p className="text-xs text-[#64748b] leading-relaxed mt-1 flex-1">
                      Practice your introduction and get instant feedback on your speaking &amp; confidence.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartArena(MODES.SELF_INTRO);
                      }}
                      className="mt-3 w-9 h-9 rounded-full bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] flex items-center justify-center transition-all group-hover:scale-110 shadow-xs"
                      title="Start Self Introduction"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card 3: Project Presentation */}
                  {/* Card 3: Project Presentation */}
                  <div
                    onClick={() => onStartArena(MODES.PRESENTATION)}
                    className="bg-white rounded-[26px] p-6 border-2 border-[#d1fae5] shadow-xs hover:shadow-xl hover:border-[#10b981] transition-all duration-300 flex flex-col items-center text-center justify-between min-h-[250px] group cursor-pointer hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-[#1e1b4b] mt-3">
                      Presentation
                    </h3>
                    <p className="text-xs text-[#64748b] leading-relaxed mt-1 flex-1">
                      Deliver your engineering project pitch with real-time STAR framework coaching & instant AI feedback.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartArena(MODES.PRESENTATION);
                      }}
                      className="mt-3 w-9 h-9 rounded-full bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#059669] flex items-center justify-center transition-all group-hover:scale-110 shadow-xs"
                      title="Start Presentation Practice"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* "Ready to Improve?" Banner - Directly positioned under the 3 cards */}
                <div className="rounded-2xl bg-gradient-to-r from-[#f5f3ff] via-[#f0f3ff] to-[#eff6ff] border border-[#e0e7ff] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs w-full">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-indigo-100 flex items-center justify-center text-[#6366f1] shrink-0">
                      <Sparkles className="w-5 h-5 text-[#6366f1]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1e1b4b]">
                        Ready to Improve?
                      </h3>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        Choose your session and start practicing today!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => onNavigate('gd_studio')}
                      className="px-4 py-2 rounded-full bg-[#5b51e8] hover:bg-[#4a3ecc] text-white text-xs font-semibold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Start GD</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onStartArena(MODES.PRESENTATION)}
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Presentation</span>
                    </button>
                    <button
                      onClick={() => onStartArena(MODES.SELF_INTRO)}
                      className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Self Intro</span>
                    </button>
                    <button
                      onClick={() => onStartArena(MODES.CASUAL)}
                      className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Casual Talk</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Large Prominent 3D Robot Mascot */}
              <div className="lg:col-span-4 flex items-center justify-center relative w-full h-full">
                <div
                  onClick={() => onStartArena(MODES.CASUAL)}
                  className="cursor-pointer group relative flex items-center justify-center transition-transform hover:scale-105 duration-300 w-full"
                  title="Click to talk with your 3D AI Coach!"
                >
                  <img
                    src={robotMascotImg}
                    alt="AuraGD AI - Let's Talk!"
                    className="w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px] h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom 4 Feature Pillars (Spans the Full Viewport Width) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-4">
          {/* Pillar 1 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#f1f5f9] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#fdf2f8] text-[#db2777] flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1e1b4b]">Build Confidence</h4>
              <p className="text-[11px] text-[#64748b]">Speak without fear</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#f1f5f9] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1e1b4b]">Get Real Feedback</h4>
              <p className="text-[11px] text-[#64748b]">Know your strengths</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#f1f5f9] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1e1b4b]">Practice Anytime</h4>
              <p className="text-[11px] text-[#64748b]">Your pace, your progress</p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#f1f5f9] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#fffbeb] text-[#d97706] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1e1b4b]">Prepare for Placements</h4>
              <p className="text-[11px] text-[#64748b]">Be job ready</p>
            </div>
          </div>
        </div>

        {/* ── Feature 10 & 9: Date-Wise Progress Tracking (Full Width) ── */}
        <div className="mt-4 p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-sm space-y-5 w-full">
          {/* Celebratory Banner (Feature 9) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#eff6ff] via-[#f5f3ff] to-[#ecfdf5] border border-[#e0e7ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-white border border-indigo-100 shadow-xs">
                🎉
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4f46e5] bg-[#eff0fe] px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Today's Win &amp; Positive Reinforcement
                </span>
                <p className="text-xs sm:text-sm text-[#1e1b4b] font-medium leading-relaxed mt-1">
                  {celebratoryText}
                </p>
              </div>
            </div>

            {onViewScorecard && (
              <button
                onClick={onViewScorecard}
                className="px-4 py-1.5 rounded-xl bg-[#5b51e8] hover:bg-[#4a3ecc] text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
              >
                View Full Scorecard
              </button>
            )}
          </div>

          {/* Progress Section Header with "+31% Growth 🔥" Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2">
                <span>📈</span>
                <span>Date-Wise Progress &amp; Consistency Tracking</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-300 shadow-xs flex items-center gap-1">
                +31% Growth 🔥
              </span>
            </div>

            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-[#5b51e8] hover:text-[#4338ca] transition-colors flex items-center gap-1 shrink-0"
            >
              <span>View Full Journey Analytics</span>
              <span>→</span>
            </button>
          </div>

          {/* Clean 6-Column Full-Width Light Table */}
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
                {historyRecords.map((rec) => {
                  const isToday = rec.date === 'Today';
                  return (
                    <tr
                      key={rec.id}
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
                            {rec.date}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span>
                            {rec.mode.includes('Discussion') ? '🗣️' : rec.mode.includes('Intro') ? '🎯' : rec.mode.includes('Pitch') || rec.mode.includes('Presentation') ? '📽️' : rec.mode.includes('GD & Pitch') ? '🚀' : '☕'}
                          </span>
                          <span className={isToday ? 'text-[#065f46] font-bold' : 'text-[#334155] font-semibold'}>
                            {rec.mode}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {typeof rec.score === 'number' ? (
                          <span className={`font-bold text-sm tabular-nums ${isToday ? 'text-[#059669]' : rec.score >= 80 ? 'text-[#059669]' : rec.score >= 70 ? 'text-[#0284c7]' : 'text-[#d97706]'}`}>
                            {rec.score}/100
                          </span>
                        ) : (
                          <span className="font-bold text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {rec.score}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-semibold tabular-nums ${isToday ? 'text-[#059669]' : 'text-[#334155]'}`}>
                          {rec.eyeContact}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          isToday
                            ? 'text-[#065f46] bg-[#d1fae5] border border-[#a7f3d0]'
                            : rec.fillers <= 3
                            ? 'text-[#059669] bg-[#ecfdf5]'
                            : 'text-[#b45309] bg-[#fffbeb]'
                        }`}>
                          {rec.fillers} hesitation filler{rec.fillers === 1 ? '' : 's'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isToday
                            ? 'text-[#065f46] bg-[#d1fae5] border-[#6ee7b7]'
                            : 'text-[#4338ca] bg-[#eff0fe] border-indigo-200'
                        }`}>
                          {rec.badge}
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
      </main>
    </div>
  );
}
