/**
 * Badge Viewer Modal
 * Displays soulbound attendance badge for past events with rarity tiers
 */
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, Share2, ExternalLink, Award, Trophy, Star, Zap, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '../lib/explorer';
import type { AttendanceBadge, BadgeRarity } from '../lib/demoTickets';

interface BadgeViewerProps {
  badge: AttendanceBadge | null;
  eventTitle: string;
  eventDate: string;
  onClose: () => void;
}

export function BadgeViewer({ badge, eventTitle, eventDate, onClose }: BadgeViewerProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShareProof = () => {
    if (!badge) return;
    const deeplink = `${window.location.origin}/badge/${badge.eventId}/${badge.holder}`;
    navigator.clipboard.writeText(deeplink);
    setCopied('deeplink');
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRarityConfig = (rarity?: BadgeRarity) => {
    const config = {
      legendary: {
        color: 'from-amber-500 to-yellow-400',
        bgGradient: 'from-amber-500/20 to-yellow-400/10',
        borderColor: 'border-amber-500/30',
        shadowColor: 'shadow-amber-500/30',
        icon: Trophy,
        label: 'Legendary Badge',
        description: 'Ultra-rare commemorative NFT',
      },
      epic: {
        color: 'from-violet-500 to-purple-500',
        bgGradient: 'from-violet-500/20 to-purple-500/10',
        borderColor: 'border-violet-500/30',
        shadowColor: 'shadow-violet-500/30',
        icon: Zap,
        label: 'Epic Badge',
        description: 'Rare event attendance proof',
      },
      rare: {
        color: 'from-blue-500 to-cyan-400',
        bgGradient: 'from-blue-500/20 to-cyan-400/10',
        borderColor: 'border-blue-500/30',
        shadowColor: 'shadow-blue-500/30',
        icon: Star,
        label: 'Rare Badge',
        description: 'Special attendance recognition',
      },
      common: {
        color: 'from-gray-500 to-gray-400',
        bgGradient: 'from-gray-500/20 to-gray-400/10',
        borderColor: 'border-gray-500/30',
        shadowColor: 'shadow-gray-500/30',
        icon: Award,
        label: 'Attendance Badge',
        description: 'Verified event participation',
      },
    };
    return config[rarity || 'common'];
  };

  const rarityConfig = badge ? getRarityConfig(badge.rarity) : getRarityConfig('common');
  const RarityIcon = rarityConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-[#0a1929] shadow-2xl"
        >
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-4">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
              aria-label="Close badge viewer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-1 text-xl font-semibold text-white">Attendance Badge</h2>
            <p className="text-sm text-white/60">
              {eventTitle} • {new Date(eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="p-6">
            {badge ? (
              <>
                {/* Badge Card with Rarity */}
                <div className={`mb-6 overflow-hidden rounded-2xl border ${rarityConfig.borderColor} bg-gradient-to-br ${rarityConfig.bgGradient} p-6`}>
                  <div className="mb-4 flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                      className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${rarityConfig.color} shadow-lg ${rarityConfig.shadowColor}`}
                    >
                      <RarityIcon className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </motion.div>
                  </div>
                  
                  <div className="mb-2 text-center">
                    <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${rarityConfig.color} px-3 py-1`}>
                      <Sparkles className="h-3 w-3 text-white" />
                      <span className="text-xs font-bold uppercase tracking-wide text-white">
                        {rarityConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className={`mb-1 text-center text-lg font-semibold bg-gradient-to-r ${rarityConfig.color} bg-clip-text text-transparent`}>
                    Verified Attendance
                  </h3>
                  <p className="mb-4 text-center text-xs text-white/60">
                    {rarityConfig.description}
                  </p>

                  {/* Special Attributes */}
                  {badge.metadata?.specialAttribute && (
                    <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-center">
                      <div className="mb-1 text-xs font-medium text-white/60">Special Attribute</div>
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                        <Star className="h-4 w-4" />
                        {badge.metadata.specialAttribute}
                      </div>
                      {badge.metadata.checkInOrder && (
                        <div className="mt-1 text-xs text-white/50">
                          #{badge.metadata.checkInOrder} to check in
                        </div>
                      )}
                    </div>
                  )}

                  {/* Artist Signed Badge */}
                  {badge.metadata?.artistSigned && (
                    <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-400">
                        <Trophy className="h-4 w-4" />
                        Artist Signed
                      </div>
                      <div className="mt-1 text-center text-xs text-amber-400/70">
                        Verified signature by artist
                      </div>
                    </div>
                  )}

                  {/* Badge Details */}
                  <div className="space-y-2">
                    <BadgeField
                      label="Holder"
                      value={shortenAddress(badge.holder, 8)}
                      fullValue={badge.holder}
                      onCopy={handleCopy}
                      copyId="holder"
                      copied={copied === 'holder'}
                    />
                    <BadgeField
                      label="Event ID"
                      value={shortenAddress(badge.eventId, 8)}
                      fullValue={badge.eventId}
                      onCopy={handleCopy}
                      copyId="eventId"
                      copied={copied === 'eventId'}
                    />
                    <BadgeField
                      label="Ticket ID"
                      value={shortenAddress(badge.ticketId, 8)}
                      fullValue={badge.ticketId}
                      onCopy={handleCopy}
                      copyId="ticketId"
                      copied={copied === 'ticketId'}
                    />
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                      <span className="text-xs font-medium text-white/60">Stamped at</span>
                      <span className="text-xs font-medium text-white/90">
                        {formatTimestamp(badge.stampedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Soulbound Notice */}
                <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
                  <div className="flex items-start gap-2">
                    <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                    <div>
                      <div className="text-xs font-semibold text-blue-400">Soulbound NFT</div>
                      <div className="text-xs text-blue-400/70">
                        This badge is permanently bound to your wallet and cannot be transferred.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collection Link */}
                {badge.metadata?.collectionId && (
                  <a
                    href={`/collections?id=${badge.metadata.collectionId}`}
                    className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-[#4DA2FF]" />
                      <span className="text-sm font-medium text-white">View Collection Progress</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/40" />
                  </a>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShareProof}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/[0.06]"
                    aria-label="Share proof"
                  >
                    {copied === 'deeplink' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        Share proof
                      </>
                    )}
                  </button>
                  <a
                    href={`https://suiscan.xyz/testnet/object/${badge.ticketId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/[0.06]"
                    aria-label="View on Sui"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </>
            ) : (
              // No-show state
              <div className="py-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
                  <X className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white/90">No badge found</h3>
                <p className="mb-4 text-sm leading-relaxed text-white/60">
                  No attendance badge was found for this wallet at the event's registry.
                </p>
                <a
                  href="/docs/attendance-badges"
                  className="text-sm font-medium text-[#4DA2FF] hover:text-[#5DADFF]"
                >
                  Learn more →
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface BadgeFieldProps {
  label: string;
  value: string;
  fullValue: string;
  onCopy: (text: string, id: string) => void;
  copyId: string;
  copied: boolean;
}

function BadgeField({ label, value, fullValue, onCopy, copyId, copied }: BadgeFieldProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-white/60">{label}</span>
        <span className="font-mono text-xs text-white/90">{value}</span>
      </div>
      <button
        onClick={() => onCopy(fullValue, copyId)}
        className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
