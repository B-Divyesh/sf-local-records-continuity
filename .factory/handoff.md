# Continuity Pack — polish round 1 handoff

Date: 2026-08-30

Work order: `local-records-continuity-polish-1`

Deployed code commit: `79a9284`

Live: <https://local-records-continuity.sociobot.in>
Demo: <https://local-records-continuity.sociobot.in/demo/?demo=1>

## Outcome

All 28 findings in `.factory/review-1.md` are fixed and mapped in
`.factory/polish-1.md`. No earlier review or polish file exists. The
topographic-cartography identity, Rust CLI artifact class, and static Vite site
remain intact.

The desktop first action and facts fit at every tested short-desktop size. The
phone demo shows real sample output on its first screen. `?demo=1` enters an
isolated sample route; Reset demo and Start for real remove only `demo:*` data.
Routes now have correct metadata and H1 focus restoration. Copy and README
claims are either tested or removed.

The live concurrency audit found one additional rate-limit defect. A paid
client moving across network addresses could receive more than 20 admissions.
The deployed fix uses the hashed license as the stable paid-client identity and
a hashed address for anonymous traffic. The final live result is exactly 20
handled requests and 40 throttled requests.

## Verification

Run from a clean clone:

```sh
npm ci
npm test
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
```

Each of the 16 `test` commands in `.factory/claims.json` was also executed
individually from a clean clone. All passed.

Final results:

- Rust: 6 library, 2 binary, 7 CLI integration, and 1 doctest passed.
- CLI claims: 9 passed.
- Managed API: 10 passed.
- Local browser: 36 passed; 6 deployment-only/project-scope cases skipped.
- Live browser: all 40 applicable cases passed; 2 project-scope cases skipped.
  One Chromium process crashed during the final combined run. Its exact case
  passed immediately in an isolated rerun; this was a runner failure, not a
  page assertion failure.
- Production rate limit: 60 concurrent requests produced 20 `403` and 40
  `429`, with `Retry-After`.
- `npm run build`: passed; produced `dist/site/index.html` and
  `target/release/continuity`.
- `cargo package`: passed; 12 files, 111.9 KiB unpacked and 29.0 KiB
  compressed.
- Initial assets: home JS 6.90 KB, shared JS 2.71 KB, CSS 16.61 KB
  uncompressed.
- Lighthouse 12.8.2: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO.
- Factory URL verifier: Home and Demo each have title, `lang=en`, one H1,
  main landmark, labeled controls, complete image alt text, and zero console
  errors.

Evidence:

- `.factory/evidence/home-1440x844.png`
- `.factory/evidence/demo-390x844.png`
- `.factory/evidence/lighthouse-summary.json`
- `.factory/evidence/live-home/verify.json`
- `.factory/evidence/live-demo/verify.json`

## Deployment

Built with `npm run build`. Deployed `dist/site` and `api` only to the
existing `sf-local-records-continuity` Static Web App. No DNS, billing, shared
service, or unrelated resource was read or changed.

Cold production checks:

- `/`, `/demo/?demo=1`, `/privacy/`, and `/terms/`: HTTP 200.
- Unknown route: HTTP 404 with designed page and share metadata.
- `/api/build`: `local-records-continuity-polish-1`.
- Full live Playwright and URL-verifier checks: pass.

## Known gaps

None.

Release binaries are intentionally not advertised because none are published.
The crate is package-verified but was not published, per factory policy.
