import React, { useState } from 'react';

export default function WebcamPIP({
  videoRef,
  isActive,
  hasPermission,
  screenVideoRef,
  screenActive,
  onToggleCamera,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // If candidate minimized it on dashboard
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all"
          title="Open Video Self-View"
        >
          <span>📷</span>
          <span>Open Self-View</span>
        </button>
      </div>
    );
  }

  const dimensionClass = isExpanded ? 'w-[320px] h-[240px]' : 'w-[230px] h-[172px]';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
      {/* ── Screen Share PIP Preview (if presenting slides) ── */}
      {screenActive && (
        <div
          className="rounded-2xl overflow-hidden border border-cyan-400/50 shadow-2xl relative w-[240px] h-[150px] bg-[#090e17]"
          style={{ boxShadow: '0 8px 32px rgba(0, 229, 255, 0.25)' }}
        >
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/75 px-2 py-0.5 rounded-md text-[10px] font-bold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot" />
            <span>SHARING SCREEN</span>
          </div>
        </div>
      )}

      {/* ── Candidate Webcam Self-View ── */}
      <div
        className={`rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl relative transition-all duration-300 ${dimensionClass}`}
        style={{
          background: '#090e17',
          boxShadow: '0 0 0 1px rgba(20, 184, 166, 0.3), 0 20px 48px rgba(0, 0, 0, 0.8)',
        }}
      >
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 p-4 text-center bg-[#0c1222]">
            <span className="text-2xl">📷</span>
            <span className="text-xs font-bold text-slate-200">Camera Off</span>
            {onToggleCamera && (
              <button
                onClick={onToggleCamera}
                className="mt-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] transition-all"
              >
                Turn On
              </button>
            )}
          </div>
        )}

        {/* Top Controls Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
          {/* Live Indicator */}
          {isActive ? (
            <div className="flex items-center gap-1.5 bg-black/75 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-[10px] text-white font-extrabold tracking-wider">LIVE</span>
            </div>
          ) : (
            <span />
          )}

          {/* Minimize and Resize Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-black/70 hover:bg-black text-white/80 hover:text-white p-1 rounded-md text-[10px] transition-all"
              title={isExpanded ? 'Shrink PIP' : 'Enlarge PIP'}
            >
              {isExpanded ? '↙' : '↗'}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="bg-black/70 hover:bg-black text-white/80 hover:text-white p-1 rounded-md text-[10px] transition-all"
              title="Minimize to button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="absolute bottom-2 right-2">
          <span className="text-[10px] text-white/90 font-bold bg-black/70 px-2 py-0.5 rounded-md border border-white/10">
            YOU
          </span>
        </div>
      </div>
    </div>
  );
}
