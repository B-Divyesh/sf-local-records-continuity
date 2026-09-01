# Adversarial first-read review 2 — Continuity Pack

Date: 2026-09-01
Live URL: https://local-records-continuity.sociobot.in
Candidate: e7d0b01e20d19f8446fa0585d8201cb31b3b55ae

## Verdict: FAIL

Three minor findings remain. No blocking finding is present. The product is clear and tryable, all declared claim commands pass, and the sample demo is isolated. PASS requires zero findings.

## Cold first screen

Fresh contexts were opened before reading repository material.

| Viewport | What it does | For whom | First click | Check |
| --- | --- | --- | --- | --- |
| 390×844 | Builds tested encrypted recovery packs from local business exports. | Small businesses using self-hosted or local admin software. | Try it with sample data. | Confirmed: action y=551; facts end y=807. |
| 1440×844 | Builds tested encrypted recovery packs from local business exports. | Small businesses using self-hosted or local admin software. | Try it with sample data. | Confirmed: action y=502; facts end y=667. |

The supporting exact copy is “Build a recovery pack for local business records.” “For small businesses using self-hosted or local admin software, it turns exports into a recovery pack you can test.” and “Try it with sample data.”

## Findings

### Minor

#### F-2-1 — Passphrase precedence is stated but not tested

- Location: README, Passphrases and OS keychains.
- Quote: “Passphrases are resolved in this order: --passphrase-file, CONTINUITY_PASSPHRASE, then an OS keychain entry saved by continuity key store.”
- Check: passphrase-sources checks each source independently. It never provides distinct valid file, environment, and keychain values in one run. No claim names the precedence rule.
- Why: a scheduled run can have more than one source. The reader needs the documented source to be selected.
- Fix: add a passphrase-precedence claim with a tagged conflict-order test, or remove the stated order.

#### F-2-2 — Named macOS and Windows keychain support lacks a matching test

- Location: README, Passphrases and OS keychains.
- Quote: “Keychain storage uses macOS Keychain (security), Linux Secret Service (secret-tool), or Windows Credential Manager.”
- Check: the declared fixture only performs a Linux secret-tool lookup. It does not check the named macOS or Windows adapters, and no separate claim names them.
- Why: a reader on either named system can rely on this statement when choosing the passphrase workflow.
- Fix: add recorded security and PowerShell credential fixtures to the claim test, or name only tested systems.

#### F-2-3 — README deployment copy has unlisted operational claims and unexplained jargon

- Location: README, Develop and verify.
- Quotes: “Release builds use the production Sociobot API by default; explicitly set VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1 only for staging.” “The managed download function uses RATE_LIMIT_BLOB_BASE_URL, a private container SAS limited to create, add, and write permissions.” “Production keeps that value in Static Web App settings, never in source control.” “Each fixed one-minute window uses a separate append blob counter.”
- Check: protected-download-rate-limit confirms the observable 20-per-60-second result and a storage simulation. It does not confirm a deployed setting, permission scope, default API endpoint, or production storage arrangement. “SAS” and “append blob counter” are unexplained here.
- Why: the README mixes reader instructions with claims a reader cannot check or safely use.
- Fix: remove these four sentences from the public README, or move them to maintainer deployment documentation and add a check for every retained assertion. Keep the README instruction to: “Build the site with npm run build. Deploy dist/site/ with configured environment settings.”

## Copy audit

Counting rule: hyphenated terms, commands, versions, and URLs count as one word. Standalone commands are excluded.

### Landing page

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
| 12 | 12 | Continuity Pack writes an encrypted pack, a readable manifest, and a receipt. | Pass |
| 13 | 10 | The manifest lists the business, source files, and verification command. | Pass |
| 14 | 9 | Verification proves the pack decrypts and its files match. | Pass |
| 15 | 11 | It does not replace a periodic test import into your application. | Pass |
| 16 | 6 | Build, verify, and restore the pack. | Pass |
| 17 | 7 | Name the files and folders that matter. | Pass |
| 18 | 8 | Required sources fail the run if they disappear. | Pass |
| 19 | 5 | Each file gets a SHA-256. | Pass |
| 20 | 9 | The complete pack is compressed and authenticated with XChaCha20-Poly1305. | Pass |
| 21 | 11 | A scheduled check decrypts the pack and compares every file hash. | Pass |
| 22 | 12 | A failed check returns a non-zero exit code and names the problem. | Pass |
| 23 | 5 | Read the sample recovery result. | Pass |
| 24 | 7 | The bundled bookshop sample shows each result. | Pass |
| 25 | 4 | Use --json for scripts. | Pass |
| 26 | 6 | Pack written and target copy verified. | Pass |
| 27 | 5 | Build your first recovery pack. | Pass |
| 28 | 3 | Build from source. | Pass |
| 29 | 6 | Release binaries are not available yet. | Pass |
| 30 | 7 | Pack, check, verify, and restore are free. | Pass |
| 31 | 12 | Plus provides a multi-location configuration workbook, restore-drill worksheet, and staff handoff guide. | Pass |
| 32 | 9 | Sociobot/Dodo is the merchant of record and handles refunds. | Pass |
| 33 | 3 | No license stored. | Pass |
| 34 | 6 | The free CLI remains fully available. | Pass |
| 35 | 6 | CLI for tested local business-record recovery. | Pass |
| 36 | 5 | Built by Param Factory · v0.1.0. | Pass |

### README

| # | Words | Sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 17 | Continuity Pack is a local-first CLI for small businesses that need a recovery handoff—not another backup subscription. | Pass |
| 2 | 10 | It gathers configured business records and records their SHA-256 checksums. | Pass |
| 3 | 14 | It encrypts the pack, writes a restore manifest, and checks the target on schedule. | Pass |
| 4 | 20 | It does not administer databases, upload to hosted storage, or claim that a pack check is a full application restore. | Pass |
| 5 | 14 | You remain responsible for making your application exports and periodically testing a real restore. | Pass |
| 6 | 9 | Run the complete sample without configuration or an account. | Pass |
| 7 | 14 | The command writes three fictional Maple Street Books files into a unique temporary workspace. | Pass |
| 8 | 14 | It runs the same pack, check, and restore commands used with your own files. | Pass |
| 9 | 8 | It then prints the workspace path for inspection. | Pass |
| 10 | 5 | continuity --demo is an alias. | Pass |
| 11 | 7 | continuity --json demo returns one JSON result. | Pass |
| 12 | 6 | Delete the printed directory to reset. | Pass |
| 13 | 7 | Each new run uses a fresh directory. | Pass |
| 14 | 6 | The browser preview is at the demo URL. | Pass |
| 15 | 6 | Sample source files are in examples/maple-street-books/. | Pass |
| 16 | 3 | Build from source. | Pass |
| 17 | 6 | Release binaries are not available yet. | Pass |
| 18 | 7 | Start a folder with a documented configuration. | Pass |
| 19 | 8 | Edit the generated continuity.toml, then make a pack. | Pass |
| 20 | 14 | A target is never assumed; --target must point to a local or mounted directory. | Pass |
| 21 | 15 | The command creates an encrypted .cpack, a plain-language .manifest.txt, and a machine-readable .receipt.json beside it. | Pass |
| 22 | 15 | Use --json for automation and --ci to forbid prompts and require a non-interactive passphrase source. | Pass |
| 23 | 8 | Check the newest target pack without extracting it. | Pass |
| 24 | 12 | Verify a specific pack, or restore it into a new empty directory. | Pass |
| 25 | 8 | Print a daily scheduled-check entry for review. | Pass |
| 26 | 9 | A failed scheduled check returns a non-zero exit code. | Pass |
| 27 | 10 | Its error names an unavailable, stale, corrupt, or unreadable target. | Pass |
| 28 | 18 | Passphrases are resolved in this order: --passphrase-file, CONTINUITY_PASSPHRASE, then an OS keychain entry saved by continuity key store. | F-2-1 |
| 29 | 11 | Interactive terminal input is the final fallback unless --ci is set. | Pass |
| 30 | 14 | Keychain storage uses macOS Keychain (security), Linux Secret Service (secret-tool), or Windows Credential Manager. | F-2-2 |
| 31 | 15 | The CLI does not write a raw passphrase into its configuration or generated recovery files. | Pass |
| 32 | 7 | Run continuity command --help for command-specific examples. | Pass |
| 33 | 14 | Pack, check, verify, restore, stable exit behavior, and JSON output require no paid license. | Pass |
| 34 | 19 | Continuity Plus is a one-time purchase that adds a multi-location configuration workbook, quarterly restore-drill worksheet, and staff handoff guide. | Pass |
| 35 | 15 | Pack, check, verify, restore, exit codes, and JSON output do not require a Plus license. | Pass |
| 36 | 10 | The site confirms that checkout is available before opening Sociobot. | Pass |
| 37 | 7 | An unavailable product stays on this page. | Pass |
| 38 | 9 | The site checks the license before each paid download. | Pass |
| 39 | 10 | Paid files are absent from the public build and offline cache. | Pass |
| 40 | 10 | You can save or remove a license on the product site. | Pass |
| 41 | 6 | Sociobot/Dodo is the merchant of record. | Pass |
| 42 | 7 | npm run build builds the release CLI and static site. | Pass |
| 43 | 6 | The deployable site is in dist/site/. | Pass |
| 44 | 6 | npm run build:site builds only the site. | Pass |
| 45 | 15 | From a clean clone, the site build first installs the exact locked site tools it needs. | Pass |
| 46 | 10 | npm ci remains the fastest way to prepare every development command. | Pass |
| 47 | 15 | Release builds use the production Sociobot API by default; explicitly set VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1 only for staging. | F-2-3 |
| 48 | 17 | The managed download function uses RATE_LIMIT_BLOB_BASE_URL, a private container SAS limited to create, add, and write permissions. | F-2-3 |
| 49 | 13 | Production keeps that value in Static Web App settings, never in source control. | F-2-3 |
| 50 | 10 | Each fixed one-minute window uses a separate append blob counter. | F-2-3 |
| 51 | 9 | There is no telemetry in the CLI or site. | Pass |
| 52 | 11 | Packs stay local and are copied only to the explicit target. | Pass |
| 53 | 16 | Encryption uses XChaCha20-Poly1305 with an Argon2id passphrase-derived key; every restored file is rechecked against its manifest. | Pass |
| 54 | 10 | Read the site’s /privacy/ and /terms/ pages for purchase-specific details. | Pass |
| 55 | 6 | MIT © 2026 Sociobot (Param Factory). | Pass |
| 56 | 2 | See LICENSE. | Pass |

All landing headings name their sections; the primary action and copy controls name their results. The shared terms are consistent: pack, target, manifest, check, verify, restore, and demo.

## Demo and sandbox

- One click opens /demo/?demo=1.
- At 390×844, populated sample output starts at y=576 and is fully in view. It identifies Maple Street Books, three bundled files, a temporary target, and authenticated hashes.
- The persistent banner says “Demo — sample data, nothing is saved here.” and includes Reset demo and Start for real.
- A real-license local-storage sentinel and unrelated sentinel remained unchanged. Reset returned to Pack and cleared a demo: sentinel. Start for real also cleared it.
- The Home and exercised-demo request log contained only https://local-records-continuity.sociobot.in.
- target/release/continuity --ci --json demo, run from a fresh empty caller directory, returned sample-recovery-complete, file_count: 3, and verified: true; its workspace was /tmp/continuity-demo-* and the caller remained empty.

## Claims

All 16 exact commands in .factory/claims.json passed. npm test passed, including its clean-clone runner; npm run typecheck and npm run build passed, and dist/site/ was produced.

| Claim | Result |
| --- | --- |
| demo-sandbox | Pass |
| sample-demo-page | Pass |
| pack-artifacts | Pass |
| authenticated-encryption | Pass |
| explicit-local-target | Pass |
| loud-scheduled-check | Pass |
| restore-integrity | Pass |
| free-core-and-json | Pass |
| passphrase-sources | Pass; F-2-1 and F-2-2 identify scope gaps |
| schedule-preview | Pass |
| license-restoration | Pass |
| offline-guide | Pass |
| browser-privacy | Pass |
| protected-download-rate-limit | Pass |
| licensed-download | Pass |
| plus-price-and-checkout | Pass |

## Earlier-history recheck

Every finding in .factory/review-1.md was checked on live and code; none is open again.

| Finding | Current result |
| --- | --- |
| F-1-1 | Fixed: desktop action, explanation, and facts fit at 1440×844. |
| F-1-2 | Fixed: mobile demo opens with sample output in view. |
| F-1-3 | Fixed: manifest fields are named and asserted by pack-artifacts. |
| F-1-4 | Fixed: source-build-only wording is consistent. |
| F-1-5 | Fixed: no minimum-Rust assertion remains. |
| F-1-6 | Fixed: no single-binary assertion remains. |
| F-1-7 | Fixed: no alternate-install equivalence assertion remains. |
| F-1-8 | Fixed: no release-number promise remains. |
| F-1-9 | Fixed: README documents only the tested schedule preview. |
| F-1-10 | Fixed: canary scans cover configuration, artifacts, output, and reports. |
| F-1-11 | Fixed: free copy names only tested CLI behaviour. |
| F-1-12 | Fixed: license save, reload, invalid state, and removal are tested. |
| F-1-13 | Fixed: automatic-refund language is absent. |
| F-1-14 | Fixed: visitor copy uses pack, not archive. |
| F-1-15 | Fixed: the demo stage is Check. |
| F-1-16 | Fixed: failed-check copy names a non-zero exit and problem. |
| F-1-17 | Fixed: free copy names pack, check, verify, and restore. |
| F-1-18 | Fixed: the limitation heading is Verification limit. |
| F-1-19 | Fixed: copy controls name their commands. |
| F-1-20 | Fixed: README says the same commands used with a reader’s files. |
| F-1-21 | Fixed: the former long opening sentence is split. |
| F-1-22 | Fixed: scheduled-check copy is split and actionable. |
| F-1-23 | Fixed: checkout availability copy is short and tested. |
| F-1-24 | Fixed: paid-download copy is short and tested. |
| F-1-25 | Fixed: build-output copy is short and the build succeeds. |
| F-1-26 | Fixed: scheduled check replaces dry-read wording. |
| F-1-27 | Fixed: live 404 includes canonical, description, Open Graph, Twitter, and social-card metadata. |
| F-1-28 | Fixed: Home → Demo → Back → Forward focuses each new H1 and announces the route. |

The additional rate-limit repair recorded in .factory/polish-1.md is confirmed: the live 42-case suite and deployment rate-limit check passed.

## Structure, accessibility, and identity

- Home, Demo, Privacy, Terms, and the designed missing route return the expected 200/404 status. robots.txt and sitemap.xml cover public routes.
- All discovered non-mail links returned 200, including the source repository.
- Each route has one H1, one main landmark, lang=en, title, description, canonical, Open Graph/Twitter metadata, favicon, and apple touch icon.
- The live suite passed keyboard tabs, 44px controls, focus contrast, route focus/history, serious/critical Axe checks, reduced motion, offline reload, console checks, and same-origin request checks.
- CSP is a response header and includes frame-ancestors none; the unknown route returns the designed 404.
- The warm paper, contour-map art, survey markers, serif/monospace pairing, and route layout match .factory/design.md and are product-specific.

## Missed leverage

No additional AI feature, hosted sync, or import is required. The brief is for a local recovery CLI, excludes hosted backup storage, and already provides export, pack, check, and restore.

## What would make this perfect

Close F-2-1 through F-2-3: prove passphrase precedence and all named keychain adapters, and remove or verify README operational assertions. Then repeat the full review. With no findings remaining, this can be PASS.

