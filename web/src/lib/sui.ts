/**
 * Sui client utilities and type helpers
 */
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { NETWORK, PACKAGE_ID } from './env';

/**
 * Get a configured Sui client for testnet
 */
let _client: SuiClient | null = null;

export function getClient(): SuiClient {
  if (!_client) {
    _client = new SuiClient({ url: getFullnodeUrl(NETWORK) });
  }
  return _client;
}

/**
 * Convert SUI to MIST (1 SUI = 1e9 MIST)
 */
export function toMist(sui: number | string): bigint {
  const suiNum = typeof sui === 'string' ? parseFloat(sui) : sui;
  return BigInt(Math.floor(suiNum * 1e9));
}

/**
 * Convert MIST to SUI (display format)
 */
export function fromMist(mist: bigint): string {
  return (Number(mist) / 1e9).toFixed(4);
}

/**
 * Format SUI amount for display with proper decimals
 */
export function formatSui(mist: bigint | string | number, decimals = 4): string {
  const mistBig = typeof mist === 'bigint' ? mist : BigInt(mist);
  return (Number(mistBig) / 1e9).toFixed(decimals);
}

/**
 * Type helper for Ticket object type
 */
export type TicketType = `${typeof PACKAGE_ID}::ticket::Ticket`;

/**
 * Get the full ticket type string
 */
export function getTicketType(): TicketType {
  return `${PACKAGE_ID}::ticket::Ticket` as TicketType;
}

/**
 * Type helper for Event object type
 */
export type EventType = `${typeof PACKAGE_ID}::event::Event`;

/**
 * Get the full event type string
 */
export function getEventType(): EventType {
  return `${PACKAGE_ID}::event::Event` as EventType;
}

/**
 * Type helper for TicketClass object type
 */
export type TicketClassType = `${typeof PACKAGE_ID}::class::TicketClass`;

/**
 * Get the full ticket class type string
 */
export function getTicketClassType(): TicketClassType {
  return `${PACKAGE_ID}::class::TicketClass` as TicketClassType;
}

/**
 * Parse Move abort error and return user-friendly message
 */
export function parseMoveError(error: any): string {
  const errorStr = error?.toString() || '';
  
  // Check for E_ALREADY_USED (abort code 1 in ticket module)
  if (errorStr.includes('MoveAbort') && errorStr.includes('ticket') && errorStr.includes(', 1)')) {
    return 'Ticket already used';
  }
  
  // Check for E_INVALID_WINDOW (abort code 1 in event module)
  if (errorStr.includes('MoveAbort') && errorStr.includes('event') && errorStr.includes(', 1)')) {
    return 'Invalid time window';
  }
  
  // Check for E_ZERO_SUPPLY (abort code 2 in class module)
  if (errorStr.includes('MoveAbort') && errorStr.includes('class') && errorStr.includes(', 2)')) {
    return 'Supply cannot be zero';
  }
  
  // Extract module and code for unknown errors
  const match = errorStr.match(/MoveAbort.*module.*Identifier\("(\w+)"\).*function: (\d+).*}, (\d+)\)/);
  if (match) {
    const [, module, fn, code] = match;
    return `Move error in ${module}::fn${fn} (code ${code})`;
  }
  
  return errorStr;
}
