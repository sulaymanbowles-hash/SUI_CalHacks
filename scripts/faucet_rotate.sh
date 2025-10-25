#!/usr/bin/env bash
# scripts/faucet_rotate.sh
# Multi-source SUI faucet with rotation and polling

set -euo pipefail

ADDR="${1:-}"
if [[ -z "$ADDR" ]]; then
  echo "Usage: $0 0xADDRESS"
  echo "Example: $0 0xabc123..."
  exit 2
fi

MAX_WAIT=180  # 3 minutes timeout
POLL_INTERVAL=5

echo "=== Requesting SUI for $ADDR ==="
echo ""

# Function to check balance
check_balance() {
  local addr="$1"
  sui client gas "$addr" 2>/dev/null | grep -q "gasCoinId" && return 0 || return 1
}

# Try Method 1: CLI faucet
echo "→ Method 1: Trying CLI faucet..."
if sui client faucet --address "$ADDR" 2>&1 | tee /tmp/faucet_cli.txt | grep -q "successfully"; then
  echo "✓ CLI faucet request sent"
  sleep 5
  if check_balance "$ADDR"; then
    echo "✓ Funds received!"
    sui client gas "$ADDR"
    exit 0
  fi
else
  echo "✗ CLI faucet failed or rate-limited"
fi

# Try Method 2: Explicit faucet URL
echo ""
echo "→ Method 2: Trying explicit faucet URL..."
FAUCET_URL="${FAUCET_URL:-https://faucet.testnet.sui.io/gas}"
if curl -X POST "$FAUCET_URL" \
  -H "Content-Type: application/json" \
  -d "{\"FixedAmountRequest\":{\"recipient\":\"$ADDR\"}}" 2>&1 | grep -q "task"; then
  echo "✓ API faucet request sent"
  sleep 5
  if check_balance "$ADDR"; then
    echo "✓ Funds received!"
    sui client gas "$ADDR"
    exit 0
  fi
else
  echo "✗ API faucet failed or rate-limited"
fi

# Method 3: Web faucets with polling
echo ""
echo "→ Method 3: Opening web faucets (manual)..."
echo ""
echo "Please visit ONE of these faucets and request tokens:"
echo "  1. https://faucet.sui.io/?address=$ADDR"
echo "  2. https://faucet.m1stake.com (paste address)"
echo "  3. https://faucet.suilearn.io (paste address)"
echo "  4. https://faucet.blockbolt.io (paste address)"
echo ""

# Try to open the first one
if command -v open >/dev/null 2>&1; then
  open "https://faucet.sui.io/?address=$ADDR" 2>/dev/null || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "https://faucet.sui.io/?address=$ADDR" 2>/dev/null || true
fi

echo "Polling for balance (timeout: ${MAX_WAIT}s)..."
elapsed=0
while [[ $elapsed -lt $MAX_WAIT ]]; do
  if check_balance "$ADDR"; then
    echo ""
    echo "✓ Funds received!"
    sui client gas "$ADDR"
    exit 0
  fi
  echo -n "."
  sleep $POLL_INTERVAL
  elapsed=$((elapsed + POLL_INTERVAL))
done

echo ""
echo "✗ Timeout: No funds received after ${MAX_WAIT}s"
echo "Please manually fund $ADDR using one of the web faucets above"
exit 1
