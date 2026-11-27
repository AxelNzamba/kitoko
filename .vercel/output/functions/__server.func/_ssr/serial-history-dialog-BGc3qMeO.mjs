import { t as supabase } from "./client-65E2KTpn.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Ft as Boxes, P as Receipt, _ as Tag, n as Wrench, u as Undo2 } from "../_libs/lucide-react.mjs";
import { n as formatDateTime, r as formatXOF, t as formatDate } from "./format-DUkOQpcu.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/serial-history-dialog-BGc3qMeO.js
var import_jsx_runtime = require_jsx_runtime();
var SERIAL_STATUS_LABEL = {
	en_stock: "En stock",
	vendu: "Vendu",
	retourne: "Retourné",
	sav: "En SAV",
	rebut: "Rebut"
};
function serialStatusTone(status) {
	switch (status) {
		case "en_stock": return "bg-emerald-500/10 text-emerald-600";
		case "vendu": return "bg-blue-500/10 text-blue-600";
		case "sav": return "bg-orange-500/10 text-orange-600";
		case "retourne": return "bg-amber-500/10 text-amber-600";
		default: return "bg-destructive/10 text-destructive";
	}
}
/**
* Historique complet d'un numéro de série : réception du lot, vente,
* interventions SAV rattachées et statut courant.
*/
function SerialHistoryDialog({ serialId, open, onOpenChange }) {
	const { data } = useQuery({
		queryKey: ["serial-history", serialId],
		enabled: !!serialId && open,
		queryFn: async () => {
			const { data: serial, error } = await supabase.from("serial_numbers").select("*, products:product_id(name, sku), lots:lot_id(lot_number, reception_date, suppliers:supplier_id(name)), sales:sale_id(number, created_at, total_ttc), clients:client_id(name)").eq("id", serialId).maybeSingle();
			if (error) throw error;
			const { data: links } = await supabase.from("sav_intervention_serials").select("id, outcome, notes, created_at, sav_interventions:intervention_id(id, intervention_date, technician, description, cost, sav_tickets:ticket_id(ticket_number, type, status))").eq("serial_id", serialId).order("created_at", { ascending: false });
			return {
				serial,
				links: links ?? []
			};
		}
	});
	const serial = data?.serial;
	const events = [];
	if (serial) {
		if (serial.lots) events.push({
			at: serial.lots.reception_date ?? serial.created_at,
			icon: Boxes,
			title: `Réception — lot ${serial.lots.lot_number}`,
			detail: serial.lots.suppliers?.name ? `Fournisseur : ${serial.lots.suppliers.name}` : "Entrée en stock"
		});
		if (serial.sales) events.push({
			at: serial.sales.created_at,
			icon: Receipt,
			title: `Vente ${serial.sales.number}`,
			detail: `${serial.clients?.name ?? "Client comptoir"} — ${formatXOF(Number(serial.sales.total_ttc ?? 0))}`
		});
		for (const l of data?.links ?? []) {
			const iv = l.sav_interventions;
			if (!iv) continue;
			events.push({
				at: iv.intervention_date,
				icon: l.outcome === "rebut" ? Undo2 : Wrench,
				title: `SAV ${iv.sav_tickets?.ticket_number ?? ""} — ${OUTCOME_LABEL[l.outcome] ?? l.outcome}`,
				detail: `${iv.description}${iv.technician ? ` · ${iv.technician}` : ""} · ${formatXOF(Number(iv.cost ?? 0))}`
			});
		}
	}
	events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: serial?.serial ?? "Numéro de série"
						}),
						serial && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: serialStatusTone(serial.status),
							variant: "secondary",
							children: SERIAL_STATUS_LABEL[serial.status] ?? serial.status
						})
					]
				}) }),
				serial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						serial.products?.name,
						" (",
						serial.products?.sku,
						")"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "max-h-[60vh] space-y-3 overflow-auto border-l pl-4",
					children: [events.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "py-6 text-center text-sm text-muted-foreground",
						children: "Aucun événement enregistré."
					}), events.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -left-[25px] top-1 flex size-4 items-center justify-center rounded-full bg-primary/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(e.icon, { className: "size-2.5 text-primary" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: e.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: e.detail
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: formatDate(e.at)
							})
						]
					}, i))]
				}),
				serial?.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground",
					children: serial.notes
				}),
				serial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-right text-[11px] text-muted-foreground",
					children: ["Dernière mise à jour : ", formatDateTime(serial.updated_at)]
				})
			]
		})
	});
}
var OUTCOME_LABEL = {
	traite: "Traité",
	remplace: "Remplacé",
	repare: "Réparé",
	rebut: "Mis au rebut",
	retourne_client: "Retourné au client"
};
//#endregion
export { serialStatusTone as i, SERIAL_STATUS_LABEL as n, SerialHistoryDialog as r, OUTCOME_LABEL as t };
