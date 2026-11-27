import type { SupabaseClient } from "@supabase/supabase-js";

export type AppRole = "proprietaire" | "magasinier" | "caissier" | "receptionniste";

/**
 * Vérifie que l'utilisateur authentifié possède au moins l'un des rôles requis.
 * Utilise le client Supabase déjà scopé à l'utilisateur (via requireSupabaseAuth),
 * donc respecte RLS et ne peut pas être détourné.
 *
 * Jette une Response 403 si non autorisé — TanStack la remonte proprement au client.
 */
export async function requireRole(
  context: { supabase: SupabaseClient; userId: string },
  roles: AppRole[],
): Promise<void> {
  const { data, error } = await context.supabase
    .rpc("has_any_role", { _user_id: context.userId, _roles: roles });

  if (error) {
    throw new Response(`RBAC check failed: ${error.message}`, { status: 500 });
  }
  if (!data) {
    throw new Response(
      `Forbidden: requires one of [${roles.join(", ")}]`,
      { status: 403 },
    );
  }
}
