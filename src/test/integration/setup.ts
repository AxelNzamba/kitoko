/**
 * Configuration des tests d'intégration.
 *
 * Ces tests utilisent une vraie base Supabase avec RLS actif.
 * Ils sont destinés à être exécutés avec une base de test dédiée.
 *
 * Configuration requise (facultative) :
 *   VITE_SUPABASE_URL=http://127.0.0.1:54321
 *   VITE_SUPABASE_ANON_KEY=eyJhbGci...     (ou VITE_SUPABASE_PUBLISHABLE_KEY)
 *   TEST_USER_EMAIL=test@indus-erp.com
 *   TEST_USER_PASSWORD=test-password-123
 *
 * Comportement :
 *   - Variables absentes ou URL mock → tests ignorés en mode dégradé
 *     (les expectations sont neutralisées par `supabaseAvailable`).
 *   - Stack locale joignable → l'utilisateur de test est créé au besoin
 *     (auto-confirm local) puis utilisé pour les requêtes authentifiées.
 *
 * ⚠️ Ne pas définir ces variables en CI sans base dédiée : le mode dégradé
 * garantit que les tests ne plantent pas, mais ils ne valident alors rien.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL =
  (typeof process !== "undefined" && process.env.VITE_SUPABASE_URL) || "https://mock.supabase.co";
const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" && process.env.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  // Ancien nommage (compatibilité .env existants)
  process.env.VITE_SUPABASE_KEY ||
  "mock-key";

export const TEST_USER_EMAIL =
  (typeof process !== "undefined" && process.env.TEST_USER_EMAIL) || "test@indus-erp.com";
export const TEST_USER_PASSWORD =
  (typeof process !== "undefined" && process.env.TEST_USER_PASSWORD) || "test-password-123";

/** Client Supabase pour les tests (RLS actif). */
export const testClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Détection EXPLICITE de la disponibilité de la base :
 * un ping HTTP léger sur /auth/v1/health, sans verdict sur le contenu.
 * (L'ancien schéma déduisait « base absente » d'un data===null, ce qui rendait
 * le mode dégradé dépendant des politiques RLS et des variables d'env.)
 *
 * Sécurité : seules les URL locales (localhost / 127.0.0.1 / [::1]) sont
 * utilisées. Le `.env` du projet pointe sur la production ; sans ce garde,
 * `signInWithPassword` puis `signUp` seraient exécutés sur la base réelle.
 * Pour cibler volontairement une base distante DÉDIÉE aux tests :
 * ALLOW_REMOTE_TEST_DB=1.
 */
const LOCAL_SUPABASE_URL = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?(\/|$)/i;
const REMOTE_TEST_DB_ALLOWED = process.env.ALLOW_REMOTE_TEST_DB === "1";

export const supabaseAvailable = await (async () => {
  if (SUPABASE_URL.includes("mock.supabase.co")) return false;
  if (typeof fetch !== "function") return false;
  if (!LOCAL_SUPABASE_URL.test(SUPABASE_URL) && !REMOTE_TEST_DB_ALLOWED) {
    console.warn(
      "[test-setup] URL Supabase non locale ignorée : tests d'intégration en mode " +
        "dégradé. Lancez `supabase start` ou définissez ALLOW_REMOTE_TEST_DB=1 avec " +
        "une base de test dédiée (jamais la production).",
    );
    return false;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/health`, {
      signal: controller.signal,
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
})();

/**
 * Assure l'existence d'un utilisateur de test et retourne sa session.
 * - Création via signUp (auto-confirm activé en local → session immédiate).
 * - Si l'email existe déjà : connexion classique.
 * Retourne null si la base est indisponible.
 */
export async function signInAsTestUser() {
  if (!supabaseAvailable) return null;

  // 1) Tentative de connexion directe (l'utilisateur existe déjà)
  const { data: signInData, error: signInError } = await testClient.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });
  if (!signInError && signInData.user) return signInData.user;

  // 2) Sinon : création (auto-confirm local → session immédiate).
  //    Si les confirmations email sont activées ([auth.email] enable_confirmations),
  //    aucune session n'est renvoyée : on confirme alors l'email directement en base
  //    (docker exec psql) puis on se connecte.
  const { data: signUpData, error: signUpError } = await testClient.auth.signUp({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    options: { data: { full_name: "Utilisateur de test" } },
  });
  if (!signUpError && signUpData.session) return signUpData.user;

  if (!signUpError && signUpData.user && !signUpData.session) {
    const confirmed = await confirmTestUserInDb(signUpData.user.id);
    if (confirmed) {
      const { data: afterConfirm } = await testClient.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });
      if (afterConfirm?.user) return afterConfirm.user;
    }
  }

  // 3) Dernière chance : reconnexion (cas où le compte existe avec un autre mot de passe)
  const { data: retry, error: retryError } = await testClient.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });
  if (!retryError && retry.user) return retry.user;

  console.warn(
    "[test-setup] Utilisateur de test inutilisable :",
    signUpError?.message ?? signInError?.message,
  );
  return null;
}

/**
 * Confirme l'email d'un utilisateur directement en base (contournement du flux
 * email pour l'amorçage des tests). Nécessite docker + psql ; échec non bloquant
 * (le warn final expliquera l'impossibilité de connexion).
 */
async function confirmTestUserInDb(userId: string): Promise<boolean> {
  try {
    const { execFileSync } = await import("node:child_process");
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
        `UPDATE auth.users SET email_confirmed_at = now(), updated_at = now() WHERE id = '${userId}';`,
      ],
      { stdio: "pipe", timeout: 15_000 },
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Nettoie les données de test après les tests.
 */
export async function cleanupTestData(table: string, ids: string[]) {
  if (ids.length === 0) return;
  // Supprimer via le client de test (RLS actif) — nécessite les droits DELETE.
  for (const id of ids) {
    await (testClient.from as any)(table).delete().eq("id", id);
  }
}
