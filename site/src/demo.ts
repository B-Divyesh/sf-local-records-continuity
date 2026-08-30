import "./style.css";
import { setUpPwa } from "./pwa";

type DemoKey = "pack" | "verify" | "restore";

const demos: Record<DemoKey, { output: string; note: string }> = {
  pack: {
    output: `$ continuity demo\n\nBUSINESS    Maple Street Books\nSOURCES     3 bundled sample files\nTARGET      /tmp/continuity-demo-…/target\nPACKED      invoices, customers, insurance note\nVERIFIED    authenticated · all hashes match  ✓`,
    note: "The target and pack exist only inside a new temporary demo workspace."
  },
  verify: {
    output: `$ continuity check --target /tmp/continuity-demo-…/target\n\nNEWEST      maple-street-books-….cpack\nAGE         within 1 hour\nDECRYPT     authenticated  ✓\nFILES       3 / 3 match  ✓\nRECEIPT     encrypted pack hash matches  ✓`,
    note: "The demo checks the newest pack before restoring it."
  },
  restore: {
    output: `$ continuity restore maple-street-books-….cpack --output /tmp/continuity-demo-…/restored\n\nRESTORED    records/invoices/invoices.csv\nRESTORED    records/customers/customers.csv\nRESTORED    records/supporting-documents/insurance-renewal.txt\nREPORT      RESTORE-REPORT.txt\n\nRESULT      SAMPLE RECOVERY COMPLETE`,
    note: "The CLI prints the workspace path so you can inspect or delete it."
  }
};

const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>("[role='tab'][data-demo]"));
const output = document.querySelector<HTMLElement>("#demo-output code");
const panel = document.querySelector<HTMLElement>("#demo-panel");
const note = document.querySelector<HTMLElement>("#demo-note");

function selectDemo(tab: HTMLButtonElement, focus = false): void {
  const key = tab.dataset.demo as DemoKey;
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  panel?.setAttribute("aria-labelledby", tab.id);
  if (output) output.textContent = demos[key].output;
  if (note) note.textContent = demos[key].note;
  if (focus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectDemo(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    selectDemo(tabs[next], true);
  });
});
if (tabs[0]) selectDemo(tabs[0]);

// The direct catalog entry must be an offline-capable demo, without sharing
// the real app's persisted state or license namespace.
setUpPwa({ offlineStateKey: "demo:continuity-offline" });

document.querySelector("#reset-demo")?.addEventListener("click", () => {
  if (tabs[0]) selectDemo(tabs[0], true);
});

const copyStatus = document.querySelector<HTMLElement>("#copy-status");
document.querySelector<HTMLButtonElement>("[data-copy]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  const value = button.dataset.copy ?? "";
  try {
    await navigator.clipboard.writeText(value);
    button.textContent = "Copied";
    if (copyStatus) copyStatus.textContent = `Copied: ${value}`;
  } catch {
    if (copyStatus) copyStatus.textContent = `Copy unavailable. Select this command: ${value}`;
  }
});
