"""Durable-nonce detection.

A Solana tx is durable-nonce-using if its first instruction is the System program's
AdvanceNonceAccount (discriminator = 4). The nonce account itself must be owned by the
System Program; an attacker-staged 'nonce' account often has a different owner — that's
the owner-mismatch flag we surface.
"""
from __future__ import annotations

import base64
import os

import httpx
from solders.transaction import VersionedTransaction

from ..schemas import NonceInfo

SYSTEM = "11111111111111111111111111111111"
ADVANCE_NONCE = 4

# Demo default — replace with a real computation that reads the nonce account's stored
# blockhash and compares to recent slot history.
DEMO_REPLAY_WINDOW_DAYS = 47.0


async def detect_durable_nonce(
    tx_base64: str,
    expected_authority: str | None = None,
    owner_override: str | None = None,
) -> NonceInfo:
    raw = base64.b64decode(tx_base64)
    tx = VersionedTransaction.from_bytes(raw)
    msg = tx.message
    keys = [str(k) for k in msg.account_keys]
    if not msg.instructions:
        return NonceInfo(is_durable_nonce=False, owner_matches_expected=True)

    first = msg.instructions[0]
    if keys[first.program_id_index] != SYSTEM:
        return NonceInfo(is_durable_nonce=False, owner_matches_expected=True)
    data = bytes(first.data)
    if len(data) < 4 or int.from_bytes(data[:4], "little") != ADVANCE_NONCE:
        return NonceInfo(is_durable_nonce=False, owner_matches_expected=True)

    nonce_pubkey = keys[first.accounts[0]] if len(first.accounts) > 0 else None
    nonce_authority = keys[first.accounts[2]] if len(first.accounts) > 2 else None

    owner = owner_override or (
        await _fetch_account_owner(nonce_pubkey) if nonce_pubkey else None
    )
    owner_matches = owner is None or owner == SYSTEM

    if expected_authority and nonce_authority and nonce_authority != expected_authority:
        owner_matches = False

    return NonceInfo(
        is_durable_nonce=True,
        nonce_pubkey=nonce_pubkey,
        nonce_authority=nonce_authority,
        nonce_account_owner=owner,
        owner_matches_expected=owner_matches,
        blockhash=str(msg.recent_blockhash),
        estimated_replay_window_days=DEMO_REPLAY_WINDOW_DAYS,
    )


async def _fetch_account_owner(pubkey: str) -> str | None:
    rpc = os.getenv("PLUMB_RPC_URL")
    if not rpc:
        return None
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [pubkey, {"encoding": "base64"}],
    }
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            r = await client.post(rpc, json=payload)
            r.raise_for_status()
            data = r.json()
        except Exception:
            return None
    value = (data or {}).get("result", {}).get("value")
    if not value:
        return None
    return value.get("owner")
