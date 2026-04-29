//! plumb-bpf-diff: structured diff between two Solana program ELF blobs.
//!
//! The binary reads JSON from stdin: `{ "old_b64": "...", "new_b64": "..." }`
//! and writes the diff JSON to stdout. The library is exposed for in-process
//! consumers (e.g. a future PyO3 module).
//!
//! Scope discipline: this MVP analyzer only surfaces three families of changes
//! (signer checks, authority checks, control-flow edge count). It is not a
//! full decompiler and never will be.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

pub mod analyze;
pub mod diff;

#[derive(Debug, Deserialize)]
pub struct DiffRequest {
    pub old_b64: String,
    pub new_b64: String,
}

#[derive(Debug, Serialize)]
pub struct DiffResponse {
    pub ok: bool,
    pub old_hash: String,
    pub new_hash: String,
    pub control_flow_changes: usize,
    pub signer_checks_removed: Vec<String>,
    pub signer_checks_added: Vec<String>,
    pub authority_checks_removed: Vec<String>,
    pub authority_checks_added: Vec<String>,
    pub diff: Vec<DiffLine>,
}

#[derive(Debug, Serialize)]
pub struct DiffLine {
    pub kind: String,
    pub old_line: Option<String>,
    pub new_line: Option<String>,
    pub line_no: usize,
}

pub fn run_diff(req: DiffRequest) -> anyhow::Result<DiffResponse> {
    use base64::{engine::general_purpose, Engine as _};
    let old = general_purpose::STANDARD.decode(req.old_b64)?;
    let new = general_purpose::STANDARD.decode(req.new_b64)?;

    let old_an = analyze::analyze(&old)?;
    let new_an = analyze::analyze(&new)?;
    let line_diff = diff::line_diff(&old_an.disasm, &new_an.disasm);

    Ok(DiffResponse {
        ok: true,
        old_hash: hex_sha256(&old),
        new_hash: hex_sha256(&new),
        control_flow_changes: diff::count_cfg_changes(&old_an, &new_an),
        signer_checks_removed: diff::removed(&old_an.signer_checks, &new_an.signer_checks),
        signer_checks_added: diff::removed(&new_an.signer_checks, &old_an.signer_checks),
        authority_checks_removed: diff::removed(&old_an.authority_checks, &new_an.authority_checks),
        authority_checks_added: diff::removed(&new_an.authority_checks, &old_an.authority_checks),
        diff: line_diff,
    })
}

fn hex_sha256(bytes: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(bytes);
    hex_encode(&h.finalize())
}

fn hex_encode(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        out.push(HEX[(b >> 4) as usize] as char);
        out.push(HEX[(b & 0x0f) as usize] as char);
    }
    out
}
