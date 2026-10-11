import React, { useState } from 'react';

/**
 * High-definition enlarged webcam Picture-in-Picture feed.
 * Increased size for clear candidate self-monitoring and eye contact verification.
 */
export default function WebcamPIP({
  videoRef,
  isActive,
  hasPermission,
  screenVideoRef,
  screenActive,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Large default size (260x195), expandable to (340x255)
  const widthClass = isExpanded ? 'w-[340px] h-[255px]' : 'w-[250px] h-[188px]';

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3 select-none">
      {/* ── Screen Share PIP Preview (if presenting) ── */}
      {screenActive && (
        <div
          className="rounded-2xl overflow-hidden border border-cyan-400/50 shadow-2xl relative w-[240px] h-[150px] bg-[#090e17]"
          style={{ boxShadow: '0 8px 32px rgba(0, 229, 255, 0.2)' }}
        >
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 px-2 py-0.5 rounded-md text-[10px] font-bold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot" />
            <span>PRESENTING SLIDES</span>
          </div>
        </div>
      )}

      {/* ── Candidate Webcam Main Feed (Enlarged Size) ── */}
      <div
        className={`rounded-2xl overflow-hidden border border-slate-700/70 shadow-2xl relative transition-all duration-300 ${widthClass}`}
        style={{
          background: '#090e17',
          boxShadow: '0 0 0 1px rgba(13,217,184,0.25), 0 16px 48px rgba(0,0,0,0.75)',
        }}
      >
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror view for natural reflection
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 p-3 text-center bg-[#070b12]">
            {hasPermission === false ? (
              <>
                <span className="text-3xl">🚫</span>
                <span className="text-xs font-semibold">Camera Access Blocked</span>
                <span className="text-[10px] text-slate-500">Allow camera permission in browser</span>
              </>
            ) : (
              <>
                <span className="text-3xl">📷</span>
                <span className="text-xs font-semibold">Camera Off</span>
                <span className="text-[10px] text-slate-500">Toggle camera to enable</span>
              </>
            )}
          </div>
        )}

        {/* Live Indicator Pill */}
        {isActive && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
            <span className="text-[10px] text-white font-extrabold tracking-wider">LIVE</span>
          </div>
        )}

        {/* Resize / Expand Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white/80 hover:text-white p-1 rounded-md text-[10px] transition-all"
          title={isExpanded ? 'Shrink PIP' : 'Enlarge PIP'}
        >
          {isExpanded ? '↙' : '↗'}
        </button>

        {/* Candidate Identifier Badge */}
        <div className="absolute bottom-2 right-2.5">
          <span className="text-[10px] text-white/90 font-bold bg-black/70 px-2 py-0.5 rounded-md border border-white/10">
            YOU
          </span>
        </div>

        {/* Glowing border outline */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(13,217,184,0.3)' }}
        />
      </div>
    </div>
  );
}
