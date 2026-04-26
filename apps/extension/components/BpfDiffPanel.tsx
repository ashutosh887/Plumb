import type { BpfDiff } from '@plumb/core';

export function BpfDiffPanel({ diff }: { diff: BpfDiff }) {
  return (
    <div className="plumb-bpf">
      <div className="plumb-bpf-header">
        Bytecode diff — {diff.controlFlowChanges} control-flow change
        {diff.controlFlowChanges === 1 ? '' : 's'}
      </div>
      {diff.signerChecksRemoved.length > 0 && (
        <div className="plumb-bpf-section plumb-bpf-removed">
          <div className="plumb-bpf-label">Signer checks REMOVED</div>
          {diff.signerChecksRemoved.map((s) => (
            <code key={s} className="plumb-bpf-code plumb-bpf-removed-line">
              {s}
            </code>
          ))}
        </div>
      )}
      {diff.signerChecksAdded.length > 0 && (
        <div className="plumb-bpf-section plumb-bpf-added">
          <div className="plumb-bpf-label">Signer checks ADDED</div>
          {diff.signerChecksAdded.map((s) => (
            <code key={s} className="plumb-bpf-code plumb-bpf-added-line">
              {s}
            </code>
          ))}
        </div>
      )}
      <div className="plumb-bpf-hashes">
        <span>old <code>{diff.oldHash.slice(0, 12)}…</code></span>
        <span>new <code>{diff.newHash.slice(0, 12)}…</code></span>
      </div>
    </div>
  );
}
