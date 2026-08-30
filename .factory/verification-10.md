# Independent verification 10 — FAIL

- Date: 2026-08-30
- Work order: `local-records-continuity-verify-10`
- Candidate commit: `47416e07e394f9eb434806f6f40b01485fb60390`
- Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**FAIL.** The installed product, packaged CLI, and live deployment are otherwise
release-ready, but the mandatory clean-clone claims gate fails. Before any
dependency installation, 6 of the 16 exact commands in
`.factory/claims.json` exit 127 because `npm run build:site` cannot find
`vite`. The work order says any failing claim test is release blocking.

No product code was modified during this verification.

## Defects by severity

| Severity | Finding | Exact evidence | Required correction |
| --- | --- | --- | --- |
| Release blocker | Six declared browser/site claim commands are not runnable from the clean clone before setup. | At clean candidate HEAD with no `node_modules`, `sample-demo-page`, `license-restoration`, `offline-guide`, `browser-privacy`, `licensed-download`, and `plus-price-and-checkout` each exited 127 at their declared `npm run build:site` step: `sh: 1: vite: not found`. The other 10 declared commands passed in that same initial sequence. | Make every declared claim command self-contained from the required clean state, or revise the acceptance workflow so dependency installation is explicitly allowed before the claims gate; rerun all 16 commands first. |
| Low | README has a grammatical error in an important limitation. | The introduction says “does not claim that an pack check is a full application restore.” | Change “an pack check” to “a pack check.” |

No high- or medium-severity product defect was found.

## Mandatory claims gate

The required `.factory/claims.json` exists and lists 16 claims. I ran every
listed `test` command before installing dependencies, in manifest order.

| Claim | Clean-clone first run | After `npm ci` |
| --- | --- | --- |
| `demo-sandbox` | PASS | PASS |
| `sample-demo-page` | **FAIL — exit 127, `vite: not found`** | PASS, desktop and 390 px |
| `pack-artifacts` | PASS | PASS |
| `authenticated-encryption` | PASS | PASS |
| `explicit-local-target` | PASS | PASS |
| `loud-scheduled-check` | PASS | PASS |
| `restore-integrity` | PASS | PASS |
| `free-core-and-json` | PASS | PASS |
| `passphrase-sources` | PASS | PASS |
| `schedule-preview` | PASS | PASS |
| `license-restoration` | **FAIL — exit 127, `vite: not found`** | PASS, desktop and 390 px |
| `offline-guide` | **FAIL — exit 127, `vite: not found`** | PASS, desktop and 390 px |
| `browser-privacy` | **FAIL — exit 127, `vite: not found`** | PASS, desktop and 390 px |
| `protected-download-rate-limit` | PASS | PASS |
| `licensed-download` | **FAIL — exit 127, `vite: not found`** | PASS |
| `plus-price-and-checkout` | **FAIL — exit 127, `vite: not found`** | PASS, desktop and 390 px |

After `npm ci`, all 16 exact claim commands pass. This confirms that the
failure is the clean-clone command contract, not the claimed product behavior.
The landing page and README claim-like statements are covered by the manifest;
no material unlisted claim was found.

## Cold first read and demo

The live first screen passes the plain-words gate:

- What it does: “Build a recovery pack for local business records.”
- Who it is for: small businesses using self-hosted or local admin software.
- What to click first: **Try it with sample data**.

The primary action is visible without scrolling on desktop and 390 px. One
click opens `/demo/?demo=1`, immediately shows the Maple Street Books recovery
preview, and keeps the banner “Demo — sample data, nothing is saved here” with
Reset demo and Start for real controls. Demo state uses only `demo:` session
keys and preserves a sentinel real license.

## Local quality gates

```text
candidate identity                            PASS; exact requested commit, clean baseline
npm ci                                       PASS; 24 packages, 0 vulnerabilities
npm test                                     PASS
  Rust library / binary / integration        6 / 2 / 7 passed
  Rust doctest                               1 passed
  CLI claim suite                            9 passed
  managed API suite                          10 passed
  local Playwright                           36 passed, 6 intentional scope skips
npm run typecheck                            PASS
cargo fmt --all -- --check                   PASS (included in npm test)
cargo clippy --workspace --all-targets -- -D warnings  PASS
npm run build                                PASS; release CLI and dist/site produced
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty  PASS
```

The crate package contains 12 files and is 111.9 KiB unpacked / 29.0 KiB
compressed. I extracted that package, installed it with `cargo install --path`
into a fresh temporary consumer root and ran its installed `continuity` binary
from an unrelated empty directory. `--version`, `--help`, and `--json demo`
passed; the demo restored and verified all three bundled records without
writing in the caller directory.

## Independent CLI workflow and recovery paths

A fresh representative Maple Street Books run passed pack, specific-pack
verify, newest-target check, and restore. The target path contained spaces.
Three target artifacts were created, JSON output parsed, and all restored files
matched the source bytes.

A boundary run also passed with a zero-byte CSV, a 20 MiB file, and a Unicode
filename. It restored 5 files / 20,972,092 source bytes byte-for-byte.

The following invalid and recovery cases produced the documented actionable
JSON errors and exact exit classes:

- short passphrase: 2;
- missing CI passphrase: 3;
- missing required source: 3;
- unavailable target: 3 and no target creation;
- target with no pack: 4;
- receipt/pack corruption: 4;
- wrong passphrase: 4;
- non-empty restore destination: 2;
- zero-hour freshness boundary: 4 with guidance to choose a positive limit;
- invalid scheduled time `24:00`: 2.

## Live deployment, privacy, PWA, and accessibility

`PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx
playwright test` passed all 40 applicable tests in desktop and 390 px projects;
2 project-scope skips were expected. The run covered live 404 and API identity,
one-click demo isolation, keyboard tabs and browser history focus, license
recovery/error states, 44 px targets, service-worker update and offline reload,
and response policy.

- Factory `verify-url.sh`: HTTP 200, 790 ms network-idle load, `lang=en`, one
  H1, one main landmark, all images with alt text, all buttons named, and no
  console errors.
- Playwright axe: zero serious or critical findings on Home, Demo, Privacy,
  Terms, and 404 in both viewports.
- Keyboard-only probe: logical tab order begins with the skip link; interactive
  elements expose a 3 px visible focus outline and are operable.
- Reduced motion: the media query matches and the two remaining entrance
  effects resolve in 0.01 ms; nothing loops.
- 200% text on all five routes: no horizontal document overflow and H1/main
  content remains present at 390 px.
- Visual review: no clipping or horizontal overflow at 390 px; the first-screen
  text, actions, and facts are legible. The topographic-cartography system is
  distinct and matches `.factory/design.md`.
- Link crawl: every HTTP(S) link across Home, Demo, Privacy, Terms, and 404
  returned 200; the only non-HTTP links are the documented support/privacy
  `mailto:` links.
- Cold Home → Demo request log: 9 requests, all to the product origin. No
  analytics, third-party font/script, or record-data request occurred. The CLI
  no-socket claim passed separately.
- PWA: one service worker installed and controlled the page, an explicit update
  completed, and Demo plus Home reloaded offline while real-storage sentinels
  stayed unchanged.

Response headers include HSTS, `nosniff`, strict-origin referrer policy,
camera/microphone/geolocation denial, and response-header CSP with
`frame-ancestors 'none'`. HTML uses 30-second revalidation; hashed assets and
hero art are immutable for one year; `/sw.js` is `no-cache, no-store,
must-revalidate`; `/api/build` is `no-store`.

## Performance and deployment identity

Mobile Lighthouse 12.8.2 completed without a runtime error:

| Metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1.5 s |
| Total blocking time | 30 ms |
| CLS | 0 |
| Total transfer | 157 KiB |

The home route loads 6,898 bytes of route JavaScript plus 2,709 bytes shared
JavaScript (about 4.1 KiB gzip combined), 16,608 bytes CSS (4,553 bytes gzip),
and a 146,138-byte hero. No webfont payload ships. All are within budget.

Every deployable candidate file compared byte-for-byte with live: Home, Demo,
Privacy, Terms, 404, all five hashed JS/CSS assets, service worker, web
manifest, images, icons, robots, sitemap, and `_headers`. The deployment-only
`staticwebapp.config.json` correctly returns the designed 404 rather than being
published. `/api/build` returns `0.1.0` and
`local-records-continuity-repair-8`, matching the candidate source, with
`Cache-Control: no-store` and `X-Continuity-API-Build`.

## Managed endpoint allowance

`npm run test:deployment:rate-limit` passed against production after waiting
for a fresh fixed window. One license identity sent 60 concurrent protected
download requests: exactly **20** were admitted to verification and returned
403 for the fixture license; exactly **40** returned 429. Every response carried
`RateLimit-Policy: 20;w=60` and `RateLimit-Backend: shared-azure-blob`; every
429 included a positive `Retry-After`. Anonymous and reserved-header requests
return 401, and an invalid product-license header returns 403. No real license
or paid file was used.

## Retest

From a clean clone, first run every exact command in `.factory/claims.json`
before any setup. Only if all pass, continue with:

```sh
npm ci
npm test
npm run typecheck
cargo clippy --workspace --all-targets -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test
npm run test:deployment:rate-limit
```
