import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { createEventAtomicWeb } from '../lib/ptb';
import { ensurePolicy } from '../lib/policy';
import { enableSales } from '../lib/channels';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TestnetPill } from '../components/TestnetPill';
import { DisplayWallet } from '../components/DisplayWallet';
import { getExplorerObjectUrl, getExplorerTxUrl, shortenAddress } from '../lib/explorer';

interface ChecklistState {
  eventCreated: boolean;
  payoutsConnected: boolean;
  salesEnabled: boolean;
}

interface EventData {
  eventId?: string;
  classId?: string;
  ticketId?: string;
  kioskId?: string;
  listingId?: string;
  policyId?: string;
  publicUrl?: string;
  createDigest?: string;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const account = useCurrentAccount();

  // Event basic info
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [price, setPrice] = useState('0.5');
  const [supply, setSupply] = useState('100');

  // Payout addresses
  const [artistAddress, setArtistAddress] = useState('');
  const [organizerAddress, setOrganizerAddress] = useState('');
  const platformAddress = '0x0000000000000000000000000000000000000000000000000000000000000001'; // Placeholder

  // Royalty splits (basis points)
  const artistSplit = 9000; // 90%
  const organizerSplit = 800; // 8%
  const platformSplit = 200; // 2%

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistState>({
    eventCreated: false,
    payoutsConnected: false,
    salesEnabled: false,
  });

  // Event data
  const [eventData, setEventData] = useState<EventData>({});

  // Loading states
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isSettingUpPayouts, setIsSettingUpPayouts] = useState(false);
  const [isEnablingSales, setIsEnablingSales] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [statusMessage, setStatusMessage] = useState('');

  const canGoLive = checklist.eventCreated && checklist.payoutsConnected && checklist.salesEnabled;

  const handleCreateEvent = async () => {
    if (!account?.address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!eventName || !eventDate || !price || !supply) {
      alert('Please fill in all event details');
      return;
    }

    setIsCreatingEvent(true);
    setStatusMessage('Creating event atomically on-chain...');

    try {
      const startsAt = Math.floor(new Date(eventDate).getTime() / 1000);
      const endsAt = startsAt + 14400; // 4 hours later

      const result = await createEventAtomicWeb({
        name: eventName,
        startsAt,
        endsAt,
        priceSui: parseFloat(price),
        supply: parseInt(supply),
        posterCid: 'walrus://placeholder',
      });

      console.log('✓ Event created atomically:', result);

      setEventData({
        eventId: result.eventId,
        classId: result.classId,
        ticketId: result.ticketId,
        kioskId: result.kioskId,
        listingId: result.listingId,
        policyId: result.policyId, // Policy was set up in the same transaction
        createDigest: result.digest,
      });

      // Generate public URL for the listing
      const origin = window.location.origin;
      const publicUrl = `${origin}/buyer?kiosk=${result.kioskId}&listing=${result.listingId}`;

      setEventData(prev => ({ ...prev, publicUrl }));

      // ALL THREE checkmarks flip to green from ONE atomic transaction
      setChecklist({
        eventCreated: true,
        payoutsConnected: true, // Policy was created atomically
        salesEnabled: true,      // Listing was created atomically
      });

      setStatusMessage('✓ Event created successfully! All systems ready.');
    } catch (error: any) {
      console.error('Failed to create event:', error);
      alert(`Failed to create event: ${error.message}`);
      setStatusMessage('');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleGoLive = async () => {
    if (!canGoLive) return;

    setIsPublishing(true);
    setStatusMessage('Publishing event...');

    // Show sharing options
    setTimeout(() => {
      setStatusMessage('✓ Event is now live!');
      setIsPublishing(false);
      
      // Navigate to console after a moment
      setTimeout(() => {
        navigate('/console');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a]">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Create Event</h1>
            <TestnetPill />
          </div>
          <DisplayWallet />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-white/60 mb-8">You can edit everything later.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Event Details Form */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold text-white mb-6">Event Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Summer Music Festival 2025"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-white/40 focus:outline-none focus:border-primary-main
                             transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Event Date
                  </label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    aria-label="Event date and time"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white focus:outline-none focus:border-primary-main
                             transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Ticket Price (SUI)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.5"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                               text-white placeholder-white/40 focus:outline-none focus:border-primary-main
                               transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Total Supply
                    </label>
                    <input
                      type="number"
                      value={supply}
                      onChange={(e) => setSupply(e.target.value)}
                      placeholder="100"
                      min="1"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                               text-white placeholder-white/40 focus:outline-none focus:border-primary-main
                               transition-colors"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-white mb-6">Payout Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Artist Address
                  </label>
                  <input
                    type="text"
                    value={artistAddress}
                    onChange={(e) => setArtistAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-white/40 font-mono text-sm
                             focus:outline-none focus:border-primary-main transition-colors"
                  />
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-white/60">Split</span>
                    <span className="text-white font-medium">{artistSplit / 100}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Organizer Address
                  </label>
                  <input
                    type="text"
                    value={organizerAddress}
                    onChange={(e) => setOrganizerAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-white/40 font-mono text-sm
                             focus:outline-none focus:border-primary-main transition-colors"
                  />
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-white/60">Split</span>
                    <span className="text-white font-medium">{organizerSplit / 100}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Platform Fee</span>
                    <span className="text-white font-medium">{platformSplit / 100}%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Review & Publish Checklist */}
          <div>
            <Card>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Review & Publish</h3>
                <p className="text-sm text-white/60 mt-1">
                  Complete setup before going live
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Event Created - THE ONLY ACTION BUTTON */}
                <div className="flex items-start justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      checklist.eventCreated 
                        ? 'bg-green-500' 
                        : 'bg-white/10'
                    }`}>
                      {checklist.eventCreated ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">Event created</div>
                      {eventData.eventId ? (
                        <a
                          href={getExplorerObjectUrl(eventData.eventId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-main hover:text-primary-light inline-flex items-center gap-1 mt-1"
                        >
                          <span className="font-mono">{shortenAddress(eventData.eventId)}</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <p className="text-xs text-white/40 mt-1">Atomic: event + class + policy + ticket + kiosk + listing</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateEvent}
                    disabled={isCreatingEvent || checklist.eventCreated}
                    size="sm"
                    className="ml-3 flex-shrink-0"
                  >
                    {isCreatingEvent ? 'Creating...' : checklist.eventCreated ? '✓ Created' : 'Create event'}
                  </Button>
                </div>

                {/* 2. Payouts Connected - READ-ONLY STATUS */}
                <div className="flex items-start justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      checklist.payoutsConnected 
                        ? 'bg-green-500' 
                        : 'bg-white/10'
                    }`}>
                      {checklist.payoutsConnected ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">Payouts connected</div>
                      {eventData.policyId ? (
                        <a
                          href={getExplorerObjectUrl(eventData.policyId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-main hover:text-primary-light inline-flex items-center gap-1 mt-1"
                        >
                          <span className="font-mono">{shortenAddress(eventData.policyId)}</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <p className="text-xs text-white/40 mt-1">Transfer Policy enforces 90% / 8% / 2% split</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex-shrink-0 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-xs text-white/40">Auto-configured</span>
                  </div>
                </div>

                {/* 3. Sales Channels Enabled - READ-ONLY STATUS */}
                <div className="flex items-start justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      checklist.salesEnabled 
                        ? 'bg-green-500' 
                        : 'bg-white/10'
                    }`}>
                      {checklist.salesEnabled ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">Sales channels enabled</div>
                      {eventData.publicUrl ? (
                        <a
                          href={eventData.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-main hover:text-primary-light inline-flex items-center gap-1 mt-1"
                        >
                          <span>Public listing</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <p className="text-xs text-white/40 mt-1">Kiosk listing enables atomic purchases</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex-shrink-0 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-xs text-white/40">Auto-enabled</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 my-4" />

                {/* 4. Ticket Types (Info) */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="text-sm text-white/80">Ticket types</div>
                  <div className="text-sm text-white/60">1 class (GA)</div>
                </div>

                {/* 5. Pricing & Royalties (Info) */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-white/80">Pricing & royalties</div>
                    <div className="text-sm text-white/60">{price} SUI</div>
                  </div>
                  <div className="text-xs text-white/40">
                    {artistSplit / 100}% artist · {organizerSplit / 100}% organizer · {platformSplit / 100}% platform
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-300">{statusMessage}</p>
                </div>
              )}

              {/* Go Live Button */}
              <div className="mt-8">
                <Button
                  onClick={handleGoLive}
                  disabled={!canGoLive || isPublishing}
                  className="w-full"
                  size="lg"
                >
                  {isPublishing ? 'Publishing...' : 'Go Live'}
                </Button>
                {!canGoLive && (
                  <p className="text-xs text-white/40 text-center mt-2">
                    Event created and Payouts connected and Sales channels enabled required to publish
                  </p>
                )}
              </div>

              {/* Transaction Links */}
              {eventData.createDigest && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-medium text-white mb-3">Transaction History</h4>
                  <div className="space-y-2">
                    <a
                      href={getExplorerTxUrl(eventData.createDigest)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sm text-white/80">Event Creation</span>
                      <span className="text-xs text-primary-main font-mono">
                        {shortenAddress(eventData.createDigest)} ↗
                      </span>
                    </a>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
