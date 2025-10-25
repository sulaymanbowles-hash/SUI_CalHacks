#!/usr/bin/env bash
# scripts/demo_flow.sh
# End-to-end demo: Mint ticket → Check-in

set -euo pipefail

ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
source "$ROOT/scripts/env.sh"

echo "========================================"
echo "  DropKit End-to-End Demo"
echo "========================================"
echo ""

# Validate environment
if [[ -z "${PACKAGE_ID:-}" ]]; then
    echo "✘ PACKAGE_ID not set. Run: bash scripts/deploy_package.sh"
    exit 1
fi

echo "Using package: $PACKAGE_ID"
echo "Seller: $ADDR_SELLER"
echo "Buyer: $ADDR_BUYER"
echo ""

# Step 1: Mint & List
echo "=== Step 1: Mint & List ==="
echo "Seller mints a ticket for 'Rock Concert 2025'"
echo ""

cd "$ROOT/scripts"
MINT_OUTPUT=$(tsx ptb_mint_and_list.ts 2>&1)
echo "$MINT_OUTPUT"

# Extract ticket ID from output
TICKET_ID=$(echo "$MINT_OUTPUT" | grep "Ticket ID:" | awk '{print $NF}')

if [[ -z "$TICKET_ID" ]]; then
    echo "✘ Could not extract ticket ID"
    exit 1
fi

echo ""
echo "✔ Ticket minted: $TICKET_ID"
echo ""

# Wait a moment
sleep 2

# Step 2: Check-in
echo "=== Step 2: Check-in ==="
echo "Buyer checks in at the venue"
echo ""

tsx ptb_checkin.ts "$TICKET_ID"

echo ""
echo "========================================"
echo "  Demo Complete!"
echo "========================================"
echo ""
echo "Summary:"
echo "  1. ✔ Event and ticket class created"
echo "  2. ✔ Ticket minted and owned by seller"
echo "  3. ✔ Ticket marked as used (checked in)"
echo ""
echo "Next steps:"
echo "  - Add Kiosk integration for marketplace listing"
echo "  - Add TransferPolicy enforcement for royalties"
echo "  - Build frontend (M5)"
