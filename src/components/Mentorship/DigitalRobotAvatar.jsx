import React, { useMemo, useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Heart, Sparkles, Volume2, Mic, Brain, Shield, Smile, Bot, Maximize2, User } from 'lucide-react';

/**
 * 3D Robot Model Component
 * - Loads /models/robot.glb
 * - Offsets model vertically so it is perfectly centered
 * - Adds natural idle breathing and subtle conversational swaying using useFrame
 */
function Robot3DModel({ isSpeaking = false, viewMode = 'full' }) {
  const { scene } = useGLTF('/models/robot.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Natural breathing motion
    const breath = Math.sin(t * 1.6) * 0.012;
    groupRef.current.position.y = -0.92 + breath;

    // Gentle natural posture sway
    groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.035;
    groupRef.current.rotation.x = Math.sin(t * 1.4) * 0.01;

    // Speaking reaction head and torso nod
    if (isSpeaking) {
      groupRef.current.position.y += Math.sin(t * 7.0) * 0.007;
      groupRef.current.rotation.x += Math.sin(t * 6.0) * 0.016;
      groupRef.current.rotation.y += Math.sin(t * 4.0) * 0.012;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.92, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]}>
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
 * - Supports both 3D Realistic Robot Avatar (/models/robot.glb) and 2D Expressive Mascot
 * - 100% Pure Black Background (#000000) for zero distraction & supreme visual clarity
 * - Fullscreen face-to-face friendly presence ("Amne-samne ek dusre se baat kar rahe hain")
 * - 4 Expressive Emotional States in 2D mode (listening, speaking, empathetic, thinking)
 * - Full 3D WebGL PBR avatar with natural idle breathing, speaking gestures, and camera controls
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
  // Default to '3d' as requested by the user, with option to toggle to '2d'
  const [modelType, setModelType] = useState('3d'); // '3d' | '2d'
  const [viewMode, setViewMode] = useState('full'); // 'full' (full-body standing) | 'waist' (conversational waist-up)

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

        {/* Right: 3D Robot vs 2D Mascot Switcher & View Angle Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher: 3D Robot vs 2D Mascot */}
          <div className="flex items-center p-0.5 rounded-full bg-black/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] font-bold">
            <button
              onClick={() => setModelType('3d')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                modelType === '3d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Render interactive 3D robot model from /models/robot.glb"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>3D Avatar</span>
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

          {/* 3D Framing Toggle (Full Body vs Waist-Up) */}
          {modelType === '3d' && (
            <div className="hidden sm:flex items-center p-0.5 rounded-full bg-black/85 border border-white/10 text-[10px] font-bold backdrop-blur-md">
              <button
                onClick={() => setViewMode('full')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  viewMode === 'full'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Full-body posture view"
              >
                Full Body
              </button>
              <button
                onClick={() => setViewMode('waist')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  viewMode === 'waist'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Conversational waist-up view"
              >
                Waist-Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN AVATAR STAGE (3D CANVAS OR 2D MASCOT) ── */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center overflow-hidden my-auto">
        {modelType === '3d' ? (
          /* ══════════════════════════════════════════════════════════
              1. 3D REALISTIC ROBOT AVATAR (/models/robot.glb)
          ══════════════════════════════════════════════════════════ */
          <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
            <Canvas
              key={viewMode}
              camera={
                viewMode === 'full'
                  ? { position: [0, 0, 2.7], fov: 45 }
                  : { position: [0, 0.42, 1.55], fov: 40 }
              }
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              {/* Studio Lighting Rig */}
              <ambientLight intensity={1.2} />
              {/* Key Light */}
              <directionalLight position={[2, 3, 3]} intensity={1.8} color="#ffffff" />
              {/* Cyan Fill/Rim Light */}
              <directionalLight position={[-3, 2, -1]} intensity={2.3} color="#00e5ff" />
              {/* Blue/Purple Accent Light */}
              <directionalLight position={[3, 1, -1]} intensity={1.6} color="#818cf8" />
              {/* Soft Front Fill */}
              <pointLight position={[0, 0.5, 1.5]} intensity={1.0} color="#e0f2fe" />

              {/* 3D Robot with Idle Breathing and Speaking Reactions */}
              <Suspense fallback={<Model3DLoadingFallback />}>
                <Robot3DModel isSpeaking={isSpeaking} viewMode={viewMode} />
              </Suspense>

              {/* Soft Floor Shadow */}
              <ContactShadows
                position={[0, -0.92, 0]}
                opacity={0.65}
                scale={2.6}
                blur={1.8}
                far={1.5}
                color="#000000"
              />

              {/* Subtle Interactive Rotation */}
              <OrbitControls
                target={viewMode === 'full' ? [0, 0, 0] : [0, 0.42, 0]}
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2.3}
                maxPolarAngle={Math.PI / 1.85}
                minAzimuthAngle={-Math.PI / 6}
                maxAzimuthAngle={Math.PI / 6}
              />
            </Canvas>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════
              2. 2D EXPRESSIVE MASCOT AVATAR
          ══════════════════════════════════════════════════════════ */
          <div className="relative w-full flex-1 max-w-2xl max-h-[70vh] flex items-center justify-center animate-robot-breathe">
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
        <div className="relative z-30 max-w-xl mx-auto px-6 mb-2 flex justify-center pointer-events-none animate-fade-in">
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
      <div className="relative z-20 mb-2 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/75 border border-white/10 text-[11px] text-slate-400 backdrop-blur-md">
        <StatusIcon className="w-3 h-3 text-cyan-400" />
        <span className="font-medium text-slate-300">{currentConfig.label}</span>
        <span className="text-slate-600">•</span>
        <span className="text-[10px] text-slate-400 hidden sm:inline">{currentConfig.sublabel}</span>
      </div>
    </div>
  );
}
