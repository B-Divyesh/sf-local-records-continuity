# Adversarial first-read review 1 — Continuity Pack

Date: 2026-08-30  
Live URL: <https://local-records-continuity.sociobot.in>  
Candidate reviewed: `b185f8a69879095496d95e6b6af6a5767cac76a7`

## Verdict: FAIL

There are 28 findings. F-1-1 and F-1-2 are blocking. Every declared claim test
passes, but the copy contains unlisted claims. PASS requires zero findings and
no untested claim.

## Cold first screen

Fresh contexts were opened at 390×844 and 1440×844 before repository context
was read.

- What it does: builds and checks encrypted recovery packs from business-record
  exports.
- For whom: small businesses using local or self-hosted admin software.
- What to click first: **Try it with sample data** on mobile. This cannot be
  answered from the 1440×844 first screen because the action label is below the
  fold.

At 390×844, the headline, audience, primary action, explanation, and three facts
are visible. At 1440×844, the H1 occupies 432 px and the primary action begins at
`y=833`; its 48 px label is outside the 844 px viewport. The note begins at
`y=893` and the facts at `y=940`.

## Findings

### Blocking

#### F-1-1 — The desktop first screen hides the first action

- Location: live `/`, 1440×844.
- Exact visible copy before the fold: “Build a recovery pack for local business
  records.” and “For small businesses using self-hosted or local admin software,
  it turns exports into a recovery pack you can test.” The label “Try it with
  sample data” is below the fold.
- Why this fails: a cold visitor can identify the product and audience but
  cannot identify what to click first. This also regresses the earlier handoff’s
  “First-read desktop layout” repair at a viewport its two-size regression test
  does not cover.
- Fix: keep the primary action, its explanation, and all three facts inside the
  first 844 px at common wide widths. Add 1440×844 and a range around the
  short-desktop media-query boundary to the first-screen test.

#### F-1-2 — The phone demo does not show sample output on its first screen

- Location: live `/demo/`, 390×844 after one click.
- Exact copy shown: “Try a recovery pack with sample records.”, `continuity
  demo`, and “The command packs, checks, and restores three bundled files.”
  The recorded result starts at `y=826`; the actual terminal output starts at
  `y=1210`.
- Why this fails: the first post-click screen explains how to run the product
  but does not already show it being used with realistic sample data. The demo
  contract requires immediate sample output.
- Fix: put a compact live terminal result beside or directly under the H1 on
  mobile, above the command explanation. Keep the banner, Reset demo, and Start
  for real visible. Add a 390×844 assertion that `#demo-output` is wholly or
  substantially visible without scrolling.

### Major — unlisted claims

Each statement below can affect installation, purchase, recovery, or privacy,
but no `.factory/claims.json` entry names and tests it.

#### F-1-3 — Human-readable handoff is untested

- Quote/location: landing page, “Another person can identify and check the
  files.”
- Why: `pack-artifacts` checks file presence and structure, not whether another
  person can identify the records.
- Fix: test the manifest against explicit required business/source/restore
  fields, or rewrite to “The manifest lists the business, source files, and
  verification command.” and test those fields.

#### F-1-4 — Release availability is contradictory and untested

- Quotes: landing page, “Release binaries will appear on GitHub after the
  factory publishes v0.1.0.” README, “Download a release binary for your
  platform, or build from source:”
- Why: one says binaries do not exist yet; the other tells the visitor to
  download one and provides no release link.
- Fix: until a tested release exists, use “Build from source. Release binaries
  are not available yet.” Remove the download instruction and internal
  “factory” wording.

#### F-1-5 — The supported Rust version is unlisted

- Quote/location: README, “Rust 1.85+ is required when building from source.”
- Fix: add a claim that builds with the minimum supported toolchain in a clean
  container, or avoid a precise minimum.

#### F-1-6 — The single-binary claim is unlisted

- Quote/location: README, “The resulting executable is a single binary.”
- Fix: add a packaging test that asserts the install output and its runtime
  dependencies, or state only that the command builds `continuity`.

#### F-1-7 — The alternate install command is unlisted

- Quote/location: README, “From an existing checkout, `cargo install --path
  crates/continuity --locked` is equivalent.”
- Fix: add an exact clean-consumer install test for this command or remove
  “is equivalent.”

#### F-1-8 — The release-number claim is unlisted

- Quote/location: README, “Releases begin at `0.1.0`.”
- Fix: test the published release/package metadata or remove this until a
  release exists.

#### F-1-9 — Scheduler installation behavior is unlisted

- Quotes/location: README, “This command prints the entry by default;
  `--install` changes the current user's crontab on Linux/macOS after showing
  the exact command.” and the Windows Task Scheduler instruction.
- Fix: add isolated scheduler-fixture tests for print/install behavior on each
  claimed OS, or document only the tested command-output behavior.

#### F-1-10 — Passphrase non-persistence is unlisted

- Quote/location: README, “The CLI never writes a raw passphrase to its
  configuration file.”
- Why: `passphrase-sources` proves decryption from four inputs but does not
  inspect configuration/output for a leaked passphrase.
- Fix: add a canary passphrase and scan the caller directory, config, artifacts,
  stdout, and stderr after each source mode.

#### F-1-11 — The paid-tier non-gating claim is broader than its test

- Quote/location: README, “It never gates core export, recovery,
  accessibility, or failure reporting.”
- Why: `free-core-and-json` covers the CLI recovery path, but not “export” as a
  named operation or accessibility.
- Fix: rewrite to the tested set: “Pack, check, verify, restore, exit codes, and
  JSON output do not require a Plus license.”

#### F-1-12 — License restoration availability is unlisted

- Quote/location: README, “License restoration is available on the product
  site.”
- Fix: add a tagged claim test that enters a token, reloads, verifies the saved
  state, removes it, and checks the failure path.

#### F-1-13 — Automatic refund revocation is unlisted

- Quote/location: landing page, “Refunds are handled there and revoke the
  license automatically.”
- Fix: add a recorded refund/reversal fixture proving a previously active token
  becomes inactive, or say only “Sociobot handles refunds.”

### Minor — copy

#### F-1-14 — “Archive” conflicts with the defined term “pack”

- Quote/location: landing page, “Continuity Pack writes an encrypted archive…”;
  README, “an archive check”.
- Fix: “Continuity Pack writes an encrypted pack, a readable manifest, and a
  receipt.” Use “pack check” in the README.

#### F-1-15 — The same demo operation is called Verify and Check

- Location: landing demo tab says “Verify”; its output runs `continuity check`.
  The dedicated demo tab says “Check”.
- Fix: label both tabs **Check**. Reserve **Verify** for `continuity verify` on a
  named pack.

#### F-1-16 — “Exits loudly” is metaphorical

- Quote/location: landing page, “A missing, stale, or damaged target exits
  loudly.”
- Fix: “A missing, stale, or damaged target returns a non-zero exit code and
  names the problem.”

#### F-1-17 — “Complete safety path” is vague

- Quotes: landing page, “The CLI’s complete safety path stays free.” README,
  “The complete pack, verify, check, and restore safety path is free.”
- Fix: “Pack, check, verify, and restore are free.”

#### F-1-18 — “Honest boundary” does not name the limitation

- Quote/location: landing-page aside label, “Honest boundary”.
- Fix: **Verification limit**.

#### F-1-19 — Copy buttons do not name their result

- Location: landing install cards; three buttons are all “Copy”.
- Fix: **Copy install command**, **Copy setup command**, and **Copy pack
  command**. Keep the shorter post-action state “Copied”.

#### F-1-20 — “Production code path” is implementation jargon

- Quote/location: README, “It packs, checks, and restores them with the
  production code path…”
- Fix: “It runs the same pack, check, and restore commands used with your own
  files.”

#### F-1-21 — The README opening feature sentence has 37 words

- Quote starts: “It gathers configured invoices…”
- Fix: split it: “It gathers configured business records and records their
  SHA-256 checksums. It encrypts the pack, writes a restore manifest, and checks
  the target on schedule.”

#### F-1-22 — The scheduled-check sentence has 23 words

- Quote starts: “The scheduled `check` exits non-zero…”
- Fix: “A failed scheduled check returns a non-zero exit code. Its error names
  an unavailable, stale, corrupt, or unreadable target.”

#### F-1-23 — The checkout sentence has 26 words

- Quote starts: “The site checks that Sociobot has enabled the product…”
- Fix: “The site confirms that checkout is available before opening Sociobot.
  An unavailable product stays on this page.”

#### F-1-24 — The paid-file sentence has 28 words and web jargon

- Quote starts: “Paid files are served by a same-origin managed endpoint…”
- Fix: “The site checks the license before each paid download. Paid files are
  absent from the public build and offline cache.”

#### F-1-25 — The build-output sentence has 23 words

- Quote starts: “It compiles the CLI in release mode…”
- Fix: “It builds the release CLI and static site. The deployable site is in
  `dist/site/`.”

#### F-1-26 — “Dry-read” is unexplained jargon

- Locations: landing page, “A scheduled dry-read…”; README opening and Usage.
- Fix: use **scheduled check** consistently and explain once: “A scheduled
  check decrypts the pack and compares every file hash.”

### Minor — structure

#### F-1-27 — The designed 404 lacks required share/canonical metadata

- Location: live unknown route and `site/404.html`.
- Evidence: status 404, one H1, and a return action are correct; canonical,
  `og:title`, and `og:image` are absent.
- Fix: add a canonical for `/404.html`, Open Graph/Twitter title, description,
  and the product social card.

#### F-1-28 — Route changes do not move focus to the new H1

- Location: Home → Demo and browser Back.
- Evidence: `document.activeElement` is `<body>` after both navigations.
- Fix: make each H1 programmatically focusable and focus it after navigation,
  with a polite route announcement. Add forward/back keyboard tests.

## Copy audit

Counts treat hyphenated terms and URLs as one word. Commands are not counted as
sentences. “Flag” points to the finding above.

### Landing-page sentences

| # | Words | Sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 2 | You’re offline. | Pass |
| 2 | 4 | The guide still works. | Pass |
| 3 | 7 | License checks resume when your connection returns. | Pass |
| 4 | 8 | Build a recovery pack for local business records. | Pass |
| 5 | 19 | For small businesses using self-hosted or local admin software, it turns exports into a recovery pack you can test. | Pass |
| 6 | 9 | See the bookshop sample and its temporary-folder demo command. | Pass |
| 7 | 8 | Records stay on your computer or named drive. | Pass |
| 8 | 8 | The guide works offline after your first visit. | Pass |
| 9 | 5 | The core CLI is free. | Pass |
| 10 | 4 | Plus costs $39 once. | Pass |
| 11 | 6 | Know which records you can recover. | Pass |
| 12 | 12 | Continuity Pack writes an encrypted archive, a readable manifest, and a receipt. | F-1-14 |
| 13 | 8 | Another person can identify and check the files. | F-1-3 |
| 14 | 9 | Verification proves the pack decrypts and its files match. | Pass |
| 15 | 11 | It does not replace a periodic test import into your application. | Pass |
| 16 | 6 | Build, verify, and restore the pack. | Pass |
| 17 | 7 | Name the files and folders that matter. | Pass |
| 18 | 8 | Required sources fail the run if they disappear. | Pass |
| 19 | 15 | Each file gets a SHA-256, then the complete archive is compressed and authenticated with XChaCha20-Poly1305. | F-1-14 |
| 20 | 9 | A scheduled dry-read decrypts and hashes the target copy. | F-1-26 |
| 21 | 8 | A missing, stale, or damaged target exits loudly. | F-1-16 |
| 22 | 5 | Read the sample recovery result. | Pass |
| 23 | 7 | The bundled bookshop sample shows each result. | Pass |
| 24 | 4 | Use `--json` for scripts. | Pass |
| 25 | 6 | Pack written and target copy verified. | Pass |
| 26 | 5 | Build your first recovery pack. | Pass |
| 27 | 4 | Build from source today. | Pass |
| 28 | 11 | Release binaries will appear on GitHub after the factory publishes v0.1.0. | F-1-4 |
| 29 | 7 | The CLI’s complete safety path stays free. | F-1-17 |
| 30 | 12 | Plus provides a multi-location configuration workbook, restore-drill worksheet, and staff handoff guide. | Pass |
| 31 | 6 | Sociobot/Dodo is the merchant of record. | Pass |
| 32 | 9 | Refunds are handled there and revoke the license automatically. | F-1-13 |
| 33 | 3 | No license stored. | Pass |
| 34 | 6 | The free CLI remains fully available. | Pass |
| 35 | 5 | Build your first recovery pack. | Pass |
| 36 | 6 | CLI for tested local business-record recovery. | Pass |
| 37 | 6 | Built by Param Factory · v0.1.0. | Pass |

### README sentences

| # | Words | Sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 17 | Continuity Pack is a local-first CLI for small businesses that need a recovery handoff—not another backup subscription. | Pass |
| 2 | 37 | It gathers configured invoices, customer exports, and business records; records SHA-256 checksums; encrypts the pack with authenticated encryption; writes a readable restore manifest; copies only to a target you explicitly name; and dry-reads that target on schedule. | F-1-21, F-1-26 |
| 3 | 20 | It does not administer databases, upload to hosted storage, or claim that an archive check is a full application restore. | F-1-14 |
| 4 | 14 | You remain responsible for making your application exports and periodically testing a real restore. | Pass |
| 5 | 9 | Run the complete sample without configuration or an account. | Pass |
| 6 | 14 | The command writes three fictional Maple Street Books files into a unique temporary workspace. | Pass |
| 7 | 18 | It packs, checks, and restores them with the production code path, then prints the workspace path for inspection. | F-1-20 |
| 8 | 13 | `continuity --demo` is an alias, and `continuity --json demo` returns one JSON result. | Pass |
| 9 | 13 | Delete the printed directory to reset; each new run uses a fresh directory. | Pass |
| 10 | 6 | The browser preview is at the demo URL. | Pass |
| 11 | 6 | Sample source files are in `examples/maple-street-books/`. | Pass |
| 12 | 11 | Download a release binary for your platform, or build from source. | F-1-4 |
| 13 | 8 | Rust 1.85+ is required when building from source. | F-1-5 |
| 14 | 7 | The resulting executable is a single binary. | F-1-6 |
| 15 | 11 | From an existing checkout, `cargo install --path crates/continuity --locked` is equivalent. | F-1-7 |
| 16 | 4 | Releases begin at `0.1.0`. | F-1-8 |
| 17 | 7 | Start a folder with a documented configuration. | Pass |
| 18 | 8 | Edit the generated `continuity.toml`, then make a pack. | Pass |
| 19 | 14 | A target is never assumed; `--target` must point to a local or mounted directory. | Pass |
| 20 | 15 | The command creates an encrypted `.cpack`, a plain-language `.manifest.txt`, and a machine-readable `.receipt.json` beside it. | Pass |
| 21 | 15 | Use `--json` for automation and `--ci` to forbid prompts and require a non-interactive passphrase source. | Pass |
| 22 | 8 | Check the newest target pack without extracting it. | Pass |
| 23 | 12 | Verify a specific pack, or restore it into a new empty directory. | Pass |
| 24 | 8 | Install a scheduled dry-read with the OS scheduler. | F-1-26 |
| 25 | 20 | This command prints the entry by default; `--install` changes the current user's crontab on Linux/macOS after showing the exact command. | F-1-9 |
| 26 | 13 | On Windows, add an equivalent `continuity --ci check ...` command to Task Scheduler. | F-1-9 |
| 27 | 23 | The scheduled `check` exits non-zero and writes a clear error to stderr when the target is unavailable, stale, corrupt, or cannot be decrypted. | F-1-22 |
| 28 | 18 | Passphrases are resolved in this order: `--passphrase-file`, `CONTINUITY_PASSPHRASE`, then an OS keychain entry saved by `continuity key store`. | Pass |
| 29 | 11 | Interactive terminal input is the final fallback unless `--ci` is set. | Pass |
| 30 | 14 | Keychain storage uses macOS Keychain (`security`), Linux Secret Service (`secret-tool`), or Windows Credential Manager. | Pass |
| 31 | 11 | The CLI never writes a raw passphrase to its configuration file. | F-1-10 |
| 32 | 7 | Run `continuity <command> --help` for command-specific examples. | Pass |
| 33 | 11 | The complete pack, verify, check, and restore safety path is free. | F-1-17 |
| 34 | 19 | Continuity Plus is a one-time purchase that adds a multi-location configuration workbook, quarterly restore-drill worksheet, and staff handoff guide. | Pass |
| 35 | 10 | It never gates core export, recovery, accessibility, or failure reporting. | F-1-11 |
| 36 | 26 | The site checks that Sociobot has enabled the product before sending a buyer to checkout, so an unregistered product cannot lead to a dead payment route. | F-1-23 |
| 37 | 28 | Paid files are served by a same-origin managed endpoint only after a live Sociobot license check; they are not included in the public static build or offline cache. | F-1-24 |
| 38 | 14 | License restoration is available on the product site; Sociobot/Dodo is the merchant of record. | F-1-12 |
| 39 | 8 | `npm run build` is the factory build command. | Pass |
| 40 | 23 | It compiles the CLI in release mode, builds the static site, and places the deployable website at `dist/site/` with `index.html` at that root. | F-1-25 |
| 41 | 7 | `npm run build:site` builds only the site. | Pass |
| 42 | 15 | Release builds use the production Sociobot API by default; explicitly set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1` only for staging. | Pass |
| 43 | 17 | The managed download function uses `RATE_LIMIT_BLOB_BASE_URL`, a private container SAS limited to create, add, and write permissions. | Pass |
| 44 | 13 | Production keeps that value in Static Web App settings, never in source control. | Pass |
| 45 | 10 | Each fixed one-minute window uses a separate append blob counter. | Pass |
| 46 | 9 | There is no telemetry in the CLI or site. | Pass |
| 47 | 11 | Packs stay local and are copied only to the explicit target. | Pass |
| 48 | 16 | Encryption uses XChaCha20-Poly1305 with an Argon2id passphrase-derived key; every restored file is rechecked against its manifest. | Pass |
| 49 | 10 | Read the site’s `/privacy/` and `/terms/` pages for purchase-specific details. | Pass |
| 50 | 6 | MIT © 2026 Sociobot (Param Factory). | Pass |
| 51 | 2 | See `LICENSE`. | Pass |

### Headings and actions

All landing headings are at most eight words. The one contextless label is
“Honest boundary” (F-1-18). All primary actions are verbs and name a result
except the three generic “Copy” buttons (F-1-19). The “Verify” demo tab is a
terminology mismatch (F-1-15). README headings—Try the bundled sample, Install,
Usage, Passphrases and OS keychains, Exit codes, Paid convenience tier, Develop
and verify, Repository map, Privacy and security, and License—make sense out of
context.

## Demo and sandbox evidence

- One click from Home opens `/demo/`.
- The persistent banner says “Demo — sample data, nothing is saved here.” and
  includes Reset demo and Start for real.
- Real local-storage sentinels remained byte-for-byte unchanged on entry, tab
  use, reset, and exit. The demo uses `demo:continuity-offline`; it does not use
  the real license namespace.
- Reset returns the selected stage to Pack. Start for real returns to `/#guide`.
- The browser request log contained only
  `https://local-records-continuity.sociobot.in`.
- The CLI demo was run from a fresh temporary caller directory. It returned
  `sample-recovery-complete`, `file_count: 3`, and `verified: true`, wrote its
  workspace under `/tmp/continuity-demo-*`, and left the caller directory empty.

## Claim test results

Every command was run exactly as declared from a clean local clone after
`npm ci`.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | 1 tagged test passed; fresh temp workspace |
| `sample-demo-page` | PASS | 2 browser projects passed |
| `pack-artifacts` | PASS | 1 tagged test passed |
| `authenticated-encryption` | PASS | 1 tagged test passed |
| `explicit-local-target` | PASS | 1 tagged test passed |
| `loud-scheduled-check` | PASS | 1 tagged test passed |
| `restore-integrity` | PASS | 1 tagged test passed |
| `free-core-and-json` | PASS | 1 tagged test passed |
| `passphrase-sources` | PASS | 1 tagged test passed |
| `offline-guide` | PASS | 2 browser projects passed |
| `browser-privacy` | PASS | 2 browser projects passed |
| `protected-download-rate-limit` | PASS | 2 tagged API tests passed |
| `licensed-download` | PASS | 2 tagged API tests passed |
| `plus-price-and-checkout` | PASS | 2 browser projects passed |

The complete local `npm test` also passed: 6 library, 2 binary, 7 CLI
integration, 1 doctest, 8 CLI claim, 10 API, and 30 browser tests passed; 6
deployment-only browser cases skipped. `npm run build` passed and produced
`dist/site/`. A live browser run passed 33 tests with 2 intended skips; one
Chromium process crashed before a managed-API assertion, and the exact failed
test passed on an immediate isolated rerun.

## Earlier-history recheck

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The
accumulated handoff records seven verification-7 repairs.

| Earlier repair | Live and code result |
| --- | --- |
| First-read desktop layout | **Regressed at 1440×844**; F-1-1. Still passes the prior 1280×720 and 1366×768 cases. |
| Managed API authentication and identity | Confirmed; live isolated rerun passed missing/reserved/invalid-token behavior and build identity. |
| Focus visibility | Confirmed; live suite passed computed ≥3:1 focus contrast on all four surfaces. |
| Claim completeness | Prior 14 commands pass, but new unlisted-copy findings F-1-3–F-1-13 remain. |
| Privacy inventory | Confirmed; the removed one-day public lifecycle sentence is absent. |
| Mobile navigation and zero-hour CLI error | Confirmed by live 390 px checks and `loud-scheduled-check`. |
| Service-worker/design record | Confirmed in code: cache `continuity-pack-shell-v5`; design token `#9B4E1D`. |

## Structure, accessibility, and visual identity

- Home, Demo, Privacy, and Terms return 200. The designed missing route returns
  404. All discovered internal links and the permitted `sf-local-records-continuity`
  source link return 200; mail links were identified but not fetched.
- Main routes have `lang=en`, one H1, one main landmark, route-specific title,
  description, canonical, OG/Twitter image, SVG favicon, and apple-touch icon.
- `robots.txt`, `sitemap.xml`, response-header CSP, security headers, deep links,
  browser Back, visible focus, reduced motion, 44 px targets, 200% text layout,
  and serious/critical Axe checks pass.
- The topographic field-map identity is distinct and matches
  `.factory/design.md`; it is not a generic centered-gradient SaaS layout.
- Browser requests for normal Home and Demo flows are same-origin only.
- F-1-27 and F-1-28 cover the remaining metadata and focus defects.

## Missed leverage

No additional AI feature, sync, or hosted import is justified. The brief is for
a local recovery CLI, and hosted sync is an explicit non-goal. Arbitrary local
file/folder inputs, encrypted pack creation, verification, JSON receipts, and
restore already cover the obvious import/export need. Adding AI would weaken
the offline and privacy model without improving the core recovery proof.

## What would make this perfect

Resolve every finding above: keep both Home and Demo value visible in the first
phone and desktop screens, align every claim with one exact tagged test, remove
release ambiguity and internal jargon, use one term per operation, add the 404
metadata, and move focus to the H1 on route changes. Re-run the cold review at
390×844, 1280×720, 1366×768, and 1440×844; PASS only if the next review finds
nothing else.
