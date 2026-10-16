import React from 'react';
import { MODES } from '../../utils/aiResponses';

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
  const modes = [
    { id: MODES.PRESENTATION, label: '📽️ Project Presentation' },
    { id: MODES.GD,           label: '🗣️ Group Discussion' },
    { id: MODES.SELF_INTRO,   label: '🎯 Self Introduction' },
    { id: MODES.CASUAL,       label: '☕ Casual Talk' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-auto max-w-[94vw] select-none">
      {/* ── Main Control Actions Dock ── */}
      <div className="glass-dock px-4 py-2.5 rounded-3xl flex items-center gap-3 shadow-2xl">
        {/* Back to Dashboard Button */}
        <button
          onClick={onBackToDashboard}
          className="px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all"
          title="Return to Dashboard"
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </button>

        <div className="w-[1px] h-7 bg-slate-700/60" />

        {/* Mic Toggle with Live Audio Level Wave */}
        <button
          onClick={onToggleMic}
          className={`relative px-4 py-2.5 rounded-2xl flex items-center gap-2.5 transition-all duration-200 ${
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

        {/* Camera Toggle Button */}
        <button
          onClick={onToggleCamera}
          className={`p-3 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            cameraActive
              ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-teal-300'
              : 'bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-400'
          }`}
          title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          <span className="text-lg leading-none">{cameraActive ? '📷' : '🚫'}</span>
        </button>

        {/* Screen Share Button */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            screenActive
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-lg'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300'
          }`}
          title={screenActive ? 'Stop Screen Share' : 'Share Screen / Slides'}
        >
          <span className="text-lg leading-none">{screenActive ? '🖥️' : '💻'}</span>
        </button>

        <div className="w-[1px] h-7 bg-slate-700/60" />

        {/* End Arena & Performance Report Button */}
        <button
          onClick={onEndCall}
          disabled={isConcluding}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center gap-2 text-white shadow-xl transition-all duration-200 ${
            isConcluding
              ? 'bg-amber-600/80 cursor-wait animate-pulse'
              : 'bg-red-600/90 hover:bg-red-500 active:bg-red-700 cursor-pointer'
          }`}
          title={isConcluding ? 'Concluding session...' : 'End Arena Session & View Evaluation Report'}
        >
          <span className="text-base leading-none">{isConcluding ? '⏳' : '📞'}</span>
          <span>{isConcluding ? 'Concluding...' : 'End Call'}</span>
        </button>
      </div>
    </div>
  );
}
