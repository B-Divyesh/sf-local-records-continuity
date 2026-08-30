interface PwaOptions {
  /**
   * Demo mode uses its own prefixed key so its offline indicator cannot
   * overlap with a visitor's real application state.
   */
  offlineStateKey?: string;
}

const OFFLINE_STATE_KEY = "continuity-offline";

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
