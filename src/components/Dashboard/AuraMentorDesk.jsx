import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, Bot, Volume2, Shield, Activity, MessageCircle } from 'lucide-react';

/**
 * 3D Robot Model Component
 * - Loads /models/robot.glb
 * - Offsets model vertically so only upper body/chest/head is visible ("Seated at Desk" illusion)
 * - Adds natural idle breathing and subtle conversational swaying using useFrame
 */
function RobotModel({ isSpeaking = false }) {
  const { scene } = useGLTF('/models/robot.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef();

  // Subtle conversational idle breathing & head sway
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Natural breathing motion (Y-axis translation)
    const breathOffset = Math.sin(t * 1.6) * 0.014;
    groupRef.current.position.y = -1.06 + breathOffset;

    // Gentle micro-rotation (looking slightly around and breathing)
    groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.035;
    groupRef.current.rotation.x = Math.sin(t * 1.4) * 0.012;
    groupRef.current.rotation.z = Math.cos(t * 1.0) * 0.008;

    // If speaking, add subtle head nod energy
    if (isSpeaking) {
      groupRef.current.position.y += Math.sin(t * 7.0) * 0.008;
      groupRef.current.rotation.x += Math.sin(t * 6.0) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.06, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]}>
      <primitive object={clone} />
    </group>
  );
}

// Preload robot.glb for zero loading latency
useGLTF.preload('/models/robot.glb');

/**
 * Fallback Loader while 3D mesh initializes
 */
function ModelLoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/80 border border-cyan-500/40 backdrop-blur-md shadow-2xl">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] font-bold text-cyan-300 font-mono tracking-wide">
          Initializing Aura GD 3D Robot...
        </span>
      </div>
    </Html>
  );
}

/**
 * AuraMentorDesk
 *
 * 3D AI Robot Mentor sitting naturally behind a futuristic executive desk:
 * 1. "Seated at Desk" camera illusion: Model is positioned lower (y: -1.06) so only
 *    chest/upper body and head are visible, completely concealing legs.
 * 2. Camera set to eye-level conversation posture (fov: 40, lookAt: [0, 0.45, 0]).
 * 3. useFrame subtle idle breathing and ambient floating animation.
 * 4. Futuristic dark desk UI overlay at bottom with neon-blue glowing border labeled:
 *    "AURA GD MENTOR DESK".
 */
export default function AuraMentorDesk({
  onStartTalk,
  isSpeaking = false,
  className = '',
}) {
  return (
    <div
      className={`relative w-full h-[380px] sm:h-[420px] lg:h-[480px] rounded-[32px] overflow-hidden bg-gradient-to-b from-[#070b14] via-[#09101f] to-[#04060d] border border-cyan-500/25 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between select-none group ${className}`}
    >
      {/* ── Ambient Studio Rim Glows ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-cyan-500/15 blur-[90px]" />
        <div className="absolute top-1/3 -left-12 w-64 h-64 rounded-full bg-indigo-500/15 blur-[90px]" />
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full bg-cyan-400/10 blur-[60px]" />
      </div>

      {/* ── Top Floating Telemetry & Status HUD ── */}
      <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-3 pointer-events-auto">
        {/* Mentor Identity Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 border border-cyan-500/30 backdrop-blur-md shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white tracking-wide">AURA GD</span>
            <span className="text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40">
              3D AI Robot Mentor
            </span>
          </div>
        </div>

        {/* Live FPS / 3D Engine Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-slate-300 shadow-md">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>WebGL 3D • 60 FPS</span>
          </div>
        </div>
      </div>

      {/* ── MAIN 3D THREE.JS CANVAS ── */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden z-10 -mb-6">
        <Canvas
          camera={{ position: [0, 0.48, 1.45], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          {/* Studio Lighting Rig */}
          <ambientLight intensity={1.2} />
          {/* Key Light from front-top */}
          <directionalLight position={[2, 3, 3]} intensity={1.8} color="#f0f9ff" />
          {/* Cyan Fill/Rim Light from left */}
          <directionalLight position={[-3, 2, -1]} intensity={2.2} color="#00e5ff" />
          {/* Purple Accent Light from right */}
          <directionalLight position={[3, 1, -1]} intensity={1.6} color="#818cf8" />
          {/* Chest Front Soft Fill */}
          <pointLight position={[0, 0.4, 1.2]} intensity={0.9} color="#e0f2fe" />

          {/* 3D Robot with Idle Breathing */}
          <Suspense fallback={<ModelLoadingFallback />}>
            <RobotModel isSpeaking={isSpeaking} />
          </Suspense>

          {/* Gentle Floor / Desk Contact Shadow */}
          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={0.65}
            scale={2.2}
            blur={1.8}
            far={1.5}
            color="#000000"
          />

          {/* Smooth Subtle Interaction Orbit Control */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2.3}
            maxPolarAngle={Math.PI / 1.9}
            minAzimuthAngle={-Math.PI / 8}
            maxAzimuthAngle={Math.PI / 8}
          />
        </Canvas>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FUTURISTIC DARK OFFICE DESK UI OVERLAY
          - Conceals the lower body completely ("Seated at Desk")
          - Top border has neon-blue glowing border labeled:
            "AURA GD MENTOR DESK"
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-30 w-full bg-gradient-to-t from-[#04060c] via-[#070c18] to-[#0d162b] border-t-2 border-cyan-400 shadow-[0_-6px_30px_rgba(6,182,212,0.55)] px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Desk Telemetry: Holographic Status & Audio Waves */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/20">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-extrabold block">
              Neural Telemetry
            </span>
            <span className="text-xs font-bold text-slate-200 block leading-tight">
              Aura GD Conversational Core
            </span>
          </div>
        </div>

        {/* Center Plaque: Neon-Blue Glowing Desk Label */}
        <div className="px-4 py-1.5 rounded-full bg-black/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs sm:text-sm font-black tracking-widest text-cyan-300 uppercase font-mono">
            AURA GD MENTOR DESK
          </span>
        </div>

        {/* Right Desk Action: Interactive Talk / Consult Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartTalk}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            title="Start conversation with Aura GD"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Talk with Aura</span>
          </button>
        </div>
      </div>
    </div>
  );
}
