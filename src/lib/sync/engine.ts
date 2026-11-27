import { supabase } from "@/integrations/supabase/client";
import {
  getSyncDB,
  getClientId,
  type CachedRow,
  type OutboxEntry,
  type PendingConflict,
  type PendingConflictField,
} from "./db";
import { SYNC_TABLES, type SyncTable } from "./module-map";

const IGNORED_FIELDS = new Set([
  "id",
  "created_at",
  "updated_at",
  "_field_versions",
  "_client_id",
  "_deleted",
]);

function rowLabel(row: CachedRow): string {
  const candidates = ["name", "number", "sku", "lot_number", "label", "ticket_number", "po_number", "transfer_number"];
  for (const k of candidates) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return String(row.id).slice(0, 8) + "…";
}

/**
 * Détecte un conflit réel nécessitant un arbitrage : un champ a été modifié
 * localement ET côté serveur (les deux versions sont non nulles) avec des
 * valeurs différentes. Le CRDT tranche automatiquement, mais l'utilisateur
 * peut ensuite revenir sur la décision champ par champ.
 */
export function detectConflict(
  table: SyncTable,
  local: CachedRow | undefined,
  remote: CachedRow,
): PendingConflict | null {
  if (!local) return null;
  const localV = local._field_versions ?? {};
  const remoteV = remote._field_versions ?? {};
  const fields: PendingConflictField[] = [];

  for (const k of Object.keys(localV)) {
    if (IGNORED_FIELDS.has(k)) continue;
    const lv = localV[k] ?? 0;
    const rv = remoteV[k] ?? 0;
    if (lv === 0 || rv === 0) continue;
    if (lv === rv) continue;
    if (JSON.stringify(local[k] ?? null) === JSON.stringify(remote[k] ?? null)) continue;
    fields.push({
      field: k,
      local_value: local[k] ?? null,
      server_value: remote[k] ?? null,
      local_version: lv,
      server_version: rv,
    });
  }

  if (fields.length === 0) return null;
  return {
    table,
    row_id: String(remote.id),
    label: rowLabel(remote),
    fields,
    detected_at: Date.now(),
    status: "pending",
  };
}

/**
 * Applique une décision champ par champ prise par l'utilisateur.
 * Les champs "local" sont renvoyés au serveur via l'outbox ; les champs
 * "server" sont simplement conservés dans le cache local.
 */
export async function resolvePendingConflict(
  conflictId: number,
  decisions: Record<string, "local" | "server">,
): Promise<void> {
  const db = getSyncDB();
  const conflict = await db.pending_conflicts.get(conflictId);
  if (!conflict) return;

  const cache = db.cache(conflict.table);
  const current = await cache.get(conflict.row_id);
  const patch: Record<string, unknown> = {};

  for (const f of conflict.fields) {
    const choice = decisions[f.field] ?? "server";
    patch[f.field] = choice === "local" ? f.local_value : f.server_value;
  }

  if (current) {
    await cache.put({ ...current, ...patch } as CachedRow);
  }

  const toPush = conflict.fields.filter((f) => (decisions[f.field] ?? "server") === "local");
  if (toPush.length > 0) {
    const pushPatch: Record<string, unknown> = {};
    for (const f of toPush) pushPatch[f.field] = f.local_value;
    await enqueueMutation(conflict.table, "upsert", conflict.row_id, pushPatch);
  }

  await db.pending_conflicts.update(conflictId, {
    status: "resolved",
    resolved_at: Date.now(),
    decisions,
  });

  await db.conflicts.add({
    table: conflict.table,
    row_id: conflict.row_id,
    local_versions: Object.fromEntries(conflict.fields.map((f) => [f.field, f.local_version])),
    server_versions: Object.fromEntries(conflict.fields.map((f) => [f.field, f.server_version])),
    winning_fields: toPush.map((f) => f.field),
    resolved_at: Date.now(),
  });
}


/**
 * Fusion CRDT par champ (LWW-Element-Map) : pour chaque champ, la valeur
 * dont le timestamp est le plus récent gagne. Le résultat est un enregistrement
 * "gagnant" côté client, uniquement pour le cache local.
 *
 * Le vrai merge autoritatif se fait côté serveur (trigger bump_field_versions
 * + logique des server fns). Cette fonction sert uniquement à afficher un
 * état cohérent en attendant la synchro.
 */
export function mergeCRDT<T extends CachedRow>(local: T | undefined, remote: T): T {
  if (!local) return remote;
  const localV = local._field_versions ?? {};
  const remoteV = remote._field_versions ?? {};
  const merged: CachedRow = { ...remote };
  const mergedVersions: Record<string, number> = { ...remoteV };

  for (const k of Object.keys(localV)) {
    const lv = localV[k] ?? 0;
    const rv = remoteV[k] ?? 0;
    if (lv > rv) {
      merged[k] = local[k];
      mergedVersions[k] = lv;
    }
  }
  merged._field_versions = mergedVersions;
  return merged as T;
}

/**
 * Récupère depuis Supabase toutes les lignes modifiées depuis last_pull_at
 * pour chaque table, et met à jour le cache local.
 */
export async function pullAll(): Promise<{ pulled: number; errors: string[] }> {
  const db = getSyncDB();
  let pulled = 0;
  const errors: string[] = [];

  for (const table of SYNC_TABLES) {
    try {
      const state = await db.sync_state.get(table);
      const since = state?.last_pull_at ?? "1970-01-01T00:00:00Z";

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .gt("updated_at", since)
        .order("updated_at", { ascending: true })
        .limit(500);

      if (error) {
        errors.push(`${table}: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        const cache = db.cache(table);
        const detected: PendingConflict[] = [];
        await db.transaction("rw", cache, async () => {
          for (const row of data as unknown as CachedRow[]) {
            const local = await cache.get(row.id);
            const conflict = detectConflict(table, local, row);
            if (conflict) detected.push(conflict);
            const merged = mergeCRDT(local, row);
            await cache.put(merged);
          }
        });
        for (const c of detected) {
          const existing = await db.pending_conflicts
            .where("table").equals(c.table)
            .filter((p) => p.row_id === c.row_id && p.status === "pending")
            .first();
          if (existing) await db.pending_conflicts.update(existing.id!, { fields: c.fields, detected_at: c.detected_at });
          else await db.pending_conflicts.add(c);
        }
      }
      if (data && data.length > 0) {

        const newest = (data[data.length - 1] as { updated_at: string }).updated_at;
        await db.sync_state.put({
          table,
          last_pull_at: newest,
          last_pull_success: Date.now(),
        });
        pulled += data.length;
      } else if (state) {
        await db.sync_state.put({ ...state, last_pull_success: Date.now() });
      } else {
        await db.sync_state.put({
          table,
          last_pull_at: since,
          last_pull_success: Date.now(),
        });
      }
    } catch (e) {
      errors.push(`${table}: ${(e as Error).message}`);
    }
  }

  return { pulled, errors };
}

/**
 * Rejoue l'outbox en FIFO. Chaque entrée appelle directement la Data API
 * Supabase (les vraies protections RBAC seront centralisées dans les server
 * fns migrées lot par lot). Les échecs 403/409 marquent l'entrée en erreur
 * mais ne bloquent pas la file.
 */
export async function pushOutbox(): Promise<{ pushed: number; failed: number }> {
  const db = getSyncDB();
  const entries = await db.outbox.orderBy("created_at").toArray();
  let pushed = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      if (entry.op === "delete") {
        const { error } = await supabase
          .from(entry.table)
          .delete()
          .eq("id", entry.row_id);
        if (error) throw error;
      } else {
        // On tente d'abord une mise à jour ciblée : une mutation peut ne porter
        // que quelques champs (résolution de conflit, correction partielle).
        // Un upsert enverrait un INSERT complet et échouerait sur les colonnes
        // obligatoires absentes du payload.
        const payload = {
          ...entry.payload,
          _client_id: entry.client_id,
        } as never;

        const { data: updated, error: updateError } = await supabase
          .from(entry.table)
          .update(payload)
          .eq("id", entry.row_id)
          .select("id");
        if (updateError) throw updateError;

        // Ligne absente côté serveur (création faite hors-ligne) : on insère.
        if (!updated || updated.length === 0) {
          const { error } = await supabase
            .from(entry.table)
            .insert({ ...entry.payload, id: entry.row_id, _client_id: entry.client_id } as never);
          if (error) throw error;
        }
      }

      await db.outbox.delete(entry.id!);
      pushed++;
    } catch (e) {
      failed++;
      await db.outbox.update(entry.id!, {
        attempts: (entry.attempts ?? 0) + 1,
        last_error: (e as Error).message,
      });
    }
  }
  return { pushed, failed };
}

/**
 * Ajoute une mutation dans l'outbox et l'applique optimistement au cache local.
 * Utilisé par useOfflineMutation.
 */
export async function enqueueMutation(
  table: SyncTable,
  op: "upsert" | "delete",
  rowId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const db = getSyncDB();
  const now = Date.now();
  const fieldVersions: Record<string, number> = {};
  for (const k of Object.keys(payload)) {
    if (!k.startsWith("_") && k !== "id" && k !== "created_at" && k !== "updated_at") {
      fieldVersions[k] = now;
    }
  }

  const entry: OutboxEntry = {
    table,
    op,
    row_id: rowId,
    payload,
    field_versions: fieldVersions,
    client_id: getClientId(),
    created_at: now,
    attempts: 0,
  };

  await db.transaction("rw", db.outbox, db.cache(table), async () => {
    await db.outbox.add(entry);
    if (op === "delete") {
      const existing = await db.cache(table).get(rowId);
      if (existing) {
        await db.cache(table).put({ ...existing, _deleted: true });
      }
    } else {
      const existing = await db.cache(table).get(rowId);
      const merged: CachedRow = {
        ...(existing ?? { id: rowId, updated_at: new Date().toISOString(), _field_versions: {} }),
        ...payload,
        id: rowId,
        _field_versions: { ...(existing?._field_versions ?? {}), ...fieldVersions },
        updated_at: new Date().toISOString(),
      };
      await db.cache(table).put(merged);
    }
  });
}

/**
 * Lance une synchronisation complète : push d'abord (envoyer les modifs locales),
 * puis pull (récupérer les modifs distantes).
 */
export async function syncNow(): Promise<{
  pushed: number;
  failed: number;
  pulled: number;
  errors: string[];
}> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { pushed: 0, failed: 0, pulled: 0, errors: ["offline"] };
  }
  const push = await pushOutbox();
  const pull = await pullAll();
  return { ...push, ...pull };
}
