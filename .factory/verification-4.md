# Independent verification 4 — FAIL

Date: 2026-08-28  
Work order: `local-records-continuity-verify-4`  
Candidate: `a82fd2d657d4c295927f859e8af78b31e791a5e5`  
Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**FAIL — do not release this candidate.** The local recovery CLI, package,
static PWA, protected-download access control, and live deployment otherwise
passed independent QA. However, the deployed server-side protected-download
endpoint has no observable rate limit. This violates the work-order's explicit
API requirement and permits unbounded rapid requests to an endpoint which can
perform upstream license verification.

## Defects

### P1 — `/api/plus-download` has no rate limiting or `Retry-After`

Fresh production burst test, 2026-08-28:

```sh
seq 1 60 | xargs -P 20 -I{} curl -sS -o /dev/null \
  -w '%{http_code}\n' -X POST \
  'https://local-records-continuity.sociobot.in/api/plus-download?asset=quarterly-restore-drill.md'
```

All **60** requests returned **403**. None returned **429**, and none carried a
`Retry-After` response header. The tested threshold is therefore **not reached
within 60 requests (no limit observed)**. The checked-in Azure Function has no
rate-limit implementation, either. Add a per-client/IP rate limiter at the
edge or function, return `429 Too Many Requests` during the burst, and include
an accurate `Retry-After` header; add an integration regression test.

## Clean-checkout quality gates

The worktree was clean at the specified candidate SHA before QA. Installation
and every available repository gate passed:

```text
npm ci                                                        PASS (25 packages, 0 vulnerabilities)
cargo fmt --all -- --check                                    PASS
cargo clippy --workspace --all-targets -- -D warnings         PASS
npm run typecheck                                             PASS
cargo test --workspace                                        PASS
npm test                                                      PASS
npm run build                                                 PASS
npm audit --audit-level=high                                  PASS
cargo package --manifest-path crates/continuity/Cargo.toml
  --allow-dirty                                               PASS
```

- Rust: 6 library tests, 2 binary tests, 5 CLI integration tests, and 1
  doctest passed.
- API: 5 Node tests passed.
- Browser: 21 Playwright tests passed across desktop and 390×844 mobile; 1
  desktop-only static-contract duplicate was deliberately skipped on mobile.
- Exact production output: `target/release/continuity` (2,504,880 bytes) and
  `dist/site/`; package artifact
  `target/package/continuity-pack-0.1.0.crate` is 27,315 bytes.

## CLI, public API, and package evidence

An independent fixture used invoice/customer CSV exports with zero and large
amounts, quotes/commas, Unicode, a nested documents directory, a zero-byte
file, an optional missing source, and an explicit target path containing
spaces.

- `pack --ci --json` produced the encrypted `.cpack`, readable restore
  manifest, and JSON receipt; it reported 4 files, 110 bytes, and
  `verified:true`.
- `verify`, `check --max-age-hours 26`, and `restore` succeeded. Restored CSVs
  and the nested empty file matched byte-for-byte. The manifest plainly says
  that this is not a full application restore test.
- Wrong passphrase and a tampered `.cpack` exited 4; unavailable target exited
  3 without creating it; malformed configuration, existing `init` path, and
  `schedule --daily-at 24:00` exited 2. `00:00` and `23:59` scheduler previews
  produced a quoted `--ci check` command for the space-containing target.
- Two simultaneous packs exited 0 and made two distinct complete triplets;
  there were no partial files. The regression suite also passes the prior
  mixed-business-name/corrupt-newest-pack case and fails closed.
- The packed crate was consumed from a new temporary Rust project. It compiled
  and exercised public `Config` and `RecordSource` types (`public-api-ok`).
  `cargo install --path target/package/continuity-pack-0.1.0 --root <temp>
  --locked` installed a clean consumer binary. Its help exposes the documented
  commands, `--json`, `--ci`, and exit-code guide; it reports `continuity 0.1.0`.

## Live deployment, privacy, accessibility, and policy evidence

- Local `dist/site/index.html` and live root HTML match exactly:
  `SHA-256 7b089db05064da0673248ac6f5a79aeeec23708d8b2bef4d3687b7f774109e4f`.
  The live static deployment is this candidate. The managed API behavior was
  separately exercised live.
- Fresh Chromium at 1440×900 and 390×844 had no console errors, page errors,
  failed requests, horizontal overflow, undersized visible controls, or
  serious/critical Axe findings. Both pages have one `h1` and one `main`.
  The first Tab reaches “Skip to main content” with a 3px focus outline; demo
  tabs work with Arrow keys. Axe reports only the non-blocking moderate
  `landmark-complementary-is-top-level` advisory.
- Reduced motion computed to `0.00001s`; the PWA service worker controlled the
  live page, and an offline 390px reload retained the h1 and showed the offline
  status strip. Desktop visual inspection matched the documented topographic
  cartography design.
- Initial-page requests were same-origin only. Source/dependency scans found no
  analytics, telemetry, tracking pixels, CDN fonts/scripts, or Rust networking
  client. The CLI does not upload and copies only to its explicit target.
  There is no sign-in flow, so Entra tenant validation is not applicable.
- Direct live paid-file paths all return 404. An invalid Sociobot license gives
  `{"valid":false,"reason":"invalid"}` and a checkout request returns 303 to
  Dodo. The public registry exposes the production checkout route. No real
  purchase was made.
- Live hashed JS/CSS and WebP assets are one-year immutable; `sw.js` is
  `no-cache, no-store, must-revalidate`; manifest MIME is
  `application/manifest+json` with one-hour caching. Responses carry HSTS,
  `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation
  Permissions-Policy. Protected download responses have `no-store`.

## Performance

Built assets: home JS 6,933 bytes plus 711-byte shared JS; CSS 13,005 bytes;
fonts 0 bytes; hero WebP 146,138 bytes. All stated payload budgets pass.

Fresh Lighthouse 12.8.2 mobile against the live URL: Performance **96**,
Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.9 s, LCP
2.4 s, TBT 30 ms, CLS 0, Speed Index 1.9 s. No interaction sample was
available for INP.

## Required re-verification

1. Deploy and prove rate limiting for `/api/plus-download` (and any related
   server endpoint): show the first observed 429 threshold and its
   `Retry-After` header under a controlled burst.
2. Re-run this verification on the repaired commit and confirm the live API,
   static files, and candidate build identity together.
