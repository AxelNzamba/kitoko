import { CheckCircle2, CloudOff, Loader2, AlertTriangle, Circle } from "lucide-react";
import { useModuleSyncStatus } from "@/lib/sync/hooks";
import { cn } from "@/lib/utils";

type Props = {
  moduleKey: string;
  compact?: boolean;
};

/**
 * Badge d'état de synchro pour un module (visible dans la sidebar).
 */
export function SyncStatusBadge({ moduleKey, compact }: Props) {
  const s = useModuleSyncStatus(moduleKey);

  const configs = {
    ok: { icon: CheckCircle2, color: "text-emerald-500", label: "Synchronisé" },
    pending: {
      icon: Loader2,
      color: "text-orange-500 animate-spin",
      label: `${s.pending} en attente`,
    },
    error: { icon: AlertTriangle, color: "text-red-500", label: `${s.errors} en erreur` },
    offline: { icon: CloudOff, color: "text-muted-foreground", label: "Hors ligne" },
    idle: { icon: Circle, color: "text-muted-foreground/40", label: "Non synchronisé" },
  } as const;

  const cfg = configs[s.state];
  const Icon = cfg.icon;

  if (compact) {
    return (
      <span title={cfg.label} className={cn("inline-flex", cfg.color)}>
        <Icon className="size-3" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
        cfg.color,
      )}
      title={cfg.label}
    >
      <Icon className="size-3" />
      {(s.pending > 0 || s.errors > 0) && (
        <span>{s.pending + s.errors}</span>
      )}
    </span>
  );
}
