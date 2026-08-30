use clap::{Args, Parser, Subcommand};
use continuity_pack::{
    check_target, create_pack, restore_pack, verify_pack, Config, Error, PackOptions,
};
use serde::Serialize;
use std::{
    env, fs,
    io::{self, IsTerminal, Read},
    path::{Path, PathBuf},
    process::{Command, Stdio},
    time::{SystemTime, UNIX_EPOCH},
};

const KEYRING_SERVICE: &str = "continuity-pack";
const KEYRING_USER: &str = "default";
const DEMO_PASSPHRASE: &str = "maple-street-books-demo-only";
const DEMO_CONFIG: &str = include_str!("../examples/maple-street-books/continuity.toml");
const DEMO_INVOICES: &str = include_str!("../examples/maple-street-books/exports/invoices.csv");
const DEMO_CUSTOMERS: &str = include_str!("../examples/maple-street-books/exports/customers.csv");
const DEMO_DOCUMENT: &str =
    include_str!("../examples/maple-street-books/exports/documents/insurance-renewal.txt");
const SAMPLE_CONFIG: &str = r#"# Continuity Pack configuration
# Paths are relative to this file. A missing required source stops the pack.
business_name = "Example Workshop"
output_dir = ".continuity/packs"

[[records]]
label = "invoices"
path = "exports/invoices.csv"
required = true

[[records]]
label = "customers"
path = "exports/customers.csv"
required = true

[[records]]
label = "supporting-documents"
path = "exports/documents"
required = false
"#;

#[derive(Debug, Parser)]
#[command(
    name = "continuity",
    version,
    about = "Build and test an encrypted recovery handoff for business records",
    long_about = "Continuity Pack gathers configured exports, records checksums, encrypts them, writes a readable restore map, and verifies an explicit target copy.\n\nIt never uploads data and verification is not a full application restore test.",
    after_help = "Try the isolated sample first:\n  continuity demo\n\nStart for real:\n  continuity init\n  continuity pack --target /media/offsite/backups\n  continuity check --target /media/offsite/backups --json\n\nExit codes: 0 success, 2 configuration, 3 missing input/target, 4 verification, 5 OS integration"
)]
struct Cli {
    /// Emit one machine-readable JSON object.
    #[arg(long, global = true)]
    json: bool,

    /// Disable all interactive prompts; suitable for cron and CI.
    #[arg(long, global = true)]
    ci: bool,

    /// Read the encryption passphrase from this file.
    #[arg(long, global = true, value_name = "FILE")]
    passphrase_file: Option<PathBuf>,

    /// Run the bundled sample in a new temporary workspace.
    #[arg(long)]
    demo: bool,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Debug, Subcommand)]
enum Commands {
    /// Pack, check, and restore bundled sample records in a temporary workspace.
    Demo,
    /// Write a documented starter continuity.toml.
    Init {
        #[arg(long, default_value = "continuity.toml")]
        config: PathBuf,
        /// Replace an existing configuration.
        #[arg(long)]
        force: bool,
    },
    /// Build, encrypt, copy, and immediately verify a recovery pack.
    Pack {
        #[arg(long, default_value = "continuity.toml")]
        config: PathBuf,
        /// Existing local or mounted directory. Never created automatically.
        #[arg(long)]
        target: PathBuf,
    },
    /// Authenticate and hash every file without extracting it.
    Verify { pack: PathBuf },
    /// Verify the newest target pack and enforce a freshness limit.
    Check {
        #[arg(long)]
        target: PathBuf,
        #[arg(long, default_value_t = 26)]
        max_age_hours: u64,
    },
    /// Restore into a new or empty directory after full verification.
    Restore {
        pack: PathBuf,
        #[arg(long)]
        output: PathBuf,
    },
    /// Print a daily scheduled check entry for review.
    Schedule(ScheduleArgs),
    /// Store, inspect, or remove the default passphrase in the OS keychain.
    #[command(subcommand)]
    Key(KeyCommand),
}

#[derive(Debug, Args)]
struct ScheduleArgs {
    #[arg(long)]
    target: PathBuf,
    /// Local 24-hour time, for example 03:15.
    #[arg(long, default_value = "03:15")]
    daily_at: String,
    #[arg(long, default_value_t = 26)]
    max_age_hours: u64,
    #[arg(long, hide = true)]
    install: bool,
}

#[derive(Debug, Subcommand)]
enum KeyCommand {
    /// Save a passphrase in the current user's OS keychain.
    Store {
        /// Read the passphrase from stdin instead of a hidden prompt.
        #[arg(long)]
        stdin: bool,
    },
    /// Report whether a keychain passphrase is available, without revealing it.
    Status,
    /// Remove the saved keychain passphrase.
    Forget,
}

#[derive(Debug, Serialize)]
struct Message<'a> {
    status: &'a str,
    message: String,
}

#[derive(Debug, Serialize)]
struct DemoResult {
    status: &'static str,
    workspace: PathBuf,
    target_pack: PathBuf,
    restored: PathBuf,
    file_count: usize,
    verified: bool,
}

impl std::fmt::Display for DemoResult {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "SAMPLE RECOVERY COMPLETE\nWorkspace: {}\nPack: {}\nRestored: {}\nFiles: {}\nVerified: yes\nDemo files stay in this temporary workspace. Delete it when finished.",
            self.workspace.display(),
            self.target_pack.display(),
            self.restored.display(),
            self.file_count
        )
    }
}

impl std::fmt::Display for Message<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

fn main() {
    let cli = Cli::parse();
    let json = cli.json;
    if let Err(error) = run(cli) {
        if json {
            println!(
                "{}",
                serde_json::json!({"status": "error", "code": error.exit_code(), "message": error.to_string()})
            );
        } else {
            eprintln!("continuity: {error}");
        }
        std::process::exit(error.exit_code());
    }
}

fn run(cli: Cli) -> Result<(), Error> {
    if cli.demo {
        if cli.command.is_some() {
            return Err(Error::invalid("--demo cannot be combined with a command"));
        }
        return emit(cli.json, &run_demo()?);
    }

    let Some(command) = cli.command else {
        return Err(Error::invalid(
            "choose a command; run continuity demo to try the bundled sample",
        ));
    };

    match command {
        Commands::Demo => emit(cli.json, &run_demo()?),
        Commands::Init { config, force } => {
            if config.exists() && !force {
                return Err(Error::invalid(format!(
                    "{} already exists; use --force only if you intend to replace it",
                    config.display()
                )));
            }
            if let Some(parent) = config.parent().filter(|p| !p.as_os_str().is_empty()) {
                fs::create_dir_all(parent).map_err(|e| {
                    Error::unavailable(format!("could not create {}: {e}", parent.display()))
                })?;
            }
            fs::write(&config, SAMPLE_CONFIG).map_err(|e| {
                Error::unavailable(format!("could not write {}: {e}", config.display()))
            })?;
            emit(cli.json, &Message { status: "ready", message: format!("wrote {}; edit the record paths, then run continuity pack --target <directory>", config.display()) })
        }
        Commands::Pack { config, target } => {
            let passphrase = resolve_passphrase(cli.passphrase_file.as_deref(), cli.ci)?;
            let loaded = Config::from_path(&config)?;
            let result = create_pack(PackOptions {
                config: &loaded,
                config_path: &config,
                target: &target,
                passphrase: &passphrase,
            })?;
            emit(cli.json, &result)
        }
        Commands::Verify { pack } => {
            let passphrase = resolve_passphrase(cli.passphrase_file.as_deref(), cli.ci)?;
            emit(cli.json, &verify_pack(&pack, &passphrase)?)
        }
        Commands::Check {
            target,
            max_age_hours,
        } => {
            let passphrase = resolve_passphrase(cli.passphrase_file.as_deref(), cli.ci)?;
            emit(
                cli.json,
                &check_target(&target, &passphrase, max_age_hours)?,
            )
        }
        Commands::Restore { pack, output } => {
            let passphrase = resolve_passphrase(cli.passphrase_file.as_deref(), cli.ci)?;
            emit(cli.json, &restore_pack(&pack, &output, &passphrase)?)
        }
        Commands::Schedule(args) => schedule(args, cli.json),
        Commands::Key(command) => key_command(command, cli.ci, cli.json),
    }
}

fn run_demo() -> Result<DemoResult, Error> {
    let workspace = create_demo_workspace()?;
    let exports = workspace.join("exports");
    let documents = exports.join("documents");
    let target = workspace.join("target");
    let restored = workspace.join("restored");
    fs::create_dir_all(&documents).map_err(|e| {
        Error::unavailable(format!(
            "could not create demo workspace {}: {e}",
            workspace.display()
        ))
    })?;
    fs::create_dir(&target).map_err(|e| {
        Error::unavailable(format!(
            "could not create demo target {}: {e}",
            target.display()
        ))
    })?;

    let config_path = workspace.join("continuity.toml");
    write_demo_file(&config_path, DEMO_CONFIG)?;
    write_demo_file(&exports.join("invoices.csv"), DEMO_INVOICES)?;
    write_demo_file(&exports.join("customers.csv"), DEMO_CUSTOMERS)?;
    write_demo_file(&documents.join("insurance-renewal.txt"), DEMO_DOCUMENT)?;

    let config = Config::from_path(&config_path)?;
    let pack = create_pack(PackOptions {
        config: &config,
        config_path: &config_path,
        target: &target,
        passphrase: DEMO_PASSPHRASE,
    })?;
    let checked = check_target(&target, DEMO_PASSPHRASE, 1)?;
    let recovery = restore_pack(&pack.target_pack, &restored, DEMO_PASSPHRASE)?;

    Ok(DemoResult {
        status: "sample-recovery-complete",
        workspace,
        target_pack: pack.target_pack,
        restored,
        file_count: recovery.file_count,
        verified: pack.verified && checked.authenticated && recovery.verified,
    })
}

fn create_demo_workspace() -> Result<PathBuf, Error> {
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| Error::integration(format!("system clock is before Unix time: {e}")))?
        .as_nanos();
    let base = env::temp_dir();
    for attempt in 0..100_u8 {
        let candidate = base.join(format!(
            "continuity-demo-{}-{nonce}-{attempt}",
            std::process::id()
        ));
        match fs::create_dir(&candidate) {
            Ok(()) => return Ok(candidate),
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => continue,
            Err(error) => {
                return Err(Error::unavailable(format!(
                    "could not create isolated demo workspace {}: {error}",
                    candidate.display()
                )))
            }
        }
    }
    Err(Error::unavailable(
        "could not choose a unique temporary demo workspace",
    ))
}

fn write_demo_file(path: &Path, contents: &str) -> Result<(), Error> {
    fs::write(path, contents).map_err(|e| {
        Error::unavailable(format!("could not write demo file {}: {e}", path.display()))
    })
}

fn emit<T: Serialize + std::fmt::Display>(json: bool, value: &T) -> Result<(), Error> {
    if json {
        println!(
            "{}",
            serde_json::to_string(value)
                .map_err(|e| Error::integration(format!("could not write JSON: {e}")))?
        );
    } else {
        println!("{value}");
    }
    Ok(())
}

fn resolve_passphrase(file: Option<&Path>, ci: bool) -> Result<String, Error> {
    if let Some(path) = file {
        let value = fs::read_to_string(path).map_err(|e| {
            Error::unavailable(format!(
                "could not read passphrase file {}: {e}",
                path.display()
            ))
        })?;
        return clean_passphrase(value, "passphrase file");
    }
    if let Ok(value) = env::var("CONTINUITY_PASSPHRASE") {
        return clean_passphrase(value, "CONTINUITY_PASSPHRASE");
    }
    if let Ok(value) = keychain_get() {
        return clean_passphrase(value, "OS keychain");
    }
    if ci || !io::stdin().is_terminal() {
        return Err(Error::unavailable("no passphrase available; use --passphrase-file, CONTINUITY_PASSPHRASE, or continuity key store"));
    }
    let value = rpassword::prompt_password("Pack passphrase: ")
        .map_err(|e| Error::integration(format!("could not read passphrase: {e}")))?;
    clean_passphrase(value, "terminal")
}

fn clean_passphrase(value: String, source: &str) -> Result<String, Error> {
    let cleaned = value.trim_end_matches(['\r', '\n']).to_owned();
    if cleaned.is_empty() {
        return Err(Error::unavailable(format!(
            "{source} contained an empty passphrase"
        )));
    }
    Ok(cleaned)
}

fn key_command(command: KeyCommand, ci: bool, json: bool) -> Result<(), Error> {
    match command {
        KeyCommand::Store { stdin } => {
            let mut passphrase = String::new();
            if stdin {
                io::stdin()
                    .read_to_string(&mut passphrase)
                    .map_err(|e| Error::integration(format!("could not read stdin: {e}")))?;
            } else {
                if ci || !io::stdin().is_terminal() {
                    return Err(Error::invalid(
                        "use continuity key store --stdin in CI or a non-interactive shell",
                    ));
                }
                passphrase = rpassword::prompt_password("Passphrase to store: ")
                    .map_err(|e| Error::integration(format!("could not read passphrase: {e}")))?;
                let confirm = rpassword::prompt_password("Confirm passphrase: ").map_err(|e| {
                    Error::integration(format!("could not confirm passphrase: {e}"))
                })?;
                if passphrase != confirm {
                    return Err(Error::invalid("passphrases did not match"));
                }
            }
            let passphrase = clean_passphrase(passphrase, "stdin")?;
            if passphrase.chars().count() < 12 {
                return Err(Error::invalid("passphrase must be at least 12 characters"));
            }
            keychain_store(&passphrase)?;
            emit(
                json,
                &Message {
                    status: "stored",
                    message: "passphrase saved in the current user's OS keychain".into(),
                },
            )
        }
        KeyCommand::Status => {
            let available = keychain_get().is_ok();
            emit(
                json,
                &serde_json::json!({"status": if available { "available" } else { "missing" }, "available": available}),
            )
        }
        KeyCommand::Forget => {
            keychain_delete()?;
            emit(
                json,
                &Message {
                    status: "removed",
                    message: "saved keychain passphrase removed".into(),
                },
            )
        }
    }
}

#[cfg(target_os = "linux")]
fn keychain_get() -> Result<String, Error> {
    let output = Command::new("secret-tool")
        .args([
            "lookup",
            "service",
            KEYRING_SERVICE,
            "account",
            KEYRING_USER,
        ])
        .output()
        .map_err(|e| {
            Error::integration(format!(
                "Linux Secret Service is unavailable (install secret-tool): {e}"
            ))
        })?;
    if !output.status.success() || output.stdout.is_empty() {
        return Err(Error::integration(
            "no passphrase found in Linux Secret Service",
        ));
    }
    String::from_utf8(output.stdout)
        .map_err(|_| Error::integration("Linux Secret Service returned invalid text"))
}

#[cfg(target_os = "linux")]
fn keychain_store(passphrase: &str) -> Result<(), Error> {
    let mut child = Command::new("secret-tool")
        .args([
            "store",
            "--label=Continuity Pack",
            "service",
            KEYRING_SERVICE,
            "account",
            KEYRING_USER,
        ])
        .stdin(Stdio::piped())
        .spawn()
        .map_err(|e| {
            Error::integration(format!(
                "Linux Secret Service is unavailable (install secret-tool): {e}"
            ))
        })?;
    child
        .stdin
        .as_mut()
        .expect("piped stdin")
        .write_all(passphrase.as_bytes())
        .map_err(|e| {
            Error::integration(format!(
                "could not send passphrase to Linux Secret Service: {e}"
            ))
        })?;
    let status = child
        .wait()
        .map_err(|e| Error::integration(format!("could not wait for Linux Secret Service: {e}")))?;
    if status.success() {
        Ok(())
    } else {
        Err(Error::integration(
            "Linux Secret Service rejected the passphrase",
        ))
    }
}

#[cfg(target_os = "linux")]
fn keychain_delete() -> Result<(), Error> {
    let status = Command::new("secret-tool")
        .args(["clear", "service", KEYRING_SERVICE, "account", KEYRING_USER])
        .status()
        .map_err(|e| {
            Error::integration(format!(
                "Linux Secret Service is unavailable (install secret-tool): {e}"
            ))
        })?;
    if status.success() {
        Ok(())
    } else {
        Err(Error::integration(
            "could not remove the Linux Secret Service entry",
        ))
    }
}

#[cfg(target_os = "macos")]
fn keychain_get() -> Result<String, Error> {
    let output = Command::new("security")
        .args([
            "find-generic-password",
            "-s",
            KEYRING_SERVICE,
            "-a",
            KEYRING_USER,
            "-w",
        ])
        .output()
        .map_err(|e| Error::integration(format!("macOS Keychain is unavailable: {e}")))?;
    if !output.status.success() || output.stdout.is_empty() {
        return Err(Error::integration("no passphrase found in macOS Keychain"));
    }
    String::from_utf8(output.stdout)
        .map_err(|_| Error::integration("macOS Keychain returned invalid text"))
}

#[cfg(target_os = "macos")]
fn keychain_store(passphrase: &str) -> Result<(), Error> {
    let status = Command::new("sh")
        .args(["-c", "security add-generic-password -U -s continuity-pack -a default -w \"$CONTINUITY_KEY_VALUE\""])
        .env("CONTINUITY_KEY_VALUE", passphrase)
        .status()
        .map_err(|e| Error::integration(format!("macOS Keychain is unavailable: {e}")))?;
    if status.success() {
        Ok(())
    } else {
        Err(Error::integration("macOS Keychain rejected the passphrase"))
    }
}

#[cfg(target_os = "macos")]
fn keychain_delete() -> Result<(), Error> {
    let status = Command::new("security")
        .args([
            "delete-generic-password",
            "-s",
            KEYRING_SERVICE,
            "-a",
            KEYRING_USER,
        ])
        .status()
        .map_err(|e| Error::integration(format!("macOS Keychain is unavailable: {e}")))?;
    if status.success() {
        Ok(())
    } else {
        Err(Error::integration(
            "could not remove the macOS Keychain entry",
        ))
    }
}

#[cfg(target_os = "windows")]
fn powershell(script: &str) -> Result<std::process::Output, Error> {
    Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", script])
        .output()
        .map_err(|e| Error::integration(format!("Windows Credential Manager is unavailable: {e}")))
}

#[cfg(target_os = "windows")]
fn keychain_get() -> Result<String, Error> {
    let output = powershell("$v=New-Object Windows.Security.Credentials.PasswordVault;$c=$v.Retrieve('continuity-pack','default');$c.RetrievePassword();[Console]::Out.Write($c.Password)")?;
    if !output.status.success() || output.stdout.is_empty() {
        return Err(Error::integration(
            "no passphrase found in Windows Credential Manager",
        ));
    }
    String::from_utf8(output.stdout)
        .map_err(|_| Error::integration("Windows Credential Manager returned invalid text"))
}

#[cfg(target_os = "windows")]
fn keychain_store(passphrase: &str) -> Result<(), Error> {
    let status = Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", "$v=New-Object Windows.Security.Credentials.PasswordVault;$c=New-Object Windows.Security.Credentials.PasswordCredential('continuity-pack','default',$env:CONTINUITY_KEY_VALUE);$v.Add($c)"])
        .env("CONTINUITY_KEY_VALUE", passphrase)
        .status()
        .map_err(|e| Error::integration(format!("Windows Credential Manager is unavailable: {e}")))?;
    if status.success() {
        Ok(())
    } else {
        Err(Error::integration(
            "Windows Credential Manager rejected the passphrase",
        ))
    }
}

#[cfg(target_os = "windows")]
fn keychain_delete() -> Result<(), Error> {
    let output = powershell("$v=New-Object Windows.Security.Credentials.PasswordVault;$c=$v.Retrieve('continuity-pack','default');$v.Remove($c)")?;
    if output.status.success() {
        Ok(())
    } else {
        Err(Error::integration(
            "could not remove the Windows Credential Manager entry",
        ))
    }
}

#[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
fn keychain_get() -> Result<String, Error> {
    Err(Error::integration(
        "OS keychain is not supported on this platform",
    ))
}
#[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
fn keychain_store(_: &str) -> Result<(), Error> {
    Err(Error::integration(
        "OS keychain is not supported on this platform",
    ))
}
#[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
fn keychain_delete() -> Result<(), Error> {
    Err(Error::integration(
        "OS keychain is not supported on this platform",
    ))
}

fn schedule(args: ScheduleArgs, json: bool) -> Result<(), Error> {
    if !args.target.is_dir() {
        return Err(Error::unavailable(format!(
            "target must already exist before scheduling: {}",
            args.target.display()
        )));
    }
    let (hour, minute) = parse_time(&args.daily_at)?;
    let executable = env::current_exe()
        .map_err(|e| Error::integration(format!("could not locate continuity executable: {e}")))?;
    let target = args.target.canonicalize().map_err(|e| {
        Error::integration(format!(
            "could not resolve target {}: {e}",
            args.target.display()
        ))
    })?;
    let cron = format!(
        "{minute} {hour} * * * {} --ci check --target {} --max-age-hours {} # continuity-pack-scheduled-check",
        shell_quote(&executable), shell_quote(&target), args.max_age_hours
    );
    if args.install {
        #[cfg(target_os = "windows")]
        return Err(Error::integration("automatic scheduler installation is not available on Windows; run the printed check command from Task Scheduler"));

        #[cfg(not(target_os = "windows"))]
        {
            let existing = Command::new("crontab")
                .arg("-l")
                .output()
                .map_err(|e| Error::integration(format!("could not run crontab: {e}")))?;
            let existing_text = if existing.status.success() {
                String::from_utf8_lossy(&existing.stdout).into_owned()
            } else {
                String::new()
            };
            let mut lines: Vec<&str> = existing_text
                .lines()
                .filter(|line| {
                    !line.contains("# continuity-pack-dry-read")
                        && !line.contains("# continuity-pack-scheduled-check")
                })
                .collect();
            lines.push(&cron);
            let new_table = format!("{}\n", lines.join("\n"));
            let mut child = Command::new("crontab")
                .arg("-")
                .stdin(Stdio::piped())
                .spawn()
                .map_err(|e| Error::integration(format!("could not start crontab: {e}")))?;
            child
                .stdin
                .as_mut()
                .expect("piped stdin")
                .write_all(new_table.as_bytes())
                .map_err(|e| Error::integration(format!("could not update crontab: {e}")))?;
            let status = child
                .wait()
                .map_err(|e| Error::integration(format!("could not wait for crontab: {e}")))?;
            if !status.success() {
                return Err(Error::integration("crontab rejected the schedule"));
            }
        }
    }
    emit(
        json,
        &serde_json::json!({"status": if args.install { "installed" } else { "preview" }, "schedule": cron, "failure_behavior": "non-zero exit with a specific stderr message"}),
    )
}

fn parse_time(value: &str) -> Result<(u8, u8), Error> {
    let Some((hour, minute)) = value.split_once(':') else {
        return Err(Error::invalid("--daily-at must use 24-hour HH:MM format"));
    };
    let hour: u8 = hour
        .parse()
        .map_err(|_| Error::invalid("--daily-at hour is invalid"))?;
    let minute: u8 = minute
        .parse()
        .map_err(|_| Error::invalid("--daily-at minute is invalid"))?;
    if hour > 23 || minute > 59 {
        return Err(Error::invalid("--daily-at must be a real 24-hour time"));
    }
    Ok((hour, minute))
}

fn shell_quote(path: &Path) -> String {
    format!("'{}'", path.to_string_lossy().replace('\'', "'\\''"))
}

use std::io::Write;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_schedule_times() {
        assert_eq!(parse_time("03:15").unwrap(), (3, 15));
        assert!(parse_time("24:00").is_err());
        assert!(parse_time("noon").is_err());
    }

    #[test]
    fn shell_quotes_paths() {
        assert_eq!(
            shell_quote(Path::new("/media/Owner's Disk")),
            "'/media/Owner'\\''s Disk'"
        );
    }
}
