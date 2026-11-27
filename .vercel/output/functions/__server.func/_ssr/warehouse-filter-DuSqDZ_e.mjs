import { n as useWarehouse } from "./use-warehouse-CcCp6zte.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/warehouse-filter-DuSqDZ_e.js
/**
* Applique le filtre entrepôt actuellement sélectionné à une requête Supabase.
* Si "Tous les entrepôts" est sélectionné (ou aucun entrepôt), la requête
* n'est pas modifiée.
*/
function useWarehouseFilter() {
	const { selectedWarehouseId } = useWarehouse();
	function applyFilter(query, column = "warehouse_id") {
		if (selectedWarehouseId && selectedWarehouseId !== "all") return query.eq(column, selectedWarehouseId);
		return query;
	}
	return {
		selectedWarehouseId,
		applyFilter
	};
}
//#endregion
export { useWarehouseFilter as t };
