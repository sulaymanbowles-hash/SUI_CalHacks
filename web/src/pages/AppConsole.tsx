import { useState } from 'react';
import { CreditCard, ArrowRight, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '../components/Button';
import { TxStatus } from '../components/TxStatus';
import { DevWalletBadge } from '../components/DevWalletBadge';
import { PosterUpload } from '../components/PosterUpload';
import { mintAndList, buyAndApprove } from '../lib/ptb';
import { PACKAGE_ID, POLICY_ID, flags } from '../lib/env';

const isDev = import.meta.env.DEV;

export function AppConsole() {
  const [recentMints, setRecentMints] = useState<Array<{ kioskId: string; ticketId: string; priceSui: number }>>([]);

  // Mint & List state
  const [mintForm, setMintForm] = useState({
    eventName: 'Rock Concert 2025',
    priceSui: 0.25,
    supply: 100,
    posterCid: '',
  });
  const [mintStatus, setMintStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [mintDigest, setMintDigest] = useState<string>();
  const [mintIds, setMintIds] = useState<{ ticketId?: string; kioskId?: string; listingId?: string }>();
  const [mintError, setMintError] = useState<string>();

  // Buy & Approve state
  const [buyForm, setBuyForm] = useState({
    kioskId: '',
    ticketId: '',
    priceSui: 0.25,
  });
  const [buyStatus, setBuyStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [buyDigest, setBuyDigest] = useState<string>();
  const [buyError, setBuyError] = useState<string>();

  // Handlers
  const handleMintAndList = async () => {
    setMintStatus('pending');
    setMintError(undefined);

    try {
      const result = await mintAndList(mintForm);
      setMintStatus('success');
      setMintDigest(result.digest);
      setMintIds({
        ticketId: result.ticketId,
        kioskId: result.kioskId,
        listingId: result.listingId,
      });
      
      // Save for easy buy-approve
      setRecentMints(prev => [{
        kioskId: result.kioskId,
        ticketId: result.ticketId,
        priceSui: mintForm.priceSui,
      }, ...prev.slice(0, 2)]);
      
      // Auto-fill buy form
      setBuyForm({
        kioskId: result.kioskId,
        ticketId: result.ticketId,
        priceSui: mintForm.priceSui,
      });
    } catch (error: any) {
      setMintStatus('error');
      setMintError(error.message || String(error));
    }
  };

  const handleBuyAndApprove = async () => {
    if (!buyForm.ticketId || !buyForm.kioskId) {
      setBuyError('Kiosk ID and Ticket ID required');
      return;
    }

    setBuyStatus('pending');
    setBuyError(undefined);

    try {
      const result = await buyAndApprove(buyForm);
      setBuyStatus('success');
      setBuyDigest(result.digest);
    } catch (error: any) {
      setBuyStatus('error');
      setBuyError(error.message || String(error));
    }
  };

  const loadRecentMint = (mint: typeof recentMints[0]) => {
    setBuyForm({
      kioskId: mint.kioskId,
      ticketId: mint.ticketId,
      priceSui: mint.priceSui,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-vignette noise py-20">
      {/* Dev Wallet Badge */}
      {flags.useEphemeralSigner && <DevWalletBadge />}
      
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
              {flags.showFiatOnramp && (
                <button
                  disabled
                  className="relative cursor-not-allowed rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/40 opacity-60"
                  title="Card payments available on mainnet only"
                >
                  <CreditCard className="mr-2 inline h-4 w-4" />
                  Buy with Card
                </button>
              )}
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
                <h3 className="text-xl font-medium text-[#DCE7F0]">Mint & List</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Create event, mint ticket, list in Kiosk</p>
              </div>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/80">
                Step 1
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
                  placeholder="Rock Concert 2025"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                    Price (SUI)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={mintForm.priceSui}
                    onChange={(e) => setMintForm({ ...mintForm, priceSui: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 tabular-nums text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                    placeholder="0.25"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                    Supply
                  </label>
                  <input
                    type="number"
                    value={mintForm.supply}
                    onChange={(e) => setMintForm({ ...mintForm, supply: Number(e.target.value) })}
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
                {mintStatus === 'pending' ? 'Minting & Listing...' : 'Mint & List Ticket'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {mintStatus === 'success' && mintIds && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm">
                  <div className="mb-2 font-bold text-green-400">✓ Success!</div>
                  <div className="space-y-1 font-mono text-xs text-green-300">
                    <div>Ticket: {mintIds.ticketId?.slice(0, 20)}...</div>
                    <div>Kiosk: {mintIds.kioskId?.slice(0, 20)}...</div>
                  </div>
                </div>
              )}

              <TxStatus status={mintStatus} digest={mintDigest} error={mintError} />
            </form>
          </div>

          {/* Buy Ticket Card */}
          <div className="card">
            <header className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#DCE7F0]">Buy & Approve</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Purchase with automatic royalties</p>
              </div>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/80">
                Step 2
              </span>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); handleBuyAndApprove(); }} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Kiosk ID
                </label>
                <input
                  type="text"
                  value={buyForm.kioskId}
                  onChange={(e) => setBuyForm({ ...buyForm, kioskId: e.target.value })}
                  placeholder="Auto-filled from mint or paste..."
                  className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 font-mono text-sm text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={buyForm.ticketId}
                  onChange={(e) => setBuyForm({ ...buyForm, ticketId: e.target.value })}
                  placeholder="Auto-filled from mint or paste..."
                  className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 font-mono text-sm text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                  required
                />
                {recentMints.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recentMints.map((mint, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => loadRecentMint(mint)}
                        className="rounded-lg border border-white/12 px-3 py-1 text-xs text-[#4DA2FF] transition-colors hover:bg-white/5"
                      >
                        Load recent #{i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                  Price (SUI)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={buyForm.priceSui}
                  onChange={(e) => setBuyForm({ ...buyForm, priceSui: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 tabular-nums text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
                  placeholder="0.25"
                  required
                />
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
              </div>

              <Button
                type="submit"
                variant="secondary"
                loading={buyStatus === 'pending'}
                disabled={buyStatus === 'pending' || !buyForm.ticketId || !buyForm.kioskId || !POLICY_ID}
                className="w-full"
              >
                {buyStatus === 'pending' ? 'Purchasing...' : 'Buy & Approve'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <TxStatus status={buyStatus} digest={buyDigest} error={buyError} />
            </form>
          </div>
        </div>

        {/* Policy Objects Table */}
        {(PACKAGE_ID || POLICY_ID) && (
          <div className="card">
            <h3 className="mb-4 text-xl font-medium text-[#DCE7F0]">Deployed Contracts</h3>
            <div className="space-y-3">
              {PACKAGE_ID && (
                <div className="flex items-center justify-between rounded-lg border border-white/12 p-3">
                  <div>
                    <div className="text-xs text-white/60">Package ID</div>
                    <div className="font-mono text-sm text-[#DCE7F0]">{PACKAGE_ID.slice(0, 30)}...</div>
                  </div>
                  <a
                    href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}?network=testnet`}
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
                    <div className="text-xs text-white/60">Transfer Policy (Shared)</div>
                    <div className="font-mono text-sm text-[#DCE7F0]">{POLICY_ID.slice(0, 30)}...</div>
                  </div>
                  <a
                    href={`https://suiscan.xyz/testnet/object/${POLICY_ID}?network=testnet`}
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
