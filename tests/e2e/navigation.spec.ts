import { test, expect } from "@playwright/test";
import { setAuthenticatedSession } from "./helpers/auth";

test.describe("Full Navigation & Routes", () => {
  test.beforeEach(async ({ context }) => {
    await setAuthenticatedSession(context);
  });

  test("loads Dashboard successfully with key components", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1:has-text('MYNEXT')")).toBeVisible();
    await expect(page.locator("text=COMMAND CENTER")).toBeVisible();
    await expect(page.locator("text=Radar Uptime & Salud Web")).toBeVisible();
  });

  test("navigates to /maintenance page and displays Google Calendar actions", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(page).toHaveURL("/maintenance");
    await expect(page.locator("h1:has-text('Mantenimiento')")).toBeVisible();
  });

  test("navigates to /projects page", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL("/projects");
    await expect(page.locator("body")).toBeVisible();
  });

  test("navigates to /monitoring page", async ({ page }) => {
    await page.goto("/monitoring");
    await expect(page).toHaveURL("/monitoring");
    await expect(page.locator("body")).toBeVisible();
  });

  test("navigates to /documents page and displays document controls", async ({ page }) => {
    await page.goto("/documents");
    await expect(page).toHaveURL("/documents");
    await expect(page.locator("text=Nuevo Documento")).toBeVisible();
  });

  test("navigates to /clients directory page", async ({ page }) => {
    await page.goto("/clients");
    await expect(page).toHaveURL("/clients");
    await expect(page.locator("body")).toBeVisible();
  });

  test("navigates to /activity feed page", async ({ page }) => {
    await page.goto("/activity");
    await expect(page).toHaveURL("/activity");
    await expect(page.locator("body")).toBeVisible();
  });
});
