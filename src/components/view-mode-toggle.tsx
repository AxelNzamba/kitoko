import { useCallback, useEffect, useState } from "react";
import {
  LayoutGrid, Grid2x2, Grid3x3, Rows3, List as ListIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Modes d'affichage disponibles pour les listes de l'application.
 * - xl-icons  : très grandes icônes (2-3 colonnes)
 * - icons     : grandes icônes (3-5 colonnes)
 * - mosaic    : mosaïque compacte (4-8 colonnes)
 * - details   : cartes détaillées (1-2 colonnes, toutes les infos)
 * - list      : tableau classique
 */
export const VIEW_MODES = ["xl-icons", "icons", "mosaic", "details", "list"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

const OPTIONS: { mode: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { mode: "xl-icons", label: "Très grandes icônes", icon: Grid2x2 },
  { mode: "icons", label: "Grandes icônes", icon: LayoutGrid },
  { mode: "mosaic", label: "Mosaïque", icon: Grid3x3 },
  { mode: "details", label: "Détails", icon: Rows3 },
  { mode: "list", label: "Liste", icon: ListIcon },
];

/** Persiste le mode d'affichage choisi par écran. */
export function useViewMode(storageKey: string, fallback: ViewMode = "list") {
  const key = `indus-erp:view-mode:${storageKey}`;
  const [mode, setModeState] = useState<ViewMode>(fallback);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(key) as ViewMode | null;
    if (stored && (VIEW_MODES as readonly string[]).includes(stored)) setModeState(stored);
  }, [key]);

  const setMode = useCallback(
    (v: ViewMode) => {
      setModeState(v);
      if (typeof window !== "undefined") window.localStorage.setItem(key, v);
    },
    [key],
  );

  return { mode, setMode };
}

/** Classes de grille associées à chaque mode. */
export function viewGridClass(mode: ViewMode): string {
  switch (mode) {
    case "xl-icons":
      return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
    case "icons":
      return "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    case "mosaic":
      return "grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";
    case "details":
      return "grid grid-cols-1 gap-3 xl:grid-cols-2";
    default:
      return "";
  }
}

export function ViewModeToggle({
  mode, onChange, className,
}: { mode: ViewMode; onChange: (m: ViewMode) => void; className?: string }) {
  return (
    <div
      role="group"
      aria-label="Mode d'affichage"
      className={cn("flex items-center gap-0.5 rounded-md border bg-card p-0.5", className)}
    >
      {OPTIONS.map(({ mode: m, label, icon: Icon }) => (
        <Button
          key={m}
          type="button"
          variant={mode === m ? "default" : "ghost"}
          size="sm"
          className="size-7 p-0"
          aria-label={label}
          aria-pressed={mode === m}
          title={label}
          onClick={() => onChange(m)}
        >
          <Icon className={m === "xl-icons" ? "size-4.5" : "size-4"} />
        </Button>
      ))}
    </div>
  );
}
