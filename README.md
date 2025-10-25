# DropKit – Ticketmaster on Sui

**Core promise:** Sell & resell event tickets where the artist *always* gets paid—enforced on-chain via Kiosk + Transfer Policy, executed via Programmable Transaction Blocks (PTBs) in one click.

- **Pricing:** All listings priced in **SUI** (mist). USD is display-only.
- **Network:** Sui **testnet** for MVP.
- **On-chain enforcement:** Kiosk + Transfer Policy ensures royalties on every resale.
- **Assets:** Walrus for posters/event images.
- **Secrets:** Seal (DSM) for sensitive data.
- **Fiat onramp:** MoonPay/Transak UI is visual-only on testnet; rely on faucets and gas sponsorship.
- **Auth:** zkLogin planned for later milestones; local keypairs for M0–M2.

## Quick Start

```bash
# 1) Verify tools and testnet
bash scripts/check_env.sh

# 2) Add SELLER/BUYER addresses to scripts/env.sh (see docs/TESTNET_BOOTSTRAP.md)

# 3) Proceed to M1 (Move modules + tests)
```

## What to Do First

1. Read [docs/TESTNET_BOOTSTRAP.md](docs/TESTNET_BOOTSTRAP.md) to install tools, switch to testnet, create addresses, and fund via faucets.
2. Populate `scripts/env.sh` with your addresses (never commit secrets).
3. Run `bash scripts/check_env.sh` to confirm setup.
4. Review [docs/CLAUDE_RULES.md](docs/CLAUDE_RULES.md) for development workflow.
5. Move on to **M1** (Move package), **M2** (PTBs), **M3** (zkLogin/Sponsorship), **M4** (Walrus/Seal), **M5** (Frontend), **M6** (Polish).

## Why GraphQL is Stretch

The MVP relies on PTBs for all mutations and direct RPC queries for reads (balances, objects, events). GraphQL indexing adds complexity and latency; we defer it to post-MVP to stay focused on core flows: **Mint&List**, **Buy&Approve**, and **Check-in**. If demand for rich queries grows, we'll add a GraphQL layer in a later phase.

## Project Context

See [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) for product vision, constraints, and core flows.

## Development Rules

All code contributions must follow [docs/CLAUDE_RULES.md](docs/CLAUDE_RULES.md):
- One artifact per turn.
- IDs/addresses from `scripts/env.sh` only.
- Include "Run" steps and "Expected output" in every deliverable.

## Milestones

- **M0** (this): Project skeleton, docs, testnet bootstrap scripts.
- **M1**: Move package (Ticket, Kiosk setup, Transfer Policy).
- **M2**: PTBs for Mint&List, Buy&Approve, mark_used.
- **M3**: zkLogin + gas sponsorship.
- **M4**: Walrus (assets) + Seal (secrets).
- **M5**: Frontend (React/Next.js, wallet adapter, PTB execution).
- **M6**: Polish (error handling, rate limits, UX).

---

**License:** MIT  
**Maintainer:** DropKit Team