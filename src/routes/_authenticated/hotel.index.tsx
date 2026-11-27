import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BedDouble, ChevronLeft, ChevronRight, LogIn, LogOut, Sparkles } from "lucide-react";

import { useHotelData } from "@/modules/hotel/queries";
import { Button } from "@/components/ui/button";
import { addDays, occupancyRate, overlaps, roomStatusLabels, todayISO, type RoomStatus, type ReservationStatus } from "@/lib/hotel";

export const Route = createFileRoute("/_authenticated/hotel/")({
  component: HotelDashboard,
  head: () => ({
    meta: [
      { title: "Hôtel — tableau et planning — INDUS-ERP" },
      { name: "description", content: "Occupation des chambres, arrivées, départs et planning des réservations." },
    
      { property: "og:title", content: "Hôtel — tableau et planning — INDUS-ERP" },
      { property: "og:description", content: "Occupation des chambres, arrivées, départs et planning des réservations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }],
  }),
});

const DAYS = 14;

const statusTone: Record<RoomStatus, string> = {
  libre: "bg-secondary text-secondary-foreground",
  occupee: "bg-accent/15 text-accent",
  a_nettoyer: "bg-muted text-foreground",
  maintenance: "bg-muted text-muted-foreground",
};

function HotelDashboard() {
  const { rooms, reservations } = useHotelData();
  const today = todayISO();
  const [start, setStart] = useState(today);
  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => addDays(start, i)), [start]);

  if (rooms.isLoading || reservations.isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (rooms.error || reservations.error)
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">Impossible de charger l'hôtel.</p>
        <Button size="sm" variant="outline" onClick={() => { rooms.refetch(); reservations.refetch(); }}>Réessayer</Button>
      </div>
    );

  const rs = (reservations.data ?? []);
  const rm = (rooms.data ?? []);
  const count = (s: RoomStatus) => rm.filter((r) => r.status === s).length;
  const arrivals = rs.filter((r) => r.check_in === today && r.status === "confirmee");
  const departures = rs.filter((r) => r.check_out === today && r.status === "arrivee");
  const rate = occupancyRate(rm.length, rs as { check_in: string; check_out: string; status: ReservationStatus }[], today);

  const kpis = [
    { label: "Occupation aujourd'hui", value: `${rate} %`, icon: BedDouble },
    { label: "Chambres libres", value: count("libre"), icon: BedDouble },
    { label: "Arrivées du jour", value: arrivals.length, icon: LogIn },
    { label: "Départs du jour", value: departures.length, icon: LogOut },
    { label: "À nettoyer", value: count("a_nettoyer"), icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kitoko Hôtel</h1>
          <p className="text-sm text-muted-foreground">{rm.length} chambres</p>
        </div>
        <Button asChild><Link to="/hotel/reservations">Nouvelle réservation</Link></Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4">
            <k.icon className="size-4 text-accent" />
            <p className="mt-2 text-2xl font-bold">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {rm.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Aucune chambre pour l'instant.</p>
          <Button asChild className="mt-3" variant="outline"><Link to="/hotel/chambres">Ajouter des chambres</Link></Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h2 className="text-sm font-semibold">Planning</h2>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => setStart(addDays(start, -7))} aria-label="Semaine précédente"><ChevronLeft className="size-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setStart(today)}>Aujourd'hui</Button>
              <Button size="icon" variant="ghost" onClick={() => setStart(addDays(start, 7))} aria-label="Semaine suivante"><ChevronRight className="size-4" /></Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 z-[1] w-36 bg-card p-2 text-left font-semibold">Chambre</th>
                  {days.map((d) => (
                    <th key={d} className={`p-1 text-center font-medium ${d === today ? "text-accent" : "text-muted-foreground"}`}>
                      {new Date(d + "T00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rm.map((room) => (
                  <tr key={room.id} className="border-t border-border">
                    <td className="sticky left-0 z-[1] bg-card p-2">
                      <p className="font-semibold">N° {room.number}</p>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${statusTone[room.status as RoomStatus]}`}>
                        {roomStatusLabels[room.status as RoomStatus]}
                      </span>
                    </td>
                    {days.map((d) => {
                      const res = rs.find(
                        (r) => r.room_id === room.id && (r.status === "confirmee" || r.status === "arrivee") && overlaps(r.check_in, r.check_out, d, addDays(d, 1)),
                      );
                      return (
                        <td key={d} className="h-12 border-l border-border p-0.5">
                          {res && (
                            <div
                              title={`${res.guest_name} — ${res.check_in} → ${res.check_out}`}
                              className={`h-full truncate rounded px-1 py-1 text-[10px] font-medium ${res.status === "arrivee" ? "bg-accent text-accent-foreground" : "bg-primary/80 text-primary-foreground"}`}
                            >
                              {res.check_in === d || d === days[0] ? res.guest_name : ""}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
