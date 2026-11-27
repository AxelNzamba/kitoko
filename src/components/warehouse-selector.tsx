import { Warehouse, useWarehouse } from "@/hooks/use-warehouse";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WarehouseIcon, Check, Building2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

export function WarehouseSelector() {
  const { warehouses, selectedWarehouseId, setSelectedWarehouseId, isLoading } = useWarehouse();
  const { roles } = useCurrentUser();
  const isProprio = roles.includes("proprietaire");

  const selected = warehouses.find((w) => w.id === selectedWarehouseId);

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="h-9 gap-2">
        <WarehouseIcon className="size-4" />
        <span className="hidden sm:inline">Chargement…</span>
      </Button>
    );
  }

  if (warehouses.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled className="h-9 gap-2">
        <WarehouseIcon className="size-4" />
        <span className="hidden sm:inline">Aucun entrepôt</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 px-2.5">
          <Building2 className="size-4 shrink-0" />
          <span className="hidden min-w-0 truncate sm:inline max-w-[140px]">
            {selectedWarehouseId === "all" && isProprio
              ? "Tous les entrepôts"
              : selected?.name ?? "Entrepôt"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Filtrer par entrepôt</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isProprio && (
          <DropdownMenuItem onClick={() => setSelectedWarehouseId("all")}>
            <span className="flex-1">Tous les entrepôts</span>
            {selectedWarehouseId === "all" && <Check className="size-4" />}
          </DropdownMenuItem>
        )}
        {warehouses.map((w) => (
          <DropdownMenuItem key={w.id} onClick={() => setSelectedWarehouseId(w.id)}>
            <WarehouseItem w={w} />
            {selectedWarehouseId === w.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WarehouseItem({ w }: { w: Warehouse }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate font-medium">{w.name}</span>
      {w.code && <span className="truncate text-[10px] text-muted-foreground">{w.code}</span>}
    </div>
  );
}
