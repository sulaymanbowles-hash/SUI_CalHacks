/**
 * Ambient Background - Living background system
 * 2-3 gradient orbs + noise layer + Sui motif parallax
 * GPU-cheap: transform/opacity only
 */
import { useEffect, useState, useRef } from 'react';
import { tokens } from '../design-tokens';

interface AmbientBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'hero' | 'page';
}

export function AmbientBackground({ intensity = 'medium', variant = 'page' }: AmbientBackgroundProps) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (prefersReducedMotion.current) return;

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const intensityMap = {
    low: 0.05,
    medium: 0.08,
    high: 0.12,
  };

  const orbOpacity = intensityMap[intensity];
  const parallaxScroll = prefersReducedMotion.current ? 0 : scrollY * 0.01;
  const parallaxX = prefersReducedMotion.current ? 0 : (mousePos.x - 0.5) * tokens.ambient.parallax.mouse;
  const parallaxY = prefersReducedMotion.current ? 0 : (mousePos.y - 0.5) * tokens.ambient.parallax.mouse;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Top gradient fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#061522] to-transparent" />
      
      {/* Main orb - left/bottom */}
      <div 
        className="ambient-orb absolute"
        style={{
          width: tokens.ambient.orb.radius,
          height: tokens.ambient.orb.radius,
          left: '20%',
          bottom: '10%',
          opacity: orbOpacity,
          transform: `translate3d(${parallaxX}px, ${parallaxY - parallaxScroll}px, 0)`,
          background: `radial-gradient(circle, ${tokens.colors.brand.primary} 0%, transparent 65%)`,
          filter: `blur(${tokens.ambient.orb.blur})`,
          transition: prefersReducedMotion.current ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      />

      {/* Secondary orb - right/top */}
      <div 
        className="ambient-orb absolute"
        style={{
          width: `calc(${tokens.ambient.orb.radius} * 0.7)`,
          height: `calc(${tokens.ambient.orb.radius} * 0.7)`,
          right: '15%',
          top: '20%',
          opacity: orbOpacity * 0.6,
          transform: `translate3d(${-parallaxX * 0.5}px, ${-parallaxY * 0.5 + parallaxScroll}px, 0)`,
          background: `radial-gradient(circle, ${tokens.colors.brand.secondary} 0%, transparent 65%)`,
          filter: `blur(${tokens.ambient.orb.blur})`,
          transition: prefersReducedMotion.current ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      />

      {variant === 'hero' && (
        /* Third orb for hero only */
        <div 
          className="ambient-orb absolute"
          style={{
            width: `calc(${tokens.ambient.orb.radius} * 0.5)`,
            height: `calc(${tokens.ambient.orb.radius} * 0.5)`,
            left: '50%',
            top: '50%',
            opacity: orbOpacity * 0.4,
            transform: `translate(-50%, -50%) translate3d(${parallaxX * 0.3}px, ${parallaxY * 0.3}px, 0)`,
            background: `radial-gradient(circle, ${tokens.colors.brand.primary} 0%, transparent 70%)`,
            filter: `blur(${tokens.ambient.orb.blur})`,
            transition: prefersReducedMotion.current ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />
      )}

      {/* Sui glyph watermark with parallax */}
      <div 
        className="glyph-pattern absolute inset-0"
        style={{
          transform: `translateY(${scrollY * tokens.ambient.parallax.scroll}px)`,
          backgroundImage: "url(/brand/sui/glyph.svg)",
          backgroundSize: "48px 48px",
          backgroundRepeat: "repeat",
          opacity: Math.max(0.015, tokens.ambient.noise.opacity * (1 - scrollY / 1000)),
          WebkitMaskImage: "radial-gradient(50% 50% at 50% 40%, #000 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
          maskImage: "radial-gradient(50% 50% at 50% 40%, #000 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
        }}
      />

      {/* Noise texture */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          opacity: tokens.ambient.noise.opacity,
          mixBlendMode: 'overlay',
        }}
      />

      <style>{`
        @keyframes ambient-drift {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(3%, -2%); }
          66% { transform: translate(-2%, 3%); }
        }
        
        @media (prefers-reduced-motion: no-preference) {
          .ambient-orb {
            animation: ambient-drift 60s ease-in-out infinite;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .ambient-orb,
          .glyph-pattern {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
