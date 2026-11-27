import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { RefreshCcw, Trash2, Wifi, WifiOff, AlertTriangle, CheckCircle2, GitMerge } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/audit";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MODULE_TABLES } from "@/lib/sync/module-map";
import { useModuleSyncStatus, useOnlineStatus } from "@/lib/sync/hooks";
import { syncNow, resolvePendingConflict } from "@/lib/sync/engine";
import { getSyncDB, type PendingConflict } from "@/lib/sync/db";
import { formatDateTime } from "@/lib/format";
import {
  isTransferTable,
  recommendTransferDecision,
  transferConflictSummary,
  transferFieldHint,
  transferFieldLabel,
  transferValueLabel,
} from "@/lib/sync/transfer-conflicts";



export const Route = createFileRoute("/_authenticated/synchronisation")({
  component: SyncCenterPage,
  head: () => ({
    meta: [
      { title: "Centre de synchronisation — INDUS-ERP" },
      { name: "description", content: "État de synchronisation par module, conflits détectés et resynchronisation manuelle." },
      { property: "og:title", content: "Centre de synchronisation — INDUS-ERP" },
      { property: "og:description", content: "Suivi hors ligne, conflits et resynchronisation manuelle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STATE_LABEL: Record<string, string> = {
  ok: "Synchronisé",
  pending: "En attente",
  error: "Erreur",
  offline: "Hors ligne",
  idle: "Jamais synchronisé",
};

function SyncCenterPage() {
  const online = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [active, setActive] = useState<PendingConflict | null>(null);

  const outbox = useLiveQuery(
    async () => getSyncDB().outbox.orderBy("created_at").reverse().toArray(),
    [],
    [],
  );
  const conflicts = useLiveQuery(
    async () => getSyncDB().conflicts.orderBy("resolved_at").reverse().limit(100).toArray(),
    [],
    [],
  );
  const pendingConflicts = useLiveQuery(
    async () =>
      getSyncDB().pending_conflicts.where("status").equals("pending").reverse().sortBy("detected_at"),
    [],
    [] as PendingConflict[],
  );


  const pending = outbox.filter((e) => (e.attempts ?? 0) === 0).length;
  const failed = outbox.filter((e) => (e.attempts ?? 0) > 0).length;

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await syncNow();
      track({ module: "synchronisation", action: "synchro_manuelle", label: "Synchronisation manuelle", severity: r.errors.length > 0 ? "warning" : "info", details: { envoyes: r.pushed, recus: r.pulled, erreurs: r.errors.length } });
      if (r.errors.length > 0) toast.error(`Synchronisation partielle : ${r.errors.length} erreur(s)`);
      else toast.success(`Synchronisation OK — ${r.pushed} envoyé(s), ${r.pulled} reçu(s)`);
    } catch (e) {
      toast.error((e as Error).message ?? "Erreur de synchronisation");
    } finally {
      setSyncing(false);
    }
  };

  const clearFailed = async () => {
    const db = getSyncDB();
    const all = await db.outbox.toArray();
    const ids = all.filter((e) => (e.attempts ?? 0) > 2).map((e) => e.id!);
    await db.outbox.bulkDelete(ids);
    track({ module: "synchronisation", action: "purge_echecs", label: "Purge des envois en échec", severity: "warning", details: { supprimes: ids.length } });
    toast.success(`${ids.length} mutation(s) abandonnée(s) supprimée(s)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Centre de synchronisation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            État par module, conflits détectés et resynchronisation manuelle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={online ? "secondary" : "destructive"} className="gap-1">
            {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            {online ? "En ligne" : "Hors ligne"}
          </Badge>
          <Button onClick={handleSync} disabled={syncing || !online}>
            <RefreshCcw className={`mr-1 size-4 ${syncing ? "animate-spin" : ""}`} />
            Resynchroniser
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Mutations en attente" value={pending} tone="pending" />
        <StatCard label="Mutations en erreur" value={failed} tone="error" />
        <StatCard label="Conflits à arbitrer" value={pendingConflicts.length} tone="pending" />
        <StatCard label="Conflits fusionnés" value={conflicts.length} tone="info" />
      </div>

      <section className="rounded-lg border bg-card">
        <header className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Conflits à arbitrer ({pendingConflicts.length})</h2>
          <p className="text-xs text-muted-foreground">
            Un même champ a été modifié sur deux appareils. Choisissez champ par champ la valeur à conserver ;
            la décision est appliquée localement et renvoyée au serveur.
          </p>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Détecté le</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Enregistrement</TableHead>
              <TableHead>Champs en conflit</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingConflicts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  Aucun conflit à arbitrer.
                </TableCell>
              </TableRow>
            )}
            {pendingConflicts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs">{formatDateTime(new Date(c.detected_at))}</TableCell>
                <TableCell className="font-mono text-xs">{c.table}</TableCell>
                <TableCell className="text-xs">{c.label}</TableCell>
                <TableCell className="text-xs">
                  {isTransferTable(c.table)
                    ? transferConflictSummary(c.fields)
                    : c.fields.map((f) => f.field).join(", ")}
                  {isTransferTable(c.table) && (
                    <Badge variant="outline" className="ml-2 text-[10px]">Transfert</Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setActive(c)}>
                    <GitMerge className="mr-1 size-3.5" /> Résoudre
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        {active && <ConflictResolver conflict={active} onDone={() => setActive(null)} />}
      </Dialog>



      <section className="rounded-lg border bg-card">
        <header className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">État par module</h2>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Tables</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="text-right">En attente</TableHead>
              <TableHead className="text-right">Erreurs</TableHead>
              <TableHead className="text-right">Dernière synchro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MODULE_TABLES.map((m) => (
              <ModuleStatusRow key={m.key} moduleKey={m.key} tables={m.tables} />
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-lg border bg-card">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">File d'attente ({outbox.length})</h2>
          {failed > 0 && (
            <Button variant="outline" size="sm" onClick={clearFailed}>
              <Trash2 className="mr-1 size-3.5" /> Purger les échecs répétés
            </Button>
          )}
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Opération</TableHead>
              <TableHead>Enregistrement</TableHead>
              <TableHead className="text-right">Tentatives</TableHead>
              <TableHead>Dernière erreur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outbox.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Aucune mutation en attente — tout est synchronisé.
                </TableCell>
              </TableRow>
            )}
            {outbox.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs">{formatDateTime(new Date(e.created_at))}</TableCell>
                <TableCell className="font-mono text-xs">{e.table}</TableCell>
                <TableCell className="text-xs">{e.op === "delete" ? "Suppression" : "Création / MAJ"}</TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">{e.row_id.slice(0, 8)}…</TableCell>
                <TableCell className="text-right text-xs">{e.attempts ?? 0}</TableCell>
                <TableCell className="max-w-[280px] truncate text-xs text-destructive">{e.last_error ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-lg border bg-card">
        <header className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Conflits détectés et résolus ({conflicts.length})</h2>
          <p className="text-xs text-muted-foreground">
            Fusion automatique champ par champ : la modification la plus récente de chaque champ est conservée.
          </p>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Résolu le</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Enregistrement</TableHead>
              <TableHead>Champs conservés localement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conflicts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Aucun conflit détecté.
                </TableCell>
              </TableRow>
            )}
            {conflicts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs">{formatDateTime(new Date(c.resolved_at))}</TableCell>
                <TableCell className="font-mono text-xs">{c.table}</TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">{c.row_id.slice(0, 8)}…</TableCell>
                <TableCell className="text-xs">{c.winning_fields.join(", ") || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "pending" | "error" | "info" }) {
  const color =
    tone === "error" ? "text-destructive" : tone === "pending" ? "text-orange-600" : "text-emerald-600";
  const Icon = tone === "error" ? AlertTriangle : tone === "pending" ? RefreshCcw : CheckCircle2;
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`size-4 ${color}`} />
        {label}
      </div>
      <p className={`mt-2 text-2xl font-semibold ${value > 0 ? color : ""}`}>{value}</p>
    </div>
  );
}

function ModuleStatusRow({ moduleKey, tables }: { moduleKey: string; tables: string[] }) {
  const s = useModuleSyncStatus(moduleKey);
  const label = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
  const dot =
    s.state === "ok" ? "bg-emerald-500" :
    s.state === "pending" ? "bg-orange-500" :
    s.state === "error" ? "bg-red-500" :
    "bg-muted-foreground/40";

  return (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="font-mono text-[11px] text-muted-foreground">{tables.join(", ")}</TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-2 text-xs">
          <span className={`size-2 rounded-full ${dot}`} />
          {STATE_LABEL[s.state]}
        </span>
      </TableCell>
      <TableCell className="text-right text-xs">{s.pending}</TableCell>
      <TableCell className="text-right text-xs">{s.errors}</TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        {s.lastPullAt ? formatDateTime(new Date(s.lastPullAt)) : "—"}
      </TableCell>
    </TableRow>
  );
}

/**
 * Résolution guidée : l'utilisateur choisit, champ par champ, la valeur
 * locale ou la valeur serveur. La décision est appliquée au cache local
 * et les champs "locaux" sont renvoyés au serveur via l'outbox.
 */
function ConflictResolver({ conflict, onDone }: { conflict: PendingConflict; onDone: () => void }) {
  const isTransfer = isTransferTable(conflict.table);
  const [decisions, setDecisions] = useState<Record<string, "local" | "server">>(() =>
    Object.fromEntries(
      conflict.fields.map(
        (f) =>
          [
            f.field,
            isTransfer
              ? recommendTransferDecision(f.field, f)
              : f.local_version >= f.server_version
                ? "local"
                : "server",
          ] as const,
      ),
    ),
  );

  const [saving, setSaving] = useState(false);

  const setAll = (choice: "local" | "server") =>
    setDecisions(Object.fromEntries(conflict.fields.map((f) => [f.field, choice])));

  const apply = async () => {
    setSaving(true);
    try {
      await resolvePendingConflict(conflict.id!, decisions);
      track({ module: "synchronisation", action: "conflit_resolu", label: `Conflit résolu — ${conflict.label}`, table: conflict.table, recordId: conflict.row_id, details: { decisions } });
      toast.success("Conflit résolu et décision appliquée");
      onDone();
    } catch (e) {
      toast.error((e as Error).message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const show = (v: unknown) =>
    v === null || v === undefined || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Résoudre le conflit — {conflict.label}</DialogTitle>
      </DialogHeader>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">{conflict.table} · {conflict.row_id.slice(0, 8)}…</span>
        <span className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setAll("local")}>
            Tout garder local
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAll("server")}>
            Tout garder serveur
          </Button>
        </span>
      </div>

      <div className="max-h-[60vh] space-y-3 overflow-auto">
        {conflict.fields.map((f) => {
          const choice = decisions[f.field] ?? "server";
          const hint = isTransfer ? transferFieldHint(f.field, f) : null;
          const recommended = isTransfer ? recommendTransferDecision(f.field, f) : null;
          return (
            <div key={f.field} className="rounded-lg border p-3">
              <p className="mb-1 text-xs font-semibold">
                {isTransfer ? transferFieldLabel(f.field) : f.field}
                <span className="ml-2 font-mono text-[10px] font-normal text-muted-foreground">{f.field}</span>
              </p>
              {hint && <p className="mb-2 text-[11px] text-muted-foreground">{hint}</p>}
              {recommended && (
                <p className="mb-2 text-[11px] font-medium text-primary">
                  Recommandé : garder la valeur {recommended === "local" ? "de cet appareil" : "du serveur"}
                </p>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDecisions((d) => ({ ...d, [f.field]: "local" }))}
                  className={`rounded-md border p-2 text-left text-xs transition ${
                    choice === "local" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">Cet appareil</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(new Date(f.local_version))}
                    </span>
                  </span>
                  <span className="mt-1 block break-words font-medium">
                    {(isTransfer && transferValueLabel(f.field, f.local_value)) || show(f.local_value)}
                  </span>

                </button>
                <button
                  type="button"
                  onClick={() => setDecisions((d) => ({ ...d, [f.field]: "server" }))}
                  className={`rounded-md border p-2 text-left text-xs transition ${
                    choice === "server" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">Serveur</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(new Date(f.server_version))}
                    </span>
                  </span>
                  <span className="mt-1 block break-words font-medium">
                    {(isTransfer && transferValueLabel(f.field, f.server_value)) || show(f.server_value)}
                  </span>

                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Annuler</Button>
        <Button type="button" onClick={apply} disabled={saving}>
          <GitMerge className="mr-1 size-4" /> Appliquer la décision
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
