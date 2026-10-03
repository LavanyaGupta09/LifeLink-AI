import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const TerrainMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // A simple terrain generated via sine waves
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
      {/* 50x50 segments for a nice wireframe grid */}
      <planeGeometry args={[20, 20, 50, 50]} />
      <meshStandardMaterial 
        color="#10b981" 
        wireframe={true} 
        transparent 
        opacity={0.4} 
      />
    </mesh>
  );
};

const DroneMarker = () => {
  const droneRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (droneRef.current) {
      const t = clock.getElapsedTime();
      droneRef.current.position.x = Math.sin(t * 0.5) * 4;
      droneRef.current.position.y = Math.sin(t * 1.5) * 0.5 + 2;
      droneRef.current.position.z = Math.cos(t * 0.5) * 4;
      droneRef.current.rotation.y = -t * 0.5;
    }
  });

  return (
    <group ref={droneRef}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>
      {/* Spotlight pointing down */}
      <spotLight 
        position={[0, 0, 0]} 
        angle={0.3} 
        penumbra={0.5} 
        intensity={50} 
        color="#ef4444" 
        target-position={[0, -5, 0]}
      />
    </group>
  );
};

interface HillyTerrainMapProps {
  fallbackMode?: boolean;
}

const HillyTerrainMap: React.FC<HillyTerrainMapProps> = ({ fallbackMode = false }) => {
  if (fallbackMode) {
    return (
      <div className="w-full h-full bg-[#060B14] flex flex-col items-center justify-center border border-emerald-500/20 rounded-2xl relative overflow-hidden">
        <div className="w-[150%] h-[150%] border-t-2 border-emerald-500/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin duration-[10s]"></div>
        <div className="z-10 text-emerald-500 font-bold tracking-widest text-sm bg-black/50 px-4 py-2 rounded-full">TOPOGRAPHIC SCAN ACTIVE</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0f1c] to-[#040608] relative border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#3D91FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />
        
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <TerrainMesh />
        <DroneMarker />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30">
        <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">Terrain Analysis</p>
        <p className="text-white text-xs font-mono">ALT: 1,420m | Hilly</p>
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-rose-500/30 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
        <p className="text-rose-500 text-[10px] font-bold tracking-widest uppercase">Rescue Drone Active</p>
      </div>

      <div className="absolute inset-0 pointer-events-none z-20 border-[20px] border-black/20 rounded-2xl"></div>
    </div>
  );
};

export default HillyTerrainMap;
