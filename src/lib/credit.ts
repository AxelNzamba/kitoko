/** Règles métier du crédit client (ventes à crédit, dettes, relances). */

export type DebtLike = { amount: number; due_date: string; payments?: { amount: number }[] };

export type DebtStatus = "soldee" | "en_retard" | "a_echeance" | "en_cours";

export function debtPaid(d: DebtLike): number {
  return (d.payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
}

export function debtRemaining(d: DebtLike): number {
  return Math.max(0, Math.round((Number(d.amount) - debtPaid(d)) * 100) / 100);
}

/** Statut d'une dette. "a_echeance" = échéance dans 3 jours ou moins. */
export function debtStatus(d: DebtLike, today: Date = new Date()): DebtStatus {
  if (debtRemaining(d) <= 0) return "soldee";
  const due = new Date(`${d.due_date}T23:59:59`);
  const diffDays = (due.getTime() - today.getTime()) / 86_400_000;
  if (diffDays < 0) return "en_retard";
  if (diffDays <= 3) return "a_echeance";
  return "en_cours";
}

export const debtStatusLabels: Record<DebtStatus, string> = {
  soldee: "Soldée", en_retard: "En retard", a_echeance: "Échéance proche", en_cours: "En cours",
};

/**
 * Vérifie qu'une nouvelle vente à crédit respecte le plafond du client.
 * Plafond 0 = crédit refusé.
 */
export function checkCreditLimit(limit: number, currentDebt: number, newAmount: number):
  { ok: true } | { ok: false; reason: string } {
  if (limit <= 0) return { ok: false, reason: "Ce client n'a pas de plafond de crédit. Fixez-en un dans la fiche client." };
  if (currentDebt + newAmount > limit) {
    return { ok: false, reason: `Plafond dépassé : dette ${currentDebt.toFixed(0)} + vente ${newAmount.toFixed(0)} > plafond ${limit.toFixed(0)}.` };
  }
  return { ok: true };
}

/** Normalise un numéro pour WhatsApp (chiffres seuls, indicatif RDC 243 par défaut). */
export function whatsappNumber(phone: string | null | undefined, defaultCountry = "243"): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("00")) digits = digits.slice(2);
  else if (!phone.trim().startsWith("+") && digits.startsWith("0")) digits = defaultCountry + digits.slice(1);
  return digits.length >= 8 ? digits : null;
}

export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  const n = whatsappNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}
