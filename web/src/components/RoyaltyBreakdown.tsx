import { useState } from 'react';
import { TweenNumber } from './TweenNumber';

export function RoyaltyBreakdown() {
  const [price, setPrice] = useState(62);
  const royalty = 0.10;
  const organizer = 0.08;
  const network = 0.03;

  const artistAmt = price * royalty;
  const orgAmt = price * organizer;
  const networkAmt = network;
  const sellerGets = price - artistAmt - orgAmt - networkAmt;

  const sliderProgress = ((price - 5) / 195) * 100;

  return (
    <div className="card max-w-xl">
      <h3 className="mb-4 font-medium text-[#DCE7F0]">Resale split</h3>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">Adjust resale price</span>
        <TweenNumber value={price} decimals={2} className="text-lg font-medium text-[#DCE7F0]" />
      </div>
      <div className="relative">
        <input
          type="range"
          min={5}
          max={200}
          value={price}
          onChange={(e) => setPrice(+e.target.value)}
          className="slider-gradient w-full accent-[#4DA2FF]"
          aria-label="Adjust resale price"
          data-progress={sliderProgress}
        />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <Item label="Resale price" value={price} highlight />
        <Item label="Seller receives" value={sellerGets} highlight />
        <Item label="Artist royalty (10%)" value={artistAmt} />
        <Item label="Organizer fee (8%)" value={orgAmt} />
        <Item label="Network fee" value={networkAmt} />
      </div>
      <p className="mt-4 text-xs text-white/50">
        Splits enforced by transfer policies. Testnet settles in ~480ms.
      </p>
    </div>
  );
}

function Item({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`chip ${highlight ? 'bg-[#4DA2FF]/[0.08] border border-[#4DA2FF]/30' : ''}`}>
      <div className="text-xs text-white/60">{label}</div>
      <TweenNumber value={value} decimals={2} className="font-medium text-[#DCE7F0]" />
    </div>
  );
}
