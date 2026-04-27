"""Mirror of @plumb/core/risk in Python — same rules, same titles.

When updating one, update the other. They're tested in parallel against the same
fixture set (see fixtures/ at repo root).
"""
from __future__ import annotations

from ..schemas import (
    BpfDiff,
    DecodedInstruction,
    NonceInfo,
    RiskFinding,
    SimResult,
)

_SQUADS_ADMIN_ACTIONS = {
    "multisig_set_config",
    "multisig_add_member",
    "multisig_remove_member",
    "multisig_change_threshold",
    "config_transaction_create",
    "config_transaction_execute",
}

_BPF_HIGH_RISK = {"upgrade", "set_authority", "set_authority_checked", "close"}


def assess(
    *,
    decoded: list[DecodedInstruction],
    nonce: NonceInfo,
    sim: SimResult | None,
    bpf_diff: BpfDiff | None,
) -> list[RiskFinding]:
    findings: list[RiskFinding] = []

    if nonce.is_durable_nonce:
        findings.append(
            RiskFinding(
                id="durable-nonce",
                severity="critical",
                title=f"Durable nonce — replay window {nonce.estimated_replay_window_days or '?'} days",
                detail=(
                    "This transaction uses a durable nonce. Once you sign, it can be triggered "
                    "hours, days, or weeks later — silently. This is the exact mechanism behind "
                    "the April 1 2026 Drift exploit."
                ),
                evidence={
                    "noncePubkey": nonce.nonce_pubkey,
                    "blockhash": nonce.blockhash,
                },
            )
        )
        if not nonce.owner_matches_expected:
            findings.append(
                RiskFinding(
                    id="nonce-owner-mismatch",
                    severity="critical",
                    title="Owner mismatch on nonce account",
                    detail=(
                        f"The nonce account is owned by `{nonce.nonce_account_owner}` instead of "
                        f"the System Program. This is anomalous and consistent with attacker-staged "
                        f"nonce accounts."
                    ),
                )
            )

    for ix in decoded:
        if ix.program_id == "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf" and ix.ix_name in _SQUADS_ADMIN_ACTIONS:
            findings.append(
                RiskFinding(
                    id=f"multisig-admin-{ix.ix_name}",
                    severity="critical",
                    title="Multisig admin action queued",
                    detail=(
                        f"`{ix.ix_name}` modifies the multisig itself (members, threshold, or vault "
                        f"transfer). Verify every account against the team's source of truth before signing."
                    ),
                    evidence={"accounts": [a.pubkey for a in ix.accounts]},
                )
            )
        if ix.program_id == "BPFLoaderUpgradeab1e11111111111111111111111" and ix.ix_name in _BPF_HIGH_RISK:
            findings.append(
                RiskFinding(
                    id=f"bpf-{ix.ix_name}",
                    severity="critical" if ix.ix_name == "upgrade" else "warn",
                    title=(
                        "Program upgrade — bytecode change"
                        if ix.ix_name == "upgrade"
                        else "Program authority change"
                    ),
                    detail=(
                        "Bytecode or authority changes can hide signer-check downgrades. "
                        "Inspect the BPF diff before approving."
                    ),
                )
            )

    if sim:
        for change in sim.authority_changes:
            findings.append(
                RiskFinding(
                    id=f"authority-change-{change.field}",
                    severity="critical",
                    title=f"Authority change: {change.field}",
                    detail=f"`{change.field}` will change from `{change.before}` to `{change.after}`.",
                )
            )

    if bpf_diff:
        if bpf_diff.signer_checks_removed:
            findings.append(
                RiskFinding(
                    id="signer-check-removed",
                    severity="critical",
                    title="Signer check removed in upgraded bytecode",
                    detail=(
                        f"The new program removes signer requirements: "
                        f"{', '.join(bpf_diff.signer_checks_removed)}. "
                        f"This is a classic governance bypass pattern."
                    ),
                )
            )
        if bpf_diff.authority_checks_removed:
            findings.append(
                RiskFinding(
                    id="authority-check-removed",
                    severity="critical",
                    title="Authority check removed in upgraded bytecode",
                    detail=f"Removed authority checks: {', '.join(bpf_diff.authority_checks_removed)}.",
                )
            )

    return findings
