/**
 * Dev Wallet Badge - shows current testnet wallet address with faucet link
 */
import { useEffect, useState } from 'react';
import { currentAddress, resetDevWallet, hasDevWallet } from '../lib/signer';
import { shortenAddress } from '../lib/explorer';
import { TESTNET_FAUCET } from '../lib/env';
import { getClient } from '../lib/sui';

export function DevWalletBadge() {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletInfo();
  }, []);

  async function loadWalletInfo() {
    const addr = currentAddress();
    setAddress(addr);
    
    if (addr) {
      try {
        const client = getClient();
        const balanceRes = await client.getBalance({ owner: addr });
        const balanceSui = (Number(balanceRes.totalBalance) / 1e9).toFixed(4);
        setBalance(balanceSui);
      } catch (error) {
        console.error('Failed to load balance:', error);
      }
    }
    
    setLoading(false);
  }

  function handleReset() {
    if (confirm('Reset dev wallet? This will generate a new address.')) {
      resetDevWallet();
      window.location.reload();
    }
  }

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
        Loading wallet...
      </div>
    );
  }

  if (!hasDevWallet()) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
        No dev wallet - refresh to create
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs opacity-75">DEV WALLET</span>
          <span className="bg-blue-800 px-2 py-0.5 rounded text-xs">TESTNET</span>
        </div>
        <div className="font-mono mt-1">
          {shortenAddress(address, 6)} · {balance} SUI
        </div>
      </div>
      
      <div className="flex gap-2">
        <a
          href={`${TESTNET_FAUCET}?address=${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          Faucet
        </a>
        <button
          onClick={handleReset}
          className="bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
