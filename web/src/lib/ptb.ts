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
 * Organizer wizard publish flow types
 */
export interface TicketTypeConfig {
  name: string;
  color: string;
  supply: number;
  price: number;
  artistBps: number;      // Basis points (9000 = 90%)
  organizerBps: number;   // Basis points (800 = 8%)
}

export interface PublishEventParams {
  eventName: string;
  location: string;
  startsAt: number;       // Unix timestamp (seconds)
  endsAt: number;         // Unix timestamp (seconds)
  posterCid: string;
  ticketTypes: TicketTypeConfig[];
  artistAddress: string;
  organizerAddress: string;
  onProgress?: (step: string, message: string) => void;
}

export interface PublishEventResult {
  digest: string;
  eventId: string;
  gateKeeperCapId: string;
  ticketClasses: {
    classId: string;
    kioskId: string;
    name: string;
    supply: number;
  }[];
  effects: any;
}

/**
 * Payouts & Channels (on-chain gating)
 */
export interface PayoutRecipient {
  address: string;
  bps: number; // Basis points (10000 = 100%)
}

export interface SetupPayoutsParams {
  eventId: string;
  eventCapId: string;
  recipients: PayoutRecipient[];
}

export interface SetupPayoutsResult {
  digest: string;
  payoutsId: string;
  effects: any;
}

export interface CreateChannelParams {
  eventId: string;
  eventCapId: string;
  kind: number; // 0 = primary, 1 = presale, etc.
  priceMist: number;
  startTs: number; // Unix timestamp (seconds)
  endTs: number;
  perWalletLimit: number;
  cap: number; // Total supply for this channel
}

export interface CreateChannelResult {
  digest: string;
  channelId: string;
  effects: any;
}

export interface PublishGatedParams {
  eventId: string;
  eventCapId: string;
}

export interface PublishGatedResult {
  digest: string;
  effects: any;
}

/**
 * PTB: Publish Event (Organizer Wizard)
 * Creates event and ticket classes in separate transactions
 * Note: event::new and class::new are entry functions and cannot be composed in a single PTB
 */
export async function publishEvent(params: PublishEventParams): Promise<PublishEventResult> {
  const client = getClient();
  const signer = await getSigner(client);
  const address = signer.getPublicKey().toSuiAddress();
  
  params.onProgress?.('init', 'Preparing transaction...');
  
  // Calculate total supply from all ticket types
  const totalSupply = params.ticketTypes.reduce((sum, ticket) => sum + ticket.supply, 0);
  
  // Step 1: Create Event in first transaction
  params.onProgress?.('event', 'Creating event...');
  
  const tx1 = new Transaction();
  tx1.moveCall({
    target: `${PACKAGE_ID}::event::new`,
    arguments: [
      tx1.pure.string(params.eventName),
      tx1.pure.string(params.location),
      tx1.pure.u64(params.startsAt),
      tx1.pure.u64(params.endsAt),
      tx1.pure.string(params.posterCid || 'walrus://placeholder'),
      tx1.pure.u64(totalSupply),
    ],
  });
  tx1.setGasBudget(10_000_000);
  
  const result1 = await client.signAndExecuteTransaction({
    signer,
    transaction: tx1,
    options: { 
      showEffects: true, 
      showObjectChanges: true,
    },
  });
  
  if (result1.effects?.status?.status !== 'success') {
    throw new Error(`Event creation failed: ${result1.effects?.status?.error}`);
  }
  
  // Extract created object IDs
  const eventId = result1.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::event::Event')
  )?.objectId as string | undefined;
  
  const gateKeeperCapId = result1.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::event::GateKeeperCap')
  )?.objectId as string | undefined;
  
  const eventCapId = result1.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::event::EventCap')
  )?.objectId as string | undefined;
  
  if (!eventId || !gateKeeperCapId) {
    throw new Error('Failed to extract event or capability ID from transaction');
  }
  
  console.log('✓ Event created:', { eventId, gateKeeperCapId, eventCapId });
  
  // Wait for finalization
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Check for existing Kiosk or create new one
  params.onProgress?.('kiosk', 'Setting up sales channel...');
  
  let kioskId: string | undefined;
  
  const ownedObjects = await client.getOwnedObjects({
    owner: address,
    filter: { StructType: '0x2::kiosk::Kiosk' },
    options: { showContent: true },
  });
  
  if (ownedObjects.data.length > 0 && ownedObjects.data[0].data) {
    kioskId = ownedObjects.data[0].data.objectId;
    console.log('✓ Using existing Kiosk:', kioskId);
  } else {
    // Create new Kiosk
    const tx2 = new Transaction();
    tx2.moveCall({
      target: '0x2::kiosk::default',
      arguments: [],
    });
    tx2.setGasBudget(10_000_000);
    
    const result2 = await client.signAndExecuteTransaction({
      signer,
      transaction: tx2,
      options: { showEffects: true, showObjectChanges: true },
    });
    
    if (result2.effects?.status?.status !== 'success') {
      throw new Error(`Kiosk creation failed: ${result2.effects?.status?.error}`);
    }
    
    kioskId = result2.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::kiosk::Kiosk')
    )?.objectId as string;
    
    console.log('✓ Kiosk created:', kioskId);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Step 3: Create TicketClass for each ticket type (separate transactions)
  params.onProgress?.('classes', `Creating ${params.ticketTypes.length} ticket types...`);
  
  const classResults: { classId: string; name: string; supply: number }[] = [];
  
  for (const ticketType of params.ticketTypes) {
    const tx3 = new Transaction();
    tx3.moveCall({
      target: `${PACKAGE_ID}::class::new`,
      arguments: [
        tx3.object(eventId),
        tx3.pure.string(ticketType.name),
        tx3.pure.string(ticketType.color),
        tx3.pure.u64(toMist(ticketType.price)),
        tx3.pure.u64(ticketType.supply),
        tx3.pure.address(params.artistAddress),
        tx3.pure.address(params.organizerAddress),
        tx3.pure.u16(ticketType.artistBps),
        tx3.pure.u16(ticketType.organizerBps),
      ],
    });
    tx3.setGasBudget(5_000_000);
    
    const result3 = await client.signAndExecuteTransaction({
      signer,
      transaction: tx3,
      options: { showEffects: true, showObjectChanges: true },
    });
    
    if (result3.effects?.status?.status !== 'success') {
      throw new Error(`Class creation failed: ${result3.effects?.status?.error}`);
    }
    
    const classId = result3.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::class::TicketClass')
    )?.objectId as string;
    
    if (!classId) {
      throw new Error('Failed to extract class ID from transaction');
    }
    
    classResults.push({
      classId,
      name: ticketType.name,
      supply: ticketType.supply,
    });
    
    console.log(`✓ TicketClass created: ${ticketType.name} (${classId})`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  params.onProgress?.('success', 'Event published successfully!');
  
  return {
    digest: result1.digest,
    eventId,
    gateKeeperCapId,
    ticketClasses: classResults.map(r => ({
      classId: r.classId,
      kioskId: kioskId!,
      name: r.name,
      supply: r.supply,
    })),
    effects: result1.effects,
  };
}

/**
 * Create Event (Atomic Web Flow)
 * Single PTB that creates event, class, mints ticket, uses/creates kiosk, and lists
 */
export interface CreateEventAtomicParams {
  name: string;
  startsAt: number;      // Unix timestamp (seconds)
  endsAt: number;        // Unix timestamp (seconds)
  priceSui: number;
  supply: number;
  posterCid?: string;
}

export interface CreateEventAtomicResult {
  digest: string;
  eventId: string;
  classId: string;
  ticketId: string;
  kioskId: string;
  listingId: string;
  policyId: string;
  effects: any;
}

/**
 * PTB: Create Event (Separate Transactions)
 * Creates event + class + ticket + kiosk + listing in separate transactions
 * Note: event::new and class::new are entry functions and cannot be composed in PTBs
 */
export async function createEventAtomicWeb(params: CreateEventAtomicParams): Promise<CreateEventAtomicResult> {
  const client = getClient();
  const signer = await getSigner(client);
  const address = signer.getPublicKey().toSuiAddress();
  
  console.log('Creating event with separate transactions...', params);
  
  // Step 1: Create Event
  console.log('Step 1: Creating event...');
  const tx1 = new Transaction();
  tx1.moveCall({
    target: `${PACKAGE_ID}::event::new`,
    arguments: [
      tx1.pure.string(params.name),
      tx1.pure.string('Venue TBD'),
      tx1.pure.u64(params.startsAt),
      tx1.pure.u64(params.endsAt),
      tx1.pure.string(params.posterCid || 'walrus://placeholder'),
      tx1.pure.u64(params.supply),
    ],
  });
  tx1.setGasBudget(10_000_000);
  
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
  )?.objectId as string;
  
  if (!eventId) throw new Error('Event ID not found');
  console.log('✓ Event created:', eventId);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Create TicketClass
  console.log('Step 2: Creating ticket class...');
  const tx2 = new Transaction();
  tx2.moveCall({
    target: `${PACKAGE_ID}::class::new`,
    arguments: [
      tx2.object(eventId),
      tx2.pure.string('General Admission'),
      tx2.pure.string('#4DA2FF'),
      tx2.pure.u64(toMist(params.priceSui)),
      tx2.pure.u64(params.supply),
      tx2.pure.address(address),
      tx2.pure.address(address),
      tx2.pure.u16(9000),
      tx2.pure.u16(800),
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
  )?.objectId as string;
  
  if (!classId) throw new Error('Class ID not found');
  console.log('✓ Class created:', classId);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 3: Mint ticket
  console.log('Step 3: Minting ticket...');
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
  )?.objectId as string;
  
  if (!ticketId) throw new Error('Ticket ID not found');
  console.log('✓ Ticket minted:', ticketId);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 4: Check for existing Kiosk or create new one
  console.log('Step 4: Setting up kiosk...');
  let kioskId: string;
  let kioskCapId: string;
  
  const ownedObjects = await client.getOwnedObjects({
    owner: address,
    filter: { StructType: '0x2::kiosk::Kiosk' },
    options: { showContent: true },
  });
  
  if (ownedObjects.data.length > 0 && ownedObjects.data[0].data) {
    kioskId = ownedObjects.data[0].data.objectId;
    
    const capObjects = await client.getOwnedObjects({
      owner: address,
      filter: { StructType: '0x2::kiosk::KioskOwnerCap' },
      options: { showContent: true },
    });
    kioskCapId = capObjects.data[0]?.data?.objectId!;
    console.log('✓ Using existing Kiosk:', kioskId);
  } else {
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
      c.type === 'created' && c.objectType?.includes('::kiosk::Kiosk')
    );
    const capObj = result4.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::kiosk::KioskOwnerCap')
    );
    
    kioskId = kioskObj?.objectId as string;
    kioskCapId = capObj?.objectId as string;
    console.log('✓ Kiosk created:', kioskId);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Step 5: Place ticket in Kiosk and list it
  console.log('Step 5: Listing ticket in kiosk...');
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
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result5.effects?.status?.status !== 'success') {
    throw new Error(`Kiosk listing failed: ${result5.effects?.status?.error}`);
  }
  
  console.log('✓ Ticket listed in Kiosk');
  
  return {
    digest: result1.digest,
    eventId,
    classId,
    ticketId,
    kioskId,
    listingId: ticketId,
    policyId: POLICY_ID,
    effects: result1.effects,
  };
}

/**
 * PTB: Mint & List (Original - for backwards compatibility)
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
      tx1.pure.string('Venue TBD'),
      tx1.pure.u64(now + 86400), // starts tomorrow
      tx1.pure.u64(now + 90000), // ends tomorrow + 1hr
      tx1.pure.string(params.posterCid || 'walrus://placeholder'),
      tx1.pure.u64(params.supply), // ADD: supply_total parameter
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
      tx2.pure.string('General Admission'),
      tx2.pure.string('#4DA2FF'),
      tx2.pure.u64(toMist(params.priceSui)),
      tx2.pure.u64(params.supply),
      tx2.pure.address(address), // artist
      tx2.pure.address(address), // organizer
      tx2.pure.u16(9000), // 90% artist
      tx2.pure.u16(800),  // 8% organizer
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

export interface CheckInParams {
  gateKeeperCapId: string;
  ticketId: string;
}

export interface CheckInResult {
  digest: string;
  effects: any;
}

/**
 * PTB: Check-in (with GateKeeperCap)
 * Mark ticket as used for entry
 */
export async function checkIn(params: CheckInParams): Promise<CheckInResult> {
  const client = getClient();
  const signer = await getSigner(client);
  
  console.log('Check-in starting:', params.ticketId);
  
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::ticket::check_in`,
    arguments: [
      tx.object(params.gateKeeperCapId),
      tx.object(params.ticketId),
    ],
  });
  
  tx.setGasBudget(5_000_000);
  
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result.effects?.status?.status !== 'success') {
    throw new Error(`Check-in failed: ${result.effects?.status?.error}`);
  }
  
  console.log('✓ Ticket checked in');
  
  return {
    digest: result.digest,
    effects: result.effects,
  };
}

export interface MarkUsedResult {
  digest: string;
  effects: any;
}

/**
 * PTB: Mark ticket as used (check-in) - DEPRECATED
 * Use checkIn() with GateKeeperCap instead
 */
export async function markUsed(ticketId: string): Promise<MarkUsedResult> {
  console.warn('markUsed() is deprecated. Use checkIn() with GateKeeperCap instead.');
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

/**
 * PTB: Setup Payouts
 * Create payouts configuration and register it with the event
 * Validates: 1-4 recipients, sum(bps) <= 10000, no duplicates
 */
export async function setupPayouts(params: SetupPayoutsParams): Promise<SetupPayoutsResult> {
  const client = getClient();
  const signer = await getSigner(client);
  
  console.log('Setting up payouts:', params);
  
  // Validate client-side before sending to chain
  if (params.recipients.length < 1 || params.recipients.length > 4) {
    throw new Error('Must have 1-4 payout recipients');
  }
  
  const totalBps = params.recipients.reduce((sum, r) => sum + r.bps, 0);
  if (totalBps > 10000) {
    throw new Error(`Total royalties (${totalBps / 100}%) exceed 100%`);
  }
  
  const tx = new Transaction();
  
  // Extract addresses and BPS into separate vectors for Move
  const addresses = params.recipients.map(r => tx.pure.address(r.address));
  const bpsValues = params.recipients.map(r => tx.pure.u16(r.bps));
  
  // Create payouts object
  const [payoutsObj] = tx.moveCall({
    target: `${PACKAGE_ID}::payouts::create_and_share`,
    arguments: [
      tx.pure.id(params.eventId),
      tx.makeMoveVec({ elements: addresses }),
      tx.makeMoveVec({ elements: bpsValues }),
    ],
  });
  
  // Register payouts with event
  tx.moveCall({
    target: `${PACKAGE_ID}::event::register_payouts`,
    arguments: [
      tx.object(params.eventId),
      tx.object(params.eventCapId),
      payoutsObj,
    ],
  });
  
  tx.setGasBudget(10_000_000);
  
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result.effects?.status?.status !== 'success') {
    throw new Error(`Payouts setup failed: ${result.effects?.status?.error}`);
  }
  
  const payoutsId = result.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::payouts::Payouts')
  )?.objectId;
  
  if (!payoutsId) {
    throw new Error('Failed to extract payouts ID');
  }
  
  console.log('✓ Payouts configured:', payoutsId);
  
  return {
    digest: result.digest,
    payoutsId,
    effects: result.effects,
  };
}

/**
 * PTB: Create Sales Channel
 * Create a sales channel and register it with the event
 */
export async function createChannel(params: CreateChannelParams): Promise<CreateChannelResult> {
  const client = getClient();
  const signer = await getSigner(client);
  
  console.log('Creating channel:', params);
  
  const tx = new Transaction();
  
  // Create and activate channel
  tx.moveCall({
    target: `${PACKAGE_ID}::channel::create_and_activate`,
    arguments: [
      tx.pure.id(params.eventId),
      tx.pure.u8(params.kind),
      tx.pure.u64(params.priceMist),
      tx.pure.u64(params.startTs),
      tx.pure.u64(params.endTs),
      tx.pure.u16(params.perWalletLimit),
      tx.pure.u64(params.cap),
    ],
  });
  
  // Register channel with event
  tx.moveCall({
    target: `${PACKAGE_ID}::event::register_channel`,
    arguments: [
      tx.object(params.eventId),
      tx.object(params.eventCapId),
    ],
  });
  
  tx.setGasBudget(10_000_000);
  
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result.effects?.status?.status !== 'success') {
    throw new Error(`Channel creation failed: ${result.effects?.status?.error}`);
  }
  
  const channelId = result.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::channel::Channel')
  )?.objectId;
  
  if (!channelId) {
    throw new Error('Failed to extract channel ID');
  }
  
  console.log('✓ Channel created:', channelId);
  
  return {
    digest: result.digest,
    channelId,
    effects: result.effects,
  };
}

/**
 * PTB: Publish Event (with on-chain gating)
 * Enforces prerequisites:
 * - Payouts must be configured
 * - At least one active channel must exist
 */
export async function publishGated(params: PublishGatedParams): Promise<PublishGatedResult> {
  const client = getClient();
  const signer = await getSigner(client);
  
  console.log('Publishing event with on-chain gating:', params);
  
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::event::publish`,
    arguments: [
      tx.object(params.eventId),
      tx.object(params.eventCapId),
    ],
  });
  
  tx.setGasBudget(5_000_000);
  
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });
  
  if (result.effects?.status?.status !== 'success') {
    const error = result.effects?.status?.error || 'Unknown error';
    
    // Parse Move error codes into friendly messages
    if (error.includes('E_PAYOUTS_REQUIRED')) {
      throw new Error('Payouts must be configured before publishing');
    } else if (error.includes('E_CHANNEL_REQUIRED')) {
      throw new Error('At least one sales channel must be created before publishing');
    } else {
      throw new Error(`Publish failed: ${error}`);
    }
  }
  
  console.log('✓ Event published');
  
  return {
    digest: result.digest,
    effects: result.effects,
  };
}

/**
 * Query functions to check on-chain state
 */
export interface EventGatingState {
  hasPayouts: boolean;
  hasChannels: boolean;
  canPublish: boolean;
  payoutsId?: string;
}

/**
 * Check if event meets publishing prerequisites
 */
export async function checkEventGating(eventId: string): Promise<EventGatingState> {
  const client = getClient();
  
  try {
    const event = await client.getObject({
      id: eventId,
      options: { showContent: true },
    });
    
    if (!event.data) {
      throw new Error('Event not found');
    }
    
    // Parse dynamic fields to check for payouts and channels
    const content = event.data.content as any;
    
    // For now, we'll need to query dynamic fields separately
    // This is a simplified version - in production you'd query the dynamic fields properly
    const hasPayouts = false; // TODO: Check dynamic field KEY_PAYOUTS_ID
    const hasChannels = false; // TODO: Check dynamic field KEY_CHANNEL_COUNT
    
    return {
      hasPayouts,
      hasChannels,
      canPublish: hasPayouts && hasChannels,
    };
  } catch (error) {
    console.error('Failed to check event gating state:', error);
    return {
      hasPayouts: false,
      hasChannels: false,
      canPublish: false,
    };
  }
}

/**
 * Atomic Go Live - Extended params interface for CreateEvent page
 */
export interface AtomicGoLiveParams {
  eventName: string;
  location: string;
  startsAt: number;
  endsAt: number;
  posterCid: string;
  ticketTypes: {
    name: string;
    color: string;
    supply: number;
    priceMist: number;
  }[];
  artistBps: number;
  organizerBps: number;
  platformBps: number;
  artistAddress: string;
  organizerAddress: string;
  platformAddress: string;
  onProgress?: (step: string, message: string) => void;
}

export interface AtomicGoLiveResult {
  digest: string;
  eventId: string;
  gateKeeperCapId: string;
  eventCapId: string;
  ticketClasses: {
    classId: string;
    name: string;
    supply: number;
    priceMist: number;
  }[];
  kioskId: string;
}

/**
 * PTB: Atomic Go Live (Wrapper for publishEvent with extended functionality)
 * Creates event, ticket classes, and returns complete setup
 */
export async function atomicGoLive(params: AtomicGoLiveParams): Promise<AtomicGoLiveResult> {
  const client = getClient();
  const signer = await getSigner(client);
  const address = signer.getPublicKey().toSuiAddress();
  
  params.onProgress?.('init', 'Preparing transaction...');
  
  // Calculate total supply from all ticket types
  const totalSupply = params.ticketTypes.reduce((sum, ticket) => sum + ticket.supply, 0);
  
  // Step 1: Create Event in first transaction
  params.onProgress?.('event', 'Creating event...');
  
  const tx1 = new Transaction();
  tx1.moveCall({
    target: `${PACKAGE_ID}::event::new`,
    arguments: [
      tx1.pure.string(params.eventName),
      tx1.pure.string(params.location),
      tx1.pure.u64(params.startsAt),
      tx1.pure.u64(params.endsAt),
      tx1.pure.string(params.posterCid || 'walrus://placeholder'),
      tx1.pure.u64(totalSupply),
    ],
  });
  tx1.setGasBudget(10_000_000);
  
  const result1 = await client.signAndExecuteTransaction({
    signer,
    transaction: tx1,
    options: { 
      showEffects: true, 
      showObjectChanges: true,
    },
  });
  
  if (result1.effects?.status?.status !== 'success') {
    throw new Error(`Event creation failed: ${result1.effects?.status?.error}`);
  }
  
  // Extract created object IDs
  const eventId = result1.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::event::Event')
  )?.objectId as string | undefined;
  
  const gateKeeperCapId = result1.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::event::GateKeeperCap')
  )?.objectId as string | undefined;
  
  const eventCapId = result1.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::event::EventCap')
  )?.objectId as string | undefined;
  
  if (!eventId || !gateKeeperCapId || !eventCapId) {
    throw new Error('Failed to extract event or capability ID from transaction');
  }
  
  console.log('✓ Event created:', { eventId, gateKeeperCapId, eventCapId });
  
  // Wait longer for finalization (increased from 2s to 4s)
  params.onProgress?.('event', 'Waiting for event finalization...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  // Step 2: Check for existing Kiosk or create new one
  params.onProgress?.('kiosk', 'Setting up sales channel...');
  