use assert_cmd::Command;
use predicates::prelude::*;

#[test]
fn help_is_actionable() {
    Command::cargo_bin("continuity")
        .unwrap()
        .arg("--help")
        .assert()
        .success()
        .stdout(predicate::str::contains("continuity pack --target"))
        .stdout(predicate::str::contains("Exit codes"));
}

#[test]
fn init_supports_json_and_writes_config() {
    let temp = tempfile::tempdir().unwrap();
    let config = temp.path().join("continuity.toml");
    Command::cargo_bin("continuity")
        .unwrap()
        .args(["--json", "init", "--config"])
        .arg(&config)
        .assert()
        .success()
        .stdout(predicate::str::contains("\"status\":\"ready\""));
    assert!(config.exists());
}

#[test]
fn ci_mode_fails_clearly_without_passphrase() {
    Command::cargo_bin("continuity")
        .unwrap()
        .env_remove("CONTINUITY_PASSPHRASE")
        .args(["--ci", "verify", "missing.cpack"])
        .assert()
        .failure()
        .code(5)
        .stderr(predicate::str::contains("no passphrase available"));
}
