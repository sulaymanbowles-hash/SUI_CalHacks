import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import fs from 'node:fs';

const sellerData = JSON.parse(fs.readFileSync('../.secrets/SELLER.json', 'utf-8'));
const sellerKeypair = Ed25519Keypair.fromSecretKey(sellerData.privateKey);
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

const tx = new Transaction();

// Correct Kiosk creation - returns (Kiosk, KioskOwnerCap)
tx.moveCall({
  target: '0x2::kiosk::default',
  arguments: [],
});

tx.setGasBudget(10_000_000);

const result = await client.signAndExecuteTransaction({
  signer: sellerKeypair,
  transaction: tx,
  options: { showEffects: true, showObjectChanges: true },
});

console.log('Status:', result.effects?.status?.status);
console.log('Object changes:', JSON.stringify(result.objectChanges, null, 2));
