import React from 'react';

interface IsometricMapWrapperProps {
  children: React.ReactNode;
  active?: boolean;
}

const IsometricMapWrapper: React.FC<IsometricMapWrapperProps> = ({ children, active = true }) => {
  if (!active) return <>{children}</>;

  return (
    <div className="relative w-full h-full perspective-[1200px] flex items-center justify-center overflow-hidden bg-[#0a0f1c] rounded-2xl">
      {/* 3D Container */}
      <div 
        className="w-[120%] h-[120%] relative transition-transform duration-1000 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(45deg) rotateZ(-25deg) scale(0.9)',
          boxShadow: '-20px 20px 40px rgba(0,200,167,0.15)',
        }}
      >
        {/* Glow under map */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-[50px] -z-10 translate-z-[-20px]"></div>
        
        {/* The Actual Map Content */}
        <div className="w-full h-full border-4 border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl bg-[#1a2333]">
          {children}
        </div>
        
        {/* Fake 3D Extrusion (Depth) */}
        <div className="absolute top-full left-0 w-full h-[20px] bg-emerald-900/50 origin-top" style={{ transform: 'rotateX(-90deg)' }}></div>
        <div className="absolute top-0 right-0 w-[20px] h-full bg-emerald-800/40 origin-right" style={{ transform: 'rotateY(-90deg)' }}></div>
      </div>
      
      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Live Isometric Radar</span>
      </div>
      
      {/* Scanning laser line overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-30 overflow-hidden rounded-2xl">
        <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_8px_#10b981] animate-scan-vertical"></div>
      </div>
    </div>
  );
};

export default IsometricMapWrapper;
