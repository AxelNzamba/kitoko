/**
 * Test E2E temporaire : flux de connexion et mot de passe oublié.
 * À exécuter avec : PLAYWRIGHT_BASE_URL=http://localhost:8080 bunx playwright test auth-flow
 */
import { test, expect } from "@playwright/test";

test.describe("Page /auth — améliorations", () => {
  test.describe.configure({ mode: "serial" });

  test("affiche les onglets, le lien mot de passe oublié et le toggle de visibilité", async ({
    page,
  }) => {
    await page.goto("/auth", { waitUntil: "domcontentloaded" });

    // Onglets Connexion / Créer un compte (attente large : première compilation Vite possible)
    await expect(page.getByRole("tab", { name: "Connexion" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("tab", { name: "Créer un compte" })).toBeVisible();

    // Titre du formulaire de connexion (h2 distinct du bouton submit)
    await expect(page.getByRole("heading", { name: "Se connecter" })).toBeVisible();

    // Lien « Mot de passe oublié ? » présent dans l'onglet connexion
    await expect(page.getByRole("button", { name: "Mot de passe oublié ?" })).toBeVisible();

    // Bouton œil (afficher/masquer le mot de passe)
    await expect(page.getByRole("button", { name: "Afficher le mot de passe" })).toBeVisible();

    // Onglet inscription : champ confirmation + jauge de robustesse
    await page.getByRole("tab", { name: "Créer un compte" }).click();
    await expect(page.getByLabel("Confirmer le mot de passe")).toBeVisible();

    // Politique de mot de passe affichée sous le champ
    await expect(
      page.getByText("8 caractères minimum, avec au moins une majuscule et un chiffre"),
    ).toBeVisible();
  });

  test("le lien mot de passe oublié ouvre le formulaire d'envoi d'email", async ({ page }) => {
    await page.goto("/auth", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Mot de passe oublié ?" }).click({ timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Mot de passe oublié" })).toBeVisible();

    // Email invalide → bloqué par la validation native du navigateur (type=email + required) :
    // la soumission n'a pas lieu, on reste sur le formulaire.
    await page.getByLabel("Email").fill("pas-un-email");
    await page
      .getByRole("button", { name: "Envoyer le lien de réinitialisation" })
      .click();
    await expect(page.getByRole("heading", { name: "Vérifiez votre boîte mail" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Mot de passe oublié" })).toBeVisible();

    // Email valide → écran de confirmation d'envoi
    await page.getByLabel("Email").fill("admin@brightservices.cg");
    await page.getByRole("button", { name: "Envoyer le lien de réinitialisation" }).click();
    await expect(page.getByRole("heading", { name: "Vérifiez votre boîte mail" })).toBeVisible({
      timeout: 15_000,
    });

    // Retour à la connexion
    await page.getByRole("button", { name: "Retour à la connexion" }).click();
    await expect(page.getByRole("tab", { name: "Connexion" })).toBeVisible();
  });

  test("connexion réelle avec les identifiants du compte admin", async ({ page }) => {
    await page.goto("/auth", { waitUntil: "domcontentloaded" });

    await page.getByLabel("Email").fill("admin@brightservices.cg", { timeout: 30_000 });
    const passwordInput = page.getByLabel("Mot de passe", { exact: true });
    await passwordInput.fill("Bright2026!");

    // Afficher le mot de passe via le bouton œil puis vérifier la valeur en clair
    await page.getByRole("button", { name: "Afficher le mot de passe" }).click();
    await expect(passwordInput).toHaveValue("Bright2026!");
    await expect(passwordInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Se connecter" }).click();

    // Redirection vers le dashboard après connexion réussie
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  });

  test("inscription avec mot de passe faible → rejeté avec message explicite", async ({
    page,
  }) => {
    await page.goto("/auth", { waitUntil: "domcontentloaded" });
    await page.getByRole("tab", { name: "Créer un compte" }).click({ timeout: 30_000 });
    await page.getByLabel("Nom complet").fill("Test Faible");
    await page.getByLabel("Email").fill(`faible.${Date.now()}@indus-erp.com`);
    await page.getByLabel("Mot de passe", { exact: true }).fill("faible12");
    await page.getByLabel("Confirmer le mot de passe").fill("faible12");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    // Validation Zod : toast d'erreur explicite (le même libellé existe aussi en
    // texte d'aide sous le champ — on cible le toast Sonner), pas d'écran de confirmation.
    const toast = page.locator("[data-sonner-toast]").filter({
      hasText: "8 caractères minimum, avec au moins une majuscule et un chiffre",
    });
    await expect(toast).toBeVisible();
    await expect(page.getByRole("heading", { name: "Confirmez votre email" })).not.toBeVisible();
  });

  test("la route /reset-password sans session affiche l'état lien invalide", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "Lien invalide ou expiré" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
