import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initSentry, captureException } from "../lib/sentry";
import { logger } from "../lib/logger";
import { createIdbPersister, OFFLINE_CACHE_MAX_AGE } from "../lib/offline/query-persister";
import { Toaster } from "@/components/ui/sonner";
import { installErrorTracking, reportError } from "../lib/error-tracking";

// Initialisation Sentry côté client
initSentry().catch(() => {});
installErrorTracking();

// Enregistrement du Service Worker pour le mode hors-ligne (PWA)
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silencieux — le SW est optionnel
    });
  });
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Erreur 404</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Page introuvable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  logger.error("Erreur non gérée (boundary racine)", {
    error: error instanceof Error ? error.message : String(error),
  });
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    reportError(error, "ecran_erreur");
    // Envoyer l'erreur à Sentry + log structuré
    captureException(error, { boundary: "tanstack_root_error_component" });
    logger.error("Erreur boundary racine", {
      error: error instanceof Error ? error.message : String(error),
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Erreur inattendue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur s'est produite. Vous pouvez réessayer ou revenir à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "INDUS-ERP — Gestion de stock industriel" },
      {
        name: "description",
        content:
          "Logiciel de gestion de stock industriel moderne : produits, ventes, achats, inventaire, QR codes, certificats et rapports.",
      },
      { name: "author", content: "INDUS-ERP" },
      { property: "og:title", content: "INDUS-ERP — Gestion de stock industriel" },
      {
        property: "og:description",
        content:
          "Gérez votre entreprise industrielle depuis votre téléphone, tablette ou ordinateur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e8751a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="INDUS-ERP" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [persister] = useState(() => createIdbPersister());

  // Hors-ligne : le cache des requêtes est restauré depuis IndexedDB pour que
  // les dernières données consultées restent visibles sans réseau.
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: OFFLINE_CACHE_MAX_AGE,
          buster: "v1",
          dehydrateOptions: {
            shouldDehydrateQuery: (q) => q.state.status === "success",
          },
        }}
      >
        <Outlet />
        <Toaster richColors position="top-right" />
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
