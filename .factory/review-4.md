# Adversarial first-read review 4 — Continuity Pack

Date: 2026-09-01  
Live URL: <https://local-records-continuity.sociobot.in>  
Reviewed revision: `826a79bdbf14d1c86204d18f69c16b3f6a940367`

## Verdict: FAIL

Two major unlisted privacy claims remain. The product is clear, the demo is
immediately useful and isolated, and every declared claim command passed from
the clean-clone runner. PASS requires no unlisted claim as well as no failing
test.

## Cold first screen

Fresh Chromium contexts were opened before reading repository material.

| Viewport | What it does | For whom | First click | Evidence |
| --- | --- | --- | --- | --- |
| 390×844 | Builds a recovery pack from local business exports and lets the owner test it. | Small businesses using self-hosted or local admin software. | **Try it with sample data**. | Action y=551–599; all three facts end at y=807. |
| 1440×844 | Builds a recovery pack from local business exports and lets the owner test it. | Small businesses using self-hosted or local admin software. | **Try it with sample data**. | Action y=502–550; all three facts end at y=667. |

The first screen states: “Build a recovery pack for local business records.”
“For small businesses using self-hosted or local admin software, it turns
exports into a recovery pack you can test.” The result-naming first action is
visible without scrolling at both sizes.

## Findings

### Major

#### F-4-1 — Download-counter storage claims are unlisted

- Location: live `/privacy/`, **License data**.
- Exact quotes: “The download endpoint stores a one-way hash of the license
  token or network address.” “It also stores one-byte request counters in Azure
  Blob Storage.” “Each fixed one-minute window has a separate counter.”
- Check: `protected-download-rate-limit` promises an observable 20-request,
  60-second allowance. Its tagged test includes an Azure Blob simulation, but
  no `claims.json` entry promises the published hash, counter-byte, Blob, or
  per-window storage behavior, and its test does not inspect a deployed
  counter. These are separate privacy and retention assertions a buyer can
  rely on.
- Why this fails: the policy tells a visitor exactly what personal data is
  retained and where. That needs the same clean-sandbox proof as a product
  behavior; source inspection and a simulation are not the declared proof.
- Concrete fix: add a `download-counter-privacy` claim with a tagged handler
  test that uses a recording storage adapter and proves the persisted identifier
  is one-way hashed, each admission adds one byte to the expected time-window
  object, and no raw license/address is stored. Alternatively delete the three
  implementation/retention sentences and retain only the tested rate-limit
  statement.

#### F-4-2 — “No business record data is sent” has no matching claim test

- Location: live `/privacy/`, **License data**.
- Exact quote: “No business record data is sent.”
- Check: `explicit-local-target` blocks socket creation for the CLI demo, and
  `browser-privacy` records the normal Home/sample-preview origins. Neither
  declared entry exercises a license verification or protected-download flow
  while recording request bodies, and neither claims this end-to-end privacy
  promise.
- Why this fails: this is the decisive privacy statement for a tool handling
  invoices and customers. Same-origin-only traffic in the sample does not prove
  that the product never sends a record in its other browser flow.
- Concrete fix: add a `no-record-upload` claim. In a fresh browser context,
  run the license/paid-download fixture flow with request recording and assert
  that every outgoing body/query/header contains only the license and requested
  asset, never a sample record value or file content. Include the CLI network
  test as complementary evidence, not as the sole proof.

## Copy audit

Counting rule: hyphenated terms, commands, versions, numbers, and URLs count as
one word. Standalone code blocks are excluded. No landing or README sentence is
over 22 words; no banned marketing adjective, mood/metaphor heading, ambiguous
button, or terminology conflict was found. `F-4-1` and `F-4-2` are the only
claim-inventory flags.

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
| 20 | 7 | The complete pack is authenticated with XChaCha20-Poly1305. | Pass |
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
| 32 | 4 | Checkout opens on Sociobot. | Pass |
| 33 | 3 | No license stored. | Pass |
| 34 | 6 | The free CLI remains fully available. | Pass |
| 35 | 6 | CLI for tested local business-record recovery. | Pass |
| 36 | 5 | Built by Param Factory · v0.1.0. | Pass |

### README

| # | Words | Sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 18 | Continuity Pack is a local-first CLI for small businesses that need a recovery handoff—not another backup subscription. | Pass |
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
| 28 | 20 | Passphrases are resolved in this order: `--passphrase-file`, `CONTINUITY_PASSPHRASE`, then a Linux Secret Service entry saved by `continuity key store`. | Pass |
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
| 41 | 4 | Checkout opens on Sociobot. | Pass |
| 42 | 10 | `npm run build` builds the release CLI and static site. | Pass |
| 43 | 8 | `npm run build:site` builds only the site. | Pass |
| 44 | 7 | Deploy `dist/site/` with configured environment settings. | Pass |
| 45 | 9 | There is no telemetry in the CLI or site. | Pass |
| 46 | 11 | Packs stay local and are copied only to the explicit target. | Pass |
| 47 | 16 | Encryption uses XChaCha20-Poly1305 with an Argon2id passphrase-derived key; every restored file is rechecked against its manifest. | Pass |
| 48 | 10 | Read the site’s `/privacy/` and `/terms/` pages for purchase-specific details. | Pass |
| 49 | 5 | MIT © 2026 Sociobot (Param Factory). | Pass |
| 50 | 2 | See `LICENSE`. | Pass |

Headings name their sections; **Try it with sample data**, the copy controls,
and the license/download controls name their outcomes. The consistent terms are
pack, target, manifest, check, verify, restore, source, demo, and Plus field
kit.

## Demo and sandbox

- One click from Home opened `/demo/?demo=1`.
- At 390×844, the first demo screen already showed the Maple Street Books Pack
  result: three bundled files, temporary target, packed records, and an
  authenticated all-hashes-match result.
- The persistent banner was “Demo — sample data, nothing is saved here.” Both
  **Reset demo** and **Start for real** were visible.
- With real-license and unrelated local/session-storage sentinels installed,
  Reset selected Pack and removed `demo:*` only; real sentinels were unchanged.
- Home and the exercised demo made requests only to
  `https://local-records-continuity.sociobot.in`; no console errors occurred.
- The CLI claim suite runs `continuity --json demo` from an empty caller
  directory, confirms a unique OS-temporary workspace and three restored files,
  and confirms no caller-directory write.

## Declared claims

`npm test` ran the clean-clone claim runner, which executes every exact command
in `.factory/claims.json` from a separate clean copy. All 18 entries passed:
`demo-sandbox`, `sample-demo-page`, `pack-artifacts`, `authenticated-encryption`,
`explicit-local-target`, `required-sources`, `loud-scheduled-check`,
`restore-integrity`, `free-core-and-json`, `passphrase-sources`,
`passphrase-precedence`, `schedule-preview`, `license-restoration`,
`offline-guide`, `browser-privacy`, `protected-download-rate-limit`,
`licensed-download`, and `plus-price-and-checkout`.

## Earlier-history recheck

Every prior finding was checked on the current live site and corresponding
source/test. None of the following earlier IDs is open again.

| Finding IDs | Current confirmation |
| --- | --- |
| F-1-1 | Desktop action, explanation, and facts remain within 1440×844. |
| F-1-2 | Mobile demo has populated output in its first viewport. |
| F-1-3 | Manifest business, files, verify command, and restore guidance are asserted by `pack-artifacts`. |
| F-1-4–F-1-8 | Source-build/release wording is consistent; no unsupported Rust, binary, alternate-install, or release-version promise remains. |
| F-1-9 | Public schedule guidance is preview-only and `schedule-preview` proves it does not install. |
| F-1-10 | Passphrase canary scans cover configuration, artifacts, reports, stdout, and stderr. |
| F-1-11–F-1-12 | The free command set and browser license save/reload/recheck/remove flows match their claims. |
| F-1-13 | Automatic refund-revocation wording is absent. |
| F-1-14–F-1-15 | Visitor copy consistently says pack; the sample stage is Check. |
| F-1-16–F-1-18 | Failure, free-tier, and verification-limit copy remains direct and specific. |
| F-1-19–F-1-22 | Copy controls, same-command demo explanation, README opening, and scheduled-check guidance remain plain and actionable. |
| F-1-23–F-1-26 | Checkout/download/build wording is concise; scheduled check replaces dry-read throughout. |
| F-1-27 | The live missing route returns the designed 404 with canonical, description, OG/Twitter, and icon metadata. |
| F-1-28 | Home → Demo → Back → Forward focuses the new H1 and updates the live announcement. |
| F-2-1 | Conflicting file/environment/Secret Service fixtures prove documented passphrase precedence. |
| F-2-2 | Public copy names only the tested Linux Secret Service adapter. |
| F-2-3 | README contains none of the earlier internal deployment assertions/jargon. |
| F-3-1 | `required-sources` is declared and proves the missing path, exit 3, and zero artifacts. |
| F-3-2 | The untested compression assertion remains removed. |
| F-3-3 | Merchant/refund wording remains replaced with “Checkout opens on Sociobot.” |

## Structure, accessibility, and identity

- `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` have correct
  titles, descriptions, canonical/OG/Twitter metadata, favicon, `lang=en`, one
  H1, and one main landmark. Unknown live URLs return the designed 404.
- `robots.txt`, `sitemap.xml`, response-header CSP with `frame-ancestors 'none'`,
  the service worker, and the footer/header skeleton are present. All crawled
  first-party links and the GitHub source link returned 200.
- The live page has no console errors. Keyboard tabs, route focus, 44px
  controls, mobile overflow, offline reload, reduced motion, contrast, and Axe
  serious/critical checks are covered by the passing site suite.
- The warm paper, contour-map art, survey notation, serif/monospace pairing,
  and route-shaped layout visibly match `.factory/design.md`; this is not a
  generic SaaS template.

## Missed leverage

No missing AI, hosted sync, or import feature was found. The brief is for a
local recovery CLI and explicitly excludes hosted backup storage; its export,
pack, check, verify, and restore path is complete.

## What would make this perfect

Prove or remove the four privacy statements in F-4-1 and F-4-2. With those
claims covered by clean-sandbox tests, the product would have no remaining
finding from this review.
