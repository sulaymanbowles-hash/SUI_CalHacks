/**
 * My Tickets - Ownership, Listing, Resale
 * Unified view with Active/Listed/Used/Transfers tabs
 * Refined card design with compact layout and actions
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket as TicketIcon,
  QrCode,
  DollarSign,
  Send,
  Edit3,
  X,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
  Calendar,
  MapPin,
  MoreVertical,
  Plus,
  Wallet,
  Download,
  TrendingUp,
  Archive,
} from 'lucide-react';
import { getOwnedTickets, type OwnedTicket } from '../lib/rpc';
import { currentAddress } from '../lib/signer';
import { explorerObj, shortenAddress } from '../lib/explorer';

type Tab = 'all' | 'upcoming' | 'listed' | 'past';

interface TicketListing {
  ticketId: string;
  price: number;
  listedDate: string;
  views?: number;
  floor?: number;
}

// Demo wallet tickets for presentation
const DEMO_TICKETS = [
  {
    id: '0xdemo1',
    eventTitle: 'Nova Festival 2025',
    venue: 'Zilker Park',
    city: 'Austin, TX',
    date: '2025-06-22',
    time: '6:00 PM',
    serialNumber: 42,
    used: false,
    resaleAllowed: true,
  },
  {
    id: '0xdemo2',
    eventTitle: 'Glasshouse Sessions',
    venue: 'The Chapel',
    city: 'San Francisco, CA',
    date: '2025-07-08',
    time: '8:00 PM',
    serialNumber: 17,
    used: false,
    resaleAllowed: true,
  },
];

export function MyTickets() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [tickets, setTickets] = useState<any[]>([]);
  const [listings, setListings] = useState<TicketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [showListSheet, setShowListSheet] = useState<string | null>(null);
  const [listPrice, setListPrice] = useState<number>(50);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const address = currentAddress();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (isInside) {
        setMousePos({
          x: e.clientX / window.innerWidth,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (address && !isDemoMode) {
      loadTickets();
    } else if (isDemoMode) {
      setTimeout(() => {
        setTickets(DEMO_TICKETS);
        setLoading(false);
      }, 600);
    } else {
      setLoading(false);
    }
  }, [address, isDemoMode]);

  async function loadTickets() {
    setLoading(true);
    try {
      const owned = await getOwnedTickets(address);
      setTickets(owned.map(t => ({
        ...t,
        eventTitle: 'Event Ticket',
        venue: 'Venue',
        city: 'City',
        date: new Date().toISOString(),
        time: '8:00 PM',
        resaleAllowed: true,
      })));
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleListForSale = (ticketId: string) => {
    const newListing: TicketListing = {
      ticketId,
      price: listPrice,
      listedDate: new Date().toISOString(),
      floor: listPrice * 0.85,
    };
    setListings([...listings, newListing]);
    setShowListSheet(null);
    setActiveTab('listed');
  };

  const handleDemoWallet = () => {
    setIsDemoMode(true);
    setLoading(true);
  };

  const upcomingTickets = tickets.filter(t => !t.used && !listings.find(l => l.ticketId === t.id));
  const listedTickets = listings.map(l => ({ 
    ...tickets.find(t => t.id === l.ticketId)!, 
    listing: l 
  })).filter(Boolean);
  const pastTickets = tickets.filter(t => t.used);
  
  const allTickets = [...upcomingTickets, ...listedTickets, ...pastTickets];
  const displayTickets = activeTab === 'all' ? allTickets 
    : activeTab === 'upcoming' ? upcomingTickets
    : activeTab === 'listed' ? listedTickets
    : pastTickets;

  const glowX = 50 + (mousePos.x - 0.5) * 3;
  const glowY = 50 + (mousePos.y - 0.5) * 3;

  // No wallet - show connect or demo
  if (!address && !isDemoMode) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#061522] py-12">
        <div className="mx-auto flex min-h-[70vh] max-w-screen-xl items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card max-w-md text-center"
          >
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
              <TicketIcon className="h-8 w-8 text-[#4DA2FF]" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">Connect to view tickets</h2>
            <p className="mb-8 text-white/60">
              Connect your wallet or try a demo to see how ticket management works.
            </p>
            <div className="flex flex-col gap-3">
              <button className="rounded-xl bg-[#4DA2FF] px-6 py-3 font-semibold text-white transition-all hover:bg-[#5DADFF] active:scale-[0.98]">
                Connect Wallet
              </button>
              <button
                onClick={handleDemoWallet}
                className="rounded-xl border border-white/12 bg-white/[0.02] px-6 py-3 font-medium text-white/80 transition-all hover:bg-white/[0.06]"
              >
                Try Demo Wallet
              </button>
            </div>
            <p className="mt-4 text-xs text-white/50">
              Preview how tickets work. You can connect your wallet anytime.
            </p>
          </motion.div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#061522] py-12">
        <div className="mx-auto flex min-h-[70vh] max-w-screen-xl items-center justify-center px-6">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#4DA2FF]" />
            <p className="text-white/60">Loading your tickets...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#061522]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div 
          className="proximity-glow absolute h-[26vmax] w-[26vmax]"
          style={{
            left: `${glowX - 13}%`,
            top: `${glowY - 13}%`,
            background: "radial-gradient(circle, rgba(77,162,255,.3) 0%, transparent 65%)",
            filter: "blur(48px)",
            opacity: 0.06,
            transition: "left 0.5s cubic-bezier(0.23, 1, 0.32, 1), top 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>

      <div className="mx-auto max-w-screen-xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-white">My Tickets</h1>
            <p className="text-white/60">
              {upcomingTickets.length} upcoming • {listedTickets.length} listed • {pastTickets.length} past
            </p>
            {isDemoMode && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#FFB020]/10 px-3 py-1 text-xs font-medium text-[#FFB020]">
                <Sparkles className="h-3 w-3" />
                Demo mode
              </div>
            )}
          </div>
          
          {selectedTickets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-white/60">{selectedTickets.length} selected</span>
              <button className="rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06]">
                List all
              </button>
              <button className="rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06]">
                Transfer
              </button>
              <button
                onClick={() => setSelectedTickets([])}
                className="rounded-xl bg-white/[0.08] p-2 text-white/60 transition-all hover:bg-white/[0.12]"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Tab Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          {(['all', 'upcoming', 'listed', 'past'] as Tab[]).map((tab) => {
            const count = tab === 'all' ? allTickets.length
              : tab === 'upcoming' ? upcomingTickets.length
              : tab === 'listed' ? listedTickets.length
              : pastTickets.length;
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[#4DA2FF]/20 text-[#4DA2FF] ring-2 ring-[#4DA2FF]/30 shadow-[0_0_12px_rgba(77,162,255,0.12)]'
                    : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {count > 0 && <span className="ml-1.5 opacity-60">• {count}</span>}
              </button>
            );
          })}
        </div>

        {/* Tickets List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {displayTickets.length === 0 ? (
              <EmptyState tab={activeTab} onDemoClick={!isDemoMode ? handleDemoWallet : undefined} />
            ) : (
              <div className="space-y-3">
                {displayTickets.map((ticket, i) => (
                  <CompactTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    index={i}
                    isSelected={selectedTickets.includes(ticket.id)}
                    onSelect={(id) => setSelectedTickets(prev => 
                      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
                    )}
                    onShowQR={() => setShowQR(ticket.id)}
                    onList={() => {
                      setListPrice(ticket.listing?.floor || 50);
                      setShowListSheet(ticket.id);
                    }}
                    onCopy={handleCopy}
                    copied={copied}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* QR Drawer */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQR(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-t-3xl border-t border-white/12 bg-white shadow-2xl md:rounded-3xl"
            >
              <button
                onClick={() => setShowQR(null)}
                className="absolute right-4 top-4 z-10 rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="p-8 text-center">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Ticket QR Code</h3>
                <p className="mb-6 text-sm text-gray-600">Show this at venue entrance</p>
                
                {/* Mock QR */}
                <div className="mx-auto mb-6 flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-gray-200 bg-gray-50">
                  <QrCode className="h-32 w-32 text-gray-300" />
                </div>
                
                <div className="mb-4 rounded-xl bg-gray-100 p-3 font-mono text-xs text-gray-600">
                  {shortenAddress(showQR, 12)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                    <Wallet className="h-4 w-4" />
                    Add to Wallet
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Sheet */}
      <AnimatePresence>
        {showListSheet && (() => {
          const ticket = tickets.find(t => t.id === showListSheet);
          const listing = listings.find(l => l.ticketId === showListSheet);
          const isEditing = !!listing;
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowListSheet(null)}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-[#0a1929] shadow-2xl"
              >
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">
                      {isEditing ? 'Manage listing' : 'List for sale'}
                    </h3>
                    <button
                      onClick={() => setShowListSheet(null)}
                      className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Price input */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-white/70">
                        Asking price
                      </label>
                      {listing?.floor && (
                        <span className="text-xs text-white/50">
                          Floor: ${listing.floor}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/60">$</span>
                      <input
                        type="number"
                        value={listPrice}
                        onChange={(e) => setListPrice(Number(e.target.value))}
                        className="h-14 w-full rounded-xl border border-white/12 bg-white/[0.03] pl-10 pr-4 text-2xl font-semibold tabular-nums text-white focus:border-[#4DA2FF]/50 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/20"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <input
                      type="range"
                      value={listPrice}
                      onChange={(e) => setListPrice(Number(e.target.value))}
                      min="10"
                      max="500"
                      step="5"
                      className="mt-3 w-full"
                    />
                  </div>

                  {/* Proceeds preview */}
                  <div className="mb-6 rounded-xl border border-[#4DA2FF]/20 bg-[#4DA2FF]/5 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#4DA2FF]">
                      <TrendingUp className="h-4 w-4" />
                      Proceeds preview
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">You receive</span>
                        <span className="font-semibold tabular-nums text-green-400">${(listPrice * 0.82).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Artist royalty (10%)</span>
                        <span className="tabular-nums text-white/60">${(listPrice * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Organizer fee (8%)</span>
                        <span className="tabular-nums text-white/60">${(listPrice * 0.08).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disclosure */}
                  <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-white/60">
                    Listings auto-expire 24h after event start. Royalties are enforced on every resale.
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setListings(listings.filter(l => l.ticketId !== showListSheet));
                            setShowListSheet(null);
                          }}
                          className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-medium text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          Unlist
                        </button>
                        <button
                          onClick={() => {
                            setListings(listings.map(l => 
                              l.ticketId === showListSheet ? { ...l, price: listPrice } : l
                            ));
                            setShowListSheet(null);
                          }}
                          className="flex-1 rounded-xl bg-[#4DA2FF] px-4 py-3 font-semibold text-white transition-all hover:bg-[#5DADFF] active:scale-[0.98]"
                        >
                          Update price
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowListSheet(null)}
                          className="flex-1 rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 font-medium text-white/80 transition-colors hover:bg-white/[0.06]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleListForSale(showListSheet)}
                          className="flex-1 rounded-xl bg-[#4DA2FF] px-4 py-3 font-semibold text-white transition-all hover:bg-[#5DADFF] active:scale-[0.98]"
                        >
                          List for sale
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </main>
  );
}

function CompactTicketCard({ ticket, index, isSelected, onSelect, onShowQR, onList, onCopy, copied, showMenu, setShowMenu }: any) {
  const isListed = !!ticket.listing;
  const isPast = ticket.used;
  
  const statusColor = isPast ? 'gray' : isListed ? 'amber' : 'green';
  const statusLabel = isPast ? 'Used' : isListed ? 'Listed' : 'Upcoming';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      className={`group overflow-hidden rounded-2xl border transition-all ${
        isPast 
          ? 'border-white/6 bg-white/[0.01] opacity-60 grayscale'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Checkbox */}
        {!isPast && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(ticket.id)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#4DA2FF] focus:ring-2 focus:ring-[#4DA2FF]/40"
          />
        )}

        {/* Poster thumbnail */}
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${
          isPast ? 'bg-white/[0.02]' : isListed ? 'bg-[#FFB020]/10' : 'bg-gradient-to-br from-[#4DA2FF]/15 to-[#5AE0E5]/10'
        }`}>
          {isPast ? (
            <Check className="h-6 w-6 text-white/40" />
          ) : isListed ? (
            <DollarSign className="h-6 w-6 text-[#FFB020]" />
          ) : (
            <TicketIcon className="h-6 w-6 text-[#4DA2FF]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-medium text-white line-clamp-1">{ticket.eventTitle}</h3>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              statusColor === 'gray' ? 'bg-white/[0.08] text-white/60'
              : statusColor === 'amber' ? 'bg-[#FFB020]/20 text-[#FFB020]'
              : 'bg-green-500/20 text-green-400'
            }`}>
              {statusLabel}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(ticket.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {ticket.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {ticket.venue}
            </span>
          </div>
          
          {isListed && (
            <div className="mt-1 text-sm font-semibold text-white">
              Listed at ${ticket.listing.price} <span className="text-xs font-normal text-white/50">• {ticket.listing.views || 0} views</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {!isPast && !isListed && (
            <button
              onClick={onShowQR}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4DA2FF]/10 text-[#4DA2FF] transition-all hover:bg-[#4DA2FF]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              title="View QR"
            >
              <QrCode className="h-5 w-5" />
            </button>
          )}
          
          {!isPast && (
            <button
              onClick={onList}
              className="rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
            >
              {isListed ? 'Manage' : 'Sell'}
            </button>
          )}

          {/* Overflow menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(showMenu === ticket.id ? null : ticket.id)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] text-white/60 transition-all hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            <AnimatePresence>
              {showMenu === ticket.id && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-12 z-10 w-40 overflow-hidden rounded-xl border border-white/12 bg-[#0a1929] shadow-2xl"
                  onMouseLeave={() => setShowMenu(null)}
                >
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06]">
                    <Send className="h-4 w-4" />
                    Transfer
                  </button>
                  <button
                    onClick={() => onCopy(ticket.id, ticket.id)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                  >
                    {copied === ticket.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy ID
                      </>
                    )}
                  </button>
                  <a
                    href={explorerObj(ticket.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Sui
                  </a>
                  {isPast && (
                    <button className="flex w-full items-center gap-2 border-t border-white/8 px-4 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/[0.06]">
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ tab, onDemoClick }: any) {
  const config = {
    all: {
      icon: TicketIcon,
      title: 'No tickets yet',
      description: 'Tickets you own will appear here',
      action: 'Browse events',
      href: '/events',
    },
    upcoming: {
      icon: Calendar,
      title: 'No upcoming tickets',
      description: 'Purchase tickets to see them here',
      action: 'Explore events',
      href: '/events',
    },
    listed: {
      icon: DollarSign,
      title: 'Nothing listed',
      description: 'List tickets from your upcoming tab to sell them',
    },
    past: {
      icon: Check,
      title: 'No past tickets',
      description: 'Used tickets will appear here after check-in',
    },
  }[tab];

  return (
    <div className="mx-auto mt-12 max-w-md text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
        <config.icon className="h-8 w-8 text-white/40" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">{config.title}</h3>
      <p className="mb-6 text-sm text-white/60">{config.description}</p>
      {config.action && (
        <div className="flex flex-col items-center gap-2">
          {config.href ? (
            <a
              href={config.href}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4DA2FF]/10 px-5 py-2.5 text-sm font-medium text-[#4DA2FF] transition-all hover:bg-[#4DA2FF]/20"
            >
              {config.action}
            </a>
          ) : null}
          {tab === 'all' && onDemoClick && (
            <button
              onClick={onDemoClick}
              className="text-sm text-white/50 hover:text-white/70"
            >
              or try demo wallet
            </button>
          )}
        </div>
      )}
    </div>
  );
}
