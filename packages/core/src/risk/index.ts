import type { BpfDiff, DecodedInstruction, NonceInfo, RiskFinding, SimResult } from '../types.js';
import { isSquadsMultisigAdminAction } from '../decoders/squads.js';
import { isBpfUpgradeIx } from '../decoders/bpf.js';

export interface AssessInput {
  decoded: DecodedInstruction[];
  nonce: NonceInfo;
  sim: SimResult | null;
  bpfDiff: BpfDiff | null;
}

export function assess(input: AssessInput): RiskFinding[] {
  const findings: RiskFinding[] = [];

  if (input.nonce.isDurableNonce) {
    findings.push({
      id: 'durable-nonce',
      severity: 'critical',
      title: `Durable nonce — replay window ${input.nonce.estimatedReplayWindowDays ?? '?'} days`,
      detail:
        'This transaction uses a durable nonce. Once you sign, it can be triggered hours, days, or weeks later — silently. This is the exact mechanism behind the April 1 2026 Drift exploit.',
      evidence: { noncePubkey: input.nonce.noncePubkey, blockhash: input.nonce.blockhash },
    });
  }

  if (input.nonce.isDurableNonce && !input.nonce.ownerMatchesExpected) {
    findings.push({
      id: 'nonce-owner-mismatch',
      severity: 'critical',
      title: 'Owner mismatch on nonce account',
      detail: `The nonce account is owned by \`${input.nonce.nonceAccountOwner}\` instead of the System Program. This is anomalous and consistent with attacker-staged nonce accounts.`,
    });
  }

  for (const ix of input.decoded) {
    if (isSquadsMultisigAdminAction(ix)) {
      findings.push({
        id: `multisig-admin-${ix.ixName}`,
        severity: 'critical',
        title: 'Multisig admin action queued',
        detail: `\`${ix.ixName}\` modifies the multisig itself (members, threshold, or vault transfer). Verify every account against the team's source of truth before signing.`,
        evidence: { accounts: ix.accounts.map((a) => a.pubkey) },
      });
    }
    if (isBpfUpgradeIx(ix)) {
      findings.push({
        id: `bpf-${ix.ixName}`,
        severity: ix.ixName === 'upgrade' ? 'critical' : 'warn',
        title: ix.ixName === 'upgrade' ? 'Program upgrade — bytecode change' : 'Program authority change',
        detail:
          'Bytecode or authority changes can hide signer-check downgrades. Inspect the BPF diff before approving.',
      });
    }
  }

  if (input.sim) {
    for (const change of input.sim.authorityChanges) {
      findings.push({
        id: `authority-change-${change.field}`,
        severity: 'critical',
        title: `Authority change: ${change.field}`,
        detail: `\`${change.field}\` will change from \`${change.before}\` to \`${change.after}\`.`,
      });
    }
  }

  if (input.bpfDiff) {
    if (input.bpfDiff.signerChecksRemoved.length > 0) {
      findings.push({
        id: 'signer-check-removed',
        severity: 'critical',
        title: 'Signer check removed in upgraded bytecode',
        detail: `The new program removes signer requirements: ${input.bpfDiff.signerChecksRemoved.join(', ')}. This is a classic governance bypass pattern.`,
      });
    }
    if (input.bpfDiff.authorityChecksRemoved.length > 0) {
      findings.push({
        id: 'authority-check-removed',
        severity: 'critical',
        title: 'Authority check removed in upgraded bytecode',
        detail: `Removed authority checks: ${input.bpfDiff.authorityChecksRemoved.join(', ')}.`,
      });
    }
  }

  return findings;
}

const SEVERITY_ORDER: Record<RiskFinding['severity'], number> = { critical: 0, warn: 1, info: 2 };

export function topThree(findings: RiskFinding[]): RiskFinding[] {
  return [...findings]
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, 3);
}
