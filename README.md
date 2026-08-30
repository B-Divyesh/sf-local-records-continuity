# Continuity Pack

Continuity Pack is a local-first CLI for small businesses that need a recovery
handoff—not another backup subscription. It gathers configured business records
and records their SHA-256 checksums. It encrypts the pack, writes a restore
manifest, and checks the target on schedule.

It does not administer databases, upload to hosted storage, or claim that an
pack check is a full application restore. You remain responsible for making
your application exports and periodically testing a real restore.

## Try the bundled sample

Run the complete sample without configuration or an account:

```sh
continuity demo
```

The command writes three fictional Maple Street Books files into a unique
temporary workspace. It runs the same pack, check, and restore commands used
with your own files. It then prints the workspace path for inspection.
`continuity --demo` is an alias. `continuity --json demo` returns one JSON
result. Delete the printed directory to reset. Each new run uses a fresh
directory.

The browser preview is at
<https://local-records-continuity.sociobot.in/demo/?demo=1>. Sample source files are
in [`examples/maple-street-books/`](examples/maple-street-books/).

## Install

Build from source. Release binaries are not available yet:

```sh
cargo install --git https://github.com/B-Divyesh/sf-local-records-continuity continuity-pack --locked
continuity --help
```

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

Print a daily scheduled-check entry for review:

```sh
continuity schedule --target /media/offsite/backups --daily-at 03:15
```

A failed scheduled check returns a non-zero exit code. Its error names an
unavailable, stale, corrupt, or unreadable target.

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
(`secret-tool`), or Windows Credential Manager. The CLI does not write a raw
passphrase into its configuration or generated recovery files.

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

Pack, check, verify, and restore are free. Continuity
Plus is a one-time purchase that adds a multi-location configuration workbook,
quarterly restore-drill worksheet, and staff handoff guide. Pack, check, verify,
restore, exit codes, and JSON output do not require a Plus license. The site
confirms that checkout is available before opening Sociobot. An unavailable
product stays on this page. The site checks the license before each paid
download. Paid files are absent from the public build and offline cache. You can
save or remove a license on the product site. Sociobot/Dodo is the merchant of
record.

## Develop and verify

```sh
cargo test --workspace
cargo build --release --workspace
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty

npm ci
npm test
npm run build
```

`npm run build` builds the release CLI and static site. The deployable site is
in `dist/site/`. `npm run build:site` builds only the site.
Release builds use the production Sociobot API by default; explicitly set
`VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1` only for staging.
The managed download function uses `RATE_LIMIT_BLOB_BASE_URL`, a private
container SAS limited to create, add, and write permissions. Production keeps
that value in Static Web App settings, never in source control. Each fixed
one-minute window uses a separate append blob counter.

## Repository map

- `crates/continuity/` — Rust CLI and library
- `examples/` — the shipped Maple Street Books demo records
- `site/` — Vite + vanilla TypeScript landing/docs/demo
- `.factory/claims.json` — visitor claims and their exact regression commands
- `.factory/demo.md` — demo data and isolation contract
- `.factory/design.md` — topographic visual system and asset provenance
- `.factory/handoff.md` — verification and release handoff

## Privacy and security

There is no telemetry in the CLI or site. Packs stay local and are copied only
to the explicit target. Encryption uses XChaCha20-Poly1305 with an Argon2id
passphrase-derived key; every restored file is rechecked against its manifest.
Read the site’s `/privacy/` and `/terms/` pages for purchase-specific details.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
