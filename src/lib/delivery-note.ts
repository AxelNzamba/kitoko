import { readSettings } from "@/lib/app-settings";

export type DeliveryNoteLine = {
  name: string;
  sku?: string;
  quantity: number;
};

export type DeliveryNoteData = {
  /** Numéro de la vente d'origine (ticket / facture). */
  saleNumber: string;
  date?: Date;
  clientName?: string | null;
  warehouse?: string | null;
  lines: DeliveryNoteLine[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Numéro du bon de livraison, dérivé de la vente pour rester traçable. */
export function deliveryNoteNumber(saleNumber: string): string {
  return `BL-${saleNumber}`;
}

/**
 * Construit le HTML du bon de livraison A4 : quantités livrées uniquement,
 * sans prix ni totaux (le document accompagne la marchandise, il n'a pas de
 * valeur fiscale — la facture reste le ticket ou la facture A4).
 */
export function buildDeliveryNoteHtml(data: DeliveryNoteData): string {
  const s = readSettings();
  const date = data.date ?? new Date();
  const rows = data.lines
    .map(
      (line, index) => `
        <tr>
          <td class="num">${index + 1}</td>
          <td class="name">${escapeHtml(line.name)}</td>
          <td class="mono">${escapeHtml(line.sku ?? "—")}</td>
          <td class="qty mono">${line.quantity}</td>
          <td class="qty blank"></td>
          <td class="blank"></td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Bon de livraison ${escapeHtml(deliveryNoteNumber(data.saleNumber))}</title>
<style>
  @page { size: A4; margin: 14mm 14mm 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    line-height: 1.45;
    color: #1b1f24;
  }
  header { display: flex; justify-content: space-between; gap: 16mm; border-bottom: 2px solid #e8a33d; padding-bottom: 6mm; }
  .company { font-size: 15px; font-weight: 700; color: #0b2545; letter-spacing: .3px; }
  .muted { color: #5a6674; font-size: 10px; }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 20px; color: #0b2545; letter-spacing: 1px; }
  .doc .ref { font-family: "Courier New", monospace; font-size: 12px; font-weight: 700; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 8mm; margin: 7mm 0 6mm; }
  .meta div span { display: block; }
  .meta .label { font-size: 9px; text-transform: uppercase; letter-spacing: .6px; color: #5a6674; }
  .meta .value { font-weight: 700; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    background: #0b2545;
    color: #fff;
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: .4px;
    text-align: left;
    padding: 2.4mm 2mm;
  }
  tbody td { border-bottom: 1px solid #dde3ea; padding: 2.2mm 2mm; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f4f6f9; }
  .num { width: 8mm; color: #5a6674; }
  .mono { font-family: "Courier New", monospace; font-size: 10px; }
  .qty { width: 22mm; text-align: center; font-weight: 700; }
  .blank { min-width: 26mm; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 12mm; }
  .signature { border: 1px solid #dde3ea; border-top: 2px solid #0b2545; padding: 3mm; height: 30mm; }
  .signature .label { font-size: 9px; text-transform: uppercase; letter-spacing: .6px; color: #0b2545; font-weight: 700; }
  .signature .hint { font-size: 9px; color: #5a6674; }
  footer { margin-top: 8mm; border-top: 1px solid #dde3ea; padding-top: 3mm; font-size: 9px; color: #5a6674; text-align: center; }
</style>
</head>
<body>
  <header>
    <div>
      <div class="company">${escapeHtml(s.companyName)}</div>
      ${s.address ? `<div class="muted">${escapeHtml(s.address)}</div>` : ""}
      ${s.phone ? `<div class="muted">Tél. ${escapeHtml(s.phone)}</div>` : ""}
      ${s.taxId ? `<div class="muted">NIF ${escapeHtml(s.taxId)}</div>` : ""}
    </div>
    <div class="doc">
      <h1>BON DE LIVRAISON</h1>
      <div class="ref">${escapeHtml(deliveryNoteNumber(data.saleNumber))}</div>
      <div class="muted">Vente ${escapeHtml(data.saleNumber)}</div>
    </div>
  </header>

  <div class="meta">
    <div><span class="label">Date de livraison</span><span class="value">${date.toLocaleDateString("fr-FR")}</span></div>
    <div><span class="label">Client</span><span class="value">${escapeHtml(data.clientName || "Client comptant")}</span></div>
    <div><span class="label">Entrepôt</span><span class="value">${escapeHtml(data.warehouse || "—")}</span></div>
    <div><span class="label">Nombre de lignes</span><span class="value">${data.lines.length}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        <th>Désignation</th>
        <th>Référence</th>
        <th class="qty">Qté livrée</th>
        <th class="qty">Qté reçue</th>
        <th>Observations</th>
      </tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>

  <div class="signatures">
    <div class="signature">
      <div class="label">Livreur</div>
      <div class="hint">Nom, date et signature</div>
    </div>
    <div class="signature">
      <div class="label">Réceptionnaire</div>
      <div class="hint">Nom, date et signature — vaut acceptation des quantités ci-dessus</div>
    </div>
  </div>

  <footer>
    ${escapeHtml(s.companyName)} — document sans valeur fiscale : les prix et taxes figurent sur le ticket et la facture.
  </footer>
</body>
</html>`;
}

/**
 * Imprime le bon de livraison via une iframe isolée, comme le ticket thermique.
 */
export function printDeliveryNote(data: DeliveryNoteData): void {
  if (typeof document === "undefined") return;
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
  doc.write(buildDeliveryNoteHtml(data));
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
  window.setTimeout(() => {
    if (document.body.contains(iframe)) doPrint();
  }, 150);
}
