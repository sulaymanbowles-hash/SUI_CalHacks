/**
 * QR Code Generation Utilities
 * Generates QR codes for tickets with proper encoding
 */

export interface QRCodeData {
  ticketId: string;
  eventId?: string;
  ownerAddress?: string;
  serialNumber?: number;
}

/**
 * Generate QR code data string from ticket information
 */
export function generateTicketQRData(data: QRCodeData): string {
  // Format: dropkit://ticket/{ticketId}?owner={ownerAddress}&serial={serialNumber}
  const baseUrl = `dropkit://ticket/${data.ticketId}`;
  const params = new URLSearchParams();
  
  if (data.ownerAddress) {
    params.append('owner', data.ownerAddress);
  }
  if (data.serialNumber) {
    params.append('serial', data.serialNumber.toString());
  }
  if (data.eventId) {
    params.append('event', data.eventId);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Parse QR code data back into ticket information
 */
export function parseTicketQRData(qrData: string): QRCodeData | null {
  try {
    const url = new URL(qrData);
    if (url.protocol !== 'dropkit:') return null;
    
    const ticketId = url.pathname.replace('/ticket/', '');
    const params = url.searchParams;
    
    return {
      ticketId,
      eventId: params.get('event') || undefined,
      ownerAddress: params.get('owner') || undefined,
      serialNumber: params.has('serial') ? parseInt(params.get('serial')!) : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a verification URL for organizers to scan
 */
export function generateVerificationUrl(ticketId: string, checkInUrl?: string): string {
  const baseUrl = checkInUrl || `${window.location.origin}/checkin`;
  return `${baseUrl}?ticket=${ticketId}`;
}
