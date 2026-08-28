import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
  await page.route("https://api.sociobot.in/api/v1/products/local-records-continuity/verify?license=test-token", (route) => route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } }));
  await page.goto("/?license=test-token#plus");
  await expect(page).toHaveURL(/\/#plus$/);
  await expect(page.locator("#plus-downloads")).toBeVisible();
  await expect(page.locator("#license-status")).toContainText("active");
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-records-continuity"))).toBe("test-token");
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
