# Independent verification 14 — PASS

- Date: 2026-09-01
- Work order: `local-records-continuity-verify-14`
- Candidate commit: `e11e43fb66be2b47d16002f79540ea10bb6d6ff8`
- Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**PASS — release candidate accepted.** The candidate completes the brief's
local recovery job end to end. It packages configured records, encrypts and
hashes them, writes a readable restore manifest and receipt, verifies a named
target, fails scheduled checks clearly, and restores verified files. No product
code was changed during verification.

## Mandatory first gates

### Cold first read

A fresh browser context opened the live page with service workers blocked. Its
first screen answers the three required questions in plain words:

- What it does: “Build a recovery pack for local business records.”
- Who it is for: small businesses using self-hosted or local admin software.
- What to click first: “Try it with sample data.” The adjacent text says it
  opens the bookshop sample and its temporary-folder demo command.

The action was visible at desktop and 390 × 844. On the phone viewport, the
headline, audience sentence, action, explanation, and three facts ended at
806.5 px, inside the 844 px viewport. One click opened `/demo/?demo=1`; its
persistent banner says “Demo — sample data, nothing is saved here” and includes
**Reset demo** and **Start for real**. This gate passed. Screenshots are under
`.factory/evidence-14/`.

### Every declared claim

`.factory/claims.json` exists. All 18 commands were run exactly as listed,
before the general suite, through the declared CLI or browser demo entry point.
All passed.

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | Both demo forms used unique OS-temp workspaces, bundled three files, and left the caller directory empty. |
| `sample-demo-page` | PASS | Desktop and mobile opened Demo in one click, reset it, and preserved the real-license sentinel. |
| `pack-artifacts` | PASS | The sample wrote an encrypted `.cpack`, manifest, and matching receipt. |
| `authenticated-encryption` | PASS | The sample passphrase verified; a wrong passphrase returned exit 4. |
| `explicit-local-target` | PASS | The socket-blocked demo made no network attempt; omitting the target returned exit 2 and wrote nothing. |
| `required-sources` | PASS | A missing required source returned exit 3, named its path, and wrote no artifacts. |
| `loud-scheduled-check` | PASS | Unavailable, stale, corrupt, and unreadable targets returned non-zero with actionable reasons. |
| `restore-integrity` | PASS | All three restored fixture files matched byte for byte and a restore report was present. |
| `free-core-and-json` | PASS | An unlicensed CI demo returned one JSON result with `verified: true`. |
| `passphrase-sources` | PASS | File, environment, hidden prompt, and Linux Secret Service fixtures worked without leaking the canary. |
| `passphrase-precedence` | PASS | File, environment, then Secret Service precedence was demonstrated. |
| `schedule-preview` | PASS | The daily entry was printed and the scheduler trap was not invoked. |
| `license-restoration` | PASS | Save, cached reload, inactive response, and removal passed on desktop and mobile. |
| `offline-guide` | PASS | A fresh context updated the service worker and reloaded Demo and Home offline without changing real storage. |
| `browser-privacy` | PASS | Home and sample-demo activity requested only the product origin. |
| `protected-download-rate-limit` | PASS | Concurrent and six-worker tests admitted 20 of 60 and returned 429 plus `Retry-After` for 40. |
| `licensed-download` | PASS | Missing/reserved/invalid credentials were denied; a live-check fixture returned the requested file; paid files were absent from the public build. |
| `plus-price-and-checkout` | PASS | The page showed `$39` once and used the registered Sociobot checkout route. |

The live page, legal pages, README, and runtime copy were cross-checked against
the claims list. The operational statements are covered by these claims and
their supporting regression checks. No unlisted material claim was found.

## Clean install, tests, lint, build, and package

```text
npm ci                                                        PASS (24 packages; 0 vulnerabilities)
npm test                                                      PASS
npm run typecheck                                             PASS
cargo clippy --workspace --all-targets -- -D warnings         PASS
npm run build                                                 PASS
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
                                                               PASS
```

`npm test` passed the clean-clone 18-claim runner, 16 Rust unit/CLI/doc
tests, 11 CLI claim tests, 10 managed-API tests, and 36 applicable local browser
tests; six deployment-only checks were skipped locally. The exact production
build created `target/release/continuity` and `dist/site/`.

The crate packaged 12 files at 111.5 KiB unpacked / 28.7 KiB compressed. It was
installed from the packaged source into a clean temporary consumer. The
installed `continuity --help` listed the public commands, automation options,
examples, and exit codes. From an empty caller directory,
`continuity --ci --json demo` reported `sample-recovery-complete`, three files,
and `verified: true`; the caller directory remained empty.

## Independent CLI job and recovery probes

A separate initialized configuration packed the three representative Maple
Street Books exports to an existing target. The result reported 3 files, 586
source bytes, 1,024 encrypted bytes, and immediate verification. A target check
passed. Restore recreated all three files byte for byte and wrote
`RESTORE-REPORT.txt` with the business, pack hash, source list, verification
command, limitation, and application-restore steps.

Failure and boundary behavior was exercised independently:

- Wrong passphrase: exit 4 with an authentication/damaged-pack reason.
- Non-empty restore directory: exit 2 and the directory name.
- Invalid schedule `25:99`: exit 2 and a 24-hour-time instruction.
- Missing target: exit 3; the target was not created.
- Missing CI passphrase: exit 3 with all available passphrase sources.
- `--max-age-hours 0` after elapsed time: exit 4 with measured seconds and a
  positive-limit instruction.
- Truncated pack: exit 4 as an unsupported pack.
- Missing required customer export: exit 3, named the label and path, and left
  the target artifact count unchanged.

## Live candidate, routes, privacy, and endpoint behavior

All 19 public files in fresh `dist/site` matched their live responses byte for
byte by SHA-256. This covered every HTML route, all hashed JavaScript/CSS,
images, icons, manifest, service worker, robots file, and sitemap. The managed
identity endpoint returned product `local-records-continuity`, version `0.1.0`,
and release `local-records-continuity-polish-3`, matching candidate source.

The full live Playwright suite passed **40 tests**, with two local-only checks
skipped. It covered desktop and 390 px mobile, Demo, Privacy, Terms, designed
404, history/focus, licensing, endpoint authentication, offline reload, privacy,
touch targets, and accessibility. A crawl found HTTP 200 for every visible web
link across Home, Demo, Privacy, Terms, and 404; the two contact links were
valid `mailto:` URLs. An unknown route returned the designed page with HTTP 404.

A cold Home load made five same-origin requests: HTML, two JavaScript modules,
CSS, and the hero image. The Home-to-Demo flow stayed same-origin. No analytics,
tracking pixel, external font, external script, or record-data request appeared.
The public Sociobot registry independently reported Continuity Plus at USD
39.00 with the matching product and checkout URLs. No live checkout was
created.

The live HTML response included HSTS, `nosniff`, strict-origin referrer policy,
denied camera/microphone/geolocation, and a CSP with `frame-ancestors 'none'`.
HTML revalidates after 30 seconds, hashed assets and images use one-year
immutable caching, `/site.webmanifest` caches for one hour, `/sw.js` uses
`no-cache, no-store, must-revalidate`, and `/api/build` uses `no-store`.

The deployed protected-download probe sent 60 concurrent requests in one fresh
fixed window. Twenty reached the expected inactive-license response and 40
returned HTTP 429. The probe asserted `Retry-After` on every 429,
`RateLimit-Policy: 20;w=60` on every response, and the shared backend identity.
The observed allowance is **20 requests per client license or anonymous network
address per 60 seconds**.

## Accessibility, mobile, PWA, and performance

- The factory URL verifier passed Home and direct Demo: HTTP 200, descriptive
  title, `lang="en"`, one `<h1>`, one `<main>`, complete alt text, labeled
  buttons, and zero console/page errors.
- Independent axe checks found zero serious/critical findings on Home, Demo,
  Privacy, Terms, and 404 at desktop and 390 px.
- Keyboard order began with the skip link and reached the wordmark, navigation,
  and sample action. Every sampled focus outline was 3 px. Enter opened Demo
  and focused its `<h1>`; ArrowRight selected the Check tab.
- Every visible link, button, and input on all routes met the 44 px target
  baseline. At 200% root text size on a 390 px viewport, the root computed to
  32 px, the heading and primary action remained present, and width stayed
  390/390 with no horizontal overflow.
- With reduced motion requested, the query matched, animation/transition
  durations fell to 0.01 ms, and smooth scrolling became `auto`.
- The service worker updated, controlled a fresh context, reloaded direct Demo
  offline, and opened cached Home without touching the saved real-license
  sentinel.
- Lighthouse 12.8.2 mobile: Performance **98**, Accessibility **100**, Best
  Practices **100**, SEO **100**; FCP **1,145 ms**, LCP **1,162 ms**, TBT
  **161 ms**, CLS **0**, total transfer **63,227 bytes**.
- Initial Home JavaScript is 9,607 bytes raw, CSS is 16,608 bytes raw, the
  responsive mobile hero is 48,414 bytes, and there is no web-font payload.
  All are within the acceptance budgets.

Evidence is in `.factory/evidence-14/`, including cold desktop/mobile images,
factory URL-verifier reports, and the Lighthouse JSON report.

## Defects by severity

- Release-blocking: none.
- High: none.
- Medium: none.
- Low: none.
