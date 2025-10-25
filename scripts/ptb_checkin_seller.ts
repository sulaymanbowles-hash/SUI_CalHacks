import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, 'env.sh');
const envContent = fs.readFileSync(envPath, 'utf-8');
const PACKAGE_ID = envContent.match(/export PACKAGE_ID=(.*)/)?.[1]?.trim() || '';
const NETWORK = (envContent.match(/export NETWORK=(.*)/)?.[1]?.trim() || 'testnet') as 'testnet';

// Load SELLER keypair (owns the ticket)
const sellerPath = path.join(__dirname, '../.secrets/SELLER.json');
const sellerData = JSON.parse(fs.readFileSync(sellerPath, 'utf-8'));
const sellerKeypair = sellerData.privateKey 
  ? Ed25519Keypair.fromSecretKey(sellerData.privateKey)
  : Ed25519Keypair.fromSecretKey(fromB64(sellerData.secretKeyB64).slice(0, 32));

const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

const ticketId = process.argv[2];
if (!ticketId) {
  console.error('Usage: tsx ptb_checkin_seller.ts <TICKET_ID>');
  process.exit(1);
}

console.log('=== PTB: Check-in ===');
console.log('Ticket ID:', ticketId);
console.log('');

const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::ticket::mark_used`,
  arguments: [tx.object(ticketId)],
});
tx.setGasBudget(5_000_000);

console.log('Marking ticket as used...');
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
  process.exit(1);
}

console.log('✔ Ticket checked in successfully!');
console.log('Digest:', result.digest);
console.log('Explorer:', `https://suiscan.xyz/testnet/tx/${result.digest}`);
