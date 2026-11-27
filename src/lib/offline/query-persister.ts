import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

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
const DB_NAME = "indus-erp-query-cache";
const STORE = "cache";
const KEY = "react-query";

/** Durée de conservation du cache hors-ligne : 7 jours. */
export const OFFLINE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDel(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

/** Crée un persister IndexedDB ; retourne `undefined` côté serveur. */
export function createIdbPersister(): Persister | undefined {
  if (typeof window === "undefined" || !("indexedDB" in window)) return undefined;
  return {
    persistClient: async (client: PersistedClient) => {
      try { await idbSet(KEY, client); } catch { /* quota / navigation privée */ }
    },
    restoreClient: async () => {
      try { return await idbGet<PersistedClient>(KEY); } catch { return undefined; }
    },
    removeClient: async () => {
      try { await idbDel(KEY); } catch { /* silent */ }
    },
  };
}
