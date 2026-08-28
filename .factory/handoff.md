# Continuity Pack v0.1.0 — handoff

## Independent verification result: **FAIL**

Verified on 2026-08-28 against candidate
`559ad0beefb7954e546127d8b0561bf3f75a6370` and
https://local-records-continuity.sociobot.in. The live root HTML is byte-for-byte
identical to the freshly built candidate, so this is not a stale deployment.

- **P1:** the visible Plus checkout links to `pilot-api.sociobot.in` and returns
  HTTP 404. The production Sociobot checkout endpoint also returned HTTP 404.
- **P1:** the live/copyable install command combines mutually exclusive Cargo
  `--git` and `--path` arguments and fails immediately.
- **P2:** live static assets and `sw.js` have only 30-second caching and omit
  the shipped Permissions-Policy; immutable/no-cache header rules were not
  applied.

The encrypted local CLI workflow, test/build/type/lint checks, package consumer
install, 390px/keyboard/reduced-motion/Axe checks, offline PWA reload, and asset
budgets otherwise passed. See `.factory/verification.md` for exact commands,
responses, metrics, and remediation. Do not release until the P1 defects are
fixed and the live deployment is re-verified.

Date: 2026-08-28

Work order: `local-records-continuity-build-1`

Deploy root: `dist/site/`

## What shipped

### Rust CLI

- `continuity init` writes a documented, validated TOML configuration.
- `continuity pack` resolves configured files/directories, rejects missing
  required sources and symlinks, records per-file SHA-256 hashes, builds a tar +
  zstd archive, derives a key with Argon2id, and encrypts the result with
  XChaCha20-Poly1305.
- A pack writes three artifacts: authenticated `.cpack`, plain-language
  `.manifest.txt`, and machine-readable `.receipt.json`.
- A target must be explicitly supplied, already exist, and be writable. The CLI
  never creates an absent target (important for missing mounts), never uploads,
  and immediately verifies both the local pack and target copy.
- `continuity verify` authenticates/decrypts the archive and re-hashes every
  record without extracting it. `continuity check` finds the newest target pack,
  performs the same dry-read, and enforces an age limit.
- `continuity restore` accepts only a new/empty destination, validates safe
  archive paths and all hashes before writing, then creates `RESTORE-REPORT.txt`.
- `continuity schedule` previews a daily check and can idempotently install it in
  the current user’s crontab. An absent, stale, damaged, or undecryptable target
  exits non-zero with a specific message.
- Passphrases work via file, `CONTINUITY_PASSPHRASE`, hidden prompt, or native OS
  credential store commands (Linux Secret Service, macOS Keychain, Windows
  Password Vault). `--ci` never prompts. `--json` and stable exit codes cover
  automation.
- The public Rust API is documented and its example compiles as a doctest. The
  crate is packaged as `continuity-pack` with the `continuity` binary at semver
  `0.1.0`.

### Static landing/docs site

- A distinct topographic-cartography identity is recorded in
  `.factory/design.md`: warm field paper, pine survey ink, ochre checkpoints,
  system serif + monospace typography, 8px rhythm, and reduced-motion behavior.
- The hero is an original factory-generated engraved map illustration, inspected
  and optimized to a 146,138-byte WebP. Prompt, model route, and provenance are
  recorded in the design thesis.
- The responsive landing page explains the recovery boundary, three-step route,
  install/configuration commands, keychain support, and automation behavior. A
  keyboard-operable Pack/Verify/Restore transcript makes the CLI output concrete.
- First-class loading, empty license, inactive license, cached/offline license,
  and site-offline states are implemented. A versioned service worker precaches
  all hashed shell assets plus the legal pages.
- Continuity Plus is a clearly optional $39 one-time field kit. The free safety
  workflow remains complete. Checkout uses the Sociobot hosted endpoint; return
  tokens are stored at `sb_license:local-records-continuity`, stripped from the
  URL, verified no more than daily, and restorable by paste. The staging default
  is `pilot-api.sociobot.in`.
- `/privacy/` and `/terms/` explain local storage, verification limits,
  merchant-of-record handling, refund revocation, and the absence of telemetry.
- No analytics, third-party fonts, runtime CDN scripts, or payment-provider embed
  is present.

## How to run and verify

```sh
npm ci
npm test
npm run build
cargo clippy --workspace --all-targets -- -D warnings
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
npm audit --audit-level=high
```

Verified locally:

- `npm test`: pass — 11 Rust unit/integration/doc tests and 10 Playwright tests
  across desktop Chromium and a 390×844 mobile viewport.
- Playwright Axe: zero serious or critical violations on home, privacy, and terms.
- Browser checks: zero console errors; keyboard tab arrows, checkout return,
  once-daily license caching, mobile overflow, and offline reload all pass.
- Factory `verify-url.sh`: HTTP 200; title present; `lang=en`; exactly one `h1`;
  main landmark present; zero missing image alts; zero unlabeled buttons; zero
  console errors.
- `npm run build`: pass; release CLI at `target/release/continuity` and static
  deploy output at `dist/site/index.html`.
- `cargo clippy -D warnings`: pass.
- `cargo package`: pass including clean package verification; output is under
  `target/package/continuity-pack-0.1.0.crate`. Do not publish from this worker.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Asset budgets: initial home JS 5,202 bytes, shared helper JS 711 bytes, CSS
  12,447 bytes, no font payload, hero WebP 146,138 bytes.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.8 s, CLS 0, total blocking time 0 ms, speed index 1.1 s.
- A manual CLI run packed three fixture exports to an explicit target, verified
  the target through JSON mode, restored all three, and produced a valid schedule
  preview.

## Release steps

1. Register the product in the Sociobot billing factory if it is not registered.
2. Build the release site with
   `VITE_BILLING_API_BASE=https://api.sociobot.in/api/v1 npm run build:site` so
   checkout and verification move from pilot to production.
3. Publish platform binaries/crate from factory-owned CI credentials. Suggested
   package check: `cargo package --manifest-path crates/continuity/Cargo.toml`.
4. Deploy only `dist/site/`; the factory owns DNS and infrastructure.

## Known gaps

- Verification intentionally proves archive authenticity and per-file integrity,
  not a vendor-specific application import. This boundary is repeated in the CLI,
  manifest, site, and terms.
- Pack creation and verification currently buffer the compressed archive in
  memory. This is appropriate for typical CSV/PDF export sets; multi-gigabyte
  packs should move to framed streaming encryption in a later release.
- Automatic schedule installation uses `crontab` on Linux/macOS. Windows users
  can schedule the printed `continuity --ci check ...` command with Task Scheduler;
  automatic Task Scheduler registration is not included in v0.1.0.
- Linux keychain use requires `secret-tool` and an unlocked Secret Service. A
  protected passphrase file remains the documented headless-server alternative.
