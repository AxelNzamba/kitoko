import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { A as Save, It as Bell, Pt as Building2, Y as Mail, f as TriangleAlert, nt as Info, s as Volume2 } from "../_libs/lucide-react.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as Separator } from "./separator-B3hsz7IR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parametres-C2byySST.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "indus-erp-settings";
var defaults = {
	companyName: "INDUS-ERP",
	address: "",
	phone: "",
	email: "",
	taxId: "",
	tvaDefault: 18,
	currency: "XOF",
	receiptFooter: "Merci de votre confiance !",
	soundEnabled: true,
	lowStockThreshold: 10,
	emailAlertsEnabled: false,
	alertEmail: ""
};
function SettingsPage() {
	const [s, setS] = (0, import_react.useState)(defaults);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) setS({
				...defaults,
				...JSON.parse(raw)
			});
		} catch {}
	}, []);
	function save() {
		localStorage.setItem(KEY, JSON.stringify(s));
		notify.success("Paramètres enregistrés", "Les modifications sont appliquées.");
	}
	function testSound() {
		notify.info("Test du son", "Notification déclenchée manuellement.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Paramètres"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Configuration de l'entreprise, du POS et des notifications."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: save,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-1 size-4" }), " Enregistrer"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold uppercase tracking-wide",
						children: "Entreprise"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom de l'entreprise" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.companyName,
								onChange: (e) => setS({
									...s,
									companyName: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Téléphone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.phone,
								onChange: (e) => setS({
									...s,
									phone: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: s.email,
								onChange: (e) => setS({
									...s,
									email: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Adresse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 2,
								value: s.address,
								onChange: (e) => setS({
									...s,
									address: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "NIF / Identifiant fiscal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.taxId,
								onChange: (e) => setS({
									...s,
									taxId: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Devise" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: s.currency,
								onChange: (e) => setS({
									...s,
									currency: e.target.value
								})
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold uppercase tracking-wide",
						children: "Vente & stock"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "TVA par défaut (%)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: "0",
								max: "100",
								value: s.tvaDefault,
								onChange: (e) => setS({
									...s,
									tvaDefault: Number(e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Seuil stock faible" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: "0",
								value: s.lowStockThreshold,
								onChange: (e) => setS({
									...s,
									lowStockThreshold: Number(e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Pied de facture" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 2,
								value: s.receiptFooter,
								onChange: (e) => setS({
									...s,
									receiptFooter: e.target.value
								})
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold uppercase tracking-wide",
						children: "Notifications"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Son des notifications"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Joue un son court à chaque alerte importante."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: s.soundEnabled,
								onCheckedChange: (v) => setS({
									...s,
									soundEnabled: v
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Tester le son"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Déclenche une notification de test."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: testSound,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "mr-1 size-4" }), " Tester"]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold uppercase tracking-wide",
						children: "Alertes stock"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Seuil affichage dashboard"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Seuil global d'affichage des alertes sur le tableau de bord. Chaque produit a son propre ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "stock_min" }),
									" défini dans sa fiche."
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: "0",
								className: "w-20",
								value: s.lowStockThreshold,
								onChange: (e) => setS({
									...s,
									lowStockThreshold: Number(e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "mt-0.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: "Notifications email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Envoyer un email lorsque le stock passe sous le seuil minimum (nécessite une clé Resend configurée)."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: s.emailAlertsEnabled,
								onCheckedChange: (v) => setS({
									...s,
									emailAlertsEnabled: v
								})
							})]
						}),
						s.emailAlertsEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 pl-7",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "alertEmail",
								children: "Email de notification"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "alertEmail",
								type: "email",
								value: s.alertEmail,
								onChange: (e) => setS({
									...s,
									alertEmail: e.target.value
								}),
								placeholder: "responsable@entreprise.cd"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold uppercase tracking-wide",
					children: "À propos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "INDUS-ERP · Gestion de stock industriel · Version 1.0"
				})]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
