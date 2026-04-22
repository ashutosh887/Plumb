# Plumb

> Signer-side security for Solana multisigs. Decode Squads V4 approvals before you sign.

Plumb is a browser extension that overlays the Squads V4 approval modal with a plain-English readout of what you are about to authorize: durable-nonce replay window, multisig admin actions, account-state diffs, and a bytecode diff for program upgrades. It exists because, on April 1 2026, attackers drained $285M from Drift by getting council members to sign a base64 string they couldn't read.

**This repo is the submission for the [Solana Frontier Hackathon](https://colosseum.com/frontier) (Colosseum, 2026-04-06 → 2026-05-11).**

## Why this exists

The Drift attack wasn't a contract bug. It was social engineering plus a feature called *durable nonces* — transactions that can be signed today and triggered weeks later. The attackers spent months building trust, then got the Security Council to pre-sign transfers that lay dormant until April 1.

Audits happen pre-deploy. Hardware wallets verify destination addresses. Neither protects a signer from approving a delayed admin transfer they could not read. Plumb fills that exact gap.

## What ships in the MVP

Three features. Nothing else until after May 11.

1. **Durable-nonce decoder + admin-action flag.** Detects pre-signed transactions, surfaces the replay window in plain English, flags owner-mismatched nonce accounts (the staged-account pattern), and identifies multisig admin actions (member-set, threshold, vault transfer).
2. **State-projected simulation.** Forks mainnet via Surfpool, replays the transaction, diffs account/balance/authority changes against expected state. Plain-English summary.
3. **BPF bytecode diff.** When the transaction is `BpfLoaderUpgradeable::Upgrade`, disassembles old and new program data, highlights signer-check and authority-check changes. Defends against the *next* class of attack — quorum-bypass smuggled into a routine upgrade.

What we explicitly do NOT ship for the hackathon: risk scoring, alerts, multi-sig coordination dashboards, Ledger integration, post-mortem replay. These are v2.

## Repo layout

```
apps/extension       WXT (Manifest V3, React) — the Plumb overlay
apps/dashboard       Next.js — landing page + /inspect shareable inspector
services/api         FastAPI — decode, sim, BPF-diff bridge
packages/core        Shared TS types + decoders + risk engine
packages/bpf-diff    Rust — solana_rbpf-based disassembly + diff
fixtures/            Demo inputs (Drift-class admin transfer + bytecode pair)
docs/                Demo script, distribution checklist, accelerator app outline
```

## Common commands

```sh
pnpm install
cargo build --release -p plumb-bpf-diff
pnpm dev                 # extension + dashboard + API in parallel
pnpm test                # vitest across TS workspaces
cargo test -p plumb-bpf-diff
pnpm typecheck
pnpm demo                # demo preflight checks
```

To run a single test:

```sh
pnpm --filter @plumb/core test -- risk.test.ts
cargo test -p plumb-bpf-diff diff
```

## Built on

[Squads V4](https://github.com/Squads-Protocol/v4) · [Surfpool](https://docs.surfpool.run) · [Solana Attestation Service](https://attest.solana.com) · [Helius](https://www.helius.dev) · [WXT](https://wxt.dev) · [solana_rbpf](https://github.com/solana-labs/rbpf)

## License

MIT. Open from commit zero.
