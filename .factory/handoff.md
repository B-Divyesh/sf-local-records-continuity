# Polish round 4 handoff — Continuity Pack

## Status: PASS

The privacy-claim repair is deployed from `e2764ca` (`fix: prove protected
download privacy`). The managed API reports
`local-records-continuity-polish-4` at
<https://local-records-continuity.sociobot.in/api/build>.

## What changed

- Added two declared, observable privacy claims to `.factory/claims.json`.
  `download-counter-privacy` records Azure Blob adapter writes and proves
  SHA-256-only counter identities, separate one-minute paths, and one-byte
  admissions. `no-record-upload` records every request in the browser license
  verification and protected-download flow, rejecting bundled record values.
- Updated the clean-clone assertion from 18 to 20 claims and moved the API
  build identity to polish 4.
- Retained all prior review fixes. `.factory/polish-4.md` maps F-1-1 through
  F-4-2 to source changes and evidence.
- Kept the catalog line verb-first and within 120 characters:
  “Build and test encrypted recovery packs for local business records.”

## How verified

Run locally from a clean clone:

```sh
npm ci
npm test
npm run typecheck
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
```

Evidence from this round:

- `npm test` passed the format check, 20 independent clean-clone claim
  commands, Rust/CLI/API tests, and local browser suite.
- `npm run typecheck`, `npm run build`, and the crate package verification
  passed. `dist/site/` was produced. Static JavaScript totals 12,263 bytes
  before gzip.
- The deployed suite passed: 42 tests, with two intentional
  project-condition skips. It covers Axe serious/critical violations, keyboard
  navigation, focus/history, mobile layout, offline reload, links, metadata,
  404 responses, demo isolation, new privacy request capture, and API identity.
- `npm run test:deployment:rate-limit` passed on the live service: 20 requests
  returned 403 after upstream invalid-license verification and 40 returned 429
  during one fresh fixed window.
- Cold live checks have zero console errors and complete structural basics:
  `.factory/evidence/polish-4-live-{home,demo,privacy,terms}/verify.json`.
  The mobile demo screenshot visibly contains its sandbox banner and populated
  sample result.
- Live Lighthouse results are 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO; LCP 1.064 s, CLS 0, TBT 60.5 ms. See
  `.factory/evidence/polish-4-lighthouse-live.json`.

## Deploy

The deployed address is <https://local-records-continuity.sociobot.in>. The
site and scoped managed API were deployed with:

```sh
/opt/fleet/lib/deploy-static.sh local-records-continuity dist/site
```

## Known gaps and next steps

None. The CLI intentionally does not claim a full application restore; users
must periodically test an import into their own application, as stated in the
product and terms.
