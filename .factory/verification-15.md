# Independent verification 15 — PASS

- Date: 2026-09-02
- Work order: `local-records-continuity-verify-15`
- Candidate: `e2764caf7ac453bf563186d5f28e849a669c35f9`
- Live URL: <https://local-records-continuity.sociobot.in>
- Product code changed by verifier: no

## Verdict

**PASS — release candidate accepted.** The candidate completes the brief's
local recovery job end to end, the live deployment matches the candidate, and
no release-blocking, high, medium, or low defect was found.

## Mandatory first gates

### Cold first read

A fresh browser context opened the live site with empty storage. At both
1440×900 and 390×844, the first screen plainly answers:

- What it does: “Build a recovery pack for local business records.”
- Who it serves: small businesses using self-hosted or local admin software.
- What to do first: click **Try it with sample data**. Adjacent copy says the
  action opens the bookshop sample and its temporary-folder demo command.

The action was visible without scrolling. One click opened
`/demo/?demo=1`, where realistic Maple Street Books results were already
present. The persistent banner says “Demo — sample data, nothing is saved
here” and offers **Reset demo** and **Start for real**. This gate passed.

### Declared claims

`.factory/claims.json` exists. After checking out the exact candidate, every
listed command was run individually through its declared demo entry point.
All 20 claims passed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | Two real CLI demo forms used unique OS temporary workspaces, three bundled files, and no caller-directory writes (`tests/claims.test.mjs`). |
| `sample-demo-page` | PASS | Desktop and mobile entered Demo in one click, reset it, and preserved a real-license sentinel (`site/tests/site.spec.ts`). |
| `pack-artifacts` | PASS | The CLI wrote an encrypted `.cpack`, readable manifest, and matching receipt. |
| `authenticated-encryption` | PASS | The correct passphrase verified; the wrong passphrase exited 4. Primitive coverage fixes XChaCha20-Poly1305 and Argon2id. |
| `explicit-local-target` | PASS | The socket-blocked demo made no network attempt; omitting `--target` exited 2 and wrote nothing. |
| `required-sources` | PASS | A missing required source exited 3, named the path, and left the target empty. |
| `loud-scheduled-check` | PASS | Unavailable, stale, corrupt, and unreadable targets all failed with actionable reasons. |
| `restore-integrity` | PASS | Three restored fixture files matched byte for byte and included `RESTORE-REPORT.txt`. |
| `free-core-and-json` | PASS | An unlicensed CI demo returned one JSON object with `verified: true`. |
| `passphrase-sources` | PASS | File, environment, hidden prompt, and Linux Secret Service fixtures worked without canary leakage. |
| `passphrase-precedence` | PASS | File, then environment, then Secret Service precedence was proved without unnecessary keychain reads. |
| `schedule-preview` | PASS | The daily entry was printed and the crontab trap was never invoked. |
| `license-restoration` | PASS | Save, cached reload, invalid recheck, and removal passed on desktop and mobile. |
| `offline-guide` | PASS | A fresh service worker context reloaded direct Demo and Home offline without touching real storage. |
| `browser-privacy` | PASS | Home and sample-demo activity requested only the product origin. |
| `protected-download-rate-limit` | PASS | Concurrent and six-worker tests admitted 20 of 60 and returned 429 plus `Retry-After` for 40. |
| `download-counter-privacy` | PASS | A recording Blob adapter saw only SHA-256 client identifiers, separate one-minute paths, and one appended byte per admission (`api/plus-download/index.test.cjs`). |
| `licensed-download` | PASS | Missing/reserved/invalid credentials were denied; a live-check fixture returned a paid file; paid files were absent from `dist/site`. |
| `plus-price-and-checkout` | PASS | The page showed `$39` once and navigated only to the registered Sociobot checkout URL. |
| `no-record-upload` | PASS | Recorded verification/download requests contained only the license and requested asset, never a bundled record value. |

The live page, legal pages, README, and runtime copy were cross-checked against
the inventory. The two privacy statements raised in review 4 now have explicit
`download-counter-privacy` and `no-record-upload` entries with tagged tests.
No unlisted material claim remains.

## Clean install, tests, lint, build, and package

Generated dependency and build directories were moved aside before install.

```text
npm ci                                                        PASS (24 packages, 0 vulnerabilities)
npm test                                                      PASS
npm run typecheck                                             PASS
cargo clippy --workspace --all-targets --all-features -- -D warnings
                                                               PASS
npm run build                                                 PASS
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
                                                               PASS
```

`npm test` passed the isolated clean-clone runner for all 20 claims, 16 Rust
unit/CLI/doc tests, 11 CLI claim tests, 11 API tests, and 38 applicable local
browser tests; six deployment-only cases were skipped locally. The exact
production build created `target/release/continuity` and `dist/site/`.

The crate packaged 12 files at 111.5 KiB unpacked and 28.7 KiB compressed. It
was unpacked and installed into a new temporary consumer. The installed
`continuity --help` documented commands, automation flags, examples, and exit
codes. Its `continuity --json demo` completed the real pack, check, and restore
path with three files and `verified: true`.

## Independent CLI workflow

The installed consumer binary packed the three Maple Street Books exports to
an existing explicit target. It reported 3 files, 586 source bytes, one
encrypted pack, one manifest, one receipt, and immediate verification. A
separate verify and newest-pack check passed. Restore produced three records
plus `RESTORE-REPORT.txt`; independent `cmp` checks matched every restored file
to its source byte for byte.

Failure and boundary behavior:

- Wrong passphrase: exit 4 with an authentication/damaged-pack reason.
- Missing target: exit 3 and the absent path was not created.
- Missing required `--target`: exit 2 with usage.
- Invalid schedule time `24:00`: exit 2 with a real-24-hour-time instruction.
- Non-empty restore directory: exit 2 and the directory path.
- `--max-age-hours 0` after elapsed time: exit 4 with measured seconds and a
  positive-maximum instruction.

The CLI demo, browser demo, and normal data remain separated: CLI demo state is
under a fresh OS temporary directory; browser demo state uses only `demo:*`
session keys; real packs go only to the named filesystem target.

## Live deployment and server endpoint

All 19 publicly served files from the fresh `dist/site` build matched the live
responses byte for byte by SHA-256. This includes every HTML route, hashed
JavaScript/CSS, images, icons, manifest, service worker, robots, and sitemap.
An arbitrary path returned status 404 and the exact candidate 404 body.

`/api/build` returned product `local-records-continuity`, version `0.1.0`, and
release `local-records-continuity-polish-4`, matching candidate source. The
full live Playwright suite passed 42 tests across desktop and 390 px mobile;
only two local-fixture cases were skipped. Deployment-only route and API checks
ran and passed.

The live protected-download probe waited for a fresh fixed window and sent 60
concurrent requests using one client license. Exactly 20 reached the expected
inactive-license response and 40 returned HTTP 429. Every throttled response
had `Retry-After`; all responses advertised `RateLimit-Policy: 20;w=60` and the
shared Azure Blob backend. The observed allowance is **20 requests per client
license or anonymous network address per 60 seconds**.

The public Sociobot product registry returns this product's matching checkout
URL, `price_minor: 3900`, and currency `USD`. No checkout was created. Sign-in
and Microsoft Entra checks are not applicable because the product has no
sign-in.

## Privacy, headers, cache, and links

- A cold Home load and Home-to-Demo flow made only same-origin requests. No
  analytics, tracker, external font, external script, or record-data request
  appeared.
- CSP permits only the product plus `api.sociobot.in` connections and sends
  `frame-ancestors 'none'` as a response header. HSTS, `nosniff`,
  strict-origin referrer policy, and denied camera/microphone/geolocation are
  present.
- HTML revalidates after 30 seconds. Hashed assets and images are immutable for
  one year. The manifest caches for one hour. `sw.js` is `no-cache, no-store,
  must-revalidate`; `/api/build` is `no-store`.
- Every HTTP link on Home, Demo, Privacy, Terms, and 404 returned 200 or had a
  valid same-page target. The two contact links are intentional `mailto:` URLs.

## Accessibility, mobile, PWA, and performance

- Independent axe runs found zero serious/critical findings on Home, Demo,
  Privacy, Terms, and 404 at desktop and 390 px.
- Every route has `lang="en"`, a descriptive title, one H1, one main landmark,
  complete image alt text, no mobile overflow, and no console/page errors.
- Keyboard order starts with a visible 164×49 px skip link. Its outline, the
  navigation, primary action, tab panel, and controls use a 3 px visible focus
  treatment. Enter moves focus to the destination H1 and opens Demo.
- All visible links, buttons, and inputs meet the 44 px target baseline.
- At 200% root text size on 390 px, Home and Demo remained 390 px wide; the H1,
  primary action, Reset demo, and Start for real remained available.
- Reduced-motion mode matched. The hero entrance completed in 0.01 ms and no
  motion remained running.
- The live service worker updated and activated `continuity-pack-shell-v8`.
  Direct Demo reloaded offline with status copy, and cached Home plus its guide
  opened offline with no errors.
- Lighthouse 12.8.2 mobile: Performance **100**, Accessibility **100**, Best
  Practices **100**, SEO **100**; FCP **1.0 s**, LCP **1.1 s**, TBT **10 ms**,
  CLS **0**, total transfer **62 KiB**.
- Initial Home JavaScript is 9,607 bytes raw, CSS is 16,608 bytes raw, the
  responsive mobile hero is 48,414 bytes, and there is no font payload. All
  budgets pass.

## Defects by severity

- Release-blocking: none.
- High: none.
- Medium: none.
- Low: none.

## Final result

**PASS.** Candidate `e2764caf7ac453bf563186d5f28e849a669c35f9` is
accepted at <https://local-records-continuity.sociobot.in>.
