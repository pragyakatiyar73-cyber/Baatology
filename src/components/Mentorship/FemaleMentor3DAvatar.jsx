import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';



// ── Canonical Seated Arm & Finger Resting Quaternions (Direct from animations.glb Idle) ──
const IDLE_ARM_FINGER_QUATS = {
  LeftShoulder: [0.51861, 0.46859, -0.56172, 0.44264],
  LeftArm: [0.55495, 0.21826, 0.18113, 0.78204],
  LeftForeArm: [0.00276, -0.01507, 0.07414, 0.99713],
  LeftHand: [-0.1395, -0.2142, 0.1249, 0.95868],
  LeftHandThumb1: [0.27573, 0.02816, 0.15127, 0.94884],
  LeftHandThumb2: [-0.03476, -0.00211, -0.09888, 0.99449],
  LeftHandThumb3: [0, 0.00262, 0, 1],
  LeftHandThumb4: [-0.03272, 0.02971, 0.0432, 0.99809],
  LeftHandIndex1: [0.16577, -0.06899, -0.09201, 0.97944],
  LeftHandIndex2: [0.09678, 0.03738, -0.0228, 0.99434],
  LeftHandIndex3: [0, -0.04699, 0, 0.9989],
  LeftHandIndex4: [-0.06403, 0.04266, -0.03069, 0.99656],
  LeftHandMiddle1: [0.14603, -0.01052, -0.04491, 0.9882],
  LeftHandMiddle2: [0.08977, 0.0232, -0.00893, 0.99565],
  LeftHandMiddle3: [0, -0.00725, 0, 0.99997],
  LeftHandMiddle4: [-0.07933, 0.00227, -0.02302, 0.99658],
  LeftHandRing1: [0.21821, 0.03055, -0.05018, 0.97413],
  LeftHandRing2: [0.09017, 0.0187, -0.00929, 0.99571],
  LeftHandRing3: [0, -0.01306, 0, 0.99991],
  LeftHandRing4: [-0.01598, 0.00318, 0.02056, 0.99966],
  LeftHandPinky1: [0.29076, 0.0608, -0.07388, 0.952],
  LeftHandPinky2: [0.14395, 0.03296, 0.01142, 0.98897],
  LeftHandPinky3: [0, -0.03482, 0, 0.99939],
  LeftHandPinky4: [-0.03942, 0.02194, 0.01046, 0.99893],

  RightShoulder: [0.49305, -0.49232, 0.56244, 0.44518],
  RightArm: [0.54261, -0.29099, -0.17161, 0.76906],
  RightForeArm: [0.00351, 0.01814, -0.08703, 0.99603],
  RightHand: [-0.2397, 0.31182, -0.08695, 0.91529],
  RightHandThumb1: [0.2611, 0.00242, -0.13531, 0.95578],
  RightHandThumb2: [-0.01976, 0.01047, 0.13409, 0.99072],
  RightHandThumb3: [0, -0.00261, 0, 1],
  RightHandThumb4: [-0.03272, -0.0297, -0.04321, 0.99809],
  RightHandIndex1: [0.1724, 0.06755, 0.05496, 0.98117],
  RightHandIndex2: [0.04463, -0.03384, 0.0108, 0.99837],
  RightHandIndex3: [0, 0.047, 0, 0.99889],
  RightHandIndex4: [-0.06403, -0.04266, 0.03069, 0.99656],
  RightHandMiddle1: [0.17328, 0.00448, 0.04194, 0.98397],
  RightHandMiddle2: [0.09064, -0.02268, 0.00739, 0.9956],
  RightHandMiddle3: [0, 0.00726, 0, 0.99997],
  RightHandMiddle4: [-0.07934, -0.00227, 0.02302, 0.99658],
  RightHandRing1: [0.23259, -0.01125, 0.02654, 0.97215],
  RightHandRing2: [0.08155, -0.01686, 0.00328, 0.99652],
  RightHandRing3: [0, 0.01305, 0, 0.99991],
  RightHandRing4: [-0.01597, -0.00317, -0.02056, 0.99966],
  RightHandPinky1: [0.24855, -0.02262, 0.0284, 0.96794],
  RightHandPinky2: [0.11159, -0.0266, -0.02637, 0.99305],
  RightHandPinky3: [0, 0.03483, 0, 0.99939],
  RightHandPinky4: [-0.03943, -0.02195, -0.01046, 0.99893],
};

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
            // Natural realistic human skin for arms, wrists, and hands (no plastic/ceramic gloves)
            mat.roughness = 0.58;
            mat.metalness = 0.0;
            mat.color = new THREE.Color('#ffffff'); // Retain original natural skin texture
            mat.needsUpdate = true;
          } else if (mat.name === 'Wolf3D_Eye' || mat.name === 'EyeLeft' || mat.name === 'EyeRight') {
            mat.roughness = 0.05;
            mat.metalness = 0.15;
          } else if (child.name === 'Wolf3D_Hair' || mat.name === 'Wolf3D_Hair') {
            // Original natural hair with full texture highlights and natural strands
            mat.roughness = 0.65;
            mat.metalness = 0.05;
            mat.color = new THREE.Color('#ffffff'); // Retain full original hair texture map with highlights
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
      'LeftHandThumb1', 'LeftHandThumb2', 'LeftHandThumb3',
      'RightHandIndex1', 'RightHandIndex2', 'RightHandIndex3',
      'RightHandMiddle1', 'RightHandMiddle2', 'RightHandMiddle3',
      'RightHandRing1', 'RightHandRing2', 'RightHandRing3',
      'RightHandPinky1', 'RightHandPinky2', 'RightHandPinky3',
      'RightHandThumb1', 'RightHandThumb2', 'RightHandThumb3'
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

    // ── 1. Subtle Torso Breathing (Hands stay anchored and natural) ──
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

    // ── 2. Natural Seated Human Arm & Hand Rest Posture (100% Fixed & Natural) ──
    // Uses canonical resting pose from animations.glb with forearms naturally resting forward
    Object.entries(IDLE_ARM_FINGER_QUATS).forEach(([boneName, quatArr]) => {
      const b = bones[boneName];
      if (b) {
        b.quaternion.fromArray(quatArr);
      }
    });

    // Angle forearms comfortably forward resting naturally in lap / consultation desk
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotateZ(0.48);
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotateZ(-0.48);
    }

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
    <group position={[0, -1.28, -0.15]} rotation={[0, 0, 0]} scale={1.0}>
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
    <group position={[0, -0.04, -0.26]}>
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

      {/* 3. Compact Pearl-White Seat Cushion */}
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
  mentorName = 'Baatology AI Mentor',
  backgroundMode = 'office', // 'office' | 'black'
}) {
  const isBlack = backgroundMode === 'black';

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none flex items-center justify-center transition-colors duration-500 ${
        isBlack ? 'bg-[#000000]' : 'bg-[#090d16]'
      }`}
    >
      {/* 1. PHOTOREALISTIC FUTURISTIC GLASS BOARDROOM BACKGROUND (HIDDEN WHEN BLACK BACKGROUND SELECTED) */}
      {!isBlack && (
        <>
          <img
            src="/backgrounds/futuristic_glass_office_room.jpg"
            alt="Baatology Futuristic Glass Boardroom"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 filter brightness-[1.02] contrast-[1.03]"
            onError={(e) => {
              e.currentTarget.src = '/backgrounds/futuristic_mentor_session.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/15 pointer-events-none z-0" />
        </>
      )}

      {/* Atmospheric Rim Glows for Pure Black Mode */}
      {isBlack && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-48 rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>
      )}

      {/* 2. TRANSPARENT 3D CANVAS */}
      <div className="absolute inset-0 w-full h-full z-10">
        <Canvas
          shadows
          camera={{
            position: [0, 0.16, 0.82],
            fov: 39,
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

          {/* ── Floor / Chair Base Contact Shadows ── */}
          <ContactShadows
            position={[0, -0.42, -0.20]}
            opacity={0.48}
            scale={2.2}
            blur={2.0}
            far={1.5}
            color="#000000"
          />

          {/* ── Locked Camera Controls Focused at Eye Level (Intimate Face-to-Face Meeting Presence) ── */}
          <OrbitControls
            target={[0, 0.14, -0.15]}
            enableRotate={false}
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
      </div>
    </div>
  );
}
