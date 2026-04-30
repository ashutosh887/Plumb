import { SystemProgram } from '@solana/web3.js';
import type { DecodedInstruction } from '../types.js';

export const SYSTEM_PROGRAM_ID = SystemProgram.programId.toBase58();

const SYSTEM_IX_NAMES: Record<number, string> = {
  0: 'create_account',
  1: 'assign',
  2: 'transfer',
  3: 'create_account_with_seed',
  4: 'advance_nonce_account',
  5: 'withdraw_nonce_account',
  6: 'initialize_nonce_account',
  7: 'authorize_nonce_account',
  8: 'allocate',
  9: 'allocate_with_seed',
  10: 'assign_with_seed',
  11: 'transfer_with_seed',
  12: 'upgrade_nonce_account',
};

export function isSystemProgram(programId: string): boolean {
  return programId === SYSTEM_PROGRAM_ID;
}

export function decodeSystemIx(
  programId: string,
  data: Buffer,
  accounts: DecodedInstruction['accounts'],
): DecodedInstruction {
  const tag = data.length >= 4 ? data.readUInt32LE(0) : -1;
  const ixName = SYSTEM_IX_NAMES[tag] ?? 'unknown';
  return {
    programId,
    programName: 'System',
    ixName,
    args: { tag },
    accounts,
    plainEnglish: `System program: ${ixName.replace(/_/g, ' ')}.`,
  };
}
