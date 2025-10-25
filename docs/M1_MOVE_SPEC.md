# M1 — Move package: Ticket types + Policy entrypoint (Testnet-first)

**Context:**  
- We're building Ticketmaster on Sui (testnet). Listings are in **SUI (mist)**.  
- Core flows (later): **Mint & List** and **Buy & Approve** via **PTBs** with **Kiosk + Transfer Policy**.  
- **GraphQL is stretch**, **onramp is visual-only** on testnet.  
- **You must self-test** (unit tests) and avoid any hardcoded IDs.  
- Kiosk usage happens in TypeScript PTBs (later milestones) — **not** inside our Move modules.

**Goal of M1:**  
Create a clean Move package that defines Events, Ticket Classes, Tickets, and a Policy admin entry to create a `TransferPolicy<Ticket>`. Provide unit tests that run with `sui move test`.

---

## Deliverables (create all now)

**Package path**
```
packages/move/ticket/
  Move.toml
  sources/
    event.move
    class.move
    ticket.move
    policy_admin.move
  tests/
    ticket_tests.move
    policy_tests.move
```

### 1) `Move.toml`
- Name the package `ticket`.
- Depend on Sui framework (use whatever template `sui move new` would generate, but fit into our repo tree).
- No external deps beyond std/sui.

### 2) `sources/event.move`
Minimal event metadata with Walrus poster CID and time window.
- `struct Event has key { id: UID, name: String, starts_at: u64, ends_at: u64, poster_cid: String }`
- `public entry fun new(name: String, starts_at: u64, ends_at: u64, poster_cid: String, ctx: &mut TxContext): Event`
- Invariant: `starts_at < ends_at` (assert).

### 3) `sources/class.move`
Defines a Ticket class (face price in **mist**, supply).
- `struct TicketClass has key { id: UID, event: ID, face_price_mist: u64, supply: u64 }`
- `public entry fun new(event: &Event, face_price_mist: u64, supply: u64, ctx: &mut TxContext): TicketClass`
- (No seat logic in core; GA only.)

### 4) `sources/ticket.move`
Ownable Ticket with a "used" flag and a check-in entry.
- `struct Ticket has key { id: UID, class: ID, used: bool }`
- `public entry fun mint(c: &TicketClass, ctx: &mut TxContext): Ticket`
- `public entry fun mark_used(t: &mut Ticket)`
  - `assert!(!t.used, E_ALREADY_USED);` then set `used = true`.
- Optional helper: `public fun is_used(t: &Ticket): bool`

> **Note:** Tickets remain **owned** objects. Kiosk and TransferPolicy are **shared** framework objects that we call from PTBs later.

### 5) `sources/policy_admin.move`
Create a `TransferPolicy<ticket::ticket::Ticket>` that we'll later reference from PTBs.
- `public entry fun create_policy(artist: address, organizer: address, platform: address, ctx: &mut TxContext)`
  - Construct a `TransferPolicy<Ticket>` using the current Sui framework API.
  - Register recipients/splits (e.g., 90/8/2) per framework rules.
  - **Share** the policy object (so trades can use it).
  - **Return** the policy if API allows (or just create+share; unit test only needs the call to succeed).

> **ABI caution:** The exact function names in `sui::transfer_policy` can vary by version. If your local framework expects a different constructor or rule registration flow, **adapt to the installed Sui version**. Keep comments explaining the mapping.

---

## Unit tests (`packages/move/ticket/tests/*`)

### `ticket_tests.move`
- Build an `Event` (with valid times), a `TicketClass`, then **mint** a `Ticket`.
- Assert that calling `mark_used` once succeeds and a second call **aborts** with `E_ALREADY_USED`.

### `policy_tests.move`
- Use dummy addresses (e.g., `@0x1`, `@0x2`, `@0x3`) and call `policy_admin::create_policy(...)` in a test context.
- The test passes if the entry executes without aborting. (We're not asserting recipients here due to framework internals.)

---

## Coding style & invariants
- Keep public entries minimal and safe; avoid unnecessary `friend` or `public(script)` exposure.
- Use constants for error codes (e.g., `const E_ALREADY_USED: u64 = 1;`).
- Favor `String` and `u64` for simplicity.
- Document each entry with a short comment.

---

## Run steps (you must include these in your output)

```bash
cd packages/move/ticket
sui move build
sui move test
```

**Expected output**

* Build succeeds with 0 errors.
* All tests in `ticket_tests` and `policy_tests` pass.

---

## Acceptance gate for M1

* ✅ `sui move build && sui move test` green on a fresh repo.
* ✅ Event/Class/Ticket/Policy modules exist with the specified entries.
* ✅ `mark_used` aborts on second call.
* ✅ No Kiosk or PTB code in Move (we'll integrate Kiosk in TypeScript later).
* ✅ No hardcoded addresses beyond unit-test dummy inputs.

---

## Non-goals in M1

* No publish to testnet (that's M2).
* No TypeScript PTBs yet (that's M5/M6).
* No zkLogin/sponsorship wiring here.
* No GraphQL or UI.

---

## After M1 (preview)

* **M2:** publish package to **testnet** and write `PACKAGE_ID` to `scripts/env.sh`.
* **M3:** run a small TS script to call `create_policy(...)` on testnet and capture `POLICY_ID`.
* **M5/M6:** PTBs for Mint&List and Buy&Approve (Kiosk + TransferPolicy), SUI-priced.
