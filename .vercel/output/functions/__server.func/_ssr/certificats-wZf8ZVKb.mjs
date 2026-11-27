import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { O as Search, dt as FileBadge, lt as FileText } from "../_libs/lucide-react.mjs";
import { t as formatDate } from "./format-DUkOQpcu.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/certificats-wZf8ZVKb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CertificatsPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const { data: lots = [] } = useQuery({
		queryKey: ["lots", "with-cert"],
		queryFn: async () => {
			const { data, error } = await supabase.from("lots").select("id, lot_number, reception_date, certificate_url, products(name, sku), suppliers(name)").not("certificate_url", "is", null).order("reception_date", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const debouncedQ = useDebounce(q, 200);
	const filtered = (0, import_react.useMemo)(() => lots.filter((l) => {
		if (!debouncedQ.trim()) return true;
		const s = debouncedQ.toLowerCase();
		return l.lot_number?.toLowerCase().includes(s) || l.products?.name?.toLowerCase().includes(s) || l.products?.sku?.toLowerCase().includes(s) || l.suppliers?.name?.toLowerCase().includes(s);
	}), [lots, debouncedQ]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Certificats"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Documents de conformité rattachés aux lots."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-md border bg-card px-3 py-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBadge, { className: "size-4 text-accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: lots.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "certificat(s)"
						})
					]
				})]
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° lot" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fournisseur" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Réception" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Certificat"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun certificat. Ajoutez un PDF lors de la création d'un lot."
				}) }), filtered.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
						l.products?.name,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								"(",
								l.products?.sku,
								")"
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: l.lot_number
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm",
						children: l.suppliers?.name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm",
						children: formatDate(l.reception_date)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: l.certificate_url,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex items-center gap-1 text-sm text-accent hover:underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), " Consulter le PDF"]
						})
					})
				] }, l.id))] })] })
			})
		]
	});
}
//#endregion
export { CertificatsPage as component };
