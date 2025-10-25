# Organizer Wizard → Sui Integration Guide

## Overview

The organizer wizard is now fully integrated with Sui blockchain. When organizers press **Go Live**, a single Programmable Transaction Block (PTB) creates all on-chain objects atomically:

- ✅ Event with status tracking
- ✅ GateKeeperCap for check-in authorization
- ✅ TicketClass objects with royalty configuration
- ✅ Kiosk for primary sales
- ✅ Transfer Policy enforcement (prepared for royalty rules)

## Architecture

### Move Modules (Smart Contracts)

**`ticket::event`**
- Creates Event objects with organizer, location, time window, and status
- Returns GateKeeperCap capability for secure check-ins
- Status: Draft → Live → Paused → Ended

**`ticket::class`** (TicketClass)
- Defines ticket types with name, color, price, supply
- Stores royalty split configuration (artist BPS, organizer BPS)
- Tracks sold count vs. total supply

**`ticket::ticket`**
- NFT-like tickets with `has key, store` abilities
- Check-in requires GateKeeperCap matching the event
- Idempotent check-in (prevents double-entry)

**`ticket::policy_admin`**
- Creates shared TransferPolicy for royalty enforcement
- Future: Add percentage-based rules for resale splits

### Front-end Integration

**`lib/ptb.ts`** - Transaction Builders
- `publishEvent()`: Single atomic PTB for wizard publish flow
- `checkIn()`: Gate staff check-in with GateKeeperCap verification
- `buyAndApprove()`: Buyer purchases ticket with policy enforcement

**`pages/AppConsole.tsx`** - Organizer Wizard
- Step 1-3: Local draft state (no blockchain calls)
- Step 4 (Publish): Builds complete PTB with progress tracking
- Developer Mode: Shows raw object IDs

## Deployment Steps

### 1. Deploy Move Package

```bash
cd packages/move/ticket

# Build and test
sui move build
sui move test

# Deploy to testnet
sui client publish --gas-budget 100000000

# Save the package ID
export PACKAGE_ID=0x...
```

### 2. Create Transfer Policy

```bash
# Get the Publisher object ID from deployment
export PUBLISHER_ID=0x...

# Create policy (for now, just creates empty policy)
sui client call \
  --package $PACKAGE_ID \
  --module policy_admin \
  --function create_policy \
  --args $PUBLISHER_ID 0x... 0x... 0x... \
  --gas-budget 10000000

# Save the Policy ID
export POLICY_ID=0x...
```

### 3. Update Environment Variables

Create `web/.env.local`:

```bash
VITE_PACKAGE_ID=0x15ac55e21409bf56cd3f93552a85c716330b07af4fdbd3b4996085cc59e15769
VITE_POLICY_ID=0x6c9a891026c1031c138c6f132cf596bae516d834709c03e2dddceeb5aa8b6456
```

### 4. Start Frontend

```bash
cd web
npm install
npm run dev
```

## Testing the Full Flow

### Scenario 1: Organizer Publishes Event

1. Navigate to `/console`
2. Fill out event basics (name, date, venue)
3. Add ticket types (e.g., "GA" $25, "VIP" $100)
4. Set royalty splits (default: 90% artist, 8% organizer)
5. Press **Go Live**

**Expected Result:**
- Single transaction creates Event, GateKeeperCap, TicketClasses
- Success modal shows all object IDs
- IDs stored in localStorage for demo persistence

### Scenario 2: Buyer Purchases Ticket

1. Navigate to `/app`
2. Browse live events
3. Click "Buy Ticket"
4. Wallet signs transaction
5. Transfer Policy confirms (royalty enforcement ready)

**Expected Result:**
- Ticket transferred to buyer's wallet
- Kiosk listing removed
- TicketClass sold count incremented

### Scenario 3: Check-in at Event

1. Organizer opens `/checkin`
2. Scans ticket QR code (contains ticket object ID)
3. Transaction calls `check_in(gateKeeperCapId, ticketId)`

**Expected Result:**
- Ticket marked as `used: true`
- Error if already used: "E_ALREADY_USED"
- Error if wrong event: "E_WRONG_EVENT"

### Scenario 4: Resale (Future)

1. Ticket holder lists in their personal Kiosk
2. New buyer purchases
3. Transfer Policy enforces royalty split:
   - 90% to seller
   - 8% to organizer
   - 2% to artist (if different)

## Error Handling

### User-Friendly Messages

The system translates Move abort codes to readable errors:

- `E_ALREADY_USED` → "Ticket already used"
- `E_INVALID_WINDOW` → "Invalid time window"
- `E_ZERO_SUPPLY` → "Supply cannot be zero"
- `E_WRONG_EVENT` → "This ticket is for a different event"

### Validation Gates

**Before Publish:**
- ✅ Payouts connected (server-side, mocked in testnet)
- ✅ Sales channels enabled (wallet or card)
- ✅ Event details complete
- ✅ At least one ticket type
- ✅ Royalty split ≤ 100%

**During Transaction:**
- Gas budget: 50M MIST (0.05 SUI)
- Atomic rollback on any failure
- Explicit error messages surfaced to UI

## Developer Mode Features

Toggle Developer Mode in Playground to see:

- Package ID (e.g., `0x15ac...`)
- Policy ID (e.g., `0x6c9a...`)
- Event ID, GateKeeperCap ID
- Kiosk ID, TicketClass IDs
- Copy buttons for each ID

Hidden in production UI by default.

## Key Design Decisions

### Why Single PTB for Publish?

- **Atomic**: All-or-nothing; no partial state
- **Lower cost**: One transaction fee instead of N+1
- **Better UX**: One signature, clear progress

### Why GateKeeperCap?

- **Security**: Only organizer can check-in tickets
- **Transferable**: Can delegate to gate staff
- **Event-scoped**: Each cap tied to one event

### Why Lazy Mint?

- **Gas efficiency**: Mint on purchase, not upfront
- **Flexibility**: No pre-commitment to inventory
- **Scalability**: Works for 10 or 10,000 tickets

### Why Basis Points (BPS)?

- **Precision**: 9000 BPS = 90.00%
- **Standard**: Used by NFT marketplaces
- **Future-proof**: Easy to add platform fee (200 BPS = 2%)

## Roadmap (M2+)

### Phase 2: Enhanced Royalties

- [ ] Add percentage-based rules to Transfer Policy
- [ ] Multi-recipient splits (artist + organizer + platform)
- [ ] Dynamic royalties (higher on first resale)

### Phase 3: Card Channel (Off-chain)

- [ ] Server-side minting after Stripe payment
- [ ] Delayed transfer to buyer wallet
- [ ] Email delivery with QR code

### Phase 4: Advanced Features

- [ ] Seat reservations (on-chain mapping)
- [ ] Batch minting for large events
- [ ] Time-locked sales (early bird → general)
- [ ] Refunds (burn + reimburse)

## Troubleshooting

### "Package not deployed"

Run the deployment script:
```bash
./scripts/deploy_package.sh
```

### "No wallet connected"

Refresh the page. The dev wallet auto-generates on first load.

### "Insufficient gas"

Fund the dev wallet:
```bash
./scripts/faucet_sui.sh
```

### Transaction fails with "MoveAbort"

Check the error code:
- Code 1 in `event`: Invalid time window
- Code 1 in `ticket`: Already used
- Code 2 in `class`: Zero supply

### Object IDs not showing

Enable Developer Mode in Playground tab.

## Support

For questions or issues:
1. Check console logs (browser DevTools)
2. Verify package deployment: `sui client objects`
3. Check testnet explorer: `https://suiscan.xyz/testnet/object/{id}`

---

Built with Sui Move + @mysten/sui.js + React
