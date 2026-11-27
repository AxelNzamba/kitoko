import { supabase } from "@/integrations/supabase/client";
import { getSyncDB, type CachedRow } from "@/lib/sync/db";
import { enqueueMutation } from "@/lib/sync/engine";
import type { SyncTable } from "@/lib/sync/module-map";
import { isOffline } from "./session-cache";

/**
 * Accès aux données du mode terrain avec repli hors-ligne.
 *
 * Principe : en ligne on interroge le backend ; si le réseau est absent ou
 * tombe pendant la requête, on retombe sur le miroir local Dexie (alimenté
 * par le moteur de synchro). Les écritures suivent la même logique : insert
 * direct si possible, sinon mise en file d'attente (outbox) rejouée au
 * retour de la connexion.
 */

export type WriteResult = { queued: boolean };

/** Vrai si l'erreur ressemble à une coupure réseau (et non à un refus serveur). */
export function isNetworkError(e: unknown): boolean {
  if (isOffline()) return true;
  const msg = String((e as { message?: string })?.message ?? e ?? "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    msg.includes("fetch failed") ||
    msg.includes("timeout")
  );
}

/** Identifiant utilisateur lu depuis la session locale (fonctionne sans réseau). */
export async function getLocalUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

function matchesWarehouse(row: CachedRow, warehouseId: string | "all" | null | undefined): boolean {
  if (!warehouseId || warehouseId === "all") return true;
  return row.warehouse_id === warehouseId;
}

function alive(row: CachedRow): boolean {
  return !row._deleted;
}

// ---------------------------------------------------------------------------
// Lectures (cache local)
// ---------------------------------------------------------------------------

export async function cachedProducts(): Promise<CachedRow[]> {
  const rows = await getSyncDB().cache("products").toArray();
  return rows.filter(alive).sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
}

export async function cachedProductById(id: string): Promise<CachedRow | null> {
  const row = await getSyncDB().cache("products").get(id);
  return row && alive(row) ? row : null;
}

export async function cachedProductByCode(code: string): Promise<CachedRow | null> {
  const rows = await getSyncDB().cache("products").toArray();
  return rows.find((p) => alive(p) && (p.sku === code || p.barcode === code)) ?? null;
}

export async function cachedLotByNumber(
  lotNumber: string,
  warehouseId: string | "all" | null | undefined,
): Promise<CachedRow | null> {
  const rows = await getSyncDB().cache("lots").toArray();
  return rows.find((l) => alive(l) && l.lot_number === lotNumber && matchesWarehouse(l, warehouseId)) ?? null;
}

export async function cachedLotsForProduct(
  productId: string,
  warehouseId: string | "all" | null | undefined,
): Promise<CachedRow[]> {
  const rows = await getSyncDB().cache("lots").toArray();
  return rows
    .filter((l) => alive(l) && l.product_id === productId && matchesWarehouse(l, warehouseId))
    .sort((a, b) => String(b.reception_date ?? "").localeCompare(String(a.reception_date ?? "")));
}

export async function cachedOpenSessions(
  warehouseId: string | "all" | null | undefined,
): Promise<CachedRow[]> {
  const rows = await getSyncDB().cache("inventory_sessions").toArray();
  return rows
    .filter((s) => alive(s) && s.status === "ouverte" && matchesWarehouse(s, warehouseId))
    .sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
}

/**
 * Exécute une lecture réseau avec repli automatique sur le cache local.
 * Le repli est aussi utilisé quand la requête échoue pour cause réseau.
 */
export async function withOfflineFallback<T>(
  online: () => Promise<T>,
  offline: () => Promise<T>,
): Promise<T> {
  if (isOffline()) return offline();
  try {
    return await online();
  } catch (e) {
    if (isNetworkError(e)) return offline();
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Écritures (insert direct ou file d'attente)
// ---------------------------------------------------------------------------

/**
 * Insère une ligne : direct si en ligne, sinon via l'outbox.
 * Un refus serveur (RLS, validation) est remonté tel quel : on ne met jamais
 * en file une opération que le serveur a explicitement rejetée.
 */
export async function insertOrQueue(
  table: SyncTable,
  payload: Record<string, unknown>,
): Promise<WriteResult> {
  const id = (payload.id as string | undefined) ?? crypto.randomUUID();
  const row = { ...payload, id };

  if (isOffline()) {
    await enqueueMutation(table, "upsert", id, row);
    return { queued: true };
  }

  try {
    const { error } = await (supabase as any).from(table).insert(row);
    if (error) throw error;
    return { queued: false };
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    await enqueueMutation(table, "upsert", id, row);
    return { queued: true };
  }
}
