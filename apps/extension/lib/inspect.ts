import { decodeTransaction, detectDurableNonce } from '@plumb/core';
import { assess } from '@plumb/core';
import type { BpfDiff, InspectionReport, SimResult } from '@plumb/core';

export interface InspectInput {
  txBase64: string;
  meta?: {
    nonceAccountOwnerOverride?: string;
    bpfDiff?: BpfDiff;
    sim?: SimResult;
  };
}

export async function inspectInline({ txBase64, meta }: InspectInput): Promise<InspectionReport> {
  const decoded = await decodeTransaction(txBase64);
  const noncePreFetchedOwner = meta?.nonceAccountOwnerOverride;
  const nonceOpts = noncePreFetchedOwner ? { noncePreFetchedOwner } : {};
  const nonce = await detectDurableNonce(txBase64, nonceOpts);
  const bpfDiff = meta?.bpfDiff ?? null;
  const sim = meta?.sim ?? null;

  const findings = assess({ decoded, nonce, sim, bpfDiff });

  return {
    txBase64,
    decoded,
    nonce,
    sim,
    bpfDiff,
    findings,
    generatedAt: new Date().toISOString(),
  };
}
