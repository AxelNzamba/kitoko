import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionAlerts, PerformanceAlerts } from "@/components/ux/action-alerts";

export function ExecutiveDashboard({
  urgent,
  pending,
  performance,
}: {
  urgent: Array<{ id: string; title: string; subtitle?: string; icon: React.ElementType; color: "red" }>;
  pending: Array<{ id: string; title: string; subtitle?: string; icon: React.ElementType; color: "amber" }>;
  performance: Array<{ id: string; title: string; subtitle?: string; icon: React.ElementType; color: "green" }>;
}) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Centre d'Actions Quotidien</CardTitle>
          <p className="text-xs text-muted-foreground">
            À faire d'urgence · En attente · Performance du jour
          </p>
        </CardHeader>
        <CardContent>
          <ActionAlerts alerts={[
            ...urgent.map((u) => ({ ...u, id: u.id })),
            ...pending.map((p) => ({ ...p, id: p.id })),
          ]} />
        </CardContent>
      </Card>
      <PerformanceAlerts alerts={performance} />
    </div>
  );
}
