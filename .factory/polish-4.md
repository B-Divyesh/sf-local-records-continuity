# Polish round 4 — privacy-claim closure

Date: 2026-09-02  
Deployed product revision: `e2764ca` (`local-records-continuity-polish-4` API identity)

## Shared evidence

- Full clean-clone suite: `npm test` (20 declared claim commands, Rust/CLI/API,
  and local Playwright suite) passed on `e2764ca`.
- Release checks: `npm run typecheck`, `npm run build`, and
  `cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty`
  passed.
- Live suite: `PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test --workers=1`
  passed 42 tests with two intentional project-condition skips.
- Live rate-limit probe: `npm run test:deployment:rate-limit` passed with 20
  `403` admissions and 40 `429` responses in one fresh minute.
- Cold live verifier reports and screenshots: Home
  `.factory/evidence/polish-4-live-home/`, Demo
  `.factory/evidence/polish-4-live-demo/`, Privacy
  `.factory/evidence/polish-4-live-privacy/`, and Terms
  `.factory/evidence/polish-4-live-terms/`. Each has zero console errors,
  `lang=en`, one H1, one main landmark, and complete image/button basics.
- Live Lighthouse mobile: 100 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1,064 ms, CLS 0, TBT 61 ms. Evidence:
  `.factory/evidence/polish-4-lighthouse-live.json`.

Evidence aliases in the table: **H** = Home desktop/mobile screenshots,
**D** = Demo mobile screenshot, **P** = Privacy screenshot. Each live URL uses
the production origin `https://local-records-continuity.sociobot.in`.

## Every finding

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Preserved the short desktop hero so audience, sample action, explanation, and facts fit through 1440×844. | Playwright `desktop first screen…`; H; live `/`. |
| F-1-2 | Preserved populated Maple Street Books output in the first mobile demo viewport. | `@claim:sample-demo-page`; D; live `/demo/?demo=1`. |
| F-1-3 | Manifest naming of business, sources, verify command, and restore steps remains explicit. | `@claim:pack-artifacts`; H; live `/#route`. |
| F-1-4 | Home and README retain source-build-only wording and state that binaries are unavailable. | Playwright reviewed-copy test; H; live `/#guide`. |
| F-1-5 | No minimum Rust version is promised. | Playwright reviewed-copy test; H; live source link. |
| F-1-6 | No single-binary promise is made. | Playwright reviewed-copy test; H; live source link. |
| F-1-7 | No untested alternate-install equivalence is claimed. | Playwright reviewed-copy test; H; live source link. |
| F-1-8 | No unproved release-number promise remains. | Playwright reviewed-copy test; H; live source link. |
| F-1-9 | Public scheduling copy covers only the non-installing preview. | `@claim:schedule-preview`; H; live README source link. |
| F-1-10 | Canary scans keep raw passphrases out of generated files and command output. | `@claim:passphrase-sources`; P; live `/privacy/`. |
| F-1-11 | Free-tier text names only the independently tested command set. | `@claim:free-core-and-json`; H; live `/#plus`. |
| F-1-12 | License save, reload, recheck, rejection, and removal remain available. | `@claim:license-restoration`; H; live `/#plus`. |
| F-1-13 | Automatic-revocation wording remains absent. | Playwright reviewed-copy test; H; live `/terms/`. |
| F-1-14 | Visitor copy consistently calls the encrypted artifact a pack. | Playwright reviewed-copy test; H; live `/`. |
| F-1-15 | Both demos label `continuity check` as Check; Verify remains the named-pack command. | Playwright demo-tab test; D; live `/demo/?demo=1`. |
| F-1-16 | Failure language names non-zero exit behavior and an actionable problem. | `@claim:loud-scheduled-check`; H; live `/#route`. |
| F-1-17 | Free copy directly states that pack, check, verify, and restore are free. | `@claim:free-core-and-json`; H; live `/#plus`. |
| F-1-18 | The limit is labelled Verification limit. | Playwright reviewed-copy test; H; live `/`. |
| F-1-19 | Copy controls name the command they copy. | Playwright release-contract test; H; live `/#guide`. |
| F-1-20 | README says the sample uses the same commands as real files. | Playwright reviewed-copy test; H; live source link. |
| F-1-21 | README opening remains split into short direct sentences. | `.factory/copy-audit.md`; H; live source link. |
| F-1-22 | Scheduled-check guidance remains short and actionable. | `@claim:loud-scheduled-check`; H; live source link. |
| F-1-23 | Checkout copy remains short and only names the tested availability behavior. | `@claim:plus-price-and-checkout`; H; live `/#plus`. |
| F-1-24 | Paid-download copy names only the tested active-license and public-build behavior. | `@claim:licensed-download`; P; live `/#plus`. |
| F-1-25 | Build wording matches the produced `dist/site/`. | `npm run build`; H; live source link. |
| F-1-26 | Scheduled check remains the single explained term; dry-read is absent. | `@claim:schedule-preview`; H; live `/#route`. |
| F-1-27 | Designed 404 keeps canonical, share, icon, and response-policy metadata. | Playwright live-404 test; H; live `/not-a-real-route-polish-4`. |
| F-1-28 | Route navigation and history focus and announce the new H1. | Playwright route-history test; D; live Home → Demo → Back → Forward. |
| F-2-1 | Conflicting source fixtures still prove passphrase-file, environment, then Secret Service precedence. | `@claim:passphrase-precedence`; H; live source link. |
| F-2-2 | Public text names only tested Linux Secret Service support. | `@claim:passphrase-sources`; P; live `/privacy/`. |
| F-2-3 | README remains free of untested deployment configuration assertions and jargon. | Playwright reviewed-copy test; H; live source link. |
| F-3-1 | Missing required sources stop before any artifacts are written. | `@claim:required-sources`; H; live `/#route`. |
| F-3-2 | The untested compression statement remains removed. | Playwright reviewed-copy test; H; live `/#route`. |
| F-3-3 | Merchant/refund claims remain replaced with “Checkout opens on Sociobot.” | `@claim:plus-price-and-checkout`; H; live `/terms/`. |
| F-4-1 | Added `download-counter-privacy`, exported the hashing seam, and recorded storage writes. The test independently derives SHA-256 identifiers, proves no raw license/address reaches storage, verifies separate minute paths, and proves every admission appends one byte. | `@claim:download-counter-privacy`; P; live `/privacy/` and live rate-limit probe. |
| F-4-2 | Added `no-record-upload`, which records every URL, header, and body while the browser verifies a fixture license and downloads a fixture field-kit file. It rejects every bundled business-record value and confirms only license and asset details travel. | `@claim:no-record-upload`; P; live `/privacy/`; live browser suite. |

## Live recheck

I reopened the production URL cold after deployment. The desktop and 390 px
Home screenshots show the primary demo action and all facts in the first
screen. The demo screenshot shows the persistent sandbox banner, Reset demo,
Start for real, and populated Pack result before scrolling. Privacy contains
the two newly proved statements, and `/api/build` reports
`local-records-continuity-polish-4`.
