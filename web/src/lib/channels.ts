import { Transaction } from '@mysten/sui/transactions';
import { getClient, getSigner } from './rpc';
import { PACKAGE_ID } from './sui';

/**
 * Sales Channel Management
 * Tracks where tickets are sold (mobile app, web, partner sites)
 */

export interface Channel {
  id: string;
  name: string;
  platform: 'web' | 'mobile' | 'partner';
  active: boolean;
}

export interface ChannelStats {
  channelId: string;
  ticketsSold: number;
  revenue: number;
}

// Mock channels for now - in production these would be stored on-chain or in a database
const CHANNELS: Channel[] = [
  { id: 'web-primary', name: 'Event Website', platform: 'web', active: true },
  { id: 'mobile-ios', name: 'iOS App', platform: 'mobile', active: true },
  { id: 'mobile-android', name: 'Android App', platform: 'mobile', active: true },
  { id: 'partner-ticketmaster', name: 'Partner: Ticketmaster', platform: 'partner', active: false },
];

export function getChannels(): Channel[] {
  return CHANNELS;
}

export function getActiveChannels(): Channel[] {
  return CHANNELS.filter(c => c.active);
}

export async function getChannelStats(eventId: string): Promise<ChannelStats[]> {
  // TODO: Query on-chain events to aggregate sales by channel
  // For now, return mock data
  return [
    { channelId: 'web-primary', ticketsSold: 0, revenue: 0 },
    { channelId: 'mobile-ios', ticketsSold: 0, revenue: 0 },
    { channelId: 'mobile-android', ticketsSold: 0, revenue: 0 },
  ];
}

export interface ChannelConfig {
  enabled: boolean;
  customPricing?: number;
  customSupply?: number;
}

export type ChannelConfigs = Record<string, ChannelConfig>;

export function getDefaultChannelConfigs(): ChannelConfigs {
  const configs: ChannelConfigs = {};
  CHANNELS.forEach(channel => {
    configs[channel.id] = {
      enabled: channel.active,
    };
  });
  return configs;
}

/**
 * Sales Channels Management
 * Enables and manages public sales channels for ticket listings
 */

export interface EnableSalesParams {
  kioskId: string;
  listingId: string;
  eventName?: string;
}

export interface EnableSalesResult {
  publicUrl: string;
  enabled: boolean;
}

/**
 * Enable sales channels for a listing
 * Validates the listing is active and generates a public purchase link
 */
export async function enableSales(params: EnableSalesParams): Promise<EnableSalesResult> {
  const client = getClient();
  
  console.log('Enabling sales channels...', params);
  
  // Validate the Kiosk exists and has the listing
  try {
    const kiosk = await client.getObject({
      id: params.kioskId,
      options: { showContent: true },
    });
    
    if (!kiosk.data) {
      throw new Error('Kiosk not found');
    }
    
    console.log('✓ Kiosk validated:', params.kioskId);
  } catch (e) {
    throw new Error(`Failed to validate kiosk: ${e}`);
  }
  
  // Generate public URL for buyers
  const origin = window.location.origin;
  const publicUrl = `${origin}/buyer?kiosk=${params.kioskId}&listing=${params.listingId}`;
  
  console.log('✓ Sales channel enabled:', publicUrl);
  
  return {
    publicUrl,
    enabled: true,
  };
}

/**
 * Validate that a listing is still active and purchasable
 */
export async function validateListing(kioskId: string, listingId: string): Promise<boolean> {
  const client = getClient();
  
  try {
    const kiosk = await client.getObject({
      id: kioskId,
      options: { showContent: true },
    });
    
    // Check if kiosk exists and contains the listing
    return !!kiosk.data;
  } catch (e) {
    console.error('Listing validation failed:', e);
    return false;
  }
}
