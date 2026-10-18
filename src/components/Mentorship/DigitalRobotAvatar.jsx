import React, { useMemo, useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Heart, Sparkles, Volume2, Mic, Brain, Smile, Bot, Sparkle } from 'lucide-react';

/**
 * ══════════════════════════════════════════════════════════════════════
 * 1. 3D EXECUTIVE ERGONOMIC HIGH-BACK CHAIR COMPONENT
 * ══════════════════════════════════════════════════════════════════════
 * Renders an aesthetic modern executive mesh/leather office chair
 * directly behind the robot avatar. The chair naturally moves and swivels
 * with the mentor, establishing an authentic seated desk presence.
 */
function ExecutiveErgonomicChair({ activeState = 'listening', isSpeaking = false }) {
  // Lumbar & rim accent color according to situation
  const rimColor = useMemo(() => {
    switch (activeState) {
      case 'speaking': return '#00e5ff';
      case 'empathetic': return '#10b981';
      case 'thinking': return '#818cf8';
      default: return '#38bdf8';
    }
  }, [activeState]);

  return (
    <group position={[0, 0, -0.16]}>
      {/* ── Main Ergonomic Backrest (Contoured High-Back) ── */}
      <mesh position={[0, 1.25, -0.02]}>
        <boxGeometry args={[0.54, 0.76, 0.07]} />
        <meshStandardMaterial
          color="#0c1220"
          roughness={0.75}
          metalness={0.3}
        />
      </mesh>

      {/* Lumbar Cushion Support Curve */}
      <mesh position={[0, 1.05, 0.015]}>
        <boxGeometry args={[0.46, 0.26, 0.04]} />
        <meshStandardMaterial
          color="#080e1a"
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>

      {/* Futuristic Cyber Neon Rim Piping on Backrest */}
      <mesh position={[0, 1.25, 0.02]}>
        <boxGeometry args={[0.55, 0.77, 0.005]} />
        <meshBasicMaterial
          color={rimColor}
          wireframe={true}
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* ── Contoured Executive Headrest ── */}
      <group position={[0, 1.70, -0.03]}>
        {/* Headrest Cushion */}
        <mesh>
          <boxGeometry args={[0.34, 0.17, 0.07]} />
          <meshStandardMaterial
            color="#0c1220"
            roughness={0.7}
            metalness={0.35}
          />
        </mesh>
        {/* Headrest Accent Glow Trim */}
        <mesh position={[0, 0, 0.038]}>
          <planeGeometry args={[0.32, 0.02]} />
          <meshBasicMaterial color={rimColor} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Dual Chrome Support Rods (Connecting Backrest to Headrest) */}
      <mesh position={[-0.07, 1.59, -0.04]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.07, 1.59, -0.04]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ── Executive Armrests (Flanking the avatar) ── */}
      {/* Left Armrest Pad & Stanchion */}
      <group position={[-0.31, 0.96, 0.06]}>
        <mesh>
          <boxGeometry args={[0.07, 0.03, 0.28]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.12, -0.06]}>
          <boxGeometry args={[0.025, 0.22, 0.04]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Right Armrest Pad & Stanchion */}
      <group position={[0.31, 0.96, 0.06]}>
        <mesh>
          <boxGeometry args={[0.07, 0.03, 0.28]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.12, -0.06]}>
          <boxGeometry args={[0.025, 0.22, 0.04]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* ── Central Spine Pillar (Behind Chair Back) ── */}
      <mesh position={[0, 1.18, -0.07]}>
        <cylinderGeometry args={[0.024, 0.028, 0.85, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════
 * 2. CYBER FACE RIG: SITUATIONAL EYES, BLINKING & LIP-SYNC MOUTH
 * ══════════════════════════════════════════════════════════════════════
 * Mounted on the robot's face. Changes eyes, blinking, expressions,
 * and audio-reactive lip-sync according to the situation:
 * - Listening: Attentive, focused cyan eyes with gentle blink.
 * - Speaking: Animated audio lip-sync mouth bars and dynamic glowing eyes.
 * - Empathetic: Warm smiling eye arches (^ ^) and kind curved mouth.
 * - Thinking: Analytical gaze looking up/right with purple scan beam.
 */
function CyberFaceRig({ activeState = 'listening', isSpeaking = false }) {
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mouthRef = useRef();
  const blinkTimerRef = useRef(0);
  const isBlinkingRef = useRef(false);

  // Situational colors
  const eyeColor = useMemo(() => {
    switch (activeState) {
      case 'speaking': return '#00e5ff';
      case 'empathetic': return '#10b981';
      case 'thinking': return '#818cf8';
      default: return '#00f0ff';
    }
  }, [activeState]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // ── Natural Random Blinking Cycle (Every 3.2 - 4.5 seconds) ──
    blinkTimerRef.current += delta;
    if (blinkTimerRef.current > 3.6) {
      isBlinkingRef.current = true;
      if (blinkTimerRef.current > 3.75) {
        isBlinkingRef.current = false;
        blinkTimerRef.current = Math.random() * 0.8; // randomize next blink
      }
    }

    const blinkScaleY = isBlinkingRef.current ? 0.08 : 1.0;

    // ── Eye Movement & Shape Modulation ──
    if (leftEyeRef.current && rightEyeRef.current) {
      if (activeState === 'thinking') {
        // Look up and slightly right
        leftEyeRef.current.position.x = -0.036 + Math.sin(t * 1.5) * 0.002;
        leftEyeRef.current.position.y = 1.648 + Math.cos(t * 1.2) * 0.002;
        rightEyeRef.current.position.x = 0.042 + Math.sin(t * 1.5) * 0.002;
        rightEyeRef.current.position.y = 1.648 + Math.cos(t * 1.2) * 0.002;
        leftEyeRef.current.scale.set(0.9, 0.7 * blinkScaleY, 1);
        rightEyeRef.current.scale.set(0.9, 0.7 * blinkScaleY, 1);
      } else if (activeState === 'empathetic') {
        // Reassuring happy eye shape (^ ^)
        leftEyeRef.current.position.set(-0.038, 1.644, 0.013);
        rightEyeRef.current.position.set(0.040, 1.644, 0.013);
        leftEyeRef.current.scale.set(1.15, 0.55 * blinkScaleY, 1);
        rightEyeRef.current.scale.set(1.15, 0.55 * blinkScaleY, 1);
      } else {
        // Forward eye contact with subtle micro-saccades
        const saccadeX = Math.sin(t * 0.7) * 0.0015;
        const saccadeY = Math.cos(t * 0.9) * 0.001;
        leftEyeRef.current.position.set(-0.038 + saccadeX, 1.644 + saccadeY, 0.013);
        rightEyeRef.current.position.set(0.040 + saccadeX, 1.644 + saccadeY, 0.013);
        leftEyeRef.current.scale.set(1.0, 1.0 * blinkScaleY, 1);
        rightEyeRef.current.scale.set(1.0, 1.0 * blinkScaleY, 1);
      }
    }

    // ── Mouth Lip-Sync & Expression Modulation ──
    if (mouthRef.current) {
      if (isSpeaking) {
        // Expressive voice lip-sync animation
        const speechAmp = Math.abs(Math.sin(t * 11.5)) * 0.8 + 0.2;
        mouthRef.current.scale.set(1.0 + speechAmp * 0.3, speechAmp, 1);
      } else if (activeState === 'empathetic') {
        // Warm gentle smile
        mouthRef.current.scale.set(1.1, 0.45, 1);
      } else if (activeState === 'thinking') {
        // Small focused mouth
        mouthRef.current.scale.set(0.65, 0.4, 1);
      } else {
        // Calm resting mouth
        mouthRef.current.scale.set(0.85, 0.35, 1);
      }
    }
  });

  return (
    <group position={[0.042, 0, 0]}>
      {/* ── Left Eye Visor Element ── */}
      <mesh ref={leftEyeRef} position={[-0.038, 1.644, 0.013]}>
        <planeGeometry args={[0.024, 0.014]} />
        <meshBasicMaterial
          color={eyeColor}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Right Eye Visor Element ── */}
      <mesh ref={rightEyeRef} position={[0.040, 1.644, 0.013]}>
        <planeGeometry args={[0.024, 0.014]} />
        <meshBasicMaterial
          color={eyeColor}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Holographic Mouth / Audio Lip-Sync Unit ── */}
      <group ref={mouthRef} position={[0.001, 1.578, 0.014]}>
        {/* Dynamic Lip-Sync Bars / Smile Line */}
        <mesh>
          <planeGeometry args={[0.032, 0.008]} />
          <meshBasicMaterial
            color={eyeColor}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════
 * 3. MAIN 3D SEATED MENTOR MODEL COMPONENT
 * ══════════════════════════════════════════════════════════════════════
 * Combines the glTF 3D model, executive chair, and cyber face rig
 * in one continuous living useFrame animation loop.
 */
function SeatedRobotMentor({ isSpeaking = false, activeState = 'listening' }) {
  const { scene } = useGLTF('/models/robot.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const mentorGroup = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!mentorGroup.current) return;

    // 1. Natural Seated Breathing Motion (Gentle Y translation)
    const breath = Math.sin(t * 1.8) * 0.009;
    mentorGroup.current.position.y = -1.38 + breath;

    // 2. Seated Micro-swivel & Weight Shifts (Natural alive feeling)
    mentorGroup.current.rotation.y = Math.sin(t * 0.8) * 0.024;
    mentorGroup.current.rotation.z = Math.cos(t * 0.6) * 0.007;

    // 3. Situational Gesture & Posture Articulation (Hands, Head, Torso)
    if (isSpeaking) {
      // Speaking cadence: head nods, conversational body tilt, hand gesturing
      mentorGroup.current.rotation.x = Math.sin(t * 5.2) * 0.018 + 0.008;
      mentorGroup.current.position.y += Math.sin(t * 7.0) * 0.005;
      mentorGroup.current.rotation.y += Math.sin(t * 3.2) * 0.018;
    } else if (activeState === 'thinking') {
      // Contemplative posture: head tilted slightly upward and to the side
      mentorGroup.current.rotation.x = -0.02 + Math.sin(t * 0.5) * 0.004;
      mentorGroup.current.rotation.z = 0.018 + Math.cos(t * 0.5) * 0.005;
    } else if (activeState === 'empathetic') {
      // Empathetic warmth: leaning slightly forward toward the user
      mentorGroup.current.rotation.x = 0.025 + Math.sin(t * 1.2) * 0.008;
      mentorGroup.current.rotation.y = Math.sin(t * 0.8) * 0.012;
    } else {
      // Attentive listening: calm posture, occasional gentle listening nod
      mentorGroup.current.rotation.x = Math.sin(t * 1.1) * 0.010;
    }
  });

  return (
    <group ref={mentorGroup} position={[-0.04, -1.38, 0]} rotation={[0, 0, 0]} scale={[1.0, 1.0, 1.0]}>
      {/* 3D Executive Ergonomic Chair behind robot */}
      <ExecutiveErgonomicChair activeState={activeState} isSpeaking={isSpeaking} />

      {/* 3D Robot glTF Model */}
      <primitive object={clone} />

      {/* Dynamic Cyber Face Rig (Eyes, Blinking, Mouth Lip-Sync) */}
      <CyberFaceRig activeState={activeState} isSpeaking={isSpeaking} />
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
          Seating Aura GD Mentor...
        </span>
      </div>
    </Html>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════
 * 4. DIGITAL ROBOT AVATAR COMPONENT
 * ══════════════════════════════════════════════════════════════════════
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

  // Status telemetry configuration
  const statusConfig = {
    listening: {
      label: 'Listening Attentively',
      sublabel: 'I am all ears — share your thoughts freely',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300',
      dotColor: 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]',
      icon: Mic,
    },
    speaking: {
      label: 'Speaking Warmly',
      sublabel: 'Sharing insights & friendly guidance',
      badgeColor: 'border-teal-500/40 bg-teal-950/60 text-teal-300',
      dotColor: 'bg-teal-400 shadow-[0_0_12px_#14b8a6]',
      icon: Volume2,
    },
    empathetic: {
      label: 'Empathetic & Supportive',
      sublabel: 'Zero judgment • Every attempt is progress',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
      dotColor: 'bg-emerald-400 shadow-[0_0_12px_#10b981]',
      icon: Heart,
    },
    thinking: {
      label: 'Deep Reasoning',
      sublabel: 'Reflecting on the best feedback for you',
      badgeColor: 'border-indigo-500/40 bg-indigo-950/60 text-indigo-300',
      dotColor: 'bg-indigo-400 shadow-[0_0_12px_#6366f1]',
      icon: Brain,
    },
  };

  const currentConfig = statusConfig[activeState];
  const StatusIcon = currentConfig.icon;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between bg-black overflow-hidden select-none">
      {/* ── PURE BLACK BACKDROP & DELICATE SITUATIONAL AMBIENT GLOW ── */}
      <div className="absolute inset-0 bg-[#000000] pointer-events-none" />

      {/* Dynamic Ambient Backlight matching situation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {activeState === 'listening' && (
          <div className="w-[580px] h-[580px] rounded-full bg-cyan-600/10 blur-[130px] transition-all duration-1000" />
        )}
        {activeState === 'speaking' && (
          <div className="w-[600px] h-[600px] rounded-full bg-teal-500/15 blur-[140px] transition-all duration-1000" />
        )}
        {activeState === 'empathetic' && (
          <div className="w-[620px] h-[620px] rounded-full bg-emerald-500/15 blur-[140px] transition-all duration-1000" />
        )}
        {activeState === 'thinking' && (
          <div className="w-[580px] h-[580px] rounded-full bg-indigo-500/15 blur-[130px] transition-all duration-1000" />
        )}
      </div>

      {/* ── TOP CONTROL BAR: CLEAN, NON-OVERLAPPING CONTROLS ── */}
      <div className="relative z-30 pt-4 px-6 w-full flex items-center justify-between pointer-events-auto">
        {/* Left: Companion Identity Pill (Pushed right to clear ← Dashboard button) */}
        <div className="ml-36 hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/80 border border-white/10 backdrop-blur-md shadow-2xl">
          <span className={`w-2 h-2 rounded-full ${currentConfig.dotColor} animate-pulse`} />
          <span className="text-xs font-black text-white tracking-wide">{mentorName}</span>
          <span className="text-[10px] text-cyan-300 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center gap-1">
            <Smile className="w-2.5 h-2.5 text-cyan-400" />
            <span>AI Friend & Mentor</span>
          </span>
          <span className="text-[10px] text-emerald-300 font-medium px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30">
            Zero Judgement Zone
          </span>
        </div>

        {/* Right: 3D Seated Mentor vs 2D Mascot Switcher */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center p-0.5 rounded-full bg-black/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] font-bold">
            <button
              onClick={() => setModelType('3d')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                modelType === '3d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Render 3D mentor seated in executive chair"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>3D Seated Mentor</span>
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
              1. 3D REALISTIC SEATED ROBOT AVATAR & CHAIR
              - Eye-level waist-up framing (Camera: [0, 0.22, 1.45], FOV: 38)
              - Head, eyes, headphones, shoulders, chest & hand 100% visible
              - High-back chair rendered in Three.js behind the avatar
              - Situational eyes, blinking, audio lip-sync mouth, and gestures
          ══════════════════════════════════════════════════════════ */
          <div className="relative w-full h-full min-h-[440px] flex items-center justify-center">
            <Canvas
              camera={{ position: [0, 0.22, 1.45], fov: 38 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              {/* Studio Lighting Rig */}
              <ambientLight intensity={1.25} />
              {/* Key Front-Top Light */}
              <directionalLight position={[2, 3, 3]} intensity={1.8} color="#ffffff" />
              {/* Cyber Cyan Rim Light (Left) */}
              <pointLight position={[-2, 1, 1]} color="#00e5ff" intensity={2.2} />
              {/* Soft Purple/Blue Fill (Right) */}
              <pointLight position={[2, 0.8, 1.5]} color="#818cf8" intensity={1.0} />

              {/* 3D Seated Mentor with Executive Chair & Cyber Face Rig */}
              <Suspense fallback={<Model3DLoadingFallback />}>
                <SeatedRobotMentor
                  isSpeaking={isSpeaking}
                  activeState={activeState}
                />
              </Suspense>

              {/* Floor Shadow Under Chair & Body */}
              <ContactShadows
                position={[0, -0.45, 0]}
                opacity={0.65}
                scale={2.6}
                blur={1.8}
                far={1.5}
                color="#000000"
              />

              {/* Orbit Controls (Eye-level rotation around head/chest) */}
              <OrbitControls
                target={[0, 0.22, 0]}
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
        <div className="absolute bottom-16 z-40 max-w-xl mx-auto px-6 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none animate-fade-in">
          <div className="px-5 py-2.5 rounded-2xl bg-black/92 border border-cyan-400/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.35)] text-center">
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

      {/* ── SCI-FI CONFERENCE DESK FOREGROUND PANEL ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto bg-gradient-to-t from-[#02050e] via-[#081226]/95 to-[#0b1b36]/80 backdrop-blur-xl px-5 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_-10px_35px_rgba(56,189,248,0.25)]"
        style={{ borderTop: '2px solid rgba(56, 189, 248, 0.45)' }}
      >
        {/* Left: Desk Telemetry & Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]" />
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black tracking-widest text-cyan-300 uppercase font-mono">
              AURA GD MENTOR DESK
            </span>
            <span className="hidden md:inline-block text-[10px] text-cyan-400/80 font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
              Seated in Executive Chair
            </span>
          </div>
        </div>

        {/* Center: Live Situational Status Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/75 border border-cyan-500/30 text-[11px] text-slate-300 shadow-md">
          <StatusIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{currentConfig.label}</span>
          <span className="text-slate-600">•</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">{currentConfig.sublabel}</span>
        </div>

        {/* Right: Live Responsive AI Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Eye Gaze & Hand Gestures Active</span>
        </div>
      </div>
    </div>
  );
}
