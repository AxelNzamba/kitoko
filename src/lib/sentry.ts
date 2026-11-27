/**
 * Configuration Sentry pour le monitoring des erreurs
 * (côté client et serveur SSR).
 *
 * Prérequis :
 * 1. Créer un projet Sentry (https://sentry.io)
 * 2. Définir VITE_SENTRY_DSN dans .env
 * 3. (Optionnel) SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
 *    pour l'upload des source maps dans CI/CD
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SentryEvent {
  exception?: { values?: Array<{ value?: string }> };
  [key: string]: any;
}

interface SentryModule {
  init: (opts: Record<string, unknown>) => void;
  captureException: (error: unknown, opts?: Record<string, unknown>) => string;
  captureMessage: (message: string, opts?: Record<string, unknown>) => string;
  setTag: (key: string, value: string) => void;
  setUser: (user: { id?: string; email?: string } | null) => void;
}

let _sentry: SentryModule | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getDsn(): string | undefined {
  if (isBrowser()) {
    try {
      return (import.meta as any).env?.VITE_SENTRY_DSN;
    } catch {
      return undefined;
    }
  }
  return process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN;
}

function getEnvironment(): string {
  return process.env.NODE_ENV || "development";
}

function getRelease(): string {
  return process.env.SENTRY_RELEASE || `indus-erp@${new Date().toISOString().slice(0, 10)}`;
}

/**
 * Initialise Sentry si le DSN est configuré.
 * Retourne une Promise — l'appelant peut ignorer le résultat.
 */
export async function initSentry(): Promise<void> {
  const dsn = getDsn();
  if (!dsn) {
    if (getEnvironment() !== "production") {
      console.info("[Sentry] DSN non configuré. Monitoring désactivé.");
    }
    return;
  }

  try {
    const sentry = isBrowser()
      ? await import("@sentry/react")
      : await import("@sentry/node");

    sentry.init({
      dsn,
      environment: getEnvironment(),
      release: getRelease(),
      tracesSampleRate: getEnvironment() === "production" ? 0.2 : 0.0,
      replaysSessionSampleRate: isBrowser() && getEnvironment() === "production" ? 0.1 : 0.0,
      replaysOnErrorSampleRate: isBrowser() && getEnvironment() === "production" ? 1.0 : 0.0,
      enabled: getEnvironment() === "production",
      beforeSend(event: SentryEvent) {
        if (getEnvironment() !== "production") {
          console.info("[Sentry] Event capturé (non envoyé en dev):", event.exception?.values?.[0]?.value);
          return null;
        }
        return event;
      },
    } as any);

    _sentry = sentry as unknown as SentryModule;
    console.info(`[Sentry] Initialisé (${isBrowser() ? "client" : "serveur"})`);
  } catch (error) {
    console.warn("[Sentry] Erreur d'initialisation:", error);
  }
}

/**
 * Capture une exception et l'envoie à Sentry.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): string {
  if (!_sentry) return "";
  return _sentry.captureException(error, context);
}

/**
 * Capture un message informatif.
 */
export function captureMessage(message: string, context?: Record<string, unknown>): string {
  if (!_sentry) return "";
  return _sentry.captureMessage(message, context);
}

/**
 * Ajoute un tag contextuel.
 */
export function setSentryTag(key: string, value: string): void {
  _sentry?.setTag(key, value);
}

/**
 * Associe un utilisateur aux events Sentry.
 */
export function setSentryUser(user: { id?: string; email?: string } | null): void {
  _sentry?.setUser(user);
}
