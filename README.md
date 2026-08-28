# Continuity Pack

Continuity Pack is a local-first CLI for small businesses that need a recovery
handoff—not another backup subscription. It gathers configured invoices,
customer exports, and business records; records SHA-256 checksums; encrypts the
pack with authenticated encryption; writes a readable restore manifest; copies
only to a target you explicitly name; and dry-reads that target on schedule.

It does not administer databases, upload to hosted storage, or claim that an
archive check is a full application restore. You remain responsible for making
your application exports and periodically testing a real restore.

## Install

Download a release binary for your platform, or build from source:

```sh
cargo install --git https://github.com/B-Divyesh/sf-local-records-continuity continuity-pack --locked
continuity --help
```

Rust 1.85+ is required when building from source. The resulting executable is a
single binary. From an existing checkout, `cargo install --path
crates/continuity --locked` is equivalent. Releases begin at `0.1.0`.

## Usage

Start a folder with a documented configuration:

```sh
continuity init --config continuity.toml
```

Edit the generated `continuity.toml`, then make a pack. A target is never
assumed; `--target` must point to a local or mounted directory:

```sh
export CONTINUITY_PASSPHRASE='use-a-long-unique-passphrase'
continuity pack --config continuity.toml --target /media/offsite/backups
```

The command creates an encrypted `.cpack`, a plain-language `.manifest.txt`,
and a machine-readable `.receipt.json` beside it. Use `--json` for automation
and `--ci` to forbid prompts and require a non-interactive passphrase source.

Check the newest target pack without extracting it:

```sh
continuity check --target /media/offsite/backups --max-age-hours 26 --json
```

Verify a specific pack, or restore it into a new empty directory:

```sh
continuity verify /media/offsite/backups/2026-08-28T120000Z.cpack
continuity restore /media/offsite/backups/2026-08-28T120000Z.cpack \
  --output ./recovered-records
```

Install a scheduled dry-read with the OS scheduler. This command prints the
entry by default; `--install` changes the current user's crontab on Linux/macOS
after showing the exact command. On Windows, add an equivalent `continuity --ci
check ...` command to Task Scheduler:

```sh
continuity schedule --target /media/offsite/backups --daily-at 03:15
continuity schedule --target /media/offsite/backups --daily-at 03:15 --install
```

The scheduled `check` exits non-zero and writes a clear error to stderr when the
target is unavailable, stale, corrupt, or cannot be decrypted.

### Passphrases and OS keychains

Passphrases are resolved in this order: `--passphrase-file`,
`CONTINUITY_PASSPHRASE`, then an OS keychain entry saved by `continuity key
store`. Interactive terminal input is the final fallback unless `--ci` is set.

```sh
printf '%s' "$CONTINUITY_PASSPHRASE" | continuity key store --stdin
continuity key status
continuity key forget
```

Keychain storage uses macOS Keychain (`security`), Linux Secret Service
(`secret-tool`), or Windows Credential Manager. The CLI never writes a raw
passphrase to its configuration file.

### Exit codes

| Code | Meaning |
| ---: | --- |
| 0 | Pack or check succeeded |
| 2 | Invalid command/configuration |
| 3 | Missing file, target, or passphrase |
| 4 | Verification or freshness check failed |
| 5 | Keychain/scheduler integration failed |

Run `continuity <command> --help` for command-specific examples.

## Paid convenience tier

The complete pack, verify, check, and restore safety path is free. Continuity
Plus is a one-time purchase that adds a multi-location configuration workbook,
quarterly restore-drill worksheet, and staff handoff guide. It never gates core
export, recovery, accessibility, or failure reporting. The site checks that
Sociobot has enabled the product before sending a buyer to checkout, so an
unregistered product cannot lead to a dead payment route. License restoration
is available on the product site; Sociobot/Dodo is the merchant of record.

## Develop and verify

```sh
cargo test --workspace
cargo build --release --workspace
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty

npm ci
npm test
npm run build
```

`npm run build` is the factory build command. It compiles the CLI in release
mode, builds the static site, and places the deployable website at `dist/site/`
with `index.html` at that root. `npm run build:site` builds only the site.
Release builds use the production Sociobot API by default; explicitly set
`VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1` only for staging.

## Repository map

- `crates/continuity/` — Rust CLI and library
- `site/` — Vite + vanilla TypeScript landing/docs/demo
- `.factory/design.md` — topographic visual system and asset provenance
- `.factory/handoff.md` — verification and release handoff

## Privacy and security

There is no telemetry in the CLI or site. Packs stay local and are copied only
to the explicit target. Encryption uses XChaCha20-Poly1305 with an Argon2id
passphrase-derived key; every restored file is rechecked against its manifest.
Read the site’s `/privacy/` and `/terms/` pages for purchase-specific details.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
