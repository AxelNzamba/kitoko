import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { H as Package, ft as Download, jt as ChartColumn, m as TrendingDown, p as TrendingUp } from "../_libs/lucide-react.mjs";
import { r as formatXOF, t as formatDate } from "./format-DUkOQpcu.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rapports-DcDY0y5t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RapportsPage() {
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const [from, setFrom] = (0, import_react.useState)(today.slice(0, 8) + "01");
	const [to, setTo] = (0, import_react.useState)(today);
	const { data: sales = [] } = useQuery({
		queryKey: [
			"report-sales",
			from,
			to
		],
		queryFn: async () => {
			const { data, error } = await supabase.from("sales").select("*, sale_items(*, products(name, sku))").gte("created_at", from).lte("created_at", to + "T23:59:59");
			if (error) throw error;
			return data;
		}
	});
	const { data: expenses = [] } = useQuery({
		queryKey: [
			"report-expenses",
			from,
			to
		],
		queryFn: async () => {
			const { data, error } = await supabase.from("expenses").select("*").gte("expense_date", from).lte("expense_date", to);
			if (error) return [];
			return data;
		}
	});
	const { data: movements = [] } = useQuery({
		queryKey: [
			"report-movements",
			from,
			to
		],
		queryFn: async () => {
			const { data, error } = await supabase.from("stock_movements").select("*, products(name)").gte("created_at", from).lte("created_at", to + "T23:59:59");
			if (error) throw error;
			return data;
		}
	});
	const stats = (0, import_react.useMemo)(() => {
		const ca = sales.reduce((s, x) => s + Number(x.total ?? 0), 0);
		const nb = sales.length;
		const dep = expenses.reduce((s, x) => s + Number(x.amount ?? 0), 0);
		return {
			ca,
			nb,
			dep,
			marge: ca - sales.reduce((s, x) => {
				return s + (x.sale_items ?? []).reduce((ss, it) => ss + Number(it.unit_price ?? 0) * Number(it.quantity ?? 0) * .7, 0);
			}, 0) - dep
		};
	}, [sales, expenses]);
	const topProducts = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		sales.forEach((s) => {
			(s.sale_items ?? []).forEach((it) => {
				const key = it.product_id;
				const cur = map.get(key) ?? {
					name: it.products?.name ?? "—",
					qty: 0,
					ca: 0
				};
				cur.qty += Number(it.quantity);
				cur.ca += Number(it.unit_price) * Number(it.quantity);
				map.set(key, cur);
			});
		});
		return [...map.values()].sort((a, b) => b.ca - a.ca).slice(0, 10);
	}, [sales]);
	const salesByDay = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		sales.forEach((s) => {
			const d = s.created_at.slice(0, 10);
			map.set(d, (map.get(d) ?? 0) + Number(s.total));
		});
		return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	}, [sales]);
	const maxDay = Math.max(1, ...salesByDay.map(([, v]) => v));
	async function exportPDF() {
		const { default: jsPDF } = await import("../_libs/jspdf.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		const autoTable = (await import("../_libs/jspdf-autotable.mjs").then((n) => n.t)).default;
		const doc = new jsPDF();
		doc.setFontSize(16);
		doc.text("Rapport d'activité — INDUS-ERP", 14, 18);
		doc.setFontSize(10);
		doc.text(`Période : ${formatDate(from)} — ${formatDate(to)}`, 14, 26);
		autoTable(doc, {
			startY: 34,
			head: [["Indicateur", "Valeur"]],
			body: [
				["Chiffre d'affaires", formatXOF(stats.ca)],
				["Nombre de ventes", String(stats.nb)],
				["Dépenses", formatXOF(stats.dep)],
				["Marge estimée", formatXOF(stats.marge)]
			]
		});
		if (topProducts.length) autoTable(doc, {
			head: [[
				"Top produit",
				"Qté",
				"CA"
			]],
			body: topProducts.map((p) => [
				p.name,
				String(p.qty),
				formatXOF(p.ca)
			])
		});
		doc.save(`rapport-${from}-${to}.pdf`);
		notify.success("Rapport PDF exporté");
	}
	async function exportCSV() {
		const csv = [[
			"Date",
			"Numéro",
			"Client",
			"Total",
			"Paiement"
		], ...sales.map((s) => [
			s.created_at.slice(0, 10),
			s.sale_number,
			s.client_name ?? "",
			String(s.total),
			s.payment_method ?? ""
		])].map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ventes-${from}-${to}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		notify.success("Export CSV téléchargé");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Rapports"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Analyse commerciale et financière."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Du"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: from,
							onChange: (e) => setFrom(e.target.value),
							className: "w-40"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Au"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: to,
							onChange: (e) => setTo(e.target.value),
							className: "w-40"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: exportCSV,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 size-4" }), " CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: exportPDF,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 size-4" }), " PDF"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
						label: "Chiffre d'affaires",
						value: formatXOF(stats.ca),
						icon: TrendingUp
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
						label: "Ventes",
						value: String(stats.nb),
						icon: ChartColumn
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
						label: "Dépenses",
						value: formatXOF(stats.dep),
						icon: TrendingDown
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
						label: "Marge estimée",
						value: formatXOF(stats.marge),
						icon: Package,
						highlight: true
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "ventes",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "ventes",
							children: "Ventes par jour"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "top",
							children: "Top produits"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "mouvements",
							children: "Mouvements de stock"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "ventes",
						className: "rounded-lg border border-border bg-card p-4",
						children: [salesByDay.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-10 text-center text-sm text-muted-foreground",
							children: "Aucune vente sur la période."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: salesByDay.map(([d, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-24 shrink-0 text-xs",
										children: formatDate(d)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-2 rounded-full bg-muted overflow-hidden",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full bg-accent",
												style: { width: `${v / maxDay * 100}%` }
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-32 text-right text-xs font-semibold tabular-nums",
										children: formatXOF(v)
									})
								]
							}, d))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "top",
						className: "rounded-lg border border-border bg-card p-4",
						children: [topProducts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-10 text-center text-sm text-muted-foreground",
							children: "Aucune donnée."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: topProducts.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent",
											children: i + 1
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium",
											children: p.name
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm text-muted-foreground",
										children: [p.qty, " unité(s)"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold tabular-nums",
										children: formatXOF(p.ca)
									})
								]
							}, i))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "mouvements",
						className: "rounded-lg border border-border bg-card p-4",
						children: [movements.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-10 text-center text-sm text-muted-foreground",
							children: "Aucun mouvement."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: movements.slice(0, 30).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 py-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: formatDate(m.created_at)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1 truncate font-medium",
										children: m.products?.name ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `text-xs font-semibold uppercase ${m.type === "entree" ? "text-emerald-500" : "text-destructive"}`,
										children: [
											m.type === "entree" ? "+" : "−",
											" ",
											m.quantity
										]
									})
								]
							}, m.id))
						})]
					})
				]
			})
		]
	});
}
function KPI({ label, value, icon: Icon, highlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-lg border p-4 ${highlight ? "border-accent/40 bg-accent/5" : "border-border bg-card"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }),
				" ",
				label
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-2xl font-bold tabular-nums",
			children: value
		})]
	});
}
//#endregion
export { RapportsPage as component };
