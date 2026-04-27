"""Transaction decoding via solders.

Mirrors packages/core/decoders in TS so the extension and dashboard get identical output
regardless of which path they hit. Real source-of-truth is the TS package; this is a
parallel impl for endpoints that don't have a JS runtime in the request path.
"""
from __future__ import annotations

import base64
from typing import Any

from solders.transaction import VersionedTransaction
from solders.message import MessageV0

from ..schemas import Account, DecodedInstruction

SQUADS_V4 = "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf"
SYSTEM = "11111111111111111111111111111111"
BPF_LOADER_UPGRADEABLE = "BPFLoaderUpgradeab1e11111111111111111111111"

_BPF_IX = {
    0: "initialize_buffer",
    1: "write",
    2: "deploy_with_max_data_len",
    3: "upgrade",
    4: "set_authority",
    5: "close",
    6: "extend_program",
    7: "set_authority_checked",
}

_SQUADS_IX_BY_TAG = {
    0x00: "multisig_create_v2",
    0x01: "multisig_set_config",
    0x02: "multisig_add_member",
    0x03: "multisig_remove_member",
    0x04: "multisig_change_threshold",
    0x10: "config_transaction_create",
    0x11: "config_transaction_execute",
    0x20: "vault_transaction_create",
    0x21: "vault_transaction_execute",
    0x30: "proposal_approve",
    0x31: "proposal_reject",
}

_SYSTEM_IX = {
    0: "create_account",
    1: "assign",
    2: "transfer",
    3: "create_account_with_seed",
    4: "advance_nonce_account",
    5: "withdraw_nonce_account",
    6: "initialize_nonce_account",
    7: "authorize_nonce_account",
}


def decode_transaction(tx_base64: str) -> list[DecodedInstruction]:
    raw = base64.b64decode(tx_base64)
    tx = VersionedTransaction.from_bytes(raw)
    msg = tx.message
    keys = [str(k) for k in msg.account_keys]
    out: list[DecodedInstruction] = []
    for ix in msg.instructions:
        program_id = keys[ix.program_id_index]
        accounts = [
            Account(
                pubkey=keys[i],
                role="account",
                is_signer=i < msg.header.num_required_signatures,
                is_writable=_writable(i, msg),
            )
            for i in ix.accounts
        ]
        out.append(_decode_one(program_id, bytes(ix.data), accounts))
    return out


def _writable(i: int, msg: MessageV0) -> bool:
    h = msg.header
    n = len(msg.account_keys)
    if i < h.num_required_signatures:
        return i < h.num_required_signatures - h.num_readonly_signed_accounts
    return i < n - h.num_readonly_unsigned_accounts


def _decode_one(program_id: str, data: bytes, accounts: list[Account]) -> DecodedInstruction:
    if program_id == SQUADS_V4:
        return _decode_squads(program_id, data, accounts)
    if program_id == BPF_LOADER_UPGRADEABLE:
        return _decode_bpf(program_id, data, accounts)
    if program_id == SYSTEM:
        return _decode_system(program_id, data, accounts)
    return DecodedInstruction(
        program_id=program_id,
        program_name="Unknown",
        ix_name="unknown",
        args={"opaque_bytes": len(data)},
        accounts=accounts,
        plain_english=f"Calls program {program_id} with {len(data)} bytes of opaque data.",
    )


def _decode_squads(program_id: str, data: bytes, accounts: list[Account]) -> DecodedInstruction:
    tag = data[0] if data else -1
    name = _SQUADS_IX_BY_TAG.get(tag, "unknown")
    plain = {
        "multisig_change_threshold": "Squads V4: changes the multisig signature threshold.",
        "multisig_add_member": "Squads V4: adds a member to the multisig.",
        "multisig_remove_member": "Squads V4: removes a member from the multisig.",
        "config_transaction_execute": "Squads V4: EXECUTES a queued admin action — irreversible.",
    }.get(name, f"Squads V4: {name}.")
    return DecodedInstruction(
        program_id=program_id,
        program_name="Squads V4",
        ix_name=name,
        args={"discriminator": list(data[:8])},
        accounts=accounts,
        plain_english=plain,
    )


def _decode_bpf(program_id: str, data: bytes, accounts: list[Account]) -> DecodedInstruction:
    if len(data) < 4:
        tag = -1
    else:
        tag = int.from_bytes(data[:4], "little")
    name = _BPF_IX.get(tag, "unknown")
    plain = {
        "upgrade": "Upgrades a deployed program by replacing its bytecode.",
        "set_authority": "Transfers control of a program to a new upgrade authority.",
        "set_authority_checked": "Transfers control of a program to a new upgrade authority (checked).",
    }.get(name, f"BPF loader instruction: {name}.")
    return DecodedInstruction(
        program_id=program_id,
        program_name="BPFLoaderUpgradeable",
        ix_name=name,
        args={"tag": tag},
        accounts=accounts,
        plain_english=plain,
    )


def _decode_system(program_id: str, data: bytes, accounts: list[Account]) -> DecodedInstruction:
    if len(data) < 4:
        tag = -1
    else:
        tag = int.from_bytes(data[:4], "little")
    name = _SYSTEM_IX.get(tag, "unknown")
    return DecodedInstruction(
        program_id=program_id,
        program_name="System",
        ix_name=name,
        args={"tag": tag},
        accounts=accounts,
        plain_english=f"System program: {name.replace('_', ' ')}.",
    )
