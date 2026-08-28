# Independent verification — FAIL

Date: 2026-08-28  
Work order: `local-records-continuity-verify-1`  
Candidate: `559ad0beefb7954e546127d8b0561bf3f75a6370` (`559ad0b`)  
Live URL: https://local-records-continuity.sociobot.in

## Verdict

**FAIL — do not release this candidate as-is.** The free, local CLI recovery
workflow is functional, but the deployed purchase route is broken and the
landing page's displayed installation command is invalid. These are real user
paths, not test-only discrepancies.

The live root HTML SHA-256 was
`6f1666b9a088f7f9cec0f877bdac97b83e7bbdd6967fe1db9d528e5fae1d1be5`,
identical to the candidate's freshly generated `dist/site/index.html`.
Therefore the live failures are present in the tested candidate, not a stale
deployment.

## Blocking defects

### P1 — Plus checkout is a dead production link

- The live Buy Continuity Plus link and candidate source use
  `https://pilot-api.sociobot.in/api/v1/products/local-records-continuity/checkout`.
- Fresh `curl` of that URL on 2026-08-28 returned **HTTP 404**.
- The production endpoint required by the factory contract,
  `https://api.sociobot.in/api/v1/products/local-records-continuity/checkout`,
  also returned **HTTP 404**. The release handoff itself says the production
  environment variable and product registration are still release steps.

Impact: a customer clicking the visible $39 purchase action cannot buy the
advertised field kit. The shipped site is using a staging/pilot billing origin
on a production domain.

### P1 — the landing-page install command cannot run

- The displayed/copyable command is
  `cargo install --git https://github.com/B-Divyesh/sf-local-records-continuity --path crates/continuity`.
- Running it freshly produced:
  `error: the argument '--git <URL>' cannot be used with '--path <PATH>'`.

Impact: the first install step shown to a prospective owner fails before the
CLI starts. The README's local build command is valid, but that does not repair
the live landing-page path.

## Non-blocking defects

### P2 — deployed response policy/caching does not match the checked-in policy

The candidate ships `site/public/_headers` requesting immutable hashed assets,
`no-cache` for `sw.js`, and a Permissions-Policy. Fresh live responses for the
home page, JS, CSS, hero WebP, and `sw.js` all instead had
`Cache-Control: public, must-revalidate, max-age=30`; none had
`Permissions-Policy`. `site.webmanifest` was served as
`application/octet-stream` rather than a manifest MIME type. This misses the
static caching and response-policy acceptance requirements, even though the
site remains usable.

## Local clean-checkout evidence

The worktree was clean and at the requested commit before installation.

- `npm ci`: pass; audit reported 0 vulnerabilities.
- `cargo fmt --all -- --check`: pass.
- `cargo clippy --workspace --all-targets -- -D warnings`: pass.
- `npm run typecheck`: pass.
- `cargo test --workspace`: pass — 10 unit/integration tests plus 1 doctest.
- `npm test`: pass — Rust suite plus 10 Playwright tests on desktop Chromium and
  390×844 mobile; Axe had zero serious/critical findings on home, privacy, and
  terms.
- `npm run build`: pass — release CLI and `dist/site/` produced.
- `cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty`:
  pass; `target/package/continuity-pack-0.1.0.crate` (26,127 bytes) created.

## CLI and consumer acceptance exercise

Using fresh temporary fixtures and an already-created explicit target:

- `continuity --json init` generated the documented configuration.
- `continuity --ci --json pack` created an XChaCha20-Poly1305/Argon2id pack,
  readable manifest, and receipt; output reported 2 files and `verified:true`.
- `check --max-age-hours 26`/verification behavior was exercised; a boundary
  limit of `0` correctly failed with exit 4 once the pack was fractionally older
  than zero hours.
- Restore into a new empty directory succeeded, emitted `verified:true`, and
  both recovered fixtures compared byte-for-byte with their originals.
- A wrong passphrase failed with exit 4 and authenticated-encryption error.
- An absent target failed loudly with exit 3 and was not created.
- The packaged `.crate` was unpacked into a separate consumer directory,
  installed with `cargo install --path ... --root ...`, and the installed
  `continuity --help` exposed the documented public commands and CI/JSON flags.

## Browser, privacy, PWA, and performance evidence

- Fresh live desktop and 390px mobile Playwright smoke checks: one `h1`, main
  landmark, no horizontal overflow at 390px, no console/page errors, keyboard
  tab selection works, and a normal keyboard-focused link has a visible
  3px ochre focus outline.
- Reduced-motion context reported the contour animation duration as `0.00001s`.
- Live service worker was active at the site scope; offline reload retained the
  complete page and showed the offline strip. Calling `registration.update()`
  succeeded with the existing active worker (no new server version was available
  to force an actual update transition).
- Initial page load made no third-party request. Supplying a license made only
  the expected optional verification request, but to the incorrect pilot API.
  The CLI contains no network client/dependency; no analytics, CDN fonts, or
  runtime third-party scripts were found.
- Built asset sizes: home JS 5,202 B, shared JS 711 B, CSS 12,447 B, no font
  payload, hero WebP 146,138 B — all within stated budgets.
- Lighthouse mobile against the live URL: Performance 98, Accessibility 100,
  Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.6 s, CLS 0, TBT 160 ms. The
  Lighthouse runner emitted a browser-tab crash warning after producing this
  complete report; the scores/metrics are retained as a smoke measurement, not
  a substitute for the header findings above.

## Required remediation and re-verification

1. Register/enable the production Sociobot product and build/deploy with
   `VITE_BILLING_API_BASE=https://api.sociobot.in/api/v1`; prove checkout no
   longer returns 404 and license verification follows the production origin.
2. Replace the landing-page install command with a valid single source method
   (for example a clone followed by `cargo install --path crates/continuity`,
   or an appropriate supported `cargo install --git ...` invocation).
3. Configure the deployment to honor the shipped cache/security headers (or
   provide the equivalent platform configuration), then recheck live JS/CSS,
   WebP, service worker, and manifest headers.

