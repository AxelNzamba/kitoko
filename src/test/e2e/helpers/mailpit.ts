/**
 * Helpers partagés pour les tests E2E impliquant des emails auth
 * (récupération de mot de passe, confirmation d'inscription).
 *
 * Prérequis : Mailpit/Inbucket accessible sur MAILPIT_URL (défaut 127.0.0.1:54324),
 * lequel reçoit les emails de la stack Supabase locale.
 */
import type { APIRequestContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const MAILPIT_API = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

export interface VerifyEmail {
  subject: string;
  /** URL /auth/v1/verify extraite du HTML (idempotente en local). */
  verifyLink: string;
}

/** Nombre total de messages dans Mailpit. */
export async function mailpitCount(request: APIRequestContext): Promise<number> {
  const res = await request.get(`${MAILPIT_API}/api/v1/messages?limit=1`);
  if (!res.ok()) throw new Error(`Mailpit injoignable (${res.status()})`);
  const data = await res.json();
  return data.messages_count as number;
}

/**
 * Attend l'arrivée d'un NOUVEL email (au-delà de countBefore) destiné à `toEmail`
 * dont le sujet contient `subjectPart`, puis retourne le lien /auth/v1/verify
 * extrait du HTML.
 */
export async function waitForVerifyEmail(
  request: APIRequestContext,
  opts: { countBefore: number; toEmail: string; subjectPart: string },
): Promise<VerifyEmail> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const res = await request.get(`${MAILPIT_API}/api/v1/messages?limit=20`);
    if (res.ok()) {
      const data = await res.json();
      const messages = (data.messages ?? []) as Array<{
        ID: string;
        Subject: string;
        To: Array<{ Address: string }>;
      }>;
      const found = messages.find(
        (m) =>
          (data.messages_count as number) > opts.countBefore &&
          m.Subject.includes(opts.subjectPart) &&
          m.To?.[0]?.Address === opts.toEmail,
      );
      if (found) {
        const detail = await (await request.get(`${MAILPIT_API}/api/v1/message/${found.ID}`)).json();
        const html: string = (detail.HTML as string) ?? (detail.html as string) ?? "";
        const match = html.match(/https?:\/\/[^"'\s<>]+auth\/v1\/verify[^"'\s<>]*/);
        if (match) {
          return {
            subject: found.Subject,
            verifyLink: match[0].replace(/&amp;/g, "&"),
          };
        }
      }
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error(
    `Aucun email « ${opts.subjectPart} » pour ${opts.toEmail} reçu dans Mailpit sous 30 s`,
  );
}

/**
 * « Clique » le lien de vérification via l'API GoTrue (GET /auth/v1/verify).
 * Idempotent en local (pas de jeton à usage unique contraignant), ce qui permet
 * de réutiliser le même lien dans plusieurs tests de la suite.
 */
export async function confirmViaVerifyLink(
  request: APIRequestContext,
  verifyLink: string,
): Promise<void> {
  const res = await request.get(verifyLink, { maxRedirects: 0 });
  expect(res.status()).toBeLessThan(500);
}

/** Connexion classique depuis /auth jusqu'au dashboard. */
export async function loginViaUI(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(email, { timeout: 30_000 });
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
}
