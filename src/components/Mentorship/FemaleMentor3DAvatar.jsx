import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SeatedFemaleMentorModel
 *
 * Cinematic Photorealistic Female Mentor:
 * - Natural waist-up seated desk posture with relaxed arms
 * - Realistic PBR skin, specular eye moisture, sleek metallic glasses & hair sheen
 * - Continuous subtle chest/shoulder breathing
 * - Random natural eye-blinking every 4-6 seconds
 * - Attentive listening head tilt & empathetic resting smile
 * - Dynamic speech lip-sync with synchronized head and jaw vibrations
 */
function SeatedFemaleMentorModel({ isSpeaking = false, isListening = false, isThinking = false }) {
  // Load local high-resolution female Ready Player Me model (Aurora with formal blazer & glasses)
  const { scene } = useGLTF('/models/female_mentor.glb');

  // Traverse meshes and enhance materials for cinematic human realism
  const rig = useMemo(() => {
    const bones = {};
    const meshes = {};

    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        meshes[child.name] = child;

        // Hide footwear so shoes can never accidentally poke up
        if (child.name === 'Wolf3D_Outfit_Footwear') {
          child.visible = false;
        }

        // Cinematic Material Enhancements (Skin softness, cornea gloss, metallic frames)
        if (child.material) {
          const mat = child.material;
          if (mat.name === 'Wolf3D_Skin') {
            mat.roughness = 0.62; // Soft human skin matte texture
            mat.metalness = 0.0;
            mat.color = new THREE.Color('#fdede2'); // Warm, healthy human skin tone
          } else if (mat.name === 'Wolf3D_Eye' || mat.name === 'EyeLeft' || mat.name === 'EyeRight') {
            mat.roughness = 0.05; // Moist reflective cornea
            mat.metalness = 0.15;
          } else if (mat.name === 'Wolf3D_Glasses') {
            mat.roughness = 0.12;
            mat.metalness = 0.85; // Designer executive titanium glasses frame
            mat.color = new THREE.Color('#1e2430');
            mat.transparent = true;
            mat.opacity = 0.95;
          } else if (mat.name === 'Wolf3D_Hair') {
            mat.roughness = 0.48; // Rich natural hair with soft specular highlight
            mat.metalness = 0.12;
            mat.color = new THREE.Color('#221a15');
          } else if (mat.name === 'Wolf3D_Teeth') {
            mat.roughness = 0.22;
            mat.metalness = 0.0;
            mat.color = new THREE.Color('#fcfbf7');
          } else if (mat.name?.includes('Outfit') || mat.name === 'Wolf3D_Outfit_Top' || mat.name === 'Wolf3D_Body') {
            mat.roughness = 0.88; // Professional executive blazer fabric
            mat.metalness = 0.05;
            mat.color = new THREE.Color('#192231');
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

  // Frame animation loop: posture, breathing, head movement, lip-sync
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { bones, meshes } = rig;

    // ── 1. Continuous Subtle Breathing Loops (Chest & Shoulders) ──
    const breatheCycle = Math.sin(t * 1.6);
    const chestRise = breatheCycle * 0.01;
    const shoulderBreath = breatheCycle * 0.006;

    if (bones.Spine) {
      bones.Spine.rotation.x = 0.02 + chestRise; // Gentle breathing rise
      bones.Spine.rotation.z = Math.sin(t * 0.5) * 0.004; // Natural micro-sway
    }
    if (bones.Spine1) {
      bones.Spine1.rotation.x = chestRise * 0.7;
    }

    // Subtle shoulder breathing
    if (bones.LeftShoulder) bones.LeftShoulder.rotation.z = -shoulderBreath;
    if (bones.RightShoulder) bones.RightShoulder.rotation.z = shoulderBreath;

    // ── 2. Natural Sitting Pose & Relaxed Arms on Desk (No rigid A-pose) ──
    if (bones.LeftArm) {
      bones.LeftArm.rotation.x = 0.35 + chestRise * 0.5;
      bones.LeftArm.rotation.y = 0.15;
      bones.LeftArm.rotation.z = -0.55;
    }
    if (bones.RightArm) {
      bones.RightArm.rotation.x = 0.35 + chestRise * 0.5;
      bones.RightArm.rotation.y = -0.15;
      bones.RightArm.rotation.z = 0.55;
    }

    // Forearms bent naturally forward resting on the executive desk
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotation.x = 0.75;
      bones.LeftForeArm.rotation.y = 0.25;
      bones.LeftForeArm.rotation.z = -0.15;
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotation.x = 0.75;
      bones.RightForeArm.rotation.y = -0.25;
      bones.RightForeArm.rotation.z = 0.15;
    }

    // Hands resting naturally
    if (bones.LeftHand) {
      bones.LeftHand.rotation.x = 0.12;
      bones.LeftHand.rotation.y = -0.05;
      bones.LeftHand.rotation.z = -0.04;
    }
    if (bones.RightHand) {
      bones.RightHand.rotation.x = 0.12;
      bones.RightHand.rotation.y = 0.05;
      bones.RightHand.rotation.z = 0.04;
    }

    // ── 3. Head & Gaze: Attentive Eye-Level Listening & Micro-Tilts ──
    if (bones.Head) {
      if (isSpeaking) {
        // Natural conversational head movement synced to speech cadence
        const pitch = Math.sin(t * 7.5) * 0.018 + Math.sin(t * 3.5) * 0.012;
        const yaw = Math.sin(t * 2.2) * 0.02;
        const roll = Math.cos(t * 3.1) * 0.008;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, pitch, 0.12);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, yaw, 0.12);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, roll, 0.12);
      } else if (isListening) {
        // Active attentive nodding loop showing she is listening warmly to the student
        const nod = 0.02 + Math.sin(t * 1.8) * 0.028 + Math.sin(t * 0.9) * 0.012;
        const gazeYaw = Math.sin(t * 0.7) * 0.022;
        const subtleTilt = Math.sin(t * 1.2) * 0.015;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, nod, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, gazeYaw, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, subtleTilt, 0.06);
      } else if (isThinking) {
        // Thoughtful gaze tilt during code analysis
        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, -0.03, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, 0.04, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, 0.015, 0.06);
      } else {
        // Calm eye-level eye contact straight forward toward the student
        const idlePitch = Math.sin(t * 1.0) * 0.014;
        const idleYaw = Math.sin(t * 0.6) * 0.02;
        const idleRoll = Math.sin(t * 0.8) * 0.008;

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
        // Blink duration is ~140ms
        if (t > blinkTimerRef.current.nextBlink + 0.14) {
          blinkTimerRef.current.isBlinking = false;
          // Random interval between 4.0 and 6.0 seconds
          blinkTimerRef.current.nextBlink = t + 4.0 + Math.random() * 2.0;
        }
      }

      const blinkValue = blinkTimerRef.current.isBlinking ? 1.0 : 0.0;
      if (blinkLIdx !== undefined) influences[blinkLIdx] = THREE.MathUtils.lerp(influences[blinkLIdx], blinkValue, 0.6);
      if (blinkRIdx !== undefined) influences[blinkRIdx] = THREE.MathUtils.lerp(influences[blinkRIdx], blinkValue, 0.6);

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
        // Natural speech pacing with phonetic vowel and consonant mouth movements
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

        // Slight conversational warmth
        if (smileLIdx !== undefined) influences[smileLIdx] = 0.22;
        if (smileRIdx !== undefined) influences[smileRIdx] = 0.22;
      } else {
        // Warm, empathetic resting smile while listening to student
        const targetSmile = isListening ? 0.35 : 0.22;
        if (smileLIdx !== undefined) influences[smileLIdx] = THREE.MathUtils.lerp(influences[smileLIdx], targetSmile, 0.08);
        if (smileRIdx !== undefined) influences[smileRIdx] = THREE.MathUtils.lerp(influences[smileRIdx], targetSmile, 0.08);

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
      Exact Requested Transform:
      - position={[0, -1.4, -0.2]} (Moves avatar down slightly to capture waist-up posture)
      - rotation={[0, 0, 0]} (Facing forward directly towards student)
      - scale={1.0}
    */
    <group position={[0, -1.4, -0.2]} rotation={[0, 0, 0]} scale={1.0}>
      <primitive object={scene} />

      {/* ── Executive Seating Environment ── */}
      {/* High-back Executive Chair Backrest */}
      <mesh position={[0, 1.35, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.82, 0.08]} />
        <meshStandardMaterial color="#181a22" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Executive Headrest */}
      <mesh position={[0, 1.82, -0.20]} castShadow>
        <boxGeometry args={[0.32, 0.16, 0.08]} />
        <meshStandardMaterial color="#111319" roughness={0.65} metalness={0.2} />
      </mesh>

      {/* Modern Executive Walnut Desk Surface (Forearms rest directly on top) */}
      <mesh position={[0, 0.98, 0.28]} receiveShadow>
        <boxGeometry args={[1.5, 0.05, 0.50]} />
        <meshStandardMaterial color="#241913" roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Desk Edge Accent Trim */}
      <mesh position={[0, 0.98, 0.04]}>
        <boxGeometry args={[1.5, 0.02, 0.02]} />
        <meshStandardMaterial color="#523b2b" roughness={0.4} />
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
          Connecting to AI Mentor...
        </span>
      </div>
    </Html>
  );
}

/**
 * FemaleMentor3DAvatar
 *
 * Professional Eye-Level Front Camera Setup:
 * - Camera: position [0, 0, 1.4], fov 40 (eye-level straight-on with seated mentor)
 * - Avatar: position [0, -1.4, -0.2], rotation [0, 0, 0]
 * - OrbitControls: target [0, 0.1, 0], enableZoom={false}, limited angles
 * - Cinematic Real-Life Multi-Source Lighting:
 *   - ambientLight intensity 0.8
 *   - directionalLight position [1, 1.5, 2] intensity 1.8 castShadow
 *   - pointLight position [-1.5, 1, 0.5] intensity 0.5 color="#ffd4a3" for warm cheek & ear illumination
 *   - top hair rim light for depth
 */
export default function FemaleMentor3DAvatar({
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mentorName = 'Dr. Ann Vance',
}) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0b101c] via-[#0e172a] to-[#080d18] flex items-center justify-center select-none">
      <Canvas
        shadows
        camera={{
          position: [0, 0, 1.4], // Perfectly eye-level straight-on with the mentor seated at desk
          fov: 40,               // Standard 40 fov (avoids wide-angle fish-eye distortion)
          near: 0.1,
          far: 20,
        }}
        className="w-full h-full cursor-default"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* ── Cinematic Real-Life Multi-Source Lighting ── */}
        {/* 1. Base Ambient Light */}
        <ambientLight intensity={0.8} />

        {/* 2. Key Directional Light for natural facial definition */}
        <directionalLight
          position={[1, 1.5, 2]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* 3. Warm Cheek & Ear Point Light */}
        <pointLight
          position={[-1.5, 1, 0.5]}
          intensity={0.5}
          color="#ffd4a3"
          distance={4.0}
        />

        {/* 4. Subtle Top/Hair Backlight for silhouette separation */}
        <pointLight
          position={[0, 1.6, -1.0]}
          intensity={0.65}
          color="#dbeafe"
          distance={3.5}
        />

        {/* ── 3D Seated Avatar Model ── */}
        <Suspense fallback={<ModelLoader />}>
          <SeatedFemaleMentorModel
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
          />
        </Suspense>

        {/* ── Soft Contact Shadow ── */}
        <ContactShadows
          position={[0, -0.42, 0]}
          opacity={0.6}
          scale={3.5}
          blur={2.0}
          far={2.0}
          color="#000000"
        />

        {/* ── Orbit Controls Fixed Directly at Face Level ── */}
        <OrbitControls
          target={[0, 0.1, 0]} // Face level target
          enableZoom={false}   // Fixed natural interview distance
          enablePan={false}
          minPolarAngle={Math.PI / 2.05} // Locked so camera stays naturally fixed in front of her
          maxPolarAngle={Math.PI / 1.95}
          minAzimuthAngle={-Math.PI / 18}
          maxAzimuthAngle={Math.PI / 18}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
