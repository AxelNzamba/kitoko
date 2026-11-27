import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, FileDown, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { checkAndNotifyAlerts } from "@/hooks/use-stock-alerts";
import { useRealtimeSubscription, LiveBadge } from "@/hooks/use-realtime";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatDateTime, formatXOF } from "@/lib/format";
import { exportToCsv } from "@/lib/csv";
import { exportTablePdf } from "@/lib/pdf-table";
import { useWarehouseFilter } from "@/lib/warehouse-filter";
import { ViewModeToggle, useViewMode, viewGridClass, type ViewMode } from "@/components/view-mode-toggle";

export const Route = createFileRoute("/_authenticated/stock")({
  component: StockPage,
  head: () => ({ meta: [{ title: "Stock — INDUS-ERP" },
      { name: "description", content: "Stock — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Stock — INDUS-ERP" },
      { property: "og:description", content: "Stock — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const MOVEMENTS_PAGE_SIZE = 30;

function StockPage() {
  const qc = useQueryClient();
  const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
  const [type, setType] = useState<"entree" | "sortie" | null>(null);
  const [editMovement, setEditMovement] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(MOVEMENTS_PAGE_SIZE);
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const { mode: viewMode, setMode: setViewMode } = useViewMode("stock", "list");

  const rtMovements = useRealtimeSubscription(
    { table: "stock_movements" },
    {
      onPayload: () => {
        qc.invalidateQueries({ queryKey: ["movements"] });
        qc.invalidateQueries({ queryKey: ["lot_stock"] });
        checkAndNotifyAlerts();
      },
    },
  );

  const { data: locations = [] } = useQuery({
    queryKey: ["stock-locations", selectedWarehouseId],
    queryFn: async () => {
      let q = (supabase as any).from("stock_locations").select("*, warehouses(name)").order("name");
      q = applyFilter(q, "warehouse_id");
      const { data } = await q;
      return data ?? [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles", "min"],
    queryFn: async () => (await (supabase as any).from("profiles").select("id, full_name").order("full_name")).data ?? [],
  });

  const { data: movementsData = { data: [], count: 0 } } = useQuery({
    queryKey: ["movements", page, pageSize, locationFilter, dateFrom, dateTo, userFilter, selectedWarehouseId],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = (supabase as any)
        .from("stock_movements")
        .select("*, products!left(name, sku), lots!left(lot_number), stock_locations!left(name)", { count: "exact", head: false });
      query = applyFilter(query, "warehouse_id");
      if (locationFilter) query = query.eq("location_id", locationFilter);
      if (userFilter) query = query.eq("created_by", userFilter);
      if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00`);
      if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59`);
      const result = await query
        .order("created_at", { ascending: false })
        .range(from, to);
      if (result.error) throw result.error;
      return { data: result.data ?? [], count: result.count ?? 0 };
    },
  });

  const movements = movementsData.data;
  const totalMovements = movementsData.count;

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["movements"] });
    qc.invalidateQueries({ queryKey: ["lot_stock"] });
    qc.invalidateQueries({ queryKey: ["stock-alerts"] });
    checkAndNotifyAlerts();
  };

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stock_movements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Mouvement supprimé"); refreshAll(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const fetchFiltered = async () => {
    let q = (supabase as any)
      .from("stock_movements")
      .select("*, products!left(name, sku), lots!left(lot_number), stock_locations!left(name)")
      .order("created_at", { ascending: false });
    q = applyFilter(q, "warehouse_id");
    if (locationFilter) q = q.eq("location_id", locationFilter);
    if (userFilter) q = q.eq("created_by", userFilter);
    if (dateFrom) q = q.gte("created_at", `${dateFrom}T00:00:00`);
    if (dateTo) q = q.lte("created_at", `${dateTo}T23:59:59`);
    const { data, error } = await q;
    if (error) throw error;
    const byUser = new Map(profiles.map((p: any) => [p.id, p.full_name]));
    return (data ?? []).map((m: any) => ({
      date: formatDateTime(m.created_at),
      type: m.type,
      product: m.products?.name ?? "",
      sku: m.products?.sku ?? "",
      lot: m.lots?.lot_number ?? "",
      location: m.stock_locations?.name ?? "",
      magasinier: (byUser.get(m.created_by) as string | undefined) ?? "",
      quantity: String(m.quantity),
      unit_price: m.unit_price ? formatXOF(Number(m.unit_price)) : "",
      total: m.unit_price ? formatXOF(Number(m.unit_price) * Number(m.quantity)) : "",
      reason: m.reason ?? "",
    }));
  };

  const EXPORT_HEADERS = [
    { key: "date" as const, label: "Date" },
    { key: "type" as const, label: "Type" },
    { key: "product" as const, label: "Produit" },
    { key: "sku" as const, label: "SKU" },
    { key: "lot" as const, label: "Lot" },
    { key: "location" as const, label: "Emplacement" },
    { key: "magasinier" as const, label: "Magasinier" },
    { key: "quantity" as const, label: "Quantité" },
    { key: "unit_price" as const, label: "PU" },
    { key: "total" as const, label: "Total" },
    { key: "reason" as const, label: "Motif" },
  ];

  const periodLabel = () =>
    `Période : ${dateFrom || "début"} → ${dateTo || "aujourd'hui"}` +
    (userFilter ? ` — Magasinier : ${(profiles.find((p: any) => p.id === userFilter)?.full_name) ?? ""}` : "");

  const handleExportCsv = async () => {
    try {
      const rows = await fetchFiltered();
      exportToCsv(EXPORT_HEADERS, rows, `stock-mouvements-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch { toast.error("Erreur lors de l'export"); }
  };

  const handleExportPdf = async () => {
    try {
      const rows = await fetchFiltered();
      await exportTablePdf({
        title: "Mouvements de stock",
        subtitle: periodLabel(),
        headers: EXPORT_HEADERS.map((h) => h.label),
        rows: rows.map((r: Record<string, string>) => EXPORT_HEADERS.map((h) => r[h.key] ?? "")),
        filename: `stock-mouvements-${new Date().toISOString().slice(0, 10)}.pdf`,
        landscape: true,
        footerNote: `${rows.length} mouvement(s) exporté(s).`,
      });
    } catch { toast.error("Erreur lors de l'export"); }
  };

  const openEdit = (movement: any) => {
    setEditMovement(movement);
  };

  const closeEdit = () => {
    setEditMovement(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stock</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mouvements d'entrée et de sortie.</p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge status={rtMovements.status} />
          {locations.length > 0 && (
            <Select value={locationFilter} onValueChange={(v) => { setLocationFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-44">
                <MapPin className="mr-1 size-3.5" />
                <SelectValue placeholder="Tous les emplacements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les emplacements</SelectItem>
                {locations.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Input type="date" className="h-8 w-36" value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} title="Date de début" />
          <Input type="date" className="h-8 w-36" value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }} title="Date de fin" />
          <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Tous les magasiniers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les magasiniers</SelectItem>
              {profiles.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.full_name ?? p.id.slice(0, 8)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportCsv} title="Exporter en CSV">
            <FileDown className="mr-1 size-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf} title="Exporter en PDF">
            <FileDown className="mr-1 size-4" />
            PDF
          </Button>
          <Dialog open={type === "entree"} onOpenChange={(o) => setType(o ? "entree" : null)}>
            <DialogTrigger asChild>
              <Button variant="outline"><ArrowDownCircle className="mr-1 size-4 text-emerald-600" /> Entrée</Button>
            </DialogTrigger>
            <MovementForm
              kind="entree"
              onClose={() => setType(null)}
              onDone={() => { refreshAll(); setType(null); }}
            />
          </Dialog>
          <Dialog open={type === "sortie"} onOpenChange={(o) => setType(o ? "sortie" : null)}>
            <DialogTrigger asChild>
              <Button><ArrowUpCircle className="mr-1 size-4" /> Sortie</Button>
            </DialogTrigger>
            <MovementForm
              kind="sortie"
              onClose={() => setType(null)}
              onDone={() => { refreshAll(); setType(null); }}
            />
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{totalMovements} mouvement(s)</p>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {movements.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-10 text-center text-sm text-muted-foreground">
          Aucun mouvement.
        </div>
      ) : viewMode === "list" ? (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">PU</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m: any) => (
                <TableRow key={m.id} className="animate-row-enter">
                  <TableCell className="text-sm">{formatDateTime(m.created_at)}</TableCell>
                  <TableCell><MovementTypeBadge type={m.type} /></TableCell>
                  <TableCell>{m.products?.name}</TableCell>
                  <TableCell className="font-mono text-xs">{m.lots?.lot_number ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {m.stock_locations?.name || "—"}
                  </TableCell>
                  <TableCell className="text-right">{Number(m.quantity)}</TableCell>
                  <TableCell className="text-right">{m.unit_price ? formatXOF(Number(m.unit_price)) : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.reason ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <MovementActions movement={m} onEdit={openEdit} onDelete={(id) => del.mutate(id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={totalMovements}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className={viewGridClass(viewMode)}>
            {movements.map((m: any) => (
              <MovementCard
                key={m.id}
                movement={m}
                mode={viewMode}
                onEdit={openEdit}
                onDelete={(id) => del.mutate(id)}
              />
            ))}
          </div>
          <div className="rounded-lg border border-border bg-card">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={totalMovements}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      )}

      {/* Dialogue d'édition */}
      <Dialog open={!!editMovement} onOpenChange={(o) => { if (!o) closeEdit(); }}>
        {editMovement && (
          <MovementForm
            movement={editMovement}
            kind={editMovement.type as "entree" | "sortie"}
            onClose={closeEdit}
            onDone={() => { refreshAll(); closeEdit(); }}
          />
        )}
      </Dialog>
    </div>
  );
}

function MovementForm({
  kind, movement, onClose, onDone,
}: {
  kind: "entree" | "sortie";
  movement?: any | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const isEdit = !!movement;
  const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
  const [productId, setProductId] = useState(movement?.product_id ?? "");
  const [lotId, setLotId] = useState(movement?.lot_id ?? "");
  const [quantity, setQuantity] = useState(movement?.quantity?.toString() ?? "1");
  const [unitPrice, setUnitPrice] = useState(movement?.unit_price?.toString() ?? "");
  const [reason, setReason] = useState(movement?.reason ?? "");
  const [locationId, setLocationId] = useState(movement?.location_id ?? "");
  const [busy, setBusy] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["products", "min"],
    queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? [],
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["stock-locations", selectedWarehouseId],
    queryFn: async () => {
      let q = (supabase as any).from("stock_locations").select("*").eq("is_active", true).order("name");
      q = applyFilter(q, "warehouse_id");
      const { data } = await q;
      return data ?? [];
    },
  });

  const { data: lots = [] } = useQuery({
    queryKey: ["lots", productId, selectedWarehouseId],
    enabled: !!productId,
    queryFn: async () => {
      let q = supabase.from("lots").select("id, lot_number").eq("product_id", productId);
      q = applyFilter(q, "warehouse_id");
      const { data } = await q.order("reception_date", { ascending: false });
      return data ?? [];
    },
  });

  const resolvedWarehouseId = () => {
    if (locationId) {
      const loc = locations.find((l: any) => l.id === locationId);
      if (loc?.warehouse_id) return loc.warehouse_id;
    }
    return selectedWarehouseId && selectedWarehouseId !== "all" ? selectedWarehouseId : null;
  };

  const submit = useMutation({
    mutationFn: async () => {
      setBusy(true);
      const warehouseId = resolvedWarehouseId();

      if (isEdit) {
        const { error } = await (supabase as any)
          .from("stock_movements")
          .update({
            product_id: productId,
            lot_id: lotId || null,
            location_id: locationId || null,
            warehouse_id: warehouseId,
            type: kind,
            quantity: Number(quantity),
            unit_price: unitPrice ? Number(unitPrice) : null,
            reason: reason || null,
          })
          .eq("id", movement.id);
        if (error) throw error;
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const { error } = await (supabase as any).from("stock_movements").insert({
          product_id: productId,
          lot_id: lotId || null,
          location_id: locationId || null,
          warehouse_id: warehouseId,
          type: kind,
          quantity: Number(quantity),
          unit_price: unitPrice ? Number(unitPrice) : null,
          reason: reason || null,
          created_by: userRes.user?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Mouvement modifié" : `${kind === "entree" ? "Entrée" : "Sortie"} enregistrée`);
      onDone();
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
    onSettled: () => setBusy(false),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEdit
            ? "Modifier le mouvement"
            : kind === "entree" ? "Entrée de stock" : "Sortie de stock"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (!productId) return; submit.mutate(); }}
        className="grid gap-4">
        <div className="grid gap-2">
          <Label>Produit *</Label>
          <Select value={productId} onValueChange={(v) => { setProductId(v); setLotId(""); }}>
            <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {locations.length > 0 && (
          <div className="grid gap-2">
            <Label>Emplacement</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger><SelectValue placeholder="Non spécifié" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Non spécifié</SelectItem>
                {locations.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid gap-2">
          <Label>Lot</Label>
          <Select value={lotId} onValueChange={setLotId}>
            <SelectTrigger><SelectValue placeholder={productId ? "Choisir un lot" : "Choisir un produit d'abord"} /></SelectTrigger>
            <SelectContent>
              {lots.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.lot_number}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Quantité *</Label>
            <Input type="number" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Prix unitaire</Label>
            <Input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Motif</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder={kind === "entree" ? "Réception fournisseur, ajustement..." : "Vente, casse, retour..."} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={busy}>{busy ? "..." : isEdit ? "Modifier" : "Enregistrer"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ---------- Vues mouvements ---------- */

function MovementTypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
      type === "entree" ? "bg-emerald-500/10 text-emerald-600" :
      type === "sortie" ? "bg-accent/10 text-accent" :
      "bg-muted text-muted-foreground"
    }`}>{type}</span>
  );
}

function MovementActions({
  movement: m, onEdit, onDelete,
}: { movement: any; onEdit: (m: any) => void; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => onEdit(m)} aria-label="Modifier">
        <Pencil className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Supprimer">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le mouvement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce mouvement du{" "}
              <strong>{formatDateTime(m.created_at)}</strong> ({m.type}) ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(m.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MovementCard({
  movement: m, mode, onEdit, onDelete,
}: {
  movement: any;
  mode: ViewMode;
  onEdit: (m: any) => void;
  onDelete: (id: string) => void;
}) {
  const isIn = m.type === "entree";
  const Icon = isIn ? ArrowDownCircle : ArrowUpCircle;
  const tone = isIn ? "text-emerald-600" : "text-accent";

  if (mode === "mosaic") {
    return (
      <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-2 text-center" title={m.products?.name}>
        <Icon className={`size-6 ${tone}`} />
        <span className="line-clamp-2 text-[11px] font-medium leading-tight">{m.products?.name ?? "—"}</span>
        <span className="text-[11px] font-semibold">{Number(m.quantity)}</span>
      </div>
    );
  }

  if (mode === "details") {
    return (
      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Icon className={`size-6 shrink-0 ${tone}`} />
            <div className="min-w-0">
              <p className="truncate font-medium">{m.products?.name ?? "—"}</p>
              <p className="text-[11px] text-muted-foreground">{formatDateTime(m.created_at)}</p>
            </div>
          </div>
          <MovementActions movement={m} onEdit={onEdit} onDelete={onDelete} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
          <span>Type : <MovementTypeBadge type={m.type} /></span>
          <span>Quantité : <span className="text-foreground">{Number(m.quantity)}</span></span>
          <span>PU : <span className="text-foreground">{m.unit_price ? formatXOF(Number(m.unit_price)) : "—"}</span></span>
          <span>Lot : <span className="font-mono text-foreground">{m.lots?.lot_number ?? "—"}</span></span>
          <span>Emplacement : <span className="text-foreground">{m.stock_locations?.name || "—"}</span></span>
          <span>SKU : <span className="font-mono text-foreground">{m.products?.sku ?? "—"}</span></span>
        </div>
        {m.reason && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">Motif : {m.reason}</p>}
      </div>
    );
  }

  const isXl = mode === "xl-icons";
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between">
        <Icon className={`${isXl ? "size-10" : "size-6"} ${tone}`} />
        <MovementTypeBadge type={m.type} />
      </div>
      <p className={`line-clamp-2 font-medium leading-tight ${isXl ? "text-base" : "text-sm"}`}>
        {m.products?.name ?? "—"}
      </p>
      <p className="text-[11px] text-muted-foreground">{formatDateTime(m.created_at)}</p>
      <div className="flex items-center justify-between gap-2">
        <span className={`font-semibold ${isXl ? "text-lg" : "text-sm"}`}>{Number(m.quantity)}</span>
        <span className="text-xs text-muted-foreground">
          {m.unit_price ? formatXOF(Number(m.unit_price)) : "—"}
        </span>
      </div>
      {isXl && (
        <p className="text-[11px] text-muted-foreground">
          Lot {m.lots?.lot_number ?? "—"} · {m.stock_locations?.name || "Sans emplacement"}
        </p>
      )}
      <MovementActions movement={m} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
