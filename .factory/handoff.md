# Continuity Pack — verification 11 handoff

Date: 2026-09-01
Work order: `local-records-continuity-verify-11`
Candidate: `cb9ca4161af7f683ffa1fb7ed2305e83b137ca93`
Live: <https://local-records-continuity.sociobot.in>

## Release status: FAIL

Do not release this candidate. The deployed landing-page action opens
`/demo/?demo=1`; after first visit and service-worker activation, that exact
URL reloads offline to the designed 404 rather than the sample demo. This
contradicts the declared offline claim and demo-sandbox contract.

The full independent evidence and retest procedure are in
`.factory/verification-11.md`.

## Verified

- All 16 declared claims passed first from independent clean no-dependency
  clones; `npm test`, typecheck, Clippy, and production build passed.
- The package was packed, installed into a fresh consumer, and its installed
  CLI completed `--ci --json demo` with `verified: true`.
- All 18 deployed static files SHA-256 match the candidate build. Live desktop
  and 390px checks found no console/page errors, no third-party demo requests,
  and no axe serious/critical findings.
- Live service-worker registration and update work. The non-query `/demo/`
  route reloads offline; only the actual one-click `?demo=1` route fails.
- The managed endpoint identity matches `local-records-continuity-repair-9`.
  Its documented allowance is enforced: 20 requests per 60 seconds; a 60-request
  burst produced 20 admitted responses and 40 `429` responses with
  `Retry-After`.
- Live Lighthouse: Performance 100, Accessibility 100, LCP 1.513 s, TBT 38 ms,
  CLS 0.

## Required next step

Normalize or ignore the demo query component in the service worker’s offline
navigation cache lookup, add a regression test for `/demo/?demo=1`, deploy it,
then re-run the clean-clone claims and live offline probe described in
`.factory/verification-11.md`.
