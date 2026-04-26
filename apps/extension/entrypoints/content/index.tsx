import { defineContentScript } from 'wxt/sandbox';
import { createRoot } from 'react-dom/client';
import { PlumbOverlay } from '../../components/PlumbOverlay';
import '../../components/overlay.css';

export default defineContentScript({
  matches: [
    'https://app.squads.so/*',
    'https://devnet.squads.so/*',
    'http://localhost:3000/*', // demo harness
  ],
  main() {
    mountOverlay();
    watchForApprovalContext();
  },
});

function mountOverlay() {
  const host = document.createElement('div');
  host.id = 'plumb-overlay-root';
  document.body.appendChild(host);
  createRoot(host).render(<PlumbOverlay />);
}

function watchForApprovalContext() {
  // Strategy:
  // - On real Squads pages: hook the wallet adapter signRequest pathway (Day 3-5 work).
  // - On the demo harness (localhost:3000/demo): poll for #plumb-debug-tx, which the
  //   page mounts with the fixture base64.
  //
  // Both paths converge on the same CustomEvent ('plumb:tx') which PlumbOverlay listens to.
  const interval = setInterval(() => {
    const debugEl = document.getElementById('plumb-debug-tx') as HTMLElement | null;
    if (debugEl?.dataset.tx) {
      let meta: Record<string, unknown> = {};
      try {
        meta = debugEl.dataset.meta ? JSON.parse(debugEl.dataset.meta) : {};
      } catch {
        // bad JSON in demo fixture — ignore, proceed without meta
      }
      window.dispatchEvent(
        new CustomEvent('plumb:tx', { detail: { tx: debugEl.dataset.tx, meta } }),
      );
      clearInterval(interval);
    }
  }, 250);
}
