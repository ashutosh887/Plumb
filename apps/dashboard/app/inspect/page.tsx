'use client';

import { useState } from 'react';
import {
  decodeTransaction,
  detectDurableNonce,
  assess,
  type InspectionReport,
  type RiskFinding,
} from '@plumb/core';

export default function InspectPage() {
  const [tx, setTx] = useState('');
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function inspect() {
    setLoading(true);
    setErr(null);
    setReport(null);
    try {
      const decoded = await decodeTransaction(tx);
      const nonce = await detectDurableNonce(tx);
      const findings = assess({ decoded, nonce, sim: null, bpfDiff: null });
      setReport({
        txBase64: tx,
        decoded,
        nonce,
        sim: null,
        bpfDiff: null,
        findings,
        generatedAt: new Date().toISOString(),
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Live inspector</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste a base64-encoded Solana transaction. Plumb decodes it in your browser — nothing
        leaves the page.
      </p>

      <textarea
        value={tx}
        onChange={(e) => setTx(e.target.value)}
        placeholder="base64 transaction"
        rows={6}
        className="mt-6 w-full rounded-md border border-border bg-transparent p-3 font-mono text-xs leading-relaxed outline-none placeholder:text-muted-foreground focus:border-foreground/40"
      />
      <div className="mt-3 flex gap-2">
        <button
          disabled={!tx || loading}
          onClick={inspect}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Inspecting…' : 'Inspect'}
        </button>
        {tx && (
          <button
            onClick={() => {
              setTx('');
              setReport(null);
              setErr(null);
            }}
            className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm hover:bg-muted"
          >
            Clear
          </button>
        )}
      </div>

      {err && (
        <div className="mt-6 rounded-md border border-destructive/40 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {report && <Report report={report} />}
    </main>
  );
}

function Report({ report }: { report: InspectionReport }) {
  return (
    <section className="mt-8 space-y-6">
      <Findings findings={report.findings} />

      <Block title="Decoded instructions">
        {report.decoded.length === 0 ? (
          <p className="text-sm text-muted-foreground">No instructions decoded.</p>
        ) : (
          <ul className="space-y-2">
            {report.decoded.map((ix, i) => (
              <li key={i} className="rounded-md border border-border p-3">
                <div className="font-mono text-xs text-muted-foreground">
                  {ix.programName}::{ix.ixName}
                </div>
                <div className="mt-1 text-sm">{ix.plainEnglish}</div>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="Nonce">
        <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
          {JSON.stringify(report.nonce, null, 2)}
        </pre>
      </Block>
    </section>
  );
}

function Findings({ findings }: { findings: RiskFinding[] }) {
  if (findings.length === 0) {
    return (
      <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
        No anomalies detected. Still verify the recipient address.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {findings.map((f) => (
        <div
          key={f.id}
          className={
            f.severity === 'critical'
              ? 'rounded-md border border-border border-l-[3px] border-l-destructive p-3'
              : f.severity === 'warn'
                ? 'rounded-md border border-border border-l-[3px] border-l-warning p-3'
                : 'rounded-md border border-border border-l-[3px] border-l-foreground p-3'
          }
        >
          <div className="text-sm font-medium">{f.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{f.detail}</div>
        </div>
      ))}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}
