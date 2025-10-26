import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// USDC contract address on Sui testnet
const USDC_TYPE = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';
const DEV_LOCAL_ADDRESS = '0xe22b81de77e8565e86cc81452dc4f34a4c0f6a4cfb8111e7c087248b97247a17';

async function transferAllAssets() {
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  
  // Find all wallet files in .secrets/
  const secretsDir = path.resolve(process.cwd(), '../.secrets');
  const walletNames = ['SELLER', 'BUYER', 'CREATOR'];
  
  console.log('🔄 Transferring all assets to DEV_LOCAL wallet...\n');
  console.log(`Target: ${DEV_LOCAL_ADDRESS}\n`);
  
  for (const name of walletNames) {
    const walletPath = path.join(secretsDir, `${name}.json`);
    
    if (!existsSync(walletPath)) {
      console.log(`⚠️  ${name} wallet not found, skipping...`);
      continue;
    }
    
    try {
      // Load wallet
      const walletData = JSON.parse(readFileSync(walletPath, 'utf-8'));
      
      // Handle both privateKey (Sui format) and secretKeyB64 formats
      let keypair: Ed25519Keypair;
      if (walletData.privateKey) {
        const { schema, secretKey } = decodeSuiPrivateKey(walletData.privateKey);
        if (schema !== 'ED25519') {
          throw new Error(`Unsupported key scheme: ${schema}`);
        }
        keypair = Ed25519Keypair.fromSecretKey(secretKey);
      } else {
        throw new Error('No privateKey found in wallet file');
      }
      
      const address = walletData.address;
      
      if (address === DEV_LOCAL_ADDRESS) {
        console.log(`⏭️  Skipping ${name} (is DEV_LOCAL)...\n`);
        continue;
      }
      
      console.log(`📦 ${name} (${address.slice(0, 8)}...${address.slice(-6)})`);
      
      // Get all SUI coins
      const suiCoins = await client.getCoins({ owner: address });
      const suiBalance = suiCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
      
      // Get all USDC coins
      const usdcCoins = await client.getCoins({ owner: address, coinType: USDC_TYPE });
      const usdcBalance = usdcCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
      
      console.log(`   SUI:  ${Number(suiBalance) / 1e9} SUI`);
      console.log(`   USDC: ${Number(usdcBalance) / 1e6} USDC`);
      
      // Skip if no assets
      if (suiBalance === 0n && usdcBalance === 0n) {
        console.log(`   ⏭️  No assets to transfer\n`);
        continue;
      }
      
      const tx = new Transaction();
      
      // Transfer USDC if any
      if (usdcBalance > 0n && usdcCoins.data.length > 0) {
        const [primaryCoin, ...mergeCoins] = usdcCoins.data.map(c => c.coinObjectId);
        
        if (mergeCoins.length > 0) {
          tx.mergeCoins(tx.object(primaryCoin), mergeCoins.map(id => tx.object(id)));
        }
        
        tx.transferObjects([tx.object(primaryCoin)], DEV_LOCAL_ADDRESS);
        console.log(`   ✓ Transferring ${Number(usdcBalance) / 1e6} USDC`);
      }
      
      // Transfer all SUI except gas (keep 0.01 SUI for gas)
      if (suiBalance > 10_000_000n) { // More than 0.01 SUI
        const transferAmount = suiBalance - 10_000_000n; // Leave 0.01 for gas
        const [coin] = tx.splitCoins(tx.gas, [transferAmount]);
        tx.transferObjects([coin], DEV_LOCAL_ADDRESS);
        console.log(`   ✓ Transferring ${Number(transferAmount) / 1e9} SUI (keeping 0.01 for gas)`);
      }
      
      // Execute transaction
      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
          showEffects: true,
        },
      });
      
      if (result.effects?.status?.status === 'success') {
        console.log(`   ✅ Success! Digest: ${result.digest}`);
        console.log(`   🔗 https://suiscan.xyz/testnet/tx/${result.digest}`);
      } else {
        console.log(`   ❌ Failed: ${result.effects?.status?.error}`);
      }
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Show final DEV_LOCAL balance
  console.log('📊 Final DEV_LOCAL balance:');
  const devSuiCoins = await client.getCoins({ owner: DEV_LOCAL_ADDRESS });
  const devSuiBalance = devSuiCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
  
  const devUsdcCoins = await client.getCoins({ owner: DEV_LOCAL_ADDRESS, coinType: USDC_TYPE });
  const devUsdcBalance = devUsdcCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
  
  console.log(`   SUI:  ${Number(devSuiBalance) / 1e9} SUI`);
  console.log(`   USDC: ${Number(devUsdcBalance) / 1e6} USDC`);
  console.log('\n✅ All transfers complete!');
}

transferAllAssets().catch(console.error);
