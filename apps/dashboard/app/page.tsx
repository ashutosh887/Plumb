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
    <div className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Logo />
        <div className="flex items-center gap-1">
          <Link
            href="/demo"
            className="hidden h-9 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            Demo
          </Link>
          <Link
            href="/inspect"
            className="hidden h-9 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            Inspect
          </Link>
          <a
            href="https://github.com/ashutosh887/plumb"
            aria-label="GitHub"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://chrome.google.com/webstore/detail/plumb"
            className="ml-2 inline-flex h-9 items-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Install
          </a>
        </div>
      </nav>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-[13px] font-bold text-background"
      >
        P
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Plumb</span>
    </Link>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.45.11-3.02 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.62 1.57.23 2.73.11 3.02.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.67.8.55C20.22 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
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
    <section className="relative pt-24 pb-28 text-center sm:pt-32 sm:pb-36">
      <span className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#14F195] opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#14F195]" />
        </span>
        Open-source · Solana Frontier 2026
      </span>

      <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-[80px]">
        See what you're <span className="italic text-muted-foreground">actually</span> signing.
      </h1>

      <p className="mx-auto mt-8 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
        Plain-English decoding for every Squads V4 approval — before you click.
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
      </div>

      <p className="mx-auto mt-10 max-w-md text-xs text-muted-foreground/70">
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
  const partners: {
    name: string;
    role: string;
    href: string;
    color: string;
  }[] = [
    {
      name: 'Squads V4',
      role: 'Multisig program',
      href: 'https://github.com/Squads-Protocol/v4',
      color: '#9945FF',
    },
    {
      name: 'Surfpool',
      role: 'Mainnet-fork simulation',
      href: 'https://docs.surfpool.run',
      color: '#22D3EE',
    },
    {
      name: 'Solana Attestation Service',
      role: 'Approval receipts',
      href: 'https://attest.solana.com',
      color: '#14F195',
    },
    {
      name: 'Helius',
      role: 'Dedicated RPC',
      href: 'https://www.helius.dev',
      color: '#F472B6',
    },
    {
      name: 'WXT',
      role: 'MV3 extension framework',
      href: 'https://wxt.dev',
      color: '#60A5FA',
    },
    {
      name: 'solana_rbpf',
      role: 'BPF disassembly',
      href: 'https://github.com/solana-labs/rbpf',
      color: '#94A3B8',
    },
  ];
  return (
    <section className="relative pb-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Built on
          </div>
          <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
            The Solana stack, end to end.
          </h2>
        </div>
        <a
          href="https://github.com/ashutosh887/plumb"
          className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          See the source →
        </a>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="group relative flex items-center gap-4 bg-background/80 px-6 py-5 transition-colors hover:bg-background"
          >
            <span
              aria-hidden
              className="relative inline-flex h-2 w-2 shrink-0 rounded-full"
              style={{
                background: p.color,
                boxShadow: `0 0 12px ${p.color}AA, 0 0 24px ${p.color}55`,
              }}
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.role}</div>
            </div>
            <span
              aria-hidden
              className="ml-auto text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
            >
              →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-border py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>© 2026 Plumb · Built for Solana Frontier · MIT licensed</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/demo" className="hover:text-foreground">
            Demo
          </Link>
          <Link href="/inspect" className="hover:text-foreground">
            Inspect
          </Link>
          <a href="https://x.com/plumb_so" className="hover:text-foreground">
            @plumb_so
          </a>
          <a
            href="https://github.com/ashutosh887/plumb"
            aria-label="GitHub"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <GitHubIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
