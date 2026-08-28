import "./style.css";

type DemoKey = "pack" | "verify" | "restore";

const demos: Record<DemoKey, { output: string; note: string }> = {
  pack: {
    output: `$ continuity pack --target /media/offsite/backups\n\nBUSINESS    Maple Street Books\nSOURCES     3 required · 1 optional\nPACKED      1,284 files · 86.4 MB\nENCRYPTED   maple-street-books-2026-08-28T120000Z.cpack\nCOPIED      /media/offsite/backups\nVERIFIED    authenticated · all hashes match  ✓`,
    note: "Pack written and target copy verified."
  },
  verify: {
    output: `$ continuity check --target /media/offsite/backups\n\nNEWEST      2026-08-28 12:00 UTC\nAGE         3h 14m · within 26h limit\nDECRYPT     authenticated  ✓\nFILES       1,284 / 1,284 match  ✓\nRECEIPT     pack SHA-256 matches  ✓\n\nRESULT      Recovery pack is readable.`,
    note: "Dry-read complete. This is not a full application restore."
  },
  restore: {
    output: `$ continuity restore latest.cpack --output ./recovered-records\n\nCHECK       authenticated before writing  ✓\nRESTORED    records/invoices/2026.csv\nRESTORED    records/customers/customers.csv\nRESTORED    records/ledger/general-ledger.csv\nREPORT      recovered-records/RESTORE-REPORT.txt\n\nNEXT        Import into a test copy of your app.`,
    note: "Files restored and rechecked in a new directory."
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
  if (panel) panel.setAttribute("aria-labelledby", tab.id);
  if (output) output.textContent = "Reading checkpoint…";
  if (note) note.textContent = "Checking the route.";
  window.setTimeout(() => {
    if (output) output.textContent = demos[key].output;
    if (note) note.textContent = demos[key].note;
  }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
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

const copyStatus = document.querySelector<HTMLElement>("#copy-status");
document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy ?? "";
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = "Copied";
      if (copyStatus) copyStatus.textContent = `Copied: ${value}`;
      window.setTimeout(() => { button.textContent = "Copy"; }, 1800);
    } catch {
      if (copyStatus) copyStatus.textContent = `Copy unavailable. Select this command: ${value}`;
    }
  });
});

const networkStrip = document.querySelector<HTMLElement>("#network-strip");
const updateNetwork = (online = navigator.onLine): void => {
  if (networkStrip) networkStrip.hidden = online;
  if (online) sessionStorage.removeItem("continuity-offline");
  else sessionStorage.setItem("continuity-offline", "true");
};
window.addEventListener("online", () => updateNetwork(true));
window.addEventListener("offline", () => updateNetwork(false));
document.querySelector("#network-retry")?.addEventListener("click", () => window.location.reload());
updateNetwork(navigator.onLine && sessionStorage.getItem("continuity-offline") !== "true");

const SLUG = "local-records-continuity";
const API_BASE = import.meta.env.VITE_BILLING_API_BASE ?? "https://pilot-api.sociobot.in/api/v1";
const LICENSE_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `${LICENSE_KEY}:verdict`;
const ONE_DAY = 86_400_000;
const licenseForm = document.querySelector<HTMLFormElement>("#license-form");
const licenseInput = document.querySelector<HTMLInputElement>("#license-token");
const licenseStatus = document.querySelector<HTMLElement>("#license-status");
const downloads = document.querySelector<HTMLElement>("#plus-downloads");
const buyLink = document.querySelector<HTMLAnchorElement>("#buy-plus");
if (buyLink) buyLink.href = `${API_BASE}/products/${SLUG}/checkout`;

interface VerdictCache { token: string; valid: boolean; checkedAt: number }

function storageGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* Private mode may reject persistence. */ }
}
function setLicenseState(valid: boolean, message: string, state: "active" | "error" | "neutral" = "neutral"): void {
  if (downloads) downloads.hidden = !valid;
  if (licenseStatus) {
    licenseStatus.textContent = message;
    licenseStatus.dataset.state = state;
  }
}
function cachedVerdict(): VerdictCache | null {
  const raw = storageGet(CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as VerdictCache;
    return typeof parsed.token === "string" && typeof parsed.valid === "boolean" && typeof parsed.checkedAt === "number" ? parsed : null;
  } catch { return null; }
}

async function verifyLicense(token: string, optimistic = false): Promise<void> {
  if (!optimistic) setLicenseState(false, "Checking this license…");
  try {
    const response = await fetch(`${API_BASE}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const verdict = await response.json() as { valid: boolean; reason?: string };
    storageSet(CACHE_KEY, JSON.stringify({ token, valid: verdict.valid, checkedAt: Date.now() } satisfies VerdictCache));
    if (verdict.valid) {
      setLicenseState(true, "Continuity Plus is active on this device.", "active");
    } else {
      setLicenseState(false, "This license is no longer active. Check the token or purchase Continuity Plus.", "error");
    }
  } catch {
    const cached = cachedVerdict();
    if (cached?.token === token && cached.valid) {
      setLicenseState(true, "Plus is active from the last check. We’ll verify again when you’re online.", "active");
    } else {
      setLicenseState(false, "License verification is unavailable offline. Your free CLI and guide still work.", "error");
    }
  }
}

async function loadLicense(): Promise<void> {
  const url = new URL(window.location.href);
  const returned = url.searchParams.get("license");
  if (returned) {
    storageSet(LICENSE_KEY, returned);
    url.searchParams.delete("license");
    history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
  const token = returned ?? storageGet(LICENSE_KEY);
  if (!token) return;
  if (licenseInput) licenseInput.value = token;
  const cached = cachedVerdict();
  if (cached?.token === token && cached.valid) {
    setLicenseState(true, "Continuity Plus is active on this device.", "active");
    if (!returned && Date.now() - cached.checkedAt < ONE_DAY) return;
    await verifyLicense(token, true);
    return;
  }
  await verifyLicense(token);
}

licenseForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const token = licenseInput?.value.trim() ?? "";
  if (!token) {
    setLicenseState(false, "Paste the license token from your purchase email.", "error");
    licenseInput?.focus();
    return;
  }
  storageSet(LICENSE_KEY, token);
  void verifyLicense(token);
});
void loadLicense();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => { void navigator.serviceWorker.register("/sw.js"); });
}
