/**
 * Development signer for testnet (browser-safe, ephemeral keys)
 * 
 * WARNING: This is for testnet development only!
 * Production apps should use @mysten/dapp-kit with wallet adapters
 */
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';

const STORAGE_KEY = 'DROP_KIT_DEV_SK';

/**
 * Get or create ephemeral dev keypair from localStorage
 * For testnet development only - never use in production!
 */
export async function getDevKeypair(): Promise<Ed25519Keypair> {
  // Try to load existing keypair from localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    try {
      // Parse stored keypair (Bech32 format)
      const keypair = Ed25519Keypair.fromSecretKey(stored);
      return keypair;
    } catch (error) {
      console.warn('Failed to load stored keypair, generating new one:', error);
    }
  }
  
  // Generate new keypair
  const keypair = Ed25519Keypair.generate();
  
  // Export and store the private key in Bech32 format
  const exported = keypair.export();
  localStorage.setItem(STORAGE_KEY, exported.privateKey);
  
  console.log('Generated new dev keypair:', keypair.getPublicKey().toSuiAddress());
  
  return keypair;
}

/**
 * Get the signer for transactions
 * Currently returns dev keypair, future: integrate with wallet adapters
 */
export async function getSigner(client: SuiClient): Promise<Ed25519Keypair> {
  return getDevKeypair();
}

/**
 * Get current dev wallet address
 */
export function currentAddress(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return '';
  }
  
  try {
    const keypair = Ed25519Keypair.fromSecretKey(stored);
    return keypair.getPublicKey().toSuiAddress();
  } catch {
    return '';
  }
}

/**
 * Reset dev wallet (clears localStorage and generates new keypair)
 * Useful for testing with a fresh wallet
 */
export function resetDevWallet(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('Dev wallet reset. Refresh to generate new keypair.');
}

/**
 * Check if dev wallet exists
 */
export function hasDevWallet(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}
