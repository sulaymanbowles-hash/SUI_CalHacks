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
const { address: sellerAddress, secretKeyB64 } = JSON.parse(
  fs.readFileSync(sellerPath, 'utf-8')
);
const sellerKeypair = Ed25519Keypair.fromSecretKey(fromB64(secretKeyB64));

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
 * Creates an event, ticket class, and mints a ticket in a single transaction.
 * The ticket is owned by the seller and can be listed in a Kiosk (future enhancement).
 */
export async function mintAndList(args: MintAndListArgs) {
  console.log('=== PTB: Mint & List ===');
  console.log('Event:', args.eventName);
  console.log('Price:', args.facePriceMist, 'mist');
  console.log('Supply:', args.supply);
  console.log('');

  const tx = new Transaction();

  // 1. Create event
  const [event] = tx.moveCall({
    target: `${PACKAGE_ID}::event::new`,
    arguments: [
      tx.pure.string(args.eventName),
      tx.pure.u64(args.startsAt),
      tx.pure.u64(args.endsAt),
      tx.pure.string(args.posterCid),
    ],
  });

  // 2. Create ticket class
  const [ticketClass] = tx.moveCall({
    target: `${PACKAGE_ID}::class::new`,
    arguments: [
      event,
      tx.pure.u64(args.facePriceMist),
      tx.pure.u64(args.supply),
    ],
  });

  // 3. Mint first ticket
  tx.moveCall({
    target: `${PACKAGE_ID}::ticket::mint`,
    arguments: [ticketClass],
  });

  // Transfer event and class back to sender (they're created in the PTB)
  tx.transferObjects([event, ticketClass], tx.pure.address(sellerAddress));

  // Set gas budget
  tx.setGasBudget(10_000_000);

  // Sign and execute
  console.log('Executing transaction...');
  const result = await client.signAndExecuteTransaction({
    signer: sellerKeypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  if (result.effects?.status?.status !== 'success') {
    console.error('✘ Transaction failed:', result.effects?.status);
    throw new Error('Transaction failed');
  }

  console.log('✔ Transaction successful!');
  console.log('Digest:', result.digest);
  console.log('');

  // Extract created objects
  const objectChanges = result.objectChanges || [];
  const ticket = objectChanges.find((c: any) => 
    c.objectType?.includes('::ticket::Ticket')
  );
  const eventObj = objectChanges.find((c: any) => 
    c.objectType?.includes('::event::Event')
  );
  const classObj = objectChanges.find((c: any) => 
    c.objectType?.includes('::class::TicketClass')
  );

  console.log('Created objects:');
  if (eventObj) console.log('  Event ID:', (eventObj as any).objectId);
  if (classObj) console.log('  Class ID:', (classObj as any).objectId);
  if (ticket) console.log('  Ticket ID:', (ticket as any).objectId);

  return {
    digest: result.digest,
    eventId: (eventObj as any)?.objectId,
    classId: (classObj as any)?.objectId,
    ticketId: (ticket as any)?.objectId,
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
