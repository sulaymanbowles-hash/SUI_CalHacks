import { Link, useLocation } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useLayoutEffect, useState } from 'react';
import { ZkLoginButton } from './ZkLoginButton';
import { getZkLoginSession, clearZkLoginSession } from '../lib/zklogin';
import { ChevronDown, User, Wallet, DollarSign, LogOut } from 'lucide-react';

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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  
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
  const isLoggedIn = !!(zkSession || account);

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
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand-2">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span className="font-[Inter_Tight] text-base font-semibold tracking-tight text-ink">DropKit</span>
        </Link>

        {/* Visitor Nav */}
        <nav ref={navRef} className="relative hidden items-center gap-6 md:flex">
          {VISITOR_NAV.map((n, i) => (
            <Link
              key={n.href}
              to={n.href}
              className={`relative rounded-xl px-3 py-2 text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
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
              className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                isOrganizerRoute ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
              style={{ minHeight: '44px' }}
            >
              <span>Organizer</span>
              <ChevronDown className="h-4 w-4" />
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

        {/* Account Menu - Consolidated */}
        <div className="flex items-center gap-2.5">
          {!isLoggedIn ? (
            /* Not logged in - single Account button */
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                onBlur={() => setTimeout(() => setAccountMenuOpen(false), 150)}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-ink transition-all hover:bg-surface-1 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                style={{ minHeight: '44px' }}
              >
                <User className="h-4 w-4" />
                <span>Account</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {accountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface-2 shadow-xl backdrop-blur-xl"
                >
                  <div className="p-2">
                    <button
                      onClick={() => window.location.href = '/auth'}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-1"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign in with Google
                    </button>
                    
                    <div className="my-2 border-t border-border" />
                    
                    <div className="px-4 py-2">
                      <div className="mb-2 text-xs text-muted">Or connect wallet</div>
                      <ConnectButton />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* Logged in - show account menu with actions */
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                onBlur={() => setTimeout(() => setAccountMenuOpen(false), 150)}
                className="group flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-sm font-medium text-ink transition-all hover:bg-surface-1 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                style={{ minHeight: '44px' }}
              >
                <span className="inline-block h-4 w-4 rounded-full bg-gradient-to-br from-brand to-brand-2" />
                <span className="tabular-nums">
                  {zkSession ? 'zkLogin' : shortAddress(account?.address)}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {accountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface-2 shadow-xl backdrop-blur-xl"
                >
                  <div className="p-2">
                    {zkSession && (
                      <div className="mb-2 px-4 py-2">
                        <div className="text-xs text-muted">Signed in with Google</div>
                        <div className="mt-1 font-mono text-xs text-ink">{shortAddress(zkSession.address)}</div>
                      </div>
                    )}
                    
                    <Link
                      to="/payouts"
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-1"
                    >
                      <DollarSign className="h-4 w-4" />
                      Payouts
                    </Link>
                    
                    {!zkSession && (
                      <>
                        <div className="my-2 border-t border-border" />
                        <div className="px-4 py-2">
                          <div className="mb-2 text-xs text-muted">Add another account</div>
                          <button
                            onClick={() => window.location.href = '/auth'}
                            className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            </svg>
                            Sign in with Google
                          </button>
                        </div>
                      </>
                    )}
                    
                    <div className="my-2 border-t border-border" />
                    
                    <button
                      onClick={() => {
                        clearZkLoginSession();
                        window.location.reload();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
