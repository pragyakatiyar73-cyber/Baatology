import React from 'react';
import { Video, VideoOff, AlertCircle, RefreshCw, Eye, UserCheck } from 'lucide-react';

/**
 * Feature 2: Webcam HUD with Corner Brackets, Live Indicator,
 * and Color-Coded Eye Contact & Posture Biomarkers.
 *
 * Strict Rules:
 * - High-contrast text on dark mode.
 * - Green (>=80%), Amber (60-79%), Red (<60%).
 * - No gray on gray.
 * - Honestly labeled as Calibrated / Vision HUD metrics.
 */
export default function WebcamHUD({
  videoRef,
  isActive,
  hasPermission,
  error,
  onRetryPermission,
  eyeContactPct = 88,
  posturePct = 91,
  hasMistake = false,
  alertMessage = null,
}) {
  // Color classification for Eye Contact & Posture
  const getMetricStyle = (val) => {
    if (val >= 80) {
      return {
        text: 'text-emerald-300 font-black',
        bg: 'bg-emerald-950/80 border-emerald-500/60',
        dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
        label: 'Optimal',
      };
    }
    if (val >= 60) {
      return {
        text: 'text-amber-300 font-black',
        bg: 'bg-amber-950/80 border-amber-500/60',
        dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
        label: 'Fair',
      };
    }
    return {
      text: 'text-red-300 font-black',
      bg: 'bg-red-950/80 border-red-500/60',
      dot: 'bg-red-400 shadow-[0_0_8px_#ef4444]',
      label: 'Needs Focus',
    };
  };

  const eyeStyle = getMetricStyle(eyeContactPct);
  const postureStyle = getMetricStyle(posturePct);

  return (
    <div className="relative w-full max-w-[340px] rounded-2xl overflow-hidden bg-[#090e17] border border-slate-700/80 shadow-2xl transition-all duration-300">
      {/* ── Active Video Stream or Fallback ── */}
      <div className="relative w-full h-[225px] sm:h-[240px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Mirrored Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isActive ? 'opacity-100 block' : 'opacity-0 hidden'
          }`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* ── Corner Brackets (Tech HUD Aesthetic) ── */}
        <div className="absolute inset-2 pointer-events-none z-20">
          {/* Top-Left Bracket */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-400/90" />
          {/* Top-Right Bracket */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-400/90" />
          {/* Bottom-Left Bracket */}
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-400/90" />
          {/* Bottom-Right Bracket */}
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-400/90" />
        </div>

        {/* ── Fallback UI: If camera is off or permission was denied ── */}
        {!isActive && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-[#0c1222] select-none">
            {hasPermission === false ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 mb-3 shadow-lg">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-white">Camera Access Denied</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-[240px] leading-relaxed">
                  Please click the lock icon in your browser address bar to allow camera access for vision metrics.
                </p>
                {onRetryPermission && (
                  <button
                    onClick={onRetryPermission}
                    className="mt-3.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40 flex items-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Grant Permission</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 mb-3">
                  <VideoOff className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Camera Standby</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-[220px]">
                  Webcam will mirror your posture once practice session begins.
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Flashing Mistake Warning Overlay ── */}
        {hasMistake && alertMessage && (
          <div className="absolute top-2 left-2 right-2 z-30 pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-red-950/95 border border-red-400 text-white text-[11px] font-black tracking-wide shadow-2xl flex items-center gap-2 animate-bounce">
              <span className="text-amber-400">⚠️</span>
              <span className="truncate">{alertMessage}</span>
            </div>
          </div>
        )}

        {/* ── Top HUD Badges (LIVE & YOU) ── */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          {/* LIVE indicator */}
          <div className="flex items-center gap-1.5 bg-black/85 px-2.5 py-1 rounded-full border border-teal-500/40 backdrop-blur-md shadow-md">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 pulse-dot' : 'bg-slate-500'}`} />
            <span className="text-[10px] text-white font-black tracking-wider uppercase">
              {isActive ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* YOU Label */}
          <div className="bg-black/85 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-md">
            <span className="text-[10px] text-teal-300 font-black tracking-wider uppercase">
              YOU (Candidate)
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom Vision HUD Metrics Panel (High Contrast, Green/Amber/Red) ── */}
      <div className="p-3.5 bg-[#0f172a] border-t border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-200 tracking-wide uppercase flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Vision HUD Metrics</span>
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Calibrated Telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Eye Contact Percentage */}
          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${eyeStyle.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-200 flex items-center gap-1">
                <Eye className="w-3 h-3 text-teal-300" />
                <span>Eye Contact</span>
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${eyeStyle.dot}`} />
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className={`text-xl ${eyeStyle.text}`}>{eyeContactPct}%</span>
              <span className="text-[10px] font-bold text-slate-300">{eyeStyle.label}</span>
            </div>
          </div>

          {/* Posture Percentage */}
          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${postureStyle.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-200 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-teal-300" />
                <span>Posture</span>
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${postureStyle.dot}`} />
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className={`text-xl ${postureStyle.text}`}>{posturePct}%</span>
              <span className="text-[10px] font-bold text-slate-300">{postureStyle.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
