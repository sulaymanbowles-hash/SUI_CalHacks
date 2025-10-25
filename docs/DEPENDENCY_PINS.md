# Dependency Pins

Lock tool versions to avoid mid-event breakage.

## Core Tools (Required for M0)

| Tool       | Version       | Install / Verify                     |
|------------|---------------|--------------------------------------|
| **Node.js**| 20.16.0 (LTS)| `node --version` / `.nvmrc` pinned   |
| **npm**    | 10.x          | `npm --version`                      |
| **Sui CLI**| 1.x.x-testnet | `sui --version` (record exact build) |
| **jq**     | 1.6+          | `jq --version` (JSON parsing)        |

### Sui CLI Version Lock

After installing Sui CLI, record the exact version:

```bash
sui --version
# Example output: sui 1.15.0-abc123def (testnet)
```

**Pinned version for this project:** *(Fill in after install)*

```
sui 1.15.0-abc123def
```

**Do not auto-upgrade** during development. If a new testnet version is required, update this document and notify the team.

## Node.js (via `.nvmrc`)

The repository includes `.nvmrc` to lock Node 20.x:

```bash
nvm use
# or
nvm install
```

If you don't use `nvm`, ensure your Node version matches `.nvmrc`.

## Package Versions (Filled After M1)

Once `npm install` runs (M2+), record resolved versions here:

| Package                 | Version | Purpose                          |
|-------------------------|---------|----------------------------------|
| `@mysten/sui.js`        | TBD     | Sui TypeScript SDK               |
| `@mysten/wallet-adapter`| TBD     | Wallet connection (M5)           |
| `dotenv`                | TBD     | Load env.sh in TS scripts        |
| `typescript`            | TBD     | TS compiler                      |
| `tsx`                   | TBD     | Run TS scripts directly          |

**Action after M2:** Run `npm list --depth=0` and fill in the table above.

## macOS-Specific Notes

- **jq:** Install via `brew install jq`.
- **Sui CLI:** Build from source or download release binary. Homebrew formula may lag behind testnet.

## Linux-Specific Notes

- **jq:** Install via `apt-get install jq` (Debian/Ubuntu) or `yum install jq` (RHEL/CentOS).
- **Sui CLI:** Build from source (requires Rust toolchain).

## CI/CD Pinning (Future)

When setting up GitHub Actions or GitLab CI:
- Use `actions/setup-node@v3` with `node-version-file: '.nvmrc'`.
- Cache Sui CLI binary or build from locked commit SHA.
- Cache `~/.cargo` and `target/` if building from source.

---

**Status:** M0 complete. Update "Package Versions" table after M2.
