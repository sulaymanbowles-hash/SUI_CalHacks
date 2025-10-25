# Project Context

## Product Vision

**DropKit** is a decentralized ticketing platform on Sui that guarantees creators earn royalties on *every* resale. Traditional ticketing platforms allow scalpers to profit without compensating artists. DropKit uses **Kiosk + Transfer Policy** to enforce royalty payments inside the transaction—no off-chain trust required.

### Key Differentiators

1. **On-chain enforcement:** Transfer Policy blocks ticket transfers unless royalty is paid.
2. **One-click transactions:** PTBs bundle mint+list or buy+approve into atomic operations.
3. **SUI pricing:** All listings in SUI (mist); USD conversion is display-only to avoid stablecoin complexity.
4. **Transparent resale:** Every sale logged on-chain; creators see secondary market activity.

## Constraints

- **Network:** Sui testnet for MVP; mainnet after audit.
- **Pricing:** SUI only (no stablecoins).
- **GraphQL:** Deferred to post-MVP; RPC + events for reads.
- **Fiat onramp:** Visual-only on testnet (MoonPay/Transak UI mockup); actual funding via faucets and gas sponsorship.
- **Auth:** Local keypairs for M0–M2; zkLogin in M3.

## Core Flows

### 1. Mint & List (Creator/Organizer)
- Creator mints a `Ticket` NFT (event name, seat, price in mist).
- Ticket is placed in a Kiosk with a `PurchaseCap`.
- Transfer Policy ID attached; royalty percentage configured.
- Listing published (on-chain object, discoverable via RPC).

**PTB:** `mint_and_list(event_name, seat, price_mist, royalty_bps) → TicketID, KioskID`

### 2. Buy & Approve (Fan/Buyer)
- Buyer finds listing (RPC query for Kiosk objects).
- Buyer executes PTB: withdraw SUI from balance, purchase from Kiosk, pay Transfer Policy fee, transfer Ticket to buyer's Kiosk or wallet.
- On resale, same PTB flow ensures creator royalty is paid again.

**PTB:** `buy_and_approve(kiosk_id, ticket_id, price_mist) → Ticket object transferred`

### 3. Check-in (Organizer)
- Organizer scans QR code (Ticket object ID + owner signature).
- PTB calls `mark_used(ticket_id)` to set a boolean flag.
- Ticket becomes non-transferable (or burns, TBD in M1).

**PTB:** `mark_used(ticket_id) → success`

## What "Done" Looks Like (MVP)

- **Move package** deployed on testnet with `Ticket`, `Event`, Kiosk integration, Transfer Policy.
- **Two PTBs** (Mint&List, Buy&Approve) executable via Sui CLI or TS SDK.
- **Check-in PTB** (`mark_used`) to invalidate tickets.
- **Scripts** to demo full flow: creator mints → buyer purchases → organizer checks in.
- **Fiat onramp mockup** in UI (stretch); actual funding via faucets.
- **No GraphQL indexer** in M0–M2; events logged for future indexing.

## Fiat Onramp (Testnet)

MoonPay and Transak do not support testnet SUI. For MVP:
- UI shows onramp button (disabled with tooltip: "Testnet only—use faucet").
- Developers fund via `sui client faucet` or request top-ups from organizers.
- Gas sponsorship (M3) will cover transaction costs for end users.

## Future Enhancements (Post-MVP)

- GraphQL indexer for ticket search, sales history, analytics.
- Mainnet deployment with real fiat onramp.
- Mobile app (React Native).
- Batch minting (organizer mints 1000 tickets in one PTB).
- Dynamic pricing (bonding curves, Dutch auctions).
- Whitelist gates (only verified fans can purchase).

---

**Status:** M0 complete. Ready for M1 (Move modules).
