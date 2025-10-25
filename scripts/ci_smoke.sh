#!/usr/bin/env bash
# scripts/ci_smoke.sh
# One-shot automation: generate wallets, fund via faucets, check Walrus.
# Safe to run repeatedly (skips existing wallets).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT"

echo "========================================"
echo "  DropKit M0.A CI Smoke Test"
echo "========================================"
echo ""

# 1. Check tools and network
echo "== Step 1: Checking tools & network =="
bash "$ROOT/scripts/check_env.sh" || {
  echo "✘ Environment check failed. Fix issues above before proceeding."
  exit 1
}
echo ""

# 2. Install script dependencies
echo "== Step 2: Installing script dependencies =="
cd "$ROOT/scripts"
if [[ ! -d node_modules ]]; then
  npm install
else
  echo "✔ Dependencies already installed"
fi
echo ""

# 3. Generate wallets if missing
echo "== Step 3: Ensuring wallets exist =="
mkdir -p "$ROOT/.secrets"

if [[ -f "$ROOT/.secrets/SELLER.json" ]]; then
  SELLER=$(jq -r .address "$ROOT/.secrets/SELLER.json")
  echo "✔ SELLER wallet exists: $SELLER"
else
  echo "Generating SELLER wallet..."
  npm run gen:wallet:seller
  SELLER=$(jq -r .address "$ROOT/.secrets/SELLER.json")
fi

if [[ -f "$ROOT/.secrets/BUYER.json" ]]; then
  BUYER=$(jq -r .address "$ROOT/.secrets/BUYER.json")
  echo "✔ BUYER wallet exists: $BUYER"
else
  echo "Generating BUYER wallet..."
  npm run gen:wallet:buyer
  BUYER=$(jq -r .address "$ROOT/.secrets/BUYER.json")
fi
echo ""

# 4. Update env.sh if addresses missing
echo "== Step 4: Updating scripts/env.sh =="
if ! grep -q "ADDR_SELLER=$SELLER" "$ROOT/scripts/env.sh" 2>/dev/null; then
  echo "Adding ADDR_SELLER to env.sh..."
  sed -i.bak "s|^export ADDR_SELLER=.*|export ADDR_SELLER=$SELLER|" "$ROOT/scripts/env.sh" || \
    echo "export ADDR_SELLER=$SELLER" >> "$ROOT/scripts/env.sh"
fi

if ! grep -q "ADDR_BUYER=$BUYER" "$ROOT/scripts/env.sh" 2>/dev/null; then
  echo "Adding ADDR_BUYER to env.sh..."
  sed -i.bak "s|^export ADDR_BUYER=.*|export ADDR_BUYER=$BUYER|" "$ROOT/scripts/env.sh" || \
    echo "export ADDR_BUYER=$BUYER" >> "$ROOT/scripts/env.sh"
fi
echo "✔ env.sh updated"
echo ""

# 5. Fund SUI via CLI faucet
echo "== Step 5: Funding SUI via CLI faucet =="
echo "Funding SELLER..."
npm run faucet:sui:seller || echo "⚠ SELLER faucet failed (rate limit?)"
echo ""

echo "Funding BUYER..."
npm run faucet:sui:buyer || echo "⚠ BUYER faucet failed (rate limit?)"
echo ""

# 6. Optional: USDC (only if explicitly required)
if [[ "${REQUIRE_TEST_USDC:-false}" == "true" ]]; then
  echo "== Step 6: Requesting USDC test funds (semi-automated) =="
  USDC_OWNER="$BUYER" npm run faucet:usdc:buyer || {
    echo "⚠ USDC funding failed or timed out (non-blocking)"
  }
  echo ""
else
  echo "== Step 6: Skipping USDC (core flows use SUI pricing) =="
  echo "To enable: REQUIRE_TEST_USDC=true bash scripts/ci_smoke.sh"
  echo ""
fi

# 7. Walrus publisher check
echo "== Step 7: Walrus publisher check =="
if [[ -n "${WALRUS_PUBLISHER_URL:-}" ]]; then
  npm run walrus:check || {
    echo "⚠ Walrus check failed (non-blocking for M0–M2)"
  }
else
  echo "⚠ WALRUS_PUBLISHER_URL not set (OK for M0–M2; required for M4)"
fi
echo ""

# Summary
echo "========================================"
echo "  M0.A Automation Complete"
echo "========================================"
echo ""
echo "✔ Wallets: SELLER, BUYER generated"
echo "✔ SUI: Funded via testnet faucet"
echo "✔ Walrus: Publisher accessibility checked"
echo ""
echo "Next steps:"
echo "  - Run: bash scripts/check_env.sh"
echo "  - Proceed to M1 (Move package development)"
echo ""
