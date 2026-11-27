import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useWarehouse } from "@/hooks/use-warehouse";
import type { AppRole } from "@/lib/modules";

export type Favorite = {
  id: string;
  user_id: string;
  type: string;
  target: string;
  label: string;
  role: AppRole | null;
  warehouse_id: string | null;
  sort_order: number;
};

/**
 * Favoris et raccourcis d'un utilisateur, filtrés par rôle actif et par
 * entrepôt sélectionné. Un favori sans entrepôt est global (tous entrepôts).
 */
export function useFavorites() {
  const qc = useQueryClient();
  const { user, roles } = useCurrentUser();
  const { selectedWarehouseId } = useWarehouse();
  const role: AppRole | null = roles[0] ?? null;

  const { data: all = [], isLoading } = useQuery({
    queryKey: ["user-favorites", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_favorites")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Favorite[];
    },
  });

  // Visible si : même rôle (ou favori sans rôle) ET même entrepôt (ou global)
  const favorites = all.filter((f) => {
    const roleOk = !f.role || !role || f.role === role;
    const whOk =
      !f.warehouse_id ||
      selectedWarehouseId === "all" ||
      f.warehouse_id === selectedWarehouseId;
    return roleOk && whOk;
  });

  const add = useMutation({
    mutationFn: async (fav: {
      type: string;
      target: string;
      label: string;
      scopeWarehouse?: boolean;
    }) => {
      if (!user?.id) throw new Error("Non authentifié");
      const { error } = await (supabase as any).from("user_favorites").insert({
        user_id: user.id,
        type: fav.type,
        target: fav.target,
        label: fav.label,
        role,
        warehouse_id:
          fav.scopeWarehouse && selectedWarehouseId !== "all"
            ? selectedWarehouseId
            : null,
        sort_order: all.length,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-favorites"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("user_favorites")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-favorites"] }),
  });

  function findByTarget(target: string) {
    return favorites.find((f) => f.target === target) ?? null;
  }

  return { favorites, allFavorites: all, isLoading, add, remove, findByTarget, role };
}
