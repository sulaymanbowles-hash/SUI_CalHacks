import fetch from 'node-fetch';

const publisherUrl = process.env.WALRUS_PUBLISHER_URL;
if (!publisherUrl) {
  console.error('✘ WALRUS_PUBLISHER_URL not set in scripts/env.sh');
  console.error('Example: export WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space');
  process.exit(1);
}

const apiToken = process.env.WALRUS_API_TOKEN;

(async () => {
  console.log('=== Walrus Publisher Check ===');
  console.log(`URL: ${publisherUrl}`);
  console.log('');

  try {
    const headers: Record<string, string> = {};
    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
      console.log('✔ Using WALRUS_API_TOKEN for authentication');
    } else {
      console.log('⚠ No WALRUS_API_TOKEN set (may require WAL test credits)');
    }

    // Try to reach the publisher root endpoint
    const response = await fetch(publisherUrl, { 
      method: 'GET',
      headers 
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log('');

    if (response.status === 401 || response.status === 403) {
      console.error('✘ Walrus publisher requires authentication');
      console.error('');
      console.error('Options:');
      console.error('1. Set WALRUS_API_TOKEN in scripts/env.sh');
      console.error('2. Obtain WAL test credits from Walrus testnet faucet');
      console.error('3. Check Walrus documentation: https://docs.walrus.site/');
      process.exit(1);
    }

    if (response.status >= 200 && response.status < 300) {
      console.log('✔ Walrus publisher is reachable and accessible');
      console.log('Ready for M4 (asset upload)');
      process.exit(0);
    }

    if (response.status >= 400) {
      console.error(`⚠ Walrus publisher returned error: ${response.status}`);
      const text = await response.text().catch(() => '');
      if (text) console.error('Response:', text.substring(0, 200));
      process.exit(1);
    }

    console.log('✔ Walrus publisher check passed');
  } catch (error) {
    console.error('✘ Failed to reach Walrus publisher');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    console.error('');
    console.error('Check:');
    console.error('- Network connectivity');
    console.error('- WALRUS_PUBLISHER_URL is correct');
    console.error('- Walrus testnet is operational');
    process.exit(1);
  }
})();
