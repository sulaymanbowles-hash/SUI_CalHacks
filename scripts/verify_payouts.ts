import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
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
const POLICY_ID = envContent.match(/export POLICY_ID=(.*)/)?.[1]?.trim() || '';
const ADDR_SELLER = envContent.match(/export ADDR_SELLER=(.*)/)?.[1]?.trim() || '';
const ADDR_BUYER = envContent.match(/export ADDR_BUYER=(.*)/)?.[1]?.trim() || '';

// Artist, Organizer, Platform (for 90/8/2 split)
const ARTIST = ADDR_SELLER; // For M1, artist is seller
const ORGANIZER = ADDR_SELLER; // For M1, organizer is seller
const PLATFORM = ADDR_SELLER; // For M1, platform is seller (will be different in production)

const buyerPath = path.join(__dirname, '../.secrets/BUYER.json');
const buyerData = JSON.parse(fs.readFileSync(buyerPath, 'utf-8'));
const buyerKeypair = buyerData.privateKey 
  ? Ed25519Keypair.fromSecretKey(buyerData.privateKey)
  : Ed25519Keypair.fromSecretKey(fromB64(buyerData.secretKeyB64).slice(0, 32));
const buyerAddress = buyerData.address;

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

async function getBalance(address: string): Promise<bigint> {
  const balance = await client.getBalance({ owner: address });
  return BigInt(balance.totalBalance);
}

async function verifyPayouts(kioskId: string, ticketId: string, priceMist: string) {
  console.log('=== Payout Verification: Buy & Approve ===');
  console.log('');
  console.log('Expected splits (90/8/2):');
  const price = BigInt(priceMist);
  const expectedArtist = price * 90n / 100n;
  const expectedOrganizer = price * 8n / 100n;
  const expectedPlatform = price * 2n / 100n;
  console.log(`  Artist (90%):    ${expectedArtist} MIST (${Number(expectedArtist) / 1e9} SUI)`);
  console.log(`  Organizer (8%):  ${expectedOrganizer} MIST (${Number(expectedOrganizer) / 1e9} SUI)`);
  console.log(`  Platform (2%):   ${expectedPlatform} MIST (${Number(expectedPlatform) / 1e9} SUI)`);
  console.log('');

  // Get balances before
  console.log('Fetching balances before purchase...');
  const buyerBefore = await getBalance(buyerAddress);
  const artistBefore = await getBalance(ARTIST);
  const organizerBefore = await getBalance(ORGANIZER);
  const platformBefore = await getBalance(PLATFORM);

  console.log('Balances before:');
  console.log(`  Buyer:     ${Number(buyerBefore) / 1e9} SUI`);
  console.log(`  Artist:    ${Number(artistBefore) / 1e9} SUI`);
  console.log(`  Organizer: ${Number(organizerBefore) / 1e9} SUI`);
  console.log(`  Platform:  ${Number(platformBefore) / 1e9} SUI`);
  console.log('');

  // Execute purchase
  console.log('Executing purchase with royalty enforcement...');
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceMist)]);
  const [ticket, transferRequest] = tx.moveCall({
    target: '0x2::kiosk::purchase',
    typeArguments: [`${PACKAGE_ID}::ticket::Ticket`],
    arguments: [
      tx.object(kioskId),
      tx.pure.id(ticketId),
      paymentCoin,
    ],
  });
  const [purchaseReceipt] = tx.moveCall({
    target: '0x2::transfer_policy::confirm_request',
    typeArguments: [`${PACKAGE_ID}::ticket::Ticket`],
    arguments: [
      tx.object(POLICY_ID),
      transferRequest,
    ],
  });
  tx.transferObjects([ticket], tx.pure.address(buyerAddress));
  tx.setGasBudget(20_000_000);

  const result = await client.signAndExecuteTransaction({
    signer: buyerKeypair,
    transaction: tx,
    options: {
      showEffects: true,
      showBalanceChanges: true,
    },
  });

  if (result.effects?.status?.status !== 'success') {
    console.error('✘ Purchase failed:', result.effects?.status);
    throw new Error('Purchase failed');
  }

  console.log('✔ Purchase successful!');
  console.log('Digest:', result.digest);
  console.log('');

  // Wait for finalization
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get balances after
  console.log('Fetching balances after purchase...');
  const buyerAfter = await getBalance(buyerAddress);
  const artistAfter = await getBalance(ARTIST);
  const organizerAfter = await getBalance(ORGANIZER);
  const platformAfter = await getBalance(PLATFORM);

  console.log('Balances after:');
  console.log(`  Buyer:     ${Number(buyerAfter) / 1e9} SUI`);
  console.log(`  Artist:    ${Number(artistAfter) / 1e9} SUI`);
  console.log(`  Organizer: ${Number(organizerAfter) / 1e9} SUI`);
  console.log(`  Platform:  ${Number(platformAfter) / 1e9} SUI`);
  console.log('');

  // Calculate deltas
  const buyerDelta = buyerAfter - buyerBefore;
  const artistDelta = artistAfter - artistBefore;
  const organizerDelta = organizerAfter - organizerBefore;
  const platformDelta = platformAfter - platformBefore;

  console.log('=== Balance Changes ===');
  console.log(`  Buyer:     ${Number(buyerDelta) / 1e9} SUI (includes gas)`);
  console.log(`  Artist:    ${Number(artistDelta) / 1e9} SUI`);
  console.log(`  Organizer: ${Number(organizerDelta) / 1e9} SUI`);
  console.log(`  Platform:  ${Number(platformDelta) / 1e9} SUI`);
  console.log('');

  // Note: In M1, all three recipients are the same address (SELLER)
  // So we see the total payout as one combined delta
  if (ARTIST === ORGANIZER && ORGANIZER === PLATFORM) {
    console.log('Note: Artist, Organizer, and Platform are all the same address (SELLER) in M1');
    console.log('Total seller payout:', Number(artistDelta) / 1e9, 'SUI');
    console.log('Expected total:', Number(price) / 1e9, 'SUI');
    console.log('Match:', Math.abs(Number(artistDelta) - Number(price)) < 1e6 ? '✓' : '✗');
  } else {
    console.log('Payout verification (90/8/2):');
    console.log(`  Artist:    ${Number(artistDelta) / 1e9} SUI (expected ${Number(expectedArtist) / 1e9})`);
    console.log(`  Organizer: ${Number(organizerDelta) / 1e9} SUI (expected ${Number(expectedOrganizer) / 1e9})`);
    console.log(`  Platform:  ${Number(platformDelta) / 1e9} SUI (expected ${Number(expectedPlatform) / 1e9})`);
  }

  console.log('');
  console.log('Explorer:', `https://suiscan.xyz/testnet/tx/${result.digest}?network=testnet`);
}

// CLI execution
const kioskId = process.argv[2];
const ticketId = process.argv[3];
const priceMist = process.argv[4] || '250000000';

if (!kioskId || !ticketId) {
  console.error('Usage: tsx verify_payouts.ts <KIOSK_ID> <TICKET_ID> [PRICE_MIST]');
  process.exit(1);
}

verifyPayouts(kioskId, ticketId, priceMist)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
