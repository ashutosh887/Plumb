'use client';

import { useState } from 'react';

export default function InspectPage() {
  const [tx, setTx] = useState('');
  const [report, setReport] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function inspect() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(process.env.NEXT_PUBLIC_PLUMB_API ?? 'http://localhost:8000/inspect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tx }),
      });
      if (!r.ok) throw new Error(`api ${r.status}`);
      setReport(await r.json());
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Live inspector</h1>
      <p className="mt-2 text-muted">
        Paste a base64-encoded Solana transaction. Plumb will decode and surface findings.
      </p>

      <textarea
        value={tx}
        onChange={(e) => setTx(e.target.value)}
        placeholder="base64 tx"
        rows={6}
        className="mt-6 w-full rounded-lg border border-border bg-transparent p-3 font-mono text-sm"
      />
      <button
        disabled={!tx || loading}
        onClick={inspect}
        className="mt-3 rounded-lg bg-accent px-5 py-2 font-medium text-bg disabled:opacity-50"
      >
        {loading ? 'Inspecting…' : 'Inspect'}
      </button>

      {err && <div className="mt-4 rounded-lg border border-critical p-3 text-critical">{err}</div>}
      {report ? (
        <pre className="mt-6 overflow-x-auto rounded-lg border border-border bg-black/40 p-4 text-xs">
          {JSON.stringify(report, null, 2)}
        </pre>
      ) : null}
    </main>
  );
}
