import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/lib/sync/hooks";

/**
 * Bandeau global d'état réseau.
 * - Hors-ligne : message permanent rassurant (les saisies sont conservées).
 * - Retour en ligne : confirmation brève (3 s) puis disparition.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const [showBack, setShowBack] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setShowBack(false);
      return;
    }
    if (wasOffline) {
      setShowBack(true);
      const id = setTimeout(() => setShowBack(false), 3000);
      return () => clearTimeout(id);
    }
  }, [online, wasOffline]);

  if (!online) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-2 bg-warning px-3 py-2 text-center text-sm font-medium text-warning-foreground"
      >
        <WifiOff className="size-4 shrink-0" />
        <span>
          Mode hors-ligne — vous pouvez continuer à travailler, vos saisies seront
          synchronisées au retour du réseau.
        </span>
      </div>
    );
  }

  if (showBack) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-2 bg-success px-3 py-1.5 text-center text-sm font-medium text-success-foreground"
      >
        <Wifi className="size-4 shrink-0" />
        <span>Connexion rétablie — synchronisation en cours…</span>
      </div>
    );
  }

  return null;
}
