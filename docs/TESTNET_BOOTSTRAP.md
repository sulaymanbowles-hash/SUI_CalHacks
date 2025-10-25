# Testnet Bootstrap

Follow these steps to install tools, switch to Sui testnet, create addresses, and fund accounts.

## 1. Install Sui CLI

If you haven't installed the Sui CLI, use the official installer:

```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
```

Or use a release binary from [Sui releases](https://github.com/MystenLabs/sui/releases).

**Lock the version:**
```bash
sui --version
# Record output (e.g., "sui 1.15.0-testnet") in docs/DEPENDENCY_PINS.md
```

**Do not auto-upgrade mid-event.** Pin your version in CI if needed.

## 2. Switch to Testnet

```bash
sui client switch --env testnet
```

Verify active network:
```bash
sui client envs
# Look for "testnet (active)"
```

## 3. Create SELLER Address (Event Organizer/Creator)

```bash
sui client new-address ed25519
```

This becomes your default address. Copy the address (starts with `0x...`) and save it.

**Fund SELLER:**
```bash
sui client faucet
```

Wait ~5 seconds, then check balance:
```bash
sui client gas
```

## 4. Create BUYER Address

```bash
sui client new-address ed25519
```

Copy the new address. To fund the BUYER (not the default address):
```bash
sui client faucet --address <BUYER_ADDRESS>
```

Replace `<BUYER_ADDRESS>` with the actual hex address.

## 5. Additional Faucets (Rate Limit Workaround)

If `sui client faucet` hits a rate limit, try these alternatives:

- **Official:** [faucet.sui.io](https://faucet.sui.io)
- **M1Stake:** [faucet.m1stake.com](https://faucet.m1stake.com)
- **SuiLearn:** [faucet.suilearn.io](https://faucet.suilearn.io)

Paste your address and request testnet SUI. Each faucet has independent rate limits.

**Pro tip:** If you're running a hackathon or demo, ask event organizers for a bulk gas sponsor transaction to top up multiple addresses at once.

## 6. Populate `scripts/env.sh`

Open `scripts/env.sh` and fill in:

```bash
NETWORK=testnet
RPC_URL=https://fullnode.testnet.sui.io:443

# Addresses (copy from `sui client addresses`)
ADDR_SELLER=0xYOUR_SELLER_ADDRESS_HERE
ADDR_BUYER=0xYOUR_BUYER_ADDRESS_HERE

# Will be filled after Move package deployment (M1)
PACKAGE_ID=
POLICY_ID=
ADDR_CREATOR=
ADDR_TREASURY=
```

**Never commit secrets** (private keys). Only addresses and object IDs belong in `env.sh`.

## 7. Verify Setup

```bash
bash scripts/check_env.sh
```

Expected output:
```
✔ Sui CLI found: sui 1.15.0-testnet
✔ Node found: v20.16.0
✔ npm found: 10.x
✔ jq found
✔ Active network: testnet
✔ ADDR_SELLER set
✔ ADDR_BUYER set
⚠ PACKAGE_ID not set (OK for M0)
Done. Ready for M1.
```

## 8. zkLogin & Gas Sponsorship (Later Milestones)

For M0–M2, use **local keypairs** (default Sui client behavior). In **M3**, we'll integrate:
- **zkLogin** for social auth (Google/Apple).
- **Gas sponsorship** so end users don't need SUI upfront.

Keep local keys as a fallback for testing.

## Troubleshooting

- **"Address not found":** Run `sui client addresses` to list all addresses. Use `sui client switch --address <ADDR>` to change active address.
- **"Insufficient gas":** Request more from faucets or ask organizers for a sponsor transaction.
- **"Network mismatch":** Re-run `sui client switch --env testnet`.

---

**Next:** Run `bash scripts/check_env.sh`, then proceed to M1 (Move package development).
