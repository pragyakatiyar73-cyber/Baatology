import React from 'react';

export default function WebcamPIP({
  videoRef,
  isActive,
  hasPermission,
  screenVideoRef,
  screenActive,
}) {
  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5">
      {/* ── Screen Share PIP Preview (if screen share active) ── */}
      {screenActive && (
        <div
          className="rounded-xl overflow-hidden border border-cyan-500/40 shadow-2xl relative"
          style={{
            width: '180px',
            height: '110px',
            background: '#090e17',
            boxShadow: '0 8px 32px rgba(0, 229, 255, 0.15)',
          }}
        >
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" />
            <span>PRESENTING</span>
          </div>
        </div>
      )}

      {/* ── Candidate Webcam PIP ── */}
      <div
        className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl relative"
        style={{
          width: '154px',
          height: '116px',
          background: '#0a0f1a',
          boxShadow: '0 0 0 1px rgba(13,217,184,0.18), 0 12px 36px rgba(0,0,0,0.65)',
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
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-500 p-2 text-center">
            {hasPermission === false ? (
              <>
                <span className="text-xl">🚫</span>
                <span className="text-[10px] leading-tight">Camera blocked</span>
              </>
            ) : (
              <>
                <span className="text-xl">📷</span>
                <span className="text-[10px]">Camera Off</span>
              </>
            )}
          </div>
        )}

        {isActive && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot" />
            <span className="text-[9px] text-white/90 font-bold tracking-wider">LIVE</span>
          </div>
        )}

        <div className="absolute bottom-1 right-1.5">
          <span className="text-[9px] text-white/70 font-bold bg-black/60 px-1.5 py-0.5 rounded-sm">
            YOU
          </span>
        </div>

        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(13,217,184,0.2)' }}
        />
      </div>
    </div>
  );
}
