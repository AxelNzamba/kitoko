import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Package, Boxes, FileText } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatXOF } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/scanner")({
  component: ScannerPage,
  head: () => ({ meta: [{ title: "Scanner QR — INDUS-ERP" },
      { name: "description", content: "Scanner QR — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Scanner QR — INDUS-ERP" },
      { property: "og:description", content: "Scanner QR — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

type ScanResult =
  | { kind: "product"; product: any; lots: any[] }
  | { kind: "lot"; lot: any }
  | { kind: "none"; code: string };

function ScannerPage() {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState("");

  async function lookup(code: string) {
    setScanning(false);
    const clean = code.trim();
    if (!clean) return;

    const asProd = await supabase
      .from("products")
      .select("*, categories(name)")
      .or(`sku.eq.${clean},barcode.eq.${clean}`)
      .maybeSingle();
    if (asProd.data) {
      const lots = await supabase
        .from("lots")
        .select("id, lot_number, reception_date, quantity, certificate_url, suppliers(name)")
        .eq("product_id", asProd.data.id)
        .order("reception_date", { ascending: false });
      setResult({ kind: "product", product: asProd.data, lots: lots.data ?? [] });
      return;
    }

    const asLot = await supabase
      .from("lots")
      .select("*, products(name, sku), suppliers(name)")
      .eq("lot_number", clean)
      .maybeSingle();
    if (asLot.data) {
      setResult({ kind: "lot", lot: asLot.data });
      return;
    }

    setResult({ kind: "none", code: clean });
  }

  function reset() {
    setResult(null);
    setManual("");
    setScanning(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scanner QR</h1>
          <p className="mt-1 text-sm text-muted-foreground">Terminal de reconnaissance produit ou lot.</p>
        </div>
        {result && (
          <Button variant="outline" onClick={reset}><RotateCcw className="mr-1 size-4" /> Nouveau scan</Button>
        )}
      </div>

      {scanning && !result && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Camera className="size-4 text-accent" /> Caméra
            </div>
            <QrScanner onResult={lookup} />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 text-sm font-medium">Saisie manuelle</div>
            <form onSubmit={(e) => { e.preventDefault(); if (manual) lookup(manual); }} className="grid gap-3">
              <Label>SKU / N° lot / code-barres</Label>
              <Input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Ex : PRD-XXXXXX" autoFocus />
              <Button type="submit">Rechercher</Button>
            </form>
          </div>
        </div>
      )}

      {result?.kind === "product" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start gap-4">
            {result.product.photo_url ? (
              <img src={result.product.photo_url} alt="" className="size-24 rounded object-cover" />
            ) : (
              <div className="flex size-24 items-center justify-center rounded bg-muted"><Package className="size-8 text-muted-foreground" /></div>
            )}
            <div>
              <div className="text-xs uppercase text-muted-foreground">Produit</div>
              <h2 className="text-xl font-semibold">{result.product.name}</h2>
              <div className="mt-1 text-sm text-muted-foreground">
                SKU <span className="font-mono">{result.product.sku}</span>
                {result.product.categories?.name && <> · {result.product.categories.name}</>}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span>Achat : <strong>{formatXOF(Number(result.product.purchase_price ?? 0))}</strong></span>
                <span>Vente : <strong>{formatXOF(Number(result.product.sale_price ?? 0))}</strong></span>
                <span>TVA : {Number(result.product.vat ?? 0)}%</span>
              </div>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Boxes className="size-4" /> Lots</div>
          {result.lots.length === 0 ? (
            <div className="rounded border border-dashed p-4 text-sm text-muted-foreground">Aucun lot enregistré.</div>
          ) : (
            <ul className="divide-y rounded border">
              {result.lots.map((l: any) => (
                <li key={l.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div>
                    <div className="font-mono text-xs">{l.lot_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.suppliers?.name ?? "—"} · {formatDate(l.reception_date)} · Qté init. {Number(l.quantity)}
                    </div>
                  </div>
                  {l.certificate_url && (
                    <a href={l.certificate_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline">
                      <FileText className="size-3.5" /> Certificat
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result?.kind === "lot" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-xs uppercase text-muted-foreground">Lot</div>
          <h2 className="text-xl font-semibold font-mono">{result.lot.lot_number}</h2>
          <div className="mt-2 space-y-1 text-sm">
            <div>Produit : <strong>{result.lot.products?.name}</strong> <span className="text-xs text-muted-foreground">({result.lot.products?.sku})</span></div>
            <div>Fournisseur : {result.lot.suppliers?.name ?? "—"}</div>
            <div>Réception : {formatDate(result.lot.reception_date)}</div>
            <div>Quantité initiale : {Number(result.lot.quantity)}</div>
            <div>Prix unitaire achat : {formatXOF(Number(result.lot.unit_purchase_price))}</div>
          </div>
          {result.lot.certificate_url && (
            <a href={result.lot.certificate_url} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:underline">
              <FileText className="size-3.5" /> Consulter le certificat
            </a>
          )}
        </div>
      )}

      {result?.kind === "none" && (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Aucun produit ou lot trouvé pour le code <span className="font-mono">{result.code}</span>.
        </div>
      )}
    </div>
  );
}

function QrScanner({ onResult }: { onResult: (code: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

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
      } catch (e) {
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

  return <div id="qr-scanner-standalone" ref={ref} className="mx-auto w-full max-w-sm overflow-hidden rounded border" />;
}
