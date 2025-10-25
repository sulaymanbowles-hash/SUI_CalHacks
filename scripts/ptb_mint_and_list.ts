import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment
const envPath = path.join(__dirname, 'env.sh');
const envContent = fs.readFileSync(envPath, 'utf-8');
const PACKAGE_ID = envContent.match(/export PACKAGE_ID=(.*)/)?.[1]?.trim() || '';
const NETWORK = (envContent.match(/export NETWORK=(.*)/)?.[1]?.trim() || 'testnet') as 'testnet';

if (!PACKAGE_ID) {
  console.error('✘ PACKAGE_ID not set in scripts/env.sh');
  console.error('Run: bash scripts/deploy_package.sh first');
  process.exit(1);
}

// Load seller keypair
const sellerPath = path.join(__dirname, '../.secrets/SELLER.json');
const sellerData = JSON.parse(fs.readFileSync(sellerPath, 'utf-8'));

// Load keypair - support both formats (privateKey for Bech32, secretKeyB64 for legacy)
const sellerKeypair = sellerData.privateKey 
  ? Ed25519Keypair.fromSecretKey(sellerData.privateKey) // Bech32 format
  : Ed25519Keypair.fromSecretKey(fromB64(sellerData.secretKeyB64).slice(0, 32)); // Legacy format

const sellerAddress = sellerData.address;

// Initialize client
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

interface MintAndListArgs {
  eventName: string;
  startsAt: number;
  endsAt: number;
  posterCid: string;
  facePriceMist: string;
  supply: string;
}

/**
 * PTB: Mint & List
 * 
 * Creates an event, ticket class, mints a ticket, and lists it in a Kiosk
 * 1. Create event
 * 2. Create ticket class
 * 3. Mint ticket
 * 4. Create or use existing Kiosk
 * 5. Place ticket in Kiosk
 * 6. List ticket for sale
 */
export async function mintAndList(args: MintAndListArgs) {
  console.log('=== PTB: Mint & List ===');
  console.log('Event:', args.eventName);
  console.log('Price:', args.facePriceMist, 'mist');
  console.log('Supply:', args.supply);
  console.log('');

  // Transaction 1: Create event
  console.log('Step 1/6: Creating event...');
  const tx1 = new Transaction();
  tx1.moveCall({
    target: `${PACKAGE_ID}::event::new`,
    arguments: [
      tx1.pure.string(args.eventName),
      tx1.pure.u64(args.startsAt),
      tx1.pure.u64(args.endsAt),
      tx1.pure.string(args.posterCid),
    ],
  });
  tx1.setGasBudget(5_000_000);

  const result1 = await client.signAndExecuteTransaction({
    signer: sellerKeypair,
    transaction: tx1,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  if (result1.effects?.status?.status !== 'success') {
    console.error('✘ Event creation failed:', result1.effects?.status);
    throw new Error('Event creation failed');
  }

  const eventObj = result1.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::event::Event')
  );
  const eventId = (eventObj as any)?.objectId;
  console.log('✔ Event created:', eventId);

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Transaction 2: Create ticket class
  console.log('Step 2/6: Creating ticket class...');
  const tx2 = new Transaction();
  tx2.moveCall({
    target: `${PACKAGE_ID}::class::new`,
    arguments: [
      tx2.object(eventId),
      tx2.pure.u64(args.facePriceMist),
      tx2.pure.u64(args.supply),
    ],
  });
  tx2.setGasBudget(5_000_000);

  const result2 = await client.signAndExecuteTransaction({
    signer: sellerKeypair,
    transaction: tx2,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  if (result2.effects?.status?.status !== 'success') {
    console.error('✘ Class creation failed:', result2.effects?.status);
    throw new Error('Class creation failed');
  }

  const classObj = result2.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::class::TicketClass')
  );
  const classId = (classObj as any)?.objectId;
  console.log('✔ Ticket class created:', classId);

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Transaction 3: Mint first ticket
  console.log('Step 3/6: Minting ticket...');
  const tx3 = new Transaction();
  tx3.moveCall({
    target: `${PACKAGE_ID}::ticket::mint`,
    arguments: [tx3.object(classId)],
  });
  tx3.setGasBudget(5_000_000);

  const result3 = await client.signAndExecuteTransaction({
    signer: sellerKeypair,
    transaction: tx3,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  if (result3.effects?.status?.status !== 'success') {
    console.error('✘ Ticket minting failed:', result3.effects?.status);
    throw new Error('Ticket minting failed');
  }

  const ticket = result3.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::ticket::Ticket')
  );
  const ticketId = (ticket as any)?.objectId;
  console.log('✔ Ticket minted:', ticketId);

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Transaction 4: Create Kiosk (or check if SELLER already has one)
  console.log('Step 4/6: Setting up Kiosk...');
  
  // Query for existing Kiosk owned by SELLER
  let kioskId: string;
  let kioskCapId: string;
  
  const ownedObjects = await client.getOwnedObjects({
    owner: sellerAddress,
    filter: { StructType: '0x2::kiosk::Kiosk' },
    options: { showContent: true, showType: true },
  });

  if (ownedObjects.data.length > 0) {
    // Use existing Kiosk
    kioskId = ownedObjects.data[0].data?.objectId!;
    console.log('✔ Using existing Kiosk:', kioskId);
    
    // Find KioskOwnerCap
    const capObjects = await client.getOwnedObjects({
      owner: sellerAddress,
      filter: { StructType: '0x2::kiosk::KioskOwnerCap' },
      options: { showContent: true },
    });
    kioskCapId = capObjects.data[0]?.data?.objectId!;
  } else {
    // Create new Kiosk using kiosk::default() which returns nothing (transfers directly)
    const tx4 = new Transaction();
    tx4.moveCall({
      target: '0x2::kiosk::default',
      arguments: [],
    });
    tx4.setGasBudget(10_000_000);

    const result4 = await client.signAndExecuteTransaction({
      signer: sellerKeypair,
      transaction: tx4,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    if (result4.effects?.status?.status !== 'success') {
      console.error('✘ Kiosk creation failed:', result4.effects?.status);
      throw new Error('Kiosk creation failed');
    }

    // Find the created Kiosk (shared object) and KioskOwnerCap (owned by sender)
    const kioskObj = result4.objectChanges?.find((c: any) => 
      c.type === 'created' && 
      c.objectType?.includes('::kiosk::Kiosk') && 
      (c.owner as any)?.Shared
    );
    const capObj = result4.objectChanges?.find((c: any) => 
      c.type === 'created' && 
      c.objectType?.includes('::kiosk::KioskOwnerCap')
    );
    
    kioskId = (kioskObj as any)?.objectId;
    kioskCapId = (capObj as any)?.objectId;
    
    if (!kioskId || !kioskCapId) {
      console.error('✘ Could not find Kiosk or KioskOwnerCap in object changes');
      console.error('Object changes:', JSON.stringify(result4.objectChanges, null, 2));
      throw new Error('Kiosk creation failed - objects not found');
    }
    
    console.log('✔ Kiosk created:', kioskId);
    console.log('✔ Kiosk cap:', kioskCapId);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Transaction 5 & 6: Place ticket in Kiosk and list it
  console.log('Step 5/6: Placing ticket in Kiosk...');
  console.log('Step 6/6: Listing ticket for sale...');
  
  const tx5 = new Transaction();
  
  // Place ticket in kiosk
  tx5.moveCall({
    target: '0x2::kiosk::place',
    typeArguments: [`${PACKAGE_ID}::ticket::Ticket`],
    arguments: [
      tx5.object(kioskId),
      tx5.object(kioskCapId),
      tx5.object(ticketId),
    ],
  });
  
  // List ticket for sale
  tx5.moveCall({
    target: '0x2::kiosk::list',
    typeArguments: [`${PACKAGE_ID}::ticket::Ticket`],
    arguments: [
      tx5.object(kioskId),
      tx5.object(kioskCapId),
      tx5.pure.id(ticketId),
      tx5.pure.u64(args.facePriceMist),
    ],
  });
  
  tx5.setGasBudget(10_000_000);

  const result5 = await client.signAndExecuteTransaction({
    signer: sellerKeypair,
    transaction: tx5,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showEvents: true,
    },
  });

  if (result5.effects?.status?.status !== 'success') {
    console.error('✘ Kiosk listing failed:', result5.effects?.status);
    throw new Error('Kiosk listing failed');
  }

  // Extract listing ID from events
  const listEvent = result5.events?.find((e: any) => 
    e.type.includes('::kiosk::ItemListed')
  );
  const listingId = listEvent?.parsedJson?.id || ticketId;
  
  console.log('✔ Ticket placed in Kiosk');
  console.log('✔ Ticket listed for sale');

  console.log('');
  console.log('✔ All transactions successful!');
  console.log('');
  console.log('=== IDs for Buy & Approve ===');
  console.log('KIOSK_ID:', kioskId);
  console.log('LISTING_ID:', listingId);
  console.log('TICKET_ID:', ticketId);
  console.log('');
  console.log('Transaction digests:');
  console.log('  Event:', result1.digest);
  console.log('  Class:', result2.digest);
  console.log('  Ticket:', result3.digest);
  console.log('  Kiosk listing:', result5.digest);
  console.log('');
  console.log('Explorer links:');
  console.log('  Event:', `https://suiscan.xyz/testnet/object/${eventId}?network=testnet`);
  console.log('  Ticket:', `https://suiscan.xyz/testnet/object/${ticketId}?network=testnet`);
  console.log('  Kiosk:', `https://suiscan.xyz/testnet/object/${kioskId}?network=testnet`);
  console.log('  Mint tx:', `https://suiscan.xyz/testnet/tx/${result3.digest}?network=testnet`);
  console.log('  List tx:', `https://suiscan.xyz/testnet/tx/${result5.digest}?network=testnet`);

  return {
    digest: result5.digest,
    eventId,
    classId,
    ticketId,
    kioskId,
    listingId,
    effects: result5.effects,
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const now = Math.floor(Date.now() / 1000);
  mintAndList({
    eventName: 'Rock Concert 2025',
    startsAt: now + 86400, // Tomorrow
    endsAt: now + 90000, // Tomorrow + 1 hour
    posterCid: 'walrus://QmTestCID123',
    facePriceMist: '250000000', // 0.25 SUI
    supply: '100',
  })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
