import { CloudOff, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Badge discret "X mouvements en attente de synchro" */
export function OfflineSyncBadge({
  count,
  online,
  onRetry,
}: {
  count: number;
  online: boolean;
  onRetry: () => void;
}) {
  if (online || count <= 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 shadow-lg">
      <CloudOff className="size-4 text-amber-600" />
      <span className="font-mono">{count} mouvement{String(count) === "1" ? "" : "s"} en attente</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="h-6 px-1.5 text-[10px]"
      >
        <RefreshCw className="size-3" />
      </Button>
    </div>
  );
}
