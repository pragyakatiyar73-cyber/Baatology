import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Feet() {
  return (
    <>
      <mesh position={[-0.22, -1.28, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.1, 0.30]} />
        <meshStandardMaterial color="#0f1923" roughness={0.55} metalness={0.65} />
      </mesh>
      <mesh position={[0.22, -1.28, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.1, 0.30]} />
        <meshStandardMaterial color="#0f1923" roughness={0.55} metalness={0.65} />
      </mesh>
    </>
  );
}

function Legs() {
  return (
    <>
      <mesh position={[-0.22, -0.9, 0]} castShadow>
        <boxGeometry args={[0.17, 0.64, 0.17]} />
        <meshStandardMaterial color="#c8851f" roughness={0.25} metalness={0.82} />
      </mesh>
      <mesh position={[0.22, -0.9, 0]} castShadow>
        <boxGeometry args={[0.17, 0.64, 0.17]} />
        <meshStandardMaterial color="#c8851f" roughness={0.25} metalness={0.82} />
      </mesh>
      <mesh position={[-0.22, -0.76, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#8a5a0d" roughness={0.4} metalness={0.9} />
      </mesh>
      <mesh position={[0.22, -0.76, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#8a5a0d" roughness={0.4} metalness={0.9} />
      </mesh>
    </>
  );
}

function Pelvis() {
  return (
    <mesh position={[0, -0.56, 0]} castShadow>
      <boxGeometry args={[0.6, 0.22, 0.38]} />
      <meshStandardMaterial color="#a06a10" roughness={0.32} metalness={0.78} />
    </mesh>
  );
}

function Torso({ chestGlowRef }) {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.9, 0.92, 0.52]} />
        <meshStandardMaterial color="#c8851f" roughness={0.25} metalness={0.82} />
      </mesh>

      {/* Dynamic Chest glow reactor */}
      <mesh ref={chestGlowRef} position={[0, 0.1, 0.27]}>
        <boxGeometry args={[0.34, 0.32, 0.04]} />
        <meshStandardMaterial
          color="#0dd9b8"
          emissive="#0dd9b8"
          emissiveIntensity={1.0}
          roughness={0.1}
          metalness={0}
        />
      </mesh>

      {[-0.09, 0, 0.09].map((x, i) => (
        <mesh key={i} position={[x, -0.05, 0.282]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={3.0}
          />
        </mesh>
      ))}

      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 0.38, 0.06, 0]}>
          <boxGeometry args={[0.06, 0.7, 0.44]} />
          <meshStandardMaterial color="#8a5a0d" roughness={0.35} metalness={0.8} />
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
        <meshStandardMaterial color="#8a5a0d" roughness={0.42} metalness={0.9} />
      </mesh>
      <mesh position={[0.56, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.038, 8, 16]} />
        <meshStandardMaterial color="#8a5a0d" roughness={0.42} metalness={0.9} />
      </mesh>
    </>
  );
}

function Arm({ side, armRef }) {
  const dir = side === 'left' ? -1 : 1;
  return (
    <group ref={armRef} position={[dir * 0.64, 0.28, 0]}>
      <mesh position={[0, -0.22, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.38, 8]} />
        <meshStandardMaterial color="#c8851f" roughness={0.25} metalness={0.82} />
      </mesh>
      <mesh position={[0, -0.43, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#8a5a0d" roughness={0.42} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.042, 0.32, 8]} />
        <meshStandardMaterial color="#c8851f" roughness={0.25} metalness={0.82} />
      </mesh>
      <mesh position={[0, -0.79, 0]} castShadow>
        <boxGeometry args={[0.13, 0.11, 0.09]} />
        <meshStandardMaterial color="#a06a10" roughness={0.32} metalness={0.78} />
      </mesh>
    </group>
  );
}

function Neck() {
  return (
    <mesh position={[0, 0.64, 0]}>
      <cylinderGeometry args={[0.1, 0.12, 0.22, 8]} />
      <meshStandardMaterial color="#8a5a0d" roughness={0.42} metalness={0.9} />
    </mesh>
  );
}

function Head({ headRef, visorRef, mouthRef }) {
  return (
    <group ref={headRef} position={[0, 0.9, 0]}>
      {/* Drum cylinder faceted head */}
      <mesh castShadow>
        <cylinderGeometry args={[0.305, 0.285, 0.44, 8]} />
        <meshStandardMaterial color="#c8851f" roughness={0.25} metalness={0.82} />
      </mesh>

      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.285, 0.305, 0.06, 8]} />
        <meshStandardMaterial color="#8a5a0d" roughness={0.38} metalness={0.82} />
      </mesh>

      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.24, 6]} />
        <meshStandardMaterial color="#c8851f" roughness={0.3} metalness={0.9} />
      </mesh>

      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.034, 8, 8]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={3.5}
        />
      </mesh>

      {/* Visor with dynamic glowing material */}
      <mesh ref={visorRef} position={[0, 0.04, 0.248]}>
        <boxGeometry args={[0.44, 0.155, 0.06]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={2.8}
          roughness={0}
          metalness={0}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Eye pupils */}
      <mesh position={[-0.105, 0.045, 0.278]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.0}
        />
      </mesh>
      <mesh position={[0.105, 0.045, 0.278]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Moving mouth / speaker mesh */}
      <mesh ref={mouthRef} position={[0, -0.12, 0.258]}>
        <boxGeometry args={[0.18, 0.028, 0.04]} />
        <meshStandardMaterial
          color="#0dd9b8"
          emissive="#0dd9b8"
          emissiveIntensity={1.8}
        />
      </mesh>

      {[-0.055, 0, 0.055].map((x, i) => (
        <mesh key={i} position={[x, -0.14, 0.26]}>
          <boxGeometry args={[0.026, 0.018, 0.03]} />
          <meshStandardMaterial color="#000814" />
        </mesh>
      ))}
    </group>
  );
}

function RobotModel({ isSpeaking, isListening, isThinking }) {
  const groupRef     = useRef();
  const headRef      = useRef();
  const visorRef     = useRef();
  const mouthRef     = useRef();
  const leftArmRef   = useRef();
  const rightArmRef  = useRef();
  const chestGlowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Body idle breathing & posture
    if (groupRef.current) {
      if (isSpeaking) {
        groupRef.current.position.y = Math.sin(t * 3.2) * 0.05;
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.06;
      } else if (isListening) {
        // Attentive slight forward lean when student is speaking
        groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
        groupRef.current.position.z = 0.06;
        groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.03;
      } else {
        groupRef.current.position.y = Math.sin(t * 1.2) * 0.02;
        groupRef.current.position.z = 0;
        groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.04;
      }
    }

    // Head nodding / tilt
    if (headRef.current) {
      if (isSpeaking) {
        headRef.current.rotation.x = Math.sin(t * 4.2) * 0.08;
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.12;
      } else if (isListening) {
        // Subtle active-listening nods
        headRef.current.rotation.x = 0.05 + Math.sin(t * 1.8) * 0.04;
        headRef.current.rotation.y = Math.sin(t * 0.6) * 0.05;
      } else {
        headRef.current.rotation.x = Math.sin(t * 0.6) * 0.02;
        headRef.current.rotation.y = Math.sin(t * 0.4) * 0.08;
      }
    }

    // Mouth movement during speech
    if (mouthRef.current) {
      if (isSpeaking) {
        const mouthScale = 1 + Math.abs(Math.sin(t * 14)) * 1.8;
        mouthRef.current.scale.set(1, mouthScale, 1);
      } else {
        mouthRef.current.scale.set(1, 1, 1);
      }
    }

    // Visor and Chest lights dynamic response
    if (visorRef.current && chestGlowRef.current) {
      if (isSpeaking) {
        // Cyan speaking glow
        visorRef.current.material.color.set('#00e5ff');
        visorRef.current.material.emissive.set('#00e5ff');
        visorRef.current.material.emissiveIntensity = 2.4 + Math.sin(t * 8) * 0.8;

        chestGlowRef.current.material.color.set('#0dd9b8');
        chestGlowRef.current.material.emissive.set('#0dd9b8');
        chestGlowRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 7) * 0.6;
      } else if (isListening) {
        // Emerald active-listening glow
        visorRef.current.material.color.set('#10b981');
        visorRef.current.material.emissive.set('#10b981');
        visorRef.current.material.emissiveIntensity = 2.0 + Math.sin(t * 4.5) * 0.7;

        chestGlowRef.current.material.color.set('#10b981');
        chestGlowRef.current.material.emissive.set('#10b981');
        chestGlowRef.current.material.emissiveIntensity = 1.6 + Math.sin(t * 4) * 0.5;
      } else if (isThinking) {
        // Sky blue thinking glow
        visorRef.current.material.color.set('#38bdf8');
        visorRef.current.material.emissive.set('#38bdf8');
        visorRef.current.material.emissiveIntensity = 1.8 + Math.sin(t * 6) * 0.6;

        chestGlowRef.current.material.color.set('#38bdf8');
        chestGlowRef.current.material.emissive.set('#38bdf8');
        chestGlowRef.current.material.emissiveIntensity = 1.4 + Math.sin(t * 5) * 0.5;
      } else {
        // Idle gentle teal
        visorRef.current.material.color.set('#00e5ff');
        visorRef.current.material.emissive.set('#00e5ff');
        visorRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 1.5) * 0.3;

        chestGlowRef.current.material.color.set('#0dd9b8');
        chestGlowRef.current.material.emissive.set('#0dd9b8');
        chestGlowRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 1.5) * 0.2;
      }
    }

    // Arm gestures
    if (leftArmRef.current && rightArmRef.current) {
      if (isSpeaking) {
        leftArmRef.current.rotation.z = 0.32 + Math.sin(t * 2.5) * 0.22;
        rightArmRef.current.rotation.z = -0.32 - Math.sin(t * 2.5) * 0.22;
      } else {
        leftArmRef.current.rotation.z = 0.12 + Math.sin(t * 0.6) * 0.04;
        rightArmRef.current.rotation.z = -0.12 - Math.sin(t * 0.6) * 0.04;
      }
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
      <Head headRef={headRef} visorRef={visorRef} mouthRef={mouthRef} />
    </group>
  );
}

export default function ThreeAvatar({ isSpeaking, isListening, isThinking }) {
  return (
    <Canvas
      camera={{ position: [0, 0.35, 3.8], fov: 42 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-2.5, 2.5, 2.5]} intensity={0.8} color="#0dd9b8" />
      <pointLight position={[0, -1.5, 2.0]} intensity={0.4} color="#f59e0b" />
      <pointLight position={[0, 3, -3]} intensity={0.45} color="#00e5ff" />
      <fog attach="fog" args={['#070b12', 7, 24]} />

      <RobotModel isSpeaking={isSpeaking} isListening={isListening} isThinking={isThinking} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.36, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#080d16" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* Ambient floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <ringGeometry args={[0.5, 1.25, 32]} />
        <meshStandardMaterial
          color={isListening ? '#10b981' : '#0dd9b8'}
          emissive={isListening ? '#10b981' : '#0dd9b8'}
          emissiveIntensity={0.25}
          transparent
          opacity={0.45}
        />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={Math.PI / 4.5}
        target={[0, 0.1, 0]}
      />
    </Canvas>
  );
}
