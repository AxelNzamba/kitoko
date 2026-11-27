import { t as supabase } from "./client-65E2KTpn.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { C as Shield, T as ShieldAlert, l as UserCog, w as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as formatDate } from "./format-DUkOQpcu.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as roleLabels } from "./modules-ZARKXi77.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utilisateurs-DwhsiYs4.js
var import_jsx_runtime = require_jsx_runtime();
var roleIcon = {
	proprietaire: ShieldCheck,
	magasinier: Shield,
	caissier: ShieldAlert
};
var roleColor = {
	proprietaire: "text-accent",
	magasinier: "text-sky-500",
	caissier: "text-emerald-500"
};
function UsersPage() {
	const { data: profiles = [] } = useQuery({
		queryKey: ["profiles"],
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const { data: roles = [] } = useQuery({
		queryKey: ["all-roles"],
		queryFn: async () => {
			const { data, error } = await supabase.from("user_roles").select("*");
			if (error) throw error;
			return data;
		}
	});
	const rolesFor = (uid) => roles.filter((r) => r.user_id === uid).map((r) => r.role);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Utilisateurs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [profiles.length, " compte(s). Nouveaux comptes créés depuis la page d'inscription."]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "mt-0.5 size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Rôles disponibles"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-1 space-y-0.5 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"• ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Propriétaire" }),
								" — accès total"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"• ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Magasinier" }),
								" — stock, lots, inventaire, certificats"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"• ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Caissier / Commercial" }),
								" — ventes, clients, POS"
							] })
						]
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Utilisateur" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Téléphone" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Rôles" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Créé le" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [profiles.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 4,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun utilisateur."
				}) }), profiles.map((p) => {
					const userRoles = rolesFor(p.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: p.full_name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted-foreground",
							children: p.phone ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1",
							children: [userRoles.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Aucun"
							}), userRoles.map((r) => {
								const Icon = roleIcon[r];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium ${roleColor[r]}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }),
										" ",
										roleLabels[r]
									]
								}, r);
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted-foreground",
							children: formatDate(p.created_at)
						})
					] }, p.id);
				})] })] })
			})
		]
	});
}
//#endregion
export { UsersPage as component };
