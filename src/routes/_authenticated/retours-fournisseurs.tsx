import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/retours-fournisseurs")({
  component: RetoursPage,
  head: () => ({ meta: [{ title: "Retours fournisseurs — INDUS-ERP" },
      { name: "description", content: "Retours fournisseurs — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Retours fournisseurs — INDUS-ERP" },
      { property: "og:description", content: "Retours fournisseurs — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const PAGE_SIZE = 20;

function RetoursPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [q, setQ] = useState("");

  const [formProduct, setFormProduct] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formQty, setFormQty] = useState("1");
  const [formReason, setFormReason] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [availableLots, setAvailableLots] = useState<any[]>([]);
  const [lotId, setLotId] = useState("");

  const { data: returnsData = { data: [], count: 0 } } = useQuery({
    queryKey: ["supplier-returns", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await (supabase as any)
        .from("supplier_returns")
        .select("*, products!left(name, sku), suppliers!left(name), lots!left(lot_number)")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", "min"],
    queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? [],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", "min"],
    queryFn: async () => (await supabase.from("suppliers").select("id, name").order("name")).data ?? [],
  });

  const loadLots = async (productId: string) => {
    const { data } = await supabase
      .from("lots").select("id, lot_number, quantity")
      .eq("product_id", productId)
      .gt("quantity", 0)
      .order("reception_date", { ascending: false });
    setAvailableLots(data ?? []);
    setLotId("");
  };

  const createReturn = useMutation({
    mutationFn: async () => {
      setBusy(true);
      if (!formProduct || !formSupplier || !formQty) throw new Error("Veuillez remplir les champs requis");

      const { data: u } = await supabase.auth.getUser();

      const { data: numData } = await (supabase.rpc as any)("generate_return_number");
      const returnNumber = numData ?? `RET-${Date.now()}`;

      const { error } = await (supabase as any).from("supplier_returns").insert({
        return_number: returnNumber,
        product_id: formProduct,
        supplier_id: formSupplier,
        lot_id: lotId || null,
        quantity: Number(formQty),
        reason: formReason,
        return_date: formDate,
        status: "completed",
        created_by: u.user?.id,
      });
      if (error) throw error;

      const { error: movErr } = await supabase.from("stock_movements").insert({
        product_id: formProduct,
        type: "sortie",
        quantity: Number(formQty),
        unit_price: null,
        reason: `Retour fournisseur ${returnNumber}: ${formReason}`,
        created_by: u.user?.id,
      });
      if (movErr) throw movErr;
    },
    onSuccess: () => {
      toast.success("Retour enregistré");
      qc.invalidateQueries({ queryKey: ["supplier-returns"] });
      qc.invalidateQueries({ queryKey: ["movements"] });
      setOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
    onSettled: () => setBusy(false),
  });

  const resetForm = () => {
    setFormProduct(""); setFormSupplier(""); setFormQty("1");
    setFormReason(""); setFormDate(new Date().toISOString().slice(0, 10));
    setLotId(""); setAvailableLots([]);
  };

  const returns = returnsData.data;
  const total = returnsData.count;

  // Debounce : évite de re-filtrer à chaque frappe clavier
  const debouncedQ = useDebounce(q, 200);

  const filtered = useMemo(
    () =>
      debouncedQ.trim()
        ? returns.filter((r: any) => {
            const s = debouncedQ.toLowerCase();
            return r.return_number?.toLowerCase().includes(s) ||
              r.products?.name?.toLowerCase().includes(s) ||
              r.suppliers?.name?.toLowerCase().includes(s);
          })
        : returns,
    [returns, debouncedQ],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Retours fournisseurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gérez les retours de marchandises aux fournisseurs.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 size-4" /> Nouveau retour</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau retour fournisseur</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createReturn.mutate(); }} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Produit *</Label>
                <Select value={formProduct} onValueChange={(v) => { setFormProduct(v); loadLots(v); }}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fournisseur *</Label>
                <Select value={formSupplier} onValueChange={setFormSupplier}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {availableLots.length > 0 && (
                <div className="grid gap-2">
                  <Label>Lot (optionnel)</Label>
                  <Select value={lotId} onValueChange={setLotId}>
                    <SelectTrigger><SelectValue placeholder="Choisir un lot" /></SelectTrigger>
                    <SelectContent>
                      {availableLots.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.lot_number} (stock: {l.quantity})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Quantité *</Label>
                  <Input type="number" min="1" value={formQty} onChange={(e) => setFormQty(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>Date retour</Label>
                  <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Motif du retour *</Label>
                <Select value={formReason} onValueChange={setFormReason}>
                  <SelectTrigger><SelectValue placeholder="Choisir un motif" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Produit défectueux">Produit défectueux</SelectItem>
                    <SelectItem value="Erreur de commande">Erreur de commande</SelectItem>
                    <SelectItem value="Produit périmé">Produit périmé</SelectItem>
                    <SelectItem value="Qualité insuffisante">Qualité insuffisante</SelectItem>
                    <SelectItem value="Quantité excédentaire">Quantité excédentaire</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={busy}>{busy ? "..." : "Enregistrer le retour"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par n° retour, produit, fournisseur…" className="pl-9" />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° retour</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead className="text-right">Qté</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                Aucun retour enregistré.
              </TableCell></TableRow>
            )}
            {filtered.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.return_number}</TableCell>
                <TableCell className="text-sm">{formatDate(r.return_date)}</TableCell>
                <TableCell>{r.products?.name} <span className="text-xs text-muted-foreground">({r.products?.sku})</span></TableCell>
                <TableCell>{r.suppliers?.name ?? "—"}</TableCell>
                <TableCell className="text-right">{r.quantity}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{r.reason}</TableCell>
                <TableCell>
                  <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${
                    r.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
                    r.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {r.status === "completed" ? "Effectué" : r.status === "pending" ? "En attente" : "Annulé"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>
    </div>
  );
}
