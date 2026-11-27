import { useMemo, useState } from "react";
import {
  Building2, ChevronDown, ChevronRight, MapPin, Pencil, Plus, Search, Trash2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type LocationRow = {
  id: string;
  name: string;
  warehouse_id: string | null;
  zone: string | null;
  aisle: string | null;
  rack: string | null;
  bay: string | null;
  level: string | null;
  is_active: boolean;
  warehouses?: { name?: string } | null;
};

export type WarehouseRow = { id: string; name: string; code?: string | null; is_active?: boolean };

export function locationPath(loc: LocationRow) {
  return [
    loc.zone && `Zone ${loc.zone}`,
    loc.aisle && `Allée ${loc.aisle}`,
    loc.rack && `Rack ${loc.rack}`,
    loc.bay && `Rayon ${loc.bay}`,
    loc.level && `Niveau ${loc.level}`,
  ]
    .filter(Boolean)
    .join(" / ");
}

function matches(loc: LocationRow, q: string) {
  if (!q) return true;
  const haystack = [
    loc.name, loc.zone, loc.aisle, loc.rack, loc.bay, loc.level, loc.warehouses?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

/**
 * Explorateur d'emplacements : arborescence Entrepôt > Zone > emplacements,
 * recherche avec auto-complétion et création rapide au bon niveau.
 */
export function LocationExplorer({
  locations,
  warehouses,
  onEdit,
  onDelete,
  onQuickCreate,
}: {
  locations: LocationRow[];
  warehouses: WarehouseRow[];
  onEdit: (loc: LocationRow) => void;
  onDelete: (id: string) => void;
  onQuickCreate: (prefill: { warehouse_id: string; zone?: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () => locations.filter((l) => matches(l, query)),
    [locations, query],
  );

  // Suggestions d'auto-complétion (zones / allées / racks existants)
  const suggestions = useMemo(() => {
    if (query.trim().length < 1) return [];
    const set = new Set<string>();
    for (const l of locations) {
      for (const v of [l.name, l.zone && `Zone ${l.zone}`, l.aisle && `Allée ${l.aisle}`, l.rack && `Rack ${l.rack}`]) {
        if (v && v.toLowerCase().includes(query.toLowerCase()) && v.toLowerCase() !== query.toLowerCase()) {
          set.add(v);
        }
      }
    }
    return [...set].slice(0, 6);
  }, [locations, query]);

  const tree = useMemo(() => {
    const byWarehouse = new Map<string, Map<string, LocationRow[]>>();
    for (const loc of filtered) {
      const wid = loc.warehouse_id ?? "none";
      if (!byWarehouse.has(wid)) byWarehouse.set(wid, new Map());
      const zones = byWarehouse.get(wid)!;
      const zone = loc.zone?.trim() || "Sans zone";
      if (!zones.has(zone)) zones.set(zone, []);
      zones.get(zone)!.push(loc);
    }
    return byWarehouse;
  }, [filtered]);

  const warehouseName = (id: string) =>
    warehouses.find((w) => w.id === id)?.name ?? "Sans entrepôt";

  const toggle = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un emplacement (nom, zone, allée, rack, entrepôt)…"
          className="pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            aria-label="Effacer"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setQuery("")}
          >
            <X className="size-4" />
          </button>
        )}
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground transition hover:border-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {[...tree.keys()].length === 0 && (
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          <MapPin className="mx-auto mb-2 size-8 text-muted-foreground/40" />
          Aucun emplacement ne correspond.
        </div>
      )}

      <div className="space-y-3">
        {[...tree.entries()].map(([wid, zones]) => {
          const whKey = `wh-${wid}`;
          const total = [...zones.values()].reduce((n, arr) => n + arr.length, 0);
          return (
            <div key={wid} className="rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <button
                  type="button"
                  className="flex min-w-0 items-center gap-2 text-sm font-semibold"
                  onClick={() => toggle(whKey)}
                >
                  {collapsed[whKey] ? (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                  <Building2 className="size-4 text-accent" />
                  <span className="truncate">{warehouseName(wid)}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {total} emplacement{total > 1 ? "s" : ""}
                  </span>
                </button>
                {wid !== "none" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => onQuickCreate({ warehouse_id: wid })}
                  >
                    <Plus className="size-3.5" /> Emplacement
                  </Button>
                )}
              </div>

              {!collapsed[whKey] && (
                <div className="divide-y">
                  {[...zones.entries()].map(([zone, locs]) => {
                    const zoneKey = `${wid}-${zone}`;
                    return (
                      <div key={zoneKey}>
                        <div className="flex items-center justify-between bg-muted/30 px-3 py-1.5">
                          <button
                            type="button"
                            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            onClick={() => toggle(zoneKey)}
                          >
                            {collapsed[zoneKey] ? (
                              <ChevronRight className="size-3.5" />
                            ) : (
                              <ChevronDown className="size-3.5" />
                            )}
                            {zone}
                            <span className="normal-case">({locs.length})</span>
                          </button>
                          {wid !== "none" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 gap-1 text-[11px]"
                              onClick={() =>
                                onQuickCreate({
                                  warehouse_id: wid,
                                  zone: zone === "Sans zone" ? undefined : zone,
                                })
                              }
                            >
                              <Plus className="size-3" /> Ajouter ici
                            </Button>
                          )}
                        </div>

                        {!collapsed[zoneKey] && (
                          <ul>
                            {locs.map((loc) => (
                              <li
                                key={loc.id}
                                className={`flex items-center justify-between px-3 py-2 ${
                                  loc.is_active ? "" : "bg-muted/20"
                                }`}
                              >
                                <div className="flex min-w-0 items-center gap-2 pl-4">
                                  <MapPin
                                    className={`size-4 shrink-0 ${
                                      loc.is_active ? "text-accent" : "text-muted-foreground"
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                      {loc.name}
                                      {!loc.is_active && (
                                        <span className="ml-2 text-[10px] uppercase text-muted-foreground">
                                          inactif
                                        </span>
                                      )}
                                    </p>
                                    {locationPath(loc) && (
                                      <p className="truncate text-xs text-muted-foreground">
                                        {locationPath(loc)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => onEdit(loc)}>
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => onDelete(loc.id)}>
                                    <Trash2 className="size-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
