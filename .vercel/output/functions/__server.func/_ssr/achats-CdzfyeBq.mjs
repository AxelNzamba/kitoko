import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { H as Package, O as Search, S as ShoppingCart, p as TrendingUp } from "../_libs/lucide-react.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { r as formatXOF, t as formatDate } from "./format-DUkOQpcu.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/achats-CdzfyeBq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ACHATS_PAGE_SIZE = 20;
function AchatsPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(ACHATS_PAGE_SIZE);
	const { data: lotsData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"lots",
			"achats",
			page,
			pageSize
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			const { data, error, count } = await supabase.from("lots").select("id, lot_number, reception_date, quantity, unit_purchase_price, products(name, sku), suppliers(name)", {
				count: "exact",
				head: false
			}).order("reception_date", { ascending: false }).range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const lots = lotsData.data;
	const totalLots = lotsData.count;
	const debouncedQ = useDebounce(q, 200);
	const filtered = (0, import_react.useMemo)(() => lots.filter((l) => {
		if (!debouncedQ.trim()) return true;
		const s = debouncedQ.toLowerCase();
		return l.lot_number?.toLowerCase().includes(s) || l.products?.name?.toLowerCase().includes(s) || l.products?.sku?.toLowerCase().includes(s) || l.suppliers?.name?.toLowerCase().includes(s);
	}), [lots, debouncedQ]);
	const stats = (0, import_react.useMemo)(() => {
		const total = filtered.reduce((sum, l) => sum + Number(l.quantity) * Number(l.unit_purchase_price), 0);
		const totalQty = filtered.reduce((sum, l) => sum + Number(l.quantity), 0);
		return {
			count: filtered.length,
			total,
			totalQty
		};
	}, [filtered]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Achats"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Historique des réceptions fournisseurs (basé sur les lots)."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: ShoppingCart,
						label: "Réceptions",
						value: String(stats.count)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: Package,
						label: "Unités achetées",
						value: stats.totalQty.toLocaleString("fr-FR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: TrendingUp,
						label: "Montant total",
						value: formatXOF(stats.total)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Rechercher (produit, lot, fournisseur)…",
					className: "pl-9"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° lot" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fournisseur" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Quantité"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "PU achat"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Montant"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun achat. Créez un lot depuis la page Lots pour enregistrer une réception."
				}) }), filtered.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AchatRow, { lot: l }, l.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalLots,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			})
		]
	});
}
var AchatRow = (0, import_react.memo)(function AchatRow({ lot }) {
	const amount = Number(lot.quantity) * Number(lot.unit_purchase_price);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm",
			children: formatDate(lot.reception_date)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-mono text-xs",
			children: lot.lot_number
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
			lot.products?.name,
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted-foreground",
				children: [
					"(",
					lot.products?.sku,
					")"
				]
			})
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm",
			children: lot.suppliers?.name ?? "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: Number(lot.quantity)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: formatXOF(Number(lot.unit_purchase_price))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right font-semibold",
			children: formatXOF(amount)
		})
	] }, lot.id);
});
var StatCard = (0, import_react.memo)(function StatCard({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs uppercase text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-accent" }),
				" ",
				label
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 text-2xl font-semibold",
			children: value
		})]
	});
});
//#endregion
export { AchatsPage as component };
