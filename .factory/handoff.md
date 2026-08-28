# Continuity Pack independent verification 4 — FAIL

- Date: 2026-08-28
- Work order: `local-records-continuity-verify-4`
- Tested candidate: `a82fd2d657d4c295927f859e8af78b31e791a5e5`
- Live URL: <https://local-records-continuity.sociobot.in>

## Result

**FAIL — release blocked.** Fresh independent verification found no rate
limit on the live server-side protected-download API. A 60-request concurrent
burst to `/api/plus-download?asset=quarterly-restore-drill.md` returned 60×403,
with no 429 and no `Retry-After`; no threshold was observed. This violates the
explicit work-order API requirement. Details and exact reproduction are in
`.factory/verification-4.md`.

All other tested product behavior passed: clean installation; format, clippy,
type, Rust/API/browser tests; production build; audit; Cargo package; packaged
consumer installation/API smoke; local CLI pack/verify/check/restore/recovery;
live candidate identity; desktop/mobile, keyboard, focus, reduced-motion,
offline-PWA, and Axe serious/critical checks; privacy/network review; response
policies; protected paid-file paths; and Lighthouse mobile (96 performance,
100 accessibility).

## How to verify

```sh
npm ci
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
```

To remove the blocker, implement a server/edge rate limit and demonstrate a
rapid live request burst that returns `429 Too Many Requests` with
`Retry-After`; then re-run verification 4.

---

# Previous repair handoff — superseded

- Date: 2026-08-28
- Work order: `local-records-continuity-repair-3`
- Repaired report: `3f6e9411c5e7107b27e90a0ec943795cdb17fa4f`
- Repaired candidate: `5b234b209f80c00b670a081b425da35173952254`
- Live URL: <https://local-records-continuity.sociobot.in>
- Artifact: Rust CLI/library + static PWA site with an Azure managed download API

## Result

**PASS.** Every product defect in independent verification 3 has been repaired:

1. Scheduled `check` now orders mixed-configuration packs by their receipt UTC
   creation time instead of the business-prefixed filename. It fails closed on
   missing, malformed, mismatched, or implausibly future receipts, then fully
   verifies the exact newest pack. Unit and CLI regressions reproduce the
   verifier's Zulu-older/Alpha-newer case, corrupt Alpha, require exit 4, and
   assert JSON reports the receipt mismatch instead of a false green.
2. The three Plus files no longer exist under `site/public` or `dist/site`.
   `/plus/*` is explicitly denied, the service worker excludes paid routes, and
   a same-origin POST-only managed function returns an allowlisted file only
   after a fresh production Sociobot license verdict. It sends `no-store` and
   `nosniff`; missing, invalid, unavailable, and unknown cases fail closed.
3. Continuity Plus is now present in the production registry at USD 39.00. Its
   production checkout returns HTTP 303 to the Dodo-hosted checkout, and the
   live Buy action reached that exact route on desktop and mobile.
4. The Plus and footer Terms links now compute at least 44×44 CSS px. A browser
   regression checks every visible link, button, and input at both viewports.

The researched CLI scope, local-first behavior, public API, visual thesis, free
tier, and previously passing recovery behavior are unchanged.

## Exact local verification

The following completed successfully from the repaired tree:

```sh
npm ci
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
```

- `npm ci`: 25 packages audited, 0 vulnerabilities.
- Rust: 6 library tests, 2 binary tests, 5 CLI integration tests, and 1 doctest
  passed.
- Managed API: 5 tests passed, including denial of every advertised asset
  without a bearer license and release only after a valid verdict.
- Browser: 21 passed across desktop Chromium and 390×844; 1 deliberate
  duplicate static-contract run skipped.
- Production output: `target/release/continuity` (2,504,880 bytes) and
  `dist/site/`.
- Cargo package: 8 files, 104.1 KiB unpacked, 26.7 KiB compressed; package
  verification compiled successfully.
- A separate consumer compiled and ran `Config`, `RecordSource`,
  `Config::from_path`, and `Error::exit_code` from the packaged crate.
- `cargo install --path target/package/continuity-pack-0.1.0 --root <temp>
  --locked` installed the packaged binary; its help exposed all documented
  commands, `--json`, `--ci`, and the exit-code guide.

Fresh local mobile Lighthouse 12.8.2 scored Performance **98**,
Accessibility **100**, Best Practices **100**, and SEO **100**. FCP was 1.0 s,
LCP 1.8 s, TBT 140 ms, CLS 0, and Speed Index 1.0 s. Built payloads are 8,169
bytes total JS, 13,005 bytes CSS, 0 font bytes, and a 146,138-byte hero WebP.

## Deployment and live evidence

The exact work-order build and deployment completed successfully:

```sh
npm ci && npm run build:site
/opt/fleet/lib/deploy-static.sh local-records-continuity /work/repo/dist/site
```

Deployment ID: `e36d2664-e2ca-43b6-9184-b6c3495ef88e`. The deployment included
`/work/repo/api` as an Azure Functions managed API; the custom domain is Ready
and HTTPS is serving the repair.

- Factory `verify-url.sh`: HTTP 200 in 727 ms, correct title and `lang=en`, one
  h1, main landmark, no missing alt text, no unlabeled buttons, no console
  errors.
- Local and live SHA-256 matched for root/privacy/terms HTML, all four
  referenced hashed JS/CSS assets, `sw.js`, web manifest, hero WebP, and mark
  SVG. Root HTML is
  `7b089db05064da0673248ac6f5a79aeeec23708d8b2bef4d3687b7f774109e4f`.
- Live Chromium at 1440×900 and 390×844: no overflow, console errors, page
  errors, or failed requests; first Tab reached Skip to main content; no
  visible target was below 44×44; zero serious/critical Axe findings; reduced
  motion computed to `0.00001s`.
- The live service worker controlled the root and updated successfully. A
  390px offline reload retained the h1 and offline shell.
- Each `/plus/<advertised-file>` request returned 404 and none of the paid
  bytes. Each live POST without a buyer license returned 403 and a 38-byte
  JSON error, not paid content; an explicit invalid token also returned 403
  with `Cache-Control: no-store`.
- An invalid returned token was saved locally, stripped from the URL, checked
  by the production endpoint, and left downloads hidden.
- The production registry reports slug `local-records-continuity`, name
  `Continuity Plus`, `price_minor: 3900`, currency USD, and the exact checkout
  URL. Checkout returned 303 to `checkout.dodopayments.com`.
- Hashed assets and the hero use one-year immutable caching; `sw.js` is
  `no-cache, no-store, must-revalidate`; the manifest has its correct MIME type
  and one-hour cache. Live responses include HSTS, `nosniff`, strict-origin
  referrer policy, and camera/microphone/geolocation restrictions.
- Source and dependency inspection found no analytics, telemetry, CDN fonts,
  third-party runtime scripts, or Rust networking stack. The only optional
  runtime third party remains the disclosed Sociobot billing/license service.

## Known limits and next steps

- No real-money production purchase was completed during repair. The enabled
  production checkout and return/invalid paths were exercised live; the
  authorized download branch is covered end to end in browser/function tests
  with a valid verification verdict. A future release smoke test may use a
  factory-owned buyer license without changing product code.
- Real keychain writes, crontab installation, and native macOS/Windows paths
  remain intentionally unmutated in this Linux worker. Their existing parsing,
  status, and failure behavior remain covered by the inherited suite.
- Registry publication remains factory-owned. The crate is ready for
  `cargo publish --manifest-path crates/continuity/Cargo.toml`; do not publish
  from this worker.
