# Polish round 3 — zero-finding closure

Date: 2026-09-01

Reviewed candidate: `253dd78a8dfebc32fdfc19deb83c6befcb7bbd6a`

Review report: `.factory/review-3.md` at
`24bb4110bfeb90345112ab2acb7fce2fb7435a72`

Repair commits: `05de442`, `ff8d0d8`, `f119aed`

Deployed build identity: `local-records-continuity-polish-3`

Live URL: <https://local-records-continuity.sociobot.in>

## Every finding

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Preserved the short-desktop hero layout that keeps the audience, action, explanation, and facts in the first viewport. | Playwright `desktop first screen keeps the audience, sample action, explanation, and facts in view`; `.factory/evidence/polish-3-live-home/screenshot-desktop.png`; live `/`. |
| F-1-2 | Preserved the mobile demo composition with populated Maple Street Books output immediately visible. | `@claim:sample-demo-page` and Playwright `legal, demo, 404, and mobile layouts remain usable`; `.factory/evidence/polish-3-live-demo/screenshot-mobile.png`; live `/demo/?demo=1`. |
| F-1-3 | The manifest names the business, every source, verification command, and restore steps. | `@claim:pack-artifacts`; `.factory/evidence/polish-3-live-home/screenshot-desktop.png`; live `/#route`. |
| F-1-4 | Home and README consistently say to build from source and that release binaries are unavailable. | Playwright `reviewed copy stays plain, consistent, and release-honest`; Home screenshot; live `/#guide`. |
| F-1-5 | No minimum Rust version is asserted. | Playwright reviewed-copy test; Home screenshot; live source link from `/`. |
| F-1-6 | No single-binary claim is present. | Playwright reviewed-copy test; Home screenshot; live source link from `/`. |
| F-1-7 | No alternate-install equivalence claim is present. | Playwright reviewed-copy test; Home screenshot; live source link from `/`. |
| F-1-8 | No unproved release-number promise is present. | Playwright reviewed-copy test; Home screenshot; live source link from `/`. |
| F-1-9 | Public scheduling instructions describe only the tested preview behavior. | `@claim:schedule-preview`; Home screenshot; live source link from `/`. |
| F-1-10 | Passphrase fixtures scan configuration, generated files, reports, stdout, and stderr for a canary. | `@claim:passphrase-sources`; Home screenshot; live `/privacy/`. |
| F-1-11 | Free-tier copy names only pack, check, verify, restore, exit codes, and JSON output. | `@claim:free-core-and-json`; Home screenshot; live `/#plus` and `/terms/`. |
| F-1-12 | Buyers can save, reload, recheck, reject, and remove a license. | `@claim:license-restoration`; Home screenshot; live `/#plus`. |
| F-1-13 | Automatic refund-revocation wording remains absent. | Playwright reviewed-copy test; Home screenshot; live `/#plus` and `/terms/`. |
| F-1-14 | Visitor copy consistently calls the encrypted artifact a pack. | Playwright reviewed-copy test; Home screenshot; live `/`. |
| F-1-15 | Both samples call `continuity check` “Check”; Verify is reserved for a named pack. | Playwright `demo tabs support arrow keys and expose a transcript`; Demo screenshot; live `/demo/?demo=1`. |
| F-1-16 | Failure copy names the non-zero result and the reported problem. | `@claim:loud-scheduled-check`; Home screenshot; live `/#route`. |
| F-1-17 | Free copy says pack, check, verify, and restore are free. | `@claim:free-core-and-json`; Home screenshot; live `/#plus`. |
| F-1-18 | The limitation heading remains “Verification limit.” | Playwright reviewed-copy test; Home screenshot; live `/`. |
| F-1-19 | Copy controls name the install, setup, and pack commands. | Playwright reviewed-copy and release-contract tests; Home screenshot; live `/#guide`. |
| F-1-20 | README says the sample runs the same commands used with the reader’s files. | Playwright reviewed-copy test; Home screenshot; live source link from `/`. |
| F-1-21 | The README opening remains split into short sentences. | `.factory/copy-audit.md` and Playwright reviewed-copy test; Home screenshot; live source link from `/`. |
| F-1-22 | Scheduled-check guidance remains short and actionable. | `@claim:loud-scheduled-check`; Home screenshot; live source link from `/`. |
| F-1-23 | Checkout availability copy is short and names what happens. | `@claim:plus-price-and-checkout` and Playwright unavailable-product test; Home screenshot; live `/#plus`. |
| F-1-24 | Paid-download copy states only the tested license check and public-build absence. | `@claim:licensed-download`; Home screenshot; live `/#plus` and `/privacy/`. |
| F-1-25 | Build-output copy remains concise and matches the generated `dist/site/`. | `npm run build` and Playwright reviewed-copy test; Home screenshot; live source link from `/`. |
| F-1-26 | “Scheduled check” is used and explained consistently; “dry-read” remains absent. | `@claim:schedule-preview`, `@claim:loud-scheduled-check`, and reviewed-copy test; Home screenshot; live `/#route`. |
| F-1-27 | The designed 404 retains canonical, description, Open Graph, Twitter, and icon metadata. | Playwright `release install, 404, and response policy contracts are deployable` plus live deployment 404 test; Home screenshot; live `/missing-polish-3` returned 404. |
| F-1-28 | Route navigation and browser history focus and announce each new H1. | Playwright `route navigation and browser history move focus to the new heading`; Demo screenshot; live Home → Demo → Back → Forward. |
| F-2-1 | The independent precedence claim still proves file, environment, then Linux Secret Service selection. | `@claim:passphrase-precedence`; Home screenshot; live source link from `/`. |
| F-2-2 | Public copy continues to name only the tested Linux Secret Service adapter. | `@claim:passphrase-sources` and reviewed-copy test; Home screenshot; live `/privacy/`. |
| F-2-3 | Public README remains free of the four internal deployment assertions and their jargon. | Playwright reviewed-copy test and `npm run build`; Home screenshot; live source link from `/`. |
| F-3-1 | Added `required-sources` to the claims inventory. Its fresh-workspace test configures a missing required file, asserts exit 3 and the missing path, and proves no local or target artifacts exist. | `@claim:required-sources`; all 18 commands passed from independent clean clones; Home screenshot; live `/#route`. |
| F-3-2 | Removed the unneeded public compression assertion while retaining the tested XChaCha20-Poly1305 statement. Added a copy regression guard. | Playwright `reviewed copy stays plain, consistent, and release-honest`; Home screenshot; live `/#route`. |
| F-3-3 | Replaced merchant/refund assertions across Home, README, Privacy, and Terms with the observable statement “Checkout opens on Sociobot.” Added copy regression guards. | `@claim:plus-price-and-checkout` and reviewed-copy test; Home screenshot; live `/#plus`, `/privacy/`, and `/terms/`. |

## Final verification

- All 18 claim commands passed in independent clean clones at the final product code.
- `npm test` passed the format check, clean-clone runner, 16 Rust/CLI/doc tests,
  11 CLI claim tests, 10 API tests, and 36 local browser checks. Six
  deployment-only browser checks skipped locally as designed.
- `npm run build`, `npm run typecheck`, and `cargo package` passed. The build
  produced `dist/site/`; the crate package verified successfully.
- Final live Playwright passed 40 applicable checks with two local-only skips.
  This covered Axe, keyboard operation, focus/history, 44 px targets, mobile
  overflow, offline reload, privacy request origins, metadata, 404 behavior,
  checkout, and managed API identity.
- Final live URL verifier reports are in
  `.factory/evidence/polish-3-live-{home,demo,privacy,terms}/verify.json`; all
  have zero console errors, one H1, one main landmark, `lang=en`, labeled
  buttons, and complete alt text.
- Final live screenshots are beside those reports. The mobile demo screenshot
  shows the persistent demo banner and populated sample result.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices, and
  100 SEO; LCP 1.07 s, CLS 0, TBT 60 ms. Evidence:
  `.factory/evidence/polish-3-lighthouse-live.json`.
- The live distributed rate-limit probe made 60 requests: exactly 20 returned
  403 and 40 returned 429. `/api/build` reports
  `local-records-continuity-polish-3`.

No finding from reviews 1, 2, or 3 remains open.
