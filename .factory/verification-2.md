# Independent verification 2 — FAIL

Date: 2026-08-28  
Work order: `local-records-continuity-verify-2`  
Candidate: `9792f68f13fe0acc2a63d88fbc163bac93e34e3d`  
Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**FAIL — do not release this candidate as a complete paid product.** The core,
local-first recovery CLI and the deployed static site pass the exercised
acceptance paths. The production site is genuinely this candidate and the
prior install-command and cache/security-header faults are fixed. However, its
visible `$39` Continuity Plus purchase link leads to a production billing
endpoint that still returns 404, so a customer cannot make the advertised
one-time purchase. This is a factory-owned registration failure, not a source
or deployment-staleness failure, but it blocks release.

## Release blocker

### P1 — production Plus checkout is not enabled

- The live purchase link is
  `https://api.sociobot.in/api/v1/products/local-records-continuity/checkout`.
- Fresh unauthenticated GET on 2026-08-28 returned HTTP **404** with
  `{"error":"enabled factory product","status":404}`.
- The live invalid-token verification endpoint returns HTTP 200 with
  `{"valid":false,"reason":"invalid","expires_at":null}`. This proves the
  deployed app has the correct production API origin and that the missing
  checkout is product registration/enabling, not a pilot-origin regression.
- Browser exercise of `?license=invalid-verification-token` stripped the token
  from the URL, locked the Plus downloads, and announced a recovery/purchase
  message. Free CLI documentation remained accessible.

Required factory action: register and enable the one-time `$39`
`local-records-continuity` product in the production Sociobot billing registry,
with this site's return URL, then require a fresh checkout request to redirect
to hosted checkout before changing the verdict.

## Candidate and deployment identity

The checkout was clean at the requested commit before dependency installation.
Fresh `npm run build` produced `dist/site/`. SHA-256 matched between its files
and the live deployment for `index.html`, both JS chunks, CSS, hero WebP,
`sw.js`, and `site.webmanifest`. In particular, both index files were
`6e154d2c5b8bd4bddd3e2c232c1d2b4a3e086c1c82c1f072814d6c1cfb211c61`.
The live result is therefore the candidate, not a stale deployment.

## Local quality gates

All commands passed from the clean candidate:

```sh
npm ci
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
npm run typecheck
cargo test --workspace
npm test
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
npm audit --audit-level=high
```

- `cargo test --workspace`: 4 library, 2 binary, 4 CLI integration tests, and
  1 doctest passed.
- `npm test`: those Rust tests plus 12 Playwright desktop/390px tests passed.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Production build emitted `target/release/continuity` and `dist/site/`.
- `cargo package` passed package verification and produced
  `target/package/continuity-pack-0.1.0.crate` (about 26 KB).

## CLI and packaged-consumer acceptance

Using a fresh `/tmp` fixture with invoice CSV, customer CSV, and a supporting
document plus an existing explicit target:

- `--json init`, `--ci --json pack`, `verify`, `check --max-age-hours 26`, and
  `restore` all succeeded. Pack output reported 3 files, SHA-256, and
  `verified:true`; restored files byte-compared to each source.
- The generated plain-language manifest identified the business, timestamp,
  encrypted pack hash/size, record count, and restore guidance.
- A wrong passphrase returned exit 4 and an authentication error. A missing
  target returned exit 3 and was not created. A 0-hour freshness bound returned
  exit 4 once the pack was older than zero seconds. Invalid `--daily-at 99:99`
  returned exit 2. A normal schedule preview emitted a quoted `--ci check`
  cron line with stated non-zero failure behavior.
- The packaged crate was unpacked to a separate clean consumer directory and
  installed with `cargo install --path ... --root ... --locked`. Its installed
  `continuity 0.1.0 --help` exposed `init`, `pack`, `verify`, `check`,
  `restore`, `schedule`, `key`, `--json`, and `--ci`.
- On this Linux host `key status` safely returned JSON `{"status":"missing",
  "available":false}`; platform keychain store/forget integration and actual
  crontab installation were not mutated by this verification.

## Browser, accessibility, privacy, PWA, and performance

- Fresh live Playwright checks on desktop and 390×844 mobile: exactly one h1
  and main landmark, no horizontal overflow, no console/page errors, and no
  initial requests outside `local-records-continuity.sociobot.in`.
- Keyboard-only first focus is the Skip-to-main link with a visible
  `rgb(180, 88, 32) solid 3px` outline. Demo tabs selected Verify on ArrowRight.
  Reduced-motion computes the map animation duration to `0.00001s`.
- Axe serious/critical findings: none on live `/`, `/privacy/`, or `/terms/`.
- `registration.update()` completed; the worker controlled the live scope.
  After offline mode and reload, the page heading remained available and the
  offline status strip was visible.
- Source scan and runtime request capture found no analytics, telemetry, CDN
  fonts/scripts, or CLI network client. The only optional runtime outbound
  request is license verification to the production Sociobot API after a
  supplied license.
- Live response policies are present: immutable one-year cache for hashed JS,
  CSS, and WebP; `sw.js` is `no-cache, no-store, must-revalidate`; manifest is
  `application/manifest+json`; and sampled responses carry HSTS,
  `X-Content-Type-Options: nosniff`, strict referrer policy, and
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- Built payloads: initial home JS 5,196 B plus 711 B shared JS; CSS 12,447 B;
  no font payload; hero WebP 146,138 B. All are within the stated budgets.
- Fresh live Lighthouse mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.1 s, LCP 1.6 s, TBT 50 ms, CLS 0. (The first
  runner attempt crashed its tab; retry with Chromium's
  `--disable-dev-shm-usage --disable-gpu` flags completed successfully.)

## Non-blocking limits

- CLI verification proves authenticated decryptability and per-file integrity,
  not a vendor-specific application import/restore. This is correctly stated
  in the CLI, manifest, and site.
- Platform-specific keychain write/delete behavior and cron mutation were
  deliberately not performed in this disposable Linux QA host.
