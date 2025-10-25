import { Link, useLocation } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMemo } from 'react';

const NAV = [
  { href: '/app', label: 'Buy' },
  { href: '/tickets', label: 'My Tickets' },
  { href: '/console', label: 'Demo Console' },
];

export function Header() {
  const location = useLocation();
  const account = useCurrentAccount();
  const { scrollY } = useScroll();
  
  // Shrink on scroll
  const height = useTransform(scrollY, [0, 80], [64, 56]);
  const bgAlpha = useTransform(scrollY, [0, 80], [0.55, 0.75]);
  const borderAlpha = useTransform(scrollY, [0, 80], [0.10, 0.16]);

  // Find active nav index
  const activeIndex = useMemo(
    () => NAV.findIndex((n) => location.pathname.startsWith(n.href)),
    [location.pathname]
  );

  const shortAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  return (
    <motion.header
      style={{
        height,
        backgroundColor: useTransform(bgAlpha, (a) => `rgba(7, 21, 33, ${a})`),
        borderBottom: useTransform(borderAlpha, (a) => `1px solid rgba(255, 255, 255, ${a})`),
      }}
      className="sticky top-0 z-50 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-6">
        {/* Brand + Testnet Badge */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-[#4DA2FF] to-[#5AE0E5]">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span className="font-medium text-white/95">DropKit</span>
          <span className="rounded-full border border-white/15 bg-white/[0.02] px-2 py-0.5 text-[11px] text-white/70">
            Testnet
          </span>
        </Link>

        {/* Center Nav with Animated Underline */}
        <nav className="relative hidden items-center gap-6 md:flex">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              to={n.href}
              className={`px-1 py-2 text-sm font-medium transition-colors ${
                i === activeIndex ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
              style={{ minWidth: '72px', textAlign: 'center' }}
            >
              {n.label}
            </Link>
          ))}
          {activeIndex >= 0 && (
            <motion.span
              layoutId="activeNav"
              className="absolute bottom-0 h-[2px] rounded-full bg-[#4DA2FF]"
              initial={false}
              style={{
                left: activeIndex * 90 + 24,
                width: 48,
              }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </nav>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
          {/* Faucet link on testnet */}
          <a
            href="https://faucet.sui.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-white/60 transition-colors hover:text-white/90 md:block"
          >
            Get test SUI
          </a>
          
          {!account ? (
            <ConnectButton />
          ) : (
            <button className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm text-white/90 transition-colors hover:bg-white/[0.06]">
              <span className="inline-block h-5 w-5 rounded-full bg-gradient-to-br from-[#4DA2FF] to-[#5AE0E5]" />
              {shortAddress(account.address)}
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
