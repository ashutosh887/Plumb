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
  {
    id: 'drift',
    path: '/fixtures/drift_admin_transfer.json',
    title: 'Drift-class durable-nonce admin transfer',
  },
  { id: 'clean', path: '/fixtures/clean_vault_transfer.json', title: 'Clean Squads vault transfer' },
];

export default function DemoPage() {
  const [active, setActive] = useState<string>('drift');
  const [fixtures, setFixtures] = useState<Record<string, Fixture>>({});

  useEffect(() => {
    Promise.all(
      FIXTURES.map(
        async (f) => [f.id, (await fetch(f.path).then((r) => r.json())) as Fixture] as const,
      ),
    ).then((entries) => setFixtures(Object.fromEntries(entries)));
  }, []);

  const current = fixtures[active];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Plumb demo harness</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Synthetic Squads-like approval surface. The extension content script reads the base64
          from <code className="font-mono text-xs">#plumb-debug-tx</code> and renders the overlay
          on top of this page.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {FIXTURES.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={
              active === f.id
                ? 'rounded-md border border-foreground bg-muted px-3 py-2 text-sm'
                : 'rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted'
            }
          >
            {f.title}
          </button>
        ))}
      </div>

      {current ? (
        <SquadsLikeApprovalCard fixture={current} />
      ) : (
        <div className="rounded-md border border-border p-6 text-sm text-muted-foreground">
          Loading fixture…
        </div>
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

      <div className="rounded-lg border border-border p-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Squads V4 Approval
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{fixture.label}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{fixture.narrative}</p>

        <div className="mt-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Transaction (base64)
          </div>
          <div className="rounded-md border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {truncated}
            <span className="text-foreground/60">… ({fixture.tx_base64.length} chars)</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm hover:bg-muted">
            Reject
          </button>
          <button className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Approve
          </button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Expected Plumb findings:{' '}
          {fixture.expected_findings.length === 0 ? (
            <em>none — this is the clean-state fixture</em>
          ) : (
            fixture.expected_findings.map((f, i) => (
              <span key={f}>
                <code className="font-mono">{f}</code>
                {i < fixture.expected_findings.length - 1 ? ', ' : ''}
              </span>
            ))
          )}
        </p>
      </div>
    </>
  );
}
