import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';
import { readFileSync } from 'fs';

async function checkCoins() {
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  
  const sellerData = JSON.parse(readFileSync('../.secrets/SELLER.json', 'utf-8'));
  const secretKeyBytes = fromB64(sellerData.secretKeyB64);
  const sellerKeypair = Ed25519Keypair.fromSecretKey(secretKeyBytes.slice(0, 32));
  const computedAddress = sellerKeypair.toSuiAddress();
  
  console.log('File address:    ', sellerData.address);
  console.log('Computed address:', computedAddress);
  console.log('Addresses match: ', computedAddress === sellerData.address);
  console.log('');
  
  const coins = await client.getCoins({ owner: sellerData.address });
  console.log(`Found ${coins.data.length} coin(s):`);
  coins.data.forEach(coin => {
    console.log(`  ${coin.coinObjectId}: ${coin.balance} MIST`);
  });
}

checkCoins().catch(console.error);
