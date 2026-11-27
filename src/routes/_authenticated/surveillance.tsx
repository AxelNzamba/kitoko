import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, DatabaseBackup, CheckCircle2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { track } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/surveillance")({
  head: () => ({
    meta: [
      { title: "Surveillance — Erreurs et sauvegardes | INDUS-ERP" },
      { name: "description", content: "Erreurs du site et sauvegardes quotidiennes des données." },
      { property: "og:title", content: "Surveillance — INDUS-ERP" },
      { property: "og:description", content: "Erreurs du site et sauvegardes quotidiennes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SurveillancePage,
});

const fmt = (d: string) => new Date(d).toLocaleString("fr-FR");
const size = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} Mo` : `${Math.ceil(b / 1e3)} Ko`);

function SurveillancePage() {
  const { roles } = useCurrentUser();
  const qc = useQueryClient();
  const isOwner = roles.includes("proprietaire");

  const errors = useQuery({
    queryKey: ["error_logs"],
    enabled: isOwner,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("error_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
  const backups = useQuery({
    queryKey: ["data_backups"],
    enabled: isOwner,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_backups").select("id, created_at, kind, row_count, size_bytes")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const backupNow = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("run_data_backup", { _kind: "manuelle" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sauvegarde créée");
      track({ module: "parametres", action: "sauvegarde_manuelle", label: "Sauvegarde manuelle" });
      qc.invalidateQueries({ queryKey: ["data_backups"] });
    },
    onError: () => toast.error("La sauvegarde a échoué"),
  });

  const resolve = useMutation({
    mutationFn: async (id: string | null) => {
      const q = supabase.from("error_logs");
      const { error } = id
        ? await q.update({ resolved: true }).eq("id", id)
        : await q.delete().eq("resolved", true);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["error_logs"] }),
  });

  async function download(id: string, created: string) {
    const { data, error } = await supabase.from("data_backups").select("data").eq("id", id).single();
    if (error || !data) return toast.error("Téléchargement impossible");
    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sauvegarde-indus-erp-${created.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    track({ module: "parametres", action: "sauvegarde_telechargee", label: `Sauvegarde du ${fmt(created)}` });
  }

  if (!isOwner) {
    return <p className="text-sm text-muted-foreground">Page réservée au Propriétaire.</p>;
  }

  const open = (errors.data ?? []).filter((e) => !e.resolved);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Sauvegardes automatiques</CardTitle>
          <Button onClick={() => backupNow.mutate()} disabled={backupNow.isPending} className="gap-2">
            <DatabaseBackup className="size-4" /> Sauvegarder maintenant
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Une copie complète de vos données est faite chaque nuit à 2 h (heure de Kinshasa) et gardée 30 jours.
          </p>
          {(backups.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune sauvegarde pour l'instant.</p>
          )}
          {(backups.data ?? []).map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
              <span>
                {fmt(b.created_at)} · {b.kind === "auto" ? "automatique" : "manuelle"} · {b.row_count} lignes · {size(b.size_bytes)}
              </span>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => download(b.id, b.created_at)}>
                <Download className="size-4" /> Télécharger
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Erreurs du site ({open.length} à traiter)</CardTitle>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => resolve.mutate(null)}>
            <Trash2 className="size-4" /> Effacer les erreurs réglées
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(errors.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune erreur enregistrée. Tout fonctionne.</p>
          )}
          {(errors.data ?? []).map((e) => (
            <details key={e.id} className={`rounded-md border border-border p-3 text-sm ${e.resolved ? "opacity-50" : ""}`}>
              <summary className="cursor-pointer">
                <span className="font-medium text-foreground">{e.message}</span>
                <span className="ml-2 text-muted-foreground">{fmt(e.created_at)} · page {e.url}</span>
              </summary>
              {e.stack && <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">{e.stack}</pre>}
              <p className="mt-2 text-xs text-muted-foreground">{e.user_agent}</p>
              {!e.resolved && (
                <Button size="sm" variant="outline" className="mt-2 gap-2" onClick={() => resolve.mutate(e.id)}>
                  <CheckCircle2 className="size-4" /> Marquer comme réglée
                </Button>
              )}
            </details>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
