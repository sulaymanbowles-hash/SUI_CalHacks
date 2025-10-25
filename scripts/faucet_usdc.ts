import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import open from 'open';

const OWNER = process.env.USDC_OWNER;
if (!OWNER) {
  console.error('✘ Set USDC_OWNER=0x... (buyer address)');
  process.exit(1);
}

const NETWORK = (process.env.NETWORK as 'testnet' | 'devnet') || 'testnet';
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

/**
 * Discover USDC coin type by scanning owned coins and matching symbol.
 * Returns null if not found (user hasn't claimed yet).
 */
async function discoverUsdcType(): Promise<string | null> {
  const override = process.env.USDC_COIN_TYPE;
  if (override) {
    console.log(`Using override USDC_COIN_TYPE: ${override}`);
    return override;
  }

  try {
    const coins = await client.getCoins({ owner: OWNER });
    for (const coin of coins.data) {
      try {
        const metadata = await client.getCoinMetadata({ coinType: coin.coinType });
        if (metadata?.symbol?.toUpperCase() === 'USDC') {
          console.log(`✔ Discovered USDC coin type: ${coin.coinType}`);
          return coin.coinType;
        }
      } catch {
        // Ignore coins without metadata
      }
    }
  } catch (err) {
    console.error('⚠ Error scanning coins:', err);
  }

  return null;
}

/**
 * Get current USDC balance for OWNER.
 */
async function getUsdcBalance(coinType: string): Promise<bigint> {
  try {
    const { totalBalance } = await client.getBalance({
      owner: OWNER,
      coinType
    });
    return BigInt(totalBalance);
  } catch {
    return 0n;
  }
}

(async () => {
  console.log('=== USDC Testnet Faucet (Semi-Automated) ===');
  console.log('');
  console.log('Circle testnet faucet has no public API, so:');
  console.log('1. We open the faucet page in your browser');
  console.log('2. You click "Get test tokens" (one-time)');
  console.log('3. We poll on-chain balance until funds arrive');
  console.log('');

  // Open Circle faucet
  console.log('Opening Circle testnet faucet...');
  await open('https://faucet.circle.com/');
  console.log('✔ Faucet page opened. Please claim USDC test tokens in your browser.');
  console.log('');

  // Wait a bit for user to claim
  await new Promise(r => setTimeout(r, 5000));

  // Try to discover USDC coin type
  let usdcType = await discoverUsdcType();

  if (!usdcType) {
    console.log('⚠ USDC coin type not found yet. Polling for 2 minutes...');
    const discoveryStart = Date.now();
    while (Date.now() - discoveryStart < 2 * 60_000) {
      await new Promise(r => setTimeout(r, 10_000));
      process.stdout.write('.');
      usdcType = await discoverUsdcType();
      if (usdcType) {
        console.log('');
        break;
      }
    }
  }

  if (!usdcType) {
    console.error('');
    console.error('✘ USDC coin type not found after 2 minutes.');
    console.error('Please claim test USDC from https://faucet.circle.com/ and try again.');
    process.exit(1);
  }

  // Get metadata for display
  const metadata = await client.getCoinMetadata({ coinType: usdcType });
  const decimals = metadata?.decimals ?? 6;
  const targetRaw = BigInt(process.env.TARGET_USDC ?? String(10 * 10 ** decimals));
  const targetDisplay = Number(targetRaw) / 10 ** decimals;

  console.log(`Target balance: ${targetDisplay} USDC`);
  console.log('');

  // Poll balance
  const startTime = Date.now();
  const timeout = 10 * 60_000; // 10 minutes
  process.stdout.write('Polling USDC balance');

  while (Date.now() - startTime < timeout) {
    await new Promise(r => setTimeout(r, 10_000)); // Poll every 10 seconds
    process.stdout.write('.');

    const balance = await getUsdcBalance(usdcType);
    if (balance >= targetRaw) {
      const balanceDisplay = Number(balance) / 10 ** decimals;
      console.log('');
      console.log('');
      console.log(`✔ USDC received: ${balanceDisplay} USDC`);
      console.log(`Balance: ${balance.toString()} (raw)`);
      process.exit(0);
    }
  }

  console.log('');
  console.log('');
  console.error('✘ Timed out waiting for USDC (10 minutes).');
  console.error('Circle faucet has hourly limits. Try again after the cooldown.');
  console.error('Note: USDC is optional—core flows use SUI pricing.');
  process.exit(1);
})();
