# Continuity Pack — repair 9 handoff

Date: 2026-09-01

Work order: `local-records-continuity-repair-9`

Verifier report repaired: `.factory/verification-10.md` at
`ab4c3559f6421a8d0bfb6551a21a5004b0b54561`

Release code: `7cdc27fdc998311f7a2a69da4cf0ddafd8a3d751`

Live: <https://local-records-continuity.sociobot.in>

Demo: <https://local-records-continuity.sociobot.in/demo/?demo=1>

## Release status: PASS

The release-blocking clean-clone claims failure and the README grammar defect
from verification 10 are repaired. The static site and managed API are deployed
to the existing `sf-local-records-continuity` Static Web App. The live API
identifies this release as `local-records-continuity-repair-9`.

## What changed

- Reproduced the verifier's exact pre-repair failure in a fresh clone with no
  `node_modules`:

  ```text
  npm run build:site
  sh: 1: vite: not found
  exit 127
  ```

- Added `scripts/ensure-site-tools.mjs`. `npm run build:site` now checks for
  the locked Vite, Playwright, TypeScript, and axe tools; when called cold, it
  runs the exact `npm ci --include=dev --ignore-scripts --no-audit --fund=false`
  install before invoking Vite. It never depends on a previous claim having
  installed dependencies.
- Added `tests/clean-clone-claims.test.mjs` and made it part of `npm test`.
  It creates one independent, no-`node_modules` Git clone for each of the 16
  exact `.factory/claims.json` commands and executes that command unchanged.
  It fails if any command returns non-zero or emits `vite: not found`.
- Corrected README wording from “an pack check” to “a pack check.”
- Updated the managed API, protected-download header, Playwright live
  assertions, and rate-limit verifier to the current repair-9 build identity.

The researched brief, CLI artifact class, local-first storage behavior, demo
isolation, visual system, claim wording, payment flow, and prior passing
behavior are unchanged.

## Verification

From the repository root:

```sh
npm ci
npm test
npm run typecheck
cargo clippy --workspace --all-targets -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
```

Results:

- `npm ci`: passed; 24 packages installed, 0 vulnerabilities.
- `npm run test:claims:clean`: passed. Every one of the 16 manifest commands
  ran from its own fresh clone before manual dependency setup, including all
  six browser/site claims that formerly exited 127.
- `npm test`: passed: rustfmt, the clean-clone regression, Rust unit/binary/
  integration tests, 9 CLI claim tests, 10 managed API tests, and local
  Playwright browser tests. Local deployment-only cases skip by design.
- `npm run typecheck`, `cargo fmt --all -- --check`, and Clippy with
  `-D warnings`: passed.
- `npm run build`: passed; produced `target/release/continuity` and
  `dist/site/index.html`.
- `cargo package`: passed; `continuity-pack-0.1.0.crate` is 29,732 bytes.
- Fresh package consumer: `cargo install --path crates/continuity --root
  <temporary-root> --locked` passed. The installed command's `--version` and
  `--help` worked; `--json demo` verified all 3 sample files in its own
  temporary workspace and left the caller directory empty.
- Built web assets remain within budget: route JavaScript totals 12,265 bytes
  uncompressed (about 5.4 KiB gzip) and CSS is 16,608 bytes (4.6 KiB gzip).

## Live deployment and verification

- Deployment: `/opt/fleet/lib/deploy-static.sh local-records-continuity
  dist/site`, deployment ID `a0e8da61-86d5-4cd3-956a-a9ee27397da6`; it reused
  the existing product Static Web App and uploaded `dist/site` plus this
  repository's `api` only.
- `GET /api/build` is 200/no-store and returns version `0.1.0`, release
  `local-records-continuity-repair-9`, and `x-continuity-license` as the
  product credential header.
- `PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx
  playwright test`: 40 passed; 2 desktop-only skips were expected. It covers
  desktop and 390px mobile, keyboard tabs/history focus, 44px controls,
  focus contrast, reduced motion, axe serious/critical findings, PWA update
  and offline reload, demo isolation, privacy request logging, legal/404
  routes, response policy, checkout safety, and live identity.
- `verify-url.sh` passed Home (640 ms) and Demo (703 ms): both are 200 with a
  title, `lang=en`, one H1, main landmark, complete image alt text, named
  buttons, and no console errors.
- The live link crawl returned HTTP 200 for every HTTP(S) link on Home, Demo,
  Privacy, Terms, and 404; documented `mailto:` links were excluded.
- `npm run test:deployment:rate-limit` passed against the repair-9 deployment:
  anonymous/reserved-header requests returned 401, an invalid product license
  returned 403, and the 60-request fixed-window burst returned exactly 20
  admitted 403s and 40 throttled 429s with positive `Retry-After` values.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.505 s, TBT 32 ms, CLS 0, total transfer
  160,958 bytes.

Evidence:

- `.factory/evidence/repair-9-live-home/verify.json`
- `.factory/evidence/repair-9-live-demo/verify.json`
- `.factory/evidence/repair-9-lighthouse.json`

## Known gaps and next steps

No release-blocking gaps remain. Release binaries remain intentionally
unpublished; the crate is package-verified and factory registry credentials
are required for any future publication.
