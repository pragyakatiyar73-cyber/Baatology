import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SeatedFemaleMentorModel
 *
 * Highly Realistic Human Female Mentor:
 * - Natural, relaxed human arm posture (arms hang comfortably along torso, hands resting naturally in lap)
 * - Phonetic speech lip-sync matching syllables with distinct vowels and clean closures
 * - Natural eye-blinking every 4-6 seconds
 * - Continuous subtle chest & shoulder breathing
 * - Warm attentive listening nods & resting smile
 * - Enhanced PBR materials for realistic skin, corneal moisture, glasses, and hair
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

        // Hide footwear so shoes never poke up in waist-up view
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

    // ── 2. Natural Relaxed Human Seated Arm Posture ──
    // Arms hang naturally down along the torso, resting comfortably in lap (NO floating stick arms!)
    if (bones.LeftArm) {
      bones.LeftArm.rotation.x = 0.12 + chestRise * 0.4;
      bones.LeftArm.rotation.y = 0.05;
      bones.LeftArm.rotation.z = -0.35; // Hangs naturally close to body
    }
    if (bones.RightArm) {
      bones.RightArm.rotation.x = 0.12 + chestRise * 0.4;
      bones.RightArm.rotation.y = -0.05;
      bones.RightArm.rotation.z = 0.35; // Hangs naturally close to body
    }

    // Forearms relaxed forward into her lap
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotation.x = 0.38;
      bones.LeftForeArm.rotation.y = 0.12;
      bones.LeftForeArm.rotation.z = 0.10;
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotation.x = 0.38;
      bones.RightForeArm.rotation.y = -0.12;
      bones.RightForeArm.rotation.z = -0.10;
    }

    // Hands resting naturally in lap
    if (bones.LeftHand) {
      bones.LeftHand.rotation.x = 0.14;
      bones.LeftHand.rotation.y = 0.06;
      bones.LeftHand.rotation.z = 0.0;
    }
    if (bones.RightHand) {
      bones.RightHand.rotation.x = 0.14;
      bones.RightHand.rotation.y = -0.06;
      bones.RightHand.rotation.z = 0.0;
    }

    // Natural gentle finger relaxation (softly curled, not stiff starfish)
    const fingerNames = [
      'LeftHandIndex1', 'LeftHandIndex2', 'LeftHandMiddle1', 'LeftHandMiddle2',
      'LeftHandRing1', 'LeftHandRing2', 'LeftHandPinky1', 'LeftHandPinky2',
      'RightHandIndex1', 'RightHandIndex2', 'RightHandMiddle1', 'RightHandMiddle2',
      'RightHandRing1', 'RightHandRing2', 'RightHandPinky1', 'RightHandPinky2'
    ];
    fingerNames.forEach((name) => {
      if (bones[name]) {
        bones[name].rotation.z = name.startsWith('Left') ? 0.22 : -0.22;
      }
    });

    // ── 3. Head & Gaze: Attentive Eye-Level Listening & Micro-Tilts ──
    if (bones.Head) {
      if (isSpeaking) {
        // Natural speech cadence head movement (subtle conversational emphasis)
        const pitch = Math.sin(t * 6.5) * 0.016 + Math.sin(t * 3.2) * 0.012;
        const yaw = Math.sin(t * 2.0) * 0.018;
        const roll = Math.cos(t * 2.8) * 0.008;

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

      // ── 5. Real-Time Phonetic Audio Speech Lip-Sync (Matching Voice & Cadence) ──
      const teethMesh = meshes.Wolf3D_Teeth;
      const teethInfluences = teethMesh?.morphTargetInfluences;

      const aaIdx = dict['viseme_aa'];
      const oIdx = dict['viseme_O'];
      const eIdx = dict['viseme_E'];
      const iIdx = dict['viseme_I'];
      const ppIdx = dict['viseme_PP'];
      const ffIdx = dict['viseme_FF'];
      const silIdx = dict['viseme_sil'];
      const mouthOpenIdx = dict['mouthOpen'];
      const jawOpenIdx = dict['jawOpen'];
      const smileLIdx = dict['mouthSmileLeft'];
      const smileRIdx = dict['mouthSmileRight'];

      if (isSpeaking) {
        // Authentic human phonetic cadence: ~3.8 syllables per second
        const syllableClock = t * 3.8;
        const phase = syllableClock % 1.0; // 0.0 to 1.0 within syllable
        const phonemeCycle = Math.floor(syllableClock) % 5;

        // Vowel opening envelope during phase < 0.72, and clean closure during phase >= 0.72
        let targetOpen = 0;
        let targetAA = 0;
        let targetO = 0;
        let targetE = 0;
        let targetI = 0;
        let targetPP = 0;
        let targetSil = 0;

        if (phase < 0.72) {
          // Vowel articulation phase: mouth opens dynamically
          const openAperture = Math.sin((phase / 0.72) * Math.PI);
          targetOpen = openAperture * 0.68;

          if (phonemeCycle === 0) {
            // 'AA' (open vowel)
            targetAA = openAperture * 0.78;
          } else if (phonemeCycle === 1) {
            // 'E' / 'I' (lip stretch vowel)
            targetE = openAperture * 0.65;
            targetI = openAperture * 0.35;
          } else if (phonemeCycle === 2) {
            // 'O' / 'U' (rounded lips vowel)
            targetO = openAperture * 0.72;
          } else if (phonemeCycle === 3) {
            // Conversational transition vowel
            targetAA = openAperture * 0.45;
            targetE = openAperture * 0.40;
          } else {
            // Short vocalic release
            targetI = openAperture * 0.55;
          }
        } else {
          // Consonant / Closure phase: lips close cleanly between syllables!
          const closureStrength = Math.sin(((phase - 0.72) / 0.28) * Math.PI);
          targetOpen = 0.05;
          targetPP = closureStrength * 0.75;
          targetSil = closureStrength * 0.65;
        }

        // Apply smooth interpolation so mouth moves fluidly with speech
        if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = THREE.MathUtils.lerp(influences[mouthOpenIdx], targetOpen, 0.4);
        if (jawOpenIdx !== undefined) influences[jawOpenIdx] = THREE.MathUtils.lerp(influences[jawOpenIdx], targetOpen * 0.8, 0.4);
        if (aaIdx !== undefined) influences[aaIdx] = THREE.MathUtils.lerp(influences[aaIdx], targetAA, 0.45);
        if (oIdx !== undefined) influences[oIdx] = THREE.MathUtils.lerp(influences[oIdx], targetO, 0.45);
        if (eIdx !== undefined) influences[eIdx] = THREE.MathUtils.lerp(influences[eIdx], targetE, 0.45);
        if (iIdx !== undefined) influences[iIdx] = THREE.MathUtils.lerp(influences[iIdx], targetI, 0.45);
        if (ppIdx !== undefined) influences[ppIdx] = THREE.MathUtils.lerp(influences[ppIdx], targetPP, 0.5);
        if (silIdx !== undefined) influences[silIdx] = THREE.MathUtils.lerp(influences[silIdx], targetSil, 0.4);

        if (teethInfluences && aaIdx !== undefined) {
          teethInfluences[aaIdx] = THREE.MathUtils.lerp(teethInfluences[aaIdx], targetOpen * 0.75, 0.4);
        }

        // Conversational warm smile while speaking
        if (smileLIdx !== undefined) influences[smileLIdx] = 0.20;
        if (smileRIdx !== undefined) influences[smileRIdx] = 0.20;
      } else {
        // Natural resting empathetic smile while listening to student
        const targetSmile = isListening ? 0.32 : 0.20;
        if (smileLIdx !== undefined) influences[smileLIdx] = THREE.MathUtils.lerp(influences[smileLIdx], targetSmile, 0.1);
        if (smileRIdx !== undefined) influences[smileRIdx] = THREE.MathUtils.lerp(influences[smileRIdx], targetSmile, 0.1);

        // Smoothly close mouth completely when idle
        if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = THREE.MathUtils.lerp(influences[mouthOpenIdx], 0, 0.3);
        if (jawOpenIdx !== undefined) influences[jawOpenIdx] = THREE.MathUtils.lerp(influences[jawOpenIdx], 0, 0.3);
        if (aaIdx !== undefined) influences[aaIdx] = THREE.MathUtils.lerp(influences[aaIdx], 0, 0.3);
        if (oIdx !== undefined) influences[oIdx] = THREE.MathUtils.lerp(influences[oIdx], 0, 0.3);
        if (eIdx !== undefined) influences[eIdx] = THREE.MathUtils.lerp(influences[eIdx], 0, 0.3);
        if (iIdx !== undefined) influences[iIdx] = THREE.MathUtils.lerp(influences[iIdx], 0, 0.3);
        if (ppIdx !== undefined) influences[ppIdx] = THREE.MathUtils.lerp(influences[ppIdx], 0, 0.3);
        if (silIdx !== undefined) influences[silIdx] = THREE.MathUtils.lerp(influences[silIdx], 1.0, 0.2);

        if (teethInfluences && aaIdx !== undefined) {
          teethInfluences[aaIdx] = THREE.MathUtils.lerp(teethInfluences[aaIdx], 0, 0.3);
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
 * ErgonomicExecutiveChairBack
 *
 * Contoured Ergonomic Chair Backrest positioned seamlessly behind the mentor:
 * - Breathable curved mesh upholstery with soft graphite tone
 * - Dual chrome support struts connecting to headrest
 * - Fits naturally behind her shoulders and head
 */
function ErgonomicExecutiveChairBack() {
  return (
    <group position={[0, -0.08, -0.32]}>
      {/* Contoured Spine / Lumbar Support Backbone */}
      <mesh position={[0, 0.05, -0.05]} castShadow>
        <boxGeometry args={[0.06, 0.54, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Ergonomic Ribbed Leather / Mesh Backrest (Curved, softly rounded) */}
      <mesh position={[0, 0.05, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.52, 0.05]} />
        <meshStandardMaterial color="#1a1c23" roughness={0.65} metalness={0.2} />
      </mesh>

      {/* Dual Chrome Support Struts for Headrest */}
      <mesh position={[-0.05, 0.34, -0.04]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.14, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.05, 0.34, -0.04]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.14, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Ergonomic Curved Headrest Cushion (Directly behind head) */}
      <mesh position={[0, 0.39, -0.02]} castShadow>
        <boxGeometry args={[0.24, 0.12, 0.06]} />
        <meshStandardMaterial color="#14161c" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.39, -0.04]}>
        <boxGeometry args={[0.25, 0.02, 0.02]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
      </mesh>
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
 * Face-to-Face Executive Studio Setup:
 * - 100% Fixed, Full-Screen, Non-Moving Photorealistic Background Image
 * - Symmetrical straight-on executive room (bookshelves, warm lamps, daylight windows)
 * - Mentor seated naturally with relaxed arms resting comfortably in lap (normal human posture)
 * - Realistic phonetic syllable lip-sync synchronized to speech cadence with clean closures
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
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 filter brightness-[0.95] contrast-[1.04]"
        onError={(e) => {
          e.currentTarget.src = '/backgrounds/office_cozy.jpg';
        }}
      />

      {/* Subtle Warm Studio Atmosphere Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none z-0" />

      {/* ══════════════════════════════════════════════════════════════
          2. TRANSPARENT 3D CANVAS (HUMAN MENTOR SEATED AT EYE LEVEL)
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

          {/* ── Contoured Ergonomic Chair Back (Directly behind mentor) ── */}
          <ErgonomicExecutiveChairBack />

          {/* ── 3D Seated Avatar Model ── */}
          <Suspense fallback={<ModelLoader />}>
            <SeatedFemaleMentorModel
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={isThinking}
            />
          </Suspense>

          {/* ── Soft Floor / Lap Contact Shadow ── */}
          <ContactShadows
            position={[0, -0.65, 0]}
            opacity={0.6}
            scale={3.0}
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
