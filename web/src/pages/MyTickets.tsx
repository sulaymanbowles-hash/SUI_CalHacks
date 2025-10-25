import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, ShoppingBag, ExternalLink, Loader2 } from 'lucide-react';
import { FadeRise } from '../components/FadeRise';
import { DevWalletBadge } from '../components/DevWalletBadge';
import { getOwnedTickets, type OwnedTicket } from '../lib/rpc';
import { currentAddress } from '../lib/signer';
import { explorerObj, shortenAddress } from '../lib/explorer';
import { flags } from '../lib/env';

export function MyTickets() {
  const [tickets, setTickets] = useState<OwnedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const address = currentAddress();

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    
    loadTickets();
  }, [address]);

  async function loadTickets() {
    setLoading(true);
    setError(undefined);
    
    try {
      const ownedTickets = await getOwnedTickets(address);
      setTickets(ownedTickets);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  // No wallet
  if (!address) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-vignette noise">
        <div className="mx-auto flex min-h-[80vh] max-w-screen-xl items-center justify-center px-6">
          <div className="card max-w-md text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
              <TicketIcon className="h-8 w-8 text-[#4DA2FF]" />
            </div>
            <h2 className="mb-3 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
              No wallet connected
            </h2>
            <p className="text-[var(--muted)]">
              Refresh the page to generate a dev wallet and view your tickets.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Loading state
  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-vignette noise py-12">
        {flags.useEphemeralSigner && <DevWalletBadge />}
        
        <div className="mx-auto flex min-h-[60vh] max-w-screen-xl items-center justify-center px-6">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#4DA2FF]" />
            <p className="text-[var(--muted)]">Loading your tickets...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-vignette noise py-12">
        {flags.useEphemeralSigner && <DevWalletBadge />}
        
        <div className="mx-auto flex min-h-[60vh] max-w-screen-xl items-center justify-center px-6">
          <div className="card max-w-md text-center">
            <div className="mb-4 text-red-500">⚠️</div>
            <h2 className="mb-3 font-[Inter_Tight] text-xl text-[#DCE7F0]">
              Failed to load tickets
            </h2>
            <p className="mb-4 text-sm text-[var(--muted)]">{error}</p>
            <button
              onClick={loadTickets}
              className="rounded-xl bg-[#4DA2FF] px-6 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Empty state
  if (tickets.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-vignette noise py-12">
        {flags.useEphemeralSigner && <DevWalletBadge />}
        
        <div className="mx-auto max-w-screen-xl px-6">
          <FadeRise>
            <div className="mb-12 text-center">
              <h1 className="font-[Inter_Tight] text-4xl tracking-tight text-[#DCE7F0]">
                My Tickets
              </h1>
            </div>
          </FadeRise>

          <FadeRise delay={0.1}>
            <div className="card mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
                <TicketIcon className="h-8 w-8 text-[#4DA2FF]" />
              </div>
              <h2 className="mb-3 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
                No tickets yet
              </h2>
              <p className="mb-8 text-[var(--muted)]">
                Go to the app console to mint and purchase your first ticket.
              </p>
              <a
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4DA2FF] px-6 py-3 font-medium text-white transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                <ShoppingBag className="h-5 w-5" />
                Go to Console
              </a>
            </div>
          </FadeRise>
        </div>
      </main>
    );
  }

  // Main view with tickets
  return (
    <main className="relative min-h-screen overflow-hidden bg-vignette noise py-12">
      {flags.useEphemeralSigner && <DevWalletBadge />}
      
      <div className="mx-auto max-w-screen-xl px-6">
        {/* Header */}
        <FadeRise>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="font-[Inter_Tight] text-4xl tracking-tight text-[#DCE7F0]">
                My Tickets
              </h1>
              <p className="mt-2 text-[var(--muted)]">
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} owned
              </p>
            </div>
            <button
              onClick={loadTickets}
              className="rounded-xl border border-white/14 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
            >
              Refresh
            </button>
          </div>
        </FadeRise>

        {/* Ticket list */}
        <div className="space-y-4">
          {tickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.28 }}
            >
              <div className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-mono text-sm text-[#DCE7F0]">
                        Ticket #{ticket.serialNumber}
                      </h3>
                      {ticket.used ? (
                        <span className="rounded-full bg-gray-500/20 px-3 py-1 text-xs text-gray-400">
                          ✓ Used
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                          ● Active
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <span className="text-xs">ID:</span>
                        <span className="font-mono text-xs">{shortenAddress(ticket.id, 8)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <span className="text-xs">Class:</span>
                        <span className="font-mono text-xs">{shortenAddress(ticket.classId, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={explorerObj(ticket.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-white/14 px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                    
                    {!ticket.used && (
                      <a
                        href={`/checkin?ticket=${ticket.id}`}
                        className="rounded-xl bg-[#4DA2FF] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
                      >
                        Check In
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
