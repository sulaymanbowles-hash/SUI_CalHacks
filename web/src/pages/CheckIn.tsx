/**
 * Check-in Page - Mark tickets as used with double-use prevention
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Ticket as TicketIcon } from 'lucide-react';
import { DevWalletBadge } from '../components/DevWalletBadge';
import { markUsed } from '../lib/ptb';
import { getObject } from '../lib/rpc';
import { explorerTx, explorerObj, shortenAddress } from '../lib/explorer';
import { parseMoveError } from '../lib/sui';
import { flags } from '../lib/env';

export function CheckIn() {
  const [searchParams] = useSearchParams();
  const ticketIdFromUrl = searchParams.get('ticket') || '';
  
  const [ticketId, setTicketId] = useState(ticketIdFromUrl);
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error' | 'already-used'>('idle');
  const [digest, setDigest] = useState<string>();
  const [error, setError] = useState<string>();
  const [ticketInfo, setTicketInfo] = useState<{ serialNumber: string; used: boolean }>();

  useEffect(() => {
    if (ticketIdFromUrl && ticketIdFromUrl.startsWith('0x')) {
      loadTicketInfo(ticketIdFromUrl);
    }
  }, [ticketIdFromUrl]);

  async function loadTicketInfo(id: string) {
    try {
      const obj = await getObject(id);
      const content = (obj.data as any)?.content;
      
      if (content?.fields) {
        setTicketInfo({
          serialNumber: content.fields.serial_number || '?',
          used: content.fields.used || false,
        });
        
        if (content.fields.used) {
          setStatus('already-used');
        }
      }
    } catch (err) {
      console.error('Failed to load ticket info:', err);
    }
  }

  async function handleCheckIn() {
    if (!ticketId || !ticketId.startsWith('0x')) {
      setError('Please enter a valid ticket ID');
      return;
    }

    setStatus('checking');
    setError(undefined);
    setDigest(undefined);

    try {
      // Load ticket info first to check if already used
      await loadTicketInfo(ticketId);
      
      // Attempt to mark as used
      const result = await markUsed(ticketId);
      setStatus('success');
      setDigest(result.digest);
      
      // Reload ticket info to show updated state
      setTimeout(() => loadTicketInfo(ticketId), 2000);
      
    } catch (err: any) {
      const errorMsg = parseMoveError(err);
      
      if (errorMsg === 'Ticket already used') {
        setStatus('already-used');
        setError('This ticket has already been checked in and cannot be used again.');
      } else {
        setStatus('error');
        setError(errorMsg || err.message || 'Check-in failed');
      }
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-vignette noise py-12">
      {flags.useEphemeralSigner && <DevWalletBadge />}
      
      <div className="mx-auto max-w-2xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
            <TicketIcon className="h-8 w-8 text-[#4DA2FF]" />
          </div>
          <h1 className="font-[Inter_Tight] text-4xl tracking-tight text-[#DCE7F0]">
            Ticket Check-in
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Scan or enter ticket ID to mark as used
          </p>
        </div>

        {/* Check-in Card */}
        <div className="card">
          {/* Ticket ID Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
              Ticket Object ID
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 font-mono text-sm text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
              disabled={status === 'checking'}
            />
            <p className="mt-2 text-xs text-white/50">
              Enter the ticket's on-chain object ID
            </p>
          </div>

          {/* Ticket Info Preview */}
          {ticketInfo && (
            <div className="mb-6 rounded-lg border border-white/12 bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Ticket #{ticketInfo.serialNumber}</span>
                {ticketInfo.used ? (
                  <span className="rounded-full bg-gray-500/20 px-3 py-1 text-xs text-gray-400">
                    ✓ Already Used
                  </span>
                ) : (
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                    ● Active
                  </span>
                )}
              </div>
              <a
                href={explorerObj(ticketId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#4DA2FF] hover:underline"
              >
                View on explorer →
              </a>
            </div>
          )}

          {/* Check-in Button */}
          <button
            onClick={handleCheckIn}
            disabled={status === 'checking' || !ticketId || status === 'already-used'}
            className="w-full rounded-xl bg-[#4DA2FF] px-6 py-4 font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:scale-[1.02]"
          >
            {status === 'checking' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Checking in...
              </span>
            ) : status === 'already-used' ? (
              'Already Checked In'
            ) : (
              'Check In Ticket'
            )}
          </button>

          {/* Success State */}
          {status === 'success' && digest && (
            <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-bold">Check-in successful!</span>
              </div>
              <p className="mb-3 text-sm text-green-300">
                This ticket has been marked as used and cannot be checked in again.
              </p>
              <a
                href={explorerTx(digest)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-green-400 hover:underline"
              >
                View transaction →
              </a>
            </div>
          )}

          {/* Already Used State */}
          {status === 'already-used' && (
            <div className="mt-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-bold">Already checked in</span>
              </div>
              <p className="text-sm text-yellow-300">
                {error || 'This ticket has already been used and cannot be checked in again.'}
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && error && (
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-bold">Check-in failed</span>
              </div>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Double-use Prevention Info */}
        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm">
          <h3 className="mb-2 font-bold text-[#4DA2FF]">🔒 Double-use Prevention</h3>
          <p className="text-[var(--muted)]">
            Tickets can only be checked in once. The blockchain enforces this rule automatically,
            preventing ticket reuse or fraud. Once a ticket is marked as used, any subsequent
            check-in attempts will be rejected with error code <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-xs">E_ALREADY_USED</code>.
          </p>
        </div>

        {/* Quick Test Instructions */}
        {flags.useEphemeralSigner && (
          <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm">
            <h3 className="mb-2 font-bold text-blue-400">💡 Quick Test</h3>
            <ol className="list-inside list-decimal space-y-1 text-blue-300">
              <li>Go to <a href="/app" className="underline">/app</a> and mint a ticket</li>
              <li>Copy the ticket ID and paste it here</li>
              <li>Click "Check In Ticket" (should succeed)</li>
              <li>Click "Check In Ticket" again (should fail with "Already used")</li>
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
