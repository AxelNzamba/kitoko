import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { $ as LayoutGrid, Q as List, at as Grid3x3, j as Rows3, ot as Grid2x2 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/view-mode-toggle-CMF486cj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Modes d'affichage disponibles pour les listes de l'application.
* - xl-icons  : très grandes icônes (2-3 colonnes)
* - icons     : grandes icônes (3-5 colonnes)
* - mosaic    : mosaïque compacte (4-8 colonnes)
* - details   : cartes détaillées (1-2 colonnes, toutes les infos)
* - list      : tableau classique
*/
var VIEW_MODES = [
	"xl-icons",
	"icons",
	"mosaic",
	"details",
	"list"
];
var OPTIONS = [
	{
		mode: "xl-icons",
		label: "Très grandes icônes",
		icon: Grid2x2
	},
	{
		mode: "icons",
		label: "Grandes icônes",
		icon: LayoutGrid
	},
	{
		mode: "mosaic",
		label: "Mosaïque",
		icon: Grid3x3
	},
	{
		mode: "details",
		label: "Détails",
		icon: Rows3
	},
	{
		mode: "list",
		label: "Liste",
		icon: List
	}
];
/** Persiste le mode d'affichage choisi par écran. */
function useViewMode(storageKey, fallback = "list") {
	const key = `indus-erp:view-mode:${storageKey}`;
	const [mode, setModeState] = (0, import_react.useState)(fallback);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const stored = window.localStorage.getItem(key);
		if (stored && VIEW_MODES.includes(stored)) setModeState(stored);
	}, [key]);
	return {
		mode,
		setMode: (0, import_react.useCallback)((v) => {
			setModeState(v);
			if (typeof window !== "undefined") window.localStorage.setItem(key, v);
		}, [key])
	};
}
/** Classes de grille associées à chaque mode. */
function viewGridClass(mode) {
	switch (mode) {
		case "xl-icons": return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
		case "icons": return "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
		case "mosaic": return "grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";
		case "details": return "grid grid-cols-1 gap-3 xl:grid-cols-2";
		default: return "";
	}
}
function ViewModeToggle({ mode, onChange, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"aria-label": "Mode d'affichage",
		className: cn("flex items-center gap-0.5 rounded-md border bg-card p-0.5", className),
		children: OPTIONS.map(({ mode: m, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: mode === m ? "default" : "ghost",
			size: "sm",
			className: "size-7 p-0",
			"aria-label": label,
			"aria-pressed": mode === m,
			title: label,
			onClick: () => onChange(m),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: m === "xl-icons" ? "size-4.5" : "size-4" })
		}, m))
	});
}
//#endregion
export { useViewMode as n, viewGridClass as r, ViewModeToggle as t };
