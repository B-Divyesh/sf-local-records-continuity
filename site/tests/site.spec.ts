import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { access, readFile } from "node:fs/promises";

const expectedOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173").origin;

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

test("@claim:sample-demo-page opens in one click without reading real browser data", async ({ page }) => {
  let externalRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== expectedOrigin) externalRequests += 1;
  });
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("sb_license:local-records-continuity", "real-data-sentinel"));
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText("Demo — sample data, nothing is saved here.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Try a recovery pack with sample records.");
  await expect(page.getByLabel("Demo command")).toHaveText("continuity demo");
  await page.getByRole("tab", { name: "Restore" }).click();
  await expect(page.locator("#demo-output")).toContainText("SAMPLE RECOVERY COMPLETE");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("tab", { name: "Pack" })).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("real-data-sentinel");
  expect(externalRequests).toBe(0);
});

test("demo tabs support arrow keys and expose a transcript", async ({ page }) => {
  await page.goto("/#demo");
  const pack = page.getByRole("tab", { name: "Pack" });
  await pack.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Verify" })).toHaveAttribute("aria-selected", "true");
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

test("@claim:licensed-download paid files require an active license and use the protected API", async ({ page }) => {
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/verify?license=test-token", (route) =>
    route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } })
  );
  let authorization = "";
  await page.route("**/api/plus-download?asset=quarterly-restore-drill.md", (route) => {
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
  expect(authorization).toBe("Bearer test-token");
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

test("@claim:offline-guide installed shell remains readable offline", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect(page.locator("#network-strip")).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("recovery pack for local business records");
  } finally {
    await context.close();
  }
});

test("legal, demo, 404, and mobile layouts remain usable", async ({ page }, testInfo) => {
  for (const path of ["/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  }
  if (testInfo.project.name === "mobile-390") {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
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
  for (const path of ["/#plus", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
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
