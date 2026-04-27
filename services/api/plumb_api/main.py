from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import InspectRequest, InspectionReport, BpfDiffRequest
from .services.decode import decode_transaction
from .services.nonce import detect_durable_nonce
from .services.simulate import simulate_with_fork
from .services.bpf_diff import run_bpf_diff
from .services.risk import assess

app = FastAPI(title="Plumb", version="0.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "chrome-extension://*",
        "moz-extension://*",
        "http://localhost:3000",
        "https://plumb.so",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/inspect", response_model=InspectionReport)
async def inspect(req: InspectRequest) -> InspectionReport:
    try:
        decoded = decode_transaction(req.tx)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"decode failed: {exc}") from exc

    nonce = await detect_durable_nonce(
        req.tx,
        expected_authority=req.expected_nonce_authority,
        owner_override=req.nonce_account_owner_override,
    )
    sim = await simulate_with_fork(req.tx) if req.run_simulation else None

    bpf_diff = None
    if req.bpf_diff and req.bpf_diff.old_program_data and req.bpf_diff.new_program_data:
        bpf_diff = await run_bpf_diff(
            req.bpf_diff.old_program_data, req.bpf_diff.new_program_data
        )

    findings = assess(decoded=decoded, nonce=nonce, sim=sim, bpf_diff=bpf_diff)
    return InspectionReport(
        tx_base64=req.tx,
        decoded=decoded,
        nonce=nonce,
        sim=sim,
        bpf_diff=bpf_diff,
        findings=findings,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/bpf-diff")
async def bpf_diff_endpoint(req: BpfDiffRequest) -> dict:
    diff = await run_bpf_diff(req.old_program_data, req.new_program_data)
    return diff.model_dump()
