import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { housekeepingLabels, type HousekeepingStatus } from "@/lib/hotel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useHotelData } from "@/modules/hotel/queries";

export const Route = createFileRoute("/_authenticated/hotel/menage")({
  component: HousekeepingPage,
  head: () => ({
    meta: [
      { title: "Ménage — Kitoko Hôtel" },
      { name: "description", content: "Tâches de nettoyage des chambres, assignation et suivi." },
    
      { property: "og:title", content: "Ménage — Kitoko Hôtel" },
      { property: "og:description", content: "Tâches de nettoyage des chambres, assignation et suivi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }],
  }),
});

function HousekeepingPage() {
  const qc = useQueryClient();
  const { rooms } = useHotelData();
  const [showDone, setShowDone] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [task, setTask] = useState("");
  const [who, setWho] = useState("");

  const tasks = useQuery({
    queryKey: ["hotel", "housekeeping"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_housekeeping").select("*, hotel_rooms(number)").order("due_date").limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["hotel"] });

  const add = useMutation({
    mutationFn: async () => {
      if (!roomId) throw new Error("Choisissez une chambre");
      const { error } = await supabase.from("hotel_housekeeping").insert({ room_id: roomId, task: task.trim() || "Nettoyage complet", assigned_to: who.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tâche ajoutée"); setTask(""); setWho(""); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: HousekeepingStatus }) => {
      const { error } = await supabase.from("hotel_housekeeping").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { toast.success(v.status === "fait" ? "Chambre prête" : "Tâche mise à jour"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = (tasks.data ?? []).filter((t) => showDone || t.status !== "fait");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Ménage</h1>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-3">
        <select aria-label="Chambre" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="">Chambre…</option>
          {(rooms.data ?? []).map((r) => <option key={r.id} value={r.id}>N° {r.number}</option>)}
        </select>
        <Input className="w-56" placeholder="Tâche (ex. changer les draps)" value={task} onChange={(e) => setTask(e.target.value)} />
        <Input className="w-40" placeholder="Assignée à" value={who} onChange={(e) => setWho(e.target.value)} />
        <Button onClick={() => add.mutate()} disabled={add.isPending}><Plus className="size-4" /> Ajouter</Button>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Voir les tâches faites
        </label>
      </div>

      {tasks.isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : tasks.error ? (
        <p className="text-sm text-destructive">Erreur de chargement. <Button variant="link" onClick={() => tasks.refetch()}>Réessayer</Button></p>
      ) : list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Rien à nettoyer pour l'instant. Les tâches se créent automatiquement à chaque départ.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">N° {t.hotel_rooms?.number}</p>
                <Badge variant={t.status === "fait" ? "secondary" : "default"}>{housekeepingLabels[t.status as HousekeepingStatus]}</Badge>
              </div>
              <p className="mt-1 text-sm">{t.task}</p>
              <p className="text-xs text-muted-foreground">{formatDate(t.due_date)}{t.assigned_to ? ` · ${t.assigned_to}` : ""}</p>
              {t.status !== "fait" && (
                <div className="mt-3 flex gap-2">
                  {t.status === "a_faire" && <Button size="sm" variant="outline" onClick={() => update.mutate({ id: t.id, status: "en_cours" })}>Commencer</Button>}
                  <Button size="sm" onClick={() => update.mutate({ id: t.id, status: "fait" })}>Terminé</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
