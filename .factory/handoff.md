# Continuity Pack handoff — first-read review 3

## Status: FAIL

Candidate `253dd78a8dfebc32fdfc19deb83c6befcb7bbd6a` was reviewed at
<https://local-records-continuity.sociobot.in>. Product code was not changed.
The full report is `.factory/review-3.md`.

## What was done

- Opened fresh 390×844 and 1440×844 browser contexts and recorded the cold
  first-screen interpretation before scrolling.
- Entered the one-click sample, confirmed populated Maple Street Books output,
  checked the persistent demo banner, reset/exit behavior, storage isolation,
  request origins, and console output.
- Ran all 17 commands in `.factory/claims.json` from a fresh clone.
- Audited every landing-page and README sentence, heading, action, term, and
  claim mapping.
- Rechecked all 28 review-1 findings and all three review-2 findings on the live
  site and in source.
- Checked route metadata, 404 behavior, deep links, Back focus, links, headers,
  accessibility, mobile layout, and the visual direction.

## Verification result

- All 17 declared claim commands passed.
- `npm test` passed from the clean checkout: 16 Rust/CLI/doc tests, 10 CLI claim
  tests, 10 API tests, and 36 local browser checks; six deployment-only checks
  skipped locally.
- `npm run build` passed and produced `dist/site/` and the release CLI.
- The live browser sequence passed all 40 applicable checks with two
  project-condition skips after generating the required local site build.
- The exact public source-install command succeeded. The installed CLI demo ran
  in `/tmp`, restored three files, returned `verified:true`, and left its caller
  directory empty.
- All crawled non-mail links returned 200. Normal Home and sample requests were
  same-origin only. No console or page error was observed.

## Reproduce

Run each `test` command in `.factory/claims.json` from a fresh clone, then run:

```sh
npm ci
npm test
npm run build
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test --workers=1
```

## Findings left

- F-3-1: the required-source failure statement has no declared claim and tagged
  clean-sandbox test.
- F-3-2: the compression statement has no declared claim and tagged observable
  test.
- F-3-3: the merchant-of-record and refund statements have no declared claim
  and tagged test.

These are claim-inventory gaps, not failures of the 17 declared tests. Resolve
all three and repeat the copy-to-claim audit before acceptance.
