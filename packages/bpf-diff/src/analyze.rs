//! Disassemble a program ELF and extract:
//! - the raw disassembly (one instruction per Vec<String> line)
//! - a list of detected signer checks
//! - a list of detected authority checks
//! - a control-flow graph as edges
//!
//! Real implementation: load ELF via solana_rbpf::elf::Executable, walk instructions,
//! detect canonical Anchor codegen patterns for `is_signer`, `Constraint::Authority`,
//! and `require!(...)`.
//!
//! Stub: the demo build ships a heuristic that scans for the human-readable signer-check
//! string literals embedded in Anchor binaries. This is enough to make the demo land
//! against canned fixtures while the real rbpf path is wired in Week 3.

use anyhow::Result;

#[derive(Debug, Default)]
pub struct AnalyzedProgram {
    pub disasm: Vec<String>,
    pub signer_checks: Vec<String>,
    pub authority_checks: Vec<String>,
    pub cfg_edges: usize,
}

const SIGNER_HINTS: &[&str] = &[
    "is_signer",
    "is_signed_by_quorum",
    "is_signed_by_one",
    "Constraint::Signer",
];

const AUTHORITY_HINTS: &[&str] = &[
    "Constraint::Authority",
    "upgrade_authority",
    "mint_authority",
    "freeze_authority",
];

pub fn analyze(program_data: &[u8]) -> Result<AnalyzedProgram> {
    // TODO(week-3): replace the string-scan heuristic with a real solana_rbpf disassembly walk.
    //   1. solana_rbpf::elf::Executable::load(program_data, &config)
    //   2. iterate instructions, detect call_imm to known Anchor codegen helpers
    //   3. walk basic blocks to count CFG edges precisely.
    let mut disasm = Vec::new();
    let mut signer = Vec::new();
    let mut authority = Vec::new();

    let text = String::from_utf8_lossy(program_data);
    for (lineno, chunk) in text.split('\n').enumerate() {
        let trimmed = chunk.trim();
        if trimmed.is_empty() {
            continue;
        }
        disasm.push(format!("{:>5}  {}", lineno, trimmed));
        for needle in SIGNER_HINTS {
            if trimmed.contains(needle) {
                signer.push(trimmed.to_string());
            }
        }
        for needle in AUTHORITY_HINTS {
            if trimmed.contains(needle) {
                authority.push(trimmed.to_string());
            }
        }
    }

    let cfg_edges = disasm.len().saturating_sub(1);

    Ok(AnalyzedProgram {
        disasm,
        signer_checks: signer,
        authority_checks: authority,
        cfg_edges,
    })
}
