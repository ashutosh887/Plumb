import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeTransaction } from '../decoders/tx.js';
import { detectDurableNonce } from '../decoders/nonce.js';
import { assess } from '../risk/index.js';
import type { BpfDiff, SimResult } from '../types.js';

interface Fixture {
  tx_base64: string;
  expected_findings: string[];
  meta: {
    nonceAccountOwnerOverride?: string;
    sim?: SimResult;
    bpfDiff?: BpfDiff;
  };
}

const __filename = fileURLToPath(import.meta.url);
const FIXTURE_DIR = resolve(__filename, '..', '..', '..', '..', '..', 'fixtures');

function loadFixture(name: string): Fixture {
  return JSON.parse(readFileSync(resolve(FIXTURE_DIR, name), 'utf8')) as Fixture;
}

describe('e2e: drift-class fixture flows through decode → assess', () => {
  it('produces every expected finding on the synthetic drift fixture', async () => {
    const fixture = loadFixture('drift_admin_transfer.json');
    const decoded = await decodeTransaction(fixture.tx_base64);

    expect(decoded.length).toBe(2);
    expect(decoded[0]?.programName).toBe('System');
    expect(decoded[0]?.ixName).toBe('advance_nonce_account');
    expect(decoded[1]?.programName).toBe('Squads V4');
    expect(decoded[1]?.ixName).toBe('config_transaction_execute');

    const override = fixture.meta.nonceAccountOwnerOverride;
    const nonce = await detectDurableNonce(
      fixture.tx_base64,
      override ? { noncePreFetchedOwner: override } : {},
    );
    expect(nonce.isDurableNonce).toBe(true);
    expect(nonce.ownerMatchesExpected).toBe(false);

    const findings = assess({
      decoded,
      nonce,
      sim: fixture.meta.sim ?? null,
      bpfDiff: fixture.meta.bpfDiff ?? null,
    });
    const ids = findings.map((f) => f.id);

    for (const expected of fixture.expected_findings) {
      expect(ids).toContain(expected);
    }
    expect(findings.every((f) => f.severity === 'critical')).toBe(true);
  });

  it('produces zero findings on the clean fixture', async () => {
    const fixture = loadFixture('clean_vault_transfer.json');
    const decoded = await decodeTransaction(fixture.tx_base64);
    const nonce = await detectDurableNonce(fixture.tx_base64);
    const findings = assess({ decoded, nonce, sim: null, bpfDiff: null });
    expect(findings).toEqual([]);
  });
});
