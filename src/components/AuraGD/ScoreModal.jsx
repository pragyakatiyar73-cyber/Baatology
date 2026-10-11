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

export default function ScoreModal({ scores, onClose }) {
  if (!scores) return null;

  const overall = scores.overall || 75;
  const grade =
    overall >= 85 ? 'Distinction' :
    overall >= 72 ? 'Proficient' :
    overall >= 58 ? 'Developing' : 'Needs Practice';

  const gradeColor =
    overall >= 85 ? 'text-emerald-400' :
    overall >= 72 ? 'text-teal-400' :
    overall >= 58 ? 'text-amber-400' : 'text-rose-400';

  const isPresentation = scores.mode === 'presentation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-lg bg-[#0c131f] border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl"
        style={{ boxShadow: '0 0 60px rgba(13,217,184,0.14), 0 24px 48px rgba(0,0,0,0.8)' }}
      >
        {/* ── Modal Header ── */}
        <div
          className="px-6 py-5 border-b border-slate-800 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(13,217,184,0.09) 0%, rgba(9,14,23,0) 65%)' }}
        >
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>🏆</span>
              <span>
                {isPresentation ? 'Project Presentation Evaluation' : 'Voice Performance Evaluation'}
              </span>
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {isPresentation
                ? 'STAR Framework & Technical Architecture Assessment'
                : 'AuraGD Embodied AI Soft-Skills Assessment'}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-black tabular-nums ${gradeColor}`}>
              {overall}%
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider ${gradeColor}`}>
              {grade}
            </div>
          </div>
        </div>

        {/* ── Metric Bars ── */}
        <div className="px-6 py-5 space-y-3.5">
          {isPresentation ? (
            <>
              <ScoreBar label="⭐ STAR Framework Alignment" value={scores.starAlignment} />
              <ScoreBar label="⚙️ Technical Architecture & Stack Depth" value={scores.techDepth} />
              <ScoreBar label="🎙️ Articulation & Verbal Clarity" value={scores.articulation} />
              <ScoreBar label="👁️ Delivery & Screen Engagement" value={scores.deliveryAndGaze} />
            </>
          ) : (
            <>
              <ScoreBar label="🎙️ Articulation & Fluency" value={scores.articulation} />
              <ScoreBar label="👁️ Eye Contact & Posture Stability" value={scores.eyeContact} />
              <ScoreBar label="🚀 Turn-Taking & Leadership Presence" value={scores.confidenceAndTurn} />
            </>
          )}
        </div>

        {/* ── Strengths & Improvements ── */}
        <div className="px-6 pb-5 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
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
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg text-sm"
            style={{ boxShadow: '0 0 20px rgba(13,217,184,0.25)' }}
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
}
