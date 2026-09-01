# Independent verification 11 — FAIL

- Date: 2026-09-01
- Work order: `local-records-continuity-verify-11`
- Candidate commit: `cb9ca4161af7f683ffa1fb7ed2305e83b137ca93`
- Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**FAIL — do not release this candidate.** The clean-clone claim gate, CLI,
package consumer, static deployment, browser privacy/accessibility checks, and
managed download rate limit all passed. The deployed one-click sample URL,
`/demo/?demo=1`, does not reload offline after its first visit: it renders the
designed 404 page rather than the sample preview. This violates the declared
`offline-guide` claim and the demo-sandbox requirement that offline claims work
inside the direct `?demo=1` demo. It is release-blocking.

No product code was modified during verification.

## Defects by severity

| Severity | Finding | Exact evidence | Required correction |
| --- | --- | --- | --- |
| Release blocker | The actual one-click/direct demo URL does not work offline. | Fresh Chromium context: visit `https://local-records-continuity.sociobot.in/demo/?demo=1`, wait for `navigator.serviceWorker.ready`, confirm an active controlling `/sw.js`, set the context offline, then reload. Navigation returned HTTP 200 from the service worker but the rendered H1 was **“This page does not exist.”** and the offline banner was absent. The same probe at `/demo/` (without query) rendered **“Try a recovery pack with sample records.”** offline. | Make the service worker’s offline navigation lookup normalize or ignore the `?demo=1` search component, then add a claim test that begins at the exact first-action URL and reloads it offline. Re-run the full claim manifest from clean clones and live PWA verification. |

There were no additional high-, medium-, or low-severity findings.

## Mandatory claims gate — run first from clean clones

`.factory/claims.json` exists and declares 16 claims. Before `npm ci`, I ran
`node --test tests/clean-clone-claims.test.mjs`. It created an independent
no-`node_modules` clone for every manifest entry and executed each exact
declared command unchanged. Result: **1/1 regression runner passed; all 16/16
claims passed** in 80.3 seconds.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `sample-demo-page` | PASS |
| `pack-artifacts` | PASS |
| `authenticated-encryption` | PASS |
| `explicit-local-target` | PASS |
| `loud-scheduled-check` | PASS |
| `restore-integrity` | PASS |
| `free-core-and-json` | PASS |
| `passphrase-sources` | PASS |
| `schedule-preview` | PASS |
| `license-restoration` | PASS |
| `offline-guide` | PASS locally, but contradicted by the deployed `?demo=1` path above |
| `browser-privacy` | PASS |
| `protected-download-rate-limit` | PASS |
| `licensed-download` | PASS |
| `plus-price-and-checkout` | PASS |

The claim test is incomplete for the direct URL the landing action opens. Its
local passing result does not establish the claimed deployed behavior.

## Cold first read and demo

The cold live first screen is clear in plain words:

- It does: **“Build a recovery pack for local business records.”**
- It is for: small businesses using self-hosted or local admin software.
- First action: **“Try it with sample data.”** The adjacent text says it opens
  the bookshop sample and its temporary-folder demo command.

The action is visible at desktop and 390 px, opens `/demo/?demo=1` in one click,
and the online demo displays its sample banner, reset control, and Start for
real link. It is the same direct URL that fails the offline reload check.

## Local quality gates and CLI/consumer exercise

All commands below used the requested candidate commit and passed:

```text
npm ci                                                        PASS; 24 packages, 0 vulnerabilities
npm test                                                      PASS
  rustfmt / clean-clone claims / Rust / CLI / API / site       PASS
  Rust tests                                                   6 library + 2 binary + 7 integration + 1 doctest
  CLI claim tests                                              9 passed
  managed API tests                                            10 passed
  local Playwright                                             36 passed, 6 intentional live-scope skips
npm run typecheck                                              PASS
cargo clippy --workspace --all-targets -- -D warnings          PASS
npm run build                                                  PASS; release CLI and dist/site
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty  PASS
```

The fresh packed-crate consumer check extracted
`continuity-pack-0.1.0.crate`, installed it into a new temporary root with
`cargo install --path ... --locked`, and ran `continuity --version`, helpful
`--help`, and `continuity --ci --json demo`. The installed command reported
`status: sample-recovery-complete` and `verified: true`.

The release CLI is 2.5 MiB. The sample flow created encrypted pack, manifest,
and receipt artifacts, then checked and restored all three Maple Street Books
files. Manual invalid/recovery checks also passed: an unavailable target
returned JSON exit 3 and said it is never created automatically; `pack` without
the required `--target` returned exit 2 with actionable Clap help.

## Live deployment, privacy, accessibility, performance, and identity

- All 18 deployed public candidate files — HTML routes, hashed assets, service
  worker, manifest, images, icon, robots, and sitemap — SHA-256 matched the
  fresh `dist/site` build byte-for-byte. The static deployment is the requested
  candidate.
- `GET /api/build` returned 200/no-store with version `0.1.0`, release
  `local-records-continuity-repair-9`, and
  `X-Continuity-API-Build: local-records-continuity-repair-9`, matching the
  managed API identity embedded in this candidate.
- Fresh desktop and 390px cold-browser probes found `lang=en`, the expected
  title/H1, visible first action, keyboard Arrow navigation from Pack to Check,
  no console/page errors, and zero axe serious/critical findings on Home and
  Demo. The request log for Home → Demo had only the product origin; no
  analytics, third-party fonts/scripts, or record-data requests occurred.
- Response headers include CSP with response-header `frame-ancestors 'none'`,
  HSTS, `nosniff`, strict-origin referrer policy, and denied camera/microphone/
  geolocation. HTML is revalidated at 30 seconds; hashed assets are immutable
  for one year; `/sw.js` is no-cache/no-store.
- The service worker registers, controls the page, and `registration.update()`
  completes. `/demo/` works offline; `/demo/?demo=1` does not, which is the
  blocker above.
- The final bundle is well within budget: Home route JS 6,898 bytes plus shared
  JS 2,709 bytes (about 4.1 KiB gzip); CSS 16,608 bytes (4.6 KiB gzip).
- Fresh Lighthouse 12.8.2 mobile against live Home: Performance **100**,
  Accessibility **100**, LCP **1,513 ms**, TBT **38 ms**, CLS **0**.

## Managed endpoint allowance

`npm run test:deployment:rate-limit` passed against live production. After a
fresh fixed window, 60 concurrent protected-download POSTs for one client
license yielded exactly **20** admitted requests (403 for the fixture license)
and **40** 429 responses. Every response had `RateLimit-Policy: 20;w=60` and
`RateLimit-Backend: shared-azure-blob`; every 429 had a positive `Retry-After`.
An immediately repeated fixture request returned 429 with `Retry-After: 50`.
Anonymous and reserved Authorization-header requests return 401; invalid
product-license requests return 403.

## Retest

From a clean clone, first run every command in `.factory/claims.json` without
manual setup. Then run:

```sh
npm ci
npm test
npm run typecheck
cargo clippy --workspace --all-targets -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
npm run test:deployment:rate-limit
```

Finally use a fresh browser context at the exact landing-action URL
`/demo/?demo=1`, wait for the service worker, go offline, reload, and confirm
the demo H1 and offline banner remain present.
