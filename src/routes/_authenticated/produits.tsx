import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Plus, Package as PackageIcon, Printer, Pencil, Trash2, QrCode, FileDown,
  Search, X, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { useServerFn } from "@tanstack/react-start";
import { upsertProduct, deleteProduct } from "@/lib/products.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { compressImage } from "@/lib/image";
import { generateBarcode, generateSKU, formatXOF } from "@/lib/format";
import { exportToCsv } from "@/lib/csv";
import { QrPreview, BarcodePreview } from "@/components/qr-preview";
import { ViewModeToggle, useViewMode, viewGridClass, type ViewMode } from "@/components/view-mode-toggle";

const productSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(255),
  sku: z.string().trim().max(50).optional().or(z.literal("")),
  category_id: z.string().optional().or(z.literal("")),
  purchase_price: z.coerce.number().min(0, "Prix positif"),
  sale_price: z.coerce.number().min(0, "Prix positif"),
  tva: z.coerce.number().min(0).max(100),
  stock_min: z.coerce.number().min(0),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const Route = createFileRoute("/_authenticated/produits")({
  component: ProduitsPage,
  head: () => ({ meta: [{ title: "Produits — INDUS-ERP" },
      { name: "description", content: "Produits — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Produits — INDUS-ERP" },
      { property: "og:description", content: "Produits — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const PRODUCTS_PAGE_SIZE = 20;

type StockStatus = "all" | "rupture" | "faible" | "normal";

function ProduitsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PRODUCTS_PAGE_SIZE);

  // Filtres avancés
  const [searchText, setSearchText] = useState("");
  // Debounce : la requête serveur (queryKey) ne se déclenche qu'après 300 ms sans frappe
  const debouncedSearch = useDebounce(searchText, 300);
  const [filterCategory, setFilterCategory] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("all");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { mode: viewMode, setMode: setViewMode } = useViewMode("produits", "list");

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchText.trim()) count++;
    if (filterCategory) count++;
    if (priceMin) count++;
    if (priceMax) count++;
    if (stockStatus !== "all") count++;
    return count;
  }, [searchText, filterCategory, priceMin, priceMax, stockStatus]);

  // Un changement de recherche réinitialise la pagination une fois stabilisée
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: productsData = { data: [], count: 0 } } = useQuery({
    queryKey: ["products", page, pageSize, debouncedSearch, filterCategory, priceMin, priceMax],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select("*, categories(name), lot_stock:lots(id, quantity)", { count: "exact", head: false });

      // Filtres serveur
      if (debouncedSearch.trim()) {
        query = query.or(`name.ilike.%${debouncedSearch.trim()}%,sku.ilike.%${debouncedSearch.trim()}%`);
      }
      if (filterCategory) {
        query = query.eq("category_id", filterCategory);
      }
      if (priceMin) {
        query = query.gte("sale_price", Number(priceMin));
      }
      if (priceMax) {
        query = query.lte("sale_price", Number(priceMax));
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Filtrage client-side pour le statut stock (dépend de lot_stock calculé)
  const filteredProducts = useMemo(() => {
    if (stockStatus === "all") return productsData.data;
    return productsData.data.filter((p: any) => {
      const totalStock = (p.lot_stock ?? []).reduce((s: number, ls: any) => s + Number(ls.quantity), 0);
      const min = Number(p.stock_min);
      if (stockStatus === "rupture") return totalStock <= 0;
      if (stockStatus === "faible") return totalStock > 0 && totalStock < min;
      // normal
      return totalStock >= min;
    });
  }, [productsData.data, stockStatus]);

  const products = filteredProducts;
  const totalProducts = productsData.count;
  const detail = productsData.data.find((p: any) => p.id === detailId);

  const clearFilters = () => {
    setSearchText("");
    setFilterCategory("");
    setPriceMin("");
    setPriceMax("");
    setStockStatus("all");
    setPage(1);
  };

  const deleteProductFn = useServerFn(deleteProduct);
  const del = useMutation({
    mutationFn: async (id: string) => {
      await deleteProductFn({ data: { id } });
    },
    onSuccess: () => { toast.success("Produit supprimé"); qc.invalidateQueries({ queryKey: ["products"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });


  const handleExportCsv = async () => {
    const { data: allProducts, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Erreur lors de l'export"); return; }
    exportToCsv(
      [
        { key: "name", label: "Nom" },
        { key: "sku", label: "SKU" },
        { key: "category", label: "Catégorie" },
        { key: "purchase_price", label: "Prix achat" },
        { key: "sale_price", label: "Prix vente" },
        { key: "tva", label: "TVA %" },
        { key: "stock_min", label: "Stock min" },
        { key: "barcode", label: "Code-barres" },
        { key: "description", label: "Description" },
      ],
      (allProducts ?? []).map((p: any) => ({
        name: p.name,
        sku: p.sku ?? "",
        category: p.categories?.name ?? "",
        purchase_price: Number(p.purchase_price).toFixed(2),
        sale_price: Number(p.sale_price).toFixed(2),
        tva: p.tva,
        stock_min: p.stock_min,
        barcode: p.barcode ?? "",
        description: p.description ?? "",
      })),
      `produits-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const openEdit = (product: any) => {
    setEditProduct(product);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
          <p className="mt-1 text-sm text-muted-foreground">Catalogue et fiches produits.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} title="Exporter en CSV">
            <FileDown className="mr-1 size-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQrOpen(true)}
            title="Afficher les QR codes de tous les produits"
          >
            <QrCode className="mr-1 size-4" />
            QR codes
          </Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditProduct(null); } }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditProduct(null)}><Plus className="mr-1 size-4" /> Nouveau produit</Button>
            </DialogTrigger>
            <ProductFormDialog
              categories={categories}
              product={editProduct}
              onClose={() => { setOpen(false); setEditProduct(null); }}
              onSaved={() => {
                qc.invalidateQueries({ queryKey: ["products"] });
                setOpen(false);
                setEditProduct(null);
              }}
            />
          </Dialog>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
              placeholder="Rechercher par nom ou SKU…"
              className="pl-8"
            />
            {searchText && (
              <button
                onClick={() => { setSearchText(""); setPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            variant={filtersVisible ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltersVisible(!filtersVisible)}
            className="relative"
          >
            <SlidersHorizontal className="mr-1 size-4" />
            Filtres
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 size-5 rounded-full p-0 text-[10px] font-medium leading-5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 size-4" />
              Effacer
            </Button>
          )}
        </div>

        {/* Filtres avancés */}
        {filtersVisible && (
          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Catégorie</Label>
              <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setPage(1); }}>
                <SelectTrigger className="h-8 min-w-[160px]">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Prix vente min</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={priceMin}
                onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                className="h-8 w-[120px]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Prix vente max</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="∞"
                value={priceMax}
                onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                className="h-8 w-[120px]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Stock</Label>
              <Select
                value={stockStatus}
                onValueChange={(v: StockStatus) => { setStockStatus(v); setPage(1); }}
              >
                <SelectTrigger className="h-8 min-w-[140px]">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="rupture">En rupture</SelectItem>
                  <SelectItem value="faible">Stock faible</SelectItem>
                  <SelectItem value="normal">Stock normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Barre d'affichage */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {products.length} produit(s) affiché(s) sur {totalProducts}
        </p>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Liste des produits */}
      {products.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <PackageIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            {activeFilterCount > 0
              ? "Aucun produit ne correspond aux filtres."
              : "Aucun produit. Créez le premier."}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="link" size="sm" onClick={clearFilters} className="mt-1">
              Effacer les filtres
            </Button>
          )}
        </div>
      ) : viewMode === "list" ? (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Prix vente</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p: any) => {
                const totalStock = productStock(p);
                return (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => setDetailId(p.id)}>
                    <TableCell className="flex items-center gap-3">
                      <ProductThumb product={p} className="size-10" iconClass="size-4" />
                      <span className="font-medium">{p.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.categories?.name ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatXOF(Number(p.sale_price))}</TableCell>
                    <TableCell className="text-right text-sm">{p.tva}%</TableCell>
                    <TableCell className="text-right"><StockBadge product={p} /></TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <RowActions product={p} onEdit={openEdit} onDelete={(id) => del.mutate(id)} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={totalProducts}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className={viewGridClass(viewMode)}>
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={p}
                mode={viewMode}
                onOpen={() => setDetailId(p.id)}
                onEdit={openEdit}
                onDelete={(id) => del.mutate(id)}
              />
            ))}
          </div>
          <div className="rounded-lg border border-border bg-card">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={totalProducts}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      )}

      {/* Détail produit */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetailId(null)}>
        {detail && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{detail.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                {detail.photo_url && <img src={detail.photo_url} alt="" className="w-full rounded border" />}
                <div className="text-sm">
                  <div><span className="text-muted-foreground">SKU :</span> <span className="font-mono">{detail.sku}</span></div>
                  <div><span className="text-muted-foreground">Code-barres :</span> <span className="font-mono">{detail.barcode}</span></div>
                  <div><span className="text-muted-foreground">Prix achat :</span> {formatXOF(Number(detail.purchase_price))}</div>
                  <div><span className="text-muted-foreground">Prix vente :</span> {formatXOF(Number(detail.sale_price))}</div>
                  <div><span className="text-muted-foreground">TVA :</span> {detail.tva}%</div>
                  <div><span className="text-muted-foreground">Stock min :</span> {detail.stock_min}</div>
                </div>
                {detail.description && <p className="text-sm text-muted-foreground">{detail.description}</p>}
              </div>
              <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-4">
                <QrPreview value={detail.sku} size={140} />
                {detail.barcode && <BarcodePreview value={detail.barcode} />}
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-1 size-4" /> Imprimer
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialogue QR codes batch */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>QR Codes — Produits ({products.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {products.map((p: any) => (
              <div key={p.id} className="flex flex-col items-center gap-1 rounded-lg border p-2">
                <QrPreview value={p.sku} size={80} />
                <span className="max-w-full truncate text-[10px] font-medium">{p.name}</span>
                <span className="font-mono text-[8px] text-muted-foreground">{p.sku}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-1 size-4" /> Imprimer
            </Button>
            <Button onClick={() => setQrOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductFormDialog({
  categories, product, onClose, onSaved,
}: { categories: any[]; product: any | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!product;
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      category_id: product?.category_id ?? "",
      purchase_price: product?.purchase_price ?? 0,
      sale_price: product?.sale_price ?? 0,
      tva: product?.tva ?? 18,
      stock_min: product?.stock_min ?? 0,
      description: product?.description ?? "",
    },
  });

  const upsertFn = useServerFn(upsertProduct);
  const save = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      setBusy(true);
      let photo_url: string | null = product?.photo_url ?? null;
      if (photoFile) {
        const compressed = await compressImage(photoFile, 800, 0.8);
        const path = `${Date.now()}-${compressed.name}`;
        const up = await supabase.storage.from("product-photos").upload(path, compressed, { upsert: false });
        if (up.error) throw up.error;
        const signed = await supabase.storage.from("product-photos").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        photo_url = signed.data?.signedUrl ?? null;
      }
      const sku = values.sku?.trim() || generateSKU();
      const payload = {
        ...(isEdit ? { id: product.id } : {}),
        name: values.name.trim(),
        sku,
        category_id: values.category_id || null,
        photo_url,
        purchase_price: Number(values.purchase_price),
        sale_price: Number(values.sale_price),
        tva: Number(values.tva),
        stock_min: Number(values.stock_min),
        description: values.description || null,
        ...(isEdit ? {} : { barcode: generateBarcode() }),
      };
      await upsertFn({ data: payload });
    },
    onSuccess: () => { toast.success(isEdit ? "Produit modifié" : "Produit créé"); onSaved(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
    onSettled: () => setBusy(false),
  });


  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{isEdit ? "Modifier le produit" : "Nouveau produit"}</DialogTitle></DialogHeader>
      <form onSubmit={form.handleSubmit((values) => save.mutate(values))} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU (auto si vide)</Label>
            <Input id="sku" {...form.register("sku")} />
          </div>
          <div className="grid gap-2">
            <Label>Catégorie</Label>
            <Select value={form.watch("category_id")} onValueChange={(v) => form.setValue("category_id", v)}>
              <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="purchase_price">Prix achat</Label>
            <Input id="purchase_price" type="number" step="0.01" {...form.register("purchase_price")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sale_price">Prix vente</Label>
            <Input id="sale_price" type="number" step="0.01" {...form.register("sale_price")} />
            {form.formState.errors.sale_price && (
              <p className="text-xs text-destructive">{form.formState.errors.sale_price.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tva">TVA %</Label>
            <Input id="tva" type="number" step="0.01" {...form.register("tva")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="stock_min">Stock min</Label>
            <Input id="stock_min" type="number" {...form.register("stock_min")} />
          </div>
          <div className="grid gap-2">
            <Label>Photo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={2} {...form.register("description")} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={busy}>{busy ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ---------- Vues produits ---------- */

function productStock(p: any): number {
  return (p.lot_stock ?? []).reduce((s: number, ls: any) => s + Number(ls.quantity), 0);
}

function ProductThumb({
  product, className = "size-10", iconClass = "size-4",
}: { product: any; className?: string; iconClass?: string }) {
  if (product.photo_url) {
    return (
      <img
        src={product.photo_url}
        alt={product.name}
        className={`${className} rounded object-cover`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`${className} flex items-center justify-center rounded bg-muted text-muted-foreground`}>
      <PackageIcon className={iconClass} />
    </div>
  );
}

function StockBadge({ product }: { product: any }) {
  const total = productStock(product);
  const min = Number(product.stock_min);
  const status = total <= 0 ? "rupture" : total < min ? "faible" : "normal";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        status === "rupture"
          ? "bg-red-500/10 text-red-600"
          : status === "faible"
          ? "bg-orange-500/10 text-orange-600"
          : "bg-emerald-500/10 text-emerald-600"
      }`}
    >
      {total.toFixed(0)}
    </span>
  );
}

function RowActions({
  product, onEdit, onDelete,
}: { product: any; onEdit: (p: any) => void; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => onEdit(product)} aria-label="Modifier">
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
            <AlertDialogTitle>Supprimer le produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{product.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(product.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductCard({
  product: p, mode, onOpen, onEdit, onDelete,
}: {
  product: any;
  mode: ViewMode;
  onOpen: () => void;
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
}) {
  // Mosaïque : vignette compacte
  if (mode === "mosaic") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group flex flex-col items-center gap-1 rounded-lg border bg-card p-2 text-center transition hover:border-primary/40 hover:shadow-sm"
        title={p.name}
      >
        <ProductThumb product={p} className="size-14 w-full" iconClass="size-5" />
        <span className="line-clamp-2 text-[11px] font-medium leading-tight">{p.name}</span>
        <StockBadge product={p} />
      </button>
    );
  }

  // Détails : toutes les informations en ligne
  if (mode === "details") {
    return (
      <div className="flex gap-3 rounded-lg border bg-card p-3 transition hover:border-primary/40">
        <button type="button" onClick={onOpen} className="shrink-0" aria-label={`Ouvrir ${p.name}`}>
          <ProductThumb product={p} className="size-20" iconClass="size-6" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button type="button" onClick={onOpen} className="min-w-0 text-left">
              <p className="truncate font-medium">{p.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{p.sku}</p>
            </button>
            <RowActions product={p} onEdit={onEdit} onDelete={onDelete} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
            <span>Catégorie : <span className="text-foreground">{p.categories?.name ?? "—"}</span></span>
            <span>Achat : <span className="text-foreground">{formatXOF(Number(p.purchase_price))}</span></span>
            <span>Vente : <span className="text-foreground">{formatXOF(Number(p.sale_price))}</span></span>
            <span>TVA : <span className="text-foreground">{p.tva}%</span></span>
            <span>Stock min : <span className="text-foreground">{p.stock_min}</span></span>
            <span className="flex items-center gap-1">Stock : <StockBadge product={p} /></span>
          </div>
          {p.description && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
          )}
        </div>
      </div>
    );
  }

  // Grandes / très grandes icônes
  const isXl = mode === "xl-icons";
  return (
    <div className="group flex flex-col rounded-lg border bg-card transition hover:border-primary/40 hover:shadow-sm">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <ProductThumb
          product={p}
          className={`w-full rounded-b-none ${isXl ? "h-48" : "h-32"}`}
          iconClass={isXl ? "size-10" : "size-7"}
        />
      </button>
      <div className={`flex flex-1 flex-col gap-1 p-3 ${isXl ? "" : "p-2"}`}>
        <button type="button" onClick={onOpen} className="text-left">
          <p className={`line-clamp-2 font-medium leading-tight ${isXl ? "text-base" : "text-sm"}`}>{p.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{p.sku}</p>
        </button>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div>
            <p className={`font-semibold ${isXl ? "text-base" : "text-sm"}`}>{formatXOF(Number(p.sale_price))}</p>
            {isXl && (
              <p className="text-[11px] text-muted-foreground">{p.categories?.name ?? "Sans catégorie"}</p>
            )}
          </div>
          <StockBadge product={p} />
        </div>
        <RowActions product={p} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
