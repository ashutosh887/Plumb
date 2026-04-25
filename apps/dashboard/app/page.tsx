import Link from 'next/link';

export default function Landing() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <header className="mb-16">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold tracking-tight">Plumb</span>
          <span className="text-sm text-muted">Signer-side security for Solana multisigs.</span>
        </div>
      </header>

      <section className="mb-12">
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">
          The exploit wasn't a bug.
          <br />
          <span className="text-muted">It was a PDF.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          On April 1, 2026, attackers drained $285M from Drift by getting council members to sign a
          base64 string they couldn't read. Plumb is the seatbelt every Solana signer puts on
          before they click Approve.
        </p>
        <div className="mt-8 flex gap-3">
          <a
            href="https://chrome.google.com/webstore/detail/plumb"
            className="rounded-lg bg-accent px-5 py-3 font-medium text-bg"
          >
            Install for Chrome
          </a>
          <Link
            href="/inspect"
            className="rounded-lg border border-border px-5 py-3 font-medium text-fg hover:bg-border"
          >
            Live inspector
          </Link>
        </div>
      </section>

      <section className="mb-12 grid gap-4 md:grid-cols-3">
        <Card title="Durable-nonce decoder" body="Surfaces the replay window. Flags owner-mismatched nonce accounts. The exact Drift attack vector." />
        <Card title="State-projected sim" body="Forks mainnet via Surfpool. Diffs account, balance, and authority changes in plain English." />
        <Card title="BPF bytecode diff" body="Disassembles old vs new program data on upgrades. Highlights signer-check downgrades." />
      </section>

      <section className="border-t border-border pt-12">
        <h2 className="mb-4 text-xl font-semibold">Built on</h2>
        <p className="text-muted">
          Squads V4 · Surfpool · Solana Attestation Service · Helius · WXT
        </p>
      </section>

      <footer className="mt-20 border-t border-border pt-6 text-sm text-muted">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="https://github.com/ashutosh887/plumb" className="hover:text-fg">GitHub</a>
          <Link href="/inspect" className="hover:text-fg">Inspect a tx</Link>
          <a href="https://x.com/plumb_so" className="hover:text-fg">@plumb_so</a>
          <span>Built for Solana Frontier · Colosseum 2026</span>
        </div>
      </footer>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="mb-2 font-semibold">{title}</div>
      <div className="text-sm text-muted">{body}</div>
    </div>
  );
}
