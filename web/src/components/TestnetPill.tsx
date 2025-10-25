import { Network, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAUCETS = [
  { name: 'Sui Faucet', url: 'https://faucet.sui.io' },
  { name: 'M1 Stake', url: 'https://faucet.m1stake.com' },
  { name: 'Sui Learn', url: 'https://suilearn.org/faucet' },
];

export function TestnetPill() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/50">
      <div className="h-1.5 w-1.5 rounded-full bg-[#5AE0E5]/60"></div>
      Testnet
    </div>
  );
}
