# Polish round 1 — finding closure

Date: 2026-08-30

Reviewed candidate: `c748ae55a887c19b94735e5b406ea5ae3a49ddb7`

Review: `.factory/review-1.md` at `e83e6e915ef562ce681903f5ce1df8805902c48c`

Deployed build identity: `local-records-continuity-polish-1`
Live URL: <https://local-records-continuity.sociobot.in>

## Every finding

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Extended the short-desktop layout through 1024 px and reduced hero scale/spacing so the action, explanation, and three facts remain above the fold. Added 1280×720, 1366×768, 1440×821, 1440×844, 1440×900, and 1440×961 coverage. | Playwright `desktop first screen keeps the audience, sample action, explanation, and facts in view`; screenshot `.factory/evidence/home-1440x844.png`; live `/` passed the 38-case suite. |
| F-1-2 | Rebuilt the demo first screen as a heading-and-terminal composition. At 390×844 the realistic Pack result is at least 70% visible with banner, Reset demo, and Start for real above it. | Playwright `legal, demo, 404, and mobile layouts remain usable`; screenshot `.factory/evidence/demo-390x844.png`; live `/demo/?demo=1` verifier has zero console errors. |
| F-1-3 | Replaced the human claim with exact manifest contents: business, source files, verification command, and restore steps. Expanded the manifest claim test to assert every field. | `@claim:pack-artifacts`; live `/#route`; home screenshot. |
| F-1-4 | Removed the contradictory download instruction and factory wording. Home and README now say: “Build from source. Release binaries are not available yet.” | Playwright `reviewed copy stays plain, consistent, and release-honest` and `release install, 404, and response policy contracts are deployable`; live `/#guide`. |
| F-1-5 | Removed the unproved minimum Rust version. | Playwright `reviewed copy stays plain, consistent, and release-honest`; `.factory/copy-audit.md`; live `/#guide`. |
| F-1-6 | Removed the single-binary claim from README and changed the visible heading to “Build the command.” | Playwright `reviewed copy stays plain, consistent, and release-honest`; home screenshot; live `/#guide`. |
| F-1-7 | Removed the untested “is equivalent” install statement. | Playwright `reviewed copy stays plain, consistent, and release-honest`; `.factory/copy-audit.md`; live `/#guide`. |
| F-1-8 | Removed the unproved release-number statement. | Playwright `reviewed copy stays plain, consistent, and release-honest`; `.factory/copy-audit.md`; live `/#guide`. |
| F-1-9 | README now documents only the schedule preview. CLI help says it prints an entry for review; the install flag is not advertised. Added an isolated crontab trap. | `@claim:schedule-preview`; `continuity schedule --help`; live README source link from `/`. |
| F-1-10 | Expanded the passphrase claim test to scan configuration, encrypted pack companions, restore report, stdout, and stderr for the canary. | `@claim:passphrase-sources`; live `/privacy/`; home screenshot. |
| F-1-11 | Replaced the broad non-gating statement with the tested set: pack, check, verify, restore, exit codes, and JSON output. | `@claim:free-core-and-json`; Playwright plain-copy test; live `/#plus` and `/terms/`. |
| F-1-12 | Added a visible Remove saved license action and a claim test covering form entry, verification, reload, invalid state, removal, and storage deletion. | `@claim:license-restoration`; live `/#plus`; home screenshot. |
| F-1-13 | Removed the automatic revocation claim. Copy now states only that Sociobot/Dodo handles refunds. | Playwright `reviewed copy stays plain, consistent, and release-honest`; live `/#plus` and `/terms/`. |
| F-1-14 | Replaced “archive” with “pack” in visitor copy and README. | Playwright plain-copy test; `.factory/copy-audit.md`; live `/`. |
| F-1-15 | Renamed the home demo stage from Verify to Check while retaining Verify only for a named pack command. | Playwright `demo tabs support arrow keys and expose a transcript` and plain-copy test; live `/#demo`; home screenshot. |
| F-1-16 | Replaced “exits loudly” with a non-zero exit code and named-problem description. | `@claim:loud-scheduled-check`; Playwright plain-copy test; live `/#route`. |
| F-1-17 | Replaced “complete safety path” with “Pack, check, verify, and restore are free.” | `@claim:free-core-and-json`; Playwright plain-copy test; live `/#plus`. |
| F-1-18 | Renamed “Honest boundary” to “Verification limit.” | Playwright plain-copy test; `.factory/copy-audit.md`; live `/`. |
| F-1-19 | Copy buttons now say Copy install command, Copy setup command, and Copy pack command, then briefly say Copied. | Playwright plain-copy test and `release install, 404, and response policy contracts are deployable`; live `/#guide`. |
| F-1-20 | Replaced implementation jargon with “the same pack, check, and restore commands used with your own files.” | Playwright plain-copy test; `.factory/copy-audit.md`; live README source link. |
| F-1-21 | Split the 37-word README opening into three short sentences. | Playwright plain-copy test; `.factory/copy-audit.md`; live source link. |
| F-1-22 | Split the scheduled-check explanation into two short, actionable sentences. | `@claim:loud-scheduled-check`; `.factory/copy-audit.md`; live source link. |
| F-1-23 | Split checkout availability copy and removed web jargon. | `@claim:plus-price-and-checkout` plus `purchase does not send customers to an unregistered checkout`; live `/#plus`. |
| F-1-24 | Rewrote paid-download copy as two short sentences and retained the absence/live-license assertions. | `@claim:licensed-download`; live `/#plus` and `/privacy/`. |
| F-1-25 | Rewrote build output as: “It builds the release CLI and static site. The deployable site is in dist/site/.” | Clean-clone `npm run build`; Playwright plain-copy test; live source link. |
| F-1-26 | Replaced “dry-read” with “scheduled check” in the site, README, CLI help, scheduler marker, and paid field kit. The explanation says it decrypts the pack and compares every hash. | `@claim:schedule-preview`, `@claim:loud-scheduled-check`, CLI help check, and Playwright plain-copy test; live `/#route`. |
| F-1-27 | Added canonical, Open Graph, Twitter, description, and social-card metadata to the designed 404. | Playwright `release install, 404, and response policy contracts are deployable`; live unknown URL returns 404; `/404.html` metadata assertion. |
| F-1-28 | Added programmatic H1 focus, a polite route announcement, and persistent back/forward focus restoration for real route transitions. | Playwright `route navigation and browser history move focus to the new heading`; live Home → Demo → Back → Forward passed in both projects. |

## Additional live defect found and closed

The first production concurrency probe admitted 26 of 60 protected-download
requests because one browser client could arrive through changing network
addresses. The final limiter uses the hashed license token as the stable paid
client identity and a hashed edge address for anonymous clients. The regression
test rotates one license across six addresses. After redeployment,
`npm run test:deployment:rate-limit` returned exactly `403: 20, 429: 40`.

## Shared evidence

- Clean clone at final code commit: all 16 commands in `.factory/claims.json`
  passed; `npm test` passed 16 Rust/doc tests, 9 CLI claim tests, 10 API tests,
  and 34 local browser tests with 6 deployment-only skips.
- `npm run build` produced `dist/site/` and `target/release/continuity`.
- Initial payload: 6.90 KB JS home entry, 2.71 KB shared JS, 16.61 KB CSS
  uncompressed; all are far below budget.
- Lighthouse 12.8.2: 100 performance, 100 accessibility, 100 best practices,
  100 SEO (`.factory/evidence/lighthouse-summary.json`).
- Live Playwright: 38 passed, 2 deliberate project-scope skips.
- Live verifier: `.factory/evidence/live-home/verify.json` and
  `.factory/evidence/live-demo/verify.json`; both report zero console errors.
- Cold live routes: `/`, `/demo/?demo=1`, `/privacy/`, and `/terms/` return 200;
  an unknown route returns the designed 404; `/api/build` reports
  `local-records-continuity-polish-1`.

No finding from review 1 remains open.
