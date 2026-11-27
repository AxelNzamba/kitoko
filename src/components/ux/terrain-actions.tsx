import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

/** Boutons d'action géants pour le mode terrain (min 54px de hauteur) */
export function TerrainActionButtons({
  actions,
  activeId,
  onSelect,
}: {
  actions: Array<{ id: string; label: string; icon: LucideIcon; description?: string; color?: "default" | "outline" }>;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map((a) => {
        const isActive = activeId === a.id;
        return (
          <Button
            key={a.id}
            variant={isActive ? "default" : a.color ?? "outline"}
            className="h-16 flex-col items-center justify-center gap-1.5 text-sm font-semibold sm:text-base"
            onClick={() => onSelect(a.id)}
          >
            <a.icon className="size-5" />
            <span>{a.label}</span>
            {a.description && <span className="text-[9px] text-muted-foreground">{a.description}</span>}
          </Button>
        );
      })}
    </div>
  );
}
