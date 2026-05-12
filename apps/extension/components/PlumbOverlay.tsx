import { useEffect, useState } from 'react';
import type { InspectionReport, RiskFinding } from '@plumb/core';
import { FindingRow } from './FindingRow';
import { BpfDiffPanel } from './BpfDiffPanel';
import { ReceiptPanel } from './ReceiptPanel';
import type { AttestationResult } from '../lib/attest';
import './overlay.css';

type Phase = 'idle' | 'loading' | 'ready' | 'error';
type AttestPhase = 'none' | 'minting' | 'done' | 'failed';

export function PlumbOverlay() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBpf, setShowBpf] = useState(false);
  const [attestPhase, setAttestPhase] = useState<AttestPhase>('none');
  const [attestation, setAttestation] = useState<AttestationResult | null>(null);
  const [attestError, setAttestError] = useState<string | null>(null);

  useEffect(() => {
    const onTx = (e: Event) => {
      const detail = (e as CustomEvent<{ tx: string; meta?: Record<string, unknown> }>).detail;
      setPhase('loading');
      setAttestPhase('none');
      setAttestation(null);
      chrome.runtime.sendMessage(
        { type: 'plumb/inspect', txBase64: detail.tx, meta: detail.meta },
        (res) => {
          if (!res?.ok) {
            setError(res?.error ?? 'unknown error');
            setPhase('error');
            return;
          }
          setReport(res.report);
          setPhase('ready');
        },
      );
    };
    window.addEventListener('plumb:tx', onTx);
    return () => window.removeEventListener('plumb:tx', onTx);
  }, []);

  async function handleReject() {
    if (!report) return;
    setAttestPhase('minting');
    setAttestError(null);
    const txHash = await sha256Hex(report.txBase64);
    const simHash = await sha256Hex(JSON.stringify(report.sim ?? {}));
    const signerPubkey =
      (report.decoded.find((ix) => ix.accounts.some((a) => a.isSigner))?.accounts.find(
        (a) => a.isSigner,
      )?.pubkey) ?? 'unknown';
    chrome.runtime.sendMessage(
      {
        type: 'plumb/attest',
        input: {
          signerPubkey,
          txHash,
          simHash,
          riskFlags: report.findings.map((f) => f.id),
          verdict: 'rejected' as const,
        },
      },
      (res) => {
        if (!res?.ok) {
          setAttestError(res?.error ?? 'attestation failed');
          setAttestPhase('failed');
          return;
        }
        setAttestation(res.result);
        setAttestPhase('done');
      },
    );
  }

  if (phase === 'idle') return null;

  return (
    <div className="plumb-overlay" role="dialog" aria-label="Plumb transaction inspector">
      <div className="plumb-header">
        <span className="plumb-logo">Plumb</span>
        <span className="plumb-tagline">Signer-side security</span>
      </div>

      {phase === 'loading' && <div className="plumb-loading">Inspecting transaction…</div>}
      {phase === 'error' && <div className="plumb-error">Plumb couldn't inspect: {error}</div>}

      {phase === 'ready' && report && (
        <>
          <div className="plumb-findings">
            {topThree(report.findings).map((f) => (
              <FindingRow key={f.id} finding={f} />
            ))}
            {report.findings.length === 0 && (
              <div className="plumb-clean">
                No anomalies detected. Still verify the recipient address.
              </div>
            )}
          </div>

          {report.bpfDiff && (
            <button className="plumb-cta" onClick={() => setShowBpf((v) => !v)}>
              {showBpf ? 'Hide bytecode diff' : 'Inspect bytecode'}
            </button>
          )}
          {showBpf && report.bpfDiff && <BpfDiffPanel diff={report.bpfDiff} />}

          {attestPhase === 'minting' && (
            <div className="plumb-loading">Minting attestation on devnet…</div>
          )}
          {attestPhase === 'failed' && (
            <div className="plumb-error">Attestation failed: {attestError}</div>
          )}
          {attestPhase === 'done' && attestation && <ReceiptPanel result={attestation} />}

          <div className="plumb-actions">
            <button
              className="plumb-btn plumb-btn-reject"
              onClick={handleReject}
              disabled={attestPhase === 'minting'}
            >
              {attestPhase === 'minting' ? 'Signing receipt…' : 'Reject + attest'}
            </button>
            <button
              className="plumb-btn plumb-btn-approve"
              disabled={report.findings.length > 0}
            >
              {report.findings.length > 0 ? 'Approve blocked' : 'Approve'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const SEVERITY_ORDER: Record<RiskFinding['severity'], number> = {
  critical: 0,
  warn: 1,
  info: 2,
};

function topThree(findings: RiskFinding[]): RiskFinding[] {
  return [...findings]
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, 3);
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
