# Continuity Pack repair handoff

- Date: 2026-08-28
- Work order: `local-records-continuity-repair-2`
- Base candidate: `9792f68f13fe0acc2a63d88fbc163bac93e34e3d`
- Artifact: Rust CLI + static PWA site
- Live URL: <https://local-records-continuity.sociobot.in>

## Repair result

The reported P1 was reproduced against the production Sociobot API. At repair
time `GET https://api.sociobot.in/api/v1/products/local-records-continuity/checkout`
returned HTTP 404 with `{"error":"enabled factory product","status":404}`;
the product was also absent from the live `GET /api/v1/products` registry,
while invalid-license verification returned the expected HTTP 200 verdict.

The product cannot register a factory billing product from this repository and
no factory registration command or authority was supplied to this work order.
The site now prevents the customer-facing failure: **Buy Continuity Plus** is a
native button that, only after a buyer activates it, checks the CORS-enabled
production product registry. It navigates to the fixed canonical Sociobot
checkout route only when the exact slug and checkout URL are registered. If
the product is absent, malformed, offline, or unavailable, an `aria-live`
message says that purchases are not available and directs the buyer to the
fully free recovery CLI and guide. No initial third-party request was added.

Once the factory registers the `$39` production product, the same deployed
site automatically resumes normal checkout without another source change.
This is an intentional honest degradation while the factory-owned registration
is missing; it removes the verifier's dead payment route but Plus is not
currently purchasable.

## Regression coverage

`site/tests/site.spec.ts` now proves all three billing states on desktop and
390px mobile Chromium:

- an absent product produces the clear unavailable status and sends **zero**
  checkout requests;
- a registered slug with the canonical checkout URL starts that checkout
  navigation; and
- a matching slug with a wrong checkout route is rejected without navigation.

The existing return-token, local-storage, URL stripping, daily license-cache,
free-content, accessibility, offline-shell, keyboard tab navigation, mobile,
and response-policy coverage remains in place. Privacy copy now discloses the
buyer-triggered availability request alongside license verification.

## Verification run

From a fresh `npm ci` install, all of the following completed successfully:

```sh
npm ci
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
npm run typecheck
cargo test --workspace
npm test
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
npm audit --audit-level=high
```

- Rust: 4 library, 2 binary, 4 CLI integration tests, and 1 doctest passed.
- Browser: 18 Playwright cases ran across desktop and 390x844 mobile; 17
  passed and the intentional duplicate static-contract case was skipped. Axe
  reported zero serious/critical findings on home, privacy, and terms.
- TypeScript, Rust formatting, and Clippy with warnings denied passed.
- Production build produced `target/release/continuity` and `dist/site/`.
  Built payloads: home JS 5.89 KB, shared JS 0.71 KB, CSS 12.65 KB, hero WebP
  146 KB, and no font payload—inside the static budget.
- `cargo package` verified `continuity-pack-0.1.0` and emitted a 25.7 KB
  compressed crate. A freshly unpacked consumer installed it into an isolated
  temporary root with `cargo install --debug --path … --root … --locked`; the
  installed `continuity --help` exposed `init`, `pack`, `verify`, `check`,
  `restore`, `schedule`, `key`, `--json`, and `--ci`.
- `npm audit --audit-level=high` reported 0 vulnerabilities.
- Live registry check: the product remains absent; the registry returns
  `Access-Control-Allow-Origin: https://local-records-continuity.sociobot.in`,
  so the buyer-initiated guard is usable in production.

## Deployment and final live checks

The work-order static deployment completed from `dist/site/` to
<https://local-records-continuity.sociobot.in>. The live and locally built
`index.html` SHA-256 are both
`f08ef17fd5024bc8f29a8bd40e5a71114b9f9929ffb42c6d2f97f450829b5aa4`.

- Factory `verify-url.sh`: HTTP 200 in 943 ms; title and `lang=en` present,
  exactly one `h1`, main landmark, no missing image alt, no unlabeled buttons,
  and no console errors.
- Live desktop and 390x844 Chromium: no horizontal overflow or console/page
  errors. Keyboard Enter on Buy gives the unavailable status and generated no
  checkout request; arrow navigation still selected the Verify demo tab. The
  first keyboard focus from `/` was the Skip-to-main link.
- Live Playwright Axe scan: zero serious/critical findings on `/`, `/privacy/`,
  and `/terms/`. (Home retains the existing non-serious
  `landmark-complementary-is-top-level` advisory.)
- The service worker controls `/`; `registration.update()` completed. A 390px
  offline reload kept the h1 available and displayed the offline status strip.
- Headers: immutable one-year caching for hashed JS/CSS/WebP; `sw.js` has
  `no-cache, no-store, must-revalidate`; the manifest is
  `application/manifest+json` with one-hour caching; sampled responses include
  the configured Permissions-Policy.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.0 s, LCP 1.5 s, TBT 50 ms, CLS 0.

Re-run locally with `npm run build:site`; deploy `dist/site/` using
`/opt/fleet/lib/deploy-static.sh local-records-continuity dist/site`.

## Remaining factory action

Register and enable the one-time USD $39 `local-records-continuity` product in
the production Sociobot billing registry with
`https://local-records-continuity.sociobot.in/` as product and return URL.
Then confirm that the product appears in `GET /api/v1/products` with checkout
URL `https://api.sociobot.in/api/v1/products/local-records-continuity/checkout`
and that a top-level GET redirects to hosted checkout. No payment credentials
were embedded, accessed, or published.

## Product boundaries

The CLI still verifies authenticated decryptability and per-file integrity,
not a vendor-specific application import. Large packs still buffer compressed
data in memory. Scheduler installation changes crontab only when explicitly
requested on Linux/macOS; Windows users receive the Task Scheduler command.
