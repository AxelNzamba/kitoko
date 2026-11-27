import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { H as Package, Nt as Calendar, P as Receipt, Rt as ArrowUp, T as ShieldAlert, Tt as CircleAlert, U as PackageX, Vt as ArrowDown, a as Warehouse, f as TriangleAlert, gt as Clock, jt as ChartColumn, mt as Crown, o as Wallet, p as TrendingUp, pt as DollarSign, ut as FileDown, xt as CircleOff, zt as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { r as formatXOF } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useStockAlerts } from "./use-stock-alerts-mO5rUefU.mjs";
import { n as useRealtimeSubscription, t as LiveBadge } from "./use-realtime-Sd5YTUEj.mjs";
import { n as useWarehouse } from "./use-warehouse-CcCp6zte.mjs";
import { t as useWarehouseFilter } from "./warehouse-filter-DuSqDZ_e.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.mjs";
import { t as useSmartAlerts } from "./use-smart-alerts-D96ssWXG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BX8_fdWs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Mini graphique sparkline en SVG inline.
* Aucune dépendance externe — pur SVG.
*
* Usage:
*   <Sparkline data={[10, 25, 15, 30, 20, 45, 35]} />
*/
function Sparkline({ data, width = 80, height = 28, strokeColor = "oklch(0.7 0.19 45)", fillColor = "oklch(0.7 0.19 45 / 0.12)", strokeWidth = 1.5 }) {
	const path = (0, import_react.useMemo)(() => {
		if (!data || data.length < 2) return null;
		const min = Math.min(...data);
		const range = Math.max(...data) - min || 1;
		const padding = 2;
		const w = width - padding * 2;
		const h = height - padding * 2;
		const points = data.map((value, i) => {
			return `${padding + i / (data.length - 1) * w},${padding + h - (value - min) / range * h}`;
		});
		const line = points.join(" L ");
		const firstX = padding;
		const lastX = padding + w;
		const bottomY = padding + h;
		const area = `M ${firstX},${bottomY} L ${points.join(" L ")} L ${lastX},${bottomY} Z`;
		return {
			line: `M ${line}`,
			area
		};
	}, [
		data,
		width,
		height
	]);
	if (!path) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width,
		height,
		viewBox: `0 0 ${width} ${height}`,
		className: "shrink-0",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: path.area,
			fill: fillColor
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: path.line,
			fill: "none",
			stroke: strokeColor,
			strokeWidth,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})]
	});
}
/**
* Petite pastille colorée indiquant la direction de la tendance.
*/
function TrendDot({ data }) {
	if (!data || data.length < 2) return null;
	const first = data[0];
	const last = data[data.length - 1];
	const pct = first !== 0 ? (last - first) / Math.abs(first) * 100 : 0;
	let color;
	let arrow;
	if (pct > 5) {
		color = "text-success";
		arrow = "↑";
	} else if (pct < -5) {
		color = "text-destructive";
		arrow = "↓";
	} else {
		color = "text-muted-foreground";
		arrow = "→";
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center gap-0.5 text-[10px] font-bold ${color}`,
		children: [arrow, Math.abs(pct) >= 1 && `${Math.round(Math.abs(pct))}%`]
	});
}
/**
* Génère un PDF complet du tableau de bord.
* Inclut : en-tête, KPIs, tableau d'évolution CA, alertes stock, transactions.
*/
async function generateDashboardPDF(params) {
	const { default: jsPDF } = await import("../_libs/jspdf.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const autoTable = (await import("../_libs/jspdf-autotable.mjs").then((n) => n.t)).default;
	const doc = new jsPDF();
	const pageW = doc.internal.pageSize.getWidth();
	const margin = 14;
	const contentW = pageW - margin * 2;
	const navy = [
		23,
		42,
		69
	];
	const orange = [
		200,
		90,
		30
	];
	const gray = [
		107,
		114,
		128
	];
	const lightGray = [
		243,
		244,
		246
	];
	let y = margin;
	doc.setFillColor(...navy);
	doc.rect(0, 0, pageW, 50, "F");
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(20);
	doc.setFont(void 0, "bold");
	doc.text("INDUS-ERP", margin, 22);
	doc.setFontSize(10);
	doc.setFont(void 0, "normal");
	doc.text("Rapport tableau de bord", margin, 32);
	doc.setFontSize(8);
	doc.setTextColor(200, 200, 200);
	doc.text(`Généré le ${params.dateLabel}`, margin, 40);
	doc.setFillColor(...orange);
	doc.rect(margin, 46, contentW, 2, "F");
	y = 62;
	doc.setTextColor(...navy);
	doc.setFontSize(12);
	doc.setFont(void 0, "bold");
	doc.text("Résumé financier", margin, y);
	y += 8;
	const kpiData = params.kpis.map((k) => [k.label, `${k.value}${k.unit ? ` ${k.unit}` : ""}`]);
	const extraStats = [["Bénéfice net", `${formatXOF(Math.max(params.beneficeNet, 0))}`], ["Marge brute", `${params.margeBrute}%`]];
	autoTable(doc, {
		startY: y,
		head: [["Indicateur", "Valeur"]],
		body: [...kpiData, ...extraStats],
		theme: "grid",
		headStyles: {
			fillColor: navy,
			fontSize: 8,
			halign: "center"
		},
		bodyStyles: { fontSize: 8 },
		columnStyles: {
			0: {
				cellWidth: contentW * .6,
				fontStyle: "bold"
			},
			1: {
				cellWidth: contentW * .4,
				halign: "right",
				fontStyle: "bold"
			}
		},
		margin: {
			left: margin,
			right: margin
		},
		tableLineColor: 220,
		tableLineWidth: .1
	});
	y = doc.lastAutoTable.finalY + 12;
	doc.setTextColor(...navy);
	doc.setFontSize(12);
	doc.setFont(void 0, "bold");
	doc.text("Évolution du chiffre d'affaires (30 jours)", margin, y);
	y += 8;
	const recentDays = params.chartData.slice(-10).map((d) => [
		`Jour ${d.jour}`,
		`${d.ca}k FC`,
		d.caYoY != null ? `${d.caYoY}k FC` : "—"
	]);
	if (recentDays.length > 0) {
		autoTable(doc, {
			startY: y,
			head: [[
				"Jour",
				"CA N",
				"CA N-1"
			]],
			body: recentDays,
			theme: "grid",
			headStyles: {
				fillColor: navy,
				fontSize: 7,
				halign: "center"
			},
			bodyStyles: { fontSize: 7 },
			columnStyles: {
				0: { cellWidth: contentW * .3 },
				1: {
					cellWidth: contentW * .35,
					halign: "right"
				},
				2: {
					cellWidth: contentW * .35,
					halign: "right"
				}
			},
			margin: {
				left: margin,
				right: margin
			},
			tableLineColor: 220,
			tableLineWidth: .1
		});
		const chartY = doc.lastAutoTable.finalY + 6;
		const barH = 25;
		const barW = (contentW - 10) / Math.min(params.chartData.length, 30);
		const maxCa = Math.max(...params.chartData.map((d) => d.ca), 1);
		doc.setFillColor(...lightGray);
		doc.roundedRect(margin, chartY, contentW, barH, 1, 1, "F");
		const displayData = params.chartData.slice(-30);
		displayData.forEach((d, i) => {
			const h = Math.max(d.ca / maxCa * (barH - 4), .5);
			const x = 16 + i * barW;
			const yBar = chartY + barH - 2 - h;
			doc.setFillColor(...orange);
			doc.rect(x, yBar, Math.max(barW - 1, 1), h, "F");
		});
		doc.setFontSize(6);
		doc.setTextColor(...gray);
		doc.text(`Max: ${maxCa}k FC · ${displayData.length} jours`, 16, chartY + barH + 4);
		y = chartY + barH + 12;
	} else {
		doc.setFontSize(8);
		doc.setTextColor(...gray);
		doc.text("Aucune donnée disponible", margin, y + 6);
		y += 12;
	}
	if (params.alerts.length > 0) {
		doc.setTextColor(...navy);
		doc.setFontSize(12);
		doc.setFont(void 0, "bold");
		doc.text("Alertes stock", margin, y);
		y += 8;
		const alertBody = params.alerts.map((a) => [
			a.product_name,
			a.sku,
			String(a.current_stock),
			String(a.stock_min),
			a.status === "rupture" ? "🔴 Rupture" : "🟡 Faible"
		]);
		autoTable(doc, {
			startY: y,
			head: [[
				"Produit",
				"SKU",
				"Stock",
				"Seuil",
				"Statut"
			]],
			body: alertBody,
			theme: "grid",
			headStyles: {
				fillColor: navy,
				fontSize: 7,
				halign: "center"
			},
			bodyStyles: { fontSize: 7 },
			columnStyles: {
				0: { cellWidth: contentW * .35 },
				1: { cellWidth: contentW * .2 },
				2: {
					cellWidth: contentW * .1,
					halign: "right"
				},
				3: {
					cellWidth: contentW * .1,
					halign: "right"
				},
				4: {
					cellWidth: contentW * .25,
					halign: "center"
				}
			},
			margin: {
				left: margin,
				right: margin
			},
			tableLineColor: 220,
			tableLineWidth: .1
		});
		y = doc.lastAutoTable.finalY + 12;
	}
	if (params.recentSales.length > 0) {
		if (y > 220) {
			doc.addPage();
			y = margin;
		}
		doc.setTextColor(...navy);
		doc.setFontSize(12);
		doc.setFont(void 0, "bold");
		doc.text("Dernières transactions", margin, y);
		y += 8;
		const paymentLabel = {
			especes: "Espèces",
			mobile_money: "Mobile",
			carte: "Carte",
			virement: "Virement",
			cheque: "Chèque"
		};
		const saleBody = params.recentSales.map((s) => [
			`#${s.number}`,
			s.client_name ?? "Particulier",
			new Date(s.created_at).toLocaleDateString("fr-FR"),
			paymentLabel[s.payment_mode] ?? s.payment_mode,
			formatXOF(Number(s.total_ttc))
		]);
		autoTable(doc, {
			startY: y,
			head: [[
				"Réf.",
				"Client",
				"Date",
				"Paiement",
				"Montant"
			]],
			body: saleBody,
			theme: "grid",
			headStyles: {
				fillColor: navy,
				fontSize: 7,
				halign: "center"
			},
			bodyStyles: { fontSize: 7 },
			columnStyles: {
				0: { cellWidth: contentW * .18 },
				1: { cellWidth: contentW * .27 },
				2: {
					cellWidth: contentW * .15,
					halign: "center"
				},
				3: {
					cellWidth: contentW * .15,
					halign: "center"
				},
				4: {
					cellWidth: contentW * .25,
					halign: "right",
					fontStyle: "bold"
				}
			},
			margin: {
				left: margin,
				right: margin
			},
			tableLineColor: 220,
			tableLineWidth: .1
		});
		y = doc.lastAutoTable.finalY + 12;
	}
	const totalPages = doc.internal.getNumberOfPages();
	for (let i = 1; i <= totalPages; i++) {
		doc.setPage(i);
		doc.setFontSize(7);
		doc.setTextColor(...gray);
		doc.text(`INDUS-ERP · Page ${i}/${totalPages} · ${params.dateLabel}`, margin, doc.internal.pageSize.getHeight() - 10);
	}
	const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	doc.save(`dashboard-${dateStr}.pdf`);
}
var iconFor = {
	stock: PackageX,
	commande: Clock,
	garantie: ShieldAlert
};
function AlertRow({ alert }) {
	const Icon = iconFor[alert.kind];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: alert.to,
		className: "flex items-start gap-3 rounded-md border border-border/60 p-3 transition hover:border-accent hover:bg-muted/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `mt-0.5 size-4 shrink-0 ${alert.severity === "critical" ? "text-destructive" : "text-amber-500"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-sm font-medium",
				children: alert.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs text-muted-foreground",
				children: alert.detail
			})]
		})]
	});
}
/** Carte des notifications intelligentes filtrées par entrepôt actif. */
function SmartAlertsCard() {
	const { data: alerts = [], isLoading } = useSmartAlerts();
	const { selectedWarehouse, selectedWarehouseId } = useWarehouse();
	const critical = alerts.filter((a) => a.severity === "critical");
	const others = alerts.filter((a) => a.severity !== "critical");
	const list = [...critical, ...others].slice(0, 12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-row items-center justify-between space-y-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 text-sm font-semibold",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-amber-500" }),
				"Alertes intelligentes",
				selectedWarehouseId !== "all" && selectedWarehouse && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-normal text-muted-foreground",
					children: ["— ", selectedWarehouse.name]
				})
			]
		}), alerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive",
			children: alerts.length
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-2",
		children: [
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Analyse en cours…"
			}),
			!isLoading && alerts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Aucune alerte : stock, commandes et garanties sont sous contrôle."
			}),
			list.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertRow, { alert: a }, a.id)),
			alerts.length > list.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"+",
					alerts.length - list.length,
					" autre(s) alerte(s)"
				]
			})
		]
	})] });
}
var DashboardChart = (0, import_react.lazy)(() => import("./dashboard-chart-FWjtLkKt.mjs").then((m) => ({ default: m.DashboardChart })));
function DashboardPage() {
	const qc = useQueryClient();
	const { selectedWarehouseId } = useWarehouseFilter();
	const { data: alerts = [], isLoading: alertsLoading } = useStockAlerts();
	const [comparisonMode, setComparisonMode] = (0, import_react.useState)("mom");
	const rtSales = useRealtimeSubscription({ table: "sales" }, { onPayload: () => {
		qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
		qc.invalidateQueries({ queryKey: ["dashboard-chart-yoy"] });
		qc.invalidateQueries({ queryKey: ["dashboard-recent-sales"] });
		qc.invalidateQueries({ queryKey: ["dashboard-sparklines"] });
		qc.invalidateQueries({ queryKey: ["dashboard-top-products"] });
	} });
	useRealtimeSubscription({ table: "stock_movements" }, { onPayload: () => {
		qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
		qc.invalidateQueries({ queryKey: ["stock-alerts"] });
	} });
	const { data: kpis, isLoading: kpisLoading } = useQuery({
		queryKey: ["dashboard-kpis", selectedWarehouseId],
		queryFn: async () => {
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			const now = /* @__PURE__ */ new Date();
			const monthStartStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
			const lastMonthStartStr = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
			const lastMonthEndStr = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
			const yoyStartStr = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().slice(0, 10);
			const yoyEndStr = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0).toISOString().slice(0, 10);
			let productCountQ = supabase.from("product_stock_levels").select("product_id", {
				count: "exact",
				head: true
			});
			if (selectedWarehouseId && selectedWarehouseId !== "all") productCountQ = productCountQ.eq("warehouse_id", selectedWarehouseId);
			let stockValueQ;
			if (selectedWarehouseId && selectedWarehouseId !== "all") stockValueQ = supabase.from("lot_stock_by_warehouse").select("current_quantity, unit_purchase_price").eq("warehouse_id", selectedWarehouseId);
			else stockValueQ = supabase.from("lot_stock").select("current_quantity, unit_purchase_price");
			const [caJourRes, caMoisRes, caMoisPrevRes, caMoisYoYRes, countJourRes, countMoisRes, countMoisYoYRes, depensesRes, depensesYoYRes, stockValueRes, productCountRes] = await Promise.all([
				supabase.from("sales").select("total_ttc").gte("created_at", today),
				supabase.from("sales").select("total_ttc").gte("created_at", monthStartStr),
				supabase.from("sales").select("total_ttc").gte("created_at", lastMonthStartStr).lte("created_at", lastMonthEndStr),
				supabase.from("sales").select("total_ttc").gte("created_at", yoyStartStr).lte("created_at", yoyEndStr),
				supabase.from("sales").select("*", {
					count: "exact",
					head: true
				}).gte("created_at", today),
				supabase.from("sales").select("*", {
					count: "exact",
					head: true
				}).gte("created_at", monthStartStr),
				supabase.from("sales").select("*", {
					count: "exact",
					head: true
				}).gte("created_at", yoyStartStr).lte("created_at", yoyEndStr),
				supabase.from("expenses").select("amount").gte("expense_date", monthStartStr),
				supabase.from("expenses").select("amount").gte("expense_date", yoyStartStr).lte("expense_date", yoyEndStr),
				stockValueQ,
				productCountQ
			]);
			const sum = (rows) => (rows ?? []).reduce((acc, r) => acc + Number(r.total_ttc), 0);
			const sumAmount = (rows) => (rows ?? []).reduce((acc, r) => acc + Number(r.amount), 0);
			const valeurStock = (stockValueRes.data ?? []).reduce((acc, r) => acc + Number(r.current_quantity ?? 0) * Number(r.unit_purchase_price ?? 0), 0);
			return {
				caJour: sum(caJourRes.data),
				caMois: sum(caMoisRes.data),
				caMoisPrecedent: sum(caMoisPrevRes.data),
				caMoisYoY: sum(caMoisYoYRes.data),
				ventesJour: countJourRes.count ?? 0,
				ventesMois: countMoisRes.count ?? 0,
				ventesMoisYoY: countMoisYoYRes.count ?? 0,
				depensesMois: sumAmount(depensesRes.data),
				depensesMoisYoY: sumAmount(depensesYoYRes.data),
				nbProduits: productCountRes.count ?? 0,
				valeurStock
			};
		},
		staleTime: 3e4,
		refetchInterval: 12e4
	});
	const { data: chartData = [] } = useQuery({
		queryKey: ["dashboard-chart-yoy"],
		queryFn: async () => {
			const thirtyDaysAgo = /* @__PURE__ */ new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			const start = thirtyDaysAgo.toISOString();
			const yoyStart = new Date(thirtyDaysAgo);
			yoyStart.setFullYear(yoyStart.getFullYear() - 1);
			const yoyEnd = /* @__PURE__ */ new Date();
			yoyEnd.setFullYear(yoyEnd.getFullYear() - 1);
			const [{ data: curData }, { data: yoyData }] = await Promise.all([supabase.from("sales").select("created_at, total_ttc").gte("created_at", start).order("created_at", { ascending: true }), supabase.from("sales").select("created_at, total_ttc").gte("created_at", yoyStart.toISOString()).lte("created_at", yoyEnd.toISOString()).order("created_at", { ascending: true })]);
			const aggregateByDay = (rows) => {
				const map = /* @__PURE__ */ new Map();
				for (const row of rows ?? []) {
					const day = row.created_at.slice(0, 10);
					map.set(day, (map.get(day) ?? 0) + Number(row.total_ttc));
				}
				return map;
			};
			const curMap = aggregateByDay(curData);
			const yoyMap = aggregateByDay(yoyData);
			const points = [];
			const d = new Date(thirtyDaysAgo);
			const today = /* @__PURE__ */ new Date();
			while (d <= today) {
				const key = d.toISOString().slice(0, 10);
				const dayNum = String(d.getDate()).padStart(2, "0");
				const yoyKey = `${d.getFullYear() - 1}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
				points.push({
					jour: dayNum,
					ca: Math.round((curMap.get(key) ?? 0) / 1e3),
					caYoY: Math.round((yoyMap.get(yoyKey) ?? 0) / 1e3)
				});
				d.setDate(d.getDate() + 1);
			}
			return points;
		},
		staleTime: 6e4
	});
	const { data: recentSales = [] } = useQuery({
		queryKey: ["dashboard-recent-sales"],
		queryFn: async () => {
			const { data } = await supabase.from("sales").select("number, client_name, total_ttc, created_at, payment_mode").order("created_at", { ascending: false }).limit(8);
			return data ?? [];
		},
		staleTime: 3e4
	});
	const { data: sparkData } = useQuery({
		queryKey: ["dashboard-sparklines"],
		queryFn: async () => {
			const sevenDaysAgo = /* @__PURE__ */ new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
			sevenDaysAgo.setHours(0, 0, 0, 0);
			const start = sevenDaysAgo.toISOString();
			const [{ data: salesData }, { data: expensesData }] = await Promise.all([supabase.from("sales").select("created_at, total_ttc").gte("created_at", start).order("created_at", { ascending: true }), supabase.from("expenses").select("expense_date, amount").gte("expense_date", start.slice(0, 10)).order("expense_date", { ascending: true })]);
			const days = [];
			const caByDay = /* @__PURE__ */ new Map();
			const salesCountByDay = /* @__PURE__ */ new Map();
			const expensesByDay = /* @__PURE__ */ new Map();
			for (let i = 0; i < 7; i++) {
				const d = new Date(sevenDaysAgo);
				d.setDate(d.getDate() + i);
				const key = d.toISOString().slice(0, 10);
				days.push(key);
				caByDay.set(key, 0);
				salesCountByDay.set(key, 0);
				expensesByDay.set(key, 0);
			}
			for (const row of salesData ?? []) {
				const day = row.created_at.slice(0, 10);
				if (caByDay.has(day)) {
					caByDay.set(day, (caByDay.get(day) ?? 0) + Number(row.total_ttc));
					salesCountByDay.set(day, (salesCountByDay.get(day) ?? 0) + 1);
				}
			}
			for (const row of expensesData ?? []) {
				const day = row.expense_date.slice(0, 10);
				if (expensesByDay.has(day)) expensesByDay.set(day, (expensesByDay.get(day) ?? 0) + Number(row.amount));
			}
			return {
				ca: days.map((d) => caByDay.get(d) ?? 0),
				ventes: days.map((d) => salesCountByDay.get(d) ?? 0),
				depenses: days.map((d) => expensesByDay.get(d) ?? 0)
			};
		},
		staleTime: 6e4
	});
	const handleExportPDF = async () => {
		if (!kpis) return;
		await generateDashboardPDF({
			dateLabel: (/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR", {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric"
			}),
			kpis: kpiDefs.map((k) => ({
				label: k.label,
				value: k.value === "..." ? "0" : k.value,
				unit: k.unit
			})),
			alerts: alerts.map((a) => ({
				product_name: a.product_name,
				sku: a.sku,
				current_stock: Number(a.current_stock),
				stock_min: a.stock_min,
				status: a.status
			})),
			recentSales: recentSales.map((s) => ({
				number: s.number,
				client_name: s.client_name,
				total_ttc: s.total_ttc,
				created_at: s.created_at,
				payment_mode: s.payment_mode
			})),
			chartData: chartData.map((d) => ({
				jour: d.jour,
				ca: d.ca,
				caYoY: d.caYoY
			})),
			caMois: kpis.caMois,
			beneficeNet,
			margeBrute
		});
	};
	const alertsCount = alerts.length;
	const ruptureCount = alerts.filter((a) => a.status === "rupture").length;
	const beneficeNet = kpis ? kpis.caMois - kpis.depensesMois : 0;
	const margeBrute = kpis && kpis.caMois > 0 ? Math.round(beneficeNet / kpis.caMois * 100) : 0;
	const deltaPct = (current, previous) => {
		if (previous <= 0) return null;
		const pct = (current - previous) / previous * 100;
		return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
	};
	const monthComparison = comparisonMode === "mom" ? {
		value: kpis?.caMoisPrecedent ?? 0,
		label: "mois dernier"
	} : {
		value: kpis?.caMoisYoY ?? 0,
		label: "an dernier"
	};
	const caMoisPct = deltaPct(kpis?.caMois ?? 0, monthComparison.value);
	const caMoisTrend = caMoisPct ? caMoisPct.startsWith("+") ? "up" : "down" : "neutral";
	const ventesMoisPct = comparisonMode === "yoy" ? deltaPct(kpis?.ventesMois ?? 0, kpis?.ventesMoisYoY ?? 0) : null;
	const caJourTrend = kpis && kpis.caJour > 0 ? "up" : "neutral";
	const caSpark = sparkData?.ca ?? [];
	const ventesSpark = sparkData?.ventes ?? [];
	const depensesSpark = sparkData?.depenses ?? [];
	const beneficeSpark = caSpark.map((v, i) => v - (depensesSpark[i] ?? 0));
	const kpiDefs = [
		{
			label: "CA du jour",
			value: kpisLoading ? "..." : formatXOF(kpis.caJour).replace(" F", ""),
			unit: "FC",
			delta: kpis && kpis.ventesJour > 0 ? `${kpis.ventesJour} vente${kpis.ventesJour > 1 ? "s" : ""}` : void 0,
			trend: caJourTrend,
			icon: DollarSign,
			sparklineData: caSpark
		},
		{
			label: "CA du mois",
			value: kpisLoading ? "..." : formatXOF(kpis.caMois).replace(" F", ""),
			unit: "FC",
			delta: caMoisPct ? `${caMoisPct} vs ${monthComparison.label}` : void 0,
			trend: caMoisTrend,
			icon: TrendingUp,
			sparklineData: caSpark
		},
		{
			label: "Ventes",
			value: kpisLoading ? "..." : String(kpis.ventesJour),
			unit: "jour",
			delta: comparisonMode === "yoy" && ventesMoisPct ? `${ventesMoisPct} vs an dernier` : kpis ? `${kpis.ventesMois} ce mois` : void 0,
			trend: "neutral",
			icon: Receipt,
			sparklineData: ventesSpark
		},
		{
			label: "Dépenses (mois)",
			value: kpisLoading ? "..." : formatXOF(kpis.depensesMois).replace(" F", ""),
			unit: "FC",
			delta: kpis && kpis.depensesMois > 0 ? `${(kpis.depensesMois / (kpis.caMois || 1) * 100).toFixed(1)}% du CA` : "0% du CA",
			trend: "neutral",
			icon: Wallet,
			sparklineData: depensesSpark
		},
		{
			label: "Bénéfice net",
			value: kpisLoading ? "..." : formatXOF(Math.max(beneficeNet, 0)).replace(" F", ""),
			unit: "FC",
			delta: `Marge ${margeBrute}%`,
			trend: beneficeNet > 0 ? "up" : "down",
			icon: TrendingUp,
			accent: true,
			sparklineData: beneficeSpark
		},
		{
			label: "Valeur stock",
			value: kpisLoading ? "..." : formatXOF(kpis.valeurStock).replace(" F", ""),
			unit: "FC",
			delta: kpis ? `${kpis.nbProduits} réf. en stock` : "...",
			trend: "neutral",
			icon: Warehouse,
			sparklineData: []
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase tracking-widest text-accent",
						children: "Vue d'ensemble"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-2xl font-semibold tracking-tight text-foreground",
						children: "Tableau de bord opérationnel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: (/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR", {
							weekday: "long",
							day: "numeric",
							month: "long",
							year: "numeric"
						})
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveBadge, { status: rtSales.status }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center rounded-lg border border-border bg-card p-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setComparisonMode("mom"),
								className: `rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${comparisonMode === "mom" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
								children: "vs Mois préc."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setComparisonMode("yoy"),
								className: `rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${comparisonMode === "yoy" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-1 inline size-3" }), "vs N-1"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: handleExportPDF,
							disabled: kpisLoading || !kpis,
							title: "Exporter le dashboard en PDF",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), "PDF"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/ventes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "mr-1 size-4" }), "Nouvelle vente"] })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
				children: kpiDefs.map((kpi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, { ...kpi }, kpi.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartAlertsCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 rounded-lg border border-border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold text-foreground",
							children: "Évolution du chiffre d'affaires"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "30 derniers jours (en milliers de FC)"
						})] }), kpis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [comparisonMode === "yoy" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "— N-1 —"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent",
								children: [
									kpis.ventesJour,
									" vente",
									kpis.ventesJour > 1 ? "s" : "",
									" aujourd'hui"
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: chartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-full items-center justify-center text-sm text-muted-foreground",
							children: "Aucune donnée pour les 30 derniers jours"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-full items-center justify-center text-sm text-muted-foreground",
								children: "Chargement du graphique…"
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardChart, {
								data: chartData,
								showYoY: comparisonMode === "yoy"
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: `size-4 ${ruptureCount > 0 ? "text-destructive" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-semibold text-foreground",
									children: "Alertes stock"
								})]
							}), !alertsLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${alertsCount > 0 ? "bg-destructive text-destructive-foreground" : "bg-success/10 text-success"}`,
								children: alertsCount > 0 ? alertsCount : "OK"
							})]
						}),
						alertsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-center py-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-5 animate-spin rounded-full border-2 border-accent border-t-transparent" })
						}) : alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleOff, { className: "size-6 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tous les stocks sont au-dessus des seuils" })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y divide-border",
							children: alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs font-semibold text-foreground",
										children: a.product_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
										children: a.sku
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-3 text-right shrink-0",
									children: [a.status === "rupture" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleOff, { className: "size-3" }), "Rupture"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3" }),
											"Faible · ",
											a.current_stock
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 font-mono text-[10px] text-muted-foreground",
										children: ["seuil ", a.stock_min]
									})]
								})]
							}, a.product_id))
						}),
						!alertsLoading && alerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-border p-3 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/produits",
								className: "text-xs font-semibold text-accent hover:underline",
								children: "Gérer les produits"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopProducts, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold text-foreground",
							children: "Dernières transactions"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/ventes",
						className: "text-xs font-semibold text-accent hover:underline",
						children: "Toutes les ventes"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5",
									children: "Référence"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5",
									children: "Client"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5",
									children: "Heure"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5",
									children: "Paiement"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-right",
									children: "Montant"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
							className: "divide-y divide-border",
							children: [recentSales.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 5,
								className: "px-4 py-8 text-center text-sm text-muted-foreground",
								children: "Aucune vente enregistrée."
							}) }), recentSales.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3 font-mono text-xs text-foreground",
										children: ["#", s.number]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-medium text-foreground",
										children: s.client_name ?? "Particulier"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-xs text-muted-foreground",
										children: formatRelativeTime(s.created_at)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentBadge, { mode: s.payment_mode })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-right font-mono font-semibold text-foreground",
										children: formatXOF(Number(s.total_ttc))
									})
								]
							}, s.number))]
						})]
					})
				})]
			})
		]
	});
}
function KpiCard({ label, value, unit, delta, trend, icon: Icon, accent, sparklineData }) {
	const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
	const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Package;
	const sparkColor = trend === "up" ? "oklch(0.65 0.18 142)" : trend === "down" ? "oklch(0.58 0.19 25)" : "oklch(0.5 0.03 257)";
	const sparkFill = trend === "up" ? "oklch(0.65 0.18 142 / 0.10)" : trend === "down" ? "oklch(0.58 0.19 25 / 0.10)" : "oklch(0.5 0.03 257 / 0.08)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-lg border p-4 transition relative ${accent ? "border-accent/30 bg-accent/5" : "border-border bg-card hover:border-accent/40"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3.5 ${accent ? "text-accent" : "text-muted-foreground"}` })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xl font-bold text-foreground",
				children: [value, unit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-1 text-xs font-medium text-muted-foreground",
					children: unit
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [delta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${trendColor}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendIcon, { className: "size-3" }), delta]
				}), sparklineData && sparklineData.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendDot, { data: sparklineData })
				})] }), sparklineData && sparklineData.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
					data: sparklineData,
					width: 72,
					height: 24,
					strokeColor: sparkColor,
					fillColor: sparkFill,
					strokeWidth: 1.5
				})]
			})
		]
	});
}
function PaymentBadge({ mode }) {
	const s = {
		especes: {
			label: "Espèces",
			cls: "bg-success/10 text-success"
		},
		mobile_money: {
			label: "Mobile",
			cls: "bg-accent/10 text-accent"
		},
		carte: {
			label: "Carte",
			cls: "bg-blue-500/10 text-blue-600"
		},
		virement: {
			label: "Virement",
			cls: "bg-muted text-muted-foreground"
		},
		cheque: {
			label: "Chèque",
			cls: "bg-warning/15 text-warning-foreground"
		}
	}[mode] ?? {
		label: mode,
		cls: "bg-muted text-muted-foreground"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.cls}`,
		children: s.label
	});
}
function formatRelativeTime(dateStr) {
	const date = new Date(dateStr);
	const diffMs = (/* @__PURE__ */ new Date()).getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 6e4);
	const diffHours = Math.floor(diffMs / 36e5);
	if (diffMin < 60) return `Il y a ${diffMin} min`;
	if (diffHours < 24) return `Il y a ${diffHours}h`;
	if (diffHours < 48) return "Hier";
	return date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short"
	});
}
/**
* Bloc Top 5 produits les plus vendus du mois
*/
function TopProducts() {
	const { data: topProducts = [] } = useQuery({
		queryKey: ["dashboard-top-products"],
		queryFn: async () => {
			const now = /* @__PURE__ */ new Date();
			const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
			const { data: items } = await supabase.from("sale_items").select("product_id, quantity, unit_price, sales!inner(created_at)").gte("sales.created_at", monthStart).order("created_at", { ascending: false }).limit(500);
			if (!items) return [];
			const agg = /* @__PURE__ */ new Map();
			for (const item of items) {
				const id = item.product_id;
				const existing = agg.get(id) ?? {
					qty: 0,
					revenue: 0
				};
				existing.qty += Number(item.quantity);
				existing.revenue += Number(item.quantity) * Number(item.unit_price);
				agg.set(id, existing);
			}
			const ids = [...agg.keys()];
			const { data: products } = await supabase.from("products").select("id, name, sku").in("id", ids);
			const productMap = new Map((products ?? []).map((p) => [p.id, p]));
			return [...agg.entries()].map(([id, stats]) => ({
				id,
				name: productMap.get(id)?.name ?? "Produit inconnu",
				sku: productMap.get(id)?.sku ?? "",
				quantity: stats.qty,
				revenue: stats.revenue
			})).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
		},
		staleTime: 6e4
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-border p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "size-4 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold text-foreground",
					children: "Top 5 produits du mois"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/produits",
				className: "text-xs font-semibold text-accent hover:underline",
				children: "Voir tout"
			})]
		}), topProducts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center py-8 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "mb-2 size-6 text-muted-foreground/40" }), "Aucune donnée pour ce mois."]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border",
			children: topProducts.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent",
						children: i + 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-foreground",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] text-muted-foreground",
							children: p.sku
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-semibold text-foreground",
							children: [
								p.quantity,
								" vendu",
								p.quantity > 1 ? "s" : ""
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: formatXOF(p.revenue)
						})]
					})
				]
			}, p.id))
		})]
	});
}
//#endregion
export { DashboardPage as component };
