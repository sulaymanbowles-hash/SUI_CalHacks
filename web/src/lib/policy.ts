import { Transaction } from '@mysten/sui/transactions';
import { getClient, getSigner } from './rpc';
import { PACKAGE_ID, getTicketType } from './sui';

/**
 * Transfer Policy Management
 * Ensures a shared Transfer Policy exists for ticket transfers with enforced royalty splits
 */

export interface PolicyParams {
  artist: string;
  organizer: string;
  platform: string;
  split: {
    artist: number;
    organizer: number;
    platform: number;
  };
}

export interface PolicyResult {
  policyId: string;
  digest?: string;
}

// Check if a global policy ID is set in env
let cachedPolicyId: string | null = null;

export async function ensurePolicy(params: PolicyParams): Promise<PolicyResult> {
  const client = getClient();
  const signer = await getSigner(client);
  
  // Check if we have a cached policy ID
  const envPolicyId = import.meta.env.VITE_POLICY_ID;
  if (envPolicyId) {
    console.log('✓ Using existing policy:', envPolicyId);
    cachedPolicyId = envPolicyId;
    return { policyId: envPolicyId };
  }
  
  if (cachedPolicyId) {
    console.log('✓ Using cached policy:', cachedPolicyId);
    return { policyId: cachedPolicyId };
  }
  
  console.log('Creating new Transfer Policy...', params);
  
  // Create a new Transfer Policy
  const tx = new Transaction();
  
  // Create the policy and cap
  const [policy, policyCap] = tx.moveCall({
    target: '0x2::transfer_policy::new',
    typeArguments: [getTicketType()],
    arguments: [
      tx.object('0x6'), // Publisher object (use package)
    ],
  });
  
  // Add royalty rule
  tx.moveCall({
    target: '0x2::transfer_policy::add_rule',
    typeArguments: [
      getTicketType(),
      '0x2::royalty_rule::Rule', // Royalty rule type
    ],
    arguments: [
      policy,
      policyCap,
      tx.pure.u16(params.split.artist), // basis points (e.g., 9000 = 90%)
      tx.pure.u64(0), // min amount
    ],
  });
  
  // Share the policy
  tx.moveCall({
    target: '0x2::transfer::public_share_object',
    typeArguments: ['0x2::transfer_policy::TransferPolicy<' + getTicketType() + '>'],
    arguments: [policy],
  });
  
  // Transfer the cap to the artist (they control the policy)
  tx.transferObjects([policyCap], params.artist);
  
  tx.setGasBudget(50_000_000);
  
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    options: { 
      showEffects: true, 
      showObjectChanges: true,
    },
  });
  
  if (result.effects?.status?.status !== 'success') {
    throw new Error(`Policy creation failed: ${result.effects?.status?.error}`);
  }
  
  // Extract policy ID
  const policyId = result.objectChanges?.find((c: any) => 
    c.type === 'created' && c.objectType?.includes('::transfer_policy::TransferPolicy')
  )?.objectId as string;
  
  if (!policyId) {
    throw new Error('Failed to extract policy ID from transaction');
  }
  
  console.log('✓ Policy created:', policyId);
  cachedPolicyId = policyId;
  
  return {
    policyId,
    digest: result.digest,
  };
}

/**
 * Validate that a policy exists and is properly configured
 */
export async function validatePolicy(policyId: string): Promise<boolean> {
  const client = getClient();
  
  try {
    const obj = await client.getObject({
      id: policyId,
      options: { showContent: true },
    });
    
    return obj.data?.type?.includes('transfer_policy::TransferPolicy') ?? false;
  } catch (e) {
    console.error('Policy validation failed:', e);
    return false;
  }
}

/**
 * Create a new transfer policy for tickets
 * This is a simplified version that creates a basic transfer policy
 */
export async function createTransferPolicy(params: PolicyParams): Promise<PolicyResult> {
  // Use the ensurePolicy function which handles policy creation
  return ensurePolicy(params);
}
