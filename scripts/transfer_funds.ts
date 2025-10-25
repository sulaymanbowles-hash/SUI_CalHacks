import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';
import { readFileSync } from 'fs';

async function transferFunds() {
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  
  // Load SELLER keypair - the secretKeyB64 contains the full secret key (64 bytes)
  const sellerData = JSON.parse(readFileSync('../.secrets/SELLER.json', 'utf-8'));
  const secretKeyBytes = fromB64(sellerData.secretKeyB64);
  const sellerKeypair = Ed25519Keypair.fromSecretKey(secretKeyBytes.slice(0, 32)); // Use first 32 bytes
  const sellerAddress = sellerData.address;
  
  const buyerAddress = '0x73b3bc71eacfddc8d0a736129f500dcc7b105e93060510f11c928fc4b9637f44';
  
  console.log(`Transferring 0.333 SUI from SELLER (${sellerAddress}) to BUYER (${buyerAddress})...`);
  
  // Get SELLER's gas coins
  const coins = await client.getCoins({ owner: sellerAddress });
  if (coins.data.length === 0) {
    throw new Error('SELLER has no gas coins');
  }
  
  // Create transaction
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [333_000_000]); // 0.333 SUI
  tx.transferObjects([coin], buyerAddress);
  
  // Execute
  const result = await client.signAndExecuteTransaction({
    signer: sellerKeypair,
    transaction: tx,
  });
  
  console.log('✓ Transfer successful!');
  console.log('Transaction Digest:', result.digest);
  console.log(`Explorer: https://suiscan.xyz/testnet/tx/${result.digest}`);
}

transferFunds().catch(console.error);
