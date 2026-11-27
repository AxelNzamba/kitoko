/**
 * Journalisation des événements métier (INDUS-ERP).
 *
 * Deux destinations complémentaires :
 *  1. `logger` — journal technique (console + remontée Sentry pour les erreurs).
 *  2. `public.audit_log` — journal d'audit persistant consulté dans la page
 *     « Activité » (réservée au Propriétaire).
 *
 * Les créations / modifications / suppressions de lignes sont déjà captées
 * automatiquement par les triggers `audit_<table>` en base. Ce module sert aux
 * événements *métier* (connexion, validation de vente, départ de transfert,
 * clôture d'inventaire, synchronisation, conflits…), qui ne correspondent pas
 * forcément à une écriture de ligne.
 *
 * Résilience hors-ligne : si l'insertion échoue (réseau coupé), l'événement est
 * mis en file d'attente dans `localStorage` puis renvoyé au retour du réseau.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export const AUDIT_MODULES = [
  "connexion",
  "produits",
  "lots",
  "stock",
  "transferts",
  "inventaire",
  "ventes",
  "hotel",
  "avoirs",
  "achats",
  "sav",
  "synchronisation",
  "depenses",
  "rapports",
  "utilisateurs",
  "credits",
  "assistant",
  "parametres",
  "terrain",
  "scanner",
  "navigation",
] as const;

export type AuditModule = (typeof AUDIT_MODULES)[number];

export const moduleLabels: Record<string, string> = {
  connexion: "Connexion",
  produits: "Produits",
  lots: "Lots",
  stock: "Stock",
  transferts: "Transferts",
  inventaire: "Inventaire",
  ventes: "Ventes",
  avoirs: "Avoirs",
  achats: "Achats",
  sav: "SAV",
  synchronisation: "Synchronisation",
  depenses: "Dépenses",
  rapports: "Rapports",
  utilisateurs: "Utilisateurs",
  parametres: "Paramètres",
  terrain: "Mode terrain",
  scanner: "Scanner",
  navigation: "Navigation",
  autre: "Autre",
};

export type AuditSeverity = "info" | "warning" | "error";

export type BusinessEvent = {
  /** Module métier concerné. */
  module: AuditModule;
  /** Action courte et stable, ex. "vente_validee", "transfert_expedie". */
  action: string;
  /** Libellé lisible affiché dans la page Activité. */
  label?: string;
  /** Table principale concernée, si applicable. */
  table?: string;
  /** Identifiant de la ligne concernée, si applicable. */
  recordId?: string;
  /** Entrepôt concerné. */
  warehouseId?: string | null;
  severity?: AuditSeverity;
  /** Détails libres (quantités, statuts, montants…). */
  details?: Record<string, unknown>;
};

type QueuedEvent = BusinessEvent & { queuedAt: string };

const QUEUE_KEY = "indus-erp:audit-queue";
const QUEUE_MAX = 500;

function readQueue(): QueuedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedEvent[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(events: QueuedEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-QUEUE_MAX)));
  } catch {
    /* quota dépassé : on abandonne silencieusement */
  }
}

function enqueue(event: BusinessEvent) {
  const queue = readQueue();
  queue.push({ ...event, queuedAt: new Date().toISOString() });
  writeQueue(queue);
}

async function insertEvent(event: QueuedEvent | BusinessEvent, userId: string) {
  const { error } = await (supabase as any).from("audit_log").insert({
    user_id: userId,
    action: event.action,
    module: event.module,
    table_name: event.table ?? null,
    record_id: event.recordId ?? null,
    warehouse_id: event.warehouseId ?? null,
    label: event.label ?? event.action,
    severity: event.severity ?? "info",
    details: {
      ...(event.details ?? {}),
      ...("queuedAt" in event && event.queuedAt ? { differe_depuis: event.queuedAt } : {}),
    },
  });
  if (error) throw error;
}

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Enregistre un événement métier (journal technique + journal d'audit).
 * Ne lève jamais : la journalisation ne doit pas casser une opération métier.
 */
export async function trackEvent(event: BusinessEvent): Promise<void> {
  const line = logger.withContext(event.module);
  const meta = {
    action: event.action,
    recordId: event.recordId,
    warehouseId: event.warehouseId ?? undefined,
    ...(event.details ?? {}),
  };

  if (event.severity === "error") line.error(event.label ?? event.action, meta);
  else if (event.severity === "warning") line.warn(event.label ?? event.action, meta);
  else line.info(event.label ?? event.action, meta);

  try {
    const userId = await currentUserId();
    if (!userId) return; // événement anonyme : pas d'insertion (RLS self-insert)
    await insertEvent(event, userId);
  } catch {
    enqueue(event);
  }
}

/** Variante « fire and forget » pour les gestionnaires d'événements UI. */
export function track(event: BusinessEvent): void {
  void trackEvent(event);
}

/** Renvoie les événements mis en attente pendant une coupure réseau. */
export async function flushAuditQueue(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  const userId = await currentUserId();
  if (!userId) return 0;

  const remaining: QueuedEvent[] = [];
  let sent = 0;

  for (const event of queue) {
    try {
      await insertEvent(event, userId);
      sent += 1;
    } catch {
      remaining.push(event);
    }
  }

  writeQueue(remaining);
  if (sent > 0) {
    logger.withContext("audit").info("Événements différés envoyés", { sent, remaining: remaining.length });
  }
  return sent;
}

export function pendingAuditCount(): number {
  return readQueue().length;
}
