import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from './Button';

interface TransferModalProps {
  ticket: {
    id: string;
    title: string;
    venue?: string;
    date?: string;
    serialNumber?: number;
  };
  onClose: () => void;
  onTransfer: (ticketId: string, recipient: string) => Promise<void>;
}

export function TransferModal({ ticket, onClose, onTransfer }: TransferModalProps) {
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'address' | 'email'>('address');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onTransfer(ticket.id, recipient);
      onClose();
    } catch (error) {
      console.error('Failed to transfer ticket:', error);
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
          Transfer ticket
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 rounded-xl border border-white/12 bg-white/[0.02] p-1">
            <button
              type="button"
              onClick={() => setMode('address')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'address'
                  ? 'bg-[#4DA2FF] text-white'
                  : 'text-white/70 hover:text-white/90'
              }`}
            >
              Wallet Address
            </button>
            <button
              type="button"
              onClick={() => setMode('email')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'email'
                  ? 'bg-[#4DA2FF] text-white'
                  : 'text-white/70 hover:text-white/90'
              }`}
            >
              zkLogin Email
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
              {mode === 'address' ? 'Recipient Address' : 'Recipient Email'}
            </label>
            <input
              type={mode === 'email' ? 'email' : 'text'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={
                mode === 'address'
                  ? '0x...'
                  : 'user@example.com'
              }
              className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 font-mono text-sm text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
              required
            />
            <p className="mt-2 text-xs text-white/60">
              {mode === 'address'
                ? 'Enter a valid Sui wallet address'
                : 'Recipient will receive via zkLogin'}
            </p>
          </div>

          <div className="rounded-lg border border-white/12 bg-white/[0.02] p-4">
            <h4 className="mb-2 text-sm font-medium text-[#DCE7F0]">Transfer details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Ticket</span>
                <span className="text-[#DCE7F0]">{ticket.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Network fee</span>
                <span className="tabular-nums text-[#DCE7F0]">~0.01 SUI</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/50">
              This action cannot be undone. Make sure the recipient address is correct.
            </p>
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
              <Send className="mr-2 h-4 w-4" />
              Transfer ticket
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
