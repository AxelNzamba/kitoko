import { supabase } from "@/integrations/supabase/client";

/**
 * Suivi des erreurs du site : chaque plantage est enregistré dans la table
 * `error_logs`, consultable par le Propriétaire sur la page « Surveillance ».
 * Anti-boucle : doublons ignorés pendant 60 s, max 20 envois par session.
 */
const seen = new Map<string, number>();
let sent = 0;
const MAX_PER_SESSION = 20;

export function reportError(error: unknown, source = "manuel"): void {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) return; // pas d'envoi pendant le développement
  if (!navigator.onLine || sent >= MAX_PER_SESSION) return;
  const message = (
    error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error)
  )?.slice(0, 2000) || "Erreur inconnue";
  const key = `${source}:${message}`;
  const now = Date.now();
  if ((seen.get(key) ?? 0) > now - 60_000) return;
  seen.set(key, now);
  sent++;
  void (async () => {
    const { data } = await supabase.auth.getSession();
    await supabase.from("error_logs").insert({
      message,
      stack: error instanceof Error ? error.stack?.slice(0, 8000) ?? null : null,
      url: window.location.pathname.slice(0, 500),
      source,
      user_agent: navigator.userAgent.slice(0, 300),
      user_id: data.session?.user.id ?? null,
    });
  })().catch(() => {});
}

let installed = false;
export function installErrorTracking(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (e) => reportError(e.error ?? e.message, "page"));
  window.addEventListener("unhandledrejection", (e) => reportError(e.reason, "promesse"));
}
