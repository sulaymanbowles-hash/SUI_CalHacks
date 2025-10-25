# Frontend Build Plan (Core Only, Testnet)

## Tech
- React + Vite + TypeScript
- Tailwind CSS
- framer-motion, lucide-react
- @mysten/sui for RPC utils (reads only; PTBs use your existing TS)
- No GraphQL, no wallet SDK beyond local dev key toggle

## File Tree (Core)

```
web/
  index.html
  package.json
  tailwind.config.ts
  postcss.config.js
  src/
    main.tsx
    App.tsx
    routes.tsx
    theme.ts          # tokens from the brief
    lib/
      env.ts          # reads ../../scripts/env.sh at dev-time
      rpc.ts          # simple read helpers
      explorer.ts     # explorer link builder (?network=testnet)
      ptb.ts          # thin wrapper that calls your existing PTB scripts
    components/
      Header.tsx
      TestnetPill.tsx
      Card.tsx
      Button.tsx
      TxStatus.tsx
      Toast.tsx
      Tooltip.tsx
    pages/
      Landing.tsx
      AppConsole.tsx
      MyTickets.tsx
      CheckIn.tsx
    styles.css
```

## Integration with existing PTBs
- Move reusable logic from `scripts/ptb_mint_and_list.ts`, `scripts/ptb_checkin.ts` into `web/src/lib/ptb.ts` as exported functions:
  - `mintAndList(params): Promise<{ digest, objectChanges }>`
  - `buyAndApprove(params): Promise<{ digest, objectChanges }>`
  - `markUsed(ticketId): Promise<{ digest }>`
- These functions should **not** contain any UI; they just return structured results and throw errors with full context.

## Environment
- Source **public IDs/addresses** from `../../scripts/env.sh` at dev time (same approach you used in backend TS).
- `VITE_NETWORK=testnet` for explorer links; never accept user-supplied module targets in the UI.

## Page-by-page detail

### Landing (`/`)
- Hero with headline + two CTAs:
  - "Launch App" → `/app`
  - "View Docs" → repo docs
- Three Sui callouts:
  - PTBs = single-click atomicity
  - Kiosk + Transfer Policy = enforced payouts
  - Testnet awareness + faucets

### App Console (`/app`)
- **Testnet Panel**
  - Network pill + dropdown with faucet links (open in new tab)
  - Disabled "Buy with card" button with tooltip
- **Organizer Card — Mint & List**
  - Inputs: `Event name`, `Face price (SUI)`, `Supply`
  - Button: "Mint & List"
  - On click: call `mintAndList`; show `TxStatus` with digest + explorer link
- **Market Card — Buy & Approve**
  - Displays last listing produced by previous PTB or minimal object info fetched via RPC (fallback: paste listing id)
  - Button: "Buy & Approve"
  - On click: call `buyAndApprove`; show `TxStatus` + "Payout summary" (90/8/2 text)
- **Receipts**
  - Two latest digests (primary & secondary) with explorer links

### My Tickets (`/tickets`)
- Minimal: list owned `Ticket` objects via RPC filter for your type (if simple to implement) or show a form to paste a Ticket id and open explorer.

### Check-in (`/checkin`)
- Input `Ticket Object ID` → "Mark Used" → shows digest and explorer link

## States & Errors
- Buttons disabled during in-flight tx.
- On error, show a compact message and a "Debug" accordion with the thrown error object (stringified).
- Always render the explorer link if a digest exists.

## Visual QA Checklist
- Test on light and dark backgrounds (we ship dark by default).
- Verify contrast (Chrome Lighthouse a11y).
- Verify keyboard navigation paths.

## Non-Goals (Core)
- No GraphQL dashboards
- No zkLogin yet (toggle placeholder allowed)
- No real fiat onramp (visual only)

## "Done" for Core
- `/` loads with brand visuals and Sui callouts
- `/app` runs **Mint & List** → shows digest link; then **Buy & Approve** → shows digest link and payout blurb
- `/checkin` marks used successfully
- All network labels, faucets, and explorer links reflect **testnet**
