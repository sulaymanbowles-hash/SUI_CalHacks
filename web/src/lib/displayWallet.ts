/**
 * Display Wallet Management
 * Auto-selects a funded address from available demo wallets
 */

import { getClient } from './rpc';

export interface DemoWallet {
  address: string;
  label: string;
  balance?: number;
}

let cachedDisplayWallet: DemoWallet | null = null;

/**
 * Get demo wallets from environment variables
 */
export function getDemoWallets(): DemoWallet[] {
  const demoWalletsEnv = import.meta.env.VITE_DEMO_WALLETS;
  const sellerAddress = import.meta.env.VITE_SELLER_ADDRESS;
  const buyerAddress = import.meta.env.VITE_BUYER_ADDRESS;

  const wallets: DemoWallet[] = [];

  if (demoWalletsEnv) {
    // Parse comma-separated list of addresses
    const addresses = demoWalletsEnv.split(',').map((a: string) => a.trim());
    addresses.forEach((addr: string, idx: number) => {
      wallets.push({
        address: addr,
        label: `Demo Wallet ${idx + 1}`,
      });
    });
  } else {
    // Fallback to SELLER/BUYER addresses
    if (sellerAddress) {
      wallets.push({ address: sellerAddress, label: 'Seller Wallet' });
    }
    if (buyerAddress && buyerAddress !== sellerAddress) {
      wallets.push({ address: buyerAddress, label: 'Buyer Wallet' });
    }
  }

  return wallets;
}

/**
 * Pick a display wallet with sufficient SUI balance
 * Caches the result for the session
 */
export async function pickDisplayWallet(minSui = 0.1): Promise<DemoWallet | null> {
  if (cachedDisplayWallet) {
    return cachedDisplayWallet;
  }

  const client = getClient();
  const wallets = getDemoWallets();

  if (wallets.length === 0) {
    console.warn('No demo wallets configured');
    return null;
  }

  // Check balances for each wallet
  for (const wallet of wallets) {
    try {
      const balance = await client.getBalance({
        owner: wallet.address,
      });

      const balanceSui = parseInt(balance.totalBalance) / 1_000_000_000;
      wallet.balance = balanceSui;

      if (balanceSui >= minSui) {
        console.log(`✓ Selected display wallet: ${wallet.label} (${balanceSui.toFixed(2)} SUI)`);
        cachedDisplayWallet = wallet;
        localStorage.setItem('DISPLAY_WALLET', JSON.stringify(wallet));
        return wallet;
      }
    } catch (e) {
      console.warn(`Failed to check balance for ${wallet.address}:`, e);
    }
  }

  // If no wallet has sufficient balance, return the first one
  const fallback = wallets[0];
  console.warn(`No wallet with ${minSui} SUI found, using fallback:`, fallback.label);
  cachedDisplayWallet = fallback;
  localStorage.setItem('DISPLAY_WALLET', JSON.stringify(fallback));
  return fallback;
}

/**
 * Get the current display wallet from cache
 */
export function getDisplayWallet(): DemoWallet | null {
  if (cachedDisplayWallet) {
    return cachedDisplayWallet;
  }

  const stored = localStorage.getItem('DISPLAY_WALLET');
  if (stored) {
    try {
      cachedDisplayWallet = JSON.parse(stored);
      return cachedDisplayWallet;
    } catch (e) {
      console.warn('Failed to parse stored display wallet');
    }
  }

  return null;
}

/**
 * Clear the cached display wallet
 */
export function clearDisplayWallet(): void {
  cachedDisplayWallet = null;
  localStorage.removeItem('DISPLAY_WALLET');
}
