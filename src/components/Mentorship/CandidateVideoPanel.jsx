import React, { useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Eye, Activity, User, ShieldCheck } from 'lucide-react';

export default function CandidateVideoPanel({
  stream,
  cameraActive = true,
  micActive = true,
  candidateName = 'Pragya',
  audioLevel = 0,
  eyeContactPct = 92,
  isFloatingPIP = false,
  onTogglePIP,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (isFloatingPIP) {
    return (
      <div className="absolute bottom-24 right-6 z-40 w-64 sm:w-72 h-40 sm:h-44 rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/50 shadow-2xl backdrop-blur-xl group transition-all transform hover:scale-[1.02]">
        {/* Live Video Feed */}
        {cameraActive && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-2">
            <VideoOff className="w-8 h-8 text-slate-600" />
            <span className="text-xs font-semibold">Camera Paused</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 border border-emerald-500/40 text-[10px] font-black text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>LIVE</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-bold text-cyan-300 border border-white/10">
            <Eye className="w-3 h-3" />
            <span>{eyeContactPct}%</span>
          </div>
        </div>

        {/* Bottom Candidate Tag */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-xl backdrop-blur-md">
          <span>{candidateName}</span>
          <div className="flex items-center gap-1.5">
            {micActive ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-400" />
            )}
            <span className="text-[10px] text-slate-300">
              {micActive ? (audioLevel > 15 ? 'Speaking' : 'Mic Live') : 'Muted'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[#0a0f1d] border border-white/10 shadow-2xl flex flex-col justify-between select-none group">
      {/* ── Top Floating Overlay: Live Badge & Telemetry ── */}
      <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-emerald-500/30 backdrop-blur-md shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
            LIVE Candidate Feed
          </span>
        </div>

        {/* Real-time Vision HUD Metrics */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-bold text-cyan-300 backdrop-blur-md shadow-sm">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{eyeContactPct}% Gaze</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-bold text-teal-300 backdrop-blur-md shadow-sm">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Optimal</span>
          </div>
        </div>
      </div>

      {/* ── Candidate Webcam HD Stream ── */}
      <div className="relative flex-1 flex items-center justify-center bg-black/40 overflow-hidden">
        {cameraActive && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">Webcam Paused</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle camera button below to turn your video on
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Floating Bar: Name Tag & Speech Frequency Wave ── */}
      <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
            {candidateName.charAt(0)}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {candidateName}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Candidate • SDE Practice</p>
          </div>
        </div>

        {/* Live Audio Level Visualizer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
          {micActive ? (
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-red-400" />
          )}

          {/* Voice Volume Visualizer Bars */}
          <div className="flex items-end gap-[3px] h-3.5 w-8">
            {[0.4, 0.9, 1.3, 0.7].map((factor, i) => {
              const height = micActive
                ? Math.max(3, Math.min(14, Math.round((audioLevel / 100) * 14 * factor)))
                : 3;
              return (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    micActive && audioLevel > 15 ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>

          <span className="text-[10px] font-bold text-slate-300">
            {micActive ? (audioLevel > 15 ? 'Speaking' : 'Active') : 'Muted'}
          </span>
        </div>
      </div>
    </div>
  );
}
