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
  process.exit(1);
}

// Load buyer keypair
const buyerPath = path.join(__dirname, '../.secrets/BUYER.json');
const buyerData = JSON.parse(fs.readFileSync(buyerPath, 'utf-8'));

// Load keypair - support both formats (privateKey for Bech32, secretKeyB64 for legacy)
const buyerKeypair = buyerData.privateKey 
  ? Ed25519Keypair.fromSecretKey(buyerData.privateKey) // Bech32 format
  : Ed25519Keypair.fromSecretKey(fromB64(buyerData.secretKeyB64).slice(0, 32)); // Legacy format

// Initialize client
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

interface CheckInArgs {
  ticketId: string;
}

/**
 * PTB: Check-in
 * 
 * Marks a ticket as used (check-in at venue).
 * Can only be called once per ticket.
 */
export async function checkIn(args: CheckInArgs) {
  console.log('=== PTB: Check-in ===');
  console.log('Ticket ID:', args.ticketId);
  console.log('');

  const tx = new Transaction();

  // Call mark_used on the ticket
  tx.moveCall({
    target: `${PACKAGE_ID}::ticket::mark_used`,
    arguments: [tx.object(args.ticketId)],
  });

  tx.setGasBudget(5_000_000);

  console.log('Marking ticket as used...');
  const result = await client.signAndExecuteTransaction({
    signer: buyerKeypair,
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

  console.log('✔ Ticket checked in successfully!');
  console.log('Digest:', result.digest);

  return { digest: result.digest };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const ticketId = process.argv[2];
  if (!ticketId) {
    console.error('Usage: tsx ptb_checkin.ts <TICKET_ID>');
    process.exit(1);
  }

  checkIn({ ticketId })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
