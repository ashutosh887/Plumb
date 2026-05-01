#!/usr/bin/env node
/**
 * Build real base64 transactions for the Plumb demo fixtures.
 *
 * Two fixtures:
 *   1. drift_admin_transfer.tx.b64 — durable-nonce + Squads admin action.
 *      Mirrors the Drift attack vehicle. Should trigger:
 *        - durable-nonce
 *        - nonce-owner-mismatch (we mark the nonce owner as an attacker key
 *          via the noncePreFetchedOwner option in the demo path)
 *        - multisig-admin-config_transaction_execute
 *
 *   2. clean_vault_transfer.tx.b64 — vanilla System transfer. Zero findings.
 *
 * These are *unsigned compiled messages* serialized as VersionedTransaction.
 * We never sign — Plumb is read-only at the signer interface, and signed/unsigned
 * is irrelevant for decoding.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';

const SQUADS_V4 = new PublicKey('SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf');

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIX_DIR = resolve(__dirname, '..', 'fixtures');

mkdirSync(FIX_DIR, { recursive: true });

// Deterministic keypairs so fixtures are stable across runs.
function seededKeypair(label) {
  const seed = Buffer.alloc(32);
  Buffer.from(label).copy(seed);
  return Keypair.fromSeed(seed);
}

const signer = seededKeypair('plumb-demo-signer-002025');
const noncePubkey = seededKeypair('plumb-demo-nonce-account-x');
const nonceAuthority = seededKeypair('plumb-demo-nonce-authority-y');
const multisig = seededKeypair('plumb-demo-multisig-account-z');
const recipient = seededKeypair('plumb-demo-recipient-aa');

// Stand-in 'attacker' owner that the demo will inject as the nonce account owner.
const attackerOwner = seededKeypair('plumb-demo-attacker-owner-bb').publicKey.toBase58();

// Use a synthetic-but-valid-shape blockhash. Real durable nonce txs put the nonce's
// stored hash here. For decoding (read-only) the value doesn't need to be a real
// chain hash — only base58, 32 bytes.
const NONCE_BLOCKHASH = '11111111111111111111111111111111';

function buildAdvanceNonceIx() {
  // System program AdvanceNonceAccount discriminator = 4 (u32 LE)
  const data = Buffer.alloc(4);
  data.writeUInt32LE(4, 0);
  return new TransactionInstruction({
    programId: SystemProgram.programId,
    keys: [
      { pubkey: noncePubkey.publicKey, isSigner: false, isWritable: true },
      // SysvarRecentBlockhashes is the canonical second account; using SystemProgram
      // here is technically wrong on chain but irrelevant for decode-only fixtures.
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: nonceAuthority.publicKey, isSigner: true, isWritable: false },
    ],
    data,
  });
}

function buildSquadsAdminIx() {
  // We use discriminator byte 0x11 (config_transaction_execute) so the Squads
  // decoder classifies this as an admin action. Real Squads instructions are
  // 8-byte Anchor discriminators — we use a one-byte heuristic in our decoder
  // for the demo (see packages/core/src/decoders/squads.ts).
  const data = Buffer.alloc(8);
  data.writeUInt8(0x11, 0);
  return new TransactionInstruction({
    programId: SQUADS_V4,
    keys: [
      { pubkey: multisig.publicKey, isSigner: false, isWritable: true },
      { pubkey: signer.publicKey, isSigner: true, isWritable: true },
    ],
    data,
  });
}

function buildSystemTransferIx() {
  return SystemProgram.transfer({
    fromPubkey: signer.publicKey,
    toPubkey: recipient.publicKey,
    lamports: 5_000_000,
  });
}

function compile(instructions, payerKey, blockhash) {
  const message = new TransactionMessage({
    payerKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  const tx = new VersionedTransaction(message);
  return Buffer.from(tx.serialize()).toString('base64');
}

function writeFixture(name, payload) {
  const path = resolve(FIX_DIR, name);
  writeFileSync(path, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`  wrote ${name}`);
}

const driftLikeTxB64 = compile(
  [buildAdvanceNonceIx(), buildSquadsAdminIx()],
  signer.publicKey,
  NONCE_BLOCKHASH,
);

const cleanTxB64 = compile(
  [buildSystemTransferIx()],
  signer.publicKey,
  NONCE_BLOCKHASH,
);

// Pre-baked BPF diff for the demo's "Inspect bytecode" frame. Mirrors what the
// Rust plumb-bpf-diff crate produces against the synthetic Anchor source pair
// in fixtures/bytecode_old.txt and fixtures/bytecode_new.txt — but pre-computed
// so the demo doesn't need a Rust subprocess running.
const PREBAKED_BPF_DIFF = {
  ok: true,
  oldHash: 'a91d2b6c4e7f9081',
  newHash: 'b3e84d1f2c5a6709',
  controlFlowChanges: 1,
  signerChecksRemoved: ['council.is_signed_by_quorum'],
  signerChecksAdded: ['council.is_signed_by_one'],
  authorityChecksRemoved: ['council.upgrade_authority == ctx.accounts.signer.key()'],
  authorityChecksAdded: [],
  diff: [
    {
      kind: 'changed',
      oldLine: 'require!(ctx.accounts.council.is_signed_by_quorum, ErrorCode::Unauthorized);',
      newLine: 'require!(ctx.accounts.council.is_signed_by_one, ErrorCode::Unauthorized);',
      lineNo: 5,
    },
    {
      kind: 'removed',
      oldLine:
        'require!(ctx.accounts.council.upgrade_authority == ctx.accounts.signer.key(), ErrorCode::Unauthorized);',
      lineNo: 6,
    },
  ],
};

writeFixture('drift_admin_transfer.json', {
  label: 'Drift-class durable-nonce admin transfer (synthetic)',
  narrative:
    'Pre-signed durable-nonce tx that, when triggered, runs a Squads V4 admin action. Mirrors the April 1 2026 Drift attack vehicle.',
  expected_findings: [
    'durable-nonce',
    'nonce-owner-mismatch',
    'multisig-admin-config_transaction_execute',
    'signer-check-removed',
    'authority-check-removed',
  ],
  tx_base64: driftLikeTxB64,
  meta: {
    signer: signer.publicKey.toBase58(),
    noncePubkey: noncePubkey.publicKey.toBase58(),
    nonceAuthority: nonceAuthority.publicKey.toBase58(),
    nonceAccountOwnerOverride: attackerOwner,
    multisig: multisig.publicKey.toBase58(),
    estimated_replay_window_days: 47,
    bpfDiff: PREBAKED_BPF_DIFF,
  },
});

writeFixture('clean_vault_transfer.json', {
  label: 'Clean Squads vault transfer',
  narrative: 'Vanilla System transfer — no findings, used to demo the clean-state UX.',
  expected_findings: [],
  tx_base64: cleanTxB64,
  meta: {
    signer: signer.publicKey.toBase58(),
    recipient: recipient.publicKey.toBase58(),
  },
});

console.log('ok');
