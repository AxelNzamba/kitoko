import { Link, useRouterState } from "@tanstack/react-router";
import { Star, StarOff, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFavorites } from "@/hooks/use-favorites";
import { useWarehouse } from "@/hooks/use-warehouse";
import { modules, roleLabels } from "@/lib/modules";
import { toast } from "sonner";

function currentModuleTitle(pathname: string) {
  return (
    modules
      .flatMap((g) => g.items)
      .find((i) => pathname === i.to || pathname.startsWith(i.to + "/"))?.title ??
    pathname
  );
}

/** Bouton d'épinglage de l'écran courant (global ou lié à l'entrepôt actif). */
export function PinCurrentPageButton() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { add, remove, findByTarget, role } = useFavorites();
  const { selectedWarehouseId, selectedWarehouse } = useWarehouse();

  const existing = findByTarget(pathname);
  const label = currentModuleTitle(pathname);

  if (existing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-2 text-accent"
        title="Retirer des favoris"
        onClick={() =>
          remove.mutate(existing.id, {
            onSuccess: () => toast.success("Retiré des favoris"),
            onError: (e: any) => toast.error(e.message ?? "Erreur"),
          })
        }
      >
        <Star className="size-4 fill-current" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground" title="Ajouter aux favoris">
          <StarOff className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Épingler « {label} »{role ? ` pour ${roleLabels[role]}` : ""}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            add.mutate(
              { type: "page", target: pathname, label },
              { onSuccess: () => toast.success("Ajouté aux favoris") },
            )
          }
        >
          Tous les entrepôts
        </DropdownMenuItem>
        {selectedWarehouseId !== "all" && (
          <DropdownMenuItem
            onClick={() =>
              add.mutate(
                {
                  type: "page",
                  target: pathname,
                  label: `${label} — ${selectedWarehouse?.name ?? ""}`,
                  scopeWarehouse: true,
                },
                { onSuccess: () => toast.success("Ajouté aux favoris") },
              )
            }
          >
            <Building2 className="mr-2 size-4" />
            Uniquement {selectedWarehouse?.name}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Barre « Accès rapide » : favoris de l'utilisateur pour son rôle / entrepôt. */
export function FavoritesBar({ className }: { className?: string }) {
  const { favorites, remove } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Accès rapide
        </span>
        {favorites.map((f) => (
          <span
            key={f.id}
            className="group inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium transition hover:border-accent"
          >
            <Link to={f.target} className="flex items-center gap-1">
              {f.warehouse_id && <Building2 className="size-3 text-accent" />}
              {f.label}
            </Link>
            <button
              type="button"
              aria-label={`Retirer ${f.label}`}
              className="text-muted-foreground opacity-0 transition group-hover:opacity-100"
              onClick={() => remove.mutate(f.id)}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
