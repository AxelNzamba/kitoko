import { Link } from "@tanstack/react-router";
import { TriangleAlert, PackageX, Clock, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSmartAlerts, type SmartAlert } from "@/hooks/use-smart-alerts";
import { useWarehouse } from "@/hooks/use-warehouse";

const iconFor = {
  stock: PackageX,
  commande: Clock,
  garantie: ShieldAlert,
} as const;

function AlertRow({ alert }: { alert: SmartAlert }) {
  const Icon = iconFor[alert.kind];
  return (
    <Link
      to={alert.to}
      className="flex items-start gap-3 rounded-md border border-border/60 p-3 transition hover:border-accent hover:bg-muted/40"
    >
      <Icon
        className={`mt-0.5 size-4 shrink-0 ${
          alert.severity === "critical" ? "text-destructive" : "text-amber-500"
        }`}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{alert.title}</p>
        <p className="truncate text-xs text-muted-foreground">{alert.detail}</p>
      </div>
    </Link>
  );
}

/** Carte des notifications intelligentes filtrées par entrepôt actif. */
export function SmartAlertsCard() {
  const { data: alerts = [], isLoading } = useSmartAlerts();
  const { selectedWarehouse, selectedWarehouseId } = useWarehouse();

  const critical = alerts.filter((a) => a.severity === "critical");
  const others = alerts.filter((a) => a.severity !== "critical");
  const list = [...critical, ...others].slice(0, 12);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <TriangleAlert className="size-4 text-amber-500" />
          Alertes intelligentes
          {selectedWarehouseId !== "all" && selectedWarehouse && (
            <span className="text-xs font-normal text-muted-foreground">
              — {selectedWarehouse.name}
            </span>
          )}
        </CardTitle>
        {alerts.length > 0 && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
            {alerts.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Analyse en cours…</p>}
        {!isLoading && alerts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucune alerte : stock, commandes et garanties sont sous contrôle.
          </p>
        )}
        {list.map((a) => (
          <AlertRow key={a.id} alert={a} />
        ))}
        {alerts.length > list.length && (
          <p className="text-xs text-muted-foreground">
            +{alerts.length - list.length} autre(s) alerte(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
