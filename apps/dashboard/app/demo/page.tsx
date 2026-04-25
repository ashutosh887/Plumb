'use client';

import { useEffect, useMemo, useState } from 'react';

type Fixture = {
  label: string;
  narrative: string;
  tx_base64: string;
  expected_findings: string[];
  meta?: Record<string, unknown>;
};

const FIXTURES: { id: string; path: string; title: string }[] = [
  { id: 'drift', path: '/fixtures/drift_admin_transfer.json', title: 'Drift-class durable-nonce admin transfer' },
  { id: 'clean', path: '/fixtures/clean_vault_transfer.json', title: 'Clean Squads vault transfer' },
];

export default function DemoPage() {
  const [active, setActive] = useState<string>('drift');
  const [fixtures, setFixtures] = useState<Record<string, Fixture>>({});

  useEffect(() => {
    Promise.all(
      FIXTURES.map(async (f) => [f.id, (await fetch(f.path).then((r) => r.json())) as Fixture] as const),
    ).then((entries) => setFixtures(Object.fromEntries(entries)));
  }, []);

  const current = fixtures[active];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Plumb demo harness</h1>
        <p className="mt-2 text-sm text-muted">
          Synthetic Squads-like approval surface. The extension content script reads the
          base64 from <code>#plumb-debug-tx</code> and renders the overlay on top of this page.
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        {FIXTURES.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              active === f.id ? 'border-accent bg-accent/10' : 'border-border'
            }`}
          >
            {f.title}
          </button>
        ))}
      </div>

      {current ? (
        <SquadsLikeApprovalCard fixture={current} />
      ) : (
        <div className="rounded-lg border border-border p-6 text-muted">Loading fixture…</div>
      )}
    </main>
  );
}

function SquadsLikeApprovalCard({ fixture }: { fixture: Fixture }) {
  const truncated = useMemo(() => fixture.tx_base64.slice(0, 240), [fixture.tx_base64]);

  return (
    <>
      <div
        id="plumb-debug-tx"
        data-tx={fixture.tx_base64}
        data-meta={JSON.stringify(fixture.meta ?? {})}
        style={{ display: 'none' }}
      />

      <div className="rounded-2xl border border-border bg-black/40 p-6">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted">Squads V4 Approval</div>
        <h2 className="text-xl font-semibold">{fixture.label}</h2>
        <p className="mt-2 text-sm text-muted">{fixture.narrative}</p>

        <div className="mt-6">
          <div className="mb-1 text-xs uppercase tracking-wider text-muted">Transaction (base64)</div>
          <div className="rounded-lg border border-border bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-muted">
            {truncated}
            <span className="text-fg/60">… ({fixture.tx_base64.length} chars)</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="rounded-lg border border-border px-4 py-2 text-sm">Reject</button>
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg">
            Approve
          </button>
        </div>

        <p className="mt-4 text-xs text-muted">
          Expected Plumb findings:{' '}
          {fixture.expected_findings.length === 0 ? (
            <em>none — this is the clean-state fixture</em>
          ) : (
            fixture.expected_findings.map((f, i) => (
              <span key={f}>
                <code>{f}</code>
                {i < fixture.expected_findings.length - 1 ? ', ' : ''}
              </span>
            ))
          )}
        </p>
      </div>
    </>
  );
}
