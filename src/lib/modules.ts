import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Receipt,
  Users,
  Truck,
  Boxes,
  FileBadge,
  ClipboardCheck,
  QrCode,
  Wallet,
  BarChart3,
  UserCog,
  Settings,
  Tags,
  Wrench,
  RefreshCcw,
  ClipboardList,
  History as HistoryIcon,
  Smartphone,
  ArrowLeftRight,
  Activity,
  HandCoins,
  Sparkles,
  BedDouble,
  CalendarDays,
  BrushCleaning,
  Hotel,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppRole = "proprietaire" | "magasinier" | "caissier" | "receptionniste";

/** Applications INDUS-ERP (sélecteur façon Odoo). */
export type AppKey = "stock" | "hotel";

export type ModuleItem = {
  title: string;
  to: string;
  icon: LucideIcon;
  roles: AppRole[];
};

export type ModuleGroup = {
  label: string;
  app?: AppKey;
  items: ModuleItem[];
};

const ALL: AppRole[] = ["proprietaire", "magasinier", "caissier"];

export const modules: ModuleGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", to: "/dashboard", icon: LayoutDashboard, roles: ["proprietaire"] },
      { title: "Assistant intelligent", to: "/assistant", icon: Sparkles, roles: ALL },
      { title: "Produits", to: "/produits", icon: Package, roles: ALL },
      { title: "Historique produit", to: "/historique-produit", icon: HistoryIcon, roles: ALL },
      { title: "Catégories", to: "/categories", icon: Tags, roles: ["proprietaire", "magasinier"] },
    ],
  },
  {
    label: "Opérations",
    items: [
      { title: "Stock", to: "/stock", icon: Warehouse, roles: ["proprietaire", "magasinier"] },
      { title: "Emplacements", to: "/emplacements", icon: Warehouse, roles: ["proprietaire", "magasinier"] },
      { title: "Lots", to: "/lots", icon: Boxes, roles: ["proprietaire", "magasinier"] },
      { title: "Certificats", to: "/certificats", icon: FileBadge, roles: ["proprietaire", "magasinier"] },
      { title: "Inventaire", to: "/inventaire", icon: ClipboardCheck, roles: ["proprietaire", "magasinier"] },
      { title: "Scanner QR", to: "/scanner", icon: QrCode, roles: ALL },
      { title: "Commandes fournisseurs", to: "/commandes-fournisseurs", icon: ClipboardList, roles: ["proprietaire", "magasinier"] },
      { title: "Transferts entrepôts", to: "/transferts", icon: ArrowLeftRight, roles: ["proprietaire", "magasinier"] },
      { title: "Mode terrain", to: "/terrain", icon: Smartphone, roles: ["proprietaire", "magasinier"] },
    ],
  },
  {
    label: "Commercial",
    items: [
      { title: "Ventes / POS", to: "/ventes", icon: Receipt, roles: ["proprietaire", "caissier"] },
      { title: "Clients", to: "/clients", icon: Users, roles: ["proprietaire", "caissier"] },
      { title: "Crédits clients", to: "/credits", icon: HandCoins, roles: ["proprietaire", "caissier"] },
      { title: "Achats", to: "/achats", icon: ShoppingCart, roles: ["proprietaire"] },
      { title: "Retours fournisseurs", to: "/retours-fournisseurs", icon: Truck, roles: ["proprietaire"] },
      { title: "Avoirs", to: "/avoirs", icon: Receipt, roles: ["proprietaire", "caissier"] },
      { title: "Fournisseurs", to: "/fournisseurs", icon: Truck, roles: ["proprietaire"] },
      { title: "SAV", to: "/sav", icon: Wrench, roles: ALL },
    ],
  },
  {
    label: "Analyse & Config",
    items: [
      { title: "Dépenses", to: "/depenses", icon: Wallet, roles: ["proprietaire"] },
      { title: "Rapports", to: "/rapports", icon: BarChart3, roles: ["proprietaire"] },
      { title: "Journal d'activité", to: "/activite", icon: Activity, roles: ["proprietaire"] },
      { title: "Erreurs & sauvegardes", to: "/surveillance", icon: Activity, roles: ["proprietaire"] },
      { title: "Utilisateurs", to: "/utilisateurs", icon: UserCog, roles: ["proprietaire"] },
      { title: "Paramètres", to: "/parametres", icon: Settings, roles: ["proprietaire"] },
      { title: "Synchronisation", to: "/synchronisation", icon: RefreshCcw, roles: ALL },
    ],
  },
];

export const roleLabels: Record<AppRole, string> = {
  proprietaire: "Propriétaire",
  magasinier: "Magasinier",
  caissier: "Caissier / Commercial",
  receptionniste: "Réceptionniste",
};

const HOTEL: AppRole[] = ["proprietaire", "receptionniste"];

export const hotelModules: ModuleGroup[] = [
  {
    label: "Hôtel",
    app: "hotel",
    items: [
      { title: "Tableau & planning", to: "/hotel", icon: Hotel, roles: HOTEL },
      { title: "Réservations", to: "/hotel/reservations", icon: CalendarDays, roles: HOTEL },
      { title: "Chambres", to: "/hotel/chambres", icon: BedDouble, roles: HOTEL },
      { title: "Ménage", to: "/hotel/menage", icon: BrushCleaning, roles: HOTEL },
    ],
  },
];

export type AppDef = {
  key: AppKey;
  name: string;
  tagline: string;
  home: string;
  icon: LucideIcon;
  roles: AppRole[];
};

export const apps: AppDef[] = [
  { key: "stock", name: "Kitoko Stock Management", tagline: "Stock, caisse, entrepôts, achats", home: "/dashboard", icon: Package, roles: ["proprietaire", "magasinier", "caissier"] },
  { key: "hotel", name: "Kitoko Hôtel", tagline: "Chambres, réservations, séjours, ménage", home: "/hotel", icon: Hotel, roles: HOTEL },
];

/** Application active déduite de l'adresse de la page. */
export function appFromPath(pathname: string): AppKey {
  return pathname === "/hotel" || pathname.startsWith("/hotel/") ? "hotel" : "stock";
}

export function groupsForApp(app: AppKey): ModuleGroup[] {
  return app === "hotel" ? hotelModules : modules;
}

/** Première page accessible d'une application pour ces rôles. */
export function appHome(app: AppKey, roles: AppRole[]): string {
  for (const g of groupsForApp(app))
    for (const i of g.items) if (roles.some((r) => i.roles.includes(r))) return i.to;
  return "/applications";
}
