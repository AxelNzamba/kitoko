import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, FileText, Pencil, Trash2, Hash } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatDate, formatXOF } from "@/lib/format";
import { SerialNumbersDialog } from "@/components/serial-numbers-dialog";
import { useWarehouseFilter } from "@/lib/warehouse-filter";

const lotSchema = z.object({
  product_id: z.string().min(1, "Le produit est requis"),
  supplier_id: z.string().optional().or(z.literal("")),
  warehouse_id: z.string().optional().or(z.literal("")),
  location_id: z.string().optional().or(z.literal("")),
  lot_number: z.string().trim().min(1, "Le numéro de lot est requis").max(100),
  reception_date: z.string().min(1, "La date est requise"),
  quantity: z.coerce.number().min(0.001, "La quantité doit être positive"),
  unit_purchase_price: z.coerce.number().min(0, "Le prix doit être positif"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type LotFormValues = z.infer<typeof lotSchema>;

export const Route = createFileRoute("/_authenticated/lots")({
  component: LotsPage,
  head: () => ({ meta: [{ title: "Lots — INDUS-ERP" },
      { name: "description", content: "Lots — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Lots — INDUS-ERP" },
      { property: "og:description", content: "Lots — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const LOTS_PAGE_SIZE = 20;

function LotsPage() {
  const qc = useQueryClient();
  const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
  const [open, setOpen] = useState(false);
  const [editLot, setEditLot] = useState<any | null>(null);
  const [serialLot, setSerialLot] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LOTS_PAGE_SIZE);

  const { data: lotsData = { data: [], count: 0 } } = useQuery({
    queryKey: ["lots", page, pageSize, selectedWarehouseId],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let q = supabase
        .from("lots")
        .select("*, products(name, sku), suppliers(name)", { count: "exact", head: false })
        .order("reception_date", { ascending: false });
      q = applyFilter(q, "warehouse_id");
      const { data, error, count } = await q.range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  const { data: stockView = [] } = useQuery({
    queryKey: ["lot_stock", selectedWarehouseId],
    queryFn: async () => {
      let q;
      if (selectedWarehouseId && selectedWarehouseId !== "all") {
        q = supabase.from("lot_stock_by_warehouse").select("*").eq("warehouse_id", selectedWarehouseId);
      } else {
        q = supabase.from("lot_stock").select("*");
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
  const stockMap = new Map(stockView.map((s: any) => [s.lot_id, Number(s.current_quantity)]));

  const { data: products = [] } = useQuery({
    queryKey: ["products", "min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, sku").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const lots = lotsData.data;
  const totalLots = lotsData.count;

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lot supprimé");
      qc.invalidateQueries({ queryKey: ["lots"] });
      qc.invalidateQueries({ queryKey: ["lot_stock"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const openEdit = (lot: any) => {
    setEditLot(lot);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lots</h1>
          <p className="mt-1 text-sm text-muted-foreground">Traçabilité par lot avec certificat.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditLot(null); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditLot(null)}><Plus className="mr-1 size-4" /> Nouveau lot</Button>
          </DialogTrigger>
          <LotForm
            products={products}
            suppliers={suppliers}
            lot={editLot}
            onClose={() => { setOpen(false); setEditLot(null); }}
            onSaved={() => {
              qc.invalidateQueries({ queryKey: ["lots"] });
              qc.invalidateQueries({ queryKey: ["lot_stock"] });
              qc.invalidateQueries({ queryKey: ["suppliers"] });
              setOpen(false);
              setEditLot(null);
            }}
          />
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° lot</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Réception</TableHead>
              <TableHead className="text-right">Qté init.</TableHead>
              <TableHead className="text-right">Qté restante</TableHead>
              <TableHead className="text-right">PU achat</TableHead>
              <TableHead>Certificat</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lots.length === 0 && (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                Aucun lot enregistré.
              </TableCell></TableRow>
            )}
            {lots.map((l: any) => (
              <TableRow key={l.id}>
                <TableCell className="font-mono text-xs">{l.lot_number}</TableCell>
                <TableCell>{l.products?.name} <span className="text-xs text-muted-foreground">({l.products?.sku})</span></TableCell>
                <TableCell className="text-sm">{l.suppliers?.name ?? "—"}</TableCell>
                <TableCell className="text-sm">{formatDate(l.reception_date)}</TableCell>
                <TableCell className="text-right">{Number(l.quantity)}</TableCell>
                <TableCell className="text-right font-semibold">{stockMap.get(l.id) ?? Number(l.quantity)}</TableCell>
                <TableCell className="text-right">{formatXOF(Number(l.unit_purchase_price))}</TableCell>
                <TableCell>
                  {l.certificate_url ? (
                    <a href={l.certificate_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                      <FileText className="size-3.5" /> Voir
                    </a>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSerialLot(l)} title="Numéros de série">
                      <Hash className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(l)}>
                      <Pencil className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le lot ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le lot <strong>{l.lot_number}</strong> ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => del.mutate(l.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
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

      <Dialog open={!!serialLot} onOpenChange={(o) => { if (!o) setSerialLot(null); }}>
        {serialLot && <SerialNumbersDialog lot={serialLot} />}
      </Dialog>
    </div>
  );
}

function LotForm({
  products, suppliers, lot, onClose, onSaved,
}: { products: any[]; suppliers: any[]; lot: any | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!lot;
  const { selectedWarehouseId } = useWarehouseFilter();
  const [newSupplier, setNewSupplier] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const form = useForm<LotFormValues>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      product_id: lot?.product_id ?? "",
      supplier_id: lot?.supplier_id ?? "",
      warehouse_id: lot?.warehouse_id ?? (selectedWarehouseId === "all" ? "" : selectedWarehouseId ?? ""),
      location_id: lot?.location_id ?? "",
      lot_number: lot?.lot_number ?? "",
      reception_date: lot?.reception_date ?? new Date().toISOString().slice(0, 10),
      quantity: lot?.quantity ?? 0,
      unit_purchase_price: lot?.unit_purchase_price ?? 0,
      notes: lot?.notes ?? "",
    },
  });

  const selectedWarehouse = form.watch("warehouse_id");

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => (await (supabase as any).from("warehouses").select("*").order("name")).data ?? [],
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["stock-locations", selectedWarehouse],
    enabled: !!selectedWarehouse,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("stock_locations")
        .select("*")
        .eq("warehouse_id", selectedWarehouse)
        .eq("is_active", true)
        .order("name");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (values: LotFormValues) => {
      setBusy(true);
      let supplier_id: string | null = values.supplier_id || null;
      if (!supplier_id && newSupplier.trim()) {
        const { data, error } = await supabase.from("suppliers").insert({ name: newSupplier.trim() }).select("id").single();
        if (error) throw error;
        supplier_id = data.id;
      }

      let certificate_url: string | null = lot?.certificate_url ?? null;
      if (certFile) {
        const path = `${Date.now()}-${certFile.name}`;
        const up = await supabase.storage.from("certificats").upload(path, certFile);
        if (up.error) throw up.error;
        const signed = await supabase.storage.from("certificats").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        certificate_url = signed.data?.signedUrl ?? null;
      }

      const payload = {
        product_id: values.product_id,
        supplier_id,
        warehouse_id: values.warehouse_id || null,
        location_id: values.location_id || null,
        lot_number: values.lot_number.trim(),
        reception_date: values.reception_date,
        quantity: Number(values.quantity),
        unit_purchase_price: Number(values.unit_purchase_price),
        certificate_url,
        notes: values.notes || null,
      };

      if (isEdit) {
        const { error } = await supabase.from("lots").update(payload).eq("id", lot.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lots").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(isEdit ? "Lot modifié" : "Lot créé"); onSaved(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
    onSettled: () => setBusy(false),
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{isEdit ? "Modifier le lot" : "Nouveau lot"}</DialogTitle></DialogHeader>
      <form onSubmit={form.handleSubmit((values) => save.mutate(values))} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="product_id">Produit *</Label>
          <Select value={form.watch("product_id")} onValueChange={(v) => form.setValue("product_id", v)}>
            <SelectTrigger><SelectValue placeholder="Choisir un produit" /></SelectTrigger>
            <SelectContent>
              {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
            </SelectContent>
          </Select>
          {form.formState.errors.product_id && (
            <p className="text-xs text-destructive">{form.formState.errors.product_id.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Fournisseur</Label>
          <Select value={form.watch("supplier_id")} onValueChange={(v) => form.setValue("supplier_id", v)}>
            <SelectTrigger><SelectValue placeholder="Choisir ou créer" /></SelectTrigger>
            <SelectContent>
              {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {!form.watch("supplier_id") && (
            <Input placeholder="ou nouveau fournisseur..." value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Entrepôt</Label>
            <Select value={form.watch("warehouse_id")} onValueChange={(v) => { form.setValue("warehouse_id", v); form.setValue("location_id", ""); }}>
              <SelectTrigger><SelectValue placeholder="Choisir un entrepôt" /></SelectTrigger>
              <SelectContent>
                {warehouses.filter((w: any) => w.is_active).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Emplacement</Label>
            <Select value={form.watch("location_id")} onValueChange={(v) => form.setValue("location_id", v)} disabled={!selectedWarehouse}>
              <SelectTrigger><SelectValue placeholder={selectedWarehouse ? "Choisir" : "Choisir un entrepôt d'abord"} /></SelectTrigger>
              <SelectContent>
                {locations.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="lot_number">N° lot *</Label>
            <Input id="lot_number" {...form.register("lot_number")} />
            {form.formState.errors.lot_number && (
              <p className="text-xs text-destructive">{form.formState.errors.lot_number.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reception_date">Date réception</Label>
            <Input id="reception_date" type="date" {...form.register("reception_date")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input id="quantity" type="number" step="0.001" {...form.register("quantity")} />
            {form.formState.errors.quantity && (
              <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit_purchase_price">Prix unitaire achat</Label>
            <Input id="unit_purchase_price" type="number" step="0.01" {...form.register("unit_purchase_price")} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Certificat (PDF)</Label>
          <Input type="file" accept="application/pdf" onChange={(e) => setCertFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={busy}>{busy ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
