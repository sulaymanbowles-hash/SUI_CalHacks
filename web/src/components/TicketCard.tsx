import { Ticket as TicketIcon, Calendar, MapPin } from 'lucide-react';
import { Button } from './Button';

type TicketStatus = 'owned' | 'listed' | 'used' | 'transferred';

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

interface TicketCardProps {
  ticket: Ticket;
  onViewQR: (ticket: Ticket) => void;
  onList: (ticket: Ticket) => void;
  onCancelListing: (ticket: Ticket) => void;
  onTransfer: (ticket: Ticket) => void;
  onDetails: (ticket: Ticket) => void;
}

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const seatLabel = (seat: Ticket['seat']) => {
  const parts = [];
  if (seat.section) parts.push(`Sec ${seat.section}`);
  if (seat.row) parts.push(`Row ${seat.row}`);
  if (seat.seat) parts.push(`Seat ${seat.seat}`);
  return parts.join(' • ') || 'GA';
};

const statusLabels: Record<TicketStatus, string> = {
  owned: 'Owned',
  listed: 'Listed',
  used: 'Used',
  transferred: 'Transferred',
};

const statusColors: Record<TicketStatus, string> = {
  owned: 'bg-[#4DA2FF]/10 text-[#4DA2FF] border-[#4DA2FF]/30',
  listed: 'bg-green-500/10 text-green-500 border-green-500/30',
  used: 'bg-white/5 text-white/50 border-white/10',
  transferred: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
};

export function TicketCard({
  ticket,
  onViewQR,
  onList,
  onCancelListing,
  onTransfer,
  onDetails,
}: TicketCardProps) {
  return (
    <article className="card group overflow-hidden p-0 transition-transform duration-200 hover:scale-[1.01]">
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#4DA2FF]/20 to-[#5AE0E5]/20">
          {ticket.posterUrl ? (
            <img
              src={ticket.posterUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">
              <TicketIcon className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-[#DCE7F0]">{ticket.title}</h3>
          <div className="mt-1 space-y-0.5 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="tabular-nums">{formatDate(ticket.dateISO)}</span>
              <span className="text-white/30">•</span>
              <span className="truncate">{ticket.venue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="tabular-nums">{seatLabel(ticket.seat)}</span>
            </div>
          </div>

          {/* Status chips */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[ticket.status]}`}
            >
              {statusLabels[ticket.status]}
            </span>
            {ticket.status === 'listed' && ticket.listing && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.02] px-2.5 py-0.5 text-xs font-medium tabular-nums text-[#DCE7F0]">
                {ticket.listing.priceSUI.toFixed(2)} SUI
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-white/10 p-3">
        <Button onClick={() => onViewQR(ticket)} variant="primary" className="flex-1">
          View QR
        </Button>
        {ticket.status === 'owned' && (
          <Button onClick={() => onList(ticket)} variant="secondary" className="flex-1">
            List
          </Button>
        )}
        {ticket.status === 'listed' && (
          <Button onClick={() => onCancelListing(ticket)} variant="secondary" className="flex-1">
            Cancel
          </Button>
        )}
        <button
          onClick={() => onTransfer(ticket)}
          className="rounded-xl px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
        >
          Transfer
        </button>
        <button
          onClick={() => onDetails(ticket)}
          className="rounded-xl px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
        >
          Details
        </button>
      </div>
    </article>
  );
}
