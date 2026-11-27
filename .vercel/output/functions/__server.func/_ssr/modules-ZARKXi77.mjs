import { Bt as ArrowLeftRight, E as Settings, F as QrCode, Ft as Boxes, H as Package, N as RefreshCcw, P as Receipt, S as ShoppingCart, _t as ClipboardList, a as Warehouse, b as Smartphone, c as Users, d as Truck, dt as FileBadge, et as LayoutDashboard, g as Tags, jt as ChartColumn, l as UserCog, n as Wrench, o as Wallet, rt as History, vt as ClipboardCheck } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/modules-ZARKXi77.js
var ALL = [
	"proprietaire",
	"magasinier",
	"caissier"
];
var modules = [
	{
		label: "Principal",
		items: [
			{
				title: "Tableau de bord",
				to: "/dashboard",
				icon: LayoutDashboard,
				roles: ["proprietaire"]
			},
			{
				title: "Produits",
				to: "/produits",
				icon: Package,
				roles: ALL
			},
			{
				title: "Historique produit",
				to: "/historique-produit",
				icon: History,
				roles: ALL
			},
			{
				title: "Catégories",
				to: "/categories",
				icon: Tags,
				roles: ["proprietaire", "magasinier"]
			}
		]
	},
	{
		label: "Opérations",
		items: [
			{
				title: "Stock",
				to: "/stock",
				icon: Warehouse,
				roles: ["proprietaire", "magasinier"]
			},
			{
				title: "Emplacements",
				to: "/emplacements",
				icon: Warehouse,
				roles: ["proprietaire", "magasinier"]
			},
			{
				title: "Lots",
				to: "/lots",
				icon: Boxes,
				roles: ["proprietaire", "magasinier"]
			},
			{
				title: "Certificats",
				to: "/certificats",
				icon: FileBadge,
				roles: ["proprietaire", "magasinier"]
			},
			{
				title: "Inventaire",
				to: "/inventaire",
				icon: ClipboardCheck,
				roles: ["proprietaire", "magasinier"]
			},
			{
				title: "Scanner QR",
				to: "/scanner",
				icon: QrCode,
				roles: ALL
			},
			{
				title: "Commandes fournisseurs",
				to: "/commandes-fournisseurs",
				icon: ClipboardList,
				roles: ["proprietaire", "magasinier"]
			},
			{
				title: "Transferts entrepôts",
				to: "/transferts",
				icon: ArrowLeftRight,
				roles: ["proprietaire", "magasinier"]
			},
			{
				title: "Mode terrain",
				to: "/terrain",
				icon: Smartphone,
				roles: ["proprietaire", "magasinier"]
			}
		]
	},
	{
		label: "Commercial",
		items: [
			{
				title: "Ventes / POS",
				to: "/ventes",
				icon: Receipt,
				roles: ["proprietaire", "caissier"]
			},
			{
				title: "Clients",
				to: "/clients",
				icon: Users,
				roles: ["proprietaire", "caissier"]
			},
			{
				title: "Achats",
				to: "/achats",
				icon: ShoppingCart,
				roles: ["proprietaire"]
			},
			{
				title: "Retours fournisseurs",
				to: "/retours-fournisseurs",
				icon: Truck,
				roles: ["proprietaire"]
			},
			{
				title: "Avoirs",
				to: "/avoirs",
				icon: Receipt,
				roles: ["proprietaire", "caissier"]
			},
			{
				title: "Fournisseurs",
				to: "/fournisseurs",
				icon: Truck,
				roles: ["proprietaire"]
			},
			{
				title: "SAV",
				to: "/sav",
				icon: Wrench,
				roles: ALL
			}
		]
	},
	{
		label: "Analyse & Config",
		items: [
			{
				title: "Dépenses",
				to: "/depenses",
				icon: Wallet,
				roles: ["proprietaire"]
			},
			{
				title: "Rapports",
				to: "/rapports",
				icon: ChartColumn,
				roles: ["proprietaire"]
			},
			{
				title: "Utilisateurs",
				to: "/utilisateurs",
				icon: UserCog,
				roles: ["proprietaire"]
			},
			{
				title: "Paramètres",
				to: "/parametres",
				icon: Settings,
				roles: ["proprietaire"]
			},
			{
				title: "Synchronisation",
				to: "/synchronisation",
				icon: RefreshCcw,
				roles: ALL
			}
		]
	}
];
var roleLabels = {
	proprietaire: "Propriétaire",
	magasinier: "Magasinier",
	caissier: "Caissier / Commercial"
};
//#endregion
export { roleLabels as n, modules as t };
