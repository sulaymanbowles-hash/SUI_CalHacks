# DropKit Tickets — Frontend Design Brief (Testnet)

## Purpose
A clean, Sui-native site that sells and resells tickets with **one-click PTBs**, showing enforced artist payouts. The site must feel *expertly built for Sui*, not generic: subtle gradients, "testnet" awareness, explorer links everywhere, and tight accessibility.

## Guardrails
- **Network:** Testnet only. Prominent "Testnet" pill in the header.
- **Pricing:** Listings in **SUI (mist)**. USD only as off-chain display.
- **Onramp:** "Buy with card" button is **visible but disabled** with tooltip: "Mainnet-only; use faucet or gas sponsorship."
- **Reads:** No GraphQL in core. Use RPC helpers (simple calls), or use objects returned from PTBs.
- **Privacy:** No PII. zkLogin is a later toggle; default to local dev key or "Connect wallet (zkLogin soon)".

## Brand & Visual Language
- **Name:** DropKit Tickets
- **Tone:** direct, technical, Sui-native.
- **Color tokens:**
  - `--brand-900: #0B1020` (background)
  - `--brand-800: #0F172A` (surface)
  - `--brand-600: #2B6CF0` (primary)
  - `--brand-500: #3D7BFF` (primary hover)
  - `--aqua-500: #10B3B3` (accent / Sui-aqua vibe)
  - `--orchid-500: #7C3AED` (secondary accent)
  - `--text-100: #E2E8F0` (primary text)
  - `--text-300: #C7D2FE` (muted on dark)
  - `--success-500: #22C55E`, `--warning-500: #F59E0B`, `--error-500: #EF4444`
- **Type:** Inter (UI), JetBrains Mono (code/digits).
- **Effects:** very light blur and glass on cards; soft shadows; subtle gradient header.
- **Icons:** `lucide-react`.
- **Motion:** `framer-motion` for small fades/scale (100–150ms).

## Information Architecture (Core only)
1) **Landing** (`/`)
   - Hero: "Tickets on Sui. One click. Creator-enforced payouts."
   - CTA buttons: "Launch App", "View Docs"
   - Ribbon: "You are on **Sui Testnet**"
2) **App Console** (`/app`)
   - **Testnet panel:** network pill, faucet links, "Buy with card (disabled)"
   - **Organizer card:** Mint & List (Event + Class + Ticket) → runs PTB #1
   - **Market card:** Latest listing (from last PTB or simple RPC) with **Buy & Approve** → PTB #2
   - **Receipts:** two explorer links + payout summary
3) **My Tickets** (`/tickets`) — minimal
   - Basic RPC read or "show last minted/bought ticket" with explorer links
4) **Check-in** (`/checkin`) — dev panel
   - Input ticket object id → **Mark Used** button (PTB check-in)

> No GraphQL dashboards in core. Add later as stretch.

## Components (Core)
- **Header**: logo, nav, TestnetPill, "Docs", "GitHub"
- **TestnetPill**: reads `NETWORK` from env; clickable faucets sheet (faucet.sui.io, m1stake, suilearn)
- **Card**: gradient border, rounded-2xl
- **Button**: primary/secondary/ghost/disabled (onramp)
- **Form**: simple inputs for event name, face price (SUI), supply
- **TxStatus**: pending/success/error with digest + explorer deep link
- **Tooltip**: for disabled onramp
- **Toast**: minimal success/error

## Accessibility & Perf
- Color contrast ≥ 4.5 for text on dark.
- Focus outlines visible and consistent.
- Reduce motion toggle (respect `prefers-reduced-motion`).
- Split code via route-level chunks; target ≤150KB JS on initial load.

## Copy (short, human)
- Hero: "Artists get paid on every resale—enforced by Sui."
- Organizer card title: "Mint & List (Primary)"
- Market card title: "Buy & Approve (Secondary)"
- Onramp tooltip: "Mainnet-only. Use faucet or sponsored gas on testnet."
- Testnet pill: "Sui Testnet"
