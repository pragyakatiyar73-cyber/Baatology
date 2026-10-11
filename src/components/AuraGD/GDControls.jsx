import React from 'react';

/**
 * GD control dock — mic toggle, action chips, end GD button.
 */
export default function GDControls({
  isListening,
  isSpeaking,
  onMicToggle,
  onUserStarts,
  onAIStarts,
  onCounterpoint,
  onEndGD,
}) {
  const micDisabled = isSpeaking;

  return (
    <div className="p-3 border-t border-slate-800 bg-[#090e17] space-y-2.5 shrink-0">
      {/* ── Main mic toggle button ── */}
      <button
        onClick={onMicToggle}
        disabled={micDisabled}
        className={`w-full py-3 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200 select-none ${
          isListening
            ? 'bg-teal-500/15 border-2 border-teal-400 text-teal-300 mic-listening'
            : micDisabled
            ? 'bg-slate-800/50 border border-slate-700/50 text-slate-600 cursor-not-allowed opacity-60'
            : 'bg-teal-700 hover:bg-teal-600 active:bg-teal-800 border border-teal-500 text-white shadow-lg'
        }`}
        style={!micDisabled && !isListening ? { boxShadow: '0 0 20px rgba(13,217,184,0.22)' } : {}}
      >
        <span className="text-xl" aria-hidden>
          {isListening ? '\u23F8' : isSpeaking ? '\u{1F916}' : '\u{1F399}'}
        </span>
        <span>
          {isListening
            ? 'Listening...'
            : isSpeaking
            ? 'AI is Speaking...'
            : 'Start Speaking'}
        </span>
        {isListening && (
          <span className="w-2 h-2 rounded-full bg-teal-400 pulse-dot ml-0.5" />
        )}
      </button>

      {/* ── Quick action chips ── */}
      <div className="flex gap-2">
        <button
          onClick={onUserStarts}
          disabled={isSpeaking || isListening}
          className="flex-1 py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg text-[11px] text-slate-300 transition-all duration-150 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span aria-hidden>&#128483;</span>
          <span>I Will Start</span>
        </button>

        <button
          onClick={onAIStarts}
          disabled={isSpeaking || isListening}
          className="flex-1 py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg text-[11px] text-slate-300 transition-all duration-150 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span aria-hidden>&#129302;</span>
          <span>You Start First</span>
        </button>

        <button
          onClick={onCounterpoint}
          disabled={isSpeaking}
          className="flex-1 py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg text-[11px] text-slate-300 transition-all duration-150 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span aria-hidden>&#128161;</span>
          <span>Counter-point</span>
        </button>
      </div>

      {/* ── End GD danger button ── */}
      <button
        onClick={onEndGD}
        className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all duration-200
          bg-red-950/50 hover:bg-red-900/60 active:bg-red-950 border-red-800/50 hover:border-red-700 text-red-400 hover:text-red-300"
      >
        <span className="text-base" aria-hidden>&#128721;</span>
        <span>End GD &amp; Performance Report</span>
      </button>
    </div>
  );
}
