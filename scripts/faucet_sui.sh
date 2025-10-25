#!/usr/bin/env bash
# scripts/faucet_sui.sh
# Requests SUI for any address using the Sui CLI faucet.

set -euo pipefail

ADDR="${1:-}"
if [[ -z "$ADDR" ]]; then
  echo "Usage: $0 0xADDRESS"
  echo "Example: $0 0xabc123..."
  exit 2
fi

# Optional: custom faucet URL
OPTS=()
if [[ -n "${FAUCET_URL:-}" ]]; then
  OPTS+=(--url "$FAUCET_URL")
fi

echo "Requesting SUI for $ADDR ..."

# Request from faucet
if sui client faucet --address "$ADDR" "${OPTS[@]}" 2>&1 | tee /tmp/faucet_out.txt; then
  echo "✔ Faucet request sent"
else
  if grep -q "rate" /tmp/faucet_out.txt; then
    echo "⚠ Rate limit hit. Try again in 1 hour or use alternate faucet:"
    echo "  - https://faucet.sui.io"
    echo "  - https://faucet.m1stake.com"
    exit 1
  else
    echo "✘ Faucet request failed. Check network and address."
    exit 1
  fi
fi

# Wait for transaction to settle
echo "Waiting for transaction to settle..."
sleep 3

# Show gas objects
echo ""
echo "Gas objects for $ADDR:"
sui client gas "$ADDR" 2>/dev/null || echo "⚠ Could not fetch gas objects (address may not be funded yet)"
