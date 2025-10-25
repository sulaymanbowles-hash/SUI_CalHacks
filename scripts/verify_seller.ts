import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import fs from 'node:fs';

const sellerData = JSON.parse(fs.readFileSync('../.secrets/SELLER.json', 'utf-8'));
const secretKeyBytes = fromB64(sellerData.secretKeyB64);
const keypair = Ed25519Keypair.fromSecretKey(secretKeyBytes.slice(0, 32));
const derivedAddress = keypair.getPublicKey().toSuiAddress();

console.log('Stored address:  ', sellerData.address);
console.log('Derived address: ', derivedAddress);
console.log('Match:', sellerData.address === derivedAddress);

if (sellerData.address === derivedAddress) {
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  const coins = await client.getCoins({ owner: derivedAddress });
  console.log('\nGas coins:', coins.data.length);
  coins.data.forEach(c => console.log(`  ${c.coinObjectId}: ${c.balance} MIST`));
} else {
  console.log('\n⚠ Address mismatch! Cannot query coins.');
}
