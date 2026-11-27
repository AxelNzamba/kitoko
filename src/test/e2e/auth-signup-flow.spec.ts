/**
 * Test E2E — Inscription avec confirmation d'email (flux production-like).
 *
 * Prérequis :
 *   - Stack Supabase locale avec confirmations activées ([auth.email]
 *     enable_confirmations = true → GOTRUE_MAILER_AUTOCONFIRM=false)
 *   - Mailpit/Inbucket sur :54324, application Vite sur :8080
 *
 * Déroulé : inscription depuis l'UI → email « Confirm your email address » dans
 * Mailpit → connexion REFUSÉE avant confirmation → clic réel sur le lien
 * /auth/v1/verify (type=signup) → connexion ACCEPTÉE après.
 *
 * Exécution : PLAYWRIGHT_BASE_URL=http://localhost:8080 bunx playwright test auth-signup-flow
 */
import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mailpitCount, waitForVerifyEmail, loginViaUI } from "./helpers/mailpit";

/** Email FIXE : la purge en beforeAll rend le test ré-exécutable (idempotent). */
const EMAIL = "signup.e2e@indus-erp.com";
const PASSWORD = "Signup2026!";

test.describe.configure({ mode: "serial" });
test.setTimeout(120_000);

test.beforeAll(async () => {
  // Purge de l'utilisateur de test (et de son profil) pour permettre une
  // nouvelle inscription au même email. Sans docker/psql, on tente quand
  // même : le signUp échouera avec « User already registered » si non purgé.
  try {
    execFileSync(
      "docker",
      [
        "exec",
        "supabase_db_local",
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-c",
        // profiles.id référence auth.users(id) ON DELETE CASCADE : le DELETE
        // sur auth.users purge aussi le profil.
        "DELETE FROM auth.users WHERE email = '" + EMAIL + "';",
      ],
      { stdio: "pipe", timeout: 15_000 },
    );
  } catch {
    console.warn(
      "[auth-signup] Purge impossible (docker indisponible ?) — re-run peut échouer si l'email existe.",
    );
  }
});

/** Inscription depuis l'UI (/auth → onglet Créer un compte). */
async function signupViaUI(page: Page): Promise<void> {
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: "Créer un compte" }).click({ timeout: 30_000 });
  await page.getByLabel("Nom complet").fill("Utilisateur E2E");
  // Radix Tabs démonte l'onglet inactif : une fois « Créer un compte » actif,
  // il n'existe qu'un seul champ Email / Mot de passe dans le DOM.
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Mot de passe", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirmer le mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByRole("heading", { name: "Confirmez votre email" })).toBeVisible({
    timeout: 15_000,
  });
}

test("inscription depuis l'UI → écran « Confirmez votre email »", async ({ page }) => {
  await signupViaUI(page);
});

test("email « Confirm your email address » reçu dans Mailpit", async ({ request }) => {
  const before = await mailpitCount(request);
  expect(before).toBeGreaterThanOrEqual(0);
  const { subject } = await waitForVerifyEmail(request, {
    countBefore: before - 1, // l'email existe déjà (envoyé au test précédent)
    toEmail: EMAIL,
    subjectPart: "Confirm your email address",
  });
  expect(subject).toContain("Confirm your email address");
});

test("connexion refusée avant confirmation", async ({ page }) => {
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").first().fill(EMAIL, { timeout: 30_000 });
  await page.getByLabel("Mot de passe", { exact: true }).first().fill(PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByText("Email non confirmé — vérifiez votre boîte de réception."),
  ).toBeVisible({ timeout: 15_000 });
});

test("clic réel sur le lien de confirmation → connexion acceptée", async ({ page, request }) => {
  const { verifyLink } = await waitForVerifyEmail(request, {
    countBefore: 0, // tout email « Confirm your email address » convient
    toEmail: EMAIL,
    subjectPart: "Confirm your email address",
  });

  // Clic réel : navigation Playwright vers /auth/v1/verify → redirection /auth
  await page.goto(verifyLink, { waitUntil: "domcontentloaded" });

  await loginViaUI(page, EMAIL, PASSWORD);
});
