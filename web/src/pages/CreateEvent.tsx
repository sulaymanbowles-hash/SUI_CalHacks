import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { atomicGoLive } from '../lib/ptb';
import { toMist } from '../lib/sui';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TestnetPill } from '../components/TestnetPill';
import { DisplayWallet } from '../components/DisplayWallet';
import { getExplorerObjectUrl, getExplorerTxUrl, shortenAddress } from '../lib/explorer';

type StepStatus = 'idle' | 'working' | 'done' | 'error';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  error?: string;
  objectId?: string;
}

interface ValidationIssue {
  field: string;
  message: string;
}

interface EventData {
  eventId?: string;
  gateKeeperCapId?: string;
  eventCapId?: string;
  ticketClasses?: {
    classId: string;
    name: string;
    supply: number;
    priceMist: number;
  }[];
  kioskId?: string;
  publicUrl?: string;
  createDigest?: string;
}

const PLATFORM_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000001'; // TODO: Replace with real platform address

export default function CreateEvent() {
  const navigate = useNavigate();
  const account = useCurrentAccount();

  // Event basic info
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('0.5');
  const [supply, setSupply] = useState('100');
  const [posterUrl, setPosterUrl] = useState('');

  // Royalty splits (basis points) - fixed for now
  const artistSplit = 9000; // 90%
  const organizerSplit = 800; // 8%
  const platformSplit = 200; // 2%

  // Progress steps
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: 'event',
      title: 'Event created',
      description: 'Event + payouts configuration',
      status: 'idle',
    },
    {
      id: 'payouts',
      title: 'Payouts connected',
      description: 'Transfer policy with 90% / 8% / 2% split',
      status: 'idle',
    },
    {
      id: 'sales',
      title: 'Sales channels enabled',
      description: 'Ticket classes and kiosk listings',
      status: 'idle',
    },
  ]);

  // Event data
  const [eventData, setEventData] = useState<EventData>({});

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Pre-flight validation
  const validation = useMemo(() => {
    const issues: ValidationIssue[] = [];

    // Event details validation
    if (!eventName.trim()) {
      issues.push({ field: 'eventName', message: 'Event name is required' });
    }
    if (!location.trim()) {
      issues.push({ field: 'location', message: 'Location is required' });
    }
    if (!eventDate) {
      issues.push({ field: 'eventDate', message: 'Event date is required' });
    } else {
      const selectedDate = new Date(eventDate);
      const now = new Date();
      if (selectedDate <= now) {
        issues.push({ field: 'eventDate', message: 'Event must be in the future' });
      }
    }

    // Ticket type validation
    const priceNum = parseFloat(price);
    const supplyNum = parseInt(supply);

    if (!price || isNaN(priceNum) || priceNum <= 0) {
      issues.push({ field: 'price', message: 'Valid ticket price is required' });
    }
    if (!supply || isNaN(supplyNum) || supplyNum <= 0) {
      issues.push({ field: 'supply', message: 'Supply must be at least 1' });
    }

    // Wallet validation
    if (!account?.address) {
      issues.push({ field: 'wallet', message: 'Wallet not connected' });
    }

    // Royalty validation (always valid since fixed)
    const totalSplit = artistSplit + organizerSplit + platformSplit;
    if (totalSplit !== 10000) {
      issues.push({ field: 'splits', message: `Royalty splits must total 100% (currently ${totalSplit / 100}%)` });
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }, [eventName, location, eventDate, price, supply, account, artistSplit, organizerSplit, platformSplit]);

  const updateStepStatus = (stepId: string, status: StepStatus, extra?: Partial<ProgressStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, ...extra } : step
    ));
  };

  const handleGoLive = async () => {
    if (!validation.valid || !account?.address) return;

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);

    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'idle', error: undefined })));

    try {
      // Convert date to Unix timestamp
      const startsAt = Math.floor(new Date(eventDate).getTime() / 1000);
      const endsAt = startsAt + 14400; // 4 hours later

      // Normalize price to MIST
      const priceMist = toMist(parseFloat(price));

      // Prepare ticket types (simplified to one type for now)
      const ticketTypes = [
        {
          name: 'General Admission',
          color: '#4DA2FF',
          supply: parseInt(supply),
          priceMist,
        },
      ];

      console.log('🚀 Starting atomic Go Live...', {
        eventName,
        location,
        startsAt,
        endsAt,
        ticketTypes,
        artistAddress: account.address,
        organizerAddress: account.address,
      });

      const result = await atomicGoLive({
        eventName,
        location,
        startsAt,
        endsAt,
        posterCid: posterUrl || 'walrus://placeholder',
        ticketTypes,
        artistBps: artistSplit,
        organizerBps: organizerSplit,
        platformBps: platformSplit,
        artistAddress: account.address, // For demo, using organizer as artist
        organizerAddress: account.address,
        platformAddress: PLATFORM_ADDRESS,
        onProgress: (step, message) => {
          console.log(`[${step}] ${message}`);
          
          // Update UI based on step
          if (step === 'event') {
            updateStepStatus('event', 'working');
          } else if (step === 'kiosk') {
            updateStepStatus('event', 'done', { objectId: result?.eventId });
            updateStepStatus('payouts', 'working');
          } else if (step === 'classes') {
            updateStepStatus('payouts', 'done');
            updateStepStatus('sales', 'working');
          } else if (step === 'success') {
            updateStepStatus('sales', 'done');
          }
        },
      });

      console.log('✓ Event created:', result);

      // Mark all steps as done with IDs
      updateStepStatus('event', 'done', { objectId: result.eventId });
      updateStepStatus('payouts', 'done');
      updateStepStatus('sales', 'done', { objectId: result.kioskId });

      // Generate public URL for the first ticket type
      const origin = window.location.origin;
      const firstClass = result.ticketClasses[0];
      const publicUrl = `${origin}/buyer?kiosk=${result.kioskId}&listing=${firstClass.classId}`;

      // Store event data
      setEventData({
        eventId: result.eventId,
        gateKeeperCapId: result.gateKeeperCapId,
        eventCapId: result.eventCapId,
        ticketClasses: result.ticketClasses,
        kioskId: result.kioskId,
        publicUrl,
        createDigest: result.digest,
      });

      setPublishSuccess(true);

      // TODO: Emit EVENT_PUBLISHED event for global cache updates
      // TODO: Invalidate/update cache for events listing
      // window.dispatchEvent(new CustomEvent('EVENT_PUBLISHED', { detail: result }));

    } catch (error: any) {
      console.error('Failed to publish event:', error);
      
      // Map error to specific step
      const errorMessage = error.message || 'Unknown error occurred';
      let failedStep = 'event';
      
      if (errorMessage.includes('Ticket class') || errorMessage.includes('class')) {
        failedStep = 'sales';
      } else if (errorMessage.includes('payouts') || errorMessage.includes('royalty')) {
        failedStep = 'payouts';
      } else if (errorMessage.includes('kiosk') || errorMessage.includes('Kiosk')) {
        failedStep = 'sales';
      } else if (errorMessage.includes('gas')) {
        failedStep = 'event';
      }

      updateStepStatus(failedStep, 'error', {
        error: errorMessage,
      });
      
      setPublishError(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleViewEvent = () => {
    navigate('/events');
  };

  const handleOpenScanner = () => {
    if (eventData.gateKeeperCapId) {
      navigate(`/scanner?cap=${eventData.gateKeeperCapId}`);
    } else {
      navigate('/scanner');
    }
  };

  const handleCopyLink = () => {
    if (eventData.publicUrl) {
      navigator.clipboard.writeText(eventData.publicUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleRetry = () => {
    // Reset all steps to idle
    setSteps(prev => prev.map(step => ({ ...step, status: 'idle', error: undefined })));
    setPublishError(null);
    setPublishSuccess(false);
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
        <p className="text-white/60 mb-8">Complete your event details to publish in one atomic transaction.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Event Details Form */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold text-white mb-6">Event Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Summer Music Festival 2025"
                    disabled={isPublishing || publishSuccess}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-white/40 focus:outline-none focus:border-primary-main
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {validation.issues.find(i => i.field === 'eventName') && (
                    <p className="text-xs text-red-400 mt-1">
                      {validation.issues.find(i => i.field === 'eventName')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    disabled={isPublishing || publishSuccess}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-white/40 focus:outline-none focus:border-primary-main
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {validation.issues.find(i => i.field === 'location') && (
                    <p className="text-xs text-red-400 mt-1">
                      {validation.issues.find(i => i.field === 'location')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    disabled={isPublishing || publishSuccess}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white focus:outline-none focus:border-primary-main
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {validation.issues.find(i => i.field === 'eventDate') && (
                    <p className="text-xs text-red-400 mt-1">
                      {validation.issues.find(i => i.field === 'eventDate')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Poster Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://..."
                    disabled={isPublishing || publishSuccess}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-white/40 focus:outline-none focus:border-primary-main
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Recommended: 1200x630px
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Ticket Price (SUI) *
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.5"
                      step="0.1"
                      min="0"
                      disabled={isPublishing || publishSuccess}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                               text-white placeholder-white/40 focus:outline-none focus:border-primary-main
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {validation.issues.find(i => i.field === 'price') && (
                      <p className="text-xs text-red-400 mt-1">
                        {validation.issues.find(i => i.field === 'price')?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Total Supply *
                    </label>
                    <input
                      type="number"
                      value={supply}
                      onChange={(e) => setSupply(e.target.value)}
                      placeholder="100"
                      min="1"
                      disabled={isPublishing || publishSuccess}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                               text-white placeholder-white/40 focus:outline-none focus:border-primary-main
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {validation.issues.find(i => i.field === 'supply') && (
                      <p className="text-xs text-red-400 mt-1">
                        {validation.issues.find(i => i.field === 'supply')?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-white mb-6">Royalty Configuration</h3>
              <p className="text-sm text-white/60 mb-4">Fixed royalty split for all ticket sales</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-white/80">Artist</span>
                  <span className="text-sm text-white font-medium">{artistSplit / 100}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-white/80">Organizer</span>
                  <span className="text-sm text-white font-medium">{organizerSplit / 100}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-white/80">Platform Fee</span>
                  <span className="text-sm text-white font-medium">{platformSplit / 100}%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Review & Publish */}
          <div>
            <Card>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Review & Publish</h3>
                <p className="text-sm text-white/60 mt-1">
                  Your event will be created and published in one atomic transaction
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 mb-6">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`
                      flex items-start gap-3 p-4 rounded-xl border transition-all duration-300
                      ${step.status === 'done' ? 'bg-green-500/10 border-green-500/30' : 
                        step.status === 'error' ? 'bg-red-500/10 border-red-500/30' :
                        step.status === 'working' ? 'bg-blue-500/10 border-blue-500/30' :
                        'bg-white/5 border-white/10'}
                    `}
                    style={{
                      transitionDelay: step.status === 'done' ? `${index * 60}ms` : '0ms'
                    }}
                  >
                    {/* Status Icon */}
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                      ${step.status === 'done' ? 'bg-green-500' :
                        step.status === 'error' ? 'bg-red-500' :
                        step.status === 'working' ? 'bg-blue-500' :
                        'bg-white/10'}
                    `}>
                      {step.status === 'done' ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step.status === 'error' ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : step.status === 'working' ? (
                        <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm">{step.title}</div>
                      <p className="text-xs text-white/60 mt-0.5">{step.description}</p>
                      
                      {step.status === 'working' && (
                        <p className="text-xs text-blue-400 mt-1">Working...</p>
                      )}
                      
                      {step.status === 'done' && step.objectId && (
                        <a
                          href={getExplorerObjectUrl(step.objectId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-main hover:text-primary-light inline-flex items-center gap-1 mt-1"
                        >
                          <span className="font-mono">{shortenAddress(step.objectId)}</span>
                          <span>↗</span>
                        </a>
                      )}
                      
                      {step.status === 'error' && step.error && (
                        <p className="text-xs text-red-400 mt-1">{step.error}</p>
                      )}
                    </div>

                    {/* Right Side Status */}
                    {step.status === 'done' && (
                      <div className="text-xs text-green-400 flex-shrink-0">Done</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Validation Issues */}
              {!validation.valid && !isPublishing && !publishSuccess && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-yellow-300 font-medium mb-2">Please fix these issues:</p>
                      <ul className="text-xs text-yellow-200/80 space-y-1">
                        {validation.issues.map((issue, i) => (
                          <li key={i}>• {issue.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Card */}
              {publishSuccess && eventData.eventId && (
                <div className="mb-6 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-1">Event Published!</h4>
                    <p className="text-sm text-white/60">Your event is now live and ready for ticket sales</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <Button
                      onClick={handleViewEvent}
                      variant="primary"
                      fullWidth
                    >
                      View Event
                    </Button>
                    <Button
                      onClick={handleOpenScanner}
                      variant="secondary"
                      fullWidth
                    >
                      Open Scanner
                    </Button>
                  </div>

                  {eventData.createDigest && (
                    <a
                      href={getExplorerObjectUrl(eventData.createDigest)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                    >
                      <span className="text-sm text-white/80">View Transaction</span>
                      <span className="text-xs text-white/40 font-mono group-hover:text-white/60 transition-colors">
                        {shortenAddress(eventData.createDigest)}
                      </span>
                      <svg className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}

                  {eventData.publicUrl && (
                    <button
                      onClick={handleCopyLink}
                      className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80 transition-colors hover:bg-white/10"
                    >
                      Copy Public Link
                    </button>
                  )}
                </div>
              )}

              {/* Error Card */}
              {publishError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-red-300 font-medium mb-1">Publication failed</p>
                      <p className="text-xs text-red-200/80">{publishError}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    fullWidth
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Publish Button */}
              {!publishSuccess && (
                <Button
                  onClick={handleGoLive}
                  variant="primary"
                  loading={isPublishing}
                  disabled={!validation.valid || isPublishing}
                  fullWidth
                  size="lg"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Event'}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
