# Testnet Funding Status

## Addresses to Fund

### 1. CLI Publisher (for package deployment)
- **Address**: `0x44e2baf0ceafa68fc742412676245e451fd2327438a9dd3c9f6e824b5fb9dd06`
- **Status**: ❌ No gas
- **Usage**: Publishing Move package, creating transfer policy
- **Web Faucet**: https://faucet.sui.io/?address=0x44e2baf0ceafa68fc742412676245e451fd2327438a9dd3c9f6e824b5fb9dd06

### 2. SELLER (for PTB mint & list)
- **Address**: `0x17d071be65e54fa6252be15699462d5c4f98b25680f7ff0ca3d2a4b33f6d3950`
- **Status**: ✅ Has 1 SUI
- **Usage**: Minting tickets and listing in kiosk
- **File**: `.secrets/SELLER.json`

### 3. BUYER (for PTB buy & approve)
- **Address**: `0x73b3bc71eacfddc8d0a736129f500dcc7b105e93060510f11c928fc4b9637f44`
- **Status**: ❌ No gas
- **Usage**: Purchasing tickets from kiosk
- **File**: `.secrets/BUYER.json`
- **Web Faucet**: https://faucet.sui.io/?address=0x73b3bc71eacfddc8d0a736129f500dcc7b105e93060510f11c928fc4b9637f44

## Quick Actions

### Fund with Web Faucets
```bash
# Open all faucet links (will open 3 tabs)
open "https://faucet.sui.io/?address=0x44e2baf0ceafa68fc742412676245e451fd2327438a9dd3c9f6e824b5fb9dd06"
open "https://faucet.sui.io/?address=0x73b3bc71eacfddc8d0a736129f500dcc7b105e93060510f11c928fc4b9637f44"
```

### Alternative Faucets (if rate-limited)
- M1 Stake: https://faucet.m1stake.com (paste address manually)
- Sui Learn: https://faucet.suilearn.io (paste address manually)
- Blockbolt: https://faucet.blockbolt.io (paste address manually)

### Check Balances
```bash
# CLI Publisher
sui client gas 0x44e2baf0ceafa68fc742412676245e451fd2327438a9dd3c9f6e824b5fb9dd06

# SELLER
sui client gas 0x17d071be65e54fa6252be15699462d5c4f98b25680f7ff0ca3d2a4b33f6d3950

# BUYER
sui client gas 0x73b3bc71eacfddc8d0a736129f500dcc7b105e93060510f11c928fc4b9637f44
```

## Next Steps (after funding)

Once all addresses have gas:

1. **Build & Test Move** (M1)
   ```bash
   cd packages/move/ticket && sui move build && sui move test && cd ../../..
   ```
   ✅ Already passed!

2. **Deploy Package** (M2)
   ```bash
   bash scripts/deploy_package.sh
   ```
   → Writes `PACKAGE_ID` to `scripts/env.sh`

3. **Create Transfer Policy** (M3)
   ```bash
   bash scripts/create_policy.sh
   ```
   → Writes `POLICY_ID` to `scripts/env.sh`

4. **Run PTB Flows**
   ```bash
   # Mint & List (SELLER)
   ./scripts/demo_flow.sh mint-list
   
   # Buy & Approve (BUYER)
   ./scripts/demo_flow.sh buy-approve
   
   # Check-in (mark ticket as used)
   ./scripts/demo_flow.sh check-in <TICKET_OBJECT_ID>
   ```

## USDC (Optional - for M2/M3)

If you need testnet USDC for testing payment flows:

```bash
# Request USDC for BUYER
bash scripts/usdc_request.sh $(jq -r .address ./.secrets/BUYER.json)
```

Circle USDC Testnet Faucet: https://faucet.circle.com/ (select Sui Testnet)
