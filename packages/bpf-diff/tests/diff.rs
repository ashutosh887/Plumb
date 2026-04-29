use base64::{engine::general_purpose, Engine as _};
use plumb_bpf_diff::{run_diff, DiffRequest};

#[test]
fn detects_signer_check_downgrade_demo_fixture() {
    let old = r#"
fn migrate_admin(ctx: Context<Migrate>) -> Result<()> {
    require!(council.is_signed_by_quorum, ErrorCode::Unauthorized);
    Ok(())
}
"#;
    let new = r#"
fn migrate_admin(ctx: Context<Migrate>) -> Result<()> {
    require!(council.is_signed_by_one, ErrorCode::Unauthorized);
    Ok(())
}
"#;

    let req = DiffRequest {
        old_b64: general_purpose::STANDARD.encode(old.as_bytes()),
        new_b64: general_purpose::STANDARD.encode(new.as_bytes()),
    };
    let resp = run_diff(req).unwrap();
    assert!(resp.signer_checks_removed.iter().any(|s| s.contains("is_signed_by_quorum")));
    assert!(resp.signer_checks_added.iter().any(|s| s.contains("is_signed_by_one")));
    assert!(resp.ok);
    assert_ne!(resp.old_hash, resp.new_hash);
}
