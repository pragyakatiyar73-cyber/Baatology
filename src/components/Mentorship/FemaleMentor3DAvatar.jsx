import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SeatedFemaleMentorModel
 *
 * Loads Ready Player Me Photorealistic Female Mentor GLB model (Aurora with formal attire & glasses).
 * Applies natural sitting posture:
 * - Arms resting forward naturally on the executive desk/lap
 * - Thighs and knees bent in natural seated position
 * - Continuous idle breathing & spine sway
 * - Attentive listening head nod and eye contact
 * - Periodic natural eye blinking
 * - Dynamic Oculus viseme speech lip-sync (viseme_aa, viseme_O, viseme_E, mouthOpen, mouthSmile)
 */
function SeatedFemaleMentorModel({ isSpeaking = false, isListening = false, isThinking = false }) {
  // Load local high-resolution female Ready Player Me model from public/models/female_mentor.glb
  const { scene } = useGLTF('/models/female_mentor.glb');

  // Cache bones and meshes
  const rig = useMemo(() => {
    const bones = {};
    const meshes = {};

    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        meshes[child.name] = child;
      }
      if (child.isBone) {
        bones[child.name] = child;
      }
    });

    return { bones, meshes };
  }, [scene]);

  // Blink timing tracker
  const blinkTimerRef = useRef({ nextBlink: 2.5, isBlinking: false });

  // Frame animation loop: Sitting pose + breathing + head movement + lip-sync
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { bones, meshes } = rig;

    // ── 1. Apply Natural Seated Arm & Leg Posture ──
    // Left & Right Upper Legs (Thighs bent forward for sitting)
    if (bones.LeftUpLeg) {
      bones.LeftUpLeg.rotation.x = -1.45;
      bones.LeftUpLeg.rotation.y = 0.12;
      bones.LeftUpLeg.rotation.z = -0.05;
    }
    if (bones.RightUpLeg) {
      bones.RightUpLeg.rotation.x = -1.45;
      bones.RightUpLeg.rotation.y = -0.12;
      bones.RightUpLeg.rotation.z = 0.05;
    }

    // Left & Right Calves / Knees bent downward
    if (bones.LeftLeg) bones.LeftLeg.rotation.x = 1.48;
    if (bones.RightLeg) bones.RightLeg.rotation.x = 1.48;

    // Arms: Relaxed forward resting on desk/lap (no A-pose flare)
    const armBreathe = Math.sin(t * 1.5) * 0.012;
    if (bones.LeftArm) {
      bones.LeftArm.rotation.x = 0.68 + armBreathe;
      bones.LeftArm.rotation.y = 0.22;
      bones.LeftArm.rotation.z = -0.32;
    }
    if (bones.RightArm) {
      bones.RightArm.rotation.x = 0.68 + armBreathe;
      bones.RightArm.rotation.y = -0.22;
      bones.RightArm.rotation.z = 0.32;
    }

    // Forearms: Bent forward onto desk
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotation.x = 0.95;
      bones.LeftForeArm.rotation.y = 0.35;
      bones.LeftForeArm.rotation.z = 0.18;
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotation.x = 0.95;
      bones.RightForeArm.rotation.y = -0.35;
      bones.RightForeArm.rotation.z = -0.18;
    }

    // Hands: Relaxed flat on table
    if (bones.LeftHand) {
      bones.LeftHand.rotation.x = 0.12;
      bones.LeftHand.rotation.y = -0.1;
      bones.LeftHand.rotation.z = -0.05;
    }
    if (bones.RightHand) {
      bones.RightHand.rotation.x = 0.12;
      bones.RightHand.rotation.y = 0.1;
      bones.RightHand.rotation.z = 0.05;
    }

    // ── 2. Subtle Idle Breathing & Natural Spine Sway ──
    if (bones.Spine) {
      bones.Spine.rotation.x = 0.04 + Math.sin(t * 1.5) * 0.015; // Chest rise & fall
      bones.Spine.rotation.z = Math.sin(t * 0.7) * 0.008; // Subtle lateral sway
    }
    if (bones.Spine1) {
      bones.Spine1.rotation.x = Math.sin(t * 1.5) * 0.01;
    }

    // ── 3. Head & Gaze Movement (Attentive Eye Contact) ──
    if (bones.Head) {
      const idleYaw = Math.sin(t * 0.7) * 0.04;
      const idleRoll = Math.sin(t * 0.9) * 0.012;

      if (isListening) {
        // Attentive nodding rhythm when student speaks
        const nod = 0.04 + Math.sin(t * 2.2) * 0.025;
        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, nod, 0.1);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, idleYaw * 0.5, 0.1);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, idleRoll, 0.1);
      } else if (isThinking) {
        // Slight tilt when thinking/evaluating code
        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, -0.05, 0.08);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, 0.06, 0.08);
      } else {
        // Natural posture facing candidate
        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, Math.sin(t * 1.1) * 0.018, 0.1);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, idleYaw, 0.1);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, idleRoll, 0.1);
      }
    }

    // ── 4. Natural Eye Blinking Cycle ──
    const headMesh = meshes.Wolf3D_Head;
    if (headMesh?.morphTargetDictionary && headMesh?.morphTargetInfluences) {
      const dict = headMesh.morphTargetDictionary;
      const influences = headMesh.morphTargetInfluences;

      const blinkLIdx = dict['eyeBlinkLeft'];
      const blinkRIdx = dict['eyeBlinkRight'];

      if (t > blinkTimerRef.current.nextBlink) {
        blinkTimerRef.current.isBlinking = true;
        if (t > blinkTimerRef.current.nextBlink + 0.14) {
          blinkTimerRef.current.isBlinking = false;
          blinkTimerRef.current.nextBlink = t + 3.2 + Math.random() * 2.0;
        }
      }

      const blinkWeight = blinkTimerRef.current.isBlinking ? 1.0 : 0.0;
      if (blinkLIdx !== undefined) influences[blinkLIdx] = THREE.MathUtils.lerp(influences[blinkLIdx], blinkWeight, 0.5);
      if (blinkRIdx !== undefined) influences[blinkRIdx] = THREE.MathUtils.lerp(influences[blinkRIdx], blinkWeight, 0.5);

      // ── 5. Real-Time Speech Lip-Sync (Visemes & Mouth Opening) ──
      const teethMesh = meshes.Wolf3D_Teeth;
      const teethInfluences = teethMesh?.morphTargetInfluences;

      const aaIdx = dict['viseme_aa'];
      const oIdx = dict['viseme_O'];
      const eIdx = dict['viseme_E'];
      const iIdx = dict['viseme_I'];
      const nnIdx = dict['viseme_nn'];
      const silIdx = dict['viseme_sil'];
      const mouthOpenIdx = dict['mouthOpen'];
      const smileLIdx = dict['mouthSmileLeft'];
      const smileRIdx = dict['mouthSmileRight'];

      if (isSpeaking) {
        // Multi-frequency speech harmonic articulation
        const wave1 = Math.max(0, Math.sin(t * 15.5));
        const wave2 = Math.max(0, Math.cos(t * 11.2));
        const pulse = Math.max(0, Math.sin(t * 7.8));

        const mouthOpen = wave1 * 0.75 + pulse * 0.2;
        const mouthRound = wave2 * 0.55;
        const mouthWide = Math.max(0, Math.sin(t * 13)) * 0.45;

        if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = mouthOpen;
        if (aaIdx !== undefined) influences[aaIdx] = mouthOpen;
        if (oIdx !== undefined) influences[oIdx] = mouthRound;
        if (eIdx !== undefined) influences[eIdx] = mouthWide;
        if (iIdx !== undefined) influences[iIdx] = mouthWide * 0.6;
        if (nnIdx !== undefined) influences[nnIdx] = pulse * 0.3;
        if (silIdx !== undefined) influences[silIdx] = (1 - mouthOpen) * 0.2;

        if (teethInfluences && aaIdx !== undefined) teethInfluences[aaIdx] = mouthOpen * 0.8;
      } else {
        // Resting natural smile while listening
        const targetSmile = isListening ? 0.35 : 0.2;
        if (smileLIdx !== undefined) influences[smileLIdx] = THREE.MathUtils.lerp(influences[smileLIdx], targetSmile, 0.1);
        if (smileRIdx !== undefined) influences[smileRIdx] = THREE.MathUtils.lerp(influences[smileRIdx], targetSmile, 0.1);

        if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = THREE.MathUtils.lerp(influences[mouthOpenIdx], 0, 0.25);
        if (aaIdx !== undefined) influences[aaIdx] = THREE.MathUtils.lerp(influences[aaIdx], 0, 0.25);
        if (oIdx !== undefined) influences[oIdx] = THREE.MathUtils.lerp(influences[oIdx], 0, 0.25);
        if (eIdx !== undefined) influences[eIdx] = THREE.MathUtils.lerp(influences[eIdx], 0, 0.25);
        if (iIdx !== undefined) influences[iIdx] = THREE.MathUtils.lerp(influences[iIdx], 0, 0.25);
        if (nnIdx !== undefined) influences[nnIdx] = THREE.MathUtils.lerp(influences[nnIdx], 0, 0.25);
        if (silIdx !== undefined) influences[silIdx] = THREE.MathUtils.lerp(influences[silIdx], 1, 0.2);

        if (teethInfluences && aaIdx !== undefined) teethInfluences[aaIdx] = THREE.MathUtils.lerp(teethInfluences[aaIdx], 0, 0.25);
      }
    }
  });

  return (
    <group position={[0, -0.68, 0]} scale={1.05}>
      <primitive object={scene} />

      {/* ── 3D Executive Office Seating Environment ── */}
      {/* High-back Ergonomic Executive Chair */}
      <mesh position={[0, 0.35, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.85, 0.08]} />
        <meshStandardMaterial color="#1a1c23" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Chair Headrest */}
      <mesh position={[0, 0.84, -0.20]} castShadow>
        <boxGeometry args={[0.34, 0.18, 0.08]} />
        <meshStandardMaterial color="#111317" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Chair Side Cushions */}
      <mesh position={[-0.28, 0.25, -0.16]}>
        <boxGeometry args={[0.06, 0.65, 0.15]} />
        <meshStandardMaterial color="#111317" roughness={0.7} />
      </mesh>
      <mesh position={[0.28, 0.25, -0.16]}>
        <boxGeometry args={[0.06, 0.65, 0.15]} />
        <meshStandardMaterial color="#111317" roughness={0.7} />
      </mesh>

      {/* Modern Executive Desk Surface (Arms rest naturally right on top) */}
      <mesh position={[0, -0.16, 0.36]} receiveShadow>
        <boxGeometry args={[1.5, 0.06, 0.55]} />
        <meshStandardMaterial color="#261b14" roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Desk Edge Accent Bar */}
      <mesh position={[0, -0.16, 0.09]}>
        <boxGeometry args={[1.5, 0.02, 0.02]} />
        <meshStandardMaterial color="#543d2b" roughness={0.4} />
      </mesh>
    </group>
  );
}

// Preload the official female model
useGLTF.preload('/models/female_mentor.glb');

/**
 * 3D Loading Fallback
 */
function ModelLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-black/85 border border-teal-500/40 backdrop-blur-md shadow-2xl text-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-teal-300 tracking-wider">
          Seating 3D Mentor at Desk...
        </span>
      </div>
    </Html>
  );
}

/**
 * FemaleMentor3DAvatar
 *
 * Professional Upper-Body / Waist-Up Camera Setup:
 * - Positioned directly across from student at desk height
 * - Natural sitting posture with arms resting on desk
 * - Studio lighting & soft rim accents
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
        camera={{
          position: [0, 0.44, 1.18], // Professional upper-body / waist-up camera angle
          fov: 33,
          near: 0.1,
          far: 20,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* ── Studio Lighting System ── */}
        <ambientLight intensity={1.35} />

        {/* Key Front Light from Upper-Right */}
        <directionalLight
          position={[1.8, 3.2, 2.5]}
          intensity={1.9}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Soft Left Rim Accent Light */}
        <directionalLight position={[-2.2, 2.0, -1.8]} intensity={1.2} color="#38bdf8" />

        {/* Warm Facial Key Light (brings out natural skin & glasses) */}
        <pointLight position={[0, 0.45, 1.0]} intensity={0.85} color="#fff2e8" />

        {/* Subtle Desk Bounce Fill */}
        <directionalLight position={[0, -0.5, 0.8]} intensity={0.4} color="#d4a373" />

        {/* ── Seated Avatar Model ── */}
        <Suspense fallback={<ModelLoader />}>
          <SeatedFemaleMentorModel
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
          />
        </Suspense>

        {/* Soft Floor & Desk Shadow */}
        <ContactShadows
          position={[0, -0.68, 0]}
          opacity={0.7}
          scale={3.0}
          blur={2.0}
          far={2.5}
          color="#000000"
        />

        {/* Orbit Controls (Centered precisely on mentor's upper-body and face) */}
        <OrbitControls
          target={[0, 0.38, 0]}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.3}
          maxPolarAngle={Math.PI / 1.85}
          minAzimuthAngle={-Math.PI / 8}
          maxAzimuthAngle={Math.PI / 8}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
