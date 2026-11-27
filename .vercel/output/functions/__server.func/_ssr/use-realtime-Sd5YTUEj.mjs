import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-realtime-Sd5YTUEj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Hook Realtime Supabase — Permet de s'abonner aux changements
* de tables PostgreSQL et de réagir en temps réel.
*
* Utilise les fonctionnalités Realtime intégrées de Supabase.
* Nécessite que Realtime soit activé sur la table concernée (via Supabase Dashboard
* ou config.toml : [analytics.realtime] ou via l'UI Replication).
*/
/**
* Hook React pour s'abonner aux changements d'une table Supabase.
* Se nettoie automatiquement au démontage du composant.
*
* @example
* ```tsx
* const { status } = useRealtimeSubscription(
*   { table: "sales" },
*   { onPayload: () => queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] }) }
* );
* ```
*/
function useRealtimeSubscription(filter, options = {}) {
	const { table, event = "*", filter: rowFilter, schema = "public" } = filter;
	const { onPayload, enabled = true } = options;
	const [status, setStatus] = (0, import_react.useState)("disabled");
	const callbackRef = (0, import_react.useRef)(onPayload);
	callbackRef.current = onPayload;
	(0, import_react.useEffect)(() => {
		if (!enabled) {
			setStatus("disabled");
			return;
		}
		const channelName = `realtime-${schema}-${table}-${event}-${Date.now()}`;
		const channel = supabase.channel(channelName).on("postgres_changes", {
			event,
			schema,
			table,
			filter: rowFilter
		}, (payload) => {
			callbackRef.current?.(payload);
		}).subscribe((state) => {
			if (state === "SUBSCRIBED") setStatus("connected");
			else if (state === "CHANNEL_ERROR") setStatus("error");
			else setStatus("connecting");
		});
		return () => {
			supabase.removeChannel(channel);
			setStatus("disabled");
		};
	}, [
		table,
		event,
		rowFilter,
		schema,
		enabled
	]);
	return { status };
}
/**
* Indicateur "Live" à afficher dans les en-têtes.
* Affiche un point vert + "Live" ou "Reconnexion..." selon le statut.
*/
function LiveBadge({ status }) {
	if (status === "disabled") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status === "connected" ? "bg-success/10 text-success" : status === "connecting" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/10 text-destructive"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 rounded-full ${status === "connected" ? "bg-success animate-pulse" : status === "connecting" ? "bg-warning" : "bg-destructive"}` }), status === "connected" ? "Live" : status === "connecting" ? "Connexion..." : "Erreur"]
	});
}
//#endregion
export { useRealtimeSubscription as n, LiveBadge as t };
