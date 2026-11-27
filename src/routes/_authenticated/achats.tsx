import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { ShoppingCart, Search, TrendingUp, Package } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatDate, formatXOF } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/achats")({
  component: AchatsPage,
  head: () => ({ meta: [{ title: "Achats — INDUS-ERP" },
      { name: "description", content: "Achats — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Achats — INDUS-ERP" },
      { property: "og:description", content: "Achats — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const ACHATS_PAGE_SIZE = 20;

function AchatsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ACHATS_PAGE_SIZE);

  const { data: lotsData = { data: [], count: 0 } } = useQuery({
    queryKey: ["lots", "achats", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("lots")
        .select("id, lot_number, reception_date, quantity, unit_purchase_price, products(name, sku), suppliers(name)", { count: "exact", head: false })
        .order("reception_date", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  const lots = lotsData.data;
  const totalLots = lotsData.count;

  // Debounce : évite de re-filtrer la liste à chaque frappe clavier
  const debouncedQ = useDebounce(q, 200);

  const filtered = useMemo(() =>
    lots.filter((l: any) => {
      if (!debouncedQ.trim()) return true;
      const s = debouncedQ.toLowerCase();
      return (
        l.lot_number?.toLowerCase().includes(s) ||
        l.products?.name?.toLowerCase().includes(s) ||
        l.products?.sku?.toLowerCase().includes(s) ||
        l.suppliers?.name?.toLowerCase().includes(s)
      );
    }),
  [lots, debouncedQ]);

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, l: any) => sum + Number(l.quantity) * Number(l.unit_purchase_price), 0);
    const totalQty = filtered.reduce((sum, l: any) => sum + Number(l.quantity), 0);
    return { count: filtered.length, total, totalQty };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Achats</h1>
        <p className="mt-1 text-sm text-muted-foreground">Historique des réceptions fournisseurs (basé sur les lots).</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={ShoppingCart} label="Réceptions" value={String(stats.count)} />
        <StatCard icon={Package} label="Unités achetées" value={stats.totalQty.toLocaleString("fr-FR")} />
        <StatCard icon={TrendingUp} label="Montant total" value={formatXOF(stats.total)} />
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (produit, lot, fournisseur)…" className="pl-9" />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>N° lot</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead className="text-right">PU achat</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                Aucun achat. Créez un lot depuis la page Lots pour enregistrer une réception.
              </TableCell></TableRow>
            )}
            {filtered.map((l: any) => (
              <AchatRow key={l.id} lot={l} />
            ))}
          </TableBody>
        </Table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalLots}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

const AchatRow = memo(function AchatRow({ lot }: { lot: any }) {
  const amount = Number(lot.quantity) * Number(lot.unit_purchase_price);
  return (
    <TableRow key={lot.id}>
      <TableCell className="text-sm">{formatDate(lot.reception_date)}</TableCell>
      <TableCell className="font-mono text-xs">{lot.lot_number}</TableCell>
      <TableCell>{lot.products?.name} <span className="text-xs text-muted-foreground">({lot.products?.sku})</span></TableCell>
      <TableCell className="text-sm">{lot.suppliers?.name ?? "—"}</TableCell>
      <TableCell className="text-right">{Number(lot.quantity)}</TableCell>
      <TableCell className="text-right">{formatXOF(Number(lot.unit_purchase_price))}</TableCell>
      <TableCell className="text-right font-semibold">{formatXOF(amount)}</TableCell>
    </TableRow>
  );
});

const StatCard = memo(function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
        <Icon className="size-4 text-accent" /> {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
});
