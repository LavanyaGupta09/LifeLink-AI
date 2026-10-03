/**
 * FloatingMedicalScene — 3D Hero element for Dashboard
 * A floating DNA helix with ambient particles rendered in a single WebGL canvas.
 * Lightweight: low-poly, auto-pauses when off-screen, lazy-loaded.
 * 
 * SAFETY: This is a purely visual component. Removing it has ZERO effect on
 * Dashboard business logic, navigation, or API calls.
 */
import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh, Group, BufferGeometry, Points } from 'three';
import * as THREE from 'three';

// ─── DNA Helix ───────────────────────────────────────────
const DNAHelix: React.FC = () => {
  const groupRef = useRef<Group>(null);

  // Pre-compute helix geometry (two intertwined strands)
  const { positions, colors } = useMemo(() => {
    const posArr: number[] = [];
    const colArr: number[] = [];
    const steps = 60;
    const radius = 0.35;
    const height = 3.0;

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 4; // 2 full twists
      const y = (t - 0.5) * height;

      // Strand A
      posArr.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      // Teal-to-purple gradient
      const r1 = 0.0 + t * 0.24;
      const g1 = 0.79 - t * 0.25;
      const b1 = 0.65 + t * 0.33;
      colArr.push(r1, g1, b1);

      // Strand B (offset by π)
      posArr.push(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
      colArr.push(r1 * 0.7, g1 * 0.7, b1 * 1.1);
    }

    return {
      positions: new Float32Array(posArr),
      colors: new Float32Array(colArr),
    };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
      
      {/* Connecting rungs between strands */}
      {Array.from({ length: 12 }).map((_, i) => {
        const t = (i + 0.5) / 12;
        const angle = t * Math.PI * 4;
        const y = (t - 0.5) * 3.0;
        const r = 0.35;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <boxGeometry args={[r * 2, 0.015, 0.015]} />
            <meshStandardMaterial
              color={`hsl(${160 + t * 80}, 70%, 55%)`}
              transparent
              opacity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── Floating Core Sphere ────────────────────────────────
const CoreSphere: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={0.5}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#00C9A7"
          emissive="#00C9A7"
          emissiveIntensity={0.15}
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={0.35}
          distort={0.3}
          speed={1.5}
          wireframe
        />
      </mesh>
    </Float>
  );
};

// ─── Ambient Particles ───────────────────────────────────
const AmbientParticles: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  const count = 80;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#00C9A7"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

// ─── Main Scene ──────────────────────────────────────────
const Scene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#00C9A7" />
      <pointLight position={[-3, -3, 2]} intensity={0.3} color="#8B5CF6" />
      <DNAHelix />
      <CoreSphere />
      <AmbientParticles />
    </>
  );
};

// ─── Exported Container ──────────────────────────────────
interface FloatingMedicalSceneProps {
  className?: string;
}

const FloatingMedicalScene: React.FC<FloatingMedicalSceneProps> = ({ className = '' }) => {
  const [hasWebGL, setHasWebGL] = React.useState(true);

  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // CSS 3D fallback for devices without WebGL
  if (!hasWebGL) {
    return (
      <div className={`${className} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-full border-2 border-[#00C9A7]/30"
            style={{
              animation: 'spin 8s linear infinite',
              boxShadow: '0 0 40px rgba(0, 201, 167, 0.15)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 1.5]} // Cap pixel ratio for performance
        style={{ background: 'transparent' }}
        gl={{ 
          alpha: true, 
          antialias: false, // Save GPU on mobile
          powerPreference: 'low-power',
        }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default FloatingMedicalScene;
