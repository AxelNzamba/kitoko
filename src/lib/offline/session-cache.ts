import type { AppRole } from "@/lib/modules";

/**
 * Cache local des rôles de l'utilisateur.
 *
 * Les rôles sont normalement lus depuis la table `user_roles`. Sans réseau,
 * cette requête échoue : on retombe alors sur la dernière valeur connue pour
 * garder les menus et les permissions d'affichage cohérents.
 *
 * Sécurité : ce cache ne sert qu'à l'affichage. Les autorisations réelles
 * restent appliquées côté serveur (RLS + server functions).
 */
const KEY = "indus-erp:roles-cache";

type Entry = { userId: string; roles: AppRole[]; savedAt: number };

export function saveCachedRoles(userId: string, roles: AppRole[]): void {
  if (typeof window === "undefined") return;
  try {
    const entry: Entry = { userId, roles, savedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(entry));
  } catch { /* quota */ }
}

export function readCachedRoles(userId: string): AppRole[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry;
    return entry.userId === userId ? entry.roles : null;
  } catch {
    return null;
  }
}

export function clearCachedRoles(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/** Vrai si le navigateur se déclare hors-ligne. */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}
