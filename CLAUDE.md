# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Plumb

Plumb is a signer-side transaction inspector for Squads V4 multisig approvals. Browser extension intercepts the approval flow, decodes the tx, and surfaces three classes of finding: durable-nonce replay risk, multisig admin actions, and (when applicable) BPF program-upgrade authority changes. **Plumb is read-only at the signer interface.**

Built for the **Solana Frontier Hackathon** (Colosseum, runs 2026-04-06 → 2026-05-11). Targeting **Grand Champion + Cohort 5**, not Public Goods.

> Origin story (locked Draft A — use verbatim in README, demo voiceover, accelerator app, founder bio): *"I was scoping a Solana treasury setup with Squads in late March. April 1 hit. I read every Drift post-mortem and realized: I was about to be one of those signers — staring at base64 I couldn't decode, trusting the deployer's PDF. I built Plumb because I refuse to be the next signer who gets socially engineered."*

## Operating principles

1. **Demo > production.** Every decision optimizes for a 90s video that wins. If a feature doesn't appear on screen in those 90 seconds, it ships post-hackathon.
2. **Three features only.** Durable-nonce decoder, state-projected simulation, BPF program-upgrade diff. **No fourth feature without explicit user approval.**
3. **Visible work compounds.** Public repo, public devlog tweets at every milestone. Judges Google-search names; surface area matters.
4. **Resist platform syndrome.** When in doubt, cut scope.
5. **Origin story is the weakest leg.** Use the locked wording above verbatim, never paraphrase.

## What Claude must NEVER do

- **Never modify a user's transaction.** Plumb is read-only at the signer interface. The moment Plumb writes, it becomes the attack surface.
- **Never add a fourth feature without explicit approval.**
- **Never pitch Plumb as a "platform" or "suite."** It is a seatbelt.
- **Never claim Plumb would have caught Drift specifically.** Claim Plumb would have *surfaced the warning signs the signers missed*. Slightly weaker, much more defensible.
- **Never use the words** *revolutionize, democratize, empower, ecosystem-wide* in any user-facing copy. Mert closes the tab.
- **Never ping Matty Tay or Toly without a finished demo in hand.**
- **Never reference unrelated projects** when shaping Plumb's narrative or origin. Plumb is the only project in scope.

## Scope (in / out)

**In (MVP — exactly three features):**

1. **Durable-nonce decoder + multisig admin-action flag.** First-IX `AdvanceNonceAccount` detection, owner-mismatch on the nonce account, replay-window estimate, Squads admin-action discriminator classification.
2. **State-projected simulation.** Surfpool mainnet fork, `simulateTransaction`, account/balance/authority diff in plain English.
3. **BPF diff for program upgrades.** When the tx is `BpfLoaderUpgradeable::Upgrade`, disassemble old + new ELFs via `solana_rbpf`, surface signer-check and authority-check changes. Framed as the *next class of attack* — not what would have caught Drift specifically.

**Out (v2, post-hackathon):** risk scoring engine, Slack alerts, multi-sig coordination view, Ledger pre-sign, post-mortem replay. Do not build them. The temptation will be strong.

## Drift attack — facts and claims

- **April 1 2026, 16:05:18 UTC** — first pre-signed proposal-execute tx fires; admin transferred to attacker pubkey `H7PiGqqUaanBovwKgEtreJbKmQe6dbq6VTrw6guy7ZgL`.
- **March 23 2026** — four durable-nonce accounts created; **two attacker-controlled**, two associated with real Drift Security Council members.
- **March 26 2026** (NOT March 27 — common typo) — Drift migrates to a 2-of-5 multisig with **zero timelock**.
- **Loss:** ~$285.3M, >50% of Drift TVL. Likely DPRK-attributed. Sources: Chainalysis, BlockSec, TRM Labs, Hypernative, QuillAudits.
- **Attack vehicle:** multisig admin transfer via durable nonce — *not* a BPF program upgrade. The BPF-diff demo frame is positioned as defending against the *next* class of attack.

What Plumb would have surfaced on the actual Drift pre-sign tx: durable-nonce flag (first IX is `AdvanceNonceAccount`), owner mismatch (attacker-owned nonce accounts), Squads admin-action classification (`config_transaction_execute`), replay-window warning. Whether signers would have acted is a human question — never claim Plumb would have *caught* Drift, only that it would have *surfaced* the warning signs.

## Squads V4 — interception point (locked)

Plumb hooks the wallet-adapter signing path on `app.squads.so` (and `devnet.squads.so`). Content script intercepts `signTransaction` / `signMessage`, decodes the message, runs the inspection pipeline, renders the overlay. **The signer still clicks Approve in their wallet.** Read-only.

Squads V4 role split (relevant when decoding Squads-program ixs):
- **Member with `Initiate`** = Proposer (creates VaultTransaction / ConfigTransaction / Batch).
- **Member with `Vote`** = Approver (`proposal_approve` / `proposal_reject`).
- **Member with `Execute`** = Executor (`vault_transaction_execute` / `config_transaction_execute`).

The high-risk surface is `config_transaction_execute` (changes the multisig itself: members, threshold, vault transfer). Plumb's decoder marks this as a multisig-admin-action finding.

For the demo, the synthetic harness page at `/demo` injects the fixture tx into `#plumb-debug-tx`. The content script's polling path picks that up; the wallet-adapter hook path is for real Squads pages and is Day 6-8 work.

## Architecture decision: client-side decode

The extension does decode + risk assessment inline (`apps/extension/lib/inspect.ts` calls `@plumb/core` directly). No network round-trip during demo. Right shape for a read-only signer-side tool — no extra trust surface, no operator dependency, no demo-day flake.

For the BPF diff frame, the demo fixture ships with a **pre-baked diff JSON** in `fixtures/drift_admin_transfer.json` under `meta.bpfDiff`. The Rust crate (`packages/bpf-diff`) generates the equivalent output for real ELF inputs and stays available for v2.

## Phasing — compressed window

| Days | Goal | Demo-worthy artifact |
|---|---|---|
| 1–2 | Research + scaffold + deps locked | Scaffold green, kit on TS workspaces |
| 3–5 | Decoder + Squads modal interception on devnet | Squads modal → Plumb sidebar with plain-English IX list |
| 6–8 | Durable-nonce + Surfpool fork sim. Drift-class fixture lights up red | Forked-mainnet replay with three red rows |
| 9–10 | BPF diff (or fallback authority-write detection if not <2s) | Monaco split-pane diff on synthetic upgrade pair |
| 11 | SAS attestation, demo polish, three video takes | 90s MP4 |
| 12 (May 10) | Submit Colosseum portal (24h buffer ahead of May 11 close) | Submission live + launch tweet pre-scheduled |
| 13 (May 11) | Post-submit distribution drop | Threads + Solana Foundation forum + Squads Discord |

## Demo arc — 90s frame map

Hook by 0:08, BPF flex by 0:25, sponsor logos by 1:20.

| Time | Frame | Audio |
|---|---|---|
| 0:00–0:03 | Bloomberg-style chyron: *"$285M Drained from Drift Protocol"* dated April 1 | single soft tone |
| 0:03–0:08 | Squads approval modal, opaque base64, cursor on Approve, freeze | *"The exploit wasn't a bug. It was a PDF."* |
| 0:08–0:15 | Plumb overlay slides in from bottom-right | *"Plumb is the seatbelt every Squads signer puts on."* |
| 0:15–0:25 | Three red rows animate in: durable nonce 47-day replay window / owner mismatch on nonce account / bytecode authority change | *"It decodes the durable nonce, projects the replay window, and flags the owner mismatch."* |
| 0:25–0:55 | Click "Inspect bytecode." Monaco split-pane: old `is_signed_by_quorum` (green), new `is_signed_by_one` (red highlight) | *"This is the actual program upgrade. The quorum check became a single signer. Plumb caught it before approval."* (refers to on-screen synthetic fixture, not Drift) |
| 0:55–1:05 | "Reject" click → SAS attestation receipt mints on devnet (real chain action, not mocked) | *"Every approval Plumb signs leaves a forensic trail."* |
| 1:05–1:20 | Integrations wall: Squads · Drift · Jupiter · Marinade · "your program here" (only logos for protocols that publicly said yes; otherwise placeholder) | *"Squads secures $10B in treasury. We're shipping Plumb as the default safety layer for every Solana program with a multisig."* |
| 1:20–1:30 | End card: Plumb logo, GitHub URL, install URL, *"Built on Squads V4 + Solana Attestation Service + Surfpool"* | *"Frontier 2026. Plumb."* |

Three takes minimum. 1920×1080 60fps ProRes master, H.264 ≤25MB delivery. Captions burned in. Pre-warm `/inspect` with the fixture so first click is instant. Record against the synthetic harness page (not real Squads) so a Squads UI release can't break the demo.

**Fallback if BPF diff isn't rendering by Day 9:** re-cut 0:25–0:55 to "authority audit" — parser output listing privileged functions and which accounts they write to, with the malicious upgrade visibly adding a `Config.admin` write from a non-signer path. Less flashy, still demo-worthy.

## Submission — Colosseum portal

- **Internal deadline:** 2026-05-10 (24h buffer ahead of May 11 close).
- **Track:** Grand Champion + Cohort 5 accelerator. **Do NOT check Public Goods** in the portal.
- **Pitch:** venture line. SaaS for protocol treasuries; recurring revenue from every protocol with a multisig. MIT license is fine for distribution; keep the venture framing in copy.

Submission checklist (24h before deadline):
- [ ] GitHub repo public, README polished, install instructions
- [ ] 90s demo video on YouTube (unlisted) + native Twitter upload
- [ ] Live demo link working from a fresh browser session
- [ ] 10-slide pitch deck (Mert framework — see below)
- [ ] All judges who replied/engaged DM'd the final demo
- [ ] Long-form Twitter thread scheduled for hackathon-end + 1 hour
- [ ] Origin story rehearsed in 30s / 60s / 90s lengths

## Pitch deck — Mert framework (10 slides, one big sentence + image per page)

1. **"$285M was stolen from Drift on April 1."** — Bloomberg-style headline, full-bleed.
2. **"The exploit wasn't a bug. It was a PDF."** — Squads modal with base64 visible.
3. **"Signers approved opaque base64 they didn't decode."** — zoom on the same base64 with question mark.
4. **"STRIDE catches code bugs. It doesn't help signers."** — STRIDE / Asymmetric / OtterSec / Neodyme logo grid, labeled "pre-deploy."
5. **"Plumb is the seatbelt every signer puts on."** — Plumb overlay rendered on Squads modal.
6. **"We decode durable nonces and flag replay windows."** — durable-nonce red row screenshot.
7. **"We simulate every tx against forked state."** — account-diff plain-English screenshot.
8. **"We diff the bytecode of every program upgrade."** — Monaco split-pane from demo's 0:25 frame.
9. **"Built on Squads V4. SAS-attested. Open source."** — sponsor logo wall + GitHub URL.
10. **"Squads secures $10B. Plumb is the safety layer."** — end card with install URL and the ask.

## Distribution — judge CRM and content cadence

Outreach rules (Balaji): single specific ask, only request what you can't do yourself, no "what do you think" — ask "is the BPF diff the right depth flex, or should I lean harder on the durable-nonce angle?" One follow-up max if no reply in 7 days.

Targeted touches (each is a single specific ask, in the order to send):

- **Garrett Harper** `@GarrettHarper_` — Squads judge. Workshop Apr 14. *"Built on Squads V4 — 60s loom of the durable-nonce decoder. Worth your 60s?"*
- **Mert** `@mert` — Helius CEO + judge. After Surfpool sim works. Compliment Helius MEV report, drop link.
- **Adam Gutierrez** `@adamdelphantom` — Phantom judge. Reply to his Apr 10 thread with one-liner + repo, no DM yet.
- **Milian** `@milianstx` — Arcium judge, privacy lens. Reply to Apr 20 thread + DM with signer-side privacy angle.
- **Arihant Bansal** `@arihantbansal` — Arcium judge. Reply to Apr 23 thread, one-liner.
- **Josip Volarević** `@JosipVolarevic2` — Mentor + 2× Colosseum winner. Use his framework against him: tight one-liner, ask for one critique.
- **Billy** `@twentyOne2x` — attn.markets judge. Read his submission criteria first, address them explicitly.
- **Tony Plasencia** `@tonyplasencia3` — Underdog judge, consumer lens. Frame as *"the seatbelt before any treasury action."*
- **Alex Scott** `@afscott` — Superteam AE. One-liner; ask for Squads team intro.
- **Gui Bibeau** `@GuiBibeau` — does 4-5min impression videos. Reply to Apr 18 thread with repo + landing page.
- **Solana Ecosystem Call** `@SolBrothersPod` — features top 3 submissions. Reply with the "why we can't ignore it" hook.
- **Matty Tay** `@mattytay` — Colosseum cofounder. **HOLD until finished demo in hand.**
- **Matthew** `@yo_itsmatt` — wrong lane (agentic trading). **SKIP, don't waste a touch.**

Content cadence:
- **Tuesday** devlog tweet — technical detail, screenshot or 15s screen recording.
- **Friday** devlog tweet — progress + ask for feedback on one specific thing.
- **One long-form post by Day 8** — Drift attack vector technical deep-dive with Plumb as conclusion. Cross-post to r/solana, Helius blog (DM Mert with draft), Solana Foundation forum, Twitter as 12-tweet thread.
- **Discord drops** — Colosseum #showcase, Squads (after sim works), Helius, Superteam India.

What I will NOT do: cold-DM Toly, pay for boosts, AI-generated thread art, over-claim integrations.

## Repo layout

```
apps/extension       WXT (Manifest V3, React) — Plumb overlay; decodes inline via @plumb/core
apps/dashboard       Next.js — landing + /inspect inspector + /demo synthetic Squads modal
services/api         FastAPI — reserved for v2 server-side sim (not in demo path)
packages/core        Shared TS types + decoders + risk engine — runs in extension
packages/bpf-diff    Rust — solana_rbpf disassembly + diff (reserved for real ELF input)
fixtures/            Real base64 tx fixtures generated by scripts/build-fixtures.mjs
scripts/             build-fixtures.mjs (real tx generator), demo.mjs (preflight)
```

## Common commands

The demo runs from **two processes**: the dashboard and the extension. No Python and no Rust binary required for the demo recording — decoding and risk assessment happen client-side in the extension via `@plumb/core`.

```sh
pnpm install
pnpm fixtures             # build real base64 tx fixtures (drift + clean)
pnpm --filter @plumb/dashboard dev   # http://localhost:3000/demo
pnpm --filter @plumb/extension dev   # opens Chrome with extension loaded
pnpm typecheck            # all 4 TS workspaces clean
pnpm build                # extension + dashboard production builds
```

For v2 / server-side work (not needed for hackathon demo):

```sh
cargo build --release -p plumb-bpf-diff   # needs Rust toolchain
# FastAPI requires Python 3.11+; system python3 may be too old.
# If/when needed: pyenv install 3.11 && cd services/api && python -m venv .venv && .venv/bin/pip install -e ".[dev]"
```

## Tech stack — locked

- **TS SDK:** `@solana/kit` (formerly `@solana/web3.js@2`) for new code. `@coral-xyz/anchor` brings v1 transitively for IDL fetch — accepted; don't try to fully purge v1.
- **Browser extension:** WXT (MV3, React). Pinned `@vitejs/plugin-react@^4.3.4` via `pnpm.overrides` because plugin-react v6 needs Vite 8 and WXT ships Vite 6.
- **Sim engine:** Surfpool (mainnet fork; Heavy Duty Builders sponsor lane).
- **BPF analysis:** `solana_rbpf` 0.8.5 behind a Rust binary, JSON-on-stdin contract.
- **Squads:** `@sqds/multisig`.
- **Attestation:** `sas-lib` (TS).
- **RPC:** Helius dedicated.
- **Backend (v2):** FastAPI.

## SAS approval-receipt schema

Every "Approve via Plumb" click mints an attestation:

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

One Plumb-issuer keypair signs all attestations; ship its pubkey in the README so anyone can verify. Schema registered once on mainnet; receipts reference the schema PDA.

## Honesty constraints (origin + demo + copy)

- Don't invent a Squads vault that didn't exist. *Scoping* is the literal verb.
- Don't claim Drift-signer status. You weren't.
- Don't claim Squads team relationships unless a DM exists.
- The demo voiceover line *"Plumb caught it before approval"* refers to the synthetic on-screen upgrade fixture — accurate as scripted. Never extend it to claim Plumb caught Drift.
- Integrations wall shows only logos for protocols that publicly said yes. Otherwise "your program here" placeholder.
