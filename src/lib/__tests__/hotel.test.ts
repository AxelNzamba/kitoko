import { describe, expect, it } from "vitest";
import { apps, appHome } from "@/lib/modules";
import { nights, stayInvoice, overlaps, occupancyRate } from "@/lib/hotel";

describe("hôtel", () => {
  it("compte les nuits entre arrivée et départ", () => {
    expect(nights("2026-11-10", "2026-11-13")).toBe(3);
  });

  it("facture = nuits × tarif + consommations − acompte", () => {
    const f = stayInvoice(
      { check_in: "2026-11-10", check_out: "2026-11-12", nightly_rate: 50, deposit: 30 },
      [{ quantity: 2, unit_price: 5 }],
    );
    expect(f.total).toBe(110);
    expect(f.balance).toBe(80);
  });

  it("le jour du départ peut être réservé par un autre client", () => {
    expect(overlaps("2026-11-10", "2026-11-12", "2026-11-12", "2026-11-14")).toBe(false);
    expect(overlaps("2026-11-10", "2026-11-12", "2026-11-11", "2026-11-14")).toBe(true);
  });

  it("taux d'occupation ignore les réservations annulées", () => {
    const rate = occupancyRate(
      4,
      [
        { check_in: "2026-11-10", check_out: "2026-11-12", status: "arrivee" },
        { check_in: "2026-11-10", check_out: "2026-11-12", status: "annulee" },
      ],
      "2026-11-11",
    );
    expect(rate).toBe(25);
  });
});

describe("accès aux applications", () => {
  it("réserve Hôtel au Propriétaire et au Réceptionniste", () => {
    expect(apps.find((a) => a.key === "hotel")?.roles).toEqual(["proprietaire", "receptionniste"]);
    expect(appHome("hotel", ["receptionniste"])).toBe("/hotel");
    expect(appHome("hotel", ["caissier"])).toBe("/applications");
  });
  it("ne donne pas Stock au Réceptionniste", () => {
    expect(apps.find((a) => a.key === "stock")?.roles).toEqual(["proprietaire", "magasinier", "caissier"]);
    expect(appHome("stock", ["receptionniste"])).toBe("/applications");
  });
});
