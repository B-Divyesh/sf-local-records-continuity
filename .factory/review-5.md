# Adversarial first-read review 5 — Continuity Pack

Date: 2026-09-02  
Live URL: <https://local-records-continuity.sociobot.in>  
Repository revision reviewed: `a13af5fe5adff2ca79b9a2729e9392aa246f7107`

## Verdict: PASS

There are zero findings. The cold first read, sample sandbox, claim inventory,
history check, routes, accessibility checks, and missing-leverage review all
passed. This report was written without changing product code.

## Cold first screen

Fresh Chromium contexts opened the production origin before repository material
was read. These were the answers available on the first screen:

| Viewport | What it does | For whom | First action | Evidence |
| --- | --- | --- | --- | --- |
| 390 × 844 | It builds a recovery pack from local business exports and lets the owner test it. | Small businesses using self-hosted or local admin software. | **Try it with sample data**. | H1 at top; action `y=551–599`; fact list ends at `y=807`. |
| 1440 × 844 | It builds a recovery pack from local business exports and lets the owner test it. | Small businesses using self-hosted or local admin software. | **Try it with sample data**. | Action `y=502–550`; fact list ends at `y=667`. |

The exact first-screen copy is “Build a recovery pack for local business
records.”, “For small businesses using self-hosted or local admin software, it
turns exports into a recovery pack you can test.”, and “Try it with sample
data.” It answers the job, audience, and first click without scrolling.

## Copy audit

Counting rule: hyphenated terms, commands, URLs, and numbers each count as one
word. Code blocks are excluded. All sentences are at or below 22 words. No
banned marketing adjective, jargon-only heading, empty slogan, terminology
conflict, or non-result-naming button was found. Headings name their sections.

### Landing page

| # | Words | Sentence |
| ---: | ---: | --- |
| 1 | 2 | You’re offline. |
| 2 | 4 | The guide still works. |
| 3 | 7 | License checks resume when your connection returns. |
| 4 | 8 | Build a recovery pack for local business records. |
| 5 | 19 | For small businesses using self-hosted or local admin software, it turns exports into a recovery pack you can test. |
| 6 | 9 | See the bookshop sample and its temporary-folder demo command. |
| 7 | 8 | Records stay on your computer or named drive. |
| 8 | 8 | The guide works offline after your first visit. |
| 9 | 5 | The core CLI is free. |
| 10 | 4 | Plus costs $39 once. |
| 11 | 6 | Know which records you can recover. |
| 12 | 12 | Continuity Pack writes an encrypted pack, a readable manifest, and a receipt. |
| 13 | 10 | The manifest lists the business, source files, and verification command. |
| 14 | 9 | Verification proves the pack decrypts and its files match. |
| 15 | 11 | It does not replace a periodic test import into your application. |
| 16 | 6 | Build, verify, and restore the pack. |
| 17 | 7 | Name the files and folders that matter. |
| 18 | 8 | Required sources fail the run if they disappear. |
| 19 | 5 | Each file gets a SHA-256. |
| 20 | 7 | The complete pack is authenticated with XChaCha20-Poly1305. |
| 21 | 11 | A scheduled check decrypts the pack and compares every file hash. |
| 22 | 12 | A failed check returns a non-zero exit code and names the problem. |
| 23 | 5 | Read the sample recovery result. |
| 24 | 7 | The bundled bookshop sample shows each result. |
| 25 | 4 | Use `--json` for scripts. |
| 26 | 6 | Pack written and target copy verified. |
| 27 | 5 | Build your first recovery pack. |
| 28 | 3 | Build from source. |
| 29 | 6 | Release binaries are not available yet. |
| 30 | 7 | Pack, check, verify, and restore are free. |
| 31 | 12 | Plus provides a multi-location configuration workbook, restore-drill worksheet, and staff handoff guide. |
| 32 | 4 | Checkout opens on Sociobot. |
| 33 | 3 | No license stored. |
| 34 | 6 | The free CLI remains fully available. |
| 35 | 6 | CLI for tested local business-record recovery. |
| 36 | 5 | Built by Param Factory · v0.1.0. |

The buttons name outcomes: **Try it with sample data**, **Copy install
command**, **Copy setup command**, **Copy pack command**, **Verify license**,
and the three named downloads. The terminology remains: pack, target, manifest,
check, verify, restore, source, demo, and Plus field kit.

### README

| # | Words | Sentence |
| ---: | ---: | --- |
| 1 | 18 | Continuity Pack is a local-first CLI for small businesses that need a recovery handoff—not another backup subscription. |
| 2 | 10 | It gathers configured business records and records their SHA-256 checksums. |
| 3 | 14 | It encrypts the pack, writes a restore manifest, and checks the target on schedule. |
| 4 | 20 | It does not administer databases, upload to hosted storage, or claim that a pack check is a full application restore. |
| 5 | 14 | You remain responsible for making your application exports and periodically testing a real restore. |
| 6 | 9 | Run the complete sample without configuration or an account. |
| 7 | 14 | The command writes three fictional Maple Street Books files into a unique temporary workspace. |
| 8 | 14 | It runs the same pack, check, and restore commands used with your own files. |
| 9 | 8 | It then prints the workspace path for inspection. |
| 10 | 5 | `continuity --demo` is an alias. |
| 11 | 7 | `continuity --json demo` returns one JSON result. |
| 12 | 6 | Delete the printed directory to reset. |
| 13 | 7 | Each new run uses a fresh directory. |
| 14 | 6 | The browser preview is at the demo URL. |
| 15 | 6 | Sample source files are in `examples/maple-street-books/`. |
| 16 | 3 | Build from source. |
| 17 | 6 | Release binaries are not available yet. |
| 18 | 7 | Start a folder with a documented configuration. |
| 19 | 8 | Edit the generated `continuity.toml`, then make a pack. |
| 20 | 14 | A target is never assumed; `--target` must point to a local or mounted directory. |
| 21 | 15 | The command creates an encrypted `.cpack`, a plain-language `.manifest.txt`, and a machine-readable `.receipt.json` beside it. |
| 22 | 15 | Use `--json` for automation and `--ci` to forbid prompts and require a non-interactive passphrase source. |
| 23 | 8 | Check the newest target pack without extracting it. |
| 24 | 12 | Verify a specific pack, or restore it into a new empty directory. |
| 25 | 7 | Print a daily scheduled-check entry for review. |
| 26 | 9 | A failed scheduled check returns a non-zero exit code. |
| 27 | 10 | Its error names an unavailable, stale, corrupt, or unreadable target. |
| 28 | 20 | Passphrases are resolved in this order: `--passphrase-file`, `CONTINUITY_PASSPHRASE`, then a Linux Secret Service entry saved by `continuity key store`. |
| 29 | 11 | Interactive terminal input is the final fallback unless `--ci` is set. |
| 30 | 8 | Linux keychain storage uses Secret Service through `secret-tool`. |
| 31 | 15 | The CLI does not write a raw passphrase into its configuration or generated recovery files. |
| 32 | 7 | Run `continuity <command> --help` for command-specific examples. |
| 33 | 7 | Pack, check, verify, and restore are free. |
| 34 | 19 | Continuity Plus is a one-time purchase that adds a multi-location configuration workbook, quarterly restore-drill worksheet, and staff handoff guide. |
| 35 | 15 | Pack, check, verify, restore, exit codes, and JSON output do not require a Plus license. |
| 36 | 10 | The site confirms that checkout is available before opening Sociobot. |
| 37 | 7 | An unavailable product stays on this page. |
| 38 | 9 | The site checks the license before each paid download. |
| 39 | 11 | Paid files are absent from the public build and offline cache. |
| 40 | 11 | You can save or remove a license on the product site. |
| 41 | 4 | Checkout opens on Sociobot. |
| 42 | 10 | `npm run build` builds the release CLI and static site. |
| 43 | 8 | `npm run build:site` builds only the site. |
| 44 | 7 | Deploy `dist/site/` with configured environment settings. |
| 45 | 9 | There is no telemetry in the CLI or site. |
| 46 | 11 | Packs stay local and are copied only to the explicit target. |
| 47 | 16 | Encryption uses XChaCha20-Poly1305 with an Argon2id passphrase-derived key; every restored file is rechecked against its manifest. |
| 48 | 10 | Read the site’s `/privacy/` and `/terms/` pages for purchase-specific details. |
| 49 | 5 | MIT © 2026 Sociobot (Param Factory). |
| 50 | 2 | See `LICENSE`. |

Each product behavior and privacy assertion maps to one of the 20 declared
claims: demo isolation, artifacts, encryption, explicit targets, missing
sources, scheduled checks, restore integrity, free core, passphrases,
scheduling, licensing, offline operation, browser privacy, protected downloads,
price/checkout, and record-upload privacy. Static repository facts (the
repository URL, license file, and source-build instructions) are directly
inspectable in the same release.

## Demo and privacy sandbox

- One click on Home opened `/demo/?demo=1`.
- The persistent banner read **“Demo — sample data, nothing is saved here.”**
  with visible **Reset demo** and **Start for real** controls.
- The first post-click viewport already showed the populated Pack result. Its
  terminal was `y=576–769` at 390 px and `y=360–600` at 1440 px. It named
  Maple Street Books, three bundled sources, a temporary target, and successful
  authenticated verification.
- The direct sample URL redirected before normal license code. The claim test
  seeded a real-license sentinel, reset the demo, exited it, and proved the
  sentinel was unchanged while `demo:*` keys were removed.
- My fresh-context request log for both Home and the demo contained only
  `https://local-records-continuity.sociobot.in`. The declared browser-privacy
  and no-record-upload tests additionally exercise the fixture license and
  protected-download flows.
- The CLI claim tests run both demo commands in unique OS temporary directories
  and assert no caller-directory writes. The shipped Maple Street Books sample
  contains realistic invoice, customer, and insurance-renewal records.

## Claims

`.factory/claims.json` contains 20 entries, each with exactly one tagged test.
`npm test` completed its clean-clone runner, Rust/CLI/API suites, and local
browser suite. The clean-clone runner starts each listed command from a
separate clone with no `node_modules` before execution. The live browser suite
also passed: `PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test --workers=1` ran 44 checks; the final result was
`{"status":"passed","failedTests":[]}`.

All declared entries passed: `demo-sandbox`, `sample-demo-page`,
`pack-artifacts`, `authenticated-encryption`, `explicit-local-target`,
`required-sources`, `loud-scheduled-check`, `restore-integrity`,
`free-core-and-json`, `passphrase-sources`, `passphrase-precedence`,
`schedule-preview`, `license-restoration`, `offline-guide`, `browser-privacy`,
`protected-download-rate-limit`, `download-counter-privacy`,
`licensed-download`, `plus-price-and-checkout`, and `no-record-upload`.

## Earlier-history recheck

Every earlier finding was checked against the deployed page and applicable
source/test. No item is merely marked fixed.

| Earlier id | Current confirmation |
| --- | --- |
| F-1-1 | Desktop action, explanation, and facts remain inside 1440 × 844. |
| F-1-2 | The 390 px demo opens with populated sample output in view. |
| F-1-3 | `pack-artifacts` asserts business, source, verify-command, and restore fields. |
| F-1-4 | Home and README consistently say source build; no binary download is offered. |
| F-1-5 | No unsupported minimum Rust version is stated. |
| F-1-6 | No single-binary assertion remains. |
| F-1-7 | No untested alternate-install equivalence remains. |
| F-1-8 | No unproved release-number promise remains. |
| F-1-9 | Public scheduling guidance is preview-only; `schedule-preview` proves no install. |
| F-1-10 | Passphrase canary scans cover config, generated artifacts, stdout, and stderr. |
| F-1-11 | Free-tier copy names only the tested command set. |
| F-1-12 | Save, reload, invalid-state, and removal license paths are claimed and tested. |
| F-1-13 | Automatic-revocation wording remains absent. |
| F-1-14 | Visitor copy consistently uses “pack,” not “archive.” |
| F-1-15 | The sample stage is consistently named Check. |
| F-1-16 | Failure copy names a non-zero result and the reported problem. |
| F-1-17 | Free copy explicitly names pack, check, verify, and restore. |
| F-1-18 | The limitation heading is “Verification limit.” |
| F-1-19 | Copy controls name the command copied. |
| F-1-20 | README says the sample runs the same commands as real records. |
| F-1-21 | The former long README opening is split into short sentences. |
| F-1-22 | Scheduled-check guidance is short and actionable. |
| F-1-23 | Checkout availability copy is short and states the observed result. |
| F-1-24 | Paid-download copy states only the tested license/public-build behavior. |
| F-1-25 | Build wording matches `dist/site/`. |
| F-1-26 | “Scheduled check” is the single explained term; “dry-read” is absent. |
| F-1-27 | Unknown live routes return the designed metadata-complete 404. |
| F-1-28 | Home, Demo, Back, and Forward move focus and announce the new H1. |
| F-2-1 | Conflicting fixtures prove file, environment, then Linux Secret Service precedence. |
| F-2-2 | Public copy names only the tested Linux Secret Service adapter. |
| F-2-3 | README contains no prior internal deployment assertions or jargon. |
| F-3-1 | `required-sources` proves exit 3, missing-path output, and zero artifacts. |
| F-3-2 | The unproved compression statement remains removed. |
| F-3-3 | Merchant/refund wording remains replaced by “Checkout opens on Sociobot.” |
| F-4-1 | `download-counter-privacy` proves the published hash, byte-counter, and window behavior. |
| F-4-2 | `no-record-upload` records license/download requests and rejects bundled-record values. |

## Structure and accessibility

- `/`, `/demo/?demo=1`, `/privacy/`, and `/terms/` have route-specific plain
  titles, descriptions, canonicals, Open Graph/Twitter metadata, icons,
  `lang=en`, one H1, and a main landmark. The unknown route returned `404` and
  **This page does not exist.**
- The production response includes the response-header CSP with
  `frame-ancestors 'none'`, appropriate same-origin/API `connect-src`, and the
  expected no-sniff and referrer policies. The deployed API reports
  `local-records-continuity-polish-4`.
- The header/footer, skip link, privacy/terms links, mobile targets, keyboard
  tabs, visible focus, reduced-motion behavior, history focus, and no-console-
  error conditions passed the live suite. Axe found no serious or critical
  violation.
- Crawled first-party navigation, legal, demo, unknown-route, and source links
  resolved correctly. The warm paper, contour map, survey notation, and
  serif/monospace system match the product-specific topographic design thesis;
  the result is not a generic SaaS template.

## Missed leverage

No omitted feature is implied by the brief. The product already covers the
valuable path: use exports, create an encrypted pack, verify it, restore it,
and schedule a check. Hosted sync/storage is explicitly outside scope. An AI
feature would not make this recovery CLI more honest or useful and is therefore
not warranted.

## What would make this perfect

Keep the 20 claim tests, clean-clone runner, and cold-viewport checks running
on every release. A future addition should add its observable claim and sandbox
test before its visitor-facing copy. No current product work is required.
