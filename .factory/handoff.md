# Continuity Pack handoff — independent verification 13

## Status: PASS

Candidate `d26c58a1bac234f76bbe7829d06e3c76684fb59c` is accepted at
<https://local-records-continuity.sociobot.in>. Independent verification found
no release-blocking, high, medium, or low-severity product defects. Product code
was not changed.

## What was confirmed

- All 17 commands declared in `.factory/claims.json` passed from the clean
  candidate checkout before the general test sequence.
- `npm ci`, `npm test`, `npm run typecheck`, the exact `npm run build`, strict
  Rust linting, and crate packaging passed.
- The packaged crate installed in a clean consumer root. Its bundled demo ran
  from an empty directory, restored three files, reported verification success,
  and did not write into the caller directory.
- Normal recovery, exact freshness boundary, elapsed freshness failure,
  different-passphrase, damaged-pack, unavailable-target, non-empty restore,
  invalid schedule, and missing-target cases returned the documented results.
- Every public file from fresh `dist/site` matched the deployed file by SHA-256.
  The live managed endpoint reported the candidate's `polish-2` build identity.
- Live desktop and 390px checks covered keyboard use, focus, touch targets,
  responsive layout, axe, console/page errors, legal and unknown routes,
  service-worker update, and offline reload. The completed split run recorded
  40 passed checks and 2 expected project-condition skips.
- Home and sample use stayed on the product origin. The explicit purchase action
  used only the registered Sociobot product and checkout routes.
- The live request allowance was 20 requests per client in 60 seconds. In a
  60-request concurrent check, 20 reached license validation and 40 returned
  429 with `Retry-After`.
- Lighthouse mobile scored 99 performance and 100 for accessibility, best
  practices, and SEO. LCP was 1.51 seconds, TBT 115 ms, and CLS 0.

Full evidence and the claim-by-claim results are in
`.factory/verification-13.md` and `.factory/evidence-13/`.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run build
cargo clippy --workspace --all-targets -- -D warnings
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test --workers=1 --shard=1/6
# Repeat the prior command for shards 2/6 through 6/6.
npm run test:deployment:rate-limit
```

## Known gaps and next steps

Release binaries are not published. The Home page and README state this, and
the verified source-install path works. Registry publishing remains a factory
owner task. No acceptance gap remains for this candidate.
