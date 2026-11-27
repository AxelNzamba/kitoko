import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { Dt as ChevronRight, Ot as ChevronLeft } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pagination-CM0hvVxo.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Composant de pagination réutilisable.
*
* Affiche les contrôles de navigation (pages précédente/suivante)
* et un sélecteur de taille de page.
*/
function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const start = (page - 1) * pageSize + 1;
	const end = Math.min(page * pageSize, total);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: total > 0 ? `${start}–${end} sur ${total} résultat${total > 1 ? "s" : ""}` : "Aucun résultat"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: "Lignes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: String(pageSize),
					onValueChange: (v) => {
						onPageSizeChange(Number(v));
						onPageChange(1);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-8 w-16 text-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
						10,
						20,
						50,
						100
					].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: String(size),
						children: size
					}, size)) })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						className: "h-8 w-8",
						disabled: page <= 1,
						onClick: () => onPageChange(page - 1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground",
						children: [
							page,
							" / ",
							totalPages
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						className: "h-8 w-8",
						disabled: page >= totalPages,
						onClick: () => onPageChange(page + 1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
					})
				]
			})]
		})]
	});
}
//#endregion
export { Pagination as t };
