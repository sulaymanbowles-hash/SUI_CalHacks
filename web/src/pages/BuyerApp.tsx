import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  Ticket, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Search, 
  SlidersHorizontal,
  TrendingUp,
  Clock,
  DollarSign,
  Navigation,
  X,
  Check,
  Heart,
  Eye,
  ChevronDown,
  Verified,
  Flame,
  Zap,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock marketplace data - replace with real on-chain queries
const MOCK_EVENTS = [
  {
    id: '0x8a1b2c3d4e5f',
    title: 'Nova Festival 2025',
    venue: 'Zilker Park',
    city: 'Austin, TX',
    date: 'June 22, 2025',
    time: '6:00 PM',
    price: 62,
    available: 47,
    total: 100,
    royalty: 10,
    organizer: 8,
    posterUrl: null,
    verified: true,
    hot: true,
    distance: 8.2,
    category: 'festival',
  },
  {
    id: '0x91c2d3e4f5a6',
    title: 'Glasshouse Sessions',
    venue: 'The Chapel',
    city: 'San Francisco',
    date: 'July 8, 2025',
    time: '8:00 PM',
    price: 28,
    available: 12,
    total: 50,
    royalty: 10,
    organizer: 8,
    posterUrl: null,
    verified: true,
    hot: false,
    distance: 2.1,
    category: 'music',
  },
  {
    id: '0x7c2d3e4f5a61',
    title: 'Ambient Nights #14',
    venue: "Baby's All Right",
    city: 'Brooklyn, NY',
    date: 'Aug 15, 2025',
    time: '9:30 PM',
    price: 18,
    available: 23,
    total: 60,
    royalty: 10,
    organizer: 8,
    posterUrl: null,
    verified: false,
    hot: false,
    distance: 12.5,
    category: 'music',
  },
  {
    id: '0x7c2d3e4f5a62',
    title: 'Warriors vs Lakers',
    venue: 'Chase Center',
    city: 'San Francisco, CA',
    date: 'Nov 28, 2025',
    time: '7:30 PM',
    price: 120,
    available: 8,
    total: 120,
    royalty: 12,
    organizer: 8,
    posterUrl: null,
    verified: true,
    hot: true,
    distance: 3.4,
    category: 'sports',
  },
  {
    id: '0x7c2d3e4f5a63',
    title: 'Hamilton - The Musical',
    venue: 'Orpheum Theatre',
    city: 'San Francisco, CA',
    date: 'Dec 15, 2025',
    time: '8:00 PM',
    price: 185,
    available: 45,
    total: 200,
    royalty: 15,
    organizer: 8,
    posterUrl: null,
    verified: true,
    hot: false,
    distance: 2.8,
    category: 'theater',
  },
  {
    id: '0x7c2d3e4f5a64',
    title: 'Electronic Summit 2025',
    venue: 'Warehouse District',
    city: 'Brooklyn, NY',
    date: 'Nov 15, 2025',
    time: '9:00 PM',
    price: 145,
    available: 23,
    total: 150,
    royalty: 15,
    organizer: 8,
    posterUrl: null,
    verified: true,
    hot: true,
    distance: 11.2,
    category: 'festival',
  },
];

type SortOption = 'trending' | 'soonest' | 'price-asc' | 'price-desc' | 'distance';

const SORT_OPTIONS: { value: SortOption; label: string; icon: any }[] = [
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'soonest', label: 'Soonest', icon: Clock },
  { value: 'price-asc', label: 'Price: Low to High', icon: DollarSign },
  { value: 'price-desc', label: 'Price: High to Low', icon: DollarSign },
  { value: 'distance', label: 'Distance', icon: Navigation },
];

const CATEGORIES = ['All', 'Music', 'Festival', 'Sports', 'Theater', 'Comedy', 'Arts'];

export function BuyerApp() {
  const account = useCurrentAccount();
  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    return (localStorage.getItem('eventSortPreference') as SortOption) || 'trending';
  });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1);
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const filterBarRef = useRef<HTMLDivElement>(null);
  const filterBarTopRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Sticky filter bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (filterBarTopRef.current) {
        const rect = filterBarTopRef.current.getBoundingClientRect();
        setIsFilterSticky(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persist sort preference
  useEffect(() => {
    localStorage.setItem('eventSortPreference', sortBy);
  }, [sortBy]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedEvent) return; // Don't navigate when modal is open
      
      const filteredEvents = getFilteredEvents();
      if (filteredEvents.length === 0) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedCardIndex((prev) => {
          const next = prev + 1;
          if (next < filteredEvents.length) {
            cardRefs.current[next]?.focus();
            return next;
          }
          return prev;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedCardIndex((prev) => {
          const next = prev - 1;
          if (next >= 0) {
            cardRefs.current[next]?.focus();
            return next;
          }
          return prev;
        });
      } else if (e.key === 'Enter' && focusedCardIndex >= 0) {
        e.preventDefault();
        setSelectedEvent(filteredEvents[focusedCardIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCardIndex, selectedEvent]);

  const toggleCategory = (category: string) => {
    if (category === 'All') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  const toggleSaved = (eventId: string) => {
    setSavedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationPermission('granted'),
        () => setLocationPermission('denied')
      );
    }
  };

  const getFilteredEvents = () => {
    let filtered = MOCK_EVENTS;

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.venue.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((e) =>
        selectedCategories.some((cat) => e.category === cat.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.available - a.available;
        case 'soonest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredEvents = getFilteredEvents();
  const activeFilterCount = selectedCategories.length + (searchQuery ? 1 : 0);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    // Simulate purchase
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPurchasing(false);
    setPurchaseSuccess(true);
  };

  if (!account) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-vignette noise">
        <div className="mx-auto flex min-h-[80vh] max-w-screen-xl items-center justify-center px-6">
          <div className="card max-w-md text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
              <Ticket className="h-8 w-8 text-[#4DA2FF]" />
            </div>
            <h2 className="mb-3 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
              Connect wallet to continue
            </h2>
            <p className="text-[var(--muted)]">
              Connect your Sui wallet to browse tickets and make purchases.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-12">
      <div className="mx-auto max-w-screen-xl px-6">
        {/* Header */}
        <div className="py-12">
          <h1 className="font-[Inter_Tight] text-4xl tracking-tight text-[#DCE7F0]">
            Marketplace
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Browse upcoming events and purchase tickets with automatic royalty splits.
          </p>
        </div>

        {/* Anchor point for sticky detection */}
        <div ref={filterBarTopRef} />

        {/* Search & Filter Bar */}
        <div
          ref={filterBarRef}
          className={`${
            isFilterSticky
              ? 'fixed left-0 right-0 top-0 z-40 border-b border-white/8 bg-[#0A1628]/95 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-xl'
              : 'mb-6'
          } transition-all duration-200`}
        >
          <div className="mx-auto max-w-screen-xl px-6">
            {/* Search & Sort Row */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search events, venues, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/12 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-[#DCE7F0] placeholder:text-white/40 focus:border-[#4DA2FF]/50 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/20"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-[#DCE7F0] transition-colors hover:bg-white/8"
                >
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.icon && (
                    <span className="h-4 w-4">
                      {(() => {
                        const Icon = SORT_OPTIONS.find((o) => o.value === sortBy)!.icon;
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </span>
                  )}
                  <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                  <ChevronDown className="h-4 w-4 text-white/40" />
                </button>

                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/12 bg-[#0F1C2E] p-1 shadow-xl"
                    >
                      {SORT_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortMenu(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                              sortBy === option.value
                                ? 'bg-[#4DA2FF]/10 text-[#4DA2FF]'
                                : 'text-[#DCE7F0] hover:bg-white/5'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{option.label}</span>
                            {sortBy === option.value && <Check className="ml-auto h-4 w-4" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filters Button */}
              <button className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-[#DCE7F0] transition-colors hover:bg-white/8">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Category Chips */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex flex-1 gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {CATEGORIES.map((category) => {
                  const isActive =
                    category === 'All'
                      ? selectedCategories.length === 0
                      : selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#4DA2FF] text-white'
                          : 'border border-white/12 bg-white/5 text-[#DCE7F0] hover:bg-white/8'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}

                {sortBy === 'distance' && locationPermission === 'prompt' && (
                  <button
                    onClick={requestLocation}
                    className="flex-shrink-0 rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-xs font-medium text-[#DCE7F0] transition-all hover:bg-white/8"
                  >
                    <Navigation className="mr-1.5 inline h-3 w-3" />
                    Set location
                  </button>
                )}
              </div>

              {/* Active Filters Summary */}
              {activeFilterCount > 0 && (
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className="rounded-full bg-[#4DA2FF]/10 px-3 py-1.5 text-xs font-medium text-[#4DA2FF]">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-[var(--muted)] hover:text-[#DCE7F0]"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spacer when sticky */}
        {isFilterSticky && <div className="h-[120px]" />}

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-medium text-[#DCE7F0]">{filteredEvents.length}</span> events
          </p>
        </div>

        {/* Event Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden p-0">
                <div className="h-[112px] animate-pulse bg-white/5" />
                <div className="p-4">
                  <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-white/5" />
                  <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
                  <div className="mt-4 flex justify-between">
                    <div className="h-8 w-20 animate-pulse rounded bg-white/5" />
                    <div className="h-8 w-16 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => {
              const percentAvailable = (event.available / event.total) * 100;
              const isLowStock = percentAvailable < 15;
              const isSaved = savedEvents.has(event.id);

              return (
                <motion.button
                  key={event.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  layoutId={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setQuantity(1);
                    setPurchaseSuccess(false);
                  }}
                  onFocus={() => setFocusedCardIndex(index)}
                  onBlur={() => setFocusedCardIndex(-1)}
                  className="card group relative overflow-hidden p-0 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl focus:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#4DA2FF] focus:ring-offset-2 focus:ring-offset-[#0A1628]"
                >
                  {/* Poster with fixed height */}
                  <div className="relative h-[112px] overflow-hidden bg-gradient-to-br from-[#4DA2FF]/20 to-[#5AE0E5]/20">
                    {/* Status badges - top right */}
                    <div className="absolute right-2 top-2 flex items-center gap-1.5">
                      {event.verified && (
                        <div
                          className="group/tooltip relative rounded-full bg-black/40 p-1.5 backdrop-blur-sm"
                          title="Verified organizer"
                        >
                          <Verified className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      {event.hot && (
                        <div className="rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                      )}
                      {isLowStock && (
                        <div className="rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
                          <Zap className="h-3.5 w-3.5 text-amber-400" />
                          <span className="ml-1 text-xs font-medium text-white">
                            {event.available}/{event.total}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Date pill - left aligned */}
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
                      <span className="text-xs font-medium text-white">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex h-full items-center justify-center text-white/30">
                      <Ticket className="h-12 w-12" />
                    </div>

                    {/* Hover actions */}
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaved(event.id);
                        }}
                        className="rounded-full bg-black/60 p-2 backdrop-blur-sm transition-colors hover:bg-black/80"
                      >
                        <Heart
                          className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        className="rounded-full bg-black/60 p-2 backdrop-blur-sm transition-colors hover:bg-black/80"
                      >
                        <Eye className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title - capped at 2 lines */}
                    <h3 className="line-clamp-2 min-h-[3rem] font-medium text-[#DCE7F0]">
                      {event.title}
                    </h3>

                    {/* Info row - reduced opacity */}
                    <div className="mt-3 space-y-1.5 text-xs text-[var(--muted)] opacity-70">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {event.date} • {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {event.venue}, {event.city}
                        </span>
                      </div>
                    </div>

                    {/* Availability Progress Bar */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-white/50">Availability</span>
                        <span className="tabular-nums text-[var(--muted)]">
                          {event.available}/{event.total}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full transition-all ${
                            percentAvailable < 10
                              ? 'bg-red-500'
                              : percentAvailable < 25
                              ? 'bg-amber-500'
                              : 'bg-[#4DA2FF]'
                          }`}
                          style={{ width: `${percentAvailable}%` }}
                        />
                      </div>
                    </div>

                    {/* Price - unified baseline */}
                    <div className="mt-4">
                      <div className="text-xs text-white/50">From</div>
                      <div className="tabular-nums text-xl font-medium text-[#DCE7F0]">
                        ${event.price}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="card mx-auto max-w-md py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-white/20" />
            <h3 className="mb-2 font-[Inter_Tight] text-xl text-[#DCE7F0]">No events found</h3>
            <p className="text-sm text-[var(--muted)]">
              Try adjusting your search or filters
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 text-sm text-[#4DA2FF] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => {
              setSelectedEvent(null);
              setPurchaseSuccess(false);
            }}
          >
            <motion.div
              layoutId={selectedEvent.id}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="card relative w-full max-w-4xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setPurchaseSuccess(false);
                }}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
              >
                <X className="h-5 w-5" />
              </button>

              {!purchaseSuccess ? (
                <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
                  {/* Left: Poster - edge to edge */}
                  <div className="relative -m-6 mb-0 aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#4DA2FF]/20 to-[#5AE0E5]/20 md:m-0 md:aspect-auto md:min-h-full">
                    <div className="flex h-full items-center justify-center text-white/30">
                      <Ticket className="h-20 w-20" />
                    </div>
                  </div>

                  {/* Right: Details */}
                  <div className="max-h-[70vh] overflow-y-auto md:max-h-none">
                    <h2 className="font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
                      {selectedEvent.title}
                    </h2>

                    {/* Event Details */}
                    <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                      <div className="flex items-start gap-2">
                        <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <div>{selectedEvent.date}</div>
                          <div>{selectedEvent.time}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <div>{selectedEvent.venue}</div>
                          <div>{selectedEvent.city}</div>
                        </div>
                      </div>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      <div className="group/tooltip relative flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs">
                        <Check className="h-3.5 w-3.5 text-green-400" />
                        <span className="text-[var(--muted)]">Counterfeit-proof</span>
                      </div>
                      <div className="group/tooltip relative flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs">
                        <Zap className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-[var(--muted)]">Instant settlement</span>
                      </div>
                      {selectedEvent.verified && (
                        <div className="group/tooltip relative flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs">
                          <Verified className="h-3.5 w-3.5 text-[#4DA2FF]" />
                          <span className="text-[var(--muted)]">Verified organizer</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="mt-6">
                      <label className="mb-2 block text-xs text-white/50">Quantity</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="rounded-lg border border-white/12 bg-white/5 p-2 transition-colors hover:bg-white/8 disabled:opacity-30"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[3ch] text-center text-lg font-medium tabular-nums text-[#DCE7F0]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(selectedEvent.available, quantity + 1))}
                          disabled={quantity >= selectedEvent.available}
                          className="rounded-lg border border-white/12 bg-white/5 p-2 transition-colors hover:bg-white/8 disabled:opacity-30"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-white/40">
                          (Max: {selectedEvent.available})
                        </span>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="mt-6">
                      <div className="mb-3 text-xs text-white/50">Price breakdown</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border border-white/12 bg-white/5 px-4 py-3">
                          <div className="text-xs text-white/60">
                            Ticket price × {quantity}
                          </div>
                          <div className="tabular-nums font-medium text-[#DCE7F0]">
                            ${(selectedEvent.price * quantity).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-white/12 bg-white/5 px-4 py-3">
                          <div className="text-xs text-white/60">Network fee</div>
                          <div className="tabular-nums font-medium text-[#DCE7F0]">
                            $0.03
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-[#4DA2FF]/30 bg-[#4DA2FF]/5 px-4 py-3">
                          <div className="text-sm font-medium text-[#DCE7F0]">Total</div>
                          <div className="tabular-nums text-lg font-medium text-[#DCE7F0]">
                            ${(selectedEvent.price * quantity + 0.03).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Royalty Policy */}
                    <div className="mt-6 rounded-lg border border-white/12 p-4">
                      <div className="mb-2 text-xs text-white/60">Transfer policy</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[var(--muted)]">
                          Artist: {selectedEvent.royalty}%
                        </span>
                        <span className="text-white/30">•</span>
                        <span className="text-[var(--muted)]">
                          Organizer: {selectedEvent.organizer}%
                        </span>
                      </div>
                      <button className="mt-2 text-xs text-[#4DA2FF] hover:underline">
                        View policy
                      </button>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={handlePurchase}
                      disabled={isPurchasing || quantity === 0}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4DA2FF] px-5 py-3 font-medium text-white transition-all duration-200 ease-out hover:scale-[1.01] disabled:opacity-50"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Purchase {quantity > 1 ? `${quantity} Tickets` : 'Ticket'}</span>
                      )}
                    </button>
                    <p className="mt-2 text-center text-xs text-white/50">
                      Royalties & transfer rules enforced on-chain •{' '}
                      <a
                        href={`https://suiscan.xyz/testnet/object/${selectedEvent.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4DA2FF] hover:underline"
                      >
                        View on explorer
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                // Success State
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10"
                  >
                    <Check className="h-10 w-10 text-green-400" />
                  </motion.div>
                  <h3 className="mb-2 font-[Inter_Tight] text-2xl text-[#DCE7F0]">
                    {quantity > 1 ? 'Tickets' : 'Ticket'} added to My Tickets
                  </h3>
                  <p className="text-[var(--muted)]">
                    Your {quantity > 1 ? 'tickets are' : 'ticket is'} ready to use
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <button className="rounded-xl border border-white/12 bg-white/5 px-6 py-3 font-medium text-[#DCE7F0] transition-colors hover:bg-white/8">
                      View Ticket{quantity > 1 ? 's' : ''}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(null);
                        setPurchaseSuccess(false);
                      }}
                      className="rounded-xl bg-[#4DA2FF] px-6 py-3 font-medium text-white transition-transform hover:scale-[1.01]"
                    >
                      Go to Event
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
