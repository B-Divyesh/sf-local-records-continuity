# Independent verification 5 — FAIL

Date: 2026-08-30  
Work order: `local-records-continuity-verify-5`  
Candidate: `ecca9643971bc18e6037b886357855513a57f0c8`  
Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**FAIL — do not release.** The local recovery CLI works in the independently
exercised recovery path and the deployed static files are this candidate.
However, the candidate fails the mandatory first-read/demo and claims contracts,
and the live protected-download limiter does not enforce its documented
20-request single-client allowance under a production burst.

## Required first checks

The required claim test was run before installation or other QA work:

```text
npm run test:claim:protected-download-rate-limit                 PASS
```

`.factory/claims.json` exists and contains that one claim. Its local test made
the specified 60-request burst and passed. This does **not** make the release
acceptable: the live endpoint result below contradicts the stated 20-request
window, and many visitor-facing claims have no corresponding claim entry/test.

Cold first-read result at the live URL:

- It says it makes an encrypted recovery pack from invoices, exports, and
  records, so the broad job is understandable.
- It does not plainly say this is for small businesses using self-hosted or
  local admin software.
- Its first action is **“Build your first pack”**, which only jumps to source
  installation. There is no **“Try it with sample data”** action.
- `continuity --demo` exits 2 (`unexpected argument '--demo'`), and
  `continuity demo` exits 2 (`unrecognized subcommand 'demo'`). `/demo` returns
  the normal landing page with no demo banner, Reset demo, Start for real, or
  sample-data sandbox. `.factory/demo.md`, `examples/`, and a CLI demo command
  are absent.

The work order explicitly makes either the missing plain first read or missing
one-click sample demo a candidate failure. This candidate has both.

## Release-blocking defects

### P0 — no required isolated, one-click CLI demo; first screen fails the plain-words test

See the first-read evidence above. A recorded terminal transcript is not the
required CLI demo: it has no shipped sample, no temporary output path, no
`--demo`/`demo` command, and no isolated storage namespace. Add the required
demo command and shipped sample input, document it in `.factory/demo.md`, and
put a visible first-screen **Try it with sample data** action beside a plain
audience-specific sentence.

### P0 — claims inventory is materially incomplete

The sole listed claim is the protected-download burst. The live landing page
and README make additional testable claims without entries/tests, including:

- “No account. No upload. No backup subscription.”
- the page's offline-field-guide assertion;
- authenticated XChaCha20-Poly1305 + Argon2id encryption;
- local/mounted-drive-only targets;
- “The CLI’s complete safety path stays free”; and
- the CLI/README’s no-telemetry and explicit-target-only privacy assertions.

The claims contract requires every visitor-reliance claim to be listed and
tested from the demo entry point. Add observable tests for each retained claim
(including request logging for privacy/offline behavior), or remove the claim.

### P1 — deployed protected-download limiter permits more than its documented allowance

The live endpoint advertises `RateLimit-Policy: 20;w=60`. After two preliminary
anonymous denials, a fresh **60 concurrent POST** burst from this one verifier
client to:

```text
/api/plus-download?asset=multi-location-config.toml
```

produced **35 × 403** (license denial, therefore admitted) and only **25 ×
429**. The first 429 carried `Retry-After: 45` and the policy header. A
20-request allowance should have admitted at most 20 in the window (and, after
the two preliminary calls, at most 18); it instead admitted at least 35.

This shows the lock-protected `/tmp` state is not a globally shared limiter
across production function workers/instances. The local claim test passes but
does not reproduce that deployment boundary. Use a genuinely shared/edge
per-client limiter and add a deployment integration test that proves only the
documented allowance reaches license verification.

### P1 — deployed responses lack Content-Security-Policy / frame-ancestors

`HEAD /`, `/privacy/`, `/terms/`, `/sw.js`, and a hashed asset all lack a
`Content-Security-Policy` header. The checked-in `staticwebapp.config.json`
only supplies nosniff, referrer policy, and permissions policy. The site
structure contract requires a CSP that matches loaded resources and sends
`frame-ancestors` as a response header. Add and verify it in the deployed
response policy.

### P1 — no real 404 route

`GET /not-a-real-route` returns 200 with the normal landing page and its hero
H1, rather than a designed 404 with a way back. Add the required 404 document
and Static Web Apps response override.

## Passing local checks

Fresh install and repository checks:

```text
npm ci                                                        PASS (0 vulnerabilities)
npm run test:claim:protected-download-rate-limit             PASS
npm test                                                      PASS
npm run typecheck                                             PASS
npm run build                                                 PASS; creates dist/site/
cargo fmt --all -- --check                                    PASS
cargo clippy --workspace --all-targets -- -D warnings         PASS
npm audit --audit-level=high                                  PASS (0 vulnerabilities)
cargo package --manifest-path crates/continuity/Cargo.toml
  --allow-dirty                                               PASS
```

`npm test` covered 6 Rust library tests, 2 binary tests, 5 CLI integration
tests, 1 doctest, 9 API tests, and 24 Playwright project tests (one
desktop-only duplicate static check is skipped). The exact production build
completed and produced `dist/site/`.

### Independent CLI/product exercise

Using a temporary `Maple Street Books` fixture with two CSV exports and a nested
supporting document, the release binary performed:

```text
continuity --ci --json pack --config continuity.toml --target <explicit-dir>
continuity --ci --json check --target <explicit-dir> --max-age-hours 1
continuity --ci --json verify <pack.cpack>
continuity --ci --json restore <pack.cpack> --output <empty-dir>
```

Pack reported `file_count:3`, `verified:true`, created a `.cpack`, readable
manifest, and receipt, and restored all three source files. Invalid/recovery
paths behaved correctly: wrong passphrase exited 4; absent passphrase, target,
or required source exited 3; the normal unavailable-target scheduled check
wrote an actionable stderr error and did not create the target.

`cargo package` verified the crate. A clean temporary consumer installation
with `cargo install --path crates/continuity --root <temp> --locked` installed
and ran `continuity 0.1.0`.

## Live deployment and browser evidence

The live static deployment matches a fresh build of this candidate byte for
byte:

| File | SHA-256 match |
| --- | --- |
| `index.html` | yes — `82eeac9aa08b1c5dcfa3fdb561a68918d26192611af8ceadf795924b00dc5282` |
| `privacy/index.html` | yes — `e003897c83a89355db09f3964352ed2f77ec9c6cc62f94b220c35de2b254573f` |
| `terms/index.html` | yes — `909885ec0ee8a64ff7b3b96237fdb55e8d71a7927e33e8ead8d98ce84c9c8e98` |
| `assets/home-CRa51SFh.js` | yes — `b0ba011c50cde572c24425a02f68f9f5ea9b94545e7111a114673fd08c059fd4` |
| `assets/style-Cqz0S6qS.css` | yes — `7204947e8a5ed39bf9e88cc8947e752f88cfd8ac8654993302228eac5d96fb9c` |

The following non-blocking checks passed on live production:

- Home, Privacy, and Terms return 200 with their route-specific titles,
  `lang=en`, one H1, and one main landmark. There were no browser console or
  page errors.
- Playwright Axe found zero serious/critical violations on all three pages.
  At 390×844 there was no horizontal overflow; the first Tab reached the skip
  link with a visible 3px focus outline. Tab navigation and the demo tabs'
  arrow-key behavior work. Reduced-motion computed animation duration is
  `0.00001s` and smooth scrolling is disabled.
- A fresh browser context made only same-origin requests on the normal landing
  flow: document, two local JS assets, local CSS, and the original local WebP.
  No analytics, third-party font/script, or outbound record-data request was
  observed. Optional billing calls are explicit user actions.
- The PWA service worker controls a fresh page, `registration.update()` leaves
  the current `/sw.js` active with no waiting worker, cache
  `continuity-pack-shell-v2` exists, and an offline reload preserved the H1 and
  showed the offline strip.
- Performance budgets pass by emitted size: initial JS is about 4 KB gzip
  (3.01 KB home + 0.40 KB shared), CSS 3.80 KB gzip, fonts 0, and hero WebP
  146,138 bytes. Hashed JS/CSS and WebP are one-year immutable; `sw.js` is
  `no-cache, no-store, must-revalidate`. HSTS, nosniff, strict-origin referrer
  policy, and camera/microphone/geolocation Permissions-Policy are present.

No real payment or valid production license was used. The invalid anonymous
paid-file path correctly returned 403 without paid content; the production rate
burst above was deliberately anonymous.

## Required re-verification

1. Implement the required one-click sample CLI demo and first-screen copy;
   add `.factory/demo.md` and claim tests that run only through it.
2. Complete `.factory/claims.json` for every retained user-facing promise,
   particularly privacy and offline promises.
3. Replace the per-instance temporary-file limiter with a deployment-wide
   20-per-60-second client limit; prove the live 60-request burst admits no
   more than 20 and sends 429 plus `Retry-After` thereafter.
4. Add deployed CSP/frame-ancestors and a real 404 route, then rerun the full
   browser/header test set.
