import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as Shield } from "../_libs/lucide-react.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B8Ge4ecJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Index() {
	const [status, setStatus] = (0, import_react.useState)("loading");
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			setStatus(data.session ? "in" : "out");
		});
	}, []);
	if (status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-6" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: "INDUS-ERP"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: status === "in" ? "/dashboard" : "/auth",
		replace: true
	});
}
//#endregion
export { Index as component };
