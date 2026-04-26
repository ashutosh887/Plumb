import { defineBackground } from 'wxt/sandbox';
import { inspectInline } from '../lib/inspect';
import type { BpfDiff } from '@plumb/core';

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'plumb/inspect') {
      void inspect(message.txBase64, message.meta).then(sendResponse);
      return true; // keep channel open for async sendResponse
    }
    return false;
  });
});

interface IncomingMeta {
  nonceAccountOwnerOverride?: string;
  bpfDiff?: BpfDiff;
}

async function inspect(txBase64: string, meta?: IncomingMeta) {
  try {
    const report = await inspectInline(meta ? { txBase64, meta } : { txBase64 });
    return { ok: true, report };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
