import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { toB64 } from '@mysten/sui/utils';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get alias from command line (default: SELLER)
const alias = (process.argv[2] || 'SELLER').toUpperCase();

// Generate new Ed25519 keypair
const keypair = new Ed25519Keypair();
const address = keypair.toSuiAddress();
const secretKeyB64 = toB64(keypair.getSecretKey());

// Create .secrets directory (git-ignored)
const secretsDir = path.resolve(__dirname, '../.secrets');
fs.mkdirSync(secretsDir, { recursive: true });

// Write wallet JSON
const walletPath = path.join(secretsDir, `${alias}.json`);
const walletData = {
  address,
  secretKeyB64,
  scheme: 'ED25519',
  createdAt: new Date().toISOString()
};

fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));

// Print success message
console.log(`✔ Created ${alias} wallet: ${address}`);
console.log(`✔ Wrote .secrets/${alias}.json (git-ignored)`);
console.log('');
console.log(`Add to scripts/env.sh if missing:`);
console.log(`  export ADDR_${alias}=${address}`);
console.log('');
console.log(`To import to Sui CLI (optional):`);
console.log(`  sui keytool import "${secretKeyB64}" ed25519`);
