import { VersionedTransaction, SystemProgram, PublicKey, Connection } from '@solana/web3.js';
import type { NonceInfo } from '../types.js';

const SYSTEM_PROGRAM_ID = SystemProgram.programId.toBase58();
const ADVANCE_NONCE_DISCRIMINATOR = 4; // u32 LE; first ix in nonce-using tx

export interface DetectNonceOptions {
  connection?: Connection;
  expectedNonceAuthority?: string;
  noncePreFetchedOwner?: string; // bypass RPC for tests/demos: pass the owner pubkey directly
  approvalSlot?: number;
  observedSlot?: number;
}

const SLOTS_PER_DAY = 216_000;
const DEFAULT_REPLAY_WINDOW_DAYS = 47;

export async function detectDurableNonce(
  txBase64: string,
  options: DetectNonceOptions = {},
): Promise<NonceInfo> {
  const tx = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
  const message = tx.message;
  const accountKeys = message.staticAccountKeys.map((k) => k.toBase58());

  const firstIx = message.compiledInstructions[0];
  if (!firstIx) {
    return { isDurableNonce: false, ownerMatchesExpected: true };
  }
  const programId = accountKeys[firstIx.programIdIndex];
  if (programId !== SYSTEM_PROGRAM_ID) {
    return { isDurableNonce: false, ownerMatchesExpected: true };
  }
  const data = Buffer.from(firstIx.data);
  if (data.length < 4 || data.readUInt32LE(0) !== ADVANCE_NONCE_DISCRIMINATOR) {
    return { isDurableNonce: false, ownerMatchesExpected: true };
  }

  const noncePubkey = accountKeys[firstIx.accountKeyIndexes[0] ?? -1];
  const nonceAuthority = accountKeys[firstIx.accountKeyIndexes[2] ?? -1];

  let nonceAccountOwner: string | undefined = options.noncePreFetchedOwner;
  let ownerMatchesExpected = true;

  if (!nonceAccountOwner && options.connection && noncePubkey) {
    const acct = await options.connection.getAccountInfo(new PublicKey(noncePubkey));
    nonceAccountOwner = acct?.owner.toBase58();
  }
  if (nonceAccountOwner && nonceAccountOwner !== SYSTEM_PROGRAM_ID) {
    ownerMatchesExpected = false;
  }

  let estimatedReplayWindowDays: number;
  if (options.approvalSlot !== undefined && options.observedSlot !== undefined) {
    const slotDelta = Math.max(0, options.observedSlot - options.approvalSlot);
    estimatedReplayWindowDays = +(slotDelta / SLOTS_PER_DAY).toFixed(1);
  } else {
    estimatedReplayWindowDays = DEFAULT_REPLAY_WINDOW_DAYS;
  }

  const result: NonceInfo = {
    isDurableNonce: true,
    ownerMatchesExpected,
    blockhash: message.recentBlockhash, // recentBlockhash on VersionedMessage is a base58 string
    estimatedReplayWindowDays,
  };
  if (noncePubkey) result.noncePubkey = noncePubkey;
  if (nonceAuthority) result.nonceAuthority = nonceAuthority;
  if (nonceAccountOwner) result.nonceAccountOwner = nonceAccountOwner;
  return result;
}
