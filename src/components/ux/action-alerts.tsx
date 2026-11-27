import { AlertTriangle, Clock, CheckCircle, Package, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Alert = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  color: "red" | "amber" | "green";
};

export function AlertList({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-sm text-muted-foreground">
        Aucune alerte
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {alerts.map((a) => (
        <li
          key={a.id}
          className={`flex items-start gap-2 rounded-lg border p-2.5 ${
            a.color === "red" ? "border-red-500/30 bg-red-50" :
            a.color === "amber" ? "border-amber-500/30 bg-amber-50" :
            "border-green-500/30 bg-green-50"
          }`}
        >
          <a.icon className={`size-4 shrink-0 ${a.color === "red" ? "text-red-600" : a.color === "amber" ? "text-amber-600" : "text-green-600"}`} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">{a.title}</p>
            {a.subtitle && <p className="text-[10px] text-muted-foreground">{a.subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" className="size-6 p-0">
            <a.icon className={`size-3 ${a.color === "red" ? "text-red-600" : a.color === "amber" ? "text-amber-600" : "text-green-600"}`} />
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function ActionAlerts({ alerts }: { alerts: Alert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          Alertes & actions
          <span className="ml-auto text-xs font-bold rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            {alerts.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AlertList alerts={alerts} />
      </CardContent>
    </Card>
  );
}

export function PerformanceAlerts({ alerts }: { alerts: Alert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <TrendingUp className="size-3" />
          Performance du jour
          <span className="ml-auto text-xs font-bold rounded-full bg-green-100 text-green-700 px-2 py-0.5">
            {alerts.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AlertList alerts={alerts} />
      </CardContent>
    </Card>
  );
}
