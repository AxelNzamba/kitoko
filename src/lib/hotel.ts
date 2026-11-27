/** Règles métier du module Hôtel (pures, testables). */

export type RoomStatus = "libre" | "occupee" | "a_nettoyer" | "maintenance";
export type ReservationStatus = "confirmee" | "arrivee" | "partie" | "annulee";
export type HousekeepingStatus = "a_faire" | "en_cours" | "fait";

export const roomStatusLabels: Record<RoomStatus, string> = {
  libre: "Libre",
  occupee: "Occupée",
  a_nettoyer: "À nettoyer",
  maintenance: "Maintenance",
};

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  confirmee: "Confirmée",
  arrivee: "En séjour",
  partie: "Partie",
  annulee: "Annulée",
};

export const housekeepingLabels: Record<HousekeepingStatus, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  fait: "Fait",
};

const DAY = 86_400_000;

function toUTC(d: string): number {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, day);
}

/** Nombre de nuits entre arrivée et départ (minimum 1). */
export function nights(checkIn: string, checkOut: string): number {
  return Math.max(1, Math.round((toUTC(checkOut) - toUTC(checkIn)) / DAY));
}

export type Charge = { quantity: number; unit_price: number };

/** Facture de séjour : nuits × tarif + consommations − acompte. */
export function stayInvoice(
  r: { check_in: string; check_out: string; nightly_rate: number; deposit: number },
  charges: Charge[],
) {
  const n = nights(r.check_in, r.check_out);
  const room = n * Number(r.nightly_rate);
  const extras = charges.reduce((s, c) => s + c.quantity * Number(c.unit_price), 0);
  const total = room + extras;
  const balance = Math.max(0, total - Number(r.deposit));
  return { nights: n, room, extras, total, deposit: Number(r.deposit), balance };
}

/** Vrai si deux séjours se chevauchent (le jour de départ est libre). */
export function overlaps(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return toUTC(aIn) < toUTC(bOut) && toUTC(bIn) < toUTC(aOut);
}

/** Taux d'occupation (0–100) d'un jour donné. */
export function occupancyRate(
  roomCount: number,
  reservations: { check_in: string; check_out: string; status: ReservationStatus }[],
  day: string,
): number {
  if (roomCount === 0) return 0;
  const next = new Date(toUTC(day) + DAY).toISOString().slice(0, 10);
  const busy = reservations.filter(
    (r) => (r.status === "confirmee" || r.status === "arrivee") && overlaps(r.check_in, r.check_out, day, next),
  ).length;
  return Math.round((busy / roomCount) * 100);
}

export function addDays(day: string, n: number): string {
  return new Date(toUTC(day) + n * DAY).toISOString().slice(0, 10);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
