import { AlertTriangle, CheckCircle, Clock, TrendingUp, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ActionItem = {
  id: string;
  label: string;
  status: "urgent" | "pending" | "ok";
  icon: React.ElementType;
  detail?: string;
};

/** Boards d'action quotidiens : rouge (urgence), ambre (attente), vert (performance) */
export function DailyActionBoard({
  urgent,
  pending,
  performance,
}: {
  urgent: ActionItem[];
  pending: ActionItem[];
  performance: ActionItem[];
}) {
  const renderSection = (title: string, color: "destructive" | "warning" | "default", items: ActionItem[]) => (
    <Card className={`border-l-4 ${color === "destructive" ? "border-red-500" : color === "warning" ? "border-amber-500" : "border-green-500"}`}>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            {items.length === 0 ? (
              <CheckCircle className="size-3 text-green-600" />
            ) : (
              <>
                {color === "destructive" && <AlertTriangle className="size-3" />}
                {color === "warning" && <Clock className="size-3" />}
                {color === "default" && <TrendingUp className="size-3" />}
              </>
            )}
            {title}
          </CardTitle>
          <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${color === "destructive" ? "bg-red-100 text-red-700" : color === "warning" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
            {items.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune action</p>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <item.icon className="size-3" />
                  <span>{item.label}</span>
                  {item.detail && <span className="text-muted-foreground">· {item.detail}</span>}
                </div>
                <Button variant="ghost" size="sm">Voir</Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {renderSection("À faire d'urgence", "destructive", urgent)}
      {renderSection("En attente", "warning", pending)}
      {renderSection("Performance du jour", "default", performance)}
    </div>
  );
}
