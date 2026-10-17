import React, { useMemo } from 'react';
import { Heart, Sparkles, Volume2, Mic, Brain, Shield, Smile } from 'lucide-react';

/**
 * DigitalRobotAvatar
 * 
 * Interactive Digital AI Robot Avatar Companion:
 * - 100% Pure Black Background (#000000) for zero distraction & supreme visual clarity
 * - Fullscreen face-to-face friendly presence ("Amne-samne ek dusre se baat kar rahe hain")
 * - 4 Expressive Emotional States:
 *   1. 'listening'   -> Attentive blue eyes, concentric sound waves, receptive posture
 *   2. 'speaking'    -> Warm smiling tilt, glowing mouth viseme, audio-reactive energy
 *   3. 'empathetic'  -> Hands resting on chest/heart, curved happy eyes (^ _ ^), warm comfort
 *   4. 'thinking'    -> Inquisitive head tilt, cyan sparkle & deep reasoning pulse
 * - Breathing idle motion & ambient particle aura
 * - Zero judgement, safe space for introverts and learners to express mistakes freely
 */
export default function DigitalRobotAvatar({
  avatarState = 'listening', // 'listening' | 'speaking' | 'thinking' | 'empathetic'
  speakingText = '',
  mentorName = 'Aura',
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  emotionalTone = 'warm_encouraging',
}) {
  // Normalize active emotional state
  const activeState = useMemo(() => {
    if (avatarState === 'empathetic' || emotionalTone === 'empathetic') return 'empathetic';
    if (avatarState === 'speaking' || isSpeaking) return 'speaking';
    if (avatarState === 'thinking' || isThinking) return 'thinking';
    return 'listening';
  }, [avatarState, emotionalTone, isSpeaking, isThinking]);

  // Image source mappings for the 4 states
  const robotImages = {
    listening: '/robot/robot_listening.png',
    speaking: '/robot/robot_speaking.png',
    empathetic: '/robot/robot_empathetic.png',
    thinking: '/robot/robot_thinking.png',
  };

  // Status info & empathy tags
  const statusConfig = {
    listening: {
      label: 'Listening Attentively',
      sublabel: 'Share your thoughts freely — I am all ears',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300',
      dotColor: 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]',
      icon: Mic,
    },
    speaking: {
      label: 'Speaking Warmly',
      sublabel: 'Sharing insights & gentle guidance',
      badgeColor: 'border-teal-500/40 bg-teal-950/60 text-teal-300',
      dotColor: 'bg-teal-400 shadow-[0_0_12px_#14b8a6]',
      icon: Volume2,
    },
    empathetic: {
      label: 'Empathetic & Understanding',
      sublabel: 'Zero judgment • Every mistake is a step forward',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
      dotColor: 'bg-emerald-400 shadow-[0_0_12px_#10b981]',
      icon: Heart,
    },
    thinking: {
      label: 'Deep Reasoning',
      sublabel: 'Reflecting on the best way to support you',
      badgeColor: 'border-indigo-500/40 bg-indigo-950/60 text-indigo-300',
      dotColor: 'bg-indigo-400 shadow-[0_0_12px_#6366f1]',
      icon: Brain,
    },
  };

  const currentConfig = statusConfig[activeState];
  const StatusIcon = currentConfig.icon;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      {/* ── PURE BLACK BACKDROP & DELICATE AMBIENT GLOW ── */}
      <div className="absolute inset-0 bg-[#000000] pointer-events-none" />

      {/* Subtle Central Ambient Glow based on Emotional State */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {activeState === 'listening' && (
          <div className="w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[130px] transition-all duration-1000" />
        )}
        {activeState === 'speaking' && (
          <div className="w-[520px] h-[520px] rounded-full bg-teal-500/15 blur-[140px] transition-all duration-1000" />
        )}
        {activeState === 'empathetic' && (
          <div className="w-[540px] h-[540px] rounded-full bg-emerald-500/15 blur-[140px] transition-all duration-1000" />
        )}
        {activeState === 'thinking' && (
          <div className="w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[130px] transition-all duration-1000" />
        )}
      </div>

      {/* ── CONCENTRIC RIPPLE SOUND WAVES (When Listening) ── */}
      {activeState === 'listening' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-80 rounded-full border border-cyan-500/30 animate-robot-ripple pointer-events-none" />
          <div className="w-96 h-96 rounded-full border border-cyan-400/20 animate-robot-ripple-delayed pointer-events-none" />
        </div>
      )}

      {/* ── EMPATHETIC HEART BEAT PULSE (When Empathetic) ── */}
      {activeState === 'empathetic' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 blur-xl animate-heart-beat" />
        </div>
      )}

      {/* ── TOP-CENTER COMPANION IDENTITY & COMFORT PILL ── */}
      <div className="relative z-20 mb-2 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/80 border border-white/10 backdrop-blur-md shadow-2xl">
        <span className={`w-2.5 h-2.5 rounded-full ${currentConfig.dotColor} animate-pulse`} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-white tracking-wide">{mentorName}</span>
          <span className="text-[10px] text-cyan-300 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center gap-1">
            <Smile className="w-2.5 h-2.5 text-cyan-400" />
            <span>AI Friend & Companion</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] text-emerald-300 font-medium px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30">
            Zero Judgement Zone
          </span>
        </div>
      </div>

      {/* ── MAIN DIGITAL ROBOT AVATAR CONTAINER ── */}
      <div className="relative z-10 w-full flex-1 max-w-2xl max-h-[70vh] flex items-center justify-center animate-robot-breathe">
        {/* Layered Cross-fading Avatar Images for Instant, Zero-Lag State Switching */}
        {Object.entries(robotImages).map(([stateKey, src]) => {
          const isCurrent = activeState === stateKey;
          return (
            <div
              key={stateKey}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out pointer-events-none ${
                isCurrent ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-98'
              }`}
            >
              <img
                src={src}
                alt={`AI Robot Companion - ${stateKey}`}
                className="w-auto h-full max-h-[65vh] object-contain drop-shadow-[0_0_35px_rgba(6,182,212,0.35)] filter brightness-105"
                loading="eager"
              />
            </div>
          );
        })}

        {/* Audio Reactive Mouth Glow Effect when Speaking */}
        {activeState === 'speaking' && (
          <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-16 h-8 bg-cyan-400/25 blur-md rounded-full animate-mouth-glow pointer-events-none z-20" />
        )}
      </div>

      {/* ── LIVE SPOKEN SUBTITLES / EMPATHETIC SPEECH POPUP ── */}
      {isSpeaking && speakingText && (
        <div className="relative z-30 max-w-xl mx-auto px-6 mb-3 flex justify-center pointer-events-none animate-fade-in">
          <div className="px-5 py-2.5 rounded-2xl bg-black/90 border border-cyan-400/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.25)] text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block mb-0.5 flex items-center justify-center gap-1.5">
              <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>{mentorName} is speaking</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-cyan-100 leading-relaxed">
              "{speakingText}"
            </p>
          </div>
        </div>
      )}

      {/* ── BOTTOM ACTIVE STATUS TELEMETRY ── */}
      <div className="relative z-20 mb-2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] text-slate-400 backdrop-blur-sm">
        <StatusIcon className="w-3 h-3 text-cyan-400" />
        <span className="font-medium text-slate-300">{currentConfig.label}</span>
        <span className="text-slate-600">•</span>
        <span className="text-[10px] text-slate-400 hidden sm:inline">{currentConfig.sublabel}</span>
      </div>
    </div>
  );
}
