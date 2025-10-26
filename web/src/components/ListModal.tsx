import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { Button } from './Button';
import { Tooltip } from './Tooltip';
import {
  computeAntiScalpTaxCents,
  suiToCents,
  centsToSui,
  DEFAULT_ANTI_SCALP_CONFIG,
  type AntiScalpConfig,
} from '../utils/antiScalp';

interface ListModalProps {
  ticket: {
    id: string;
    title: string;
    royaltyPct: number;
    organizerPct: number;
    facePrice?: number; // MSRP baseline
    purchasePrice?: number; // Original purchase price
    listing?: {
      priceSUI: number;
    };
  };
  event?: {
    antiScalp?: AntiScalpConfig;
  };
  onClose: () => void;
  onList: (ticketId: string, price: number) => Promise<void>;
}

export function ListModal({ ticket, event, onClose, onList }: ListModalProps) {
  const baseline = ticket.facePrice || ticket.purchasePrice || null;
  const initialPrice = ticket.listing?.priceSUI ?? baseline ?? 1;
  
  const [price, setPrice] = useState(initialPrice);
  const [loading, setLoading] = useState(false);

  // Get anti-scalp config (default to enabled for demo)
  const antiScalpConfig = event?.antiScalp ?? DEFAULT_ANTI_SCALP_CONFIG;

  // Calculate anti-scalper tax
  const { antiScalpTax, isBelowBaseline, showTax } = useMemo(() => {
    if (!baseline || !antiScalpConfig.enabled) {
      return { antiScalpTax: 0, isBelowBaseline: false, showTax: false };
    }

    const askingCents = suiToCents(price);
    const baselineCents = suiToCents(baseline);
    const taxCents = computeAntiScalpTaxCents(askingCents, baselineCents, antiScalpConfig);
    
    return {
      antiScalpTax: centsToSui(taxCents),
      isBelowBaseline: price <= baseline,
      showTax: price > baseline,
    };
  }, [price, baseline, antiScalpConfig]);

  const artist = +(price * ticket.royaltyPct).toFixed(4);
  const org = +(price * ticket.organizerPct).toFixed(4);
  const network = 0.03;
  const seller = +(price - artist - org - network - antiScalpTax).toFixed(4);

  // Slider range based on MSRP
  const sliderMin = baseline ? +(baseline * 0.8).toFixed(2) : 0.05;
  const sliderMax = baseline ? +(baseline * 3.0).toFixed(2) : 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onList(ticket.id, price);
      onClose();
    } catch (error) {
      console.error('Failed to list ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="card relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
          List ticket for resale
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
              Resale Price
            </label>
            <div className="relative">
              {/* Token prefix chip */}
              <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-white/[0.08] px-2 py-1">
                <span className="text-xs font-medium text-white/70">SUI</span>
              </div>
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-white/12 bg-white/[0.02] pl-[4.5rem] pr-4 text-lg tabular-nums text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/20"
                required
              />
            </div>
            
            {/* Price slider with baseline tick */}
            <div className="relative mt-4">
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step="0.05"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-[#4DA2FF]"
                style={{
                  background: baseline ? `linear-gradient(to right, 
                    #4DA2FF 0%, 
                    #4DA2FF ${((baseline - sliderMin) / (sliderMax - sliderMin)) * 100}%, 
                    #5AE0E5 ${((baseline - sliderMin) / (sliderMax - sliderMin)) * 100}%, 
                    #5AE0E5 100%)` : undefined
                }}
              />
              {baseline && (
                <div
                  className="absolute top-6 -translate-x-1/2 text-[10px] font-medium text-white/50"
                  style={{ left: `${((baseline - sliderMin) / (sliderMax - sliderMin)) * 100}%` }}
                >
                  Baseline
                </div>
              )}
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-white/60">
                Min {sliderMin.toFixed(2)} SUI • Max {sliderMax.toFixed(2)} SUI
              </span>
              {baseline && isBelowBaseline && (
                <span className="text-green-400/80">
                  Below baseline (no tax)
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between text-sm font-medium text-[var(--muted)]">
              <span>Proceeds preview</span>
              {baseline && (
                <span className="text-xs text-white/50">
                  Baseline: {baseline.toFixed(2)} SUI
                </span>
              )}
            </div>
            
            <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              {/* Resale price */}
              <div className="flex items-center justify-between text-sm border-b border-white/8 pb-2">
                <span className="font-medium text-white/70">Resale price</span>
                <span className="tabular-nums font-semibold text-white">
                  {price.toFixed(2)} SUI
                </span>
              </div>

              {/* You receive - highlighted */}
              <div className="flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-2">
                <span className="font-semibold text-green-400">You receive</span>
                <span className="tabular-nums font-semibold text-green-400">
                  {seller.toFixed(2)} SUI
                </span>
              </div>

              {/* Fee breakdown */}
              <div className="space-y-1.5 border-t border-white/8 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Artist royalty ({(ticket.royaltyPct * 100).toFixed(0)}%)</span>
                  <span className="tabular-nums text-white/70">{artist.toFixed(2)} SUI</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Organizer fee ({(ticket.organizerPct * 100).toFixed(0)}%)</span>
                  <span className="tabular-nums text-white/70">{org.toFixed(2)} SUI</span>
                </div>

                {/* Anti-scalper tax - show when applicable */}
                {baseline && antiScalpConfig.enabled && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className={showTax ? "text-amber-400/80" : "text-white/60"}>
                        Anti-scalper tax (est.)
                      </span>
                      <Tooltip content="Progressive fee on amount above baseline. Final tax enforced on-chain at transfer.">
                        <Info className="h-3.5 w-3.5 text-white/40" />
                      </Tooltip>
                    </div>
                    {showTax ? (
                      <span className="tabular-nums text-amber-400/80">
                        -{antiScalpTax.toFixed(2)} SUI
                      </span>
                    ) : (
                      <span className="text-xs text-green-400/70">
                        No tax
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Network fee</span>
                  <span className="tabular-nums text-white/70">{network.toFixed(2)} SUI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer disclosure */}
          <div className="rounded-lg border border-white/8 bg-white/[0.01] px-4 py-3 text-xs leading-relaxed text-white/50">
            Royalties are enforced on-chain.
            {antiScalpConfig.enabled && baseline && (
              <> Final anti-scalp tax is computed and enforced at transfer.</>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/14 px-5 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={loading}>
              List ticket
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
