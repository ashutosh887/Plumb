export type Severity = 'info' | 'warn' | 'critical';

export interface RiskFinding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  evidence?: Record<string, unknown>;
}

export interface DecodedInstruction {
  programId: string;
  programName: string;
  ixName: string;
  args: Record<string, unknown>;
  accounts: Array<{ pubkey: string; role: string; isSigner: boolean; isWritable: boolean }>;
  plainEnglish: string;
}

export interface NonceInfo {
  isDurableNonce: boolean;
  noncePubkey?: string;
  nonceAuthority?: string;
  nonceAccountOwner?: string;
  ownerMatchesExpected: boolean;
  blockhash?: string;
  estimatedReplayWindowDays?: number;
}

export interface SimResult {
  ok: boolean;
  logs: string[];
  unitsConsumed: number;
  accountChanges: Array<{
    pubkey: string;
    lamportsBefore: number;
    lamportsAfter: number;
    dataLenBefore: number;
    dataLenAfter: number;
    ownerBefore: string;
    ownerAfter: string;
  }>;
  authorityChanges: Array<{
    pubkey: string;
    field: 'mintAuthority' | 'freezeAuthority' | 'upgradeAuthority' | 'multisigThreshold' | 'multisigMembers';
    before: string;
    after: string;
  }>;
}

export interface BpfDiff {
  ok: boolean;
  oldHash: string;
  newHash: string;
  controlFlowChanges: number;
  signerChecksRemoved: string[];
  signerChecksAdded: string[];
  authorityChecksRemoved: string[];
  authorityChecksAdded: string[];
  diff: Array<{ kind: 'added' | 'removed' | 'changed'; oldLine?: string; newLine?: string; lineNo: number }>;
  oldSource?: string;
  newSource?: string;
}

export interface InspectionReport {
  txBase64: string;
  decoded: DecodedInstruction[];
  nonce: NonceInfo;
  sim: SimResult | null;
  bpfDiff: BpfDiff | null;
  findings: RiskFinding[];
  generatedAt: string;
}
