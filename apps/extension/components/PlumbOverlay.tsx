import { useEffect, useState } from 'react';
import type { InspectionReport, RiskFinding } from '@plumb/core';
import { FindingRow } from './FindingRow';
import { BpfDiffPanel } from './BpfDiffPanel';
import './overlay.css';

type Phase = 'idle' | 'loading' | 'ready' | 'error';

export function PlumbOverlay() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBpf, setShowBpf] = useState(false);

  useEffect(() => {
    const onTx = (e: Event) => {
      const detail = (e as CustomEvent<{ tx: string; meta?: Record<string, unknown> }>).detail;
      setPhase('loading');
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

  if (phase === 'idle') return null;

  return (
    <div className="plumb-overlay" role="dialog" aria-label="Plumb transaction inspector">
      <div className="plumb-header">
        <span className="plumb-logo">Plumb</span>
        <span className="plumb-tagline">Signer-side security</span>
      </div>

      {phase === 'loading' && <div className="plumb-loading">Inspecting transaction…</div>}
      {phase === 'error' && <div className="plumb-error">Plumb couldn't reach the inspector: {error}</div>}

      {phase === 'ready' && report && (
        <>
          <div className="plumb-findings">
            {topThree(report.findings).map((f) => (
              <FindingRow key={f.id} finding={f} />
            ))}
            {report.findings.length === 0 && (
              <div className="plumb-clean">No anomalies detected. Still verify the recipient address.</div>
            )}
          </div>

          {report.bpfDiff && (
            <button className="plumb-cta" onClick={() => setShowBpf((v) => !v)}>
              {showBpf ? 'Hide bytecode diff' : 'Inspect bytecode'}
            </button>
          )}
          {showBpf && report.bpfDiff && <BpfDiffPanel diff={report.bpfDiff} />}

          <div className="plumb-actions">
            <button className="plumb-btn plumb-btn-reject">Reject</button>
            <button className="plumb-btn plumb-btn-approve" disabled={report.findings.length > 0}>
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
