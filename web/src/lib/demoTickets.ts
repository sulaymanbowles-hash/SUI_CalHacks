/**
 * Demo Ticket Store
 * Lightweight state management for demo mode with all ticket states
 */

export type TicketState = 'UPCOMING' | 'LISTED' | 'PAST_ATTENDED' | 'PAST_NO_SHOW';
export type EventCategory = 'music' | 'sports' | 'arts' | 'comedy' | 'conference' | 'theater' | 'festival';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AttendanceBadge {
  holder: string;
  eventId: string;
  ticketId: string;
  stampEpoch: number;
  stampedAt: string; // ISO timestamp for display
  rarity?: BadgeRarity;
  metadata?: {
    checkInOrder?: number; // e.g., "23rd person to check in"
    specialAttribute?: string; // e.g., "Early Bird", "VIP", "Front Row"
    artistSigned?: boolean;
    collectionId?: string; // Link to artist collection
  };
}

export interface ArtistCollection {
  id: string;
  artistName: string;
  description: string;
  totalEvents: number;
  badgesEarned: number;
  badges: AttendanceBadge[];
  completionPercentage: number;
  specialRewards?: string[];
}

export interface TicketPolicy {
  antiScalp?: boolean;
  msrp?: number; // Baseline price in SUI
  transferable?: boolean;
  resaleRoyalty?: number; // Percentage as decimal (0.1 = 10%)
  soulbound?: boolean; // Non-transferable after first use
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
  category?: EventCategory;
  policy: TicketPolicy;
  listing?: TicketListing;
  badge?: AttendanceBadge;
  purchasePrice?: number;
  purchaseDate?: string;
  coverImage?: string;
}

/**
 * Demo ticket seeds showing all states and scenarios with diverse event types
 */
export const DEMO_TICKETS: DemoTicket[] = [
  // UPCOMING TICKETS - Diverse event types
  
  // Music Festival
  {
    id: '0xdemo_upcoming_1',
    eventId: '0xevent_nova',
    title: 'Nova Festival 2025',
    artist: 'Daft Punk, Deadmau5, Porter Robinson',
    venue: 'Zilker Park',
    city: 'Austin, TX',
    start: '2025-06-22T18:00:00Z',
    time: '6:00 PM',
    serialNumber: 42,
    section: 'General Admission',
    category: 'festival',
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
  
  // Intimate Concert
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
    category: 'music',
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

  // Electronic Music VIP
  {
    id: '0xdemo_upcoming_3',
    eventId: '0xevent_summit',
    title: 'Electronic Summit 2025',
    artist: 'Neon Pulse, Crystal Method, ODESZA',
    venue: 'Warehouse District',
    city: 'Brooklyn, NY',
    start: '2025-11-15T21:00:00Z',
    time: '9:00 PM',
    serialNumber: 7,
    section: 'VIP',
    category: 'music',
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

  // Basketball Game
  {
    id: '0xdemo_upcoming_4',
    eventId: '0xevent_warriors',
    title: 'Warriors vs Lakers',
    artist: 'Golden State Warriors',
    venue: 'Chase Center',
    city: 'San Francisco, CA',
    start: '2025-11-28T19:30:00Z',
    time: '7:30 PM',
    serialNumber: 2341,
    section: 'Section 114',
    row: 'M',
    seat: '8',
    category: 'sports',
    state: 'UPCOMING',
    policy: {
      antiScalp: true,
      msrp: 4.2,
      transferable: true,
      resaleRoyalty: 0.12,
    },
    purchasePrice: 4.2,
    purchaseDate: '2025-10-01T11:00:00Z',
  },

  // Tech Conference
  {
    id: '0xdemo_upcoming_5',
    eventId: '0xevent_devcon',
    title: 'DevCon 2025 - Web3 Future',
    venue: 'Moscone Center',
    city: 'San Francisco, CA',
    start: '2025-12-05T09:00:00Z',
    time: '9:00 AM',
    serialNumber: 891,
    section: 'Main Hall',
    category: 'conference',
    state: 'UPCOMING',
    policy: {
      antiScalp: true,
      msrp: 3.8,
      transferable: false,
      resaleRoyalty: 0.05,
      soulbound: true,
    },
    purchasePrice: 3.8,
    purchaseDate: '2025-09-20T14:30:00Z',
  },

  // Broadway Show
  {
    id: '0xdemo_upcoming_6',
    eventId: '0xevent_hamilton',
    title: 'Hamilton - The Musical',
    artist: 'Original Broadway Cast',
    venue: 'Richard Rodgers Theatre',
    city: 'New York, NY',
    start: '2025-12-15T20:00:00Z',
    time: '8:00 PM',
    serialNumber: 156,
    section: 'Orchestra',
    row: 'J',
    seat: '14',
    category: 'theater',
    state: 'UPCOMING',
    policy: {
      antiScalp: true,
      msrp: 6.5,
      transferable: true,
      resaleRoyalty: 0.15,
    },
    purchasePrice: 6.5,
    purchaseDate: '2025-10-10T10:00:00Z',
  },

  // Art Exhibition
  {
    id: '0xdemo_upcoming_7',
    eventId: '0xevent_moma',
    title: 'Digital Renaissance Exhibition',
    artist: 'Various NFT Artists',
    venue: 'MoMA',
    city: 'New York, NY',
    start: '2025-11-30T10:00:00Z',
    time: '10:00 AM',
    serialNumber: 445,
    section: 'VIP Preview',
    category: 'arts',
    state: 'UPCOMING',
    policy: {
      antiScalp: false,
      msrp: 1.2,
      transferable: true,
      resaleRoyalty: 0.2,
    },
    purchasePrice: 1.2,
    purchaseDate: '2025-10-15T16:00:00Z',
  },

  // Rock Concert
  {
    id: '0xdemo_upcoming_8',
    eventId: '0xevent_foo',
    title: 'Foo Fighters World Tour',
    artist: 'Foo Fighters',
    venue: 'Red Rocks Amphitheatre',
    city: 'Morrison, CO',
    start: '2025-12-20T19:00:00Z',
    time: '7:00 PM',
    serialNumber: 1823,
    section: 'Reserved',
    row: 'D',
    seat: '22',
    category: 'music',
    state: 'UPCOMING',
    policy: {
      antiScalp: true,
      msrp: 3.2,
      transferable: true,
      resaleRoyalty: 0.1,
    },
    purchasePrice: 3.2,
    purchaseDate: '2025-09-25T12:00:00Z',
  },

  // LISTED TICKETS

  // Listed - Indie Rock
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
    category: 'music',
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

  // Listed - Acoustic (below baseline)
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
    category: 'music',
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

  // Listed - Soccer Match
  {
    id: '0xdemo_listed_3',
    eventId: '0xevent_soccer',
    title: 'MLS Cup Final 2025',
    artist: 'LA Galaxy vs Seattle Sounders',
    venue: 'SoFi Stadium',
    city: 'Los Angeles, CA',
    start: '2025-12-10T17:00:00Z',
    time: '5:00 PM',
    serialNumber: 3421,
    section: 'Club Level',
    row: 'B',
    seat: '16',
    category: 'sports',
    state: 'LISTED',
    policy: {
      antiScalp: true,
      msrp: 5.5,
      transferable: true,
      resaleRoyalty: 0.1,
    },
    listing: {
      price: 7.2,
      listedAt: '2025-10-18T09:30:00Z',
      views: 45,
      offers: 5,
    },
    purchasePrice: 5.5,
    purchaseDate: '2025-08-30T15:00:00Z',
  },
  
  // PAST - ATTENDED (with soulbound badges)
  
  // Retrowave with rare badge
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
    category: 'music',
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
      rarity: 'rare',
      metadata: {
        checkInOrder: 23,
        specialAttribute: 'Early Bird',
        collectionId: 'synthwave_collective',
      },
    },
    purchasePrice: 1.5,
    purchaseDate: '2025-09-01T12:00:00Z',
  },

  // Comedy with common badge
  {
    id: '0xdemo_past_attended_2',
    eventId: '0xevent_comedy',
    title: 'Comedy Underground',
    artist: 'Dave Chappelle, Ali Wong',
    venue: 'Punch Line',
    city: 'San Francisco, CA',
    start: '2025-10-08T20:00:00Z',
    time: '8:00 PM',
    serialNumber: 34,
    section: 'Front Row',
    category: 'comedy',
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
      rarity: 'common',
      metadata: {
        checkInOrder: 156,
        specialAttribute: 'Front Row',
      },
    },
    purchasePrice: 0.8,
    purchaseDate: '2025-09-28T16:30:00Z',
  },

  // Hip Hop Concert with legendary badge
  {
    id: '0xdemo_past_attended_3',
    eventId: '0xevent_hiphop',
    title: 'Kendrick Lamar: The Big Steppers',
    artist: 'Kendrick Lamar',
    venue: 'Madison Square Garden',
    city: 'New York, NY',
    start: '2025-09-28T20:00:00Z',
    time: '8:00 PM',
    serialNumber: 4567,
    section: 'Floor',
    row: 'AA',
    seat: '5',
    category: 'music',
    state: 'PAST_ATTENDED',
    policy: {
      antiScalp: true,
      msrp: 4.8,
      transferable: true,
      resaleRoyalty: 0.15,
      soulbound: true,
    },
    badge: {
      holder: '0xa1b2c3d4e5f6',
      eventId: '0xevent_hiphop',
      ticketId: '0xdemo_past_attended_3',
      stampEpoch: 1727557200,
      stampedAt: '2025-09-28T20:20:00Z',
      rarity: 'legendary',
      metadata: {
        checkInOrder: 1,
        specialAttribute: 'First to Check In',
        artistSigned: true,
        collectionId: 'kendrick_lamar',
      },
    },
    purchasePrice: 4.8,
    purchaseDate: '2025-07-15T11:00:00Z',
  },

  // Tennis Match with epic badge
  {
    id: '0xdemo_past_attended_4',
    eventId: '0xevent_tennis',
    title: 'US Open Finals 2025',
    artist: 'Tennis - Grand Slam Final',
    venue: 'Arthur Ashe Stadium',
    city: 'New York, NY',
    start: '2025-09-10T16:00:00Z',
    time: '4:00 PM',
    serialNumber: 8923,
    section: 'Lower Bowl',
    row: 'R',
    seat: '34',
    category: 'sports',
    state: 'PAST_ATTENDED',
    policy: {
      antiScalp: true,
      msrp: 8.5,
      transferable: true,
      resaleRoyalty: 0.1,
    },
    badge: {
      holder: '0xa1b2c3d4e5f6',
      eventId: '0xevent_tennis',
      ticketId: '0xdemo_past_attended_4',
      stampEpoch: 1725984000,
      stampedAt: '2025-09-10T16:30:00Z',
      rarity: 'epic',
      metadata: {
        checkInOrder: 456,
        specialAttribute: 'Championship Match',
      },
    },
    purchasePrice: 8.5,
    purchaseDate: '2025-06-20T09:00:00Z',
  },

  // EDM Festival with rare badge
  {
    id: '0xdemo_past_attended_5',
    eventId: '0xevent_edm',
    title: 'Electric Daisy Carnival',
    artist: 'Tiësto, Armin van Buuren, Carl Cox',
    venue: 'Las Vegas Motor Speedway',
    city: 'Las Vegas, NV',
    start: '2025-05-17T19:00:00Z',
    time: '7:00 PM',
    serialNumber: 12456,
    section: 'General Admission',
    category: 'festival',
    state: 'PAST_ATTENDED',
    policy: {
      antiScalp: true,
      msrp: 3.2,
      transferable: true,
      resaleRoyalty: 0.12,
    },
    badge: {
      holder: '0xa1b2c3d4e5f6',
      eventId: '0xevent_edm',
      ticketId: '0xdemo_past_attended_5',
      stampEpoch: 1715972400,
      stampedAt: '2025-05-17T19:25:00Z',
      rarity: 'rare',
      metadata: {
        checkInOrder: 892,
        specialAttribute: '3-Day Survivor',
        collectionId: 'edc_collection',
      },
    },
    purchasePrice: 3.2,
    purchaseDate: '2025-02-10T10:00:00Z',
  },

  // Rock Festival with rare badge
  {
    id: '0xdemo_past_attended_6',
    eventId: '0xevent_rock',
    title: 'Coachella Valley Music Festival',
    artist: 'Radiohead, The Strokes, Arctic Monkeys',
    venue: 'Empire Polo Club',
    city: 'Indio, CA',
    start: '2025-04-12T12:00:00Z',
    time: '12:00 PM',
    serialNumber: 8734,
    section: 'Weekend 1 - GA',
    category: 'festival',
    state: 'PAST_ATTENDED',
    policy: {
      antiScalp: true,
      msrp: 4.5,
      transferable: true,
      resaleRoyalty: 0.1,
    },
    badge: {
      holder: '0xa1b2c3d4e5f6',
      eventId: '0xevent_rock',
      ticketId: '0xdemo_past_attended_6',
      stampEpoch: 1712923200,
      stampedAt: '2025-04-12T12:30:00Z',
      rarity: 'rare',
      metadata: {
        checkInOrder: 3421,
        specialAttribute: 'Weekend 1 Veteran',
        collectionId: 'coachella_collection',
      },
    },
    purchasePrice: 4.5,
    purchaseDate: '2025-01-15T10:00:00Z',
  },
  
  // PAST - NO SHOW
  
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
    category: 'music',
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

  {
    id: '0xdemo_past_noshow_2',
    eventId: '0xevent_folk',
    title: 'Folk & Roots Festival',
    artist: 'Mumford & Sons, The Lumineers',
    venue: 'Golden Gate Park',
    city: 'San Francisco, CA',
    start: '2025-09-12T14:00:00Z',
    time: '2:00 PM',
    serialNumber: 412,
    section: 'General Admission',
    category: 'festival',
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
 * Artist Collections - Track attendance across multiple events by the same artist
 */
export const ARTIST_COLLECTIONS: ArtistCollection[] = [
  {
    id: 'kendrick_lamar',
    artistName: 'Kendrick Lamar',
    description: 'Collect badges from Kendrick Lamar performances',
    totalEvents: 5,
    badgesEarned: 1,
    badges: DEMO_TICKETS.filter(t => t.badge?.metadata?.collectionId === 'kendrick_lamar').map(t => t.badge!),
    completionPercentage: 20,
    specialRewards: ['Complete 3/5 for exclusive merch', 'Complete 5/5 for backstage pass NFT'],
  },
  {
    id: 'synthwave_collective',
    artistName: 'Synthwave Collective',
    description: 'Retro-futuristic concert series',
    totalEvents: 8,
    badgesEarned: 1,
    badges: DEMO_TICKETS.filter(t => t.badge?.metadata?.collectionId === 'synthwave_collective').map(t => t.badge!),
    completionPercentage: 12.5,
    specialRewards: ['Complete 4/8 for limited edition vinyl NFT', 'Complete 8/8 for VIP lifetime access'],
  },
  {
    id: 'edc_collection',
    artistName: 'Electric Daisy Carnival',
    description: 'Annual EDM mega-festival collection',
    totalEvents: 10,
    badgesEarned: 1,
    badges: DEMO_TICKETS.filter(t => t.badge?.metadata?.collectionId === 'edc_collection').map(t => t.badge!),
    completionPercentage: 10,
    specialRewards: ['Complete 5/10 for VIP upgrade next year', 'Complete 10/10 for lifetime pass'],
  },
  {
    id: 'coachella_collection',
    artistName: 'Coachella Valley Music Festival',
    description: 'Legendary desert festival attendance',
    totalEvents: 6,
    badgesEarned: 1,
    badges: DEMO_TICKETS.filter(t => t.badge?.metadata?.collectionId === 'coachella_collection').map(t => t.badge!),
    completionPercentage: 16.7,
    specialRewards: ['Complete 3/6 for artist meet & greet access', 'Complete 6/6 for commemorative wristband NFT'],
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
