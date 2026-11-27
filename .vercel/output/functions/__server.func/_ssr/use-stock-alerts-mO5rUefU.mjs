import { t as supabase } from "./client-65E2KTpn.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-stock-alerts-mO5rUefU.js
var ALERTS_KEY = ["stock-alerts"];
var SEEN_KEY = "indus-erp-seen-alerts";
var SETTINGS_KEY = "indus-erp-settings";
/**
* Charge la configuration depuis localStorage
*/
function loadSettings() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
/**
* Charge les alertes déjà vues (pour éviter les doublons de notification)
*/
function loadSeenAlerts() {
	if (typeof window === "undefined") return /* @__PURE__ */ new Set();
	try {
		const raw = localStorage.getItem(SEEN_KEY);
		return new Set(raw ? JSON.parse(raw) : []);
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function saveSeenAlerts(ids) {
	if (typeof window === "undefined") return;
	localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}
/**
* Hook qui interroge la fonction check_stock_alerts() et déclenche
* des notifications in-app pour les nouveaux produits sous seuil.
*/
function useStockAlerts() {
	return useQuery({
		queryKey: ALERTS_KEY,
		queryFn: async () => {
			const { data, error } = await supabase.rpc("check_stock_alerts");
			if (error) throw error;
			return data ?? [];
		},
		refetchInterval: 6e4,
		staleTime: 3e4
	});
}
/**
* Vérifie les alertes et notifie l'utilisateur pour les nouvelles.
* Appelée après chaque mouvement de stock ou vente.
*/
async function checkAndNotifyAlerts() {
	const { data } = await supabase.rpc("check_stock_alerts");
	if (!data || !Array.isArray(data)) return;
	const alerts = data;
	const seen = loadSeenAlerts();
	const newAlerts = [];
	for (const a of alerts) {
		const id = `${a.product_id}-${a.status}`;
		if (seen.has(id)) continue;
		seen.add(id);
		newAlerts.push(a);
		const label = a.status === "rupture" ? "🔴 RUPTURE DE STOCK" : "🟡 Stock faible";
		notify.warning(`${label} : ${a.product_name}`, `Stock: ${a.current_stock} / seuil: ${a.stock_min} — SKU: ${a.sku}`);
	}
	saveSeenAlerts(seen);
	if (newAlerts.length > 0) {
		const settings = loadSettings();
		if (settings?.emailAlertsEnabled && settings?.alertEmail) {
			const { sendStockAlertEmail } = await import("./stock-alerts-email-kdUoaXGC.mjs");
			const payload = newAlerts.map((a) => ({
				product_name: a.product_name,
				sku: a.sku,
				current_stock: Number(a.current_stock),
				stock_min: a.stock_min,
				status: a.status
			}));
			sendStockAlertEmail(settings.alertEmail, payload);
		}
	}
}
//#endregion
export { useStockAlerts as n, checkAndNotifyAlerts as t };
