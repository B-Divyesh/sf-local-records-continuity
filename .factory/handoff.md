# Continuity Pack verification handoff — FAIL

- Date: 2026-08-28
- Work order: `local-records-continuity-verify-3`
- Tested candidate: `5b234b209f80c00b670a081b425da35173952254`
- Live URL: <https://local-records-continuity.sociobot.in>
- Artifact: Rust CLI/library + static PWA site

## Result

**FAIL — do not release.** Fresh independent evidence found three P1 defects:

1. `continuity check` can select an older pack by business-name sort order and
   exit 0 while the genuinely newest pack is corrupt. This is a false-green in
   the brief's core scheduled-verification job.
2. All three `$39` Plus files are publicly retrievable from `/plus/*` without a
   license; hiding their links does not enforce the paid unlock.
3. The production product is still absent from the Sociobot registry and its
   checkout returns 404, so Plus cannot be purchased. The repaired page avoids
   that dead navigation and gives an honest unavailable message, but the paid
   flow is not end to end.

One P2 remains: the Plus and footer Terms links compute to `40×44` and `37×44`
CSS px, below the required 44×44 target.

Full reproduction details and all evidence are in
[verification-3.md](verification-3.md).

## What passed

The candidate was tested from a separate clean checkout. These commands passed:

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
```

The normal CLI path packed representative exports, authenticated the explicit
target copy, wrote a readable manifest/receipt, checked it, restored it, and
matched every file byte-for-byte. Invalid configuration, wrong credentials,
corruption, missing sources/targets, freshness, schedule-time boundaries,
symlinks, non-empty restore destinations, 32 MiB input, passphrase precedence,
and two-process concurrent packing were exercised. A clean consumer compiled
the public Rust API and installed the packaged CLI; the website's
`cargo install --git ... continuity-pack --locked` command, with only an
isolated `--root` destination appended, installed candidate `5b234b20` and
reported version 0.1.0.

The live deployment matches the candidate: local and live root HTML SHA-256 are
both `f08ef17fd5024bc8f29a8bd40e5a71114b9f9929ffb42c6d2f97f450829b5aa4`,
and all other sampled application assets matched. Desktop and 390px browser
checks had no console/page/request errors, no overflow, and zero serious or
critical Axe findings. Keyboard focus, arrow-key tabs, reduced motion, token
stripping, response policies, service-worker update, and offline reload passed.
Initial load contacted only the product origin.

Fresh Lighthouse mobile scores were Performance 99, Accessibility 100, Best
Practices 100, and SEO 100 (FCP 1.1 s, LCP 1.6 s, TBT 90 ms, CLS 0). Built
payloads were 7,129 bytes total JS, 12,645 bytes CSS, no fonts, and a 146,138
byte hero WebP.

## Required next steps

1. Select the newest pack chronologically, then verify that exact pack; add a
   regression where a newer differently prefixed pack is corrupt.
2. Move Plus delivery behind a license-aware endpoint or equivalent protected
   mechanism; prove all direct unauthenticated asset requests are denied.
3. Register and enable the live `$39` product, then test checkout, return-token
   verification, and authorized downloads end to end.
4. Increase both Terms hit areas to at least 44×44 CSS px and rerun the full
   clean-checkout and live suites.

## Deliberate test limits

No registry/payment configuration, keychain entries, crontab, product code, or
deployment state was changed. Linux keychain status was read-only; actual
macOS/Windows keychain paths and a real paid transaction require platform/
factory credentials and remain unverified.
