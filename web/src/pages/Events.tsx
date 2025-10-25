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
  Sparkles,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';
import { tokens } from '../design-tokens';

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

  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    // Simulate loading with dominant color placeholders
    const timer = setTimeout(() => setLoading(false), 600);
    
    const handleScroll = () => {
      const sy = window.scrollY;
      setScrollY(sy);
      setIsSticky(sy > 80);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (isInside) {
        setMousePos({
          x: e.clientX / window.innerWidth,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    if (!prefersReducedMotion.current) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      clearTimeout(timer);
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

  const auroraParallax = prefersReducedMotion.current ? 0 : scrollY * 0.012;
  const parallaxX = prefersReducedMotion.current ? 0 : (mousePos.x - 0.5) * 8;
  const parallaxY = prefersReducedMotion.current ? 0 : (mousePos.y - 0.5) * 8;
  const glowX = 50 + (prefersReducedMotion.current ? 0 : (mousePos.x - 0.5) * 5);
  const glowY = 50 + (prefersReducedMotion.current ? 0 : (mousePos.y - 0.5) * 5);

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden" style={{ backgroundColor: tokens.colors.bg.canvas }}>
      {/* Ambient background with parallax drift */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#061522] to-transparent" />
        
        {/* Main aurora orb */}
        <div 
          className="ambient-orb absolute"
          style={{
            width: tokens.ambient.orb.radius,
            height: tokens.ambient.orb.radius,
            left: '35%',
            top: `calc(25% + ${auroraParallax}px)`,
            opacity: tokens.ambient.orb.opacity,
            transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
            background: 'radial-gradient(circle, rgba(77,162,255,.32) 0%, transparent 62%)',
            filter: `blur(${tokens.ambient.orb.blur})`,
            transition: prefersReducedMotion.current ? 'none' : 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />

        {/* Sui glyph watermark */}
        <div 
          className="glyph-pattern absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.006}px)`,
            backgroundImage: "url(/brand/sui/glyph.svg)",
            backgroundSize: "48px 48px",
            backgroundRepeat: "repeat",
            opacity: Math.max(0.01, tokens.ambient.noise.opacity * (1 - scrollY / 800)),
            WebkitMaskImage: "radial-gradient(50% 50% at 50% 40%, #000 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
            maskImage: "radial-gradient(50% 50% at 50% 40%, #000 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
          }}
        />

        {/* Interactive proximity glow */}
        <div 
          className="proximity-glow absolute"
          style={{
            width: tokens.ambient.glow.radius,
            height: tokens.ambient.glow.radius,
            left: `${glowX - 14}%`,
            top: `${glowY - 14}%`,
            background: `radial-gradient(circle, ${tokens.colors.brand.primary}35 0%, transparent 68%)`,
            filter: `blur(${tokens.ambient.glow.blur})`,
            opacity: tokens.ambient.glow.opacity,
            transform: `translate3d(${parallaxX * 0.3}px, ${parallaxY * 0.3}px, 0)`,
            transition: prefersReducedMotion.current 
              ? 'none' 
              : 'left 0.55s cubic-bezier(0.23, 1, 0.32, 1), top 0.55s cubic-bezier(0.23, 1, 0.32, 1), transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />
      </div>

      <div className="mx-auto" style={{ maxWidth: tokens.layout.maxWidth, padding: `56px ${tokens.layout.gutter} 80px` }}>
        {/* Sticky Search & Filters Bar */}
        <motion.div
          ref={searchBarRef}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`${
            isSticky 
              ? 'fixed top-[64px] left-0 right-0 z-40 backdrop-blur-xl border-b shadow-lg' 
              : 'relative'
          }`}
          style={{
            backgroundColor: isSticky ? 'rgba(6, 21, 34, 0.95)' : 'transparent',
            borderColor: isSticky ? tokens.colors.border.default : 'transparent',
            boxShadow: isSticky ? tokens.shadow[2] : 'none',
            transition: `all ${tokens.motion.duration.slow} ${tokens.motion.easing.default}`,
          }}
        >
          <div className="mx-auto" style={{ maxWidth: tokens.layout.maxWidth, padding: `${tokens.spacing.md} ${tokens.layout.gutter}` }}>
            {/* Search rail */}
            <div className="relative mx-auto mb-4 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" style={{ width: tokens.icon.button, height: tokens.icon.button, color: tokens.colors.text.muted }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, artists, venues…"
                className="h-14 w-full pl-12 pr-20 backdrop-blur-xl transition-all focus:outline-none"
                style={{
                  borderRadius: tokens.radius.xl,
                  border: `1px solid ${tokens.colors.border.default}`,
                  backgroundColor: tokens.colors.bg.surface1,
                  color: tokens.colors.text.primary,
                  fontSize: tokens.typography.body.size,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = tokens.colors.border.focus;
                  e.target.style.boxShadow = `0 0 0 2px ${tokens.colors.brand.primary}33`;
                  e.target.style.backgroundColor = tokens.colors.bg.surface2;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = tokens.colors.border.default;
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = tokens.colors.bg.surface1;
                }}
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 font-mono" style={{
                borderRadius: tokens.radius.md,
                border: `1px solid ${tokens.colors.border.default}`,
                backgroundColor: tokens.colors.bg.surface1,
                fontSize: tokens.typography.micro.size,
                color: tokens.colors.text.muted,
              }}>
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
                    className="group relative transition-all"
                    style={{
                      borderRadius: tokens.radius.full,
                      padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                      fontSize: tokens.typography.small.size,
                      fontWeight: 500,
                      backgroundColor: isSelected ? tokens.colors.status.upcomingBg : tokens.colors.bg.surface1,
                      color: isSelected ? tokens.colors.brand.primary : tokens.colors.text.secondary,
                      border: isSelected ? `2px solid ${tokens.colors.brand.primary}4D` : 'none',
                      boxShadow: isSelected ? tokens.shadow.glow : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      transition: `all ${tokens.motion.duration.fast} ${tokens.motion.easing.default}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = tokens.colors.bg.surface2;
                        e.currentTarget.style.color = tokens.colors.text.primary;
                        e.currentTarget.style.transform = 'scale(1.02)';
                      } else {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = tokens.colors.bg.surface1;
                        e.currentTarget.style.color = tokens.colors.text.secondary;
                        e.currentTarget.style.transform = 'scale(1)';
                      } else {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                  >
                    {filter.label}
                    {isSelected && count > 0 && (
                      <span className="ml-1.5 opacity-80" style={{ fontSize: tokens.typography.micro.size }}>
                        • {count}
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* Filters button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 transition-all"
                style={{
                  borderRadius: tokens.radius.full,
                  padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                  fontSize: tokens.typography.small.size,
                  fontWeight: 500,
                  backgroundColor: tokens.colors.bg.surface1,
                  color: tokens.colors.text.secondary,
                  transition: `all ${tokens.motion.duration.fast} ${tokens.motion.easing.default}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.bg.surface2;
                  e.currentTarget.style.color = tokens.colors.text.primary;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.bg.surface1;
                  e.currentTarget.style.color = tokens.colors.text.secondary;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <SlidersHorizontal style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
                Filters
              </button>
              
              {/* Reset chip */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 transition-all"
                    style={{
                      borderRadius: tokens.radius.full,
                      padding: `${tokens.spacing.xs} 14px`,
                      fontSize: tokens.typography.small.size,
                      fontWeight: 500,
                      backgroundColor: tokens.colors.bg.surface2,
                      color: tokens.colors.text.primary,
                      transition: `all ${tokens.motion.duration.fast} ${tokens.motion.easing.default}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.bg.surface3;
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.bg.surface2;
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <X style={{ width: '14px', height: '14px' }} />
                    Reset
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Sort selector + result count */}
            <div className="flex items-center justify-between">
              <div style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
                {filteredEvents.length} events
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none backdrop-blur-xl transition-all focus:outline-none"
                  style={{
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.colors.border.default}`,
                    backgroundColor: tokens.colors.bg.surface1,
                    padding: `${tokens.spacing.xs} ${tokens.spacing.xl} ${tokens.spacing.xs} ${tokens.spacing.md}`,
                    fontSize: tokens.typography.small.size,
                    color: tokens.colors.text.primary,
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ width: tokens.icon.inline, height: tokens.icon.inline, color: tokens.colors.text.muted }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spacer when sticky */}
        {isSticky && <div className="h-[160px]" />}

        {/* Loading skeletons with shimmer */}
        {loading ? (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.22 }}
                className="overflow-hidden"
                style={{
                  borderRadius: tokens.radius.lg,
                  border: `1px solid ${tokens.colors.border.default}`,
                  backgroundColor: tokens.colors.bg.card,
                }}
              >
                {/* Skeleton image with shimmer */}
                <div className="aspect-[16/9] relative overflow-hidden" style={{ backgroundColor: tokens.colors.bg.surface1 }}>
                  <div className="shimmer-effect absolute inset-0" />
                </div>
                {/* Skeleton content */}
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded" style={{ backgroundColor: tokens.colors.bg.surface2 }}>
                    <div className="shimmer-effect h-full w-full" />
                  </div>
                  <div className="h-3 w-1/2 rounded" style={{ backgroundColor: tokens.colors.bg.surface1 }}>
                    <div className="shimmer-effect h-full w-full" />
                  </div>
                  <div className="flex justify-between pt-2">
                    <div className="h-4 w-16 rounded" style={{ backgroundColor: tokens.colors.bg.surface2 }} />
                    <div className="h-4 w-20 rounded" style={{ backgroundColor: tokens.colors.bg.surface1 }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            {/* Event Grid */}
            <motion.div 
              layout
              className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} onClick={() => setSelectedEvent(event)} />
              ))}
            </motion.div>

            {/* Empty state */}
            {filteredEvents.length === 0 && (
              <EmptyState onClear={clearAllFilters} />
            )}
          </>
        )}
      </div>

      {/* Event Detail Sheet */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-effect {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 1.8s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ambient-orb,
          .proximity-glow,
          .glyph-pattern {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
          .shimmer-effect {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

// Extract EventCard component for clarity
function EventCard({ event, index, onClick }: { event: Event; index: number; onClick: () => void }) {
  const availabilityPercent = (event.available / event.total) * 100;
  const isLowStock = availabilityPercent < 15;
  
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ 
        delay: 0.05 + index * 0.04, 
        duration: 0.22,
        layout: { type: 'spring', stiffness: 240, damping: 28 }
      }}
      onClick={onClick}
      className="group relative overflow-hidden text-left transition-all focus:outline-none"
      style={{
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.colors.border.default}`,
        backgroundColor: tokens.colors.bg.card,
        transition: `all ${tokens.motion.duration.base} ${tokens.motion.easing.default}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = tokens.colors.border.hover;
        e.currentTarget.style.backgroundColor = tokens.colors.bg.cardHover;
        e.currentTarget.style.boxShadow = tokens.shadow[2];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = tokens.colors.border.default;
        e.currentTarget.style.backgroundColor = tokens.colors.bg.card;
        e.currentTarget.style.boxShadow = 'none';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${tokens.colors.brand.primary}`;
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden" style={{ background: `linear-gradient(135deg, ${tokens.colors.brand.primary}26 0%, ${tokens.colors.brand.secondary}1A 100%)` }}>
        {event.coverImage ? (
          <img 
            src={event.coverImage} 
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ color: tokens.colors.text.muted, opacity: 0.3 }}>
            <Calendar style={{ width: tokens.icon.empty, height: tokens.icon.empty }} />
          </div>
        )}
        
        {/* Date pill - top left */}
        <div className="absolute left-3 top-3 backdrop-blur-sm" style={{
          borderRadius: tokens.radius.md,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: `${tokens.spacing.xs} 10px`,
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgba(255, 255, 255, 0.8)',
          }}>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: 1,
            color: '#fff',
          }}>
            {new Date(event.date).getDate()}
          </div>
        </div>

        {/* Badges - top right */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {event.verified && (
            <div className="flex items-center gap-1 backdrop-blur-sm" style={{
              borderRadius: tokens.radius.md,
              backgroundColor: tokens.colors.status.verifiedBg,
              padding: `4px ${tokens.spacing.xs}`,
            }}>
              <BadgeCheck style={{ width: '12px', height: '12px', color: tokens.colors.status.verified }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: tokens.colors.status.verified }}>Verified</span>
            </div>
          )}
          {event.trending && (
            <div className="flex items-center gap-1 backdrop-blur-sm" style={{
              borderRadius: tokens.radius.md,
              backgroundColor: tokens.colors.status.hotBg,
              padding: `4px ${tokens.spacing.xs}`,
            }}>
              <Sparkles style={{ width: '12px', height: '12px', color: tokens.colors.status.hot }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: tokens.colors.status.hot }}>Hot</span>
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Hover arrow */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1" style={{ fontSize: tokens.typography.micro.size, fontWeight: 500 }}>
          <ArrowRight style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: tokens.spacing.md }}>
        <h3 className="mb-2 line-clamp-1" style={{
          fontSize: tokens.typography.h3.size,
          lineHeight: tokens.typography.h3.lineHeight,
          fontWeight: tokens.typography.h3.weight,
          letterSpacing: tokens.typography.h3.letterSpacing,
          color: tokens.colors.text.primary,
        }}>
          {event.title}
        </h3>
        
        <div className="mb-3 space-y-1">
          <div className="flex items-center gap-1.5" style={{ fontSize: tokens.typography.small.size, lineHeight: tokens.typography.small.lineHeight, color: tokens.colors.text.tertiary }}>
            <MapPin className="flex-shrink-0" style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
            <span className="line-clamp-1">{event.venue}, {event.city}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ fontSize: tokens.typography.small.size, lineHeight: tokens.typography.small.lineHeight, color: tokens.colors.text.tertiary }}>
            <Calendar className="flex-shrink-0" style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
            <span>
              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {event.time}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-end justify-between" style={{ paddingTop: tokens.spacing.xs }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: tokens.colors.text.muted }}>From</div>
            <div style={{ fontSize: tokens.typography.h3.size, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: tokens.colors.text.primary }}>${event.price}</div>
          </div>
          <div className="text-right">
            <div style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: tokens.colors.text.muted }}>
              {isLowStock ? 'Low stock' : 'Available'}
            </div>
            <div style={{
              fontSize: tokens.typography.small.size,
              fontVariantNumeric: 'tabular-nums',
              color: isLowStock ? tokens.colors.status.hot : tokens.colors.text.tertiary,
              fontWeight: isLowStock ? 600 : 400,
            }}>
              {isLowStock && '⚡ '}
              {event.available} / {event.total}
            </div>
            {isLowStock && (
              <div className="mt-1 h-1 w-16 overflow-hidden" style={{ borderRadius: tokens.radius.full, backgroundColor: tokens.colors.bg.surface2 }}>
                <div 
                  className="h-full transition-all"
                  style={{ width: `${availabilityPercent}%`, backgroundColor: tokens.colors.status.hot }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Hover CTA bar */}
        <div className="mt-3 overflow-hidden opacity-0 transition-all duration-200 group-hover:opacity-100">
          <div className="flex items-center justify-center gap-2" style={{
            borderRadius: tokens.radius.md,
            border: `1px solid ${tokens.colors.brand.primary}4D`,
            backgroundColor: `${tokens.colors.brand.primary}1A`,
            padding: '10px',
            fontSize: tokens.typography.small.size,
            fontWeight: 500,
            color: tokens.colors.brand.primary,
          }}>
            View tickets
            <ArrowRight style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// Extract EmptyState component
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto mt-16 max-w-md text-center"
    >
      <div className="mb-4" style={{ color: tokens.colors.text.muted, opacity: 0.5 }}>
        <Search className="mx-auto" style={{ width: tokens.icon.empty, height: tokens.icon.empty }} />
      </div>
      <h3 className="mb-2" style={{ fontSize: tokens.typography.h3.size, fontWeight: 600, color: tokens.colors.text.primary }}>
        No events match
      </h3>
      <p className="mb-6" style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
        Try removing filters or broadening your search
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={onClear}
          className="transition-all"
          style={{
            borderRadius: tokens.radius.md,
            backgroundColor: tokens.colors.bg.surface2,
            padding: `10px ${tokens.spacing.lg}`,
            fontSize: tokens.typography.small.size,
            fontWeight: 500,
            color: tokens.colors.text.secondary,
            transition: `all ${tokens.motion.duration.fast} ${tokens.motion.easing.default}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.bg.surface3;
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.bg.surface2;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Clear filters
        </button>
      </div>
    </motion.div>
  );
}

// Extract EventDetailSheet component
function EventDetailSheet({ event, onClose }: { event: Event; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 backdrop-blur-sm md:items-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden"
        style={{
          borderRadius: tokens.radius.xl,
          border: `1px solid ${tokens.colors.border.default}`,
          backgroundColor: '#0a1929',
          boxShadow: tokens.shadow[3],
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 backdrop-blur-sm transition-all focus:outline-none"
          style={{
            borderRadius: tokens.radius.md,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: tokens.spacing.xs,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
        >
          <X style={{ width: tokens.icon.button, height: tokens.icon.button }} />
        </button>