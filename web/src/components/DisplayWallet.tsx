import { useEffect, useState } from 'react';
import { pickDisplayWallet, getDisplayWallet, type DemoWallet } from '../lib/displayWallet';
import { shortenAddress } from '../lib/explorer';

export function DisplayWallet() {
  const [wallet, setWallet] = useState<DemoWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallet = async () => {
      const cached = getDisplayWallet();
      if (cached) {
        setWallet(cached);
        setLoading(false);
        return;
      }

      try {
        const selected = await pickDisplayWallet(0.1);
        setWallet(selected);
      } catch (e) {
        console.warn('Failed to load display wallet:', e);
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-sm text-white/60">Loading wallet...</span>
      </div>
    );
  }

  if (!wallet) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
      <div className="w-2 h-2 rounded-full bg-green-400" />
      <div className="flex flex-col">
        <span className="text-xs text-white/60">{wallet.label}</span>
        <span className="text-sm text-white font-mono">
          {shortenAddress(wallet.address)}
        </span>
      </div>
      {wallet.balance !== undefined && (
        <span className="text-xs text-white/60 ml-2">
          {wallet.balance.toFixed(2)} SUI
        </span>
      )}
    </div>
  );
}
