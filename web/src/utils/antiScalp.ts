/**
 * Anti-Scalper Tax Utilities (Front-end only)
 * Progressive tax on resale prices above baseline to discourage scalping
 */

export type AntiScalpTier = {
  thresholdBp: number; // % over baseline in basis points
  taxBp: number;       // tax rate in basis points
};

export type AntiScalpConfig = {
  enabled: boolean;
  baselineSource: 'msrp' | 'first_sale';
  minTaxCents: number;
  tiers: AntiScalpTier[]; // ascending by thresholdBp
};

/**
 * Default demo configuration
 * 0-10% over baseline: 5% tax
 * 10-30% over: 12% tax
 * 30%+ over: 20% tax
 */
export const DEFAULT_ANTI_SCALP_CONFIG: AntiScalpConfig = {
  enabled: true,
  baselineSource: 'msrp',
  minTaxCents: 100, // $1.00 minimum
  tiers: [
    { thresholdBp: 0, taxBp: 500 },      // 0%+: 5%
    { thresholdBp: 1000, taxBp: 1200 },  // 10%+: 12%
    { thresholdBp: 3000, taxBp: 2000 },  // 30%+: 20%
  ],
};

/**
 * Pick the appropriate tax tier based on % over baseline
 */
export function pickTierBp(percentOverBp: number, tiers: AntiScalpTier[]): number {
  let bp = 0;
  for (const t of tiers) {
    if (percentOverBp >= t.thresholdBp) {
      bp = t.taxBp;
    } else {
      break;
    }
  }
  return bp;
}

/**
 * Compute anti-scalper tax in cents (UI only)
 * @param askingCents - The resale price in cents
 * @param baselineCents - The baseline price (MSRP or first sale) in cents
 * @param cfg - Anti-scalp configuration
 * @returns Tax amount in cents
 */
export function computeAntiScalpTaxCents(
  askingCents: number,
  baselineCents: number,
  cfg: AntiScalpConfig
): number {
  if (!cfg.enabled) return 0;
  if (baselineCents <= 0) return 0;
  
  const excess = Math.max(0, askingCents - baselineCents);
  if (excess === 0) return 0;

  // Calculate % over baseline in basis points
  const percentOverBp = Math.floor((excess * 10000) / baselineCents);
  const tierBp = pickTierBp(percentOverBp, cfg.tiers);
  
  // Apply tax to excess amount
  let tax = Math.floor((excess * tierBp) / 10000);
  
  // Apply minimum tax
  if (tax > 0 && tax < cfg.minTaxCents) {
    tax = cfg.minTaxCents;
  }
  
  return tax;
}

/**
 * Get human-readable tier description
 */
export function getTierDescription(percentOverBp: number, tiers: AntiScalpTier[]): string {
  const tierBp = pickTierBp(percentOverBp, tiers);
  const taxPct = (tierBp / 100).toFixed(0);
  const overPct = (percentOverBp / 100).toFixed(0);
  
  return `${taxPct}% tax on markup (${overPct}% over baseline)`;
}

/**
 * Convert SUI to cents for calculations (assuming $2 per SUI for demo)
 */
export function suiToCents(sui: number): number {
  const USD_PER_SUI = 2.0; // Demo rate
  return Math.floor(sui * USD_PER_SUI * 100);
}

/**
 * Convert cents back to SUI
 */
export function centsToSui(cents: number): number {
  const USD_PER_SUI = 2.0; // Demo rate
  return cents / (USD_PER_SUI * 100);
}
