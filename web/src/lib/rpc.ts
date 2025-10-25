import { SuiClient } from '@mysten/sui/client';
import { RPC_URL } from './env';

// Initialize Sui client
export const client = new SuiClient({ url: RPC_URL });

/**
 * Simple RPC helper to fetch an object by ID
 */
export async function getObject(objectId: string) {
  try {
    const response = await client.getObject({
      id: objectId,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch object:', error);
    throw error;
  }
}

/**
 * Get owned objects by address and type
 */
export async function getOwnedObjects(address: string, type?: string) {
  try {
    const response = await client.getOwnedObjects({
      owner: address,
      filter: type ? { StructType: type } : undefined,
      options: {
        showContent: true,
        showType: true,
      },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch owned objects:', error);
    throw error;
  }
}
