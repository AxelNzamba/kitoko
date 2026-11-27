import { describe, expect, it } from "vitest";
import { checkCreditLimit, debtRemaining, debtStatus, whatsappNumber } from "@/lib/credit";

describe("crédit client", () => {
  it("calcule le reste à payer", () => {
    expect(debtRemaining({ amount: 100, due_date: "2026-11-10", payments: [{ amount: 30 }, { amount: 20 }] })).toBe(50);
  });
  it("une dette entièrement payée est soldée", () => {
    expect(debtStatus({ amount: 100, due_date: "2020-01-01", payments: [{ amount: 100 }] })).toBe("soldee");
  });
  it("une dette dont l'échéance est passée est en retard", () => {
    expect(debtStatus({ amount: 100, due_date: "2026-11-01" }, new Date("2026-11-02T10:00:00"))).toBe("en_retard");
  });
  it("échéance dans 3 jours = proche", () => {
    expect(debtStatus({ amount: 100, due_date: "2026-11-04" }, new Date("2026-11-02T10:00:00"))).toBe("a_echeance");
  });
  it("refuse le crédit sans plafond", () => {
    expect(checkCreditLimit(0, 0, 10).ok).toBe(false);
  });
  it("refuse le dépassement du plafond", () => {
    expect(checkCreditLimit(500, 400, 150).ok).toBe(false);
    expect(checkCreditLimit(500, 400, 100).ok).toBe(true);
  });
  it("ajoute l'indicatif RDC aux numéros locaux", () => {
    expect(whatsappNumber("0812 345 678")).toBe("243812345678");
    expect(whatsappNumber("+243 812 345 678")).toBe("243812345678");
  });
});
