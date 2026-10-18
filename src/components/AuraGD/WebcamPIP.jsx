import React, { useState, useEffect } from 'react';

export default function WebcamPIP({
  videoRef,
  stream,
  isActive,
  hasPermission,
  error,
  screenVideoRef,
  screenActive,
  onToggleCamera,
  hasMistake = false,
  alert = null,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Ensure video element always binds to stream as soon as it mounts or stream arrives
  useEffect(() => {
    if (videoRef?.current && stream && isActive) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [stream, isActive, videoRef]);

  // If camera is turned off or candidate minimized it, show clean floating trigger button
  if (!isActive || isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {hasPermission === false && (
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/90 border border-amber-500/50 text-[11px] font-bold text-amber-200 shadow-xl backdrop-blur-md max-w-xs text-right">
            ⚠️ Click lock/tune icon in browser address bar to allow Camera.
          </div>
        )}
        <button
          onClick={() => {
            if (!isActive && onToggleCamera) {
              onToggleCamera();
            }
            setIsMinimized(false);
          }}
          className={`px-4 py-2.5 rounded-2xl border text-xs font-bold shadow-2xl flex items-center gap-2.5 transition-all backdrop-blur-md cursor-pointer ${
            isActive
              ? 'bg-slate-900/90 hover:bg-slate-800 border-teal-500/50 text-teal-300 hover:text-white'
              : 'bg-teal-950/90 hover:bg-teal-900 border-teal-400/60 text-teal-200 hover:text-white hover:scale-105'
          }`}
          title={isActive ? 'Open Self-View Camera Window' : 'Turn On Webcam Self-View'}
        >
          <span className="text-base leading-none">{isActive ? '📹' : '📷'}</span>
          <span>{isActive ? 'Open Camera PIP' : 'Enable Camera View'}</span>
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 pulse-dot' : 'bg-teal-400/60'}`} />
        </button>
      </div>
    );
  }

  const dimensionClass = isExpanded ? 'w-[360px] h-[270px]' : 'w-[240px] h-[180px]';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 select-none">
      {/* ── Screen Share PIP Preview (if presenting slides) ── */}
      {screenActive && (
        <div
          className="rounded-2xl overflow-hidden border border-cyan-400/60 shadow-2xl relative w-[250px] h-[156px] bg-[#090e17]"
          style={{ boxShadow: '0 8px 32px rgba(0, 229, 255, 0.3)' }}
        >
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot" />
            <span>SHARING SCREEN</span>
          </div>
        </div>
      )}

      {/* ── Feature 3: Non-Intrusive HUD Warning Badge above PIP ── */}
      {hasMistake && alert && (
        <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/95 via-red-950/90 to-amber-950/95 border border-amber-500/80 text-amber-200 text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2 backdrop-blur-md animate-bounce">
          <span>⚠️</span>
          <span>{alert}</span>
        </div>
      )}

      {/* ── Candidate Webcam Self-View with Flashing Amber/Red Neon Border on Mistake ── */}
      <div
        className={`rounded-2xl overflow-hidden shadow-2xl relative transition-all duration-300 bg-[#090e17] ${dimensionClass} ${
          hasMistake
            ? 'border-2 border-amber-400 animate-pulse'
            : 'border border-slate-700/80'
        }`}
        style={{
          boxShadow: hasMistake
            ? '0 0 25px rgba(245, 158, 11, 0.7), 0 0 45px rgba(239, 68, 68, 0.45)'
            : '0 0 0 1px rgba(20, 184, 166, 0.4), 0 20px 48px rgba(0, 0, 0, 0.85)',
        }}
      >
        {/* Video Element: ALWAYS kept in DOM and plays stream */}
        <video
          ref={(el) => {
            if (videoRef) videoRef.current = el;
            if (el && stream && el.srcObject !== stream) {
              el.srcObject = stream;
              el.play().catch(() => {});
            }
          }}
          autoPlay
          muted
          playsInline
          onLoadedMetadata={() => {
            if (videoRef?.current) {
              videoRef.current.play().catch(() => {});
            }
          }}
          className="w-full h-full object-cover block"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Top Controls Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 bg-black/80 px-2.5 py-0.5 rounded-full border border-teal-500/40 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-[10px] text-emerald-300 font-extrabold tracking-wider">YOU (LIVE)</span>
          </div>

          {/* Minimize and Resize Buttons */}
          <div className="flex items-center gap-1.5 bg-black/60 p-0.5 rounded-lg backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-white/20 text-white/90 p-1 rounded text-xs transition-all cursor-pointer"
              title={isExpanded ? 'Shrink view' : 'Enlarge view'}
            >
              {isExpanded ? '↙' : '↗'}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-red-500/40 text-white/90 p-1 rounded text-xs transition-all cursor-pointer"
              title="Minimize camera view"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <span className="text-[10px] text-slate-200 font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm">
            Webcam Feed
          </span>
        </div>
      </div>
    </div>
  );
}
