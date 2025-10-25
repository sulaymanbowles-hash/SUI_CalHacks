import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { toB64 } from '@mysten/sui/utils';
import fs from 'node:fs';
import path from 'node:path';

// Generate a new keypair
const keypair = Ed25519Keypair.generate();
const address = keypair.getPublicKey().toSuiAddress();

// Export in Bech32 format (the standard Sui private key format)
const exported = keypair.export();
const privateKeyBech32 = exported.privateKey; // This is in "suiprivkey..." format

const wallet = {
  address,
  privateKey: privateKeyBech32, // Use the Bech32 format
  scheme: 'ED25519',
  createdAt: new Date().toISOString()
};

const secretsDir = path.join(process.cwd(), '../.secrets');
if (!fs.existsSync(secretsDir)) {
  fs.mkdirSync(secretsDir, { recursive: true });
}

fs.writeFileSync(
  path.join(secretsDir, 'SELLER.json'),
  JSON.stringify(wallet, null, 2)
);

console.log('✔ Created SELLER wallet:', address);
console.log('✔ Saved to .secrets/SELLER.json');

// Verify it can be reloaded
const reloaded = Ed25519Keypair.fromSecretKey(privateKeyBech32);
const reloadedAddress = reloaded.getPublicKey().toSuiAddress();
console.log('✔ Verification: addresses match =', address === reloadedAddress);
