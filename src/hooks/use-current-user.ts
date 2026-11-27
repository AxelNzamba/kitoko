import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setSentryUser } from "@/lib/sentry";
import type { AppRole } from "@/lib/modules";
import {
  clearCachedRoles,
  isOffline,
  readCachedRoles,
  saveCachedRoles,
} from "@/lib/offline/session-cache";

export type CurrentUser = {
  user: User | null;
  roles: AppRole[];
  loading: boolean;
};

/**
 * Utilisateur courant + rôles.
 *
 * Résilient hors-ligne :
 * - la session est lue localement (`getSession`) et non via le réseau ;
 * - les rôles sont mis en cache et réutilisés si la requête échoue
 *   (coupure réseau). Les droits réels restent contrôlés côté serveur.
 */
export function useCurrentUser(): CurrentUser {
  const [state, setState] = useState<CurrentUser>({ user: null, roles: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    async function load(user: User | null) {
      if (!user) {
        clearCachedRoles();
        if (!cancelled) setState({ user: null, roles: [], loading: false });
        return;
      }

      const cached = readCachedRoles(user.id);

      // Monitoring : associer l'utilisateur aux erreurs Sentry (id seul — pas
      // d'email, pour éviter les PII dans les events).
      setSentryUser({ id: user.id });

      // Affichage immédiat depuis le cache (évite le clignotement des menus)
      if (cached && !cancelled) setState({ user, roles: cached, loading: false });

      if (isOffline() && cached) return;

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        if (cancelled) return;
        if (error) throw error;
        const roles = (data ?? []).map((r) => r.role as AppRole);
        saveCachedRoles(user.id, roles);
        setState({ user, roles, loading: false });
      } catch {
        if (cancelled) return;
        setState({ user, roles: cached ?? [], loading: false });
      }
    }

    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
