# Independent verification 13 — PASS

- Date: 2026-09-01
- Work order: `local-records-continuity-verify-13`
- Candidate commit: `d26c58a1bac234f76bbe7829d06e3c76684fb59c`
- Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**PASS — release candidate accepted.** The CLI completes the brief's local
recovery-pack job. It packages configured records, records checksums, encrypts
the pack, writes a readable manifest and receipt, checks a named target, and
restores verified files. The scheduled check reports unavailable, stale,
damaged, and unreadable targets with non-zero status. No product code was
changed during verification.

## Confirm the cold first read

A new browser context showed the following on the first live screen:

- What it does: “Build a recovery pack for local business records.”
- Who it is for: small businesses using self-hosted or local admin software.
- What to do first: “Try it with sample data.” The adjacent sentence says the
  action opens the bookshop sample and its temporary-folder demo command.

The primary sample action was visible at 1440 × 900 and 390 × 844. One click
opened `/demo/?demo=1`, where the persistent banner said that sample data is
not saved and offered both **Reset demo** and **Start for real**. Screenshots are
in `.factory/evidence-13/`.

## Confirm every declared claim

`.factory/claims.json` was present. Each of its 17 exact `test` commands was
run before the general install and test sequence. All 17 passed from the
candidate checkout through the documented demo entry points.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | Two demo entry points used unique temporary workspaces and left the caller directory unchanged. |
| `sample-demo-page` | PASS | Desktop and mobile opened the sample in one click and preserved the real-license sentinel. |
| `pack-artifacts` | PASS | The demo wrote the `.cpack`, manifest, and matching receipt. |
| `authenticated-encryption` | PASS | The sample passphrase verified; a different passphrase returned exit 4. |
| `explicit-local-target` | PASS | The network-disabled run completed without a socket request; missing `--target` returned exit 2. |
| `loud-scheduled-check` | PASS | Unavailable, elapsed zero-hour, damaged, and unreadable cases returned non-zero with a next step. |
| `restore-integrity` | PASS | Three restored files matched the bundled fixtures byte for byte and included a restore report. |
| `free-core-and-json` | PASS | The unlicensed CI demo returned one JSON result with `verified: true`. |
| `passphrase-sources` | PASS | File, environment, hidden prompt, and Linux Secret Service fixtures worked without storing the canary value in output or artifacts. |
| `passphrase-precedence` | PASS | File, environment, then Linux Secret Service precedence was confirmed with conflicting fixtures. |
| `schedule-preview` | PASS | The daily entry was printed for review and no scheduler command ran. |
| `license-restoration` | PASS | Save, cached reload, inactive result, and removal worked on desktop and mobile. |
| `offline-guide` | PASS | A fresh context updated its service worker, reloaded the direct sample offline, and opened the cached Home guide. |
| `browser-privacy` | PASS | The normal Home-to-Demo flow requested only the product origin. |
| `protected-download-rate-limit` | PASS | The 60-request and six-worker checks admitted 20 and returned 429 for 40 with `Retry-After`. |
| `licensed-download` | PASS | Missing and inactive licenses did not return a file; an active fixture did; paid files were absent from `dist/site`. |
| `plus-price-and-checkout` | PASS | The page showed `$39` once and used only the registered Sociobot checkout route. |

The live page and README were cross-checked against the claim list. The
operational promises are covered by the claims above; no unlisted material
claim was found.

## Confirm clean install, tests, and production artifacts

```text
npm ci                                                        PASS (24 packages; 0 vulnerabilities)
npm test                                                      PASS
npm run typecheck                                             PASS
npm run build                                                 PASS
cargo clippy --workspace --all-targets -- -D warnings         PASS
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
                                                               PASS
```

`npm test` confirmed the clean-clone claim runner, 16 Rust unit/CLI/doc tests,
10 CLI claim tests, 10 API tests, and the local browser suite (36 passed and 6
expected deployment/project-condition skips). The exact production build
created `target/release/continuity` and `dist/site/`.

The crate contained 12 files and measured 111.5 KiB unpacked / 28.7 KiB
compressed. It was extracted and installed with `cargo install --path …
--root … --locked` in separate temporary directories. The installed
`continuity --help` listed the documented commands and exit codes. From an
empty caller directory, `continuity --ci --json demo` returned
`sample-recovery-complete`, `file_count: 3`, and `verified: true`; the caller
directory remained empty.

## Check normal, boundary, invalid-input, and recovery paths

- The normal sample verified three files and reported authenticated content
  with matching file hashes.
- A different passphrase returned exit 4 and identified authentication failure.
- A zero-hour freshness check passed at the exact creation instant; after
  elapsed time, the declared boundary test returned exit 4 and explained that
  zero hours permits no elapsed time.
- An unavailable target returned exit 3 without creating it.
- A shortened pack returned exit 4 and identified an unsupported pack file.
- A restore into a non-empty directory returned exit 2 and named the directory.
- The invalid schedule value `25:99` returned exit 2 and requested a real
  24-hour time.
- A pack command without `--target` returned exit 2 and printed the required
  argument and usage.
- The valid recovery path restored all three bundled files byte for byte and
  wrote `RESTORE-REPORT.txt`.

## Confirm the live candidate and routes

All 18 publicly served files in fresh `dist/site` matched the live responses
byte for byte by SHA-256. This covered every HTML route, every JavaScript and
CSS asset, images, icon, manifest, service worker, robots file, and sitemap.
Deployment-only configuration files were not treated as public assets.

The managed endpoint returned product `local-records-continuity`, version
`0.1.0`, and release `local-records-continuity-polish-2`, matching the candidate
source. The designed unknown route returned HTTP 404. A crawl of every visible
link on Home, Demo, Privacy, Terms, and 404 found only HTTP 200 destinations or
the two documented `mailto:` links.

The complete live browser suite was confirmed in six short single-worker
shards: **40 passed and 2 expected project-condition skips** across desktop and
390px mobile. Two earlier long browser processes ended with a Chromium process
fault after 39 checks; the corresponding checks passed when repeated in fresh,
short browser processes. No product assertion failed in the successful run.

## Confirm privacy, headers, and request allowance

- A cold Home load requested only the product origin: HTML, two JavaScript
  modules, CSS, and the hero image. The Home-to-Demo flow also stayed on the
  product origin. No analytics, external fonts, external scripts, or record-data
  requests were observed.
- Selecting **Buy Continuity Plus** explicitly requested the public Sociobot
  product list and the registered product checkout URL. The registry reported
  `Continuity Plus`, USD 39.00, and the matching product URL.
- The live HTML response included HSTS, `nosniff`, strict-origin referrer
  policy, denied camera/microphone/geolocation, and a CSP with
  `frame-ancestors 'none'`. HTML uses 30-second revalidation, hashed assets use
  one-year immutable caching, and `/sw.js` uses `no-cache, no-store,
  must-revalidate`.
- The CLI no-network claim completed with socket creation observed and blocked;
  no socket request occurred.

The deployed protected-download allowance was checked in a fresh fixed window.
One client sent 60 concurrent requests: 20 reached the expected inactive-license
response and 40 returned HTTP 429. Every response reported
`RateLimit-Policy: 20;w=60`; the shared backend header was present, and every
429 included a positive `Retry-After`. The observed allowance is **20 requests
per client license or anonymous network address per 60 seconds**.

## Confirm accessibility, mobile, offline use, and performance

- The factory URL verifier passed Home and the direct sample URL: HTTP 200,
  descriptive titles, `lang="en"`, one `<h1>`, one `<main>`, complete image alt
  text, labeled buttons, and zero console or page errors.
- Axe reported no serious or critical findings across Home, Demo, Privacy,
  Terms, and 404 on desktop and 390px mobile.
- Keyboard-only use reached the skip link, wordmark, Install, Plus, and primary
  sample action in order. Enter opened Demo and moved focus to its `<h1>`;
  ArrowRight selected the Check tab. Focus-ring contrast checks met 3:1.
- All visible controls met the 44px target baseline. At 200% root text size,
  the 390px page retained its heading and primary action with no horizontal
  overflow.
- With reduced motion requested, the media query matched, animation and
  transition durations became 0.01 ms, and smooth scrolling became `auto`.
- The service worker updated, retained control, reloaded the direct sample
  offline, and then opened the cached Home guide without changing real-license
  storage.
- Fresh Lighthouse 12.8.2 mobile results: Performance **99**,
  Accessibility **100**, Best Practices **100**, SEO **100**; LCP **1,510 ms**,
  FCP **912 ms**, TBT **115 ms**, CLS **0**, total transfer **160,987 bytes**.
- Initial Home JavaScript is 9,607 bytes raw, CSS is 16,608 bytes raw, and the
  hero WebP is 146,138 bytes. There is no web-font payload. All are within the
  product budgets.

Evidence is stored under `.factory/evidence-13/`, including cold-view and demo
screenshots, factory URL verifier reports, and `lighthouse-mobile.json`.

## Defects by severity

- Release-blocking: none.
- High: none.
- Medium: none.
- Low: none.
