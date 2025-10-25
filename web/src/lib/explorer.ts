import { NETWORK } from './env';

type Network = 'testnet' | 'mainnet' | 'devnet' | 'localnet';

const EXPLORER_URLS: Record<Network, string> = {
  testnet: 'https://suiscan.xyz/testnet',
  mainnet: 'https://suiscan.xyz/mainnet',
  devnet: 'https://suiscan.xyz/devnet',
  localnet: 'http://localhost:3000',
};

/**
 * Build a SuiScan explorer URL for a transaction digest
 * Always includes ?network=testnet for testnet transactions
 */
export function getExplorerTxUrl(digest: string, network: Network = NETWORK): string {
  const base = EXPLORER_URLS[network];
  return `${base}/tx/${digest}?network=${network}`;
}

/**
 * Build a SuiScan explorer URL for an object
 * Always includes ?network=testnet for testnet objects
 */
export function getExplorerObjectUrl(objectId: string, network: Network = NETWORK): string {
  const base = EXPLORER_URLS[network];
  return `${base}/object/${objectId}?network=${network}`;
}

/**
 * Build a SuiScan explorer URL for an address
 * Always includes ?network=testnet for testnet addresses
 */
export function getExplorerAddressUrl(address: string, network: Network = NETWORK): string {
  const base = EXPLORER_URLS[network];
  return `${base}/account/${address}?network=${network}`;
}

/**
 * Shorten a digest or address for display
 * Example: 0x1234...5678
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Convenient aliases for testnet
export const explorerTx = (digest: string) => getExplorerTxUrl(digest, 'testnet');
export const explorerObj = (objectId: string) => getExplorerObjectUrl(objectId, 'testnet');
export const explorerAddr = (address: string) => getExplorerAddressUrl(address, 'testnet');
