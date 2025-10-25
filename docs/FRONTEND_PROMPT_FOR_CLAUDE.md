# Prompt to Claude — Frontend Core (UI0–UI3)

**Context:**  
- Testnet-only. Listings in SUI. Onramp is visual-only. No GraphQL.  
- PTBs exist; you will wrap them in `web/src/lib/ptb.ts`.  
- We want a Sui-native look (see Design Brief).

**Your rules**  
- One artifact per turn (multiple files OK, but cohesive).  
- Include **Run** and **Expected output**.  
- No secrets. Read public IDs from `../../scripts/env.sh`.  
- Keep copy minimal and human (avoid AI-ish filler).  
- Ship accessible UI (contrast, focus states).

---

## UI0 — Scaffold + Theme

**Deliver**:
- `web/package.json` with React, Vite, Tailwind, framer-motion, lucide-react
- Tailwind + PostCSS config
- `src/main.tsx`, `src/App.tsx`, `src/routes.tsx`, `src/styles.css`, `src/theme.ts`
- `components/Header.tsx`, `components/TestnetPill.tsx`, `components/Card.tsx`, `components/Button.tsx`

**Run**
```bash
cd web
npm i
npm run dev
```

**Expected**: Landing page with header, testnet pill, basic cards.

---

## UI1 — App Console + PTB wrappers (no execution yet)

**Deliver**:
- `src/lib/env.ts` (reads `../../scripts/env.sh`)
- `src/lib/explorer.ts` (builds explorer URLs with `?network=testnet`)
- `src/lib/ptb.ts` stubs (types + function signatures for `mintAndList`, `buyAndApprove`, `markUsed`)
- `pages/AppConsole.tsx` with forms/buttons and mocked success state

**Run**: dev server loads `/app` with forms & disabled onramp.

**Expected**: UI responds; no network calls yet.

---

## UI2 — Wire PTBs (execute on testnet)

**Deliver**:
- Implement `src/lib/ptb.ts` by importing logic from your existing PTB TS files (no duplication). Return `{ digest, objectChanges }`.
- Replace mocks in `AppConsole.tsx` to call real functions; show `TxStatus`.

**Run**
- Ensure testnet env & wallets per repo docs.
- `npm run dev` → Mint & List then Buy & Approve.

**Expected**: Two digests with working explorer links. Errors show helpful messages.

---

## UI3 — Check-in + polish

**Deliver**:
- `pages/CheckIn.tsx` with ticket id input and call to `markUsed`.
- Toasts, disabled button states, tooltips for onramp.
- Minor motion on cards and buttons.

**Run**: Mark a known ticket as used.

**Expected**: Digest link and confirmation banner; attempting resale later should fail per backend.

---

## Acceptance (Core)

- `/` renders properly and highlights Sui value props.
- `/app` executes both PTBs successfully on testnet with links.
- `/checkin` marks a ticket used.
- Onramp shown but disabled (tooltip).
- No GraphQL, no PII, no secrets in the bundle.
