import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { Plus, PackageCheck, Trash2, FileDown, X } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/audit";

import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatDate, formatXOF } from "@/lib/format";
import { exportToCsv } from "@/lib/csv";
import { exportTablePdf } from "@/lib/pdf-table";

export const Route = createFileRoute("/_authenticated/commandes-fournisseurs")({
  component: PurchaseOrdersPage,
  head: () => ({
    meta: [
      { title: "Commandes fournisseurs — INDUS-ERP" },
      { name: "description", content: "Création, réception partielle, statut et historique des commandes fournisseurs depuis le stock." },
      { property: "og:title", content: "Commandes fournisseurs — INDUS-ERP" },
      { property: "og:description", content: "Suivi des commandes fournisseurs avec réception partielle et historique." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const PO_PAGE_SIZE = 20;

const STATUSES = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoyee", label: "Envoyée" },
  { value: "partielle", label: "Réception partielle" },
  { value: "receptionnee", label: "Réceptionnée" },
  { value: "annulee", label: "Annulée" },
];
const statusLabel = (v: string) => STATUSES.find((s) => s.value === v)?.label ?? v;

// Helpers purs (utilisés par la ligne mémoïsée OrderRow au niveau module)
const totalOf = (o: any) =>
  (o.purchase_order_items ?? []).reduce(
    (s: number, i: any) => s + Number(i.quantity_ordered) * Number(i.unit_price), 0);
const progressOf = (o: any) => {
  const items = o.purchase_order_items ?? [];
  const ord = items.reduce((s: number, i: any) => s + Number(i.quantity_ordered), 0);
  const rec = items.reduce((s: number, i: any) => s + Number(i.quantity_received), 0);
  return ord > 0 ? Math.round((rec / ord) * 100) : 0;
};

function PurchaseOrdersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [receiving, setReceiving] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PO_PAGE_SIZE);

  const { data: poData = { data: [], count: 0 } } = useQuery({
    queryKey: ["purchase_orders", page, pageSize, statusFilter],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = (supabase as any)
        .from("purchase_orders")
        .select("*, suppliers:supplier_id(name), purchase_order_items(id, product_id, quantity_ordered, quantity_received, unit_price, products:product_id(name, sku))", { count: "exact", head: false });
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  // Ne paginer que l'affichage : toutes les pages restent calculées côté client sur la page courante
  const orders = poData.data;
  const totalOrders = poData.count;

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", "min"],
    queryFn: async () => (await supabase.from("suppliers").select("id, name").order("name")).data ?? [],
    staleTime: 5 * 60_000,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products", "min"],
    queryFn: async () => (await supabase.from("products").select("id, name, sku, purchase_price").order("name")).data ?? [],
    staleTime: 5 * 60_000,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("purchase_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, id) => { track({ module: "achats", action: "commande_supprimee", label: "Commande fournisseur supprimée", severity: "warning", table: "purchase_orders", recordId: id }); toast.success("Commande supprimée"); qc.invalidateQueries({ queryKey: ["purchase_orders"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("purchase_orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { track({ module: "achats", action: "commande_statut", label: `Commande fournisseur → ${v.status}`, table: "purchase_orders", recordId: v.id, details: { statut: v.status } }); toast.success("Statut mis à jour"); qc.invalidateQueries({ queryKey: ["purchase_orders"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  // Le filtre statut est désormais appliqué côté serveur ; on garde un filtrage de sécurité local
  const filtered = useMemo(
    () => orders.filter((o: any) => statusFilter === "all" || o.status === statusFilter),
    [orders, statusFilter],
  );

  const csvHeaders = [
    { key: "number" as const, label: "N° commande" },
    { key: "supplier" as const, label: "Fournisseur" },
    { key: "order_date" as const, label: "Date commande" },
    { key: "expected" as const, label: "Livraison prévue" },
    { key: "status" as const, label: "Statut" },
    { key: "progress" as const, label: "Réception %" },
    { key: "total" as const, label: "Montant" },
  ];
  const csvRows = filtered.map((o: any) => ({
    number: o.po_number,
    supplier: o.suppliers?.name ?? "",
    order_date: formatDate(o.order_date),
    expected: o.expected_date ? formatDate(o.expected_date) : "",
    status: statusLabel(o.status),
    progress: `${progressOf(o)}%`,
    total: formatXOF(totalOf(o)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commandes fournisseurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Création, réception partielle, statut et historique.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportToCsv(csvHeaders, csvRows, `commandes-fournisseurs-${new Date().toISOString().slice(0, 10)}.csv`)}>
            <FileDown className="mr-1 size-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportTablePdf({
            title: "Commandes fournisseurs",
            headers: csvHeaders.map((h) => h.label),
            rows: csvRows.map((r: Record<string, string>) => csvHeaders.map((h) => r[h.key] ?? "")),
            filename: `commandes-fournisseurs-${new Date().toISOString().slice(0, 10)}.pdf`,
            landscape: true,
          })}>
            <FileDown className="mr-1 size-4" /> PDF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1 size-4" /> Nouvelle commande</Button></DialogTrigger>
            <OrderForm
              suppliers={suppliers}
              products={products}
              onClose={() => setOpen(false)}
              onSaved={() => { qc.invalidateQueries({ queryKey: ["purchase_orders"] }); setOpen(false); }}
            />
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° commande</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Commandée le</TableHead>
              <TableHead>Livraison prévue</TableHead>
              <TableHead>Lignes</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Réception</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                Aucune commande fournisseur.
              </TableCell></TableRow>
            )}
            {filtered.map((o: any) => {
              const pct = progressOf(o);
              return (
                <OrderRow
                  key={o.id}
                  order={o}
                  onReceive={() => setReceiving(o)}
                  onDelete={(id) => del.mutate(id)}
                  onStatus={(id, status) => setStatus.mutate({ id, status })}
                />
              );
            })}
          </TableBody>
        </Table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalOrders}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <Dialog open={!!receiving} onOpenChange={(o) => !o && setReceiving(null)}>
        {receiving && (
          <ReceptionDialog
            order={receiving}
            onDone={() => { qc.invalidateQueries({ queryKey: ["purchase_orders"] }); qc.invalidateQueries({ queryKey: ["movements"] }); setReceiving(null); }}
          />
        )}
      </Dialog>
    </div>
  );
}

type DraftLine = { product_id: string; quantity_ordered: string; unit_price: string };

function OrderForm({
  suppliers, products, onClose, onSaved,
}: { suppliers: any[]; products: any[]; onClose: () => void; onSaved: () => void }) {
  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [expected, setExpected] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ product_id: "", quantity_ordered: "1", unit_price: "0" }]);

  const setLine = (i: number, patch: Partial<DraftLine>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const total = lines.reduce((s, l) => s + Number(l.quantity_ordered || 0) * Number(l.unit_price || 0), 0);

  const save = useMutation({
    mutationFn: async () => {
      const valid = lines.filter((l) => l.product_id && Number(l.quantity_ordered) > 0);
      if (valid.length === 0) throw new Error("Ajoutez au moins une ligne valide");
      const { data: num, error: numErr } = await (supabase as any).rpc("generate_po_number");
      if (numErr) throw numErr;
      const { data: u } = await supabase.auth.getUser();
      const { data: order, error } = await (supabase as any).from("purchase_orders").insert({
        po_number: num,
        supplier_id: supplierId || null,
        order_date: orderDate,
        expected_date: expected || null,
        notes: notes || null,
        status: "envoyee",
        created_by: u.user?.id,
      }).select().single();
      if (error) throw error;

      const { error: itemsErr } = await (supabase as any).from("purchase_order_items").insert(
        valid.map((l) => ({
          purchase_order_id: order.id,
          product_id: l.product_id,
          quantity_ordered: Number(l.quantity_ordered),
          unit_price: Number(l.unit_price || 0),
        })),
      );
      if (itemsErr) throw itemsErr;
    },
    onSuccess: () => { track({ module: "achats", action: "commande_creee", label: "Commande fournisseur créée", table: "purchase_orders" }); toast.success("Commande créée"); onSaved(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader><DialogTitle>Nouvelle commande fournisseur</DialogTitle></DialogHeader>
      <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Fournisseur</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>{suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Date commande</Label>
            <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Livraison prévue</Label>
            <Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></div>
        </div>

        <div className="grid gap-2">
          <Label>Lignes de commande</Label>
          <div className="grid gap-2">
            {lines.map((l, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <Select value={l.product_id} onValueChange={(v) => {
                  const p = products.find((x: any) => x.id === v);
                  setLine(i, { product_id: v, unit_price: p?.purchase_price ? String(p.purchase_price) : l.unit_price });
                }}>
                  <SelectTrigger className="min-w-52 flex-1"><SelectValue placeholder="Produit" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input className="w-24" type="number" step="0.001" value={l.quantity_ordered}
                  onChange={(e) => setLine(i, { quantity_ordered: e.target.value })} placeholder="Qté" />
                <Input className="w-28" type="number" step="0.01" value={l.unit_price}
                  onChange={(e) => setLine(i, { unit_price: e.target.value })} placeholder="PU" />
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}>
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm"
            onClick={() => setLines((ls) => [...ls, { product_id: "", quantity_ordered: "1", unit_price: "0" }])}>
            <Plus className="mr-1 size-4" /> Ajouter une ligne
          </Button>
        </div>

        <div className="grid gap-2"><Label>Notes</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>

        <p className="text-right text-sm font-semibold">Total : {formatXOF(total)}</p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={save.isPending}>Créer la commande</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/**
 * Réception partielle : saisie des quantités reçues par ligne.
 * Chaque quantité reçue génère un mouvement de stock d'entrée et met à jour
 * le statut de la commande (partielle / réceptionnée).
 */
function ReceptionDialog({ order, onDone }: { order: any; onDone: () => void }) {
  const items: any[] = order.purchase_order_items ?? [];
  const [qty, setQty] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.id, "0"])),
  );

  const receive = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const toReceive = items
        .map((i) => ({ item: i, n: Number(qty[i.id] || 0) }))
        .filter((x) => x.n > 0);
      if (toReceive.length === 0) throw new Error("Saisissez au moins une quantité reçue");

      for (const { item, n } of toReceive) {
        const newReceived = Number(item.quantity_received) + n;
        const { error } = await (supabase as any).from("purchase_order_items")
          .update({ quantity_received: newReceived }).eq("id", item.id);
        if (error) throw error;

        const { error: mvErr } = await (supabase as any).from("stock_movements").insert({
          product_id: item.product_id,
          type: "entree",
          quantity: n,
          unit_price: Number(item.unit_price) || null,
          reason: `Réception commande ${order.po_number}`,
          created_by: u.user?.id,
        });
        if (mvErr) throw mvErr;
      }

      const totalOrdered = items.reduce((s, i) => s + Number(i.quantity_ordered), 0);
      const totalReceived = items.reduce(
        (s, i) => s + Number(i.quantity_received) + Number(qty[i.id] || 0), 0);
      const status = totalReceived >= totalOrdered ? "receptionnee" : "partielle";
      const { error: stErr } = await (supabase as any).from("purchase_orders")
        .update({ status }).eq("id", order.id);
      if (stErr) throw stErr;
    },
    onSuccess: () => { track({ module: "achats", action: "reception", label: `Réception commande ${order.po_number ?? ""}`, table: "purchase_orders", recordId: order.id, warehouseId: order.warehouse_id ?? null }); toast.success("Réception enregistrée"); onDone(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Réception — {order.po_number}</DialogTitle>
      </DialogHeader>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Commandé</TableHead>
              <TableHead className="text-right">Déjà reçu</TableHead>
              <TableHead className="text-right">Reste</TableHead>
              <TableHead className="text-right">À réceptionner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => {
              const rest = Number(i.quantity_ordered) - Number(i.quantity_received);
              return (
                <TableRow key={i.id}>
                  <TableCell className="text-sm">{i.products?.name ?? "—"}</TableCell>
                  <TableCell className="text-right text-xs">{Number(i.quantity_ordered)}</TableCell>
                  <TableCell className="text-right text-xs">{Number(i.quantity_received)}</TableCell>
                  <TableCell className="text-right text-xs">{rest}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      className="ml-auto h-8 w-24 text-right"
                      type="number" min="0" max={rest} step="0.001"
                      value={qty[i.id] ?? "0"}
                      onChange={(e) => setQty((q) => ({ ...q, [i.id]: e.target.value }))}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <DialogFooter>
        <Button onClick={() => receive.mutate()} disabled={receive.isPending}>
          <PackageCheck className="mr-1 size-4" /> Valider la réception
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/**
 * Ligne de commande mémoïsée : évite de re-rendre toutes les lignes
 * quand une seule ligne change (statut, réception…).
 */
const OrderRow = memo(function OrderRow({
  order, onReceive, onDelete, onStatus,
}: {
  order: any;
  onReceive: () => void;
  onDelete: (id: string) => void;
  onStatus: (id: string, status: string) => void;
}) {
  const pct = progressOf(order);
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{order.po_number}</TableCell>
      <TableCell>{order.suppliers?.name ?? "—"}</TableCell>
      <TableCell className="text-xs">{formatDate(order.order_date)}</TableCell>
      <TableCell className="text-xs">{order.expected_date ? formatDate(order.expected_date) : "—"}</TableCell>
      <TableCell className="text-xs">{(order.purchase_order_items ?? []).length}</TableCell>
      <TableCell className="text-right">{formatXOF(totalOf(order))}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded bg-muted">
            <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      </TableCell>
      <TableCell>
        <Select
          value={order.status}
          onValueChange={(v) => onStatus(order.id, v)}
        >
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={onReceive} title="Réceptionner">
            <PackageCheck className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(order.id)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
