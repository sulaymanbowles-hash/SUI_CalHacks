/**
 * Fixed local development wallet loader
 * Only works in development mode - won't be included in production builds
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';

const DEV_LOCAL_WALLET = {
  address: '0xe22b81de77e8565e86cc81452dc4f34a4c0f6a4cfb8111e7c087248b97247a17',
  // This is loaded from .secrets/DEV_LOCAL.json - DO NOT COMMIT PRIVATE KEYS
  secretKeyB64: 'PLACEHOLDER_WILL_BE_LOADED_FROM_FILE'
};

let cachedKeypair: Ed25519Keypair | null = null;

/**
 * Load the fixed local development wallet
 * In development, this returns a keypair for testing
 * In production, this returns null (use real wallet connect)
 */
export async function loadDevLocalWallet(): Promise<Ed25519Keypair | null> {
  // Only work in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  if (cachedKeypair) {
    return cachedKeypair;
  }

  try {
    // Try to fetch the wallet from the local API endpoint
    const response = await fetch('/api/dev-wallet');
    if (!response.ok) {
      console.warn('Dev wallet not available, using fallback or real wallet');
      return null;
    }

    const walletData = await response.json();
    const secretKeyBytes = fromB64(walletData.secretKeyB64);
    cachedKeypair = Ed25519Keypair.fromSecretKey(secretKeyBytes.slice(0, 32));
    
    console.log('✅ Loaded fixed dev wallet:', walletData.address);
    return cachedKeypair;
  } catch (error) {
    console.warn('Failed to load dev wallet:', error);
    return null;
  }
}

/**
 * Get the dev wallet address without loading the keypair
 */
export function getDevLocalAddress(): string {
  return DEV_LOCAL_WALLET.address;
}

/**
 * Check if dev wallet is available
 */
export function isDevWalletAvailable(): boolean {
  return !import.meta.env.PROD;
}
