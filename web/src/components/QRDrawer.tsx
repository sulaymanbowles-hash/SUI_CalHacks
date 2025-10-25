import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRDrawerProps {
  ticket: {
    id: string;
    title: string;
    dateISO: string;
    venue: string;
    seat: { section?: string; row?: string; seat?: string };
    policyObjectId: string;
    purchaseTx: string;
  };
  onClose: () => void;
}

export function QRDrawer({ ticket, onClose }: QRDrawerProps) {
  const [ttl, setTtl] = useState(30);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Simulate wallet ownership verification
    const timer = setTimeout(() => setVerified(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTtl((prev) => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setTtl(30);
  };

  const seatLabel = (seat: typeof ticket.seat) => {
    const parts = [];
    if (seat.section) parts.push(`Sec ${seat.section}`);
    if (seat.row) parts.push(`Row ${seat.row}`);
    if (seat.seat) parts.push(`Seat ${seat.seat}`);
    return parts.join(' • ') || 'General Admission';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="card relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
          aria-label="Close drawer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
            {ticket.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{seatLabel(ticket.seat)}</p>
        </div>

        {/* QR Code */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl border border-white/12 bg-white p-6">
            <QRCodeSVG
              value={`dropkit://ticket/${ticket.id}`}
              size={240}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* TTL Counter */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-white/12 p-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-[#4DA2FF]" />
            <span className="text-sm text-[var(--muted)]">Refresh in</span>
            <span className="tabular-nums text-sm font-medium text-[#DCE7F0]">{ttl}s</span>
          </div>
          <button
            onClick={handleRefresh}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#4DA2FF] transition-colors hover:bg-[#4DA2FF]/10"
          >
            Refresh now
          </button>
        </div>

        {/* Verification Status */}
        {verified && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-500">Ownership verified</span>
          </motion.div>
        )}

        {/* Metadata */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Transfer policy</span>
            <a
              href={`https://suiscan.xyz/testnet/object/${ticket.policyObjectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[#4DA2FF] hover:underline"
            >
              {ticket.policyObjectId.slice(0, 8)}...
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Purchase transaction</span>
            <a
              href={`https://suiscan.xyz/testnet/tx/${ticket.purchaseTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[#4DA2FF] hover:underline"
            >
              {ticket.purchaseTx.slice(0, 8)}...
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
