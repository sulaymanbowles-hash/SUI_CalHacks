/**
 * Environment configuration for testnet deployment
 * 
 * Reads from Vite's import.meta.env (set via .env files or build-time)
 * All values are public and safe to bundle
 */

export const NETWORK = 'testnet' as const;

// Package and Policy IDs (deployed on testnet)
export const PACKAGE_ID = 
  import.meta.env.VITE_PACKAGE_ID || 
  '0x15ac55e21409bf56cd3f93552a85c716330b07af4fdbd3b4996085cc59e15769';

export const POLICY_ID = 
  import.meta.env.VITE_POLICY_ID || 
  '0x6c9a891026c1031c138c6f132cf596bae516d834709c03e2dddceeb5aa8b6456';

// Walrus configuration (optional)
export const WALRUS_PUBLISHER_URL = 
  import.meta.env.VITE_WALRUS_PUBLISHER_URL || 
  'https://publisher.walrus-testnet.walrus.space';

export const WALRUS_AGGREGATOR_URL = 
  import.meta.env.VITE_WALRUS_AGGREGATOR_URL || 
  'https://aggregator.walrus-testnet.walrus.space';

/**
 * Feature flags for development and testnet
 */
export const flags = {
  /**
   * Use ephemeral browser-based signer for testnet dev
   * WARNING: Testnet only! Never use in production
   */
  useEphemeralSigner: true,
  
  /**
   * Enable sponsored transactions (gas paid by backend)
   * Reserved for future implementation
   */
  useSponsor: false,
  
  /**
   * Show fiat onramp UI (disabled button with tooltip)
   * Actual onramp requires mainnet + KYC provider
   */
  showFiatOnramp: true,
  
  /**
   * Show Walrus upload functionality
   */
  enableWalrusUpload: true,
} as const;

/**
 * Royalty split configuration (90/8/2)
 */
export const ROYALTY_SPLITS = {
  artist: 0.90,
  organizer: 0.08,
  platform: 0.02,
} as const;

/**
 * Testnet faucet URL for dev wallet funding
 */
export const TESTNET_FAUCET = 'https://faucet.sui.io';

/**
 * Development mode detection
 */
export const isDev = import.meta.env.DEV;

/**
 * Type-safe environment check
 */
export function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
