import { getClient, getTicketType } from './sui';

// Re-export getClient for convenience
export { getClient } from './sui';

/**
 * Simple RPC helper to fetch an object by ID
 */
export async function getObject(objectId: string) {
  const client = getClient();
  
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
  const client = getClient();
  
  try {
    const response = await client.getOwnedObjects({
      owner: address,
      filter: type ? { StructType: type } : undefined,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch owned objects:', error);
    throw error;
  }
}

/**
 * Ticket data structure
 */
export interface OwnedTicket {
  id: string;
  used: boolean;
  classId: string;
  serialNumber: number;
}

/**
 * Query all tickets owned by an address
 * Returns array of ticket objects with their used status
 */
export async function getOwnedTickets(owner: string): Promise<OwnedTicket[]> {
  const client = getClient();
  
  try {
    const response = await client.getOwnedObjects({
      owner,
      filter: { StructType: getTicketType() },
      options: {
        showContent: true,
        showType: true,
      },
    });
    
    const tickets: OwnedTicket[] = [];
    
    for (const item of response.data) {
      if (!item.data) continue;
      
      const content = (item.data as any).content;
      if (!content?.fields) continue;
      
      tickets.push({
        id: item.data.objectId,
        used: content.fields.used || false,
        classId: content.fields.class_id || '',
        serialNumber: parseInt(content.fields.serial_number || '0'),
      });
    }
    
    return tickets;
  } catch (error) {
    console.error('Failed to fetch owned tickets:', error);
    return [];
  }
}
