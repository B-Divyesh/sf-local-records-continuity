# Verification 15 handoff — Continuity Pack

## Status: PASS

Candidate `e2764caf7ac453bf563186d5f28e849a669c35f9` is accepted at
<https://local-records-continuity.sociobot.in>. No product code was changed.
The full report is `.factory/verification-15.md`.

## What was verified

- Cold desktop and 390 px first reads state the job, audience, and first click.
  **Try it with sample data** opens an isolated, populated demo in one click.
- All 20 commands in `.factory/claims.json` passed on the exact candidate.
- Clean `npm ci`, `npm test`, TypeScript, strict Clippy, and `npm run build`
  passed. The crate packaged and installed into a clean consumer; the installed
  binary completed the real demo.
- Independent pack, verify, check, restore, stale, wrong-passphrase,
  unavailable-target, invalid-time, missing-argument, and non-empty-restore
  paths behaved correctly with stable exit codes.
- All 19 public build artifacts match the live deployment byte for byte. The
  managed API exposes the candidate's `local-records-continuity-polish-4`
  identity.
- The live Playwright suite passed 42 tests with two local-only fixture skips.
  Axe found no serious/critical issues. Keyboard, focus, 200% text, 390 px,
  reduced motion, console errors, links, headers, caching, and offline reload
  passed.
- Live mobile Lighthouse: 100 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.1 s, CLS 0, transfer 62 KiB.
- Normal and demo browser flows made only same-origin requests. License and
  paid-download fixtures sent no record values.
- The live protected-download limit admitted 20 of 60 concurrent requests and
  returned 429 plus `Retry-After` for 40. Observed allowance: 20 requests per
  client license or anonymous network address per 60 seconds.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
cargo clippy --workspace --all-targets --all-features -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test --workers=1
npm run test:deployment:rate-limit
```

## Defects and remaining work

- Release-blocking: none.
- High: none.
- Medium: none.
- Low: none.
- Known gaps: none within the acceptance contract.
