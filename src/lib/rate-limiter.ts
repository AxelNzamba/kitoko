/**
 * Rate Limiter simple en mémoire.
 * Utilisé côté serveur pour protéger les endpoints sensibles.
 *
 * Usage:
 *   import { rateLimiter } from "@/lib/rate-limiter";
 *
 *   // Dans un handler serveur (ex: server.ts ou route API)
 *   const clientIp = request.headers.get("x-forwarded-for") ?? "unknown";
 *   const { allowed, retryAfter } = rateLimiter.check("sale-create", clientIp);
 *   if (!allowed) {
 *     return new Response("Trop de requêtes. Réessayez dans " + retryAfter + "s.", {
 *       status: 429,
 *       headers: { "Retry-After": String(retryAfter) },
 *     });
 *   }
 *
 * Endpoints configurables dans le bloc `configs` ci-dessous.
 * - `default`: 100 req/min
 * - `login`: 5 req/min
 * - `signup`: 3 req/5min
 * - `stock-movement`: 30 req/min
 * - `sale-create`: 20 req/min
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Nombre maximum de requêtes autorisées */
  maxRequests: number;
  /** Fenêtre de temps en secondes */
  windowSeconds: number;
}

// Nettoyage périodique des entrées expirées
const CLEANUP_INTERVAL = 60_000; // toutes les 60s

const configs: Record<string, RateLimitConfig> = {
  // Endpoints généraux
  default: { maxRequests: 100, windowSeconds: 60 },
  // Auth
  login: { maxRequests: 5, windowSeconds: 60 },
  signup: { maxRequests: 3, windowSeconds: 300 },
  // Opérations coûteuses
  "stock-movement": { maxRequests: 30, windowSeconds: 60 },
  "sale-create": { maxRequests: 20, windowSeconds: 60 },
};

const store = new Map<string, RateLimitEntry>();

// Nettoyage automatique des entrées expirées
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
}

export const rateLimiter = {
  /**
   * Vérifie si une requête est autorisée.
   * @returns { allowed, retryAfter } - retryAfter en secondes, 0 si pas de limite
   */
  check(
    endpoint: string,
    clientId: string,
  ): { allowed: boolean; retryAfter: number } {
    const config = configs[endpoint] ?? configs.default;
    const key = `${endpoint}:${clientId}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      // Nouvelle fenêtre
      store.set(key, {
        count: 1,
        resetAt: now + config.windowSeconds * 1000,
      });
      return { allowed: true, retryAfter: 0 };
    }

    if (entry.count >= config.maxRequests) {
      // Limite atteinte
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Incrémente le compteur
    entry.count++;
    return { allowed: true, retryAfter: 0 };
  },

  /**
   * Réinitialise le compteur pour un endpoint/client.
   */
  reset(endpoint: string, clientId: string) {
    const key = `${endpoint}:${clientId}`;
    store.delete(key);
  },

  /**
   * Retourne les statistiques du rate limiter (debug).
   */
  stats() {
    const now = Date.now();
    const active = [...store.entries()].filter(([_, e]) => e.resetAt > now);
    return {
      totalEntries: store.size,
      activeEntries: active.length,
      configs: Object.keys(configs),
    };
  },
};
