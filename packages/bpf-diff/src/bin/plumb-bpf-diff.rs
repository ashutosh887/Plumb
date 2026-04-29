use std::io::{self, Read, Write};

use plumb_bpf_diff::{run_diff, DiffRequest};

fn main() -> anyhow::Result<()> {
    let mut buf = String::new();
    let mut args = std::env::args().skip(1);
    let cmd = args.next().unwrap_or_else(|| "diff".to_string());
    if cmd != "diff" {
        eprintln!("usage: plumb-bpf-diff diff < request.json");
        std::process::exit(2);
    }

    io::stdin().read_to_string(&mut buf)?;
    let req: DiffRequest = serde_json::from_str(&buf)?;
    let res = run_diff(req)?;
    let mut stdout = io::stdout().lock();
    serde_json::to_writer(&mut stdout, &res)?;
    stdout.write_all(b"\n")?;
    Ok(())
}
