/**
 * FloatingSOSBeacon — 3D Emergency Beacon for SOS Page
 * A pulsing, high-alert 3D visual for emergency status.
 *
 * SAFETY: Purely visual. Does not replace actual SOS trigger logic.
 */
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import * as THREE from 'three';

// ─── Pulsing Core ─────────────────────────────────────────
const BeaconCore: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      // Aggressive pulse
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.15);
    }
  });

  return (
    <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color="#FF4757"
          emissive="#FF4757"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.5}
          transparent
          opacity={0.9}
          distort={0.4}
          speed={3}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
};

// ─── Radar/Sonar Rings ───────────────────────────────────
const BeaconRings: React.FC = () => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        // Expand outwards and fade out
        const timeOffset = i * 1.5;
        const s = ((state.clock.elapsedTime * 1.5 + timeOffset) % 4);
        child.scale.setScalar(1 + s * 1.5);
        (child as Mesh).material.opacity = Math.max(0, (1 - s / 4)) * 0.5;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation-x={Math.PI / 2}>
          <ringGeometry args={[1, 1.1, 64]} />
          <meshBasicMaterial color="#FF4757" transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Main Scene ──────────────────────────────────────────
const Scene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#FF4757" distance={10} />
      <pointLight position={[2, 2, 2]} intensity={1} color="#ffffff" />
      <BeaconCore />
      <BeaconRings />
    </>
  );
};

// ─── Exported Container ──────────────────────────────────
interface FloatingSOSBeaconProps {
  className?: string;
  isCritical?: boolean;
}

const FloatingSOSBeacon: React.FC<FloatingSOSBeaconProps> = ({ className = '', isCritical = true }) => {
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

  const color = isCritical ? '#FF4757' : '#FFA502';

  if (!hasWebGL) {
    return (
      <div className={`${className} relative overflow-hidden flex items-center justify-center`}>
        <div
          className="w-24 h-24 rounded-full border-4"
          style={{
            borderColor: color,
            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            boxShadow: `0 0 40px ${color}80`,
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default FloatingSOSBeacon;
