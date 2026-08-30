# Independent verification 8 — PASS

- Date: 2026-08-30
- Work order: `local-records-continuity-verify-8`
- Candidate commit: `c748ae55a887c19b94735e5b406ea5ae3a49ddb7`
- Live URL: <https://local-records-continuity.sociobot.in>
- Scope: clean checkout, declared claims, release CLI/package, static site,
  PWA, and managed protected-download API

## Verdict

**PASS.** This candidate satisfies the researched brief's local CLI recovery
job. It creates an encrypted, readable recovery pack from configured exports,
requires an explicit local target, verifies and restores it, and fails loudly
when verification cannot be completed. The deployed static assets match the
candidate byte-for-byte and the live managed API identifies the repaired release
expected by this commit.

No defects were found in this verification.

## Mandatory claims — first gate

After `npm ci` in this clean checkout, I ran every exact `test` command from
`.factory/claims.json` sequentially, before other product QA. All 14 passed:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `sample-demo-page` | PASS, desktop and 390 px |
| `pack-artifacts` | PASS |
| `authenticated-encryption` | PASS |
| `explicit-local-target` | PASS |
| `loud-scheduled-check` | PASS |
| `restore-integrity` | PASS |
| `free-core-and-json` | PASS |
| `passphrase-sources` | PASS |
| `offline-guide` | PASS, desktop and 390 px |
| `browser-privacy` | PASS |
| `protected-download-rate-limit` | PASS |
| `licensed-download` | PASS |
| `plus-price-and-checkout` | PASS |

The CLI claims use the bundled Maple Street Books sample through `continuity
demo` in a new operating-system temporary directory. Browser claims use the
one-click `/demo/` sandbox. The claims file exists and no claim command failed.

## Cold first read

In a fresh browser context, the live first screen says: “Build a recovery pack
for local business records.” It names “small businesses using self-hosted or
local admin software,” says it turns exports into a recovery pack that can be
tested, and exposes **Try it with sample data** as the primary one-click action.
The action opens `/demo/`, whose persistent banner says “Demo — sample data,
nothing is saved here,” with Reset demo and Start for real controls. This meets
the plain-language and demo-first gate.

## Clean local gates

```text
npm ci                                      PASS; 24 packages installed, 0 vulnerabilities
npm test                                    PASS
  Rust library/binary/integration/doctest   6 / 2 / 7 / 1 passed
  CLI claim harness                         8 passed
  API tests                                 10 passed
  Playwright                                30 passed, 6 expected deployment skips
npm run typecheck                           PASS
npm run build                               PASS; release CLI and dist/site
cargo package -p continuity-pack            PASS; 112.7 KiB crate (29.3 KiB compressed)
```

`npm run build` produced `target/release/continuity` (2.5 MiB) and `dist/site`.
The initial Home JavaScript is 7,909 bytes raw / 3,484 bytes gzip; CSS is
15,400 bytes raw / 4,296 bytes gzip; no font payload is shipped; the hero image
is 146,138 bytes. These are well inside the product budgets.

## CLI and recovery exercise

I installed the packaged CLI into a new consumer root with:

```sh
cargo install --path crates/continuity --root <fresh-root> --locked
<fresh-root>/bin/continuity --json demo
```

The installed binary's help names all public commands and exit-code contract.
`--json demo` returned `sample-recovery-complete`, `file_count: 3`, and
`verified: true`; its unique temporary workspace contained the encrypted pack,
matching manifest and receipt, restored records, and `RESTORE-REPORT.txt`.

Independent boundary/recovery checks produced the documented behavior:

| Case | Observed exit | Evidence |
| --- | ---: | --- |
| starter configuration | 0 | writes a documented `continuity.toml` |
| missing required export | 3 | names the missing invoices path |
| no `--target` | 2 | Clap rejects the required argument before work starts |
| wrong valid-length passphrase | 4 | “authentication failed: wrong passphrase or damaged pack” |
| non-empty restore output | 2 | refuses to overwrite it |
| zero-hour check | 4 | reports elapsed seconds and explains zero allows no elapsed time |

The CLI's normal sample route packs, checks, decrypts, restores, and hashes all
three shipped fictional record files. No host keychain write/delete or scheduler
installation was performed because those mutate the verifier host.

## Live deployment, privacy, PWA, and accessibility

- Candidate static identity: live `/`, `mark.svg`, apple icon, webmanifest,
  Home JS, PWA JS/CSS, and `contour-vault.webp` all match the locally built
  candidate bytes by SHA-256. Live `/api/build` returns
  `local-records-continuity-repair-7`, the release identity recorded at this
  candidate commit.
- Privacy: fresh Home → Demo request logs contain only
  `https://local-records-continuity.sociobot.in`; no analytics, third-party
  font, third-party script, or record request occurred. The CLI no-socket
  claim passed under its blocked-socket harness.
- Response policy: Home, Demo, Privacy, and Terms return 200; a random route
  returns the designed 404. Live responses carry CSP including response-header
  `frame-ancestors 'none'`, HSTS, `nosniff`, referrer policy, and permissions
  policy. Hashed JS/CSS/image assets are immutable for one year; HTML
  revalidates after 30 seconds; `sw.js` is no-cache/no-store.
- PWA: a fresh direct `/demo/` visit registered one controlled worker at
  `/sw.js`; `registration.update()` succeeded. Offline reload retained the Demo
  page and network strip, kept a real-license sentinel and real session
  sentinel unchanged, and wrote only the `demo:continuity-offline` demo key.
- Accessibility: at desktop and 390 px, Home, Demo, Privacy, Terms, and 404
  each have `lang=en`, one H1, one main landmark, no horizontal overflow, and
  no console/page errors. Axe reported zero serious or critical findings.
  Keyboard begins at the visible Skip to main content link; Demo tabs work with
  ArrowRight. Reduced-motion media reports true and transitions are reduced to
  0.01 ms. Visual inspection at desktop and 390 px found the map-based layout
  readable and controls usable.
- Same-origin links discovered on Home, Demo, Privacy, Terms, and 404 returned
  200. No external resources were requested during this verification.

## Managed endpoint allowance

`npm run test:deployment:rate-limit` against the live deployment waited for a
fresh fixed window then sent 60 concurrent protected-download POSTs from this
client. It observed exactly **20 × 403** (requests admitted then rejected for
the invalid fixture license) and **40 × 429**. Every response carried
`RateLimit-Policy: 20;w=60` and `RateLimit-Backend: shared-azure-blob`; every
429 included a positive `Retry-After` header. The enforced documented allowance
is therefore 20 requests per client per fixed 60-second window.

No real license or purchase was used. Anonymous and reserved-header requests
returned 401; an invalid `X-Continuity-License` returned 403; this exercises
the live fail-closed path without accessing paid content.
