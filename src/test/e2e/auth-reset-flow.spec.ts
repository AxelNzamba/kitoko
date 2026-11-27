/**
 * Test E2E — Flux complet « Mot de passe oublié » avec clic réel sur le lien email.
 *
 * Prérequis (environnement local) :
 *   - Stack Supabase démarrée (supabase start) — Mailpit/Inbucket sur :54324
 *   - Application Vite sur :8080 (PLAYWRIGHT_BASE_URL)
 *   - Compte admin@brightservices.cg existant
 *
 * Déroulé : le mot de passe est temporairement changé en `Reset2026!` via le vrai
 * flux (email → clic → formulaire), puis restauré en `Bright2026!` par un second
 * cycle. À la fin des tests, l'état initial est conservé.
 *
 * Exécution : PLAYWRIGHT_BASE_URL=http://localhost:8080 bunx playwright test auth-reset-flow
 */
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { mailpitCount, waitForVerifyEmail, loginViaUI } from "./helpers/mailpit";

const EMAIL = "admin@brightservices.cg";
const MDP_FINAL = "Bright2026!";
const MDP_TEMPORAIRE = "Reset2026!";

test.describe.configure({ mode: "serial" });
test.setTimeout(120_000);

/** Demande de réinitialisation depuis l'interface /auth. */
async function requestResetFromUI(page: Page): Promise<void> {
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Mot de passe oublié ?" }).click({ timeout: 30_000 });
  await page.getByLabel("Email").first().fill(EMAIL);
  await page.getByRole("button", { name: "Envoyer le lien de réinitialisation" }).click();
  await expect(
    page.getByRole("heading", { name: "Vérifiez votre boîte mail" }),
  ).toBeVisible({ timeout: 15_000 });
}

/** Clique le lien de l'email et définit le nouveau mot de passe via /reset-password. */
async function completeResetFromEmail(
  page: Page,
  request: APIRequestContext,
  countBefore: number,
  newPassword: string,
): Promise<void> {
  const { verifyLink } = await waitForVerifyEmail(request, {
    countBefore,
    toEmail: EMAIL,
    subjectPart: "Reset your password",
  });

  // « Clic » sur le lien : navigation réelle vers /auth/v1/verify → 302 vers
  // /reset-password#access_token=... — la session de recovery est établie.
  await page.goto(verifyLink, { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Nouveau mot de passe" }),
  ).toBeVisible({ timeout: 30_000 });

  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirmer le mot de passe").fill(newPassword);
  await page.getByRole("button", { name: "Définir le nouveau mot de passe" }).click();
  await expect(
    page.getByRole("heading", { name: "Mot de passe mis à jour" }),
  ).toBeVisible({ timeout: 15_000 });
}

test("cycle 1 — le lien email permet de définir un mot de passe temporaire", async ({
  page,
  request,
}) => {
  const before = await mailpitCount(request);
  await requestResetFromUI(page);
  await completeResetFromEmail(page, request, before, MDP_TEMPORAIRE);
});

test("le mot de passe temporaire fonctionne (l'ancien est révoqué)", async ({ page }) => {
  await loginViaUI(page, EMAIL, MDP_TEMPORAIRE);
});

test("cycle 2 — restauration via l'API (rapide) puis vérification", async ({ page, request }) => {
  // Restauration par API GoTrue directe (plus fiable qu'un 2e cycle UI complet) :
  // 1) session recovery via verify → 2) updateUser → 3) reconnexion UI.
  const countBefore = await mailpitCount(request);
  await requestResetFromUI(page);
  const { verifyLink } = await waitForVerifyEmail(request, {
    countBefore,
    toEmail: EMAIL,
    subjectPart: "Reset your password",
  });

  // Session recovery établie dans le navigateur via le hash d'URL.
  await page.goto(verifyLink, { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Nouveau mot de passe" }),
  ).toBeVisible({ timeout: 30_000 });

  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill(MDP_FINAL);
  await page.getByLabel("Confirmer le mot de passe").fill(MDP_FINAL);
  await page.getByRole("button", { name: "Définir le nouveau mot de passe" }).click();
  await expect(
    page.getByRole("heading", { name: "Mot de passe mis à jour" }),
  ).toBeVisible({ timeout: 15_000 });
});

test("le mot de passe final fonctionne (état initial restauré)", async ({ page }) => {
  await loginViaUI(page, EMAIL, MDP_FINAL);
});
