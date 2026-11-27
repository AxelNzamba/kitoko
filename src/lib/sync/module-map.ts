/**
 * Mapping module UI → table(s) Supabase pour l'affichage du statut de synchro.
 * Une entrée par item de sidebar. `tables[]` liste les tables sur lesquelles
 * on agrège l'outbox et le last_pull_at.
 */
export type ModuleSyncSpec = {
  key: string;         // identifiant stable (path sans le /)
  tables: string[];    // tables Supabase concernées
};

export const MODULE_TABLES: ModuleSyncSpec[] = [
  { key: "produits", tables: ["products"] },
  { key: "categories", tables: ["categories"] },
  { key: "stock", tables: ["stock_movements"] },
  { key: "lots", tables: ["lots"] },
  { key: "certificats", tables: ["lots"] },
  { key: "inventaire", tables: ["inventory_sessions", "inventory_counts"] },
  { key: "ventes", tables: ["sales", "sale_items"] },
  { key: "clients", tables: ["clients"] },
  { key: "achats", tables: ["lots"] },
  { key: "fournisseurs", tables: ["suppliers"] },
  { key: "depenses", tables: ["expenses"] },
  { key: "transferts", tables: ["stock_transfers", "stock_transfer_items"] },
];


/**
 * Toutes les tables métier synchronisées.
 */
export const SYNC_TABLES = [
  "products",
  "categories",
  "suppliers",
  "clients",
  "lots",
  "stock_movements",
  "sales",
  "sale_items",
  "inventory_sessions",
  "inventory_counts",
  "expenses",
  "stock_transfers",
  "stock_transfer_items",
] as const;


export type SyncTable = (typeof SYNC_TABLES)[number];
