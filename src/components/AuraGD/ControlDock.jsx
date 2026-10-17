import React from 'react';

export default function ControlDock({
  currentMode,
  onSelectMode,
  isListening,
  isSpeaking,
  isConcluding = false,
  onToggleMic,
  cameraActive,
  onToggleCamera,
  screenActive,
  onToggleScreenShare,
  onEndCall,
  onBackToDashboard,
  audioLevel = 0,
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-auto max-w-[94vw] select-none">
      {/* ── Minimal Control Actions Dock: Only Listening & End Session ── */}
      <div className="glass-dock px-4 py-2.5 rounded-3xl flex items-center gap-3 shadow-2xl">
        {/* Mic Toggle with Live Audio Level Wave (Listening Indicator) */}
        <button
          onClick={onToggleMic}
          className={`relative px-5 py-2.5 rounded-2xl flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
            isListening
              ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 mic-listening shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300'
          }`}
          title={isListening ? 'Mute Microphone' : 'Unmute & Speak'}
        >
          <span className="text-lg leading-none">{isListening ? '🎙️' : '🔇'}</span>

          {/* Voice Volume Visualizer Bars */}
          {isListening && (
            <div className="flex items-end gap-[3px] h-4 w-6">
              {[0.4, 0.8, 1.2, 0.7].map((factor, i) => {
                const height = Math.max(3, Math.min(16, Math.round((audioLevel / 100) * 16 * factor)));
                return (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-emerald-400 transition-all duration-75"
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          )}

          <span className="text-xs font-bold">
            {isListening ? (audioLevel > 15 ? 'Listening (Voice detected)' : 'Listening...') : 'Muted'}
          </span>
        </button>

        <div className="w-[1px] h-7 bg-slate-700/60" />

        {/* End Session Button */}
        <button
          onClick={onEndCall}
          disabled={isConcluding}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center gap-2 text-white shadow-xl transition-all duration-200 cursor-pointer ${
            isConcluding
              ? 'bg-amber-600/80 cursor-wait animate-pulse'
              : 'bg-red-600/95 hover:bg-red-500 active:bg-red-700 shadow-red-600/30 hover:scale-[1.02]'
          }`}
          title={isConcluding ? 'Concluding session...' : 'End Arena Session & View Evaluation Report'}
        >
          <span className="text-base leading-none">{isConcluding ? '⏳' : '📞'}</span>
          <span>{isConcluding ? 'Concluding...' : 'END SESSION'}</span>
        </button>
      </div>
    </div>
  );
}
