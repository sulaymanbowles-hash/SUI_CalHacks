import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, ShoppingBag } from 'lucide-react';
import { TicketCard } from '../components/TicketCard';
import { ListModal } from '../components/ListModal';
import { QRDrawer } from '../components/QRDrawer';
import { TransferModal } from '../components/TransferModal';
import { FadeRise } from '../components/FadeRise';

type TicketStatus = 'owned' | 'listed' | 'used' | 'transferred';
type TabFilter = 'upcoming' | 'listed' | 'past';

interface Ticket {
  id: string;
  title: string;
  posterUrl: string;
  dateISO: string;
  venue: string;
  seat: { section?: string; row?: string; seat?: string };
  status: TicketStatus;
  policyObjectId: string;
  purchaseTx: string;
  royaltyPct: number;
  organizerPct: number;
  networkFeeAtBuy: number;
  listing?: {
    priceSUI: number;
    createdAtISO: string;
    kioskId: string;
    listingId: string;
  };
}

// Mock data - replace with real on-chain queries
const MOCK_TICKETS: Ticket[] = [
  {
    id: '0x8a1b2c3d4e5f6789',
    title: 'Nova Festival 2025',
    posterUrl: '',
    dateISO: '2025-06-22T18:00:00Z',
    venue: 'Zilker Park, Austin',
    seat: { section: 'C', row: '14', seat: '7' },
    status: 'owned',
    policyObjectId: '0x4b3a2c1d0e9f8765',
    purchaseTx: '0x7c8b9a0d1e2f3456',
    royaltyPct: 0.10,
    organizerPct: 0.08,
    networkFeeAtBuy: 0.03,
  },
  {
    id: '0x91c2d3e4f5a6b789',
    title: 'Glasshouse Sessions',
    posterUrl: '',
    dateISO: '2025-07-08T20:00:00Z',
    venue: 'The Chapel, SF',
    seat: { section: 'A', row: '5', seat: '12' },
    status: 'listed',
    policyObjectId: '0x5c4b3a2d1e0f9876',
    purchaseTx: '0x8d9c0a1b2e3f4567',
    royaltyPct: 0.10,
    organizerPct: 0.08,
    networkFeeAtBuy: 0.03,
    listing: {
      priceSUI: 35.5,
      createdAtISO: '2025-10-20T10:30:00Z',
      kioskId: '0x6d5e4f3a2b1c0987',
      listingId: '0x9e8f7a6b5c4d3210',
    },
  },
  {
    id: '0x7c2d3e4f5a6b1234',
    title: 'Ambient Nights #13',
    posterUrl: '',
    dateISO: '2025-08-01T21:30:00Z',
    venue: "Baby's All Right, Brooklyn",
    seat: {},
    status: 'used',
    policyObjectId: '0x3a2b1c0d9e8f7654',
    purchaseTx: '0x5d6e7f8a9b0c1234',
    royaltyPct: 0.10,
    organizerPct: 0.08,
    networkFeeAtBuy: 0.03,
  },
];

const SUGGESTED_EVENTS = [
  { title: 'Summer Beats 2025', city: 'Los Angeles', price: 45 },
  { title: 'Indie Rock Night', city: 'Portland', price: 28 },
  { title: 'Electronic Dreams', city: 'Seattle', price: 38 },
];

export function MyTickets() {
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<TabFilter>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalType, setModalType] = useState<'qr' | 'list' | 'transfer' | null>(null);

  // Filter tickets based on tab
  const filteredTickets = MOCK_TICKETS.filter((ticket) => {
    const now = new Date();
    const eventDate = new Date(ticket.dateISO);
    
    switch (activeTab) {
      case 'upcoming':
        return eventDate >= now && ticket.status !== 'used';
      case 'listed':
        return ticket.status === 'listed';
      case 'past':
        return eventDate < now || ticket.status === 'used';
      default:
        return true;
    }
  }).sort((a, b) => {
    // Sort by date ascending for upcoming
    if (activeTab === 'upcoming') {
      return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
    }
    // Sort by date descending for past
    return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
  });

  // Modal handlers
  const handleViewQR = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalType('qr');
  };

  const handleList = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalType('list');
  };

  const handleCancelListing = async (ticket: Ticket) => {
    console.log('Cancel listing:', ticket.id);
    // TODO: Implement cancel listing logic
  };

  const handleTransfer = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalType('transfer');
  };

  const handleDetails = (ticket: Ticket) => {
    console.log('Show details:', ticket.id);
    // TODO: Implement details drawer
  };

  const handleListSubmit = async (ticketId: string, price: number) => {
    console.log('List ticket:', ticketId, price);
    // TODO: Implement listing logic
  };

  const handleTransferSubmit = async (ticketId: string, recipient: string) => {
    console.log('Transfer ticket:', ticketId, recipient);
    // TODO: Implement transfer logic
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedTicket(null);
  };

  // Wallet disconnected state
  if (!account) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-vignette noise">
        <div className="mx-auto flex min-h-[80vh] max-w-screen-xl items-center justify-center px-6">
          <div className="card max-w-md text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
              <TicketIcon className="h-8 w-8 text-[#4DA2FF]" />
            </div>
            <h2 className="mb-3 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
              Connect wallet to continue
            </h2>
            <p className="text-[var(--muted)]">
              Connect your Sui wallet to view your tickets and manage listings.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Empty state
  if (MOCK_TICKETS.length === 0) {
    return (
      <main className="min-h-screen py-12">
        <div className="mx-auto max-w-screen-xl px-6">
          <FadeRise>
            <div className="mb-12 text-center">
              <h1 className="font-[Inter_Tight] text-4xl tracking-tight text-[#DCE7F0]">
                My Tickets
              </h1>
            </div>
          </FadeRise>

          <FadeRise delay={0.1}>
            <div className="card mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
                <TicketIcon className="h-8 w-8 text-[#4DA2FF]" />
              </div>
              <h2 className="mb-3 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
                No tickets yet
              </h2>
              <p className="mb-8 text-[var(--muted)]">
                Browse upcoming events and purchase your first ticket.
              </p>
              <a
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4DA2FF] px-6 py-3 font-medium text-white transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                <ShoppingBag className="h-5 w-5" />
                Browse Events
              </a>
            </div>
          </FadeRise>

          {/* Suggested events */}
          <FadeRise delay={0.2}>
            <div className="mt-12">
              <h3 className="mb-6 text-center text-lg font-medium text-[#DCE7F0]">
                Upcoming events you might like
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {SUGGESTED_EVENTS.map((event, i) => (
                  <motion.a
                    key={event.title}
                    href="/app"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.28 }}
                    className="card group overflow-hidden p-4 transition-transform duration-200 hover:scale-[1.01]"
                  >
                    <h4 className="font-medium text-[#DCE7F0]">{event.title}</h4>
                    <p className="mt-1 text-sm text-[var(--muted)]">{event.city}</p>
                    <p className="mt-2 tabular-nums text-sm text-[#4DA2FF]">
                      From ${event.price}
                    </p>
                  </motion.a>
                ))}
              </div>
            </div>
          </FadeRise>
        </div>
      </main>
    );
  }

  // Main view with tickets
  return (
    <main className="min-h-screen py-12">
      <div className="mx-auto max-w-screen-xl px-6">
        {/* Header */}
        <FadeRise>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="font-[Inter_Tight] text-4xl tracking-tight text-[#DCE7F0]">
                My Tickets
              </h1>
              <p className="mt-2 text-[var(--muted)]">
                {MOCK_TICKETS.length} {MOCK_TICKETS.length === 1 ? 'ticket' : 'tickets'}
              </p>
            </div>
          </div>
        </FadeRise>

        {/* Tabs */}
        <FadeRise delay={0.1}>
          <div className="mb-8 flex gap-2 border-b border-white/10">
            {(['upcoming', 'listed', 'past'] as TabFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#DCE7F0]'
                    : 'text-[var(--muted)] hover:text-[#DCE7F0]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4DA2FF]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </FadeRise>

        {/* Ticket grid */}
        {filteredTickets.length === 0 ? (
          <FadeRise delay={0.2}>
            <div className="card text-center">
              <p className="text-[var(--muted)]">
                No {activeTab} tickets found.
              </p>
            </div>
          </FadeRise>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.28 }}
              >
                <TicketCard
                  ticket={ticket}
                  onViewQR={handleViewQR}
                  onList={handleList}
                  onCancelListing={handleCancelListing}
                  onTransfer={handleTransfer}
                  onDetails={handleDetails}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalType === 'qr' && selectedTicket && (
        <QRDrawer ticket={selectedTicket} onClose={closeModal} />
      )}
      {modalType === 'list' && selectedTicket && (
        <ListModal
          ticket={selectedTicket}
          onClose={closeModal}
          onList={handleListSubmit}
        />
      )}
      {modalType === 'transfer' && selectedTicket && (
        <TransferModal
          ticket={selectedTicket}
          onClose={closeModal}
          onTransfer={handleTransferSubmit}
        />
      )}
    </main>
  );
}
