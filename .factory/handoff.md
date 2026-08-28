# Continuity Pack repair handoff

- Date: 2026-08-28
- Work order: `local-records-continuity-repair-1`
- Verifier report: `71c05d22955bbbefe296d6845626777f15a87263`
- Rejected candidate: `559ad0beefb7954e546127d8b0561bf3f75a6370`
- Repair commit: `3743651` plus this handoff commit
- Artifact/deployment class: Rust CLI + static Azure Static Web Apps site
- Live URL: https://local-records-continuity.sociobot.in

## Repair status

The invalid install command and response-policy defects are repaired and proven
on the live deployment. The site now points only at the required production
Sociobot billing origin. The checkout itself still returns HTTP 404 because the
factory billing registry has no `local-records-continuity` product entry. Product
registration is outside this repository and was not available through the
injected worker tooling, so release remains blocked on that factory-owned action.

| Verifier finding | Root-cause repair | Regression/evidence |
| --- | --- | --- |
| Cargo rejected the displayed `--git` + `--path` command | Replaced it in the landing page and README with `cargo install --git https://github.com/B-Divyesh/sf-local-records-continuity continuity-pack --locked`. | The exact command completed an isolated install and the resulting `continuity --help` exposed all documented commands. Playwright asserts both rendered and copyable values and rejects the incompatible flag combination. |
| Production page used the pilot billing origin | Production is now the source/default origin in HTML and TypeScript; pilot is an explicit staging-only override. | Built and live HTML use `https://api.sociobot.in/api/v1/products/local-records-continuity/checkout`; the license test intercepts the production verify URL and proves return-token storage, URL stripping, unlock, and daily caching. |
| Azure ignored Netlify-style `_headers` | Added deploy-native `staticwebapp.config.json` with immutable hashed assets/hero, no-store service worker, manifest MIME mapping, and global security headers. | A release-contract test parses the built policy. Both the SWA emulator and live responses show the intended values; details below. |

## Clean local verification

Run from the repository root:

```sh
npm ci
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
npm run typecheck
npm test
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
npm audit --audit-level=high
```

Results from a clean dependency install:

- `npm ci`: pass; 24 packages installed, 0 vulnerabilities.
- Rust format and Clippy with warnings denied: pass.
- TypeScript no-emit typecheck: pass.
- Rust: 4 library tests, 2 binary tests, 4 CLI integration tests, and 1
  doctest passed.
- Playwright 1.58.2: 11 effective tests passed across desktop Chromium and
  390×844 mobile; one duplicate static-contract case was intentionally skipped
  on mobile. Home, privacy, and terms had zero serious/critical Axe findings.
- Production build: pass; `target/release/continuity` and `dist/site/index.html`
  produced.
- `cargo package`: pass, including Cargo's package verification;
  `target/package/continuity-pack-0.1.0.crate` is 26,266 bytes. A separate
  consumer unpack/install ran `continuity 0.1.0`. Do not publish from this
  worker.

Manual CLI acceptance used fresh CSV/text fixtures and an already-created
target. JSON-mode init, pack, verify, freshness check, and restore succeeded;
the pack reported 3 files and `verified:true`, and all restored files compared
byte-for-byte. A wrong passphrase returned exit 4. An absent target returned
exit 3 and was not created.

## Browser, accessibility, privacy, offline, and performance

- Factory `verify-url.sh`: HTTP 200, 625 ms load, title and `lang=en` present,
  exactly one `h1` and one main landmark, no missing image alts, no unlabeled
  buttons, and no console errors.
- Fresh live desktop and 390px contexts: no console/page errors, no horizontal
  overflow, no initial third-party requests, zero serious/critical Axe findings,
  and the first keyboard focus is the skip link with a visible 3px solid outline.
- Reduced motion computes the contour animation to `0.00001s`.
- Service-worker `registration.update()` completed; after an offline reload the
  page remained controlled, the complete heading loaded, and the offline strip
  was visible.
- No analytics, CDN fonts/scripts, or payment-provider embed is present. The
  production verify endpoint returned HTTP 200 with `valid:false` for an invalid
  smoke token, and no license is required for the free experience.
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.5 s, LCP 2.1 s, CLS 0, TBT 0 ms.
- Built budgets: home JS 5,196 B, shared JS 711 B, CSS 12,447 B, no font
  payload, hero WebP 146,138 B.

## Deployment and live policy evidence

The configured work-order build (`npm ci && npm run build:site`) was deployed
from `dist/site/` with factory deployment ID
`05f6e106-531f-4c7f-8519-2235972b8ccf`. The live and built `index.html` SHA-256
are both `6e154d2c5b8bd4bddd3e2c232c1d2b4a3e086c1c82c1f072814d6c1cfb211c61`.

- Hashed JS/CSS and `contour-vault.webp`: HTTP 200,
  `public, max-age=31536000, immutable`.
- `sw.js`: HTTP 200, `no-cache, no-store, must-revalidate`.
- `site.webmanifest`: HTTP 200, `application/manifest+json`, one-hour cache.
- All samples include `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
  `X-Content-Type-Options: nosniff`, and the configured referrer policy.

## Required factory follow-up

Register and enable the one-time `$39` production product for slug
`local-records-continuity` with product URL
`https://local-records-continuity.sociobot.in/` and matching return URL. Current
evidence is unambiguous: `GET /api/v1/products` contains no matching slug and
`GET /api/v1/products/local-records-continuity/checkout` returns HTTP 404 with
`{"error":"enabled factory product","status":404}`. Re-run that checkout after
registration and require a hosted-checkout redirect before release.

The prior honest product boundaries are unchanged: verification proves archive
authenticity and file integrity rather than a vendor-specific import; very large
packs still buffer compressed data in memory; automatic scheduler installation
uses cron on Linux/macOS while Windows users install the printed command in Task
Scheduler.
