# Independent verification 7 — FAIL

- Date: 2026-08-30
- Work order: `local-records-continuity-verify-7`
- Candidate commit: `8fd4f0f385b1f189dc7dd2030cc166b29b04bc83`
- Live URL: <https://local-records-continuity.sociobot.in>
- Scope: clean checkout, declared claims, release CLI/package, live static site,
  PWA, and protected-download endpoint

## Verdict

**FAIL.** The CLI's core recovery job, all 14 declared claim commands, local
quality gates, static deployment bytes, PWA repair, rate limiting, privacy
request boundary, and performance checks pass. The candidate is not releasable
because the primary demo action is below the first viewport at the repository's
1280×720 desktop size, the live protected-download API does not preserve the
candidate's authentication behavior, and focus indicators on dark/ochre
surfaces miss the required 3:1 contrast. The claims inventory also contains
claims whose exact tagged command does not prove every stated clause, plus an
unlisted one-day retention promise.

## Release-blocking findings

### P1 — the first-read gate fails at the repository's desktop viewport

The repository's `Desktop Chrome` Playwright profile is 1280×720. In a fresh
browser context at that size, before any interaction:

```json
{
  "audience": { "top": 642.78, "bottom": 746.94, "fullyVisible": false },
  "cta": { "top": 778.94, "bottom": 826.94, "visible": false },
  "explanation": { "top": 838.94, "bottom": 861.75, "visible": false },
  "facts": { "top": 885.75, "bottom": 951.64, "visible": false }
}
```

The headline is visible, but the audience sentence is clipped and **Try it
with sample data** is entirely below the fold. A 1366×768 viewport has the same
failure (CTA top 813 px). The gate passes at 1440×900 and 390×844, but the
contract requires the first screen to answer what, for whom, and what to click
first. The candidate therefore fails the explicit first-read acceptance gate.

### P1 — live protected-download authentication differs from the candidate

The candidate handler returns `401` before license verification when
`Authorization` is absent or is not a non-empty Bearer token. The focused local
test and a direct handler invocation both passed that contract:

```text
candidate, no Authorization: 401
{"error":"a Continuity Plus license is required"}
```

The deployed endpoint instead returned the same response for five materially
different client inputs:

```text
no Authorization          -> 403 {"error":"license is not active"}
explicit empty header     -> 403 {"error":"license is not active"}
Authorization: Basic abc  -> 403 {"error":"license is not active"}
Authorization: Bearer     -> 403 {"error":"license is not active"}
Bearer verifier-invalid   -> 403 {"error":"license is not active"}
```

The request trace confirms no Authorization header left the client in the
first case. This proves the live gateway/function path does not expose the
authentication semantics implemented and tested at the candidate. Since the
browser sends a purchased license in this same header, live valid-license
downloads are not established and are likely unable to reach verification as
designed. `/api/health`, `/api/version`, and `/api/build` all return 404, so
there is no backend build identity with which to resolve the mismatch.

The static deployment does match the candidate: all 18 public `dist/site`
artifacts matched live bytes exactly. The mismatch is confined to the managed
API path and is still release-blocking because Plus is a sold feature.

### P1 — keyboard focus contrast is below the required 3:1

The global focus indicator is `#b45820`, 3 px wide with a 4 px transparent
offset. Measured contrast against the actual adjacent surfaces is:

| Focus location | Adjacent surface | Contrast |
| --- | --- | ---: |
| Demo banner: Reset demo / Start for real | `#9b4e1d` | 1.25:1 |
| Offline strip: Try again | `#8a4817` | 1.44:1 |
| Dark demo panel tabs | `#123d2f` | 2.51:1 |

All are below the attached accessibility baseline of 3:1 for visible focus.
Axe does not test focus-indicator color, so its otherwise clean result does not
cancel this manual finding.

### P1 — claim tests do not fully prove their declared claims

All commands in `.factory/claims.json` exit successfully, but several exact
tagged tests assert only a subset of the corresponding claim:

- `loud-scheduled-check` claims unavailable, stale, corrupt, and unreadable
  failures; its exact command tests only an unavailable target. The other
  cases live in Rust tests that the exact claim command does not run.
- `passphrase-sources` claims file, environment, hidden prompt, and OS
  keychain acceptance; its exact command exercises file/environment and only
  queries keychain status. It does not exercise prompt or keychain retrieval.
- `licensed-download` claims invalid-token protection and absence from the
  public build; its exact command mocks a valid verification/download only.
  Those other assertions are in separate tests not invoked by this claim.
- `offline-guide` claims both guide and direct sample offline behavior; its
  tagged test reloads only `/demo/` offline.

Independent checks showed the hidden prompt and offline guide work, and the
paid files are absent from the build/cache. That does not satisfy the claims
contract that each manifest command itself proves its whole promise.

The Privacy page also states that rate-counter blobs are marked for deletion
after one day. That retention promise has no entry in `.factory/claims.json`
and no runnable repository test, making it an unlisted privacy claim.

## Other findings

### P2 — all mobile header navigation is hidden

At 390 px, every `header nav a` on Home, Demo, Privacy, and Terms computes to
`display:none`. The stylesheet preserves only `.nav-buy`, but no header link
has that class. This contradicts `.factory/design.md`, which says the mobile
header retains essential install/purchase actions, and makes section/legal
navigation available only through body/footer links.

### P3 — zero-hour freshness error rounds away the reason

After a two-second-old pack, `check --max-age-hours 0` correctly exits 4, but
reports `newest pack is 0.0 hours old; maximum is 0 hours`. The behavior is
safe, but the rounded value makes the boundary failure look contradictory.

### P3 — recorded ochre token does not match the shipped token

`.factory/design.md` records `ochre` as `#B86428`; the shipped CSS defines it
as `#9B4E1D` and uses a third value, `#B45820`, for focus. The visual direction
is distinctive and implemented, but the source-of-truth palette is inaccurate.

## Mandatory claims

`.factory/claims.json` exists with 14 entries. The first attempt began before
JavaScript dependencies were installed, so its second command could not find
Vite. After the required clean `npm ci`, every exact command was restarted
from claim 1 and passed:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `sample-demo-page` | PASS (desktop and 390 px) |
| `pack-artifacts` | PASS |
| `authenticated-encryption` | PASS |
| `explicit-local-target` | PASS |
| `loud-scheduled-check` | PASS for its implemented assertion |
| `restore-integrity` | PASS |
| `free-core-and-json` | PASS |
| `passphrase-sources` | PASS for its implemented assertions |
| `offline-guide` | PASS (desktop and 390 px) |
| `browser-privacy` | PASS (desktop and 390 px) |
| `protected-download-rate-limit` | PASS |
| `licensed-download` | PASS against recorded fixtures |
| `plus-price-and-checkout` | PASS against recorded fixtures |

The first eight CLI claim tests exercise the shipped `continuity demo` in
fresh temporary directories. Browser claims use the `/demo/` entry point.

## Clean local gates

```text
npm ci                                                     PASS; 25 packages, 0 vulnerabilities
npm test                                                   PASS
  Rust library                                             6 passed
  Rust binary                                              2 passed
  CLI integration                                          7 passed
  Rust doctest                                             1 passed
  CLI claims                                               8 passed
  API                                                       9 passed
  Playwright                                               27 passed, 3 conditional skips
npm run typecheck                                          PASS
cargo fmt --all -- --check                                 PASS
cargo clippy --workspace --all-targets --all-features
  -- -D warnings                                           PASS
npm run build                                              PASS; release CLI + dist/site
npm audit --audit-level=high                               PASS; 0 vulnerabilities
cargo package --manifest-path crates/continuity/Cargo.toml
  --locked                                                 PASS; 29.2 KiB crate
```

The three local Playwright skips are one desktop-only duplicate and two
deployment-only cases. Against the live URL, the suite produced 28 passes,
one intentional project skip, and one Chromium headless-shell SIGSEGV during
the mocked checkout case. That case passed immediately when rerun alone, so
the crash is recorded as runner instability, not a product failure.

## CLI and clean-consumer exercise

The packaged `.crate` was extracted and installed with `cargo install --path
<extracted-crate> --root <fresh-root> --locked`. The installed binary reported
`continuity 0.1.0`; `continuity --json --ci demo` returned
`sample-recovery-complete`, `file_count:3`, and `verified:true`, created 14
files under a unique OS-temp workspace, and wrote zero files to the caller's
directory.

A separate normal flow using the sample configuration passed pack, verify,
check, restore, and byte-for-byte comparisons. Recovery cases produced the
documented exits:

```text
missing --target argument             2
unavailable target (not created)      3
short passphrase                      2
missing passphrase in CI              3
wrong passphrase                      4
truncated/corrupt pack                4
non-empty restore destination         2
stale zero-hour threshold             4
invalid 25:99 schedule                2
```

The interactive fallback prompted without echoing the entered passphrase and
then verified the sample. OS-keychain status failed soft as `available:false`
in this container. No keychain write/delete or crontab installation was made.

## Live site, privacy, PWA, and accessibility evidence

- Home, Demo, Privacy, and Terms return 200; a random missing route returns the
  designed page with status 404. All 14 discovered links return 200 or are
  explicit `mailto:` links.
- All valid routes have `lang=en`, one H1, one main landmark, correct titles,
  no horizontal overflow, and zero console/page errors. The sole recorded 404
  console message occurred when intentionally loading an HTTP-404 document.
- Axe found zero serious/critical findings on Home, Demo, Privacy, Terms, and
  the designed 404 at desktop and 390 px. Text resized to 200% without
  horizontal overflow on all four valid routes. All visible controls measured
  at least 44×44 CSS px.
- Keyboard traversal has no trap; the first Tab reveals the skip link and the
  next Tab after activation reaches **Try it with sample data**. Demo tabs
  respond to arrows/Home/End. The focus-color failure is documented above.
- A fresh Home → Demo flow made only same-origin requests. An explicit invalid
  license action made the one expected request to
  `api.sociobot.in/.../verify`; no analytics, third-party font, or third-party
  runtime-script requests occurred.
- Direct `/demo/` registers a root-scoped worker, becomes controlled, updates,
  and reloads offline with status 200. Cache `continuity-pack-shell-v4`
  contains 15 shell assets and no `/plus/` or `/api/` entries. Demo and real
  storage sentinels remain isolated. Starting at Demo also opens the full Home
  guide offline.
- Reduced-motion computed maximum animation and transition durations are both
  0.01 ms. No looping or flashing motion was found.
- Root/HTML responses have CSP (including response-header
  `frame-ancestors 'none'`), HSTS, nosniff, strict-origin referrer policy, and
  camera/microphone/geolocation restrictions. Hashed assets and hero art cache
  immutable for one year; `sw.js` is `no-cache, no-store`; HTML revalidates
  after 30 seconds.
- All three paid files return 404 at public `/plus/*` paths and none appears in
  the service-worker cache.
- The Sociobot product registry currently lists Continuity Plus at USD 39.00
  with the expected checkout URL. No checkout purchase was created.
- No sign-in exists, so the Entra authority requirement is not applicable.

## Live rate limit and performance

The exact deployment verifier waited for a fresh fixed window and sent 60
concurrent POSTs. Result: **20 × 403 admitted and 40 × 429 throttled**. Every
response reported `RateLimit-Policy: 20;w=60` and
`RateLimit-Backend: shared-azure-blob`; every 429 had `Retry-After`.

Fresh mobile Lighthouse results:

```text
Performance       94
Accessibility    100
Best Practices   100
SEO              100
FCP            1,059 ms
LCP            1,549 ms
TBT              283 ms
CLS                0
transfer      159,991 bytes
```

Build assets remain below contract budgets: initial Home JS is 3,491 bytes
gzip (Home + shared PWA), CSS is 4,185 bytes gzip, fonts are 0 bytes, and the
hero WebP is 146,138 bytes. Social art is 1200×630 and the touch icon is
180×180. Asset provenance is recorded in `.factory/design.md`.

## Coverage boundaries

No real card payment, valid paid license, OS-keychain mutation, or crontab
installation was attempted. The valid paid-download path cannot be accepted
until the live Authorization behavior is corrected and proven with a valid
test license. There is no repository `verify-url.sh`; its title/lang/H1/main/
alt/console checks were performed directly with Playwright.

## Required re-verification

1. Fit the audience sentence, demo CTA, CTA explanation, and three facts in the
   1280×720 first viewport without harming the passing 390 px layout.
2. Make the live function receive the license credential in a header the SWA
   gateway preserves; add backend build identity and verify a real valid token.
3. Give dark and ochre surfaces a focus treatment with at least 3:1 contrast.
4. Make each claim's exact command prove every clause, and inventory or remove
   the one-day rate-counter retention promise.
5. Restore intentional mobile header navigation and synchronize the palette
   values in `.factory/design.md`.
