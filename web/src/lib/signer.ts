/**
 * Development signer for testnet (browser-safe, ephemeral keys)
 * 
 * WARNING: This is for testnet development only!
 * Production apps should use @mysten/dapp-kit with wallet adapters
 */
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';

const STORAGE_KEY = 'DROP_KIT_DEV_SK';

// Pre-loaded Sui CLI wallet for local development (exported from sui keytool)
// This wallet has testnet funds pre-loaded
const PRELOADED_WALLET_KEY = 'suiprivkey1qqwksvl9nlvzjddrjpsnz5zh0hyllzrxsd2jjwell4uvq6ervqyy72xnery';

/**
 * Get or create ephemeral dev keypair from localStorage
 * For testnet development only - never use in production!
 */
export async function getDevKeypair(): Promise<Ed25519Keypair> {
  // In development, use the pre-loaded Sui CLI wallet with funds
  if (import.meta.env.DEV) {
    try {
      const keypair = Ed25519Keypair.fromSecretKey(PRELOADED_WALLET_KEY);
      const address = keypair.getPublicKey().toSuiAddress();
      console.log('✅ Using pre-loaded Sui CLI wallet:', address);
      return keypair;
    } catch (error) {
      console.error('Failed to load pre-loaded wallet:', error);
      // Fall through to ephemeral wallet
    }
  }
  
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
  // In development, return pre-loaded wallet address
  if (import.meta.env.DEV) {
    try {
      const keypair = Ed25519Keypair.fromSecretKey(PRELOADED_WALLET_KEY);
      return keypair.getPublicKey().toSuiAddress();
    } catch {
      // Fall through to localStorage
    }
  }
  
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
