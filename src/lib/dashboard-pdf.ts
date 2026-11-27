import { formatXOF } from "@/lib/format";

interface PdfKpi {
  label: string;
  value: string;
  unit?: string;
}

interface PdfAlert {
  product_name: string;
  sku: string;
  current_stock: number;
  stock_min: number;
  status: string;
}

interface PdfSale {
  number: string;
  client_name: string | null;
  total_ttc: number;
  created_at: string;
  payment_mode: string;
}

interface PdfChartPoint {
  jour: string;
  ca: number;
  caYoY?: number;
}

/**
 * Génère un PDF complet du tableau de bord.
 * Inclut : en-tête, KPIs, tableau d'évolution CA, alertes stock, transactions.
 */
export async function generateDashboardPDF(params: {
  dateLabel: string;
  kpis: PdfKpi[];
  alerts: PdfAlert[];
  recentSales: PdfSale[];
  chartData: PdfChartPoint[];
  caMois: number;
  beneficeNet: number;
  margeBrute: number;
}) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;

  // Couleurs du design system
  const navy: [number, number, number] = [23, 42, 69];
  const orange: [number, number, number] = [200, 90, 30];
  const gray: [number, number, number] = [107, 114, 128];
  const lightGray: [number, number, number] = [243, 244, 246];

  let y = margin;

  // ==================== EN-TÊTE ====================
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageW, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined as any, "bold");
  doc.text("INDUS-ERP", margin, 22);

  doc.setFontSize(10);
  doc.setFont(undefined as any, "normal");
  doc.text("Rapport tableau de bord", margin, 32);

  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text(`Généré le ${params.dateLabel}`, margin, 40);

  // Ligne orange
  doc.setFillColor(...orange);
  doc.rect(margin, 46, contentW, 2, "F");

  y = 62;

  // ==================== RÉSUMÉ FINANCIER ====================
  doc.setTextColor(...navy);
  doc.setFontSize(12);
  doc.setFont(undefined as any, "bold");
  doc.text("Résumé financier", margin, y);
  y += 8;

  const kpiData = params.kpis.map((k) => [
    k.label,
    `${k.value}${k.unit ? ` ${k.unit}` : ""}`,
  ]);

  // Ajouter des stats supplémentaires
  const extraStats = [
    ["Bénéfice net", `${formatXOF(Math.max(params.beneficeNet, 0))}`],
    ["Marge brute", `${params.margeBrute}%`],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Indicateur", "Valeur"]],
    body: [...kpiData, ...extraStats],
    theme: "grid",
    headStyles: { fillColor: navy, fontSize: 8, halign: "center" as const },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: contentW * 0.6, fontStyle: "bold" as const },
      1: { cellWidth: contentW * 0.4, halign: "right" as const, fontStyle: "bold" as const },
    },
    margin: { left: margin, right: margin },
    tableLineColor: 220,
    tableLineWidth: 0.1,
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ==================== ÉVOLUTION CA ====================
  doc.setTextColor(...navy);
  doc.setFontSize(12);
  doc.setFont(undefined as any, "bold");
  doc.text("Évolution du chiffre d'affaires (30 jours)", margin, y);
  y += 8;

  // Créer un mini graphique ASCII / table avec les 10 derniers jours
  const recentDays = params.chartData.slice(-10).map((d) => [
    `Jour ${d.jour}`,
    `${d.ca}k FC`,
    d.caYoY != null ? `${d.caYoY}k FC` : "—",
  ]);

  if (recentDays.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Jour", "CA N", "CA N-1"]],
      body: recentDays,
      theme: "grid",
      headStyles: { fillColor: navy, fontSize: 7, halign: "center" as const },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: contentW * 0.3 },
        1: { cellWidth: contentW * 0.35, halign: "right" as const },
        2: { cellWidth: contentW * 0.35, halign: "right" as const },
      },
      margin: { left: margin, right: margin },
      tableLineColor: 220,
      tableLineWidth: 0.1,
    });

    // Mini sparkline en barres (SVG-like)
    const chartY = (doc as any).lastAutoTable.finalY + 6;
    const barH = 25;
    const barW = (contentW - 10) / Math.min(params.chartData.length, 30);
    const maxCa = Math.max(...params.chartData.map((d) => d.ca), 1);

    // Fond du graphique
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, chartY, contentW, barH, 1, 1, "F");

    // Barres
    const displayData = params.chartData.slice(-30);
    displayData.forEach((d, i) => {
      const h = Math.max((d.ca / maxCa) * (barH - 4), 0.5);
      const x = margin + 2 + i * barW;
      const yBar = chartY + barH - 2 - h;

      doc.setFillColor(...orange);
      doc.rect(x, yBar, Math.max(barW - 1, 1), h, "F");
    });

    // Ligne de légende
    doc.setFontSize(6);
    doc.setTextColor(...gray);
    doc.text(`Max: ${maxCa}k FC · ${displayData.length} jours`, margin + 2, chartY + barH + 4);

    y = chartY + barH + 12;
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Aucune donnée disponible", margin, y + 6);
    y += 12;
  }

  // ==================== ALERTES STOCK ====================
  if (params.alerts.length > 0) {
    doc.setTextColor(...navy);
    doc.setFontSize(12);
    doc.setFont(undefined as any, "bold");
    doc.text("Alertes stock", margin, y);
    y += 8;

    const alertBody = params.alerts.map((a) => [
      a.product_name,
      a.sku,
      String(a.current_stock),
      String(a.stock_min),
      a.status === "rupture" ? "🔴 Rupture" : "🟡 Faible",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Produit", "SKU", "Stock", "Seuil", "Statut"]],
      body: alertBody,
      theme: "grid",
      headStyles: { fillColor: navy, fontSize: 7, halign: "center" as const },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: contentW * 0.35 },
        1: { cellWidth: contentW * 0.2 },
        2: { cellWidth: contentW * 0.1, halign: "right" as const },
        3: { cellWidth: contentW * 0.1, halign: "right" as const },
        4: { cellWidth: contentW * 0.25, halign: "center" as const },
      },
      margin: { left: margin, right: margin },
      tableLineColor: 220,
      tableLineWidth: 0.1,
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // ==================== DERNIÈRES TRANSACTIONS ====================
  if (params.recentSales.length > 0) {
    // Vérifier si on a assez de place, sinon nouvelle page
    if (y > 220) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(...navy);
    doc.setFontSize(12);
    doc.setFont(undefined as any, "bold");
    doc.text("Dernières transactions", margin, y);
    y += 8;

    const paymentLabel: Record<string, string> = {
      especes: "Espèces",
      mobile_money: "Mobile",
      carte: "Carte",
      virement: "Virement",
      cheque: "Chèque",
    };

    const saleBody = params.recentSales.map((s) => [
      `#${s.number}`,
      s.client_name ?? "Particulier",
      new Date(s.created_at).toLocaleDateString("fr-FR"),
      paymentLabel[s.payment_mode] ?? s.payment_mode,
      formatXOF(Number(s.total_ttc)),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Réf.", "Client", "Date", "Paiement", "Montant"]],
      body: saleBody,
      theme: "grid",
      headStyles: { fillColor: navy, fontSize: 7, halign: "center" as const },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: contentW * 0.18 },
        1: { cellWidth: contentW * 0.27 },
        2: { cellWidth: contentW * 0.15, halign: "center" as const },
        3: { cellWidth: contentW * 0.15, halign: "center" as const },
        4: { cellWidth: contentW * 0.25, halign: "right" as const, fontStyle: "bold" as const },
      },
      margin: { left: margin, right: margin },
      tableLineColor: 220,
      tableLineWidth: 0.1,
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // ==================== PIED DE PAGE ====================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(
      `INDUS-ERP · Page ${i}/${totalPages} · ${params.dateLabel}`,
      margin,
      doc.internal.pageSize.getHeight() - 10,
    );
  }

  // Téléchargement
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`dashboard-${dateStr}.pdf`);
}
