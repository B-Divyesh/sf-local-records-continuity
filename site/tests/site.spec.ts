import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { access, readFile } from "node:fs/promises";

test("home has a complete accessible route with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/Continuity Pack/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("backup you can find");
  await expect(page.locator(".hero-map img")).toHaveAttribute("alt", /contour map/);
  await expect(page.locator(".hero-map img")).toHaveJSProperty("complete", true);
  expect(errors).toEqual([]);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
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

test("paid files require an active license and use the protected API", async ({ page }) => {
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

test("release install and response policy contracts are deployable", async ({ page }, testInfo) => {
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
  };
  const route = (path: string) => config.routes.find((item) => item.route === path)?.headers ?? {};
  expect(route("/assets/*")["Cache-Control"]).toContain("immutable");
  expect(route("/contour-vault.webp")["Cache-Control"]).toContain("immutable");
  expect(route("/sw.js")["Cache-Control"]).toBe("no-cache, no-store, must-revalidate");
  expect(config.globalHeaders["Permissions-Policy"]).toContain("camera=()");
  expect(config.mimeTypes[".webmanifest"]).toBe("application/manifest+json");
  expect(config.routes.find((item) => item.route === "/plus/*")?.statusCode).toBe(404);
  await expect(page.locator("a[href^='/plus/']")).toHaveCount(0);
  for (const asset of ["multi-location-config.toml", "quarterly-restore-drill.md", "team-handoff-checklist.md"]) {
    await expect(access(`dist/site/plus/${asset}`)).rejects.toThrow();
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

test("purchase navigates to the registered Sociobot checkout", async ({ page }) => {
  const checkout = "https://api.sociobot.in/api/v1/products/local-records-continuity/checkout";
  await page.route("https://api.sociobot.in/api/v1/products", (route) => route.fulfill({
    json: { data: [{ slug: "local-records-continuity", checkout_url: checkout }] }
  }));
  await page.route(checkout, (route) => route.abort());

  await page.goto("/#plus");
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

test("installed shell remains readable offline", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.locator("#network-strip")).toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toContainText("backup you can find");
});

test("legal pages and mobile layout remain usable", async ({ page }, testInfo) => {
  for (const path of ["/privacy/", "/terms/"]) {
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
    await expect(page.getByRole("link", { name: "Build your first pack" })).toBeVisible();
  }
});

test("all visible links and controls meet the 44px target baseline", async ({ page }) => {
  await page.goto("/#plus");
  const undersized = await page.locator("a:visible, button:visible, input:visible").evaluateAll((elements) =>
    elements.flatMap((element) => {
      const { width, height } = element.getBoundingClientRect();
      return width < 44 || height < 44 ? [{ text: element.textContent?.trim() || element.getAttribute("aria-label") || element.tagName, width, height }] : [];
    })
  );
  expect(undersized).toEqual([]);
});
