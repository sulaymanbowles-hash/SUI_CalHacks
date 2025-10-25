import { Link, useLocation } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useLayoutEffect, useState } from 'react';
import { ZkLoginButton } from './ZkLoginButton';
import { getZkLoginSession } from '../lib/zklogin';

// Two-lane navigation: Visitors vs Organizers
const VISITOR_NAV = [
  { href: '/app', label: 'Events' },
  { href: '/my-tickets', label: 'My Tickets' },
  { href: '/sell', label: 'Sell' },
];

const ORGANIZER_NAV = [
  { href: '/console', label: 'Console' },
  { href: '/checkin', label: 'Scanner' },
  { href: '/payouts', label: 'Payouts' },
];

export function Header() {
  const location = useLocation();
  const account = useCurrentAccount();
  const zkSession = getZkLoginSession();
  const { scrollY } = useScroll();
  
  const [organizerOpen, setOrganizerOpen] = useState(false);
  
  // Scroll refinements: 64 → 56px, backdrop darkens
  const height = useTransform(scrollY, [0, 80], [64, 56]);
  const bgAlpha = useTransform(scrollY, [0, 80], [0.65, 0.88]);
  const borderAlpha = useTransform(scrollY, [0, 80], [0.12, 0.18]);

  const navRef = useRef<HTMLElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const activeIndex = VISITOR_NAV.findIndex((n) => location.pathname.startsWith(n.href));

  // Text-hugging underline (not fixed width)
  useLayoutEffect(() => {
    if (activeIndex >= 0 && navRef.current) {
      const links = navRef.current.querySelectorAll('a');
      const activeLink = links[activeIndex] as HTMLElement;
      if (activeLink) {
        const textSpan = activeLink.querySelector('span');
        if (textSpan) {
          const rect = textSpan.getBoundingClientRect();
          const parentRect = navRef.current.getBoundingClientRect();
          setUnderlineStyle({
            left: rect.left - parentRect.left,
            width: rect.width,
          });
        }
      }
    }
  }, [activeIndex, location.pathname]);

  const shortAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  const isOrganizerRoute = ORGANIZER_NAV.some(n => location.pathname.startsWith(n.href));

  return (
    <motion.header
      style={{
        height,
        backgroundColor: useTransform(bgAlpha, (a) => `rgba(6, 21, 34, ${a})`),
        borderBottomColor: useTransform(borderAlpha, (a) => `rgba(255, 255, 255, ${a})`),
      }}
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-6">
        {/* Brand */}
        <Link 
          to="/" 
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand-2">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span className="font-[Inter_Tight] text-base font-semibold tracking-tight text-ink">DropKit</span>
          <span className="chip text-[10px] font-medium uppercase tracking-wide">Testnet</span>
        </Link>

        {/* Visitor Nav */}
        <nav ref={navRef} className="relative hidden items-center gap-6 md:flex">
          {VISITOR_NAV.map((n, i) => (
            <Link
              key={n.href}
              to={n.href}
              className={`relative rounded-xl px-3 py-2 text-[15px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas ${
                i === activeIndex ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
              style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
            >
              <span>{n.label}</span>
            </Link>
          ))}
          {activeIndex >= 0 && (
            <motion.span
              className="absolute bottom-0 h-[2px] rounded-full bg-brand/80"
              initial={false}
              animate={underlineStyle}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            />
          )}
          
          {/* Organizer dropdown */}
          <div className="relative">
            <button
              onClick={() => setOrganizerOpen(!organizerOpen)}
              onBlur={() => setTimeout(() => setOrganizerOpen(false), 150)}
              className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[15px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas ${
                isOrganizerRoute ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
              style={{ minHeight: '44px' }}
            >
              <span>Organizer</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {organizerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface-2 shadow-xl backdrop-blur-xl"
              >
                <div className="py-1">
                  {ORGANIZER_NAV.map((n) => (
                    <Link
                      key={n.href}
                      to={n.href}
                      className="block px-4 py-2.5 text-[15px] font-medium text-muted transition-colors hover:bg-surface-1 hover:text-ink first:rounded-t-xl last:rounded-b-xl"
                    >
                      {n.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Utility: Get test SUI · Connect Wallet */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://faucet.sui.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-1 hover:text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas md:inline-flex"
            style={{ minHeight: '44px' }}
          >
            Get test SUI
          </a>
          
          {/* Connect Wallet with Google sign-in inside */}
          {!zkSession && !account && (
            <div className="flex items-center gap-2">
              <div className="rounded-xl">
                <ConnectButton />
              </div>
            </div>
          )}
          
          {/* Active sessions */}
          {zkSession && <ZkLoginButton />}
          {!zkSession && account && (
            <button 
              className="group flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-sm font-medium text-ink transition-all hover:bg-surface-1 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas"
              style={{ minHeight: '44px' }}
            >
              <span className="inline-block h-4 w-4 rounded-full bg-gradient-to-br from-brand to-brand-2" />
              <span className="tabular-nums">{shortAddress(account.address)}</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
