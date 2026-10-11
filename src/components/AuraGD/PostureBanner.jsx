import React from 'react';

const POSTURE_TIPS = [
  'Face touch na karein',
  'Screen par steady eye contact rakhein',
  'Calm pace mein bolein',
  'Shoulders relax rakhein',
  'Smile naturally karein',
];

/**
 * Posture reminder banner displayed at the top of the right panel.
 * Uses plain ASCII/Unicode characters only — no broken emoji glyphs.
 */
export default function PostureBanner() {
  return (
    <div
      className="px-4 py-2.5 border-b border-amber-900/30 flex items-start gap-2.5 shrink-0"
      style={{ background: 'rgba(120, 53, 15, 0.18)' }}
    >
      {/* Warning icon — plain Unicode, no encoding issues */}
      <span
        className="text-amber-400 text-sm font-bold shrink-0 mt-0.5 select-none"
        aria-label="warning"
      >
        [!]
      </span>

      <div>
        <p className="text-amber-300 text-[11px] font-bold mb-0.5 uppercase tracking-wide">
          Active GD Posture Reminders
        </p>
        <p className="text-amber-200/75 text-[11px] leading-relaxed">
          {POSTURE_TIPS.join(' \u2022 ')}
        </p>
      </div>
    </div>
  );
}
