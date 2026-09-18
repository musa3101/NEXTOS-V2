import { test, expect } from "@playwright/test";
import { setAuthenticatedSession } from "./helpers/auth";

test.describe("Mobile Navigation & Bottom Bar (iPhone Viewport)", () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 13 / 14 viewport
  });

  test.beforeEach(async ({ context }) => {
    await setAuthenticatedSession(context);
  });

  test("renders Bottom Navigation Bar with all 5 tabs on mobile", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav.md\\:hidden");
    await expect(nav).toBeVisible();

    await expect(nav.locator("text=Inicio")).toBeVisible();
    await expect(nav.locator("text=Proyectos")).toBeVisible();
    await expect(nav.locator("text=Clientes")).toBeVisible();
    await expect(nav.locator("text=Docs")).toBeVisible();
    await expect(nav.locator("text=Monitor")).toBeVisible();
  });

  test("navigates cleanly between tabs using mobile bottom bar", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav.md\\:hidden");

    // Click Proyectos
    await nav.locator("text=Proyectos").click();
    await page.waitForURL("/projects");
    await expect(page).toHaveURL("/projects");

    // Click Docs
    await nav.locator("text=Docs").click();
    await page.waitForURL("/documents");
    await expect(page).toHaveURL("/documents");

    // Click Monitor
    await nav.locator("text=Monitor").click();
    await page.waitForURL("/monitoring");
    await expect(page).toHaveURL("/monitoring");

    // Return to Inicio
    await nav.locator("text=Inicio").click();
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });
});
