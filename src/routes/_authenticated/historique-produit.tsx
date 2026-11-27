import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Boxes, Receipt, ArrowDownLeft, ArrowUpRight, ClipboardCheck, Tag, History, FileDown,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SerialHistoryDialog, SERIAL_STATUS_LABEL } from "@/components/serial-history-dialog";
import { formatDate, formatDateTime, formatXOF } from "@/lib/format";
import { exportToCsv } from "@/lib/csv";
import { exportTablePdf } from "@/lib/pdf-table";

export const Route = createFileRoute("/_authenticated/historique-produit")({
  component: ProductTimelinePage,
  head: () => ({
    meta: [
      { title: "Historique produit — Timeline unifiée | INDUS-ERP" },
      { name: "description", content: "Timeline unifiée d'un produit : achats, ventes, mouvements de stock, inventaires et numéros de série." },
      { property: "og:title", content: "Historique produit — Timeline unifiée" },
      { property: "og:description", content: "Traçabilité complète d'un produit du fournisseur au client." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type EventKind = "achat" | "vente" | "entree" | "sortie" | "inventaire" | "serie";

const KIND_META: Record<EventKind, { label: string; icon: typeof Boxes; tone: string }> = {
  achat: { label: "Achat / Lot", icon: Boxes, tone: "bg-indigo-500/10 text-indigo-600" },
  vente: { label: "Vente", icon: Receipt, tone: "bg-blue-500/10 text-blue-600" },
  entree: { label: "Entrée stock", icon: ArrowDownLeft, tone: "bg-emerald-500/10 text-emerald-600" },
  sortie: { label: "Sortie stock", icon: ArrowUpRight, tone: "bg-orange-500/10 text-orange-600" },
  inventaire: { label: "Inventaire", icon: ClipboardCheck, tone: "bg-violet-500/10 text-violet-600" },
  serie: { label: "N° série", icon: Tag, tone: "bg-slate-500/10 text-slate-600" },
};

type TimelineEvent = {
  id: string;
  at: string;
  kind: EventKind;
  title: string;
  detail: string;
  amount?: number;
  qty?: number;
  serialId?: string;
};

function ProductTimelinePage() {
  const [productId, setProductId] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | EventKind>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [serialId, setSerialId] = useState<string | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["products", "min"],
    queryFn: async () =>
      (await supabase.from("products").select("id, name, sku").order("name")).data ?? [],
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["product-timeline", productId],
    enabled: !!productId,
    queryFn: async (): Promise<TimelineEvent[]> => {
      const out: TimelineEvent[] = [];

      const [lots, saleItems, movements, counts, serials] = await Promise.all([
        (supabase as any).from("lots")
          .select("id, lot_number, reception_date, quantity, unit_purchase_price, suppliers:supplier_id(name)")
          .eq("product_id", productId),
        (supabase as any).from("sale_items")
          .select("id, quantity, unit_price, lot_id, sales:sale_id(number, created_at, client_name, payment_mode)")
          .eq("product_id", productId),
        (supabase as any).from("stock_movements")
          .select("id, type, quantity, unit_price, reason, created_at, lots:lot_id(lot_number)")
          .eq("product_id", productId),
        (supabase as any).from("inventory_counts")
          .select("id, counted_quantity, created_at, lots:lot_id(lot_number, quantity, product_id), inventory_sessions:session_id(name, status)")
          .order("created_at", { ascending: false }),
        (supabase as any).from("serial_numbers")
          .select("id, serial, status, created_at, updated_at, lots:lot_id(lot_number), clients:client_id(name)")
          .eq("product_id", productId),
      ]);

      for (const l of lots.data ?? []) {
        out.push({
          id: `lot-${l.id}`,
          at: l.reception_date,
          kind: "achat",
          title: `Lot ${l.lot_number} reçu`,
          detail: `${l.suppliers?.name ?? "Fournisseur inconnu"} — ${l.quantity} unité(s) à ${formatXOF(Number(l.unit_purchase_price ?? 0))}`,
          amount: Number(l.quantity) * Number(l.unit_purchase_price ?? 0),
          qty: Number(l.quantity),
        });
      }

      for (const si of saleItems.data ?? []) {
        out.push({
          id: `si-${si.id}`,
          at: si.sales?.created_at ?? new Date().toISOString(),
          kind: "vente",
          title: `Vente ${si.sales?.number ?? ""}`,
          detail: `${si.sales?.client_name ?? "Client comptoir"} — ${si.quantity} × ${formatXOF(Number(si.unit_price ?? 0))} (${si.sales?.payment_mode ?? "—"})`,
          amount: Number(si.quantity) * Number(si.unit_price ?? 0),
          qty: -Number(si.quantity),
        });
      }

      for (const m of movements.data ?? []) {
        const kind: EventKind = m.type === "entree" ? "entree" : m.type === "sortie" ? "sortie" : "inventaire";
        out.push({
          id: `mv-${m.id}`,
          at: m.created_at,
          kind,
          title: `${KIND_META[kind].label}${m.lots?.lot_number ? ` — lot ${m.lots.lot_number}` : ""}`,
          detail: m.reason ?? "Sans motif",
          amount: m.unit_price ? Number(m.quantity) * Number(m.unit_price) : undefined,
          qty: kind === "sortie" ? -Number(m.quantity) : Number(m.quantity),
        });
      }

      for (const c of counts.data ?? []) {
        if (c.lots?.product_id !== productId) continue;
        const ecart = Number(c.counted_quantity) - Number(c.lots?.quantity ?? 0);
        out.push({
          id: `ic-${c.id}`,
          at: c.created_at,
          kind: "inventaire",
          title: `Comptage — ${c.inventory_sessions?.name ?? "session"}`,
          detail: `Lot ${c.lots?.lot_number ?? "—"} : compté ${c.counted_quantity}, théorique ${c.lots?.quantity ?? 0} (écart ${ecart >= 0 ? "+" : ""}${ecart})`,
          qty: ecart,
        });
      }

      for (const s of serials.data ?? []) {
        out.push({
          id: `sn-${s.id}`,
          at: s.updated_at ?? s.created_at,
          kind: "serie",
          title: `N° série ${s.serial} — ${SERIAL_STATUS_LABEL[s.status] ?? s.status}`,
          detail: `${s.lots?.lot_number ? `Lot ${s.lots.lot_number}` : ""}${s.clients?.name ? ` · ${s.clients.name}` : ""}`,
          serialId: s.id,
        });
      }

      return out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    },
  });

  const filtered = events.filter((e) => {
    if (kindFilter !== "all" && e.kind !== kindFilter) return false;
    const t = new Date(e.at).getTime();
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to).getTime() + 86_400_000) return false;
    return true;
  });

  const product = products.find((p: any) => p.id === productId);
  const bought = filtered.filter((e) => e.kind === "achat").reduce((s, e) => s + (e.qty ?? 0), 0);
  const sold = filtered.filter((e) => e.kind === "vente").reduce((s, e) => s + Math.abs(e.qty ?? 0), 0);
  const revenue = filtered.filter((e) => e.kind === "vente").reduce((s, e) => s + (e.amount ?? 0), 0);

  const headers = [
    { key: "date" as const, label: "Date" },
    { key: "type" as const, label: "Type" },
    { key: "title" as const, label: "Événement" },
    { key: "detail" as const, label: "Détail" },
    { key: "qty" as const, label: "Qté" },
    { key: "amount" as const, label: "Montant" },
  ];
  const rows = filtered.map((e) => ({
    date: formatDateTime(e.at),
    type: KIND_META[e.kind].label,
    title: e.title,
    detail: e.detail,
    qty: e.qty != null ? String(e.qty) : "",
    amount: e.amount != null ? formatXOF(e.amount) : "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historique produit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Timeline unifiée : achats, ventes, mouvements de stock, inventaires et numéros de série.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
          <Label className="text-xs">Produit</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger><SelectValue placeholder="Choisir un produit" /></SelectTrigger>
            <SelectContent>
              {products.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Type d'événement</Label>
          <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as "all" | EventKind)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {(Object.keys(KIND_META) as EventKind[]).map((k) => (
                <SelectItem key={k} value={k}>{KIND_META[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Du</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Au</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {!productId && (
        <div className="rounded-lg border bg-card py-16 text-center text-sm text-muted-foreground">
          <History className="mx-auto mb-2 size-6 opacity-50" />
          Sélectionnez un produit pour afficher sa timeline complète.
        </div>
      )}

      {productId && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Kpi label="Événements" value={String(filtered.length)} />
            <Kpi label="Unités achetées" value={String(bought)} />
            <Kpi label="Unités vendues" value={String(sold)} />
            <Kpi label="Chiffre d'affaires" value={formatXOF(revenue)} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{product?.name}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"
                onClick={() => exportToCsv(headers, rows, `historique-${product?.sku ?? "produit"}.csv`)}>
                <FileDown className="mr-1 size-4" /> CSV
              </Button>
              <Button variant="outline" size="sm"
                onClick={() => exportTablePdf({
                  title: `Historique — ${product?.name ?? ""}`,
                  headers: headers.map((h) => h.label),
                  rows: rows.map((r: Record<string, string>) => headers.map((h) => r[h.key] ?? "")),
                  filename: `historique-${product?.sku ?? "produit"}.pdf`,
                  landscape: true,
                })}>
                <FileDown className="mr-1 size-4" /> PDF
              </Button>
            </div>
          </div>

          <ol className="space-y-3 border-l pl-5">
            {isLoading && <li className="py-8 text-center text-sm text-muted-foreground">Chargement…</li>}
            {!isLoading && filtered.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">Aucun événement sur la période.</li>
            )}
            {filtered.map((e) => {
              const meta = KIND_META[e.kind];
              return (
                <li key={e.id} className="relative rounded-lg border bg-card p-3">
                  <span className="absolute -left-[30px] top-4 flex size-5 items-center justify-center rounded-full border bg-background">
                    <meta.icon className="size-3 text-primary" />
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] ${meta.tone}`}>{meta.label}</Badge>
                      <span className="text-sm font-medium">{e.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {e.qty != null && (
                        <span className={e.qty < 0 ? "text-destructive" : "text-emerald-600"}>
                          {e.qty > 0 ? "+" : ""}{e.qty}
                        </span>
                      )}
                      {e.amount != null && <span className="font-medium">{formatXOF(e.amount)}</span>}
                      <span className="text-muted-foreground">{formatDate(e.at)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{e.detail}</p>
                  {e.serialId && (
                    <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs"
                      onClick={() => setSerialId(e.serialId!)}>
                      Voir l'historique de la série
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}

      <SerialHistoryDialog
        serialId={serialId}
        open={!!serialId}
        onOpenChange={(o) => !o && setSerialId(null)}
      />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
