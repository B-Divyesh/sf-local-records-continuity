# Continuity Pack — verification 10 handoff

## Release status: FAIL

Candidate `47416e07e394f9eb434806f6f40b01485fb60390` at
<https://local-records-continuity.sociobot.in> is **not releasable** under the
work-order acceptance contract. Before dependency installation, 6 of the 16
exact claim commands in `.factory/claims.json` exit 127 because their
`npm run build:site` step cannot find `vite`. Any failed clean-clone claim is a
release blocker.

This is the sole release blocker. A low-severity README typo (“an pack check”)
is also recorded. After `npm ci`, all claims and all product quality gates
pass. Full evidence is in `.factory/verification-10.md`.

No product code was modified during verification.

## Exact blocking evidence

The initial clean-clone sequence produced:

- PASS: `demo-sandbox`, `pack-artifacts`, `authenticated-encryption`,
  `explicit-local-target`, `loud-scheduled-check`, `restore-integrity`,
  `free-core-and-json`, `passphrase-sources`, `schedule-preview`, and
  `protected-download-rate-limit`.
- FAIL with exit 127 and `sh: 1: vite: not found`: `sample-demo-page`,
  `license-restoration`, `offline-guide`, `browser-privacy`,
  `licensed-download`, and `plus-price-and-checkout`.

Make the declared browser/site claim commands self-contained from the required
clean state, then rerun all 16 before installing dependencies for broader QA.

## Passing evidence after installation

- `npm ci`: passed; 24 packages installed, 0 vulnerabilities.
- All 16 exact claim commands: passed after installation.
- `npm test`: passed — 6 Rust library, 2 binary, 7 CLI integration, 1 doctest,
  9 CLI claim, 10 API, and 36 local browser tests; 6 intentional scope skips.
- `npm run typecheck`, release build, rustfmt, and Clippy: passed.
- `cargo package`: passed; extracted package installed into a clean consumer;
  installed `--help` and the isolated JSON demo passed.
- Independent real CLI workflow and recovery/error matrix: passed, including
  zero-byte, 20 MiB, Unicode/spaced paths, corruption, missing inputs, wrong
  passphrase, non-empty restore output, freshness, and schedule errors.
- Live Playwright: 40 applicable tests passed in desktop and 390 px; 2 expected
  project-scope skips. Axe serious/critical findings: 0.
- Factory URL verifier: passed with no console errors.
- PWA service-worker update and offline Home/Demo reload: passed.
- Privacy request log: only the product origin during Home and Demo.
- Link crawl: all HTTP(S) links returned 200.
- Mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.5 s, TBT 30 ms, CLS 0, total transfer 157 KiB.
- Static live files match the candidate byte-for-byte. The managed API reports
  version 0.1.0 / `local-records-continuity-repair-8`, matching candidate
  source.
- Live rate limit: 60 concurrent requests yielded 20 admitted 403 responses
  and 40 throttled 429 responses, all with the documented policy and positive
  `Retry-After`. Observed allowance: 20 requests per client per fixed 60-second
  window.

## Retest

Run every `.factory/claims.json` command first from a fresh clone. If they all
pass, run the broader command list in `.factory/verification-10.md`.
