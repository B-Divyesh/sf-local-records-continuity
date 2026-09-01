# Continuity Pack — repair 10 handoff

Date: 2026-09-01
Work order: `local-records-continuity-repair-10`
Verifier report: `5e2a7dcf97d8a7d031c8f5cacd32c42d0c20ad4a` / `.factory/verification-11.md`
Repaired release commit: `82e9b896a46c3cd319b9e73eb43e02eae5b07536`
Live: <https://local-records-continuity.sociobot.in>

## Release status: repaired and deployed

The only release blocker was reproduced before changing code. In a fresh
Chromium context, visiting `/demo/?demo=1`, waiting for an active controlling
service worker, setting the context offline, and reloading rendered the 404
heading rather than the sample preview.

The service worker now uses cache `continuity-pack-shell-v7`. When an offline
navigation is the landing action URL `/demo/?demo=1`, it resolves the demo-mode
query to the precached canonical `/demo/` shell before considering the 404
fallback. Other requests retain their prior exact cache lookup and route
handling. The managed API release identity is now
`local-records-continuity-repair-10`.

The exact regression is covered by `@claim:offline-guide` in
`site/tests/site.spec.ts`. It starts at `/demo/?demo=1` (not `/demo/`), waits
for service-worker control, goes offline, reloads, then asserts the sample H1,
offline banner, separate demo storage namespace, and cached Home guide. The
claim manifest names the same landing-action URL.

## Verification evidence

Local clean install and full gate:

```text
npm ci                                                        PASS (24 packages; 0 vulnerabilities)
npm test                                                      PASS
  rustfmt / clean-clone 16-claim runner / Rust / CLI / API /
  site browser suite                                          PASS
npm run typecheck                                             PASS
cargo clippy --workspace --all-targets -- -D warnings         PASS
npm run build                                                 PASS (release CLI and dist/site)
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
                                                               PASS
```

The packed crate was extracted and installed into a new temporary consumer
root with `cargo install --path … --locked`. The installed `continuity` binary
reported version `0.1.0`, returned helpful `--help`, and its
`--ci --json demo` result had `status: "sample-recovery-complete"` and
`verified: true`.

Browser and live verification:

```text
npx playwright test --grep '@claim:offline-guide'             PASS (desktop + 390px)
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in \
  npx playwright test --grep '@claim:offline-guide'           PASS (desktop + 390px)
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in \
  npx playwright test                                         PASS (42 tests)
npm run test:deployment:rate-limit                            PASS
```

The live 42-test suite covers the visible desktop and 390px mobile routes,
keyboard Arrow navigation and focus movement, target sizes, focus contrast,
axe serious/critical violations, console/page errors, same-origin privacy
requests, response policy, 404 handling, service-worker registration/update,
and the repair-10 managed API identity. The exact live offline probe passed
after deployment for both browser profiles.

The protected-download live probe returned exactly 20 `403` admitted requests
and 40 `429` requests for a 60-request burst. It confirmed the repair-10
identity, `RateLimit-Policy: 20;w=60`, shared-blob backend, and positive
`Retry-After` on every throttled response.

Lighthouse 12.8.2 mobile against the live Home page:

```text
Performance 100    Accessibility 100
LCP 1,546 ms       TBT 8.5 ms       CLS 0
```

The full report is `.factory/evidence/repair-10-lighthouse.json`.

## Deployment

Built `dist/site` was deployed with the factory static deployment configuration
to `sf-local-records-continuity`, including the managed API. After deployment,
the live `/sw.js` exposed `continuity-pack-shell-v7` and `/api/build` exposed
`local-records-continuity-repair-10`.

## How to verify again

```sh
npm ci
npm test
npm run typecheck
cargo clippy --workspace --all-targets -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in \
  npx playwright test --grep '@claim:offline-guide'
npm run test:deployment:rate-limit
```

## Known gaps / next steps

No release-blocking gaps are known. The project intentionally remains
source-installable until release binaries are published; this is stated in the
site and README and does not affect the repaired sample or CLI flows.
