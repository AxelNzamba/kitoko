import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
import { n as useWarehouse } from "./use-warehouse-CcCp6zte.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-smart-alerts-D96ssWXG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SEEN_KEY = "indus-erp:seen-smart-alerts";
/** Garde en mémoire pour éviter les doublons entre plusieurs consommateurs du hook. */
var notifiedThisSession = /* @__PURE__ */ new Set();
function loadSeen() {
	if (typeof window === "undefined") return /* @__PURE__ */ new Set();
	try {
		return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"));
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function saveSeen(ids) {
	if (typeof window === "undefined") return;
	localStorage.setItem(SEEN_KEY, JSON.stringify([...ids].slice(-300)));
}
/**
* Notifications intelligentes par entrepôt :
* - stock critique (quantité <= seuil produit)
* - commandes fournisseurs en retard (date prévue dépassée, non réceptionnées)
* - garanties SAV qui expirent dans les 30 jours
*/
function useSmartAlerts() {
	const { selectedWarehouseId, warehouses } = useWarehouse();
	const query = useQuery({
		queryKey: ["smart-alerts", selectedWarehouseId],
		refetchInterval: 12e4,
		staleTime: 6e4,
		queryFn: async () => {
			const whName = (id) => warehouses.find((w) => w.id === id)?.name ?? "Sans entrepôt";
			const alerts = [];
			let stockQuery = supabase.from("lot_stock_by_warehouse").select("lot_id, product_id, warehouse_id, current_quantity");
			if (selectedWarehouseId !== "all") stockQuery = stockQuery.eq("warehouse_id", selectedWarehouseId);
			const [{ data: stockRows }, { data: products }] = await Promise.all([stockQuery, supabase.from("products").select("id, name, sku, stock_min")]);
			const productMap = new Map((products ?? []).map((p) => [p.id, p]));
			const perProductWarehouse = /* @__PURE__ */ new Map();
			for (const row of stockRows ?? []) {
				const key = `${row.product_id}|${row.warehouse_id ?? ""}`;
				perProductWarehouse.set(key, (perProductWarehouse.get(key) ?? 0) + Number(row.current_quantity ?? 0));
			}
			for (const [key, qty] of perProductWarehouse) {
				const [productId, warehouseId] = key.split("|");
				const p = productMap.get(productId);
				if (!p) continue;
				const min = Number(p.stock_min ?? 0);
				if (qty > min) continue;
				alerts.push({
					id: `stock-${key}`,
					kind: "stock",
					severity: qty <= 0 ? "critical" : "warning",
					title: qty <= 0 ? `Rupture : ${p.name}` : `Stock faible : ${p.name}`,
					detail: `${whName(warehouseId || null)} — ${qty} en stock (seuil ${min}) — ${p.sku}`,
					to: "/stock",
					warehouseId: warehouseId || null
				});
			}
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			let poQuery = supabase.from("purchase_orders").select("id, po_number, expected_date, status, warehouse_id, suppliers(name)").in("status", ["envoyee", "partielle"]).lt("expected_date", today);
			if (selectedWarehouseId !== "all") poQuery = poQuery.eq("warehouse_id", selectedWarehouseId);
			const { data: pos } = await poQuery;
			for (const po of pos ?? []) {
				const days = Math.max(0, Math.round((Date.now() - new Date(po.expected_date).getTime()) / 864e5));
				alerts.push({
					id: `po-${po.id}`,
					kind: "commande",
					severity: days > 7 ? "critical" : "warning",
					title: `Commande en retard : ${po.po_number}`,
					detail: `${whName(po.warehouse_id)} — ${po.suppliers?.name ?? "Fournisseur"} — ${days} jour(s) de retard`,
					to: "/commandes-fournisseurs",
					warehouseId: po.warehouse_id ?? null
				});
			}
			const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
			const { data: tickets } = await supabase.from("sav_tickets").select("id, ticket_number, warranty_end, status, products(name)").not("warranty_end", "is", null).lte("warranty_end", in30).gte("warranty_end", today).in("status", ["ouvert", "en_cours"]);
			for (const t of tickets ?? []) {
				const days = Math.max(0, Math.round((new Date(t.warranty_end).getTime() - Date.now()) / 864e5));
				alerts.push({
					id: `sav-${t.id}`,
					kind: "garantie",
					severity: days <= 7 ? "critical" : "warning",
					title: `Garantie bientôt expirée : ${t.ticket_number}`,
					detail: `${t.products?.name ?? "Produit"} — expire dans ${days} jour(s)`,
					to: "/sav",
					warehouseId: null
				});
			}
			return alerts;
		}
	});
	(0, import_react.useEffect)(() => {
		const alerts = query.data;
		if (!alerts || alerts.length === 0) return;
		const seen = loadSeen();
		let changed = false;
		for (const a of alerts) {
			if (seen.has(a.id) || notifiedThisSession.has(a.id)) continue;
			seen.add(a.id);
			notifiedThisSession.add(a.id);
			changed = true;
			notify.warning(a.title, a.detail);
		}
		if (changed) saveSeen(seen);
	}, [query.data]);
	return query;
}
//#endregion
export { useSmartAlerts as t };
