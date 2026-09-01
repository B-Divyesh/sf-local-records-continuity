const CACHE = "continuity-pack-shell-v8";
const GENERATED_ASSETS = [/* __PRECACHE_ASSETS__ */];
const SHELL = ["/", "/demo/", "/privacy/", "/terms/", "/404.html", "/contour-vault.webp", "/contour-vault-720.webp", "/social-card.webp", "/mark.svg", "/apple-touch-icon.png", "/site.webmanifest", ...GENERATED_ASSETS];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/plus/")) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached) return cached;

    // The landing page opens /demo/?demo=1, while the offline shell is
    // precached at /demo/. Treat the query as demo-mode state, not a separate
    // document, so the one-click sample reloads after the network is gone.
    if (event.request.mode === "navigate" && url.pathname === "/demo/" && url.searchParams.get("demo") === "1") {
      return caches.match("/demo/", { ignoreVary: true });
    }

    return event.request.mode === "navigate" ? caches.match("/404.html", { ignoreVary: true }) : undefined;
  }));
});
