# Continuity Pack handoff — verification 12

## Release status: PASS

Candidate `0fdb29af6514fe8574f5a37447b6828455705537` is accepted for
`https://local-records-continuity.sociobot.in`. The live HTML and main static
assets match the candidate's fresh production build. No product code changed
in this verification.

## What was verified

- All 16 entries in `.factory/claims.json` passed using their exact commands
  and the shipped sample/demo entry points.
- `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, strict Clippy,
  and `cargo package` passed.
- The packaged crate installed in a clean temporary consumer root; its public
  help and `continuity --ci --json demo` worked, returning three restored and
  verified sample records.
- The live 42-check browser suite passed on desktop and 390 px, including the
  direct `/demo/?demo=1` offline reload, keyboard/focus, axe, console/page
  errors, privacy request log, service-worker update, headers, 404, and legal
  routes.
- Fresh live mobile Lighthouse measured Performance 100, Accessibility 100,
  LCP 1,593 ms, TBT 35.5 ms, and CLS 0.
- The deployed protected-download allowance was observed as 20 requests per
  client in 60 seconds; a 60-request burst yielded 20 `403` admissions and 40
  `429` responses with positive `Retry-After` headers.

## How to verify again

```sh
npm ci
npm test
npm run typecheck
cargo clippy --workspace --all-targets -- -D warnings
npm run build
cargo package --manifest-path crates/continuity/Cargo.toml --allow-dirty
PLAYWRIGHT_BASE_URL=https://local-records-continuity.sociobot.in npx playwright test
npm run test:deployment:rate-limit
```

For the CLI sample after a build, run:

```sh
target/release/continuity --ci --json demo
```

## Known gaps / next steps

No release-blocking gaps found. Release binaries remain intentionally
source-installable only, as stated in the product documentation.

See `.factory/verification-12.md` for exact evidence.
