#!/usr/bin/env bash
# scripts/deploy_package.sh
# Deploy the ticket Move package to testnet and capture PACKAGE_ID

set -euo pipefail

ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
source "$ROOT/scripts/env.sh"

echo "=== Deploying Ticket Package to Testnet ==="
echo ""

# Check Sui CLI is installed and on testnet
if ! command -v sui >/dev/null 2>&1; then
    echo "✘ Sui CLI not found. Install following docs/TESTNET_BOOTSTRAP.md"
    exit 1
fi

# Check if testnet is active (look for * in the active column on the testnet row)
ACTIVE_ENV=$(sui client envs 2>/dev/null | grep 'testnet' | grep '\*' >/dev/null 2>&1 && echo "testnet" || echo "unknown")
if [[ "$ACTIVE_ENV" != "testnet" ]]; then
    echo "✘ Active network is '$ACTIVE_ENV', expected 'testnet'"
    echo "Run: sui client switch --env testnet"
    exit 1
fi

# Build package first
echo "Building Move package..."
cd "$ROOT/packages/move/ticket"
sui move build || {
    echo "✘ Build failed"
    exit 1
}
echo "✔ Build successful"
echo ""

# Get active address (CLI Publisher)
ACTIVE_ADDR=$(sui client active-address)
echo "Publishing to testnet..."
echo "Using address: $ACTIVE_ADDR"
echo ""

# Publish from the package directory
PUBLISH_OUTPUT=$(sui client publish --gas-budget 100000000 --json 2>&1)
PUBLISH_STATUS=$?

if [[ $PUBLISH_STATUS -ne 0 ]]; then
    echo "✘ Publish failed:"
    echo "$PUBLISH_OUTPUT"
    exit 1
fi

# Extract package ID from JSON output
PACKAGE_ID=$(echo "$PUBLISH_OUTPUT" | jq -r '.objectChanges[]? | select(.type == "published") | .packageId' 2>/dev/null || echo "")

if [[ -z "$PACKAGE_ID" || "$PACKAGE_ID" == "null" ]]; then
    echo "✘ Could not extract package ID from publish output"
    echo "Raw output:"
    echo "$PUBLISH_OUTPUT"
    exit 1
fi

echo "✔ Package published successfully!"
echo "Package ID: $PACKAGE_ID"
echo ""
echo "Explorer: https://suiscan.xyz/testnet/object/$PACKAGE_ID"
echo ""

# Update env.sh with package ID
if grep -q "^export PACKAGE_ID=" "$ROOT/scripts/env.sh"; then
    # Update existing line (macOS-compatible sed)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^export PACKAGE_ID=.*|export PACKAGE_ID=$PACKAGE_ID|" "$ROOT/scripts/env.sh"
    else
        sed -i "s|^export PACKAGE_ID=.*|export PACKAGE_ID=$PACKAGE_ID|" "$ROOT/scripts/env.sh"
    fi
else
    # Append new line
    echo "export PACKAGE_ID=$PACKAGE_ID" >> "$ROOT/scripts/env.sh"
fi

echo "✔ Updated scripts/env.sh with PACKAGE_ID"
echo ""
echo "Next steps:"
echo "  1. Run: bash scripts/create_policy.sh (M3)"
echo "  2. Build PTBs for Mint&List and Buy&Approve (M5/M6)"
