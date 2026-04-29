use crate::{analyze::AnalyzedProgram, DiffLine};

pub fn line_diff(old: &[String], new: &[String]) -> Vec<DiffLine> {
    let mut out = Vec::new();
    let max = old.len().max(new.len());
    for i in 0..max {
        let o = old.get(i);
        let n = new.get(i);
        match (o, n) {
            (Some(a), Some(b)) if a == b => {}
            (Some(a), Some(b)) => out.push(DiffLine {
                kind: "changed".into(),
                old_line: Some(a.clone()),
                new_line: Some(b.clone()),
                line_no: i,
            }),
            (Some(a), None) => out.push(DiffLine {
                kind: "removed".into(),
                old_line: Some(a.clone()),
                new_line: None,
                line_no: i,
            }),
            (None, Some(b)) => out.push(DiffLine {
                kind: "added".into(),
                old_line: None,
                new_line: Some(b.clone()),
                line_no: i,
            }),
            (None, None) => {}
        }
    }
    out
}

pub fn removed(haystack: &[String], other: &[String]) -> Vec<String> {
    haystack
        .iter()
        .filter(|s| !other.contains(s))
        .cloned()
        .collect()
}

pub fn count_cfg_changes(old: &AnalyzedProgram, new: &AnalyzedProgram) -> usize {
    old.cfg_edges.abs_diff(new.cfg_edges)
}
