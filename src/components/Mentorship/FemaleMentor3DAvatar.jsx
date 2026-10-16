import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SeatedFemaleMentorModel
 *
 * Highly realistic, human-like female mentor seated at an executive desk:
 * - Natural seated posture with relaxed arms resting on the desk
 * - Continuous subtle breathing loops (chest & shoulders)
 * - Random eye-blinking every 4-6 seconds
 * - Attentive listening head nods & micro-tilts when listening/idle
 * - Multi-viseme audio-paced speech lip-sync with synchronized jaw & head vibrations
 * - Enhanced PBR materials for realistic skin, glossy eyes, sleek glasses, and hair sheen
 */
function SeatedFemaleMentorModel({ isSpeaking = false, isListening = false, isThinking = false }) {
  // Load official female Ready Player Me model with glasses and formal business attire
  const { scene } = useGLTF('/models/female_mentor.glb');

  // Traverse and enhance PBR materials for cinematic human realism
  const rig = useMemo(() => {
    const bones = {};
    const meshes = {};

    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        meshes[child.name] = child;

        // Cinematic Material Enhancements (Skin softness, cornea gloss, metallic frames)
        if (child.material) {
          const mat = child.material;
          if (mat.name === 'Wolf3D_Skin') {
            mat.roughness = 0.55; // Natural human skin texture
            mat.metalness = 0.02;
          } else if (mat.name === 'Wolf3D_Eye' || mat.name === 'EyeLeft' || mat.name === 'EyeRight') {
            mat.roughness = 0.05; // Glossy reflective cornea moisture
            mat.metalness = 0.15;
          } else if (mat.name === 'Wolf3D_Glasses') {
            mat.roughness = 0.08; // Sleek designer metallic frame
            mat.metalness = 0.85;
            mat.transparent = true;
            mat.opacity = 0.92;
          } else if (mat.name === 'Wolf3D_Hair') {
            mat.roughness = 0.45; // Soft natural hair specular highlight
            mat.metalness = 0.06;
          } else if (mat.name === 'Wolf3D_Teeth') {
            mat.roughness = 0.25;
            mat.metalness = 0.0;
          } else if (mat.name?.includes('Outfit') || mat.name === 'Wolf3D_Outfit_Top') {
            mat.roughness = 0.82; // Fine tailored suit fabric
            mat.metalness = 0.04;
          }
          mat.needsUpdate = true;
        }
      }
      if (child.isBone) {
        bones[child.name] = child;
      }
    });

    return { bones, meshes };
  }, [scene]);

  // Random eye blink tracker (every 4-6 seconds)
  const blinkTimerRef = useRef({ nextBlink: 3.5, isBlinking: false });

  // Real-time animation frame loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { bones, meshes } = rig;

    // ── 1. Continuous Subtle Breathing Loops (Chest & Shoulders) ──
    const breatheCycle = Math.sin(t * 1.8);
    const chestRise = breatheCycle * 0.012;
    const shoulderBreath = breatheCycle * 0.008;

    if (bones.Spine) {
      bones.Spine.rotation.x = 0.03 + chestRise; // Gentle chest breathing
      bones.Spine.rotation.z = Math.sin(t * 0.6) * 0.005; // Subtle natural torso sway
    }
    if (bones.Spine1) {
      bones.Spine1.rotation.x = chestRise * 0.8;
    }
    if (bones.Spine2) {
      bones.Spine2.rotation.x = chestRise * 0.6;
    }

    // Gentle shoulder breathing movement
    if (bones.LeftShoulder) {
      bones.LeftShoulder.rotation.z = -shoulderBreath;
    }
    if (bones.RightShoulder) {
      bones.RightShoulder.rotation.z = shoulderBreath;
    }

    // ── 2. Natural Sitting Pose & Relaxed Arms on Desk (No rigid A-pose) ──
    // Relax upper arms comfortably down to the sides and slightly forward
    if (bones.LeftArm) {
      bones.LeftArm.rotation.x = 0.32 + chestRise * 0.5;
      bones.LeftArm.rotation.y = 0.12;
      bones.LeftArm.rotation.z = -0.58;
    }
    if (bones.RightArm) {
      bones.RightArm.rotation.x = 0.32 + chestRise * 0.5;
      bones.RightArm.rotation.y = -0.12;
      bones.RightArm.rotation.z = 0.58;
    }

    // Forearms bent naturally forward resting on the executive desk
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotation.x = 0.72;
      bones.LeftForeArm.rotation.y = 0.28;
      bones.LeftForeArm.rotation.z = -0.18;
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotation.x = 0.72;
      bones.RightForeArm.rotation.y = -0.28;
      bones.RightForeArm.rotation.z = 0.18;
    }

    // Hands relaxed flat on the desk surface
    if (bones.LeftHand) {
      bones.LeftHand.rotation.x = 0.15;
      bones.LeftHand.rotation.y = -0.08;
      bones.LeftHand.rotation.z = -0.05;
    }
    if (bones.RightHand) {
      bones.RightHand.rotation.x = 0.15;
      bones.RightHand.rotation.y = 0.08;
      bones.RightHand.rotation.z = 0.05;
    }

    // ── 3. Head & Gaze: Attentive Listening, Nods & Head Vibrations ──
    if (bones.Head) {
      if (isSpeaking) {
        // Natural head movement & vibrations synchronized to speech cadence
        const speechPitch = Math.sin(t * 8.5) * 0.02 + Math.sin(t * 4.2) * 0.015;
        const speechYaw = Math.sin(t * 2.5) * 0.025;
        const speechRoll = Math.cos(t * 3.8) * 0.01;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, speechPitch, 0.12);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, speechYaw, 0.12);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, speechRoll, 0.12);
      } else if (isListening) {
        // Active attentive nodding loop showing she is engaged with the candidate
        const nodMotion = 0.03 + Math.sin(t * 2.2) * 0.035 + Math.sin(t * 1.1) * 0.015;
        const subtleGazeYaw = Math.sin(t * 0.8) * 0.03;
        const subtleTilt = Math.sin(t * 1.4) * 0.018;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, nodMotion, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, subtleGazeYaw, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, subtleTilt, 0.06);
      } else if (isThinking) {
        // Thoughtful upward-lateral gaze tilt during code evaluation
        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, -0.04, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, 0.05, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, 0.02, 0.06);
      } else {
        // Natural idle eye contact drift facing directly at the student
        const idlePitch = Math.sin(t * 1.2) * 0.018;
        const idleYaw = Math.sin(t * 0.7) * 0.025;
        const idleRoll = Math.sin(t * 0.9) * 0.01;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, idlePitch, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, idleYaw, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, idleRoll, 0.06);
      }
    }

    // ── 4. Random Eye-Blinking Every 4-6 Seconds ──
    const headMesh = meshes.Wolf3D_Head;
    if (headMesh?.morphTargetDictionary && headMesh?.morphTargetInfluences) {
      const dict = headMesh.morphTargetDictionary;
      const influences = headMesh.morphTargetInfluences;

      const blinkLIdx = dict['eyeBlinkLeft'];
      const blinkRIdx = dict['eyeBlinkRight'];

      if (t > blinkTimerRef.current.nextBlink) {
        blinkTimerRef.current.isBlinking = true;
        // Natural human blink duration is ~140ms
        if (t > blinkTimerRef.current.nextBlink + 0.14) {
          blinkTimerRef.current.isBlinking = false;
          // Schedule next blink in 4 to 6 seconds
          blinkTimerRef.current.nextBlink = t + 4.0 + Math.random() * 2.0;
        }
      }

      const blinkValue = blinkTimerRef.current.isBlinking ? 1.0 : 0.0;
      if (blinkLIdx !== undefined) {
        influences[blinkLIdx] = THREE.MathUtils.lerp(influences[blinkLIdx], blinkValue, 0.55);
      }
      if (blinkRIdx !== undefined) {
        influences[blinkRIdx] = THREE.MathUtils.lerp(influences[blinkRIdx], blinkValue, 0.55);
      }

      // ── 5. Human-Like Multi-Viseme Speech Lip-Sync & Jaw Articulation ──
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
        // Natural speech pacing with harmonically varying vowel & consonant open/shut shapes
        const harmonic1 = Math.max(0, Math.sin(t * 14.5));
        const harmonic2 = Math.max(0, Math.cos(t * 10.8));
        const syllablePulse = Math.max(0, Math.sin(t * 7.2));

        const mouthOpen = harmonic1 * 0.68 + syllablePulse * 0.22;
        const mouthRound = harmonic2 * 0.52;
        const mouthWide = Math.max(0, Math.sin(t * 12.4)) * 0.42;

        if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = mouthOpen;
        if (aaIdx !== undefined) influences[aaIdx] = mouthOpen;
        if (oIdx !== undefined) influences[oIdx] = mouthRound;
        if (eIdx !== undefined) influences[eIdx] = mouthWide;
        if (iIdx !== undefined) influences[iIdx] = mouthWide * 0.6;
        if (nnIdx !== undefined) influences[nnIdx] = syllablePulse * 0.25;
        if (silIdx !== undefined) influences[silIdx] = (1 - mouthOpen) * 0.18;

        if (teethInfluences && aaIdx !== undefined) {
          teethInfluences[aaIdx] = mouthOpen * 0.75;
        }

        // Slight conversational smile while speaking
        if (smileLIdx !== undefined) influences[smileLIdx] = 0.22;
        if (smileRIdx !== undefined) influences[smileRIdx] = 0.22;
      } else {
        // Warm, attentive resting smile while listening to student
        const targetSmile = isListening ? 0.35 : 0.22;
        if (smileLIdx !== undefined) {
          influences[smileLIdx] = THREE.MathUtils.lerp(influences[smileLIdx], targetSmile, 0.08);
        }
        if (smileRIdx !== undefined) {
          influences[smileRIdx] = THREE.MathUtils.lerp(influences[smileRIdx], targetSmile, 0.08);
        }

        // Smoothly decay speech visemes back to closed resting mouth
        if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = THREE.MathUtils.lerp(influences[mouthOpenIdx], 0, 0.22);
        if (aaIdx !== undefined) influences[aaIdx] = THREE.MathUtils.lerp(influences[aaIdx], 0, 0.22);
        if (oIdx !== undefined) influences[oIdx] = THREE.MathUtils.lerp(influences[oIdx], 0, 0.22);
        if (eIdx !== undefined) influences[eIdx] = THREE.MathUtils.lerp(influences[eIdx], 0, 0.22);
        if (iIdx !== undefined) influences[iIdx] = THREE.MathUtils.lerp(influences[iIdx], 0, 0.22);
        if (nnIdx !== undefined) influences[nnIdx] = THREE.MathUtils.lerp(influences[nnIdx], 0, 0.22);
        if (silIdx !== undefined) influences[silIdx] = THREE.MathUtils.lerp(influences[silIdx], 1, 0.18);

        if (teethInfluences && aaIdx !== undefined) {
          teethInfluences[aaIdx] = THREE.MathUtils.lerp(teethInfluences[aaIdx], 0, 0.22);
        }
      }
    }
  });

  return (
    /* 
      Root Avatar Model Group:
      - Outer Group: position={[0, -1.6, 0]}, rotation={[0, 0, 0]}, scale={1.8}
      - Inner Model: positioned at [0, -0.63, 0] so the female mentor's face, eyes, and smile
        are centered precisely at world Y = 0.20 looking directly at camera target [0, 0.2, 0]
    */
    <group position={[0, -1.6, 0]} rotation={[0, 0, 0]} scale={1.8}>
      <primitive object={scene} position={[0, -0.63, 0]} />

      {/* ── Executive Seating Environment ── */}
      {/* High-back Executive Ergonomic Chair Backrest */}
      <mesh position={[0, 0.32, -0.24]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.88, 0.09]} />
        <meshStandardMaterial color="#1a1c24" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Executive Headrest */}
      <mesh position={[0, 0.82, -0.22]} castShadow>
        <boxGeometry args={[0.34, 0.18, 0.09]} />
        <meshStandardMaterial color="#12141a" roughness={0.65} metalness={0.2} />
      </mesh>
      {/* Chair Side Ergonomic Wings */}
      <mesh position={[-0.28, 0.22, -0.18]}>
        <boxGeometry args={[0.06, 0.68, 0.16]} />
        <meshStandardMaterial color="#12141a" roughness={0.7} />
      </mesh>
      <mesh position={[0.28, 0.22, -0.18]}>
        <boxGeometry args={[0.06, 0.68, 0.16]} />
        <meshStandardMaterial color="#12141a" roughness={0.7} />
      </mesh>

      {/* Modern Executive Desk Surface (Forearms rest directly on top) */}
      <mesh position={[0, -0.22, 0.36]} receiveShadow>
        <boxGeometry args={[1.6, 0.06, 0.55]} />
        <meshStandardMaterial color="#221812" roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Executive Desk Edge Bevel Accent */}
      <mesh position={[0, -0.22, 0.09]}>
        <boxGeometry args={[1.6, 0.02, 0.02]} />
        <meshStandardMaterial color="#543c2c" roughness={0.4} />
      </mesh>
    </group>
  );
}

// Preload the female mentor model
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
          Initializing 3D Mentor Avatar...
        </span>
      </div>
    </Html>
  );
}

/**
 * FemaleMentor3DAvatar
 *
 * Cinematic Realism & Soft Studio Lighting Setup:
 * - Ambient light 1.5 with warm color
 * - Directional light 2.0 for soft face shadows
 * - Soft back/rim light catching hair detail
 * - Contact shadows and warm desk bounce fill
 * - Waist-up interview camera: position [0, 0.4, 1.8], fov 40
 * - OrbitControls target [0, 0.2, 0] directly framing the face, eyes, and mentor smile
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
          position: [0, 0.4, 1.8], // Exact waist-up camera position requested
          fov: 40,                 // Exact fov requested
          near: 0.1,
          far: 20,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* ── Soft Warm Studio Lighting Setup ── */}
        {/* 1. Warm Ambient Light (Intensity 1.5) */}
        <ambientLight intensity={1.5} color="#fff6ed" />

        {/* 2. Key Directional Light (Intensity 2.0) for soft face shadows */}
        <directionalLight
          position={[1.5, 2.5, 2.0]}
          intensity={2.0}
          color="#fffaf5"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* 3. Soft Left Fill Light */}
        <directionalLight
          position={[-1.8, 1.2, 1.5]}
          intensity={0.9}
          color="#dbeafe"
        />

        {/* 4. Back/Rim Light Catching Hair Detail */}
        <pointLight
          position={[0, 1.8, -1.2]}
          intensity={1.6}
          color="#38bdf8"
          distance={4.0}
        />

        {/* 5. Warm Facial Key Point Light for skin & eye highlights */}
        <pointLight
          position={[0, 0.4, 1.2]}
          intensity={0.8}
          color="#ffedd5"
          distance={3.0}
        />

        {/* 6. Warm Desk Bounce Light */}
        <directionalLight
          position={[0, -0.6, 0.8]}
          intensity={0.45}
          color="#d4a373"
        />

        {/* ── 3D Seated Avatar Model ── */}
        <Suspense fallback={<ModelLoader />}>
          <SeatedFemaleMentorModel
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
          />
        </Suspense>

        {/* ── Soft Floor & Desk Contact Shadows ── */}
        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.65}
          scale={4.0}
          blur={2.2}
          far={2.5}
          color="#000000"
        />

        {/* ── Orbit Controls Centered Directly on Mentor's Face & Upper Body ── */}
        <OrbitControls
          target={[0, 0.2, 0]} // Exact target requested focusing on face & upper body from FRONT
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.7}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
