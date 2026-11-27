import { useWarehouse } from "@/hooks/use-warehouse";

/**
 * Applique le filtre entrepôt actuellement sélectionné à une requête Supabase.
 * Si "Tous les entrepôts" est sélectionné (ou aucun entrepôt), la requête
 * n'est pas modifiée.
 */
export function useWarehouseFilter() {
  const { selectedWarehouseId } = useWarehouse();

  function applyFilter<T extends { eq: (column: string, value: any) => T }>(
    query: T,
    column = "warehouse_id",
  ): T {
    if (selectedWarehouseId && selectedWarehouseId !== "all") {
      return query.eq(column, selectedWarehouseId);
    }
    return query;
  }

  return { selectedWarehouseId, applyFilter };
}

/**
 * Helper synchrone pour appliquer le filtre quand on n'est pas dans un hook
 * (par exemple dans une server function ou un utilitaire pur).
 */
export function withWarehouseFilter<T extends { eq: (column: string, value: any) => T }>(
  query: T,
  warehouseId: string | "all" | null | undefined,
  column = "warehouse_id",
): T {
  if (warehouseId && warehouseId !== "all") {
    return query.eq(column, warehouseId);
  }
  return query;
}

