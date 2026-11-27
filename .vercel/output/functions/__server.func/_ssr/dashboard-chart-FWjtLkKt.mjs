import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-chart-FWjtLkKt.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Graphique d'évolution du CA (30 derniers jours).
* Composant isolé pour permettre le code-splitting de recharts (~100 KB gzippé)
* hors du bundle initial de la route dashboard.
*/
function DashboardChart({ data, showYoY }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: -20,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "caGradient",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "oklch(0.7 0.19 45)",
						stopOpacity: .35
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "oklch(0.7 0.19 45)",
						stopOpacity: 0
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					stroke: "oklch(0.92 0.01 255)",
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "jour",
					stroke: "oklch(0.5 0.03 257)",
					fontSize: 11,
					tickLine: false,
					axisLine: false,
					interval: "preserveStartEnd"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					stroke: "oklch(0.5 0.03 257)",
					fontSize: 11,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: {
						background: "oklch(0.2 0.04 265)",
						border: "none",
						borderRadius: 6,
						color: "white",
						fontSize: 12
					},
					labelFormatter: (l) => `Jour ${l}`,
					formatter: (v, name) => {
						if (name === "ca") return [`${v}k FC`, "CA N"];
						return [`${v}k FC`, "CA N-1"];
					}
				}),
				showYoY && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "caYoY",
					stroke: "oklch(0.5 0.03 257 / 0.4)",
					strokeWidth: 1.5,
					strokeDasharray: "4 3",
					fill: "none",
					dot: false,
					activeDot: {
						r: 3,
						fill: "oklch(0.5 0.03 257)"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "ca",
					stroke: "oklch(0.7 0.19 45)",
					strokeWidth: 2,
					fill: "url(#caGradient)",
					dot: false,
					activeDot: {
						r: 4,
						fill: "oklch(0.7 0.19 45)"
					}
				})
			]
		})
	});
}
//#endregion
export { DashboardChart };
