import { VersionedTransaction } from '@solana/web3.js';
import type { VersionedMessage, MessageCompiledInstruction } from '@solana/web3.js';
import bs58 from 'bs58';
import type { DecodedInstruction } from '../types.js';
import { decodeSquadsIx, isSquadsProgram } from './squads.js';
import { decodeBpfUpgradeIx, isBpfLoaderUpgradeable } from './bpf.js';
import { decodeSystemIx, isSystemProgram } from './system.js';

export async function decodeTransaction(txBase64: string): Promise<DecodedInstruction[]> {
  const tx = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
  const message = tx.message;
  const accountKeys = message.staticAccountKeys.map((k) => k.toBase58());

  const decoded: DecodedInstruction[] = [];
  for (const compiled of message.compiledInstructions) {
    decoded.push(decodeOne(compiled, accountKeys, message));
  }
  return decoded;
}

function decodeOne(
  ix: MessageCompiledInstruction,
  accountKeys: string[],
  message: VersionedMessage,
): DecodedInstruction {
  const programId = accountKeys[ix.programIdIndex];
  if (!programId) throw new Error('programId index out of range');

  const accounts = ix.accountKeyIndexes.map((idx) => {
    const pubkey = accountKeys[idx];
    if (!pubkey) throw new Error(`account index ${idx} out of range`);
    return {
      pubkey,
      role: 'account',
      isSigner: idx < message.header.numRequiredSignatures,
      isWritable: isWritableIndex(idx, message),
    };
  });

  const data = Buffer.from(ix.data);

  if (isSquadsProgram(programId)) {
    return decodeSquadsIx(programId, data, accounts);
  }
  if (isBpfLoaderUpgradeable(programId)) {
    return decodeBpfUpgradeIx(programId, data, accounts);
  }
  if (isSystemProgram(programId)) {
    return decodeSystemIx(programId, data, accounts);
  }

  return {
    programId,
    programName: 'Unknown',
    ixName: 'unknown',
    args: { dataBase58: bs58.encode(data) },
    accounts,
    plainEnglish: `Calls program \`${programId}\` with ${data.length} bytes of opaque data.`,
  };
}

function isWritableIndex(idx: number, message: VersionedMessage): boolean {
  const { numRequiredSignatures, numReadonlySignedAccounts, numReadonlyUnsignedAccounts } =
    message.header;
  const numAccounts = message.staticAccountKeys.length;
  if (idx < numRequiredSignatures) {
    return idx < numRequiredSignatures - numReadonlySignedAccounts;
  }
  return idx < numAccounts - numReadonlyUnsignedAccounts;
}
