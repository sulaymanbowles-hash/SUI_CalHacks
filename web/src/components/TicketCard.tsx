import { Ticket as TicketIcon, Calendar, MapPin } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';

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
  owned: 'bg-brand/12 text-brand border-brand/20',
  listed: 'bg-success/12 text-success border-success/20',
  used: 'bg-surface-2 text-muted border-border',
  transferred: 'bg-warning/12 text-warning border-warning/20',
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
    <motion.article
      whileHover={{ y: -2 }}
      className="card group overflow-hidden p-0 transition-all duration-200 hover:shadow-[0_12px_32px_rgba(3,15,28,0.18)]"
    >
      <div className="flex gap-4 p-5">
        {/* Poster with subtle inner stroke */}
        <div className="poster-img relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2">
          {ticket.posterUrl ? (
            <img
              src={ticket.posterUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted/30">
              <TicketIcon className="h-10 w-10" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-[Inter_Tight] text-lg font-semibold tracking-tight text-ink">{ticket.title}</h3>
          <div className="mt-2 space-y-1.5 text-[15px] text-muted">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0 opacity-50" />
              <span className="tabular">{formatDate(ticket.dateISO)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 opacity-50" />
              <span className="truncate">{ticket.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <TicketIcon className="h-4 w-4 flex-shrink-0 opacity-50" />
              <span className="tabular text-sm">{seatLabel(ticket.seat)}</span>
            </div>
          </div>

          {/* Status chips */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className={`chip border text-xs font-medium ${statusColors[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
            {ticket.status === 'listed' && ticket.listing && (
              <span className="chip border border-border bg-surface-2 tabular text-xs font-semibold text-ink">
                {ticket.listing.priceSUI.toFixed(2)} SUI
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border bg-surface-1/40 p-3">
        <Button onClick={() => onViewQR(ticket)} variant="primary" className="flex-1 text-sm">
          View QR
        </Button>
        {ticket.status === 'owned' && (
          <Button onClick={() => onList(ticket)} variant="outline" className="flex-1 text-sm">
            List
          </Button>
        )}
        {ticket.status === 'listed' && (
          <Button onClick={() => onCancelListing(ticket)} variant="outline" className="flex-1 text-sm">
            Cancel
          </Button>
        )}
        <button
          onClick={() => onTransfer(ticket)}
          className="rounded-lg px-3.5 text-sm font-medium text-muted transition-all hover:bg-surface-2 hover:text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas"
          style={{ minHeight: '40px' }}
        >
          Transfer
        </button>
      </div>
    </motion.article>
  );
}
