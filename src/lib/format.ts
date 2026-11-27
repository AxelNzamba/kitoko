import { formatMoney } from "@/lib/currency";

/**
 * Formate un montant exprimé dans la devise de base (historiquement XOF).
 * Le rendu suit la devise d'affichage choisie dans les paramètres (double devise).
 */
export function formatXOF(n: number): string {
  return formatMoney(n);
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function generateSKU(): string {
  return "PRD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function generateBarcode(): string {
  // 13-digit EAN-like (not checksum-valid, just unique)
  const base = Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return base.slice(-13).padStart(13, "0");
}

export function generateSaleNumber(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `V${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
