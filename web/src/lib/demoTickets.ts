/**
 * Demo Ticket Store
 * Lightweight state management for demo mode with all ticket states
 */

export type TicketState = 'UPCOMING' | 'LISTED' | 'PAST_ATTENDED' | 'PAST_NO_SHOW';

export interface AttendanceBadge {
  holder: string;
  eventId: string;
  ticketId: string;
  stampEpoch: number;
  stampedAt: string; // ISO timestamp for display
}

export interface TicketPolicy {
  antiScalp?: boolean;
  msrp?: number; // Baseline price in SUI
  transferable?: boolean;
  resaleRoyalty?: number; // Percentage as decimal (0.1 = 10%)
}

export interface TicketListing {
  price: number;
  listedAt: string;
  views?: number;
  offers?: number;
}

export interface DemoTicket {
  id: string;
  eventId: string;
  title: string;
  artist?: string;
  venue: string;
  city: string;
  start: string; // ISO
  time: string;
  serialNumber: number;
  section?: string;
  row?: string;
  seat?: string;
  state: TicketState;
  policy: TicketPolicy;
  listing?: TicketListing;
  badge?: AttendanceBadge;
  purchasePrice?: number;
  purchaseDate?: string;
}

/**
 * Demo ticket seeds showing all states and scenarios
 */
export const DEMO_TICKETS: DemoTicket[] = [
  // Upcoming with anti-scalp enabled - Music Festival
  {
    id: '0xdemo_upcoming_1',
    eventId: '0xevent_nova',
    title: 'Nova Festival 2025',
    artist: 'Multiple Artists',
    venue: 'Zilker Park',
    city: 'Austin, TX',
    start: '2025-06-22T18:00:00Z',
    time: '6:00 PM',
    serialNumber: 42,
    section: 'General Admission',
    state: 'UPCOMING',
    policy: {
      antiScalp: true,
      msrp: 2.5,
      transferable: true,
      resaleRoyalty: 0.1,
    },
    purchasePrice: 2.5,
    purchaseDate: '2025-03-15T10:30:00Z',
  },
  
  // Upcoming without anti-scalp - Intimate venue
  {
    id: '0xdemo_upcoming_2',
    eventId: '0xevent_glass',
    title: 'Glasshouse Sessions',
    artist: 'Amber Waves',
    venue: 'The Chapel',
    city: 'San Francisco, CA',
    start: '2025-07-08T20:00:00Z',
    time: '8:00 PM',
    serialNumber: 17,
    section: 'Floor',
    row: 'C',
    seat: '12',
    state: 'UPCOMING',
    policy: {
      antiScalp: false,
      msrp: 1.0,
      transferable: true,
      resaleRoyalty: 0.08,
    },
    purchasePrice: 1.0,
    purchaseDate: '2025-06-01T14:20:00Z',
  },

  // Upcoming VIP ticket with high anti-scalp protection
  {
    id: '0xdemo_upcoming_3',
    eventId: '0xevent_summit',
    title: 'Electronic Summit 2025',
    artist: 'Neon Pulse, Crystal Method',
    venue: 'Warehouse District',
    city: 'Brooklyn, NY',
    start: '2025-11-15T21:00:00Z',
    time: '9:00 PM',
    serialNumber: 7,
    section: 'VIP',
    state: 'UPCOMING',
    policy: {
      antiScalp: true,
      msrp: 5.0,
      transferable: true,
      resaleRoyalty: 0.15,
    },
    purchasePrice: 5.0,
    purchaseDate: '2025-09-10T09:00:00Z',
  },

  // Listed ticket - priced above baseline
  {
    id: '0xdemo_listed_1',
    eventId: '0xevent_indie',
    title: 'Indie Rock Night',
    artist: 'The Midnight Owls',
    venue: 'Paradise Rock Club',
    city: 'Boston, MA',
    start: '2025-12-03T20:00:00Z',
    time: '8:00 PM',
    serialNumber: 156,
    section: 'Balcony',
    row: 'A',
    seat: '8',
    state: 'LISTED',
    policy: {
      antiScalp: true,
      msrp: 1.8,
      transferable: true,
      resaleRoyalty: 0.1,
    },
    listing: {
      price: 2.4,
      listedAt: '2025-10-20T16:45:00Z',
      views: 23,
      offers: 2,
    },
    purchasePrice: 1.8,
    purchaseDate: '2025-08-12T11:30:00Z',
  },

  // Listed ticket - below baseline (no anti-scalp tax)
  {
    id: '0xdemo_listed_2',
    eventId: '0xevent_acoustic',
    title: 'Acoustic Evening',
    artist: 'Sarah Chen',
    venue: 'The Mint',
    city: 'Los Angeles, CA',
    start: '2025-11-28T19:30:00Z',
    time: '7:30 PM',
    serialNumber: 91,
    section: 'Table Seating',
    state: 'LISTED',
    policy: {
      antiScalp: true,
      msrp: 2.0,
      transferable: true,
      resaleRoyalty: 0.12,
    },
    listing: {
      price: 1.5,
      listedAt: '2025-10-22T10:15:00Z',
      views: 8,
    },
    purchasePrice: 2.0,
    purchaseDate: '2025-09-05T14:00:00Z',
  },
  
  // Past - Attended with badge (Large venue)
  {
    id: '0xdemo_past_attended_1',
    eventId: '0xevent_retrowave',
    title: 'Retrowave Night',
    artist: 'Synthwave Collective',
    venue: 'The Catalyst',
    city: 'Santa Cruz, CA',
    start: '2025-10-15T21:00:00Z',
    time: '9:00 PM',
    serialNumber: 89,
    section: 'Main Floor',
    state: 'PAST_ATTENDED',
    policy: {
      antiScalp: true,
      msrp: 1.5,
      transferable: true,
      resaleRoyalty: 0.1,
    },
    badge: {
      holder: '0xa1b2c3d4e5f6',
      eventId: '0xevent_retrowave',
      ticketId: '0xdemo_past_attended_1',
      stampEpoch: 1729036800,
      stampedAt: '2025-10-15T21:30:00Z',
    },
    purchasePrice: 1.5,
    purchaseDate: '2025-09-01T12:00:00Z',
  },

  // Past - Attended with badge (Small venue)
  {
    id: '0xdemo_past_attended_2',
    eventId: '0xevent_comedy',
    title: 'Comedy Underground',
    artist: 'Various Comedians',
    venue: 'Punch Line',
    city: 'San Francisco, CA',
    start: '2025-10-08T20:00:00Z',
    time: '8:00 PM',
    serialNumber: 34,
    section: 'Front Row',
    state: 'PAST_ATTENDED',
    policy: {
      antiScalp: false,
      msrp: 0.8,
      transferable: true,
      resaleRoyalty: 0.05,
    },
    badge: {
      holder: '0xa1b2c3d4e5f6',
      eventId: '0xevent_comedy',
      ticketId: '0xdemo_past_attended_2',
      stampEpoch: 1728417600,
      stampedAt: '2025-10-08T20:15:00Z',
    },
    purchasePrice: 0.8,
    purchaseDate: '2025-09-28T16:30:00Z',
  },
  
  // Past - No show (no badge)
  {
    id: '0xdemo_past_noshow_1',
    eventId: '0xevent_jazz',
    title: 'Jazz Under The Stars',
    artist: 'Marcus Williams Quartet',
    venue: 'Rooftop Lounge',
    city: 'Oakland, CA',
    start: '2025-09-20T19:30:00Z',
    time: '7:30 PM',
    serialNumber: 23,
    section: 'Open Seating',
    state: 'PAST_NO_SHOW',
    policy: {
      antiScalp: false,
      msrp: 2.0,
      transferable: true,
      resaleRoyalty: 0.1,
    },
    purchasePrice: 2.0,
    purchaseDate: '2025-08-15T11:00:00Z',
  },

  // Past - No show (missed festival)
  {
    id: '0xdemo_past_noshow_2',
    eventId: '0xevent_folk',
    title: 'Folk & Roots Festival',
    artist: 'Multiple Artists',
    venue: 'Golden Gate Park',
    city: 'San Francisco, CA',
    start: '2025-09-12T14:00:00Z',
    time: '2:00 PM',
    serialNumber: 412,
    section: 'General Admission',
    state: 'PAST_NO_SHOW',
    policy: {
      antiScalp: true,
      msrp: 3.5,
      transferable: true,
      resaleRoyalty: 0.12,
    },
    purchasePrice: 3.5,
    purchaseDate: '2025-07-20T09:45:00Z',
  },
];

/**
 * Hook for fetching attendance badge (Claude will wire to Sui RPC)
 * 
 * @param registryId - The attendance_registry_id from the event
 * @param holder - The wallet address
 * @returns Badge data if stamped, null otherwise
 * 
 * Implementation guide for Claude:
 * ```ts
 * const result = await suiClient.getDynamicFieldObject({
 *   parentId: registryId,
 *   name: { type: 'address', value: holder }
 * });
 * if (result.data) {
 *   return parseBadgeFromDynamicField(result.data);
 * }
 * return null;
 * ```
 */
export async function fetchAttendanceBadge(
  registryId: string,
  holder: string
): Promise<AttendanceBadge | null> {
  // Demo: return mock data
  const demoTicket = DEMO_TICKETS.find(
    t => t.badge?.holder === holder && t.state === 'PAST_ATTENDED'
  );
  return demoTicket?.badge || null;
}

/**
 * Hook for stamping attendance at check-in (Claude will wire to Move PTB)
 * 
 * @param registryId - The attendance_registry_id
 * @param holder - Ticket holder address
 * @param ticketId - The ticket object ID
 * @param operatorCap - Organizer's capability
 * @returns Transaction digest
 * 
 * Implementation guide for Claude:
 * ```ts
 * const txb = new TransactionBlock();
 * // Mark ticket as used
 * txb.moveCall({
 *   target: `${PKG}::ticket::use_ticket`,
 *   arguments: [txb.object(ticketId), txb.object(operatorCap)]
 * });
 * // Stamp badge
 * txb.moveCall({
 *   target: `${PKG}::attendance::stamp_into_registry`,
 *   arguments: [
 *     txb.object(registryId),
 *     txb.pure(holder, 'address'),
 *     txb.pure(ticketId),
 *     txb.object(operatorCap),
 *     txb.object('0x6'), // clock
 *     txb.pure('') // optional metadata
 *   ]
 * });
 * return await signAndExecute(txb);
 * ```
 */
export async function stampAttendance(
  registryId: string,
  holder: string,
  ticketId: string,
  operatorCap: string
): Promise<string> {
  // Demo: just return a fake tx digest
  console.log('Demo: Would stamp attendance', { registryId, holder, ticketId });
  return '0xdemo_tx_stamp';
}
