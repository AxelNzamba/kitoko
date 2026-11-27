import { readSettings, type ReceiptWidth } from "@/lib/app-settings";
import { formatXOF } from "@/lib/format";

export type ReceiptLine = {
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type ReceiptData = {
  number: string;
  date?: Date;
  clientName?: string | null;
  paymentMode: string;
  lines: ReceiptLine[];
  ht: number;
  tva: number;
  ttc: number;
  cashReceived?: number;
  change?: number;
  discountTotal?: number;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Construit le HTML du ticket thermique. Largeur 58 ou 80 mm, marges nulles
 * (l'imprimante gère l'entraînement du papier), police monospace pour
 * l'alignement des colonnes.
 */
export function buildReceiptHtml(data: ReceiptData, width: ReceiptWidth = 80): string {
  const s = readSettings();
  const date = data.date ?? new Date();
  const rows = data.lines
    .map(
      (line) => `
        <tr>
          <td colspan="3" class="name">${escapeHtml(line.name)}</td>
        </tr>
        <tr>
          <td>${line.quantity} × ${formatXOF(line.unitPrice)}</td>
          <td class="right">${formatXOF(line.total)}</td>
          <td></td>
        </tr>`,
    )
    .join("");

  const cashRows =
    typeof data.cashReceived === "number" && data.cashReceived > 0
      ? `<tr><td>Reçu</td><td class="right">${formatXOF(data.cashReceived)}</td></tr>
         <tr><td>Monnaie</td><td class="right">${formatXOF(data.change ?? 0)}</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Ticket ${escapeHtml(data.number)}</title>
<style>
  @page { size: ${width}mm auto; margin: 0; }
  * { box-sizing: border-box; }
  body {
    width: ${width}mm;
    margin: 0;
    padding: 3mm 3mm 6mm;
    font-family: "Courier New", ui-monospace, monospace;
    font-size: ${width === 58 ? "10px" : "11px"};
    line-height: 1.35;
    color: #000;
  }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  .company { font-size: ${width === 58 ? "12px" : "14px"}; font-weight: 700; }
  .muted { font-size: 9px; }
  hr { border: none; border-top: 1px dashed #000; margin: 2mm 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 0.3mm 0; vertical-align: top; }
  td.name { font-weight: 600; }
  .total { font-size: ${width === 58 ? "12px" : "14px"}; font-weight: 700; }
  .footer { margin-top: 2mm; text-align: center; font-size: 9px; }
</style>
</head>
<body>
  <div class="center">
    <div class="company">${escapeHtml(s.companyName)}</div>
    ${s.address ? `<div class="muted">${escapeHtml(s.address)}</div>` : ""}
    ${s.phone ? `<div class="muted">Tél. ${escapeHtml(s.phone)}</div>` : ""}
    ${s.taxId ? `<div class="muted">NIF ${escapeHtml(s.taxId)}</div>` : ""}
  </div>
  <hr />
  <div>Ticket : ${escapeHtml(data.number)}</div>
  <div>${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}</div>
  ${data.clientName ? `<div>Client : ${escapeHtml(data.clientName)}</div>` : ""}
  <hr />
  <table>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <hr />
  <table>
    ${
      typeof data.discountTotal === "number" && data.discountTotal > 0
        ? `<tr><td>Remises</td><td class="right">-${formatXOF(data.discountTotal)}</td></tr>`
        : ""
    }
    <tr><td>Total HT</td><td class="right">${formatXOF(data.ht)}</td></tr>
    <tr><td>TVA</td><td class="right">${formatXOF(data.tva)}</td></tr>
    <tr class="total"><td>TOTAL TTC</td><td class="right">${formatXOF(data.ttc)}</td></tr>
    ${cashRows}
    <tr><td>Paiement</td><td class="right">${escapeHtml(data.paymentMode)}</td></tr>
  </table>
  <hr />
  <div class="footer">${escapeHtml(s.receiptFooter)}</div>
  <div class="footer">Document généré par INDUS-ERP</div>
</body>
</html>`;
}

/**
 * Imprime le ticket via une iframe isolée : n'altère pas la page courante et
 * respecte le format papier déclaré à l'imprimante.
 */
export function printReceipt(data: ReceiptData, width?: ReceiptWidth): void {
  if (typeof document === "undefined") return;
  const settings = readSettings();
  const format = width ?? settings.receiptWidth;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(buildReceiptHtml(data, format));
  doc.close();

  let printed = false;
  const doPrint = () => {
    if (printed) return;
    printed = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 1000);
    }
  };

  iframe.onload = doPrint;
  // Certains navigateurs n'émettent pas onload sur une iframe écrite via doc.write.
  window.setTimeout(() => {
    if (document.body.contains(iframe)) doPrint();
  }, 150);
}
