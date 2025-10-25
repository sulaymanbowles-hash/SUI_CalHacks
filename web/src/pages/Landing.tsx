import { motion } from 'framer-motion';
import { RoyaltyBreakdown } from '../components/RoyaltyBreakdown';
import { FadeRise, Stagger, item } from '../components/motion/Reveals';
import { spawnRipple } from '../utils/ripple';
import Hero from '../components/hero/Hero';
import { Link } from 'react-router-dom';

// Marketplace row with real event density
function MarketplaceRow() {
  const events = [
    { title: "Nova Festival 2025", city: "Austin, TX", date: "June 22", price: 62, img: "/posters/nova.jpg" },
    { title: "Glasshouse Sessions", city: "San Francisco", date: "July 8", price: 28, img: "/posters/glasshouse.jpg" },
    { title: "Ambient Nights #14", city: "Brooklyn, NY", date: "Aug 15", price: 18, img: "/posters/ambient.jpg" },
  ];
  return (
    <section className="section mx-auto max-w-screen-xl px-6 py-20">
      <FadeRise>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">Upcoming events</h2>
          <Link to="/events" className="text-sm text-[var(--muted)] hover:text-[#DCE7F0]">View all →</Link>
        </div>
      </FadeRise>
      <Stagger delay={0.1}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {events.map(e => (
            <motion.a
              key={e.title}
              variants={item}
              className="card group overflow-hidden p-0 hover-lift"
            >
              <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#4DA2FF]/20 to-[#5AE0E5]/20">
                <div className="flex h-full items-center justify-center text-white/30 transition-transform duration-300 group-hover:scale-105">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <div className="font-medium text-[#DCE7F0] group-hover:underline">{e.title}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">{e.date} • {e.city}</div>
                <div className="mt-3 tabular-nums text-[#DCE7F0]">${e.price.toFixed(2)}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </Stagger>
    </section>
  );
}

export function Landing() {
  return (
    <main className="min-h-screen">
      {/* New Hero with backdrop */}
      <Hero />

      {/* Marketplace Grid */}
      <MarketplaceRow />

      {/* How It Works */}
      <section id="how" className="section mx-auto max-w-screen-xl px-6 py-20">
        <FadeRise>
          <div className="mb-12 text-center">
            <h2 className="font-[Inter_Tight] text-3xl tracking-tight text-[#DCE7F0]">Simple for buyers and creators</h2>
            <p className="mt-3 text-[var(--muted)]">Three steps. No paperwork. No screenshots.</p>
          </div>
        </FadeRise>
        <Stagger delay={0.1}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: wider card with visual */}
            <motion.div variants={item} className="card md:row-span-2">
              <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-[#4DA2FF]/10 to-[#5AE0E5]/5">
                <div className="flex h-full items-center justify-center text-white/40">
                  <div className="text-center">
                    <svg className="mx-auto mb-2 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs">Scan at entry</p>
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">Scan ticket</h3>
              <p className="leading-[1.6] text-[var(--muted)]">
                Show the QR in My Tickets. Staff sees one green check with ownership verified. No screenshots, no guessing.
              </p>
            </motion.div>
            
            {/* Right: two stacked cards */}
            <motion.div variants={item} className="card">
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">Buy</h3>
              <p className="leading-[1.6] text-[var(--muted)]">
                Connect your wallet and purchase in seconds. Tickets are unique on Sui, so fakes get filtered at the door.
              </p>
            </motion.div>
            
            <motion.div variants={item} className="card">
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">Resell</h3>
              <p className="leading-[1.6] text-[var(--muted)]">
                List your ticket. Creators and organizers are paid automatically on every sale. Royalties settle in ~480ms on testnet.
              </p>
            </motion.div>
          </div>
        </Stagger>
      </section>

      {/* Royalty Breakdown Section */}
      <section id="royalty" className="section mx-auto max-w-screen-xl px-6 py-20">
        <FadeRise>
          <div className="mb-12 text-center">
            <h2 className="font-[Inter_Tight] text-3xl tracking-tight text-[#DCE7F0]">Real numbers, not slogans</h2>
            <p className="mt-3 max-w-[65ch] mx-auto text-[var(--muted)]">
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
                <svg className="h-6 w-6 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">Instant settlements</h3>
              <p className="leading-[1.6] text-[var(--muted)]">
                Royalties split the moment a ticket is resold. No waiting for monthly payouts.
              </p>
            </motion.div>
            <motion.div variants={item} className="card md:col-span-2">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4DA2FF]/10">
                <svg className="h-6 w-6 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">Counterfeit-proof</h3>
              <p className="max-w-[65ch] leading-[1.6] text-[var(--muted)]">
                Each ticket is a unique blockchain object. Ownership is verified at the door. Duplicates fail. No screenshots work.
              </p>
            </motion.div>
            <motion.div variants={item} className="card md:col-span-3">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4DA2FF]/10">
                <svg className="h-6 w-6 text-[#4DA2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#DCE7F0]">100% transparent</h3>
              <p className="max-w-[65ch] leading-[1.6] text-[var(--muted)]">
                Every transaction is on-chain. See exactly where your money goes, every time. View policies and royalty logic in the explorer.
              </p>
            </motion.div>
          </div>
        </Stagger>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-screen-xl px-6 text-center">
          <FadeRise>
            <h2 className="font-[Inter_Tight] text-3xl tracking-tight text-[#DCE7F0]">
              Ready to try it?
            </h2>
            <p className="mx-auto mt-3 max-w-[65ch] text-[var(--muted)]">
              This is testnet. Get free tokens and experiment. No real money required.
            </p>
          </FadeRise>
          <FadeRise delay={0.1}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/app">
                <button
                  onPointerDown={spawnRipple}
                  className="btn btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white hover:scale-[1.02]"
                >
                  Launch App
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
              <a href="https://faucet.sui.io" target="_blank" rel="noopener noreferrer">
                <button className="rounded-xl border border-white/14 px-6 py-3 text-white/85 transition-colors hover:bg-white/5">
                  Get test SUI
                </button>
              </a>
            </div>
            <p className="mt-4 text-xs text-white/50">
              Sui testnet only • No real funds at risk
            </p>
          </FadeRise>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-white/60 sm:flex-row">
            <div>© 2025 DropKit. Built on Sui.</div>
            <div className="flex gap-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white/90">
                GitHub
              </a>
              <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white/90">
                Sui Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
