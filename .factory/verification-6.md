# Independent verification 6 — FAIL

- Date: 2026-08-30
- Candidate commit: `5c09de18cf970dd7501038b5abcacd01be734fac`
- Live URL: <https://local-records-continuity.sociobot.in>
- Scope: clean checkout, live deployment, CLI package consumer, desktop and 390 px browser QA

## Verdict

**FAIL.** The candidate satisfies the claim suite, local quality gates, the
core CLI job, and the previously reported live rate-limit boundary. It does
not satisfy the PWA/demo acceptance contract: the documented direct demo URL
does not install a service worker and cannot reload offline after its first
visit. This makes the bundled sample unavailable offline to a catalog visitor
who opens `/demo/` directly.

## First-read gate — PASS

Cold-opening the live home page produced:

- What: “Build a recovery pack for local business records.”
- Who: “small businesses using self-hosted or local admin software”.
- First action: **Try it with sample data**, with an adjacent explanation that
  it opens the bookshop sample and temporary-folder command.

The first-screen action is a one-click link to `/demo/`. The demo has the
required persistent “Demo — sample data, nothing is saved here” banner, Reset
demo, and Start for real actions.

## Mandatory claims — PASS

From a clean clone, `npm ci` completed with 0 vulnerabilities. I then ran
every exact `test` command in `.factory/claims.json`, independently and
through the shipped demo entry points. All 14 passed:

`demo-sandbox`, `sample-demo-page`, `pack-artifacts`,
`authenticated-encryption`, `explicit-local-target`,
`loud-scheduled-check`, `restore-integrity`, `free-core-and-json`,
`passphrase-sources`, `offline-guide`, `browser-privacy`,
`protected-download-rate-limit`, `licensed-download`, and
`plus-price-and-checkout`.

The claims log is `/tmp/lrc-claims-Gsk1JJ/results.log` in this verifier
container. It ended with exit code 0. The visitor-facing landing copy and
README claims were cross-checked against this inventory; no additional
testable product promise was found unlisted.

## Clean local gates — PASS

```text
npm ci                                                     PASS (25 packages; 0 vulnerabilities)
npm test                                                   PASS
  Rust: 6 library + 2 binary + 7 CLI integration + 1 doctest
  CLI claims: 8 passed
  API: 9 passed
  Playwright: 27 passed, 3 intentionally skipped
npm run typecheck                                          PASS
npm run build                                              PASS (release CLI and dist/site)
cargo fmt --all -- --check                                 PASS
cargo clippy --workspace --all-targets -- -D warnings      PASS
npm audit --audit-level=high                               PASS (0 vulnerabilities)
cargo package --manifest-path crates/continuity/Cargo.toml
  --allow-dirty                                            PASS (29.2 KiB .crate)
```

There is no `verify-url.sh` in this checkout, so I performed its specified
title/lang/H1/main/alt/console checks with Playwright instead.

## CLI and package-consumer exercise — PASS

I installed the packaged crate into a fresh consumer root:

```text
tar -xf target/package/continuity-pack-0.1.0.crate <fresh-dir>
cargo install --path <fresh-dir>/continuity-pack-0.1.0 --root <fresh-root> --locked
```

The installed `continuity 0.1.0` completed `continuity --json demo` with
`sample-recovery-complete`, `file_count: 3`, and `verified: true`. It created
an isolated temporary workspace and performed pack → check → restore.

Recovery/error exercises from the installed binary behaved safely:

- `--ci check` with a passphrase and a nonexistent target exited 3 with
  “target is unavailable … it is never created automatically”.
- `pack` without `--target` exited 2 with Clap’s required-argument error.
- an invalid `schedule --daily-at 25:99` exited 2; a valid schedule emitted
  the exact non-mutating cron preview.

## Live deployment, privacy, headers, and performance — PASS

- A fresh production build produced the same public bytes as live production:
  all 19 served artifacts (HTML routes, hashed JS/CSS, assets, manifest,
  service worker, robots, sitemap, and 404) matched SHA-256. The deployment
  control file `staticwebapp.config.json` is intentionally not publicly
  served (404).
- Live home, demo, privacy, and terms pages returned 200. An unknown URL
  returned HTTP 404 with the designed page. All 14 crawled links returned 200
  or were explicit `mailto:` links.
- The protected endpoint passed a fresh fixed-window 60-request live burst:
  **20 × 403** requests were admitted to license verification and **40 × 429**
  were throttled. Every throttled response included `Retry-After`; the live
  policy was `20;w=60` with `RateLimit-Backend: shared-azure-blob`.
- Root CSP includes response-header `frame-ancestors 'none'`, `connect-src
  'self' https://api.sociobot.in`, HSTS, nosniff, strict-origin referrer,
  Permissions-Policy, immutable hashed assets, and no-cache service worker.
- Fresh desktop and 390 px home/demo flows generated only same-origin browser
  requests (nine requests in the exercised flow), no page errors, and no
  console errors on valid routes. No analytics, third-party scripts, fonts,
  or record-data upload was observed.
- Axe found zero serious/critical findings on Home, Demo, Privacy, Terms, and
  the designed 404. Desktop and 390 px have one H1 and main landmark; mobile
  has no horizontal overflow; first keyboard focus is the skip link and the
  visible focus outline is 3 px. The primary demo action is 48 px high at
  390 px. Reduced motion reduced map animations to 0.01 ms.
- Emitted first-load assets are well below budget: 2.94 KB gzip home JS,
  0.40 KB shared JS, 4.18 KB CSS, and no font payload. The hero is 146,138
  bytes. Original-asset provenance and the visual system are recorded in
  `.factory/design.md`.

## Release-blocking defect

### P1 — cold direct `/demo/` is not an offline-capable PWA sandbox

The documented demo entry point is `https://local-records-continuity.sociobot.in/demo/`.
In a fresh browser context opening that URL directly, after eight seconds:

```json
{"ready":"complete","secure":true,"has":true,"regs":[],"controller":null}
```

There was no service-worker registration. With that same fresh context set
offline, reload failed with `net::ERR_INTERNET_DISCONNECTED` and no H1 was
available. The demo page also has no offline status strip.

This is reproducible from the deployed candidate, not a local build artifact.
`site/src/demo.ts` has no service-worker registration or offline handler;
only the home module registers `/sw.js`. Visiting home and then using the
one-click action does install and control the service worker, which masks the
defect. Home itself passed `registration.update()` and an offline reload.

The demo-sandbox contract says `/demo/` is the direct catalog/verifier entry
point and that PWA offline claims must be demonstrable in the demo with sample
data available offline. The stated product claim is “The guide works offline
after your first visit.” A direct visit to the supplied demo is a first visit,
but it cannot make a subsequent offline reload. Register the shared service
worker and offline-state handling from the demo route too, then add a claim
test using a fresh context that opens `/demo/` directly, waits for the worker,
goes offline, and reloads the sample.

## Coverage boundaries

No real card payment, valid paid-license download, OS-keychain write/delete,
or crontab installation was performed. The free core, file/environment
passphrase paths, keychain status, schedule preview, invalid license behavior,
protected endpoint, and checkout-route guard were covered without changing
external state.

## Required re-verification

After repairing P1, rerun:

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run test:deployment:rate-limit
```

Then test a fresh browser context opened directly at `/demo/`: confirm a
controlling service worker, a successful offline reload with the demo H1 and
offline status, and no console/page errors.
