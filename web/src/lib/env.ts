/**
 * Environment configuration for the frontend
 * 
 * Reads from Vite environment variables (VITE_* prefix)
 * These should be set in a .env file or passed at build time
 */

// Network configuration
export const NETWORK = (import.meta.env.VITE_NETWORK || 'testnet') as 'testnet' | 'mainnet';
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://fullnode.testnet.sui.io:443';

// Package and policy IDs (populated after deployment)
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '';
export const POLICY_ID = import.meta.env.VITE_POLICY_ID || '';

// Wallet addresses (for display/reference only)
export const ADDR_SELLER = import.meta.env.VITE_ADDR_SELLER || '';
export const ADDR_BUYER = import.meta.env.VITE_ADDR_BUYER || '';

// Validation helper
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = { PACKAGE_ID, POLICY_ID, ADDR_SELLER, ADDR_BUYER };
  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

export default {
  NETWORK,
  RPC_URL,
  PACKAGE_ID,
  POLICY_ID,
  ADDR_SELLER,
  ADDR_BUYER,
};
