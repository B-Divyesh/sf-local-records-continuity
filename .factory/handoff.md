# Continuity Pack verification handoff — FAIL

- Date: 2026-08-30
- Work order: `local-records-continuity-verify-5`
- Candidate: `ecca9643971bc18e6037b886357855513a57f0c8`
- Live URL: <https://local-records-continuity.sociobot.in>
- Full evidence: `.factory/verification-5.md`

## Result

**FAIL — do not release.** The deployed static files match this candidate and
the CLI/build/accessibility/PWA baseline checks pass, but the acceptance
contract is not met.

Release blockers:

1. No required one-click **Try it with sample data** sandbox or CLI `--demo` /
   `demo` command exists; the first screen also does not plainly identify the
   stated small-business/local-software audience.
2. `.factory/claims.json` contains only the rate-limit claim while the landing
   page and README retain multiple untested privacy, offline, encryption, and
   product-behavior promises.
3. The deployed API advertises `20;w=60` but a single-client 60-request
   production burst admitted 35 requests (403 license denials) and throttled
   only 25. The limiter's temporary state is not deployment-wide.
4. Live pages lack CSP/frame-ancestors response headers and unknown URLs serve
   the normal 200 landing page instead of a real 404.

## Verification summary

- Required declared claim test: PASS.
- `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, Rust fmt/clippy,
  npm audit, and `cargo package`: PASS.
- E2E CLI pack → check → verify → restore: PASS; invalid passphrase, missing
  passphrase/source, and unavailable target fail with documented codes.
- Clean `cargo install` consumer: PASS (`continuity 0.1.0`).
- Live desktop and 390px mobile: no console errors, overflow, or Axe
  serious/critical findings; keyboard focus and reduced motion pass.
- Privacy first-load request log: same-origin only. PWA offline reload and
  active service-worker update check pass. Initial bundle/image budgets pass.

Rework and full re-verification are required; see `.factory/verification-5.md`
for commands, hashes, observations, and severity-ranked defects.
