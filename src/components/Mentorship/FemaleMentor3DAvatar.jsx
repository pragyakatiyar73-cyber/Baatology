import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ── Procedural Photorealistic Canvas Texture Generators ──
 */

// 1. Rich American Walnut Wood Grain Texture for Executive Table
function getWalnutWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich dark walnut gradient base
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#3a2214');
  grad.addColorStop(0.25, '#4e2f1c');
  grad.addColorStop(0.5, '#382012');
  grad.addColorStop(0.75, '#4a2c19');
  grad.addColorStop(1, '#361e11');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Fine fibrous wood grain lines
  for (let i = 0; i < 220; i++) {
    const y = Math.random() * 512;
    const h = 1 + Math.random() * 2.5;
    const alpha = 0.08 + Math.random() * 0.16;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(20, 10, 5, ${alpha})`
      : `rgba(110, 68, 38, ${alpha * 0.8})`;
    ctx.fillRect(0, y, 1024, h);
  }

  // Wavy organic growth rings
  ctx.strokeStyle = 'rgba(25, 12, 6, 0.15)';
  ctx.lineWidth = 2.2;
  for (let r = 0; r < 24; r++) {
    ctx.beginPath();
    let y = 20 + r * 22;
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64) {
      ctx.quadraticCurveTo(
        x + 32,
        y + Math.sin((x + r * 45) * 0.015) * 8 + (Math.random() - 0.5) * 2.5,
        x + 64,
        y
      );
    }
    ctx.stroke();
  }

  // Soft satin clear-coat lacquer sheen
  const sheen = ctx.createRadialGradient(512, 256, 60, 512, 256, 520);
  sheen.addColorStop(0, 'rgba(255, 235, 210, 0.14)');
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 1024, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

// 2. Napa Leather Desk Pad Texture with Golden Saddle Stitching
function getLeatherPadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark charcoal Napa leather base
  ctx.fillStyle = '#16181d';
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle natural pebble grain noise
  const imgData = ctx.getImageData(0, 0, 1024, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // High-end perimeter gold saddle stitching seam
  ctx.strokeStyle = '#d4af37'; // Luxury gold stitch
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(18, 18, 1024 - 36, 512 - 36);

  // Inner debossed groove line
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(26, 26, 1024 - 52, 512 - 52);

  return new THREE.CanvasTexture(canvas);
}

// 3. Laptop Screen Texture: Modern Dark IDE with Live Evaluation Code
function getLaptopScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  // Dark Theme Background (#181825)
  ctx.fillStyle = '#181825';
  ctx.fillRect(0, 0, 1024, 640);

  // Top Title Bar
  ctx.fillStyle = '#11111b';
  ctx.fillRect(0, 0, 1024, 38);

  // Window control dots (Mac traffic lights)
  ctx.fillStyle = '#f38ba8'; ctx.beginPath(); ctx.arc(22, 19, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f9e2af'; ctx.beginPath(); ctx.arc(42, 19, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a6e3a1'; ctx.beginPath(); ctx.arc(62, 19, 6, 0, Math.PI * 2); ctx.fill();

  // Active Code Tab
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(90, 8, 220, 30);
  ctx.fillStyle = '#cdd6f4';
  ctx.font = '13px monospace';
  ctx.fillText('interview_eval.tsx', 115, 27);

  // AuraGD Status Indicator
  ctx.fillStyle = '#313244';
  ctx.fillRect(780, 8, 225, 24);
  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('● AURAGD LIVE AI CO-PILOT', 795, 24);

  // Left Sidebar
  ctx.fillStyle = '#11111b';
  ctx.fillRect(0, 38, 160, 602);
  ctx.fillStyle = '#6c7086';
  ctx.font = '11px sans-serif';
  ctx.fillText('PROJECT', 16, 62);
  ctx.fillStyle = '#a6adc8';
  ctx.fillText('▾ candidate_eval', 20, 86);
  ctx.fillStyle = '#89b4fa';
  ctx.fillText('  ▸ algorithms.ts', 28, 108);
  ctx.fillText('  ▸ system_design.ts', 28, 128);
  ctx.fillText('  ● interview_eval.tsx', 28, 148);

  // Main Editor Area
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(160, 38, 864, 602);

  // Syntax highlighted code
  const codeLines = [
    { num: '1', tokens: [{ text: 'import', color: '#cba6f7' }, { text: ' { CandidateReport } ', color: '#cdd6f4' }, { text: 'from', color: '#cba6f7' }, { text: " '@auragd/core';", color: '#a6e3a1' }] },
    { num: '2', tokens: [{ text: 'const', color: '#cba6f7' }, { text: ' candidateProfile: CandidateReport = {', color: '#89b4fa' }] },
    { num: '3', tokens: [{ text: "  name: ", color: '#94e2d5' }, { text: "'Pragya Katiyar',", color: '#a6e3a1' }] },
    { num: '4', tokens: [{ text: "  role: ", color: '#94e2d5' }, { text: "'Software Development Engineer',", color: '#a6e3a1' }] },
    { num: '5', tokens: [{ text: "  algorithmScore: ", color: '#94e2d5' }, { text: '95.4,', color: '#fab387' }, { text: " // Optimal O(n) Single Pass", color: '#6c7086' }] },
    { num: '6', tokens: [{ text: "  systemDesign: ", color: '#94e2d5' }, { text: '92.8,', color: '#fab387' }] },
    { num: '7', tokens: [{ text: "  recommendation: ", color: '#94e2d5' }, { text: "'STRONG HIRE - VERIFIED',", color: '#a6e3a1' }] },
    { num: '8', tokens: [{ text: '};', color: '#89b4fa' }] },
    { num: '9', tokens: [{ text: 'export async function', color: '#cba6f7' }, { text: ' runEvaluationSession() {', color: '#89b4fa' }] },
    { num: '10', tokens: [{ text: '  await GeminiAI.', color: '#cdd6f4' }, { text: 'evaluateLiveCode', color: '#89b4fa' }, { text: '(candidateProfile);', color: '#cdd6f4' }] },
    { num: '11', tokens: [{ text: '  return ', color: '#cba6f7' }, { text: 'EvaluationStatus.', color: '#cdd6f4' }, { text: 'PASSED;', color: '#fab387' }] },
    { num: '12', tokens: [{ text: '}', color: '#89b4fa' }] },
  ];

  ctx.font = '14px monospace';
  codeLines.forEach((line, idx) => {
    const y = 75 + idx * 26;
    ctx.fillStyle = '#585b70';
    ctx.fillText(line.num.padStart(2, ' '), 180, y);

    let x = 220;
    line.tokens.forEach(tok => {
      ctx.fillStyle = tok.color;
      ctx.fillText(tok.text, x, y);
      x += ctx.measureText(tok.text).width;
    });
  });

  // Glowing status bar
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(160, 616, 864, 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('✓ TypeScript 5.4 • UTF-8 • 60 FPS • Dr. Ann Vance Evaluation Active', 180, 632);

  return new THREE.CanvasTexture(canvas);
}

// 4. Laptop Keyboard & Trackpad Texture
function getLaptopKeyboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 440;
  const ctx = canvas.getContext('2d');

  // Space Grey Keyboard well
  ctx.fillStyle = '#1c1f25';
  ctx.fillRect(0, 0, 1024, 440);

  // Key rows (Function, Numbers, QWERTY, ASDF, ZXCV, Spacebar)
  const rows = [
    { count: 14, h: 26, y: 15 },
    { count: 14, h: 42, y: 52 },
    { count: 14, h: 42, y: 106 },
    { count: 13, h: 42, y: 160 },
    { count: 12, h: 42, y: 214 },
    { count: 7, h: 48, y: 268 },
  ];

  rows.forEach((row, rIdx) => {
    const keyW = (1024 - 44 - (row.count - 1) * 8) / row.count;
    for (let c = 0; c < row.count; c++) {
      let x = 22 + c * (keyW + 8);
      let w = keyW;
      if (rIdx === 5 && c === 3) {
        w = keyW * 3.6;
      }
      ctx.fillStyle = '#101215'; // Matte black keycap
      ctx.beginPath();
      ctx.roundRect(x, row.y, w, row.h, 4);
      ctx.fill();

      // Subtle key edge bevel
      ctx.strokeStyle = '#2d333e';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Key legend glow dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(x + w / 2 - 4, row.y + row.h / 2 - 1, 8, 2);
    }
  });

  // Precision Glass Trackpad
  ctx.fillStyle = '#22262e';
  ctx.beginPath();
  ctx.roundRect(355, 335, 314, 88, 6);
  ctx.fill();
  ctx.strokeStyle = '#3d4452';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

// 5. Candidate Portfolio File / Dossier Texture
function getFileFolderTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');

  // Executive Navy Leather Dossier Folder
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 800, 1000);

  // Gold Perimeter Thread Stitching
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 6]);
  ctx.strokeRect(18, 18, 764, 964);
  ctx.setLineDash([]);

  // Brass Corner Reinforcements
  const drawCorner = (x, y, dx, dy) => {
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y);
    ctx.lineTo(x, y + dy);
    ctx.closePath();
    ctx.fill();
  };
  drawCorner(18, 18, 48, 48);
  drawCorner(782, 18, -48, 48);
  drawCorner(18, 982, 48, -48);
  drawCorner(782, 982, -48, -48);

  // White Evaluation Document Sheet
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(52, 52, 696, 896);

  // Metallic Header Clip
  ctx.fillStyle = '#475569';
  ctx.fillRect(320, 38, 160, 24);

  // Document Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('AURAGD SDE EVALUATION REPORT', 80, 112);

  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('CANDIDATE DOSSIER & TECHNICAL RUBRIC', 80, 136);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 150);
  ctx.lineTo(720, 150);
  ctx.stroke();

  // Candidate Details
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('CANDIDATE: Pragya Katiyar', 80, 185);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('POSITION: Software Development Engineer', 80, 208);
  ctx.fillText('LEAD EVALUATOR: Dr. Ann Vance (Staff Engineer)', 80, 230);
  ctx.fillText('STATUS: Mock Interview In Progress', 80, 252);

  // Rubric Score Bars
  const rubrics = [
    { label: 'Data Structures & Algorithms', pct: 95, color: '#10b981' },
    { label: 'System Design Architecture', pct: 92, color: '#06b6d4' },
    { label: 'Code Quality & Clean Architecture', pct: 96, color: '#6366f1' },
    { label: 'Technical Communication', pct: 94, color: '#f59e0b' },
  ];

  rubrics.forEach((r, idx) => {
    const y = 300 + idx * 58;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`${r.label} — ${r.pct}%`, 80, y);

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(80, y + 8, 640, 14, 7);
    ctx.fill();

    ctx.fillStyle = r.color;
    ctx.beginPath();
    ctx.roundRect(80, y + 8, (640 * r.pct) / 100, 14, 7);
    ctx.fill();
  });

  // Simulated paragraph text lines
  ctx.fillStyle = '#94a3b8';
  for (let l = 0; l < 7; l++) {
    const y = 560 + l * 20;
    ctx.fillRect(80, y, l === 6 ? 380 : 640, 6);
  }

  // Official Seal
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3;
  ctx.strokeRect(420, 750, 280, 70);
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('RECOMMENDED HIRE', 440, 792);

  return new THREE.CanvasTexture(canvas);
}

/**
 * SeatedFemaleMentorModel
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

        if (child.name === 'Wolf3D_Outfit_Footwear') {
          child.visible = false;
        }

        if (child.material) {
          const mat = child.material;
          if (mat.name === 'Wolf3D_Skin' || mat.name === 'Wolf3D_Body') {
            mat.roughness = 0.65;
            mat.metalness = 0.0;
            mat.color = new THREE.Color('#ffffff'); // Keep 100% natural skin texture for hands and face
          } else if (mat.name === 'Wolf3D_Eye' || mat.name === 'EyeLeft' || mat.name === 'EyeRight') {
            mat.roughness = 0.05;
            mat.metalness = 0.15;
          } else if (mat.name === 'Wolf3D_Glasses') {
            mat.roughness = 0.12;
            mat.metalness = 0.85;
            mat.color = new THREE.Color('#1e2430');
            mat.transparent = true;
            mat.opacity = 0.95;
          } else if (mat.name === 'Wolf3D_Hair') {
            mat.roughness = 0.48;
            mat.metalness = 0.12;
            mat.color = new THREE.Color('#221a15');
          } else if (mat.name === 'Wolf3D_Teeth') {
            mat.roughness = 0.22;
            mat.metalness = 0.0;
            mat.color = new THREE.Color('#fcfbf7');
          } else if (mat.name === 'Wolf3D_Outfit_Top' || mat.name?.includes('Outfit')) {
            mat.roughness = 0.82;
            mat.metalness = 0.05;
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
  }, [scene]);

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

    // ── 2. Natural Table-Rested Arm & Hand Posture (Stable on Desk Pad) ──
    // Left Arm & Hand on Desk Pad
    if (bones.LeftArm && restQuats.LeftArm) {
      bones.LeftArm.quaternion.copy(restQuats.LeftArm);
      bones.LeftArm.rotateX(0.32);
      bones.LeftArm.rotateZ(-0.20);
    }
    if (bones.LeftForeArm && restQuats.LeftForeArm) {
      bones.LeftForeArm.quaternion.copy(restQuats.LeftForeArm);
      bones.LeftForeArm.rotateZ(1.22);
    }
    if (bones.LeftHand && restQuats.LeftHand) {
      bones.LeftHand.quaternion.copy(restQuats.LeftHand);
      bones.LeftHand.rotateX(-0.10);
      bones.LeftHand.rotateZ(0.05);
    }

    // Right Arm & Hand on Desk Pad (Symmetrical)
    if (bones.RightArm && restQuats.RightArm) {
      bones.RightArm.quaternion.copy(restQuats.RightArm);
      bones.RightArm.rotateX(0.32);
      bones.RightArm.rotateZ(0.20);
    }
    if (bones.RightForeArm && restQuats.RightForeArm) {
      bones.RightForeArm.quaternion.copy(restQuats.RightForeArm);
      bones.RightForeArm.rotateZ(-1.22);
    }
    if (bones.RightHand && restQuats.RightHand) {
      bones.RightHand.quaternion.copy(restQuats.RightHand);
      bones.RightHand.rotateX(-0.10);
      bones.RightHand.rotateZ(-0.05);
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

/**
 * RealExecutiveOfficeChair
 */
function RealExecutiveOfficeChair() {
  return (
    <group position={[0, -0.06, -0.30]}>
      {/* Structural Chrome Exoskeleton Spine */}
      <mesh position={[0, 0.06, -0.07]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.72, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.94} roughness={0.14} />
      </mesh>

      <mesh position={[0, 0.28, -0.05]}>
        <boxGeometry args={[0.32, 0.024, 0.035]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.16} />
      </mesh>

      <mesh position={[0, -0.12, -0.05]}>
        <boxGeometry args={[0.36, 0.03, 0.035]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.16} />
      </mesh>

      {/* Lumbar Tension Adjustment Knobs */}
      <mesh position={[-0.20, -0.12, -0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.035, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.12} />
      </mesh>
      <mesh position={[0.20, -0.12, -0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.035, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.12} />
      </mesh>

      {/* Contoured High Backrest */}
      <RoundedBox
        args={[0.36, 0.50, 0.065]}
        radius={0.028}
        smoothness={4}
        position={[0, 0.06, -0.02]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#16181f" roughness={0.44} metalness={0.12} />
      </RoundedBox>

      {/* Tailored Pleat Creases */}
      {[-0.10, -0.02, 0.07, 0.16, 0.24].map((yPos, idx) => (
        <mesh key={idx} position={[0, yPos, 0.014]}>
          <boxGeometry args={[0.32, 0.005, 0.008]} />
          <meshStandardMaterial color="#0b0c10" roughness={0.8} />
        </mesh>
      ))}

      {/* Lateral Shoulder Bolster Wings */}
      <group position={[-0.20, 0.08, -0.01]} rotation={[0, 0.28, 0]}>
        <RoundedBox args={[0.08, 0.46, 0.055]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#14161c" roughness={0.46} metalness={0.1} />
        </RoundedBox>
        <mesh position={[-0.038, 0, 0]}>
          <boxGeometry args={[0.006, 0.44, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>

      <group position={[0.20, 0.08, -0.01]} rotation={[0, -0.28, 0]}>
        <RoundedBox args={[0.08, 0.46, 0.055]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#14161c" roughness={0.46} metalness={0.1} />
        </RoundedBox>
        <mesh position={[0.038, 0, 0]}>
          <boxGeometry args={[0.006, 0.44, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>

      {/* Lumbar Cushion */}
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

      {/* Ergonomic Headrest */}
      <mesh position={[-0.06, 0.36, -0.045]} rotation={[-0.14, 0, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.16, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.10} />
      </mesh>
      <mesh position={[0.06, 0.36, -0.045]} rotation={[-0.14, 0, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.16, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.10} />
      </mesh>
      <mesh position={[0, 0.43, -0.038]}>
        <boxGeometry args={[0.18, 0.018, 0.024]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.94} roughness={0.12} />
      </mesh>
      <RoundedBox
        args={[0.28, 0.14, 0.07]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.44, -0.015]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#16181f" roughness={0.42} metalness={0.12} />
      </RoundedBox>

      {/* Executive 4D Armrests */}
      <group position={[-0.28, -0.16, 0.05]}>
        <mesh position={[0, -0.07, -0.08]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.18, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[0.02, -0.01, -0.03]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.05, 0.02, 0.14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <RoundedBox args={[0.085, 0.032, 0.26]} radius={0.014} smoothness={4} position={[0.02, 0.01, 0.0]} castShadow>
          <meshStandardMaterial color="#1a1c22" roughness={0.52} metalness={0.1} />
        </RoundedBox>
      </group>

      <group position={[0.28, -0.16, 0.05]}>
        <mesh position={[0, -0.07, -0.08]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.18, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[-0.02, -0.01, -0.03]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.05, 0.02, 0.14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <RoundedBox args={[0.085, 0.032, 0.26]} radius={0.014} smoothness={4} position={[-0.02, 0.01, 0.0]} castShadow>
          <meshStandardMaterial color="#1a1c22" roughness={0.52} metalness={0.1} />
        </RoundedBox>
      </group>

      {/* Seat Cushion */}
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
 * Ultra-Realistic Executive Consultation Table with Photorealistic Props:
 * - Real American Walnut Polished Wood Surface (authentic grain, warm tones & lacquer sheen)
 * - Napa Leather Desk Pad with real golden saddle-stitch seam
 * - Photorealistic Slim MacBook Pro with live IDE evaluation dashboard screen, keyboard keycaps & trackpad
 * - Glossy Porcelain Ceramic Coffee Mug with C-Handle, Saucer, and hot Crema Espresso
 * - Executive Candidate Portfolio File / Dossier Folder with evaluation rubrics & brass corner clips
 * - Luxury Brushed Gold & Black Executive Pen
 */
function ExecutiveConsultationDesk({ textures }) {
  return (
    <group position={[0, -0.20, 0.16]}>
      {/* ── 1. REAL AMERICAN WALNUT WOODEN TABLETOP ── */}
      <RoundedBox
        args={[2.4, 0.044, 0.88]}
        radius={0.016}
        smoothness={4}
        position={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={textures.walnut}
          color="#523624" // Warm, rich American Walnut wood tone
          roughness={0.28} // High-end furniture satin lacquer reflection
          metalness={0.06}
        />
      </RoundedBox>

      {/* Front Beveled Edge Trim (Layered architectural profile) */}
      <mesh position={[0, -0.024, 0.43]}>
        <boxGeometry args={[2.38, 0.012, 0.02]} />
        <meshStandardMaterial color="#2d1a0f" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Brushed Brass Inlay Accent Line along the front edge */}
      <mesh position={[0, 0.0225, 0.38]}>
        <boxGeometry args={[2.3, 0.002, 0.005]} />
        <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.2} />
      </mesh>

      {/* ── 2. REAL NAPA LEATHER DESK PAD / BLOTTER ── */}
      {/* Both mentor hands rest stably & flat on this pad */}
      <RoundedBox
        args={[0.82, 0.008, 0.40]}
        radius={0.008}
        smoothness={4}
        position={[0, 0.024, -0.05]}
        receiveShadow
      >
        <meshStandardMaterial
          map={textures.leatherPad}
          color="#ffffff"
          roughness={0.45}
          metalness={0.08}
        />
      </RoundedBox>

      {/* ── 3. PHOTOREALISTIC SLIM EXECUTIVE LAPTOP (On the Left) ── */}
      <group position={[-0.52, 0.026, -0.01]} rotation={[0, 0.28, 0]}>
        {/* Precision Unibody Aluminum Base Chassis */}
        <RoundedBox args={[0.30, 0.010, 0.20]} radius={0.006} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#474b54" metalness={0.92} roughness={0.22} />
        </RoundedBox>

        {/* Keyboard & Trackpad Surface */}
        <mesh position={[0, 0.0055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.29, 0.19]} />
          <meshStandardMaterial map={textures.laptopKeyboard} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Open Display Screen Lid (Tilted back at 108 degrees) */}
        <group position={[0, 0.005, -0.10]} rotation={[-0.30, 0, 0]}>
          {/* Aluminum Display Lid Backing */}
          <RoundedBox args={[0.30, 0.19, 0.006]} radius={0.006} smoothness={4} position={[0, 0.095, 0]} castShadow>
            <meshStandardMaterial color="#474b54" metalness={0.92} roughness={0.22} />
          </RoundedBox>

          {/* Glowing Retina Display Screen with IDE Evaluation Dashboard */}
          <mesh position={[0, 0.095, 0.0035]}>
            <planeGeometry args={[0.285, 0.175]} />
            <meshStandardMaterial
              map={textures.laptopScreen}
              emissive="#112233"
              emissiveIntensity={0.2}
              roughness={0.12}
            />
          </mesh>

          {/* Display Glass Specular Rim */}
          <mesh position={[0, 0.095, 0.0038]}>
            <planeGeometry args={[0.285, 0.175]} />
            <meshPhysicalMaterial
              transmission={0.3}
              opacity={0.3}
              transparent
              roughness={0.05}
              ior={1.5}
            />
          </mesh>
        </group>
      </group>

      {/* ── 4. REAL EXECUTIVE CANDIDATE FILE / DOSSIER FOLDER (On the Right) ── */}
      <group position={[0.50, 0.025, -0.02]} rotation={[0, -0.18, 0]}>
        {/* Leather Dossier Binder */}
        <RoundedBox args={[0.25, 0.008, 0.31]} radius={0.006} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.15} />
        </RoundedBox>

        {/* Document Sheet with Evaluation Rubrics & Metrics */}
        <mesh position={[0, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.24, 0.30]} />
          <meshStandardMaterial map={textures.fileFolder} roughness={0.7} metalness={0.05} />
        </mesh>

        {/* 4 Brass Corner Protectors */}
        {[
          [-0.12, -0.15],
          [0.12, -0.15],
          [-0.12, 0.15],
          [0.12, 0.15],
        ].map(([cx, cz], i) => (
          <mesh key={i} position={[cx, 0.005, cz]}>
            <boxGeometry args={[0.015, 0.003, 0.015]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}

        {/* Luxury Gold & Black Ballpoint Pen resting on the Dossier */}
        <group position={[0.02, 0.012, 0.02]} rotation={[0, 0.25, 0]}>
          {/* Pen Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.004, 0.004, 0.14, 20]} />
            <meshStandardMaterial color="#090a0f" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Gold Pocket Clip */}
          <mesh position={[0.005, 0.03, 0]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[0.002, 0.05, 0.003]} />
            <meshStandardMaterial color="#d4af37" metalness={0.96} roughness={0.12} />
          </mesh>
          {/* Gold Accent Rings */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.0043, 0.0043, 0.008, 20]} />
            <meshStandardMaterial color="#d4af37" metalness={0.96} roughness={0.12} />
          </mesh>
        </group>
      </group>

      {/* ── 5. REAL PORCELAIN CERAMIC COFFEE CUP WITH C-HANDLE & SAUCER ── */}
      <group position={[0.30, 0.025, -0.13]}>
        {/* Ceramic Saucer with Beveled Glaze Rim */}
        <mesh position={[0, 0.004, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.058, 0.042, 0.008, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.12} metalness={0.06} />
        </mesh>
        {/* Saucer Inner Indentation */}
        <mesh position={[0, 0.0081, 0]}>
          <cylinderGeometry args={[0.036, 0.034, 0.001, 32]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.15} />
        </mesh>

        {/* Glossy White Ceramic Mug Body */}
        <mesh position={[0, 0.044, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.036, 0.030, 0.072, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.12} metalness={0.06} />
        </mesh>

        {/* Real C-Shaped Ceramic Handle */}
        <mesh position={[0.036, 0.044, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <torusGeometry args={[0.020, 0.0045, 16, 32, Math.PI * 1.15]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.12} metalness={0.06} />
        </mesh>

        {/* Fresh Hot Espresso Liquid with Golden Crema Swirl */}
        <mesh position={[0, 0.072, 0]}>
          <cylinderGeometry args={[0.033, 0.033, 0.002, 32]} />
          <meshStandardMaterial color="#2b1509" roughness={0.18} metalness={0.1} />
        </mesh>
        {/* Crema Froth Foam Ring */}
        <mesh position={[0, 0.073, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.024, 0.032, 24]} />
          <meshStandardMaterial color="#966138" roughness={0.35} />
        </mesh>
      </group>

      {/* ── 6. FRONT MODESTY PANEL / DESK APRON ── */}
      <mesh position={[0, -0.24, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.44, 0.025]} />
        <meshStandardMaterial color="#180e08" roughness={0.65} metalness={0.05} />
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
 */
export default function FemaleMentor3DAvatar({
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mentorName = 'Dr. Ann Vance',
}) {
  // Pre-generate procedural textures once on mount for performance & realism
  const textures = useMemo(() => {
    return {
      walnut: getWalnutWoodTexture(),
      leatherPad: getLeatherPadTexture(),
      laptopScreen: getLaptopScreenTexture(),
      laptopKeyboard: getLaptopKeyboardTexture(),
      fileFolder: getFileFolderTexture(),
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#090d16] flex items-center justify-center">
      {/* 1. FIXED FULL-SCREEN PHOTOREALISTIC EXECUTIVE ROOM BACKGROUND */}
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

      {/* 2. TRANSPARENT 3D CANVAS */}
      <div className="absolute inset-0 w-full h-full z-10">
        <Canvas
          shadows
          camera={{
            position: [0, 0.04, 1.45],
            fov: 42,
            near: 0.1,
            far: 20,
          }}
          className="w-full h-full"
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* ── Cinematic Multi-Source Studio Lighting ── */}
          <ambientLight intensity={0.95} color="#fff6ed" />

          {/* Key Directional Light */}
          <directionalLight
            position={[1.2, 1.6, 1.8]}
            intensity={1.8}
            color="#fffaf5"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          {/* Left Warm Desk Lamp Specular Spotlight */}
          <pointLight
            position={[-0.7, 0.5, 0.4]}
            intensity={1.2}
            color="#ffe4b5"
            distance={2.8}
            castShadow
          />

          {/* Right Soft Rim Light */}
          <pointLight
            position={[1.4, 0.7, 0.5]}
            intensity={0.6}
            color="#e2e8f0"
            distance={3.2}
          />

          {/* Top Hair Rim Light */}
          <pointLight
            position={[0, 1.7, -0.9]}
            intensity={0.7}
            color="#fed7aa"
            distance={3.5}
          />

          {/* ── Luxury Executive Ergonomic Chair ── */}
          <RealExecutiveOfficeChair />

          {/* ── 3D Seated Mentor Avatar Model ── */}
          <Suspense fallback={<ModelLoader />}>
            <SeatedFemaleMentorModel
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={isThinking}
            />
          </Suspense>

          {/* ── Real American Walnut Table with Photorealistic Laptop, Cup & File ── */}
          <ExecutiveConsultationDesk textures={textures} />

          {/* ── Floor / Desk Contact Shadows ── */}
          <ContactShadows
            position={[0, -0.22, 0.16]}
            opacity={0.65}
            scale={2.6}
            blur={2.0}
            far={1.5}
            color="#000000"
          />

          {/* ── Locked Camera Controls ── */}
          <OrbitControls
            target={[0, 0.02, 0]}
            enableRotate={false}
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
      </div>
    </div>
  );
}
