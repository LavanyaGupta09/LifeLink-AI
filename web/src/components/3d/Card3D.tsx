/**
 * Card3D — A CSS 3D perspective-tilt card wrapper
 * Uses pure CSS transforms for the 3D floating effect — NO WebGL overhead.
 * This is the primary visual enhancement for Dashboard quick-action cards.
 *
 * SAFETY: Wraps children without altering their functionality.
 * Remove this wrapper → cards revert to flat. Zero business logic impact.
 */
import React, { useRef, useState, useCallback } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number; // tilt intensity 0–1
  onClick?: () => void;
}

const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  glowColor = 'rgba(0, 201, 167, 0.12)',
  intensity = 0.5,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const rafId = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      // Cancel previous frame to avoid stacking
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const rect = cardRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0..1
        const y = (e.clientY - rect.top) / rect.height; // 0..1
        const maxTilt = 12 * intensity;
        const tiltX = (0.5 - y) * maxTilt;
        const tiltY = (x - 0.5) * maxTilt;
        setTransform(
          `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`
        );
        setGlowPos({ x: x * 100, y: y * 100 });
      });
    },
    [intensity]
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        transform,
        transition: isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        transformStyle: 'preserve-3d',
        willChange: isHovered ? 'transform' : 'auto',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
      {/* Glow spotlight that follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
        }}
      />
    </div>
  );
};

export default Card3D;
