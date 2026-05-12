import { defineBackground } from 'wxt/sandbox';
import { inspectInline } from '../lib/inspect';
import { buildAttestation, type AttestationResult, type ReceiptInput } from '../lib/attest';
import type { BpfDiff, SimResult } from '@plumb/core';

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'plumb/inspect') {
      void inspect(message.txBase64, message.meta).then(sendResponse);
      return true;
    }
    if (message?.type === 'plumb/attest') {
      void attest(message.input).then(sendResponse);
      return true;
    }
    return false;
  });
});

interface IncomingMeta {
  nonceAccountOwnerOverride?: string;
  bpfDiff?: BpfDiff;
  sim?: SimResult;
}

async function inspect(txBase64: string, meta?: IncomingMeta) {
  try {
    const report = await inspectInline(meta ? { txBase64, meta } : { txBase64 });
    return { ok: true, report };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

async function attest(input: ReceiptInput): Promise<{ ok: true; result: AttestationResult } | { ok: false; error: string }> {
  try {
    const result = await buildAttestation(input);
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
