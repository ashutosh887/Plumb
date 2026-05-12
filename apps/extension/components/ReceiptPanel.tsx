import type { AttestationResult } from '../lib/attest';

export function ReceiptPanel({ result }: { result: AttestationResult }) {
  return (
    <div className="plumb-receipt">
      <div className="plumb-receipt-header">
        <span>Attestation receipt</span>
        <span className="plumb-receipt-badge">
          {result.onChain ? 'on-chain · devnet' : 'local · airdrop unavailable'}
        </span>
      </div>

      <div className="plumb-receipt-row">
        <span className="plumb-receipt-label">verdict</span>
        <span className="plumb-receipt-value">{result.receipt.verdict}</span>
      </div>
      <div className="plumb-receipt-row">
        <span className="plumb-receipt-label">issuer</span>
        <code className="plumb-receipt-mono">{shorten(result.issuerPubkey)}</code>
      </div>
      <div className="plumb-receipt-row">
        <span className="plumb-receipt-label">signature</span>
        <code className="plumb-receipt-mono">{shorten(result.signature)}</code>
      </div>
      <div className="plumb-receipt-row">
        <span className="plumb-receipt-label">tx_hash</span>
        <code className="plumb-receipt-mono">{shorten(result.receipt.tx_hash)}</code>
      </div>
      <div className="plumb-receipt-row">
        <span className="plumb-receipt-label">sim_hash</span>
        <code className="plumb-receipt-mono">{shorten(result.receipt.sim_hash)}</code>
      </div>
      <div className="plumb-receipt-row">
        <span className="plumb-receipt-label">flags</span>
        <span className="plumb-receipt-flags">
          {result.receipt.risk_flags.length === 0 ? 'none' : result.receipt.risk_flags.join(', ')}
        </span>
      </div>

      {result.explorerUrl && (
        <a
          href={result.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="plumb-receipt-link"
        >
          View on Solana Explorer →
        </a>
      )}
      {!result.onChain && result.fallbackReason && (
        <div className="plumb-receipt-note">
          On-chain mint failed: {result.fallbackReason}. Receipt signed locally; rerun on a funded
          devnet to leave a chain trail.
        </div>
      )}
    </div>
  );
}

function shorten(s: string): string {
  if (s.length <= 16) return s;
  return `${s.slice(0, 8)}…${s.slice(-6)}`;
}
