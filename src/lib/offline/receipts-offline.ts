import { supabase } from "@/integrations/supabase/client";

/**
 * Réceptions fournisseur hors-ligne.
 * - Les commandes en attente (avec leurs lignes) sont copiées localement à chaque lecture en ligne.
 * - Hors-ligne, les mouvements d'entrée passent par l'outbox (insertOrQueue) et la
 *   mise à jour du statut de commande est mise en attente ici, puis rejouée au retour du réseau.
 */
const ORDERS_KEY = "indus-erp:po-to-receive";
const PENDING_KEY = "indus-erp:po-status-pending";

export type CachedOrder = {
  id: string;
  po_number: string;
  supplier_id: string | null;
  warehouse_id: string | null;
  purchase_order_items: { product_id: string; quantity_ordered: number; unit_price: number }[];
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

export const getCachedOrders = () => read<CachedOrder[]>(ORDERS_KEY, []);
export const setCachedOrders = (orders: CachedOrder[]) => write(ORDERS_KEY, orders);

/** Après une réception hors-ligne : retire la commande si complète et met le statut en attente. */
export function queueOrderStatus(id: string, status: "receptionnee" | "partielle") {
  const pending = read<Record<string, string>>(PENDING_KEY, {});
  pending[id] = status;
  write(PENDING_KEY, pending);
  if (status === "receptionnee") setCachedOrders(getCachedOrders().filter((o) => o.id !== id));
}

export function pendingOrderStatusCount(): number {
  return Object.keys(read<Record<string, string>>(PENDING_KEY, {})).length;
}

/** Rejoue les statuts en attente. Appelé au retour du réseau. */
export async function flushOrderStatuses(): Promise<void> {
  const pending = read<Record<string, string>>(PENDING_KEY, {});
  for (const [id, status] of Object.entries(pending)) {
    const { error } = await (supabase as any).from("purchase_orders").update({ status }).eq("id", id);
    if (error) return; // on réessaiera au prochain retour réseau
    delete pending[id];
    write(PENDING_KEY, pending);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => { void flushOrderStatuses(); });
  if (navigator.onLine) setTimeout(() => void flushOrderStatuses(), 3000);
}
