#!/usr/bin/env bash
# scripts/create_policy.sh
# Create TransferPolicy on testnet and capture POLICY_ID (M3)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
source "$ROOT/scripts/env.sh"

echo "=== Creating TransferPolicy on Testnet ==="
echo ""

# Validate prerequisites
if [[ -z "${PACKAGE_ID:-}" ]]; then
    echo "✘ PACKAGE_ID not set. Run: bash scripts/deploy_package.sh first"
    exit 1
fi

if [[ -z "${ADDR_SELLER:-}" ]]; then
    echo "✘ ADDR_SELLER not set in scripts/env.sh"
    exit 1
fi

# Default royalty recipients (can be overridden)
ARTIST="${ADDR_CREATOR:-$ADDR_SELLER}"
ORGANIZER="${ADDR_SELLER}"
PLATFORM="${ADDR_TREASURY:-$ADDR_SELLER}"

echo "Creating policy with:"
echo "  Artist:    $ARTIST"
echo "  Organizer: $ORGANIZER"
echo "  Platform:  $PLATFORM"
echo ""

# Call policy_admin::create_policy
CALL_OUTPUT=$(sui client call \
    --package "$PACKAGE_ID" \
    --module policy_admin \
    --function create_policy \
    --args "$ARTIST" "$ORGANIZER" "$PLATFORM" \
    --gas-budget 10000000 \
    --json 2>&1)

CALL_STATUS=$?

if [[ $CALL_STATUS -ne 0 ]]; then
    echo "✘ Policy creation failed:"
    echo "$CALL_OUTPUT"
    exit 1
fi

# Extract shared TransferPolicy object ID
POLICY_ID=$(echo "$CALL_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("TransferPolicy")) | .objectId')

if [[ -z "$POLICY_ID" || "$POLICY_ID" == "null" ]]; then
    echo "✘ Could not extract POLICY_ID from transaction output"
    echo "$CALL_OUTPUT" | jq '.'
    exit 1
fi

echo "✔ TransferPolicy created successfully!"
echo "Policy ID: $POLICY_ID"
echo ""

# Update env.sh with policy ID
if grep -q "^export POLICY_ID=" "$ROOT/scripts/env.sh"; then
    sed -i.bak "s|^export POLICY_ID=.*|export POLICY_ID=$POLICY_ID|" "$ROOT/scripts/env.sh"
else
    echo "export POLICY_ID=$POLICY_ID" >> "$ROOT/scripts/env.sh"
fi

echo "✔ Updated scripts/env.sh with POLICY_ID"
echo ""
echo "Next steps:"
echo "  1. Fund BUYER wallet: npm --prefix scripts run faucet:sui:buyer"
echo "  2. Build PTBs for Mint&List and Buy&Approve (M5/M6)"
