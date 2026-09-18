import { test, expect } from "@playwright/test";
import { setAuthenticatedSession } from "./helpers/auth";

test.describe("Dashboard & Project Detail Modal Flow", () => {
  test.beforeEach(async ({ context, page }) => {
    await setAuthenticatedSession(context);

    // Mock Cloudflare projects API for deterministic testing
    await page.route("**/api/cloudflare/projects", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "mock_ecuaplac",
              name: "ecuaplac",
              subdomain: "ecuaplac.pages.dev",
              domains: ["ecuaplac.com"],
              production_branch: "main",
              canonical_deployment: {
                url: "https://ecuaplac.pages.dev",
                created_on: "2026-08-01T12:00:00Z",
              },
            },
          ],
        }),
      });
    });

    // Mock project health check API
    await page.route("**/api/cloudflare/project-health*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          status: 200,
          latency: 42,
          ssl: true,
          totalDeployments: 25,
          lastCommitHash: "7b4c91a",
          productionBranch: "main",
        }),
      });
    });
  });

  test("displays project cards from Cloudflare API", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h3:has-text('ecuaplac')")).toBeVisible();
    await expect(page.locator("text=ecuaplac.com")).toBeVisible();
  });

  test("opens ProjectDetailModal when clicking on a project card and can be closed", async ({ page }) => {
    await page.goto("/");

    // Click on the project card
    await page.locator("h3:has-text('ecuaplac')").click();

    // Verify presence of Clarity and Cloudflare direct links
    await expect(page.locator("text=Microsoft Clarity")).toBeVisible();
    await expect(page.locator("text=Cloudflare Analytics")).toBeVisible();

    // Close modal via "Volver a Proyectos" button
    await page.locator("button:has-text('Volver a Proyectos')").click();
    await expect(page.locator("text=Microsoft Clarity")).not.toBeVisible();
  });
});
