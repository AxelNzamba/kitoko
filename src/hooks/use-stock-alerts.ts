import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notify";
import type { StockAlertPayload } from "@/lib/stock-alerts-email";

export type StockAlert = {
  product_id: string;
  product_name: string;
  sku: string;
  stock_min: number;
  current_stock: number;
  status: "rupture" | "faible";
};

const ALERTS_KEY = ["stock-alerts"];
const SEEN_KEY = "indus-erp-seen-alerts";
const SETTINGS_KEY = "indus-erp-settings";

/**
 * Charge la configuration depuis localStorage
 */
function loadSettings() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Charge les alertes déjà vues (pour éviter les doublons de notification)
 */
function loadSeenAlerts(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveSeenAlerts(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

/**
 * Hook qui interroge la fonction check_stock_alerts() et déclenche
 * des notifications in-app pour les nouveaux produits sous seuil.
 */
export function useStockAlerts() {
  return useQuery<StockAlert[]>({
    queryKey: ALERTS_KEY,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("check_stock_alerts");
      if (error) throw error;
      return (data ?? []) as StockAlert[];
    },
    refetchInterval: 60_000, // toutes les 60s
    staleTime: 30_000,
  });
}

/**
 * Vérifie les alertes et notifie l'utilisateur pour les nouvelles.
 * Appelée après chaque mouvement de stock ou vente.
 */
export async function checkAndNotifyAlerts() {
  const { data } = await (supabase.rpc as any)("check_stock_alerts");
  if (!data || !Array.isArray(data)) return;

  const alerts = data as StockAlert[];
  const seen = loadSeenAlerts();

  const newAlerts: StockAlert[] = [];

  for (const a of alerts) {
    const id = `${a.product_id}-${a.status}`;
    if (seen.has(id)) continue;
    seen.add(id);
    newAlerts.push(a);

    const label =
      a.status === "rupture" ? "🔴 RUPTURE DE STOCK" : "🟡 Stock faible";
    notify.warning(
      `${label} : ${a.product_name}`,
      `Stock: ${a.current_stock} / seuil: ${a.stock_min} — SKU: ${a.sku}`,
    );
  }

  saveSeenAlerts(seen);

  // Email notification si configuré
  if (newAlerts.length > 0) {
    const settings = loadSettings();
    if (settings?.emailAlertsEnabled && settings?.alertEmail) {
      const { sendStockAlertEmail } = await import("@/lib/stock-alerts-email");
      const payload: StockAlertPayload[] = newAlerts.map((a) => ({
        product_name: a.product_name,
        sku: a.sku,
        current_stock: Number(a.current_stock),
        stock_min: a.stock_min,
        status: a.status,
      }));
      sendStockAlertEmail(settings.alertEmail, payload);
    }
  }
}
