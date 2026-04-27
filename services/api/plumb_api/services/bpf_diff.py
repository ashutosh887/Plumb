"""Bridge to the Rust plumb-bpf-diff binary.

We shell out rather than embedding a Rust extension because:
1. Hackathon scope — no PyO3 toolchain time investment.
2. The Rust crate has its own CLI surface for testing, the FastAPI route is just one consumer.
3. Easy to swap later: the contract is JSON-on-stdin → JSON-on-stdout.
"""
from __future__ import annotations

import asyncio
import base64
import json
import os

from ..schemas import BpfDiff, DiffLine

BIN = os.getenv("PLUMB_BPF_DIFF_BIN", "plumb-bpf-diff")


async def run_bpf_diff(old_program_data_b64: str, new_program_data_b64: str) -> BpfDiff:
    payload = json.dumps(
        {
            "old_b64": old_program_data_b64,
            "new_b64": new_program_data_b64,
        }
    ).encode("utf-8")

    proc = await asyncio.create_subprocess_exec(
        BIN,
        "diff",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    out, err = await proc.communicate(input=payload)
    if proc.returncode != 0:
        # graceful demo fallback so the route still returns something useful
        return BpfDiff(
            ok=False,
            old_hash="",
            new_hash="",
            control_flow_changes=0,
            signer_checks_removed=[],
            signer_checks_added=[],
            authority_checks_removed=[],
            authority_checks_added=[],
            diff=[],
        )

    parsed = json.loads(out.decode("utf-8"))
    return BpfDiff(
        ok=parsed.get("ok", True),
        old_hash=parsed["old_hash"],
        new_hash=parsed["new_hash"],
        control_flow_changes=parsed.get("control_flow_changes", 0),
        signer_checks_removed=parsed.get("signer_checks_removed", []),
        signer_checks_added=parsed.get("signer_checks_added", []),
        authority_checks_removed=parsed.get("authority_checks_removed", []),
        authority_checks_added=parsed.get("authority_checks_added", []),
        diff=[
            DiffLine(
                kind=d["kind"],
                old_line=d.get("old_line"),
                new_line=d.get("new_line"),
                line_no=d["line_no"],
            )
            for d in parsed.get("diff", [])
        ],
    )
