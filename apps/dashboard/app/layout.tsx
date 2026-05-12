import './globals.css';
import type { Metadata } from 'next';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Plumb — Signer-side security for Solana multisigs',
  description:
    'Plumb decodes Squads V4 approvals before you sign. Catches durable-nonce replays, multisig admin actions, and bytecode authority changes.',
  openGraph: {
    title: 'Plumb',
    description: 'Signer-side security for Solana multisigs.',
    url: 'https://plumb.so',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
