import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SeatedFemaleMentorModel
 *
 * Cinematic Photorealistic Female Mentor Model:
 * - Seated naturally at eye level
 * - Inward relaxed arm posture with forearms resting forward on the desk blotter
 * - PBR materials: soft natural skin tone, corneal eye reflections, sleek glasses, hair sheen
 * - Continuous subtle chest and shoulder breathing
 * - Random eye-blinking every 4-6 seconds
 * - Attentive listening head nods & empathetic resting smile
 * - Dynamic speech lip-sync with synchronized head and jaw vibrations
 */
function SeatedFemaleMentorModel({ isSpeaking = false, isListening = false, isThinking = false }) {
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

        // Hide footwear so shoes never poke up
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

  // Frame animation loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { bones, meshes } = rig;

    // ── 1. Subtle Chest & Shoulder Breathing Loops ──
    const breatheCycle = Math.sin(t * 1.6);
    const chestRise = breatheCycle * 0.01;
    const shoulderBreath = breatheCycle * 0.006;

    if (bones.Spine) {
      bones.Spine.rotation.x = 0.02 + chestRise;
      bones.Spine.rotation.z = Math.sin(t * 0.5) * 0.004;
    }
    if (bones.Spine1) {
      bones.Spine1.rotation.x = chestRise * 0.7;
    }

    if (bones.LeftShoulder) bones.LeftShoulder.rotation.z = -shoulderBreath;
    if (bones.RightShoulder) bones.RightShoulder.rotation.z = shoulderBreath;

    // ── 2. Natural Sitting Arm Posture (Resting Inward on Desk Blotter) ──
    // Upper arms hang relaxed close to the ribs (no outward stick wings)
    if (bones.LeftArm) {
      bones.LeftArm.rotation.x = 0.22 + chestRise * 0.3;
      bones.LeftArm.rotation.y = 0.40;
      bones.LeftArm.rotation.z = -1.35; // Pulls elbow inward against torso
    }
    if (bones.RightArm) {
      bones.RightArm.rotation.x = 0.22 + chestRise * 0.3;
      bones.RightArm.rotation.y = -0.40;
      bones.RightArm.rotation.z = 1.35; // Pulls elbow inward against torso
    }

    // Forearms bent naturally forward onto the desk blotter
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotation.x = 0.20;
      bones.LeftForeArm.rotation.y = 0.30;
      bones.LeftForeArm.rotation.z = 1.35;
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotation.x = 0.20;
      bones.RightForeArm.rotation.y = -0.30;
      bones.RightForeArm.rotation.z = -1.35;
    }

    // Hands resting naturally on the leather desk blotter
    if (bones.LeftHand) {
      bones.LeftHand.rotation.x = 0.12;
      bones.LeftHand.rotation.y = 0.15;
      bones.LeftHand.rotation.z = -0.05;
    }
    if (bones.RightHand) {
      bones.RightHand.rotation.x = 0.12;
      bones.RightHand.rotation.y = -0.15;
      bones.RightHand.rotation.z = 0.05;
    }

    // ── 3. Head & Gaze: Attentive Eye-Level Listening & Micro-Tilts ──
    if (bones.Head) {
      if (isSpeaking) {
        // Natural speech movement synced to speech cadence
        const pitch = Math.sin(t * 7.5) * 0.018 + Math.sin(t * 3.5) * 0.012;
        const yaw = Math.sin(t * 2.2) * 0.02;
        const roll = Math.cos(t * 3.1) * 0.008;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, pitch, 0.12);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, yaw, 0.12);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, roll, 0.12);
      } else if (isListening) {
        // Attentive warm nodding rhythm
        const nod = 0.02 + Math.sin(t * 1.8) * 0.028 + Math.sin(t * 0.9) * 0.012;
        const gazeYaw = Math.sin(t * 0.7) * 0.022;
        const subtleTilt = Math.sin(t * 1.2) * 0.015;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, nod, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, gazeYaw, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, subtleTilt, 0.06);
      } else if (isThinking) {
        // Thoughtful gaze tilt
        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, -0.03, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, 0.04, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, 0.015, 0.06);
      } else {
        // Direct eye-level gaze forward toward student
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
        if (t > blinkTimerRef.current.nextBlink + 0.14) {
          blinkTimerRef.current.isBlinking = false;
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

        if (smileLIdx !== undefined) influences[smileLIdx] = 0.22;
        if (smileRIdx !== undefined) influences[smileRIdx] = 0.22;
      } else {
        const targetSmile = isListening ? 0.35 : 0.22;
        if (smileLIdx !== undefined) influences[smileLIdx] = THREE.MathUtils.lerp(influences[smileLIdx], targetSmile, 0.08);
        if (smileRIdx !== undefined) influences[smileRIdx] = THREE.MathUtils.lerp(influences[smileRIdx], targetSmile, 0.08);

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
    <group position={[0, -1.34, -0.15]} rotation={[0, 0, 0]} scale={1.0}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the female mentor model
useGLTF.preload('/models/female_mentor.glb');

/**
 * StraightFaceToFaceDeskAndChair
 *
 * Professional Executive Furniture Positioned Straight Across from Student:
 * - Wide solid American walnut desk right in the foreground across the bottom of the camera
 * - Centered leather desk blotter, ultra-slim executive laptop, notebook, pen, and coffee mug
 * - Ergonomic executive chair backrest & headrest directly behind the mentor
 */
function StraightFaceToFaceDeskAndChair() {
  return (
    <group position={[0, 0, 0]}>
      {/* ═══════════════════════════════════════════════════════════
          1. ERGONOMIC EXECUTIVE OFFICE CHAIR (DIRECTLY BEHIND MENTOR)
      ═══════════════════════════════════════════════════════════ */}
      <group position={[0, -0.05, -0.32]}>
        {/* Contoured Spine / Lumbar Support Backbone */}
        <mesh position={[0, 0.02, -0.05]} castShadow>
          <boxGeometry args={[0.06, 0.58, 0.05]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.25} />
        </mesh>

        {/* Ergonomic Ribbed Leather / Mesh Backrest */}
        <mesh position={[0, 0.02, -0.01]} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.56, 0.06]} />
          <meshStandardMaterial color="#1a1c23" roughness={0.55} metalness={0.25} />
        </mesh>

        {/* Dual Chrome Support Struts for Headrest */}
        <mesh position={[-0.06, 0.34, -0.04]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.06, 0.34, -0.04]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Ergonomic Curved Headrest Cushion (Directly behind head) */}
        <mesh position={[0, 0.39, -0.02]} castShadow>
          <boxGeometry args={[0.26, 0.13, 0.07]} />
          <meshStandardMaterial color="#14161c" roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.39, -0.05]}>
          <boxGeometry args={[0.27, 0.02, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Left Padded Armrest */}
        <group position={[-0.28, -0.22, 0.14]}>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.03, 0.24]} />
            <meshStandardMaterial color="#14161c" roughness={0.6} />
          </mesh>
        </group>

        {/* Right Padded Armrest */}
        <group position={[0.28, -0.22, 0.14]}>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.03, 0.24]} />
            <meshStandardMaterial color="#14161c" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* ═══════════════════════════════════════════════════════════
          2. STRAIGHT-ON EXECUTIVE AMERICAN WALNUT DESK
          - Centered directly in front of the camera (0-degree straight-on view)
          - Spans horizontally across the bottom of the screen
      ═══════════════════════════════════════════════════════════ */}
      <group position={[0, -0.42, 0.45]}>
        {/* Main Solid Walnut Executive Desk Surface */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[2.8, 0.06, 0.85]} />
          <meshStandardMaterial color="#261811" roughness={0.35} metalness={0.12} />
        </mesh>

        {/* Champagne Bronze Beveled Edge Front Trim */}
        <mesh position={[0, 0, -0.425]}>
          <boxGeometry args={[2.8, 0.02, 0.015]} />
          <meshStandardMaterial color="#5e4634" roughness={0.35} metalness={0.5} />
        </mesh>

        {/* Luxury Black Leather Executive Desk Blotter (Centered in front of mentor) */}
        <mesh position={[0, 0.032, -0.08]} receiveShadow>
          <boxGeometry args={[0.96, 0.008, 0.48]} />
          <meshStandardMaterial color="#13151a" roughness={0.65} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.038, -0.08]}>
          <boxGeometry args={[0.94, 0.002, 0.46]} />
          <meshStandardMaterial color="#382e25" roughness={0.5} />
        </mesh>

        {/* ── Ultra-Slim Brushed Aluminum Executive Laptop (Right side) ── */}
        <group position={[0.42, 0.04, -0.08]} rotation={[0, -0.25, 0]}>
          <mesh position={[0, 0.005, 0]} castShadow>
            <boxGeometry args={[0.29, 0.008, 0.20]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
          </mesh>
          <group position={[0, 0.01, 0.09]} rotation={[-0.32, 0, 0]}>
            <mesh position={[0, 0.09, 0]} castShadow>
              <boxGeometry args={[0.29, 0.18, 0.006]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.09, -0.004]}>
              <planeGeometry args={[0.27, 0.16]} />
              <meshStandardMaterial
                color="#0f172a"
                emissive="#0284c7"
                emissiveIntensity={0.6}
                roughness={0.15}
              />
            </mesh>
            <pointLight position={[0, 0.08, -0.08]} intensity={0.3} color="#38bdf8" distance={0.9} />
          </group>
        </group>

        {/* ── Executive Leather Interview Notes & Gold Pen (Left side) ── */}
        <group position={[-0.42, 0.04, -0.08]} rotation={[0, 0.20, 0]}>
          <mesh position={[0, 0.006, 0]} castShadow>
            <boxGeometry args={[0.19, 0.012, 0.25]} />
            <meshStandardMaterial color="#451a03" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.013, 0]}>
            <boxGeometry args={[0.015, 0.002, 0.25]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.11, 0.008, 0.02]} rotation={[0, 0, 0.05]} castShadow>
            <cylinderGeometry args={[0.004, 0.004, 0.14, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* ── Modern Matte Ceramic Coffee Cup ── */}
        <group position={[-0.64, 0.04, -0.12]}>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.08, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

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
 * Face-to-Face Straight-On Desk & Studio Setup:
 * - 100% Fixed, Full-Screen, Non-Moving Photorealistic Background Image
 * - Symmetrical, straight-on executive room (bookshelves, warm lamps, daylight windows)
 * - American walnut desk positioned straight in front of the camera across the lower screen
 * - Female mentor seated comfortably at the desk with natural inward arm drape
 * - Eye-level camera: position [0, 0, 1.4], fov 40
 * - OrbitControls locked (enableRotate=false) to ensure zero unwanted movement
 */
export default function FemaleMentor3DAvatar({
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mentorName = 'Dr. Ann Vance',
}) {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#090d16] flex items-center justify-center">
      {/* ══════════════════════════════════════════════════════════════
          1. FIXED FULL-SCREEN PHOTOREALISTIC EXECUTIVE ROOM BACKGROUND
          - Symmetrical straight-on view (no angled desks or distortion)
          - Does NOT move on mouse drag or camera rotation
          - Full-screen coverage
      ══════════════════════════════════════════════════════════════ */}
      <img
        src="/backgrounds/executive_room_straight.jpg"
        alt="AuraGD Executive Mentorship Room"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 filter brightness-[0.94] contrast-[1.04]"
        onError={(e) => {
          // Fallback to modern office if image load fails
          e.currentTarget.src = '/backgrounds/office_cozy.jpg';
        }}
      />

      {/* Subtle Warm Studio Atmosphere Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none z-0" />

      {/* ══════════════════════════════════════════════════════════════
          2. TRANSPARENT 3D CANVAS (STRAIGHT-ON FACE-TO-FACE DESK & AVATAR)
      ══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 w-full h-full z-10">
        <Canvas
          shadows
          camera={{
            position: [0, 0, 1.4], // Perfectly eye-level straight-on with the seated mentor
            fov: 40,               // Standard 40 fov (avoids wide-angle fish-eye distortion)
            near: 0.1,
            far: 20,
          }}
          className="w-full h-full"
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* ── Cinematic Multi-Source Studio Lighting (Matches Office Ambience) ── */}
          {/* 1. Warm Ambient Base Light */}
          <ambientLight intensity={0.9} color="#fff6ed" />

          {/* 2. Key Directional Light (Soft warm window/desk lamp lighting) */}
          <directionalLight
            position={[1.2, 1.6, 1.8]}
            intensity={1.8}
            color="#fffaf5"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          {/* 3. Warm Cheek & Ear Point Light (Emulates the warm floor lamp on the left) */}
          <pointLight
            position={[-1.4, 0.8, 0.6]}
            intensity={0.65}
            color="#ffd4a3"
            distance={3.8}
          />

          {/* 4. Soft Window Daylight Rim from the Right */}
          <pointLight
            position={[1.5, 1.2, 0.5]}
            intensity={0.5}
            color="#dbeafe"
            distance={3.5}
          />

          {/* 5. Top Hair Rim Light for silhouette separation */}
          <pointLight
            position={[0, 1.7, -0.9]}
            intensity={0.7}
            color="#fed7aa"
            distance={3.5}
          />

          {/* ── Straight-On Executive Desk & Chair (Face-to-Face directly in front) ── */}
          <StraightFaceToFaceDeskAndChair />

          {/* ── 3D Seated Avatar Model ── */}
          <Suspense fallback={<ModelLoader />}>
            <SeatedFemaleMentorModel
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={isThinking}
            />
          </Suspense>

          {/* ── Soft Desk Contact Shadow ── */}
          <ContactShadows
            position={[0, -0.42, 0.45]}
            opacity={0.65}
            scale={3.2}
            blur={2.0}
            far={2.0}
            color="#000000"
          />

          {/* ── Orbit Controls (Locked so neither avatar nor background ever moves) ── */}
          <OrbitControls
            target={[0, 0.1, 0]}   // Face level target
            enableRotate={false}   // 100% Fixed: will not rotate on mouse drag!
            enableZoom={false}     // Fixed natural interview distance
            enablePan={false}      // No panning
          />
        </Canvas>
      </div>
    </div>
  );
}
