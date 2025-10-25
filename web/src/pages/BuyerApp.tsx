import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Ticket, MapPin, Calendar, ExternalLink } from 'lucide-react';

// Mock marketplace data - replace with real on-chain queries
const MOCK_EVENTS = [
  {
    id: '0x8a1b2c3d4e5f',
    title: 'Nova Festival 2025',
    venue: 'Zilker Park',
    city: 'Austin, TX',
    date: 'June 22, 2025',
    time: '6:00 PM',
    price: 62,
    available: 47,
    total: 100,
    royalty: 10,
    organizer: 8,
    posterUrl: null,
  },
  {
    id: '0x91c2d3e4f5a6',
    title: 'Glasshouse Sessions',
    venue: 'The Chapel',
    city: 'San Francisco',
    date: 'July 8, 2025',
    time: '8:00 PM',
    price: 28,
    available: 12,
    total: 50,
    royalty: 10,
    organizer: 8,
    posterUrl: null,
  },
  {
    id: '0x7c2d3e4f5a61',
    title: 'Ambient Nights #14',
    venue: 'Baby\'s All Right',
    city: 'Brooklyn, NY',
    date: 'Aug 15, 2025',
    time: '9:30 PM',
    price: 18,
    available: 23,
    total: 60,
    royalty: 10,
    organizer: 8,
    posterUrl: null,
  },
];

export function BuyerApp() {
  const account = useCurrentAccount();
  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);

  if (!account) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-vignette noise">
        <div className="mx-auto flex min-h-[80vh] max-w-screen-xl items-center justify-center px-6">
          <div className="card max-w-md text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DA2FF]/10">
              <Ticket className="h-8 w-8 text-[#4DA2FF]" />
            </div>
            <h2 className="mb-3 font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
              Connect wallet to continue
            </h2>
            <p className="text-[var(--muted)]">
              Connect your Sui wallet to browse tickets and make purchases.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12">
      <div className="mx-auto max-w-screen-xl px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[Inter_Tight] text-4xl tracking-tight text-[#DCE7F0]">
            Marketplace
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Browse upcoming events and purchase tickets with automatic royalty splits.
          </p>
        </div>

        {/* Event Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_EVENTS.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="card group overflow-hidden p-0 text-left transition-transform duration-200 hover:scale-[1.01]"
            >
              {/* Poster */}
              <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#4DA2FF]/20 to-[#5AE0E5]/20">
                <div className="flex h-full items-center justify-center text-white/30">
                  <Ticket className="h-16 w-16" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-[#DCE7F0]">{event.title}</h3>
                <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    <span>{event.venue}, {event.city}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-white/50">From</div>
                    <div className="tabular-nums text-xl font-medium text-[#DCE7F0]">
                      ${event.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">Available</div>
                    <div className="tabular-nums text-sm text-[var(--muted)]">
                      {event.available} / {event.total}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Ticket Detail Modal/Drawer */}
        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="card relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute right-6 top-6 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
              >
                ✕
              </button>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Left: Poster */}
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br from-[#4DA2FF]/20 to-[#5AE0E5]/20">
                  <div className="flex h-full items-center justify-center text-white/30">
                    <Ticket className="h-20 w-20" />
                  </div>
                </div>

                {/* Right: Details */}
                <div>
                  <h2 className="font-[Inter_Tight] text-2xl tracking-tight text-[#DCE7F0]">
                    {selectedEvent.title}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div>{selectedEvent.date}</div>
                        <div>{selectedEvent.time}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div>{selectedEvent.venue}</div>
                        <div>{selectedEvent.city}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-6">
                    <div className="mb-3 text-xs text-white/50">Price breakdown</div>
                    <div className="space-y-2">
                      <div className="chip">
                        <div className="text-xs text-white/60">Ticket price</div>
                        <div className="tabular-nums font-medium text-[#DCE7F0]">
                          ${selectedEvent.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="chip">
                        <div className="text-xs text-white/60">Network fee</div>
                        <div className="tabular-nums font-medium text-[#DCE7F0]">$0.03</div>
                      </div>
                    </div>
                  </div>

                  {/* Royalty Info */}
                  <div className="mt-6 rounded-lg border border-white/12 p-3">
                    <div className="mb-2 text-xs text-white/60">Transfer policy</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--muted)]">Artist: {selectedEvent.royalty}%</span>
                      <span className="text-white/30">•</span>
                      <span className="text-[var(--muted)]">Organizer: {selectedEvent.organizer}%</span>
                    </div>
                    <a
                      href={`https://suiscan.xyz/testnet/object/${selectedEvent.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-[#4DA2FF] hover:underline"
                    >
                      View policy <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* CTA */}
                  <button className="mt-6 w-full rounded-xl bg-[#4DA2FF] px-5 py-3 font-medium text-white transition-transform duration-200 ease-out hover:scale-[1.01]">
                    Purchase Ticket
                  </button>
                  <p className="mt-2 text-center text-xs text-white/50">
                    Royalties enforced on resale
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
