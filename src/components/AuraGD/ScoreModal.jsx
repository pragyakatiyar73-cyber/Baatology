import React, { useState, useEffect } from 'react';

function ScoreBar({ label, value }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(value), 60);
    return () => clearTimeout(timer);
  }, [value]);

  const isHigh = value >= 80;
  const isMid = value >= 65 && value < 80;
  const colorCls = isHigh ? 'text-emerald-400' : isMid ? 'text-teal-400' : 'text-amber-400';
  const barCls = isHigh ? 'score-bar-shimmer' : isMid ? 'score-bar-shimmer' : 'score-bar-amber';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-300 font-medium">{label}</span>
        <span className={`text-base font-black tabular-nums ${colorCls}`}>{value}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barCls}`}
          style={{
            width: `${displayed}%`,
            transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>
    </div>
  );
}

export default function ScoreModal({ scores, onClose, onReplayCongratulations }) {
  if (!scores) return null;

  const overall = scores.overall || 86;
  const grade =
    overall >= 85 ? 'Placement Ready' :
    overall >= 72 ? 'Proficient Communicator' :
    overall >= 58 ? 'Steady Growth' : 'Needs Practice';

  const gradeColor =
    overall >= 85 ? 'text-emerald-400' :
    overall >= 72 ? 'text-teal-400' :
    overall >= 58 ? 'text-amber-400' : 'text-rose-400';

  const isPresentation = scores.mode === 'presentation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-lg bg-[#0c131f] border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl space-y-0"
        style={{ boxShadow: '0 0 60px rgba(13,217,184,0.18), 0 24px 48px rgba(0,0,0,0.85)' }}
      >
        {/* ── Modal Header with Verbal Congratulations Badge ── */}
        <div
          className="px-6 py-5 border-b border-slate-800 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(13,217,184,0.12) 0%, rgba(9,14,23,0) 65%)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <h2 className="text-lg font-black text-white tracking-tight">
                Session Complete — Outstanding Effort!
              </h2>
            </div>
            <p className="text-teal-300 text-xs font-semibold mt-0.5">
              AuraGD AI Mentorship — Pragya's Performance Analysis
            </p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-black tabular-nums ${gradeColor}`}>
              {overall}%
            </div>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${gradeColor}`}>
              {grade}
            </div>
          </div>
        </div>

        {/* ── Verbal Motivation Quote Card ── */}
        <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="text-xl">🤖</span>
            <div className="text-xs text-slate-200 leading-snug">
              <span className="font-bold text-teal-300">AI Verbal Praise: </span>
              "Congratulations Pragya! Look at how far you have come! Your courage to speak out loud is your biggest strength. Keep this momentum alive!"
            </div>
          </div>
          {onReplayCongratulations && (
            <button
              onClick={onReplayCongratulations}
              className="px-2.5 py-1 bg-teal-700/80 hover:bg-teal-600 text-white rounded-lg text-[10px] font-bold shrink-0 transition-all"
              title="Hear AI Motivation Again"
            >
              🔊 Replay
            </button>
          )}
        </div>

        {/* ── Metric Bars ── */}
        <div className="px-6 py-4 space-y-3">
          {isPresentation ? (
            <>
              <ScoreBar label="⭐ STAR Framework Alignment" value={scores.starAlignment || 88} />
              <ScoreBar label="⚙️ Technical Architecture & Stack Depth" value={scores.techDepth || 84} />
              <ScoreBar label="🎙️ Articulation & Verbal Clarity" value={scores.articulation || 86} />
              <ScoreBar label="👁️ Delivery & Screen Engagement" value={scores.deliveryAndGaze || 90} />
            </>
          ) : (
            <>
              <ScoreBar label="🎙️ Articulation & Fluency" value={scores.articulation || 86} />
              <ScoreBar label="👁️ Eye Contact & Posture Stability" value={scores.eyeContact || 88} />
              <ScoreBar label="🚀 Turn-Taking & Leadership Presence" value={scores.confidenceAndTurn || 84} />
            </>
          )}
        </div>

        {/* ── Strengths & Improvements ── */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
          <div>
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>✓</span> Strengths
            </h3>
            <ul className="space-y-1.5">
              {scores.strengths.map((str, i) => (
                <li key={i} className="text-xs text-slate-300 leading-snug flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>↗</span> Next Actions
            </h3>
            <ul className="space-y-1.5">
              {scores.improvements.map((imp, i) => (
                <li key={i} className="text-xs text-slate-300 leading-snug flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Action CTA ── */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-extrabold rounded-2xl transition-all duration-200 shadow-xl text-xs uppercase tracking-wider"
            style={{ boxShadow: '0 0 25px rgba(13,217,184,0.3)' }}
          >
            Return to Dashboard &amp; Save Progress
          </button>
        </div>
      </div>
    </div>
  );
}
