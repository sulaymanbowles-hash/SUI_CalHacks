import { motion } from 'framer-motion';
import { RoyaltyBreakdown } from '../components/RoyaltyBreakdown';
import { FadeRise, Stagger, item } from '../components/motion/Reveals';
import { spawnRipple } from '../utils/ripple';
import Hero from '../components/hero/Hero';
import { Link } from 'react-router-dom';

// Marketplace row with enhanced cards
function MarketplaceRow() {
  const events = [
    { 
      title: "Nova Festival 2025", 
      city: "Austin, TX", 
      date: "Jun 22", 
      price: 62, 
      available: 47, 
      total: 100,
      verified: true,
      hot: true,
      img: "/posters/nova.jpg" 
    },
    { 
      title: "Glasshouse Sessions", 
      city: "San Francisco", 
      date: "Jul 8", 
      price: 28, 
      available: 12, 
      total: 50,
      verified: true,
      hot: false,
      img: "/posters/glasshouse.jpg" 
    },
    { 
      title: "Ambient Nights #14", 
      city: "Brooklyn, NY", 
      date: "Aug 15", 
      price: 18, 
      available: 89, 
      total: 120,
      verified: false,
      hot: false,
      img: "/posters/ambient.jpg" 
    },
  ];
  return (
    <section className="section mx-auto max-w-screen-xl px-6 py-20">
      <FadeRise>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">Upcoming events</h2>
          <Link to="/events" className="text-sm text-[var(--muted)] transition-colors hover:text-[#DCE7F0]">View all →</Link>
        </div>
      </FadeRise>
      <Stagger delay={0.1}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {events.map(e => (
            <Link
              key={e.title}
              to="/events"
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061522] rounded-xl"
            >
              <motion.div
                variants={item}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="card group overflow-hidden p-0 transition-shadow hover:shadow-[0_8px_32px_rgba(77,162,255,0.12)]"
              >
                {/* Image with lighter overlay and stacked badges */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#4DA2FF]/20 to-[#5AE0E5]/20">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="flex h-full items-center justify-center text-white/30 transition-transform duration-300 group-hover:scale-105">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  
                  {/* Stacked badges in top-left */}
                  <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    {/* Date chip - always first */}
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur-sm">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {e.date}
                    </span>
                    
                    {/* Verified badge - second */}
                    {e.verified && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-green-500/90 px-2 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                    
                    {/* Hot badge - third */}
                    {e.hot && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/90 px-2 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        Hot
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Content with increased spacing */}
                <div className="p-4">
                  <div className="mb-1 line-clamp-2 font-medium text-[#DCE7F0] transition-colors group-hover:text-[#4DA2FF]">{e.title}</div>
                  <div className="mt-2 text-xs text-[var(--muted)]">{e.city}</div>
                  
                  {/* Consistent footer baseline */}
                  <div className="mt-4 flex items-end justify-between border-t border-white/5 pt-3">
                    <div className="tabular-nums text-[#DCE7F0]">${e.price}</div>
                    <div className="text-xs text-[var(--muted)]">{e.available} of {e.total}</div>
                  </div>
                </div>
                
                {/* Hover indicator */}
                <div className="pointer-events-none absolute bottom-4 right-4 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-xs text-[#4DA2FF]">View details →</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </Stagger>
    </section>
  );
}

export function Landing() {
  return (
    <main className="min-h-screen">
      {/* Hero with improved backdrop */}
      <Hero />

      {/* Marketplace Grid */}
      <MarketplaceRow />

      {/* How It Works - balanced tiles with icons */}
      <section id="how" className="section mx-auto max-w-screen-xl px-6 py-20">
        <FadeRise>
          <div className="mb-4 text-center">
            <p className="text-sm text-[var(--muted)]">Three steps. No paperwork. No screenshots.</p>
            <h2 className="mt-2 font-[Inter_Tight] text-3xl tracking-tight text-[#DCE7F0]">Simple for buyers and creators</h2>
          </div>
        </FadeRise>
        <Stagger delay={0.1}>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* All three tiles with balanced visual language */}
            <motion.div 
              variants={item} 
              className="card group cursor-pointer transition-all hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              tabIndex={0}
            >
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DA2FF]/10 to-[#5AE0E5]/5 transition-transform group-hover:scale-105">
                  <svg className="h-8 w-8 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-center text-lg font-medium text-[#DCE7F0]">Scan ticket</h3>
              <p className="max-w-[70ch] text-center leading-[1.6] text-[var(--muted)]">
                Show your QR. Staff verifies ownership instantly. No screenshots work.
              </p>
            </motion.div>
            
            <motion.div 
              variants={item} 
              className="card group cursor-pointer transition-all hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              tabIndex={0}
            >
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DA2FF]/10 to-[#5AE0E5]/5 transition-transform group-hover:scale-105">
                  <svg className="h-8 w-8 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-center text-lg font-medium text-[#DCE7F0]">Buy</h3>
              <p className="max-w-[70ch] text-center leading-[1.6] text-[var(--muted)]">
                Connect wallet and purchase in seconds. Tickets are unique on Sui.
              </p>
            </motion.div>
            
            <motion.div 
              variants={item} 
              className="card group cursor-pointer transition-all hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              tabIndex={0}
            >
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DA2FF]/10 to-[#5AE0E5]/5 transition-transform group-hover:scale-105">
                  <svg className="h-8 w-8 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-center text-lg font-medium text-[#DCE7F0]">Resell</h3>
              <p className="max-w-[70ch] text-center leading-[1.6] text-[var(--muted)]">
                List your ticket. Creators get paid automatically. Splits settle in ~480ms.
              </p>
            </motion.div>
          </div>
        </Stagger>
      </section>

      {/* Royalty Breakdown Section - enhanced */}
      <section id="royalty" className="section mx-auto max-w-screen-xl px-6 py-20">
        <FadeRise>
          <div className="mb-12 text-center">
            <h2 className="font-[Inter_Tight] text-3xl tracking-tight text-[#DCE7F0]">Real numbers, not slogans</h2>
            <p className="mx-auto mt-3 max-w-[65ch] text-[var(--muted)]">
              Adjust the slider to see how resale splits work. Every number is enforced automatically.
            </p>
          </div>
        </FadeRise>
        <FadeRise delay={0.15}>
          <div className="flex justify-center">
            <RoyaltyBreakdown />
          </div>
        </FadeRise>
      </section>

      {/* Benefits Grid */}
      <section className="section mx-auto max-w-screen-xl px-6 py-20">
        <Stagger>
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div variants={item} className="card">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4DA2FF]/10">
                <svg className="h-6 w-6 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">Instant settlements</h3>
              <p className="max-w-[70ch] leading-[1.6] text-[var(--muted)]">
                Royalties split the moment a ticket is resold. No waiting for monthly payouts.
              </p>
            </motion.div>
            <motion.div variants={item} className="card md:col-span-2">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4DA2FF]/10">
                <svg className="h-6 w-6 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">Counterfeit-proof</h3>
              <p className="max-w-[70ch] leading-[1.6] text-[var(--muted)]">
                Each ticket is a unique blockchain object. Ownership is verified at the door. Duplicates fail. No screenshots work.
              </p>
            </motion.div>
            <motion.div variants={item} className="card md:col-span-3">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4DA2FF]/10">
                <svg className="h-6 w-6 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">100% transparent</h3>
              <p className="max-w-[70ch] leading-[1.6] text-[var(--muted)]">
                Every transaction is on-chain. See exactly where your money goes, every time. View policies and royalty logic in the explorer.
              </p>
            </motion.div>
          </div>
        </Stagger>
      </section>

      {/* Final CTA - improved spacing and copy */}
      <section className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-screen-xl px-6 text-center">
          <FadeRise>
            <h2 className="font-[Inter_Tight] text-3xl tracking-tight text-[#DCE7F0]">
              Ready to try it?
            </h2>
            <p className="mx-auto mt-3 max-w-[65ch] text-[var(--muted)]">
              This demo runs on Sui testnet. No real funds required.
            </p>
          </FadeRise>
          <FadeRise delay={0.1}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/events">
                <button
                  onPointerDown={spawnRipple}
                  className="btn btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061522]"
                >
                  Browse events
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
              <a href="https://faucet.sui.io" target="_blank" rel="noopener noreferrer">
                <button className="rounded-xl border border-white/14 px-6 py-3 text-white/85 transition-all hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061522]">
                  Get test SUI
                </button>
              </a>
            </div>
            <p className="mt-6 text-xs text-white/50">
              Sui testnet only • No real funds at risk
            </p>
          </FadeRise>
        </div>
      </section>

      {/* Footer - expanded links */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 text-sm text-white/60 sm:flex-row">
            <div>© 2025 DropKit. Built on Sui.</div>
            <div className="flex gap-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white/90 focus:outline-none focus-visible:text-white/90">
                GitHub
              </a>
              <a href="https://docs.sui.io" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white/90 focus:outline-none focus-visible:text-white/90">
                Sui Docs
              </a>
              <Link to="/privacy" className="transition-colors hover:text-white/90 focus:outline-none focus-visible:text-white/90">
                Privacy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-white/90 focus:outline-none focus-visible:text-white/90">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
