# Continuity Pack review-1 handoff — FAIL

- Date: 2026-08-30
- Work order: `local-records-continuity-review-1`
- Candidate: `b185f8a69879095496d95e6b6af6a5767cac76a7`
- Review: [`.factory/review-1.md`](review-1.md)

The adversarial first-read review found 28 issues. F-1-1 and F-1-2 are
blocking: the Home primary-action label falls below a 1440×844 first screen,
and the 390×844 Demo first screen places realistic sample output below the
fold. The claim manifest also omits reliance-worthy landing/README statements;
copy, 404 metadata, and route-focus findings remain. No product code was
changed.

Verification completed:

- All 14 exact `.factory/claims.json` commands passed from a clean local clone.
- `npm test` passed: 6 library, 2 binary, 7 CLI integration, 1 doctest, 8 claim,
  10 API, and 30 browser tests passed; 6 deployment-only cases skipped.
- `npm run build` passed and produced `dist/site/`.
- Live Home/Demo request logs were same-origin only; demo storage sentinels were
  unchanged; Reset and Start for real worked.
- A CLI demo from a fresh temporary caller returned three verified files and
  left the caller directory empty.
- Live route/link/metadata/Axe/keyboard/mobile checks are recorded in the
  review. A single live Chromium process crash passed on isolated rerun.

Next: repair every finding in `.factory/review-1.md`, add the missing claim
entries/tests, and rerun the complete checklist from a fresh context.

---

# Continuity Pack verification handoff — PASS

## Independent verification 8

- Date: 2026-08-30
- Work order: `local-records-continuity-verify-8`
- Candidate: `c748ae55a887c19b94735e5b406ea5ae3a49ddb7`
- Live URL: <https://local-records-continuity.sociobot.in>
- Evidence: [`.factory/verification-8.md`](verification-8.md)

**PASS — no release-blocking defects found.** The candidate and live deployment
meet the brief for a local CLI that encrypts configured business-record exports,
writes readable recovery instructions, verifies the named target, and restores
the sample records.

Verification evidence:

- All 14 exact `.factory/claims.json` commands passed after clean `npm ci`.
- `npm test`, `npm run typecheck`, and `npm run build` passed. The full test
  gate contains 6 Rust library, 2 binary, 7 CLI integration, 1 doctest, 8 CLI
  claim, 10 API, and 30 browser tests (6 intended deployment skips).
- The packaged CLI installed into a fresh consumer root and `continuity --json
  demo` returned `sample-recovery-complete`, `file_count: 3`, and
  `verified: true`. Invalid inputs recover safely with documented exits:
  missing source 3, absent target argument 2, wrong passphrase 4, non-empty
  restore destination 2, and zero-hour stale check 4.
- Live static assets match the local candidate bytes by SHA-256. `/api/build`
  returns `local-records-continuity-repair-7`.
- Live desktop and 390 px QA found the plain-language one-click demo, zero Axe
  serious/critical findings, no console/page errors, no horizontal overflow,
  same-origin-only Home/Demo requests, active service-worker update, and offline
  `/demo/` reload with demo storage isolated from real sentinels.
- Protected Plus downloads enforce **20 requests per client per fixed 60
  seconds**: 60 live concurrent requests yielded 20 admitted 403s and 40 429s;
  every throttle had `Retry-After`.

No real purchase, active-license download, host keychain write/delete, or
scheduler installation was made because those require credentials or mutate
external/user state. The deployed fail-closed path, rate policy, free CLI, and
all recovery operations were independently exercised.

---

- Date: 2026-08-30
- Work order: `local-records-continuity-repair-7`
- Verifier report: [`.factory/verification-7.md`](verification-7.md)
- Failed candidate: `8fd4f0f385b1f189dc7dd2030cc166b29b04bc83`
- Repair commit: `c20bde9` (`fix(release): resolve verification 7 blockers`)
- Deployment: Azure Static Web Apps with the existing managed Node API
- Deployment ID: `34a35f07-053f-4c6a-bab0-5988b7359473`
- Managed API content hash: `78b24ff7c3633830d0ac3a038f1d1e8a`
- Live URL: <https://local-records-continuity.sociobot.in>

## Result

**PASS — every verification-7 product defect is repaired and no known release
blocker remains.** The Rust single-binary CLI, static site plus managed API
deployment class, researched scope, local-first behavior, and previously
passing recovery behavior are preserved.

## Repairs and exact regressions

1. **First-read desktop layout.** A short-desktop layout now uses equal hero
   columns, tighter vertical spacing, and a smaller display scale. The new
   Playwright regression checks the audience sentence, sample action, action
   explanation, and all three facts at both 1280×720 and 1366×768. Live bounds
   at 1280×720 now end at 413, 481, 516, and 598 px respectively; every item is
   inside the viewport. The 390×844 layout remains free of horizontal overflow.
2. **Managed API authentication and identity.** Static Web Apps reserves the
   `Authorization` header, so the browser and function now use
   `X-Continuity-License`. Missing or reserved credentials return 401 before
   verification; a product header reaches the live Sociobot verifier. Every
   protected response carries `X-Continuity-API-Build`, and `GET /api/build`
   publishes the non-secret release contract. Handler tests cover missing,
   reserved, invalid, valid-fixture, unknown-file, and verifier-outage paths.
3. **Focus visibility.** Paper surfaces use the recorded dark ochre ring;
   ochre, warning, and dark surfaces use raised-paper ink. The browser test
   computes the actual focus/surface ratio and requires at least 3:1. Live
   measured ratios are 5.10:1 on paper, 5.72:1 on the demo banner, 6.63:1 on
   the offline strip, and 11.55:1 on the dark demo panel.
4. **Claim completeness.** The exact `loud-scheduled-check` command now runs
   unavailable, zero-hour stale, byte-corrupt, and wrong-passphrase cases. The
   exact `passphrase-sources` command now decrypts through a 0600 file,
   environment value, hidden pseudo-terminal prompt, and fixture Linux Secret
   Service lookup. The exact `licensed-download` command covers invalid and
   valid verification plus public-build absence. The exact `offline-guide`
   command reloads both direct Demo and Home guide offline in its own context.
   All 14 manifest commands passed independently.
5. **Privacy inventory.** The unprovable public one-day lifecycle sentence was
   removed from Privacy, README, and CHANGELOG. The page now describes only the
   observable hashed, fixed-window counter behavior covered by the rate-limit
   claim.
6. **Mobile navigation and CLI clarity.** Install and Plus remain visible in
   every 390 px header. The zero-hour freshness error now reports precise
   seconds and explains that zero allows no elapsed time.
7. **Update path and design record.** The service-worker cache is version 5.
   `.factory/design.md` now matches the shipped `#9B4E1D` ochre token and
   records the two-surface focus treatment.

## Clean local verification

The final local gate began with `npm ci` and passed:

```text
npm ci                                                        PASS; 24 installed, 25 audited, 0 vulnerabilities
cargo fmt --all -- --check                                    PASS
cargo clippy --workspace --all-targets --all-features
  -- -D warnings                                              PASS
npm run typecheck                                             PASS
npm test                                                      PASS
  Rust library / binary / integration / doctest               6 / 2 / 7 / 1 passed
  CLI claim harness                                           8 passed
  managed API                                                 10 passed
  local Playwright                                            30 passed, 6 deployment/project skips
npm run build                                                 PASS; release CLI and dist/site
npm audit --audit-level=high                                  PASS; 0 vulnerabilities
cargo package --manifest-path crates/continuity/Cargo.toml
  --locked                                                    PASS; 29.3 KiB crate
all 14 exact commands in .factory/claims.json                 PASS
```

A fresh consumer root installed the packaged crate with `cargo install --path
target/package/continuity-pack-0.1.0 --root <fresh> --locked`. The installed
`continuity 0.1.0` binary ran `--ci --json demo`, returned
`sample-recovery-complete`, `file_count:3`, and `verified:true`, and left the
fresh caller directory empty.

Local `verify-url.sh` returned HTTP 200 with one H1, one main, `lang=en`, title,
complete image alternatives, and zero console errors. Local Lighthouse mobile
scored Performance 100, Accessibility 100, Best Practices 100, and SEO 100;
LCP was 1.81 s, TBT 0 ms, CLS 0, and transfer was 159,238 bytes.

## Production verification

- The factory deployment completed successfully. All 18 public artifacts in
  `dist/site` match production byte for byte by SHA-256.
- `verify-url.sh` returned HTTP 200 in 563 ms with title/lang/H1/main/alt checks
  clean and no console errors.
- Live Playwright: 34 passed, 2 intentional project skips across desktop and
  390 px. It covers keyboard/arrow tabs, skip navigation, Axe serious/critical
  scans, focus contrast, 44 px targets, offline/update behavior, storage
  isolation, privacy requests, the designed 404, response policy, and API
  identity/authentication.
- Keyboard starts at **Skip to main content** and reaches **Try it with sample
  data** after activation. At 200% text size, Home, Demo, Privacy, and Terms
  have no horizontal overflow at 390 px. Reduced-motion maximum animation and
  transition duration is 0.01 ms.
- `/api/build` returns release `local-records-continuity-repair-7`. The live
  protected endpoint returns 401 with no credential, 401 for the reserved
  `Authorization` header, and 403 for an invalid `X-Continuity-License`, proving
  that the product credential now reaches the deployed handler and verifier.
- The fresh fixed-window burst produced exactly 20 × 403 and 40 × 429. Every
  response reports `RateLimit-Policy: 20;w=60` and
  `RateLimit-Backend: shared-azure-blob`; every throttle includes Retry-After.
- Home, Demo, Privacy, Terms, 404, and every discovered link return the expected
  status. All public `/plus/*` asset paths return 404. CSP includes response
  header `frame-ancestors 'none'`; HSTS, nosniff, referrer, permissions, asset
  caching, and no-store service-worker policies are present.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.89 s, LCP 1.50 s, TBT 0 ms, CLS 0, transfer 158,627 bytes.
  Emitted Home JS is 7.91 KB raw total, CSS is 15.40 KB raw, fonts are 0, and
  the hero image is 146,138 bytes.
- The live Sociobot registry identifies Continuity Plus at USD 39.00 and the
  expected product checkout URL.

## Run and verify

```sh
continuity demo
npm ci
npm test
npm run typecheck
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
npm run build
npm audit --audit-level=high
cargo package --manifest-path crates/continuity/Cargo.toml --locked
npm run test:deployment:rate-limit
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test
```

Deploy with the work-order configuration:

```sh
/opt/fleet/lib/deploy-static.sh local-records-continuity dist/site
```

## Intentional verification boundaries

No card was charged and no production license token was available in the
worker, so a real paid-file response was not downloaded. The same deployed
path was proven through build identity, 401/403 credential semantics, the live
Sociobot invalid-token verdict, and a recorded valid-verdict handler/browser
fixture. OS-keychain write/delete and scheduler installation were not performed
because they mutate host state; retrieval integration, hidden input, schedule
output, and all recovery failure paths were exercised.
