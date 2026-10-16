import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ExecutiveOfficeBackground
 *
 * Cinematic modern tech executive interview office:
 * - Acoustic vertical timber slat accent wall with recessed warm wash lighting
 * - Modern frosted architectural glass partition with soft ambient bokeh glow
 * - Subtle AuraGD brand cyan LED accent strip
 * - Aesthetic background indoor office plant with soft rim illumination
 */
function ExecutiveOfficeBackground() {
  // Generate 26 vertical acoustic timber slats
  const slats = useMemo(() => {
    const items = [];
    const count = 26;
    const spacing = 0.11;
    const startX = -((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      items.push(startX + i * spacing);
    }
    return items;
  }, []);

  return (
    <group position={[0, 0, -1.35]}>
      {/* ── Acoustic Wall Base Felt Backing ── */}
      <mesh position={[0, 0.4, -0.04]} receiveShadow>
        <planeGeometry args={[4.2, 2.8]} />
        <meshStandardMaterial color="#0c1017" roughness={0.95} />
      </mesh>

      {/* ── Vertical Acoustic Walnut / Oak Slats ── */}
      <group position={[0, 0.4, 0]}>
        {slats.map((x, idx) => (
          <mesh key={idx} position={[x, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.045, 2.6, 0.025]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#322319' : '#291c14'}
              roughness={0.4}
              metalness={0.08}
            />
          </mesh>
        ))}
      </group>

      {/* ── AuraGD Tech Accent Bar (Horizontal Cyan Glow Strip) ── */}
      <mesh position={[0, 0.75, 0.03]}>
        <boxGeometry args={[3.2, 0.015, 0.015]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={1.4}
          roughness={0.2}
        />
      </mesh>

      {/* ── Recessed Downlight Fixture & Wall Wash ── */}
      <mesh position={[0, 1.68, 0.04]}>
        <boxGeometry args={[2.8, 0.04, 0.08]} />
        <meshStandardMaterial color="#1f242d" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Warm Ambient Wall Sconce Downlight */}
      <pointLight
        position={[0, 1.55, 0.25]}
        intensity={1.1}
        color="#fed7aa"
        distance={2.4}
        decay={2}
      />

      {/* ── Right-Side Frosted Glass Window / Partition ── */}
      <mesh position={[1.45, 0.4, 0.08]}>
        <planeGeometry args={[1.1, 2.6]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.3}
          transparent
          opacity={0.45}
        />
      </mesh>
      {/* Soft Outdoor City Bokeh Glow beyond frosted glass */}
      <pointLight
        position={[1.6, 0.6, -0.3]}
        intensity={0.65}
        color="#93c5fd"
        distance={2.5}
      />

      {/* ── Left-Side Executive Monstera Plant Accent ── */}
      <group position={[-1.25, -0.1, 0.2]}>
        {/* Modern Ceramic Planter Pot */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.1, 0.35, 20]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
        </mesh>
        {/* Tropical Leaves */}
        <mesh position={[0.04, -0.05, 0.05]} rotation={[0.4, 0.2, -0.3]}>
          <planeGeometry args={[0.22, 0.32]} />
          <meshStandardMaterial color="#166534" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.05, 0.05, -0.02]} rotation={[0.3, -0.4, 0.3]}>
          <planeGeometry args={[0.24, 0.35]} />
          <meshStandardMaterial color="#14532d" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.02, 0.18, 0]} rotation={[0.1, 0.3, -0.1]}>
          <planeGeometry args={[0.20, 0.30]} />
          <meshStandardMaterial color="#15803d" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * ExecutiveDeskAndChair
 *
 * Professional Ergonomic High-Back Chair and Executive Walnut Desk:
 * - High-end Herman Miller / Gesture style curved mesh backrest
 * - Dual chrome-stemmed ergonomic headrest right behind the head
 * - Padded curved armrests on polished aluminum uprights
 * - Dark American walnut desk with champagne beveled edge
 * - Leather desk blotter, ultra-slim executive laptop, and notebook
 */
function ExecutiveDeskAndChair() {
  return (
    <group position={[0, 0, 0]}>
      {/* ═══════════════════════════════════════════════════════════
          1. HIGH-END EXECUTIVE ERGONOMIC OFFICE CHAIR
      ═══════════════════════════════════════════════════════════ */}
      <group position={[0, 0, -0.18]}>
        {/* Contoured Spine / Lumbar Support Frame (Curved, not a flat box) */}
        <mesh position={[0, 0.02, -0.05]} castShadow>
          <boxGeometry args={[0.06, 0.58, 0.05]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.25} />
        </mesh>

        {/* Ergonomic Ribbed Leather / Mesh Backrest (Curved & tapered) */}
        <mesh position={[0, 0.02, -0.01]} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.56, 0.06]} />
          <meshStandardMaterial color="#1a1c23" roughness={0.55} metalness={0.25} />
        </mesh>
        {/* Lumbar Accent Band */}
        <mesh position={[0, -0.12, 0.02]}>
          <boxGeometry args={[0.42, 0.08, 0.03]} />
          <meshStandardMaterial color="#0f1117" roughness={0.7} />
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

        {/* Ergonomic Curved Headrest Cushion (Positioned directly behind head, NOT floating high) */}
        <mesh position={[0, 0.40, -0.02]} castShadow>
          <boxGeometry args={[0.26, 0.13, 0.07]} />
          <meshStandardMaterial color="#14161c" roughness={0.55} metalness={0.2} />
        </mesh>
        {/* Headrest Accent Chrome Trim */}
        <mesh position={[0, 0.40, -0.05]}>
          <boxGeometry args={[0.27, 0.02, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Ergonomic Left Padded Armrest */}
        <group position={[-0.28, -0.22, 0.14]}>
          {/* Polished Chrome Upright Stem */}
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Padded Armrest Cushion */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.03, 0.24]} />
            <meshStandardMaterial color="#14161c" roughness={0.6} />
          </mesh>
        </group>

        {/* Ergonomic Right Padded Armrest */}
        <group position={[0.28, -0.22, 0.14]}>
          {/* Polished Chrome Upright Stem */}
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Padded Armrest Cushion */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.03, 0.24]} />
            <meshStandardMaterial color="#14161c" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* ═══════════════════════════════════════════════════════════
          2. EXECUTIVE AMERICAN WALNUT & OBSIDIAN DESK
      ═══════════════════════════════════════════════════════════ */}
      <group position={[0, -0.44, 0.36]}>
        {/* Main Solid Walnut Desk Surface */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.055, 0.65]} />
          <meshStandardMaterial color="#231711" roughness={0.35} metalness={0.12} />
        </mesh>

        {/* Champagne Bronze Beveled Edge Front Trim */}
        <mesh position={[0, 0, -0.325]}>
          <boxGeometry args={[2.2, 0.018, 0.015]} />
          <meshStandardMaterial color="#594231" roughness={0.35} metalness={0.5} />
        </mesh>

        {/* Luxury Black Leather Executive Desk Blotter / Writing Mat */}
        <mesh position={[0, 0.029, -0.04]} receiveShadow>
          <boxGeometry args={[0.82, 0.008, 0.40]} />
          <meshStandardMaterial color="#13151a" roughness={0.65} metalness={0.15} />
        </mesh>
        {/* Leather Blotter Fine Gold Border Stitch */}
        <mesh position={[0, 0.034, -0.04]}>
          <boxGeometry args={[0.80, 0.002, 0.38]} />
          <meshStandardMaterial color="#332a22" roughness={0.5} />
        </mesh>

        {/* ── Ultra-Slim Brushed Aluminum Executive Laptop ── */}
        <group position={[0.34, 0.035, -0.04]} rotation={[0, -0.28, 0]}>
          {/* Laptop Base */}
          <mesh position={[0, 0.005, 0]} castShadow>
            <boxGeometry args={[0.28, 0.008, 0.19]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Laptop Screen (Angled open naturally) */}
          <group position={[0, 0.01, 0.09]} rotation={[-0.32, 0, 0]}>
            {/* Screen Lid (Silver back) */}
            <mesh position={[0, 0.09, 0]} castShadow>
              <boxGeometry args={[0.28, 0.18, 0.006]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Display Panel: Soft Glowing Interview Rubric / Terminal */}
            <mesh position={[0, 0.09, -0.004]}>
              <planeGeometry args={[0.26, 0.16]} />
              <meshStandardMaterial
                color="#0f172a"
                emissive="#0284c7"
                emissiveIntensity={0.6}
                roughness={0.15}
              />
            </mesh>
            {/* Subtle Screen Light Upward Glow */}
            <pointLight position={[0, 0.08, -0.08]} intensity={0.28} color="#38bdf8" distance={0.9} />
          </group>
        </group>

        {/* ── Executive Leather Interview Notes & Gold Pen ── */}
        <group position={[-0.34, 0.035, -0.04]} rotation={[0, 0.22, 0]}>
          {/* Cognac Leather Notebook */}
          <mesh position={[0, 0.006, 0]} castShadow>
            <boxGeometry args={[0.18, 0.012, 0.24]} />
            <meshStandardMaterial color="#451a03" roughness={0.55} />
          </mesh>
          {/* Gold Bookmark Ribbon */}
          <mesh position={[0, 0.013, 0]}>
            <boxGeometry args={[0.015, 0.002, 0.24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Titanium / Gold Executive Pen */}
          <mesh position={[0.11, 0.008, 0.02]} rotation={[0, 0, 0.05]} castShadow>
            <cylinderGeometry args={[0.004, 0.004, 0.14, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* ── Modern Matte Ceramic Coffee Cup ── */}
        <group position={[-0.54, 0.035, -0.08]}>
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
 * SeatedFemaleMentorModel
 *
 * Cinematic Photorealistic Female Mentor Model with natural arm posture:
 * - Arms relaxed inward onto the leather blotter (no wide stick flare)
 * - PBR skin warmth, corneal moisture reflections, sleek glasses
 * - Continuous subtle chest/shoulder breathing
 * - Random eye-blinking every 4-6 seconds
 * - Attentive listening head nod and empathetic resting smile
 * - Dynamic speech lip-sync with synchronized jaw and head vibrations
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

        // Hide footwear so shoes can never accidentally poke up
        if (child.name === 'Wolf3D_Outfit_Footwear') {
          child.visible = false;
        }

        // Cinematic Material Enhancements
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

    // ── 2. Natural Sitting Arm Posture (Relaxed inward onto desk blotter) ──
    // Arms hang comfortably close to the ribcage (no wide 45° elbow flare)
    if (bones.LeftArm) {
      bones.LeftArm.rotation.x = 0.38 + chestRise * 0.4;
      bones.LeftArm.rotation.y = 0.08;
      bones.LeftArm.rotation.z = -0.22; // Inward close to ribs
    }
    if (bones.RightArm) {
      bones.RightArm.rotation.x = 0.38 + chestRise * 0.4;
      bones.RightArm.rotation.y = -0.08;
      bones.RightArm.rotation.z = 0.22; // Inward close to ribs
    }

    // Forearms bent naturally forward and angled inward toward center of desk
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotation.x = 0.78;
      bones.LeftForeArm.rotation.y = 0.35; // Angled inward towards blotter
      bones.LeftForeArm.rotation.z = 0.12;
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotation.x = 0.78;
      bones.RightForeArm.rotation.y = -0.35; // Angled inward towards blotter
      bones.RightForeArm.rotation.z = -0.12;
    }

    // Hands resting naturally on the leather desk blotter
    if (bones.LeftHand) {
      bones.LeftHand.rotation.x = 0.16;
      bones.LeftHand.rotation.y = 0.10;
      bones.LeftHand.rotation.z = -0.06;
    }
    if (bones.RightHand) {
      bones.RightHand.rotation.x = 0.16;
      bones.RightHand.rotation.y = -0.10;
      bones.RightHand.rotation.z = 0.06;
    }

    // ── 3. Head & Gaze: Attentive Eye-Level Listening & Micro-Tilts ──
    if (bones.Head) {
      if (isSpeaking) {
        // Natural speech movement synced to speech pacing
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
        // Eye-level direct gaze toward student
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
    <group position={[0, -1.4, -0.2]} rotation={[0, 0, 0]} scale={1.0}>
      <primitive object={scene} />
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
          Entering AuraGD Executive Studio...
        </span>
      </div>
    </Html>
  );
}

/**
 * FemaleMentor3DAvatar
 *
 * Full Executive Tech Interview Atmosphere:
 * - Professional eye-level front camera: position [0, 0, 1.4], fov 40
 * - Seated avatar at waist-up height with natural inward arm drape
 * - Ergonomic executive chair with contoured backrest & headrest
 * - Executive American walnut desk with leather blotter, laptop & notebook
 * - Acoustic vertical timber slat wall backdrop with warm downlights & frosted glass
 */
export default function FemaleMentor3DAvatar({
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mentorName = 'Dr. Ann Vance',
}) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#090d16] flex items-center justify-center select-none">
      <Canvas
        shadows
        camera={{
          position: [0, 0, 1.4], // Perfectly eye-level straight-on with the seated mentor
          fov: 40,               // Standard 40 fov (avoids wide-angle fish-eye distortion)
          near: 0.1,
          far: 20,
        }}
        className="w-full h-full cursor-default"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* ── Soft Depth Fog (Smoothly blends background depth) ── */}
        <fog attach="fog" args={['#090d16', 2.0, 5.0]} />

        {/* ── Cinematic Multi-Source Studio Lighting ── */}
        {/* 1. Warm Ambient Light */}
        <ambientLight intensity={0.85} color="#fff6ed" />

        {/* 2. Key Directional Light for natural facial definition */}
        <directionalLight
          position={[1.2, 1.6, 1.8]}
          intensity={1.8}
          color="#fffaf5"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* 3. Warm Cheek & Ear Point Light */}
        <pointLight
          position={[-1.5, 0.8, 0.6]}
          intensity={0.5}
          color="#ffd4a3"
          distance={3.8}
        />

        {/* 4. Top/Hair Rim Backlight for silhouette separation */}
        <pointLight
          position={[0, 1.7, -0.9]}
          intensity={0.8}
          color="#e0f2fe"
          distance={3.5}
        />

        {/* 5. Soft Fill Light from Lower Right */}
        <directionalLight
          position={[1.5, -0.5, 1.0]}
          intensity={0.3}
          color="#dbeafe"
        />

        {/* ── Executive Office Architectural Slat Wall Background ── */}
        <ExecutiveOfficeBackground />

        {/* ── Executive Chair & Desk Environment ── */}
        <ExecutiveDeskAndChair />

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
          position={[0, -0.44, 0.36]}
          opacity={0.65}
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
