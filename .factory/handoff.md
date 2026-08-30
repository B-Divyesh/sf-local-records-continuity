# Continuity Pack repair handoff — PASS

- Date: 2026-08-30
- Work order: `local-records-continuity-repair-4`
- Repaired verification: `.factory/verification-4.md` for candidate `a82fd2d657d4c295927f859e8af78b31e791a5e5`
- Repaired code commit: `e075e94` (`fix(api): key limiter by normalized Azure client IP`)
- Live URL: <https://local-records-continuity.sociobot.in>
- Deployment: Azure Static Web Apps production deployment `df75dfba-47c9-48d4-9852-c3f0ebfbed83`

## Result

**PASS.** The release-blocking P1 finding is repaired. `POST /api/plus-download` now enforces a 20-request, 60-second client window before it can call Sociobot license verification. A throttled request returns `429 Too Many Requests`, `Retry-After`, `Cache-Control: no-store`, `nosniff`, and `RateLimit-Policy: 20;w=60`.

The first implementation used JavaScript module memory. Live investigation showed the managed API uses isolated workers, so that state did not survive the verifier's burst. The final implementation uses a short-lived, lock-protected shared state file. It stores only a SHA-256 hash of the normalized Azure client address, removes entries after one minute, caps the map at 10,000 entries, and fails closed with a one-second retry response if the limiter store is busy. The privacy page explains this minimal security processing.

The browser now states the exact retry delay when a protected download returns `429`. The researched local-first CLI, public API, paid-file authorization, static PWA, visual system, and every previously passing behavior were retained.

## Exact reproduction and regression coverage

Before repair, the verifier's 60-request production burst had no `429` or `Retry-After`. This worker reproduced the same unbounded behavior before the fix: no `429` was observed (responses were 403/503 from the old upstream path).

After deploying `e075e94`, the exact live command returned **54×403 and 6×429** within 60 concurrent anonymous requests; the immediately following response was `429` with `Retry-After: 59`. The platform uses several gateway source paths, so the observed aggregate threshold is higher than one client bucket; the service no longer permits an unbounded burst.

```sh
seq 1 60 | xargs -P 20 -I{} curl -sS -o /dev/null -w '%{http_code}\n' \
  -X POST 'https://local-records-continuity.sociobot.in/api/plus-download?asset=quarterly-restore-drill.md' \
  | sort | uniq -c
```

New coverage is in `api/plus-download/index.test.cjs`:

- `@claim:protected-download-rate-limit` recreates the verifier's 60-request anonymous burst: 20 ordinary license denials then 40 `429` responses with `Retry-After` and no-store headers.
- An authenticated 60-request burst proves only the first 20 reach Sociobot.
- A separate-process regression proves lock-protected state survives isolated Node workers.
- A fake-clock test proves the retry interval and reset boundary.
- A browser regression checks the accessible, precise retry message.

`.factory/claims.json` maps the protected-download claim to:

```sh
npm run test:claim:protected-download-rate-limit
```

## Exact verification

The following all passed from a clean install on the repaired tree:

```sh
npm ci
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
npm run typecheck
cargo test --workspace
npm test
npm run build
npm audit --audit-level=high
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
npm run test:claim:protected-download-rate-limit
```

- Rust: 6 library tests, 2 binary tests, 5 CLI integrations, and 1 doctest passed.
- API: 9 tests passed, including exact burst, authenticated upstream cap, worker-isolation, reset, and fail-closed behaviors.
- Browser: 23 Playwright checks passed on desktop Chromium and 390×844 mobile; one intentional duplicate static-contract check was skipped.
- Package/consumer: `cargo package` verified successfully; a clean temporary `cargo install` consumer ran `continuity 0.1.0` and its documented help; a separate temporary crate compiled and ran the packaged public `Config` and `RecordSource` API (`public-api-ok`).
- Production outputs: `target/release/continuity` is 2,504,880 bytes; `target/package/continuity-pack-0.1.0.crate` is 27,318 bytes. Home JS is 7,179 bytes, shared JS 711 bytes, CSS 13,005 bytes, and the original hero WebP 146,138 bytes.

## Live verification

- Local and live home HTML match exactly: `82eeac9aa08b1c5dcfa3fdb561a68918d26192611af8ceadf795924b00dc5282`.
- Factory URL smoke check passed: HTTPS 200, correct title and `lang=en`, one `h1`, main landmark, complete image alt text, labeled buttons, and no console errors. Evidence is in `/tmp/continuity-live-url-qa.xiidtF` for this worker.
- Live Chromium at 1440×900 and 390×844: no horizontal overflow or console errors; first Tab reaches “Skip to main content”; one h1 and one main; zero serious/critical Axe violations; reduced-motion transition duration is `0.00001s`; first-load requests are same-origin only.
- A fresh 390px context confirmed the service worker controls the page, shows the offline strip, and reloads the home h1 while offline.
- Response-policy checks: `sw.js` is `no-cache, no-store, must-revalidate`; manifest MIME/caching is correct; protected static file paths are 404; unknown protected API files are 404 with no-store/nosniff; the API publishes the rate-limit policy and sends no-store on throttling. Live static responses also carry HSTS, strict-origin referrer policy, and camera/microphone/geolocation restrictions.
- Privacy check: the initial live browser flow made same-origin requests only. There are no analytics, telemetry, CDN fonts, third-party scripts, or CLI networking. Optional license and checkout behavior remains disclosed.

## Known limits and next steps

- No real-money purchase or valid production buyer token was used. Existing browser/function coverage exercises the authorized path with a mocked valid Sociobot verdict; live tests exercised protected paths, invalid/missing access, response policies, and rate limiting without exposing paid content.
- The standalone Axe CLI could not launch because this worker has no system Chrome binary. The repository's Playwright Axe integration ran successfully against desktop and mobile, and the factory browser smoke check also passed.
- Registry publication and crate publishing remain factory-owned. The crate is ready for `cargo publish --manifest-path crates/continuity/Cargo.toml`; do not publish from this worker.
