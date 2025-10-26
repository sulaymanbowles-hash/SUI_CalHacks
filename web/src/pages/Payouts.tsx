/**
 * Payouts & Billing - Complete compliance and wire on-chain splits to real recipients
 * 
 * Flow:
 * 1. Payout method (on-chain Sui address or bank account)
 * 2. Recipients & splits (who gets paid and percentages)
 * 3. Legal & tax (KYB/KYC compliance)
 * 4. Preferences (schedule, currency, notifications)
 * 5. Review & verify (checklist and test payout)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  ChevronRight,
  Wallet,
  Building2,
  User,
  Bell,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getZkLoginSession } from '../lib/zklogin';
import { currentAddress } from '../lib/signer';

type Step = 'method' | 'recipients' | 'legal' | 'preferences' | 'review';
type PayoutStatus = 'not-set-up' | 'in-review' | 'verified' | 'action-required';
type PayoutMethodType = 'on-chain' | 'bank' | null;
type RecipientStatus = 'pending' | 'verified' | 'action-needed';

interface Recipient {
  id: string;
  name: string;
  role: 'artist' | 'organizer' | 'platform';
  destination: string;
  destinationType: 'sui' | 'bank';
  share: number;
  status: RecipientStatus;
}

interface LegalDoc {
  id: string;
  type: 'id' | 'business-reg' | 'w9';
  name: string;
  status: 'uploaded' | 'in-review' | 'verified' | 'needs-reupload';
  uploadedAt: string;
}

export function Payouts() {
  const currentAccount = useCurrentAccount();
  const zkSession = getZkLoginSession();
  const devAddress = currentAddress();
  
  const [activeStep, setActiveStep] = useState<Step>('method');
  const [isDemoMode] = useState(true); // Demo mode for hackathon
  const [isDirty, setIsDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Payout method state
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodType>(isDemoMode ? 'on-chain' : null);
  const [suiAddress, setSuiAddress] = useState('');
  const [addressVerified, setAddressVerified] = useState(false);
  const [bankConnected, setBankConnected] = useState(isDemoMode);
  
  // Recipients state
  const [recipients, setRecipients] = useState<Recipient[]>(
    isDemoMode ? [
      {
        id: '1',
        name: 'Artist Name',
        role: 'artist',
        destination: '0x1234...5678',
        destinationType: 'sui',
        share: 90,
        status: 'verified',
      },
      {
        id: '2',
        name: 'Organizer',
        role: 'organizer',
        destination: '0x8765...4321',
        destinationType: 'sui',
        share: 8,
        status: 'verified',
      },
      {
        id: '3',
        name: 'Platform',
        role: 'platform',
        destination: '0xabcd...efgh',
        destinationType: 'sui',
        share: 2,
        status: 'verified',
      },
    ] : []
  );
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  
  // Legal & tax state
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');
  const [legalDocs, setLegalDocs] = useState<LegalDoc[]>([]);
  
  // Preferences state
  const [payoutSchedule, setPayoutSchedule] = useState<'daily' | 'weekly' | 'threshold'>('daily');
  const [notifications, setNotifications] = useState({
    payoutSent: true,
    actionRequired: true,
    failedPayout: true,
  });
  
  // Auto-fill connected wallet address
  useEffect(() => {
    if (currentAccount) {
      setSuiAddress(currentAccount.address);
    } else if (zkSession) {
      setSuiAddress(zkSession.address);
    } else if (devAddress) {
      setSuiAddress(devAddress);
    }
  }, [currentAccount, zkSession, devAddress]);
  
  const totalShare = recipients.reduce((sum, r) => sum + r.share, 0);
  const isRecipientSplitValid = Math.abs(totalShare - 100) < 0.01;
  
  const getStatus = (): PayoutStatus => {
    if (isDemoMode) return 'verified';
    if (!payoutMethod) return 'not-set-up';
    if (payoutMethod === 'on-chain' && !addressVerified) return 'action-required';
    if (!isRecipientSplitValid) return 'action-required';
    if (legalDocs.some(d => d.status === 'needs-reupload')) return 'action-required';
    if (legalDocs.some(d => d.status === 'in-review')) return 'in-review';
    return 'verified';
  };
  
  const status = getStatus();
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleVerifyAddress = () => {
    // In production: sign a message with connected wallet
    setAddressVerified(true);
    setIsDirty(true);
  };
  
  const handleSimulatePayout = () => {
    // Demo mode: show success toast
    alert('✅ Simulated $25.00 payout to your Sui address');
  };
  
  const steps: { id: Step; label: string; complete: boolean }[] = [
    { 
      id: 'method', 
      label: 'Payout method', 
      complete: !!payoutMethod && (payoutMethod === 'bank' ? bankConnected : addressVerified)
    },
    { 
      id: 'recipients', 
      label: 'Recipients & splits', 
      complete: recipients.length > 0 && isRecipientSplitValid && recipients.every(r => r.status === 'verified')
    },
    { 
      id: 'legal', 
      label: 'Legal & tax', 
      complete: isDemoMode || legalDocs.every(d => d.status === 'verified')
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      complete: true
    },
    { 
      id: 'review', 
      label: 'Review & verify', 
      complete: false
    },
  ];
  
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061522]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div 
          className="absolute left-1/3 top-1/4 h-[40vmax] w-[40vmax] rounded-full bg-[#4DA2FF] opacity-[0.03] blur-[100px]"
        />
      </div>
      
      <div className="mx-auto max-w-screen-xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-white">Payouts & Billing</h1>
              <p className="text-white/60">
                Connect payout destinations and complete compliance so sales and royalties can be paid automatically
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {isDemoMode && (
                <div className="flex items-center gap-2 rounded-full bg-[#FFB020]/10 px-3 py-1.5 text-xs font-medium text-[#FFB020]">
                  <Sparkles className="h-3 w-3" />
                  Demo mode
                </div>
              )}
              
              <StatusChip status={status} />
              
              <button className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06]">
                <HelpCircle className="h-4 w-4" />
                Need help?
              </button>
              
              <button
                disabled={!isDirty}
                className="rounded-xl bg-[#4DA2FF] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#5DADFF] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
        
        <div className="flex gap-8">
          {/* Stepper */}
          <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                    activeStep === step.id
                      ? 'bg-[#4DA2FF]/10 text-[#4DA2FF]'
                      : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    step.complete
                      ? 'bg-green-500/20 text-green-400'
                      : activeStep === step.id
                      ? 'bg-[#4DA2FF]/20 text-[#4DA2FF]'
                      : 'bg-white/[0.08] text-white/50'
                  }`}>
                    {step.complete ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <span className="flex-1">{step.label}</span>
                  {activeStep === step.id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </nav>
          </aside>
          
          {/* Content */}
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              {activeStep === 'method' && (
                <MethodStep
                  key="method"
                  payoutMethod={payoutMethod}
                  setPayoutMethod={setPayoutMethod}
                  suiAddress={suiAddress}
                  addressVerified={addressVerified}
                  bankConnected={bankConnected}
                  isDemoMode={isDemoMode}
                  onVerifyAddress={handleVerifyAddress}
                  onSimulatePayout={handleSimulatePayout}
                  onCopy={handleCopy}
                  copied={copied}
                />
              )}
              
              {activeStep === 'recipients' && (
                <RecipientsStep
                  key="recipients"
                  recipients={recipients}
                  setRecipients={setRecipients}
                  totalShare={totalShare}
                  isValid={isRecipientSplitValid}
                  showAddRecipient={showAddRecipient}
                  setShowAddRecipient={setShowAddRecipient}
                />
              )}
              
              {activeStep === 'legal' && (
                <LegalStep
                  key="legal"
                  accountType={accountType}
                  setAccountType={setAccountType}
                  legalDocs={legalDocs}
                  setLegalDocs={setLegalDocs}
                  isDemoMode={isDemoMode}
                />
              )}
              
              {activeStep === 'preferences' && (
                <PreferencesStep
                  key="preferences"
                  payoutSchedule={payoutSchedule}
                  setPayoutSchedule={setPayoutSchedule}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              )}
              
              {activeStep === 'review' && (
                <ReviewStep
                  key="review"
                  steps={steps}
                  isDemoMode={isDemoMode}
                  onSimulatePayout={handleSimulatePayout}
                />
              )}
            </AnimatePresence>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === activeStep);
                  if (currentIndex > 0) setActiveStep(steps[currentIndex - 1].id);
                }}
                disabled={activeStep === 'method'}
                className="rounded-xl border border-white/12 bg-white/[0.02] px-6 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              
              <button
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === activeStep);
                  if (currentIndex < steps.length - 1) setActiveStep(steps[currentIndex + 1].id);
                }}
                className="rounded-xl bg-[#4DA2FF] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#5DADFF]"
              >
                {activeStep === 'review' ? 'Finish verification' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Component implementations below...

// Status Chip Component
function StatusChip({ status }: { status: PayoutStatus }) {
  const config = {
    'not-set-up': { label: 'Not set up', color: 'text-white/60 bg-white/[0.08]' },
    'in-review': { label: 'In review', color: 'text-[#FFB020] bg-[#FFB020]/10' },
    'verified': { label: 'Verified', color: 'text-green-400 bg-green-500/10' },
    'action-required': { label: 'Action required', color: 'text-red-400 bg-red-500/10' },
  }[status];
  
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${config.color}`}>
      {status === 'verified' && <CheckCircle className="h-3 w-3" />}
      {status === 'action-required' && <AlertCircle className="h-3 w-3" />}
      {config.label}
    </div>
  );
}

// Method Step Component
function MethodStep({
  payoutMethod,
  setPayoutMethod,
  suiAddress,
  addressVerified,
  bankConnected,
  isDemoMode,
  onVerifyAddress,
  onSimulatePayout,
  onCopy,
  copied,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Payout method</h2>
        <p className="text-sm text-white/60">
          Choose where you'd like to receive sales and royalties.
        </p>
      </div>
      
      {/* On-chain option */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4DA2FF]/10">
              <Wallet className="h-5 w-5 text-[#4DA2FF]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">On-chain (recommended for royalties)</h3>
              <p className="text-sm text-white/60">
                Receive proceeds directly to your Sui address on every resale
              </p>
            </div>
          </div>
          
          <input
            type="radio"
            checked={payoutMethod === 'on-chain'}
            onChange={() => setPayoutMethod('on-chain')}
            className="h-5 w-5 text-[#4DA2FF]"
          />
        </div>
        
        {payoutMethod === 'on-chain' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 space-y-4 border-t border-white/8 pt-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Sui address to receive proceeds
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={suiAddress}
                  readOnly
                  className="flex-1 rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2.5 font-mono text-sm text-white"
                />
                <button
                  onClick={() => onCopy(suiAddress)}
                  className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06]"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {!addressVerified ? (
              <button
                onClick={onVerifyAddress}
                className="flex items-center gap-2 rounded-lg bg-[#4DA2FF] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#5DADFF]"
              >
                <CheckCircle className="h-4 w-4" />
                Verify ownership
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2.5 text-sm font-medium text-green-400">
                <CheckCircle className="h-4 w-4" />
                Verified
                {isDemoMode && ' · Test'}
              </div>
            )}
            
            <p className="text-xs text-white/50">
              We use a one-time signature to confirm this address is yours.
            </p>
            
            {isDemoMode && (
              <button
                onClick={onSimulatePayout}
                className="mt-2 flex items-center gap-2 rounded-lg border border-[#FFB020]/20 bg-[#FFB020]/10 px-4 py-2.5 text-sm font-medium text-[#FFB020] transition-colors hover:bg-[#FFB020]/20"
              >
                <Sparkles className="h-4 w-4" />
                Simulate payout
              </button>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Bank account option */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.08]">
              <Building2 className="h-5 w-5 text-white/60" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Bank account (for fiat primary sales)</h3>
              <p className="text-sm text-white/60">
                Connect your bank to receive fiat payments
              </p>
            </div>
          </div>
          
          <input
            type="radio"
            checked={payoutMethod === 'bank'}
            onChange={() => setPayoutMethod('bank')}
            className="h-5 w-5 text-[#4DA2FF]"
          />
        </div>
        
        {payoutMethod === 'bank' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 border-t border-white/8 pt-4"
          >
            {!bankConnected ? (
              <button className="flex items-center gap-2 rounded-lg bg-[#4DA2FF] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#5DADFF]">
                <Building2 className="h-4 w-4" />
                Connect bank
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-white/60" />
                    <div>
                      <div className="font-medium text-white">Chase Bank · ••••4242</div>
                      <div className="text-xs text-white/60">USD · Daily payouts</div>
                    </div>
                  </div>
                  {isDemoMode && (
                    <div className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
                      Connected · Test
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 text-sm">
                  <button className="text-[#4DA2FF] hover:underline">Change</button>
                  <span className="text-white/30">·</span>
                  <button className="text-red-400 hover:underline">Remove</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Recipients Step Component
function RecipientsStep({
  recipients,
  setRecipients,
  totalShare,
  isValid,
  showAddRecipient,
  setShowAddRecipient,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Recipients & splits</h2>
        <p className="text-sm text-white/60">
          Confirm who gets paid and in what proportions (mirrors your transfer policy)
        </p>
      </div>
      
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Royalty recipients</h3>
          <button
            onClick={() => setShowAddRecipient(true)}
            className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.02] px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06]"
          >
            <Plus className="h-4 w-4" />
            Add recipient
          </button>
        </div>
        
        {/* Recipients table */}
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-left text-xs font-medium text-white/60">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Share</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient: Recipient) => (
                <tr key={recipient.id} className="border-b border-white/8 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-white">{recipient.name}</td>
                  <td className="px-4 py-3 text-sm text-white/70 capitalize">{recipient.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      {recipient.destinationType === 'sui' ? (
                        <Wallet className="h-3 w-3 text-white/60" />
                      ) : (
                        <Building2 className="h-3 w-3 text-white/60" />
                      )}
                      <span className="font-mono text-white/70">{recipient.destination}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-white">{recipient.share}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      recipient.status === 'verified' ? 'bg-green-500/10 text-green-400' :
                      recipient.status === 'pending' ? 'bg-[#FFB020]/10 text-[#FFB020]' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {recipient.status === 'verified' && <Check className="h-3 w-3" />}
                      {recipient.status === 'verified' ? 'Verified' : 
                       recipient.status === 'pending' ? 'Pending setup' : 'Action needed'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-white/60 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Split summary */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <span className="text-sm font-medium text-white/70">Total split</span>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-semibold tabular-nums ${
              isValid ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalShare.toFixed(1)}%
            </span>
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
          </div>
        </div>
        
        {!isValid && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Total share must equal 100%. Current total: {totalShare.toFixed(1)}%</span>
          </div>
        )}
        
        {/* Visual split preview */}
        <div className="mt-6 space-y-3">
          <div className="text-xs font-medium text-white/70">Resale split preview</div>
          <div className="flex gap-3">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="mb-1 text-xs text-white/60 capitalize">{recipient.role}</div>
                <div className="text-lg font-semibold text-white">{recipient.share}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Legal Step Component
function LegalStep({ accountType, setAccountType, legalDocs, setLegalDocs, isDemoMode }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Legal & tax</h2>
        <p className="text-sm text-white/60">
          We're required to collect this information before we can send payouts. It only takes a few minutes.
        </p>
      </div>
      
      {isDemoMode && (
        <div className="flex items-start gap-3 rounded-lg border border-[#FFB020]/20 bg-[#FFB020]/10 p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FFB020]" />
          <div className="text-sm text-[#FFB020]">
            <div className="font-medium">Demo mode active</div>
            <div className="mt-1 text-[#FFB020]/80">
              In production, you'll complete KYB/KYC verification through our compliance partner.
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-semibold text-white">Organization details</h3>
        
        <div className="space-y-4">
          {/* Account type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Account type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setAccountType('individual')}
                className={`flex-1 rounded-lg border p-4 text-left transition-all ${
                  accountType === 'individual'
                    ? 'border-[#4DA2FF] bg-[#4DA2FF]/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <User className="mb-2 h-5 w-5 text-white/60" />
                <div className="font-medium text-white">Individual</div>
                <div className="text-xs text-white/60">Personal account</div>
              </button>
              
              <button
                onClick={() => setAccountType('business')}
                className={`flex-1 rounded-lg border p-4 text-left transition-all ${
                  accountType === 'business'
                    ? 'border-[#4DA2FF] bg-[#4DA2FF]/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <Building2 className="mb-2 h-5 w-5 text-white/60" />
                <div className="font-medium text-white">Business</div>
                <div className="text-xs text-white/60">Company or organization</div>
              </button>
            </div>
          </div>
          
          {/* Form fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Legal name</label>
              <input
                type="text"
                placeholder={accountType === 'individual' ? 'Full name' : 'Company name'}
                className="w-full rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/40"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Country</label>
              <select className="w-full rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white">
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
              </select>
            </div>
            
            {accountType === 'business' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">EIN / Tax ID</label>
                <input
                  type="text"
                  placeholder="12-3456789"
                  className="w-full rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/40"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Document uploads */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-semibold text-white">Required documents</h3>
        
        <div className="space-y-3">
          <DocumentUpload
            type="Government ID"
            description="Passport, driver's license, or national ID"
            status={isDemoMode ? 'verified' : undefined}
          />
          
          {accountType === 'business' && (
            <DocumentUpload
              type="Business registration"
              description="Articles of incorporation or business license"
              status={isDemoMode ? 'verified' : undefined}
            />
          )}
        </div>
      </div>
      
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
        <div className="mb-2 font-medium text-white/80">Why we need this</div>
        <p>
          We're legally required to verify your identity before processing payouts. 
          Your information is encrypted and handled according to our{' '}
          <a href="#" className="text-[#4DA2FF] hover:underline">privacy policy</a>.
        </p>
      </div>
    </motion.div>
  );
}

function DocumentUpload({ type, description, status }: any) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.08]">
          <Upload className="h-5 w-5 text-white/60" />
        </div>
        <div>
          <div className="font-medium text-white">{type}</div>
          <div className="text-xs text-white/60">{description}</div>
        </div>
      </div>
      
      {status === 'verified' ? (
        <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400">
          <CheckCircle className="h-3 w-3" />
          Verified · Test
        </div>
      ) : (
        <button className="rounded-lg border border-white/12 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06]">
          Upload
        </button>
      )}
    </div>
  );
}

// Continue with PreferencesStep and ReviewStep...

// Preferences Step Component
function PreferencesStep({ payoutSchedule, setPayoutSchedule, notifications, setNotifications }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Preferences</h2>
        <p className="text-sm text-white/60">
          Configure payout schedule and notification settings
        </p>
      </div>
      
      {/* Payout schedule */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-semibold text-white">Payout schedule</h3>
        
        <div className="space-y-3">
          <button
            onClick={() => setPayoutSchedule('daily')}
            className={`flex w-full items-center justify-between rounded-lg border p-4 transition-all ${
              payoutSchedule === 'daily'
                ? 'border-[#4DA2FF] bg-[#4DA2FF]/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div>
              <div className="font-medium text-white">Daily</div>
              <div className="text-sm text-white/60">Receive payouts every business day</div>
            </div>
            <div className={`h-5 w-5 rounded-full border-2 transition-all ${
              payoutSchedule === 'daily'
                ? 'border-[#4DA2FF] bg-[#4DA2FF]'
                : 'border-white/20'
            }`}>
              {payoutSchedule === 'daily' && <div className="h-full w-full rounded-full bg-white scale-50" />}
            </div>
          </button>
          
          <button
            onClick={() => setPayoutSchedule('weekly')}
            className={`flex w-full items-center justify-between rounded-lg border p-4 transition-all ${
              payoutSchedule === 'weekly'
                ? 'border-[#4DA2FF] bg-[#4DA2FF]/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div>
              <div className="font-medium text-white">Weekly</div>
              <div className="text-sm text-white/60">Receive payouts once per week</div>
            </div>
            <div className={`h-5 w-5 rounded-full border-2 transition-all ${
              payoutSchedule === 'weekly'
                ? 'border-[#4DA2FF] bg-[#4DA2FF]'
                : 'border-white/20'
            }`}>
              {payoutSchedule === 'weekly' && <div className="h-full w-full rounded-full bg-white scale-50" />}
            </div>
          </button>
          
          <button
            onClick={() => setPayoutSchedule('threshold')}
            className={`flex w-full items-center justify-between rounded-lg border p-4 transition-all ${
              payoutSchedule === 'threshold'
                ? 'border-[#4DA2FF] bg-[#4DA2FF]/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div>
              <div className="font-medium text-white">Threshold-based</div>
              <div className="text-sm text-white/60">Set a minimum balance before payout</div>
            </div>
            <div className={`h-5 w-5 rounded-full border-2 transition-all ${
              payoutSchedule === 'threshold'
                ? 'border-[#4DA2FF] bg-[#4DA2FF]'
                : 'border-white/20'
            }`}>
              {payoutSchedule === 'threshold' && <div className="h-full w-full rounded-full bg-white scale-50" />}
            </div>
          </button>
        </div>
        
        {payoutSchedule === 'threshold' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 border-t border-white/8 pt-4"
          >
            <label className="mb-2 block text-sm font-medium text-white/70">
              Minimum balance (USD)
            </label>
            <input
              type="number"
              defaultValue={100}
              min={10}
              className="w-full rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white"
            />
          </motion.div>
        )}
      </div>
      
      {/* Currency & fees */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-semibold text-white">Currency & fees</h3>
        
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">Currency</label>
            <select className="w-full rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white">
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
            </select>
          </div>
          
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-2 text-sm font-medium text-white">Network fees</div>
            <p className="text-sm text-white/60">
              Gas fees for on-chain transactions are deducted from the payout amount. 
              Typically ~$0.01–0.05 per transaction.
            </p>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-semibold text-white">Notifications</h3>
        
        <div className="space-y-3">
          <NotificationToggle
            label="Payout sent"
            description="Get notified when a payout is processed"
            checked={notifications.payoutSent}
            onChange={(checked) => setNotifications({ ...notifications, payoutSent: checked })}
          />
          
          <NotificationToggle
            label="Action required"
            description="Important updates about your payout settings"
            checked={notifications.actionRequired}
            onChange={(checked) => setNotifications({ ...notifications, actionRequired: checked })}
          />
          
          <NotificationToggle
            label="Failed payout"
            description="Get alerted if a payout fails"
            checked={notifications.failedPayout}
            onChange={(checked) => setNotifications({ ...notifications, failedPayout: checked })}
          />
        </div>
      </div>
    </motion.div>
  );
}

function NotificationToggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-white/60" />
        <div>
          <div className="font-medium text-white">{label}</div>
          <div className="text-sm text-white/60">{description}</div>
        </div>
      </div>
      
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-[#4DA2FF]' : 'bg-white/20'
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

// Review Step Component
function ReviewStep({ steps, isDemoMode, onSimulatePayout }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-xl font-semibold text-white">Review & verify</h2>
        <p className="text-sm text-white/60">
          Confirm all settings are correct before completing verification
        </p>
      </div>
      
      {/* Checklist */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-semibold text-white">Setup checklist</h3>
        
        <div className="space-y-3">
          {steps.slice(0, -1).map((step: any) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                step.complete
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-red-500/20 bg-red-500/5'
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                step.complete ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {step.complete ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className={`font-medium ${step.complete ? 'text-white' : 'text-red-400'}`}>
                  {step.label}
                </div>
                {!step.complete && (
                  <div className="text-sm text-red-400/80">Incomplete - please complete this step</div>
                )}
              </div>
              
              {step.complete && (
                <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                  Complete
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Test payout */}
      {isDemoMode && (
        <div className="rounded-xl border border-[#FFB020]/20 bg-[#FFB020]/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#FFB020]" />
            <h3 className="font-semibold text-[#FFB020]">Test payout (Demo mode)</h3>
          </div>
          
          <p className="mb-4 text-sm text-[#FFB020]/80">
            Simulate a payout to test your setup. No real money will be transferred.
          </p>
          
          <button
            onClick={onSimulatePayout}
            className="flex items-center gap-2 rounded-lg bg-[#FFB020] px-4 py-2.5 text-sm font-semibold text-[#0a1929] transition-all hover:bg-[#FFB020]/90"
          >
            <Sparkles className="h-4 w-4" />
            Run test payout
          </button>
        </div>
      )}
      
      {/* Summary */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="mb-4 font-semibold text-white">What happens next</h3>
        
        <div className="space-y-3 text-sm text-white/60">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#4DA2FF]/20 text-xs font-semibold text-[#4DA2FF]">
              1
            </div>
            <div>
              <div className="font-medium text-white">Verification review</div>
              <div>Our compliance team will review your information (typically within 1-2 business days)</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#4DA2FF]/20 text-xs font-semibold text-[#4DA2FF]">
              2
            </div>
            <div>
              <div className="font-medium text-white">Account activation</div>
              <div>Once verified, your account will be activated for payouts</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#4DA2FF]/20 text-xs font-semibold text-[#4DA2FF]">
              3
            </div>
            <div>
              <div className="font-medium text-white">Start receiving payouts</div>
              <div>Primary sales and resale royalties will be automatically distributed</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Final CTA */}
      <div className="flex items-center justify-between rounded-xl border border-[#4DA2FF]/20 bg-[#4DA2FF]/10 p-6">
        <div>
          <div className="mb-1 font-semibold text-[#4DA2FF]">Ready to complete verification?</div>
          <div className="text-sm text-[#4DA2FF]/80">
            Make sure all steps above are complete before proceeding
          </div>
        </div>
        
        <button
          disabled={!steps.slice(0, -1).every((s: any) => s.complete)}
          className="flex items-center gap-2 rounded-lg bg-[#4DA2FF] px-6 py-3 font-semibold text-white transition-all hover:bg-[#5DADFF] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCircle className="h-5 w-5" />
          Finish verification
        </button>
      </div>
    </motion.div>
  );
}

// Status Chip Component
function StatusChip({ status }: { status: PayoutStatus }) {
  const config = {
    'not-set-up': { 
      label: 'Not set up', 
      color: tokens.colors.text.muted,
      bg: tokens.colors.bg.surface2,
    },
    'in-review': { 
      label: 'In review', 
      color: tokens.colors.status.warning,
      bg: tokens.colors.status.warningBg,
    },
    'verified': { 
      label: 'Verified', 
      color: tokens.colors.status.success,
      bg: tokens.colors.status.successBg,
    },
    'action-required': { 
      label: 'Action required', 
      color: tokens.colors.status.error,
      bg: tokens.colors.status.errorBg,
    },
  }[status];
  
  return (
    <div
      className="flex items-center gap-2"
      style={{
        borderRadius: tokens.radius.full,
        backgroundColor: config.bg,
        padding: `6px ${tokens.spacing.sm}`,
        fontSize: tokens.typography.micro.size,
        fontWeight: 500,
        color: config.color,
      }}
    >
      {status === 'verified' && <CheckCircle style={{ width: '12px', height: '12px' }} />}
      {status === 'action-required' && <AlertCircle style={{ width: '12px', height: '12px' }} />}
      {config.label}
    </div>
  );
}

// Method Step Component
function MethodStep({
  payoutMethod,
  setPayoutMethod,
  suiAddress,
  addressVerified,
  bankConnected,
  onVerifyAddress,
  onCopy,
  copied,
  setIsDirty,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2" style={{ fontSize: tokens.typography.h2.size, fontWeight: 600, color: tokens.colors.text.primary }}>
          Payout method
        </h2>
        <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
          Choose where you'd like to receive sales and royalties
        </p>
      </div>
      
      {/* On-chain option */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden transition-all"
        style={{
          borderRadius: tokens.radius.lg,
          border: `1px solid ${payoutMethod === 'on-chain' ? tokens.colors.brand.primary : tokens.colors.border.default}`,
          backgroundColor: tokens.colors.bg.card,
        }}
      >
        <button
          onClick={() => {
            setPayoutMethod('on-chain');
            setIsDirty(true);
          }}
          className="flex w-full items-start justify-between p-6 text-left transition-all"
          style={{
            backgroundColor: payoutMethod === 'on-chain' ? `${tokens.colors.brand.primary}0D` : 'transparent',
          }}
        >
          <div className="flex items-start gap-3 flex-1">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: tokens.radius.md,
                backgroundColor: `${tokens.colors.brand.primary}1A`,
              }}
            >
              <Wallet style={{ width: tokens.icon.default, height: tokens.icon.default, color: tokens.colors.brand.primary }} />
            </div>
            <div className="flex-1">
              <h3 style={{ fontSize: tokens.typography.body.size, fontWeight: 600, color: tokens.colors.text.primary, marginBottom: '4px' }}>
                On-chain (recommended for royalties)
              </h3>
              <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
                Receive proceeds directly to your Sui address on every resale
              </p>
            </div>
          </div>
          
          <div
            className="flex-shrink-0 transition-all"
            style={{
              width: '20px',
              height: '20px',
              marginTop: '10px',
              marginLeft: tokens.spacing.md,
              borderRadius: tokens.radius.full,
              border: `2px solid ${payoutMethod === 'on-chain' ? tokens.colors.brand.primary : tokens.colors.border.default}`,
              backgroundColor: payoutMethod === 'on-chain' ? tokens.colors.brand.primary : 'transparent',
              position: 'relative',
            }}
          >
            {payoutMethod === 'on-chain' && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: tokens.radius.full,
                  backgroundColor: '#fff',
                }}
              />
            )}
          </div>
        </button>
        
        {payoutMethod === 'on-chain' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="border-t"
            style={{
              borderColor: tokens.colors.border.default,
              padding: tokens.spacing.lg,
            }}
          >
            <div className="mb-4">
              <label
                className="mb-2 block"
                style={{
                  fontSize: tokens.typography.small.size,
                  fontWeight: 500,
                  color: tokens.colors.text.secondary,
                }}
              >
                Sui address to receive proceeds
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={suiAddress}
                  readOnly
                  className="flex-1"
                  style={{
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.colors.border.default}`,
                    backgroundColor: tokens.colors.bg.surface1,
                    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                    fontFamily: 'monospace',
                    fontSize: tokens.typography.small.size,
                    color: tokens.colors.text.primary,
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(suiAddress);
                  }}
                  className="flex items-center gap-2 transition-all"
                  style={{
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.colors.border.default}`,
                    backgroundColor: tokens.colors.bg.surface1,
                    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                    fontSize: tokens.typography.small.size,
                    fontWeight: 500,
                    color: tokens.colors.text.secondary,
                  }}
                >
                  {copied ? <Check style={{ width: tokens.icon.inline, height: tokens.icon.inline }} /> : <Copy style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />}
                </button>
              </div>
            </div>
            
            {!addressVerified ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVerifyAddress();
                }}
                className="flex items-center gap-2 transition-all"
                style={{
                  borderRadius: tokens.radius.md,
                  backgroundColor: tokens.colors.brand.primary,
                  padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                  fontSize: tokens.typography.small.size,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                <CheckCircle style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
                Verify ownership
              </button>
            ) : (
              <div
                className="flex items-center gap-2"
                style={{
                  borderRadius: tokens.radius.md,
                  backgroundColor: tokens.colors.status.successBg,
                  padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                  fontSize: tokens.typography.small.size,
                  fontWeight: 500,
                  color: tokens.colors.status.success,
                }}
              >
                <CheckCircle style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
                Verified
              </div>
            )}
            
            <p
              className="mt-3"
              style={{
                fontSize: tokens.typography.micro.size,
                color: tokens.colors.text.muted,
              }}
            >
              We use a one-time signature to confirm this address is yours
            </p>
          </motion.div>
        )}
      </motion.div>
      
      {/* Bank account option */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="overflow-hidden transition-all"
        style={{
          borderRadius: tokens.radius.lg,
          border: `1px solid ${payoutMethod === 'bank' ? tokens.colors.brand.primary : tokens.colors.border.default}`,
          backgroundColor: tokens.colors.bg.card,
        }}
      >
        <button
          onClick={() => {
            setPayoutMethod('bank');
            setIsDirty(true);
          }}
          className="flex w-full items-start justify-between p-6 text-left transition-all"
          style={{
            backgroundColor: payoutMethod === 'bank' ? `${tokens.colors.brand.primary}0D` : 'transparent',
          }}
        >
          <div className="flex items-start gap-3 flex-1">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: tokens.radius.md,
                backgroundColor: tokens.colors.bg.surface2,
              }}
            >
              <Building2 style={{ width: tokens.icon.default, height: tokens.icon.default, color: tokens.colors.text.muted }} />
            </div>
            <div className="flex-1">
              <h3 style={{ fontSize: tokens.typography.body.size, fontWeight: 600, color: tokens.colors.text.primary, marginBottom: '4px' }}>
                Bank account (for primary sales)
              </h3>
              <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
                Connect your bank to receive fiat payments
              </p>
            </div>
          </div>
          
          <div
            className="flex-shrink-0 transition-all"
            style={{
              width: '20px',
              height: '20px',
              marginTop: '10px',
              marginLeft: tokens.spacing.md,
              borderRadius: tokens.radius.full,
              border: `2px solid ${payoutMethod === 'bank' ? tokens.colors.brand.primary : tokens.colors.border.default}`,
              backgroundColor: payoutMethod === 'bank' ? tokens.colors.brand.primary : 'transparent',
              position: 'relative',
            }}
          >
            {payoutMethod === 'bank' && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: tokens.radius.full,
                  backgroundColor: '#fff',
                }}
              />
            )}
          </div>
        </button>
        
        {payoutMethod === 'bank' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="border-t"
            style={{
              borderColor: tokens.colors.border.default,
              padding: tokens.spacing.lg,
            }}
          >
            {!bankConnected ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // In production: open Stripe Connect or Plaid modal
                  alert('In production, this would open Stripe Connect to link your bank account.');
                }}
                className="flex items-center gap-2 transition-all"
                style={{
                  borderRadius: tokens.radius.md,
                  backgroundColor: tokens.colors.brand.primary,
                  padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                  fontSize: tokens.typography.small.size,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                <Building2 style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
                Connect bank
              </button>
            ) : (
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between"
                  style={{
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.colors.border.default}`,
                    backgroundColor: tokens.colors.bg.surface1,
                    padding: tokens.spacing.md,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Building2 style={{ width: tokens.icon.default, height: tokens.icon.default, color: tokens.colors.text.muted }} />
                    <div>
                      <div style={{ fontSize: tokens.typography.small.size, fontWeight: 500, color: tokens.colors.text.primary }}>
                        Chase Bank · ••••4242
                      </div>
                      <div style={{ fontSize: tokens.typography.micro.size, color: tokens.colors.text.muted }}>
                        USD · Daily payouts
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      borderRadius: tokens.radius.full,
                      backgroundColor: tokens.colors.status.successBg,
                      padding: `4px ${tokens.spacing.sm}`,
                      fontSize: tokens.typography.micro.size,
                      fontWeight: 500,
                      color: tokens.colors.status.success,
                    }}
                  >
                    Connected
                  </div>
                </div>
                
                <div className="flex gap-3" style={{ fontSize: tokens.typography.small.size }}>
                  <button
                    className="transition-all"
                    style={{ color: tokens.colors.brand.primary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Change
                  </button>
                  <span style={{ color: tokens.colors.text.muted }}>·</span>
                  <button
                    className="transition-all"
                    style={{ color: tokens.colors.status.error }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Helper Sheet Component
function HelpSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      >
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md overflow-y-auto"
          style={{
            backgroundColor: tokens.colors.bg.canvas,
            borderLeft: `1px solid ${tokens.colors.border.default}`,
            boxShadow: tokens.shadow.elevated,
          }}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b backdrop-blur-xl" style={{
            borderColor: tokens.colors.border.default,
            backgroundColor: `${tokens.colors.bg.canvas}F0`,
            padding: tokens.spacing.lg,
          }}>
            <h2 style={{ fontSize: tokens.typography.h3.size, fontWeight: 600, color: tokens.colors.text.primary }}>
              Help & FAQs
            </h2>
            <button
              onClick={onClose}
              className="transition-all"
              style={{
                borderRadius: tokens.radius.md,
                backgroundColor: tokens.colors.bg.surface1,
                padding: tokens.spacing.xs,
                color: tokens.colors.text.muted,
              }}
            >
              <X style={{ width: tokens.icon.button, height: tokens.icon.button }} />
            </button>
          </div>
          
          <div className="space-y-6" style={{ padding: tokens.spacing.lg }}>
            <div>
              <h3 className="mb-2" style={{ fontSize: tokens.typography.body.size, fontWeight: 600, color: tokens.colors.text.primary }}>
                Why do I need to verify my payout method?
              </h3>
              <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary, lineHeight: 1.6 }}>
                We verify wallet ownership and bank accounts to ensure payouts go to the right recipient and to comply with financial regulations.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2" style={{ fontSize: tokens.typography.body.size, fontWeight: 600, color: tokens.colors.text.primary }}>
                When will I receive my first payout?
              </h3>
              <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary, lineHeight: 1.6 }}>
                On-chain royalties are paid instantly on each resale. Bank payouts follow your selected schedule (daily, weekly, or threshold-based).
              </p>
            </div>
            
            <div>
              <h3 className="mb-2" style={{ fontSize: tokens.typography.body.size, fontWeight: 600, color: tokens.colors.text.primary }}>
                What fees are deducted from payouts?
              </h3>
              <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary, lineHeight: 1.6 }}>
                Network fees for on-chain transactions (typically $0.01–0.05) are deducted from the payout amount. No additional platform fees.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2" style={{ fontSize: tokens.typography.body.size, fontWeight: 600, color: tokens.colors.text.primary }}>
                Can I change my payout method later?
              </h3>
              <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary, lineHeight: 1.6 }}>
                Yes. Changes to your payout method will apply to future sales only. Existing pending payouts will use the previous method.
              </p>
            </div>
            
            <div className="rounded-lg" style={{
              border: `1px solid ${tokens.colors.border.default}`,
              backgroundColor: tokens.colors.bg.card,
              padding: tokens.spacing.md,
            }}>
              <div className="mb-2 flex items-center gap-2" style={{ fontSize: tokens.typography.small.size, fontWeight: 600, color: tokens.colors.text.primary }}>
                <Info style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
                Need more help?
              </div>
              <p className="mb-3" style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
                Contact our support team for assistance with payouts and billing.
              </p>
              <button
                className="flex items-center gap-2"
                style={{
                  fontSize: tokens.typography.small.size,
                  fontWeight: 500,
                  color: tokens.colors.brand.primary,
                }}
              >
                Contact support
                <ExternalLink style={{ width: tokens.icon.inline, height: tokens.icon.inline }} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Placeholder components - will continue implementation
function RecipientsStep({ recipients, setRecipients, totalShare, isValid, showAddRecipient, setShowAddRecipient, setIsDirty }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      style={{
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.colors.border.default}`,
        backgroundColor: tokens.colors.bg.card,
        padding: tokens.spacing.lg,
      }}
    >
      <h2 className="mb-2" style={{ fontSize: tokens.typography.h2.size, fontWeight: 600, color: tokens.colors.text.primary }}>
        Recipients & splits
      </h2>
      <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
        Configure who receives payouts and their share percentages
      </p>
      <div className="mt-6 text-center" style={{ padding: `${tokens.spacing.xl} 0`, color: tokens.colors.text.muted }}>
        Recipients configuration coming soon...
      </div>
    </motion.div>
  );
}

function LegalStep({ accountType, setAccountType, legalDocs, setLegalDocs, legalVerified, setLegalVerified, setIsDirty }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      style={{
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.colors.border.default}`,
        backgroundColor: tokens.colors.bg.card,
        padding: tokens.spacing.lg,
      }}
    >
      <h2 className="mb-2" style={{ fontSize: tokens.typography.h2.size, fontWeight: 600, color: tokens.colors.text.primary }}>
        Legal & tax
      </h2>
      <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
        Complete verification to enable payouts
      </p>
      <div className="mt-6 text-center" style={{ padding: `${tokens.spacing.xl} 0`, color: tokens.colors.text.muted }}>
        Legal & tax verification coming soon...
      </div>
    </motion.div>
  );
}

function PreferencesStep({ payoutSchedule, setPayoutSchedule, notifications, setNotifications, setIsDirty }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      style={{
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.colors.border.default}`,
        backgroundColor: tokens.colors.bg.card,
        padding: tokens.spacing.lg,
      }}
    >
      <h2 className="mb-2" style={{ fontSize: tokens.typography.h2.size, fontWeight: 600, color: tokens.colors.text.primary }}>
        Preferences
      </h2>
      <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
        Configure payout schedule and notifications
      </p>
      <div className="mt-6 text-center" style={{ padding: `${tokens.spacing.xl} 0`, color: tokens.colors.text.muted }}>
        Preferences configuration coming soon...
      </div>
    </motion.div>
  );
}

function ReviewStep({ steps, payoutMethod, recipients, onEditStep }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      style={{
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.colors.border.default}`,
        backgroundColor: tokens.colors.bg.card,
        padding: tokens.spacing.lg,
      }}
    >
      <h2 className="mb-2" style={{ fontSize: tokens.typography.h2.size, fontWeight: 600, color: tokens.colors.text.primary }}>
        Review & verify
      </h2>
      <p style={{ fontSize: tokens.typography.small.size, color: tokens.colors.text.tertiary }}>
        Confirm all settings are correct before completing verification
      </p>
      <div className="mt-6 space-y-3">
        {steps.slice(0, -1).map((step: any) => (
          <div
            key={step.id}
            className="flex items-center gap-3 transition-all"
            style={{
              borderRadius: tokens.radius.md,
              border: `1px solid ${step.complete ? tokens.colors.status.successBg : tokens.colors.status.errorBg}`,
              backgroundColor: step.complete ? `${tokens.colors.status.success}0D` : `${tokens.colors.status.error}0D`,
              padding: tokens.spacing.md,
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: tokens.radius.full,
                backgroundColor: step.complete ? tokens.colors.status.successBg : tokens.colors.status.errorBg,
              }}
            >
              {step.complete ? (
                <CheckCircle style={{ width: '14px', height: '14px', color: tokens.colors.status.success }} />
              ) : (
                <AlertCircle style={{ width: '14px', height: '14px', color: tokens.colors.status.error }} />
              )}
            </div>
            
            <div className="flex-1">
              <div style={{ fontSize: tokens.typography.small.size, fontWeight: 500, color: step.complete ? tokens.colors.text.primary : tokens.colors.status.error }}>
                {step.label}
              </div>
              {!step.complete && (
                <div style={{ fontSize: tokens.typography.micro.size, color: tokens.colors.status.error, opacity: 0.8 }}>
                  Incomplete - please complete this step
                </div>
              )}
            </div>
            
            {step.complete ? (
              <div
                style={{
                  borderRadius: tokens.radius.full,
                  backgroundColor: tokens.colors.status.successBg,
                  padding: `4px ${tokens.spacing.sm}`,
                  fontSize: tokens.typography.micro.size,
                  fontWeight: 500,
                  color: tokens.colors.status.success,
                }}
              >
                Complete
              </div>
            ) : (
              <button
                onClick={() => onEditStep(step.id)}
                className="flex items-center gap-1 transition-all"
                style={{
                  fontSize: tokens.typography.small.size,
                  fontWeight: 500,
                  color: tokens.colors.brand.primary,
                }}
              >
                <Edit3 style={{ width: '14px', height: '14px' }} />
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
