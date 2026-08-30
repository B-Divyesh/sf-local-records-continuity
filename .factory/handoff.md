# Continuity Pack verification handoff — FAIL

- Date: 2026-08-30
- Work order: `local-records-continuity-verify-7`
- Tested commit: `8fd4f0f385b1f189dc7dd2030cc166b29b04bc83`
- Live URL: <https://local-records-continuity.sociobot.in>
- Full report: [`.factory/verification-7.md`](verification-7.md)

## Result

**FAIL — do not release this candidate.** The CLI recovery path and PWA repair
work, but three release gates fail:

1. At the repository's 1280×720 desktop viewport, the audience sentence is
   clipped and **Try it with sample data** begins at y=779, below the first
   screen. This directly fails the mandatory first-read gate.
2. The candidate API returns 401 without a Bearer license, while production
   returns 403 `license is not active` for no header, empty header, Basic auth,
   and arbitrary Bearer auth. Static files match the candidate exactly, but
   the paid-download backend does not preserve candidate authentication
   behavior and exposes no build identity.
3. The 3 px focus ring has only 1.25:1 contrast on the demo banner, 1.44:1 on
   the offline strip, and 2.51:1 on the dark demo panel; the required minimum
   is 3:1.

The claims contract also needs repair: several exact tagged commands prove
only part of their declared claim, and the Privacy page's one-day rate-counter
retention promise is absent from `.factory/claims.json`.

## What passed

- All 14 declared claim commands passed after clean `npm ci`.
- `npm test`: all Rust, CLI, claim, API, and 27 runnable local browser tests
  passed; 3 conditional browser cases skipped.
- `npm run typecheck`, `cargo fmt --check`, strict Clippy, `npm run build`,
  `npm audit`, and `cargo package --locked` passed.
- The packaged crate installed into a clean root; the installed v0.1.0 binary
  completed the isolated three-file demo. Independent pack/check/verify/
  restore and invalid-input/recovery paths returned correct data and exits.
- All 18 public static artifacts match production byte for byte.
- The previous direct-demo PWA defect is fixed: `/demo/` controls service
  worker v4, updates, reloads offline, preserves storage isolation, and makes
  the Home guide available offline.
- Desktop/390 px semantic checks, link crawl, 44 px targets, 200% text resize,
  reduced motion, and axe serious/critical scans otherwise pass. Normal/demo
  traffic is same-origin only and valid routes have no console/page errors.
- Live rate limiting passed at 20 admitted requests per fixed 60-second window,
  then 40 of the 60-request burst returned 429 with `Retry-After`.
- Lighthouse mobile: Performance 94, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.55 s and CLS 0. Initial JS/CSS/font/hero budgets pass.

## Commands to reproduce

```sh
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

The full report contains exact viewport coordinates, endpoint response matrix,
claim-coverage gaps, accessibility ratios, package-consumer results, headers,
caching, request logs, PWA evidence, and test totals. Product code was not
modified during verification.
