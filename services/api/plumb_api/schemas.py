from typing import Literal, Optional
from pydantic import BaseModel, Field

Severity = Literal["info", "warn", "critical"]


class RiskFinding(BaseModel):
    id: str
    severity: Severity
    title: str
    detail: str
    evidence: dict | None = None


class Account(BaseModel):
    pubkey: str
    role: str
    is_signer: bool = Field(serialization_alias="isSigner")
    is_writable: bool = Field(serialization_alias="isWritable")


class DecodedInstruction(BaseModel):
    program_id: str = Field(serialization_alias="programId")
    program_name: str = Field(serialization_alias="programName")
    ix_name: str = Field(serialization_alias="ixName")
    args: dict
    accounts: list[Account]
    plain_english: str = Field(serialization_alias="plainEnglish")


class NonceInfo(BaseModel):
    is_durable_nonce: bool = Field(serialization_alias="isDurableNonce")
    nonce_pubkey: Optional[str] = Field(default=None, serialization_alias="noncePubkey")
    nonce_authority: Optional[str] = Field(default=None, serialization_alias="nonceAuthority")
    nonce_account_owner: Optional[str] = Field(default=None, serialization_alias="nonceAccountOwner")
    owner_matches_expected: bool = Field(serialization_alias="ownerMatchesExpected")
    blockhash: Optional[str] = None
    estimated_replay_window_days: Optional[float] = Field(
        default=None, serialization_alias="estimatedReplayWindowDays"
    )


class AccountChange(BaseModel):
    pubkey: str
    lamports_before: int = Field(serialization_alias="lamportsBefore")
    lamports_after: int = Field(serialization_alias="lamportsAfter")
    data_len_before: int = Field(serialization_alias="dataLenBefore")
    data_len_after: int = Field(serialization_alias="dataLenAfter")
    owner_before: str = Field(serialization_alias="ownerBefore")
    owner_after: str = Field(serialization_alias="ownerAfter")


class AuthorityChange(BaseModel):
    pubkey: str
    field: Literal[
        "mintAuthority",
        "freezeAuthority",
        "upgradeAuthority",
        "multisigThreshold",
        "multisigMembers",
    ]
    before: str
    after: str


class SimResult(BaseModel):
    ok: bool
    logs: list[str]
    units_consumed: int = Field(serialization_alias="unitsConsumed")
    account_changes: list[AccountChange] = Field(serialization_alias="accountChanges")
    authority_changes: list[AuthorityChange] = Field(serialization_alias="authorityChanges")


class DiffLine(BaseModel):
    kind: Literal["added", "removed", "changed"]
    old_line: Optional[str] = Field(default=None, serialization_alias="oldLine")
    new_line: Optional[str] = Field(default=None, serialization_alias="newLine")
    line_no: int = Field(serialization_alias="lineNo")


class BpfDiff(BaseModel):
    ok: bool
    old_hash: str = Field(serialization_alias="oldHash")
    new_hash: str = Field(serialization_alias="newHash")
    control_flow_changes: int = Field(serialization_alias="controlFlowChanges")
    signer_checks_removed: list[str] = Field(serialization_alias="signerChecksRemoved")
    signer_checks_added: list[str] = Field(serialization_alias="signerChecksAdded")
    authority_checks_removed: list[str] = Field(serialization_alias="authorityChecksRemoved")
    authority_checks_added: list[str] = Field(serialization_alias="authorityChecksAdded")
    diff: list[DiffLine]


class BpfDiffRequest(BaseModel):
    old_program_data: str
    new_program_data: str


class InspectRequest(BaseModel):
    tx: str
    expected_nonce_authority: Optional[str] = None
    nonce_account_owner_override: Optional[str] = None
    run_simulation: bool = True
    bpf_diff: Optional[BpfDiffRequest] = None


class InspectionReport(BaseModel):
    tx_base64: str = Field(serialization_alias="txBase64")
    decoded: list[DecodedInstruction]
    nonce: NonceInfo
    sim: Optional[SimResult]
    bpf_diff: Optional[BpfDiff] = Field(default=None, serialization_alias="bpfDiff")
    findings: list[RiskFinding]
    generated_at: str = Field(serialization_alias="generatedAt")

    model_config = {"populate_by_name": True}
