/**
 * Programmable Transaction Blocks (PTBs) for browser execution
 * Pure browser - no Node-only APIs
 */
import { Transaction } from '@mysten/sui/transactions';
import { getClient, toMist, getTicketType } from './sui';
import { getSigner } from './signer';
import { PACKAGE_ID, POLICY_ID } from './env';

export interface MintAndListParams {
  eventName: string;
  priceSui: number;
  supply: number;
  posterCid?: string;
}

export interface MintAndListResult {
  digest: string;
  ticketId: string;
  kioskId: string;
  listingId: string;
  eventId: string;
  classId: string;
  effects: any;
}

/**
 * PTB: Mint & List
 * Creates event, ticket class, mints ticket, creates/uses kiosk, and lists ticket
 */
export async function mintAndList(params: MintAndListParams): Promise<MintAndListResult> {
  const client = getClient();
  const signer = await getSigner(client);
  const address = signer.getPublicKey().toSuiAddress();
  
  console.log('Mint & List starting...', params);
  
  // Step 1: Create event
  const tx1 = new Transaction();
  const now = Math.floor(Date.now() / 1000);
  tx1.moveCall({
    target: `${PACKAGE_ID}::event::new`,
    arguments: [
      tx1.pure.string(params.eventName),
      tx1.pure.u64(now + 86400), // starts tomorrow
      tx1.pure.u64(now + 90000), // ends tomorrow + 1hr
      tx1.pure.string(params.posterCid || 'walrus://placeholder'),
    ],
  });
  tx1.setGasBudget(5_000_000);
  
  const result1 = await client.signAndExecuteTransaction({
    signer,
    transaction: tx1,
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result1.effects?.status?.status !== 'success') {
    throw new Error(`Event creation failed: ${result1.effects?.status?.error}`);
  }
  
  const eventId = result1.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::event::Event')
  )?.objectId;
  
  if (!eventId) throw new Error('Event ID not found');
  console.log('✓ Event created:', eventId);
  
  // Wait for finalization
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Create ticket class
  const tx2 = new Transaction();
  tx2.moveCall({
    target: `${PACKAGE_ID}::class::new`,
    arguments: [
      tx2.object(eventId),
      tx2.pure.u64(toMist(params.priceSui)),
      tx2.pure.u64(params.supply),
    ],
  });
  tx2.setGasBudget(5_000_000);
  
  const result2 = await client.signAndExecuteTransaction({
    signer,
    transaction: tx2,
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result2.effects?.status?.status !== 'success') {
    throw new Error(`Class creation failed: ${result2.effects?.status?.error}`);
  }
  
  const classId = result2.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::class::TicketClass')
  )?.objectId;
  
  if (!classId) throw new Error('Class ID not found');
  console.log('✓ Class created:', classId);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 3: Mint ticket
  const tx3 = new Transaction();
  tx3.moveCall({
    target: `${PACKAGE_ID}::ticket::mint`,
    arguments: [tx3.object(classId)],
  });
  tx3.setGasBudget(5_000_000);
  
  const result3 = await client.signAndExecuteTransaction({
    signer,
    transaction: tx3,
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result3.effects?.status?.status !== 'success') {
    throw new Error(`Ticket minting failed: ${result3.effects?.status?.error}`);
  }
  
  const ticketId = result3.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::ticket::Ticket')
  )?.objectId;
  
  if (!ticketId) throw new Error('Ticket ID not found');
  console.log('✓ Ticket minted:', ticketId);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 4: Check for existing Kiosk or create new one
  let kioskId: string;
  let kioskCapId: string;
  
  const ownedObjects = await client.getOwnedObjects({
    owner: address,
    filter: { StructType: '0x2::kiosk::Kiosk' },
    options: { showContent: true },
  });
  
  if (ownedObjects.data.length > 0 && ownedObjects.data[0].data) {
    kioskId = ownedObjects.data[0].data.objectId;
    console.log('✓ Using existing Kiosk:', kioskId);
    
    const capObjects = await client.getOwnedObjects({
      owner: address,
      filter: { StructType: '0x2::kiosk::KioskOwnerCap' },
      options: { showContent: true },
    });
    kioskCapId = capObjects.data[0]?.data?.objectId!;
  } else {
    // Create new Kiosk
    const tx4 = new Transaction();
    tx4.moveCall({
      target: '0x2::kiosk::default',
      arguments: [],
    });
    tx4.setGasBudget(10_000_000);
    
    const result4 = await client.signAndExecuteTransaction({
      signer,
      transaction: tx4,
      options: { showEffects: true, showObjectChanges: true },
    });
    
    if (result4.effects?.status?.status !== 'success') {
      throw new Error(`Kiosk creation failed: ${result4.effects?.status?.error}`);
    }
    
    const kioskObj = result4.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::kiosk::Kiosk') && (c.owner as any)?.Shared
    );
    const capObj = result4.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::kiosk::KioskOwnerCap')
    );
    
    kioskId = kioskObj?.objectId!;
    kioskCapId = capObj?.objectId!;
    console.log('✓ Kiosk created:', kioskId);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Step 5: Place ticket in Kiosk and list it
  const tx5 = new Transaction();
  
  tx5.moveCall({
    target: '0x2::kiosk::place',
    typeArguments: [getTicketType()],
    arguments: [
      tx5.object(kioskId),
      tx5.object(kioskCapId),
      tx5.object(ticketId),
    ],
  });
  
  tx5.moveCall({
    target: '0x2::kiosk::list',
    typeArguments: [getTicketType()],
    arguments: [
      tx5.object(kioskId),
      tx5.object(kioskCapId),
      tx5.pure.id(ticketId),
      tx5.pure.u64(toMist(params.priceSui)),
    ],
  });
  
  tx5.setGasBudget(10_000_000);
  
  const result5 = await client.signAndExecuteTransaction({
    signer,
    transaction: tx5,
    options: { showEffects: true, showObjectChanges: true, showEvents: true },
  });
  
  if (result5.effects?.status?.status !== 'success') {
    throw new Error(`Kiosk listing failed: ${result5.effects?.status?.error}`);
  }
  
  console.log('✓ Ticket listed in Kiosk');
  
  return {
    digest: result5.digest,
    ticketId,
    kioskId,
    listingId: ticketId, // For Kiosk, listing ID is the item ID
    eventId,
    classId,
    effects: result5.effects,
  };
}

export interface BuyAndApproveParams {
  kioskId: string;
  ticketId: string;
  priceSui: number;
}

export interface BuyAndApproveResult {
  digest: string;
  newOwner: string;
  ticketId: string;
  effects: any;
}

/**
 * PTB: Buy & Approve
 * Single atomic transaction: purchase from Kiosk + approve with transfer policy
 */
export async function buyAndApprove(params: BuyAndApproveParams): Promise<BuyAndApproveResult> {
  const client = getClient();
  const signer = await getSigner(client);
  const buyerAddress = signer.getPublicKey().toSuiAddress();
  
  console.log('Buy & Approve starting...', params);
  
  const tx = new Transaction();
  
  // Split coin for exact payment
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(toMist(params.priceSui))]);
  
  // Purchase from kiosk - returns (Item, TransferRequest)
  const [ticket, transferRequest] = tx.moveCall({
    target: '0x2::kiosk::purchase',
    typeArguments: [getTicketType()],
    arguments: [
      tx.object(params.kioskId),
      tx.pure.id(params.ticketId),
      paymentCoin,
    ],
  });
  
  // Confirm the transfer request (enforces royalties and policy rules)
  tx.moveCall({
    target: '0x2::transfer_policy::confirm_request',
    typeArguments: [getTicketType()],
    arguments: [
      tx.object(POLICY_ID),
      transferRequest,
    ],
  });
  
  // Transfer the ticket to buyer
  tx.transferObjects([ticket], tx.pure.address(buyerAddress));
  
  tx.setGasBudget(20_000_000);
  
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showBalanceChanges: true,
    },
  });
  
  if (result.effects?.status?.status !== 'success') {
    throw new Error(`Purchase failed: ${result.effects?.status?.error}`);
  }
  
  console.log('✓ Purchase & approval successful');
  
  return {
    digest: result.digest,
    newOwner: buyerAddress,
    ticketId: params.ticketId,
    effects: result.effects,
  };
}

export interface MarkUsedResult {
  digest: string;
  effects: any;
}

/**
 * PTB: Mark ticket as used (check-in)
 */
export async function markUsed(ticketId: string): Promise<MarkUsedResult> {
  const client = getClient();
  const signer = await getSigner(client);
  
  console.log('Marking ticket as used:', ticketId);
  
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::ticket::mark_used`,
    arguments: [tx.object(ticketId)],
  });
  
  tx.setGasBudget(5_000_000);
  
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result.effects?.status?.status !== 'success') {
    throw new Error(`Mark used failed: ${result.effects?.status?.error}`);
  }
  
  console.log('✓ Ticket marked as used');
  
  return {
    digest: result.digest,
    effects: result.effects,
  };
}
