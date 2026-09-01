# Continuity Pack handoff — polish round 2

## Status: PASS

All 31 findings across `.factory/review-1.md` and `.factory/review-2.md` are
closed and mapped in `.factory/polish-2.md`. The released product keeps its
topographic field-guide identity and original CLI/static-site architecture.

The live release is <https://local-records-continuity.sociobot.in>. Its managed
API reports build `local-records-continuity-polish-2`.

## What changed

- Added `passphrase-precedence` to `.factory/claims.json` and a conflict-order
  integration test. It proves file, environment, then Linux Secret Service
  selection without fallback from a present higher-priority source.
- Narrowed public keychain support wording to the tested Linux Secret Service
  adapter. macOS and Windows support is no longer claimed to visitors.
- Removed internal endpoint, setting, permission, and storage jargon from the
  public README. A browser regression prevents those assertions returning.
- Updated the catalog description, copy audit, build identity, review mapping,
  and release evidence.

## Verification

Run from the repository root:

```sh
npm ci
npm test
npm run typecheck
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test
npm run test:deployment:rate-limit
```

Results:

- All 17 claim commands passed from independent clean clones.
- Rust/library/CLI/doc tests: 16 passed.
- CLI claim tests: 10 passed.
- API tests: 10 passed.
- Local browser suite: 36 passed, 6 deployment-only skips.
- Final live browser suite: 40 passed, 2 local-only skips.
- Live protected-download burst: 20 denied by license check, then 40 correctly
  rate-limited in the same 60-second window.
- Factory URL verifier: Home and direct `?demo=1` preview returned 200 with zero
  console errors and complete baseline semantics.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.8 s, CLS 0, TBT 0 ms.
- Production payload: 6.90 KB Home JS, 2.71 KB shared JS, and 16.61 KB CSS
  uncompressed. This is well within the product budgets.
- `npm run build` produced `dist/site/` and `target/release/continuity`.
  `cargo package` produced and verified `continuity-pack-0.1.0.crate`.
- A release demo run from an empty caller directory returned
  `sample-recovery-complete`, three files, and `verified:true`. The caller
  directory remained empty.

Evidence:

- `.factory/polish-2.md`
- `.factory/evidence/polish-2-lighthouse.json`
- `.factory/evidence/polish-2-live-home/verify.json`
- `.factory/evidence/polish-2-live-home/screenshot-desktop.png`
- `.factory/evidence/polish-2-live-demo/verify.json`
- `.factory/evidence/polish-2-live-demo/screenshot-mobile.png`

## Deployment

Built with `npm run build` and deployed through the work-order static deployment
path to the existing `sf-local-records-continuity` resource. The custom domain,
TLS, response-header CSP, designed 404, managed API identity, and protected
download behavior were rechecked after deployment.

## Known gaps and next steps

No acceptance finding or known product defect remains. Release binaries are not
published yet; the Home page and README state this plainly, and the verified
source install remains the supported path. Registry publishing stays with the
factory owner.
