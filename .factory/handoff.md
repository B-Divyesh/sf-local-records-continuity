# Continuity Pack handoff — polish round 3

## Status: PASS

All findings from `.factory/review-1.md`, `.factory/review-2.md`, and
`.factory/review-3.md` are resolved. The production deployment is live at
<https://local-records-continuity.sociobot.in> with build identity
`local-records-continuity-polish-3`.

## What changed

- Added the `required-sources` claim and a clean temporary-workspace test. A
  missing required file now has explicit evidence for exit code 3, the named
  missing path, and zero generated artifacts.
- Removed the untested compression statement from visitor copy. Authenticated
  XChaCha20-Poly1305 encryption remains stated and tested.
- Replaced untestable merchant/refund assertions on Home, README, Privacy, and
  Terms with “Checkout opens on Sociobot,” which the checkout claim observes.
- Added copy regressions that prevent all three removed assertions from
  returning.
- Updated the managed API and protected-download build identity to polish 3.
- Added a 720×480, 48 KB responsive derivative of the original hero art and
  precached it under a new service-worker cache version.
- Updated the catalog line to: “Build, check, and restore encrypted recovery
  packs for local business records.”

The complete finding-to-change-to-evidence map is in `.factory/polish-3.md`.

## Verification

From the repository root:

```sh
npm ci
npm test
npm run build
npm run typecheck
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test --workers=1
npm run test:deployment:rate-limit
```

Results:

- Every one of the 18 `.factory/claims.json` commands passed from its own clean
  clone with no preinstalled `node_modules`.
- `npm test` passed: format; clean-clone claims; 16 Rust, CLI, and doc tests;
  11 CLI claim tests; 10 API tests; and 36 applicable local browser tests.
- The final local browser rerun passed 36 tests with six deployment-only skips.
- The final live browser run passed all 40 applicable tests with two local-only
  skips. It covered Home, Demo, Privacy, Terms, the designed 404, offline
  reload, browser privacy, route focus, keyboard use, mobile layout, Axe, and
  the managed API.
- `npm run build` produced `dist/site/` and `target/release/continuity`.
- `cargo package` produced and verified `continuity-pack` 0.1.0.
- Initial JavaScript is 12.27 KB uncompressed in total; CSS is 16.61 KB. The
  responsive first-screen image is 48 KB.
- Live Lighthouse scored 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO. LCP was 1.07 s, CLS 0, and TBT 60 ms.
- The final live rate-limit probe returned exactly 20 denied upstream checks
  and 40 rate-limited responses across 60 concurrent requests.
- Cold URL verification found no console errors on Home, Demo, Privacy, or
  Terms. Reports and screenshots are under `.factory/evidence/polish-3-live-*`.

## Deployment

The production site and managed API were deployed with:

```sh
/opt/fleet/lib/deploy-static.sh local-records-continuity dist/site
```

The existing `sf-local-records-continuity` app and
`local-records-continuity.sociobot.in` domain were reused. No unrelated
resource, secret, storage account, or service was read or changed.

## Known gaps and next steps

There are no unresolved acceptance findings. Release binaries are intentionally
not advertised; the tested source-install command remains the installation
path until the factory publishes binaries.
