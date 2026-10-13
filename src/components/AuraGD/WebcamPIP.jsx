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

  // If candidate minimized it
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="px-3.5 py-2 rounded-xl bg-slate-900/95 border border-teal-500/50 text-xs font-bold text-teal-300 hover:text-white shadow-2xl flex items-center gap-2 hover:bg-slate-800 transition-all backdrop-blur-md"
          title="Open Video Self-View"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
          <span>Open Self-View (Camera)</span>
        </button>
      </div>
    );
  }

  const dimensionClass = isExpanded ? 'w-[340px] h-[255px]' : 'w-[240px] h-[180px]';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
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

      {/* ── Candidate Webcam Self-View ── */}
      <div
        className={`rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl relative transition-all duration-300 bg-[#090e17] ${dimensionClass}`}
        style={{
          boxShadow: isActive
            ? '0 0 0 1px rgba(20, 184, 166, 0.4), 0 20px 48px rgba(0, 0, 0, 0.85)'
            : '0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Video Element: ALWAYS kept in DOM so videoRef is never null */}
        <video
          ref={(el) => {
            if (videoRef) videoRef.current = el;
            if (el && stream && isActive && el.srcObject !== stream) {
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
          className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Fallback View if Camera is Off or Permission Denied */}
        {!isActive && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 p-4 text-center bg-[#0c1222]">
            <span className="text-3xl">📷</span>
            <span className="text-xs font-bold text-slate-200">
              {hasPermission === false ? 'Camera Permission Needed' : 'Camera is Off'}
            </span>
            <p className="text-[10px] text-slate-400 max-w-[190px] leading-tight">
              {hasPermission === false
                ? 'Allow camera in browser address bar (lock icon) to enable vision posture evaluation.'
                : 'Click below to activate your webcam stream.'}
            </p>
            {onToggleCamera && (
              <button
                onClick={onToggleCamera}
                className="mt-1 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                {hasPermission === false ? 'Retry Camera' : 'Turn On Camera'}
              </button>
            )}
          </div>
        )}

        {/* Top Controls Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
          {/* Live Indicator */}
          {isActive ? (
            <div className="flex items-center gap-1.5 bg-black/80 px-2.5 py-0.5 rounded-full border border-teal-500/40 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-[10px] text-emerald-300 font-extrabold tracking-wider">LIVE</span>
            </div>
          ) : (
            <span />
          )}

          {/* Minimize and Resize Buttons */}
          <div className="flex items-center gap-1.5 bg-black/60 p-0.5 rounded-lg backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-white/20 text-white/90 p-1 rounded text-xs transition-all"
              title={isExpanded ? 'Shrink to default' : 'Enlarge view'}
            >
              {isExpanded ? '↙' : '↗'}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-red-500/40 text-white/90 p-1 rounded text-xs transition-all"
              title="Minimize to button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <span className="text-[10px] text-slate-200 font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm">
            YOU (Candidate)
          </span>
        </div>
      </div>
    </div>
  );
}
