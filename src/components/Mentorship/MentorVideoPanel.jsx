import React, { useEffect, useRef } from 'react';
import { Sparkles, Volume2, ShieldCheck, BookOpen, PenTool, Video, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * MentorVideoPanel
 *
 * Real Photorealistic Interactive Human Female Mentor Video Container:
 * - Completely removes any cartoon SVG or 2D vector illustrations
 * - Renders an actual HTML <video> element with autoPlay, playsInline
 * - Directly displays the HeyGen WebRTC video stream attached to videoRef.current.srcObject
 * - Displays active session telemetry, live status badges, and executive desk interface
 */
export default function MentorVideoPanel({
  avatarState = 'listening', // 'speaking' | 'listening' | 'thinking' | 'idle'
  speakingText = '',
  mentorName = 'Dr. Ann Vance',
  mentorRole = 'Staff Software Engineer & Lead Evaluator',
  avatarVideoRef,
  hasLiveWebRTC = false,
  streamError = null,
  onReconnect,
  showCodeOverlay = false,
  codeOverlayComponent = null,
}) {
  const isSpeaking = avatarState === 'speaking';
  const isListening = avatarState === 'listening';
  const isThinking = avatarState === 'thinking';

  // Fallback internal ref if none passed
  const internalVideoRef = useRef(null);
  const activeVideoRef = avatarVideoRef || internalVideoRef;

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#0a0f1d] via-[#0d1628] to-[#080d18] border border-white/10 shadow-2xl flex flex-col justify-between select-none group">
      {/* ── Studio Lighting Atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/4 -left-12 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      {/* ── Top Floating Overlay: Mentor Name & Telemetry Badge ── */}
      <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-md shadow-xl">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]'
                : isListening
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]'
                : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
            }`}
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-wide">{mentorName}</span>
            <span className="text-[10px] text-teal-300 font-semibold px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/40">
              Senior AI Mentor
            </span>
          </div>
        </div>

        {/* Live Status Indicator & HeyGen Stream Telemetry */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-emerald-500/30 backdrop-blur-md text-[11px] font-semibold text-emerald-300 shadow-md">
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>HeyGen Real-Time Video</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSpeaking ? 'Speaking' : isListening ? 'Attentive Listening' : 'Evaluating'}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN REAL VIDEO CONTAINER (NO CARTOON / NO SVG) ── */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Real HTML5 <video> element streaming from WebRTC / HeyGen */}
        <video
          ref={activeVideoRef}
          autoPlay
          playsInline
          muted={false}
          className={`w-full h-full object-cover relative z-10 transition-opacity duration-500 ${
            hasLiveWebRTC ? 'opacity-100 block' : 'hidden'
          }`}
          style={{ width: '100%', height: '100%', display: hasLiveWebRTC ? 'block' : 'none' }}
        />

        {/* ── Error State UI (Displayed if stream fails instead of black screen) ── */}
        {!hasLiveWebRTC && (
          <div className="relative z-20 max-w-md w-[92%] p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-white">HeyGen WebRTC Stream Notice</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Connecting to HeyGen Interactive Avatar endpoint via /api/get-heygen-token.
              </p>
            </div>

            {streamError && (
              <div className="w-full text-left p-3 rounded-xl bg-black/60 border border-red-500/30 text-[11px] font-mono text-red-200 break-words">
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
                  Exact Error Details:
                </span>
                {streamError}
              </div>
            )}

            {onReconnect && (
              <button
                onClick={onReconnect}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        )}

        {/* Live Audio Glow Aura around video border */}
        {hasLiveWebRTC && (
          <div
            className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-500 ${
              isSpeaking
                ? 'ring-2 ring-cyan-500/50 shadow-[inset_0_0_50px_rgba(6,182,212,0.25)]'
                : isListening
                ? 'ring-1 ring-emerald-500/30 shadow-[inset_0_0_30px_rgba(16,185,129,0.15)]'
                : ''
            }`}
          />
        )}

        {/* Dynamic Spoken Dialogue Subtitle Banner */}
        {isSpeaking && speakingText && (
          <div className="absolute bottom-24 left-6 right-6 z-30 flex justify-center pointer-events-none animate-fade-in">
            <div className="max-w-xl px-5 py-2.5 rounded-2xl bg-black/85 border border-cyan-400/40 backdrop-blur-xl shadow-2xl text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block mb-0.5">
                {mentorName} • Real-Time Voice
              </span>
              <p className="text-xs sm:text-sm font-semibold text-cyan-100 leading-relaxed">
                "{speakingText}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Realistic Wooden Executive Desk with Notebook & Evaluation Rubric ── */}
      <div className="relative z-20 w-full h-20 bg-gradient-to-t from-[#0e0c0a] via-[#1a140f] to-[#2c1f16] border-t border-[#4a3625] shadow-2xl flex items-center justify-between px-6 sm:px-10">
        {/* Left Desk Items: Leather Notebook & Metallic Pen */}
        <div className="flex items-center gap-3">
          <div className="w-20 h-12 rounded-lg bg-[#22170f] border border-[#5a3f2b] shadow-xl p-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-1 border-b border-[#432d1d] pb-0.5">
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold text-amber-200">Session Notes</span>
            </div>
            <div className="space-y-0.5">
              <div className="w-12 h-1 bg-amber-400/40 rounded-full" />
              <div className="w-10 h-1 bg-amber-400/30 rounded-full" />
            </div>
          </div>

          <div className="w-1 h-12 bg-gradient-to-b from-slate-200 via-amber-300 to-slate-400 rounded-full shadow-lg transform rotate-12 flex items-center justify-center">
            <PenTool className="w-2.5 h-2.5 text-slate-800 -rotate-45" />
          </div>
        </div>

        {/* Right Desk Item: Evaluation Rubric & Stream Quality */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-[10px] text-slate-300 shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold">Evaluation Rubric: Active • 1080p WebRTC</span>
        </div>
      </div>
    </div>
  );
}
