import FlowingWaterBackground from "./FlowingWaterBackground";
import TypedHeadline from "./TypedHeadline";
import BuiltOnSuiChip from "./BuiltOnSuiChip";
import BrandWatermark from "./BrandWatermark";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<'left' | 'right' | null>(null);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY;
      setScrollY(scroll);
      
      // Check if scrolled past hero for benefits bar fade
      if (heroRef.current) {
        const heroBottom = heroRef.current.offsetHeight;
        setScrolledPastHero(scroll > heroBottom);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const benefitsOpacity = scrolledPastHero ? 0 : Math.max(0, 1 - scrollY / 400);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden">
      {/* Flowing Water Background */}
      <div className="absolute inset-0 z-0">
        <FlowingWaterBackground paused={false} />
      </div>

      {/* Brand watermark */}
      <div className="relative z-10">
        <BrandWatermark />
      </div>

      <div className="relative z-10 mx-auto max-w-screen-xl px-6 py-[96px] md:py-[112px] overflow-hidden">
        {/* Built on Sui pill with micro-gloss */}
        <BuiltOnSuiChip />

        {/* Headline with subtle vignette for legibility */}
        <div className="relative mx-auto mt-6 w-full max-w-[min(90vw,800px)]">
          {/* Text vignette */}
          <div 
            className="absolute inset-0 -m-8 rounded-full blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.4) 0%, transparent 70%)',
              opacity: 0.7,
            }}
            aria-hidden="true"
          />
          
          <TypedHeadline
            lines={[
              "Tickets that pay",
              "creators on every",
              "resale"
            ]}
            className="relative text-center font-semibold text-white text-[clamp(32px,8vw,64px)] px-4"
          />
        </div>

        {/* Subhead - tighter spacing (12px = mt-3) */}
        <p className="mx-auto mt-3 max-w-[64ch] px-4 text-center text-[16.5px] leading-[1.6] text-white/85">
          Own your ticket and list it in seconds. On resale, creators and organizers are paid automatically.
        </p>

        {/* Persona lanes - breathing room (48-56px = mt-12-14) */}
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left card - Buyer */}
          <Link 
            to="/events" 
            className="card-lane group relative block rounded-[14px] border border-white/11 bg-white/[0.02] p-6 backdrop-blur-sm
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061522]"
            style={{
              transform: hoveredCard === 'left' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
              boxShadow: hoveredCard === 'left' 
                ? '0 12px 32px rgba(3,15,28,.16), 0 0 48px rgba(77,162,255,.12), inset 0 0 0 1px rgba(90,224,229,0.2)'
                : '0 8px 24px rgba(3,15,28,.12)',
              transition: 'transform 0.18s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.22s ease-out',
            }}
            onMouseEnter={() => setHoveredCard('left')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Moving light from water shader */}
            <div 
              className="pointer-events-none absolute inset-0 rounded-[14px] bg-gradient-to-br from-[#4DA2FF]/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-300"
              style={{ opacity: hoveredCard === 'left' ? 1 : 0 }}
              aria-hidden="true"
            />
            
            {/* Role badge */}
            <div className="mb-4 flex items-center gap-2.5 text-white/80">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08]">
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </span>
              <span className="text-[13px]">I'm here to go to a show</span>
            </div>
            
            <h3 className="relative mb-3 text-[22px] font-medium leading-[1.2] text-white">Browse events</h3>
            
            <p className="relative mb-5 line-clamp-2 max-w-[42ch] text-[15px] leading-[1.6] text-white/70">
              Purchase and resell if plans change. Real ownership verified on-chain.
            </p>
            
            <div className="relative mt-auto flex items-center justify-between text-white/60">
              <span className="text-[13px]">Explore →</span>
              <a href="#how" className="text-[13px] underline decoration-white/20 underline-offset-2 hover:text-white/90">
                How it works
              </a>
            </div>
          </Link>

          {/* Right card - Organizer */}
          <Link 
            to="/console" 
            className="card-lane group relative block rounded-[14px] border border-white/11 bg-white/[0.02] p-6 backdrop-blur-sm
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061522]"
            style={{
              transform: hoveredCard === 'right' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
              boxShadow: hoveredCard === 'right'
                ? '0 12px 32px rgba(3,15,28,.16), 0 0 48px rgba(90,224,229,.12), inset 0 0 0 1px rgba(90,224,229,0.2)'
                : '0 8px 24px rgba(3,15,28,.12)',
              transition: 'transform 0.18s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.22s ease-out',
            }}
            onMouseEnter={() => setHoveredCard('right')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Moving light from water shader */}
            <div 
              className="pointer-events-none absolute inset-0 rounded-[14px] bg-gradient-to-br from-[#5AE0E5]/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-300"
              style={{ opacity: hoveredCard === 'right' ? 1 : 0 }}
              aria-hidden="true"
            />
            
            {/* Role badge */}
            <div className="mb-4 flex items-center gap-2.5 text-white/80">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08]">
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </span>
              <span className="text-[13px]">I'm running a show</span>
            </div>
            
            <h3 className="relative mb-3 text-[22px] font-medium leading-[1.2] text-white">Start as organizer</h3>
            
            <p className="relative mb-5 line-clamp-2 max-w-[42ch] text-[15px] leading-[1.6] text-white/70">
              Create events, mint tickets, and scan at the door. Royalties split automatically.
            </p>
            
            <div className="relative mt-auto flex items-center justify-between text-white/60">
              <span className="text-[13px]">Get started →</span>
              <Link to="/checkin" className="text-[13px] underline decoration-white/20 underline-offset-2 hover:text-white/90">
                Scan tickets
              </Link>
            </div>
          </Link>
        </div>

        {/* Sticky benefits bar (fades on scroll) */}
        <div 
          className="mx-auto mt-8 flex max-w-[72ch] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14.5px] text-white/85 transition-opacity duration-300"
          style={{ opacity: benefitsOpacity }}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-[15px] w-[15px] text-green-400/90" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="max-w-[24ch]">Verified organizers</span>
          </span>
          <span className="text-white/25">•</span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="max-w-[24ch]">0% platform fees</span>
          </span>
          <span className="text-white/25">•</span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-[15px] w-[15px] text-yellow-400/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="max-w-[24ch]">Instant transfers</span>
          </span>
        </div>

        {/* Scroll hint with breathing animation */}
        <div className="mt-12 flex justify-center" style={{ opacity: benefitsOpacity }}>
          <div className="animate-bounce-soft">
            <svg className="h-5 w-5 text-white/28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); opacity: 0.28; }
          50% { transform: translateY(5px); opacity: 0.48; }
        }
        .animate-bounce-soft {
          animation: bounce-soft 2.8s ease-in-out infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-bounce-soft {
            animation: none !important;
          }
        }
      `}} />
    </section>
  );
}
