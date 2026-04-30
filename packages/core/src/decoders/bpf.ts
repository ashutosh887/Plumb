import type { DecodedInstruction } from '../types.js';

export const BPF_LOADER_UPGRADEABLE = 'BPFLoaderUpgradeab1e11111111111111111111111';

const BPF_IX_NAMES: Record<number, string> = {
  0: 'initialize_buffer',
  1: 'write',
  2: 'deploy_with_max_data_len',
  3: 'upgrade',
  4: 'set_authority',
  5: 'close',
  6: 'extend_program',
  7: 'set_authority_checked',
};

const HIGH_RISK_IX = new Set(['upgrade', 'set_authority', 'set_authority_checked', 'close']);

export function isBpfLoaderUpgradeable(programId: string): boolean {
  return programId === BPF_LOADER_UPGRADEABLE;
}

export function isBpfUpgradeIx(ix: DecodedInstruction): boolean {
  return isBpfLoaderUpgradeable(ix.programId) && HIGH_RISK_IX.has(ix.ixName);
}

export function decodeBpfUpgradeIx(
  programId: string,
  data: Buffer,
  accounts: DecodedInstruction['accounts'],
): DecodedInstruction {
  const tag = data.readUInt32LE(0);
  const ixName = BPF_IX_NAMES[tag] ?? 'unknown';
  const plain =
    ixName === 'upgrade'
      ? 'Upgrades a deployed program by replacing its bytecode with the buffer account contents.'
      : ixName === 'set_authority' || ixName === 'set_authority_checked'
        ? 'Transfers control of a program to a new upgrade authority.'
        : `BPF loader instruction: ${ixName}.`;

  return {
    programId,
    programName: 'BPFLoaderUpgradeable',
    ixName,
    args: { tag },
    accounts,
    plainEnglish: plain,
  };
}
