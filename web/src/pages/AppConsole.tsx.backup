/**
 * Organizer Console - Create & Manage Events
 * Clean wizard flow with no crypto jargon
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Settings,
  ChevronDown,
  Upload,
  AlertCircle,
  Loader2,
  QrCode,
  Clock,
  Plus,
  X,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { TxStatus } from '../components/TxStatus';
import { 
  publishEvent, 
  TicketTypeConfig,
  setupPayouts,
  createChannel,
  publishGated,
  checkEventGating,
  PayoutRecipient,
} from '../lib/ptb';
import { PACKAGE_ID, POLICY_ID } from '../lib/env';
import { currentAddress } from '../lib/signer';
import { parseMoveError, toMist } from '../lib/sui';

type Step = 'basics' | 'tickets' | 'pricing' | 'publish' | 'playground';
type TransferPolicy = 'fixed' | 'capped' | 'open';

interface TicketType {
  id: string;
  name: string;
  color: string;
  supply: number;
  price: number;
  transferPolicy: TransferPolicy;
}

interface EventDraft {
  name: string;
  date: string;
  time: string;
  timezone: string;
  venue: string;
  city: string;
  fullAddress: string;
  coverImage: string;
  organizerName: string;
  organizerLogo: string;
  ticketTypes: TicketType[];
  royaltyPreset: 'recommended' | 'lower' | 'custom';
  artistPercent: number;
  organizerPercent: number;
}

const TRANSFER_POLICIES = {
  fixed: { label: 'Fixed Price', description: 'Resale only at original price' },
  capped: { label: 'Open resale', description: 'Market-driven pricing' },
  open: { label: 'Open Market', description: 'Any resale price' },
};

const TICKET_PRESETS = [
  { name: 'General Admission', color: '#4DA2FF', supply: 100, price: 25 },
  { name: 'VIP', color: '#FFB020', supply: 25, price: 100 },
  { name: 'Early Bird', color: '#2ED67A', supply: 50, price: 20 },
];

const ROYALTY_PRESETS = {
  recommended: { label: 'Recommended', artist: 90, org: 8 },
  lower: { label: 'Lower royalties', artist: 85, org: 5 },
  custom: { label: 'Custom', artist: 0, org: 0 },
};

export function AppConsole() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Event draft state
  const [draft, setDraft] = useState<EventDraft>({
    name: '',
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    venue: '',
    city: '',
    fullAddress: '',
    coverImage: '',
    organizerName: '',
    organizerLogo: '',
    ticketTypes: [],
    royaltyPreset: 'recommended',
    artistPercent: 90,
    organizerPercent: 8,
  });

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Publishing state
  const [publishStatus, setPublishStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [publishProgress, setPublishProgress] = useState<{ step: string; message: string } | null>(null);
  const [publishDigest, setPublishDigest] = useState<string>();
  const [publishError, setPublishError] = useState<string>();
  const [publishedIds, setPublishedIds] = useState<{ 
    eventId?: string; 
    gateKeeperCapId?: string;
    eventCapId?: string;
    ticketClasses?: Array<{ classId: string; kioskId: string; name: string; supply: number }>;
  }>();

  // On-chain gating state
  const [payoutsConfigured, setPayoutsConfigured] = useState(false);
  const [channelsEnabled, setChannelsEnabled] = useState(false);
  const [payoutsId, setPayoutsId] = useState<string>();
  const [channelId, setChannelId] = useState<string>();
  const [setupStatus, setSetupStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [setupError, setSetupError] = useState<string>();

  // Liquid background tracking
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isInside = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (isInside) {
        setMousePos({
          x: e.clientX / window.innerWidth,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Autosave simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft.name) {
        setIsAutosaving(true);
        setTimeout(() => setIsAutosaving(false), 800);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [draft]);

  // Auto-scroll on step change
  useEffect(() => {
    if (contentRef.current) {
      const headerOffset = 80;
      const elementPosition = contentRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, [currentStep]);

  const updateDraft = (updates: Partial<EventDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(updates);
    setErrors(prev => {
      const next = { ...prev };
      updatedKeys.forEach(key => delete next[key]);
      return next;
    });
  };

  const validateField = (field: string, value: any): string | null => {
    if (field === 'date' && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return "Date can't be in the past";
      }
    }
    return null;
  };

  const addTicketType = (preset?: typeof TICKET_PRESETS[0]) => {
    const newType: TicketType = {
      id: Date.now().toString(),
      name: preset?.name || 'Custom Ticket',
      color: preset?.color || '#4DA2FF',
      supply: preset?.supply || 50,
      price: preset?.price || 25,
      transferPolicy: 'capped',
    };
    updateDraft({ ticketTypes: [...draft.ticketTypes, newType] });
  };

  const updateTicketType = (id: string, updates: Partial<TicketType>) => {
    updateDraft({
      ticketTypes: draft.ticketTypes.map(t => t.id === id ? { ...t, ...updates } : t),
    });
  };

  const removeTicketType = (id: string) => {
    updateDraft({ ticketTypes: draft.ticketTypes.filter(t => t.id !== id) });
    setEditingTicket(null);
  };

  const handleSetupPayouts = async () => {
    if (!publishedIds?.eventId || !publishedIds?.eventCapId) {
      alert('Create event first (go through steps 1-3)');
      return;
    }

    const organizerAddress = currentAddress();
    if (!organizerAddress) {
      setSetupError('Wallet not connected');
      return;
    }

    setSetupStatus('pending');
    setSetupError(undefined);

    try {
      // Build recipients from draft royalty settings
      const recipients: PayoutRecipient[] = [
        { address: organizerAddress, bps: Math.floor(draft.artistPercent * 100) },
        { address: organizerAddress, bps: Math.floor(draft.organizerPercent * 100) },
      ];

      // Platform gets remainder (200 = 2%)
      const platformBps = 10000 - recipients.reduce((sum, r) => sum + r.bps, 0);
      if (platformBps > 0) {
        recipients.push({ address: organizerAddress, bps: platformBps });
      }

      const result = await setupPayouts({
        eventId: publishedIds.eventId,
        eventCapId: publishedIds.eventCapId,
        recipients,
      });

      setPayoutsId(result.payoutsId);
      setPayoutsConfigured(true);
      setSetupStatus('success');

      // Store in localStorage
      localStorage.setItem('DROP_KIT_PAYOUTS_ID', result.payoutsId);
    } catch (error: any) {
      console.error('Payouts setup error:', error);
      setSetupStatus('error');
      setSetupError(parseMoveError(error));
    }
  };

  const handleEnableChannels = async () => {
    if (!publishedIds?.eventId || !publishedIds?.eventCapId) {
      alert('Create event first (go through steps 1-3)');
      return;
    }

    if (draft.ticketTypes.length === 0) {
      alert('Add at least one ticket type first');
      return;
    }

    setSetupStatus('pending');
    setSetupError(undefined);

    try {
      // Create primary channel using first ticket type
      const firstTicket = draft.ticketTypes[0];
      const now = Math.floor(Date.now() / 1000);
      const eventStart = draft.date && draft.time 
        ? new Date(`${draft.date}T${draft.time}`).getTime() / 1000 
        : now + 86400;

      const result = await createChannel({
        eventId: publishedIds.eventId,
        eventCapId: publishedIds.eventCapId,
        kind: 0, // PRIMARY
        priceMist: toMist(firstTicket.price),
        startTs: now, // Start immediately
        endTs: Math.floor(eventStart + 86400), // End 24h after event
        perWalletLimit: 10,
        cap: firstTicket.supply,
      });

      setChannelId(result.channelId);
      setChannelsEnabled(true);
      setSetupStatus('success');

      // Store in localStorage
      localStorage.setItem('DROP_KIT_CHANNEL_ID', result.channelId);
    } catch (error: any) {
      console.error('Channel creation error:', error);
      setSetupStatus('error');
      setSetupError(parseMoveError(error));
    }
  };

  const handlePublish = async () => {
    if (!PACKAGE_ID) {
      setPublishError('Package not deployed. Run deployment script first.');
      setPublishStatus('error');
      return;
    }

    const organizerAddress = currentAddress();
    if (!organizerAddress) {
      setPublishError('No wallet connected. Please refresh and connect wallet.');
      setPublishStatus('error');
      return;
    }

    // Check on-chain prerequisites
    if (!payoutsConfigured) {
      setPublishError('Payouts must be configured before publishing');
      setPublishStatus('error');
      return;
    }

    if (!channelsEnabled) {
      setPublishError('At least one sales channel must be enabled before publishing');
      setPublishStatus('error');
      return;
    }

    if (!publishedIds?.eventId || !publishedIds?.eventCapId) {
      setPublishError('Event not created. Complete steps 1-3 first.');
      setPublishStatus('error');
      return;
    }

    setPublishStatus('pending');
    setPublishError(undefined);
    setPublishProgress(null);

    try {
      setPublishProgress({ step: 'publishing', message: 'Publishing event on-chain...' });

      const result = await publishGated({
        eventId: publishedIds.eventId,
        eventCapId: publishedIds.eventCapId,
      });

      setPublishStatus('success');
      setPublishDigest(result.digest);
      setPublishProgress({ step: 'success', message: 'Event is now LIVE!' });

      // Update local state
      localStorage.setItem('DROP_KIT_EVENT_STATUS', 'live');
    } catch (error: any) {
      console.error('Publish error:', error);
      setPublishStatus('error');
      const friendlyError = parseMoveError(error);
      setPublishError(friendlyError);
    } finally {
      setPublishProgress(null);
    }
  };

  const handleCreateDraft = async () => {
    if (!PACKAGE_ID) {
      setPublishError('Package not deployed. Run deployment script first.');
      setPublishStatus('error');
      return;
    }

    const organizerAddress = currentAddress();
    if (!organizerAddress) {
      setPublishError('No wallet connected. Please refresh and connect wallet.');
      setPublishStatus('error');
      return;
    }

    setPublishStatus('pending');
    setPublishError(undefined);
    setPublishProgress(null);

    try {
      const now = Math.floor(Date.now() / 1000);
      const eventDateTime = draft.date && draft.time 
        ? new Date(`${draft.date}T${draft.time}`).getTime() / 1000 
        : now + 86400;
      
      const ticketTypes: TicketTypeConfig[] = draft.ticketTypes.map(t => ({
        name: t.name,
        color: t.color,
        supply: t.supply,
        price: t.price,
        artistBps: Math.floor(draft.artistPercent * 100),
        organizerBps: Math.floor(draft.organizerPercent * 100),
      }));

      if (ticketTypes.length === 0) {
        ticketTypes.push({
          name: 'General Admission',
          color: '#4DA2FF',
          supply: 100,
          price: 25,
          artistBps: 9000,
          organizerBps: 800,
        });
      }

      const result = await publishEvent({
        eventName: draft.name || 'Unnamed Event',
        location: draft.venue && draft.city 
          ? `${draft.venue}, ${draft.city}` 
          : draft.venue || draft.city || 'Location TBD',
        startsAt: Math.floor(eventDateTime),
        endsAt: Math.floor(eventDateTime + 7200),
        posterCid: draft.coverImage || '',
        ticketTypes,
        artistAddress: organizerAddress,
        organizerAddress: organizerAddress,
        onProgress: (step, message) => {
          setPublishProgress({ step, message });
        },
      });

      setPublishStatus('success');
      setPublishDigest(result.digest);
      
      // Extract EventCap ID
      const eventCapId = localStorage.getItem('DROP_KIT_EVENT_CAP_ID') || result.eventId; // Fallback
      
      setPublishedIds({
        eventId: result.eventId,
        gateKeeperCapId: result.gateKeeperCapId,
        eventCapId: eventCapId,
        ticketClasses: result.ticketClasses,
      });

      localStorage.setItem('DROP_KIT_EVENT_ID', result.eventId);
      localStorage.setItem('DROP_KIT_GATE_CAP_ID', result.gateKeeperCapId);
      localStorage.setItem('DROP_KIT_EVENT_CAP_ID', eventCapId);
      if (result.ticketClasses.length > 0) {
        localStorage.setItem('DROP_KIT_KIOSK_ID', result.ticketClasses[0].kioskId);
        localStorage.setItem('DROP_KIT_CLASS_IDS', JSON.stringify(result.ticketClasses.map(c => c.classId)));
      }

    } catch (error: any) {
      console.error('Event creation error:', error);
      setPublishStatus('error');
      const friendlyError = parseMoveError(error);
      setPublishError(friendlyError);
    } finally {
      setPublishProgress(null);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateDraft({ coverImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePreviewBuyer = () => {
    navigate('/app');
  };

  const handleOpenScanner = () => {
    window.open('/checkin', '_blank');
  };

  const handleViewEvent = () => {
    navigate('/app');
  };

  const handlePreviewBuyerFlow = () => {
    navigate('/app');
  };

  const handleGenerateSampleTickets = async () => {
    alert('Sample ticket generation coming soon!');
  };

  const handleTryResale = async () => {
    alert('Resale example coming soon!');
  };

  const auroraParallax = scrollY * 0.015;
  const glowX = 50 + (mousePos.x - 0.5) * 4;
  const glowY = 50 + (mousePos.y - 0.5) * 4;
  const wizardOpacity = Math.max(0, 1 - scrollY / 400);

  const totalCapacity = draft.ticketTypes.reduce((sum, t) => sum + t.supply, 0);

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#061522]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#061522] to-transparent" />
        <div 
          className="aurora-primary absolute h-[45vmax] w-[45vmax]"
          style={{
            left: '30%',
            top: `calc(20% + ${auroraParallax}px)`,
            opacity: wizardOpacity * 0.35,
          }}
        />
        <div 
          className="glyph-pattern absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.008}px)`,
            backgroundImage: "url(/brand/sui/glyph.svg)",
            backgroundSize: "48px 48px",
            backgroundRepeat: "repeat",
            opacity: Math.max(0.024, 0.03 * (1 - scrollY / 800)),
            WebkitMaskImage: "radial-gradient(50% 50% at 50% 35%, #000 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
            maskImage: "radial-gradient(50% 50% at 50% 35%, #000 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          }}
        />
        <div 
          className="proximity-glow absolute h-[30vmax] w-[30vmax]"
          style={{
            left: `${glowX - 15}%`,
            top: `${glowY - 15}%`,
            background: "radial-gradient(circle, rgba(77,162,255,.4) 0%, transparent 70%)",
            filter: "blur(56px)",
            opacity: 0.08,
            transition: "left 0.6s cubic-bezier(0.23, 1, 0.32, 1), top 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#061522] via-[#061522]/70 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 flex items-start justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              {isAutosaving ? 'Saving...' : 'Draft saved'}
            </div>
            <h1 className="font-[Inter_Tight] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Create Event
            </h1>
            <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-white/70">
              You can edit everything later.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewBuyer}
              className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/85 transition-all hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <nav className="space-y-2">
              {[
                { id: 'basics', label: 'Basics', icon: Calendar },
                { id: 'tickets', label: 'Ticket Types', icon: Users },
                { id: 'pricing', label: 'Pricing & Royalties', icon: DollarSign },
                { id: 'publish', label: 'Publish', icon: CheckCircle },
                { id: 'playground', label: 'Playground', icon: Sparkles, badge: 'Test' },
              ].map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = 
                  (step.id === 'basics' && draft.name && draft.date) ||
                  (step.id === 'tickets' && draft.ticketTypes.length > 0) ||
                  (step.id === 'pricing' && draft.ticketTypes.some(t => t.price > 0));
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id as Step)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'bg-[#4DA2FF]/10 text-white'
                        : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90'
                    }`}
                  >
                    <motion.div 
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#4DA2FF]/20 text-[#4DA2FF]'
                          : isCompleted
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/[0.06] text-white/60 group-hover:bg-white/[0.08]'
                      }`}
                      animate={isCompleted && !isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {isCompleted && step.id !== 'playground' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <div className="text-[15px] font-medium">{step.label}</div>
                      {step.badge && (
                        <span className="mt-0.5 inline-block rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/60">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <ChevronDown className="h-4 w-4 -rotate-90 text-[#4DA2FF]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div ref={contentRef} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {currentStep === 'basics' && (
                  <StepBasics 
                    draft={draft} 
                    updateDraft={updateDraft} 
                    errors={errors}
                    validateField={validateField}
                    onNext={() => setCurrentStep('tickets')} 
                  />
                )}

                {currentStep === 'tickets' && (
                  <StepTickets 
                    draft={draft} 
                    updateDraft={updateDraft}
                    editingTicket={editingTicket}
                    setEditingTicket={setEditingTicket}
                    onAddPreset={addTicketType}
                    onUpdateTicket={updateTicketType}
                    onRemove={removeTicketType}
                    totalCapacity={totalCapacity}
                    onNext={() => setCurrentStep('pricing')}
                    onBack={() => setCurrentStep('basics')}
                  />
                )}

                {currentStep === 'pricing' && (
                  <StepPricing 
                    draft={draft} 
                    updateDraft={updateDraft}
                    onNext={() => setCurrentStep('publish')}
                    onBack={() => setCurrentStep('tickets')}
                  />
                )}

                {currentStep === 'publish' && (
                  <StepPublish 
                    draft={draft}
                    publishStatus={publishStatus}
                    publishProgress={publishProgress}
                    publishDigest={publishDigest}
                    publishError={publishError}
                    publishedIds={publishedIds}
                    payoutsConfigured={payoutsConfigured}
                    channelsEnabled={channelsEnabled}
                    setupStatus={setupStatus}
                    setupError={setupError}
                    onCreateDraft={handleCreateDraft}
                    onSetupPayouts={handleSetupPayouts}
                    onEnableChannels={handleEnableChannels}
                    onPublish={handlePublish}
                    onBack={() => setCurrentStep('pricing')}
                    isDeveloperMode={isDeveloperMode}
                    onOpenScanner={handleOpenScanner}
                    onViewEvent={handleViewEvent}
                  />
                )}

                {currentStep === 'playground' && (
                  <StepPlayground 
                    onBack={() => setCurrentStep('basics')}
                    isDeveloperMode={isDeveloperMode}
                    setIsDeveloperMode={setIsDeveloperMode}
                    onPreviewBuyerFlow={handlePreviewBuyerFlow}
                    onGenerateSampleTickets={handleGenerateSampleTickets}
                    onTryResale={handleTryResale}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      <style>{`
        .aurora-primary {
          background: radial-gradient(circle, rgba(77,162,255,.35) 0%, transparent 65%);
          filter: blur(80px);
          animation: float 55s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(3%, -2%); }
          66% { transform: translate(-2%, 2%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-primary { animation: none !important; }
          .proximity-glow { display: none !important; }
        }
      `}</style>
    </main>
  );
}

function StepBasics({ draft, updateDraft, errors, validateField, onNext }: any) {
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTimezoneSelect, setShowTimezoneSelect] = useState(false);
  const timezoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timezoneRef.current && !timezoneRef.current.contains(event.target as Node)) {
        setShowTimezoneSelect(false);
      }
    };
    if (showTimezoneSelect) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimezoneSelect]);

  const handleDateChange = (date: string) => {
    const error = validateField('date', date);
    if (error) {
      updateDraft({ date });
    } else {
      updateDraft({ date });
    }
  };

  const canContinue = draft.name && draft.date && draft.venue && draft.city;

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateDraft({ coverImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const popularTimezones = [
    { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
    { label: 'Mountain Time (MT)', value: 'America/Denver' },
    { label: 'Central Time (CT)', value: 'America/Chicago' },
    { label: 'Eastern Time (ET)', value: 'America/New_York' },
    { label: 'London (GMT)', value: 'Europe/London' },
    { label: 'Paris (CET)', value: 'Europe/Paris' },
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Sydney (AEDT)', value: 'Australia/Sydney' },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-2 text-[22px] font-medium text-white">Event Details</h2>
        <p className="mb-8 text-sm text-white/60">Basic information about your event</p>
        
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Event Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder="Summer Music Festival 2025"
              className="input-field"
              aria-required="true"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`input-field h-[48px] ${errors.date ? 'border-red-400/50' : ''}`}
                aria-required="true"
                aria-invalid={!!errors.date}
              />
              {errors.date && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {errors.date}
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={draft.time}
                onChange={(e) => updateDraft({ time: e.target.value })}
                className="input-field h-[48px]"
                aria-required="true"
              />
            </div>
            <div className="relative" ref={timezoneRef}>
              <label className="mb-2 block text-sm font-medium text-white/70">Timezone</label>
              <button 
                onClick={() => setShowTimezoneSelect(!showTimezoneSelect)}
                className="flex h-[48px] items-center gap-2 rounded-xl border border-white/12 bg-white/[0.02] px-4 text-sm text-white/70 transition-colors hover:bg-white/[0.04]"
              >
                <Clock className="h-4 w-4" />
                {draft.timezone.split('/')[1]?.replace('_', ' ') || draft.timezone}
              </button>
              
              {showTimezoneSelect && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full z-50 mt-2 w-64 rounded-xl border border-white/12 bg-[#0a1929] shadow-2xl"
                >
                  <div className="max-h-80 overflow-y-auto p-2">
                    {popularTimezones.map((tz) => (
                      <button
                        key={tz.value}
                        onClick={() => {
                          updateDraft({ timezone: tz.value });
                          setShowTimezoneSelect(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          draft.timezone === tz.value
                            ? 'bg-[#4DA2FF]/20 text-[#4DA2FF]'
                            : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        {tz.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Venue <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={draft.venue}
                onChange={(e) => updateDraft({ venue: e.target.value })}
                placeholder="The Grand Theater"
                className="input-field"
                aria-required="true"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                City / Region <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={draft.city}
                onChange={(e) => updateDraft({ city: e.target.value })}
                placeholder="San Francisco, CA"
                className="input-field"
                aria-required="true"
              />
            </div>
          </div>

          {!showFullAddress && (
            <button
              onClick={() => setShowFullAddress(true)}
              className="text-sm text-[#4DA2FF] transition-colors hover:text-[#5DADFF]"
            >
              + Add full address
            </button>
          )}

          {showFullAddress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="mb-2 block text-sm font-medium text-white/70">Full Address (optional)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={draft.fullAddress}
                  onChange={(e) => updateDraft({ fullAddress: e.target.value })}
                  placeholder="123 Main St, San Francisco, CA 94102"
                  className="input-field pl-12"
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Cover Image</label>
            <p className="mb-3 text-xs text-white/50">Recommended: 1200×630px • JPG or PNG</p>
            
            <div className="flex items-start gap-4">
              <div
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex h-32 w-32 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 transition-all ${
                  dragActive 
                    ? 'border-[#4DA2FF] bg-[#4DA2FF]/10' 
                    : draft.coverImage
                    ? 'border-white/12'
                    : 'border-dashed border-white/20 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                }`}
              >
                {draft.coverImage ? (
                  <img src={draft.coverImage} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-6 w-6 text-white/40" />
                    <div className="mt-1 text-xs text-white/50">Drop here</div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={draft.coverImage}
                  onChange={(e) => updateDraft({ coverImage: e.target.value })}
                  placeholder="Or paste image URL"
                  className="input-field"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-white/12 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/[0.04]"
                >
                  Upload from computer
                </button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        </div>
      </div>

      <div className="card flex items-center justify-between border-white/8 bg-white/[0.01] p-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Info className="h-4 w-4" />
          <span>All fields can be edited later</span>
        </div>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="group btn-primary"
          title={!canContinue ? 'Complete required fields to continue' : ''}
        >
          Save & continue
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function StepTickets({ draft, editingTicket, setEditingTicket, onAddPreset, onUpdateTicket, onRemove, totalCapacity, onNext, onBack }: any) {
  const canContinue = draft.ticketTypes.length > 0;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-2 text-[22px] font-medium text-white">Ticket Types</h2>
        <p className="mb-8 text-sm text-white/60">Set ticket tiers with prices, supply, and resale rules</p>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {TICKET_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onAddPreset(preset)}
              className="group relative rounded-xl border border-white/12 bg-white/[0.02] p-5 text-left transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_8px_24px_rgba(3,15,28,0.12)]"
            >
              <div 
                className="mb-4 h-2 w-14 rounded-full transition-opacity group-hover:opacity-80" 
                style={{ backgroundColor: preset.color }}
              />
              <div className="mb-1 font-medium text-white">{preset.name}</div>
              <div className="text-sm text-white/60">${preset.price} • {preset.supply} available</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => onAddPreset()}
          className="group mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/[0.01] p-5 text-sm font-medium text-white/70 transition-all hover:border-white/30 hover:bg-white/[0.03] hover:text-white/90"
        >
          <Plus className="h-5 w-5" />
          Add custom type
        </button>

        {draft.ticketTypes.length > 0 && (
          <div className="space-y-3">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-white">Your ticket types</span>
              {totalCapacity > 0 && (
                <span className="text-white/60">Total capacity: <span className="font-semibold text-white">{totalCapacity}</span></span>
              )}
            </div>
            
            {draft.ticketTypes.map((ticket: TicketType) => (
              <div key={ticket.id} className="rounded-xl border border-white/12 bg-white/[0.02] p-4 transition-all hover:border-white/16">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg" style={{ backgroundColor: ticket.color }} />
                  <div className="flex-1">
                    <div className="mb-1 font-medium text-white">{ticket.name}</div>
                    <div className="text-sm text-white/60">
                      ${ticket.price} • {ticket.supply} available • {TRANSFER_POLICIES[ticket.transferPolicy].label}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTicket(editingTicket === ticket.id ? null : ticket.id)}
                      className="rounded-lg px-3 py-1.5 text-sm text-[#4DA2FF] transition-colors hover:bg-[#4DA2FF]/10"
                    >
                      {editingTicket === ticket.id ? 'Done' : 'Edit'}
                    </button>
                    <button
                      onClick={() => onRemove(ticket.id)}
                      className="rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {editingTicket === ticket.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-4 border-t border-white/8 pt-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-medium text-white/70">Name</label>
                        <input
                          type="text"
                          value={ticket.name}
                          onChange={(e) => onUpdateTicket(ticket.id, { name: e.target.value })}
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-medium text-white/70">Price ($)</label>
                        <input
                          type="number"
                          value={ticket.price}
                          onChange={(e) => onUpdateTicket(ticket.id, { price: Number(e.target.value) })}
                          className="input-field tabular-nums text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-white/70">Supply</label>
                      <input
                        type="number"
                        value={ticket.supply}
                        onChange={(e) => onUpdateTicket(ticket.id, { supply: Number(e.target.value) })}
                        className="input-field tabular-nums text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-white/70">Resale Policy</label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(TRANSFER_POLICIES).map(([key, policy]) => (
                          <button
                            key={key}
                            onClick={() => onUpdateTicket(ticket.id, { transferPolicy: key })}
                            className={`rounded-lg border p-3 text-left text-xs transition-all ${
                              ticket.transferPolicy === key
                                ? 'border-[#4DA2FF] bg-[#4DA2FF]/10 text-white'
                                : 'border-white/12 bg-white/[0.01] text-white/70 hover:border-white/20'
                            }`}
                          >
                            <div className="font-medium">{policy.label}</div>
                            <div className="mt-0.5 text-[10px] text-white/50">{policy.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalCapacity === 0 && draft.ticketTypes.length > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-400">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>Total capacity is zero. Set supply for at least one ticket type.</div>
          </div>
        )}
      </div>

      <div className="card flex items-center justify-between border-white/8 bg-white/[0.01] p-4">
        <button onClick={onBack} className="btn-outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!canContinue || totalCapacity === 0} 
          className="btn-primary"
          title={!canContinue ? 'Add at least one ticket type' : totalCapacity === 0 ? 'Set supply greater than zero' : ''}
        >
          Save & continue
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function StepPricing({ draft, updateDraft, onNext, onBack }: any) {
  const platformFee = 0;
  const netToSeller = 100 - draft.artistPercent - draft.organizerPercent - platformFee;
  const isValidSplit = netToSeller >= 0 && netToSeller <= 100;

  const handlePresetChange = (preset: keyof typeof ROYALTY_PRESETS) => {
    const config = ROYALTY_PRESETS[preset];
    if (preset === 'custom') {
      updateDraft({ royaltyPreset: preset });
    } else {
      updateDraft({ 
        royaltyPreset: preset,
        artistPercent: config.artist,
        organizerPercent: config.org,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-2 text-[22px] font-medium text-white">Pricing & Royalties</h2>
        <p className="mb-8 text-sm text-white/60">Set royalty splits for resales</p>

        <div className="mb-8">
          <label className="mb-3 block text-sm font-medium text-white/70">Royalty Preset</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(ROYALTY_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePresetChange(key as keyof typeof ROYALTY_PRESETS)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  draft.royaltyPreset === key
                    ? 'border-[#4DA2FF] bg-[#4DA2FF]/10'
                    : 'border-white/12 bg-white/[0.02] hover:border-white/20 hover:-translate-y-0.5'
                }`}
              >
                <div className="mb-1 font-medium text-white">{preset.label}</div>
                {key !== 'custom' && (
                  <div className="text-xs text-white/60">
                    {preset.artist}% artist / {preset.org}% organizer
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {draft.royaltyPreset === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 space-y-4"
          >
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-white/70">
                <span>Artist Royalty (%)</span>
                <span className="tabular-nums text-white">{draft.artistPercent}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={draft.artistPercent}
                onChange={(e) => updateDraft({ artistPercent: Number(e.target.value) })}
                className="range-slider w-full"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-white/70">
                <span>Organizer Royalty (%)</span>
                <span className="tabular-nums text-white">{draft.organizerPercent}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={draft.organizerPercent}
                onChange={(e) => updateDraft({ organizerPercent: Number(e.target.value) })}
                className="range-slider w-full"
              />
            </div>
            {!isValidSplit && (
              <div className="flex items-start gap-2 text-xs text-red-400">
                <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                Royalties can't exceed 100%
              </div>
            )}
          </motion.div>
        )}

        <div className="rounded-xl border border-white/12 bg-white/[0.02] p-6">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#4DA2FF]">
            <Sparkles className="h-4 w-4" />
            Resale Split Example
          </h3>
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/8 bg-white/[0.01] p-4">
              <div className="mb-1 text-xs text-white/50">Resale price</div>
              <div className="text-2xl font-bold tabular-nums text-white">$100</div>
            </div>
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <div className="mb-1 text-xs text-green-400">Seller receives</div>
              <div className="text-2xl font-bold tabular-nums text-green-400">${netToSeller}</div>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Artist royalty</span>
              <span className="tabular-nums font-semibold text-white">${draft.artistPercent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Organizer fee</span>
              <span className="tabular-nums font-semibold text-white">${draft.organizerPercent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Platform fee</span>
              <span className="tabular-nums font-semibold text-white">${platformFee}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card flex items-center justify-between border-white/8 bg-white/[0.01] p-4">
        <button onClick={onBack} className="btn-outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button onClick={onNext} disabled={!isValidSplit} className="btn-primary">
          Save & continue
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function StepPublish({ 
  draft, 
  publishStatus, 
  publishProgress, 
  publishDigest, 
  publishError, 
  publishedIds,
  payoutsConfigured,
  channelsEnabled,
  setupStatus,
  setupError,
  onCreateDraft,
  onSetupPayouts,
  onEnableChannels,
  onPublish, 
  onBack, 
  isDeveloperMode, 
  onOpenScanner, 
  onViewEvent 
}: any) {
  const [showPayoutsModal, setShowPayoutsModal] = useState(false);
  const [showChannelsModal, setShowChannelsModal] = useState(false);

  const checks = [
    { 
      label: 'Event created', 
      done: !!publishedIds?.eventId, 
      blocker: true, 
      action: 'Create event', 
      onClick: onCreateDraft 
    },
    { 
      label: 'Payouts connected', 
      done: payoutsConfigured, 
      blocker: true, 
      action: 'Setup payouts', 
      onClick: () => setShowPayoutsModal(true)
    },
    { 
      label: 'Sales channels enabled', 
      done: channelsEnabled, 
      blocker: true, 
      action: 'Enable channels', 
      onClick: () => setShowChannelsModal(true)
    },
    { label: 'Ticket types', done: draft.ticketTypes.length > 0 },
    { label: 'Pricing & royalties', done: draft.ticketTypes.some((t: TicketType) => t.price > 0) },
  ];

  const blockers = checks.filter(c => c.blocker && !c.done);
  const canPublish = checks.every(c => c.done);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-2 text-[22px] font-medium text-white">Review & Publish</h2>
        <p className="mb-8 text-sm text-white/60">Complete setup before going live</p>

        <div className="mb-8 space-y-3">
          {checks.map((check, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                check.done 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : check.blocker
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-white/12 bg-white/[0.02]'
              }`}
            >
              <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                check.done ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
              }`}>
                {check.done && <CheckCircle className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className={check.done ? 'text-white' : 'text-white/70'}>{check.label}</div>
                {check.blocker && !check.done && (
                  <div className="mt-1 text-xs text-orange-400">Required to publish</div>
                )}
              </div>
              {check.blocker && !check.done && check.action && check.onClick && (
                <button
                  onClick={check.onClick}
                  disabled={setupStatus === 'pending'}
                  className="rounded-lg bg-[#4DA2FF] px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-[#5DADFF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF] disabled:opacity-50"
                >
                  {setupStatus === 'pending' ? 'Processing...' : check.action}
                </button>
              )}
            </div>
          ))}
        </div>

        {setupError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {setupError}
          </div>
        )}

        {publishStatus !== 'success' && (
          <div>
            <button
              onClick={onPublish}
              disabled={publishStatus === 'pending' || !canPublish}
              className="btn-primary w-full"
            >
              {publishStatus === 'pending' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing Event...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Go Live
                </>
              )}
            </button>
            {blockers.length > 0 && (
              <div className="mt-3 text-center text-xs text-white/60">
                {blockers.map(b => b.label).join(' and ')} required to publish
              </div>
            )}
          </div>
        )}

        <TxStatus status={publishStatus} digest={publishDigest} error={publishError} />

        {publishStatus === 'success' && publishedIds?.eventId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-green-500/30 bg-green-500/10 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">Event Published!</h3>
                <p className="text-sm text-green-300">Your tickets are now live and ready for sale</p>
              </div>
            </div>

            {isDeveloperMode && publishedIds.eventId && (
              <div className="mt-4 space-y-2 rounded-lg bg-black/20 p-3 font-mono text-xs text-green-300">
                <div>Event ID: {publishedIds.eventId.slice(0, 30)}...</div>
                {publishedIds.eventCapId && <div>Event Cap: {publishedIds.eventCapId.slice(0, 30)}...</div>}
                {publishedIds.gateKeeperCapId && <div>Gate Cap: {publishedIds.gateKeeperCapId.slice(0, 30)}...</div>}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={onOpenScanner}
                className="btn-outline flex-1"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Open Scanner
              </button>
              <button 
                onClick={onViewEvent}
                className="btn-primary flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Event
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {publishStatus !== 'success' && (
        <div className="card flex items-center justify-start border-white/8 bg-white/[0.01] p-4">
          <button onClick={onBack} className="btn-outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </button>
        </div>
      )}

      {showPayoutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-lg"
          >
            <h3 className="mb-4 text-xl font-semibold text-white">Setup Payouts</h3>
            <p className="mb-6 text-sm text-white/70">
              Configure how sale proceeds are split automatically on-chain.
            </p>
            <div className="mb-6 space-y-3 rounded-lg border border-white/12 bg-white/[0.02] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Artist</span>
                <span className="font-semibold text-white">{draft.artistPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Organizer</span>
                <span className="font-semibold text-white">{draft.organizerPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Platform</span>
                <span className="font-semibold text-white">{100 - draft.artistPercent - draft.organizerPercent}%</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPayoutsModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowPayoutsModal(false);
                  onSetupPayouts();
                }}
                className="btn-primary flex-1"
              >
                Confirm & Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showChannelsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-lg"
          >
            <h3 className="mb-4 text-xl font-semibold text-white">Enable Sales Channel</h3>
            <p className="mb-6 text-sm text-white/70">
              Create a primary sales channel for "{draft.ticketTypes[0]?.name || 'tickets'}".
            </p>
            <div className="mb-6 space-y-3 rounded-lg border border-white/12 bg-white/[0.02] p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Price</span>
                <span className="font-semibold text-white">${draft.ticketTypes[0]?.price || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Supply</span>
                <span className="font-semibold text-white">{draft.ticketTypes[0]?.supply || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Per-wallet limit</span>
                <span className="font-semibold text-white">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Active window</span>
                <span className="font-semibold text-white">Now → Event + 24h</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowChannelsModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowChannelsModal(false);
                  onEnableChannels();
                }}
                className="btn-primary flex-1"
              >
                Create Channel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StepPlayground({ onBack, isDeveloperMode, setIsDeveloperMode, onPreviewBuyerFlow, onGenerateSampleTickets, onTryResale }: any) {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="mb-2 text-[22px] font-medium text-white">Playground</h2>
            <p className="text-sm text-white/60">Test the complete ticket flow with sample data</p>
          </div>
          <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/70">
            Private • Free
          </span>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onPreviewBuyerFlow}
            className="group flex w-full items-center gap-4 rounded-xl border border-white/12 bg-white/[0.02] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_8px_24px_rgba(3,15,28,0.12)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4DA2FF]/10">
              <Eye className="h-5 w-5 text-[#4DA2FF]" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">Preview buyer flow</div>
              <div className="text-xs text-white/50">No real money or tickets created</div>
            </div>
            <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1" />
          </button>

          <button 
            onClick={onGenerateSampleTickets}
            className="group flex w-full items-center gap-4 rounded-xl border border-white/12 bg-white/[0.02] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_8px_24px_rgba(3,15,28,0.12)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Users className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">Generate 10 sample GA tickets</div>
              <div className="text-xs text-white/50">Test ticket creation</div>
            </div>
            <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1" />
          </button>

          <button 
            onClick={onTryResale}
            className="group flex w-full items-center gap-4 rounded-xl border border-white/12 bg-white/[0.02] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_8px_24px_rgba(3,15,28,0.12)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <DollarSign className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">Try a resale example</div>
              <div className="text-xs text-white/50">See royalty splits in action</div>
            </div>
            <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="mt-8 border-t border-white/8 pt-6">
          <button
            onClick={() => setIsDeveloperMode(!isDeveloperMode)}
            className="flex w-full items-center justify-between rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white/90"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Developer Mode</span>
            </div>
            <div className={`relative h-5 w-9 rounded-full transition-colors ${
              isDeveloperMode ? 'bg-[#4DA2FF]' : 'bg-white/20'
            }`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                isDeveloperMode ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </div>

        {isDeveloperMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 rounded-lg border border-white/12 bg-white/[0.02] p-4"
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#4DA2FF]">
              <Settings className="h-4 w-4" />
              Developer Info
            </div>
            <div className="space-y-2 font-mono text-xs text-white/60">
              <div className="flex items-center justify-between">
                <span>Package:</span>
                <span className="text-white">{PACKAGE_ID?.slice(0, 12) || 'Not deployed'}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Policy:</span>
                <span className="text-white">{POLICY_ID?.slice(0, 12) || 'Not deployed'}...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="card flex items-center justify-start border-white/8 bg-white/[0.01] p-4">
        <button onClick={onBack} className="btn-outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Steps
        </button>
      </div>
    </div>
  );
}
