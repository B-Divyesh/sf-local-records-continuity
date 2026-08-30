interface PwaOptions {
  /**
   * Demo mode uses its own prefixed key so its offline indicator cannot
   * overlap with a visitor's real application state.
   */
  offlineStateKey?: string;
}

const OFFLINE_STATE_KEY = "continuity-offline";
const ROUTE_FOCUS_PREFIX = "continuity:focus-route:";

function routeFocusKey(url: URL): string {
  return `${ROUTE_FOCUS_PREFIX}${url.pathname}${url.search}`;
}

function focusRouteHeading(): void {
  const heading = document.querySelector<HTMLHeadingElement>("main h1");
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  let announcement = document.querySelector<HTMLElement>("#route-announcement");
  if (!announcement) {
    announcement = document.createElement("div");
    announcement.id = "route-announcement";
    announcement.className = "sr-only";
    announcement.setAttribute("aria-live", "polite");
    document.body.append(announcement);
  }
  announcement.textContent = `${heading.textContent?.trim() ?? document.title}. Page loaded.`;
}

function setUpRouteFocus(): void {
  const state = typeof history.state === "object" && history.state !== null ? history.state : {};
  history.replaceState({ ...state, continuityFocusOnRestore: true }, "");

  let arrivedFromRoute = false;
  try {
    arrivedFromRoute = sessionStorage.getItem(routeFocusKey(new URL(location.href))) === "true";
  } catch { /* Focus still follows browser history when storage is unavailable. */ }
  if (arrivedFromRoute) requestAnimationFrame(focusRouteHeading);

  document.addEventListener("click", (event) => {
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor.target || anchor.hasAttribute("download") || event.defaultPrevented) return;
    const destination = new URL(anchor.href, location.href);
    if (destination.origin !== location.origin || (destination.pathname === location.pathname && destination.search === location.search)) return;
    try {
      sessionStorage.setItem(routeFocusKey(new URL(location.href)), "true");
      sessionStorage.setItem(routeFocusKey(destination), "true");
    } catch { /* Ignore blocked storage. */ }
  });

  window.addEventListener("pageshow", () => {
    try {
      if (sessionStorage.getItem(routeFocusKey(new URL(location.href))) === "true") requestAnimationFrame(focusRouteHeading);
    } catch { /* Ignore blocked storage. */ }
  });
  window.addEventListener("popstate", () => requestAnimationFrame(focusRouteHeading));
}

function storedOfflineState(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function setStoredOfflineState(key: string, offline: boolean): void {
  try {
    if (offline) sessionStorage.setItem(key, "true");
    else sessionStorage.removeItem(key);
  } catch {
    // Private browsing can refuse session storage; the visible state still works.
  }
}

export function setUpPwa({ offlineStateKey = OFFLINE_STATE_KEY }: PwaOptions = {}): void {
  setUpRouteFocus();
  const networkStrip = document.querySelector<HTMLElement>("#network-strip");
  const updateNetwork = (online = navigator.onLine): void => {
    if (networkStrip) networkStrip.hidden = online;
    setStoredOfflineState(offlineStateKey, !online);
  };

  window.addEventListener("online", () => updateNetwork(true));
  window.addEventListener("offline", () => updateNetwork(false));
  document.querySelector("#network-retry")?.addEventListener("click", () => window.location.reload());
  updateNetwork(navigator.onLine && !storedOfflineState(offlineStateKey));

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // The guide remains usable online when a browser declines service workers.
    });
  }
}
