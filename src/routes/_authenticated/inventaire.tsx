import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Camera, Plus, StopCircle, Check, FileDown } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/audit";

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToCsv } from "@/lib/csv";
import { exportTablePdf } from "@/lib/pdf-table";
import { formatDateTime } from "@/lib/format";
import { useWarehouseFilter } from "@/lib/warehouse-filter";

export const Route = createFileRoute("/_authenticated/inventaire")({
  component: InventairePage,
  head: () => ({ meta: [{ title: "Inventaire — INDUS-ERP" },
      { name: "description", content: "Inventaire — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Inventaire — INDUS-ERP" },
      { property: "og:description", content: "Inventaire — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

function InventairePage() {
  const qc = useQueryClient();
  const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [openNew, setOpenNew] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ["inv_sessions", selectedWarehouseId],
    queryFn: async () => {
      let q = supabase.from("inventory_sessions").select("*").order("created_at", { ascending: false });
      q = applyFilter(q, "warehouse_id");
      const { data } = await q;
      return data ?? [];
    },
  });

  const createSession = useMutation({
    mutationFn: async (name: string) => {
      const { data: u } = await supabase.auth.getUser();
      const payload: any = { name, created_by: u.user?.id };
      if (selectedWarehouseId && selectedWarehouseId !== "all") payload.warehouse_id = selectedWarehouseId;
      const { data, error } = await supabase.from("inventory_sessions")
        .insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (s) => { track({ module: "inventaire", action: "session_ouverte", label: `Session d'inventaire « ${s.name} » ouverte`, table: "inventory_sessions", recordId: s.id, warehouseId: (s as any).warehouse_id }); toast.success("Session créée"); qc.invalidateQueries({ queryKey: ["inv_sessions"] }); setActiveSession(s); setOpenNew(false); },
    onError: (e: any) => toast.error(e.message),
  });

  if (activeSession) {
    return <InventorySessionView session={activeSession} onExit={() => setActiveSession(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventaire</h1>
          <p className="mt-1 text-sm text-muted-foreground">Comptage par scanner QR et calcul d'écarts.</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild><Button><Plus className="mr-1 size-4" /> Nouvelle session</Button></DialogTrigger>
          <NewSessionDialog onSubmit={(n) => createSession.mutate(n)} onClose={() => setOpenNew(false)} />
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créée le</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 && <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">Aucune session.</TableCell></TableRow>}
            {sessions.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>
                  <span className={`rounded px-2 py-0.5 text-xs ${s.status === "ouverte" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {s.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleString("fr-FR")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setActiveSession(s)}>Ouvrir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function NewSessionDialog({ onSubmit, onClose }: { onSubmit: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState(`Inventaire ${new Date().toLocaleDateString("fr-FR")}`);
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nouvelle session</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim()); }} className="grid gap-4">
        <div className="grid gap-2"><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit">Créer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function InventorySessionView({ session, onExit }: { session: any; onExit: () => void }) {
  const qc = useQueryClient();
  const { selectedWarehouseId } = useWarehouseFilter();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedLot, setScannedLot] = useState<any | null>(null);
  const [countValue, setCountValue] = useState("");

  const { data: counts = [] } = useQuery({
    queryKey: ["counts", session.id],
    queryFn: async () => (await supabase.from("inventory_counts")
      .select("*, lots(lot_number, quantity, products(name, sku))")
      .eq("session_id", session.id)
      .order("created_at")).data ?? [],
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
      const { data } = await q;
      return data ?? [];
    },
  });
  const stockMap = new Map(stockView.map((s: any) => [s.lot_id, Number(s.current_quantity)]));

  const addCount = useMutation({
    mutationFn: async ({ lotId, qty }: { lotId: string; qty: number }) => {
      const { error } = await supabase.from("inventory_counts")
        .upsert({ session_id: session.id, lot_id: lotId, counted_quantity: qty }, { onConflict: "session_id,lot_id" });
      if (error) throw error;
    },
    onSuccess: (_d, v) => { track({ module: "inventaire", action: "comptage", label: "Comptage enregistré", table: "inventory_counts", recordId: session.id, warehouseId: (session as any).warehouse_id, details: { lot_id: v.lotId, quantite: v.qty } }); toast.success("Comptage enregistré"); qc.invalidateQueries({ queryKey: ["counts", session.id] }); setScannedLot(null); setCountValue(""); },
    onError: (e: any) => toast.error(e.message),
  });

  const closeSession = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("inventory_sessions")
        .update({ status: "cloturee", closed_at: new Date().toISOString() })
        .eq("id", session.id);
      if (error) throw error;
    },
    onSuccess: () => { track({ module: "inventaire", action: "session_cloturee", label: `Session « ${session.name} » clôturée`, table: "inventory_sessions", recordId: session.id, warehouseId: (session as any).warehouse_id }); toast.success("Session clôturée"); onExit(); },
  });

  const EXPORT_HEADERS = [
    { key: "product" as const, label: "Produit" },
    { key: "sku" as const, label: "SKU" },
    { key: "lot" as const, label: "Lot" },
    { key: "theorique" as const, label: "Stock théorique" },
    { key: "compte" as const, label: "Compté" },
    { key: "ecart" as const, label: "Écart" },
    { key: "date" as const, label: "Comptage le" },
  ];

  function buildRows() {
    return counts.map((c: any) => {
      const theo = stockMap.get(c.lot_id) ?? Number(c.lots?.quantity ?? 0);
      const gap = Number(c.counted_quantity) - theo;
      return {
        product: c.lots?.products?.name ?? "",
        sku: c.lots?.products?.sku ?? "",
        lot: c.lots?.lot_number ?? "",
        theorique: String(theo),
        compte: String(Number(c.counted_quantity)),
        ecart: gap > 0 ? `+${gap}` : String(gap),
        date: c.created_at ? formatDateTime(c.created_at) : "",
      };
    });
  }

  async function exportCounts(kind: "csv" | "pdf") {
    const rows = buildRows();
    const stamp = new Date().toISOString().slice(0, 10);
    if (kind === "csv") {
      exportToCsv(EXPORT_HEADERS, rows, `inventaire-${session.name}-${stamp}.csv`);
      return;
    }
    await exportTablePdf({
      title: `Inventaire — ${session.name}`,
      subtitle: `Statut : ${session.status}`,
      headers: EXPORT_HEADERS.map((h) => h.label),
      rows: rows.map((r: Record<string, string>) => EXPORT_HEADERS.map((h) => r[h.key] ?? "")),
      filename: `inventaire-${stamp}.pdf`,
      landscape: true,
      footerNote: `${rows.length} ligne(s) comptée(s).`,
    });
  }

  async function handleScan(code: string) {
    setScannerOpen(false);
    // Try to find lot by lot_number, or product by SKU/barcode → first lot
    let asLotQ = supabase.from("lots").select("*, products(name, sku)").eq("lot_number", code);
    if (selectedWarehouseId && selectedWarehouseId !== "all") asLotQ = asLotQ.eq("warehouse_id", selectedWarehouseId);
    const asLot = await asLotQ.maybeSingle();
    if (asLot.data) { setScannedLot(asLot.data); return; }
    const asProd = await supabase.from("products").select("id, name, sku").or(`sku.eq.${code},barcode.eq.${code}`).maybeSingle();
    if (asProd.data) {
      let lQ = supabase.from("lots").select("*, products(name, sku)").eq("product_id", asProd.data.id).order("reception_date", { ascending: false }).limit(1);
      if (selectedWarehouseId && selectedWarehouseId !== "all") lQ = lQ.eq("warehouse_id", selectedWarehouseId);
      const l = await lQ.maybeSingle();
      if (l.data) { setScannedLot(l.data); return; }
      toast.error("Produit trouvé mais aucun lot associé");
      return;
    }
    toast.error(`Code inconnu : ${code}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={onExit} className="text-xs text-muted-foreground hover:underline">← Retour</button>
          <h1 className="text-2xl font-semibold">{session.name}</h1>
          <p className="text-sm text-muted-foreground">Statut : {session.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => exportCounts("csv")}>
            <FileDown className="mr-1 size-4" /> CSV
          </Button>
          <Button variant="outline" onClick={() => exportCounts("pdf")}>
            <FileDown className="mr-1 size-4" /> PDF
          </Button>
        </div>
        {session.status === "ouverte" && (
          <div className="flex gap-2">
            <Button onClick={() => setScannerOpen(true)}><Camera className="mr-1 size-4" /> Scanner QR</Button>
            <Button variant="outline" onClick={() => closeSession.mutate()}>
              <StopCircle className="mr-1 size-4" /> Clôturer
            </Button>
          </div>
        )}
      </div>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Scanner un QR / code-barres</DialogTitle></DialogHeader>
          <QrScanner onResult={handleScan} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!scannedLot} onOpenChange={(o) => !o && setScannedLot(null)}>
        {scannedLot && (
          <DialogContent>
            <DialogHeader><DialogTitle>Compter le lot</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="text-sm">
                <div className="font-medium">{scannedLot.products?.name}</div>
                <div className="text-muted-foreground">Lot : <span className="font-mono">{scannedLot.lot_number}</span></div>
                <div className="text-muted-foreground">Stock théorique : {stockMap.get(scannedLot.id) ?? scannedLot.quantity}</div>
              </div>
              <div className="grid gap-2">
                <Label>Quantité comptée</Label>
                <Input type="number" step="0.001" value={countValue} onChange={(e) => setCountValue(e.target.value)} autoFocus />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScannedLot(null)}>Annuler</Button>
                <Button onClick={() => addCount.mutate({ lotId: scannedLot.id, qty: Number(countValue) })}>
                  <Check className="mr-1 size-4" /> Enregistrer
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead className="text-right">Théorique</TableHead>
              <TableHead className="text-right">Compté</TableHead>
              <TableHead className="text-right">Écart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {counts.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                Aucun comptage. Scannez un lot pour commencer.
              </TableCell></TableRow>
            )}
            {counts.map((c: any) => {
              const theo = stockMap.get(c.lot_id) ?? Number(c.lots?.quantity ?? 0);
              const gap = Number(c.counted_quantity) - theo;
              return (
                <TableRow key={c.id}>
                  <TableCell>{c.lots?.products?.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.lots?.lot_number}</TableCell>
                  <TableCell className="text-right">{theo}</TableCell>
                  <TableCell className="text-right font-semibold">{Number(c.counted_quantity)}</TableCell>
                  <TableCell className={`text-right font-semibold ${gap === 0 ? "text-muted-foreground" : gap < 0 ? "text-destructive" : "text-emerald-600"}`}>
                    {gap > 0 ? `+${gap}` : gap}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function QrScanner({ onResult }: { onResult: (code: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    let scanner: any;
    let stopped = false;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!ref.current || stopped) return;
      scanner = new Html5Qrcode(ref.current.id);
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          (decoded: string) => {
            if (!stopped) { stopped = true; scanner.stop().catch(() => {}); onResult(decoded); }
          },
          () => {},
        );
      } catch (e: any) {
        logger.warn("Caméra indisponible", { error: String(e) });
      }
    })();
    return () => {
      stopped = true;
      if (scanner) {
        // stop() lève une exception synchrone si le scanner n'a jamais démarré
        // (caméra indisponible) — on protège le cleanup pour ne pas faire
        // planter tout l'arbre React via l'error boundary.
        try { scanner.stop().catch(() => {}); } catch { /* scanner non démarré */ }
      }
    };
  }, [onResult]);

  return (
    <div className="grid gap-4">
      <div id="qr-reader" ref={ref} className="mx-auto w-full max-w-sm overflow-hidden rounded border" />
      <div className="grid gap-2">
        <Label>Ou saisir manuellement</Label>
        <div className="flex gap-2">
          <Input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="SKU / N° lot / code-barres" />
          <Button onClick={() => manual && onResult(manual)}>OK</Button>
        </div>
      </div>
    </div>
  );
}
