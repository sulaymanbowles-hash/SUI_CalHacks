/**
 * Events Marketplace - Discovery → Details → Checkout
 * Zero crypto jargon, buyer-first flow with sticky search & refined cards
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  Calendar,
  MapPin,
  X,
  ChevronDown,
  Loader2,
  Sparkles,
  BadgeCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  price: number;
  available: number;
  total: number;
  coverImage?: string;
  verified?: boolean;
  resaleAllowed?: boolean;
  trending?: boolean;
}

// Mock data - replace with real on-chain queries
const MOCK_EVENTS: Event[] = [
  {
    id: '0x1',
    title: 'Nova Festival 2025',
    venue: 'Zilker Park',
    city: 'Austin, TX',
    date: '2025-06-22',
    time: '6:00 PM',
    price: 62,
    available: 47,
    total: 100,
    verified: true,
    resaleAllowed: true,
    trending: true,
  },
  {
    id: '0x2',
    title: 'Glasshouse Sessions',
    venue: 'The Chapel',
    city: 'San Francisco, CA',
    date: '2025-07-08',
    time: '8:00 PM',
    price: 28,
    available: 12,
    total: 50,
    verified: true,
    resaleAllowed: true,
  },
  {
    id: '0x3',
    title: 'Ambient Nights #14',
    venue: "Baby's All Right",
    city: 'Brooklyn, NY',
    date: '2025-08-15',
    time: '9:30 PM',
    price: 18,
    available: 23,
    total: 60,
    verified: false,
    resaleAllowed: true,
  },
];

const QUICK_FILTERS = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'near', label: 'Near me' },
  { id: 'under50', label: 'Under $50' },
  { id: 'verified', label: 'Verified organizers' },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'soonest', label: 'Soonest' },
  { id: 'price-low', label: 'Lowest price' },
  { id: 'popular', label: 'Most popular' },
];

export function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 800);
    
    const handleScroll = () => {
      const sy = window.scrollY;
      setScrollY(sy);
      setIsSticky(sy > 120);
    };
    
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
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleFilter = (id: string) => {
    setSelectedFilters(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedFilters([]);
  };

  const filteredEvents = MOCK_EVENTS.filter(event => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!event.title.toLowerCase().includes(query) && 
          !event.venue.toLowerCase().includes(query) &&
          !event.city.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    if (selectedFilters.includes('verified') && !event.verified) return false;
    if (selectedFilters.includes('under50') && event.price > 50) return false;
    
    return true;
  });

  // Count for each filter
  const getFilterCount = (filterId: string) => {
    return MOCK_EVENTS.filter(e => {
      if (filterId === 'verified') return e.verified;
      if (filterId === 'under50') return e.price < 50;
      if (filterId === 'week') return new Date(e.date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return true;
    }).length;
  };

  const hasActiveFilters = selectedFilters.length > 0 || searchQuery.length > 0;

  const auroraParallax = scrollY * 0.012;
  const parallaxX = (mousePos.x - 0.5) * 10;
  const parallaxY = (mousePos.y - 0.5) * 10;
  const glowX = 50 + (mousePos.x - 0.5) * 6;
  const glowY = 50 + (mousePos.y - 0.5) * 6;

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#061522]">
      {/* Ambient background with parallax drift */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#061522] to-transparent" />
        <div 
          className="aurora-primary absolute h-[45vmax] w-[45vmax]"
          style={{
            left: '35%',
            top: `calc(25% + ${auroraParallax}px)`,
            opacity: 0.25,
            transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
            transition: 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />
        <div 
          className="glyph-pattern absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.006}px)`,
            backgroundImage: "url(/brand/sui/glyph.svg)",
            backgroundSize: "48px 48px",
            backgroundRepeat: "repeat",
            opacity: Math.max(0.02, 0.028 * (1 - scrollY / 800)),
            WebkitMaskImage: "radial-gradient(50% 50% at 50% 40%, #000 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
            maskImage: "radial-gradient(50% 50% at 50% 40%, #000 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
          }}
        />
        <div 
          className="proximity-glow absolute h-[28vmax] w-[28vmax]"
          style={{
            left: `${glowX - 14}%`,
            top: `${glowY - 14}%`,
            background: "radial-gradient(circle, rgba(77,162,255,.35) 0%, transparent 68%)",
            filter: "blur(52px)",
            opacity: 0.07,
            transform: `translate3d(${parallaxX * 0.3}px, ${parallaxY * 0.3}px, 0)`,
            transition: "left 0.55s cubic-bezier(0.23, 1, 0.32, 1), top 0.55s cubic-bezier(0.23, 1, 0.32, 1), transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>

      <div className="mx-auto max-w-screen-2xl px-6 pt-[72px] pb-[96px]">
        {/* Sticky Search & Filters Bar */}
        <motion.div
          ref={searchBarRef}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`${
            isSticky 
              ? 'fixed top-[64px] left-0 right-0 z-40 bg-[#061522]/95 backdrop-blur-xl border-b border-white/10 shadow-lg' 
              : 'relative'
          } transition-all duration-300`}
        >
          <div className="mx-auto max-w-screen-2xl px-6 py-4">
            {/* Search rail */}
            <div className="relative mx-auto mb-4 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, artists, venues…"
                className="h-14 w-full rounded-2xl border border-white/12 bg-white/[0.03] pl-12 pr-20 text-[15px] text-white placeholder-white/50 backdrop-blur-xl transition-all focus:border-[#4DA2FF]/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/20"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1 font-mono text-xs text-white/60">
                ⌘K
              </kbd>
            </div>

            {/* Quick filters with count badges & reset */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {QUICK_FILTERS.map((filter) => {
                const count = getFilterCount(filter.id);
                const isSelected = selectedFilters.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`group relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-120 ${
                      isSelected
                        ? 'bg-[#4DA2FF]/20 text-[#4DA2FF] ring-2 ring-[#4DA2FF]/30 shadow-[0_0_12px_rgba(77,162,255,0.12)] scale-[1.02] hover:scale-105'
                        : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white hover:scale-[1.02]'
                    }`}
                  >
                    {filter.label}
                    {isSelected && count > 0 && (
                      <span className="ml-1.5 text-xs opacity-80">• {count}</span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70 transition-all duration-120 hover:bg-white/[0.08] hover:text-white hover:scale-[1.02]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              
              {/* Reset chip - appears when filters active */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 py-2 text-sm font-medium text-white/90 transition-all duration-120 hover:bg-white/[0.12] hover:scale-[1.02]"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Sort selector */}
            <div className="flex justify-end">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-xl border border-white/12 bg-white/[0.03] py-2 pl-4 pr-10 text-sm text-white backdrop-blur-xl transition-all focus:border-[#4DA2FF]/50 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/20"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spacer when sticky */}
        {isSticky && <div className="h-[140px]" />}

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.26 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
              >
                {/* Skeleton image */}
                <div className="aspect-[16/9] animate-pulse bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
                {/* Skeleton content */}
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 w-16 animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-4 w-20 animate-pulse rounded bg-white/[0.04]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            {/* Event Grid - 12-column system with consistent gutters */}
            <motion.div 
              layout
              className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredEvents.map((event, i) => {
                const availabilityPercent = (event.available / event.total) * 100;
                const isLowStock = availabilityPercent < 15;
                
                return (
                  <motion.button
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ 
                      delay: 0.05 + i * 0.04, 
                      duration: 0.24,
                      layout: { type: 'spring', stiffness: 240, damping: 28 }
                    }}
                    onClick={() => setSelectedEvent(event)}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] text-left backdrop-blur-sm transition-all duration-240 hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_12px_32px_rgba(3,15,28,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061522]"
                  >
                    {/* Cover image with consistent 16:9 aspect */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#4DA2FF]/15 to-[#5AE0E5]/10">
                      {event.coverImage ? (
                        <img 
                          src={event.coverImage} 
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-103"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/20">
                          <Calendar className="h-12 w-12" />
                        </div>
                      )}
                      
                      {/* Date pill - top left */}
                      <div className="absolute left-3 top-3 rounded-lg bg-black/70 px-2.5 py-1.5 backdrop-blur-sm">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-white/80">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="font-mono text-lg font-bold leading-none text-white">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>

                      {/* Badges - top right */}
                      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
                        {event.verified && (
                          <div className="flex items-center gap-1 rounded-lg bg-green-500/90 px-2 py-1 backdrop-blur-sm">
                            <BadgeCheck className="h-3 w-3 text-white" />
                            <span className="text-[10px] font-semibold text-white">Verified</span>
                          </div>
                        )}
                        {event.trending && (
                          <div className="flex items-center gap-1 rounded-lg bg-[#4DA2FF]/90 px-2 py-1 backdrop-blur-sm">
                            <Sparkles className="h-3 w-3 text-white" />
                            <span className="text-[10px] font-semibold text-white">Hot</span>
                          </div>
                        )}
                      </div>

                      {/* Dark gradient overlay for text legibility */}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Hover arrow - bottom right */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium text-white opacity-0 transition-all duration-240 group-hover:opacity-100 group-hover:translate-x-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Content - consistent height */}
                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-1 text-[20px] leading-[1.25] font-semibold text-white">{event.title}</h3>
                      
                      <div className="mb-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[13px] leading-[1.4] text-white/60">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{event.venue}, {event.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] leading-[1.4] text-white/60">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {event.time}
                          </span>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-end justify-between pt-2">
                        <div>
                          <div className="text-[10px] font-medium uppercase tracking-wide text-white/50">From</div>
                          <div className="text-[20px] font-semibold tabular-nums text-white">${event.price}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-medium uppercase tracking-wide text-white/50">
                            {isLowStock ? 'Low stock' : 'Available'}
                          </div>
                          <div className={`text-[13px] tabular-nums ${
                            isLowStock ? 'font-semibold text-orange-400' : 'text-white/60'
                          }`}>
                            {isLowStock && '⚡ '}
                            {event.available} / {event.total}
                          </div>
                          {isLowStock && (
                            <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-white/10">
                              <div 
                                className="h-full bg-orange-400 transition-all"
                                style={{ width: `${availabilityPercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover CTA bar */}
                      <div className="mt-3 overflow-hidden opacity-0 transition-all duration-240 group-hover:opacity-100">
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-[#4DA2FF]/30 bg-[#4DA2FF]/10 py-2.5 text-sm font-medium text-[#4DA2FF]">
                          View tickets
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Empty state */}
            {filteredEvents.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto mt-16 max-w-md text-center"
              >
                <div className="mb-4 text-white/30">
                  <Search className="mx-auto h-12 w-12" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">No events match</h3>
                <p className="mb-6 text-sm text-white/60">Try removing filters or broadening your search</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 transition-all duration-120 hover:bg-white/[0.1] hover:scale-[1.02]"
                  >
                    Clear filters
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Event Detail Sheet - unchanged */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/12 bg-[#0a1929] shadow-2xl"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute right-4 top-4 z-10 rounded-lg bg-black/40 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                {/* Left: Cover */}
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br from-[#4DA2FF]/15 to-[#5AE0E5]/10">
                  {selectedEvent.coverImage ? (
                    <img 
                      src={selectedEvent.coverImage} 
                      alt={selectedEvent.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/20">
                      <Calendar className="h-16 w-16" />
                    </div>
                  )}
                </div>

                {/* Right: Details & CTA */}
                <div className="flex flex-col">
                  <div className="mb-4 flex items-start gap-2">
                    <h2 className="flex-1 text-2xl font-semibold text-white">{selectedEvent.title}</h2>
                    {selectedEvent.verified && (
                      <div className="rounded-lg bg-green-500/20 p-1.5">
                        <BadgeCheck className="h-4 w-4 text-green-400" />
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-3 text-sm text-white/70">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div className="text-white/50">{selectedEvent.time}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div>{selectedEvent.venue}</div>
                        <div className="text-white/50">{selectedEvent.city}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-3 text-xs font-medium uppercase tracking-wide text-white/50">Price breakdown</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Ticket price</span>
                        <span className="font-semibold tabular-nums text-white">${selectedEvent.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Network fee</span>
                        <span className="font-semibold tabular-nums text-white">$0.03</span>
                      </div>
                      <div className="border-t border-white/10 pt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-white">Total</span>
                          <span className="text-xl font-bold tabular-nums text-white">${(selectedEvent.price + 0.03).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust signals */}
                  <div className="mb-6 flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-white/70">
                      <Sparkles className="h-3 w-3" />
                      Counterfeit-proof
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-white/70">
                      <BadgeCheck className="h-3 w-3" />
                      Instant settlement
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="mt-auto w-full rounded-xl bg-[#4DA2FF] px-6 py-3.5 font-semibold text-white transition-all hover:bg-[#5DADFF] hover:shadow-lg hover:shadow-[#4DA2FF]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1929] active:scale-[0.98]">
                    Purchase Ticket
                  </button>
                  <p className="mt-3 text-center text-xs text-white/50">
                    Royalties enforced on every resale
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .aurora-primary {
          background: radial-gradient(circle, rgba(77,162,255,.32) 0%, transparent 62%);
          filter: blur(76px);
          animation: float 50s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(2.5%, -1.8%); }
          66% { transform: translate(-1.8%, 2.2%); }
        }
        .scale-103 {
          transform: scale(1.03);
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-primary { animation: none !important; }
          .proximity-glow { 
            display: none !important; 
          }
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
