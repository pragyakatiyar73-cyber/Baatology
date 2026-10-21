import React from 'react';

export default function ControlDock({
  currentMode,
  onSelectMode,
  isListening,
  isSpeaking,
  isConcluding = false,
  onToggleMic,
  cameraActive = false,
  onToggleCamera,
  screenActive = false,
  onToggleScreenShare,
  onEndCall,
  onBackToDashboard,
  audioLevel = 0,
  speechLang = 'hi-IN',
  onToggleLanguage,
  showTextInput = false,
  onToggleTextInput,
  manualInputText = '',
  setManualInputText,
  handleManualTextSubmit,
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-auto max-w-[94vw] select-none">
      {/* ── Interactive Manual Question Typing Bar (Always accessible) ── */}
      {showTextInput && handleManualTextSubmit && (
        <form
          onSubmit={handleManualTextSubmit}
          className="w-full max-w-lg flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/90 border border-cyan-400/60 backdrop-blur-2xl shadow-2xl animate-fade-in"
        >
          <input
            type="text"
            value={manualInputText}
            onChange={(e) => setManualInputText?.(e.target.value)}
            placeholder="Aura se kuch bhi poochhein (Type your question)..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!manualInputText?.trim()}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Ask ➔
          </button>
        </form>
      )}

      {/* ── Control Actions Dock: Mic, Language, Type, Camera & End Session ── */}
      <div className="glass-dock px-4 py-2.5 rounded-3xl flex items-center gap-2 sm:gap-2.5 shadow-2xl bg-black/85 border border-white/15 backdrop-blur-2xl">
        {/* 1. Mic Toggle with Live Audio Level Wave (Listening Indicator) */}
        <button
          onClick={onToggleMic}
          className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            isListening
              ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 mic-listening shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white'
          }`}
          title={isListening ? 'Mute Microphone' : 'Unmute Microphone & Speak'}
        >
          <span className="text-base leading-none">{isListening ? '🎙️' : '🔇'}</span>

          {/* Voice Volume Visualizer Bars */}
          {isListening && (
            <div className="flex items-end gap-[3px] h-3.5 w-4 sm:w-5">
              {[0.4, 0.8, 1.2, 0.7].map((factor, i) => {
                const height = Math.max(3, Math.min(14, Math.round((audioLevel / 100) * 14 * factor)));
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
            {isListening ? (audioLevel > 14 ? 'Speaking...' : 'Listening') : 'Muted'}
          </span>
        </button>

        {/* 2. Direct Language Toggle Button (Hindi / English) - Hidden in Casual Talk */}
        {onToggleLanguage && currentMode !== 'casual' && (
          <button
            onClick={onToggleLanguage}
            className="px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer text-xs font-bold"
            title={`Recognition Language: ${speechLang === 'hi-IN' ? 'Hindi / Hinglish' : 'English'}. Click to toggle.`}
          >
            <span className="text-sm">🌐</span>
            <span className="text-cyan-300 font-bold">{speechLang === 'hi-IN' ? 'Hindi' : 'English'}</span>
          </button>
        )}

        {/* 3. Direct Keyboard / Type Input Button */}
        {onToggleTextInput && (
          <button
            onClick={onToggleTextInput}
            className={`px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer text-xs font-bold ${
              showTextInput
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white'
            }`}
            title={showTextInput ? 'Close text question input' : 'Type a question for Aura with keyboard'}
          >
            <span className="text-sm">💬</span>
            <span className="hidden sm:inline">Type</span>
          </button>
        )}

        <div className="w-[1px] h-6 bg-slate-700/60" />

        {/* 4. Camera Access Toggle Button */}
        <button
          onClick={onToggleCamera}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
            cameraActive
              ? 'bg-teal-500/20 border border-teal-400 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white'
          }`}
          title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera (Webcam Self-View)'}
        >
          <span className="text-base leading-none">{cameraActive ? '📹' : '📷'}</span>
          <span className="text-xs font-bold hidden sm:inline">
            {cameraActive ? 'Camera ON' : 'Camera'}
          </span>
        </button>

        <div className="w-[1px] h-6 bg-slate-700/60" />

        {/* 5. End Session Button */}
        <button
          onClick={onEndCall}
          disabled={isConcluding}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center gap-1.5 text-white shadow-xl transition-all duration-200 cursor-pointer ${
            isConcluding
              ? 'bg-amber-600/80 cursor-wait animate-pulse'
              : 'bg-red-600/95 hover:bg-red-500 active:bg-red-700 shadow-red-600/30 hover:scale-[1.02]'
          }`}
          title={isConcluding ? 'Concluding session...' : 'End Arena Session & View Evaluation Report'}
        >
          <span className="text-base leading-none">{isConcluding ? '⏳' : '📞'}</span>
          <span className="hidden sm:inline">{isConcluding ? 'Concluding...' : 'END'}</span>
          <span className="sm:hidden">{isConcluding ? '...' : 'END'}</span>
        </button>
      </div>
    </div>
  );
}
