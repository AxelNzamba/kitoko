import { readSettings } from "@/lib/app-settings";
import { formatXOF } from "@/lib/format";
import type { ReceiptData } from "@/lib/receipt";

/**
 * Normalise un numéro pour l'API WhatsApp (chiffres uniquement, indicatif pays).
 * Accepte « 0812345678 », « +243 812 345 678 », « 00243812345678 ».
 */
export function normalizePhone(
  raw: string,
  countryCode = readSettings().whatsappCountryCode,
): string {
  let digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  const cc = (countryCode || "").replace(/\D/g, "");
  // Numéro local avec un ou deux zéros initiaux (ex. 081…, 00243…)
  if (!digits.startsWith(cc)) {
    if (digits.startsWith("0")) digits = cc + digits.replace(/^0+/, "");
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Ouvre WhatsApp (Web ou application) dans un nouvel onglet. */
export function openWhatsApp(phone: string, message: string): void {
  const digits = normalizePhone(phone);
  if (!digits) return;
  window.open(buildWhatsAppUrl(digits, message), "_blank", "noopener,noreferrer");
}

/** Texte partageable du ticket de vente. */
export function buildSaleMessage(data: ReceiptData): string {
  const s = readSettings();
  const date = data.date ?? new Date();
  const lines = data.lines
    .map((l) => `• ${l.name} — ${l.quantity} × ${formatXOF(l.unitPrice)} = ${formatXOF(l.total)}`)
    .join("\n");

  return [
    `*${s.companyName}*`,
    `Ticket ${data.number}`,
    `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    data.clientName ? `Client : ${data.clientName}` : "",
    "",
    lines,
    "",
    `Total HT : ${formatXOF(data.ht)}`,
    `TVA : ${formatXOF(data.tva)}`,
    `*TOTAL TTC : ${formatXOF(data.ttc)}*`,
    typeof data.cashReceived === "number" && data.cashReceived > 0
      ? `Reçu : ${formatXOF(data.cashReceived)} — Monnaie : ${formatXOF(data.change ?? 0)}`
      : "",
    `Paiement : ${data.paymentMode}`,
    "",
    s.receiptFooter,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function shareSaleOnWhatsApp(data: ReceiptData, phone: string | null | undefined): boolean {
  const target = phone?.trim();
  if (!target) return false;
  openWhatsApp(target, buildSaleMessage(data));
  return true;
}
