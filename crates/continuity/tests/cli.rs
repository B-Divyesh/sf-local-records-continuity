use assert_cmd::Command;
use continuity_pack::{create_pack, Config, PackOptions, RecordSource};
use predicates::prelude::*;
use std::{fs, path::PathBuf};

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
        .code(3)
        .stderr(predicate::str::contains("no passphrase available"));
}

#[test]
fn unavailable_target_fails_loudly_for_scheduled_checks() {
    Command::cargo_bin("continuity")
        .unwrap()
        .env("CONTINUITY_PASSPHRASE", "a long scheduled passphrase")
        .args([
            "--ci",
            "check",
            "--target",
            "/definitely/not/a/mounted/target",
        ])
        .assert()
        .failure()
        .code(3)
        .stderr(predicate::str::contains("target is unavailable"));
}

#[test]
fn scheduled_json_check_fails_when_differently_prefixed_newest_pack_is_corrupt() {
    let temp = tempfile::tempdir().unwrap();
    let target = temp.path().join("mixed-target");
    fs::create_dir(&target).unwrap();
    fs::write(temp.path().join("records.csv"), "invoice,total\nINV-1,10\n").unwrap();
    let config_path = temp.path().join("continuity.toml");
    let mut config = Config {
        business_name: "Zulu Older Business".into(),
        output_dir: PathBuf::from("packs"),
        records: vec![RecordSource {
            label: "records".into(),
            path: PathBuf::from("records.csv"),
            required: true,
        }],
    };
    let passphrase = "a long scheduled passphrase";
    let older = create_pack(PackOptions {
        config: &config,
        config_path: &config_path,
        target: &target,
        passphrase,
    })
    .unwrap();
    config.business_name = "Alpha Newer Business".into();
    let newer = create_pack(PackOptions {
        config: &config,
        config_path: &config_path,
        target: &target,
        passphrase,
    })
    .unwrap();
    assert!(older.target_pack.file_name().unwrap() > newer.target_pack.file_name().unwrap());
    let mut bytes = fs::read(&newer.target_pack).unwrap();
    bytes.pop();
    fs::write(&newer.target_pack, bytes).unwrap();

    Command::cargo_bin("continuity")
        .unwrap()
        .env("CONTINUITY_PASSPHRASE", passphrase)
        .args(["--ci", "--json", "check", "--target"])
        .arg(&target)
        .args(["--max-age-hours", "26"])
        .assert()
        .failure()
        .code(4)
        .stdout(predicate::str::contains("\"code\":4"))
        .stdout(predicate::str::contains("does not match its receipt"));
}
