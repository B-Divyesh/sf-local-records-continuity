# Independent verification 9 — FAIL

- Date: 2026-08-30
- Work order: `local-records-continuity-verify-9`
- Candidate commit: `461981a1524997439ec7238b9173c14b61adc426`
- Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**FAIL.** The candidate is functionally strong and the live deployment matches
the candidate static artifact, but a required local quality gate fails:
`cargo fmt --all -- --check` exits 1. Rustfmt reports an unformatted closure in
`crates/continuity/src/main.rs` around line 680. The factory acceptance contract
requires available lint and formatting checks to pass, so this is release
blocking even though product behavior tests pass.

## Blocking defect

| Severity | Finding | Evidence | Required correction |
| --- | --- | --- | --- |
| Release blocker | Rust source is not rustfmt-clean. | `cargo fmt --all -- --check` reports a diff in `crates/continuity/src/main.rs:680`, changing only the wrapping of a `.filter(...)` closure. | Run `cargo fmt --all`, commit the formatting-only edit, then rerun the full gates. |

No product code was modified during this verification.

## Mandatory claims — first gate

After `npm ci`, before broader QA, every exact `test` command in
`.factory/claims.json` was executed sequentially from this checkout. All 16
passed:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `sample-demo-page` | PASS on desktop and 390 px |
| `pack-artifacts` | PASS |
| `authenticated-encryption` | PASS |
| `explicit-local-target` | PASS |
| `loud-scheduled-check` | PASS |
| `restore-integrity` | PASS |
| `free-core-and-json` | PASS |
| `passphrase-sources` | PASS |
| `schedule-preview` | PASS |
| `license-restoration` | PASS on desktop and 390 px |
| `offline-guide` | PASS on desktop and 390 px |
| `browser-privacy` | PASS on desktop and 390 px |
| `protected-download-rate-limit` | PASS |
| `licensed-download` | PASS |
| `plus-price-and-checkout` | PASS on desktop and 390 px |

The CLI claims use the bundled Maple Street Books sample through `continuity
demo` in a fresh operating-system temporary workspace. Browser claims use the
one-click `/demo/` sandbox. The required claims file exists; no claim command
failed.

## Cold first read

An uncached live browser view answers all mandatory questions in plain words:
“Build a recovery pack for local business records.” It says it is for small
businesses using self-hosted or local admin software and turns exports into a
recovery pack they can test. The first primary action is **Try it with sample data**,
with adjacent text saying it opens the bookshop sample and temporary folder demo
command. Clicking it once opens `/demo/?demo=1`, whose persistent banner says
“Demo — sample data, nothing is saved here” and includes Reset demo and Start
for real. This gate passes on desktop and at 390 px.

## Local build, tests, lint, package, and CLI

```text
npm ci                                      PASS; 24 packages installed, 0 vulnerabilities
npm test                                    PASS
  Rust library/binary/integration/doctest   6 / 2 / 7 / 1 passed
  CLI claims                                9 passed
  API tests                                 10 passed
  local Playwright                          36 passed, 6 expected deployment-only skips
npm run typecheck                           PASS
cargo clippy --workspace --all-targets -- -D warnings  PASS
cargo fmt --all -- --check                  FAIL (one formatting diff; release blocker)
npm run build                               PASS; release CLI and dist/site produced
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty  PASS
```

The package command verified and packed 12 files: 111.9 KiB unpacked / 28.9 KiB
compressed. I installed the candidate into a fresh temporary consumer root with
`cargo install --path crates/continuity --root <fresh-root>`. Its public
`continuity --help` worked; `continuity --json demo` returned a verified,
restored Maple Street Books run in a unique temporary workspace. `continuity
pack` without `--target` exited 2 before writing anything, with the documented
actionable error. Claims cover corrupt, stale, unavailable, wrong-passphrase,
and restore recovery paths.

The production build's combined JavaScript gzip size is 4,185 bytes; CSS gzip
is 4,519 bytes. No font payload is shipped. These are within static budgets.

## Live deployment, privacy, PWA, accessibility, and identity

- `PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test`:
  **40 passed**, 2 expected desktop-only skips. It covered desktop and 390 px,
  live 404/API checks, keyboard navigation, visible focus, touch targets,
  reduced motion, service-worker update/offline reload, and axe.
- Axe reported zero serious or critical violations. Home, Demo, Privacy, Terms,
  and 404 each have `lang=en`, one H1, a main landmark, and no console/page
  errors. At 390 px there was no horizontal overflow. Demo tabs work with arrow
  keys; route navigation restores focus to the H1.
- Fresh Home → Demo request logging observed only the product origin. No
  analytics, third-party scripts/fonts, or record-data request occurred. The
  CLI no-socket privacy claim also passed its blocked-socket harness.
- A fresh direct Demo visit registered and controlled one worker at `/sw.js`.
  `registration.update()` completed; when offline, Demo and Home reloaded from
  cache, real-storage sentinels remained unchanged, and only `demo:` was used.
- Live Home, Demo, Privacy, Terms, 404, service worker, Home JS, CSS, hero, and
  webmanifest SHA-256 hashes exactly match the local candidate build. The live
  managed API identifies `local-records-continuity-polish-1`, version 0.1.0.
- Headers include HSTS, `X-Content-Type-Options: nosniff`, referrer and
  permissions policies, and response-header CSP with `frame-ancestors 'none'`.
  HTML revalidates after 30 seconds; hashed JS/CSS/assets are immutable one
  year; `/sw.js` is `no-cache, no-store, must-revalidate`.

## Managed endpoint allowance

`npm run test:deployment:rate-limit` waited for a fresh fixed window and made
60 concurrent protected-download requests from one client. It observed exactly
**20 × 403** admitted requests and **40 × 429** throttled requests. Every
response carried `RateLimit-Policy: 20;w=60` and
`RateLimit-Backend: shared-azure-blob`; every 429 included positive
`Retry-After`. The documented and observed allowance is **20 requests per
client in a fixed 60-second window**. No real license or paid file was
accessed: anonymous and reserved-header requests returned 401 and an invalid
product-license header returned 403.

## Retest command

After the formatting-only correction, run:

```sh
npm ci
npm test
npm run typecheck
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test
npm run test:deployment:rate-limit
```

