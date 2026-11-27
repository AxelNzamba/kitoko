import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-warehouse-CcCp6zte.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY = "indus-erp:selected-warehouse";
var WarehouseContext = (0, import_react.createContext)(null);
function WarehouseProvider({ children }) {
	const { data: warehouses = [], isLoading } = useQuery({
		queryKey: ["warehouses"],
		queryFn: async () => {
			const { data, error } = await supabase.from("warehouses").select("id, name, code, address, is_active").eq("is_active", true).order("name");
			if (error) throw error;
			return data ?? [];
		}
	});
	const [selectedWarehouseId, setSelectedWarehouseIdState] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return "all";
		return localStorage.getItem(STORAGE_KEY) ?? "all";
	});
	const setSelectedWarehouseId = (0, import_react.useCallback)((id) => {
		setSelectedWarehouseIdState(id);
		if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
	}, []);
	(0, import_react.useEffect)(() => {
		if (selectedWarehouseId === "all") return;
		if (!warehouses.some((w) => w.id === selectedWarehouseId) && warehouses.length > 0) setSelectedWarehouseId("all");
	}, [
		warehouses,
		selectedWarehouseId,
		setSelectedWarehouseId
	]);
	const selectedWarehouse = (0, import_react.useMemo)(() => warehouses.find((w) => w.id === selectedWarehouseId) ?? null, [warehouses, selectedWarehouseId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarehouseContext.Provider, {
		value: {
			warehouses,
			selectedWarehouseId,
			setSelectedWarehouseId,
			selectedWarehouse,
			isLoading
		},
		children
	});
}
function useWarehouse() {
	const ctx = (0, import_react.useContext)(WarehouseContext);
	if (!ctx) throw new Error("useWarehouse must be used within WarehouseProvider");
	return ctx;
}
//#endregion
export { useWarehouse as n, WarehouseProvider as t };
