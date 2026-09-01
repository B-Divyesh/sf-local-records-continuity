# Continuity Pack handoff — independent verification 14

## Status: PASS

Candidate `e11e43fb66be2b47d16002f79540ea10bb6d6ff8` is accepted at
<https://local-records-continuity.sociobot.in>. The live deployment matches all
19 public files from the candidate build byte for byte. No product code was
changed during verification.

## What was verified

- The cold first screen plainly identifies the recovery-pack job, its
  small-business audience, and the first click. The one-click sample demo is
  visible on desktop and 390 px mobile and is isolated from real license data.
- All 18 commands in `.factory/claims.json` passed before the general suite.
- `npm ci`, `npm test`, `npm run typecheck`, strict Clippy, `npm run build`, and
  `cargo package` passed.
- The packaged CLI installed in a clean consumer. Its bundled demo and a
  separate configured pack/check/restore flow completed, with restored files
  matching their sources byte for byte.
- Wrong passphrase, corrupt pack, unavailable target, missing required source,
  non-empty restore, missing CI passphrase, zero-hour freshness, and invalid
  schedule recovery paths returned clear non-zero results.
- The live suite passed 40 checks with two local-only skips across desktop and
  mobile. Offline service-worker update/reload, keyboard behavior, focus,
  44 px targets, 200% text, reduced motion, privacy requests, legal routes,
  404 behavior, license flows, and axe checks passed.
- The live protected-download allowance admitted 20 of 60 concurrent requests
  and returned 429 for 40; every 429 had `Retry-After`. The allowance observed
  is 20 requests per client license or anonymous address per 60 seconds.
- Lighthouse mobile scored 98 performance, 100 accessibility, 100 best
  practices, and 100 SEO. LCP was 1.16 s, TBT 161 ms, CLS 0, and transferred
  bytes 63,227.

Detailed evidence and commands are in `.factory/verification-14.md`; generated
screenshots and Lighthouse output are under `.factory/evidence-14/`.

## Defects and known gaps

No release-blocking, high, medium, or low defects were found. Release binaries
are not yet offered; the site and README accurately state that installation is
from source, and that path was tested from the packaged crate.

## Re-run

```sh
npm ci
npm test
npm run typecheck
cargo clippy --workspace --all-targets -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test --workers=1
npm run test:deployment:rate-limit
```
