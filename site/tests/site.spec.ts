import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { access, readFile } from "node:fs/promises";

const expectedOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173").origin;

function contrastRatio(foreground: string, background: string): number {
  const channels = (value: string) => {
    const values = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!values || values.length !== 3) throw new Error(`Unsupported color: ${value}`);
    return values.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
  };
  const luminance = (color: string) => {
    const [red, green, blue] = channels(color);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

test("home has a complete accessible route with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/Continuity Pack/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("recovery pack for local business records");
  await expect(page.locator(".hero-map img")).toHaveAttribute("alt", /contour map/);
  await expect(page.locator(".hero-map img")).toHaveJSProperty("complete", true);
  expect(errors).toEqual([]);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("reviewed copy stays plain, consistent, and release-honest", async ({ page }) => {
  await page.goto("/");
  const homeCopy = await page.locator("body").innerText();
  expect(homeCopy).not.toMatch(/dry-read|encrypted archive|exits loudly|complete safety path|honest boundary|factory publishes/i);
  expect(homeCopy).toContain("The manifest lists the business, source files, and verification command.");
  expect(homeCopy).toContain("Release binaries are not available yet.");
  await expect(page.getByRole("tab", { name: "Check" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy install command" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy setup command" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy pack command" })).toBeVisible();

  const readme = await readFile("README.md", "utf8");
  expect(readme).not.toMatch(/dry-read|archive check|production code path|complete safety path|factory publishes|Rust 1\.85|is equivalent|Releases begin|revoke.*automatically/i);
  expect(readme).toContain("Build from source. Release binaries are not available yet:");
  const catalog = (await readFile(".factory/catalog-description.txt", "utf8")).trim();
  expect(catalog.length).toBeLessThanOrEqual(120);
  expect(catalog).toMatch(/^Build\b/);
});

test("desktop first screen keeps the audience, sample action, explanation, and facts in view", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop first-read regression.");
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1440, height: 821 },
    { width: 1440, height: 844 },
    { width: 1440, height: 900 },
    { width: 1440, height: 961 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const selector of [".lede", ".hero-actions .button.primary", ".action-note", ".plain-facts"]) {
      const box = await page.locator(selector).boundingBox();
      expect(box, `${selector} at ${viewport.width}×${viewport.height}`).not.toBeNull();
      expect(box!.y, `${selector} top at ${viewport.width}×${viewport.height}`).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height, `${selector} bottom at ${viewport.width}×${viewport.height}`).toBeLessThanOrEqual(viewport.height);
    }
  }
});

test("@claim:sample-demo-page opens in one click without reading real browser data", async ({ page }) => {
  let externalRequests = 0;
  page.on("request", (request) => {
    const initiator = request.frame().url();
    const isDemoInitiator = initiator.includes("/demo/") || new URL(initiator || expectedOrigin).searchParams.get("demo") === "1";
    if (isDemoInitiator && new URL(request.url()).origin !== expectedOrigin) externalRequests += 1;
  });
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("sb_license:local-records-continuity", "real-data-sentinel"));
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.getByText("Demo — sample data, nothing is saved here.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Try a recovery pack with sample records.");
  await expect(page.getByLabel("Demo command")).toHaveText("continuity demo");
  await page.getByRole("tab", { name: "Restore" }).click();
  await expect(page.locator("#demo-output")).toContainText("SAMPLE RECOVERY COMPLETE");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("tab", { name: "Pack" })).toHaveAttribute("aria-selected", "true");
  await page.evaluate(() => sessionStorage.setItem("demo:temporary-test", "discard-me"));
  await page.getByRole("button", { name: "Reset demo" }).click();
  expect(await page.evaluate(() => sessionStorage.getItem("demo:temporary-test"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("real-data-sentinel");
  await page.evaluate(() => sessionStorage.setItem("demo:temporary-test", "discard-on-exit"));
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/#guide$/);
  expect(await page.evaluate(() => sessionStorage.getItem("demo:temporary-test"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("real-data-sentinel");
  await page.goto("/?demo=1");
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.getByText("Demo — sample data, nothing is saved here.")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("real-data-sentinel");
  expect(externalRequests).toBe(0);
});

test("demo tabs support arrow keys and expose a transcript", async ({ page }) => {
  await page.goto("/#demo");
  const pack = page.getByRole("tab", { name: "Pack" });
  await pack.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Check" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#demo-output")).toContainText("continuity check");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Restore" })).toHaveAttribute("aria-selected", "true");
});

test("license return is stored, stripped, and unlocks after verification", async ({ page }) => {
  let verificationCalls = 0;
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/verify?license=test-token", (route) => {
    verificationCalls += 1;
    return route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } });
  });
  await page.goto("/?license=test-token#plus");
  await expect(page).toHaveURL(/\/#plus$/);
  await expect(page.locator("#plus-downloads")).toBeVisible();
  await expect(page.locator("#license-status")).toContainText("active");
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("test-token");
  await page.reload();
  await expect(page.locator("#plus-downloads")).toBeVisible();
  expect(verificationCalls).toBe(1);
});

test("@claim:license-restoration saves, rechecks, rejects, and removes a license", async ({ page }) => {
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/verify?license=valid-token", (route) =>
    route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } })
  );
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/verify?license=bad-token", (route) =>
    route.fulfill({ json: { valid: false, reason: "invalid", expires_at: null } })
  );
  await page.goto("/#plus");
  await page.getByLabel("License token").fill("valid-token");
  await page.getByRole("button", { name: "Verify license" }).click();
  await expect(page.locator("#license-status")).toContainText("active on this device");
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("valid-token");
  await page.reload();
  await expect(page.getByLabel("License token")).toHaveValue("valid-token");
  await expect(page.locator("#license-status")).toContainText("active on this device");
  await page.getByLabel("License token").fill("bad-token");
  await page.getByRole("button", { name: "Verify license" }).click();
  await expect(page.locator("#license-status")).toContainText("no longer active");
  await page.getByRole("button", { name: "Remove saved license" }).click();
  await expect(page.locator("#license-status")).toContainText("Saved license removed");
  expect(await page.evaluate(() => ({
    token: localStorage.getItem("sb_license:local-records-continuity"),
    verdict: localStorage.getItem("sb_license:local-records-continuity:verdict")
  }))).toEqual({ token: null, verdict: null });
});

test("paid files require an active license and use the gateway-safe product header", async ({ page }) => {
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/verify?license=test-token", (route) =>
    route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } })
  );
  let licenseHeader = "";
  let authorization = "";
  await page.route("**/api/plus-download?asset=quarterly-restore-drill.md", (route) => {
    licenseHeader = route.request().headers()["x-continuity-license"] ?? "";
    authorization = route.request().headers().authorization ?? "";
    return route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": 'attachment; filename="quarterly-restore-drill.md"'
      },
      body: "# Quarterly restore drill\n"
    });
  });

  await page.goto("/?license=test-token#plus");
  await expect(page.locator("#plus-downloads")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download quarterly restore drill" }).click();
  await download;
  expect(licenseHeader).toBe("test-token");
  expect(authorization).toBe("");
  await expect(page.locator("#download-status")).toHaveText("Download ready.");
});

test("protected-download throttling tells a buyer exactly when to retry", async ({ page }) => {
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/verify?license=test-token", (route) =>
    route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } })
  );
  await page.route("**/api/plus-download?asset=quarterly-restore-drill.md", (route) => route.fulfill({
    status: 429,
    headers: { "Retry-After": "42", "Content-Type": "application/json" },
    body: JSON.stringify({ error: "too many protected-download requests; try again shortly" })
  }));

  await page.goto("/?license=test-token#plus");
  await expect(page.locator("#plus-downloads")).toBeVisible();
  await page.getByRole("button", { name: "Download quarterly restore drill" }).click();
  await expect(page.locator("#download-status")).toHaveText("Too many download requests. Try again in 42 seconds.");
});

test("release install, 404, and response policy contracts are deployable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Static release contract only needs one browser project.");
  await page.goto("/#guide");

  const install = "cargo install --git https://github.com/B-Divyesh/sf-local-records-continuity continuity-pack --locked";
  await expect(page.getByLabel("Scrollable install command")).toHaveText(install);
  await expect(page.locator(".copy-button").first()).toHaveAttribute("data-copy", install);
  expect(install).not.toMatch(/--git\s+\S+\s+--path/);
  await expect(page.getByRole("button", { name: "Buy Continuity Plus" })).toBeVisible();

  const config = JSON.parse(await readFile("dist/site/staticwebapp.config.json", "utf8")) as {
    routes: Array<{ route: string; statusCode?: number; headers?: Record<string, string> }>;
    globalHeaders: Record<string, string>;
    mimeTypes: Record<string, string>;
    responseOverrides: Record<string, { rewrite: string }>;
    navigationFallback?: unknown;
  };
  const route = (path: string) => config.routes.find((item) => item.route === path)?.headers ?? {};
  expect(route("/assets/*")["Cache-Control"]).toContain("immutable");
  expect(route("/contour-vault.webp")["Cache-Control"]).toContain("immutable");
  expect(route("/sw.js")["Cache-Control"]).toBe("no-cache, no-store, must-revalidate");
  expect(config.globalHeaders["Permissions-Policy"]).toContain("camera=()");
  expect(config.globalHeaders["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders["Content-Security-Policy"]).toContain("connect-src 'self' https://api.sociobot.in");
  expect(config.mimeTypes[".webmanifest"]).toBe("application/manifest+json");
  expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html" });
  expect(config.navigationFallback).toBeUndefined();
  expect(config.routes.find((item) => item.route === "/plus/*")?.statusCode).toBe(404);
  await expect(access("dist/site/404.html")).resolves.toBeUndefined();
  await expect(access("dist/site/demo/index.html")).resolves.toBeUndefined();
  await expect(access("dist/site/social-card.webp")).resolves.toBeUndefined();
  const notFound = await readFile("dist/site/404.html", "utf8");
  expect(notFound).toContain('<link rel="canonical" href="https://local-records-continuity.sociobot.in/404.html"');
  expect(notFound).toContain('<meta property="og:title" content="Page not found — Continuity Pack"');
  expect(notFound).toContain('<meta property="og:image" content="https://local-records-continuity.sociobot.in/social-card.webp"');
  await expect(page.locator("a[href^='/plus/']")).toHaveCount(0);
  for (const asset of ["multi-location-config.toml", "quarterly-restore-drill.md", "team-handoff-checklist.md"]) {
    await expect(access(`dist/site/plus/${asset}`)).rejects.toThrow();
  }
});

test("live deployment returns the designed 404 and required response policy", async ({ page }) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, "Deployment-only response check.");
  const home = await page.request.get("/");
  expect(home.status()).toBe(200);
  expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  const missing = await page.goto(`/not-a-real-route-${Date.now()}`);
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page does not exist.");
});

test("live managed API exposes this build and preserves product-license authentication", async ({ page }) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, "Deployment-only managed API check.");
  const identity = await page.request.get("/api/build");
  expect(identity.status()).toBe(200);
  expect(identity.headers()["cache-control"]).toBe("no-store");
  expect(identity.headers()["x-continuity-api-build"]).toBe("local-records-continuity-repair-8");
  await expect(identity.json()).resolves.toMatchObject({
    product: "local-records-continuity",
    release: "local-records-continuity-repair-8",
    license_header: "x-continuity-license"
  });

  const endpoint = "/api/plus-download?asset=quarterly-restore-drill.md";
  const missing = await page.request.post(endpoint);
  expect(missing.status()).toBe(401);
  expect(await missing.json()).toEqual({ error: "a Continuity Plus license is required" });
  const reserved = await page.request.post(endpoint, { headers: { Authorization: "Bearer verifier-invalid" } });
  expect(reserved.status()).toBe(401);
  const invalid = await page.request.post(endpoint, { headers: { "X-Continuity-License": "verifier-invalid" } });
  expect(invalid.status()).toBe(403);
  expect(await invalid.json()).toEqual({ error: "license is not active" });
  for (const response of [missing, reserved, invalid]) {
    expect(response.headers()["x-continuity-api-build"]).toBe("local-records-continuity-repair-8");
  }
});

test("purchase does not send customers to an unregistered checkout", async ({ page }) => {
  let checkoutRequests = 0;
  await page.route("https://api.sociobot.in/api/v1/products", (route) => route.fulfill({
    json: { data: [{ slug: "another-product", checkout_url: "https://example.test/checkout" }] }
  }));
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/checkout", (route) => {
    checkoutRequests += 1;
    return route.abort();
  });

  await page.goto("/#plus");
  await page.getByRole("button", { name: "Buy Continuity Plus" }).click();
  await expect(page.locator("#purchase-status")).toContainText("purchases are not available yet");
  expect(checkoutRequests).toBe(0);
});

test("@claim:plus-price-and-checkout shows $39 once and navigates to registered checkout", async ({ page }) => {
  const checkout = "https://api.sociobot.in/api/v1/products/local-records-continuity/checkout";
  await page.route("https://api.sociobot.in/api/v1/products", (route) => route.fulfill({
    json: { data: [{ slug: "local-records-continuity", checkout_url: checkout }] }
  }));
  await page.route(checkout, (route) => route.abort());

  await page.goto("/#plus");
  await expect(page.locator(".price")).toContainText("$39 one-time purchase");
  const checkoutRequest = page.waitForRequest(checkout);
  await page.getByRole("button", { name: "Buy Continuity Plus" }).click();
  await checkoutRequest;
});

test("purchase rejects a registry entry with the wrong checkout route", async ({ page }) => {
  let checkoutRequests = 0;
  await page.route("https://api.sociobot.in/api/v1/products", (route) => route.fulfill({
    json: { data: [{ slug: "local-records-continuity", checkout_url: "https://example.test/checkout" }] }
  }));
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/checkout", (route) => {
    checkoutRequests += 1;
    return route.abort();
  });

  await page.goto("/#plus");
  await page.getByRole("button", { name: "Buy Continuity Plus" }).click();
  await expect(page.locator("#purchase-status")).toContainText("purchases are not available yet");
  expect(checkoutRequests).toBe(0);
});

test("@claim:offline-guide direct demo installs its shell and reloads the sample offline", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await context.addInitScript(() => {
      localStorage.setItem("sb_license:local-records-continuity", "real-license-sentinel");
      localStorage.setItem("sb_license:local-records-continuity:verdict", JSON.stringify({
        token: "real-license-sentinel",
        valid: true,
        checkedAt: Date.now()
      }));
      sessionStorage.setItem("continuity-offline", "real-offline-state-sentinel");
    });
    await page.goto("/demo/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Try a recovery pack with sample records.");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.getRegistrations().then((registrations) => registrations.length))).toBe(1);
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update(); });
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect(page.locator("#network-strip")).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Try a recovery pack with sample records.");
    await expect(page.locator("#network-strip")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("real-license-sentinel");
    expect(await page.evaluate(() => sessionStorage.getItem("continuity-offline"))).toBe("real-offline-state-sentinel");
    expect(await page.evaluate(() => sessionStorage.getItem("demo:continuity-offline"))).toBe("true");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Build a recovery pack for local business records.");
    await expect(page.locator("#guide").getByRole("heading", { level: 2 })).toHaveText("Build your first recovery pack.");
    expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("real-license-sentinel");
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test("legal, demo, 404, and mobile layouts remain usable", async ({ page }, testInfo) => {
  const routes = [
    { path: "/demo/?demo=1", title: "Demo — Continuity Pack" },
    { path: "/privacy/", title: "Privacy — Continuity Pack" },
    { path: "/terms/", title: "Terms — Continuity Pack" },
    { path: "/404.html", title: "Page not found — Continuity Pack" }
  ];
  for (const route of routes) {
    const path = route.path;
    await page.goto(path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer a[href='/privacy/']")).toBeVisible();
    await expect(page.locator("footer a[href='/terms/']")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  }
  if (testInfo.project.name === "mobile-390") {
    for (const path of ["/", "/demo/?demo=1", "/privacy/", "/terms/", "/404.html"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow, path).toBe(false);
      await expect(page.locator("header nav .nav-essential:visible"), path).toHaveCount(2);
      await expect(page.locator("header nav").getByRole("link", { name: "Install" }), path).toBeVisible();
      await expect(page.locator("header nav").getByRole("link", { name: "Plus" }), path).toBeVisible();
    }
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
    await page.getByRole("link", { name: "Try it with sample data" }).click();
    const outputBox = await page.locator("#demo-output").boundingBox();
    expect(outputBox).not.toBeNull();
    const visibleHeight = Math.min(844, outputBox!.y + outputBox!.height) - Math.max(0, outputBox!.y);
    expect(visibleHeight / outputBox!.height).toBeGreaterThanOrEqual(0.7);
  }
});

test("route navigation and browser history move focus to the new heading", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.locator("h1")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toBeFocused();
  await page.goForward();
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.locator("h1")).toBeFocused();
  await expect(page.locator("#route-announcement")).toContainText("Page loaded");
});

test("focus indicators keep at least 3:1 contrast on paper, ochre, warning, and dark surfaces", async ({ page }) => {
  const samples = [
    { path: "/", control: ".hero-actions .button.primary", surface: "body" },
    { path: "/demo/", control: "#reset-demo", surface: ".demo-banner" },
    { path: "/", control: "#network-retry", surface: ".network-strip", reveal: "#network-strip" },
    { path: "/", control: "#tab-pack", surface: ".demo-section" }
  ];
  for (const sample of samples) {
    await page.goto(sample.path);
    if (sample.reveal) await page.locator(sample.reveal).evaluate((element: HTMLElement) => { element.hidden = false; });
    await page.locator(sample.control).focus();
    const colors = await page.locator(sample.control).evaluate((element) => {
      const focus = getComputedStyle(element);
      return { outline: focus.outlineColor, width: Number.parseFloat(focus.outlineWidth) };
    });
    const background = await page.locator(sample.surface).evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(colors.width, sample.control).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(colors.outline, background), sample.control).toBeGreaterThanOrEqual(3);
  }
});

test("@claim:browser-privacy normal and demo flows make same-origin requests only", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await page.getByRole("tab", { name: "Check" }).click();
  const origins = [...new Set(requests.map((url) => new URL(url).origin))];
  expect(origins).toEqual([expectedOrigin]);
});

test("all visible links and controls meet the 44px target baseline", async ({ page }) => {
  for (const path of ["/#plus", "/demo/?demo=1", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    const undersized = await page.locator("a:visible, button:visible, input:visible").evaluateAll((elements) =>
      elements.flatMap((element) => {
        const { width, height } = element.getBoundingClientRect();
        return width < 44 || height < 44 ? [{ text: element.textContent?.trim() || element.getAttribute("aria-label") || element.tagName, width, height }] : [];
      })
    );
    expect(undersized, path).toEqual([]);
  }
});
