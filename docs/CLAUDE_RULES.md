# Claude Rules – DropKit Development Workflow

Follow these rules when contributing code or documentation to DropKit.

## 1. One Artifact per Turn

Return **multiple files** in a single message, each in its own triple-backtick block with the **full file path** as a comment at the top:

```move
// filepath: move/sources/ticket.move
module dropkit::ticket { ... }
```

Do not split related changes across multiple turns unless blocked by a tool limitation.

## 2. Include "Run" Steps and "Expected Output"

Every deliverable (script, PTB, test) must include:

### Run
```bash
# Commands to execute the artifact
bash scripts/deploy.sh
```

### Expected Output
```
✔ Package deployed: 0xABC123...
✔ Transfer Policy created: 0xDEF456...
```

Show both **success** and **common failure** cases where relevant.

## 3. Pull IDs and Addresses from `scripts/env.sh` Only

Never hardcode addresses, package IDs, or object IDs in code. Always source from `scripts/env.sh`:

```bash
source scripts/env.sh
sui client call --package $PACKAGE_ID --module ticket --function mint ...
```

TypeScript:
```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: 'scripts/env.sh' });
const packageId = process.env.PACKAGE_ID;
```

## 4. Never Hardcode Secrets

Private keys, mnemonics, and API keys **never** belong in:
- Source code
- `scripts/env.sh`
- Git commits
- Documentation examples

Use:
- `sui client` keystore (default `~/.sui/sui_config/sui.keystore`).
- Environment variables loaded at runtime.
- Seal (DSM) for production secrets (M4).

## 5. Fiat Onramp is Visual-Only on Testnet

MoonPay and Transak do not support testnet SUI. In UI code:
- Show onramp button with tooltip: "Testnet only—fund via faucet."
- Disable the button or link to `docs/TESTNET_BOOTSTRAP.md`.
- Do not attempt real API calls to onramp providers on testnet.

## 6. No GraphQL in M0–M2

The MVP uses:
- **Sui RPC** for object reads, balance queries, transaction submission.
- **Event queries** (`sui client events --query ...`) for activity logs.
- **PTBs** for all mutations.

GraphQL indexing is **stretch goal** (post-MVP). Do not scaffold GraphQL schemas, resolvers, or subscriptions until explicitly requested.

## 7. Code Style

- **Move:** Follow [Sui Move conventions](https://docs.sui.io/concepts/sui-move-concepts). Use `sui move fmt` (if available).
- **TypeScript:** Prettier with 2-space indent. ESLint with `@typescript-eslint/recommended`.
- **Bash:** ShellCheck-compliant. Support macOS and Linux.

## 8. Testing

- **Move tests:** `sui move test` in package directory.
- **PTB scripts:** Dry-run with `--dry-run` flag; assert expected objects in output.
- **End-to-end:** Documented manual flows in `scripts/demo_flow.sh` (created in M2).

## 9. Error Handling

All scripts must:
- Exit non-zero on failure.
- Print actionable error messages (e.g., "Missing PACKAGE_ID in env.sh—run deploy.sh first").
- Use `set -euo pipefail` in Bash.

## 10. Documentation Updates

When adding a new script, PTB, or module:
1. Update root `README.md` if it affects Quick Start.
2. Add entry to `docs/DEPENDENCY_PINS.md` if a new tool is required.
3. Note milestone completion in `docs/PROJECT_CONTEXT.md`.

---

**Enforcement:** These rules are checked in code review. Violations block merge.
