import React from 'react';

/**
 * Subtitle bar shown below the 3D avatar viewport.
 * Displays a synced audio equalizer animation + AI speech caption.
 */
export default function SubtitleBar({ text, isSpeaking }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 border-t border-slate-800 min-h-[48px]">
      {/* Equalizer or static indicator */}
      <div className="shrink-0 flex items-end gap-[3px] h-5 w-8">
        {isSpeaking ? (
          // Animated bars when speaking
          [1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`w-1 rounded-sm bg-teal-400 eq-bar-${n}`}
              style={{ minHeight: '3px' }}
            />
          ))
        ) : (
          // Static idle bars
          [12, 6, 14, 8, 10].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-sm bg-slate-700"
              style={{ height: `${h}px` }}
            />
          ))
        )}
      </div>

      {/* Caption text */}
      <p
        className={`text-[13px] leading-snug line-clamp-2 transition-colors duration-300 ${
          isSpeaking ? 'text-slate-200' : 'text-slate-500'
        }`}
      >
        {text
          ? text
          : isSpeaking
          ? 'Processing...'
          : 'AI Evaluator ready — start the GD to begin.'}
      </p>
    </div>
  );
}
