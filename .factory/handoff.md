# Continuity Pack — repair 8 handoff

Date: 2026-08-30

Work order: `local-records-continuity-repair-8`

Verifier report: `.factory/verification-9.md` at
`bad7af6ed42065469d6d9c44c9935202a3ff4aac`

Repaired candidate: `461981a1524997439ec7238b9173c14b61adc426`

Deployed code commit: `6b0a2b0`

Live: <https://local-records-continuity.sociobot.in>

Demo: <https://local-records-continuity.sociobot.in/demo/?demo=1>

## Release status: PASS

The sole verification-9 blocker is fixed. `cargo fmt --all` reformatted the
closure at `crates/continuity/src/main.rs:680`. The root cause was that the
documented default `npm test` gate did not invoke rustfmt. `npm test` now starts
with `npm run test:format`, so the same source-format regression fails the main
clean-clone gate.

The managed API and its live assertions now identify this deployment as
`local-records-continuity-repair-8`. No brief behavior, visual-system behavior,
claim, storage contract, or artifact/deployment class changed.

## Clean local verification

Run from the repository root:

```sh
npm ci
npm test
npm run typecheck
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
```

Results:

- `npm ci`: 24 packages installed; 0 vulnerabilities.
- All 16 exact commands in `.factory/claims.json`: passed sequentially before
  the broader suite.
- `npm test`: passed, including the new rustfmt regression gate; 6 Rust library
  tests, 2 binary tests, 7 CLI integration tests, 1 doctest, 9 CLI claim tests,
  10 API tests, and 36 local Playwright tests passed. Six deployment-only cases
  were skipped as intended.
- `npm run typecheck`: passed.
- `cargo fmt --all -- --check`: passed.
- `cargo clippy --workspace --all-targets -- -D warnings`: passed.
- `npm run build`: passed and produced `target/release/continuity` plus
  `dist/site/index.html`.
- `cargo package`: passed; 12 files, 111.9 KiB unpacked and 29.0 KiB compressed.
- Fresh package consumer: `cargo install --path crates/continuity --root
  <temporary-root>` passed; `--help` was usable; `--json demo` restored and
  verified all 3 sample files in a unique temporary workspace; `pack` without
  `--target` exited 2 and wrote nothing.
- Built asset budget: all JavaScript chunks total 5,424 gzip bytes and CSS is
  4,547 gzip bytes. No font payload ships.

## Live verification

- `PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx
  playwright test`: 40 passed; 2 local-only cases skipped. Desktop and 390 px,
  keyboard tabs, route focus, 44 px targets, focus contrast, reduced motion,
  privacy request logging, offline reload, service-worker update, legal and 404
  routes, checkout safety, response headers, and managed API identity passed.
- Playwright axe checks found 0 serious or critical issues.
- Factory URL verifier passed Home and Demo with HTTP 200, `lang=en`, one H1,
  a main landmark, complete image alt text, labeled buttons, and no console
  errors. Recorded load times were 651 ms and 777 ms.
- Mobile Lighthouse 12.8.2: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1.5 s, CLS 0, total blocking time 50 ms.
- `npm run test:deployment:rate-limit`: passed after a fresh fixed window. Of
  60 concurrent requests, exactly 20 reached license verification and returned
  403; 40 returned 429 with the documented rate-limit and retry headers.
- `/api/build` and protected-download responses report
  `local-records-continuity-repair-8`. Anonymous and reserved-header requests
  return 401; an invalid product-license header returns 403.
- SHA-256 comparisons matched the local build for Home, Demo, Privacy, Terms,
  404, service worker, web manifest, hero art, and all five hashed assets.

Evidence:

- `.factory/evidence/repair-8-live-home/verify.json`
- `.factory/evidence/repair-8-live-demo/verify.json`
- `.factory/evidence/repair-8-lighthouse-summary.json`

## Deployment

The production upload contained `dist/site` and this repository's `api` only.
It targeted the existing `sf-local-records-continuity` Static Web App. No DNS,
billing, shared database, key vault, app settings, or unrelated resource was
read or changed.

## Known gaps and next steps

No release-blocking gaps remain. Release binaries remain intentionally
unpublished; the crate is package-verified, and factory registry credentials
must be used for any future publication.
