import React, { useRef, useState, useEffect } from 'react';
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
    try {
      const t = state.clock.elapsedTime;

      if (groupRef.current) {
        if (isSpeaking) {
          groupRef.current.position.y = Math.sin(t * 3.2) * 0.05;
          groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.06;
        } else if (isListening) {
          groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
          groupRef.current.position.z = 0.06;
          groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.03;
        } else {
          groupRef.current.position.y = Math.sin(t * 1.2) * 0.02;
          groupRef.current.position.z = 0;
          groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.04;
        }
      }

      if (headRef.current) {
        if (isSpeaking) {
          headRef.current.rotation.x = Math.sin(t * 4.2) * 0.08;
          headRef.current.rotation.y = Math.sin(t * 0.8) * 0.12;
        } else if (isListening) {
          headRef.current.rotation.x = 0.05 + Math.sin(t * 1.8) * 0.04;
          headRef.current.rotation.y = Math.sin(t * 0.6) * 0.05;
        } else {
          headRef.current.rotation.x = Math.sin(t * 0.6) * 0.02;
          headRef.current.rotation.y = Math.sin(t * 0.4) * 0.08;
        }
      }

      if (mouthRef.current) {
        if (isSpeaking) {
          const mouthScale = 1 + Math.abs(Math.sin(t * 14)) * 1.8;
          mouthRef.current.scale.set(1, mouthScale, 1);
        } else {
          mouthRef.current.scale.set(1, 1, 1);
        }
      }

      const visorMat = visorRef.current?.material;
      const chestMat = chestGlowRef.current?.material;

      if (visorMat && chestMat) {
        if (isSpeaking) {
          visorMat.color?.set?.('#00e5ff');
          visorMat.emissive?.set?.('#00e5ff');
          visorMat.emissiveIntensity = 2.4 + Math.sin(t * 8) * 0.8;

          chestMat.color?.set?.('#0dd9b8');
          chestMat.emissive?.set?.('#0dd9b8');
          chestMat.emissiveIntensity = 1.5 + Math.sin(t * 7) * 0.6;
        } else if (isListening) {
          visorMat.color?.set?.('#10b981');
          visorMat.emissive?.set?.('#10b981');
          visorMat.emissiveIntensity = 2.0 + Math.sin(t * 4.5) * 0.7;

          chestMat.color?.set?.('#10b981');
          chestMat.emissive?.set?.('#10b981');
          chestMat.emissiveIntensity = 1.6 + Math.sin(t * 4) * 0.5;
        } else if (isThinking) {
          visorMat.color?.set?.('#38bdf8');
          visorMat.emissive?.set?.('#38bdf8');
          visorMat.emissiveIntensity = 1.8 + Math.sin(t * 6) * 0.6;

          chestMat.color?.set?.('#38bdf8');
          chestMat.emissive?.set?.('#38bdf8');
          chestMat.emissiveIntensity = 1.4 + Math.sin(t * 5) * 0.5;
        } else {
          visorMat.color?.set?.('#00e5ff');
          visorMat.emissive?.set?.('#00e5ff');
          visorMat.emissiveIntensity = 1.5 + Math.sin(t * 1.5) * 0.3;

          chestMat.color?.set?.('#0dd9b8');
          chestMat.emissive?.set?.('#0dd9b8');
          chestMat.emissiveIntensity = 0.8 + Math.sin(t * 1.5) * 0.2;
        }
      }

      if (leftArmRef.current && rightArmRef.current) {
        if (isSpeaking) {
          leftArmRef.current.rotation.z = 0.32 + Math.sin(t * 2.5) * 0.22;
          rightArmRef.current.rotation.z = -0.32 - Math.sin(t * 2.5) * 0.22;
        } else {
          leftArmRef.current.rotation.z = 0.12 + Math.sin(t * 0.6) * 0.04;
          rightArmRef.current.rotation.z = -0.12 - Math.sin(t * 0.6) * 0.04;
        }
      }
    } catch (e) {
      // Prevent frame animation crash from bubbling up
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
      <Head headRef={headRef} visorRef={visorRef} mouthRef={mouthRef} />
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

export default function ThreeAvatar({ isSpeaking, isListening, isThinking }) {
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGLError(true);
    } catch (e) {
      setWebGLError(true);
    }
  }, []);

  if (webGLError) {
    return <FallbackRobotAvatar isSpeaking={isSpeaking} isListening={isListening} isThinking={isThinking} />;
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
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-2.5, 2.5, 2.5]} intensity={0.8} color="#0dd9b8" />
        <pointLight position={[0, -1.5, 2.0]} intensity={0.4} color="#f59e0b" />
        <pointLight position={[0, 3, -3]} intensity={0.45} color="#00e5ff" />
        <fog attach="fog" args={['#070b12', 7, 24]} />

        <RobotModel isSpeaking={isSpeaking} isListening={isListening} isThinking={isThinking} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.36, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#080d16" roughness={0.85} metalness={0.15} />
        </mesh>

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
    </div>
  );
}
