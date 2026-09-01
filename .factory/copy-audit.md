# Copy audit — polish round 2

Date: 2026-09-01

Method: every sentence in `site/index.html` was read aloud and counted. Hyphenated
terms and numbers count as one word. Executable commands are excluded. Runtime
status and error messages were also checked for the 22-word cap and banned words.

## Landing-page sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 2 | You’re offline. | Pass |
| 4 | The guide still works. | Pass |
| 7 | License checks resume when your connection returns. | Pass |
| 8 | Build a recovery pack for local business records. | Pass |
| 19 | For small businesses using self-hosted or local admin software, it turns exports into a recovery pack you can test. | Pass |
| 9 | See the bookshop sample and its temporary-folder demo command. | Pass |
| 8 | Records stay on your computer or named drive. | Pass |
| 8 | The guide works offline after your first visit. | Pass |
| 5 | The core CLI is free. | Pass |
| 4 | Plus costs $39 once. | Pass |
| 6 | Know which records you can recover. | Pass |
| 12 | Continuity Pack writes an encrypted pack, a readable manifest, and a receipt. | Pass |
| 10 | The manifest lists the business, source files, and verification command. | Pass |
| 9 | Verification proves the pack decrypts and its files match. | Pass |
| 11 | It does not replace a periodic test import into your application. | Pass |
| 6 | Build, verify, and restore the pack. | Pass |
| 7 | Name the files and folders that matter. | Pass |
| 8 | Required sources fail the run if they disappear. | Pass |
| 5 | Each file gets a SHA-256. | Pass |
| 9 | The complete pack is compressed and authenticated with XChaCha20-Poly1305. | Pass |
| 11 | A scheduled check decrypts the pack and compares every file hash. | Pass |
| 12 | A failed check returns a non-zero exit code and names the problem. | Pass |
| 5 | Read the sample recovery result. | Pass |
| 7 | The bundled bookshop sample shows each result. | Pass |
| 4 | Use `--json` for scripts. | Pass |
| 6 | Pack written and target copy verified. | Pass |
| 5 | Build your first recovery pack. | Pass |
| 3 | Build from source. | Pass |
| 6 | Release binaries are not available yet. | Pass |
| 7 | Pack, check, verify, and restore are free. | Pass |
| 12 | Plus provides a multi-location configuration workbook, restore-drill worksheet, and staff handoff guide. | Pass |
| 9 | Sociobot/Dodo is the merchant of record and handles refunds. | Pass |
| 3 | No license stored. | Pass |
| 6 | The free CLI remains fully available. | Pass |
| 6 | CLI for tested local business-record recovery. | Pass |
| 5 | Built by Param Factory · v0.1.0. | Pass |

No sentence exceeds 22 words. No sentence contains a banned marketing word.
The headline has eight words. The audience sentence has nineteen words. Read
aloud together, the headline, audience, and sample action state the job and the
first step in one breath.

## Interface and runtime copy

Headings, navigation labels, buttons, field labels, status labels, figure
captions, feature values, and runtime messages use direct nouns and verbs. The
first action is **Try it with sample data**. The three copy actions name their
result. The demo stage is **Check** everywhere. Error messages state what
happened and what to do next. No runtime sentence exceeds 22 words.

The README was checked with the same rules. Its former 23–37 word sentences are
split. Unsupported release, minimum-Rust, single-binary, scheduler-install,
automatic-refund, cross-platform keychain, and internal deployment assertions
are absent. The retained build and deployment instructions are direct and
contain no internal infrastructure jargon.

## Terminology

| Concept | One term used |
| --- | --- |
| Encrypted recovery artifact | pack |
| Destination filesystem location | target |
| Human-readable companion file | manifest |
| Automated non-extracting verification | check |
| Verification of a named pack | verify |
| Full file extraction | restore |
| Optional paid materials | Plus field kit |
| Isolated bundled example | demo |
| Business input file or folder | source |
