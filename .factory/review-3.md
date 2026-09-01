# First-read review 3 — Continuity Pack

Date: 2026-09-01
Live URL: <https://local-records-continuity.sociobot.in>
Candidate: `253dd78a8dfebc32fdfc19deb83c6befcb7bbd6a`

## Verdict: FAIL

Three major findings remain. The first screen, demo, declared claim tests,
accessibility checks, routes, and visual identity pass. However, three
claim-like statements have no matching `.factory/claims.json` entry and tagged
test. PASS requires zero findings and no untested claim.

No blocking finding was observed. All 17 declared claim commands passed.

## Cold first screen

Fresh browser contexts were opened at 390×844 and 1440×844.

| Viewport | What it does | For whom | First click | Evidence |
| --- | --- | --- | --- | --- |
| 390×844 | Builds recovery packs that a business can check and restore. | Small businesses using self-hosted or local admin software. | **Try it with sample data**. | The action occupied y=551–599; the three facts ended at y=807. |
| 1440×844 | Builds recovery packs that a business can check and restore. | Small businesses using self-hosted or local admin software. | **Try it with sample data**. | The action occupied y=502–550; the three facts ended at y=667. |

The supporting copy was: “Build a recovery pack for local business records.”
“For small businesses using self-hosted or local admin software, it turns
exports into a recovery pack you can test.” “Try it with sample data.” The first
screen answers all three questions without scrolling at both sizes.

## Findings

### Major

#### F-3-1 — Required-source failure is an unlisted claim

- Exact quote/location: landing page, Three steps → Gather the exports:
  “Required sources fail the run if they disappear.”
- Check: no `.factory/claims.json` entry names missing required sources. The
  tagged CLI tests cover an unavailable target, not a missing configured source.
- Why this matters: a business can rely on this behavior to notice an incomplete
  recovery pack. The implementation contains the behavior, but the required
  clean-sandbox proof is absent.
- Concrete fix: add a `required-sources` claim and a tagged test that creates a
  configuration with one missing required source, runs `continuity pack`, and
  confirms a non-zero exit, the missing path in the error, and no pack artifacts.

#### F-3-2 — Compression is an unlisted claim

- Exact quote/location: landing page, Three steps → Encrypt the pack: “The
  complete pack is compressed and authenticated with XChaCha20-Poly1305.”
- Check: `authenticated-encryption` confirms the named encryption and key
  derivation. No claim entry or tagged test confirms compression. The only
  compression evidence is the `zstd` implementation in source.
- Why this matters: compression is a stated pack property. Reading the
  implementation is not the observable sandbox test required for a public
  claim.
- Concrete fix: either remove the unneeded assertion and write “The complete
  pack is authenticated with XChaCha20-Poly1305,” or add a compression claim
  whose tagged test decodes a demo pack and confirms the compressed payload.

#### F-3-3 — Merchant and refund handling are unlisted claims

- Exact quotes/locations: landing Plus section, “Sociobot/Dodo is the merchant
  of record and handles refunds.” README Paid convenience tier,
  “Sociobot/Dodo is the merchant of record.”
- Check: `plus-price-and-checkout` confirms the $39 price and the registered
  Sociobot checkout URL. It does not confirm merchant-of-record status or refund
  handling. No other claim entry names either assertion.
- Why this matters: a buyer can rely on these statements when deciding where
  payment and refund responsibilities sit.
- Concrete fix: add a claim backed by a stable Sociobot product/checkout
  contract that confirms both statements, or remove them from product and
  README copy. If only the tested behavior is retained, use “Checkout opens on
  Sociobot.”

## Copy audit

Counting rule: hyphenated terms, commands, numbers, and URLs count as one word.
Standalone command blocks are excluded. A finding reference marks a claim
inventory issue; there are no sentences over 22 words, banned marketing words,
metaphor headings, or inconsistent product terms.

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
| 12 | 12 | Continuity Pack writes an encrypted pack, a readable manifest, and a receipt. | Pass |
| 13 | 10 | The manifest lists the business, source files, and verification command. | Pass |
| 14 | 9 | Verification proves the pack decrypts and its files match. | Pass |
| 15 | 11 | It does not replace a periodic test import into your application. | Pass |
| 16 | 6 | Build, verify, and restore the pack. | Pass |
| 17 | 7 | Name the files and folders that matter. | Pass |
| 18 | 8 | Required sources fail the run if they disappear. | F-3-1 |
| 19 | 5 | Each file gets a SHA-256. | Pass |
| 20 | 9 | The complete pack is compressed and authenticated with XChaCha20-Poly1305. | F-3-2 |
| 21 | 11 | A scheduled check decrypts the pack and compares every file hash. | Pass |
| 22 | 12 | A failed check returns a non-zero exit code and names the problem. | Pass |
| 23 | 5 | Read the sample recovery result. | Pass |
| 24 | 7 | The bundled bookshop sample shows each result. | Pass |
| 25 | 4 | Use `--json` for scripts. | Pass |
| 26 | 6 | Pack written and target copy verified. | Pass |
| 27 | 5 | Build your first recovery pack. | Pass |
| 28 | 3 | Build from source. | Pass |
| 29 | 6 | Release binaries are not available yet. | Pass |
| 30 | 7 | Pack, check, verify, and restore are free. | Pass |
| 31 | 12 | Plus provides a multi-location configuration workbook, restore-drill worksheet, and staff handoff guide. | Pass |
| 32 | 9 | Sociobot/Dodo is the merchant of record and handles refunds. | F-3-3 |
| 33 | 3 | No license stored. | Pass |
| 34 | 6 | The free CLI remains fully available. | Pass |
| 35 | 6 | CLI for tested local business-record recovery. | Pass |
| 36 | 5 | Built by Param Factory · v0.1.0. | Pass |

### README sentences

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
| 10 | 5 | `continuity --demo` is an alias. | Pass |
| 11 | 7 | `continuity --json demo` returns one JSON result. | Pass |
| 12 | 6 | Delete the printed directory to reset. | Pass |
| 13 | 7 | Each new run uses a fresh directory. | Pass |
| 14 | 6 | The browser preview is at the demo URL. | Pass |
| 15 | 6 | Sample source files are in `examples/maple-street-books/`. | Pass |
| 16 | 3 | Build from source. | Pass |
| 17 | 6 | Release binaries are not available yet. | Pass |
| 18 | 7 | Start a folder with a documented configuration. | Pass |
| 19 | 8 | Edit the generated `continuity.toml`, then make a pack. | Pass |
| 20 | 14 | A target is never assumed; `--target` must point to a local or mounted directory. | Pass |
| 21 | 15 | The command creates an encrypted `.cpack`, a plain-language `.manifest.txt`, and a machine-readable `.receipt.json` beside it. | Pass |
| 22 | 15 | Use `--json` for automation and `--ci` to forbid prompts and require a non-interactive passphrase source. | Pass |
| 23 | 8 | Check the newest target pack without extracting it. | Pass |
| 24 | 12 | Verify a specific pack, or restore it into a new empty directory. | Pass |
| 25 | 7 | Print a daily scheduled-check entry for review. | Pass |
| 26 | 9 | A failed scheduled check returns a non-zero exit code. | Pass |
| 27 | 10 | Its error names an unavailable, stale, corrupt, or unreadable target. | Pass |
| 28 | 19 | Passphrases are resolved in this order: `--passphrase-file`, `CONTINUITY_PASSPHRASE`, then a Linux Secret Service entry saved by `continuity key store`. | Pass |
| 29 | 11 | Interactive terminal input is the final fallback unless `--ci` is set. | Pass |
| 30 | 8 | Linux keychain storage uses Secret Service through `secret-tool`. | Pass |
| 31 | 15 | The CLI does not write a raw passphrase into its configuration or generated recovery files. | Pass |
| 32 | 7 | Run `continuity <command> --help` for command-specific examples. | Pass |
| 33 | 7 | Pack, check, verify, and restore are free. | Pass |
| 34 | 19 | Continuity Plus is a one-time purchase that adds a multi-location configuration workbook, quarterly restore-drill worksheet, and staff handoff guide. | Pass |
| 35 | 15 | Pack, check, verify, restore, exit codes, and JSON output do not require a Plus license. | Pass |
| 36 | 10 | The site confirms that checkout is available before opening Sociobot. | Pass |
| 37 | 7 | An unavailable product stays on this page. | Pass |
| 38 | 9 | The site checks the license before each paid download. | Pass |
| 39 | 11 | Paid files are absent from the public build and offline cache. | Pass |
| 40 | 11 | You can save or remove a license on the product site. | Pass |
| 41 | 6 | Sociobot/Dodo is the merchant of record. | F-3-3 |
| 42 | 10 | `npm run build` builds the release CLI and static site. | Pass |
| 43 | 7 | `npm run build:site` builds only the site. | Pass |
| 44 | 6 | Deploy `dist/site/` with configured environment settings. | Pass |
| 45 | 9 | There is no telemetry in the CLI or site. | Pass |
| 46 | 11 | Packs stay local and are copied only to the explicit target. | Pass |
| 47 | 16 | Encryption uses XChaCha20-Poly1305 with an Argon2id passphrase-derived key; every restored file is rechecked against its manifest. | Pass |
| 48 | 10 | Read the site’s `/privacy/` and `/terms/` pages for purchase-specific details. | Pass |
| 49 | 5 | MIT © 2026 Sociobot (Param Factory). | Pass |
| 50 | 2 | See `LICENSE`. | Pass |

### Headings, actions, and terms

- Headings name their sections: What the pack adds, Three steps, Sample output,
  Install and run, Technical ledger, Optional field kit, and Start for real.
- Actions name their result: Try it with sample data, Build your own pack, Copy
  install/setup/pack command, Buy Continuity Plus, Verify license, Remove saved
  license, and the three named downloads.
- Terms remain consistent: pack, target, manifest, check, verify, restore, demo,
  source, and Plus field kit.

## Demo and sandbox

- One click from Home opened `/demo/?demo=1`.
- At 390×844, populated output occupied y=576–769. It showed Maple Street
  Books, three bundled files, a temporary target, the packed records, and the
  authenticated hash result.
- The persistent banner said “Demo — sample data, nothing is saved here.” Reset
  demo and Start for real were both visible.
- A real-license sentinel and an unrelated local-storage sentinel stayed
  unchanged. Reset removed a `demo:` sentinel and selected Pack. Start for real
  also removed the demo sentinel.
- Home and the exercised sample made same-origin requests only. There were no
  console messages or page errors.
- The installed CLI ran `--json demo` from an empty caller directory. It used a
  unique `/tmp/continuity-demo-*` workspace, restored three files, returned
  `verified:true`, and left the caller directory empty.

## Declared claims

Every command was run exactly as declared from a fresh clone after `npm ci`.

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | Two unique temporary workspaces; three files; no caller writes. |
| `sample-demo-page` | PASS | Desktop and mobile browser projects passed. |
| `pack-artifacts` | PASS | Pack, manifest fields, receipt hash, and ciphertext checks passed. |
| `authenticated-encryption` | PASS | Correct passphrase succeeded; incorrect passphrase returned code 4. |
| `explicit-local-target` | PASS | No socket attempt; omitted target returned code 2 and wrote nothing. |
| `loud-scheduled-check` | PASS | Unavailable, stale, damaged, and unreadable targets returned actionable non-zero results. |
| `restore-integrity` | PASS | Three restored files matched fixtures byte for byte; report present. |
| `free-core-and-json` | PASS | Unlicensed full demo returned one JSON result with `verified:true`. |
| `passphrase-sources` | PASS | File, environment, hidden prompt, and Linux Secret Service fixtures passed without passphrase persistence. |
| `passphrase-precedence` | PASS | File, environment, and Secret Service precedence passed. |
| `schedule-preview` | PASS | Exact daily entry printed; the crontab fixture was not called. |
| `license-restoration` | PASS | Save, reload, reject, and remove flows passed in both browser projects. |
| `offline-guide` | PASS | The direct sample and Home guide reloaded offline in fresh contexts. |
| `browser-privacy` | PASS | Home and sample requests remained on the product origin. |
| `protected-download-rate-limit` | PASS | Declared API checks passed. |
| `licensed-download` | PASS | Active-license response and public-build absence checks passed. |
| `plus-price-and-checkout` | PASS | $39 once and the registered checkout route passed in both projects. |

The three findings above concern statements that are not declared claims; they
do not change the PASS results for the 17 entries that exist.

## Earlier-history recheck

Every finding in reviews 1 and 2 was checked against the current live site and
source. None has regressed.

| Finding | Current check |
| --- | --- |
| F-1-1 | Fixed: action, explanation, and three facts fit at 1440×844. |
| F-1-2 | Fixed: the 390×844 demo opens with populated output in view. |
| F-1-3 | Fixed: manifest business, source files, verification command, and restore steps are tested. |
| F-1-4 | Fixed: Home and README consistently state source installation and current binary availability. |
| F-1-5 | Fixed: no minimum Rust version is stated. |
| F-1-6 | Fixed: no single-binary assertion is present. |
| F-1-7 | Fixed: no alternate-install equivalence assertion is present. |
| F-1-8 | Fixed: no release-number promise is present. |
| F-1-9 | Fixed: public scheduling guidance covers preview only; the tagged test confirms no installation. |
| F-1-10 | Fixed: canary checks cover configuration, artifacts, reports, stdout, and stderr. |
| F-1-11 | Fixed: free-tier copy names the tested command set. |
| F-1-12 | Fixed: license save, reload, invalid state, and removal passed. |
| F-1-13 | Fixed as originally scoped: automatic revocation wording is absent. F-3-3 covers the remaining merchant/refund assertion. |
| F-1-14 | Fixed: visitor copy uses “pack,” not “archive.” |
| F-1-15 | Fixed: both samples call the `continuity check` stage “Check.” |
| F-1-16 | Fixed: failure copy names a non-zero result and the problem. |
| F-1-17 | Fixed: free copy names pack, check, verify, and restore. |
| F-1-18 | Fixed: the limitation heading is “Verification limit.” |
| F-1-19 | Fixed: copy controls name the install, setup, and pack commands. |
| F-1-20 | Fixed: README says the sample uses the same commands as real files. |
| F-1-21 | Fixed: the former long opening statement remains split. |
| F-1-22 | Fixed: scheduled-check error guidance remains short and actionable. |
| F-1-23 | Fixed: checkout availability copy is short and the route behavior passed. |
| F-1-24 | Fixed: paid-download copy is short; active-license and build-absence checks passed. |
| F-1-25 | Fixed: build copy is concise; `npm run build` produced `dist/site/`. |
| F-1-26 | Fixed: “scheduled check” remains the consistent term. |
| F-1-27 | Fixed: the live 404 has canonical, description, Open Graph, Twitter, and icon metadata. |
| F-1-28 | Fixed: Home → Demo → Back focused and announced each new H1. |
| F-2-1 | Fixed: `passphrase-precedence` passed with conflicting source values. |
| F-2-2 | Fixed: public copy names Linux Secret Service only; its fixture passed. |
| F-2-3 | Fixed: the four internal deployment assertions remain absent from README. |

The protected-download repair in polish round 1 also remains covered by the
declared local claim and the passing live managed-API checks.

## Structure, accessibility, and identity

- Home, Demo, Privacy, and Terms returned 200. A missing route returned the
  designed 404 with a return action.
- Titles follow the route pattern; every route has one H1, one main landmark,
  `lang=en`, a description, canonical, Open Graph/Twitter metadata, SVG favicon,
  and apple-touch icon.
- All discovered non-mail links returned 200, including the named GitHub
  repository. `robots.txt` and `sitemap.xml` returned 200 and list the public
  routes.
- Browser Back restored Home and focused its H1. Demo navigation focused the
  Demo H1. Deep links and reloads opened the expected state.
- The combined live browser checks passed all 40 applicable cases with two
  project-condition skips. Axe reported no serious or critical issue; keyboard
  tabs, 44px targets, focus contrast, reduced motion, mobile overflow, and
  console checks passed.
- The CSP is a response header with `frame-ancestors 'none'`; the expected
  security headers are present. The initial JavaScript chunks total 12.27 kB
  uncompressed, below the product budget.
- The warm paper, topographic route art, survey marks, serif/monospace type,
  ochre checkpoints, and dark terminal make a distinct cartographic identity.
  The result does not resemble a generic centered SaaS template.

## Missed leverage

No additional AI step, hosted sync, or special importer is justified. The brief
defines arbitrary local export files as inputs and hosted storage as a non-goal.
Pack, check, verify, JSON receipt, and restore already complete the expected
local workflow. Adding a model call would weaken the offline and privacy model
without completing an implied task.

## Additional verification

- `npm test` passed in the clean checkout: 16 Rust/CLI/doc tests, 10 CLI claim
  tests, 10 API tests, and 36 local browser checks; six deployment-only browser
  checks skipped locally.
- `npm run build` passed and produced `dist/site/` and the release CLI.
- The exact public `cargo install --git ... continuity-pack --locked` command
  installed commit `253dd78a`; its help output opened correctly.
- The first live browser run lacked locally generated `dist/site` for one
  release-contract check. After the documented site build, that exact check
  passed. The live behavior itself was unaffected.

## What would make this perfect

Close F-3-1 through F-3-3: add a tagged missing-required-source check, remove or
prove the compression statement, and remove or prove the merchant/refund
statement. Then repeat the full copy-to-claim mapping. With those three items
closed and no new finding, the product can receive PASS.
