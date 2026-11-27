import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/format";
import { roomStatusLabels, type RoomStatus } from "@/lib/hotel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHotelData } from "@/modules/hotel/queries";

export const Route = createFileRoute("/_authenticated/hotel/chambres")({
  component: RoomsPage,
  head: () => ({
    meta: [
      { title: "Chambres — Kitoko Hôtel" },
      { name: "description", content: "Types de chambres, tarifs par nuit et état de chaque chambre." },
    
      { property: "og:title", content: "Chambres — Kitoko Hôtel" },
      { property: "og:description", content: "Types de chambres, tarifs par nuit et état de chaque chambre." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }],
  }),
});

const selectCls = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

function RoomsPage() {
  const qc = useQueryClient();
  const { rooms } = useHotelData();
  const types = useQuery({
    queryKey: ["hotel", "types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hotel_room_types").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
  const [typeOpen, setTypeOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [t, setT] = useState({ name: "", base_price: "", capacity: "2" });
  const [r, setR] = useState({ number: "", floor: "", room_type_id: "", price_override: "" });

  const refresh = () => qc.invalidateQueries({ queryKey: ["hotel"] });

  const addType = useMutation({
    mutationFn: async () => {
      if (!t.name.trim()) throw new Error("Indiquez un nom");
      const { error } = await supabase.from("hotel_room_types").insert({
        name: t.name.trim(), base_price: Number(t.base_price) || 0, capacity: Math.max(1, parseInt(t.capacity) || 1),
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Type ajouté"); setTypeOpen(false); setT({ name: "", base_price: "", capacity: "2" }); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addRoom = useMutation({
    mutationFn: async () => {
      if (!r.number.trim()) throw new Error("Indiquez le numéro");
      const { error } = await supabase.from("hotel_rooms").insert({
        number: r.number.trim(), floor: r.floor || null, room_type_id: r.room_type_id || null,
        price_override: r.price_override ? Number(r.price_override) : null,
      });
      if (error) throw new Error(error.code === "23505" ? "Ce numéro existe déjà" : error.message);
    },
    onSuccess: () => { toast.success("Chambre ajoutée"); setRoomOpen(false); setR({ number: "", floor: "", room_type_id: "", price_override: "" }); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RoomStatus }) => {
      const { error } = await supabase.from("hotel_rooms").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("État mis à jour"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Chambres</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTypeOpen(true)}><Plus className="size-4" /> Type</Button>
            <Button onClick={() => setRoomOpen(true)} disabled={!types.data}><Plus className="size-4" /> Chambre</Button>
          </div>
        </div>
        {rooms.isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : rooms.error ? (
          <p className="text-sm text-destructive">Erreur de chargement. <Button variant="link" onClick={() => rooms.refetch()}>Réessayer</Button></p>
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader><TableRow><TableHead>N°</TableHead><TableHead>Étage</TableHead><TableHead>Type</TableHead><TableHead>Prix / nuit</TableHead><TableHead>État</TableHead></TableRow></TableHeader>
              <TableBody>
                {(rooms.data ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune chambre. Créez d'abord un type, puis vos chambres.</TableCell></TableRow>}
                {(rooms.data ?? []).map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-semibold">{room.number}</TableCell>
                    <TableCell>{room.floor ?? "—"}</TableCell>
                    <TableCell>{room.hotel_room_types?.name ?? "—"}</TableCell>
                    <TableCell>{formatXOF(Number(room.price_override ?? room.hotel_room_types?.base_price ?? 0))}</TableCell>
                    <TableCell>
                      <select aria-label={`État chambre ${room.number}`} className={selectCls} value={room.status}
                        onChange={(e) => setStatus.mutate({ id: room.id, status: e.target.value as RoomStatus })}>
                        {Object.entries(roomStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Types de chambres</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(types.data ?? []).map((ty) => (
            <div key={ty.id} className="rounded-lg border border-border bg-card p-4">
              <p className="font-semibold">{ty.name}</p>
              <p className="text-sm text-accent">{formatXOF(Number(ty.base_price))} / nuit</p>
              <p className="text-xs text-muted-foreground">{ty.capacity} personne(s)</p>
            </div>
          ))}
          {types.data?.length === 0 && <p className="text-sm text-muted-foreground">Aucun type (ex. Standard, Suite).</p>}
        </div>
      </section>

      <Dialog open={typeOpen} onOpenChange={setTypeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau type de chambre</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label htmlFor="chambres-1">Nom</Label><Input id="chambres-1" value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} placeholder="Standard, Suite…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="chambres-2">Prix par nuit</Label><Input id="chambres-2" type="number" min={0} value={t.base_price} onChange={(e) => setT({ ...t, base_price: e.target.value })} /></div>
              <div><Label htmlFor="chambres-3">Capacité</Label><Input id="chambres-3" type="number" min={1} value={t.capacity} onChange={(e) => setT({ ...t, capacity: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={() => addType.mutate()} disabled={addType.isPending}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle chambre</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="chambres-4">Numéro</Label><Input id="chambres-4" value={r.number} onChange={(e) => setR({ ...r, number: e.target.value })} placeholder="101" /></div>
              <div><Label htmlFor="chambres-5">Étage</Label><Input id="chambres-5" value={r.floor} onChange={(e) => setR({ ...r, floor: e.target.value })} /></div>
            </div>
            <div><Label htmlFor="hotel.chambres.tsx-Type">Type</Label><select id="hotel.chambres.tsx-Type" className={selectCls} value={r.room_type_id} onChange={(e) => setR({ ...r, room_type_id: e.target.value })}>
                <option value="">— Choisir —</option>
                {(types.data ?? []).map((ty) => <option key={ty.id} value={ty.id}>{ty.name}</option>)}
              </select>
            </div>
            <div><Label htmlFor="chambres-6">Prix spécial par nuit (facultatif)</Label><Input id="chambres-6" type="number" min={0} value={r.price_override} onChange={(e) => setR({ ...r, price_override: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={() => addRoom.mutate()} disabled={addRoom.isPending}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
