import { test, expect } from "@playwright/test";
import { setAuthenticatedSession } from "./helpers/auth";

test.describe("Mobile Navigation & Bottom Bar (iPhone Viewport)", () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 13 / 14 viewport
  });

  test.beforeEach(async ({ context }) => {
    await setAuthenticatedSession(context);
  });

  test("renders Bottom Navigation Bar with all 6 tabs on mobile", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav.md\\:hidden");
    await expect(nav).toBeVisible();

    await expect(nav.locator("text=Inicio")).toBeVisible();
    await expect(nav.locator("text=Clientes")).toBeVisible();
    await expect(nav.locator("text=Proyectos")).toBeVisible();
    await expect(nav.locator("text=Mant.")).toBeVisible();
    await expect(nav.locator("text=Docs")).toBeVisible();
    await expect(nav.locator("text=Monitor")).toBeVisible();
  });

  test("navigates cleanly between tabs using mobile bottom bar", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav.md\\:hidden");

    // Click Mant.
    await nav.locator("a[href='/maintenance']").click({ force: true });
    await page.waitForURL("/maintenance");
    await expect(page).toHaveURL("/maintenance");

    // Click Proyectos
    await nav.locator("a[href='/projects']").click({ force: true });
    await page.waitForURL("/projects");
    await expect(page).toHaveURL("/projects");

    // Click Docs
    await nav.locator("a[href='/documents']").click({ force: true });
    await page.waitForURL("/documents");
    await expect(page).toHaveURL("/documents");

    // Click Monitor
    await nav.locator("a[href='/monitoring']").click({ force: true });
    await page.waitForURL("/monitoring");
    await expect(page).toHaveURL("/monitoring");

    // Return to Inicio
    await nav.locator("a[href='/']").click({ force: true });
    await page.waitForURL((url) => url.pathname === "/");
    await expect(page).toHaveURL("/");
  });
});
