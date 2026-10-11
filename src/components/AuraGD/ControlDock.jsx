import React from 'react';
import { MODES } from '../../utils/aiResponses';

export default function ControlDock({
  currentMode,
  onSelectMode,
  isListening,
  isSpeaking,
  onToggleMic,
  cameraActive,
  onToggleCamera,
  screenActive,
  onToggleScreenShare,
  onEndCall,
}) {
  const modes = [
    { id: MODES.PRESENTATION, label: '📽️ Project Presentation' },
    { id: MODES.GD,           label: '🗣️ Group Discussion' },
    { id: MODES.SELF_INTRO,   label: '🎓 Self Introduction' },
    { id: MODES.CASUAL,       label: '☕ Casual Talk' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-auto max-w-[94vw]">
      {/* ── Mode Pill Switcher ── */}
      <div className="glass-dock px-2 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
        {modes.map((m) => {
          const isSelected = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 select-none whitespace-nowrap ${
                isSelected
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Action Buttons Dock ── */}
      <div className="glass-dock px-4 py-2.5 rounded-3xl flex items-center gap-3.5 shadow-2xl">
        {/* Mic Toggle Button */}
        <button
          onClick={onToggleMic}
          className={`relative p-3.5 rounded-2xl flex items-center justify-center transition-all duration-200 select-none ${
            isListening
              ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 mic-listening'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300'
          }`}
          title={isListening ? 'Mute Microphone' : 'Unmute & Speak'}
          aria-label="Microphone"
        >
          <span className="text-xl leading-none">
            {isListening ? '🎙️' : '🔇'}
          </span>
          {isListening && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot" />
          )}
        </button>

        {/* Camera Toggle Button */}
        <button
          onClick={onToggleCamera}
          className={`p-3.5 rounded-2xl flex items-center justify-center transition-all duration-200 select-none ${
            cameraActive
              ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-teal-300'
              : 'bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-400'
          }`}
          title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
          aria-label="Camera"
        >
          <span className="text-xl leading-none">
            {cameraActive ? '📷' : '🚫'}
          </span>
        </button>

        {/* Screen Share Toggle Button */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3.5 rounded-2xl flex items-center justify-center transition-all duration-200 select-none ${
            screenActive
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-lg'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300'
          }`}
          title={screenActive ? 'Stop Screen Share' : 'Share Screen / Slides'}
          aria-label="Screen Share"
        >
          <span className="text-xl leading-none">
            {screenActive ? '🖥️' : '💻'}
          </span>
        </button>

        {/* Subtle Divider */}
        <div className="w-[1px] h-7 bg-slate-700/60 mx-1" />

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="px-5 py-3 rounded-2xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 bg-red-600/90 hover:bg-red-500 active:bg-red-700 text-white shadow-lg transition-all duration-200 select-none"
          title="End Call & Generate Evaluation Report"
        >
          <span className="text-base leading-none">📞</span>
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
}
