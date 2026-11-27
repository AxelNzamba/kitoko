/**
 * Export PDF tabulaire générique (jsPDF + autotable).
 * Utilisé par les exports Inventaire / Mouvements de stock / SAV / Commandes.
 */
export async function exportTablePdf(params: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  landscape?: boolean;
  footerNote?: string;
}) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    orientation: params.landscape ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 30, 55);
  doc.rect(0, 0, pageWidth, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text("INDUS-ERP", 32, 26);
  doc.setFontSize(11);
  doc.text(params.title, 32, 46);

  doc.setTextColor(90, 90, 90);
  doc.setFontSize(9);
  doc.text(
    params.subtitle
      ? `${params.subtitle} — édité le ${new Date().toLocaleString("fr-FR")}`
      : `Édité le ${new Date().toLocaleString("fr-FR")}`,
    32,
    78,
  );

  autoTable(doc, {
    startY: 92,
    head: [params.headers],
    body: params.rows.map((r) => r.map((c) => (c == null ? "" : String(c)))),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [15, 30, 55], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 32, right: 32 },
  });

  if (params.footerNote) {
    const y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 92;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(params.footerNote, 32, y + 20);
  }

  doc.save(params.filename);
}
