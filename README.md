# Plumb

> Signer-side security for Solana multisigs. Decode Squads V4 approvals before you sign.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built on Squads V4](https://img.shields.io/badge/Built%20on-Squads%20V4-9945FF)](https://github.com/Squads-Protocol/v4)
[![Solana Frontier 2026](https://img.shields.io/badge/Solana%20Frontier-2026-14F195)](https://colosseum.com/frontier)
[![Node 20+](https://img.shields.io/badge/node-%3E%3D20.11-339933)](package.json)

Plumb is a browser extension that overlays the Squads V4 approval modal with a plain-English readout of what you are about to authorize: durable-nonce replay window, multisig admin actions, account-state diffs, and a bytecode diff for program upgrades. It exists because, on April 1 2026, attackers drained ~$285M from Drift by getting council members to sign a base64 string they couldn't read.

**Plumb is read-only at the signer interface.** It never modifies, signs, or co-signs a transaction. The signer still clicks Approve in their wallet — Plumb just makes sure they know what they're signing.

This repo is the submission for the [Solana Frontier Hackathon](https://colosseum.com/frontier) (Colosseum, 2026-04-06 → 2026-05-11).

---

## Quick links

| | |
|---|---|
| Demo video (90s) | _published with submission_ |
| Live demo | _`https://plumb-dashboard.vercel.app/`_ |
| Track | Grand Champion + Cohort 5 |

---

## Origin

> *"I was scoping a Solana treasury setup with Squads in late March. April 1 hit. I read every Drift post-mortem and realized: I was about to be one of those signers — staring at base64 I couldn't decode, trusting the deployer's PDF. I built Plumb because I refuse to be the next signer who gets socially engineered."*

---

## Why this exists

The Drift attack on April 1 2026 wasn't a contract bug. It was social engineering plus a Solana feature called *durable nonces* — transactions that can be signed today and triggered weeks later. The attackers spent months building trust, then got the Security Council to pre-sign transfers that lay dormant until they fired.

Audits happen pre-deploy. Hardware wallets verify destination addresses. Neither protects a signer from approving a delayed admin transfer they could not read. Plumb fills that exact gap.

### Drift incident — quick facts

| | |
|---|---|
| Date | 2026-04-01, 16:05:18 UTC |
| Loss | ~$285.3M (>50% of Drift TVL) |
| Attack vehicle | Multisig admin transfer via durable nonce |
| Nonce staging | 2026-03-23 — four nonce accounts created; two attacker-controlled |
| Multisig migration | 2026-03-26 — Drift moved to a 2-of-5 multisig with zero timelock |
| Attribution | Likely DPRK-attributed (Chainalysis, BlockSec, TRM Labs, Hypernative, QuillAudits) |

What Plumb would have **surfaced** on the actual Drift pre-sign tx: first-IX `AdvanceNonceAccount`, owner-mismatched nonce accounts, Squads `config_transaction_execute` classification, projected authority change. Whether signers would have acted is a human question — we never claim Plumb would have *caught* Drift.

---

## What ships in the MVP

Three features. Nothing else until after May 11.

### 1. Durable-nonce decoder + admin-action flag
Detects pre-signed transactions, surfaces the replay window in plain English, flags owner-mismatched nonce accounts (the staged-account pattern), and classifies Squads admin actions (member set, threshold change, vault transfer).

### 2. State-projected simulation
Forks mainnet via Surfpool, replays the transaction, and diffs account / balance / authority changes against expected state in plain English.

### 3. BPF bytecode diff
When the transaction is `BpfLoaderUpgradeable::Upgrade`, disassembles old and new program data via `solana_rbpf`, highlights signer-check and authority-check changes. Defends against the *next* class of attack — a quorum-bypass smuggled into a routine upgrade.

**Out of scope for the hackathon** (reserved for v2): risk-scoring engine, Slack alerts, multi-sig coordination view, Ledger pre-sign, post-mortem replay.

---

## Architecture

```
                ┌────────────────────────────────────────┐
                │   app.squads.so approval modal         │
                └──────────────────┬─────────────────────┘
                                   │  signTransaction()
                                   ▼
            ┌────────────────────────────────────────────┐
            │  apps/extension  (WXT, Manifest V3)        │
            │  content script intercepts the message     │
            └──────────────────┬─────────────────────────┘
                               │  inline call (no network)
                               ▼
       ┌─────────────────────────────────────────────────┐
       │  packages/core                                  │
       │  decoders  →  risk engine  →  Finding[]         │
       │  durable-nonce · admin-action · bpf-upgrade     │
       └──────────┬──────────────────────────┬───────────┘
                  ▼                          ▼
       Surfpool mainnet fork        SAS attestation (devnet)
       simulateTransaction()        approval receipt minted
                                    on Reject / Approve
```

Decoding and risk assessment run **client-side, inline, in the extension**. No round-trip to a Plumb-operated server during the demo path — the right shape for a read-only signer-side tool.

---

## Quick start (60 seconds, for reviewers)

Requirements: Node ≥ 20.11, pnpm 9, Chrome.

```sh
pnpm install
pnpm fixtures                          # build base64 tx fixtures
pnpm --filter @plumb/dashboard dev     # open http://localhost:3000/demo
pnpm --filter @plumb/extension dev     # launches Chrome with the extension loaded
```

Open `http://localhost:3000/demo`, click the **Approve** button on the synthetic Squads modal, and the Plumb overlay slides in with three red rows for the Drift-class admin-transfer fixture.

```sh
pnpm typecheck    # all TS workspaces clean
pnpm build        # extension + dashboard production builds
```

For v2 / server-side work (not needed for the hackathon demo):

```sh
cargo build --release -p plumb-bpf-diff   # needs Rust toolchain
# FastAPI server (reserved for v2):
# cd services/api && python -m venv .venv && .venv/bin/pip install -e ".[dev]"
```

---

## Repo layout

```
apps/extension       WXT (Manifest V3, React) — the Plumb overlay
apps/dashboard       Next.js — landing + /inspect inspector + /demo synthetic Squads modal
services/api         FastAPI — reserved for v2 server-side sim (not in demo path)
packages/core        Shared TS types + decoders + risk engine — runs in extension
packages/bpf-diff    Rust — solana_rbpf disassembly + diff (reserved for real ELF input)
fixtures/            Demo inputs (Drift-class admin transfer + clean vault transfer)
scripts/             build-fixtures.mjs, demo.mjs
```

---

## SAS approval-receipt schema

Every "Approve via Plumb" click mints an attestation via the Solana Attestation Service (devnet for the demo, mainnet at v2):

```json
{
  "schema": "plumb.approval.v1",
  "signer_pubkey": "Base58Pubkey",
  "tx_hash": "hexBlake3OfTxBytes",
  "sim_hash": "hexBlake3OfSimResultJson",
  "plumb_version": "0.0.1",
  "risk_flags": ["durable-nonce", "nonce-owner-mismatch", "..."],
  "verdict": "approved | rejected",
  "timestamp": "ISO8601 UTC"
}
```

One Plumb-issuer keypair signs all attestations; the issuer pubkey is published in the extension so anyone can verify a receipt against the on-chain schema PDA.

---

## Built on

- [**Squads V4**](https://github.com/Squads-Protocol/v4) — multisig program. Plumb decodes `vault_transaction_execute`, `config_transaction_execute`, and the proposal lifecycle.
- [**Surfpool**](https://docs.surfpool.run) — mainnet-fork simulation engine (Heavy Duty Builders sponsor lane). State-projected simulation runs here.
- [**Solana Attestation Service**](https://attest.solana.com) — forensic approval-receipt trail.
- [**Helius**](https://www.helius.dev) — dedicated RPC.
- [**WXT**](https://wxt.dev) — Manifest V3 extension framework.
- [**solana_rbpf**](https://github.com/solana-labs/rbpf) — BPF disassembly for the bytecode diff.
- [**@solana/kit**](https://github.com/anza-xyz/kit) (formerly `@solana/web3.js@2`) — TS transaction primitives.

---

## Honesty constraints

We pin these to the README on purpose, so judges and readers can hold us to them:

- Plumb is **read-only at the signer interface**. It never modifies a user's transaction. The signer clicks Approve in their wallet.
- We **never claim Plumb would have caught Drift specifically**. We claim Plumb would have *surfaced the warning signs* the signers missed.
- The demo voiceover line *"Plumb caught it before approval"* refers to the on-screen synthetic upgrade fixture — accurate as scripted, not a Drift claim.
- The integrations wall on the end card shows only logos for protocols that have publicly confirmed; everything else is a placeholder.

---

## License

MIT. Open from commit zero.
