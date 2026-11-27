/**
 * Conflits spécifiques aux transferts entre entrepôts.
 *
 * Les bons de transfert sont particulièrement sensibles au mode hors ligne :
 * l'entrepôt source peut valider le départ pendant que la destination valide
 * la réception (ou qu'un responsable annule le bon). Ce module fournit :
 *  - des libellés métier lisibles pour chaque champ en conflit ;
 *  - une recommandation automatique de résolution (workflow-aware) ;
 *  - un message d'explication guidée affiché au moment de l'arbitrage.
 */
import type { PendingConflictField } from "./db";

export const TRANSFER_TABLES = ["stock_transfers", "stock_transfer_items"] as const;

export function isTransferTable(table: string): boolean {
  return (TRANSFER_TABLES as readonly string[]).includes(table);
}

const FIELD_LABELS: Record<string, string> = {
  status: "Statut du bon",
  source_warehouse_id: "Entrepôt source",
  dest_warehouse_id: "Entrepôt destination",
  notes: "Notes",
  sent_by: "Validé au départ par",
  sent_at: "Date de départ",
  received_by: "Réceptionné par",
  received_at: "Date de réception",
  quantity: "Quantité expédiée",
  quantity_received: "Quantité reçue",
  lot_id: "Lot",
  product_id: "Produit",
};

export function transferFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

/** Ordre d'avancement du workflow : le statut le plus avancé gagne par défaut. */
const STATUS_RANK: Record<string, number> = {
  brouillon: 0,
  en_transit: 1,
  recu: 2,
  annule: 3,
};

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  en_transit: "En transit",
  recu: "Reçu",
  annule: "Annulé",
};

export function transferValueLabel(field: string, value: unknown): string | null {
  if (field === "status" && typeof value === "string") return STATUS_LABELS[value] ?? value;
  return null;
}

/**
 * Recommandation par défaut pour un champ de transfert :
 *  - statut : on garde l'état le plus avancé du workflow (une annulation ou une
 *    réception ne doit jamais être écrasée par un retour en brouillon) ;
 *  - quantités : on garde la valeur la plus faible côté réception (prudence
 *    comptable), la plus récente sinon ;
 *  - autres champs : la modification la plus récente.
 */
export function recommendTransferDecision(
  field: string,
  f: PendingConflictField,
): "local" | "server" {
  if (field === "status") {
    const l = STATUS_RANK[String(f.local_value)] ?? -1;
    const s = STATUS_RANK[String(f.server_value)] ?? -1;
    if (l !== s) return l > s ? "local" : "server";
  }
  if (field === "quantity_received") {
    const l = Number(f.local_value ?? 0);
    const s = Number(f.server_value ?? 0);
    if (l !== s) return l < s ? "local" : "server";
  }
  return f.local_version >= f.server_version ? "local" : "server";
}

/** Explication guidée, champ par champ, pour l'écran de résolution. */
export function transferFieldHint(field: string, f: PendingConflictField): string | null {
  switch (field) {
    case "status": {
      const l = String(f.local_value);
      const s = String(f.server_value);
      if (l === "annule" || s === "annule")
        return "Un appareil a annulé ce bon pendant qu'un autre le faisait avancer. Conservez l'annulation si la marchandise n'est jamais partie, sinon gardez l'avancement et créez un nouveau bon.";
      return "Statut divergent entre deux appareils : conservez l'étape réellement effectuée sur le terrain (le workflow ne doit pas reculer).";
    }
    case "quantity":
      return "La quantité expédiée diffère. Vérifiez le bon papier / le scan de l'entrepôt source avant de trancher.";
    case "quantity_received":
      return "La quantité reçue diffère. Retenez la quantité physiquement comptée à destination ; l'écart devra être traité en inventaire.";
    case "source_warehouse_id":
    case "dest_warehouse_id":
      return "Les entrepôts d'un bon déjà expédié ne devraient pas changer : privilégiez la valeur du serveur.";
    case "lot_id":
      return "Le lot rattaché diffère. Un mauvais lot fausse la traçabilité : confirmez avec le numéro de lot scanné.";
    default:
      return null;
  }
}

/** Résumé affiché dans la liste des conflits en attente. */
export function transferConflictSummary(fields: PendingConflictField[]): string {
  return fields.map((f) => transferFieldLabel(f.field)).join(", ");
}
