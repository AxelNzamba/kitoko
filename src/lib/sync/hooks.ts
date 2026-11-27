import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getSyncDB } from "./db";
import { syncNow } from "./engine";
import { MODULE_TABLES, type SyncTable } from "./module-map";

export type ModuleSyncStatus = {
  key: string;
  pending: number;         // mutations en attente
  errors: number;          // mutations en erreur (>= 1 tentative)
  lastPullAt: number | null; // epoch ms de la dernière synchro réussie
  online: boolean;
  state: "ok" | "pending" | "error" | "offline" | "idle";
};

/**
 * Retourne l'état de synchro d'un module donné (agrégé sur ses tables).
 * Réactif : re-render quand outbox ou sync_state change.
 */
export function useModuleSyncStatus(moduleKey: string): ModuleSyncStatus {
  const spec = MODULE_TABLES.find((m) => m.key === moduleKey);
  const online = useOnlineStatus();

  const data = useLiveQuery(async () => {
    if (!spec) return { pending: 0, errors: 0, lastPullAt: null };
    const db = getSyncDB();
    let pending = 0;
    let errors = 0;
    let lastPullAt: number | null = null;
    for (const t of spec.tables) {
      const p = await db.outbox.where("table").equals(t).toArray();
      pending += p.filter((e) => (e.attempts ?? 0) === 0).length;
      errors += p.filter((e) => (e.attempts ?? 0) > 0).length;
      const s = await db.sync_state.get(t as SyncTable);
      if (s?.last_pull_success) {
        lastPullAt = Math.max(lastPullAt ?? 0, s.last_pull_success);
      }
    }
    return { pending, errors, lastPullAt };
  }, [moduleKey], { pending: 0, errors: 0, lastPullAt: null as number | null });

  let state: ModuleSyncStatus["state"] = "ok";
  if (!spec) state = "idle";
  else if (!online) state = "offline";
  else if (data.errors > 0) state = "error";
  else if (data.pending > 0) state = "pending";
  else if (data.lastPullAt === null) state = "idle";

  return {
    key: moduleKey,
    pending: data.pending,
    errors: data.errors,
    lastPullAt: data.lastPullAt,
    online,
    state,
  };
}

/**
 * Vue agrégée pour le panneau global (tous modules).
 */
export function useAllModuleStatuses(): ModuleSyncStatus[] {
  return MODULE_TABLES.map((m) => useModuleSyncStatus(m.key));
}

/**
 * Écoute navigator.onLine / offline.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}

/**
 * Lance la boucle de synchro en arrière-plan : au montage, à intervalle
 * régulier, et à chaque reconnexion réseau. À monter une seule fois
 * (dans le layout authentifié).
 */
export function useSyncEngine(intervalMs = 30_000): void {
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (!alive) return;
      try { await syncNow(); } catch { /* silent */ }
    };
    tick();
    const id = setInterval(tick, intervalMs);
    const onOnline = () => tick();
    window.addEventListener("online", onOnline);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener("online", onOnline);
    };
  }, [intervalMs]);
}
