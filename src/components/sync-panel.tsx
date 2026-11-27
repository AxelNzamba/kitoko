import { useState } from "react";
import { RefreshCcw, Wifi, WifiOff } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MODULE_TABLES } from "@/lib/sync/module-map";
import { useModuleSyncStatus, useOnlineStatus } from "@/lib/sync/hooks";
import { syncNow } from "@/lib/sync/engine";
import { getSyncDB } from "@/lib/sync/db";

/**
 * Panneau global de synchronisation, ouvert depuis le header.
 * Montre l'état module par module, un bouton "Forcer la synchro" et
 * le journal des conflits résolus automatiquement.
 */
export function SyncPanel() {
  const online = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);

  const conflicts = useLiveQuery(
    async () => getSyncDB().conflicts.orderBy("resolved_at").reverse().limit(20).toArray(),
    [],
    [],
  );

  const totalPending = useLiveQuery(
    async () => getSyncDB().outbox.count(),
    [],
    0,
  );

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await syncNow();
      if (r.errors.length > 0) {
        toast.error(`Synchronisation partielle: ${r.errors.length} erreur(s)`);
      } else {
        toast.success(`Synchronisation OK — ${r.pushed} envoyé(s), ${r.pulled} reçu(s)`);
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 gap-1.5 px-2"
          title="Synchronisation"
        >
          {online ? (
            <Wifi className="size-4 text-emerald-500" />
          ) : (
            <WifiOff className="size-4 text-red-500" />
          )}
          {totalPending > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]"
            >
              {totalPending}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Synchronisation</p>
            <p className="text-xs text-muted-foreground">
              {online ? "En ligne" : "Hors ligne"}
              {totalPending > 0 && ` • ${totalPending} mutation(s) en attente`}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={syncing || !online}
          >
            <RefreshCcw className={`size-3.5 mr-1 ${syncing ? "animate-spin" : ""}`} />
            Synchroniser
          </Button>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Par module
            </p>
            <div className="grid gap-1">
              {MODULE_TABLES.map((m) => (
                <ModuleRow key={m.key} moduleKey={m.key} />
              ))}
            </div>

            {conflicts.length > 0 && (
              <>
                <p className="mt-3 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Conflits résolus ({conflicts.length})
                </p>
                <div className="grid gap-1 px-2">
                  {conflicts.map((c) => (
                    <div key={c.id} className="rounded border p-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-mono">{c.table}</span>
                        <span className="text-muted-foreground">
                          {new Date(c.resolved_at).toLocaleTimeString("fr-FR")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-muted-foreground">
                        Champs gardés : {c.winning_fields.join(", ") || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function ModuleRow({ moduleKey }: { moduleKey: string }) {
  const s = useModuleSyncStatus(moduleKey);
  const label = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
  const color =
    s.state === "ok" ? "bg-emerald-500" :
    s.state === "pending" ? "bg-orange-500" :
    s.state === "error" ? "bg-red-500" :
    s.state === "offline" ? "bg-muted-foreground/40" :
    "bg-muted-foreground/20";

  return (
    <div className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-muted/50">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${color}`} />
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-muted-foreground">
        {s.pending > 0 && <span className="mr-2 text-orange-600">{s.pending} en attente</span>}
        {s.errors > 0 && <span className="mr-2 text-red-600">{s.errors} erreur(s)</span>}
        {s.lastPullAt && s.state === "ok" && (
          <span>{new Date(s.lastPullAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
        )}
      </div>
    </div>
  );
}
