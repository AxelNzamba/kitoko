import { describe, expect, it } from "vitest";
import { clientSearchFilter, remainingQuantity, summarizeSales } from "../business-insights";

describe("indicateurs commerciaux", () => {
  it("utilise les montants HT, TVA et TTC enregistrés, sans coût d’achat arbitraire", () => {
    const sale = { total_ht: 100, total_tva: 16, total_ttc: 116, payment_mode: "especes", client_name: null, created_at: "2026-10-17" };
    expect(summarizeSales([sale, { ...sale, total_ht: 200, total_tva: 32, total_ttc: 232 }], [{ amount: 25 }]))
      .toEqual({ ht: 300, tva: 48, ttc: 348, spending: 25, count: 2, average: 174 });
  });
  it("renvoie un panier moyen nul en absence de vente", () => {
    expect(summarizeSales([], []).average).toBe(0);
  });
  it("ne compense pas les quantités manquantes d’une ligne par une sur-réception d’une autre", () => {
    expect(remainingQuantity([{ quantity_ordered: 10, quantity_received: 4 }, { quantity_ordered: 5, quantity_received: 8 }])).toBe(6);
  });
  it("recherche les quatre champs et traite les caractères spéciaux comme du texte", () => {
    expect(clientSearchFilter('A%,"')).toBe('name.ilike."%A\\\\%,\\\"%",company.ilike."%A\\\\%,\\\"%",phone.ilike."%A\\\\%,\\\"%",email.ilike."%A\\\\%,\\\"%"');
  });
});