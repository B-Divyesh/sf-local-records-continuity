//! Core pack, verification, and restore operations for Continuity Pack.
//!
//! The public surface is intentionally small. A typical embedding can load a
//! configuration and create a pack without invoking the CLI:
//!
//! ```no_run
//! use continuity_pack::{create_pack, Config, PackOptions};
//! use std::path::Path;
//!
//! let config = Config::from_path(Path::new("continuity.toml"))?;
//! let result = create_pack(PackOptions {
//!     config: &config,
//!     config_path: Path::new("continuity.toml"),
//!     target: Path::new("/media/offsite/backups"),
//!     passphrase: "a long unique passphrase",
//! })?;
//! println!("{}", result.target_pack.display());
//! # Ok::<(), continuity_pack::Error>(())
//! ```

use argon2::Argon2;
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    XChaCha20Poly1305, XNonce,
};
use chrono::{DateTime, Utc};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    fmt,
    fs::{self, File},
    io::{Cursor, Read, Write},
    path::{Component, Path, PathBuf},
};
use tar::{Archive, Builder, Header};
use thiserror::Error as ThisError;
use walkdir::WalkDir;

const MAGIC: &[u8; 8] = b"CPACK01\n";
const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 24;
const MIN_PASSPHRASE: usize = 12;

/// A failure with a stable process exit code.
#[derive(Debug, ThisError)]
#[error("{message}")]
pub struct Error {
    code: i32,
    message: String,
}

impl Error {
    /// Exit status recommended for CLI callers.
    pub fn exit_code(&self) -> i32 {
        self.code
    }

    fn config(message: impl Into<String>) -> Self {
        Self {
            code: 2,
            message: message.into(),
        }
    }

    fn missing(message: impl Into<String>) -> Self {
        Self {
            code: 3,
            message: message.into(),
        }
    }

    fn verify(message: impl Into<String>) -> Self {
        Self {
            code: 4,
            message: message.into(),
        }
    }

    #[doc(hidden)]
    pub fn integration(message: impl Into<String>) -> Self {
        Self {
            code: 5,
            message: message.into(),
        }
    }

    #[doc(hidden)]
    pub fn invalid(message: impl Into<String>) -> Self {
        Self::config(message)
    }

    #[doc(hidden)]
    pub fn unavailable(message: impl Into<String>) -> Self {
        Self::missing(message)
    }
}

/// A configured record source.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct RecordSource {
    pub label: String,
    pub path: PathBuf,
    #[serde(default = "default_required")]
    pub required: bool,
}

fn default_required() -> bool {
    true
}

/// The `continuity.toml` schema.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub business_name: String,
    #[serde(default = "default_output_dir")]
    pub output_dir: PathBuf,
    pub records: Vec<RecordSource>,
}

fn default_output_dir() -> PathBuf {
    PathBuf::from(".continuity/packs")
}

impl Config {
    /// Load and validate a TOML configuration.
    pub fn from_path(path: &Path) -> Result<Self, Error> {
        let raw = fs::read_to_string(path).map_err(|e| {
            Error::missing(format!("could not read config {}: {e}", path.display()))
        })?;
        let config: Self = toml::from_str(&raw)
            .map_err(|e| Error::config(format!("invalid config {}: {e}", path.display())))?;
        config.validate()?;
        Ok(config)
    }

    fn validate(&self) -> Result<(), Error> {
        if self.business_name.trim().is_empty() {
            return Err(Error::config("business_name cannot be empty"));
        }
        if self.records.is_empty() {
            return Err(Error::config("configure at least one [[records]] entry"));
        }
        let mut labels = BTreeSet::new();
        for record in &self.records {
            let label = safe_segment(&record.label)?;
            if !labels.insert(label) {
                return Err(Error::config(format!(
                    "duplicate record label: {}",
                    record.label
                )));
            }
        }
        Ok(())
    }
}

/// Arguments for [`create_pack`].
pub struct PackOptions<'a> {
    pub config: &'a Config,
    pub config_path: &'a Path,
    pub target: &'a Path,
    pub passphrase: &'a str,
}

/// Paths and counts produced by a pack operation.
#[derive(Debug, Clone, Serialize)]
pub struct PackResult {
    pub target_pack: PathBuf,
    pub target_manifest: PathBuf,
    pub target_receipt: PathBuf,
    pub file_count: usize,
    pub source_bytes: u64,
    pub encrypted_bytes: u64,
    pub sha256: String,
    pub verified: bool,
}

/// Result of a verification or scheduled check.
#[derive(Debug, Clone, Serialize)]
pub struct VerifyResult {
    pub pack: PathBuf,
    pub business_name: String,
    pub created_at: DateTime<Utc>,
    pub file_count: usize,
    pub source_bytes: u64,
    pub encrypted_bytes: u64,
    pub sha256: String,
    pub authenticated: bool,
    pub files_match: bool,
    pub age_hours: f64,
}

/// Result of restoring an archive.
#[derive(Debug, Clone, Serialize)]
pub struct RestoreResult {
    pub output: PathBuf,
    pub file_count: usize,
    pub source_bytes: u64,
    pub verified: bool,
}

impl fmt::Display for PackResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "RECOVERY PACK READY\nTarget: {}\nFiles: {} ({} bytes)\nEncrypted: {} bytes\nSHA-256: {}\nVerified: yes",
            self.target_pack.display(),
            self.file_count,
            self.source_bytes,
            self.encrypted_bytes,
            self.sha256
        )
    }
}

impl fmt::Display for VerifyResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "RECOVERY PACK VERIFIED\nPack: {}\nBusiness: {}\nCreated: {}\nAge: {:.1} hours\nFiles: {} / {} match\nAuthenticated: yes\nSHA-256: {}",
            self.pack.display(),
            self.business_name,
            self.created_at.to_rfc3339(),
            self.age_hours,
            self.file_count,
            self.file_count,
            self.sha256
        )
    }
}

impl fmt::Display for RestoreResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "RECOVERY PACK RESTORED\nOutput: {}\nFiles: {} ({} bytes)\nChecksums: all match\nNext: test these files in a safe copy of your application",
            self.output.display(),
            self.file_count,
            self.source_bytes
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Manifest {
    format_version: u8,
    business_name: String,
    created_at: DateTime<Utc>,
    files: Vec<ManifestEntry>,
    source_bytes: u64,
    restore_note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ManifestEntry {
    archive_path: String,
    bytes: u64,
    sha256: String,
}

#[derive(Debug, Clone)]
struct SourceFile {
    source: PathBuf,
    archive_path: String,
    bytes: u64,
    sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Receipt {
    format_version: u8,
    pack_file: String,
    business_name: String,
    created_at: DateTime<Utc>,
    encrypted_bytes: u64,
    sha256: String,
    verification: String,
}

/// Create, encrypt, copy, and immediately verify a recovery pack.
pub fn create_pack(options: PackOptions<'_>) -> Result<PackResult, Error> {
    validate_passphrase(options.passphrase)?;
    require_writable_target(options.target)?;
    let base = options
        .config_path
        .parent()
        .unwrap_or_else(|| Path::new("."));
    let sources = collect_sources(options.config, base)?;
    if sources.is_empty() {
        return Err(Error::missing(
            "no readable files matched the configured records",
        ));
    }

    let created_at = Utc::now();
    let source_bytes = sources.iter().map(|f| f.bytes).sum();
    let manifest = Manifest {
        format_version: 1,
        business_name: options.config.business_name.clone(),
        created_at,
        files: sources.iter().map(|file| ManifestEntry {
            archive_path: file.archive_path.clone(),
            bytes: file.bytes,
            sha256: file.sha256.clone(),
        }).collect(),
        source_bytes,
        restore_note: "Verification proves this pack decrypts and its files match their checksums. It is not a full application restore test.".into(),
    };

    let tar_bytes = build_tar(&manifest, &sources)?;
    let compressed = zstd::stream::encode_all(Cursor::new(tar_bytes), 6)
        .map_err(|e| Error::verify(format!("could not compress pack: {e}")))?;
    let encrypted = encrypt(&compressed, options.passphrase)?;
    let encrypted_hash = sha256_bytes(&encrypted);

    let output_dir = resolve(base, &options.config.output_dir);
    fs::create_dir_all(&output_dir).map_err(|e| {
        Error::missing(format!(
            "could not create output directory {}: {e}",
            output_dir.display()
        ))
    })?;
    let stem = format!(
        "{}-{}",
        slug(&options.config.business_name),
        created_at.format("%Y-%m-%dT%H%M%S%.9fZ")
    );
    let local_pack = output_dir.join(format!("{stem}.cpack"));
    atomic_write(&local_pack, &encrypted)?;
    verify_pack(&local_pack, options.passphrase)?;

    let manifest_text = readable_manifest(
        &manifest,
        &local_pack.file_name().unwrap_or_default().to_string_lossy(),
        &encrypted_hash,
        encrypted.len() as u64,
    );
    let local_manifest = output_dir.join(format!("{stem}.manifest.txt"));
    atomic_write(&local_manifest, manifest_text.as_bytes())?;
    let receipt = Receipt {
        format_version: 1,
        pack_file: local_pack
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        business_name: options.config.business_name.clone(),
        created_at,
        encrypted_bytes: encrypted.len() as u64,
        sha256: encrypted_hash.clone(),
        verification: "Authenticated decrypt plus per-file SHA-256; not a full application restore"
            .into(),
    };
    let local_receipt = output_dir.join(format!("{stem}.receipt.json"));
    let receipt_bytes = serde_json::to_vec_pretty(&receipt)
        .map_err(|e| Error::config(format!("could not serialize receipt: {e}")))?;
    atomic_write(&local_receipt, &receipt_bytes)?;

    let target_pack = options
        .target
        .join(local_pack.file_name().unwrap_or_default());
    let target_manifest = options
        .target
        .join(local_manifest.file_name().unwrap_or_default());
    let target_receipt = options
        .target
        .join(local_receipt.file_name().unwrap_or_default());
    copy_atomic(&local_pack, &target_pack)?;
    copy_atomic(&local_manifest, &target_manifest)?;
    copy_atomic(&local_receipt, &target_receipt)?;

    let verified = verify_pack(&target_pack, options.passphrase)?;
    Ok(PackResult {
        target_pack,
        target_manifest,
        target_receipt,
        file_count: verified.file_count,
        source_bytes,
        encrypted_bytes: encrypted.len() as u64,
        sha256: encrypted_hash,
        verified: true,
    })
}

/// Authenticate, decrypt, and hash every file in a pack without extracting it.
pub fn verify_pack(pack_path: &Path, passphrase: &str) -> Result<VerifyResult, Error> {
    validate_passphrase(passphrase)?;
    let encrypted = fs::read(pack_path)
        .map_err(|e| Error::missing(format!("could not read pack {}: {e}", pack_path.display())))?;
    let encrypted_hash = sha256_bytes(&encrypted);
    verify_receipt(pack_path, &encrypted_hash, encrypted.len() as u64)?;
    let compressed = decrypt(&encrypted, passphrase)?;
    let tar_bytes = zstd::stream::decode_all(Cursor::new(compressed))
        .map_err(|_| Error::verify("pack decrypted but its compressed contents are damaged"))?;
    let (manifest, actual) = inspect_tar(&tar_bytes)?;
    verify_entries(&manifest, &actual)?;
    let age = Utc::now().signed_duration_since(manifest.created_at);
    Ok(VerifyResult {
        pack: pack_path.to_path_buf(),
        business_name: manifest.business_name,
        created_at: manifest.created_at,
        file_count: manifest.files.len(),
        source_bytes: manifest.source_bytes,
        encrypted_bytes: encrypted.len() as u64,
        sha256: encrypted_hash,
        authenticated: true,
        files_match: true,
        age_hours: age.num_seconds().max(0) as f64 / 3600.0,
    })
}

/// Restore a pack into a new or empty directory, rechecking every file first.
pub fn restore_pack(
    pack_path: &Path,
    output: &Path,
    passphrase: &str,
) -> Result<RestoreResult, Error> {
    if output.exists() {
        let mut entries = fs::read_dir(output).map_err(|e| {
            Error::missing(format!(
                "could not read restore directory {}: {e}",
                output.display()
            ))
        })?;
        if entries.next().is_some() {
            return Err(Error::config(format!(
                "restore directory must be empty: {}",
                output.display()
            )));
        }
    } else {
        fs::create_dir_all(output).map_err(|e| {
            Error::missing(format!(
                "could not create restore directory {}: {e}",
                output.display()
            ))
        })?;
    }

    let encrypted = fs::read(pack_path)
        .map_err(|e| Error::missing(format!("could not read pack {}: {e}", pack_path.display())))?;
    let compressed = decrypt(&encrypted, passphrase)?;
    let tar_bytes = zstd::stream::decode_all(Cursor::new(compressed))
        .map_err(|_| Error::verify("pack decrypted but its compressed contents are damaged"))?;
    let (manifest, actual) = inspect_tar(&tar_bytes)?;
    verify_entries(&manifest, &actual)?;

    for entry in &manifest.files {
        let relative = safe_archive_path(&entry.archive_path)?;
        let destination = output.join(relative);
        if let Some(parent) = destination.parent() {
            fs::create_dir_all(parent).map_err(|e| {
                Error::missing(format!("could not create {}: {e}", parent.display()))
            })?;
        }
        atomic_write(
            &destination,
            actual.get(&entry.archive_path).expect("verified entry"),
        )?;
    }
    let restored_note = readable_manifest(
        &manifest,
        &pack_path.file_name().unwrap_or_default().to_string_lossy(),
        &sha256_bytes(&encrypted),
        encrypted.len() as u64,
    );
    atomic_write(&output.join("RESTORE-REPORT.txt"), restored_note.as_bytes())?;
    Ok(RestoreResult {
        output: output.to_path_buf(),
        file_count: manifest.files.len(),
        source_bytes: manifest.source_bytes,
        verified: true,
    })
}

/// Locate and fully verify the newest pack in a target directory.
pub fn check_target(
    target: &Path,
    passphrase: &str,
    max_age_hours: u64,
) -> Result<VerifyResult, Error> {
    require_target(target)?;
    let mut packs: Vec<PathBuf> = fs::read_dir(target)
        .map_err(|e| Error::missing(format!("target is unavailable {}: {e}", target.display())))?
        .filter_map(Result::ok)
        .map(|e| e.path())
        .filter(|p| p.extension().and_then(|e| e.to_str()) == Some("cpack"))
        .collect();
    packs.sort();
    let newest = packs.pop().ok_or_else(|| {
        Error::verify(format!(
            "no .cpack files found in target {}; create a pack first",
            target.display()
        ))
    })?;
    let result = verify_pack(&newest, passphrase)?;
    if result.age_hours > max_age_hours as f64 {
        return Err(Error::verify(format!(
            "newest pack is {:.1} hours old; maximum is {max_age_hours} hours",
            result.age_hours
        )));
    }
    Ok(result)
}

fn collect_sources(config: &Config, base: &Path) -> Result<Vec<SourceFile>, Error> {
    let mut files = Vec::new();
    let mut archive_paths = BTreeSet::new();
    for record in &config.records {
        let root = resolve(base, &record.path);
        if !root.exists() {
            if record.required {
                return Err(Error::missing(format!(
                    "required source is missing: {} ({})",
                    record.label,
                    root.display()
                )));
            }
            continue;
        }
        if root.is_symlink() {
            return Err(Error::config(format!(
                "source symlinks are not followed: {}",
                root.display()
            )));
        }
        let label = safe_segment(&record.label)?;
        if root.is_file() {
            let name = root.file_name().and_then(|v| v.to_str()).ok_or_else(|| {
                Error::config(format!(
                    "source name is not valid UTF-8: {}",
                    root.display()
                ))
            })?;
            push_source(
                &mut files,
                &mut archive_paths,
                &root,
                format!("records/{label}/{}", safe_segment(name)?),
            )?;
        } else if root.is_dir() {
            for entry in WalkDir::new(&root).follow_links(false).sort_by_file_name() {
                let entry = entry.map_err(|e| {
                    Error::missing(format!("could not walk {}: {e}", root.display()))
                })?;
                if entry.file_type().is_symlink() {
                    return Err(Error::config(format!(
                        "source symlinks are not followed: {}",
                        entry.path().display()
                    )));
                }
                if entry.file_type().is_file() {
                    let relative = entry.path().strip_prefix(&root).expect("walked child");
                    let safe = safe_relative_string(relative)?;
                    push_source(
                        &mut files,
                        &mut archive_paths,
                        entry.path(),
                        format!("records/{label}/{safe}"),
                    )?;
                }
            }
        } else if record.required {
            return Err(Error::missing(format!(
                "required source is not a regular file or directory: {}",
                root.display()
            )));
        }
    }
    files.sort_by(|a, b| a.archive_path.cmp(&b.archive_path));
    Ok(files)
}

fn push_source(
    files: &mut Vec<SourceFile>,
    paths: &mut BTreeSet<String>,
    source: &Path,
    archive_path: String,
) -> Result<(), Error> {
    if !paths.insert(archive_path.clone()) {
        return Err(Error::config(format!(
            "two sources map to the same pack path: {archive_path}"
        )));
    }
    let bytes = fs::read(source)
        .map_err(|e| Error::missing(format!("could not read source {}: {e}", source.display())))?;
    files.push(SourceFile {
        source: source.to_path_buf(),
        archive_path,
        bytes: bytes.len() as u64,
        sha256: sha256_bytes(&bytes),
    });
    Ok(())
}

fn build_tar(manifest: &Manifest, sources: &[SourceFile]) -> Result<Vec<u8>, Error> {
    let mut builder = Builder::new(Vec::new());
    let manifest_bytes = serde_json::to_vec_pretty(manifest)
        .map_err(|e| Error::config(format!("could not serialize manifest: {e}")))?;
    append_bytes(&mut builder, "MANIFEST.json", &manifest_bytes)?;
    append_bytes(
        &mut builder,
        "RESTORE.txt",
        manifest.restore_note.as_bytes(),
    )?;
    for source in sources {
        let bytes = fs::read(&source.source).map_err(|e| {
            Error::missing(format!(
                "source changed while packing {}: {e}",
                source.source.display()
            ))
        })?;
        if bytes.len() as u64 != source.bytes || sha256_bytes(&bytes) != source.sha256 {
            return Err(Error::verify(format!(
                "source changed while packing: {}; run pack again",
                source.source.display()
            )));
        }
        append_bytes(&mut builder, &source.archive_path, &bytes)?;
    }
    builder
        .finish()
        .map_err(|e| Error::verify(format!("could not finish archive: {e}")))?;
    builder
        .into_inner()
        .map_err(|e| Error::verify(format!("could not read archive: {e}")))
}

fn append_bytes(builder: &mut Builder<Vec<u8>>, path: &str, bytes: &[u8]) -> Result<(), Error> {
    let mut header = Header::new_gnu();
    header.set_size(bytes.len() as u64);
    header.set_mode(0o600);
    header.set_mtime(Utc::now().timestamp() as u64);
    header.set_cksum();
    builder
        .append_data(&mut header, path, Cursor::new(bytes))
        .map_err(|e| Error::verify(format!("could not add {path} to archive: {e}")))
}

fn inspect_tar(bytes: &[u8]) -> Result<(Manifest, BTreeMap<String, Vec<u8>>), Error> {
    let mut archive = Archive::new(Cursor::new(bytes));
    let mut manifest: Option<Manifest> = None;
    let mut actual = BTreeMap::new();
    let entries = archive
        .entries()
        .map_err(|_| Error::verify("archive index is damaged"))?;
    for entry in entries {
        let mut entry = entry.map_err(|_| Error::verify("archive entry is damaged"))?;
        let path = entry
            .path()
            .map_err(|_| Error::verify("archive contains an invalid path"))?
            .to_string_lossy()
            .into_owned();
        let mut data = Vec::new();
        entry
            .read_to_end(&mut data)
            .map_err(|_| Error::verify(format!("could not read archive entry {path}")))?;
        if path == "MANIFEST.json" {
            manifest = Some(
                serde_json::from_slice(&data)
                    .map_err(|_| Error::verify("encrypted manifest is invalid"))?,
            );
        } else if path.starts_with("records/") {
            safe_archive_path(&path)?;
            if actual.insert(path.clone(), data).is_some() {
                return Err(Error::verify(format!("duplicate archive entry: {path}")));
            }
        }
    }
    let manifest = manifest.ok_or_else(|| Error::verify("pack has no encrypted manifest"))?;
    Ok((manifest, actual))
}

fn verify_entries(manifest: &Manifest, actual: &BTreeMap<String, Vec<u8>>) -> Result<(), Error> {
    if manifest.format_version != 1 {
        return Err(Error::verify(format!(
            "unsupported manifest version: {}",
            manifest.format_version
        )));
    }
    if manifest.files.len() != actual.len() {
        return Err(Error::verify(format!(
            "file count mismatch: manifest says {}, pack contains {}",
            manifest.files.len(),
            actual.len()
        )));
    }
    let mut seen = BTreeSet::new();
    for expected in &manifest.files {
        safe_archive_path(&expected.archive_path)?;
        if !seen.insert(&expected.archive_path) {
            return Err(Error::verify(format!(
                "duplicate manifest path: {}",
                expected.archive_path
            )));
        }
        let bytes = actual.get(&expected.archive_path).ok_or_else(|| {
            Error::verify(format!("missing packed file: {}", expected.archive_path))
        })?;
        if bytes.len() as u64 != expected.bytes || sha256_bytes(bytes) != expected.sha256 {
            return Err(Error::verify(format!(
                "checksum mismatch: {}",
                expected.archive_path
            )));
        }
    }
    let actual_bytes: u64 = actual.values().map(|bytes| bytes.len() as u64).sum();
    if manifest.source_bytes != actual_bytes {
        return Err(Error::verify(format!(
            "source byte total mismatch: manifest says {}, pack contains {}",
            manifest.source_bytes, actual_bytes
        )));
    }
    Ok(())
}

fn encrypt(plaintext: &[u8], passphrase: &str) -> Result<Vec<u8>, Error> {
    let mut salt = [0_u8; SALT_LEN];
    let mut nonce = [0_u8; NONCE_LEN];
    OsRng.fill_bytes(&mut salt);
    OsRng.fill_bytes(&mut nonce);
    let key = derive_key(passphrase, &salt)?;
    let cipher = XChaCha20Poly1305::new((&key).into());
    let ciphertext = cipher
        .encrypt(XNonce::from_slice(&nonce), plaintext)
        .map_err(|_| Error::verify("could not encrypt pack"))?;
    let mut output = Vec::with_capacity(MAGIC.len() + SALT_LEN + NONCE_LEN + ciphertext.len());
    output.extend_from_slice(MAGIC);
    output.extend_from_slice(&salt);
    output.extend_from_slice(&nonce);
    output.extend_from_slice(&ciphertext);
    Ok(output)
}

fn decrypt(encrypted: &[u8], passphrase: &str) -> Result<Vec<u8>, Error> {
    if encrypted.len() < MAGIC.len() + SALT_LEN + NONCE_LEN + 16
        || &encrypted[..MAGIC.len()] != MAGIC
    {
        return Err(Error::verify("not a supported Continuity Pack file"));
    }
    let salt_start = MAGIC.len();
    let nonce_start = salt_start + SALT_LEN;
    let data_start = nonce_start + NONCE_LEN;
    let key = derive_key(passphrase, &encrypted[salt_start..nonce_start])?;
    let cipher = XChaCha20Poly1305::new((&key).into());
    cipher
        .decrypt(
            XNonce::from_slice(&encrypted[nonce_start..data_start]),
            &encrypted[data_start..],
        )
        .map_err(|_| Error::verify("authentication failed: wrong passphrase or damaged pack"))
}

fn derive_key(passphrase: &str, salt: &[u8]) -> Result<[u8; 32], Error> {
    let mut key = [0_u8; 32];
    Argon2::default()
        .hash_password_into(passphrase.as_bytes(), salt, &mut key)
        .map_err(|e| Error::verify(format!("could not derive encryption key: {e}")))?;
    Ok(key)
}

fn verify_receipt(pack: &Path, hash: &str, bytes: u64) -> Result<(), Error> {
    let Some(stem) = pack.file_stem().and_then(|s| s.to_str()) else {
        return Ok(());
    };
    let receipt_path = pack.with_file_name(format!("{stem}.receipt.json"));
    if !receipt_path.exists() {
        return Ok(());
    }
    let raw = fs::read(&receipt_path).map_err(|e| {
        Error::verify(format!(
            "could not read receipt {}: {e}",
            receipt_path.display()
        ))
    })?;
    let receipt: Receipt = serde_json::from_slice(&raw)
        .map_err(|_| Error::verify(format!("receipt is invalid: {}", receipt_path.display())))?;
    if receipt.sha256 != hash || receipt.encrypted_bytes != bytes {
        return Err(Error::verify("encrypted pack does not match its receipt"));
    }
    Ok(())
}

fn readable_manifest(
    manifest: &Manifest,
    pack_name: &str,
    encrypted_hash: &str,
    encrypted_bytes: u64,
) -> String {
    let mut text = format!(
        "CONTINUITY PACK — RESTORE MAP\n\nBusiness: {}\nCreated (UTC): {}\nPack file: {}\nPack SHA-256: {}\nEncrypted size: {} bytes\nRecords: {} files / {} source bytes\n\nWHAT THIS CHECK MEANS\nThis pack completed an authenticated decrypt and every file matched its recorded SHA-256.\nThis is not a full application restore test. Test a real restore on a safe system regularly.\n\nRESTORE ROUTE\n1. Keep this manifest beside the .cpack file.\n2. Run: continuity verify <pack.cpack>\n3. Restore only into a new empty folder.\n4. Import the recovered exports into a test copy of your application.\n5. Record the date and result of that application-level test.\n\nPACKED RECORDS\n",
        manifest.business_name, manifest.created_at.to_rfc3339(), pack_name, encrypted_hash,
        encrypted_bytes, manifest.files.len(), manifest.source_bytes
    );
    for file in &manifest.files {
        text.push_str(&format!(
            "- {} ({} bytes)\n  SHA-256 {}\n",
            file.archive_path, file.bytes, file.sha256
        ));
    }
    text
}

fn require_target(target: &Path) -> Result<(), Error> {
    if !target.exists() {
        return Err(Error::missing(format!(
            "target is unavailable: {} (it is never created automatically)",
            target.display()
        )));
    }
    if !target.is_dir() {
        return Err(Error::missing(format!(
            "target is not a directory: {}",
            target.display()
        )));
    }
    Ok(())
}

fn require_writable_target(target: &Path) -> Result<(), Error> {
    require_target(target)?;
    let probe = target.join(format!(".continuity-write-test-{}", std::process::id()));
    File::create(&probe)
        .and_then(|mut f| f.write_all(b"probe"))
        .and_then(|_| fs::remove_file(&probe))
        .map_err(|e| Error::missing(format!("target is not writable {}: {e}", target.display())))?;
    Ok(())
}

fn atomic_write(path: &Path, bytes: &[u8]) -> Result<(), Error> {
    let parent = path.parent().unwrap_or_else(|| Path::new("."));
    fs::create_dir_all(parent)
        .map_err(|e| Error::missing(format!("could not create {}: {e}", parent.display())))?;
    let tmp = parent.join(format!(
        ".{}.{}.part",
        path.file_name().unwrap_or_default().to_string_lossy(),
        std::process::id()
    ));
    {
        let mut file = File::create(&tmp)
            .map_err(|e| Error::missing(format!("could not create {}: {e}", tmp.display())))?;
        file.write_all(bytes)
            .and_then(|_| file.sync_all())
            .map_err(|e| Error::missing(format!("could not write {}: {e}", tmp.display())))?;
    }
    fs::rename(&tmp, path)
        .map_err(|e| Error::missing(format!("could not finalize {}: {e}", path.display())))
}

fn copy_atomic(source: &Path, destination: &Path) -> Result<(), Error> {
    if destination.exists() {
        return Err(Error::config(format!(
            "target file already exists; refusing to replace it: {}",
            destination.display()
        )));
    }
    let bytes = fs::read(source)
        .map_err(|e| Error::missing(format!("could not read {}: {e}", source.display())))?;
    atomic_write(destination, &bytes)
}

fn validate_passphrase(passphrase: &str) -> Result<(), Error> {
    if passphrase.chars().count() < MIN_PASSPHRASE {
        return Err(Error::config(format!(
            "passphrase must be at least {MIN_PASSPHRASE} characters"
        )));
    }
    Ok(())
}

fn safe_segment(value: &str) -> Result<String, Error> {
    let trimmed = value.trim();
    if trimmed.is_empty()
        || trimmed == "."
        || trimmed == ".."
        || trimmed.contains(['/', '\\', '\0'])
    {
        return Err(Error::config(format!(
            "unsafe record label or file name: {value:?}"
        )));
    }
    Ok(trimmed.to_owned())
}

fn safe_relative_string(path: &Path) -> Result<String, Error> {
    let mut parts = Vec::new();
    for component in path.components() {
        match component {
            Component::Normal(value) => {
                parts.push(safe_segment(value.to_str().ok_or_else(|| {
                    Error::config(format!("path is not valid UTF-8: {}", path.display()))
                })?)?)
            }
            _ => {
                return Err(Error::config(format!(
                    "unsafe source path: {}",
                    path.display()
                )))
            }
        }
    }
    Ok(parts.join("/"))
}

fn safe_archive_path(value: &str) -> Result<PathBuf, Error> {
    let path = Path::new(value);
    if !value.starts_with("records/") || value.contains('\\') || path.is_absolute() {
        return Err(Error::verify(format!("unsafe archive path: {value}")));
    }
    for component in path.components() {
        if !matches!(component, Component::Normal(_)) {
            return Err(Error::verify(format!("unsafe archive path: {value}")));
        }
    }
    Ok(path.to_path_buf())
}

fn resolve(base: &Path, path: &Path) -> PathBuf {
    if path.is_absolute() {
        path.to_path_buf()
    } else {
        base.join(path)
    }
}

fn slug(value: &str) -> String {
    let mut result = String::new();
    let mut dash = false;
    for ch in value.chars().flat_map(char::to_lowercase) {
        if ch.is_ascii_alphanumeric() {
            result.push(ch);
            dash = false;
        } else if !dash && !result.is_empty() {
            result.push('-');
            dash = true;
        }
    }
    let result = result
        .trim_end_matches('-')
        .to_owned()
        .chars()
        .take(48)
        .collect::<String>()
        .trim_end_matches('-')
        .to_owned();
    if result.is_empty() {
        "records".into()
    } else {
        result
    }
}

fn sha256_bytes(bytes: &[u8]) -> String {
    hex::encode(Sha256::digest(bytes))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn fixture() -> (tempfile::TempDir, PathBuf, Config) {
        let temp = tempdir().unwrap();
        fs::create_dir(temp.path().join("exports")).unwrap();
        fs::write(
            temp.path().join("exports/invoices.csv"),
            "number,total\nINV-1,42\n",
        )
        .unwrap();
        fs::write(temp.path().join("exports/customers.csv"), "name\nAda Ltd\n").unwrap();
        let config_path = temp.path().join("continuity.toml");
        let config = Config {
            business_name: "Maple Street Books".into(),
            output_dir: PathBuf::from("packs"),
            records: vec![RecordSource {
                label: "business-exports".into(),
                path: PathBuf::from("exports"),
                required: true,
            }],
        };
        fs::write(&config_path, toml::to_string(&config).unwrap()).unwrap();
        (temp, config_path, config)
    }

    #[test]
    fn pack_verify_restore_round_trip() {
        let (temp, config_path, config) = fixture();
        let target = temp.path().join("target");
        fs::create_dir(&target).unwrap();
        let packed = create_pack(PackOptions {
            config: &config,
            config_path: &config_path,
            target: &target,
            passphrase: "a very long test passphrase",
        })
        .unwrap();
        assert!(packed.verified);
        assert_eq!(packed.file_count, 2);
        let verified = verify_pack(&packed.target_pack, "a very long test passphrase").unwrap();
        assert!(verified.authenticated && verified.files_match);
        let restored = temp.path().join("restore");
        restore_pack(
            &packed.target_pack,
            &restored,
            "a very long test passphrase",
        )
        .unwrap();
        assert_eq!(
            fs::read_to_string(restored.join("records/business-exports/invoices.csv")).unwrap(),
            "number,total\nINV-1,42\n"
        );
        assert!(restored.join("RESTORE-REPORT.txt").exists());
    }

    #[test]
    fn corruption_and_wrong_password_fail_authentication() {
        let (temp, config_path, config) = fixture();
        let target = temp.path().join("target");
        fs::create_dir(&target).unwrap();
        let packed = create_pack(PackOptions {
            config: &config,
            config_path: &config_path,
            target: &target,
            passphrase: "a very long test passphrase",
        })
        .unwrap();
        assert_eq!(
            verify_pack(&packed.target_pack, "another wrong password")
                .unwrap_err()
                .exit_code(),
            4
        );
        let mut bytes = fs::read(&packed.target_pack).unwrap();
        let last = bytes.len() - 1;
        bytes[last] ^= 1;
        fs::write(&packed.target_pack, bytes).unwrap();
        assert_eq!(
            verify_pack(&packed.target_pack, "a very long test passphrase")
                .unwrap_err()
                .exit_code(),
            4
        );
    }

    #[test]
    fn unavailable_target_is_never_created() {
        let (temp, config_path, config) = fixture();
        let target = temp.path().join("missing-mount");
        let error = create_pack(PackOptions {
            config: &config,
            config_path: &config_path,
            target: &target,
            passphrase: "a very long test passphrase",
        })
        .unwrap_err();
        assert_eq!(error.exit_code(), 3);
        assert!(!target.exists());
    }

    #[test]
    fn rejects_unsafe_labels() {
        let (_, _, mut config) = fixture();
        config.records[0].label = "../escape".into();
        assert_eq!(config.validate().unwrap_err().exit_code(), 2);
    }
}
