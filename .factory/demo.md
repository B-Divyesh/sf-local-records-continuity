# Continuity Pack demo

## Entry points

- CLI: `continuity demo` or `continuity --demo`
- JSON: `continuity --json demo`
- Browser preview: <https://local-records-continuity.sociobot.in/demo/?demo=1>
- Root shortcut: <https://local-records-continuity.sociobot.in/?demo=1>

The home page links to the browser preview with **Try it with sample data**.
The preview names the real CLI command and shows the same three stages.

## Bundled sample

`examples/maple-street-books/` contains three fictional business files:

- three invoice rows;
- three customer rows; and
- one business-records insurance renewal note.

The packaged CLI embeds the same files from
`crates/continuity/examples/maple-street-books/`, so the demo works after a
normal installation without the repository.

## Isolation and reset

Every CLI run creates a unique `continuity-demo-*` directory under the
operating system temporary directory. The demo writes its configuration,
target, encrypted pack, manifest, receipt, restored files, and restore report
only inside that directory. It never reads the caller's records or uses the
normal configuration. The output prints the exact workspace path. Delete that
directory to reset or discard the run; the next command creates a new one.

The browser preview does not read or write IndexedDB, OPFS, or any real-data
storage key. It uses only `demo:*` session keys for its offline indicator and
temporary demo state. The root shortcut redirects before license code runs.
After the first visit, the preview and Home guide can reload offline. **Reset
demo** removes every `demo:*` key and returns the transcript to Pack. **Start
for real** removes demo state and opens the installation guide. The browser
preview is a recording. The CLI command performs the real pack, newest-pack
check, and restore operations.
