# Review 4 handoff — Continuity Pack

## Status: FAIL

This reviewer changed no product code. The committed review is
`.factory/review-4.md`.

## What was verified

- Fresh live mobile (390×844) and desktop (1440×844) first reads identify the
  job, audience, and **Try it with sample data** action without scrolling.
- The one-click demo has immediate Maple Street Books output, a persistent
  sandbox banner, working reset, and no changes to real-data sentinels.
- All 18 declared claim commands passed via `npm test`'s separate-clean-clone
  runner. `npm run typecheck` and `npm run build` were also run.
- Live routing, metadata, 404, headers, link crawl, same-origin demo requests,
  console behavior, and product-specific visual identity were checked.

## Remaining work

Two major privacy claims lack matching claim inventory entries and observable
tests: the published download-counter storage details and the statement that no
business record data is sent. See F-4-1 and F-4-2 for exact quotes and required
tests.

## Re-run

```sh
npm ci
npm test
npm run typecheck
npm run build
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test --workers=1
```
