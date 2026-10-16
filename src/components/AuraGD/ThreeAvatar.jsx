import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// ── Standard Low-Poly Golden Robot Geometries (60 FPS on any laptop) ──
// All parts use MeshStandardMaterial (metalness: 0.6, roughness: 0.3)

function Feet() {
  return (
    <>
      <mesh position={[-0.22, -1.28, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.1, 0.30]} />
        <meshStandardMaterial color="#161f2e" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.22, -1.28, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.1, 0.30]} />
        <meshStandardMaterial color="#161f2e" roughness={0.3} metalness={0.6} />
      </mesh>
    </>
  );
}

function Legs() {
  return (
    <>
      <mesh position={[-0.22, -0.9, 0]} castShadow>
        <boxGeometry args={[0.17, 0.64, 0.17]} />
        <meshStandardMaterial color="#d49b28" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.22, -0.9, 0]} castShadow>
        <boxGeometry args={[0.17, 0.64, 0.17]} />
        <meshStandardMaterial color="#d49b28" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-0.22, -0.76, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.22, -0.76, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
      </mesh>
    </>
  );
}

function Pelvis() {
  return (
    <mesh position={[0, -0.56, 0]} castShadow>
      <boxGeometry args={[0.6, 0.22, 0.38]} />
      <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

function Torso({ chestGlowRef }) {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.9, 0.92, 0.52]} />
        <meshStandardMaterial color="#d49b28" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Dynamic Chest glow reactor */}
      <mesh ref={chestGlowRef} position={[0, 0.1, 0.27]}>
        <boxGeometry args={[0.34, 0.32, 0.04]} />
        <meshStandardMaterial
          color="#0dd9b8"
          emissive="#0dd9b8"
          emissiveIntensity={1.0}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {[-0.09, 0, 0.09].map((x, i) => (
        <mesh key={i} position={[x, -0.05, 0.282]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={2.8}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      ))}

      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 0.38, 0.06, 0]}>
          <boxGeometry args={[0.06, 0.7, 0.44]} />
          <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function ShoulderJoints() {
  return (
    <>
      <mesh position={[-0.56, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.038, 8, 16]} />
        <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.56, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.038, 8, 16]} />
        <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
      </mesh>
    </>
  );
}

function Arm({ side, armRef }) {
  const dir = side === 'left' ? -1 : 1;
  return (
    <group ref={armRef} position={[dir * 0.64, 0.28, 0]}>
      <mesh position={[0, -0.22, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.38, 10]} />
        <meshStandardMaterial color="#d49b28" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.43, 0]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.042, 0.32, 10]} />
        <meshStandardMaterial color="#d49b28" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.79, 0]} castShadow>
        <boxGeometry args={[0.13, 0.11, 0.09]} />
        <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Neck() {
  return (
    <mesh position={[0, 0.64, 0]}>
      <cylinderGeometry args={[0.1, 0.12, 0.22, 10]} />
      <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

function Head({ headRef, visorRef, mouthRef, leftEyeRef, rightEyeRef }) {
  return (
    <group ref={headRef} position={[0, 0.9, 0]}>
      {/* Main Head Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.305, 0.285, 0.44, 12]} />
        <meshStandardMaterial color="#d49b28" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Head Top Crown */}
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.285, 0.305, 0.06, 12]} />
        <meshStandardMaterial color="#7a4e0a" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Antenna Pole & Beacon */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.24, 6]} />
        <meshStandardMaterial color="#d49b28" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.034, 10, 10]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={3.2}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Visor Screen with Cyan / Teal Emission */}
      <mesh ref={visorRef} position={[0, 0.04, 0.248]}>
        <boxGeometry args={[0.44, 0.155, 0.06]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={2.6}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Two Eyes on the Visor - with periodic blinking & center gaze */}
      <mesh ref={leftEyeRef} position={[-0.105, 0.045, 0.278]}>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.105, 0.045, 0.278]}>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Lower Mouth Mesh - moves up and down synchronized with speech output */}
      <mesh ref={mouthRef} position={[0, -0.12, 0.258]}>
        <boxGeometry args={[0.20, 0.035, 0.04]} />
        <meshStandardMaterial
          color="#0dd9b8"
          emissive="#0dd9b8"
          emissiveIntensity={2.0}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Mouth grill mechanical detail */}
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={i} position={[x, -0.145, 0.26]}>
          <boxGeometry args={[0.026, 0.016, 0.03]} />
          <meshStandardMaterial color="#000814" roughness={0.5} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ── Floor Emerald-Green / Warm Amber / Warm Teal Aura Ring ──
function AuraFloorRing({ isListening, isSpeaking, isConcluding = false, isCasual = false }) {
  const ringRef = useRef();
  const matRef = useRef();

  useFrame((state) => {
    try {
      const t = state.clock.elapsedTime;
      if (!ringRef.current || !matRef.current) return;

      if (isConcluding) {
        // Feature 9: Warm teal pulse beneath the robot during encouraging conclusion
        const scale = 1.05 + Math.sin(t * 3.2) * 0.06;
        ringRef.current.scale.set(scale, scale, 1);
        matRef.current.color.set('#0dd9b8');
        matRef.current.emissive.set('#0dd9b8');
        matRef.current.emissiveIntensity = 0.95 + Math.sin(t * 3.2) * 0.35;
        matRef.current.opacity = 0.75 + Math.sin(t * 3.2) * 0.15;
        return;
      }

      if (isCasual) {
        // Feature 8: Warm ambient golden/amber floor aura
        if (isListening) {
          const scale = 1.0 + Math.sin(t * 3.2) * 0.08;
          ringRef.current.scale.set(scale, scale, 1);
          matRef.current.color.set('#f59e0b');
          matRef.current.emissive.set('#f59e0b');
          matRef.current.emissiveIntensity = 0.85 + Math.sin(t * 3.2) * 0.4;
          matRef.current.opacity = 0.7 + Math.sin(t * 3.2) * 0.2;
        } else if (isSpeaking) {
          const scale = 1.0 + Math.sin(t * 2.4) * 0.05;
          ringRef.current.scale.set(scale, scale, 1);
          matRef.current.color.set('#fbbf24');
          matRef.current.emissive.set('#fbbf24');
          matRef.current.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.3;
          matRef.current.opacity = 0.55;
        } else {
          ringRef.current.scale.set(1, 1, 1);
          matRef.current.color.set('#d97706');
          matRef.current.emissive.set('#d97706');
          matRef.current.emissiveIntensity = 0.35 + Math.sin(t * 1.5) * 0.15;
          matRef.current.opacity = 0.45;
        }
        return;
      }

      if (isListening) {
        // Subtle emerald-green aura ring pulses beneath the robot
        const scale = 1.0 + Math.sin(t * 3.6) * 0.08;
        ringRef.current.scale.set(scale, scale, 1);
        matRef.current.color.set('#10b981');
        matRef.current.emissive.set('#10b981');
        matRef.current.emissiveIntensity = 0.8 + Math.sin(t * 3.6) * 0.4;
        matRef.current.opacity = 0.65 + Math.sin(t * 3.6) * 0.2;
      } else if (isSpeaking) {
        const scale = 1.0 + Math.sin(t * 2.2) * 0.04;
        ringRef.current.scale.set(scale, scale, 1);
        matRef.current.color.set('#00e5ff');
        matRef.current.emissive.set('#00e5ff');
        matRef.current.emissiveIntensity = 0.4 + Math.sin(t * 4) * 0.2;
        matRef.current.opacity = 0.4;
      } else {
        // IDLE
        ringRef.current.scale.set(1, 1, 1);
        matRef.current.color.set('#0dd9b8');
        matRef.current.emissive.set('#0dd9b8');
        matRef.current.emissiveIntensity = 0.25 + Math.sin(t * 1.5) * 0.1;
        matRef.current.opacity = 0.35;
      }
    } catch (e) {
      // safe fallback
    }
  });

  return (
    <group position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Primary animated floor ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.55, 1.35, 32]} />
        <meshStandardMaterial
          ref={matRef}
          color={isListening ? '#10b981' : '#0dd9b8'}
          emissive={isListening ? '#10b981' : '#0dd9b8'}
          emissiveIntensity={0.3}
          transparent
          opacity={0.35}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      {/* Subtle outer accent perimeter ring */}
      <mesh>
        <ringGeometry args={[1.36, 1.40, 32]} />
        <meshBasicMaterial
          color={isListening ? '#10b981' : '#0dd9b8'}
          transparent
          opacity={isListening ? 0.6 : 0.2}
        />
      </mesh>
    </group>
  );
}

// ── Dynamic 3D Robot State Controller ──
function RobotModel({ isSpeaking, isListening, isThinking, isConcluding = false, isCasual = false }) {
  const groupRef     = useRef();
  const headRef      = useRef();
  const visorRef     = useRef();
  const mouthRef     = useRef();
  const leftEyeRef   = useRef();
  const rightEyeRef  = useRef();
  const leftArmRef   = useRef();
  const rightArmRef  = useRef();
  const chestGlowRef = useRef();

  useFrame((state) => {
    try {
      const t = state.clock.elapsedTime;
      const robotState = isConcluding ? 'CONCLUDING' : isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : 'IDLE';

      // ── a) 'IDLE' State:
      // Gentle sinusoidal breathing float (head & torso bobbing smoothly) and periodic eye blinking.
      if (robotState === 'IDLE') {
        if (groupRef.current) {
          groupRef.current.position.y = -0.35 + Math.sin(t * 1.6) * 0.035;
          groupRef.current.position.z = 0;
          groupRef.current.rotation.x = 0;
          groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.04;
        }

        if (headRef.current) {
          headRef.current.position.y = 0.9 + Math.sin(t * 1.6 + 0.3) * 0.012;
          headRef.current.position.z = 0;
          headRef.current.rotation.x = Math.sin(t * 0.8) * 0.025;
          headRef.current.rotation.y = Math.sin(t * 0.5) * 0.06;
        }

        // Periodic eye blinking (every 3.8s, blink for 140ms)
        const blinkCycle = t % 3.8;
        const isBlinking = blinkCycle > 3.65 && blinkCycle < 3.79;
        const eyeScaleY = isBlinking ? 0.08 : 1.0;
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.set(1, eyeScaleY, 1);
          rightEyeRef.current.scale.set(1, eyeScaleY, 1);
        }

        // Mouth closed at rest
        if (mouthRef.current) {
          mouthRef.current.position.y = -0.12;
          mouthRef.current.scale.set(1, 1, 1);
        }

        // Arms breathing gently at sides
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.z = 0.12 + Math.sin(t * 1.6) * 0.03;
          rightArmRef.current.rotation.z = -0.12 - Math.sin(t * 1.6) * 0.03;
        }

        // Ambient breathing glow (amber/gold for casual wellness vs cyan for evaluation)
        const visorMat = visorRef.current?.material;
        const chestMat = chestGlowRef.current?.material;
        if (visorMat && chestMat) {
          if (isCasual) {
            visorMat.color?.set?.('#f59e0b');
            visorMat.emissive?.set?.('#f59e0b');
            visorMat.emissiveIntensity = 1.9 + Math.sin(t * 1.6) * 0.4;

            chestMat.color?.set?.('#d97706');
            chestMat.emissive?.set?.('#d97706');
            chestMat.emissiveIntensity = 1.5 + Math.sin(t * 1.6) * 0.3;
          } else {
            visorMat.color?.set?.('#00e5ff');
            visorMat.emissive?.set?.('#00e5ff');
            visorMat.emissiveIntensity = 1.6 + Math.sin(t * 1.6) * 0.35;

            chestMat.color?.set?.('#0dd9b8');
            chestMat.emissive?.set?.('#0dd9b8');
            chestMat.emissiveIntensity = 1.0 + Math.sin(t * 1.6) * 0.25;
          }
        }
      }

      // ── b) 'LISTENING' State (when student mic is active):
      // Head leans forward slightly, eyes lock onto center, and subtle aura ring pulses beneath
      else if (robotState === 'LISTENING') {
        if (groupRef.current) {
          groupRef.current.position.y = -0.35 + Math.sin(t * 2.0) * 0.015;
          groupRef.current.position.z = 0.08;
          groupRef.current.rotation.x = 0.035;
          groupRef.current.rotation.y = 0;
        }

        if (headRef.current) {
          // Head leans forward slightly towards candidate
          headRef.current.position.y = 0.9;
          headRef.current.position.z = 0.05;
          headRef.current.rotation.x = 0.13;
          // Eyes lock onto center
          headRef.current.rotation.y = 0;
        }

        // Eyes locked onto center: wide open, zero blinking
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.set(1, 1.0, 1);
          rightEyeRef.current.scale.set(1, 1.0, 1);
        }

        // Mouth closed attentive
        if (mouthRef.current) {
          mouthRef.current.position.y = -0.12;
          mouthRef.current.scale.set(1, 1, 1);
        }

        // Arms steady attentive posture
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.z = 0.18;
          rightArmRef.current.rotation.z = -0.18;
        }

        // Visor & chest glow (golden amber for casual vs emerald for placement)
        const visorMat = visorRef.current?.material;
        const chestMat = chestGlowRef.current?.material;
        if (visorMat && chestMat) {
          if (isCasual) {
            visorMat.color?.set?.('#fbbf24');
            visorMat.emissive?.set?.('#fbbf24');
            visorMat.emissiveIntensity = 2.4 + Math.sin(t * 3.2) * 0.5;

            chestMat.color?.set?.('#f59e0b');
            chestMat.emissive?.set?.('#f59e0b');
            chestMat.emissiveIntensity = 2.0 + Math.sin(t * 3.2) * 0.4;
          } else {
            visorMat.color?.set?.('#10b981');
            visorMat.emissive?.set?.('#10b981');
            visorMat.emissiveIntensity = 2.0 + Math.sin(t * 4.0) * 0.5;

            chestMat.color?.set?.('#10b981');
            chestMat.emissive?.set?.('#10b981');
            chestMat.emissiveIntensity = 1.7 + Math.sin(t * 4.0) * 0.4;
          }
        }
      }

      // ── c) 'SPEAKING' / 'CONCLUDING' State (when AI is talking via TTS):
      // Lower mouth mesh moves up and down synchronized with speech output intervals
      else if (robotState === 'SPEAKING' || robotState === 'CONCLUDING') {
        if (groupRef.current) {
          groupRef.current.position.y = -0.35 + Math.sin(t * 3.5) * 0.04;
          groupRef.current.position.z = 0.03;
          groupRef.current.rotation.x = 0;
          groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.05;
        }

        if (headRef.current) {
          if (isConcluding || robotState === 'CONCLUDING') {
            // Feature 9: Encouraging gentle nod towards the student
            headRef.current.position.y = 0.9;
            headRef.current.position.z = 0.04;
            headRef.current.rotation.x = 0.12 + Math.sin(t * 3.8) * 0.14;
            headRef.current.rotation.y = Math.sin(t * 1.2) * 0.04;
          } else {
            // Expressive speaking head gestures
            headRef.current.position.y = 0.9;
            headRef.current.position.z = 0.02;
            headRef.current.rotation.x = Math.sin(t * 4.8) * 0.07;
            headRef.current.rotation.y = Math.sin(t * 1.8) * 0.12;
          }
        }

        // Lower mouth mesh moves up and down synchronized with speech output intervals
        if (mouthRef.current) {
          const mouthPulse = Math.abs(Math.sin(t * 15));
          mouthRef.current.position.y = -0.12 - mouthPulse * 0.035;
          mouthRef.current.scale.set(1, 1 + mouthPulse * 2.2, 1);
        }

        // Eyes open & expressive
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.set(1, 1.0, 1);
          rightEyeRef.current.scale.set(1, 1.0, 1);
        }

        // Expressive arm communicative gestures
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.z = 0.35 + Math.sin(t * 2.8) * 0.22;
          rightArmRef.current.rotation.z = -0.35 - Math.sin(t * 2.8) * 0.22;
        }

        // Visor, chest, and mouth glow (Feature 9: warm teal glow in CONCLUDING state)
        const visorMat = visorRef.current?.material;
        const chestMat = chestGlowRef.current?.material;
        const mouthMat = mouthRef.current?.material;

        if (visorMat) {
          const col = (isConcluding || robotState === 'CONCLUDING') ? '#0dd9b8' : (isCasual ? '#f59e0b' : '#00e5ff');
          visorMat.color?.set?.(col);
          visorMat.emissive?.set?.(col);
          visorMat.emissiveIntensity = (isConcluding || robotState === 'CONCLUDING')
            ? (2.8 + Math.sin(t * 6) * 0.5)
            : (2.6 + Math.sin(t * 12) * 1.0);
        }
        if (chestMat) {
          const col = (isConcluding || robotState === 'CONCLUDING') ? '#14b8a6' : (isCasual ? '#fbbf24' : '#0dd9b8');
          chestMat.color?.set?.(col);
          chestMat.emissive?.set?.(col);
          chestMat.emissiveIntensity = (isConcluding || robotState === 'CONCLUDING')
            ? (2.2 + Math.sin(t * 6) * 0.4)
            : (1.8 + Math.sin(t * 8) * 0.6);
        }
        if (mouthMat) {
          const col = (isConcluding || robotState === 'CONCLUDING') ? '#0dd9b8' : (isCasual ? '#f59e0b' : '#0dd9b8');
          mouthMat.color?.set?.(col);
          mouthMat.emissive?.set?.(col);
          mouthMat.emissiveIntensity = 2.2 + Math.abs(Math.sin(t * 15)) * 1.5;
        }
      }
    } catch (e) {
      console.debug('Animation frame handled:', e);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.35, 0]}>
      <Feet />
      <Legs />
      <Pelvis />
      <Torso chestGlowRef={chestGlowRef} />
      <ShoulderJoints />
      <Arm side="left" armRef={leftArmRef} />
      <Arm side="right" armRef={rightArmRef} />
      <Neck />
      <Head
        headRef={headRef}
        visorRef={visorRef}
        mouthRef={mouthRef}
        leftEyeRef={leftEyeRef}
        rightEyeRef={rightEyeRef}
      />
    </group>
  );
}

// ── Fallback Robot Component if WebGL is unavailable ──
function FallbackRobotAvatar({ isSpeaking, isListening, isThinking }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none select-none">
      <div className="relative flex flex-col items-center">
        {/* Glowing Head */}
        <div
          className={`w-36 h-36 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
            isListening
              ? 'bg-emerald-950/40 border-emerald-400 shadow-emerald-500/20'
              : isSpeaking
              ? 'bg-cyan-950/40 border-cyan-400 shadow-cyan-500/30'
              : 'bg-amber-950/30 border-amber-500/60 shadow-amber-500/20'
          }`}
          style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}
        >
          {/* Visor */}
          <div
            className={`w-24 h-10 rounded-xl flex items-center justify-around px-2 transition-all duration-200 ${
              isListening
                ? 'bg-emerald-400 shadow-[0_0_20px_#10b981]'
                : isSpeaking
                ? 'bg-cyan-400 shadow-[0_0_20px_#00e5ff]'
                : isThinking
                ? 'bg-sky-400 shadow-[0_0_20px_#38bdf8]'
                : 'bg-teal-400 shadow-[0_0_15px_#0dd9b8]'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white pulse-dot" />
            <div className="w-3.5 h-3.5 rounded-full bg-white pulse-dot" />
          </div>

          {/* Mouth animation */}
          <div className="mt-3 flex gap-1 items-center h-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking ? 'bg-cyan-300 h-3 animate-pulse' : 'bg-slate-600 h-1'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Torso */}
        <div className="w-48 h-40 rounded-2xl bg-slate-800/80 border border-amber-600/40 mt-2 flex flex-col items-center justify-center shadow-xl">
          <div
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${
              isListening
                ? 'border-emerald-400 bg-emerald-500/20 pulse-dot'
                : isSpeaking
                ? 'border-cyan-400 bg-cyan-500/20 pulse-dot'
                : 'border-teal-400 bg-teal-500/20'
            }`}
          >
            <span className="text-xl">⚡</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThreeAvatar({
  isSpeaking,
  isListening,
  isThinking,
  isConcluding = false,
  mode = 'presentation',
}) {
  const [webGLError, setWebGLError] = useState(false);
  const isCasual = mode === 'casual';

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGLError(true);
    } catch (e) {
      setWebGLError(true);
    }
  }, []);

  if (webGLError) {
    return (
      <FallbackRobotAvatar
        isSpeaking={isSpeaking || isConcluding}
        isListening={isListening && !isConcluding}
        isThinking={isThinking}
      />
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.35, 3.8], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
        }}
        onError={() => setWebGLError(true)}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        {/* Feature 8/9: Warm ambient golden/amber glow in Casual Talk mode or warm teal in Concluding state */}
        <ambientLight
          intensity={isConcluding ? 0.8 : (isCasual ? 0.8 : 0.55)}
          color={isConcluding ? '#e6fffa' : (isCasual ? '#fffbeb' : '#ffffff')}
        />
        <directionalLight
          position={[4, 6, 4]}
          intensity={isConcluding ? 1.7 : (isCasual ? 1.6 : 1.4)}
          color={isConcluding ? '#ccfbf1' : (isCasual ? '#fef3c7' : '#ffffff')}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-2.5, 2.5, 2.5]} intensity={isConcluding ? 1.4 : (isCasual ? 1.2 : 0.8)} color={isConcluding ? '#0dd9b8' : (isCasual ? '#f59e0b' : '#0dd9b8')} />
        <pointLight position={[0, -1.5, 2.0]} intensity={isConcluding ? 1.0 : (isCasual ? 0.8 : 0.4)} color={isConcluding ? '#14b8a6' : '#f59e0b'} />
        <pointLight position={[0, 3, -3]} intensity={isConcluding ? 0.7 : (isCasual ? 0.6 : 0.45)} color={isConcluding ? '#2dd4bf' : (isCasual ? '#fbbf24' : '#00e5ff')} />
        <fog attach="fog" args={['#070b12', 7, 24]} />

        {/* Dynamic 3D Low-Poly Golden Robot with warm teal glow and gentle nod in concluding mode */}
        <RobotModel
          isSpeaking={isSpeaking}
          isListening={isListening}
          isThinking={isThinking}
          isConcluding={isConcluding}
          isCasual={isCasual}
        />

        {/* Stage Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.36, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#080d16" roughness={0.85} metalness={0.15} />
        </mesh>

        {/* Dynamic Floor Aura Ring - warm teal pulse in concluding mode */}
        <AuraFloorRing
          isListening={isListening}
          isSpeaking={isSpeaking}
          isConcluding={isConcluding}
          isCasual={isCasual}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={Math.PI / 4.5}
          target={[0, 0.1, 0]}
        />
      </Canvas>
    </div>
  );
}
