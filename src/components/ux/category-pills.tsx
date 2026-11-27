import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Palette de couleurs par catégorie pour les produits */
export const CATEGORY_COLORS: Record<string, string> = {
  boulangerie: "bg-amber-100 text-amber-700",
  viandes: "bg-red-100 text-red-700",
  fruits_légumes: "bg-green-100 text-green-700",
  produits_laitiers: "bg-blue-100 text-blue-700",
  boissons: "bg-cyan-100 text-cyan-700",
  surgelés: "bg-violet-100 text-violet-700",
  épicerie: "bg-slate-100 text-slate-700",
  other: "bg-gray-100 text-gray-700",
};

export function CategoryPill({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  const Icon = icon;
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-1.5 px-2.5 py-1.5 text-[11px] font-medium",
        active && "shadow-sm",
      )}
    >
      {Icon && <Icon className="size-3" />}
      {label}
    </Button>
  );
}

export function CategoryColorBadge({
  label,
}: {
  label: string;
}) {
  const color =
    CATEGORY_COLORS[label.toLowerCase()] ?? CATEGORY_COLORS.other;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        color,
      )}
    >
      {label}
    </span>
  );
}
