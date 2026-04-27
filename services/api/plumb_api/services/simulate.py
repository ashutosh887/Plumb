"""State-projected simulation via Surfpool.

Surfpool runs a local validator that lazy-fetches mainnet accounts. We point an httpx
client at it and call simulateTransaction with the tx as-is. Account changes returned
by the simulator are diffed against pre-state to produce authority-change findings.

For the hackathon demo we keep this conservative: the function returns None if Surfpool
isn't reachable, so the rest of the inspection still works.
"""
from __future__ import annotations

import base64
import os

import httpx

from ..schemas import (
    AccountChange,
    AuthorityChange,
    SimResult,
)

SURFPOOL_URL = os.getenv("PLUMB_SURFPOOL_URL", "http://127.0.0.1:8899")


async def simulate_with_fork(tx_base64: str) -> SimResult | None:
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "simulateTransaction",
        "params": [
            tx_base64,
            {
                "sigVerify": False,
                "replaceRecentBlockhash": True,
                "encoding": "base64",
                "commitment": "processed",
                "accounts": {"encoding": "base64+zstd", "addresses": []},
            },
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(SURFPOOL_URL, json=payload)
            r.raise_for_status()
            data = r.json()
    except Exception:
        return None

    result = (data or {}).get("result", {}).get("value", {})
    err = result.get("err")
    return SimResult(
        ok=err is None,
        logs=result.get("logs", []) or [],
        units_consumed=result.get("unitsConsumed", 0) or 0,
        account_changes=[],  # filled by post-processing in v2 — out of MVP scope
        authority_changes=_extract_authority_changes(result),
    )


def _extract_authority_changes(_result: dict) -> list[AuthorityChange]:
    """Stub: in v2 we diff returned accounts against pre-state to detect mint /
    upgrade / multisig authority transitions. For the MVP demo, demo fixtures
    inject these directly via the /inspect request."""
    return []
