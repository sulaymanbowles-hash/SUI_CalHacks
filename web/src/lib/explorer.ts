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
 */
export function getExplorerTxUrl(digest: string, network: Network = NETWORK): string {
  const base = EXPLORER_URLS[network];
  return `${base}/tx/${digest}`;
}

/**
 * Build a SuiScan explorer URL for an object
 */
export function getExplorerObjectUrl(objectId: string, network: Network = NETWORK): string {
  const base = EXPLORER_URLS[network];
  return `${base}/object/${objectId}`;
}

/**
 * Build a SuiScan explorer URL for an address
 */
export function getExplorerAddressUrl(address: string, network: Network = NETWORK): string {
  const base = EXPLORER_URLS[network];
  return `${base}/account/${address}`;
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
