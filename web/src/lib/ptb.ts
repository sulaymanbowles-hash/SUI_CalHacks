/**
 * PTB wrappers for Mint & List, Buy & Approve, and Check-in
 * 
 * These are stubs for UI1. In UI2, we'll import logic from existing
 * PTB scripts (scripts/ptb_mint_and_list.ts, etc.)
 */

export interface MintAndListParams {
  eventName: string;
  startsAt: number;
  endsAt: number;
  posterCid: string;
  facePriceMist: string;
  supply: string;
}

export interface MintAndListResult {
  digest: string;
  eventId?: string;
  classId?: string;
  ticketId?: string;
  objectChanges?: any[];
}

export interface BuyAndApproveParams {
  ticketId: string;
  listingId?: string;
}

export interface BuyAndApproveResult {
  digest: string;
  objectChanges?: any[];
}

export interface CheckInParams {
  ticketId: string;
}

export interface CheckInResult {
  digest: string;
}

/**
 * PTB #1: Mint & List
 * 
 * Creates an event, ticket class, and mints a ticket in a single atomic transaction.
 * 
 * @stub - Returns mock data for UI1. Will be implemented in UI2.
 */
export async function mintAndList(params: MintAndListParams): Promise<MintAndListResult> {
  console.log('🎫 [PTB] Mint & List (STUB)', params);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Mock successful response
  return {
    digest: '0xMOCK_DIGEST_' + Date.now().toString(36),
    eventId: '0xMOCK_EVENT_' + Date.now().toString(36),
    classId: '0xMOCK_CLASS_' + Date.now().toString(36),
    ticketId: '0xMOCK_TICKET_' + Date.now().toString(36),
    objectChanges: [],
  };
}

/**
 * PTB #2: Buy & Approve
 * 
 * Purchases a ticket and approves the transfer policy in a single transaction.
 * 
 * @stub - Returns mock data for UI1. Will be implemented in UI2.
 */
export async function buyAndApprove(params: BuyAndApproveParams): Promise<BuyAndApproveResult> {
  console.log('🛒 [PTB] Buy & Approve (STUB)', params);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Mock successful response
  return {
    digest: '0xMOCK_BUY_DIGEST_' + Date.now().toString(36),
    objectChanges: [],
  };
}

/**
 * PTB #3: Check-in
 * 
 * Marks a ticket as used (check-in at venue).
 * 
 * @stub - Returns mock data for UI1. Will be implemented in UI2.
 */
export async function checkIn(params: CheckInParams): Promise<CheckInResult> {
  console.log('✅ [PTB] Check-in (STUB)', params);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Mock successful response
  return {
    digest: '0xMOCK_CHECKIN_DIGEST_' + Date.now().toString(36),
  };
}
