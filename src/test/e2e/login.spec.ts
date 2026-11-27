import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display the login page with correct title", async ({ page }) => {
    await page.goto("/auth");

    // Vérifier que la page de connexion s'affiche
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Connexion|INDUS-ERP/);
  });

  test("should show validation errors with empty fields", async ({ page }) => {
    await page.goto("/auth");
    await page.click('button[type="submit"]');

    // Vérifier qu'un message d'erreur apparaît
    await expect(page.locator("text=requis")).toBeVisible();
  });

  test("should toggle between login and register", async ({ page }) => {
    await page.goto("/auth");

    // Cliquer sur "Créer un compte"
    const toggleButton = page.locator("text=Créer un compte");
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(page.locator("text=nom")).toBeVisible();
    }
  });
});
