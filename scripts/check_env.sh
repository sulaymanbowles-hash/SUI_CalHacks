#!/usr/bin/env bash
# scripts/check_env.sh
# Verifies tool installation, versions, and testnet configuration.
# Exits non-zero if setup is incomplete or incorrect.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "=== DropKit Environment Check ==="
echo ""

# 1. Check Sui CLI
if command -v sui >/dev/null 2>&1; then
    SUI_VERSION=$(sui --version 2>&1 | head -n1 || echo "unknown")
    echo -e "${GREEN}✔${NC} Sui CLI found: $SUI_VERSION"
else
    echo -e "${RED}✘${NC} Sui CLI not found. Install from https://docs.sui.io/guides/developer/getting-started/sui-install"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✔${NC} Node found: $NODE_VERSION"
    # Optionally check against .nvmrc
    if [[ -f .nvmrc ]]; then
        EXPECTED_NODE=$(cat .nvmrc | tr -d '[:space:]')
        if [[ "$NODE_VERSION" != "$EXPECTED_NODE" ]]; then
            echo -e "${YELLOW}⚠${NC} Node version mismatch. Expected $EXPECTED_NODE, got $NODE_VERSION"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo -e "${RED}✘${NC} Node.js not found. Install from https://nodejs.org/ or use nvm."
    ERRORS=$((ERRORS + 1))
fi

# 3. Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✔${NC} npm found: $NPM_VERSION"
else
    echo -e "${RED}✘${NC} npm not found. Install Node.js to get npm."
    ERRORS=$((ERRORS + 1))
fi

# 4. Check jq
if command -v jq >/dev/null 2>&1; then
    JQ_VERSION=$(jq --version 2>&1 || echo "unknown")
    echo -e "${GREEN}✔${NC} jq found: $JQ_VERSION"
else
    echo -e "${RED}✘${NC} jq not found. Install via 'brew install jq' (macOS) or 'apt-get install jq' (Linux)."
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 5. Check Sui CLI network
if command -v sui >/dev/null 2>&1; then
    ACTIVE_ENV=$(sui client envs 2>/dev/null | grep '(active)' | awk '{print $1}' || echo "unknown")
    if [[ "$ACTIVE_ENV" == "testnet" ]]; then
        echo -e "${GREEN}✔${NC} Active network: testnet"
    else
        echo -e "${RED}✘${NC} Expected network 'testnet' but found '$ACTIVE_ENV'"
        echo "   Run: sui client switch --env testnet"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""

# 6. Check env.sh addresses
if [[ -f scripts/env.sh ]]; then
    source scripts/env.sh
    
    if [[ -n "${ADDR_SELLER:-}" ]]; then
        echo -e "${GREEN}✔${NC} ADDR_SELLER set"
    else
        echo -e "${YELLOW}⚠${NC} Missing ADDR_SELLER in scripts/env.sh"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [[ -n "${ADDR_BUYER:-}" ]]; then
        echo -e "${GREEN}✔${NC} ADDR_BUYER set"
    else
        echo -e "${YELLOW}⚠${NC} Missing ADDR_BUYER in scripts/env.sh"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [[ -z "${PACKAGE_ID:-}" ]]; then
        echo -e "${YELLOW}⚠${NC} PACKAGE_ID not set (OK for M0; required for M1+)"
    else
        echo -e "${GREEN}✔${NC} PACKAGE_ID set: $PACKAGE_ID"
    fi
    
    if [[ -z "${POLICY_ID:-}" ]]; then
        echo -e "${YELLOW}⚠${NC} POLICY_ID not set (OK for M0; required for M1+)"
    else
        echo -e "${GREEN}✔${NC} POLICY_ID set: $POLICY_ID"
    fi
else
    echo -e "${RED}✘${NC} scripts/env.sh not found. Copy from scripts/env.example.sh"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=== Summary ==="
if [[ $ERRORS -gt 0 ]]; then
    echo -e "${RED}✘${NC} $ERRORS error(s) found. Fix before proceeding."
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}⚠${NC} $WARNINGS warning(s). Populate env.sh before M1."
    exit 0
else
    echo -e "${GREEN}✔${NC} All checks passed. Ready for development."
    exit 0
fi
