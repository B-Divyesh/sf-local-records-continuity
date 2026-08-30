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

setUpPwa();

const SLUG = "local-records-continuity";
const API_BASE = import.meta.env.VITE_BILLING_API_BASE ?? "https://api.sociobot.in/api/v1";
const LICENSE_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `${LICENSE_KEY}:verdict`;
const ONE_DAY = 86_400_000;
const licenseForm = document.querySelector<HTMLFormElement>("#license-form");
const licenseInput = document.querySelector<HTMLInputElement>("#license-token");
const licenseStatus = document.querySelector<HTMLElement>("#license-status");
const downloads = document.querySelector<HTMLElement>("#plus-downloads");
const downloadStatus = document.querySelector<HTMLElement>("#download-status");
const buyButton = document.querySelector<HTMLButtonElement>("#buy-plus");
const purchaseStatus = document.querySelector<HTMLElement>("#purchase-status");
const checkoutUrl = `${API_BASE}/products/${SLUG}/checkout`;

interface VerdictCache { token: string; valid: boolean; checkedAt: number }

interface Product { slug: string; checkout_url?: string }

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
function setPurchaseState(message: string, state: "error" | "neutral" = "neutral"): void {
  if (purchaseStatus) {
    purchaseStatus.textContent = message;
    purchaseStatus.dataset.state = state;
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
  if (cached?.token === token) {
    if (cached.valid) {
      setLicenseState(true, "Continuity Plus is active on this device.", "active");
    } else {
      setLicenseState(false, "This license is no longer active. Check the token or purchase Continuity Plus.", "error");
    }
    if (Date.now() - cached.checkedAt < ONE_DAY) return;
    await verifyLicense(token, cached.valid);
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

document.querySelectorAll<HTMLButtonElement>("[data-plus-asset]").forEach((button) => {
  button.addEventListener("click", async () => {
    const token = storageGet(LICENSE_KEY);
    const asset = button.dataset.plusAsset;
    if (!token || !asset) {
      setLicenseState(false, "Verify your license before downloading the field kit.", "error");
      return;
    }
    button.disabled = true;
    if (downloadStatus) downloadStatus.textContent = "Preparing protected download…";
    try {
      const response = await fetch(`/api/plus-download?asset=${encodeURIComponent(asset)}`, {
        method: "POST",
        // Azure Static Web Apps reserves Authorization for its own auth layer.
        // A product-specific header reaches the managed function unchanged.
        headers: { "X-Continuity-License": token }
      });
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = Number.parseInt(response.headers.get("Retry-After") ?? "", 10);
          const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? ` in ${retryAfter} seconds` : " shortly";
          if (downloadStatus) downloadStatus.textContent = `Too many download requests. Try again${wait}.`;
          return;
        }
        if (response.status === 401 || response.status === 403) {
          storageSet(CACHE_KEY, JSON.stringify({ token, valid: false, checkedAt: Date.now() } satisfies VerdictCache));
          setLicenseState(false, "This license is no longer active. Check the token or purchase Continuity Plus.", "error");
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = asset;
      anchor.click();
      URL.revokeObjectURL(url);
      if (downloadStatus) downloadStatus.textContent = "Download ready.";
    } catch {
      if (downloadStatus && !downloadStatus.textContent?.includes("no longer active") && !downloadStatus.textContent?.includes("Too many")) {
        downloadStatus.textContent = "The protected download is unavailable. Check your connection and try again.";
      }
    } finally {
      button.disabled = false;
    }
  });
});

buyButton?.addEventListener("click", async () => {
  buyButton.disabled = true;
  setPurchaseState("Checking whether checkout is ready…");
  try {
    const response = await fetch(`${API_BASE}/products`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json() as { data?: Product[] };
    const product = payload.data?.find((item) => item.slug === SLUG && item.checkout_url === checkoutUrl);
    if (!product) {
      setPurchaseState("Continuity Plus purchases are not available yet. The free recovery CLI and guide are ready to use.", "error");
      return;
    }
    window.location.assign(checkoutUrl);
  } catch {
    setPurchaseState("We could not check purchase availability. Please try again when you are online; the free recovery CLI remains available.", "error");
  } finally {
    buyButton.disabled = false;
  }
});
