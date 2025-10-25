/**
 * zkLogin Integration with Enoki (Public endpoints only - no API key required)
 * 
 * Flow:
 * 1. Generate ephemeral keypair + get nonce from Enoki (public)
 * 2. Redirect to Google OAuth with nonce
 * 3. Get ZK proof from Enoki (public)
 * 4. Sign transactions with zkLogin signature
 * 
 * Note: Gas sponsorship requires backend/private key, so users need testnet SUI.
 * For production, run sponsorship endpoints server-side.
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64, toB64 } from '@mysten/bcs';
import { Transaction } from '@mysten/sui/transactions';
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  getZkLoginSignature,
  jwtToAddress,
  genAddressSeed,
} from '@mysten/sui/zklogin';

const NETWORK = 'testnet';
const ENOKI_API = 'https://api.enoki.mystenlabs.com/v1';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID || '';
const REDIRECT_URL = import.meta.env.VITE_OAUTH_REDIRECT_URL || 'http://localhost:5173/auth';

const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

export interface ZkLoginSession {
  ephemeralPrivateKey: string;  // base64
  ephemeralPublicKey: string;   // base64
  maxEpoch: number;
  randomness: string;           // base64
  jwt: string;
  salt: string;                 // decimal string
  address: string;              // 0x...
  proof: {
    proofPoints: { a: string[]; b: string[][]; c: string[] };
    issBase64Details: { value: string; indexMod4: number };
    headerBase64: string;
  };
}

const SESSION_KEY = 'DROP_KIT_ZKLOGIN_SESSION';
const EPHEMERAL_KEY = 'DROP_KIT_ZKLOGIN_EPHEMERAL';

// ============================================================================
// Session Management
// ============================================================================

export function getZkLoginSession(): ZkLoginSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveZkLoginSession(session: ZkLoginSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearZkLoginSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(EPHEMERAL_KEY);
}

export function isZkLoginSessionValid(): boolean {
  const session = getZkLoginSession();
  if (!session) return false;
  
  // Check if session has expired (simple check - could add epoch validation)
  try {
    const jwtPayload = JSON.parse(atob(session.jwt.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return jwtPayload.exp > now;
  } catch {
    return false;
  }
}

// ============================================================================
// OAuth Flow - Step 1: Start Login
// ============================================================================

export async function startGoogleLogin(): Promise<void> {
  try {
    // 1. Generate ephemeral keypair
    const ephemeralKeypair = new Ed25519Keypair();
    const ephemeralPrivateKey = toB64(ephemeralKeypair.export().privateKey);
    const ephemeralPublicKeyBytes = ephemeralKeypair.getPublicKey().toRawBytes();
    const ephemeralPublicKey = toB64(ephemeralPublicKeyBytes);

    console.log('🔑 Generated ephemeral keypair');

    // 2. Get nonce from Enoki (public endpoint - no auth required)
    const nonceResponse = await fetch(`${ENOKI_API}/zklogin/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        network: NETWORK,
        ephemeralPublicKey,
        additionalEpochs: 2, // Valid for ~2 epochs (~2 days on testnet)
      }),
    });

    if (!nonceResponse.ok) {
      throw new Error(`Failed to get nonce: ${nonceResponse.statusText}`);
    }

    const nonceData = await nonceResponse.json();
    const { nonce, randomness, maxEpoch } = nonceData.data;

    if (!nonce || !randomness || !maxEpoch) {
      throw new Error('Invalid nonce response from Enoki');
    }

    console.log('✓ Got nonce from Enoki:', { maxEpoch });

    // 3. Store ephemeral key data for after redirect
    sessionStorage.setItem(EPHEMERAL_KEY, JSON.stringify({
      ephemeralPrivateKey,
      ephemeralPublicKey,
      randomness,
      maxEpoch,
      nonce,
    }));

    // 4. Redirect to Google OAuth with zkLogin nonce
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URL);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('nonce', nonce);

    console.log('🔄 Redirecting to Google OAuth...');
    window.location.href = authUrl.toString();
  } catch (error) {
    console.error('❌ Failed to start Google login:', error);
    throw error;
  }
}

// ============================================================================
// OAuth Flow - Step 2: Complete Login After Redirect
// ============================================================================

export async function completeGoogleLogin(): Promise<ZkLoginSession> {
  try {
    // 1. Extract JWT from URL fragment
    const params = new URLSearchParams(
      window.location.hash.replace('#', '') || window.location.search.replace('?', '')
    );
    const jwt = params.get('id_token');
    
    if (!jwt) {
      throw new Error('Missing id_token in OAuth redirect. Check Google Client ID configuration.');
    }

    console.log('✓ Got JWT from Google');

    // 2. Retrieve ephemeral key data
    const ephemeralRaw = sessionStorage.getItem(EPHEMERAL_KEY);
    if (!ephemeralRaw) {
      throw new Error('Missing ephemeral key data. OAuth flow was not properly started.');
    }

    const {
      ephemeralPrivateKey,
      ephemeralPublicKey,
      randomness,
      maxEpoch,
    } = JSON.parse(ephemeralRaw);

    // 3. Get salt and address from Enoki (public endpoint)
    const zkLoginResponse = await fetch(`${ENOKI_API}/zklogin`, {
      method: 'GET',
      headers: {
        'zklogin-jwt': jwt,
      },
    });

    if (!zkLoginResponse.ok) {
      throw new Error(`Failed to get salt/address: ${zkLoginResponse.statusText}`);
    }

    const zkLoginData = await zkLoginResponse.json();
    const { salt, address } = zkLoginData.data;

    if (!salt || !address) {
      throw new Error('Invalid salt/address response from Enoki');
    }

    console.log('✓ Got salt and address:', { address: address.slice(0, 10) + '...' });

    // 4. Request ZK proof from Enoki (public endpoint)
    const proofResponse = await fetch(`${ENOKI_API}/zklogin/zkp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'zklogin-jwt': jwt,
      },
      body: JSON.stringify({
        network: NETWORK,
        ephemeralPublicKey,
        maxEpoch,
        randomness,
      }),
    });

    if (!proofResponse.ok) {
      throw new Error(`Failed to get ZK proof: ${proofResponse.statusText}`);
    }

    const proofData = await proofResponse.json();
    const proof = proofData.data;

    if (!proof?.proofPoints || !proof?.headerBase64 || !proof?.issBase64Details) {
      throw new Error('Invalid proof response from Enoki');
    }

    console.log('✓ Got ZK proof from Enoki');

    // 5. Create and save session
    const session: ZkLoginSession = {
      ephemeralPrivateKey,
      ephemeralPublicKey,
      maxEpoch,
      randomness,
      jwt,
      salt,
      address,
      proof,
    };

    saveZkLoginSession(session);
    sessionStorage.removeItem(EPHEMERAL_KEY);

    console.log('✅ zkLogin session created successfully');
    return session;
  } catch (error) {
    console.error('❌ Failed to complete Google login:', error);
    clearZkLoginSession();
    throw error;
  }
}

// ============================================================================
// Transaction Signing with zkLogin
// ============================================================================

export async function signAndExecuteWithZkLogin(
  transaction: Transaction
): Promise<{ digest: string }> {
  const session = getZkLoginSession();
  if (!session) {
    throw new Error('No zkLogin session found. Please log in first.');
  }

  if (!isZkLoginSessionValid()) {
    throw new Error('zkLogin session expired. Please log in again.');
  }

  try {
    console.log('📝 Building transaction...');

    // 1. Set sender
    transaction.setSender(session.address);

    // 2. Build transaction bytes
    const { bytes, signature: _, ...txData } = await transaction.build({ client });

    console.log('✓ Transaction built');

    // 3. Sign with ephemeral key
    const ephemeralKeypair = Ed25519Keypair.fromSecretKey(
      fromB64(session.ephemeralPrivateKey)
    );

    const { signature: ephemeralSignature } = await ephemeralKeypair.signTransaction(bytes);

    console.log('✓ Signed with ephemeral key');

    // 4. Parse JWT to get sub and aud for address seed
    const jwtPayload = JSON.parse(atob(session.jwt.split('.')[1]));
    const { sub, aud } = jwtPayload;

    // 5. Generate address seed (must match how Enoki computed the address)
    const addressSeed = genAddressSeed(
      BigInt(session.salt),
      'sub',
      sub,
      aud
    ).toString();

    console.log('✓ Generated address seed');

    // 6. Compose zkLogin signature
    const zkLoginSignature = getZkLoginSignature({
      inputs: {
        ...session.proof,
        addressSeed,
      },
      maxEpoch: session.maxEpoch,
      userSignature: ephemeralSignature,
    });

    console.log('✓ Composed zkLogin signature');

    // 7. Execute transaction
    const result = await client.executeTransactionBlock({
      transactionBlock: bytes,
      signature: zkLoginSignature,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    if (result.effects?.status?.status !== 'success') {
      throw new Error(
        `Transaction failed: ${result.effects?.status?.error || 'Unknown error'}`
      );
    }

    console.log('✅ Transaction executed:', result.digest);
    return { digest: result.digest };
  } catch (error: any) {
    console.error('❌ Transaction failed:', error);
    throw new Error(error.message || 'Failed to execute transaction');
  }
}

// ============================================================================
// Helper: Check if Google OAuth is configured
// ============================================================================

export function isGoogleOAuthConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && REDIRECT_URL);
}
