import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { CreditCard, ArrowRight, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '../components/Button';
import { TxStatus } from '../components/TxStatus';
import { mintAndList, buyAndApprove, type MintAndListParams } from '../lib/ptb';
import { PACKAGE_ID, POLICY_ID } from '../lib/env';

const isDev = import.meta.env.DEV;

export function AppConsole() {
  const account = useCurrentAccount();
  const [recentTickets, setRecentTickets] = useState<string[]>([]);

  // Mint & List state
  const [mintForm, setMintForm] = useState({
    eventName: 'Rock Concert 2025',
    startsAt: Math.floor(Date.now() / 1000) + 86400,
    endsAt: Math.floor(Date.now() / 1000) + 90000,
    posterCid: 'walrus://QmTestCID123',
    facePriceMist: '250000000',
    supply: '100',
  });
  const [mintStatus, setMintStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [mintDigest, setMintDigest] = useState<string>();
  const [mintError, setMintError] = useState<string>();

  // Buy & Approve state
  const [buyTicketId, setBuyTicketId] = useState('');
  const [buyStatus, setBuyStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [buyDigest, setBuyDigest] = useState<string>();
  const [buyError, setBuyError] = useState<string>();

  // Handlers
  const handleMintAndList = async () => {
    setMintStatus('pending');
    setMintError(undefined);

    try {
      const result = await mintAndList(mintForm as MintAndListParams);
      setMintStatus('success');
      setMintDigest(result.digest);
      if (result.ticketId) {
        setBuyTicketId(result.ticketId);
        setRecentTickets((prev) => [result.ticketId!, ...prev.slice(0, 2)]);
      }
    } catch (error: any) {
      setMintStatus('error');
      setMintError(error.message || String(error));
    }
  };

  const handleBuyAndApprove = async () => {
    if (!buyTicketId) {
      setBuyError('Ticket ID required');
      return;
    }

    setBuyStatus('pending');
    setBuyError(undefined);

    try {
      const result = await buyAndApprove({ ticketId: buyTicketId });
      setBuyStatus('success');
      setBuyDigest(result.digest);
    } catch (error: any) {
      setBuyStatus('error');
      setBuyError(error.message || String(error));
    }
  };

  if (!account) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-vignette noise">
        <div className="mx-auto flex min-h-[80vh] max-w-screen-xl items-center justify-center px-6">
          <div className="card max-w-md text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
              <Sparkles className="h-8 w-8 text-[#4DA2FF]" />
            </div>
            <h2 className="mb-3 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
              Connect wallet to continue
            </h2>
            <p className="text-[var(--muted)]">
              Connect your Sui wallet to access the demo console and test ticket creation.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-vignette noise py-20">
      <div className="mx-auto max-w-screen-xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-3 py-1.5 text-xs text-[var(--muted)]">
            <Sparkles className="h-3 w-3" />
            Demo Console
          </div>
          <h1 className="font-[Inter_Tight] text-4xl tracking-tight text-[#DCE7F0] sm:text-5xl">
            Create and trade tickets
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted)]">
            Test the full ticket lifecycle on Sui testnet. Mint tickets, list them for sale, and see automatic royalties in action.
          </p>
        </div>

        {/* Dev-only Environment Warning */}
        {isDev && (!PACKAGE_ID || !POLICY_ID) && (
          <div className="card mb-8 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
            <div className="flex items-start gap-4">
              <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-orange-500" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-orange-500">Setup Required</h3>
                <p className="mb-3 text-[var(--muted)]">
                  Package is not deployed in this environment. Run the deployment script:
                </p>
                <code className="block rounded-lg bg-black/40 px-4 py-2 font-mono text-sm text-orange-400">
                  bash scripts/deploy_package.sh
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Testnet Banner */}
        <div className="card mb-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-bold text-[#4DA2FF]">🧪 Testnet Mode Active</h3>
              <p className="text-[var(--muted)]">
                All transactions use test SUI. Get free tokens from the faucet—no real money needed.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://faucet.sui.io"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/14 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
              >
                Get test SUI
              </a>
              <button
                disabled
                className="relative cursor-not-allowed rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/40 opacity-60"
              >
                <CreditCard className="mr-2 inline h-4 w-4" />
                Buy with Card
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/50">
            Card payments are disabled on testnet. Mainnet only.
          </p>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Create Ticket Card */}
          <div className="card">
            <header className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#DCE7F0]">Create Ticket</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Mint a new ticket for your event.</p>
              </div>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/80">
                Organizer tools
              </span>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); handleMintAndList(); }} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Event Name
                </label>
                <input
                  type="text"
                  value={mintForm.eventName}
                  onChange={(e) => setMintForm({ ...mintForm, eventName: e.target.value })}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                  placeholder="Enter event name..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                    Price (SUI)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/50">SUI</span>
                    <input
                      type="number"
                      step="0.01"
                      value={Number(mintForm.facePriceMist) / 1e9}
                      onChange={(e) => setMintForm({ ...mintForm, facePriceMist: String(Number(e.target.value) * 1e9) })}
                      className="w-full rounded-xl border border-white/12 bg-white/[0.02] py-3 pl-12 pr-4 tabular-nums text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                      placeholder="0.25"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                    Supply
                  </label>
                  <input
                    type="number"
                    value={mintForm.supply}
                    onChange={(e) => setMintForm({ ...mintForm, supply: e.target.value })}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 tabular-nums text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={mintStatus === 'pending'}
                disabled={mintStatus === 'pending' || !PACKAGE_ID}
                className="w-full"
              >
                {mintStatus === 'pending' ? 'Creating Ticket...' : 'Create Ticket'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <TxStatus status={mintStatus} digest={mintDigest} error={mintError} />
            </form>
          </div>

          {/* Buy Ticket Card */}
          <div className="card">
            <header className="mb-6">
              <h3 className="text-xl font-medium text-[#DCE7F0]">Buy Ticket</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Purchase with automatic royalties.</p>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); handleBuyAndApprove(); }} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Ticket ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={buyTicketId}
                    onChange={(e) => setBuyTicketId(e.target.value)}
                    placeholder="Paste ticket ID or pick one you minted above..."
                    className="grow rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 font-mono text-sm text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    className="rounded-xl border border-white/14 px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
                    disabled={recentTickets.length === 0}
                  >
                    Pick
                  </button>
                </div>
                {recentTickets.length > 0 && (
                  <p className="mt-2 text-xs text-white/60">
                    Recent:{' '}
                    {recentTickets.map((id, i) => (
                      <span key={id}>
                        <button
                          type="button"
                          onClick={() => setBuyTicketId(id)}
                          className="text-[#4DA2FF] hover:underline"
                        >
                          {id.slice(0, 6)}...{id.slice(-4)}
                        </button>
                        {i < recentTickets.length - 1 && ' • '}
                      </span>
                    ))}
                  </p>
                )}
              </div>

              {/* Royalty Split Preview */}
              <div className="rounded-lg border border-white/12 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#4DA2FF]">
                  <Sparkles className="h-4 w-4" />
                  Automatic Royalty Split
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted)]">Artist receives</span>
                    <span className="tabular-nums font-bold text-[#DCE7F0]">90%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted)]">Organizer receives</span>
                    <span className="tabular-nums font-bold text-[#DCE7F0]">8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted)]">Platform receives</span>
                    <span className="tabular-nums font-bold text-[#DCE7F0]">2%</span>
                  </div>
                </div>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="text-xs text-white/50">
                    Enforced by transfer policies. Royalties settle in ~480ms on testnet.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                loading={buyStatus === 'pending'}
                disabled={buyStatus === 'pending' || !buyTicketId || !POLICY_ID}
                className="w-full"
              >
                {buyStatus === 'pending' ? 'Processing...' : 'Buy Ticket'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <TxStatus status={buyStatus} digest={buyDigest} error={buyError} />
            </form>
          </div>
        </div>

        {/* Policy Objects Table */}
        {(PACKAGE_ID || POLICY_ID) && (
          <div className="card">
            <h3 className="mb-4 text-xl font-medium text-[#DCE7F0]">Policy Objects</h3>
            <div className="space-y-3">
              {PACKAGE_ID && (
                <div className="flex items-center justify-between rounded-lg border border-white/12 p-3">
                  <div>
                    <div className="text-xs text-white/60">Package ID</div>
                    <div className="font-mono text-sm text-[#DCE7F0]">{PACKAGE_ID.slice(0, 20)}...</div>
                  </div>
                  <a
                    href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#4DA2FF] hover:underline"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {POLICY_ID && (
                <div className="flex items-center justify-between rounded-lg border border-white/12 p-3">
                  <div>
                    <div className="text-xs text-white/60">Transfer Policy</div>
                    <div className="font-mono text-sm text-[#DCE7F0]">{POLICY_ID.slice(0, 20)}...</div>
                  </div>
                  <a
                    href={`https://suiscan.xyz/testnet/object/${POLICY_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#4DA2FF] hover:underline"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
