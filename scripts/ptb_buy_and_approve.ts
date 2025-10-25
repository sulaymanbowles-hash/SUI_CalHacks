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
const POLICY_ID = envContent.match(/export POLICY_ID=(.*)/)?.[1]?.trim() || '';
const NETWORK = (envContent.match(/export NETWORK=(.*)/)?.[1]?.trim() || 'testnet') as 'testnet';

if (!PACKAGE_ID || !POLICY_ID) {
  console.error('✘ PACKAGE_ID or POLICY_ID not set in scripts/env.sh');
  process.exit(1);
}

// Load buyer keypair
const buyerPath = path.join(__dirname, '../.secrets/BUYER.json');
const buyerData = JSON.parse(fs.readFileSync(buyerPath, 'utf-8'));
const buyerKeypair = buyerData.privateKey 
  ? Ed25519Keypair.fromSecretKey(buyerData.privateKey)
  : Ed25519Keypair.fromSecretKey(fromB64(buyerData.secretKeyB64).slice(0, 32));
const buyerAddress = buyerData.address;

const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

interface BuyAndApproveArgs {
  kioskId: string;
  ticketId: string;
  priceMist: string;
}

/**
 * PTB: Buy & Approve
 * 
 * Purchases a ticket from a Kiosk and approves the transfer through the TransferPolicy
 * in a single atomic transaction.
 * 
 * Flow:
 * 1. kiosk::purchase() - Buy the ticket, get TransferRequest
 * 2. transfer_policy::confirm_request() - Approve the transfer (enforces royalties)
 */
export async function buyAndApprove(args: BuyAndApproveArgs) {
  console.log('=== PTB: Buy & Approve ===');
  console.log('Kiosk ID:', args.kioskId);
  console.log('Ticket ID:', args.ticketId);
  console.log('Price:', args.priceMist, 'mist (', Number(args.priceMist) / 1e9, 'SUI )');
  console.log('Buyer:', buyerAddress);
  console.log('');

  // Get buyer's balance before purchase
  const balanceBefore = await client.getBalance({ owner: buyerAddress });
  console.log('Buyer balance before:', Number(balanceBefore.totalBalance) / 1e9, 'SUI');
  console.log('');

  const tx = new Transaction();

  // Split coin for exact payment
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(args.priceMist)]);

  // Purchase from kiosk - returns (Item, TransferRequest)
  const [ticket, transferRequest] = tx.moveCall({
    target: '0x2::kiosk::purchase',
    typeArguments: [`${PACKAGE_ID}::ticket::Ticket`],
    arguments: [
      tx.object(args.kioskId),
      tx.pure.id(args.ticketId),
      paymentCoin,
    ],
  });

  // Confirm the transfer request (this enforces royalties and policy rules)
  const [purchaseReceipt] = tx.moveCall({
    target: '0x2::transfer_policy::confirm_request',
    typeArguments: [`${PACKAGE_ID}::ticket::Ticket`],
    arguments: [
      tx.object(POLICY_ID),
      transferRequest,
    ],
  });

  // Transfer the ticket to buyer
  tx.transferObjects([ticket], tx.pure.address(buyerAddress));

  tx.setGasBudget(20_000_000);

  console.log('Executing purchase...');
  const result = await client.signAndExecuteTransaction({
    signer: buyerKeypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showBalanceChanges: true,
      showEvents: true,
    },
  });

  if (result.effects?.status?.status !== 'success') {
    console.error('✘ Purchase failed:', result.effects?.status);
    throw new Error('Purchase failed');
  }

  console.log('✔ Purchase successful!');
  console.log('');

  // Get buyer's balance after purchase
  await new Promise(resolve => setTimeout(resolve, 2000));
  const balanceAfter = await client.getBalance({ owner: buyerAddress });
  console.log('Buyer balance after:', Number(balanceAfter.totalBalance) / 1e9, 'SUI');
  console.log('Total spent:', (Number(balanceBefore.totalBalance) - Number(balanceAfter.totalBalance)) / 1e9, 'SUI');
  console.log('');

  // Verify ownership changed
  const ticketObj = await client.getObject({ 
    id: args.ticketId, 
    options: { showOwner: true, showContent: true } 
  });
  
  const newOwner = (ticketObj.data?.owner as any)?.AddressOwner;
  console.log('✔ Ownership verification:');
  console.log('  New owner:', newOwner);
  console.log('  Expected (BUYER):', buyerAddress);
  console.log('  Match:', newOwner === buyerAddress ? '✓' : '✗');
  console.log('');

  console.log('Transaction digest:', result.digest);
  console.log('Explorer:', `https://suiscan.xyz/testnet/tx/${result.digest}?network=testnet`);
  console.log('');

  // Show balance changes (royalty splits)
  if (result.balanceChanges) {
    console.log('=== Balance Changes (Royalty Splits) ===');
    result.balanceChanges.forEach((change: any) => {
      const amount = Number(change.amount) / 1e9;
      const sign = amount > 0 ? '+' : '';
      console.log(`  ${change.owner.AddressOwner}: ${sign}${amount.toFixed(4)} SUI`);
    });
  }

  return {
    digest: result.digest,
    ticketId: args.ticketId,
    owner: newOwner,
    effects: result.effects,
    balanceChanges: result.balanceChanges,
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const kioskId = process.argv[2];
  const ticketId = process.argv[3];
  const priceMist = process.argv[4] || '250000000';

  if (!kioskId || !ticketId) {
    console.error('Usage: tsx ptb_buy_and_approve.ts <KIOSK_ID> <TICKET_ID> [PRICE_MIST]');
    console.error('Example: tsx ptb_buy_and_approve.ts 0xabc... 0xdef... 250000000');
    process.exit(1);
  }

  buyAndApprove({ kioskId, ticketId, priceMist })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
