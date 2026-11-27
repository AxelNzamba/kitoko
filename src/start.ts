import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { logger } from "./lib/logger";
import { captureException } from "./lib/sentry";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    logger.error("Erreur middleware request", { error: String(error) });
    captureException(error, { route: "request_middleware" });
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

/**
 * CSRF (OWASP) : les server functions sont des endpoints RPC same-origin.
 * On ne valide que les requêtes de type serverFn (`filter`) — le rendu SSR et
 * les routes restent accessibles. L'origine de confiance est celle déployée
 * (VITE_APP_URL) ; en local, localhost:8080 est toujours accepté.
 */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  origin: (value) =>
    value === "http://localhost:8080" ||
    value === "http://127.0.0.1:8080" ||
    value === (process.env.VITE_APP_URL ?? "https://example.vercel.app"),
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [csrfMiddleware, errorMiddleware],
}));
