import { describe, it, expect } from 'vitest';
import { assess, topThree } from './index.js';
import type { DecodedInstruction, NonceInfo, BpfDiff } from '../types.js';

const noNonce: NonceInfo = { isDurableNonce: false, ownerMatchesExpected: true };
const driftLikeNonce: NonceInfo = {
  isDurableNonce: true,
  noncePubkey: 'NoncE111111',
  nonceAuthority: 'AttkR111111',
  nonceAccountOwner: 'AttkR111111',
  ownerMatchesExpected: false,
  estimatedReplayWindowDays: 47,
};

const adminIx: DecodedInstruction = {
  programId: 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf',
  programName: 'Squads V4',
  ixName: 'multisig_change_threshold',
  args: {},
  accounts: [],
  plainEnglish: '',
};

describe('risk.assess', () => {
  it('flags durable nonce + owner mismatch + admin action together (Drift-class)', () => {
    const findings = assess({ decoded: [adminIx], nonce: driftLikeNonce, sim: null, bpfDiff: null });
    const ids = findings.map((f) => f.id);
    expect(ids).toContain('durable-nonce');
    expect(ids).toContain('nonce-owner-mismatch');
    expect(ids).toContain('multisig-admin-multisig_change_threshold');
  });

  it('clean tx returns zero findings', () => {
    const findings = assess({ decoded: [], nonce: noNonce, sim: null, bpfDiff: null });
    expect(findings).toHaveLength(0);
  });

  it('topThree picks critical first', () => {
    const findings = assess({ decoded: [adminIx], nonce: driftLikeNonce, sim: null, bpfDiff: null });
    const top = topThree(findings);
    expect(top.length).toBeLessThanOrEqual(3);
    expect(top.every((f) => f.severity === 'critical')).toBe(true);
  });

  it('flags signer-check removal from bpf diff', () => {
    const bpfDiff: BpfDiff = {
      ok: true,
      oldHash: 'a',
      newHash: 'b',
      controlFlowChanges: 1,
      signerChecksRemoved: ['council.is_signed_by_quorum'],
      signerChecksAdded: ['council.is_signed_by_one'],
      authorityChecksRemoved: [],
      authorityChecksAdded: [],
      diff: [],
    };
    const findings = assess({ decoded: [], nonce: noNonce, sim: null, bpfDiff });
    expect(findings.find((f) => f.id === 'signer-check-removed')).toBeDefined();
  });
});
