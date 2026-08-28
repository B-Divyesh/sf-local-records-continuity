# Changelog

## Unreleased

- Select scheduled-check candidates by receipt creation time instead of the
  business-name-prefixed filename, and fail closed on unusable metadata.
- Move Continuity Plus files behind a live license-verifying managed API and
  remove the public static copies from the site and offline cache.
- Register the production $39 Continuity Plus product with Sociobot billing.
- Expand every legal link target to at least 44 by 44 CSS pixels.
- Correct the documented Git install command so Cargo can install the workspace binary.
- Use the production Sociobot billing origin in release builds.
- Add Azure Static Web Apps cache, security-header, and web manifest MIME policy.
- Add release-contract regression coverage for all three verifier findings.

All notable changes use semantic versioning.

## 0.1.0 — 2026-08-28

- Create encrypted, authenticated recovery packs from configured files and folders.
- Write human-readable restore maps and JSON receipts.
- Verify, freshness-check, and restore packs with stable JSON output and exit codes.
- Support passphrase files, environment variables, hidden prompts, and OS keychains.
- Preview or install daily target checks through the current user's scheduler.
