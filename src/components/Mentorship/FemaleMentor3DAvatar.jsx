import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';



/**
 * SeatedFemaleMentorModel
 */
function SeatedFemaleMentorModel({ isSpeaking = false, isListening = false, isThinking = false }) {
  const { scene } = useGLTF('/models/female_mentor.glb');

  // Load executive tailored AuraGD pure-white cyber blazer texture
  const blazerTexture = useTexture('/models/white_cyber_blazer.png');
  // Load refined face makeup texture (rosy lipstick, peach blush, winged eyeliner)
  const makeupTexture = useTexture('/models/head_makeup_texture.png');

  useMemo(() => {
    if (blazerTexture) {
      blazerTexture.flipY = false;
      blazerTexture.colorSpace = THREE.SRGBColorSpace;
      blazerTexture.needsUpdate = true;
    }
    if (makeupTexture) {
      makeupTexture.flipY = false;
      makeupTexture.colorSpace = THREE.SRGBColorSpace;
      makeupTexture.needsUpdate = true;
    }
  }, [blazerTexture, makeupTexture]);

  // Traverse meshes and enhance materials for cinematic human realism
  const rig = useMemo(() => {
    const bones = {};
    const meshes = {};

    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        meshes[child.name] = child;

        if (child.name === 'Wolf3D_Glasses' || child.material?.name === 'Wolf3D_Glasses') {
          // Remove glasses completely from face
          child.visible = false;
        }

        if (child.name === 'Wolf3D_Outfit_Footwear') {
          child.visible = true;
        }

        if (child.material) {
          const mat = child.material;
          if (child.name === 'Wolf3D_Head' || mat.name === 'Wolf3D_Skin') {
            // Apply refined makeup (rosy lips, soft peach blush, winged eyeliner, smooth radiant skin)
            mat.map = makeupTexture;
            mat.roughness = 0.55;
            mat.metalness = 0.0;
            mat.color = new THREE.Color('#ffffff');
            mat.needsUpdate = true;
          } else if (mat.name === 'Wolf3D_Body' || child.name === 'Wolf3D_Body') {
            // White futuristic cybernetic robotic AI gloves
            mat.map = null; // Detach skin map so arms/hands are pure ceramic white gloves
            mat.roughness = 0.26;
            mat.metalness = 0.25;
            mat.color = new THREE.Color('#f0f4f9'); // Pure white futuristic ceramic/cyber glove finish
            mat.needsUpdate = true;
          } else if (mat.name === 'Wolf3D_Eye' || mat.name === 'EyeLeft' || mat.name === 'EyeRight') {
            mat.roughness = 0.05;
            mat.metalness = 0.15;
          } else if (child.name === 'Wolf3D_Hair' || mat.name === 'Wolf3D_Hair') {
            // Original top bun hairstyle with natural strands
            mat.roughness = 0.45;
            mat.metalness = 0.12;
            mat.color = new THREE.Color('#241a15'); // Natural dark brunette espresso bun
            mat.needsUpdate = true;
          } else if (mat.name === 'Wolf3D_Teeth') {
            mat.roughness = 0.22;
            mat.metalness = 0.0;
            mat.color = new THREE.Color('#fcfbf7');
          } else if (child.name === 'Wolf3D_Outfit_Top' || mat.name === 'Wolf3D_Outfit_Top') {
            // Apply tailored white futuristic cyber blazer texture
            mat.map = blazerTexture;
            mat.roughness = 0.42;
            mat.metalness = 0.10;
            mat.color = new THREE.Color('#ffffff');
            mat.needsUpdate = true;
          } else if (child.name === 'Wolf3D_Outfit_Bottom' || mat.name?.includes('Bottom')) {
            // Matching dark cyber navy trousers
            mat.roughness = 0.70;
            mat.metalness = 0.08;
            mat.color = new THREE.Color('#0f172a');
          } else if (child.name === 'Wolf3D_Outfit_Footwear' || mat.name?.includes('Footwear')) {
            // White-blue futuristic cyber sneakers
            mat.roughness = 0.35;
            mat.metalness = 0.20;
            mat.color = new THREE.Color('#f8fafc');
          } else if (mat.name?.includes('Outfit')) {
            mat.roughness = 0.65;
            mat.metalness = 0.10;
            mat.color = new THREE.Color('#ffffff');
          }
          mat.needsUpdate = true;
        }
      }
      if (child.isBone) {
        bones[child.name] = child;
      }
    });

    return { bones, meshes };
  }, [scene, blazerTexture, makeupTexture]);

  // Capture pristine rest quaternions
  const restQuats = useMemo(() => {
    const quats = {};
    const names = [
      'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm',
      'LeftHand', 'RightHand', 'LeftShoulder', 'RightShoulder',
      'Spine', 'Spine1', 'Head',
      'LeftHandIndex1', 'LeftHandIndex2', 'LeftHandIndex3',
      'LeftHandMiddle1', 'LeftHandMiddle2', 'LeftHandMiddle3',
      'LeftHandRing1', 'LeftHandRing2', 'LeftHandRing3',
      'LeftHandPinky1', 'LeftHandPinky2', 'LeftHandPinky3',
      'RightHandIndex1', 'RightHandIndex2', 'RightHandIndex3',
      'RightHandMiddle1', 'RightHandMiddle2', 'RightHandMiddle3',
      'RightHandRing1', 'RightHandRing2', 'RightHandRing3',
      'RightHandPinky1', 'RightHandPinky2', 'RightHandPinky3'
    ];
    names.forEach((name) => {
      if (rig.bones[name]) {
        quats[name] = rig.bones[name].quaternion.clone();
      }
    });
    return quats;
  }, [rig]);

  const blinkTimerRef = useRef({ nextBlink: 3.5, isBlinking: false });

  // Frame animation loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { bones, meshes } = rig;

    // ── 1. Subtle Torso Breathing (Hands stay 100% still and anchored) ──
    const breatheCycle = Math.sin(t * 1.6);
    const chestRise = breatheCycle * 0.008;

    if (bones.Spine && restQuats.Spine) {
      bones.Spine.quaternion.copy(restQuats.Spine);
      bones.Spine.rotateX(0.02 + chestRise);
    }
    if (bones.Spine1 && restQuats.Spine1) {
      bones.Spine1.quaternion.copy(restQuats.Spine1);
      bones.Spine1.rotateX(chestRise * 0.6);
    }

    // ── 2. Natural Seated Arm & Hand Posture (Hands resting flat on desk pad) ──
    // Left Arm & Forearm reaching forward and resting flat on desk pad
    if (bones.LeftArm && restQuats.LeftArm) {
      bones.LeftArm.quaternion.copy(restQuats.LeftArm);
      bones.LeftArm.rotateZ(-1.05); // Lower upper arm from A-pose down along ribcage
      bones.LeftArm.rotateX(0.38);  // Reach forward toward desk surface
      bones.LeftArm.rotateY(-0.10); // Natural alignment
    }
    if (bones.LeftForeArm && restQuats.LeftForeArm) {
      bones.LeftForeArm.quaternion.copy(restQuats.LeftForeArm);
      bones.LeftForeArm.rotateX(1.18); // Forearm extends forward horizontally on desk
      bones.LeftForeArm.rotateZ(0.55); // Angle hand inward onto the desk blotter
    }
    if (bones.LeftHand && restQuats.LeftHand) {
      bones.LeftHand.quaternion.copy(restQuats.LeftHand);
      bones.LeftHand.rotateX(-0.25); // Flattens the palm flat against the desk surface
      bones.LeftHand.rotateZ(0.12);  // Keep hand straight along desk axis
    }

    // Right Arm & Forearm (Resting flat on desk, with gentle conversational micro-gestures)
    const speakGesture = isSpeaking ? Math.sin(t * 2.8) * 0.025 : 0;
    if (bones.RightArm && restQuats.RightArm) {
      bones.RightArm.quaternion.copy(restQuats.RightArm);
      bones.RightArm.rotateZ(1.05);
      bones.RightArm.rotateX(0.38 + speakGesture * 0.25);
      bones.RightArm.rotateY(0.10);
    }
    if (bones.RightForeArm && restQuats.RightForeArm) {
      bones.RightForeArm.quaternion.copy(restQuats.RightForeArm);
      bones.RightForeArm.rotateX(1.18 + speakGesture); // Subtle conversational cadence
      bones.RightForeArm.rotateZ(-0.55);
    }
    if (bones.RightHand && restQuats.RightHand) {
      bones.RightHand.quaternion.copy(restQuats.RightHand);
      bones.RightHand.rotateX(-0.25 - speakGesture * 0.3);
      bones.RightHand.rotateZ(-0.12);
    }

    // Fingers remain in their natural relaxed hand rest pose
    const fingerNames = [
      'LeftHandIndex1', 'LeftHandIndex2', 'LeftHandIndex3',
      'LeftHandMiddle1', 'LeftHandMiddle2', 'LeftHandMiddle3',
      'LeftHandRing1', 'LeftHandRing2', 'LeftHandRing3',
      'LeftHandPinky1', 'LeftHandPinky2', 'LeftHandPinky3',
      'RightHandIndex1', 'RightHandIndex2', 'RightHandIndex3',
      'RightHandMiddle1', 'RightHandMiddle2', 'RightHandMiddle3',
      'RightHandRing1', 'RightHandRing2', 'RightHandRing3',
      'RightHandPinky1', 'RightHandPinky2', 'RightHandPinky3'
    ];
    fingerNames.forEach((name) => {
      if (bones[name] && restQuats[name]) {
        bones[name].quaternion.copy(restQuats[name]);
      }
    });

    // ── 3. Head & Gaze Movement ──
    if (bones.Head) {
      if (isSpeaking) {
        const pitch = Math.sin(t * 6.5) * 0.016 + Math.sin(t * 3.2) * 0.012;
        const yaw = Math.sin(t * 2.0) * 0.018;
        const roll = Math.cos(t * 2.8) * 0.008;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, pitch, 0.12);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, yaw, 0.12);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, roll, 0.12);
      } else if (isListening) {
        const nod = 0.02 + Math.sin(t * 1.8) * 0.028 + Math.sin(t * 0.9) * 0.012;
        const gazeYaw = Math.sin(t * 0.7) * 0.022;
        const subtleTilt = Math.sin(t * 1.2) * 0.015;

        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, nod, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, gazeYaw, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, subtleTilt, 0.06);
      } else if (isThinking) {
        bones.Head.rotation.x = THREE.MathUtils.lerp(bones.Head.rotation.x, -0.03, 0.06);
        bones.Head.rotation.y = THREE.MathUtils.lerp(bones.Head.rotation.y, 0.04, 0.06);
        bones.Head.rotation.z = THREE.MathUtils.lerp(bones.Head.rotation.z, 0.015, 0.06);
      } else {
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

      // ── 5. Real-Time Phonetic Speech Lip-Sync ──
      const teethMesh = meshes.Wolf3D_Teeth;
      const teethInfluences = teethMesh?.morphTargetInfluences;

      const aaIdx = dict['viseme_aa'];
      const oIdx = dict['viseme_O'];
      const eIdx = dict['viseme_E'];
      const iIdx = dict['viseme_I'];
      const ppIdx = dict['viseme_PP'];
      const silIdx = dict['viseme_sil'];
      const mouthOpenIdx = dict['mouthOpen'];
      const jawOpenIdx = dict['jawOpen'];
      const smileLIdx = dict['mouthSmileLeft'];
      const smileRIdx = dict['mouthSmileRight'];

      if (isSpeaking) {
        const syllableClock = t * 3.8;
        const phase = syllableClock % 1.0;
        const phonemeCycle = Math.floor(syllableClock) % 5;

        let targetOpen = 0;
        let targetAA = 0;
        let targetO = 0;
        let targetE = 0;
        let targetI = 0;
        let targetPP = 0;
        let targetSil = 0;

        if (phase < 0.72) {
          const openAperture = Math.sin((phase / 0.72) * Math.PI);
          targetOpen = openAperture * 0.68;

          if (phonemeCycle === 0) targetAA = openAperture * 0.78;
          else if (phonemeCycle === 1) { targetE = openAperture * 0.65; targetI = openAperture * 0.35; }
          else if (phonemeCycle === 2) targetO = openAperture * 0.72;
          else if (phonemeCycle === 3) { targetAA = openAperture * 0.45; targetE = openAperture * 0.40; }
          else targetI = openAperture * 0.55;
        } else {
          const closureStrength = Math.sin(((phase - 0.72) / 0.28) * Math.PI);
          targetOpen = 0.05;
          targetPP = closureStrength * 0.75;
          targetSil = closureStrength * 0.65;
        }

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

        if (smileLIdx !== undefined) influences[smileLIdx] = 0.20;
        if (smileRIdx !== undefined) influences[smileRIdx] = 0.20;
      } else {
        const targetSmile = isListening ? 0.32 : 0.20;
        if (smileLIdx !== undefined) influences[smileLIdx] = THREE.MathUtils.lerp(influences[smileLIdx], targetSmile, 0.1);
        if (smileRIdx !== undefined) influences[smileRIdx] = THREE.MathUtils.lerp(influences[smileRIdx], targetSmile, 0.1);

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

useGLTF.preload('/models/female_mentor.glb');
useTexture.preload('/models/white_cyber_blazer.png');
useTexture.preload('/models/head_makeup_texture.png');

/**
 * ModernLightExecutiveChair
 * Sleek, compact mid-back ergonomic consultation chair in pearl white & brushed silver
 */
function ModernLightExecutiveChair() {
  return (
    <group position={[0, -0.10, -0.26]}>
      {/* 1. Sleek Brushed Aluminum Central Spine & Crossbar */}
      <mesh position={[0, 0.04, -0.05]} castShadow>
        <cylinderGeometry args={[0.014, 0.016, 0.52, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0.16, -0.04]}>
        <boxGeometry args={[0.26, 0.018, 0.024]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.90} roughness={0.18} />
      </mesh>

      {/* 2. Compact Pearl-White Ergonomic Mid-Backrest */}
      <RoundedBox
        args={[0.34, 0.36, 0.045]}
        radius={0.024}
        smoothness={4}
        position={[0, 0.08, -0.018]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#f8fafc" // Pure pearl white back shell
          roughness={0.28}
          metalness={0.10}
        />
      </RoundedBox>

      {/* Soft Light Oyster Gray Lumbar / Back Cushion */}
      <RoundedBox
        args={[0.31, 0.32, 0.028]}
        radius={0.018}
        smoothness={4}
        position={[0, 0.08, 0.008]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#eef2f6" // Light oyster cream / gray
          roughness={0.55}
          metalness={0.05}
        />
      </RoundedBox>

      {/* 3. Sleek Low-Profile Pearl White Armrests */}
      <group position={[-0.24, -0.08, 0.02]}>
        {/* Support Post */}
        <mesh position={[0, -0.06, 0]} castShadow>
          <cylinderGeometry args={[0.010, 0.012, 0.15, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Armrest Pad */}
        <RoundedBox args={[0.065, 0.022, 0.22]} radius={0.012} smoothness={4} position={[0, 0.01, 0]} castShadow>
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.08} />
        </RoundedBox>
      </group>

      <group position={[0.24, -0.08, 0.02]}>
        {/* Support Post */}
        <mesh position={[0, -0.06, 0]} castShadow>
          <cylinderGeometry args={[0.010, 0.012, 0.15, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Armrest Pad */}
        <RoundedBox args={[0.065, 0.022, 0.22]} radius={0.012} smoothness={4} position={[0, 0.01, 0]} castShadow>
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.08} />
        </RoundedBox>
      </group>

      {/* 4. Compact Pearl-White Seat Cushion */}
      <RoundedBox
        args={[0.42, 0.065, 0.40]}
        radius={0.024}
        smoothness={4}
        position={[0, -0.19, 0.02]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#f1f5f9" roughness={0.48} metalness={0.08} />
      </RoundedBox>
    </group>
  );
}

/**
 * ExecutiveCloseUpDesk
 * Sleek modern white conference desk placed close up with glowing cyan front edge strip
 */
function ExecutiveCloseUpDesk() {
  return (
    <group position={[0, -0.05, 0.25]}>
      {/* 1. Sleek Pure White Composite Tabletop */}
      <RoundedBox
        args={[1.40, 0.024, 0.28]}
        radius={0.012}
        smoothness={4}
        position={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color="#f8fafc" // Pure white architectural composite
          roughness={0.18}
          metalness={0.08}
        />
      </RoundedBox>

      {/* 2. Signature Glowing Cyan LED Neon Light Strip along Front Beveled Edge */}
      <mesh position={[0, -0.004, 0.142]}>
        <boxGeometry args={[1.42, 0.008, 0.010]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={2.8}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* 3. Subtle Cyber Navy Lower Trim */}
      <mesh position={[0, -0.012, 0.138]}>
        <boxGeometry args={[1.40, 0.008, 0.012]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 4. Executive Dark Charcoal Desk Blotter / Pad (Where hands rest flat) */}
      <RoundedBox
        args={[0.76, 0.004, 0.22]}
        radius={0.008}
        smoothness={4}
        position={[0, 0.014, 0.01]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#161820" // Dark Napa leather pad
          roughness={0.50}
          metalness={0.08}
        />
      </RoundedBox>

      {/* Subtle Cyan Saddle Stitch Accent */}
      <mesh position={[0, 0.017, 0.01]}>
        <boxGeometry args={[0.74, 0.001, 0.20]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.3} wireframe />
      </mesh>

      {/* 5. Minimalist Pure White Ceramic Tech Cup with Cyan LED Accent (Left Side) */}
      <group position={[-0.46, 0.012, 0.02]}>
        {/* Saucer */}
        <mesh position={[0, 0.004, 0]} receiveShadow>
          <cylinderGeometry args={[0.040, 0.036, 0.006, 24]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.2} metalness={0.05} />
        </mesh>
        {/* Cup Body */}
        <mesh position={[0, 0.036, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.028, 0.024, 0.058, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.08} />
        </mesh>
        {/* Subtle Cyan Rim Glow Ring */}
        <mesh position={[0, 0.065, 0]}>
          <ringGeometry args={[0.022, 0.028, 24]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} side={THREE.DoubleSide} />
        </mesh>
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
 */
export default function FemaleMentor3DAvatar({
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mentorName = 'Dr. Ann Vance',
}) {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#090d16] flex items-center justify-center">
      {/* 1. FIXED FULL-SCREEN PHOTOREALISTIC FUTURISTIC GLASS BOARDROOM BACKGROUND (Matching Image 1) */}
      <img
        src="/backgrounds/futuristic_glass_office_room.jpg"
        alt="AuraGD Futuristic Glass Boardroom"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 filter brightness-[1.02] contrast-[1.03]"
        onError={(e) => {
          e.currentTarget.src = '/backgrounds/futuristic_mentor_session.png';
        }}
      />

      {/* Subtle Futuristic Tech Room Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/15 pointer-events-none z-0" />

      {/* 2. TRANSPARENT 3D CANVAS */}
      <div className="absolute inset-0 w-full h-full z-10">
        <Canvas
          shadows
          camera={{
            position: [0, 0.15, 0.96],
            fov: 38,
            near: 0.1,
            far: 20,
          }}
          className="w-full h-full"
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* ── Cinematic Multi-Source Futuristic Studio Lighting ── */}
          <ambientLight intensity={1.15} color="#f0f9ff" />

          {/* Key Directional Light */}
          <directionalLight
            position={[1.2, 1.8, 1.8]}
            intensity={1.85}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          {/* Left Cool Cyan Rim Light (Matching vertical glass LED pillars) */}
          <pointLight
            position={[-1.2, 0.6, 0.4]}
            intensity={1.5}
            color="#00e5ff"
            distance={3.2}
            castShadow
          />

          {/* Right Soft Fill Light */}
          <pointLight
            position={[1.4, 0.8, 0.6]}
            intensity={0.8}
            color="#e0f2fe"
            distance={3.2}
          />

          {/* Top Hair Rim Light */}
          <pointLight
            position={[0, 1.8, -0.8]}
            intensity={0.9}
            color="#bae6fd"
            distance={3.5}
          />

          {/* ── Modern Light-Colored Compact Executive Chair ── */}
          <ModernLightExecutiveChair />

          {/* ── 3D Seated Mentor Avatar Model (White Cyber Blazer, Makeup, Natural Hair & Gloves) ── */}
          <Suspense fallback={<ModelLoader />}>
            <SeatedFemaleMentorModel
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={isThinking}
            />
          </Suspense>

          {/* ── Sleek Close-Up White Conference Desk with Cyan LED Strip ── */}
          <ExecutiveCloseUpDesk />

          {/* ── Floor / Chair Base Contact Shadows ── */}
          <ContactShadows
            position={[0, -0.24, 0.20]}
            opacity={0.45}
            scale={2.4}
            blur={2.0}
            far={1.5}
            color="#000000"
          />

          {/* ── Locked Camera Controls Focused at Eye Level (Approx. 3 feet / 1 meter) ── */}
          <OrbitControls
            target={[0, 0.12, -0.15]}
            enableRotate={false}
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
      </div>
    </div>
  );
}
