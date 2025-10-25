import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ListModalProps {
  ticket: {
    id: string;
    title: string;
    royaltyPct: number;
    organizerPct: number;
    listing?: {
      priceSUI: number;
    };
  };
  onClose: () => void;
  onList: (ticketId: string, price: number) => Promise<void>;
}

export function ListModal({ ticket, onClose, onList }: ListModalProps) {
  const [price, setPrice] = useState(ticket.listing?.priceSUI ?? 1);
  const [loading, setLoading] = useState(false);

  const artist = +(price * ticket.royaltyPct).toFixed(2);
  const org = +(price * ticket.organizerPct).toFixed(2);
  const network = 0.03;
  const seller = +(price - artist - org - network).toFixed(2);

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
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
          List ticket for resale
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
              Resale Price (SUI)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/50">
                SUI
              </span>
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-white/12 bg-white/[0.02] py-3 pl-12 pr-4 tabular-nums text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                required
              />
            </div>
            <p className="mt-2 text-xs text-white/60">
              Minimum 0.05 SUI • Royalties enforced by transfer policy
            </p>
          </div>

          <div>
            <div className="mb-3 text-sm font-medium text-[var(--muted)]">Fee breakdown</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="chip">
                <div className="text-xs text-white/60">Seller receives</div>
                <div className="tabular-nums font-medium text-[#DCE7F0]">{seller.toFixed(2)} SUI</div>
              </div>
              <div className="chip">
                <div className="text-xs text-white/60">Artist royalty ({(ticket.royaltyPct * 100).toFixed(0)}%)</div>
                <div className="tabular-nums font-medium text-[#DCE7F0]">{artist.toFixed(2)} SUI</div>
              </div>
              <div className="chip">
                <div className="text-xs text-white/60">Organizer fee ({(ticket.organizerPct * 100).toFixed(0)}%)</div>
                <div className="tabular-nums font-medium text-[#DCE7F0]">{org.toFixed(2)} SUI</div>
              </div>
              <div className="chip">
                <div className="text-xs text-white/60">Network fee</div>
                <div className="tabular-nums font-medium text-[#DCE7F0]">{network.toFixed(2)} SUI</div>
              </div>
            </div>
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
