import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BarChart3, Download, TrendingUp, TrendingDown, Package } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notify";
import { formatXOF, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/rapports")({
  component: RapportsPage,
  head: () => ({ meta: [{ title: "Rapports — INDUS-ERP" },
      { name: "description", content: "Rapports — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Rapports — INDUS-ERP" },
      { property: "og:description", content: "Rapports — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

function RapportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + "01";
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);

  const { data: sales = [] } = useQuery({
    queryKey: ["report-sales", from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, sale_items(*, products(name, sku))")
        .gte("created_at", from)
        .lte("created_at", to + "T23:59:59");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["report-expenses", from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses" as any)
        .select("*")
        .gte("expense_date", from)
        .lte("expense_date", to);
      if (error) return [];
      return data as any[];
    },
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["report-movements", from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, products(name)")
        .gte("created_at", from)
        .lte("created_at", to + "T23:59:59");
      if (error) throw error;
      return data as any[];
    },
  });

  const stats = useMemo(() => {
    const ca = sales.reduce((s: number, x: any) => s + Number(x.total ?? 0), 0);
    const nb = sales.length;
    const dep = expenses.reduce((s: number, x: any) => s + Number(x.amount ?? 0), 0);
    const cogs = sales.reduce((s: number, x: any) => {
      return s + (x.sale_items ?? []).reduce((ss: number, it: any) => ss + Number(it.unit_price ?? 0) * Number(it.quantity ?? 0) * 0.7, 0);
    }, 0);
    return { ca, nb, dep, marge: ca - cogs - dep };
  }, [sales, expenses]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; ca: number }>();
    sales.forEach((s: any) => {
      (s.sale_items ?? []).forEach((it: any) => {
        const key = it.product_id;
        const cur = map.get(key) ?? { name: it.products?.name ?? "—", qty: 0, ca: 0 };
        cur.qty += Number(it.quantity);
        cur.ca += Number(it.unit_price) * Number(it.quantity);
        map.set(key, cur);
      });
    });
    return [...map.values()].sort((a, b) => b.ca - a.ca).slice(0, 10);
  }, [sales]);

  const salesByDay = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach((s: any) => {
      const d = s.created_at.slice(0, 10);
      map.set(d, (map.get(d) ?? 0) + Number(s.total));
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [sales]);
  const maxDay = Math.max(1, ...salesByDay.map(([, v]) => v));

  async function exportPDF() {
    // jspdf + autotable sont volumineux : import dynamique pour ne pas
    // alourdir le bundle initial de la route Rapports.
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Rapport d'activité — INDUS-ERP", 14, 18);
    doc.setFontSize(10);
    doc.text(`Période : ${formatDate(from)} — ${formatDate(to)}`, 14, 26);

    autoTable(doc, {
      startY: 34,
      head: [["Indicateur", "Valeur"]],
      body: [
        ["Chiffre d'affaires", formatXOF(stats.ca)],
        ["Nombre de ventes", String(stats.nb)],
        ["Dépenses", formatXOF(stats.dep)],
        ["Marge estimée", formatXOF(stats.marge)],
      ],
    });

    if (topProducts.length) {
      autoTable(doc, {
        head: [["Top produit", "Qté", "CA"]],
        body: topProducts.map((p) => [p.name, String(p.qty), formatXOF(p.ca)]),
      });
    }

    doc.save(`rapport-${from}-${to}.pdf`);
    notify.success("Rapport PDF exporté");
  }

  async function exportCSV() {
    const rows = [
      ["Date", "Numéro", "Client", "Total", "Paiement"],
      ...sales.map((s: any) => [
        s.created_at.slice(0, 10), s.sale_number, s.client_name ?? "", String(s.total), s.payment_method ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ventes-${from}-${to}.csv`; a.click();
    URL.revokeObjectURL(url);
    notify.success("Export CSV téléchargé");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rapports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Analyse commerciale et financière.</p>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <Label className="text-xs">Du</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          </div>
          <div>
            <Label className="text-xs">Au</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          </div>
          <Button variant="outline" onClick={exportCSV}><Download className="mr-1 size-4" /> CSV</Button>
          <Button onClick={exportPDF}><Download className="mr-1 size-4" /> PDF</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Chiffre d'affaires" value={formatXOF(stats.ca)} icon={TrendingUp} />
        <KPI label="Ventes" value={String(stats.nb)} icon={BarChart3} />
        <KPI label="Dépenses" value={formatXOF(stats.dep)} icon={TrendingDown} />
        <KPI label="Marge estimée" value={formatXOF(stats.marge)} icon={Package} highlight />
      </div>

      <Tabs defaultValue="ventes">
        <TabsList>
          <TabsTrigger value="ventes">Ventes par jour</TabsTrigger>
          <TabsTrigger value="top">Top produits</TabsTrigger>
          <TabsTrigger value="mouvements">Mouvements de stock</TabsTrigger>
        </TabsList>

        <TabsContent value="ventes" className="rounded-lg border border-border bg-card p-4">
          {salesByDay.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucune vente sur la période.</p>}
          <div className="space-y-2">
            {salesByDay.map(([d, v]) => (
              <div key={d} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs">{formatDate(d)}</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(v / maxDay) * 100}%` }} />
                  </div>
                </div>
                <span className="w-32 text-right text-xs font-semibold tabular-nums">{formatXOF(v)}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="top" className="rounded-lg border border-border bg-card p-4">
          {topProducts.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucune donnée.</p>}
          <ul className="divide-y divide-border">
            {topProducts.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">{i + 1}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                </span>
                <span className="text-sm text-muted-foreground">{p.qty} unité(s)</span>
                <span className="text-sm font-semibold tabular-nums">{formatXOF(p.ca)}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="mouvements" className="rounded-lg border border-border bg-card p-4">
          {movements.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucun mouvement.</p>}
          <ul className="divide-y divide-border">
            {movements.slice(0, 30).map((m: any) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-muted-foreground">{formatDate(m.created_at)}</span>
                <span className="flex-1 truncate font-medium">{m.products?.name ?? "—"}</span>
                <span className={`text-xs font-semibold uppercase ${m.type === "entree" ? "text-emerald-500" : "text-destructive"}`}>
                  {m.type === "entree" ? "+" : "−"} {m.quantity}
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPI({ label, value, icon: Icon, highlight }: { label: string; value: string; icon: any; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-accent/40 bg-accent/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
