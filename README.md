# Plumb

> Signer-side security for Solana multisigs. Decode Squads V4 approvals before you sign.

Plumb is a browser extension that overlays the Squads V4 approval modal with a plain-English readout of what you are about to authorize: durable-nonce replay window, multisig admin actions, account-state diffs, and a bytecode diff for program upgrades. It exists because, on April 1 2026, attackers drained $285M from Drift by getting council members to sign a base64 string they couldn't read.

**This repo is the submission for the [Solana Frontier Hackathon](https://colosseum.com/frontier) (Colosseum, 2026-04-06 → 2026-05-11).**

## Origin

> *"I was scoping a Solana treasury setup with Squads in late March. April 1 hit. I read every Drift post-mortem and realized: I was about to be one of those signers — staring at base64 I couldn't decode, trusting the deployer's PDF. I built Plumb because I refuse to be the next signer who gets socially engineered."*

## Why this exists

The Drift attack wasn't a contract bug. It was social engineering plus a feature called *durable nonces* — transactions that can be signed today and triggered weeks later. The attackers spent months building trust, then got the Security Council to pre-sign transfers that lay dormant until April 1.

Audits happen pre-deploy. Hardware wallets verify destination addresses. Neither protects a signer from approving a delayed admin transfer they could not read. Plumb fills that exact gap.

## What ships in the MVP

Three features. Nothing else until after May 11.

1. **Durable-nonce decoder + admin-action flag.** Detects pre-signed transactions, surfaces the replay window in plain English, flags owner-mismatched nonce accounts (the staged-account pattern), and identifies multisig admin actions (member-set, threshold, vault transfer).
2. **State-projected simulation.** Forks mainnet via Surfpool, replays the transaction, diffs account/balance/authority changes against expected state. Plain-English summary.
3. **BPF bytecode diff.** When the transaction is `BpfLoaderUpgradeable::Upgrade`, disassembles old and new program data, highlights signer-check and authority-check changes. Defends against the *next* class of attack — quorum-bypass smuggled into a routine upgrade.

What we explicitly do NOT ship for the hackathon: risk scoring, alerts, multi-sig coordination dashboards, Ledger integration, post-mortem replay. These are v2.

Plumb is **read-only at the signer interface** — the extension never modifies, signs, or co-signs a transaction. The signer still clicks Approve in their wallet.

## Repo layout

```
apps/extension       WXT (Manifest V3, React) — the Plumb overlay
apps/dashboard       Next.js — landing + /inspect inspector + /demo synthetic Squads modal
services/api         FastAPI — reserved for v2 server-side sim (not in demo path)
packages/core        Shared TS types + decoders + risk engine — runs in extension
packages/bpf-diff    Rust — solana_rbpf disassembly + diff (reserved for real ELF input)
fixtures/            Demo inputs (Drift-class admin transfer + bytecode pair)
docs/                Demo script + submission checklist
scripts/             build-fixtures.mjs, demo.mjs
```

## Common commands

The demo runs from two processes: the dashboard and the extension. Decoding and risk assessment happen client-side in the extension via `@plumb/core` — no Python, no Rust binary needed for the demo recording.

```sh
pnpm install
pnpm fixtures                          # build base64 tx fixtures
pnpm --filter @plumb/dashboard dev     # http://localhost:3000/demo
pnpm --filter @plumb/extension dev     # opens Chrome with the extension loaded
pnpm typecheck                         # all TS workspaces clean
pnpm build                             # extension + dashboard production builds
```

For v2 / server-side work (not needed for the hackathon demo):

```sh
cargo build --release -p plumb-bpf-diff   # needs Rust toolchain
# FastAPI: needs Python 3.11+. cd services/api && python -m venv .venv && .venv/bin/pip install -e ".[dev]"
```

## Built on

[Squads V4](https://github.com/Squads-Protocol/v4) · [Surfpool](https://docs.surfpool.run) · [Solana Attestation Service](https://attest.solana.com) · [Helius](https://www.helius.dev) · [WXT](https://wxt.dev) · [solana_rbpf](https://github.com/solana-labs/rbpf)

## License

MIT. Open from commit zero.
