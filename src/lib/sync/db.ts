import Dexie, { type Table } from "dexie";
import { SYNC_TABLES, type SyncTable } from "./module-map";

/**
 * Enregistrement générique en cache local. Miroir des tables Supabase
 * avec les colonnes CRDT (_field_versions, updated_at, _deleted).
 */
export type CachedRow = {
  id: string;
  updated_at: string;
  _field_versions: Record<string, number>;
  _deleted?: boolean;
  [key: string]: unknown;
};

/**
 * Mutation en attente de synchro. Le moteur rejoue en FIFO.
 */
export type OutboxEntry = {
  id?: number;
  table: SyncTable;
  op: "upsert" | "delete";
  row_id: string;
  payload: Record<string, unknown>;
  field_versions: Record<string, number>;
  client_id: string;
  created_at: number;
  attempts: number;
  last_error?: string;
};

/**
 * État de synchro par table : dernière date récupérée du serveur.
 */
export type SyncStateEntry = {
  table: SyncTable;
  last_pull_at: string; // ISO
  last_pull_success: number; // epoch ms
};

/**
 * Journal des conflits résolus automatiquement par le CRDT.
 */
export type ConflictLogEntry = {
  id?: number;
  table: SyncTable;
  row_id: string;
  local_versions: Record<string, number>;
  server_versions: Record<string, number>;
  winning_fields: string[]; // champs gardés depuis local
  resolved_at: number;
};


/**
 * Conflit détecté nécessitant un arbitrage humain : un même champ a été
 * modifié localement ET sur le serveur. Reste en attente jusqu'à ce que
 * l'utilisateur choisisse, champ par champ, la valeur à conserver.
 */
export type PendingConflictField = {
  field: string;
  local_value: unknown;
  server_value: unknown;
  local_version: number;
  server_version: number;
};

export type PendingConflict = {
  id?: number;
  table: SyncTable;
  row_id: string;
  label: string; // libellé lisible (nom, numéro…)
  fields: PendingConflictField[];
  detected_at: number;
  status: "pending" | "resolved";
  resolved_at?: number;
  decisions?: Record<string, "local" | "server">;
};

class SyncDB extends Dexie {
  outbox!: Table<OutboxEntry, number>;
  sync_state!: Table<SyncStateEntry, string>;
  conflicts!: Table<ConflictLogEntry, number>;
  pending_conflicts!: Table<PendingConflict, number>;
  // Tables miroir dynamiques déclarées ci-dessous
  [key: string]: unknown;

  constructor() {
    super("indus-erp-sync");

    const stores: Record<string, string> = {
      outbox: "++id, table, created_at",
      sync_state: "table",
      conflicts: "++id, table, resolved_at",
    };
    for (const t of SYNC_TABLES) {
      stores[t] = "id, updated_at, _deleted";
    }
    this.version(1).stores(stores);
    this.version(2).stores({
      ...stores,
      pending_conflicts: "++id, table, status, detected_at",
    });
    // v3 : ajout des tables de transfert entre entrepôts
    this.version(3).stores({
      ...stores,
      pending_conflicts: "++id, table, status, detected_at",
    });
  }



  cache(table: SyncTable): Table<CachedRow, string> {
    return this.table(table) as Table<CachedRow, string>;
  }
}

let _db: SyncDB | null = null;

/**
 * Accès paresseux : Dexie ne s'ouvre que côté navigateur.
 */
export function getSyncDB(): SyncDB {
  if (typeof window === "undefined") {
    throw new Error("SyncDB accessed on server");
  }
  if (!_db) _db = new SyncDB();
  return _db;
}

/**
 * Identifiant unique de l'appareil, stable, stocké localement.
 * Sert au serveur à identifier l'origine d'une modification.
 */
export function getClientId(): string {
  if (typeof window === "undefined") return "server";
  const KEY = "indus-erp:client-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
