/**
 * My Tickets - Ownership, Listing, Resale with Attendance Badges
 * Shows all ticket states: Upcoming, Listed, Past (Attended/No-show)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket as TicketIcon,
  QrCode,
  DollarSign,
  Send,
  X,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
  Calendar,
  MapPin,
  MoreVertical,
  Award,
  ShieldAlert,
  XCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Download,
  Share2,
  Filter,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getOwnedTickets } from '../lib/rpc';
import { currentAddress } from '../lib/signer';
import { explorerObj, shortenAddress } from '../lib/explorer';
import { generateTicketQRData } from '../utils/qrcode';
import { DEMO_TICKETS, type DemoTicket, type TicketState } from '../lib/demoTickets';
import { Tooltip } from '../components/Tooltip';
import { BadgeViewer } from '../components/BadgeViewer';
import { ListModal } from '../components/ListModal';
import { TransferModal } from '../components/TransferModal';

type Tab = 'all' | 'upcoming' | 'listed' | 'past';
type SortOption = 'date' | 'price' | 'name' | 'recent';
type ViewMode = 'list' | 'grid';

export function MyTickets() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [tickets, setTickets] = useState<DemoTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [showListModal, setShowListModal] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState<string | null>(null);
  const [showBadgeViewer, setShowBadgeViewer] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showQR || showListModal || showBadgeViewer || showMenu) return;

      const displayedTickets = getDisplayTickets();
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, displayedTickets.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < displayedTickets.length) {
            const ticket = displayedTickets[focusedIndex];
            handlePrimaryAction(ticket);
          }
          break;
        case 'l':
        case 'L':
          if (focusedIndex >= 0 && focusedIndex < displayedTickets.length) {
            const ticket = displayedTickets[focusedIndex];
            if (ticket.state === 'UPCOMING') {
              setShowListModal(ticket.id);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, showQR, showListModal, showBadgeViewer, showMenu, activeTab, tickets]);

  async function loadTickets() {
    setLoading(true);
    try {
      const owned = await getOwnedTickets(address);
      setTickets(owned.map(t => ({
        ...t,
        eventId: t.id,
        title: 'Event Ticket',
        venue: 'Venue',
        city: 'City',
        start: new Date().toISOString(),
        time: '8:00 PM',
        state: 'UPCOMING' as TicketState,
        policy: {},
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

  const handleListTicket = async (ticketId: string, price: number) => {
    // Update ticket to LISTED state
    setTickets(prev => prev.map(t => 
      t.id === ticketId 
        ? { ...t, state: 'LISTED' as TicketState, listing: { price, listedAt: new Date().toISOString() } }
        : t
    ));
    setActiveTab('listed');
  };

  const handleUnlist = (ticketId: string) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? { ...t, state: 'UPCOMING' as TicketState, listing: undefined }
        : t
    ));
  };

  const handleDemoWallet = () => {
    setIsDemoMode(true);
    setLoading(true);
  };

  const handlePrimaryAction = (ticket: DemoTicket) => {
    if (ticket.state === 'UPCOMING') {
      setShowQR(ticket.id);
    } else if (ticket.state === 'PAST_ATTENDED') {
      setShowBadgeViewer(ticket.id);
    }
  };

  const handleTransfer = (ticketId: string) => {
    setShowTransferModal(ticketId);
    setShowMenu(null);
  };

  const handleBulkList = () => {
    if (selectedTickets.length > 0) {
      // Open list modal for first selected ticket
      setShowListModal(selectedTickets[0]);
    }
  };

  const handleBulkTransfer = () => {
    if (selectedTickets.length > 0) {
      setShowTransferModal(selectedTickets[0]);
    }
  };

  const handleDownloadQR = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Create a canvas to generate QR as image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 512;
    canvas.height = 512;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);

    // Here you would draw the QR code
    // For now, trigger a download of the ticket info
    const ticketInfo = {
      id: ticketId,
      title: ticket.title,
      venue: ticket.venue,
      date: ticket.start,
      serialNumber: ticket.serialNumber,
    };

    const blob = new Blob([JSON.stringify(ticketInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.serialNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const shareData = {
      title: ticket.title,
      text: `Check out my ticket for ${ticket.title} at ${ticket.venue}!`,
      url: `${window.location.origin}/tickets/${ticketId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy link to clipboard
      handleCopy(shareData.url, ticketId);
    }
  };

  const getDisplayTickets = () => {
    const upcomingTickets = tickets.filter(t => t.state === 'UPCOMING');
    const listedTickets = tickets.filter(t => t.state === 'LISTED');
    const pastTickets = tickets.filter(t => t.state === 'PAST_ATTENDED' || t.state === 'PAST_NO_SHOW');
    
    switch (activeTab) {
      case 'upcoming': return upcomingTickets;
      case 'listed': return listedTickets;
      case 'past': return pastTickets;
      default: return tickets;
    }
  };

  const getSortedTickets = (ticketsToSort: DemoTicket[]) => {
    const sorted = [...ticketsToSort];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      case 'price':
        return sorted.sort((a, b) => (a.listing?.price || a.purchasePrice || 0) - (b.listing?.price || b.purchasePrice || 0));
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'recent':
        return sorted.sort((a, b) => {
          const aDate = a.listing?.listedAt || a.purchaseDate || a.start;
          const bDate = b.listing?.listedAt || b.purchaseDate || b.start;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });
      default:
        return sorted;
    }
  };

  const getFilteredTickets = (ticketsToFilter: DemoTicket[]) => {
    if (!searchQuery) return ticketsToFilter;
    
    const query = searchQuery.toLowerCase();
    return ticketsToFilter.filter(ticket => 
      ticket.title.toLowerCase().includes(query) ||
      ticket.venue.toLowerCase().includes(query) ||
      ticket.city.toLowerCase().includes(query) ||
      ticket.artist?.toLowerCase().includes(query)
    );
  };

  const displayTickets = getSortedTickets(getFilteredTickets(getDisplayTickets()));

  const upcomingCount = tickets.filter(t => t.state === 'UPCOMING').length;
  const listedCount = tickets.filter(t => t.state === 'LISTED').length;
  const pastCount = tickets.filter(t => t.state === 'PAST_ATTENDED' || t.state === 'PAST_NO_SHOW').length;

  const glowX = 50 + (mousePos.x - 0.5) * 3;
  const glowY = 50 + (mousePos.y - 0.5) * 3;

  // Calculate statistics
  const totalValue = tickets
    .filter(t => t.state === 'UPCOMING' || t.state === 'LISTED')
    .reduce((sum, t) => sum + (t.listing?.price || t.purchasePrice || 0), 0);
  
  const listedTickets = tickets.filter(t => t.state === 'LISTED');
  const totalViews = listedTickets.reduce((sum, t) => sum + (t.listing?.views || 0), 0);
  const totalOffers = listedTickets.reduce((sum, t) => sum + (t.listing?.offers || 0), 0);

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
        {/* Enhanced Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-white">My Tickets</h1>
              <p className="text-white/60">
                {upcomingCount} upcoming • {listedCount} listed • {pastCount} past
              </p>
              {isDemoMode && (
                <Tooltip content="Viewing demo data. Connect wallet to see your real tickets.">
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#FFB020]/10 px-3 py-1 text-xs font-medium text-[#FFB020]">
                    <Sparkles className="h-3 w-3" />
                    Demo mode
                  </div>
                </Tooltip>
              )}
            </div>
            
            {selectedTickets.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-white/60">{selectedTickets.length} selected</span>
                <button
                  onClick={handleBulkList}
                  className="rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06]"
                >
                  List all
                </button>
                <button
                  onClick={handleBulkTransfer}
                  className="rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06]"
                >
                  Transfer
                </button>
                <button
                  onClick={() => setSelectedTickets([])}
                  className="rounded-xl bg-white/[0.08] p-2 text-white/60 transition-all hover:bg-white/[0.12]"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    showFilters
                      ? 'bg-[#4DA2FF]/20 text-[#4DA2FF]'
                      : 'border border-white/12 bg-white/[0.02] text-white/80 hover:bg-white/[0.06]'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {tickets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-white/50">Portfolio Value</div>
                <div className="text-2xl font-semibold text-white">{totalValue.toFixed(2)} SUI</div>
                <div className="mt-1 text-xs text-white/40">Active tickets only</div>
              </div>
              
              {listedCount > 0 && (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/50">
                      <Eye className="h-3 w-3" />
                      Total Views
                    </div>
                    <div className="text-2xl font-semibold text-white">{totalViews}</div>
                    <div className="mt-1 text-xs text-white/40">Across {listedCount} listings</div>
                  </div>
                  
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/50">
                      <TrendingUp className="h-3 w-3" />
                      Offers Received
                    </div>
                    <div className="text-2xl font-semibold text-white">{totalOffers}</div>
                    <div className="mt-1 text-xs text-white/40">Pending your review</div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Search and Sort Bar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tickets..."
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white placeholder-white/40 focus:border-[#4DA2FF]/50 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/20"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white/60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white focus:border-[#4DA2FF]/50 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/20"
                  >
                    <option value="date">Sort by date</option>
                    <option value="price">Sort by price</option>
                    <option value="name">Sort by name</option>
                    <option value="recent">Sort by recent</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tab Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          {(['all', 'upcoming', 'listed', 'past'] as Tab[]).map((tab) => {
            const count = tab === 'all' ? tickets.length
              : tab === 'upcoming' ? upcomingCount
              : tab === 'listed' ? listedCount
              : pastCount;
            
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
            key={`${activeTab}-${sortBy}-${searchQuery}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {displayTickets.length === 0 ? (
              searchQuery ? (
                <div className="mx-auto mt-12 max-w-md text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
                    <AlertCircle className="h-8 w-8 text-white/40" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">No matches found</h3>
                  <p className="mb-6 text-sm text-white/60">
                    No tickets match "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="rounded-xl bg-[#4DA2FF]/10 px-5 py-2.5 text-sm font-medium text-[#4DA2FF] transition-all hover:bg-[#4DA2FF]/20"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <EmptyState tab={activeTab} onDemoClick={!isDemoMode ? handleDemoWallet : undefined} />
              )
            ) : (
              <div className="space-y-3">
                {displayTickets.map((ticket, i) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    index={i}
                    isFocused={i === focusedIndex}
                    isSelected={selectedTickets.includes(ticket.id)}
                    onSelect={(id: string) => setSelectedTickets(prev => 
                      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
                    )}
                    onShowQR={() => setShowQR(ticket.id)}
                    onList={() => setShowListModal(ticket.id)}
                    onUnlist={() => handleUnlist(ticket.id)}
                    onViewBadge={() => setShowBadgeViewer(ticket.id)}
                    onTransfer={() => handleTransfer(ticket.id)}
                    onDownload={() => handleDownloadQR(ticket.id)}
                    onShare={() => handleShare(ticket.id)}
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

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (() => {
          const ticket = tickets.find(t => t.id === showTransferModal);
          if (!ticket) return null;

          return (
            <TransferModal
              ticket={{
                id: ticket.id,
                title: ticket.title,
                venue: ticket.venue,
                date: ticket.start,
                serialNumber: ticket.serialNumber,
              }}
              onClose={() => setShowTransferModal(null)}
              onTransfer={async (recipientAddress: string) => {
                console.log('Transferring ticket', ticket.id, 'to', recipientAddress);
                // Implement transfer logic here
                setShowTransferModal(null);
              }}
            />
          );
        })()}
      </AnimatePresence>

      {/* QR Drawer */}
      <AnimatePresence>
        {showQR && (() => {
          const ticket = tickets.find(t => t.id === showQR);
          if (!ticket) return null;
          
          return (
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
                  
                  <div className="mx-auto mb-6 flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white p-4">
                    <QRCodeSVG
                      value={generateTicketQRData({
                        ticketId: showQR,
                        ownerAddress: address || 'demo',
                        serialNumber: ticket.serialNumber,
                      })}
                      size={256}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                  
                  <div className="mb-4 rounded-xl bg-gray-100 p-3 font-mono text-xs text-gray-600">
                    {shortenAddress(showQR, 12)}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* List Modal */}
      <AnimatePresence>
        {showListModal && (() => {
          const ticket = tickets.find(t => t.id === showListModal);
          if (!ticket) return null;

          return (
            <ListModal
              ticket={{
                id: ticket.id,
                title: ticket.title,
                royaltyPct: 0.10,
                organizerPct: 0.08,
                facePrice: ticket.policy.msrp,
                purchasePrice: ticket.policy.msrp,
                listing: ticket.listing ? { priceSUI: ticket.listing.price } : undefined,
              }}
              event={{ antiScalp: { enabled: ticket.policy.antiScalp || false, baselineSource: 'msrp', minTaxCents: 100, tiers: [{ thresholdBp: 0, taxBp: 500 }, { thresholdBp: 1000, taxBp: 1200 }, { thresholdBp: 3000, taxBp: 2000 }] } }}
              onClose={() => setShowListModal(null)}
              onList={handleListTicket}
            />
          );
        })()}
      </AnimatePresence>

      {/* Badge Viewer */}
      <AnimatePresence>
        {showBadgeViewer && (() => {
          const ticket = tickets.find(t => t.id === showBadgeViewer);
          if (!ticket) return null;

          return (
            <BadgeViewer
              badge={ticket.badge || null}
              eventTitle={ticket.title}
              eventDate={ticket.start}
              onClose={() => setShowBadgeViewer(null)}
            />
          );
        })()}
      </AnimatePresence>
    </main>
  );
}

interface TicketRowProps {
  ticket: DemoTicket;
  index: number;
  isFocused: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onShowQR: () => void;
  onList: () => void;
  onUnlist: () => void;
  onViewBadge: () => void;
  onTransfer: () => void;
  onDownload: () => void;
  onShare: () => void;
  onCopy: (text: string, id: string) => void;
  copied: string | null;
  showMenu: string | null;
  setShowMenu: (id: string | null) => void;
}

function TicketRow({
  ticket,
  index,
  isFocused,
  isSelected,
  onSelect,
  onShowQR,
  onList,
  onUnlist,
  onViewBadge,
  onTransfer,
  onDownload,
  onShare,
  onCopy,
  copied,
  showMenu,
  setShowMenu,
}: TicketRowProps) {
  const isPast = ticket.state === 'PAST_ATTENDED' || ticket.state === 'PAST_NO_SHOW';
  const isListed = ticket.state === 'LISTED';
  const isUpcoming = ticket.state === 'UPCOMING';
  const isAttended = ticket.state === 'PAST_ATTENDED';
  const isNoShow = ticket.state === 'PAST_NO_SHOW';
  
  // Icon colors by state
  const iconColor = isUpcoming ? 'from-[#4DA2FF]/15 to-[#5AE0E5]/10'
    : isListed ? 'from-purple-500/15 to-purple-400/10'
    : 'from-slate-500/10 to-slate-400/5';
  
  const iconElement = isUpcoming ? <TicketIcon className="h-6 w-6 text-[#4DA2FF]" />
    : isListed ? <DollarSign className="h-6 w-6 text-purple-400" />
    : isAttended ? <Check className="h-6 w-6 text-green-400" />
    : <XCircle className="h-6 w-6 text-slate-500" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      className={`group overflow-hidden rounded-2xl border transition-all ${
        isFocused ? 'ring-2 ring-[#4DA2FF]/50' : ''
      } ${
        isPast 
          ? 'border-white/6 bg-white/[0.01] opacity-70'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Checkbox - only for upcoming/listed */}
        {!isPast && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(ticket.id)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#4DA2FF] focus:ring-2 focus:ring-[#4DA2FF]/40"
            aria-label="Select ticket"
          />
        )}

        {/* Icon thumbnail with state color */}
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconColor}`}>
          {iconElement}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Tooltip content={ticket.title}>
              <h3 className="font-medium text-white truncate max-w-[240px]">{ticket.title}</h3>
            </Tooltip>
            
            {/* Artist name if available */}
            {ticket.artist && (
              <span className="text-xs text-white/40">• {ticket.artist}</span>
            )}
            
            {/* Status chips */}
            {isUpcoming && (
              <span className="inline-flex rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                Upcoming
              </span>
            )}
            {isListed && (
              <span className="inline-flex rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
                Listed
              </span>
            )}
            {isAttended && (
              <span className="inline-flex rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                Attended
              </span>
            )}
            {isNoShow && (
              <span className="inline-flex rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                No-show
              </span>
            )}
            
            {/* Anti-scalp chip - only for upcoming with policy */}
            {isUpcoming && ticket.policy.antiScalp && (
              <Tooltip content="Progressive fee on resales above baseline. Enforced at transfer.">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400/90">
                  <ShieldAlert className="h-2.5 w-2.5" />
                  Anti-scalp
                </span>
              </Tooltip>
            )}
          </div>
          
          {/* Section/Row/Seat info */}
          {(ticket.section || ticket.row || ticket.seat) && (
            <div className="mb-1 text-xs text-white/60">
              {ticket.section && <span>Section {ticket.section}</span>}
              {ticket.row && <span> • Row {ticket.row}</span>}
              {ticket.seat && <span> • Seat {ticket.seat}</span>}
              {ticket.serialNumber && <span> • #{ticket.serialNumber}</span>}
            </div>
          )}
          
          <div className={`flex items-center gap-3 text-xs ${isPast ? 'text-white/40' : 'text-white/50'}`}>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(ticket.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {ticket.time}
            </span>
            <span className="flex items-center gap-1 truncate max-w-[180px]">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {ticket.venue}
            </span>
          </div>
          
          {isListed && ticket.listing && (
            <div className="mt-2 flex items-center gap-3">
              <div className="text-sm">
                <span className="font-semibold text-white">Listed at {ticket.listing.price.toFixed(2)} SUI</span>
                {ticket.listing.views !== undefined && (
                  <span className="ml-2 text-xs text-white/50">• {ticket.listing.views} views</span>
                )}
                {ticket.listing.offers !== undefined && ticket.listing.offers > 0 && (
                  <span className="ml-2 text-xs text-amber-400">• {ticket.listing.offers} offers</span>
                )}
              </div>
              {ticket.policy.msrp && ticket.listing.price <= ticket.policy.msrp && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
                  Below baseline
                </span>
              )}
            </div>
          )}

          {/* Purchase info for past tickets */}
          {isPast && ticket.purchasePrice && (
            <div className="mt-1 text-xs text-white/40">
              Purchased for {ticket.purchasePrice.toFixed(2)} SUI
              {ticket.purchaseDate && ` on ${new Date(ticket.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </div>
          )}
        </div>

        {/* Actions - right aligned with consistent 8px spacing */}
        <div className="flex flex-shrink-0 items-center gap-2" style={{ marginRight: '12px' }}>
          {/* Upcoming: QR + Sell */}
          {isUpcoming && (
            <>
              <Tooltip content="View QR code">
                <button
                  onClick={onShowQR}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4DA2FF]/10 text-[#4DA2FF] transition-all hover:bg-[#4DA2FF]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
                  aria-label="Show QR code"
                >
                  <QrCode className="h-5 w-5" />
                </button>
              </Tooltip>
              <button
                onClick={onList}
                className="rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              >
                Sell
              </button>
            </>
          )}

          {/* Listed: Price pill + Edit + Unlist */}
          {isListed && ticket.listing && (
            <>
              <button
                onClick={onList}
                className="rounded-xl bg-[#4DA2FF] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#5DADFF] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              >
                Edit
              </button>
              <button
                onClick={onUnlist}
                className="rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              >
                Unlist
              </button>
            </>
          )}

          {/* Past: View badge (primary if attended, ghost if no-show) */}
          {isPast && (
            <button
              onClick={onViewBadge}
              disabled={isNoShow}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF] ${
                isAttended
                  ? 'bg-[#4DA2FF] text-white hover:bg-[#5DADFF] active:scale-[0.98]'
                  : 'border border-white/12 bg-white/[0.02] text-white/40 cursor-not-allowed'
              }`}
            >
              View badge
            </button>
          )}

          {/* Overflow menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(showMenu === ticket.id ? null : ticket.id)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] text-white/60 transition-all hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            <AnimatePresence>
              {showMenu === ticket.id && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-12 z-10 w-48 overflow-hidden rounded-xl border border-white/12 bg-[#0a1929] shadow-2xl"
                  onMouseLeave={() => setShowMenu(null)}
                >
                  {isPast ? (
                    <>
                      <a
                        href={`/events/${ticket.eventId}`}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View event
                      </a>
                      <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06]">
                        <AlertCircle className="h-4 w-4" />
                        Report issue
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onTransfer}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                      >
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
                      <button
                        onClick={onDownload}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                      >
                        <Download className="h-4 w-4" />
                        Download QR
                      </button>
                      <button
                        onClick={onShare}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
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
                    </>
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

function EmptyState({ tab, onDemoClick }: { tab: Tab; onDemoClick?: () => void }) {
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
      icon: Award,
      title: 'No past tickets',
      description: 'Attended events and badges will appear here',
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
