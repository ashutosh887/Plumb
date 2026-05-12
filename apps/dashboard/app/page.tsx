import Link from 'next/link';

const SAMPLE_BASE64 =
  'AQABBQfqJaJg3vT9rR4VFhdQa1Nf8PgYbZjK0Yk4mVQ3X5p2dT6yLnA8x4t8L5sQ' +
  'O3kHwq8AAAAAGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmAQECAwQABQYHCAk' +
  'KCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6' +
  'Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlq' +
  'a2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2OjwAAAAAAAAAAAAAA';

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />

      <Nav />

      <div className="relative mx-auto max-w-6xl px-6">
        <Hero />
        <BeforeAfter />
        <Features />
        <BuiltOn />
        <Footer />
      </div>
    </main>
  );
}

function Nav() {
  return (
    <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Signer-side security for Solana multisigs
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge>Solana Frontier 2026</Badge>
        <a
          href="https://github.com/ashutosh887/plumb"
          className="ml-2 inline-flex h-9 items-center rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-[15px] font-bold text-background">
        P
      </span>
      <span className="text-lg font-semibold tracking-tight">Plumb</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#14F195]" />
      {children}
    </span>
  );
}

function Hero() {
  return (
    <section className="relative pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
      <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
        </span>
        Drift incident
        <span className="text-foreground/40">·</span>
        <span>April 1, 2026</span>
        <span className="text-foreground/40">·</span>
        <span className="text-foreground">$285.3M drained</span>
      </div>

      <h1 className="font-serif text-6xl leading-[0.95] tracking-tight sm:text-7xl md:text-[88px]">
        The exploit wasn't a bug.
        <br />
        <span className="italic text-muted-foreground">It was a PDF.</span>
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
        Squads council members signed a base64 string they couldn't read. Plumb
        is the seatbelt every Solana signer puts on before they click Approve —
        a browser extension that decodes the transaction in plain English.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://chrome.google.com/webstore/detail/plumb"
          className="group inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90"
        >
          Install for Chrome
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </a>
        <Link
          href="/demo"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background/40 px-5 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-muted"
        >
          Watch the 90s demo
        </Link>
        <Link
          href="/inspect"
          className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Inspect any transaction →
        </Link>
      </div>

      <p className="mx-auto mt-12 max-w-md text-xs text-muted-foreground/70">
        Read-only at the signer interface. Plumb never modifies, signs, or
        co-signs a transaction.
      </p>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="relative pb-24">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          What a signer sees today / with Plumb
        </div>
        <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
          Opaque base64, decoded.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-glow relative overflow-hidden rounded-2xl border border-border bg-background/40 p-6 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Wallet popup, today
            </div>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
              Unreadable
            </span>
          </div>
          <div className="rounded-lg border border-border bg-black/30 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground/80">
            <span className="text-muted-foreground/50">Transaction (base64)</span>
            <div className="mt-2 break-all">
              {SAMPLE_BASE64}
              <span className="text-foreground/30">… (1,184 chars)</span>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button className="inline-flex h-9 cursor-default items-center rounded-md border border-border px-4 text-sm text-muted-foreground">
              Reject
            </button>
            <button className="inline-flex h-9 cursor-default items-center rounded-md bg-foreground px-4 text-sm font-medium text-background">
              Approve
            </button>
          </div>
        </div>

        <div className="ring-danger relative overflow-hidden rounded-2xl border border-border bg-background/40 p-6 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Plumb overlay
            </div>
            <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
              3 findings
            </span>
          </div>
          <ul className="space-y-2">
            <FindingRow
              level="danger"
              title="Durable nonce · 47-day replay window"
              detail="First instruction is AdvanceNonceAccount. Signature is valid until the nonce is consumed."
            />
            <FindingRow
              level="danger"
              title="Nonce owner mismatch"
              detail="Nonce authority does not match the multisig. Staged-account pattern."
            />
            <FindingRow
              level="warn"
              title="Multisig admin transfer"
              detail="config_transaction_execute — replaces members and threshold."
            />
          </ul>
          <div className="mt-5 flex gap-2">
            <button className="inline-flex h-9 cursor-default items-center rounded-md border border-destructive/40 bg-destructive/10 px-4 text-sm font-medium text-destructive">
              Reject in wallet
            </button>
            <button className="inline-flex h-9 cursor-default items-center rounded-md border border-border px-4 text-sm text-muted-foreground">
              Approve anyway
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FindingRow({
  level,
  title,
  detail,
}: {
  level: 'danger' | 'warn';
  title: string;
  detail: string;
}) {
  const dot = level === 'danger' ? 'bg-destructive' : 'bg-warning';
  return (
    <li className="rounded-lg border border-border bg-black/20 p-3">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
        </div>
      </div>
    </li>
  );
}

function Features() {
  const items = [
    {
      n: '01',
      title: 'Durable-nonce decoder',
      body: 'Surfaces the replay window in plain English. Flags owner-mismatched nonce accounts — the exact Drift staging pattern.',
    },
    {
      n: '02',
      title: 'State-projected simulation',
      body: 'Forks mainnet via Surfpool. Diffs account, balance, and authority changes against the state you expect.',
    },
    {
      n: '03',
      title: 'BPF bytecode diff',
      body: 'On program upgrades, disassembles old vs new program data. Highlights signer-check and authority-check changes.',
    },
  ];
  return (
    <section className="relative pb-24">
      <div className="mb-10 max-w-2xl">
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          What ships in the MVP
        </div>
        <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
          Three classes of finding. Nothing else.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.n}
            className="card-glow group relative overflow-hidden rounded-2xl border border-border bg-background/40 p-6 backdrop-blur transition-colors hover:border-foreground/20"
          >
            <div className="mb-6 font-serif text-3xl text-muted-foreground/60 transition-colors group-hover:text-foreground/80">
              {it.n}
            </div>
            <div className="mb-1.5 text-base font-medium">{it.title}</div>
            <div className="text-sm leading-relaxed text-muted-foreground">{it.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BuiltOn() {
  const partners = [
    'Squads V4',
    'Surfpool',
    'Solana Attestation Service',
    'Helius',
    'WXT',
    'solana_rbpf',
  ];
  return (
    <section className="relative pb-24">
      <div className="rounded-2xl border border-border bg-background/40 p-8 backdrop-blur sm:p-10">
        <div className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Built on
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 md:grid-cols-6">
          {partners.map((p) => (
            <div
              key={p}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-border py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-muted-foreground/70">·</span>
          <span>Built for Solana Frontier · Colosseum 2026</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="https://github.com/ashutosh887/plumb" className="hover:text-foreground">
            GitHub
          </a>
          <Link href="/inspect" className="hover:text-foreground">
            Inspect
          </Link>
          <Link href="/demo" className="hover:text-foreground">
            Demo
          </Link>
          <a href="https://x.com/plumb_so" className="hover:text-foreground">
            @plumb_so
          </a>
        </div>
      </div>
    </footer>
  );
}
