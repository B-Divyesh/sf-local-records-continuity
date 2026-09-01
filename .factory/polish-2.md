# Polish round 2 — zero-finding closure

Date: 2026-09-01

Reviewed candidate: `0fdb29af6514fe8574f5a37447b6828455705537`

Review report: `.factory/review-2.md` at
`a35e79566f825aba3848ceecf6b39f514ffaa1cc`

Deployed build identity: `local-records-continuity-polish-2`

Live URL: <https://local-records-continuity.sociobot.in>

## Every finding

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the short-desktop hero sizing that holds the audience, sample action, explanation, and facts above the fold at all reviewed desktop heights. | Playwright `desktop first screen keeps the audience, sample action, explanation, and facts in view`; live Home screenshot `.factory/evidence/polish-2-live-home/screenshot-desktop.png`; live `/`. |
| F-1-2 | Kept the mobile demo composition with populated Maple Street Books output immediately below its heading and controls. | `@claim:sample-demo-page`; Playwright `legal, demo, 404, and mobile layouts remain usable`; `.factory/evidence/polish-2-live-demo/screenshot-mobile.png`; live `/demo/?demo=1`. |
| F-1-3 | The manifest copy names the business, source files, verification command, and restore steps. | `@claim:pack-artifacts`; live `/#route`. |
| F-1-4 | Home and README say to build from source and state that release binaries are not available. | Playwright `reviewed copy stays plain, consistent, and release-honest`; live `/#guide`. |
| F-1-5 | No minimum Rust version is asserted. | Playwright reviewed-copy test; README audit. |
| F-1-6 | No single-binary claim is made. | Playwright reviewed-copy test; README audit. |
| F-1-7 | No alternate-install equivalence claim is made. | Playwright reviewed-copy test; README audit. |
| F-1-8 | No release-number promise is made. | Playwright reviewed-copy test; README audit. |
| F-1-9 | Public scheduling instructions cover the tested preview operation only. | `@claim:schedule-preview`; CLI help test. |
| F-1-10 | Passphrase tests scan configuration, pack companions, restore report, stdout, and stderr for the canary value. | `@claim:passphrase-sources`. |
| F-1-11 | Free-tier copy names only pack, check, verify, restore, exit codes, and JSON output. | `@claim:free-core-and-json`; live `/#plus`. |
| F-1-12 | Buyers can save, reload, recheck, reject, and remove a license. | `@claim:license-restoration`; live `/#plus`. |
| F-1-13 | Automatic refund-revocation wording remains absent. | Playwright reviewed-copy test; live `/#plus` and `/terms/`. |
| F-1-14 | Visitor copy uses “pack” consistently. | Playwright reviewed-copy test; `.factory/copy-audit.md`. |
| F-1-15 | Both demos call the `continuity check` stage “Check”; “Verify” is reserved for a named pack. | Playwright `demo tabs support arrow keys and expose a transcript`; live demo. |
| F-1-16 | Failure copy names a non-zero exit code and a specific problem. | `@claim:loud-scheduled-check`; live `/#route`. |
| F-1-17 | Free copy says “Pack, check, verify, and restore are free.” | `@claim:free-core-and-json`; live `/#plus`. |
| F-1-18 | The limitation heading remains “Verification limit.” | Playwright reviewed-copy test; live Home. |
| F-1-19 | Copy controls name the exact install, setup, and pack commands. | Playwright reviewed-copy and release-contract tests; live `/#guide`. |
| F-1-20 | README says the demo runs the same commands used with the reader’s files. | Playwright reviewed-copy test. |
| F-1-21 | The README opening remains split into short sentences. | `.factory/copy-audit.md`; Playwright reviewed-copy test. |
| F-1-22 | Scheduled-check failure guidance remains two short, actionable sentences. | `@claim:loud-scheduled-check`; README audit. |
| F-1-23 | Checkout availability copy is short and names what happens. | `@claim:plus-price-and-checkout`; Playwright unavailable-product test. |
| F-1-24 | Paid-download copy states only the tested license check and public-build absence. | `@claim:licensed-download`; live `/#plus` and `/privacy/`. |
| F-1-25 | README build output is concise and matches the produced `dist/site/`. | `npm run build`; Playwright reviewed-copy test. |
| F-1-26 | “Scheduled check” is used and explained consistently; “dry-read” remains absent. | `@claim:schedule-preview`, `@claim:loud-scheduled-check`, Playwright reviewed-copy test. |
| F-1-27 | The designed 404 retains canonical, description, Open Graph, Twitter, and social-card metadata. | Playwright release-contract and live-404 tests; live unknown route returns 404. |
| F-1-28 | Real route changes and browser history focus and announce the new H1. | Playwright `route navigation and browser history move focus to the new heading`, local and live. |
| F-2-1 | Added a separate precedence claim with conflicting values. It proves file beats environment and Secret Service, environment beats Secret Service, and a wrong higher-priority file does not fall through. | `@claim:passphrase-precedence`; exact command in `.factory/claims.json`; clean clone 10/17. |
| F-2-2 | Narrowed every public keychain statement to Linux Secret Service, the adapter exercised by the shipped claim fixture. Removed macOS Keychain and Windows Credential Manager claims from README, Home, privacy, and claims. | `@claim:passphrase-sources`; Playwright reviewed-copy test forbids the removed platform claims; live Home and `/privacy/`. |
| F-2-3 | Removed the four internal deployment assertions and their jargon. README now says to deploy `dist/site/` with configured environment settings. | Playwright reviewed-copy test forbids `pilot-api`, `RATE_LIMIT_BLOB_BASE_URL`, private-container SAS, append-blob, and Static Web App assertions; `npm run build`. |

## Shared evidence

- All 17 commands in `.factory/claims.json` passed from 17 independent clean
  clones before any manual Node setup.
- `npm test` passed 16 Rust, CLI, and doc tests; 10 CLI claim tests; 10 API
  tests; and 36 local browser cases. Six deployment-only cases skipped locally.
- `npm run typecheck`, `npm run build`, and `cargo package` passed. The build
  produced `dist/site/`, `target/release/continuity`, and the verified crate.
- A release CLI demo from an empty caller folder returned three files and
  `verified:true`; the caller folder remained empty.
- Playwright Axe checks found no serious or critical issue. Browser checks also
  covered keyboard operation, focus contrast, 44 px targets, reduced motion,
  390 px layout, offline reload, request privacy, route titles, 404, and console
  errors.
- Factory URL verification for local and live Home/demo pages found zero console
  errors and the required title, language, H1, main, image alt text, and labeled
  controls. Reports are under `.factory/evidence/polish-2-*-*/verify.json`.
- Lighthouse 12.8.2 scored 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO. LCP was 1.8 s, CLS 0, and TBT 0 ms. Full evidence:
  `.factory/evidence/polish-2-lighthouse.json`.
- The final live Playwright run passed all 40 applicable cases with two
  local-only skips. The demo claim also passed five isolated live repetitions.
- The live rate-limit probe returned exactly `403: 20` and `429: 40` for 60
  concurrent requests. `/api/build` reports
  `local-records-continuity-polish-2`.

No finding from review 1 or review 2 remains open.
