import type { DecodedInstruction } from '../types.js';

export const SQUADS_V4_PROGRAM_ID = 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf';

export function isSquadsProgram(programId: string): boolean {
  return programId === SQUADS_V4_PROGRAM_ID;
}

const ADMIN_DISCRIMINATORS: Record<string, string> = {
  multisig_create_v2: 'creates a new Squads multisig',
  multisig_set_config: 'changes multisig configuration (threshold, timelock)',
  multisig_add_member: 'adds a member to the multisig',
  multisig_remove_member: 'removes a member from the multisig',
  multisig_change_threshold: 'changes the multisig signature threshold',
  config_transaction_create: 'queues a config transaction (admin action)',
  config_transaction_execute: 'EXECUTES a queued admin action — irreversible',
  vault_transaction_create: 'queues a vault transaction',
  vault_transaction_execute: 'executes a vault transaction',
  proposal_approve: 'approves a queued proposal',
  proposal_reject: 'rejects a queued proposal',
};

const ADMIN_ACTION_NAMES = new Set([
  'multisig_set_config',
  'multisig_add_member',
  'multisig_remove_member',
  'multisig_change_threshold',
  'config_transaction_create',
  'config_transaction_execute',
]);

export function decodeSquadsIx(
  programId: string,
  data: Buffer,
  accounts: DecodedInstruction['accounts'],
): DecodedInstruction {
  const ixName = guessSquadsIxName(data);
  const description = ADMIN_DISCRIMINATORS[ixName] ?? 'Squads V4 instruction';

  return {
    programId,
    programName: 'Squads V4',
    ixName,
    args: { discriminatorBytes: Array.from(data.subarray(0, 8)) },
    accounts,
    plainEnglish: `Squads V4: ${description}.`,
  };
}

export function isSquadsMultisigAdminAction(ix: DecodedInstruction): boolean {
  return isSquadsProgram(ix.programId) && ADMIN_ACTION_NAMES.has(ix.ixName);
}

function guessSquadsIxName(data: Buffer): string {
  if (data.length < 8) return 'unknown';
  // Anchor 8-byte discriminators. Stub: use first byte as a coarse heuristic for the demo.
  // Real impl: load Squads IDL discriminator → name table at startup.
  const tag = data[0];
  switch (tag) {
    case 0x00:
      return 'multisig_create_v2';
    case 0x01:
      return 'multisig_set_config';
    case 0x02:
      return 'multisig_add_member';
    case 0x03:
      return 'multisig_remove_member';
    case 0x04:
      return 'multisig_change_threshold';
    case 0x10:
      return 'config_transaction_create';
    case 0x11:
      return 'config_transaction_execute';
    case 0x20:
      return 'vault_transaction_create';
    case 0x21:
      return 'vault_transaction_execute';
    case 0x30:
      return 'proposal_approve';
    case 0x31:
      return 'proposal_reject';
    default:
      return 'unknown';
  }
}
