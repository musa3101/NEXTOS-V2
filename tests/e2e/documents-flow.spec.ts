import { test, expect } from "@playwright/test";
import { setAuthenticatedSession } from "./helpers/auth";

test.describe("Documents Flow & Generator", () => {
  test.beforeEach(async ({ context, page }) => {
    await setAuthenticatedSession(context);

    // Mock documents API
    await page.route("**/api/documents", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "doc_1",
            number: "INV-2026-001",
            type: "invoice",
            total_amount: 1200,
            status: "draft",
            created_at: "2026-08-01T10:00:00Z",
            clients: { name: "Carlos Mendoza", company: "ECUAPLAC" },
            projects: { name: "Web Ecuaplac" },
          },
        ]),
      });
    });

    // Mock clients and projects APIs
    await page.route("**/api/clients", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ id: "client_1", name: "Carlos Mendoza", company: "ECUAPLAC" }]),
      });
    });

    await page.route("**/api/projects", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ id: "proj_1", name: "Web Ecuaplac", client_id: "client_1" }]),
      });
    });
  });

  test("loads documents table with mock data", async ({ page }) => {
    await page.goto("/documents");
    await expect(page.locator("text=INV-2026-001").filter({ visible: true })).toBeVisible();
    await expect(page.locator("text=Carlos Mendoza").filter({ visible: true })).toBeVisible();
  });

  test("opens Document Creator modal and can cancel/close it", async ({ page }) => {
    await page.goto("/documents");

    await page.click("button:has-text('Nuevo Documento')");
    await expect(page.locator("text=Generar Factura Oficial")).toBeVisible();

    // Verify modal elements
    await expect(page.locator("text=Documento PDF con diseño Luxury MyNext.")).toBeVisible();

    // Switch tab to Propuesta Demo inside modal form
    await page.locator("form button:has-text('Propuesta Demo')").click();
    await expect(page.locator("text=Generar Propuesta de Demo")).toBeVisible();

    // Close modal via close button
    await page.locator("button[aria-label='Cerrar modal']").click();
    await expect(page.locator("text=Generar Propuesta de Demo")).not.toBeVisible();
  });

  test("opens Document Creator with preselected proposal via URL query params", async ({ page }) => {
    await page.goto("/documents?action=new&type=proposal");
    await expect(page.locator("text=Generar Propuesta de Demo")).toBeVisible();
    await expect(page.locator("text=URL de la Demo Web")).toBeVisible();

    // Close modal via Cancel button
    await page.click("button:has-text('Cancelar')");
    await expect(page.locator("text=Generar Propuesta de Demo")).not.toBeVisible();
  });
});
