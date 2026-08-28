# Independent verification 3 — FAIL

Date: 2026-08-28  
Work order: `local-records-continuity-verify-3`  
Candidate: `5b234b209f80c00b670a081b425da35173952254` (`5b234b2`)  
Live URL: <https://local-records-continuity.sociobot.in>

## Verdict

**FAIL — do not release this candidate.** The ordinary single-configuration
pack/verify/restore path is usable and the deployed site matches the candidate,
but scheduled verification can silently verify the wrong pack and return exit
0 while the genuinely newest pack is corrupt. The paid tier is also not a
working license unlock: it cannot currently be bought, and all three paid files
are publicly downloadable without a license.

The checkout guard introduced after verification 2 is a real improvement: the
site now explains that purchases are unavailable and does not navigate to the
known 404. It does not make the paid flow complete, and it does not address the
newly found CLI false-green.

## Defects

### P1 — scheduled `check` can return success for an older pack while the newest pack is corrupt

`check_target` sorts complete `.cpack` filenames and selects the last one. A
filename begins with the business slug, so this is not chronological when a
target contains packs from different configurations or after a business-name
change.

Fresh reproduction with one target and one passphrase:

1. Packed `Zulu Older Business` at `05:34:00.595Z`.
2. Packed `Alpha Newer Business` at `05:34:01.737Z`.
3. Truncated the newer Alpha pack by one byte.
4. `continuity --ci --json check --target mixed-target --max-age-hours 26`
   selected `zulu-older-business-...cpack`, reported authenticated/matching,
   and exited **0**.
5. Directly verifying `alpha-newer-business-...cpack` reported
   `encrypted pack does not match its receipt` and exited **4**.

This violates both the command's promise to verify the newest target pack and
the brief's requirement that scheduled verification fail loudly within one run.
An unattended owner can receive a false green while their latest recovery pack
is unreadable. Select by trustworthy creation metadata (with a defined policy
for malformed candidates), then verify that exact newest pack. Add a regression
test covering differently prefixed packs and a corrupt newest pack.

### P1 — the advertised paid files bypass the license lock

With no license or authentication, fresh requests returned HTTP 200 and the
complete content for every Plus file:

| URL | Type | Bytes |
| --- | --- | ---: |
| `/plus/multi-location-config.toml` | `application/octet-stream` | 611 |
| `/plus/quarterly-restore-drill.md` | `application/octet-stream` | 550 |
| `/plus/team-handoff-checklist.md` | `application/octet-stream` | 551 |

The UI only hides predictable links; the files are copied into `dist/site/plus`
and served publicly. This contradicts the requirement to lock paid features
when a license is absent or invalid. Paid downloads need an authorization-aware
delivery mechanism (or equivalent cryptographic packaging), not client-side
visibility alone.

### P1 — production purchase remains unavailable

Fresh production evidence:

- `GET https://api.sociobot.in/api/v1/products` returned HTTP 200 in live mode,
  but contained no `local-records-continuity` entry.
- `GET .../products/local-records-continuity/checkout` returned HTTP 404 with
  `{"error":"enabled factory product","status":404}`.
- Activating **Buy Continuity Plus** on desktop and 390px mobile made only the
  registry request, stayed on the product page, and announced that purchases
  are not available. It did not request the dead checkout.
- Invalid-token verification returned HTTP 200 with
  `{"valid":false,"reason":"invalid","expires_at":null}`.

The degradation is honest and preserves the free CLI, but the acceptance
contract describes a `$39` one-time purchase and an end-to-end license unlock.
Factory registration/enabling is still required before that path exists.

### P2 — two Terms links miss the specified 44×44 CSS pixel target

Computed hit areas on both desktop and 390px were `40×44` for the Plus Terms
link and `37×44` for the footer Terms link. All other visible links, buttons,
and inputs met the 44px check. This misses the attached product accessibility
baseline even though Axe does not classify it as serious/critical.

## Clean-checkout quality gates

Verification ran in a separate fresh clone detached at the candidate commit.
The checkout was clean before installation and remained clean after QA.

All available gates passed:

```text
npm ci                                                        PASS (0 vulnerabilities)
cargo fmt --all -- --check                                    PASS
cargo clippy --workspace --all-targets -- -D warnings         PASS
npm run typecheck                                             PASS
cargo test --workspace                                        PASS
npm test                                                      PASS
npm run build                                                 PASS
npm audit --audit-level=high                                  PASS
cargo package --manifest-path crates/continuity/Cargo.toml
  --allow-dirty                                               PASS
```

- Rust: 4 library tests, 2 binary tests, 4 CLI integration tests, and 1
  doctest passed.
- Browser suite: 17 passed and 1 deliberate duplicate-contract test was
  skipped across desktop Chromium and the 390×844 project.
- Exact production build emitted `target/release/continuity` (2,511,352 bytes)
  and `dist/site/`.
- Cargo packaged 8 files: 98.2 KiB unpacked and 26,323 bytes compressed.

## CLI, package, and public API evidence

The main acceptance fixture contained invoice/customer CSVs (including zero,
large decimal, quotes, comma, and Unicode values), a nested directory, two
zero-byte files, and one absent optional record source. An explicit target path
contained spaces.

- `pack --ci --json` created the encrypted pack, readable manifest, and JSON
  receipt; it reported 4 files, 151 source bytes, and `verified:true`.
- `verify` and `check --max-age-hours 26` succeeded for the ordinary target.
- `restore` into a new directory succeeded, and all four restored files matched
  byte-for-byte. The restore report clearly says this is not a full application
  restore test.
- A 32 MiB source fixture packed and verified successfully.
- Two simultaneous pack processes both exited 0 and produced two complete,
  distinct three-file result sets. No partial files remained.
- Same-input packs had distinct authenticated ciphertext. `strings` found none
  of the fixture business/customer/invoice/passphrase text in the `.cpack`.
- Passphrase-file precedence over a conflicting environment value worked.
- Wrong passphrase and corrupt pack returned 4; short passphrase, unsafe label,
  unknown config field, existing init target, and non-empty restore directory
  returned 2; absent config/source/target/passphrase returned 3; an empty
  existing target and zero-hour stale boundary returned 4. Source symlinks were
  rejected, and a missing target was not created.
- Schedule previews accepted `00:00` and `23:59`, correctly quoted the target
  containing spaces, included `--ci check`, and described non-zero failure.
  `24:00` returned 2. A direct unavailable-target scheduled check returned 3.
- Linux `key status --json` safely returned `available:false`; keychain writes
  and real crontab installation were intentionally not mutated on this host.

The packaged crate was unpacked into a separate clean consumer. A new Rust
consumer compiled and exercised `Config`, `RecordSource`, `Config::from_path`,
and `Error::exit_code`. `cargo install --path ... --root ... --locked` installed
the packaged binary, whose help exposed the documented commands, global JSON/CI
flags, and exit-code guide. The public website command also succeeded with only
an isolated `--root` destination appended for QA:

```text
cargo install --git https://github.com/B-Divyesh/sf-local-records-continuity continuity-pack --locked
```

Cargo reported source `#5b234b20`; the installed binary reported
`continuity 0.1.0`.

## Live identity, browser, privacy, and policy evidence

The locally built and live root HTML SHA-256 were both
`f08ef17fd5024bc8f29a8bd40e5a71114b9f9929ffb42c6d2f97f450829b5aa4`.
Hashes also matched for privacy/terms HTML, all three referenced CSS/JS chunks,
hero WebP, mark SVG, service worker, web manifest, robots, and sitemap. The live
deployment is this candidate, not stale content.

- Factory `verify-url.sh`: HTTP 200; 577 ms network-idle load; title, `lang=en`,
  one h1, main landmark, image alt, and button labels present; no console errors.
- Fresh live desktop 1440×900 and mobile 390×844: no horizontal overflow,
  console errors, page errors, or failed requests. Visual inspection found the
  documented topographic layout intact on both sizes.
- Initial load contacted only the product origin. The explicit Buy action made
  only the disclosed Sociobot product-registry request. An invalid returned
  token was stored, removed from the URL, verified only with the production
  Sociobot endpoint, kept downloads locked, and did not block free content.
- Source/dependency scan found no Rust networking stack, analytics, telemetry,
  CDN font, or third-party runtime script. The CLI's pack/check paths have no
  network client.
- First Tab focused **Skip to main content** with an ochre solid 3px outline.
  ArrowRight selected the Verify demo tab. At 200% root text size on 390px,
  document width remained 390px with no horizontal overflow.
- Axe serious/critical findings: **0** on home, privacy, and terms. Axe reports
  one moderate home advisory, `landmark-complementary-is-top-level`, for the
  nested limitation aside.
- Reduced-motion matched and computed hero animation/button transition duration
  was `0.00001s`.
- The live service worker controlled the root scope; `registration.update()`
  completed. An offline 390px reload retained the h1 and displayed the offline
  status strip.
- Live cache policy: hashed JS/CSS, hero WebP, and mark SVG are immutable for
  one year; `sw.js` is `no-cache, no-store, must-revalidate`; the web manifest
  is `application/manifest+json` with one-hour caching. Sampled responses carry
  HSTS, `nosniff`, strict-origin referrer policy, and the camera/microphone/
  geolocation Permissions-Policy.
- Production Sociobot CORS allowed the exact product origin for registry and
  verification requests; verification is `no-store`.

## Budgets and Lighthouse

- All built JS: 7,129 bytes (home load uses the 5,893-byte home chunk and
  711-byte shared chunk); CSS: 12,645 bytes; fonts: 0 bytes; hero WebP: 146,138
  bytes. All static budgets pass.
- Fresh Lighthouse 12.8.2 mobile: Performance **99**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP 1.1 s, LCP 1.6 s, TBT 90 ms,
  CLS 0, Speed Index 1.1 s. INP had no interaction sample.

## Re-verification requirements

1. Correct newest-pack selection and add the false-green regression described
   above.
2. Protect paid assets with real license-aware delivery and prove unauthenticated
   direct URLs cannot retrieve them.
3. Register/enable the production product, then prove checkout redirects to the
   hosted payment route and a real/test-complete license can retrieve the paid
   files.
4. Expand the two undersized Terms targets to at least 44×44 CSS px.
