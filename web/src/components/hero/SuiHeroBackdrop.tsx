import { useEffect, useState, useRef } from "react";

export default function SuiHeroBackdrop() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [isInHero, setIsInHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const inHero = e.clientY >= rect.top && e.clientY <= rect.bottom;
      setIsInHero(inHero);
      
      if (inHero) {
        setMousePos({
          x: e.clientX / window.innerWidth,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // L3 parallax (aurora field) - 2% scroll movement
  const auroraParallax = scrollY * 0.02;
  
  // L2 parallax (glyph pattern) - 1% scroll movement
  const glyphParallax = scrollY * 0.01;
  
  // L1 proximity glow - follows pointer with eased lag (8% influence)
  const glowX = 50 + (mousePos.x - 0.5) * 8;
  const glowY = 50 + (mousePos.y - 0.5) * 8;

  return (
    <div 
      ref={heroRef}
      aria-hidden 
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Top vignette */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#061522] to-transparent" />
      
      {/* Bottom vignette - dissolves into next section */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#061522] via-[#061522]/60 to-transparent" />

      {/* L3: Aurora blobs - positioned behind cards, reacts to scroll */}
      <div 
        className="aurora1 absolute -right-[20vmax] h-[60vmax] w-[60vmax]"
        style={{
          top: `calc(48% + ${auroraParallax}px)`,
          transform: 'translate3d(0, 0, 0)',
          transition: 'top 0.1s ease-out',
        }}
      />
      <div 
        className="aurora2 absolute -left-[15vmax] h-[55vmax] w-[55vmax]"
        style={{
          top: `calc(58% + ${auroraParallax}px)`,
          transform: 'translate3d(0, 0, 0)',
          transition: 'top 0.1s ease-out',
        }}
      />

      {/* L2: Sui glyph pattern - subtle, masked, pans slowly */}
      <div 
        className="mask-center absolute inset-0 opacity-[.04]"
        style={{
          transform: `translateY(${glyphParallax}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div
          className="pan h-full w-full"
          style={{
            backgroundImage: "url(/brand/sui/glyph.svg)",
            backgroundRepeat: "repeat",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* L1: Proximity glow (left card) - tracks pointer within hero */}
      <div 
        className="proximity-glow-left absolute h-[40vmax] w-[40vmax] opacity-0 transition-opacity duration-300"
        style={{
          left: `${glowX - 25}%`,
          top: `${glowY - 20}%`,
          opacity: isInHero ? 0.12 : 0,
          transform: 'translate3d(0, 0, 0)',
          transition: 'left 0.6s cubic-bezier(0.23, 1, 0.32, 1), top 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease-out',
        }}
      />

      {/* L1: Proximity glow (right card) */}
      <div 
        className="proximity-glow-right absolute h-[40vmax] w-[40vmax] opacity-0 transition-opacity duration-300"
        style={{
          left: `${glowX - 15}%`,
          top: `${glowY - 20}%`,
          opacity: isInHero ? 0.12 : 0,
          transform: 'translate3d(0, 0, 0)',
          transition: 'left 0.6s cubic-bezier(0.23, 1, 0.32, 1), top 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease-out',
        }}
      />

      {/* Fine noise */}
      <div className="noise absolute inset-0 mix-blend-overlay opacity-[.03]" />

      <style jsx>{`
        /* L3: Aurora field - slow drift + brightest under CTAs */}
        .aurora1 {
          background: radial-gradient(circle at center, rgba(77,162,255,.38) 0%, rgba(77,162,255,0) 65%);
          filter: blur(72px);
          animation: float1 52s ease-in-out infinite;
          will-change: transform;
        }
        .aurora2 {
          background: radial-gradient(circle at center, rgba(17,199,197,.35) 0%, rgba(17,199,197,0) 65%);
          filter: blur(64px);
          animation: float2 58s ease-in-out infinite;
          will-change: transform;
        }
        
        /* L2: Sui glyph mask - tighter center, disappears near headline */}
        .mask-center {
          -webkit-mask-image: radial-gradient(45% 55% at 50% 52%, #000 0%, rgba(0,0,0,0.4) 45%, transparent 100%);
          mask-image: radial-gradient(45% 55% at 50% 52%, #000 0%, rgba(0,0,0,0.4) 45%, transparent 100%);
        }
        .pan {
          animation: pan 90s linear infinite;
        }
        
        /* L1: Proximity glows - soft radial highlights */}
        .proximity-glow-left {
          background: radial-gradient(circle at center, rgba(77,162,255,.45) 0%, rgba(77,162,255,0) 70%);
          filter: blur(48px);
          pointer-events: none;
        }
        .proximity-glow-right {
          background: radial-gradient(circle at center, rgba(90,224,229,.4) 0%, rgba(90,224,229,0) 70%);
          filter: blur(48px);
          pointer-events: none;
        }
        
        .noise {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');
        }
        
        @keyframes float1 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          25% { transform: translate3d(3%, -2%, 0) rotate(1.2deg); }
          50% { transform: translate3d(-2%, 1%, 0) rotate(-0.8deg); }
          75% { transform: translate3d(2%, 2%, 0) rotate(0.6deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          25% { transform: translate3d(-2%, 2%, 0) rotate(-1deg); }
          50% { transform: translate3d(2%, -1%, 0) rotate(0.8deg); }
          75% { transform: translate3d(-1%, 2%, 0) rotate(-0.6deg); }
        }
        @keyframes pan {
          0% { background-position: 0 0; }
          100% { background-position: 96px 48px; }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .aurora1,
          .aurora2,
          .pan {
            animation: none !important;
          }
          .proximity-glow-left,
          .proximity-glow-right {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
