/**
 * Collections - Artist-specific soulbound NFT collections
 * Track attendance across multiple events by the same artist
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Sparkles,
  Lock,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle,
  Star,
  Gift,
  ChevronRight,
  Trophy,
  Zap,
} from 'lucide-react';
import { currentAddress } from '../lib/signer';
import { ARTIST_COLLECTIONS, DEMO_TICKETS, type ArtistCollection, type BadgeRarity } from '../lib/demoTickets';
import { Tooltip } from '../components/Tooltip';

type ViewMode = 'all' | 'in-progress' | 'completed';

export function Collections() {
  const [collections, setCollections] = useState<ArtistCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedCollection, setSelectedCollection] = useState<ArtistCollection | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const address = currentAddress();

  useEffect(() => {
    if (address && !isDemoMode) {
      // Load real collections from blockchain
      loadCollections();
    } else if (isDemoMode) {
      setTimeout(() => {
        setCollections(ARTIST_COLLECTIONS);
        setLoading(false);
      }, 600);
    } else {
      setLoading(false);
    }
  }, [address, isDemoMode]);

  async function loadCollections() {
    setLoading(true);
    try {
      // TODO: Fetch real collections from Sui
      setCollections(ARTIST_COLLECTIONS);
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDemoMode = () => {
    setIsDemoMode(true);
    setLoading(true);
  };

  const filteredCollections = collections.filter(c => {
    if (viewMode === 'completed') return c.completionPercentage === 100;
    if (viewMode === 'in-progress') return c.completionPercentage > 0 && c.completionPercentage < 100;
    return true;
  });

  const totalBadges = collections.reduce((sum, c) => sum + c.badgesEarned, 0);
  const completedCollections = collections.filter(c => c.completionPercentage === 100).length;
  const rarityCount = {
    legendary: DEMO_TICKETS.filter(t => t.badge?.rarity === 'legendary').length,
    epic: DEMO_TICKETS.filter(t => t.badge?.rarity === 'epic').length,
    rare: DEMO_TICKETS.filter(t => t.badge?.rarity === 'rare').length,
    common: DEMO_TICKETS.filter(t => t.badge?.rarity === 'common').length,
  };

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
              <Award className="h-8 w-8 text-[#4DA2FF]" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">Connect to view collections</h2>
            <p className="mb-8 text-white/60">
              Track your attendance badges and artist-specific collections.
            </p>
            <div className="flex flex-col gap-3">
              <button className="rounded-xl bg-[#4DA2FF] px-6 py-3 font-semibold text-white transition-all hover:bg-[#5DADFF] active:scale-[0.98]">
                Connect Wallet
              </button>
              <button
                onClick={handleDemoMode}
                className="rounded-xl border border-white/12 bg-white/[0.02] px-6 py-3 font-medium text-white/80 transition-all hover:bg-white/[0.06]"
              >
                View Demo Collections
              </button>
            </div>
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
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#4DA2FF]/20 border-t-[#4DA2FF]" />
            <p className="text-white/60">Loading your collections...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061522]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div 
          className="absolute left-[20%] top-[10%] h-[30vmax] w-[30vmax] rounded-full bg-[#4DA2FF]/5 blur-[100px]"
        />
        <div 
          className="absolute right-[15%] top-[40%] h-[25vmax] w-[25vmax] rounded-full bg-purple-500/5 blur-[100px]"
        />
      </div>

      <div className="mx-auto max-w-screen-xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-3 text-3xl font-semibold text-white">
                <Award className="h-8 w-8 text-[#4DA2FF]" />
                My Collections
              </h1>
              <p className="text-white/60">
                Artist-specific attendance badges and soulbound NFTs
              </p>
              {isDemoMode && (
                <Tooltip content="Viewing demo data. Connect wallet to see your real collections.">
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#FFB020]/10 px-3 py-1 text-xs font-medium text-[#FFB020]">
                    <Sparkles className="h-3 w-3" />
                    Demo mode
                  </div>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatCard
              icon={Award}
              label="Total Badges"
              value={totalBadges}
              color="blue"
            />
            <StatCard
              icon={Trophy}
              label="Collections"
              value={`${completedCollections}/${collections.length}`}
              color="purple"
            />
            <StatCard
              icon={Star}
              label="Legendary"
              value={rarityCount.legendary}
              color="gold"
            />
            <StatCard
              icon={Zap}
              label="Epic"
              value={rarityCount.epic}
              color="violet"
            />
          </div>

          {/* Rarity Breakdown */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="mb-3 text-sm font-medium text-white/70">Badge Rarity Distribution</h3>
            <div className="flex gap-4">
              <RarityPill rarity="legendary" count={rarityCount.legendary} />
              <RarityPill rarity="epic" count={rarityCount.epic} />
              <RarityPill rarity="rare" count={rarityCount.rare} />
              <RarityPill rarity="common" count={rarityCount.common} />
            </div>
          </div>

          {/* View Mode Filter */}
          <div className="flex items-center gap-2">
            {(['all', 'in-progress', 'completed'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-[#4DA2FF]/20 text-[#4DA2FF] ring-2 ring-[#4DA2FF]/30 shadow-[0_0_12px_rgba(77,162,255,0.12)]'
                    : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {mode === 'all' ? 'All Collections' : mode === 'in-progress' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredCollections.map((collection, i) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={i}
              onClick={() => setSelectedCollection(collection)}
            />
          ))}
        </div>

        {filteredCollections.length === 0 && (
          <div className="mx-auto mt-12 max-w-md text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
              <Award className="h-8 w-8 text-white/40" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No collections found</h3>
            <p className="mb-6 text-sm text-white/60">
              Attend events to start earning badges and building collections.
            </p>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4DA2FF]/10 px-5 py-2.5 text-sm font-medium text-[#4DA2FF] transition-all hover:bg-[#4DA2FF]/20"
            >
              Browse Events
            </a>
          </div>
        )}
      </div>

      {/* Collection Detail Modal */}
      <AnimatePresence>
        {selectedCollection && (
          <CollectionDetailModal
            collection={selectedCollection}
            onClose={() => setSelectedCollection(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'blue' | 'purple' | 'gold' | 'violet';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-[#4DA2FF]/15 to-[#5AE0E5]/10 text-[#4DA2FF]',
    purple: 'from-purple-500/15 to-purple-400/10 text-purple-400',
    gold: 'from-amber-500/15 to-yellow-400/10 text-amber-400',
    violet: 'from-violet-500/15 to-violet-400/10 text-violet-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
    >
      <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-white/50">{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </motion.div>
  );
}

interface RarityPillProps {
  rarity: BadgeRarity;
  count: number;
}

function RarityPill({ rarity, count }: RarityPillProps) {
  const config = {
    legendary: { color: 'from-amber-500 to-yellow-400', label: 'Legendary' },
    epic: { color: 'from-violet-500 to-purple-500', label: 'Epic' },
    rare: { color: 'from-blue-500 to-cyan-400', label: 'Rare' },
    common: { color: 'from-gray-500 to-gray-400', label: 'Common' },
  }[rarity];

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${config.color}`} />
      <span className="text-sm font-medium text-white">{config.label}</span>
      <span className="ml-auto text-sm text-white/50">{count}</span>
    </div>
  );
}

interface CollectionCardProps {
  collection: ArtistCollection;
  index: number;
  onClick: () => void;
}

function CollectionCard({ collection, index, onClick }: CollectionCardProps) {
  const isCompleted = collection.completionPercentage === 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Header with progress */}
      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="mb-1 text-lg font-semibold text-white group-hover:text-[#4DA2FF] transition-colors">
              {collection.artistName}
            </h3>
            <p className="text-sm text-white/60">{collection.description}</p>
          </div>
          {isCompleted && (
            <Tooltip content="Collection completed!">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-400/10">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
            </Tooltip>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-white/70">Progress</span>
            <span className="font-semibold text-white">{collection.badgesEarned}/{collection.totalEvents}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${collection.completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
              className={`h-full rounded-full ${
                isCompleted
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-[#4DA2FF] to-[#5AE0E5]'
              }`}
            />
          </div>
        </div>

        {/* Badges Preview */}
        <div className="mb-4 flex items-center gap-2">
          {collection.badges.slice(0, 3).map((badge, i) => (
            <BadgeThumbnail key={i} badge={badge} />
          ))}
          {collection.badgesEarned > 3 && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-xs font-medium text-white/60">
              +{collection.badgesEarned - 3}
            </div>
          )}
          {collection.badgesEarned < collection.totalEvents && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.01]">
              <Lock className="h-4 w-4 text-white/30" />
            </div>
          )}
        </div>

        {/* Rewards */}
        {collection.specialRewards && collection.specialRewards.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/70">
              <Gift className="h-3 w-3" />
              Special Rewards
            </div>
            <div className="space-y-1">
              {collection.specialRewards.map((reward, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                  <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#4DA2FF]" />
                  <span>{reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Details CTA */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-white/60">View collection details</span>
          <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-[#4DA2FF] transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

function BadgeThumbnail({ badge }: { badge: any }) {
  const rarityColor = {
    legendary: 'from-amber-500/30 to-yellow-400/20 ring-amber-500/50',
    epic: 'from-violet-500/30 to-purple-500/20 ring-violet-500/50',
    rare: 'from-blue-500/30 to-cyan-400/20 ring-blue-500/50',
    common: 'from-gray-500/30 to-gray-400/20 ring-gray-500/50',
  }[badge.rarity || 'common'];

  return (
    <Tooltip content={badge.metadata?.specialAttribute || 'Badge'}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ${rarityColor}`}>
        <Award className="h-6 w-6 text-white" />
      </div>
    </Tooltip>
  );
}

interface CollectionDetailModalProps {
  collection: ArtistCollection;
  onClose: () => void;
}

function CollectionDetailModal({ collection, onClose }: CollectionDetailModalProps) {
  const attendedEvents = DEMO_TICKETS.filter(
    t => t.badge && t.badge.metadata?.collectionId === collection.id
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/12 bg-[#0a1929] p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4DA2FF]/15 to-[#5AE0E5]/10">
              <Award className="h-7 w-7 text-[#4DA2FF]" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{collection.artistName}</h2>
              <p className="text-white/60">{collection.description}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">Collection Progress</span>
              <span className="text-sm font-semibold text-white">
                {collection.badgesEarned} / {collection.totalEvents} ({collection.completionPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4DA2FF] to-[#5AE0E5]"
                style={{ width: `${collection.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rewards */}
        {collection.specialRewards && collection.specialRewards.length > 0 && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <Gift className="h-4 w-4" />
              Special Rewards
            </h3>
            <div className="space-y-2">
              {collection.specialRewards.map((reward, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4DA2FF]" />
                  <span>{reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attended Events */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Attended Events</h3>
          <div className="space-y-3">
            {attendedEvents.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white">{ticket.title}</h4>
                    <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ticket.start).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ticket.venue}
                      </span>
                    </div>
                  </div>
                  {ticket.badge?.rarity && (
                    <RarityBadge rarity={ticket.badge.rarity} />
                  )}
                </div>
                {ticket.badge?.metadata?.specialAttribute && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#4DA2FF]/10 px-2 py-1 text-xs font-medium text-[#4DA2FF]">
                    <Star className="h-3 w-3" />
                    {ticket.badge.metadata.specialAttribute}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RarityBadge({ rarity }: { rarity: BadgeRarity }) {
  const config = {
    legendary: { color: 'from-amber-500 to-yellow-400', label: 'Legendary', icon: Trophy },
    epic: { color: 'from-violet-500 to-purple-500', label: 'Epic', icon: Zap },
    rare: { color: 'from-blue-500 to-cyan-400', label: 'Rare', icon: Star },
    common: { color: 'from-gray-500 to-gray-400', label: 'Common', icon: Award },
  }[rarity];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${config.color} px-2 py-1`}>
      <Icon className="h-3 w-3 text-white" />
      <span className="text-xs font-semibold text-white">{config.label}</span>
    </div>
  );
}
