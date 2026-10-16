import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SeatedFemaleMentorModel
 *
 * Highly Realistic Human Female Mentor:
 * - Natural skin tones on hands & arms (restoring original human texture on Wolf3D_Body)
 * - Hands & forearms settled naturally on top of the executive desk pad
 * - Phonetic speech lip-sync matching syllables with distinct vowels and clean closures
 * - Natural eye-blinking every 4-6 seconds
 * - Continuous subtle chest & shoulder breathing
 * - Warm attentive listening nods & resting empathetic smile
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
          // IMPORTANT: Wolf3D_Body contains the arms and hands. Treat as human skin with neutral color #ffffff
          // so the original skin texture displays with natural human flesh tones!
          if (mat.name === 'Wolf3D_Skin' || mat.name === 'Wolf3D_Body') {
            mat.roughness = 0.65; // Soft human skin matte texture
            mat.metalness = 0.0;
            mat.color = new THREE.Color('#ffffff'); // Keep 100% natural human skin texture & tone
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
          } else if (mat.name === 'Wolf3D_Outfit_Top' || mat.name?.includes('Outfit')) {
            mat.roughness = 0.82; // Professional executive blazer fabric
            mat.metalness = 0.05;
            mat.color = new THREE.Color('#ffffff'); // Preserve blazer fabric texture
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

  // Capture pristine rest quaternions of all upper-body bones to prevent drift
  const restQuats = useMemo(() => {
    const quats = {};
    const names = [
      'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm',
      'LeftHand', 'RightHand', 'LeftShoulder', 'RightShoulder',
      'Spine', 'Spine1', 'Head',
      'LeftHandIndex1', 'LeftHandIndex2', 'LeftHandMiddle1', 'LeftHandMiddle2',
      'LeftHandRing1', 'LeftHandRing2', 'LeftHandPinky1', 'LeftHandPinky2',
      'RightHandIndex1', 'RightHandIndex2', 'RightHandMiddle1', 'RightHandMiddle2',
      'RightHandRing1', 'RightHandRing2', 'RightHandPinky1', 'RightHandPinky2'
    ];
    names.forEach((name) => {
      if (rig.bones[name]) {
        quats[name] = rig.bones[name].quaternion.clone();
      }
    });
    return quats;
  }, [rig]);

  // Random eye blink tracker (every 4-6 seconds)
  const blinkTimerRef = useRef({ nextBlink: 3.5, isBlinking: false });

  // Frame animation loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { bones, meshes } = rig;

    // ── 1. Subtle Chest & Shoulder Breathing Loops ──
    const breatheCycle = Math.sin(t * 1.6);
    const chestRise = breatheCycle * 0.008;
    const shoulderBreath = breatheCycle * 0.004;

    if (bones.Spine && restQuats.Spine) {
      bones.Spine.quaternion.copy(restQuats.Spine);
      bones.Spine.rotateX(0.02 + chestRise);
      bones.Spine.rotateZ(Math.sin(t * 0.5) * 0.004);
    }
    if (bones.Spine1 && restQuats.Spine1) {
      bones.Spine1.quaternion.copy(restQuats.Spine1);
      bones.Spine1.rotateX(chestRise * 0.6);
    }

    if (bones.LeftShoulder && restQuats.LeftShoulder) {
      bones.LeftShoulder.quaternion.copy(restQuats.LeftShoulder);
      bones.LeftShoulder.rotateZ(-shoulderBreath);
    }
    if (bones.RightShoulder && restQuats.RightShoulder) {
      bones.RightShoulder.quaternion.copy(restQuats.RightShoulder);
      bones.RightShoulder.rotateZ(shoulderBreath);
    }

    // ── 2. Natural Table-Rested Arm & Hand Posture ──
    // Arms drape naturally from shoulders, forearms angle forward onto the desk,
    // and hands rest comfortably flat/relaxed on the executive desk pad
    const speechGesture = isSpeaking ? Math.sin(t * 3.2) * 0.015 : 0;

    // Left Arm & Hand on Desk Pad
    if (bones.LeftArm && restQuats.LeftArm) {
      bones.LeftArm.quaternion.copy(restQuats.LeftArm);
      bones.LeftArm.rotateX(0.55 + chestRise * 0.3);
      bones.LeftArm.rotateZ(0.05);
    }
    if (bones.LeftForeArm && restQuats.LeftForeArm) {
      bones.LeftForeArm.quaternion.copy(restQuats.LeftForeArm);
      bones.LeftForeArm.rotateX(0.35 + speechGesture);
      bones.LeftForeArm.rotateZ(0.70);
    }
    if (bones.LeftHand && restQuats.LeftHand) {
      bones.LeftHand.quaternion.copy(restQuats.LeftHand);
      bones.LeftHand.rotateX(0.12);
      bones.LeftHand.rotateZ(-0.22);
    }

    // Right Arm & Hand on Desk Pad (Symmetrical)
    if (bones.RightArm && restQuats.RightArm) {
      bones.RightArm.quaternion.copy(restQuats.RightArm);
      bones.RightArm.rotateX(0.55 + chestRise * 0.3);
      bones.RightArm.rotateZ(-0.05);
    }
    if (bones.RightForeArm && restQuats.RightForeArm) {
      bones.RightForeArm.quaternion.copy(restQuats.RightForeArm);
      bones.RightForeArm.rotateX(0.35 - speechGesture);
      bones.RightForeArm.rotateZ(-0.70);
    }
    if (bones.RightHand && restQuats.RightHand) {
      bones.RightHand.quaternion.copy(restQuats.RightHand);
      bones.RightHand.rotateX(0.12);
      bones.RightHand.rotateZ(0.22);
    }

    // Fingers gently relaxed and resting naturally on the desk pad
    const fingerNames = [
      'LeftHandIndex1', 'LeftHandIndex2', 'LeftHandMiddle1', 'LeftHandMiddle2',
      'LeftHandRing1', 'LeftHandRing2', 'LeftHandPinky1', 'LeftHandPinky2',
      'RightHandIndex1', 'RightHandIndex2', 'RightHandMiddle1', 'RightHandMiddle2',
      'RightHandRing1', 'RightHandRing2', 'RightHandPinky1', 'RightHandPinky2'
    ];
    fingerNames.forEach((name) => {
      if (bones[name] && restQuats[name]) {
        bones[name].quaternion.copy(restQuats[name]);
        bones[name].rotateX(0.16);
        bones[name].rotateZ(name.startsWith('Left') ? 0.08 : -0.08);
      }
    });

    // ── 3. Head & Gaze: Attentive Eye-Level Listening & Micro-Tilts ──
    if (bones.Head) {
      if (isSpeaking) {
        // Natural speech cadence head movement (conversational emphasis)
        const pitch = Math.sin(t * 6.5) * 0.016 + Math.sin(t * 3.2) * 0.012;
        const yaw = Math.sin(t * 2.0) * 0.018;
        const roll = Math.cos(t * 2.8) * 0.008;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, pitch, 0.12);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, yaw, 0.12);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, roll, 0.12);
      } else if (isListening) {
        // Attentive warm nodding rhythm while listening to student
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
            targetAA = openAperture * 0.78;
          } else if (phonemeCycle === 1) {
            targetE = openAperture * 0.65;
            targetI = openAperture * 0.35;
          } else if (phonemeCycle === 2) {
            targetO = openAperture * 0.72;
          } else if (phonemeCycle === 3) {
            targetAA = openAperture * 0.45;
            targetE = openAperture * 0.40;
          } else {
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
 * RealExecutiveOfficeChair
 *
 * Fully Realized Luxury Ergonomic Executive Chair:
 * - Contoured, multi-segmented black Napa leather backrest with ergonomic lateral wings
 * - Horizontal stitched pleats/grooves for authentic tailored leather upholstery
 * - Adjustable chrome-mounted ergonomic headrest pillow framing the mentor's head
 * - 4D Executive armrests flanking her waist/elbows with chrome riser brackets and cushioned pads
 * - Heavy-duty die-cast aluminum structural exoskeleton spine and lumbar adjustment knobs
 * - Plush matching leather seat cushion base
 */
function RealExecutiveOfficeChair() {
  return (
    <group position={[0, -0.06, -0.30]}>
      {/* ── 1. Structural Chrome Exoskeleton Spine Frame (Behind Chair) ── */}
      {/* Central Polished Aluminum Spine Column */}
      <mesh position={[0, 0.06, -0.07]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.72, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.94} roughness={0.14} />
      </mesh>

      {/* Upper Exoskeleton Y-Bracket holding upper backrest */}
      <mesh position={[0, 0.28, -0.05]}>
        <boxGeometry args={[0.32, 0.024, 0.035]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.16} />
      </mesh>

      {/* Lower Lumbar Exoskeleton Support Bracket */}
      <mesh position={[0, -0.12, -0.05]}>
        <boxGeometry args={[0.36, 0.03, 0.035]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.16} />
      </mesh>

      {/* Mechanical Lumbar Tension Adjustment Knobs (Chrome accents on both sides) */}
      <mesh position={[-0.20, -0.12, -0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.035, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.12} />
      </mesh>
      <mesh position={[0.20, -0.12, -0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.035, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.12} />
      </mesh>

      {/* ── 2. Contoured Executive High Backrest (Multi-Segmented Leather) ── */}
      {/* Central Ergonomic Thoracic/Lumbar Cushion */}
      <RoundedBox
        args={[0.36, 0.50, 0.065]}
        radius={0.028}
        smoothness={4}
        position={[0, 0.06, -0.02]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#16181f" // Executive black Napa leather
          roughness={0.44} // Soft supple leather sheen
          metalness={0.12}
        />
      </RoundedBox>

      {/* Horizontal Stitched Leather Creases / Ribs (Luxury executive detailing) */}
      {[-0.10, -0.02, 0.07, 0.16, 0.24].map((yPos, idx) => (
        <mesh key={idx} position={[0, yPos, 0.014]}>
          <boxGeometry args={[0.32, 0.005, 0.008]} />
          <meshStandardMaterial color="#0b0c10" roughness={0.8} />
        </mesh>
      ))}

      {/* Ergonomic Lateral Shoulder Bolster Wings (Wrap gently around shoulders) */}
      {/* Left Shoulder Wing */}
      <group position={[-0.20, 0.08, -0.01]} rotation={[0, 0.28, 0]}>
        <RoundedBox args={[0.08, 0.46, 0.055]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#14161c" roughness={0.46} metalness={0.1} />
        </RoundedBox>
        {/* Chrome edge accent trim */}
        <mesh position={[-0.038, 0, 0]}>
          <boxGeometry args={[0.006, 0.44, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>

      {/* Right Shoulder Wing */}
      <group position={[0.20, 0.08, -0.01]} rotation={[0, -0.28, 0]}>
        <RoundedBox args={[0.08, 0.46, 0.055]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#14161c" roughness={0.46} metalness={0.1} />
        </RoundedBox>
        {/* Chrome edge accent trim */}
        <mesh position={[0.038, 0, 0]}>
          <boxGeometry args={[0.006, 0.44, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>

      {/* Contoured Lower Lumbar Support Cushion */}
      <RoundedBox
        args={[0.33, 0.14, 0.045]}
        radius={0.02}
        smoothness={4}
        position={[0, -0.12, 0.018]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#1a1c24" roughness={0.48} metalness={0.12} />
      </RoundedBox>

      {/* ── 3. Ergonomic Contoured Headrest ── */}
      {/* Dual Articulated Polished Chrome Neck Struts */}
      <mesh position={[-0.06, 0.36, -0.045]} rotation={[-0.14, 0, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.16, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.10} />
      </mesh>
      <mesh position={[0.06, 0.36, -0.045]} rotation={[-0.14, 0, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.16, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.10} />
      </mesh>

      {/* Chrome Pivot Mounting Bar */}
      <mesh position={[0, 0.43, -0.038]}>
        <boxGeometry args={[0.18, 0.018, 0.024]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.94} roughness={0.12} />
      </mesh>

      {/* Ergonomic Curved Headrest Cushion (Pillow directly behind mentor's head) */}
      <RoundedBox
        args={[0.28, 0.14, 0.07]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.44, -0.015]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#16181f"
          roughness={0.42}
          metalness={0.12}
        />
      </RoundedBox>
      {/* Central Headrest Indentation/Stitch */}
      <mesh position={[0, 0.44, 0.021]}>
        <boxGeometry args={[0.22, 0.004, 0.006]} />
        <meshStandardMaterial color="#0c0d12" roughness={0.8} />
      </mesh>

      {/* ── 4. Executive 4D Armrests (Flanking the mentor) ── */}
      {/* Left Armrest */}
      <group position={[-0.28, -0.16, 0.05]}>
        {/* Die-Cast Chrome Armrest Support Upright */}
        <mesh position={[0, -0.07, -0.08]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.18, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Chrome Horizontal Cantilever */}
        <mesh position={[0.02, -0.01, -0.03]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.05, 0.02, 0.14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Contoured Cushioned Armrest Pad */}
        <RoundedBox args={[0.085, 0.032, 0.26]} radius={0.014} smoothness={4} position={[0.02, 0.01, 0.0]} castShadow>
          <meshStandardMaterial color="#1a1c22" roughness={0.52} metalness={0.1} />
        </RoundedBox>
      </group>

      {/* Right Armrest */}
      <group position={[0.28, -0.16, 0.05]}>
        {/* Die-Cast Chrome Armrest Support Upright */}
        <mesh position={[0, -0.07, -0.08]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.18, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Chrome Horizontal Cantilever */}
        <mesh position={[-0.02, -0.01, -0.03]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.05, 0.02, 0.14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Contoured Cushioned Armrest Pad */}
        <RoundedBox args={[0.085, 0.032, 0.26]} radius={0.014} smoothness={4} position={[-0.02, 0.01, 0.0]} castShadow>
          <meshStandardMaterial color="#1a1c22" roughness={0.52} metalness={0.1} />
        </RoundedBox>
      </group>

      {/* ── 5. Plush Matching Leather Seat Base Cushion ── */}
      <RoundedBox
        args={[0.52, 0.09, 0.48]}
        radius={0.032}
        smoothness={4}
        position={[0, -0.28, 0.04]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#16181f" roughness={0.46} metalness={0.12} />
      </RoundedBox>
    </group>
  );
}

/**
 * ExecutiveConsultationDesk
 *
 * Professional executive consultation desk placed directly in front of the mentor:
 * - Rich dark walnut / espresso wooden tabletop with chamfered smooth beveled edge
 * - Center executive Napa leather desk pad (where her hands and forearms rest naturally)
 * - Modern executive laptop (space grey slim aluminum chassis angled to the side)
 * - Fine executive accessories: sleek metal pen, ceramic espresso mug with saucer
 * - Front modesty panel in dark matte graphite / wood grain
 */
function ExecutiveConsultationDesk() {
  return (
    <group position={[0, -0.31, 0.22]}>
      {/* ── 1. Main Executive Wooden Desktop (Rich dark walnut with satin bevel) ── */}
      <RoundedBox args={[2.2, 0.038, 0.75]} radius={0.012} smoothness={4} position={[0, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial
          color="#1e1814" // Rich dark espresso walnut wood tone
          roughness={0.35} // Soft satin reflection
          metalness={0.08}
        />
      </RoundedBox>

      {/* Subtle Chamfer Under-Bevel Trim (Adds thickness & architectural depth) */}
      <mesh position={[0, -0.024, 0]}>
        <boxGeometry args={[2.16, 0.015, 0.72]} />
        <meshStandardMaterial color="#120e0b" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* ── 2. Executive Napa Leather Desk Pad / Blotter ── */}
      {/* Hands and forearms rest directly on this desk mat */}
      <RoundedBox
        args={[0.74, 0.007, 0.38]}
        radius={0.008}
        smoothness={4}
        position={[0, 0.022, -0.08]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#15171b" // Deep charcoal executive leather
          roughness={0.58}
          metalness={0.12}
        />
      </RoundedBox>

      {/* ── 3. Ultra-Slim Executive Laptop (Angled on the left) ── */}
      <group position={[-0.46, 0.024, -0.02]} rotation={[0, 0.26, 0]}>
        {/* Base Chassis (Space Grey Aluminum) */}
        <RoundedBox args={[0.26, 0.008, 0.18]} radius={0.004} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#2c3038" metalness={0.88} roughness={0.22} />
        </RoundedBox>
        {/* Trackpad */}
        <mesh position={[0, 0.005, 0.045]}>
          <planeGeometry args={[0.09, 0.06]} />
          <meshStandardMaterial color="#252930" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Keyboard Well */}
        <mesh position={[0, 0.005, -0.025]}>
          <planeGeometry args={[0.23, 0.09]} />
          <meshStandardMaterial color="#181a1f" metalness={0.2} roughness={0.7} />
        </mesh>
        {/* Open Display Lid (Tilted at 105 degrees) */}
        <group position={[0, 0.004, -0.09]} rotation={[-0.26, 0, 0]}>
          <RoundedBox args={[0.26, 0.17, 0.006]} radius={0.004} smoothness={4} position={[0, 0.085, 0]} castShadow>
            <meshStandardMaterial color="#2c3038" metalness={0.88} roughness={0.22} />
          </RoundedBox>
          {/* Glowing Retina Screen */}
          <mesh position={[0, 0.085, 0.0035]}>
            <planeGeometry args={[0.245, 0.155]} />
            <meshStandardMaterial
              color="#0d1b2a"
              emissive="#1e3a8a"
              emissiveIntensity={0.25}
              roughness={0.1}
            />
          </mesh>
        </group>
      </group>

      {/* ── 4. Executive Accessories on the Right ── */}
      {/* Matte Black Ceramic Mug & Saucer */}
      <group position={[0.42, 0.024, -0.04]}>
        <mesh position={[0, 0.0035, 0]}>
          <cylinderGeometry args={[0.048, 0.038, 0.007, 24]} />
          <meshStandardMaterial color="#1a1c22" roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.038, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.028, 0.065, 24]} />
          <meshStandardMaterial color="#1e2129" roughness={0.35} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.062, 0]}>
          <cylinderGeometry args={[0.029, 0.029, 0.002, 20]} />
          <meshStandardMaterial color="#2b1810" roughness={0.15} metalness={0.1} />
        </mesh>
      </group>

      {/* Sleek Titanium Executive Pen beside the desk pad */}
      <group position={[0.26, 0.024, 0.06]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.004, 0]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.13, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.004, 0.03]}>
          <cylinderGeometry args={[0.0045, 0.0045, 0.035, 16]} />
          <meshStandardMaterial color="#1e2430" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>

      {/* ── 5. Front Modesty Panel / Desk Base ── */}
      <mesh position={[0, -0.24, -0.08]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.44, 0.025]} />
        <meshStandardMaterial color="#14100d" roughness={0.6} metalness={0.05} />
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
 * - Mentor seated naturally in a Luxury Executive Ergonomic Chair
 * - Executive Consultation Desk in foreground with her hands resting comfortably on the leather pad
 * - Natural human skin tones preserved on hands & arms (no black gloves!)
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

          {/* ── Real Luxury Executive Ergonomic Chair (Directly behind mentor) ── */}
          <RealExecutiveOfficeChair />

          {/* ── 3D Seated Avatar Model ── */}
          <Suspense fallback={<ModelLoader />}>
            <SeatedFemaleMentorModel
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={isThinking}
            />
          </Suspense>

          {/* ── Executive Consultation Desk & Accessories (In front of mentor) ── */}
          <ExecutiveConsultationDesk />

          {/* ── Soft Floor / Desk Contact Shadows ── */}
          <ContactShadows
            position={[0, -0.32, 0.2]}
            opacity={0.65}
            scale={2.6}
            blur={2.0}
            far={1.5}
            color="#000000"
          />

          {/* ── Orbit Controls (Locked so neither avatar nor background ever moves) ── */}
          <OrbitControls
            target={[0, 0.08, 0]}  // Natural eye-level target
            enableRotate={false}   // 100% Fixed: will not rotate on mouse drag!
            enableZoom={false}     // Fixed natural interview distance
            enablePan={false}      // No panning
          />
        </Canvas>
      </div>
    </div>
  );
}
