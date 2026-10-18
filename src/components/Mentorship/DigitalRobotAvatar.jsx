import React, { useMemo, useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Heart, Sparkles, Volume2, Mic, Brain, Smile, Bot } from 'lucide-react';

/**
 * 3D Robot Model Component
 * - Loads /models/robot.glb
 * - Seated Desk Framing: Positioned at y: -1.05 and scale: 1.35 so waist/legs are out of view,
 *   centering the chest, arms, shoulders, and head on screen.
 * - Continuous 3D Movement: Idle breathing, gentle side-to-side rotation, and listening/speaking nods.
 */
function Robot3DModel({ isSpeaking = false }) {
  const { scene } = useGLTF('/models/robot.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      // Continuous breathing up & down
      group.current.position.y = -1.05 + Math.sin(t * 2) * 0.015;
      // Gentle side-to-side natural mentor engagement
      group.current.rotation.y = Math.sin(t * 1) * 0.04;
      // Slight forward nod while listening
      group.current.rotation.x = Math.sin(t * 1.5) * 0.02;

      // Conversational speaking dynamics
      if (isSpeaking) {
        group.current.position.y += Math.sin(t * 6.5) * 0.008;
        group.current.rotation.x += Math.sin(t * 5.0) * 0.015;
      }
    }
  });

  return (
    <group ref={group} position={[0, -1.05, 0]} scale={1.35}>
      <primitive object={clone} />
    </group>
  );
}

// Preload 3D model
useGLTF.preload('/models/robot.glb');

/**
 * Fallback Loader while 3D mesh initializes
 */
function Model3DLoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/85 border border-cyan-500/40 backdrop-blur-md shadow-2xl">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] font-bold text-cyan-300 font-mono tracking-wide">
          Loading 3D AI Robot Model...
        </span>
      </div>
    </Html>
  );
}

/**
 * DigitalRobotAvatar
 * 
 * Interactive AI Robot Companion:
 * - Seated Desk Camera Illusion: Close-up Waist-Up Framing (camera: [0, 0.35, 1.8], fov: 38).
 * - Continuous 3D movement inside useFrame (breathing, posture sway, speaking gestures).
 * - Semi-transparent Sci-Fi Desk Foreground at bottom with cyan glow border (border-top: 2px solid rgba(56, 189, 248, 0.5)).
 * - Studio Lighting: Ambient (1.2), Key light ([3, 4, 3], intensity: 1.8), and Cyan rim light ([-2, 1, 1], intensity: 2).
 * - 100% Pure Black Background (#000000) for zero distraction & supreme visual clarity.
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
  const [modelType, setModelType] = useState('3d'); // '3d' | '2d'

  // Normalize active emotional state
  const activeState = useMemo(() => {
    if (avatarState === 'empathetic' || emotionalTone === 'empathetic') return 'empathetic';
    if (avatarState === 'speaking' || isSpeaking) return 'speaking';
    if (avatarState === 'thinking' || isThinking) return 'thinking';
    return 'listening';
  }, [avatarState, emotionalTone, isSpeaking, isThinking]);

  // Image source mappings for 2D states
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
    <div className="relative w-full h-full flex flex-col items-center justify-between bg-black overflow-hidden select-none">
      {/* ── PURE BLACK BACKDROP & DELICATE AMBIENT GLOW ── */}
      <div className="absolute inset-0 bg-[#000000] pointer-events-none" />

      {/* Subtle Central Ambient Glow based on Emotional State */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {activeState === 'listening' && (
          <div className="w-[520px] h-[520px] rounded-full bg-cyan-600/10 blur-[130px] transition-all duration-1000" />
        )}
        {activeState === 'speaking' && (
          <div className="w-[540px] h-[540px] rounded-full bg-teal-500/15 blur-[140px] transition-all duration-1000" />
        )}
        {activeState === 'empathetic' && (
          <div className="w-[560px] h-[560px] rounded-full bg-emerald-500/15 blur-[140px] transition-all duration-1000" />
        )}
        {activeState === 'thinking' && (
          <div className="w-[520px] h-[520px] rounded-full bg-indigo-500/15 blur-[130px] transition-all duration-1000" />
        )}
      </div>

      {/* ── CONCENTRIC RIPPLE SOUND WAVES (When Listening in 2D mode) ── */}
      {modelType === '2d' && activeState === 'listening' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-80 rounded-full border border-cyan-500/30 animate-robot-ripple pointer-events-none" />
          <div className="w-96 h-96 rounded-full border border-cyan-400/20 animate-robot-ripple-delayed pointer-events-none" />
        </div>
      )}

      {/* ── EMPATHETIC HEART BEAT PULSE (When Empathetic in 2D mode) ── */}
      {modelType === '2d' && activeState === 'empathetic' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 blur-xl animate-heart-beat" />
        </div>
      )}

      {/* ── TOP FLOATING CONTROL BAR: IDENTITY BADGE & 3D / 2D SWITCHER ── */}
      <div className="relative z-30 pt-3 px-4 w-full flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Companion Identity Pill */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/80 border border-white/10 backdrop-blur-md shadow-2xl">
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

        {/* Right: 3D Robot vs 2D Mascot Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-full bg-black/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] font-bold">
            <button
              onClick={() => setModelType('3d')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                modelType === '3d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Render interactive 3D robot seated at desk"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>3D Mentor</span>
            </button>
            <button
              onClick={() => setModelType('2d')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                modelType === '2d'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to 2D expressive mascot avatar"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2D Mascot</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN AVATAR STAGE (3D CANVAS OR 2D MASCOT) ── */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center overflow-hidden my-auto">
        {modelType === '3d' ? (
          /* ══════════════════════════════════════════════════════════
              1. 3D REALISTIC ROBOT AVATAR (/models/robot.glb)
              SEATED DESK CAMERA ILLUSION
          ══════════════════════════════════════════════════════════ */
          <div className="relative w-full h-full min-h-[420px] flex items-center justify-center">
            <Canvas
              camera={{ position: [0, 0.35, 1.8], fov: 38 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              {/* Studio Lighting */}
              <ambientLight intensity={1.2} />
              {/* Key light */}
              <directionalLight position={[3, 4, 3]} intensity={1.8} color="#ffffff" />
              {/* Cyber cyan rim light */}
              <pointLight position={[-2, 1, 1]} color="#00e5ff" intensity={2} />
              {/* Soft fill accent */}
              <pointLight position={[2, 0.8, 1.5]} color="#818cf8" intensity={0.9} />

              {/* 3D Robot with Continuous useFrame Movement */}
              <Suspense fallback={<Model3DLoadingFallback />}>
                <Robot3DModel isSpeaking={isSpeaking} />
              </Suspense>

              {/* Soft Floor / Seated Shadow */}
              <ContactShadows
                position={[0, -1.05, 0]}
                opacity={0.6}
                scale={2.6}
                blur={1.8}
                far={1.5}
                color="#000000"
              />

              {/* Smooth eye-level rotation control */}
              <OrbitControls
                target={[0, 0.35, 0]}
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2.3}
                maxPolarAngle={Math.PI / 1.85}
                minAzimuthAngle={-Math.PI / 8}
                maxAzimuthAngle={Math.PI / 8}
              />
            </Canvas>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════
              2. 2D EXPRESSIVE MASCOT AVATAR
          ══════════════════════════════════════════════════════════ */
          <div className="relative w-full flex-1 max-w-2xl max-h-[70vh] flex items-center justify-center animate-robot-breathe pb-16">
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
        )}
      </div>

      {/* ── LIVE SPOKEN SUBTITLES / EMPATHETIC SPEECH POPUP ── */}
      {isSpeaking && speakingText && (
        <div className="absolute bottom-20 z-40 max-w-xl mx-auto px-6 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none animate-fade-in">
          <div className="px-5 py-2.5 rounded-2xl bg-black/90 border border-cyan-400/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.35)] text-center">
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

      {/* ── SCI-FI DESK FOREGROUND (SEATED DESK ILLUSION) ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto bg-gradient-to-t from-[#02050e] via-[#081226]/95 to-[#0b1b36]/80 backdrop-blur-xl px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_-10px_35px_rgba(56,189,248,0.25)]"
        style={{ borderTop: '2px solid rgba(56, 189, 248, 0.5)' }}
      >
        {/* Left: Desk Telemetry & Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]" />
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black tracking-widest text-cyan-300 uppercase font-mono">
              AURA GD MENTOR DESK
            </span>
            <span className="hidden md:inline-block text-[10px] text-cyan-400/80 font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
              Live Seated Session
            </span>
          </div>
        </div>

        {/* Center: Live Status Telemetry */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/75 border border-cyan-500/30 text-[11px] text-slate-300 shadow-md">
          <StatusIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{currentConfig.label}</span>
          <span className="text-slate-600">•</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">{currentConfig.sublabel}</span>
        </div>

        {/* Right: Camera Eye-Level Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Eye-Level Seated Posture</span>
        </div>
      </div>
    </div>
  );
}
