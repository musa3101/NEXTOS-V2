import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator(".title")).toHaveText("Iniciar Sesión");
  });

  test("shows error message with invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "invalidpassword");
    await page.click('button:has-text("Entrar")');

    const errorAlert = page.locator("text=Credenciales incorrectas");
    await expect(errorAlert).toBeVisible();
  });

  test("successfully logs in with valid credentials and redirects to dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "mynextbymusa@gmail.com");
    await page.fill('input[name="password"]', "musacocppl");
    await page.click('button:has-text("Entrar")');

    // Should redirect to dashboard root
    await page.waitForURL("/", { timeout: 10000 });
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1:has-text('MYNEXT')")).toBeVisible();
  });
});
