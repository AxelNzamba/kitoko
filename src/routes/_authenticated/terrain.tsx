import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ScanLine, ArrowDownLeft, ArrowUpRight, ClipboardCheck,
  PackageCheck, Camera, X, Plus, Minus, Save, Truck, CloudOff,
} from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useWarehouseFilter } from "@/lib/warehouse-filter";
import { useOnlineStatus } from "@/lib/sync/hooks";
import {
  cachedLotByNumber, cachedLotsForProduct, cachedOpenSessions, cachedProductByCode,
  cachedProductById, cachedProducts, getLocalUserId, insertOrQueue, withOfflineFallback,
  isNetworkError,
} from "@/lib/offline/terrain-offline";
import {
  getCachedOrders, queueOrderStatus, setCachedOrders, type CachedOrder,
} from "@/lib/offline/receipts-offline";

export const Route = createFileRoute("/_authenticated/terrain")({
  component: TerrainPage,
  head: () => ({
    meta: [
      { title: "Mode terrain — INDUS-ERP" },
      { name: "description", content: "Interface terrain optimisée mobile pour scanner, entrées/sorties et inventaire rapide." },
      { property: "og:title", content: "Mode terrain — INDUS-ERP" },
      { property: "og:description", content: "Interface terrain optimisée mobile pour scanner, entrées/sorties et inventaire rapide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type ActionMode = "scan" | "in" | "out" | "count" | "receive";

/** Résultat d'un scan : un lot (avec son produit) ou un produit seul. */
type ScanResult = {
  lot: any | null;
  product: any | null;
};

const nextFrame = () =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") return resolve();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

function TerrainPage() {
  const [mode, setMode] = useState<ActionMode>("scan");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<ScanResult | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "terrain-scanner";
  const { selectedWarehouseId, applyFilter } = useWarehouseFilter();

  const stopScanner = () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      scanner?.stop().catch(() => {});
    };
  }, []);

  const startScanner = async () => {
    if (scannerRef.current) return;
    setScanning(true);
    setScanned(null);
    // Le conteneur doit exister dans le DOM avant l'initialisation.
    await nextFrame();
    if (!document.getElementById(scannerDivId)) {
      setScanning(false);
      toast.error("Zone de scan indisponible");
      return;
    }
    try {
      const scanner = new Html5Qrcode(scannerDivId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { void handleScan(decodedText); },
        () => {},
      );
    } catch {
      scannerRef.current = null;
      toast.error("Impossible d'accéder à la caméra (autorisation refusée ou HTTPS requis)");
      setScanning(false);
    }
  };

  /**
   * Recherche un lot par numéro, sinon un produit par SKU ou code-barres.
   * Fonctionne hors-ligne grâce au miroir local (lots/produits synchronisés).
   */
  const handleScan = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) {
      toast.error("Code vide");
      return;
    }

    let lot: any = null;
    let product: any = null;
    let fromCache = false;
    try {
      const found = await withOfflineFallback<{ lot: any; product: any; cache: boolean }>(
        async () => {
          let lotQuery = supabase
            .from("lots")
            .select("*, products(id, name, sku, sale_price, purchase_price)")
            .eq("lot_number", code)
            .limit(1);
          lotQuery = applyFilter(lotQuery, "warehouse_id");
          const { data: lots, error } = await lotQuery;
          if (error) throw error;
          const l = lots?.[0] ?? null;
          if (l) return { lot: l, product: (l as any).products ?? null, cache: false };
          const { data: products, error: pErr } = await supabase
            .from("products")
            .select("id, name, sku, barcode, sale_price, purchase_price")
            .or(`sku.eq.${code},barcode.eq.${code}`)
            .limit(1);
          if (pErr) throw pErr;
          return { lot: null, product: products?.[0] ?? null, cache: false };
        },
        async () => {
          const l = await cachedLotByNumber(code, selectedWarehouseId);
          if (l) {
            const p = l.product_id ? await cachedProductById(String(l.product_id)) : null;
            return { lot: l, product: p, cache: true };
          }
          return { lot: null, product: await cachedProductByCode(code), cache: true };
        },
      );
      lot = found.lot;
      product = found.product;
      fromCache = found.cache;
    } catch (e: any) {
      toast.error(e?.message ?? "Recherche impossible");
      return;
    }

    const suffix = fromCache ? " (données locales)" : "";
    if (lot) {
      setScanned({ lot, product });
      stopScanner();
      toast.success(`Lot ${code} reconnu — ${product?.name ?? ""}${suffix}`);
      return;
    }
    if (product) {
      setScanned({ lot: null, product });
      stopScanner();
      toast.success(`Produit reconnu — ${product.name}${suffix}`);
      return;
    }

    toast.error(
      fromCache
        ? `Aucun lot ni produit pour « ${code} » dans les données locales (synchronisez une fois en ligne)`
        : `Aucun lot ni produit pour « ${code} »`,
    );
  };

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-24">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Mode terrain</h1>
        <p className="text-sm text-muted-foreground">
          Opérations rapides sur mobile
          {selectedWarehouseId && selectedWarehouseId !== "all" ? " — entrepôt actif" : " — tous les entrepôts"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ModeButton active={mode === "scan" && !scanning} onClick={() => { setMode("scan"); stopScanner(); }} icon={ScanLine} label="Scanner" />
        <ModeButton active={mode === "in"} onClick={() => { setMode("in"); stopScanner(); }} icon={ArrowDownLeft} label="Entrée" />
        <ModeButton active={mode === "out"} onClick={() => { setMode("out"); stopScanner(); }} icon={ArrowUpRight} label="Sortie" />
        <ModeButton active={mode === "count"} onClick={() => { setMode("count"); stopScanner(); }} icon={ClipboardCheck} label="Inventaire" />
        <ModeButton active={mode === "receive"} onClick={() => { setMode("receive"); stopScanner(); }} icon={Truck} label="Réception" />
        <ModeButton active={scanning} onClick={() => (scanning ? stopScanner() : void startScanner())} icon={Camera} label={scanning ? "Arrêter" : "Caméra"} />
      </div>

      {scanning && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm">Scan en cours</CardTitle>
            <Button variant="ghost" size="icon" onClick={stopScanner} aria-label="Arrêter le scan">
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div id={scannerDivId} className="w-full overflow-hidden rounded" />
          </CardContent>
        </Card>
      )}

      {scanned && <ScanSummary scanned={scanned} onClear={() => setScanned(null)} />}

      {mode === "scan" && !scanning && <ScanLookup onScan={handleScan} />}
      {mode === "in" && <QuickMovement type="entree" scanned={scanned} onClear={() => setScanned(null)} />}
      {mode === "out" && <QuickMovement type="sortie" scanned={scanned} onClear={() => setScanned(null)} />}
      {mode === "count" && <QuickCount scanned={scanned} />}
      {mode === "receive" && <QuickReceive />}
    </div>
  );
}

function ModeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className="h-auto min-h-14 flex-col gap-1 py-3"
      onClick={onClick}
    >
      <Icon className="size-5" />
      <span className="text-[10px]">{label}</span>
    </Button>
  );
}

function ScanSummary({ scanned, onClear }: { scanned: ScanResult; onClear: () => void }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border bg-muted/50 p-3">
      <div className="min-w-0 text-xs">
        <p className="truncate font-medium">{scanned.product?.name ?? "Produit inconnu"}</p>
        <p className="text-muted-foreground">
          {scanned.lot ? `Lot ${scanned.lot.lot_number}` : `SKU ${scanned.product?.sku ?? "—"}`}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onClear} aria-label="Effacer la sélection">
        <X className="size-4" />
      </Button>
    </div>
  );
}

function ScanLookup({ onScan }: { onScan: (code: string) => Promise<void> }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try { await onScan(code); } finally { setBusy(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Recherche manuelle</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Numéro de lot, SKU ou code-barres"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && code.trim()) void run(); }}
        />
        <Button className="h-14 w-full" onClick={() => void run()} disabled={!code.trim() || busy}>
          Rechercher
        </Button>
      </CardContent>
    </Card>
  );
}

function QuickMovement({
  type, scanned, onClear,
}: { type: "entree" | "sortie"; scanned: ScanResult | null; onClear: () => void }) {
  const qc = useQueryClient();
  const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
  const [productId, setProductId] = useState<string>(scanned?.product?.id ?? "");
  const [lotId, setLotId] = useState<string>(scanned?.lot?.id ?? "");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (scanned?.product?.id) setProductId(scanned.product.id);
    if (scanned?.lot?.id) setLotId(scanned.lot.id);
  }, [scanned]);

  const { data: products = [] } = useQuery({
    queryKey: ["products", "min"],
    queryFn: () =>
      withOfflineFallback<any[]>(
        async () => {
          const { data, error } = await supabase.from("products").select("id, name, sku").order("name");
          if (error) throw error;
          return data ?? [];
        },
        cachedProducts,
      ),
  });

  const { data: lots = [] } = useQuery({
    queryKey: ["lots", "terrain", productId, selectedWarehouseId],
    enabled: !!productId,
    queryFn: () =>
      withOfflineFallback<any[]>(
        async () => {
          let q = supabase.from("lots").select("id, lot_number").eq("product_id", productId);
          q = applyFilter(q, "warehouse_id");
          const { data, error } = await q.order("reception_date", { ascending: false });
          if (error) throw error;
          return data ?? [];
        },
        () => cachedLotsForProduct(productId, selectedWarehouseId),
      ),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error("Sélectionnez un produit");
      const quantity = Number(qty);
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantité invalide");
      if (!Number.isInteger(quantity)) throw new Error("La quantité doit être un nombre entier");

      const userId = await getLocalUserId();
      if (!userId) throw new Error("Session expirée — reconnectez-vous");
      const payload: Record<string, unknown> = {
        product_id: productId,
        lot_id: lotId || null,
        type,
        quantity,
        reason: reason || (type === "entree" ? "Entrée terrain" : "Sortie terrain"),
        created_by: userId,
      };
      if (selectedWarehouseId && selectedWarehouseId !== "all") payload.warehouse_id = selectedWarehouseId;
      return insertOrQueue("stock_movements", payload);
    },
    onSuccess: ({ queued }) => {
      const label = type === "entree" ? "Entrée" : "Sortie";
      if (queued) toast.info(`${label} enregistrée hors-ligne — envoi automatique au retour du réseau`);
      else toast.success(`${label} enregistrée`);
      qc.invalidateQueries({ queryKey: ["movements"] });
      qc.invalidateQueries({ queryKey: ["lot_stock"] });
      setQty("1"); setReason(""); setLotId(""); onClear();
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{type === "entree" ? "Entrée de stock" : "Sortie de stock"}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Select value={productId} onValueChange={(v) => { setProductId(v); setLotId(""); }}>
          <SelectTrigger className="h-12"><SelectValue placeholder="Produit" /></SelectTrigger>
          <SelectContent>
            {products.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.name}{p.sku ? ` — ${p.sku}` : ""}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={lotId} onValueChange={setLotId} disabled={!productId}>
          <SelectTrigger className="h-12"><SelectValue placeholder="Lot (optionnel)" /></SelectTrigger>
          <SelectContent>
            {lots.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.lot_number}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-12" aria-label="Diminuer"
            onClick={() => setQty(String(Math.max(1, Number(qty || 1) - 1)))}>
            <Minus className="size-4" />
          </Button>
          <Input type="number" min="1" className="h-12 text-center text-lg" value={qty}
            onChange={(e) => setQty(e.target.value)} />
          <Button variant="outline" size="icon" className="size-12" aria-label="Augmenter"
            onClick={() => setQty(String(Number(qty || 0) + 1))}>
            <Plus className="size-4" />
          </Button>
        </div>

        <Input placeholder="Motif" value={reason} onChange={(e) => setReason(e.target.value)} className="h-12" />

        <Button className="h-14 w-full" onClick={() => save.mutate()}
          disabled={save.isPending || !productId || !qty}>
          <Save className="mr-2 size-4" />
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}

function QuickCount({ scanned }: { scanned: ScanResult | null }) {
  const qc = useQueryClient();
  const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
  const [sessionId, setSessionId] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [qty, setQty] = useState("");

  useEffect(() => {
    if (scanned?.lot?.lot_number) setLotNumber(scanned.lot.lot_number);
  }, [scanned]);

  const { data: sessions = [] } = useQuery({
    queryKey: ["inv_sessions_open", selectedWarehouseId],
    queryFn: () =>
      withOfflineFallback<any[]>(
        async () => {
          let q = (supabase as any)
            .from("inventory_sessions")
            .select("id, name")
            .eq("status", "ouverte")
            .order("created_at", { ascending: false });
          q = applyFilter(q, "warehouse_id");
          const { data, error } = await q;
          if (error) throw error;
          return data ?? [];
        },
        () => cachedOpenSessions(selectedWarehouseId),
      ),
  });

  const save = useMutation({
    mutationFn: async () => {
      const quantity = Number(qty);
      if (!Number.isFinite(quantity) || quantity < 0) throw new Error("Quantité invalide");
      if (!Number.isInteger(quantity)) throw new Error("La quantité doit être un nombre entier");
      const number = lotNumber.trim();

      const lot = await withOfflineFallback<{ id: string; warehouse_id?: string | null } | null>(
        async () => {
          let lotQuery = supabase.from("lots").select("id, warehouse_id").eq("lot_number", number).limit(1);
          lotQuery = applyFilter(lotQuery, "warehouse_id");
          const { data: lots, error } = await lotQuery;
          if (error) throw error;
          return lots?.[0] ?? null;
        },
        async () => {
          const l = await cachedLotByNumber(number, selectedWarehouseId);
          return l ? { id: l.id, warehouse_id: (l.warehouse_id as string | null) ?? null } : null;
        },
      );
      if (!lot) throw new Error("Lot introuvable dans cet entrepôt");

      const payload: Record<string, unknown> = {
        session_id: sessionId,
        lot_id: lot.id,
        counted_quantity: quantity,
      };
      const wh = lot.warehouse_id ?? (selectedWarehouseId !== "all" ? selectedWarehouseId : null);
      if (wh) payload.warehouse_id = wh;
      return insertOrQueue("inventory_counts", payload);
    },
    onSuccess: ({ queued }) => {
      if (queued) toast.info("Comptage enregistré hors-ligne — envoi automatique au retour du réseau");
      else toast.success("Comptage enregistré");
      setLotNumber(""); setQty("");
      qc.invalidateQueries({ queryKey: ["counts"] });
      qc.invalidateQueries({ queryKey: ["inventory_counts"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Comptage rapide</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Select value={sessionId} onValueChange={setSessionId}>
          <SelectTrigger className="h-12"><SelectValue placeholder="Session d'inventaire" /></SelectTrigger>
          <SelectContent>
            {sessions.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {sessions.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucune session ouverte pour cet entrepôt. Créez-la depuis l'écran Inventaire.
          </p>
        )}
        <Input placeholder="Numéro de lot" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} className="h-12" />
        <Input type="number" min="0" placeholder="Quantité comptée" value={qty} onChange={(e) => setQty(e.target.value)} className="h-12" />
        <Button className="h-14 w-full" onClick={() => save.mutate()}
          disabled={save.isPending || !sessionId || !lotNumber.trim() || qty === ""}>
          <ClipboardCheck className="mr-2 size-4" />
          Enregistrer le comptage
        </Button>
      </CardContent>
    </Card>
  );
}

function QuickReceive() {
  const qc = useQueryClient();
  const online = useOnlineStatus();
  const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
  const [poId, setPoId] = useState("");
  const [qty, setQty] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["po_to_receive", selectedWarehouseId, online],
    networkMode: "always",
    queryFn: async () => {
      const filterLocal = (list: CachedOrder[]) =>
        list.filter((o) => !selectedWarehouseId || selectedWarehouseId === "all" || o.warehouse_id === selectedWarehouseId);
      if (!online) return filterLocal(getCachedOrders());
      try {
        let q = (supabase as any)
          .from("purchase_orders")
          .select("id, po_number, supplier_id, warehouse_id, purchase_order_items(product_id, quantity_ordered, unit_price)")
          .in("status", ["envoyee", "partielle"]);
        q = applyFilter(q, "warehouse_id");
        const { data, error } = await q;
        if (error) throw error;
        const list = (data ?? []) as CachedOrder[];
        if (!selectedWarehouseId || selectedWarehouseId === "all") setCachedOrders(list);
        else {
          const others = getCachedOrders().filter((o) => o.warehouse_id !== selectedWarehouseId);
          setCachedOrders([...others, ...list]);
        }
        return list;
      } catch (e) {
        if (isNetworkError(e)) return filterLocal(getCachedOrders());
        throw e;
      }
    },
  });

  const receive = useMutation({
    mutationFn: async (): Promise<{ queued: boolean }> => {
      const order = (orders as CachedOrder[]).find((o) => o.id === poId);
      if (!order) throw new Error("Commande introuvable");

      const items = order.purchase_order_items ?? [];
      if (items.length === 0) throw new Error("Cette commande n'a aucune ligne");

      const totalOrdered = items.reduce((a, i) => a + Number(i.quantity_ordered), 0);
      const qtyNum = Number(qty);
      if (!Number.isFinite(qtyNum) || qtyNum <= 0 || qtyNum > totalOrdered) {
        throw new Error(`Quantité invalide (max ${totalOrdered})`);
      }

      const userId = await getLocalUserId();
      const warehouseId =
        order.warehouse_id ??
        (selectedWarehouseId && selectedWarehouseId !== "all" ? selectedWarehouseId : null);

      let queued = false;
      for (const it of items) {
        const r = await insertOrQueue("stock_movements", {
          product_id: it.product_id,
          type: "entree",
          quantity: qtyNum * (Number(it.quantity_ordered) / totalOrdered),
          unit_price: it.unit_price,
          reason: `Réception ${order.po_number}`,
          created_by: userId,
          warehouse_id: warehouseId,
        });
        queued = queued || r.queued;
      }

      const status = qtyNum >= totalOrdered ? "receptionnee" : "partielle";
      if (queued) {
        queueOrderStatus(poId, status);
      } else {
        const { error: updateError } = await (supabase as any)
          .from("purchase_orders").update({ status }).eq("id", poId);
        if (updateError) {
          if (!isNetworkError(updateError)) throw updateError;
          queueOrderStatus(poId, status);
          queued = true;
        }
      }
      return { queued };
    },
    onSuccess: (r) => {
      toast.success(r.queued
        ? "Réception enregistrée hors-ligne — envoi automatique au retour du réseau"
        : "Réception enregistrée");
      setPoId(""); setQty("");
      qc.invalidateQueries({ queryKey: ["po_to_receive"] });
      qc.invalidateQueries({ queryKey: ["purchase_orders"] });
      qc.invalidateQueries({ queryKey: ["movements"] });
      qc.invalidateQueries({ queryKey: ["lot_stock"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Réception fournisseur</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {!online && (
          <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs">
            <CloudOff className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>
              Hors-ligne : seules les commandes déjà consultées avec le réseau sont listées.
              La réception sera envoyée automatiquement au retour de la connexion.
            </span>
          </div>
        )}
        <Select value={poId} onValueChange={setPoId}>
          <SelectTrigger className="h-12"><SelectValue placeholder="Commande à réceptionner" /></SelectTrigger>
          <SelectContent>
            {orders.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.po_number}</SelectItem>)}
          </SelectContent>
        </Select>
        {orders.length === 0 && (
          <p className="text-xs text-muted-foreground">Aucune commande en attente de réception.</p>
        )}
        <Input type="number" min="1" placeholder="Quantité totale reçue" value={qty}
          onChange={(e) => setQty(e.target.value)} className="h-12" />
        <Button className="h-14 w-full" onClick={() => receive.mutate()}
          disabled={receive.isPending || !poId || !qty}>
          <PackageCheck className="mr-2 size-4" />
          Réceptionner
        </Button>
      </CardContent>
    </Card>
  );
}
