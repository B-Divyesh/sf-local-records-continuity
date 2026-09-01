# Independent verification 12 — PASS

- Date: 2026-09-01
- Work order: `local-records-continuity-verify-12`
- Candidate commit: `0fdb29af6514fe8574f5a37447b6828455705537`
- Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**PASS — release candidate accepted.** The product meets the researched brief's
local recovery-pack job: the CLI packages configured files into encrypted packs,
writes a readable manifest and receipt, verifies an explicit target, restores
files, and makes scheduled checking reviewable. No product code was modified
during this verification.

## Cold first read

The cold live first screen answers the required questions in plain words:

- It does: “Build a recovery pack for local business records.”
- It is for: small businesses using self-hosted or local admin software.
- First action: “Try it with sample data,” with adjacent copy explaining that it
  opens the bookshop sample and temporary-folder demo command.

The action is visible on desktop and at 390 px, opens `/demo/?demo=1` in one
click, and shows the persistent sample-data banner, reset action, and Start for
real action.

## Mandatory claims gate

`.factory/claims.json` is present and contains 16 claims. Each exact declared
command was run from this clean checkout through the shipped sample/demo entry
point. **16/16 passed**:

| Claim | Result |
| --- | --- |
| demo-sandbox | PASS |
| sample-demo-page | PASS |
| pack-artifacts | PASS |
| authenticated-encryption | PASS |
| explicit-local-target | PASS |
| loud-scheduled-check | PASS |
| restore-integrity | PASS |
| free-core-and-json | PASS |
| passphrase-sources | PASS |
| schedule-preview | PASS |
| license-restoration | PASS |
| offline-guide | PASS |
| browser-privacy | PASS |
| protected-download-rate-limit | PASS |
| licensed-download | PASS |
| plus-price-and-checkout | PASS |

This includes the repaired direct demo URL: a fresh context loads
`/demo/?demo=1`, receives service-worker control, goes offline, reloads, and
continues to render the sample preview without changing real-storage sentinels.

## Local quality and CLI package checks

```text
npm ci                                                        PASS (24 packages; 0 vulnerabilities)
npm test                                                      PASS
npm run typecheck                                             PASS
npm run build                                                 PASS (release CLI and dist/site)
cargo clippy --workspace --all-targets -- -D warnings         PASS
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
                                                               PASS
```

The packed `continuity-pack-0.1.0.crate` was extracted into a new temporary
consumer directory and installed with `cargo install --path … --root …
--locked`. The installed `continuity --help` presents the documented public
commands and exit-code contract. `continuity --ci --json demo` returned one
result with `status: "sample-recovery-complete"`, `file_count: 3`, and
`verified: true`.

The normal, boundary, invalid-input, and recovery paths are exercised by the
claim suite: absent target is rejected, unavailable/stale/corrupt/unreadable
targets produce actionable non-zero checks, a wrong passphrase is rejected,
and restore reproduces all shipped sample bytes.

## Live deployment, privacy, accessibility, and performance

- Candidate identity: live `/` HTML and the `home`, shared PWA JS, and CSS
  asset SHA-256 values exactly match fresh `dist/site` output. The managed API
  identifies itself as `local-records-continuity-repair-10`, matching this
  candidate's source and deployed checks.
- `PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test`
  passed all **42** deployed checks: desktop and 390 px flows, keyboard tabs
  and route focus, visible focus contrast, touch-target size, service-worker
  update/offline reload, console/page errors, axe serious/critical findings,
  response policy, legal/404 routes, and Plus controls.
- The normal Home-to-Demo request log contains only the product origin. There
  are no analytics, third-party fonts/scripts, or record-data requests. The
  CLI no-network and explicit-target claim also passed.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy, denied
  camera/microphone/geolocation, and CSP with response-header
  `frame-ancestors 'none'`. HTML is revalidated at 30 seconds; hashed assets
  are one-year immutable; `/sw.js` is `no-cache, no-store, must-revalidate`.
- Production first-load assets are well within the static budgets: initial
  JavaScript is 9.6 kB raw across the Home and shared PWA modules (about
  4.1 kB gzip); CSS is 16.6 kB raw / 4.6 kB gzip; the 146 kB WebP hero is below
  the 300 kB mobile image budget.
- Fresh Lighthouse 12.8.2 mobile against the live Home page: **Performance
  100**, **Accessibility 100**, LCP **1,593 ms**, TBT **35.5 ms**, and CLS
  **0**. The JSON evidence is `/tmp/continuity-pack-lighthouse-12.json` in
  this verification environment.

## Request allowance

`npm run test:deployment:rate-limit` passed against the deployed managed
endpoint. One client made 60 concurrent protected-download requests in a fresh
fixed window: **20** received the expected inactive-license `403` response and
the next **40** received **429**. Every throttled response carried a positive
`Retry-After`; the response policy was `RateLimit-Policy: 20;w=60` using the
shared blob backend. The observed allowance is therefore **20 requests per
client license or anonymous network address per 60 seconds**.

## Defects by severity

No release-blocking, high, medium, or low-severity defects found.
