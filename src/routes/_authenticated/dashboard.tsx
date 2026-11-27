import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  DollarSign,
  Receipt,
  Wallet,
  Warehouse,
  ArrowUpRight,
  CircleAlert,
  CircleOff,
  ArrowUp,
  ArrowDown,
  Calendar,
  FileDown,
  Crown,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStockAlerts, type StockAlert } from "@/hooks/use-stock-alerts";
import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/format";
import { Sparkline, TrendDot } from "@/components/ui/sparkline";
import { generateDashboardPDF } from "@/lib/dashboard-pdf";
import { useRealtimeSubscription, LiveBadge } from "@/hooks/use-realtime";
import { useWarehouseFilter } from "@/lib/warehouse-filter";

import { SmartAlertsCard } from "@/components/smart-alerts-card";
import { GettingStartedCard } from "@/components/getting-started-card";

// recharts est volumineux (~100 KB gzippé) : le graphique est un composant isolé
// chargé à la demande (code splitting), retiré du bundle initial de la route.
const DashboardChart = lazy(() =>
  import("@/components/dashboard-chart").then((m) => ({ default: m.DashboardChart })),
);

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Tableau de bord — INDUS-ERP" },
      { name: "description", content: "Tableau de bord — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Tableau de bord — INDUS-ERP" },
      { property: "og:description", content: "Tableau de bord — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }],
  }),
});

interface DashboardKpis {
  caJour: number;
  caMois: number;
  caMoisPrecedent: number;
  caMoisYoY: number;
  ventesJour: number;
  ventesMois: number;
  ventesMoisYoY: number;
  depensesMois: number;
  depensesMoisYoY: number;
  nbProduits: number;
  valeurStock: number;
}

interface ChartPoint {
  jour: string;
  ca: number;
  caYoY: number;
}

interface RecentSale {
  number: string;
  client_name: string | null;
  total_ttc: number;
  created_at: string;
  payment_mode: string;
}

type ComparisonMode = "mom" | "yoy";

function DashboardPage() {
  const qc = useQueryClient();
  const { selectedWarehouseId } = useWarehouseFilter();
  const { data: alerts = [], isLoading: alertsLoading } = useStockAlerts();
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("mom");

  // Souscriptions temps réel
  const rtSales = useRealtimeSubscription(
    { table: "sales" },
    {
      onPayload: () => {
        qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
        qc.invalidateQueries({ queryKey: ["dashboard-chart-yoy"] });
        qc.invalidateQueries({ queryKey: ["dashboard-recent-sales"] });
        qc.invalidateQueries({ queryKey: ["dashboard-sparklines"] });
        qc.invalidateQueries({ queryKey: ["dashboard-top-products"] });
      },
    },
  );
  const rtStock = useRealtimeSubscription(
    { table: "stock_movements" },
    {
      onPayload: () => {
        qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
        qc.invalidateQueries({ queryKey: ["stock-alerts"] });
      },
    },
  );

  const { data: kpis, isLoading: kpisLoading } = useQuery<DashboardKpis>({
    queryKey: ["dashboard-kpis", selectedWarehouseId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStartStr = monthStart.toISOString().slice(0, 10);

      // Mois dernier
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStartStr = lastMonthStart.toISOString().slice(0, 10);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const lastMonthEndStr = lastMonthEnd.toISOString().slice(0, 10);

      // Même mois l'an dernier
      const yoyStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      const yoyStartStr = yoyStart.toISOString().slice(0, 10);
      const yoyEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);
      const yoyEndStr = yoyEnd.toISOString().slice(0, 10);

      let productCountQ = supabase.from("product_stock_levels" as any).select("product_id", { count: "exact", head: true });
      if (selectedWarehouseId && selectedWarehouseId !== "all") {
        productCountQ = productCountQ.eq("warehouse_id", selectedWarehouseId);
      }

      let stockValueQ;
      if (selectedWarehouseId && selectedWarehouseId !== "all") {
        stockValueQ = supabase.from("lot_stock_by_warehouse").select("current_quantity, unit_purchase_price").eq("warehouse_id", selectedWarehouseId);
      } else {
        stockValueQ = supabase.from("lot_stock").select("current_quantity, unit_purchase_price");
      }

      const [
        caJourRes, caMoisRes, caMoisPrevRes, caMoisYoYRes,
        countJourRes, countMoisRes, countMoisYoYRes,
        depensesRes, depensesYoYRes,
        stockValueRes, productCountRes,
      ] = await Promise.all([
        supabase.from("sales").select("total_ttc").gte("created_at", today),
        supabase.from("sales").select("total_ttc").gte("created_at", monthStartStr),
        supabase.from("sales").select("total_ttc")
          .gte("created_at", lastMonthStartStr).lte("created_at", lastMonthEndStr),
        supabase.from("sales").select("total_ttc")
          .gte("created_at", yoyStartStr).lte("created_at", yoyEndStr),
        supabase.from("sales").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("sales").select("*", { count: "exact", head: true }).gte("created_at", monthStartStr),
        supabase.from("sales").select("*", { count: "exact", head: true })
          .gte("created_at", yoyStartStr).lte("created_at", yoyEndStr),
        supabase.from("expenses").select("amount").gte("expense_date", monthStartStr),
        supabase.from("expenses").select("amount")
          .gte("expense_date", yoyStartStr).lte("expense_date", yoyEndStr),
        stockValueQ,
        productCountQ,
      ]);

      const sum = (rows: { total_ttc: number }[] | null) =>
        (rows ?? []).reduce((acc, r) => acc + Number(r.total_ttc), 0);
      const sumAmount = (rows: { amount: number }[] | null) =>
        (rows ?? []).reduce((acc, r) => acc + Number(r.amount), 0);

      const stockRows = (stockValueRes.data ?? []) as any[];
      const valeurStock = stockRows.reduce((acc, r) => acc + Number(r.current_quantity ?? 0) * Number(r.unit_purchase_price ?? 0), 0);

      return {
        caJour: sum(caJourRes.data),
        caMois: sum(caMoisRes.data),
        caMoisPrecedent: sum(caMoisPrevRes.data),
        caMoisYoY: sum(caMoisYoYRes.data),
        ventesJour: countJourRes.count ?? 0,
        ventesMois: countMoisRes.count ?? 0,
        ventesMoisYoY: countMoisYoYRes.count ?? 0,
        depensesMois: sumAmount(depensesRes.data),
        depensesMoisYoY: sumAmount(depensesYoYRes.data),
        nbProduits: productCountRes.count ?? 0,
        valeurStock,
      };
    },
    staleTime: 30_000,
    refetchInterval: 120_000,
  });

  const { data: chartData = [] } = useQuery<ChartPoint[]>({
    queryKey: ["dashboard-chart-yoy"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const start = thirtyDaysAgo.toISOString();

      // Période équivalente l'an dernier
      const yoyStart = new Date(thirtyDaysAgo);
      yoyStart.setFullYear(yoyStart.getFullYear() - 1);
      const yoyEnd = new Date();
      yoyEnd.setFullYear(yoyEnd.getFullYear() - 1);

      const [{ data: curData }, { data: yoyData }] = await Promise.all([
        supabase.from("sales").select("created_at, total_ttc")
          .gte("created_at", start).order("created_at", { ascending: true }),
        supabase.from("sales").select("created_at, total_ttc")
          .gte("created_at", yoyStart.toISOString())
          .lte("created_at", yoyEnd.toISOString())
          .order("created_at", { ascending: true }),
      ]);

      const aggregateByDay = (rows: { created_at: string; total_ttc: number }[] | null) => {
        const map = new Map<string, number>();
        for (const row of rows ?? []) {
          const day = row.created_at.slice(0, 10);
          map.set(day, (map.get(day) ?? 0) + Number(row.total_ttc));
        }
        return map;
      };

      const curMap = aggregateByDay(curData);
      const yoyMap = aggregateByDay(yoyData);

      // Générer tous les jours
      const points: ChartPoint[] = [];
      const d = new Date(thirtyDaysAgo);
      const today = new Date();
      while (d <= today) {
        const key = d.toISOString().slice(0, 10);
        const dayNum = String(d.getDate()).padStart(2, "0");

        // Clé pour l'année dernière
        const yoyKey = `${d.getFullYear() - 1}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        points.push({
          jour: dayNum,
          ca: Math.round((curMap.get(key) ?? 0) / 1000),
          caYoY: Math.round((yoyMap.get(yoyKey) ?? 0) / 1000),
        });
        d.setDate(d.getDate() + 1);
      }

      return points;
    },
    staleTime: 60_000,
  });

  const { data: recentSales = [] } = useQuery<RecentSale[]>({
    queryKey: ["dashboard-recent-sales"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sales")
        .select("number, client_name, total_ttc, created_at, payment_mode")
        .order("created_at", { ascending: false })
        .limit(8);
      return (data ?? []) as RecentSale[];
    },
    staleTime: 30_000,
  });

  // Sparkline data: daily aggregates for the last 7 days
  const { data: sparkData } = useQuery<{
    ca: number[];
    ventes: number[];
    depenses: number[];
  }>({
    queryKey: ["dashboard-sparklines"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const start = sevenDaysAgo.toISOString();

      const [{ data: salesData }, { data: expensesData }] = await Promise.all([
        supabase.from("sales").select("created_at, total_ttc")
          .gte("created_at", start).order("created_at", { ascending: true }),
        supabase.from("expenses").select("expense_date, amount")
          .gte("expense_date", start.slice(0, 10)).order("expense_date", { ascending: true }),
      ]);

      const days: string[] = [];
      const caByDay = new Map<string, number>();
      const salesCountByDay = new Map<string, number>();
      const expensesByDay = new Map<string, number>();

      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        days.push(key);
        caByDay.set(key, 0);
        salesCountByDay.set(key, 0);
        expensesByDay.set(key, 0);
      }

      for (const row of salesData ?? []) {
        const day = row.created_at.slice(0, 10);
        if (caByDay.has(day)) {
          caByDay.set(day, (caByDay.get(day) ?? 0) + Number(row.total_ttc));
          salesCountByDay.set(day, (salesCountByDay.get(day) ?? 0) + 1);
        }
      }

      for (const row of expensesData ?? []) {
        const day = row.expense_date.slice(0, 10);
        if (expensesByDay.has(day)) {
          expensesByDay.set(day, (expensesByDay.get(day) ?? 0) + Number(row.amount));
        }
      }

      return {
        ca: days.map((d) => caByDay.get(d) ?? 0),
        ventes: days.map((d) => salesCountByDay.get(d) ?? 0),
        depenses: days.map((d) => expensesByDay.get(d) ?? 0),
      };
    },
    staleTime: 60_000,
  });

  const handleExportPDF = async () => {
    if (!kpis) return;
    await generateDashboardPDF({
      dateLabel: new Date().toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      }),
      kpis: kpiDefs.map((k) => ({
        label: k.label,
        value: k.value === "..." ? "0" : k.value,
        unit: k.unit,
      })),
      alerts: alerts.map((a) => ({
        product_name: a.product_name,
        sku: a.sku,
        current_stock: Number(a.current_stock),
        stock_min: a.stock_min,
        status: a.status,
      })),
      recentSales: recentSales.map((s) => ({
        number: s.number,
        client_name: s.client_name,
        total_ttc: s.total_ttc,
        created_at: s.created_at,
        payment_mode: s.payment_mode,
      })),
      chartData: chartData.map((d) => ({ jour: d.jour, ca: d.ca, caYoY: d.caYoY })),
      caMois: kpis.caMois,
      beneficeNet,
      margeBrute,
    });
  };

  const alertsCount = alerts.length;
  const ruptureCount = alerts.filter((a: StockAlert) => a.status === "rupture").length;

  const beneficeNet = kpis ? kpis.caMois - kpis.depensesMois : 0;
  const margeBrute = kpis && kpis.caMois > 0
    ? Math.round((beneficeNet / kpis.caMois) * 100)
    : 0;

  // Helper pour calculer le delta selon le mode de comparaison
  const deltaPct = (current: number, previous: number): string | null => {
    if (previous <= 0) return null;
    const pct = ((current - previous) / previous) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  // Tendances selon le mode
  const monthComparison = comparisonMode === "mom"
    ? { value: kpis?.caMoisPrecedent ?? 0, label: "mois dernier" }
    : { value: kpis?.caMoisYoY ?? 0, label: "an dernier" };

  const caMoisPct = deltaPct(kpis?.caMois ?? 0, monthComparison.value);
  const caMoisTrend: "up" | "down" | "neutral" = caMoisPct
    ? (caMoisPct.startsWith("+") ? "up" : "down")
    : "neutral";

  const ventesMoisPct = comparisonMode === "yoy"
    ? deltaPct(kpis?.ventesMois ?? 0, kpis?.ventesMoisYoY ?? 0)
    : null;

  const caJourTrend: "up" | "down" | "neutral" = kpis && kpis.caJour > 0 ? "up" : "neutral";

  // Préparer les données sparkline
  const caSpark = sparkData?.ca ?? [];
  const ventesSpark = sparkData?.ventes ?? [];
  const depensesSpark = sparkData?.depenses ?? [];
  const beneficeSpark = caSpark.map((v, i) => v - (depensesSpark[i] ?? 0));

  const kpiDefs: Array<{
    label: string; value: string; unit?: string; delta?: string;
    trend?: "up" | "down" | "neutral"; icon: LucideIcon; accent?: boolean;
    sparklineData: number[];
  }> = [
    {
      label: "CA du jour",
      value: kpisLoading ? "..." : formatXOF(kpis!.caJour).replace(" F", ""),
      unit: "FC",
      delta: kpis && kpis.ventesJour > 0
        ? `${kpis.ventesJour} vente${kpis.ventesJour > 1 ? "s" : ""}`
        : undefined,
      trend: caJourTrend,
      icon: DollarSign,
      sparklineData: caSpark,
    },
    {
      label: "CA du mois",
      value: kpisLoading ? "..." : formatXOF(kpis!.caMois).replace(" F", ""),
      unit: "FC",
      delta: caMoisPct ? `${caMoisPct} vs ${monthComparison.label}` : undefined,
      trend: caMoisTrend,
      icon: TrendingUp,
      sparklineData: caSpark,
    },
    {
      label: "Ventes",
      value: kpisLoading ? "..." : String(kpis!.ventesJour),
      unit: "jour",
      delta: comparisonMode === "yoy" && ventesMoisPct
        ? `${ventesMoisPct} vs an dernier`
        : kpis ? `${kpis.ventesMois} ce mois` : undefined,
      trend: "neutral",
      icon: Receipt,
      sparklineData: ventesSpark,
    },
    {
      label: "Dépenses (mois)",
      value: kpisLoading ? "..." : formatXOF(kpis!.depensesMois).replace(" F", ""),
      unit: "FC",
      delta: kpis && kpis.depensesMois > 0
        ? `${((kpis.depensesMois / (kpis.caMois || 1)) * 100).toFixed(1)}% du CA`
        : "0% du CA",
      trend: "neutral",
      icon: Wallet,
      sparklineData: depensesSpark,
    },
    {
      label: "Bénéfice net",
      value: kpisLoading ? "..." : formatXOF(Math.max(beneficeNet, 0)).replace(" F", ""),
      unit: "FC",
      delta: `Marge ${margeBrute}%`,
      trend: beneficeNet > 0 ? "up" : "down",
      icon: TrendingUp,
      accent: true,
      sparklineData: beneficeSpark,
    },
    {
      label: "Valeur stock",
      value: kpisLoading ? "..." : formatXOF(kpis!.valeurStock).replace(" F", ""),
      unit: "FC",
      delta: kpis ? `${kpis.nbProduits} réf. en stock` : "...",
      trend: "neutral",
      icon: Warehouse,
      sparklineData: [],
    },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Vue d'ensemble
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Tableau de bord opérationnel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge status={rtSales.status} />
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              onClick={() => setComparisonMode("mom")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
                comparisonMode === "mom"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              vs Mois préc.
            </button>
            <button
              onClick={() => setComparisonMode("yoy")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
                comparisonMode === "yoy"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="mr-1 inline size-3" />
              vs N-1
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={kpisLoading || !kpis}
            title="Exporter le dashboard en PDF"
          >
            <FileDown className="mr-1 size-4" />
            PDF
          </Button>
          <Link to="/ventes">
            <Button>
              <ArrowUpRight className="mr-1 size-4" />
              Nouvelle vente
            </Button>
          </Link>
        </div>
      </div>

      {/* Guidage des nouveaux utilisateurs (installation vide) */}
      {kpis && kpis.nbProduits === 0 && kpis.ventesMois === 0 && <GettingStartedCard />}

      {/* KPIs temps réel */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpiDefs.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Notifications intelligentes par entrepôt */}
      <SmartAlertsCard />

      {/* Graphique + Alertes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Évolution du chiffre d'affaires</h2>
              <p className="text-xs text-muted-foreground">30 derniers jours (en milliers de FC)</p>
            </div>
            {kpis && (
              <div className="flex items-center gap-3">
                {comparisonMode === "yoy" && (
                  <span className="text-[10px] text-muted-foreground">
                    — N-1 —
                  </span>
                )}
                <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                  {kpis.ventesJour} vente{kpis.ventesJour > 1 ? "s" : ""} aujourd'hui
                </span>
              </div>
            )}
          </div>
          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Aucune donnée pour les 30 derniers jours
              </div>
            ) : (
              <Suspense fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Chargement du graphique…
                </div>
              }>
                <DashboardChart data={chartData} showYoY={comparisonMode === "yoy"} />
              </Suspense>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`size-4 ${ruptureCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <h2 className="text-sm font-semibold text-foreground">Alertes stock</h2>
            </div>
            {!alertsLoading && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                alertsCount > 0
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-success/10 text-success"
              }`}>
                {alertsCount > 0 ? alertsCount : "OK"}
              </span>
            )}
          </div>
          {alertsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="size-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <CircleOff className="size-6 text-success" />
              <span>Tous les stocks sont au-dessus des seuils</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {alerts.map((a: StockAlert) => (
                <div key={a.product_id} className="flex items-center justify-between p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{a.product_name}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {a.sku}
                    </p>
                  </div>
                  <div className="ml-3 text-right shrink-0">
                    {a.status === "rupture" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        <CircleOff className="size-3" />
                        Rupture
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning-foreground">
                        <CircleAlert className="size-3" />
                        Faible · {a.current_stock}
                      </span>
                    )}
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      seuil {a.stock_min}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!alertsLoading && alerts.length > 0 && (
            <div className="border-t border-border p-3 text-center">
              <Link to="/produits" className="text-xs font-semibold text-accent hover:underline">
                Gérer les produits
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Meilleurs produits */}
      <TopProducts />

      {/* Dernières transactions */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Dernières transactions</h2>
          </div>
          <Link to="/ventes" className="text-xs font-semibold text-accent hover:underline">
            Toutes les ventes
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2.5">Référence</th>
                <th className="px-4 py-2.5">Client</th>
                <th className="px-4 py-2.5">Heure</th>
                <th className="px-4 py-2.5">Paiement</th>
                <th className="px-4 py-2.5 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Aucune vente enregistrée.
                  </td>
                </tr>
              )}
              {recentSales.map((s) => (
                <tr key={s.number} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">#{s.number}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{s.client_name ?? "Particulier"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatRelativeTime(s.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge mode={s.payment_mode} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                    {formatXOF(Number(s.total_ttc))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, unit, delta, trend, icon: Icon, accent, sparklineData,
}: {
  label: string; value: string; unit?: string; delta?: string;
  trend?: "up" | "down" | "neutral"; icon: LucideIcon; accent?: boolean;
  sparklineData?: number[];
}) {
  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Package;

  const sparkColor =
    trend === "up" ? "oklch(0.65 0.18 142)" :
    trend === "down" ? "oklch(0.58 0.19 25)" :
    "oklch(0.5 0.03 257)";
  const sparkFill =
    trend === "up" ? "oklch(0.65 0.18 142 / 0.10)" :
    trend === "down" ? "oklch(0.58 0.19 25 / 0.10)" :
    "oklch(0.5 0.03 257 / 0.08)";

  return (
    <div
      className={`rounded-lg border p-4 transition relative ${
        accent
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-card hover:border-accent/40"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <Icon className={`size-3.5 ${accent ? "text-accent" : "text-muted-foreground"}`} />
      </div>
      <p className="font-mono text-xl font-bold text-foreground">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>}
      </p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          {delta && (
            <p className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${trendColor}`}>
              <TrendIcon className="size-3" />
              {delta}
            </p>
          )}
          {sparklineData && sparklineData.length >= 2 && (
            <div className="mt-1 flex items-center gap-2">
              <TrendDot data={sparklineData} />
            </div>
          )}
        </div>
        {sparklineData && sparklineData.length >= 2 && (
          <Sparkline
            data={sparklineData}
            width={72}
            height={24}
            strokeColor={sparkColor}
            fillColor={sparkFill}
            strokeWidth={1.5}
          />
        )}
      </div>
    </div>
  );
}

function PaymentBadge({ mode }: { mode: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    especes: { label: "Espèces", cls: "bg-success/10 text-success" },
    mobile_money: { label: "Mobile", cls: "bg-accent/10 text-accent" },
    carte: { label: "Carte", cls: "bg-blue-500/10 text-blue-600" },
    virement: { label: "Virement", cls: "bg-muted text-muted-foreground" },
    cheque: { label: "Chèque", cls: "bg-warning/15 text-warning-foreground" },
  };
  const s = map[mode] ?? { label: mode, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>
      {s.label}
    </span>
  );
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffHours < 48) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/**
 * Bloc Top 5 produits les plus vendus du mois
 */
function TopProducts() {
  const { data: topProducts = [] } = useQuery({
    queryKey: ["dashboard-top-products"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: items } = await supabase
        .from("sale_items")
        .select("product_id, quantity, unit_price, sales!inner(created_at)")
        .gte("sales.created_at", monthStart)
        .order("created_at", { ascending: false })
        .limit(500);

      if (!items) return [];

      // Agréger par produit
      const agg = new Map<string, { qty: number; revenue: number }>();
      for (const item of items as any[]) {
        const id = item.product_id;
        const existing = agg.get(id) ?? { qty: 0, revenue: 0 };
        existing.qty += Number(item.quantity);
        existing.revenue += Number(item.quantity) * Number(item.unit_price);
        agg.set(id, existing);
      }

      // Récupérer les noms des produits
      const ids = [...agg.keys()];
      const { data: products } = await supabase
        .from("products")
        .select("id, name, sku")
        .in("id", ids);

      const productMap = new Map((products ?? []).map((p: any) => [p.id, p]));

      return [...agg.entries()]
        .map(([id, stats]) => ({
          id,
          name: productMap.get(id)?.name ?? "Produit inconnu",
          sku: productMap.get(id)?.sku ?? "",
          quantity: stats.qty,
          revenue: stats.revenue,
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    },
    staleTime: 60_000,
  });

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-foreground">Top 5 produits du mois</h2>
        </div>
        <Link to="/produits" className="text-xs font-semibold text-accent hover:underline">
          Voir tout
        </Link>
      </div>
      {topProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
          <BarChart3 className="mb-2 size-6 text-muted-foreground/40" />
          Aucune donnée pour ce mois.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {topProducts.map((p: any, i: number) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{p.sku}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">{p.quantity} vendu{p.quantity > 1 ? "s" : ""}</p>
                <p className="text-[10px] text-muted-foreground">{formatXOF(p.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
