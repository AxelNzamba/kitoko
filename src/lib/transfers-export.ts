/**
 * Construction des jeux de données d'export (CSV / PDF) pour les transferts
 * entre entrepôts. Une ligne par ligne de bon (produit / lot / quantités).
 */
import { formatDateTime } from "@/lib/format";

export type TransferExportRow = {
  transfer_number: string;
  status: string;
  source: string;
  dest: string;
  product: string;
  sku: string;
  lot: string;
  quantity: string;
  quantity_received: string;
  created_by: string;
  sent_by: string;
  received_by: string;
  created_at: string;
  notes: string;
};

export const TRANSFER_EXPORT_HEADERS: { key: keyof TransferExportRow; label: string }[] = [
  { key: "transfer_number", label: "Bon" },
  { key: "status", label: "Statut" },
  { key: "source", label: "Entrepôt source" },
  { key: "dest", label: "Entrepôt destination" },
  { key: "product", label: "Produit" },
  { key: "sku", label: "SKU" },
  { key: "lot", label: "Lot" },
  { key: "quantity", label: "Qté expédiée" },
  { key: "quantity_received", label: "Qté reçue" },
  { key: "created_by", label: "Créé par" },
  { key: "sent_by", label: "Départ validé par" },
  { key: "received_by", label: "Réceptionné par" },
  { key: "created_at", label: "Date" },
  { key: "notes", label: "Notes" },
];

export function buildTransferExportRows(
  transfers: any[],
  statusLabels: Record<string, string>,
  userName: (id: string | null | undefined) => string,
): TransferExportRow[] {
  const rows: TransferExportRow[] = [];
  for (const t of transfers) {
    const items = t.stock_transfer_items ?? [];
    const base = {
      transfer_number: t.transfer_number ?? "",
      status: statusLabels[t.status] ?? t.status ?? "",
      source: t.source?.name ?? "—",
      dest: t.dest?.name ?? "—",
      created_by: userName(t.created_by),
      sent_by: userName(t.sent_by),
      received_by: userName(t.received_by),
      created_at: t.created_at ? formatDateTime(t.created_at) : "",
      notes: t.notes ?? "",
    };
    if (items.length === 0) {
      rows.push({
        ...base,
        product: "—",
        sku: "",
        lot: "",
        quantity: "0",
        quantity_received: "0",
      });
      continue;
    }
    for (const i of items) {
      rows.push({
        ...base,
        product: i.products?.name ?? "—",
        sku: i.products?.sku ?? "",
        lot: i.lots?.lot_number ?? "",
        quantity: String(Number(i.quantity ?? 0)),
        quantity_received: String(Number(i.quantity_received ?? 0)),
      });
    }
  }
  return rows;
}
