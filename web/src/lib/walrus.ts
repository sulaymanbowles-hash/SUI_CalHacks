/**
 * Walrus integration for decentralized file storage
 */
import { WALRUS_PUBLISHER_URL, WALRUS_AGGREGATOR_URL } from './env';

export interface WalrusUploadResult {
  blobId: string;
  url: string;
}

/**
 * Upload a file to Walrus
 * @param file - File or Blob to upload
 * @returns Blob ID (CID) on success
 */
export async function walrusUpload(file: File | Blob): Promise<string> {
  console.log('Uploading to Walrus...', {
    size: file.size,
    type: file.type,
    publisher: WALRUS_PUBLISHER_URL,
  });
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/store`, {
      method: 'PUT',
      body: file, // Walrus expects raw binary, not FormData
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          'Walrus authentication failed. Configure WALRUS_API_TOKEN or paste CID manually.'
        );
      }
      
      throw new Error(`Walrus upload failed (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    // Extract blob ID from response
    // Walrus response format: { newlyCreated: { blobObject: { blobId: "..." } } }
    const blobId = 
      result?.newlyCreated?.blobObject?.blobId ||
      result?.alreadyCertified?.blobId ||
      result?.blobId;
    
    if (!blobId) {
      console.error('Unexpected Walrus response:', result);
      throw new Error('Blob ID not found in Walrus response');
    }
    
    console.log('✓ Uploaded to Walrus:', blobId);
    return blobId;
    
  } catch (error: any) {
    console.error('Walrus upload error:', error);
    throw error;
  }
}

/**
 * Get Walrus blob URL for retrieval
 */
export function getWalrusUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URL}/v1/${blobId}`;
}

/**
 * Format blob ID as walrus:// URI for storage
 */
export function toWalrusUri(blobId: string): string {
  return `walrus://${blobId}`;
}

/**
 * Parse walrus:// URI to get blob ID
 */
export function fromWalrusUri(uri: string): string | null {
  const match = uri.match(/^walrus:\/\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Check if a string is a valid Walrus URI
 */
export function isWalrusUri(uri: string): boolean {
  return /^walrus:\/\/.+$/.test(uri);
}
