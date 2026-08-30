# Continuity Pack independent verification handoff — FAIL

- Date: 2026-08-30
- Verification work order: `local-records-continuity-verify-6`
- Candidate commit: `5c09de18cf970dd7501038b5abcacd01be734fac`
- Live URL: <https://local-records-continuity.sociobot.in>
- Full evidence: [`.factory/verification-6.md`](verification-6.md)

## Current verdict

**FAIL — do not release this candidate.** All declared claims, the clean
build/test/type/lint gates, packaged CLI consumer exercise, live privacy/header
checks, asset parity, accessibility checks, and the live protected-download
rate-limit probe pass. The remaining release-blocker is P1 in verification 6:
the direct, documented `/demo/` entry point never registers a service worker,
so it cannot reload the bundled sample offline after its first visit. This
violates the PWA/demo sandbox contract.

## Exact evidence and next step

Fresh direct `/demo/` after eight seconds had zero service-worker
registrations; offline reload produced `net::ERR_INTERNET_DISCONNECTED` and no
H1. Home → sample navigation masks this because home registers `/sw.js`.
Register the same worker/offline UI on the demo route, add a fresh-direct-demo
offline claim regression, deploy, and rerun the verification-6 required
commands plus the live direct-demo offline reload.

The production endpoint allowance was independently verified as 20 requests
per client per 60 seconds: 60 concurrent requests yielded 20 × 403 and 40 ×
429 with `Retry-After` and `RateLimit-Backend: shared-azure-blob`.

---

## Superseded repair record

- Date: 2026-08-30
- Work order: `local-records-continuity-repair-5`
- Repaired candidate: `a8178d8` (`fix(release): repair verifier blockers`)
- Verifier report repaired: `.factory/verification-5.md`
- Original failed candidate: `ecca9643971bc18e6037b886357855513a57f0c8`
- Deployment: Azure Static Web Apps, static site plus managed Node API
- Deployment ID: `3616aaca-a747-47e8-9cbf-8920a01c1492`
- Live URL: <https://local-records-continuity.sociobot.in>

## Result

**PASS — all release-blocking findings in verification 5 are repaired.** No
known release blocker remains. The Rust single-binary CLI, static deployment
class, researched brief, topographic visual identity, and previously passing
pack/check/verify/restore behavior are preserved.

## Repairs

1. Added `continuity demo` and `continuity --demo`. Both embed three fictional
   Maple Street Books files, create a unique operating-system temporary
   workspace, run the real pack → newest-pack check → restore path, and print
   the workspace. `--json` returns one result. Repository fixtures live under
   `examples/`; packaged fixtures live under `crates/continuity/examples/`.
2. Added a first-screen **Try it with sample data** action and a real `/demo/`
   page with the persistent demo banner, Reset demo, and Start for real. The
   page does not read or write the real license namespace. The first screen now
   names small businesses using self-hosted or local admin software.
3. Expanded `.factory/claims.json` from one entry to fourteen. Every retained
   privacy, encryption, target, offline, free-core, paid-file, price, and demo
   promise has one tagged regression and an exact sandbox command. All fourteen
   declared commands were run independently and passed.
4. Replaced per-host `/tmp` rate state with an atomic Azure Append Blob counter.
   Each client/window gets one append blob; `x-ms-blob-condition-maxsize: 20`
   is enforced by Azure Storage across all function workers. Storage failures
   fail closed with 503. Responses identify `RateLimit-Backend:
   shared-azure-blob`. The private container SAS has only create/add/write
   permissions, is stored in the Static Web App setting
   `RATE_LIMIT_BLOB_BASE_URL`, and is not in the repository. A lifecycle rule
   marks `continuity-rate-limits/v1/` append blobs for deletion after one day.
5. Added a response-header CSP matching the site, including
   `frame-ancestors 'none'`, and retained nosniff, referrer, permissions, HSTS,
   immutable-asset, manifest MIME, and no-cache service-worker policies.
6. Removed the broad SPA fallback. `responseOverrides.404` now rewrites to a
   product-specific `/404.html` while retaining HTTP 404 for unknown paths.
7. Added canonical, Open Graph, Twitter, favicon/touch, sitemap, and demo-route
   metadata. Added original-art derivatives with provenance in
   `.factory/design.md`. `.factory/copy-audit.md` records every landing-page
   sentence; the longest is 19 words and no banned marketing word remains.

## Clean local verification

The final gate began with a fresh `npm ci` and passed in this order:

```text
npm ci                                                        PASS; 25 packages, 0 vulnerabilities
cargo fmt --all -- --check                                    PASS
cargo clippy --workspace --all-targets -- -D warnings         PASS
npm run typecheck                                             PASS
npm test                                                      PASS
npm run build                                                 PASS; release CLI + dist/site/
npm audit --audit-level=high                                  PASS; 0 vulnerabilities
cargo package --manifest-path crates/continuity/Cargo.toml
  --allow-dirty                                               PASS; 29.2 KiB crate
```

Test totals from `npm test`:

- Rust: 6 library, 2 binary, 7 CLI integration, and 1 doctest passed.
- CLI claim harness: 8 passed, including a runtime socket trap and byte-for-byte
  recovery of every demo fixture.
- Protected-download API: 9 passed, including six simulated workers sharing
  one atomic Azure append backend.
- Playwright local: 27 passed across desktop Chromium and 390×844 mobile; 3
  intentional deployment/static single-project checks skipped.
- All 14 exact commands in `.factory/claims.json`: passed independently.

An actual Azure Storage contract burst, before deployment, admitted exactly 20
of 60 concurrent appends and rejected 40. This tested the storage primitive,
not only the local simulation.

`cargo install --path target/package/continuity-pack-0.1.0 --root <fresh> --locked`
installed `continuity 0.1.0` in a clean consumer root. Its installed
`continuity --json demo` reported `sample-recovery-complete`, 3 files, and
`verified:true`.

## Browser, accessibility, privacy, and performance

- Desktop and 390px pages have one H1, one main landmark, correct heading
  order, no horizontal overflow, visible 3px focus, arrow-key tabs, no keyboard
  traps, 44px targets, and no console/page errors.
- Playwright Axe found no serious or critical issue on Home, Demo, Privacy,
  Terms, or 404. Reduced motion, offline status, isolated offline context, and
  service-worker reload/update paths passed.
- Normal home and demo flows made same-origin requests only. The CLI demo
  completed with network socket creation intercepted and blocked. There are no
  analytics, telemetry, CDN fonts, or third-party runtime scripts.
- Emitted first-load home assets: home JS 7.09 KB raw (2.94 KB gzip), shared JS
  0.71 KB raw (0.40 KB gzip), CSS 14.83 KB raw (4.18 KB gzip), fonts 0, hero
  WebP 146,138 bytes. All budgets pass.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 40 ms, CLS 0.
- Factory `verify-url.sh`: HTTP 200, title/lang/H1/main/alt checks pass, zero
  console errors, load 558 ms.

## Live deployment evidence

- Factory deploy completed successfully to production; managed API content hash
  was `9f5961e905a7c9641476f8751111ff8f`.
- Live Playwright: 29 passed across desktop and 390px; one intentional
  desktop-only static-build duplicate skipped.
- Fresh production burst after a fixed-window boundary: **20 × 403** admitted
  to invalid-license verification and **40 × 429** throttled. Every response
  reported `20;w=60` and `shared-azure-blob`; throttles included `Retry-After`.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/sw.js` return CSP headers with
  response-header `frame-ancestors 'none'`. A fresh unknown URL returned HTTP
  404 and the designed “This page does not exist” H1.
- Every crawled internal link and the GitHub source link returned 200.
- Production checkout returned HTTP 303 to hosted Dodo checkout. Invalid
  license verification returned `{valid:false, reason:"invalid"}`.
- `index.html` local/live SHA-256 matched:
  `4362482afa303eb249def25eef529d484df4c5a95c33198512630bfa770c87c6`.
  Demo, Privacy, Terms, 404, service worker, manifest, hero, social/touch art,
  and all five hashed JS/CSS assets also matched byte for byte.

## Run and verify

```sh
continuity demo
npm ci
npm test
npm run typecheck
npm run build
npm run test:deployment:rate-limit
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test
```

Deploy with the factory work-order configuration:

```sh
/opt/fleet/lib/deploy-static.sh local-records-continuity dist/site
```

## Intentional boundaries

- Verification proves authenticated decryptability, receipt integrity, and
  per-file hashes. It does not prove a vendor application can import a backup;
  the CLI, site, manifest, and terms state this plainly.
- A real card charge and valid paid-license file retrieval were not performed.
  Production registry identity, hosted-checkout redirect, invalid-license
  denial, recorded valid-license browser fixture, protected endpoint, and
  absence of paid files from the static build were verified.
- Keychain write/delete and crontab mutation were not performed on this
  disposable Linux worker. File/environment passphrases, safe keychain status,
  schedule preview, and unavailable-target failure were verified.
