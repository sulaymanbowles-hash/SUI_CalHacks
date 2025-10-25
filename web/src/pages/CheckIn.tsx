/**
 * Check-in Page - Scan tickets at the door
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Ticket as TicketIcon, XCircle } from 'lucide-react';
import { DevWalletBadge } from '../components/DevWalletBadge';
import Scanner from '../components/Scanner';
import { markUsed } from '../lib/ptb';
import { getObject } from '../lib/rpc';
import { explorerTx, explorerObj, shortenAddress } from '../lib/explorer';
import { parseMoveError } from '../lib/sui';
import { flags } from '../lib/env';

type VerifyResult = 'admit' | 'already-used' | 'invalid';

export function CheckIn() {
  const [searchParams] = useSearchParams();
  const ticketIdFromUrl = searchParams.get('ticket') || '';
  
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'result'>('idle');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [digest, setDigest] = useState<string>();
  const [error, setError] = useState<string>();
  const [ticketInfo, setTicketInfo] = useState<{ serialNumber: string; used: boolean; usedAt?: string }>();

  useEffect(() => {
    if (ticketIdFromUrl && ticketIdFromUrl.startsWith('0x')) {
      handleVerify(ticketIdFromUrl);
    }
  }, [ticketIdFromUrl]);

  async function handleQRCode(qr: string) {
    // Extract ticket ID from QR code (might be URL or raw ID)
    let id = qr;
    if (qr.includes('ticket=')) {
      const url = new URL(qr);
      id = url.searchParams.get('ticket') || qr;
    }
    
    if (id.startsWith('0x')) {
      await handleVerify(id);
    }
  }

  async function handleVerify(id: string) {
    setTicketId(id);
    setStatus('checking');
    setError(undefined);
    setDigest(undefined);
    setResult(null);

    try {
      // Load ticket info first
      const obj = await getObject(id);
      const content = (obj.data as any)?.content;
      
      if (!content?.fields) {
        setResult('invalid');
        setStatus('result');
        setError('Not a valid ticket');
        return;
      }

      const info = {
        serialNumber: content.fields.serial_number || '?',
        used: content.fields.used || false,
        usedAt: content.fields.used ? new Date().toLocaleTimeString() : undefined,
      };
      setTicketInfo(info);

      if (info.used) {
        setResult('already-used');
        setStatus('result');
        setError(`Used at ${info.usedAt || 'earlier'}`);
        return;
      }

      // Attempt to mark as used
      const txResult = await markUsed(id);
      setDigest(txResult.digest);
      setResult('admit');
      setStatus('result');
      
      // Update ticket info
      setTicketInfo({ ...info, used: true, usedAt: new Date().toLocaleTimeString() });
      
    } catch (err: any) {
      const errorMsg = parseMoveError(err);
      
      if (errorMsg === 'Ticket already used') {
        setResult('already-used');
        setError('This ticket has already been checked in');
      } else {
        setResult('invalid');
        setError(errorMsg || err.message || 'Verification failed');
      }
      setStatus('result');
    }
  }

  function resetScanner() {
    setStatus('idle');
    setResult(null);
    setTicketId('');
    setError(undefined);
    setTicketInfo(undefined);
    setDigest(undefined);
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
            Scan ticket
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Verify ownership and admit guests
          </p>
        </div>

        {/* Result Panel */}
        {status === 'result' && result && (
          <div className="mb-6">
            {/* Admit - Green */}
            {result === 'admit' && (
              <div className="card border-2 border-green-500/50 bg-green-500/10">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-500/20">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-1 text-2xl font-bold text-green-400">Admit</h2>
                    <p className="mb-3 text-green-300">Owner verified. Ticket is valid.</p>
                    {ticketInfo && (
                      <div className="mb-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm">
                        <div className="text-green-200">Ticket #{ticketInfo.serialNumber}</div>
                        <div className="text-xs text-green-300/80">Checked in at {ticketInfo.usedAt}</div>
                      </div>
                    )}
                    {digest && (
                      <a
                        href={explorerTx(digest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-400 hover:underline"
                      >
                        View transaction →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Already Used - Amber/Red */}
            {result === 'already-used' && (
              <div className="card border-2 border-yellow-500/50 bg-yellow-500/10">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/20">
                    <AlertCircle className="h-10 w-10 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-1 text-2xl font-bold text-yellow-400">Already used</h2>
                    <p className="mb-3 text-yellow-300">{error || 'This ticket has already been checked in.'}</p>
                    {ticketInfo && (
                      <div className="mb-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
                        <div className="text-yellow-200">Ticket #{ticketInfo.serialNumber}</div>
                        {ticketId && (
                          <a
                            href={explorerObj(ticketId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-yellow-400 hover:underline"
                          >
                            View on explorer →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Invalid - Red */}
            {result === 'invalid' && (
              <div className="card border-2 border-red-500/50 bg-red-500/10">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-500/20">
                    <XCircle className="h-10 w-10 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-1 text-2xl font-bold text-red-400">Invalid</h2>
                    <p className="text-red-300">{error || 'Not a valid DropKit ticket.'}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={resetScanner}
              className="mt-4 w-full rounded-xl border border-border bg-surface-2 px-6 py-3 font-medium text-ink transition-colors hover:bg-surface-1"
            >
              Scan next ticket
            </button>
          </div>
        )}

        {/* Checking State */}
        {status === 'checking' && (
          <div className="card mb-6">
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <span className="text-lg text-muted">Verifying ticket…</span>
            </div>
          </div>
        )}

        {/* Scanner (only show when idle) */}
        {status === 'idle' && !showManualEntry && (
          <Scanner onCode={handleQRCode} />
        )}

        {/* Manual Entry Fallback */}
        {status === 'idle' && showManualEntry && (
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold text-ink">Enter ticket code</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-muted">
                Ticket Object ID
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 font-mono text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleVerify(ticketId)}
                disabled={!ticketId || !ticketId.startsWith('0x')}
                className="flex-1 rounded-xl bg-brand px-6 py-3 font-medium text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Verify ticket
              </button>
              <button
                onClick={() => setShowManualEntry(false)}
                className="rounded-xl border border-border px-4 py-3 font-medium text-muted transition-colors hover:bg-surface-1 hover:text-ink"
              >
                Back to scan
              </button>
            </div>
          </div>
        )}

        {status === 'idle' && !showManualEntry && (
          <button
            onClick={() => setShowManualEntry(true)}
            className="mt-4 w-full rounded-xl border border-border bg-surface-2 px-6 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface-1 hover:text-ink"
          >
            Enter code instead
          </button>
        )}
      </div>
    </main>
  );
}
