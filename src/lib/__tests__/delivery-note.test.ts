import { describe, it, expect } from "vitest";
import {
  buildDeliveryNoteHtml,
  deliveryNoteNumber,
  type DeliveryNoteData,
} from "../delivery-note";

const data: DeliveryNoteData = {
  saleNumber: "V-2026-0042",
  date: new Date("2026-11-07T10:30:00"),
  clientName: "Groupe Industriel <Test>",
  warehouse: "Entrepôt A",
  lines: [
    { name: "Ciment 50 kg", sku: "CIM-50", quantity: 12 },
    { name: "Fer à béton 8 mm", quantity: 3 },
  ],
};

describe("deliveryNoteNumber", () => {
  it("dérive le numéro de BL du numéro de vente", () => {
    expect(deliveryNoteNumber("V-2026-0042")).toBe("BL-V-2026-0042");
  });
});

describe("buildDeliveryNoteHtml", () => {
  const html = buildDeliveryNoteHtml(data);

  it("affiche le titre, la référence de vente et le numéro de BL", () => {
    expect(html).toContain("BON DE LIVRAISON");
    expect(html).toContain("BL-V-2026-0042");
    expect(html).toContain("Vente V-2026-0042");
  });

  it("reprend les lignes et leurs quantités", () => {
    expect(html).toContain("Ciment 50 kg");
    expect(html).toContain("CIM-50");
    expect(html).toContain(">12<");
    expect(html).toContain("Fer à béton 8 mm");
    expect(html).toContain(">3<");
  });

  it("échappe le HTML du nom client", () => {
    expect(html).toContain("Groupe Industriel &lt;Test&gt;");
    expect(html).not.toContain("Groupe Industriel <Test>");
  });

  it("ne contient aucun prix ni total (document non fiscal)", () => {
    expect(html).not.toMatch(/FCFA|XAF|TOTAL TTC|TVA/i);
    expect(html).toContain("sans valeur fiscale");
  });

  it("prévoit les zones de signature et la date de livraison", () => {
    expect(html).toContain("Livreur");
    expect(html).toContain("Réceptionnaire");
    expect(html).toContain("07/11/2026");
    expect(html).toContain("Entrepôt A");
  });

  it("gère une vente sans client ni entrepôt", () => {
    const minimal = buildDeliveryNoteHtml({ saleNumber: "V-1", lines: [] });
    expect(minimal).toContain("Client comptant");
    expect(minimal).toContain("Nombre de lignes");
  });
});
