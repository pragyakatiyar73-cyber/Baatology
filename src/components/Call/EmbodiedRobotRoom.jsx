import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Sparkles,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import { MODES } from '../../utils/aiResponses';

// ── 1. Procedural Texture Generators for Ultra-Realism ──

// Glowing Code Screen for the Laptop on the left desk
function useCodeScreenTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // IDE Editor Background (Dark Theme)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 320);

    // Header / Tabs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('● Solution.jsx', 16, 18);
    ctx.fillStyle = '#64748b';
    ctx.fillText('ArenaGD.ts', 140, 18);

    // Code lines with colorful syntax highlighting
    const lines = [
      { text: 'import { useAuraMentor } from "@baatology/ai";', col: '#c084fc' },
      { text: '', col: '#fff' },
      { text: 'export function PlacementEvaluator({ candidate }) {', col: '#60a5fa' },
      { text: '  const { eyeContact, fluency } = useVoiceHUD();', col: '#34d399' },
      { text: '  const starScore = evaluateSTAR(candidate.pitch);', col: '#fbbf24' },
      { text: '  if (starScore >= 85 && eyeContact > 80) {', col: '#f43f5e' },
      { text: '    return { status: "PLACEMENT_READY", confidence: 96 };', col: '#a7f3d0' },
      { text: '  }', col: '#60a5fa' },
      { text: '  return generateDynamicFollowup(starScore);', col: '#38bdf8' },
      { text: '}', col: '#60a5fa' },
    ];

    ctx.font = '13px "Courier New", monospace';
    lines.forEach((l, i) => {
      if (l.text) {
        ctx.fillStyle = l.col;
        ctx.fillText(l.text, 24, 56 + i * 24);
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);
}

// Glowing Frosted Glass Chest Badge ("Baatology AI Mentor 🤖")
function useBadgeTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    // Badge Base
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 256, 96);

    // Glowing cyan frame
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 5;
    ctx.strokeRect(4, 4, 248, 88);

    // Text Content
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Baatology', 24, 42);

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('AI Mentor 🤖', 24, 74);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);
}

// ── 2. Materials Factory ──
function useStudioMaterials() {
  return useMemo(() => {
    return {
      // Dark metallic / gunmetal face and skull
      gunmetal: new THREE.MeshStandardMaterial({
        color: '#252d3a',
        metalness: 0.88,
        roughness: 0.22,
      }),
      // Carbon fiber scalp and joints
      carbonFiber: new THREE.MeshStandardMaterial({
        color: '#131820',
        metalness: 0.72,
        roughness: 0.38,
      }),
      // Brushed rich gold accent plates
      gold: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        emissive: '#7a5c10',
        emissiveIntensity: 0.25,
        metalness: 0.92,
        roughness: 0.24,
      }),
      // Casual olive-taupe heather hoodie fabric
      hoodieFabric: new THREE.MeshStandardMaterial({
        color: '#554f46',
        roughness: 0.88,
        metalness: 0.08,
      }),
      // Hoodie drawstrings
      hoodieCords: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.7,
        metalness: 0.1,
      }),
      // Warm amber LED eyes
      amberLed: new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        emissive: '#f59e0b',
        emissiveIntensity: 3.2,
        roughness: 0.1,
        metalness: 0.1,
      }),
      // Cyan emissive detail lines
      cyanGlow: new THREE.MeshStandardMaterial({
        color: '#00e5ff',
        emissive: '#00e5ff',
        emissiveIntensity: 2.5,
        roughness: 0.2,
      }),
      // White study desk
      deskWhite: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.3,
        metalness: 0.1,
      }),
      // Dark laptop chassis
      laptopChassis: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        metalness: 0.8,
        roughness: 0.3,
      }),
      // Wood bookshelf
      woodShelf: new THREE.MeshStandardMaterial({
        color: '#3d2817',
        roughness: 0.7,
        metalness: 0.1,
      }),
      // Cozy study room back wall
      roomWall: new THREE.MeshStandardMaterial({
        color: '#cfc4b2',
        roughness: 0.95,
        metalness: 0.05,
      }),
    };
  }, []);
}

// ── 3. Study Room Background Environment ──
function CozyRoomEnvironment() {
  const materials = useStudioMaterials();
  const codeTexture = useCodeScreenTexture();
  const stringLightsRef = useRef([]);

  // Generate colorful fairy lights along the bookshelf and wall
  const fairyLights = useMemo(() => {
    const list = [];
    const colors = ['#f59e0b', '#06b6d4', '#fbbf24', '#10b981', '#fef08a'];
    for (let i = 0; i < 18; i++) {
      const y = 1.6 - i * 0.13;
      const x = -2.3 + Math.sin(i * 0.6) * 0.12;
      const z = -2.1 + (i % 2 === 0 ? 0.08 : -0.08);
      list.push({ pos: [x, y, z], color: colors[i % colors.length] });
    }
    return list;
  }, []);

  // Bookshelf colorful books
  const books = useMemo(() => {
    const bookColors = ['#0284c7', '#ea580c', '#16a34a', '#854d0e', '#7c3aed', '#b91c1c', '#0f766e'];
    const bList = [];
    // Shelf 1
    for (let i = 0; i < 8; i++) {
      bList.push({
        pos: [-2.6 + i * 0.08, 0.72, -2.4],
        size: [0.06, 0.28 + (i % 3) * 0.04, 0.22],
        color: bookColors[i % bookColors.length],
        rot: i === 7 ? -0.18 : 0,
      });
    }
    // Shelf 2
    for (let i = 0; i < 7; i++) {
      bList.push({
        pos: [-2.5 + i * 0.09, 0.22, -2.4],
        size: [0.07, 0.25 + (i % 2) * 0.05, 0.22],
        color: bookColors[(i + 3) % bookColors.length],
        rot: i === 0 ? 0.15 : 0,
      });
    }
    return bList;
  }, []);

  // Gentle twinkle animation for string lights
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    stringLightsRef.current.forEach((mesh, idx) => {
      if (mesh) {
        mesh.material.emissiveIntensity = 2.0 + Math.sin(t * 3.0 + idx * 0.8) * 0.8;
      }
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ── Room Back & Side Walls ── */}
      {/* Back Wall */}
      <mesh position={[0, 0.8, -3.2]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <primitive object={materials.roomWall} attach="material" />
      </mesh>

      {/* Left Wall with Window Frame */}
      <mesh position={[-4.5, 0.8, -1.0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#8c9aa8" roughness={0.9} />
      </mesh>

      {/* Sheer Window Curtain on Left */}
      <mesh position={[-3.6, 0.9, -1.2]} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[1.6, 3.4]} />
        <meshStandardMaterial
          color="#f1f5f9"
          transparent
          opacity={0.4}
          roughness={0.9}
        />
      </mesh>

      {/* ── Posters on the Right Wall (Mimicking image_11.png) ── */}
      <mesh position={[2.2, 1.4, -3.18]}>
        <planeGeometry args={[0.7, 0.95]} />
        <meshStandardMaterial color="#0f766e" roughness={0.6} />
      </mesh>
      <mesh position={[3.1, 1.4, -3.18]}>
        <planeGeometry args={[0.7, 0.95]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.6} />
      </mesh>

      {/* ── Bookshelf on the Left ── */}
      <group position={[-2.3, 0.45, -2.4]}>
        {/* Shelf Planks */}
        {[-0.45, 0.05, 0.55, 1.05].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} receiveShadow>
            <boxGeometry args={[0.9, 0.035, 0.35]} />
            <primitive object={materials.woodShelf} attach="material" />
          </mesh>
        ))}
        {/* Shelf Uprights */}
        {[-0.43, 0.43].map((x, i) => (
          <mesh key={i} position={[x, 0.3, 0]}>
            <boxGeometry args={[0.035, 1.55, 0.35]} />
            <primitive object={materials.woodShelf} attach="material" />
          </mesh>
        ))}

        {/* Books on Shelves */}
        {books.map((b, i) => (
          <mesh key={i} position={b.pos} rotation={[0, 0, b.rot]}>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} roughness={0.5} />
          </mesh>
        ))}

        {/* Small Potted Plant on top shelf */}
        <mesh position={[0.2, 0.65, 0]}>
          <cylinderGeometry args={[0.07, 0.05, 0.12, 12]} />
          <meshStandardMaterial color="#c2410c" roughness={0.6} />
        </mesh>
        <mesh position={[0.2, 0.74, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
      </group>

      {/* ── Bedroom String Lights (Fairy Lights) ── */}
      {fairyLights.map((light, idx) => (
        <mesh
          key={idx}
          ref={(el) => (stringLightsRef.current[idx] = el)}
          position={light.pos}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color={light.color}
            emissive={light.color}
            emissiveIntensity={2.5}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* ── Cozy Bed with Backpack in Right Background ── */}
      <group position={[2.6, -0.2, -2.4]}>
        {/* Bed Duvet */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.45, 1.6]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* Backpack resting on bed */}
        <mesh position={[-0.1, 0.32, 0.1]} rotation={[-0.2, 0.2, 0]}>
          <boxGeometry args={[0.34, 0.42, 0.22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>

      {/* ── White Study Desk (Foreground) ── */}
      <mesh position={[0, -0.68, 0.15]} receiveShadow>
        <boxGeometry args={[5.2, 0.08, 2.0]} />
        <primitive object={materials.deskWhite} attach="material" />
      </mesh>

      {/* ── Left Laptop with Glowing IDE Code ── */}
      <group position={[-1.3, -0.52, 0.45]} rotation={[0.05, 0.45, 0]}>
        {/* Laptop Base Keyboard */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.018, 0.38]} />
          <primitive object={materials.laptopChassis} attach="material" />
        </mesh>
        {/* Trackpad */}
        <mesh position={[0, 0.01, 0.1]}>
          <planeGeometry args={[0.15, 0.09]} />
          <meshStandardMaterial color="#334155" roughness={0.3} />
        </mesh>
        {/* Angled Laptop Screen */}
        <group position={[0, 0.01, -0.19]} rotation={[-0.25, 0, 0]}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.55, 0.36, 0.015]} />
            <primitive object={materials.laptopChassis} attach="material" />
          </mesh>
          {/* Glowing Code Screen */}
          <mesh position={[0, 0.18, 0.009]}>
            <planeGeometry args={[0.52, 0.33]} />
            <meshBasicMaterial map={codeTexture} />
          </mesh>
        </group>
      </group>

      {/* ── Right Laptop Foreground Edge ── */}
      <group position={[1.4, -0.48, 0.8]} rotation={[-0.1, -0.5, 0]}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.56, 0.38, 0.018]} />
          <primitive object={materials.laptopChassis} attach="material" />
        </mesh>
      </group>

      {/* ── Ergonomic Black Mesh Office Chair behind Robot ── */}
      <group position={[0, 0.1, -0.6]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.85, 1.1, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Headrest */}
        <mesh position={[0, 0.82, 0.02]}>
          <boxGeometry args={[0.45, 0.18, 0.08]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ── 4. Expressive 3D Robot Character (Humanoid Android with Hoodie) ──
function ExpressiveHumanoidRobot({
  isSpeaking,
  isListening,
  isThinking,
  isConcluding,
}) {
  const materials = useStudioMaterials();
  const badgeTexture = useBadgeTexture();

  const robotRootRef = useRef();
  const headGroupRef = useRef();
  const mouthRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const rightArmRef = useRef();
  const leftHandRef = useRef();
  const badgeMatRef = useRef();

  // Dynamic animation and audio-synced articulation
  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;

    // ── 1. Idle Breathing & Torso Float ──
    if (robotRootRef.current) {
      robotRootRef.current.position.y = -0.64 + Math.sin(t * 1.6) * 0.018;
      robotRootRef.current.position.z = -0.18 + Math.sin(t * 1.6) * 0.01;
    }

    // ── 2. Head Gaze & Expressive Movement ──
    if (headGroupRef.current) {
      const targetRotY = pointer.x * 0.25;
      const targetRotX = -pointer.y * 0.15;
      headGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.y,
        targetRotY,
        0.05
      );
      headGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.x,
        targetRotX,
        0.05
      );

      // Conversational nod/tilt while speaking
      if (isSpeaking) {
        headGroupRef.current.rotation.x += Math.sin(t * 4.2) * 0.035;
        headGroupRef.current.rotation.z = Math.sin(t * 1.8) * 0.025;
      } else if (isListening) {
        // Attentive forward lean towards candidate
        headGroupRef.current.rotation.x += 0.08;
      }
    }

    // ── 3. Eye Blinking (Warm Amber LED Eyes) ──
    const blinkCycle = t % 4.2;
    const isBlinking = blinkCycle > 4.0 && blinkCycle < 4.16;
    const eyeScaleY = isBlinking ? 0.08 : 1.0;
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.set(1, eyeScaleY, 1);
      rightEyeRef.current.scale.set(1, eyeScaleY, 1);
    }

    // ── 4. Speech Synchronization (Mouth & Gesture) ──
    if (mouthRef.current) {
      if (isSpeaking) {
        const mouthOpen = 0.5 + Math.abs(Math.sin(t * 14)) * 1.4;
        mouthRef.current.scale.set(1, mouthOpen, 1);
        mouthRef.current.position.y = -0.14 - (mouthOpen - 1) * 0.015;
      } else {
        mouthRef.current.scale.set(1, 1, 1);
        mouthRef.current.position.y = -0.14;
      }
    }

    // ── 5. Right Arm Welcoming Gesture ──
    if (rightArmRef.current) {
      if (isSpeaking) {
        // Natural hand gesture pulsation while talking
        rightArmRef.current.position.y = 0.28 + Math.sin(t * 2.8) * 0.025;
        rightArmRef.current.rotation.z = -0.35 + Math.sin(t * 2.8) * 0.04;
      } else {
        rightArmRef.current.position.y = 0.28 + Math.sin(t * 1.6) * 0.01;
        rightArmRef.current.rotation.z = -0.35;
      }
    }

    // ── 6. Chest Badge Glow Pulse ──
    if (badgeMatRef.current) {
      badgeMatRef.current.emissiveIntensity = isSpeaking
        ? 2.2 + Math.sin(t * 6.0) * 0.8
        : 1.4 + Math.sin(t * 1.8) * 0.3;
    }
  });

  return (
    <group ref={robotRootRef} position={[0, -0.64, -0.18]}>
      {/* ════════════════ TORSO & HOODIE ════════════════ */}
      <group position={[0, 0.45, 0]}>
        {/* Casual Hoodie Torso Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.46, 0.44, 0.78, 16]} />
          <primitive object={materials.hoodieFabric} attach="material" />
        </mesh>

        {/* Draped Hood Collar around neck */}
        <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.12, 12, 24]} />
          <primitive object={materials.hoodieFabric} attach="material" />
        </mesh>

        {/* Hoodie Drawstrings */}
        {[-0.08, 0.08].map((x, i) => (
          <group key={i} position={[x, 0.28, 0.26]}>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.24, 8]} />
              <primitive object={materials.hoodieCords} attach="material" />
            </mesh>
            {/* Metal Aglet Tip */}
            <mesh position={[0, -0.24, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.035, 8]} />
              <primitive object={materials.gold} attach="material" />
            </mesh>
          </group>
        ))}

        {/* AuraGD AI Mentor Glowing Chest Badge */}
        <mesh position={[0.16, 0.18, 0.26]} rotation={[0, 0.12, 0]}>
          <boxGeometry args={[0.24, 0.09, 0.02]} />
          <meshBasicMaterial
            ref={badgeMatRef}
            map={badgeTexture}
            transparent
            opacity={0.96}
          />
        </mesh>

        {/* Exposed Shoulder Gold Plates */}
        {[-0.48, 0.48].map((x, i) => (
          <mesh key={i} position={[x, 0.3, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <primitive object={materials.gold} attach="material" />
          </mesh>
        ))}
      </group>

      {/* ════════════════ SEGMENTED ROBOT NECK ════════════════ */}
      <group position={[0, 0.9, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 0.18, 14]} />
          <primitive object={materials.carbonFiber} attach="material" />
        </mesh>
        {/* Cyan Internal Glow Rings */}
        {[-0.04, 0.04].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.135, 0.135, 0.025, 14]} />
            <primitive object={materials.cyanGlow} attach="material" />
          </mesh>
        ))}
      </group>

      {/* ════════════════ HUMANOID ANDROID HEAD ════════════════ */}
      <group ref={headGroupRef} position={[0, 1.18, 0]}>
        {/* Main Sleek Gunmetal Faceplate & Skull */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.28, 20, 20]} />
          <primitive object={materials.gunmetal} attach="material" />
        </mesh>

        {/* Jaw & Chin Sculpt */}
        <mesh position={[0, -0.16, 0.06]}>
          <boxGeometry args={[0.22, 0.16, 0.22]} />
          <primitive object={materials.gunmetal} attach="material" />
        </mesh>

        {/* Top Scalp Carbon Fiber Insert */}
        <mesh position={[0, 0.15, -0.04]}>
          <sphereGeometry args={[0.24, 16, 16]} />
          <primitive object={materials.carbonFiber} attach="material" />
        </mesh>

        {/* Curved Gold Crown / Forehead Brow Plate */}
        <mesh position={[0, 0.12, 0.18]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.34, 0.07, 0.12]} />
          <primitive object={materials.gold} attach="material" />
        </mesh>

        {/* Temple & Cheek Gold Accents */}
        {[-0.24, 0.24].map((x, i) => (
          <mesh key={i} position={[x, 0.02, 0.08]} rotation={[0, 0, i === 0 ? 0.3 : -0.3]}>
            <boxGeometry args={[0.04, 0.2, 0.12]} />
            <primitive object={materials.gold} attach="material" />
          </mesh>
        ))}

        {/* Sculpted Nose Bridge */}
        <mesh position={[0, -0.01, 0.25]}>
          <boxGeometry args={[0.045, 0.09, 0.05]} />
          <primitive object={materials.gunmetal} attach="material" />
        </mesh>

        {/* ── Warm Amber LED Digital Eyes (Friendly Almond Contour) ── */}
        {[-0.09, 0.09].map((sideX, i) => (
          <group key={i} position={[sideX, 0.05, 0.24]}>
            {/* Recessed Eye Socket Frame */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.048, 0.02]} />
              <primitive object={materials.carbonFiber} attach="material" />
            </mesh>
            {/* Glowing Amber Eye Surface */}
            <mesh
              ref={i === 0 ? leftEyeRef : rightEyeRef}
              position={[0, 0, 0.008]}
            >
              <planeGeometry args={[0.072, 0.042]} />
              <primitive object={materials.amberLed} attach="material" />
            </mesh>
          </group>
        ))}

        {/* ── Expressive Articulated Mouth ── */}
        <mesh ref={mouthRef} position={[0, -0.14, 0.24]}>
          <boxGeometry args={[0.13, 0.028, 0.03]} />
          <meshStandardMaterial
            color="#0b101b"
            emissive="#1e293b"
            emissiveIntensity={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Gold Chin Accent */}
        <mesh position={[0, -0.22, 0.16]}>
          <boxGeometry args={[0.11, 0.04, 0.08]} />
          <primitive object={materials.gold} attach="material" />
        </mesh>

        {/* Cylindrical Side Ear Nodes */}
        {[-0.28, 0.28].map((x, i) => (
          <group key={i} position={[x, 0.02, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
              <primitive object={materials.gunmetal} attach="material" />
            </mesh>
            <mesh position={[i === 0 ? -0.022 : 0.022, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.015, 12]} />
              <primitive object={materials.gold} attach="material" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ════════════════ RIGHT ARM: OPEN WELCOMING GESTURE ════════════════ */}
      <group ref={rightArmRef} position={[0.56, 0.28, 0]}>
        {/* Upper Arm angled forward toward viewer */}
        <mesh position={[0.14, -0.12, 0.16]} rotation={[-0.6, 0.35, -0.4]}>
          <cylinderGeometry args={[0.07, 0.06, 0.32, 12]} />
          <primitive object={materials.hoodieFabric} attach="material" />
        </mesh>

        {/* Exposed Elbow Mechanical Joint */}
        <mesh position={[0.24, -0.25, 0.32]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <primitive object={materials.gold} attach="material" />
        </mesh>

        {/* Metallic Forearm extending toward candidate */}
        <mesh position={[0.32, -0.18, 0.52]} rotation={[-0.2, 0.5, -0.2]}>
          <cylinderGeometry args={[0.055, 0.045, 0.34, 12]} />
          <primitive object={materials.gunmetal} attach="material" />
        </mesh>

        {/* Open Welcoming Palm Facing Upward */}
        <group position={[0.39, -0.14, 0.72]} rotation={[-0.2, 0.4, 0.2]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.13, 0.035, 0.14]} />
            <primitive object={materials.gunmetal} attach="material" />
          </mesh>
          {/* 5 Welcoming Articulated Fingers */}
          {[-0.045, -0.02, 0.005, 0.03, 0.055].map((x, i) => (
            <mesh
              key={i}
              position={[x, 0.01 + i * 0.004, 0.1]}
              rotation={[0.3 - i * 0.05, 0, 0]}
            >
              <cylinderGeometry args={[0.013, 0.01, 0.09, 8]} />
              <primitive object={materials.gold} attach="material" />
            </mesh>
          ))}
        </group>
      </group>

      {/* ════════════════ LEFT ARM: RESTING ON WHITE DESK ════════════════ */}
      <group position={[-0.56, 0.28, 0]}>
        {/* Upper Arm resting naturally down */}
        <mesh position={[-0.1, -0.16, 0]} rotation={[0.2, 0, 0.2]}>
          <cylinderGeometry args={[0.07, 0.06, 0.34, 12]} />
          <primitive object={materials.hoodieFabric} attach="material" />
        </mesh>

        {/* Elbow Joint */}
        <mesh position={[-0.16, -0.34, 0.06]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <primitive object={materials.gold} attach="material" />
        </mesh>

        {/* Forearm angled onto the desk */}
        <mesh position={[-0.12, -0.38, 0.32]} rotation={[0.9, 0.3, 0]}>
          <cylinderGeometry args={[0.055, 0.045, 0.34, 12]} />
          <primitive object={materials.carbonFiber} attach="material" />
        </mesh>

        {/* Metallic Hand Resting Flat on the Desk */}
        <group ref={leftHandRef} position={[-0.04, -0.4, 0.52]} rotation={[0, -0.3, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.14, 0.03, 0.13]} />
            <primitive object={materials.gunmetal} attach="material" />
          </mesh>
          {/* Fingers flat on desk with gold knuckles */}
          {[-0.045, -0.015, 0.015, 0.045].map((x, i) => (
            <mesh key={i} position={[x, -0.005, 0.09]}>
              <boxGeometry args={[0.022, 0.02, 0.08]} />
              <primitive object={materials.gold} attach="material" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// ── 5. Main Embodied Robot Room View Component ──
export default function EmbodiedRobotRoom({
  userName = 'Pragya',
  currentMode = MODES.PRESENTATION,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  isConcluding = false,
  onToggleMic,
  cameraActive = true,
  onToggleCamera,
  screenActive = false,
  onToggleScreenShare,
  onEndCall,
  onBackToDashboard,
  audioLevel = 0,
  postureAlert = null,
  gdTopic,
  gdTurnChoice,
  onGDTurnChoice,
  onSelectMode,
  onImmediateSpeak,
}) {
  const modeLabel = useMemo(() => {
    switch (currentMode) {
      case MODES.GD:
        return 'Group Discussion Arena';
      case MODES.SELF_INTRO:
        return 'Self-Introduction Evaluation';
      case MODES.CASUAL:
        return 'Casual Talk & Mental Wellness';
      default:
        return 'Project Presentation (STAR)';
    }
  }, [currentMode]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#090e17] overflow-hidden select-none">
      {/* ── 3D Full-Screen WebGL Canvas (60 FPS Optimized) ── */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <Canvas
          camera={{ position: [0, 0.52, 2.75], fov: 38 }}
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Warm Ambient Indoor Study Room Lighting */}
          <ambientLight intensity={0.85} color="#ffe8cc" />

          {/* Key Light: Warm golden room lamp from upper-right */}
          <directionalLight
            position={[3.8, 3.5, 2.2]}
            intensity={2.1}
            color="#ffd79e"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* Rim Light: Teal / cyan mood lighting from left window */}
          <pointLight
            position={[-3.2, 1.4, 0.4]}
            intensity={2.2}
            color="#06b6d4"
          />

          {/* Bounce Light from white desk */}
          <pointLight
            position={[0, -0.3, 0.9]}
            intensity={0.9}
            color="#fff2dc"
          />

          {/* Fairy lights warm ambient accent */}
          <pointLight
            position={[-2.2, 1.2, -1.8]}
            intensity={1.2}
            color="#fbbf24"
          />

          {/* 3D Study Room Background with Laptops, Bookshelf, and Fairy Lights */}
          <CozyRoomEnvironment />

          {/* 3D Humanoid Robot in Hoodie with Articulated Gestures */}
          <ExpressiveHumanoidRobot
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
            isConcluding={isConcluding}
          />
        </Canvas>
      </div>

      {/* ── Top-Left: Return to Dashboard Button ── */}
      <div className="absolute top-6 left-6 z-30 pointer-events-auto">
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 rounded-2xl bg-black/50 hover:bg-black/75 border border-white/15 text-xs font-bold text-white shadow-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer hover:border-white/30"
          title="Return to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* ── Top-Center: Arena Status Pill ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-2xl text-xs">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isConcluding
              ? 'bg-teal-400 animate-pulse'
              : isSpeaking
              ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#00e5ff]'
              : isListening
              ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]'
              : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
          }`}
        />
        <span className="font-semibold text-slate-200">{modeLabel}</span>
      </div>

      {/* ── Top-Right: Typography Overlays for "Welcome back, Pragya!..." ── */}
      <div className="absolute top-6 right-6 z-30 pointer-events-auto max-w-sm w-full sm:w-auto">
        <div className="p-4 rounded-3xl bg-black/55 border border-white/15 backdrop-blur-xl shadow-2xl space-y-2.5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-500/30 text-indigo-300">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Baatology 3D Call
              </span>
            </div>
            {isSpeaking && onImmediateSpeak && (
              <button
                onClick={onImmediateSpeak}
                className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-[10px] font-bold hover:bg-cyan-900 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Interrupt AI</span>
                <Volume2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div>
            <h2 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Welcome back, {userName}!</span>
              <span>👋</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              {isConcluding
                ? 'Reviewing your speaking highlights & confidence metrics...'
                : isSpeaking
                ? 'Your AI Mentor is speaking. Listening mode will open automatically.'
                : isListening
                ? 'Your microphone is live! Share your answer naturally.'
                : 'I am right here with you. Ready for placement practice?'}
            </p>
          </div>

          {/* Live Biomarker Waveform Indicator */}
          <div className="pt-1 flex items-center gap-2">
            <div className="flex items-center gap-1 h-3">
              {[1, 2, 3, 4, 5, 6].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isSpeaking
                      ? 'bg-cyan-400 h-3 animate-pulse'
                      : isListening
                      ? 'bg-emerald-400 h-2'
                      : 'bg-slate-600 h-1'
                  }`}
                  style={{ animationDelay: `${bar * 80}ms` }}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-300">
              {isSpeaking
                ? 'AI Speaking...'
                : isListening
                ? '● Candidate Mic Open'
                : 'Ambient Mode'}
            </span>
          </div>
        </div>
      </div>


      {/* ── Floating Bottom Call Controls Dock ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <div className="flex items-center gap-3 px-5 py-3 rounded-3xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl">
          {/* Mic Toggle Button */}
          <button
            onClick={onToggleMic}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isListening ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Toggle Button */}
          {onToggleCamera && (
            <button
              onClick={onToggleCamera}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                cameraActive
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          )}

          {/* Screen Share Toggle */}
          {onToggleScreenShare && (
            <button
              onClick={onToggleScreenShare}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                screenActive
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Share Screen (Slides / Demos)"
            >
              <ScreenShare className="w-5 h-5" />
            </button>
          )}

          {/* End Call Button */}
          {onEndCall && (
            <button
              onClick={onEndCall}
              className="px-5 h-11 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer active:scale-95 ml-2"
              title="End Practice Call & Get Evaluation"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
