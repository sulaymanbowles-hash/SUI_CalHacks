# Automation and Wallets

This document explains how DropKit generates dev wallets, funds them via faucets, and checks Walrus publisher access—all automated for testnet CI/local smoke testing.

## Dev Wallet Strategy

For M0–M2, we use **Ed25519 keypairs** generated locally:

1. **Generate:** `scripts/gen_wallet.ts` creates a new keypair and writes `.secrets/<ALIAS>.json`:
   ```json
   {
     "address": "0xabc123...",
     "secretKeyB64": "BASE64_ENCODED_SECRET_KEY"
   }
   ```

2. **Storage:** Secrets live in `.secrets/` (git-ignored). Never commit these files.

3. **Import to Sui CLI (optional):** For manual testing, import the secret:
   ```bash
   sui keytool import "$(jq -r .secretKeyB64 .secrets/SELLER.json)" ed25519
   ```

4. **PTB signing:** Scripts load the secret from `.secrets/<ALIAS>.json` and sign transactions programmatically.

## Faucet Strategy

### SUI (Fully Automated)

Use the Sui CLI faucet command:
```bash
sui client faucet --address 0xADDRESS
```

Wrapped in `scripts/faucet_sui.sh` with basic error handling. Rate limits are per-IP; if blocked, try:
- Different network (mobile hotspot).
- Alternative faucets: [faucet.sui.io](https://faucet.sui.io), [faucet.m1stake.com](https://faucet.m1stake.com).

### USDC (Semi-Automated)

Circle's testnet USDC faucet (https://faucet.circle.com/) has **no public API**. Our approach:

1. **Open browser:** Script calls `open('https://faucet.circle.com/')`.
2. **User claims:** Click "Get test tokens" (one-time manual step).
3. **Poll on-chain:** Script queries USDC balance every 10s until funded or timeout (10 min).

**Why this works:** After the user claims, the script detects the USDC coin type by scanning owned coins and matching `symbol === "USDC"`. Then it polls `getBalance()` until `totalBalance >= target`.

**Note:** USDC is **not required** for core flows (listings are SUI-priced). This step is **optional** and won't block CI if skipped.

## Walrus Prerequisites

Walrus (decentralized storage) is used for event posters/assets in M4. Prerequisites:

- **`WALRUS_PUBLISHER_URL`**: Testnet publisher endpoint (e.g., `https://publisher.walrus-testnet.walrus.space`).
- **Auth**: May require `WALRUS_API_TOKEN` or WAL test credits. Script checks reachability and prints actionable errors if 401/403.

Early check (M0.A) ensures Walrus is accessible before M4 integration.

## CI/Local Smoke Order

`scripts/ci_smoke.sh` orchestrates the full setup:

1. **Check tools:** Run `check_env.sh` (Sui CLI, Node, jq).
2. **Generate wallets:** Create SELLER and BUYER if not present.
3. **Fund SUI:** Auto-request via CLI faucet (retries on failure).
4. **Fund USDC (optional):** If `REQUIRE_TEST_USDC=true`, open browser + poll. Otherwise skip.
5. **Walrus check:** Verify publisher reachability.
6. **(Later milestones)** Run PTBs, deploy Move package, execute end-to-end tests.

## Redaction/Secret Handling

**Never commit:**
- `.secrets/*.json` (private keys).
- `scripts/env.sh` (if it contains sensitive data—only addresses/IDs are allowed).

**Safe to commit:**
- `scripts/env.example.sh` (template with placeholders).
- Public addresses in `env.sh` (after verification).

**Loading secrets in code:**
```typescript
import fs from 'node:fs';
const { address, secretKeyB64 } = JSON.parse(fs.readFileSync('.secrets/SELLER.json', 'utf-8'));
const kp = Ed25519Keypair.fromSecretKey(fromB64(secretKeyB64));
```

## Local vs. CI

- **Local:** Developer runs `npm run gen:wallet:seller` once; wallet persists across sessions.
- **CI (GitHub Actions):** Store `SELLER.json` and `BUYER.json` as **encrypted secrets**. Decode at runtime:
  ```yaml
  - name: Restore wallets
    run: |
      mkdir -p .secrets
      echo "${{ secrets.SELLER_JSON }}" > .secrets/SELLER.json
      echo "${{ secrets.BUYER_JSON }}" > .secrets/BUYER.json
  ```

## Troubleshooting

- **"Faucet rate limit":** Wait 1 hour or use alternate faucet/network.
- **"USDC coin type not found":** You haven't claimed from Circle faucet yet. Open the page and click "Get test tokens."
- **"Walrus 401":** Obtain WAL test credits or set `WALRUS_API_TOKEN` in `env.sh`.
- **"Address mismatch":** Ensure `scripts/env.sh` has `ADDR_SELLER` and `ADDR_BUYER` matching `.secrets/*.json`.

---

**Status:** M0.A ready. Wallets auto-generated, faucets scripted, Walrus validated.
