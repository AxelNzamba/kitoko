import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  ArrowLeftRight,
  Building2,
  ChevronRight,
  ChevronDown,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useWarehouseFilter } from "@/lib/warehouse-filter";
import { LocationExplorer, type LocationRow } from "@/components/location-tree";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/_authenticated/emplacements")({
  component: EmplacementsPage,
  head: () => ({ meta: [{ title: "Emplacements — INDUS-ERP" },
      { name: "description", content: "Emplacements — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Emplacements — INDUS-ERP" },
      { property: "og:description", content: "Emplacements — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

function EmplacementsPage() {
  const qc = useQueryClient();
  const { applyFilter, selectedWarehouseId } = useWarehouseFilter();
  const [activeTab, setActiveTab] = useState<"warehouses" | "locations">("warehouses");

  // Warehouses state
  const [whOpen, setWhOpen] = useState(false);
  const [editWh, setEditWh] = useState<any | null>(null);
  const [whName, setWhName] = useState("");
  const [whCode, setWhCode] = useState("");
  const [whAddress, setWhAddress] = useState("");
  const [whActive, setWhActive] = useState(true);

  // Locations state
  const [locOpen, setLocOpen] = useState(false);
  const [editLoc, setEditLoc] = useState<any | null>(null);
  const [locName, setLocName] = useState("");
  const [locWh, setLocWh] = useState("");
  const [locZone, setLocZone] = useState("");
  const [locAisle, setLocAisle] = useState("");
  const [locRack, setLocRack] = useState("");
  const [locBay, setLocBay] = useState("");
  const [locLevel, setLocLevel] = useState("");
  const [locDesc, setLocDesc] = useState("");
  const [locActive, setLocActive] = useState(true);

  // Transfer state
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromLoc, setFromLoc] = useState("");
  const [toLoc, setToLoc] = useState("");
  const [transferProduct, setTransferProduct] = useState("");
  const [transferQty, setTransferQty] = useState("1");

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("warehouses").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["stock-locations", selectedWarehouseId],
    queryFn: async () => {
      let q = (supabase as any).from("stock_locations").select("*, warehouses(name)").order("name");
      q = applyFilter(q, "warehouse_id");
      const { data } = await q;
      return data ?? [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", "min"],
    queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? [],
  });

  const openWhNew = () => {
    setEditWh(null);
    setWhName("");
    setWhCode("");
    setWhAddress("");
    setWhActive(true);
    setWhOpen(true);
  };

  const openWhEdit = (w: any) => {
    setEditWh(w);
    setWhName(w.name);
    setWhCode(w.code ?? "");
    setWhAddress(w.address ?? "");
    setWhActive(w.is_active);
    setWhOpen(true);
  };

  const saveWarehouse = useMutation({
    mutationFn: async () => {
      if (!whName.trim()) throw new Error("Le nom est requis");
      const payload = {
        name: whName.trim(),
        code: whCode.trim() || null,
        address: whAddress.trim() || null,
        is_active: whActive,
      };
      if (editWh) {
        const { error } = await (supabase as any).from("warehouses").update(payload).eq("id", editWh.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("warehouses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editWh ? "Entrepôt modifié" : "Entrepôt créé");
      qc.invalidateQueries({ queryKey: ["warehouses"] });
      setWhOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delWarehouse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("warehouses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Entrepôt supprimé"); qc.invalidateQueries({ queryKey: ["warehouses"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const openLocNew = () => {
    setEditLoc(null);
    setLocName("");
    setLocWh(selectedWarehouseId === "all" ? "" : selectedWarehouseId);
    setLocZone("");
    setLocAisle("");
    setLocRack("");
    setLocBay("");
    setLocLevel("");
    setLocDesc("");
    setLocActive(true);
    setLocOpen(true);
  };

  const openLocEdit = (loc: any) => {
    setEditLoc(loc);
    setLocName(loc.name);
    setLocWh(loc.warehouse_id ?? "");
    setLocZone(loc.zone ?? "");
    setLocAisle(loc.aisle ?? "");
    setLocRack(loc.rack ?? "");
    setLocBay(loc.bay ?? "");
    setLocLevel(loc.level ?? "");
    setLocDesc(loc.description ?? "");
    setLocActive(loc.is_active);
    setLocOpen(true);
  };

  const saveLocation = useMutation({
    mutationFn: async () => {
      if (!locName.trim()) throw new Error("Le nom est requis");
      if (!locWh.trim()) throw new Error("L'entrepôt est requis");
      const payload = {
        name: locName.trim(),
        warehouse_id: locWh,
        zone: locZone.trim() || null,
        aisle: locAisle.trim() || null,
        rack: locRack.trim() || null,
        bay: locBay.trim() || null,
        level: locLevel.trim() || null,
        description: locDesc.trim() || null,
        is_active: locActive,
      };
      if (editLoc) {
        const { error } = await (supabase as any).from("stock_locations").update(payload).eq("id", editLoc.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("stock_locations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editLoc ? "Emplacement modifié" : "Emplacement créé");
      qc.invalidateQueries({ queryKey: ["stock-locations"] });
      setLocOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("stock_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Emplacement supprimé"); qc.invalidateQueries({ queryKey: ["stock-locations"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const doTransfer = useMutation({
    mutationFn: async () => {
      if (!fromLoc || !toLoc || !transferProduct || !transferQty) throw new Error("Veuillez remplir tous les champs");
      if (fromLoc === toLoc) throw new Error("Les emplacements doivent être différents");
      const { data: userRes } = await supabase.auth.getUser();
      const qty = Number(transferQty);
      if (qty <= 0) throw new Error("La quantité doit être positive");

      const fromWarehouse = locations.find((l: any) => l.id === fromLoc)?.warehouse_id;
      const toWarehouse = locations.find((l: any) => l.id === toLoc)?.warehouse_id;

      const { error: err1 } = await (supabase as any).from("stock_movements").insert({
        product_id: transferProduct,
        type: "sortie",
        quantity: qty,
        reason: "Transfert vers autre emplacement",
        location_id: fromLoc,
        warehouse_id: fromWarehouse,
        created_by: userRes.user?.id,
      });
      if (err1) throw err1;

      const { error: err2 } = await (supabase as any).from("stock_movements").insert({
        product_id: transferProduct,
        type: "entree",
        quantity: qty,
        reason: "Transfert depuis autre emplacement",
        location_id: toLoc,
        warehouse_id: toWarehouse,
        created_by: userRes.user?.id,
      });
      if (err2) throw err2;
    },
    onSuccess: () => {
      toast.success("Transfert effectué");
      notify.info("Transfert stock", `Transfert de ${transferQty} unité(s) effectué`);
      setTransferOpen(false);
      setFromLoc(""); setToLoc(""); setTransferProduct(""); setTransferQty("1");
      qc.invalidateQueries({ queryKey: ["movements"] });
      qc.invalidateQueries({ queryKey: ["lot_stock"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrepôts & Emplacements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez vos entrepôts et localisez précisément chaque lot (zone, allée, rack, rayon, niveau).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setTransferOpen(true)}>
            <ArrowLeftRight className="mr-1 size-4" /> Transférer
          </Button>
          <Button variant={activeTab === "warehouses" ? "default" : "outline"} onClick={() => setActiveTab("warehouses")}>
            <Building2 className="mr-1 size-4" /> Entrepôts
          </Button>
          <Button variant={activeTab === "locations" ? "default" : "outline"} onClick={() => setActiveTab("locations")}>
            <MapPin className="mr-1 size-4" /> Emplacements
          </Button>
        </div>
      </div>

      {activeTab === "warehouses" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openWhNew}><Plus className="mr-1 size-4" /> Nouvel entrepôt</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {warehouses.map((w: any) => (
              <div key={w.id} className={`rounded-lg border p-4 ${w.is_active ? "border-border bg-card" : "border-dashed bg-muted/30"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Warehouse className={`size-5 ${w.is_active ? "text-accent" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-semibold text-sm">{w.name}</p>
                      {w.code && <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{w.code}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openWhEdit(w)}><Pencil className="size-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm"><Trash2 className="size-3.5 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'entrepôt ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer <strong>{w.name}</strong> ? Les emplacements et mouvements liés conserveront une référence historique.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => delWarehouse.mutate(w.id)} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {w.address && <p className="mt-2 text-xs text-muted-foreground">{w.address}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${w.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {w.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            ))}
            {warehouses.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
                <Warehouse className="mb-2 size-8 text-muted-foreground/40" />
                Aucun entrepôt. Créez le premier.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "locations" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openLocNew}><Plus className="mr-1 size-4" /> Nouvel emplacement</Button>
          </div>
          <LocationExplorer
            locations={locations as any}
            warehouses={warehouses as any}
            onEdit={(loc: LocationRow) => openLocEdit(loc)}
            onDelete={(id: string) => delLocation.mutate(id)}
            onQuickCreate={(prefill: { warehouse_id: string; zone?: string }) => {
              openLocNew();
              setLocWh(prefill.warehouse_id);
              setLocZone(prefill.zone ?? "");
            }}
          />
        </div>
      )}


      {/* Dialogue entrepôt */}
      <Dialog open={whOpen} onOpenChange={setWhOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editWh ? "Modifier l'entrepôt" : "Nouvel entrepôt"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveWarehouse.mutate(); }} className="grid gap-4">
            <div className="grid gap-2"><Label>Nom *</Label><Input value={whName} onChange={(e) => setWhName(e.target.value)} placeholder="Entrepôt Nord" required /></div>
            <div className="grid gap-2"><Label>Code</Label><Input value={whCode} onChange={(e) => setWhCode(e.target.value)} placeholder="ENK" /></div>
            <div className="grid gap-2"><Label>Adresse</Label><Textarea value={whAddress} onChange={(e) => setWhAddress(e.target.value)} rows={2} /></div>
            <div className="flex items-center gap-2"><Switch checked={whActive} onCheckedChange={setWhActive} /><Label>Actif</Label></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setWhOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveWarehouse.isPending}>{saveWarehouse.isPending ? "..." : "Enregistrer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue emplacement */}
      <Dialog open={locOpen} onOpenChange={setLocOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editLoc ? "Modifier l'emplacement" : "Nouvel emplacement"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveLocation.mutate(); }} className="grid gap-4">
            <div className="grid gap-2"><Label>Nom *</Label><Input value={locName} onChange={(e) => setLocName(e.target.value)} placeholder="Rack A-12" required /></div>
            <div className="grid gap-2"><Label>Entrepôt *</Label>
              <Select value={locWh} onValueChange={setLocWh}>
                <SelectTrigger><SelectValue placeholder="Choisir un entrepôt" /></SelectTrigger>
                <SelectContent>
                  {warehouses.filter((w: any) => w.is_active).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Zone</Label><Input value={locZone} onChange={(e) => setLocZone(e.target.value)} placeholder="Zone A" /></div>
              <div className="grid gap-2"><Label>Allée</Label><Input value={locAisle} onChange={(e) => setLocAisle(e.target.value)} placeholder="12" /></div>
              <div className="grid gap-2"><Label>Rack</Label><Input value={locRack} onChange={(e) => setLocRack(e.target.value)} placeholder="A" /></div>
              <div className="grid gap-2"><Label>Rayon</Label><Input value={locBay} onChange={(e) => setLocBay(e.target.value)} placeholder="3" /></div>
              <div className="grid gap-2"><Label>Niveau</Label><Input value={locLevel} onChange={(e) => setLocLevel(e.target.value)} placeholder="2" /></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={locDesc} onChange={(e) => setLocDesc(e.target.value)} rows={2} /></div>
            <div className="flex items-center gap-2"><Switch checked={locActive} onCheckedChange={setLocActive} /><Label>Actif</Label></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLocOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveLocation.isPending}>{saveLocation.isPending ? "..." : "Enregistrer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue transfert */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transfert entre emplacements</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); doTransfer.mutate(); }} className="grid gap-4">
            <div className="grid gap-2"><Label>Produit *</Label>
              <Select value={transferProduct} onValueChange={setTransferProduct}>
                <SelectTrigger><SelectValue placeholder="Choisir un produit" /></SelectTrigger>
                <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Depuis *</Label>
              <Select value={fromLoc} onValueChange={setFromLoc}>
                <SelectTrigger><SelectValue placeholder="Emplacement source" /></SelectTrigger>
                <SelectContent>{locations.filter((l: any) => l.is_active).map((l: any) => <SelectItem key={l.id} value={l.id}>{locationLabel(l)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Vers *</Label>
              <Select value={toLoc} onValueChange={setToLoc}>
                <SelectTrigger><SelectValue placeholder="Emplacement destination" /></SelectTrigger>
                <SelectContent>{locations.filter((l: any) => l.is_active && l.id !== fromLoc).map((l: any) => <SelectItem key={l.id} value={l.id}>{locationLabel(l)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Quantité *</Label><Input type="number" min="1" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} required /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransferOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={doTransfer.isPending}>{doTransfer.isPending ? "..." : "Transférer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function locationLabel(loc: any) {
  const parts = [loc.name, loc.zone, loc.aisle, loc.rack, loc.bay, loc.level].filter(Boolean);
  return parts.join(" — ");
}
