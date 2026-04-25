import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
