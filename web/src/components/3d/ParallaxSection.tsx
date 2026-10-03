/**
 * ParallaxSection — Adds subtle parallax depth effect to sections
 * Uses IntersectionObserver + CSS transforms for zero-dependency scroll depth.
 *
 * SAFETY: Pure visual wrapper. Removing this has no functional impact.
 */
import React, { useRef, useEffect, useState } from 'react';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // 0 = no parallax, 1 = full parallax
  fadeIn?: boolean;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className = '',
  speed = 0.08,
  fadeIn = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let frameId: number;
    const handleScroll = () => {
      frameId = requestAnimationFrame(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const viewH = window.innerHeight;
        const progress = (viewH - rect.top) / (viewH + rect.height);
        setOffset((progress - 0.5) * speed * 100);
      });
    };

    // Find the scrollable parent (ResponsiveLayout uses overflow-y-auto on parent)
    const scrollParent = ref.current?.closest('[class*="overflow-y"]') || window;
    scrollParent.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(frameId);
      scrollParent.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible, speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        opacity: fadeIn ? (isVisible ? 1 : 0) : 1,
        transition: 'opacity 0.6s ease-out, transform 0.1s linear',
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxSection;
