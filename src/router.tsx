import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,        // 30s avant revalidation
        // 7 jours : le cache est persisté en IndexedDB pour le mode hors-ligne
        gcTime: 7 * 24 * 60 * 60_000,
        retry: 1,                 // 1 tentative de réessai
        refetchOnWindowFocus: false, // Pas de refetch au focus (performance)
        // Hors-ligne : servir le cache au lieu de rester en "pending"
        networkMode: "offlineFirst",
      },
      mutations: {
        networkMode: "offlineFirst",
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
