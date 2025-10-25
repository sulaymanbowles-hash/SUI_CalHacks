import SuiHeroBackdrop from "./SuiHeroBackdrop";
import BuiltOnSuiChip from "./BuiltOnSuiChip";
import BrandWatermark from "./BrandWatermark";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hoveredCard, setHoveredCard] = useState<'left' | 'right' | null>(null);
  const [hasHoveredLeft, setHasHoveredLeft] = useState(false);
  const [hasHoveredRight, setHasHoveredRight] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
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

  const parallaxY = scrollY * 0.015;
  const tiltX = (mousePos.y - 0.5) * 0.4;
  const tiltY = (mousePos.x - 0.5) * -0.4;

  return (
    <section ref={heroRef} className="relative overflow-hidden">
      <SuiHeroBackdrop />
      <BrandWatermark />

      <div className="mx-auto max-w-screen-xl px-6 py-[96px] md:py-[112px]">
        <BuiltOnSuiChip />

        {/* Heading - improved rhythm, no hover effects */}
        <h1 
          className="mx-auto mt-8 max-w-[16ch] text-center font-semibold leading-[1.06] tracking-[-0.015em] text-white
                     text-[40px] sm:text-[56px] md:text-[64px]"
          style={{
            transform: `translateY(${parallaxY}px)`,
            transition: 'transform 0.08s ease-out',
          }}
        >
          Tickets that pay
          <br className="hidden sm:block" />
          creators on every resale
        </h1>

        {/* Subhead - tighter spacing */}
        <p className="mx-auto mt-5 max-w-[64ch] text-center text-[16.5px] leading-[1.6] text-white/72">
          Own your ticket and list it in seconds. On resale, creators and organizers are paid automatically.
        </p>

        {/* Persona lanes - fluid micro-interactions */}
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left card */}
          <Link 
            to="/app" 
            className="card-lane group relative rounded-[14px] border border-white/11 bg-white/[0.02] p-6
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061522]"
            style={{
              transform: hoveredCard === 'left' 
                ? `perspective(1000px) rotateX(${tiltX * 0.5}deg) rotateY(${tiltY * 0.5}deg) translateY(-2px)`
                : `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              boxShadow: hoveredCard === 'left' 
                ? '0 12px 32px rgba(3,15,28,.16), 0 0 48px rgba(77,162,255,.12)'
                : '0 8px 24px rgba(3,15,28,.12)',
              transition: 'transform 0.18s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.22s ease-out',
            }}
            onMouseEnter={() => {
              setHoveredCard('left');
              if (!hasHoveredLeft) setHasHoveredLeft(true);
            }}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Inner stroke - subtler than outer */}
            <div className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/[0.025]" />
            
            {/* Specular highlight - increases on hover */}
            <div 
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent transition-opacity duration-200"
              style={{ opacity: hoveredCard === 'left' ? 1 : 0 }}
            />
            
            <div className="mb-4 flex items-center gap-2.5 text-white/80">
              <span 
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08] transition-colors duration-200"
                style={{ backgroundColor: hoveredCard === 'left' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)' }}
              >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </span>
              <span className="text-[13px]">I'm here to go to a show</span>
            </div>
            
            <h3 className="mb-3 text-[22px] font-medium leading-[1.2] text-white">Find a show</h3>
            
            <p className="mb-5 max-w-[42ch] text-[15px] leading-[1.6] text-white/70">
              Purchase tickets and resell if plans change. No screenshots—real ownership.
            </p>
            
            <div className="flex items-center gap-4">
              <button 
                className="btn-primary group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#4DA2FF] px-5 py-2.5 text-[14px] font-medium text-white shadow-[0_2px_8px_rgba(77,162,255,0.24)] transition-all duration-200 hover:bg-[#5DADFF] hover:shadow-[0_4px_12px_rgba(77,162,255,0.32)] hover:scale-[1.015] active:scale-[0.98]"
                style={{
                  transform: hoveredCard === 'left' ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                {/* Diagonal sheen - sweeps once on first hover */}
                <div 
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ${hasHoveredLeft ? 'animate-sheen-once' : ''}`}
                  style={{
                    transform: 'translateX(-100%) skewX(-15deg)',
                    width: '200%',
                  }}
                />
                <span className="relative">Browse events</span>
                <svg 
                  className="relative h-3.5 w-3.5 transition-transform duration-120"
                  style={{
                    transform: hoveredCard === 'left' ? 'translateX(6px)' : 'translateX(0)',
                  }}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a href="#how" className="text-[13px] text-white/60 underline decoration-white/20 underline-offset-2 transition-colors duration-200 hover:text-white/90 hover:decoration-white/40">
                How resale works
              </a>
            </div>
          </Link>

          {/* Right card */}
          <Link 
            to="/console" 
            className="card-lane group relative rounded-[14px] border border-white/11 bg-white/[0.02] p-6
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061522]"
            style={{
              transform: hoveredCard === 'right'
                ? `perspective(1000px) rotateX(${tiltX * 0.5}deg) rotateY(${tiltY * 0.5}deg) translateY(-2px)`
                : `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              boxShadow: hoveredCard === 'right'
                ? '0 12px 32px rgba(3,15,28,.16), 0 0 48px rgba(90,224,229,.12)'
                : '0 8px 24px rgba(3,15,28,.12)',
              transition: 'transform 0.18s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.22s ease-out',
            }}
            onMouseEnter={() => {
              setHoveredCard('right');
              if (!hasHoveredRight) setHasHoveredRight(true);
            }}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/[0.025]" />
            
            <div 
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent transition-opacity duration-200"
              style={{ opacity: hoveredCard === 'right' ? 1 : 0 }}
            />
            
            <div className="mb-4 flex items-center gap-2.5 text-white/80">
              <span 
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08] transition-colors duration-200"
                style={{ backgroundColor: hoveredCard === 'right' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)' }}
              >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </span>
              <span className="text-[13px]">I'm running a show</span>
            </div>
            
            <h3 className="mb-3 text-[22px] font-medium leading-[1.2] text-white">Run your event</h3>
            
            <p className="mb-5 max-w-[42ch] text-[15px] leading-[1.6] text-white/70">
              Create events, mint tickets, and scan at the door. Royalties split automatically on every resale.
            </p>
            
            <div className="flex items-center gap-4">
              <button 
                className="btn-primary group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#4DA2FF] px-5 py-2.5 text-[14px] font-medium text-white shadow-[0_2px_8px_rgba(77,162,255,0.24)] transition-all duration-200 hover:bg-[#5DADFF] hover:shadow-[0_4px_12px_rgba(77,162,255,0.32)] hover:scale-[1.015] active:scale-[0.98]"
                style={{
                  transform: hoveredCard === 'right' ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                <div 
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ${hasHoveredRight ? 'animate-sheen-once' : ''}`}
                  style={{
                    transform: 'translateX(-100%) skewX(-15deg)',
                    width: '200%',
                  }}
                />
                <span className="relative">Get started</span>
                <svg 
                  className="relative h-3.5 w-3.5 transition-transform duration-120"
                  style={{
                    transform: hoveredCard === 'right' ? 'translateX(6px)' : 'translateX(0)',
                  }}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <Link to="/checkin" className="text-[13px] text-white/60 underline decoration-white/20 underline-offset-2 transition-colors duration-200 hover:text-white/90 hover:decoration-white/40">
                Scan at the door
              </Link>
            </div>
          </Link>
        </div>

        {/* Trust row - enhanced with monochrome icons */}
        <div className="mx-auto mt-8 flex max-w-[72ch] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14.5px] text-white/78">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-[15px] w-[15px] text-green-400/90" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified organizers
          </span>
          <span className="text-white/25">•</span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            0% platform fees
          </span>
          <span className="text-white/25">•</span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-[15px] w-[15px] text-yellow-400/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant transfers
          </span>
        </div>

        {/* Scroll hint */}
        <div className="mt-12 flex justify-center">
          <div className="animate-bounce-soft">
            <svg className="h-5 w-5 text-white/28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); opacity: 0.28; }
          50% { transform: translateY(5px); opacity: 0.48; }
        }
        .animate-bounce-soft {
          animation: bounce-soft 2.8s ease-in-out infinite;
        }
        
        @keyframes sheen-once {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(100%) skewX(-15deg); }
        }
        .animate-sheen-once {
          animation: sheen-once 0.7s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-bounce-soft,
          .animate-sheen-once {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
