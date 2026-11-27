import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { i as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { M as redirect, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as objectType, n as literalType, o as stringType, t as coerce } from "../_libs/zod.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as isOffline } from "./session-cache-CesiV_L5.mjs";
import { n as initSentry, t as captureException } from "./ssr.mjs";
import { t as PersistQueryClientProvider } from "../_libs/@tanstack/react-query-persist-client+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router--9zmT_XK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DGsp8k2j.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
/**
* Persistance du cache TanStack Query dans IndexedDB.
*
* Objectif : au rechargement de l'application sans réseau (coupure internet
* ou courant), les dernières données consultées (produits, stock, lots…)
* restent affichables immédiatement au lieu d'un écran vide.
*
* IndexedDB est préféré à localStorage : pas de limite de 5 Mo et écriture
* asynchrone (ne bloque pas l'interface).
*/
var DB_NAME = "indus-erp-query-cache";
var STORE = "cache";
var KEY = "react-query";
/** Durée de conservation du cache hors-ligne : 7 jours. */
var OFFLINE_CACHE_MAX_AGE = 10080 * 60 * 1e3;
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function idbGet(key) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readonly");
		const req = tx.objectStore(STORE).get(key);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
		tx.oncomplete = () => db.close();
	});
}
async function idbSet(key, value) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(value, key);
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => reject(tx.error);
	});
}
async function idbDel(key) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).delete(key);
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => reject(tx.error);
	});
}
/** Crée un persister IndexedDB ; retourne `undefined` côté serveur. */
function createIdbPersister() {
	if (typeof window === "undefined" || !("indexedDB" in window)) return void 0;
	return {
		persistClient: async (client) => {
			try {
				await idbSet(KEY, client);
			} catch {}
		},
		restoreClient: async () => {
			try {
				return await idbGet(KEY);
			} catch {
				return;
			}
		},
		removeClient: async () => {
			try {
				await idbDel(KEY);
			} catch {}
		}
	};
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		position: "top-right",
		gap: 10,
		offset: 16,
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:data-[type=success]:border-emerald-500/30 group-[.toaster]:data-[type=error]:border-destructive/30 group-[.toaster]:data-[type=warning]:border-amber-500/30",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:hover:bg-primary/90",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:hover:bg-muted/80",
			icon: "group-[.toast]:size-4",
			closeButton: "group-[.toast]:text-muted-foreground/50 group-[.toast]:hover:text-foreground group-[.toast]:transition-colors"
		} },
		closeButton: true,
		richColors: true,
		...props
	});
};
initSentry().catch(() => {});
if (typeof window !== "undefined" && "serviceWorker" in navigator) window.addEventListener("load", () => {
	navigator.serviceWorker.register("/sw.js").catch(() => {});
});
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-widest text-accent",
					children: "Erreur 404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-3xl font-semibold text-foreground",
					children: "Page introuvable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Cette page n'existe pas ou a été déplacée."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Retour à l'accueil"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
		captureException(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "Erreur inattendue"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Une erreur s'est produite. Vous pouvez réessayer ou revenir à l'accueil."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Réessayer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
						children: "Accueil"
					})]
				})
			]
		})
	});
}
var Route$28 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "INDUS-ERP — Gestion de stock industriel" },
			{
				name: "description",
				content: "Logiciel de gestion de stock industriel moderne : produits, ventes, achats, inventaire, QR codes, certificats et rapports."
			},
			{
				name: "author",
				content: "INDUS-ERP"
			},
			{
				property: "og:title",
				content: "INDUS-ERP — Gestion de stock industriel"
			},
			{
				property: "og:description",
				content: "Gérez votre entreprise industrielle depuis votre téléphone, tablette ou ordinateur."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "fr",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", {
				rel: "manifest",
				href: "/manifest.json"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
				name: "theme-color",
				content: "#e8751a"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
				name: "apple-mobile-web-app-capable",
				content: "yes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
				name: "apple-mobile-web-app-title",
				content: "INDUS-ERP"
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$28.useRouteContext();
	const [persister] = (0, import_react.useState)(() => createIdbPersister());
	if (persister) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PersistQueryClientProvider, {
		client: queryClient,
		persistOptions: {
			persister,
			maxAge: OFFLINE_CACHE_MAX_AGE,
			buster: "v1",
			dehydrateOptions: { shouldDehydrateQuery: (q) => q.state.status === "success" }
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			richColors: true,
			position: "top-right"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			richColors: true,
			position: "top-right"
		})]
	});
}
var $$splitComponentImporter$27 = () => import("./routes-B8Ge4ecJ.mjs");
var Route$27 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$27, "component"),
	ssr: false
});
var $$splitComponentImporter$26 = () => import("./route-3nCQrjhM.mjs");
var Route$26 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data: sessionData } = await supabase.auth.getSession();
		const sessionUser = sessionData.session?.user ?? null;
		if (!sessionUser) throw redirect({ to: "/auth" });
		if (isOffline()) return { user: sessionUser };
		try {
			const { data, error } = await supabase.auth.getUser();
			if (error) {
				const status = error.status;
				if (status === 401 || status === 403) throw redirect({ to: "/auth" });
				return { user: sessionUser };
			}
			if (!data.user) throw redirect({ to: "/auth" });
			return { user: data.user };
		} catch (e) {
			if (e && typeof e === "object" && "to" in e) throw e;
			return { user: sessionUser };
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
/**
* Mode kiosque : plein écran, sans menus, limité aux écrans vente et scan.
*/
var $$splitComponentImporter$25 = () => import("./auth-DK7ivOzE.mjs");
var Route$25 = createFileRoute("/auth")({
	component: lazyRouteComponent($$splitComponentImporter$25, "component"),
	ssr: false,
	head: () => ({ meta: [{ title: "Connexion — INDUS-ERP" }, {
		name: "description",
		content: "Accédez à votre espace de gestion INDUS-ERP."
	}] })
});
var $$splitComponentImporter$24 = () => import("./achats-CdzfyeBq.mjs");
var Route$24 = createFileRoute("/_authenticated/achats")({
	component: lazyRouteComponent($$splitComponentImporter$24, "component"),
	head: () => ({ meta: [{ title: "Achats — INDUS-ERP" }] })
});
var $$splitComponentImporter$23 = () => import("./avoirs-Bw9bEFmq.mjs");
var Route$23 = createFileRoute("/_authenticated/avoirs")({
	component: lazyRouteComponent($$splitComponentImporter$23, "component"),
	head: () => ({ meta: [{ title: "Avoirs — INDUS-ERP" }] })
});
var $$splitComponentImporter$22 = () => import("./categories-DkQzwgZn.mjs");
var Route$22 = createFileRoute("/_authenticated/categories")({
	component: lazyRouteComponent($$splitComponentImporter$22, "component"),
	head: () => ({ meta: [{ title: "Catégories — INDUS-ERP" }] })
});
var $$splitComponentImporter$21 = () => import("./certificats-wZf8ZVKb.mjs");
var Route$21 = createFileRoute("/_authenticated/certificats")({
	component: lazyRouteComponent($$splitComponentImporter$21, "component"),
	head: () => ({ meta: [{ title: "Certificats — INDUS-ERP" }] })
});
var $$splitComponentImporter$20 = () => import("./clients-C18FwBVr.mjs");
objectType({
	name: stringType().trim().min(1, "Le nom est requis").max(255),
	company: stringType().trim().max(255).optional().or(literalType("")),
	phone: stringType().trim().max(50).optional().or(literalType("")),
	email: stringType().trim().email("Email invalide").max(255).optional().or(literalType("")),
	address: stringType().trim().max(500).optional().or(literalType("")),
	notes: stringType().trim().max(2e3).optional().or(literalType(""))
});
var Route$20 = createFileRoute("/_authenticated/clients")({
	component: lazyRouteComponent($$splitComponentImporter$20, "component"),
	head: () => ({ meta: [{ title: "Clients — INDUS-ERP" }] })
});
var $$splitComponentImporter$19 = () => import("./commandes-fournisseurs-BSy6bSCZ.mjs");
var Route$19 = createFileRoute("/_authenticated/commandes-fournisseurs")({
	component: lazyRouteComponent($$splitComponentImporter$19, "component"),
	head: () => ({ meta: [
		{ title: "Commandes fournisseurs — INDUS-ERP" },
		{
			name: "description",
			content: "Création, réception partielle, statut et historique des commandes fournisseurs depuis le stock."
		},
		{
			property: "og:title",
			content: "Commandes fournisseurs — INDUS-ERP"
		},
		{
			property: "og:description",
			content: "Suivi des commandes fournisseurs avec réception partielle et historique."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] })
});
/**
* Réception partielle : saisie des quantités reçues par ligne.
* Chaque quantité reçue génère un mouvement de stock d'entrée et met à jour
* le statut de la commande (partielle / réceptionnée).
*/
/**
* Ligne de commande mémoïsée : évite de re-rendre toutes les lignes
* quand une seule ligne change (statut, réception…).
*/
var $$splitComponentImporter$18 = () => import("./dashboard-BX8_fdWs.mjs");
var Route$18 = createFileRoute("/_authenticated/dashboard")({
	component: lazyRouteComponent($$splitComponentImporter$18, "component"),
	head: () => ({ meta: [{ title: "Tableau de bord — INDUS-ERP" }] })
});
/**
* Bloc Top 5 produits les plus vendus du mois
*/
var $$splitComponentImporter$17 = () => import("./depenses-C6oEjBnQ.mjs");
var Route$17 = createFileRoute("/_authenticated/depenses")({
	component: lazyRouteComponent($$splitComponentImporter$17, "component"),
	head: () => ({ meta: [{ title: "Dépenses — INDUS-ERP" }] })
});
var $$splitComponentImporter$16 = () => import("./emplacements-BPZiloSB.mjs");
var Route$16 = createFileRoute("/_authenticated/emplacements")({
	component: lazyRouteComponent($$splitComponentImporter$16, "component"),
	head: () => ({ meta: [{ title: "Emplacements — INDUS-ERP" }] })
});
var $$splitComponentImporter$15 = () => import("./fournisseurs-DvTa8mgx.mjs");
var Route$15 = createFileRoute("/_authenticated/fournisseurs")({
	component: lazyRouteComponent($$splitComponentImporter$15, "component"),
	head: () => ({ meta: [{ title: "Fournisseurs — INDUS-ERP" }] })
});
var $$splitComponentImporter$14 = () => import("./historique-produit-DEDJUNeZ.mjs");
var Route$14 = createFileRoute("/_authenticated/historique-produit")({
	component: lazyRouteComponent($$splitComponentImporter$14, "component"),
	head: () => ({ meta: [
		{ title: "Historique produit — Timeline unifiée | INDUS-ERP" },
		{
			name: "description",
			content: "Timeline unifiée d'un produit : achats, ventes, mouvements de stock, inventaires et numéros de série."
		},
		{
			property: "og:title",
			content: "Historique produit — Timeline unifiée"
		},
		{
			property: "og:description",
			content: "Traçabilité complète d'un produit du fournisseur au client."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] })
});
var $$splitComponentImporter$13 = () => import("./inventaire-xIUAuC7S.mjs");
var Route$13 = createFileRoute("/_authenticated/inventaire")({
	component: lazyRouteComponent($$splitComponentImporter$13, "component"),
	head: () => ({ meta: [{ title: "Inventaire — INDUS-ERP" }] })
});
var $$splitComponentImporter$12 = () => import("./lots-CktEeBsq.mjs");
objectType({
	product_id: stringType().min(1, "Le produit est requis"),
	supplier_id: stringType().optional().or(literalType("")),
	warehouse_id: stringType().optional().or(literalType("")),
	location_id: stringType().optional().or(literalType("")),
	lot_number: stringType().trim().min(1, "Le numéro de lot est requis").max(100),
	reception_date: stringType().min(1, "La date est requise"),
	quantity: coerce.number().min(.001, "La quantité doit être positive"),
	unit_purchase_price: coerce.number().min(0, "Le prix doit être positif"),
	notes: stringType().trim().max(2e3).optional().or(literalType(""))
});
var Route$12 = createFileRoute("/_authenticated/lots")({
	component: lazyRouteComponent($$splitComponentImporter$12, "component"),
	head: () => ({ meta: [{ title: "Lots — INDUS-ERP" }] })
});
var $$splitComponentImporter$11 = () => import("./parametres-C2byySST.mjs");
var Route$11 = createFileRoute("/_authenticated/parametres")({
	component: lazyRouteComponent($$splitComponentImporter$11, "component"),
	head: () => ({ meta: [{ title: "Paramètres — INDUS-ERP" }] })
});
var $$splitComponentImporter$10 = () => import("./produits-OiLtV682.mjs");
objectType({
	name: stringType().trim().min(1, "Le nom est requis").max(255),
	sku: stringType().trim().max(50).optional().or(literalType("")),
	category_id: stringType().optional().or(literalType("")),
	purchase_price: coerce.number().min(0, "Prix positif"),
	sale_price: coerce.number().min(0, "Prix positif"),
	tva: coerce.number().min(0).max(100),
	stock_min: coerce.number().min(0),
	description: stringType().trim().max(1e3).optional().or(literalType(""))
});
var Route$10 = createFileRoute("/_authenticated/produits")({
	component: lazyRouteComponent($$splitComponentImporter$10, "component"),
	head: () => ({ meta: [{ title: "Produits — INDUS-ERP" }] })
});
var $$splitComponentImporter$9 = () => import("./rapports-DcDY0y5t.mjs");
var Route$9 = createFileRoute("/_authenticated/rapports")({
	component: lazyRouteComponent($$splitComponentImporter$9, "component"),
	head: () => ({ meta: [{ title: "Rapports — INDUS-ERP" }] })
});
var $$splitComponentImporter$8 = () => import("./retours-fournisseurs-DfzSiPIa.mjs");
var Route$8 = createFileRoute("/_authenticated/retours-fournisseurs")({
	component: lazyRouteComponent($$splitComponentImporter$8, "component"),
	head: () => ({ meta: [{ title: "Retours fournisseurs — INDUS-ERP" }] })
});
var $$splitComponentImporter$7 = () => import("./sav-CkCzgbw8.mjs");
var Route$7 = createFileRoute("/_authenticated/sav")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	head: () => ({ meta: [
		{ title: "SAV — Garanties, retours et interventions | INDUS-ERP" },
		{
			name: "description",
			content: "Gestion du service après-vente : garanties, retours et interventions suivis par client et par produit."
		},
		{
			property: "og:title",
			content: "SAV — Garanties, retours et interventions"
		},
		{
			property: "og:description",
			content: "Suivi SAV par client et par produit avec interventions et coûts."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] })
});
/**
* Ligne de ticket mémoïsée : évite de re-rendre toutes les lignes
* quand une seule ligne change (statut, interventions…).
*/
/** Statut à appliquer au numéro de série selon l'issue de l'intervention. */
var $$splitComponentImporter$6 = () => import("./scanner-RXU9O7cb.mjs");
var Route$6 = createFileRoute("/_authenticated/scanner")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	head: () => ({ meta: [{ title: "Scanner QR — INDUS-ERP" }] })
});
var $$splitComponentImporter$5 = () => import("./stock-NiISVQvg.mjs");
var Route$5 = createFileRoute("/_authenticated/stock")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	head: () => ({ meta: [{ title: "Stock — INDUS-ERP" }] })
});
var $$splitComponentImporter$4 = () => import("./synchronisation-CfUrxvB-.mjs");
var Route$4 = createFileRoute("/_authenticated/synchronisation")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: () => ({ meta: [
		{ title: "Centre de synchronisation — INDUS-ERP" },
		{
			name: "description",
			content: "État de synchronisation par module, conflits détectés et resynchronisation manuelle."
		},
		{
			property: "og:title",
			content: "Centre de synchronisation — INDUS-ERP"
		},
		{
			property: "og:description",
			content: "Suivi hors ligne, conflits et resynchronisation manuelle."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] })
});
/**
* Résolution guidée : l'utilisateur choisit, champ par champ, la valeur
* locale ou la valeur serveur. La décision est appliquée au cache local
* et les champs "locaux" sont renvoyés au serveur via l'outbox.
*/
var $$splitComponentImporter$3 = () => import("./terrain-DfOYB1gl.mjs");
var Route$3 = createFileRoute("/_authenticated/terrain")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [
		{ title: "Mode terrain — INDUS-ERP" },
		{
			name: "description",
			content: "Interface terrain optimisée mobile pour scanner, entrées/sorties et inventaire rapide."
		},
		{
			property: "og:title",
			content: "Mode terrain — INDUS-ERP"
		},
		{
			property: "og:description",
			content: "Interface terrain optimisée mobile pour scanner, entrées/sorties et inventaire rapide."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] })
});
var $$splitComponentImporter$2 = () => import("./transferts-DB7MM-Q3.mjs");
var Route$2 = createFileRoute("/_authenticated/transferts")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: () => ({ meta: [
		{ title: "Transferts entre entrepôts — INDUS-ERP" },
		{
			name: "description",
			content: "Créez des bons de transfert entre entrepôts, scannez les lots et validez la réception côté destination."
		},
		{
			property: "og:title",
			content: "Transferts entre entrepôts — INDUS-ERP"
		},
		{
			property: "og:description",
			content: "Bons de transfert, scan QR et validation source/destination."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] })
});
/**
* Carte de transfert mémoïsée : évite de re-rendre toutes les cartes
* quand une seule action (envoi, réception, annulation) est en cours.
*/
var $$splitComponentImporter$1 = () => import("./utilisateurs-DwhsiYs4.mjs");
var Route$1 = createFileRoute("/_authenticated/utilisateurs")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [{ title: "Utilisateurs — INDUS-ERP" }] })
});
var $$splitComponentImporter = () => import("./ventes-D9VWRCxR.mjs");
var Route = createFileRoute("/_authenticated/ventes")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [{ title: "Ventes / POS — INDUS-ERP" }] })
});
var IndexRoute = Route$27.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$28
});
var AuthenticatedRouteRoute = Route$26.update({
	id: "/_authenticated",
	getParentRoute: () => Route$28
});
var AuthRoute = Route$25.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$28
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAchatsRoute: Route$24.update({
		id: "/achats",
		path: "/achats",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedAvoirsRoute: Route$23.update({
		id: "/avoirs",
		path: "/avoirs",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedCategoriesRoute: Route$22.update({
		id: "/categories",
		path: "/categories",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedCertificatsRoute: Route$21.update({
		id: "/certificats",
		path: "/certificats",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedClientsRoute: Route$20.update({
		id: "/clients",
		path: "/clients",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedCommandesFournisseursRoute: Route$19.update({
		id: "/commandes-fournisseurs",
		path: "/commandes-fournisseurs",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedDashboardRoute: Route$18.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedDepensesRoute: Route$17.update({
		id: "/depenses",
		path: "/depenses",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedEmplacementsRoute: Route$16.update({
		id: "/emplacements",
		path: "/emplacements",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedFournisseursRoute: Route$15.update({
		id: "/fournisseurs",
		path: "/fournisseurs",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedHistoriqueProduitRoute: Route$14.update({
		id: "/historique-produit",
		path: "/historique-produit",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedInventaireRoute: Route$13.update({
		id: "/inventaire",
		path: "/inventaire",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedLotsRoute: Route$12.update({
		id: "/lots",
		path: "/lots",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedParametresRoute: Route$11.update({
		id: "/parametres",
		path: "/parametres",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedProduitsRoute: Route$10.update({
		id: "/produits",
		path: "/produits",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedRapportsRoute: Route$9.update({
		id: "/rapports",
		path: "/rapports",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedRetoursFournisseursRoute: Route$8.update({
		id: "/retours-fournisseurs",
		path: "/retours-fournisseurs",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSavRoute: Route$7.update({
		id: "/sav",
		path: "/sav",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedScannerRoute: Route$6.update({
		id: "/scanner",
		path: "/scanner",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedStockRoute: Route$5.update({
		id: "/stock",
		path: "/stock",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSynchronisationRoute: Route$4.update({
		id: "/synchronisation",
		path: "/synchronisation",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedTerrainRoute: Route$3.update({
		id: "/terrain",
		path: "/terrain",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedTransfertsRoute: Route$2.update({
		id: "/transferts",
		path: "/transferts",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedUtilisateursRoute: Route$1.update({
		id: "/utilisateurs",
		path: "/utilisateurs",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedVentesRoute: Route.update({
		id: "/ventes",
		path: "/ventes",
		getParentRoute: () => AuthenticatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$28._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient({ defaultOptions: {
			queries: {
				staleTime: 3e4,
				gcTime: 10080 * 6e4,
				retry: 1,
				refetchOnWindowFocus: false,
				networkMode: "offlineFirst"
			},
			mutations: { networkMode: "offlineFirst" }
		} }) },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
