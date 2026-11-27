import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { Ft as Boxes, Ht as ArrowDownLeft, P as Receipt, _ as Tag, rt as History, ut as FileDown, vt as ClipboardCheck, zt as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { n as formatDateTime, r as formatXOF, t as formatDate } from "./format-DUkOQpcu.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as exportToCsv } from "./csv-bEMY3y7g.mjs";
import { t as exportTablePdf } from "./pdf-table-D7ZtlDDS.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { n as SERIAL_STATUS_LABEL, r as SerialHistoryDialog } from "./serial-history-dialog-BGc3qMeO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/historique-produit-DEDJUNeZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_META = {
	achat: {
		label: "Achat / Lot",
		icon: Boxes,
		tone: "bg-indigo-500/10 text-indigo-600"
	},
	vente: {
		label: "Vente",
		icon: Receipt,
		tone: "bg-blue-500/10 text-blue-600"
	},
	entree: {
		label: "Entrée stock",
		icon: ArrowDownLeft,
		tone: "bg-emerald-500/10 text-emerald-600"
	},
	sortie: {
		label: "Sortie stock",
		icon: ArrowUpRight,
		tone: "bg-orange-500/10 text-orange-600"
	},
	inventaire: {
		label: "Inventaire",
		icon: ClipboardCheck,
		tone: "bg-violet-500/10 text-violet-600"
	},
	serie: {
		label: "N° série",
		icon: Tag,
		tone: "bg-slate-500/10 text-slate-600"
	}
};
function ProductTimelinePage() {
	const [productId, setProductId] = (0, import_react.useState)("");
	const [kindFilter, setKindFilter] = (0, import_react.useState)("all");
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [serialId, setSerialId] = (0, import_react.useState)(null);
	const { data: products = [] } = useQuery({
		queryKey: ["products", "min"],
		queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? []
	});
	const { data: events = [], isLoading } = useQuery({
		queryKey: ["product-timeline", productId],
		enabled: !!productId,
		queryFn: async () => {
			const out = [];
			const [lots, saleItems, movements, counts, serials] = await Promise.all([
				supabase.from("lots").select("id, lot_number, reception_date, quantity, unit_purchase_price, suppliers:supplier_id(name)").eq("product_id", productId),
				supabase.from("sale_items").select("id, quantity, unit_price, lot_id, sales:sale_id(number, created_at, client_name, payment_mode)").eq("product_id", productId),
				supabase.from("stock_movements").select("id, type, quantity, unit_price, reason, created_at, lots:lot_id(lot_number)").eq("product_id", productId),
				supabase.from("inventory_counts").select("id, counted_quantity, created_at, lots:lot_id(lot_number, quantity, product_id), inventory_sessions:session_id(name, status)").order("created_at", { ascending: false }),
				supabase.from("serial_numbers").select("id, serial, status, created_at, updated_at, lots:lot_id(lot_number), clients:client_id(name)").eq("product_id", productId)
			]);
			for (const l of lots.data ?? []) out.push({
				id: `lot-${l.id}`,
				at: l.reception_date,
				kind: "achat",
				title: `Lot ${l.lot_number} reçu`,
				detail: `${l.suppliers?.name ?? "Fournisseur inconnu"} — ${l.quantity} unité(s) à ${formatXOF(Number(l.unit_purchase_price ?? 0))}`,
				amount: Number(l.quantity) * Number(l.unit_purchase_price ?? 0),
				qty: Number(l.quantity)
			});
			for (const si of saleItems.data ?? []) out.push({
				id: `si-${si.id}`,
				at: si.sales?.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
				kind: "vente",
				title: `Vente ${si.sales?.number ?? ""}`,
				detail: `${si.sales?.client_name ?? "Client comptoir"} — ${si.quantity} × ${formatXOF(Number(si.unit_price ?? 0))} (${si.sales?.payment_mode ?? "—"})`,
				amount: Number(si.quantity) * Number(si.unit_price ?? 0),
				qty: -Number(si.quantity)
			});
			for (const m of movements.data ?? []) {
				const kind = m.type === "entree" ? "entree" : m.type === "sortie" ? "sortie" : "inventaire";
				out.push({
					id: `mv-${m.id}`,
					at: m.created_at,
					kind,
					title: `${KIND_META[kind].label}${m.lots?.lot_number ? ` — lot ${m.lots.lot_number}` : ""}`,
					detail: m.reason ?? "Sans motif",
					amount: m.unit_price ? Number(m.quantity) * Number(m.unit_price) : void 0,
					qty: kind === "sortie" ? -Number(m.quantity) : Number(m.quantity)
				});
			}
			for (const c of counts.data ?? []) {
				if (c.lots?.product_id !== productId) continue;
				const ecart = Number(c.counted_quantity) - Number(c.lots?.quantity ?? 0);
				out.push({
					id: `ic-${c.id}`,
					at: c.created_at,
					kind: "inventaire",
					title: `Comptage — ${c.inventory_sessions?.name ?? "session"}`,
					detail: `Lot ${c.lots?.lot_number ?? "—"} : compté ${c.counted_quantity}, théorique ${c.lots?.quantity ?? 0} (écart ${ecart >= 0 ? "+" : ""}${ecart})`,
					qty: ecart
				});
			}
			for (const s of serials.data ?? []) out.push({
				id: `sn-${s.id}`,
				at: s.updated_at ?? s.created_at,
				kind: "serie",
				title: `N° série ${s.serial} — ${SERIAL_STATUS_LABEL[s.status] ?? s.status}`,
				detail: `${s.lots?.lot_number ? `Lot ${s.lots.lot_number}` : ""}${s.clients?.name ? ` · ${s.clients.name}` : ""}`,
				serialId: s.id
			});
			return out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
		}
	});
	const filtered = events.filter((e) => {
		if (kindFilter !== "all" && e.kind !== kindFilter) return false;
		const t = new Date(e.at).getTime();
		if (from && t < new Date(from).getTime()) return false;
		if (to && t > new Date(to).getTime() + 864e5) return false;
		return true;
	});
	const product = products.find((p) => p.id === productId);
	const bought = filtered.filter((e) => e.kind === "achat").reduce((s, e) => s + (e.qty ?? 0), 0);
	const sold = filtered.filter((e) => e.kind === "vente").reduce((s, e) => s + Math.abs(e.qty ?? 0), 0);
	const revenue = filtered.filter((e) => e.kind === "vente").reduce((s, e) => s + (e.amount ?? 0), 0);
	const headers = [
		{
			key: "date",
			label: "Date"
		},
		{
			key: "type",
			label: "Type"
		},
		{
			key: "title",
			label: "Événement"
		},
		{
			key: "detail",
			label: "Détail"
		},
		{
			key: "qty",
			label: "Qté"
		},
		{
			key: "amount",
			label: "Montant"
		}
	];
	const rows = filtered.map((e) => ({
		date: formatDateTime(e.at),
		type: KIND_META[e.kind].label,
		title: e.title,
		detail: e.detail,
		qty: e.qty != null ? String(e.qty) : "",
		amount: e.amount != null ? formatXOF(e.amount) : ""
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Historique produit"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Timeline unifiée : achats, ventes, mouvements de stock, inventaires et numéros de série."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:col-span-2 lg:col-span-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Produit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: productId,
							onValueChange: setProductId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un produit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: p.id,
								children: [
									p.name,
									" (",
									p.sku,
									")"
								]
							}, p.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Type d'événement"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: kindFilter,
							onValueChange: (v) => setKindFilter(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "Tous"
							}), Object.keys(KIND_META).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: k,
								children: KIND_META[k].label
							}, k))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Du"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: from,
							onChange: (e) => setFrom(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Au"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: to,
							onChange: (e) => setTo(e.target.value)
						})]
					})
				]
			}),
			!productId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border bg-card py-16 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "mx-auto mb-2 size-6 opacity-50" }), "Sélectionnez un produit pour afficher sa timeline complète."]
			}),
			productId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: "Événements",
							value: String(filtered.length)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: "Unités achetées",
							value: String(bought)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: "Unités vendues",
							value: String(sold)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: "Chiffre d'affaires",
							value: formatXOF(revenue)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: product?.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => exportToCsv(headers, rows, `historique-${product?.sku ?? "produit"}.csv`),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " CSV"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => exportTablePdf({
								title: `Historique — ${product?.name ?? ""}`,
								headers: headers.map((h) => h.label),
								rows: rows.map((r) => headers.map((h) => r[h.key] ?? "")),
								filename: `historique-${product?.sku ?? "produit"}.pdf`,
								landscape: true
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " PDF"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "space-y-3 border-l pl-5",
					children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-8 text-center text-sm text-muted-foreground",
							children: "Chargement…"
						}),
						!isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-8 text-center text-sm text-muted-foreground",
							children: "Aucun événement sur la période."
						}),
						filtered.map((e) => {
							const meta = KIND_META[e.kind];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "relative rounded-lg border bg-card p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute -left-[30px] top-4 flex size-5 items-center justify-center rounded-full border bg-background",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, { className: "size-3 text-primary" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: `text-[10px] ${meta.tone}`,
												children: meta.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-medium",
												children: e.title
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-xs",
											children: [
												e.qty != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: e.qty < 0 ? "text-destructive" : "text-emerald-600",
													children: [e.qty > 0 ? "+" : "", e.qty]
												}),
												e.amount != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium",
													children: formatXOF(e.amount)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: formatDate(e.at)
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: e.detail
									}),
									e.serialId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										className: "mt-1 h-7 px-2 text-xs",
										onClick: () => setSerialId(e.serialId),
										children: "Voir l'historique de la série"
									})
								]
							}, e.id);
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SerialHistoryDialog, {
				serialId,
				open: !!serialId,
				onOpenChange: (o) => !o && setSerialId(null)
			})
		]
	});
}
function Kpi({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xl font-semibold",
			children: value
		})]
	});
}
//#endregion
export { ProductTimelinePage as component };
