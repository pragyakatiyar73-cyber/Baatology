import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * AvatarModel
 *
 * Loads Ready Player Me 3D Photorealistic Female Mentor GLB model
 * with 15 standard Oculus facial visemes / morph targets.
 * Features:
 * - Subtle natural breathing and posture sway
 * - Attentive listening head nod and eye contact
 * - Real-time speech-synchronized lip-sync animation (viseme_aa, viseme_O, viseme_E)
 */
function AvatarModel({ isSpeaking = false, isListening = false, isThinking = false }) {
  // Load local model from public/models/female_mentor.glb
  const { scene } = useGLTF('/models/female_mentor.glb');

  // Cache bone & mesh references
  const { headMesh, teethMesh, headBone, spineBone, neckBone } = useMemo(() => {
    let head = null;
    let teeth = null;
    let hBone = null;
    let sBone = null;
    let nBone = null;

    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.name === 'Wolf3D_Head') head = child;
        if (child.name === 'Wolf3D_Teeth') teeth = child;
      }
      if (child.isBone) {
        if (child.name === 'Head') hBone = child;
        if (child.name === 'Spine' || child.name === 'Spine1') sBone = child;
        if (child.name === 'Neck') nBone = child;
      }
    });

    return {
      headMesh: head,
      teethMesh: teeth,
      headBone: hBone,
      spineBone: sBone,
      neckBone: nBone,
    };
  }, [scene]);

  // Frame animation loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // ── 1. Subtle Idle Breathing & Natural Posture Sway ──
    if (spineBone) {
      spineBone.rotation.x = Math.sin(t * 1.5) * 0.018; // Breathing rise & fall
      spineBone.rotation.z = Math.sin(t * 0.8) * 0.008; // Subtle lateral posture sway
    }

    // ── 2. Attentive Listening & Head Micro-Movements ──
    if (headBone) {
      // Natural gaze drifting slightly while maintaining eye contact
      const idleYaw = Math.sin(t * 0.7) * 0.04;
      const idleRoll = Math.sin(t * 0.9) * 0.015;

      if (isListening) {
        // Attentive nodding rhythm when listening to student
        const nod = 0.035 + Math.sin(t * 2.2) * 0.03;
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, nod, 0.1);
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, idleYaw * 0.5, 0.1);
        headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, idleRoll, 0.1);
      } else if (isThinking) {
        // Slight tilt upward when analyzing code or response
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, -0.06, 0.08);
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, 0.08, 0.08);
      } else {
        // Normal conversational head motion
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, Math.sin(t * 1.1) * 0.02, 0.1);
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, idleYaw, 0.1);
        headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, idleRoll, 0.1);
      }
    }

    // ── 3. Real-Time Lip-Sync via Oculus Visemes ──
    if (headMesh?.morphTargetDictionary && headMesh?.morphTargetInfluences) {
      const dict = headMesh.morphTargetDictionary;
      const influences = headMesh.morphTargetInfluences;
      const teethInfluences = teethMesh?.morphTargetInfluences;

      const aaIdx = dict['viseme_aa'];
      const oIdx = dict['viseme_O'];
      const eIdx = dict['viseme_E'];
      const iIdx = dict['viseme_I'];
      const nnIdx = dict['viseme_nn'];
      const silIdx = dict['viseme_sil'];

      if (isSpeaking) {
        // Dynamic multi-harmonic speech articulation cadence
        const speechOsc1 = Math.max(0, Math.sin(t * 15));
        const speechOsc2 = Math.max(0, Math.cos(t * 11));
        const speechPulse = Math.max(0, Math.sin(t * 7.5));

        const mouthOpen = speechOsc1 * 0.75 + speechPulse * 0.2;
        const mouthRound = speechOsc2 * 0.55;
        const mouthWide = Math.max(0, Math.sin(t * 13)) * 0.45;

        // Apply to Head mesh morph targets
        if (aaIdx !== undefined) influences[aaIdx] = mouthOpen;
        if (oIdx !== undefined) influences[oIdx] = mouthRound;
        if (eIdx !== undefined) influences[eIdx] = mouthWide;
        if (iIdx !== undefined) influences[iIdx] = mouthWide * 0.6;
        if (nnIdx !== undefined) influences[nnIdx] = speechPulse * 0.3;
        if (silIdx !== undefined) influences[silIdx] = (1 - mouthOpen) * 0.2;

        // Apply to Teeth mesh morph targets
        if (teethInfluences && aaIdx !== undefined) {
          teethInfluences[aaIdx] = mouthOpen * 0.8;
        }
      } else {
        // Smoothly decay all mouth morph targets back to resting smile / neutral
        if (aaIdx !== undefined) influences[aaIdx] = THREE.MathUtils.lerp(influences[aaIdx], 0, 0.25);
        if (oIdx !== undefined) influences[oIdx] = THREE.MathUtils.lerp(influences[oIdx], 0, 0.25);
        if (eIdx !== undefined) influences[eIdx] = THREE.MathUtils.lerp(influences[eIdx], 0, 0.25);
        if (iIdx !== undefined) influences[iIdx] = THREE.MathUtils.lerp(influences[iIdx], 0, 0.25);
        if (nnIdx !== undefined) influences[nnIdx] = THREE.MathUtils.lerp(influences[nnIdx], 0, 0.25);
        if (silIdx !== undefined) influences[silIdx] = THREE.MathUtils.lerp(influences[silIdx], 1, 0.2);

        if (teethInfluences && aaIdx !== undefined) {
          teethInfluences[aaIdx] = THREE.MathUtils.lerp(teethInfluences[aaIdx], 0, 0.25);
        }
      }
    }
  });

  return (
    <group position={[0, -1.48, 0]} scale={1.05}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the model so rendering is instant
useGLTF.preload('/models/female_mentor.glb');

/**
 * 3D Loading Fallback Indicator
 */
function ModelLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-black/80 border border-teal-500/30 backdrop-blur-md shadow-2xl text-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-teal-300 tracking-wider">
          Initializing 3D Mentor Avatar...
        </span>
      </div>
    </Html>
  );
}

/**
 * FemaleMentor3DAvatar
 *
 * Full 3D Interactive Canvas Container
 */
export default function FemaleMentor3DAvatar({
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mentorName = 'Dr. Ann Vance',
}) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#090e1a] via-[#0d1627] to-[#070b13] flex items-center justify-center select-none">
      <Canvas
        shadows
        camera={{ position: [0, 0.22, 1.35], fov: 36 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* ── Studio Lighting System ── */}
        <ambientLight intensity={1.3} />
        
        {/* Main Front Key Light */}
        <directionalLight
          position={[1.5, 3, 2.5]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Subtle Cyan Rim Backlight */}
        <directionalLight position={[-2, 2, -2]} intensity={1.1} color="#38bdf8" />

        {/* Warm Facial Key Light */}
        <pointLight position={[0, 0.35, 1.2]} intensity={0.8} color="#ffeede" />

        {/* Ambient Floor Fill */}
        <directionalLight position={[0, -1, 1]} intensity={0.4} color="#64748b" />

        {/* ── Suspended 3D Model with Visemes ── */}
        <Suspense fallback={<ModelLoader />}>
          <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.08}>
            <AvatarModel
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={isThinking}
            />
          </Float>
        </Suspense>

        {/* Soft Contact Floor Shadow */}
        <ContactShadows
          position={[0, -1.48, 0]}
          opacity={0.65}
          scale={3.5}
          blur={2.0}
          far={3.0}
          color="#000000"
        />

        {/* Smooth Orbit Controls with Gaze Centering */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.3}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
