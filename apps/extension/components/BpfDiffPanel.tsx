import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import type { BpfDiff } from '@plumb/core';

const PLACEHOLDER_OLD = '// old program source unavailable\n';
const PLACEHOLDER_NEW = '// new program source unavailable\n';

const DIFF_STYLES = {
  variables: {
    dark: {
      diffViewerBackground: 'hsl(240 10% 3.9%)',
      diffViewerColor: 'hsl(0 0% 98%)',
      addedBackground: 'hsl(0 0% 98% / 0.05)',
      addedColor: 'hsl(0 0% 98%)',
      removedBackground: 'hsl(0 72% 51% / 0.12)',
      removedColor: 'hsl(0 0% 98%)',
      wordAddedBackground: 'hsl(0 0% 98% / 0.18)',
      wordRemovedBackground: 'hsl(0 72% 51% / 0.32)',
      addedGutterBackground: 'hsl(0 0% 98% / 0.08)',
      removedGutterBackground: 'hsl(0 72% 51% / 0.18)',
      gutterBackground: 'hsl(240 10% 3.9%)',
      gutterBackgroundDark: 'hsl(240 10% 3.9%)',
      highlightBackground: 'hsl(240 3.7% 15.9% / 0.5)',
      highlightGutterBackground: 'hsl(240 3.7% 15.9% / 0.5)',
      codeFoldGutterBackground: 'hsl(240 10% 3.9%)',
      codeFoldBackground: 'hsl(240 10% 3.9%)',
      emptyLineBackground: 'hsl(240 10% 3.9%)',
      gutterColor: 'hsl(240 5% 64.9%)',
      addedGutterColor: 'hsl(0 0% 98%)',
      removedGutterColor: 'hsl(0 0% 98%)',
      codeFoldContentColor: 'hsl(240 5% 64.9%)',
      diffViewerTitleBackground: 'hsl(240 10% 3.9%)',
      diffViewerTitleColor: 'hsl(240 5% 64.9%)',
      diffViewerTitleBorderColor: 'hsl(240 3.7% 15.9%)',
    },
  },
  contentText: {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: '11px',
    lineHeight: '1.5',
  },
  gutter: {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: '10px',
    minWidth: '24px',
    padding: '0 6px',
  },
  marker: { padding: '0 4px' },
  diffContainer: { borderRadius: '6px', border: '1px solid hsl(240 3.7% 15.9%)' },
  titleBlock: {
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    fontSize: '11px',
    fontWeight: 500,
  },
};

export function BpfDiffPanel({ diff }: { diff: BpfDiff }) {
  const oldSource = diff.oldSource ?? PLACEHOLDER_OLD;
  const newSource = diff.newSource ?? PLACEHOLDER_NEW;

  return (
    <div className="plumb-bpf">
      <div className="plumb-bpf-header">
        Bytecode diff — {diff.controlFlowChanges} control-flow change
        {diff.controlFlowChanges === 1 ? '' : 's'}
      </div>

      <ReactDiffViewer
        oldValue={oldSource}
        newValue={newSource}
        splitView
        useDarkTheme
        compareMethod={DiffMethod.WORDS}
        leftTitle="deployed"
        rightTitle="proposed upgrade"
        showDiffOnly={false}
        styles={DIFF_STYLES}
      />

      {diff.signerChecksRemoved.length > 0 && (
        <div className="plumb-bpf-section plumb-bpf-removed">
          <div className="plumb-bpf-label">Signer checks removed</div>
          {diff.signerChecksRemoved.map((s) => (
            <code key={s} className="plumb-bpf-code plumb-bpf-removed-line">
              {s}
            </code>
          ))}
        </div>
      )}
      {diff.authorityChecksRemoved.length > 0 && (
        <div className="plumb-bpf-section plumb-bpf-removed">
          <div className="plumb-bpf-label">Authority checks removed</div>
          {diff.authorityChecksRemoved.map((s) => (
            <code key={s} className="plumb-bpf-code plumb-bpf-removed-line">
              {s}
            </code>
          ))}
        </div>
      )}

      <div className="plumb-bpf-hashes">
        <span>
          old <code>{diff.oldHash.slice(0, 12)}…</code>
        </span>
        <span>
          new <code>{diff.newHash.slice(0, 12)}…</code>
        </span>
      </div>
    </div>
  );
}
