import { useEffect, useMemo, useRef, useState } from "react";
import { memo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight, Plus, Trash2, Send, PackageCheck, X, Camera,
  Building2, ChevronRight, Ban, FileDown, FileText, Filter,
} from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/audit";
import { Html5Qrcode } from "html5-qrcode";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { formatDateTime } from "@/lib/format";
import { notify } from "@/lib/notify";
import { exportToCsv } from "@/lib/csv";
import { exportTablePdf } from "@/lib/pdf-table";
import { buildTransferExportRows, TRANSFER_EXPORT_HEADERS } from "@/lib/transfers-export";


export const Route = createFileRoute("/_authenticated/transferts")({
  component: TransfertsPage,
  head: () => ({
    meta: [
      { title: "Transferts entre entrepôts — INDUS-ERP" },
      {
        name: "description",
        content:
          "Créez des bons de transfert entre entrepôts, scannez les lots et validez la réception côté destination.",
      },
      { property: "og:title", content: "Transferts entre entrepôts — INDUS-ERP" },
      {
        property: "og:description",
        content: "Bons de transfert, scan QR et validation source/destination.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Line = {
  product_id: string;
  lot_id: string | null;
  quantity: number;
  label: string;
  serial?: string | null;
  available?: number | null;
};

const statusLabels: Record<string, string> = {
  brouillon: "Brouillon",
  en_transit: "En transit",
  recu: "Reçu",
  annule: "Annulé",
};

const statusVariant: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  brouillon: "secondary",
  en_transit: "default",
  recu: "outline",
  annule: "destructive",
};

function TransfertsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sourceWh, setSourceWh] = useState("");
  const [destWh, setDestWh] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [scanOpen, setScanOpen] = useState(false);
  const [manualLot, setManualLot] = useState("");
  const [qty, setQty] = useState("1");

  // Filtres d'export / consultation
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");
  const [fUser, setFUser] = useState("all");
  const [fWarehouse, setFWarehouse] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () =>
      (await (supabase as any).from("warehouses").select("*").eq("is_active", true).order("name"))
        .data ?? [],
    staleTime: 5 * 60_000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-min"],
    queryFn: async () =>
      (await (supabase as any).from("profiles").select("id, full_name").order("full_name")).data ?? [],
    staleTime: 5 * 60_000,
  });

  const userName = (id: string | null | undefined) => {
    if (!id) return "—";
    const p = profiles.find((x: any) => x.id === id);
    return p?.full_name ?? `${String(id).slice(0, 8)}…`;
  };

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["stock-transfers", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await (supabase as any)
        .from("stock_transfers")
        .select(
          "*, source:source_warehouse_id(name), dest:dest_warehouse_id(name), stock_transfer_items(id, quantity, quantity_received, product_id, lot_id, products(name, sku), lots(lot_number))",
          { count: "exact", head: false },
        )
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });
  const transfersList = (transfers as { data: any[]; count: number } | undefined)?.data ?? [];
  const transfersCount = (transfers as { data: any[]; count: number } | undefined)?.count ?? 0;

  const filtered = useMemo(() => {
    return transfersList.filter((t) => {
      const created = t.created_at ? new Date(t.created_at) : null;
      if (fFrom && created && created < new Date(`${fFrom}T00:00:00`)) return false;
      if (fTo && created && created > new Date(`${fTo}T23:59:59`)) return false;
      if (fUser !== "all" && ![t.created_by, t.sent_by, t.received_by].includes(fUser)) return false;
      if (
        fWarehouse !== "all" &&
        t.source_warehouse_id !== fWarehouse &&
        t.dest_warehouse_id !== fWarehouse
      )
        return false;
      return true;
    });
  }, [transfersList, fFrom, fTo, fUser, fWarehouse]);

  const exportRows = () => buildTransferExportRows(filtered, statusLabels, userName);

  const filterSubtitle = () => {
    const parts: string[] = [];
    if (fFrom || fTo) parts.push(`Période : ${fFrom || "début"} → ${fTo || "aujourd'hui"}`);
    if (fUser !== "all") parts.push(`Magasinier : ${userName(fUser)}`);
    if (fWarehouse !== "all")
      parts.push(`Entrepôt : ${warehouses.find((w: any) => w.id === fWarehouse)?.name ?? fWarehouse}`);
    return parts.length > 0 ? parts.join(" · ") : "Tous les transferts";
  };

  const handleExportCsv = () => {
    const rows = exportRows();
    if (rows.length === 0) return toast.error("Aucun transfert à exporter avec ces filtres");
    exportToCsv(TRANSFER_EXPORT_HEADERS, rows, `transferts-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`${rows.length} ligne(s) exportée(s) en CSV`);
  };

  const handleExportPdf = async () => {
    const rows = exportRows();
    if (rows.length === 0) return toast.error("Aucun transfert à exporter avec ces filtres");
    const totalSent = rows.reduce((s, r) => s + Number(r.quantity || 0), 0);
    const totalReceived = rows.reduce((s, r) => s + Number(r.quantity_received || 0), 0);
    await exportTablePdf({
      title: "Transferts entre entrepôts",
      subtitle: filterSubtitle(),
      headers: TRANSFER_EXPORT_HEADERS.map((h) => h.label),
      rows: rows.map((r) => TRANSFER_EXPORT_HEADERS.map((h) => r[h.key])),
      filename: `transferts-${new Date().toISOString().slice(0, 10)}.pdf`,
      landscape: true,
      footerNote: `${filtered.length} bon(s) — ${rows.length} ligne(s) · Total expédié : ${totalSent} · Total reçu : ${totalReceived}`,
    });
    toast.success("PDF généré");
  };

  /**
   * Contrôles au scan :
   *  1. quantité entière strictement positive ;
   *  2. numéro de série obligatoire si le lot est suivi unitairement ;
   *  3. lot présent dans l'entrepôt source et stock disponible suffisant ;
   *  4. messages d'erreur explicites (jamais d'ajout silencieux).
   */
  async function resolveLot(code: string) {
    const value = code.trim();
    if (!value) {
      toast.error("Scannez ou saisissez un numéro de lot ou de série");
      return;
    }

    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || !Number.isInteger(qtyNum) || qtyNum <= 0) {
      toast.error("Quantité invalide : saisissez un nombre entier supérieur à 0");
      return;
    }

    // 1) Le code correspond-il à un numéro de série ?
    const { data: serialRow } = await (supabase as any)
      .from("serial_numbers")
      .select("id, serial, status, lot_id, product_id, warehouse_id, products(name), lots(lot_number)")
      .eq("serial", value)
      .limit(1)
      .maybeSingle();

    if (serialRow) {
      if (serialRow.status !== "en_stock") {
        toast.error(
          `Numéro de série ${serialRow.serial} non transférable (statut : ${serialRow.status.replace("_", " ")})`,
        );
        return;
      }
      if (sourceWh && serialRow.warehouse_id && serialRow.warehouse_id !== sourceWh) {
        toast.error(`Le numéro de série ${serialRow.serial} n'est pas dans l'entrepôt source`);
        return;
      }
      if (!sourceWh && serialRow.warehouse_id) setSourceWh(serialRow.warehouse_id);
      if (lines.some((l) => l.serial === serialRow.serial)) {
        toast.error(`Numéro de série déjà ajouté : ${serialRow.serial}`);
        return;
      }
      setLines((prev) => [
        ...prev,
        {
          product_id: serialRow.product_id,
          lot_id: serialRow.lot_id,
          quantity: 1,
          serial: serialRow.serial,
          label: `${serialRow.products?.name ?? "Produit"} — S/N ${serialRow.serial}${
            serialRow.lots?.lot_number ? ` (Lot ${serialRow.lots.lot_number})` : ""
          }`,
        },
      ]);
      toast.success(`Numéro de série ajouté : ${serialRow.serial}`);
      setManualLot("");
      setQty("1");
      return;
    }

    // 2) Sinon on résout un lot
    const { data } = await (supabase as any)
      .from("lots")
      .select("id, lot_number, product_id, warehouse_id, products(name, sku)")
      .or(`lot_number.eq.${value},id.eq.${value}`)
      .limit(1)
      .maybeSingle();

    if (!data) {
      toast.error(`Aucun lot ni numéro de série ne correspond à « ${value} »`);
      return;
    }
    if (sourceWh && data.warehouse_id && data.warehouse_id !== sourceWh) {
      toast.error("Ce lot n'appartient pas à l'entrepôt source sélectionné");
      return;
    }
    if (!sourceWh && data.warehouse_id) setSourceWh(data.warehouse_id);

    // 3) Lot suivi par numéro de série → scan unitaire obligatoire
    const { count: serialCount } = await (supabase as any)
      .from("serial_numbers")
      .select("id", { count: "exact", head: true })
      .eq("lot_id", data.id)
      .eq("status", "en_stock");

    if ((serialCount ?? 0) > 0) {
      toast.error(
        `Lot ${data.lot_number} suivi par numéro de série : scannez les numéros de série un par un (${serialCount} en stock)`,
      );
      return;
    }

    // 4) Contrôle du stock disponible
    const { data: stockRow } = await (supabase as any)
      .from("lot_stock")
      .select("*")
      .eq("lot_id", data.id)
      .limit(1)
      .maybeSingle();
    const available =
      stockRow?.current_quantity != null ? Number(stockRow.current_quantity) : null;
    const already = lines
      .filter((l) => l.lot_id === data.id)
      .reduce((s, l) => s + l.quantity, 0);

    if (available != null && already + qtyNum > available) {
      toast.error(
        `Stock insuffisant sur le lot ${data.lot_number} : ${available} disponible(s), ${already + qtyNum} demandé(s)`,
      );
      return;
    }

    setLines((prev) => {
      const existing = prev.find((l) => l.lot_id === data.id && !l.serial);
      if (existing) {
        return prev.map((l) =>
          l.lot_id === data.id && !l.serial ? { ...l, quantity: l.quantity + qtyNum, available } : l,
        );
      }
      return [
        ...prev,
        {
          product_id: data.product_id,
          lot_id: data.id,
          quantity: qtyNum,
          available,
          label: `${data.products?.name ?? "Produit"} — Lot ${data.lot_number}`,
        },
      ];
    });
    toast.success(`Ajouté : ${data.lot_number} × ${qtyNum}`);
    setManualLot("");
  }



  const createTransfer = useMutation({
    mutationFn: async () => {
      if (!sourceWh || !destWh) throw new Error("Entrepôt source et destination requis");
      if (sourceWh === destWh) throw new Error("Les entrepôts doivent être différents");
      if (lines.length === 0) throw new Error("Ajoutez au moins une ligne");

      const { data: userRes } = await supabase.auth.getUser();
      const { data: numberData, error: numErr } = await (supabase.rpc as any)(
        "generate_transfer_number",
      );
      if (numErr) throw numErr;

      const { data: transfer, error } = await (supabase as any)
        .from("stock_transfers")
        .insert({
          transfer_number: numberData,
          source_warehouse_id: sourceWh,
          dest_warehouse_id: destWh,
          notes: notes.trim() || null,
          created_by: userRes.user?.id,
        })
        .select("id, transfer_number")
        .single();
      if (error) throw error;

      const { error: itemsErr } = await (supabase as any).from("stock_transfer_items").insert(
        lines.map((l) => ({
          transfer_id: transfer.id,
          product_id: l.product_id,
          lot_id: l.lot_id,
          quantity: l.quantity,
        })),
      );
      if (itemsErr) throw itemsErr;
      return transfer;
    },
    onSuccess: (t: any) => {
      track({ module: "transferts", action: "transfert_cree", label: `Transfert ${t.transfer_number} créé`, table: "stock_transfers", recordId: t.id, warehouseId: t.source_warehouse_id });
      toast.success(`Bon de transfert ${t.transfer_number} créé`);
      notify.info("Transfert créé", `Bon ${t.transfer_number} en brouillon`);
      setOpen(false);
      setLines([]);
      setNotes("");
      qc.invalidateQueries({ queryKey: ["stock-transfers"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  /** Validation entrepôt source : sortie du stock + statut en transit */
  const sendTransfer = useMutation({
    mutationFn: async (t: any) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      const items = t.stock_transfer_items ?? [];

      const { error: movErr } = await (supabase as any).from("stock_movements").insert(
        items.map((i: any) => ({
          product_id: i.product_id,
          lot_id: i.lot_id,
          type: "sortie",
          quantity: i.quantity,
          reason: `Transfert ${t.transfer_number} vers ${t.dest?.name ?? "autre entrepôt"}`,
          warehouse_id: t.source_warehouse_id,
          created_by: uid,
        })),
      );
      if (movErr) throw movErr;

      const { error } = await (supabase as any)
        .from("stock_transfers")
        .update({ status: "en_transit", sent_by: uid, sent_at: new Date().toISOString() })
        .eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: (_d: unknown, t: any) => {
      track({ module: "transferts", action: "transfert_expedie", label: `Transfert ${t?.transfer_number ?? ""} expédié`, table: "stock_transfers", recordId: t?.id, warehouseId: t?.source_warehouse_id });
      toast.success("Transfert validé et expédié");
      qc.invalidateQueries({ queryKey: ["stock-transfers"] });
      qc.invalidateQueries({ queryKey: ["lot_stock"] });
      qc.invalidateQueries({ queryKey: ["movements"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  /** Validation entrepôt destination : entrée en stock + statut reçu */
  const receiveTransfer = useMutation({
    mutationFn: async (t: any) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      const items = t.stock_transfer_items ?? [];

      const { error: movErr } = await (supabase as any).from("stock_movements").insert(
        items.map((i: any) => ({
          product_id: i.product_id,
          lot_id: i.lot_id,
          type: "entree",
          quantity: i.quantity,
          reason: `Transfert ${t.transfer_number} reçu de ${t.source?.name ?? "autre entrepôt"}`,
          warehouse_id: t.dest_warehouse_id,
          created_by: uid,
        })),
      );
      if (movErr) throw movErr;

      for (const i of items) {
        await (supabase as any)
          .from("stock_transfer_items")
          .update({ quantity_received: i.quantity })
          .eq("id", i.id);
        if (i.lot_id) {
          await (supabase as any)
            .from("lots")
            .update({ warehouse_id: t.dest_warehouse_id, location_id: null })
            .eq("id", i.lot_id);
        }
      }

      const { error } = await (supabase as any)
        .from("stock_transfers")
        .update({ status: "recu", received_by: uid, received_at: new Date().toISOString() })
        .eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: (_d: unknown, t: any) => {
      track({ module: "transferts", action: "transfert_recu", label: `Transfert ${t?.transfer_number ?? ""} reçu`, table: "stock_transfers", recordId: t?.id, warehouseId: t?.dest_warehouse_id ?? t?.destination_warehouse_id });
      toast.success("Réception confirmée");
      notify.success("Transfert reçu", "Le stock a été rattaché à l'entrepôt destination");
      qc.invalidateQueries({ queryKey: ["stock-transfers"] });
      qc.invalidateQueries({ queryKey: ["lot_stock"] });
      qc.invalidateQueries({ queryKey: ["lots"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const cancelTransfer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("stock_transfers")
        .update({ status: "annule" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d: unknown, id: any) => {
      track({ module: "transferts", action: "transfert_annule", label: "Transfert annulé", severity: "warning", table: "stock_transfers", recordId: typeof id === "string" ? id : id?.id });
      toast.success("Transfert annulé");
      qc.invalidateQueries({ queryKey: ["stock-transfers"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transferts entre entrepôts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bon de transfert, scan QR des lots et double validation source / destination.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <FileDown className="mr-1 size-4" /> CSV
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <FileText className="mr-1 size-4" /> PDF
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 size-4" /> Nouveau transfert
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="size-4" /> Filtres (appliqués à la liste et aux exports)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <div className="grid gap-1.5">
            <Label className="text-xs">Du</Label>
            <Input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Au</Label>
            <Input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Magasinier</Label>
            <Select value={fUser} onValueChange={setFUser}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {profiles.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name ?? p.id.slice(0, 8)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Entrepôt (source ou destination)</Label>
            <Select value={fWarehouse} onValueChange={setFWarehouse}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {warehouses.map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
            <ArrowLeftRight className="mb-2 size-8 text-muted-foreground/40" />
            Aucun transfert ne correspond aux filtres.
          </div>
        )}
        {filtered.map((t: any) => (
          <TransferCard
            key={t.id}
            transfer={t}
            canSend={sendTransfer.isPending}
            canReceive={receiveTransfer.isPending}
            onSend={sendTransfer.mutate}
            onReceive={receiveTransfer.mutate}
            onCancel={cancelTransfer.mutate}
          />
        ))}
        {!isLoading && filtered.length > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={transfersCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Nouveau transfert */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau bon de transfert</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Source *</Label>
                <Select value={sourceWh} onValueChange={setSourceWh}>
                  <SelectTrigger><SelectValue placeholder="Entrepôt source" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destination *</Label>
                <Select value={destWh} onValueChange={setDestWh}>
                  <SelectTrigger><SelectValue placeholder="Entrepôt destination" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.filter((w: any) => w.id !== sourceWh).map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Ajouter un lot ou un numéro de série (scan ou saisie)</Label>
              <div className="flex gap-2">
                <Input
                  value={manualLot}
                  onChange={(e) => setManualLot(e.target.value)}
                  placeholder="N° de lot ou n° de série"

                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      resolveLot(manualLot);
                    }
                  }}
                />
                <Input
                  type="number"
                  min="1"
                  className="w-20"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={() => resolveLot(manualLot)}>
                  <Plus className="size-4" />
                </Button>
                <Button type="button" variant="outline" onClick={() => setScanOpen(true)}>
                  <Camera className="size-4" />
                </Button>
              </div>
            </div>

            {lines.length > 0 && (
              <ul className="space-y-1">
                {lines.map((l, idx) => (
                  <li key={`${l.lot_id}-${idx}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="truncate">
                      {l.label}
                      {l.available != null && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (dispo : {l.available})
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{l.quantity}</span>

                      <button
                        type="button"
                        onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={() => createTransfer.mutate()} disabled={createTransfer.isPending}>
              {createTransfer.isPending ? "..." : "Créer le bon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QrScanDialog
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={(code) => {
          setScanOpen(false);
          resolveLot(code);
        }}
      />
    </div>
  );
}

/**
 * Carte de transfert mémoïsée : évite de re-rendre toutes les cartes
 * quand une seule action (envoi, réception, annulation) est en cours.
 */
const TransferCard = memo(function TransferCard({
  transfer, canSend, canReceive, onSend, onReceive, onCancel,
}: {
  transfer: any;
  canSend: boolean;
  canReceive: boolean;
  onSend: (t: any) => void;
  onReceive: (t: any) => void;
  onCancel: (id: string) => void;
}) {
  const t = transfer;
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            {t.transfer_number}
            <Badge variant={statusVariant[t.status] ?? "secondary"}>
              {statusLabels[t.status] ?? t.status}
            </Badge>
          </CardTitle>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="size-3" />
            {t.source?.name ?? "—"}
            <ChevronRight className="size-3" />
            {t.dest?.name ?? "—"}
            <span className="ml-2">{formatDateTime(t.created_at)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {t.status === "brouillon" && (
            <Button size="sm" onClick={() => onSend(t)} disabled={canSend}>
              <Send className="mr-1 size-3.5" /> Valider départ
            </Button>
          )}
          {t.status === "en_transit" && (
            <Button size="sm" onClick={() => onReceive(t)} disabled={canReceive}>
              <PackageCheck className="mr-1 size-3.5" /> Valider réception
            </Button>
          )}
          {(t.status === "brouillon" || t.status === "en_transit") && (
            <Button size="sm" variant="outline" onClick={() => onCancel(t.id)}>
              <Ban className="mr-1 size-3.5" /> Annuler
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {(t.stock_transfer_items ?? []).map((i: any) => (
            <li key={i.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5">
              <span className="truncate">
                {i.products?.name}
                {i.lots?.lot_number && (
                  <span className="text-muted-foreground"> — Lot {i.lots.lot_number}</span>
                )}
              </span>
              <span className="font-medium">{Number(i.quantity)}</span>
            </li>
          ))}
        </ul>
        {t.notes && <p className="mt-2 text-xs text-muted-foreground">{t.notes}</p>}
      </CardContent>
    </Card>
  );
});

function QrScanDialog({
  open,
  onClose,
  onScan,
}: {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}) {
  const ref = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let stopped = false;
    const scanner = new Html5Qrcode("transfer-qr-reader");
    ref.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          if (stopped) return;
          stopped = true;
          onScan(decoded);
        },
        () => {},
      )
      .catch(() => setError("Impossible d'accéder à la caméra"));

    return () => {
      stopped = true;
      scanner.stop().catch(() => {});
      ref.current = null;
    };
  }, [open, onScan]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Scanner un lot</p>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <div id="transfer-qr-reader" className="mx-auto mt-4 w-full max-w-sm" />
      {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
