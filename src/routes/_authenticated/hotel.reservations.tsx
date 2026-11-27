import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FileText, LogIn, LogOut, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { formatXOF, formatDate } from "@/lib/format";
import { nights, reservationStatusLabels, stayInvoice, todayISO, type Charge, type ReservationStatus } from "@/lib/hotel";
import { track } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHotelData } from "@/modules/hotel/queries";

export const Route = createFileRoute("/_authenticated/hotel/reservations")({
  component: ReservationsPage,
  head: () => ({
    meta: [
      { title: "Réservations — Kitoko Hôtel" },
      { name: "description", content: "Réservations, arrivées, départs, consommations et facture PDF." },
    
      { property: "og:title", content: "Réservations — Kitoko Hôtel" },
      { property: "og:description", content: "Réservations, arrivées, départs, consommations et facture PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }],
  }),
});

const selectCls = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
const FILTERS: { key: string; label: string }[] = [
  { key: "actives", label: "Actives" },
  { key: "today", label: "Aujourd'hui" },
  { key: "toutes", label: "Toutes" },
];

type Res = {
  id: string; reservation_number: string; room_id: string; guest_name: string; guest_phone: string | null;
  guest_email: string | null; guest_id_doc: string | null; adults: number; check_in: string; check_out: string;
  status: ReservationStatus; nightly_rate: number; deposit: number; payment_mode: string | null; notes: string | null;
  hotel_rooms: { number: string } | null;
};

function ReservationsPage() {
  const qc = useQueryClient();
  const { rooms, reservations } = useHotelData();
  const [filter, setFilter] = useState("actives");
  const [newOpen, setNewOpen] = useState(false);
  const [folioId, setFolioId] = useState<string | null>(null);

  const list = useMemo(() => {
    const rs = (reservations.data ?? []) as Res[];
    const today = todayISO();
    if (filter === "actives") return rs.filter((r) => r.status === "confirmee" || r.status === "arrivee");
    if (filter === "today") return rs.filter((r) => r.check_in === today || r.check_out === today);
    return rs;
  }, [reservations.data, filter]);

  const folioRes = (reservations.data ?? []).find((r) => r.id === folioId) as Res | undefined;

  const refresh = () => qc.invalidateQueries({ queryKey: ["hotel"] });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReservationStatus }) => {
      const { error } = await supabase.from("hotel_reservations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.status === "arrivee" ? "Arrivée enregistrée" : v.status === "partie" ? "Départ enregistré" : "Réservation annulée");
      void track({ module: "hotel", action: v.status, label: `Séjour ${v.status}` });
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Réservations</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border">
            {FILTERS.map((f) => (
              <Button size="sm" variant="ghost" key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-sm ${filter === f.key ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground"}`}>
                {f.label}
              </Button>
            ))}
          </div>
          <Button onClick={() => setNewOpen(true)}><Plus className="size-4" /> Réserver</Button>
        </div>
      </div>

      {reservations.isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : reservations.error ? (
        <p className="text-sm text-destructive">Erreur de chargement. <Button variant="link" onClick={() => reservations.refetch()}>Réessayer</Button></p>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>N°</TableHead><TableHead>Client</TableHead><TableHead>Chambre</TableHead><TableHead>Dates</TableHead><TableHead>Montant</TableHead><TableHead>État</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Aucune réservation ici.</TableCell></TableRow>}
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.reservation_number}</TableCell>
                  <TableCell className="font-semibold">{r.guest_name}</TableCell>
                  <TableCell>N° {r.hotel_rooms?.number}</TableCell>
                  <TableCell>{formatDate(r.check_in)} → {formatDate(r.check_out)} · {nights(r.check_in, r.check_out)} nuit(s)</TableCell>
                  <TableCell>{formatXOF(nights(r.check_in, r.check_out) * Number(r.nightly_rate))}</TableCell>
                  <TableCell><Badge variant={r.status === "annulee" ? "destructive" : "default"}>{reservationStatusLabels[r.status]}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {r.status === "confirmee" && (
                        <Button size="sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: r.id, status: "arrivee" })}><LogIn className="size-3.5" /> Arrivée</Button>
                      )}
                      {(r.status === "arrivee" || r.status === "partie") && (
                        <Button size="sm" variant="outline" onClick={() => setFolioId(r.id)}><FileText className="size-3.5" /> Séjour</Button>
                      )}
                      {r.status === "confirmee" && (
                        <Button size="icon" variant="ghost" title="Annuler" onClick={() => setStatus.mutate({ id: r.id, status: "annulee" })}><XCircle className="size-4 text-destructive" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewReservationDialog
        open={newOpen} onOpenChange={setNewOpen}
        rooms={(rooms.data ?? []) as { id: string; number: string; price_override: number | null; status: string; hotel_room_types: { base_price: number } | null }[]}
        onDone={() => { setNewOpen(false); refresh(); }}
      />
      {folioRes && <FolioDialog res={folioRes} onClose={() => setFolioId(null)} onCheckout={() => setStatus.mutateAsync({ id: folioRes.id, status: "partie" })} />}
    </div>
  );
}

function NewReservationDialog({ open, onOpenChange, rooms, onDone }: {
  open: boolean; onOpenChange: (b: boolean) => void;
  rooms: { id: string; number: string; price_override: number | null; status: string; hotel_room_types: { base_price: number } | null }[];
  onDone: () => void;
}) {
  const today = todayISO();
  const [f, setF] = useState({ guest_name: "", guest_phone: "", room_id: "", check_in: today, check_out: "", nightly_rate: "", deposit: "", payment_mode: "especes" });

  const create = useMutation({
    mutationFn: async () => {
      if (!f.guest_name.trim()) throw new Error("Indiquez le nom du client");
      if (!f.room_id) throw new Error("Choisissez une chambre");
      if (!f.check_out || f.check_out <= f.check_in) throw new Error("Le départ doit être après l’arrivée");
      const { error } = await supabase.from("hotel_reservations").insert({
        guest_name: f.guest_name.trim(), guest_phone: f.guest_phone || null, room_id: f.room_id,
        check_in: f.check_in, check_out: f.check_out, nightly_rate: Number(f.nightly_rate) || 0,
        deposit: Number(f.deposit) || 0, payment_mode: f.payment_mode, status: "confirmee",
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Réservation créée"); setF({ guest_name: "", guest_phone: "", room_id: "", check_in: todayISO(), check_out: "", nightly_rate: "", deposit: "", payment_mode: "especes" }); onDone(); },
    onError: (e: Error) => toast.error(e.message.includes("déjà réservée") ? "Cette chambre est déjà réservée sur ces dates" : e.message),
  });

  const pickRoom = (id: string) => {
    const room = rooms.find((r) => r.id === id);
    setF({ ...f, room_id: id, nightly_rate: String(room?.price_override ?? room?.hotel_room_types?.base_price ?? "") });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouvelle réservation</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="reservations-1">Client</Label><Input id="reservations-1" value={f.guest_name} onChange={(e) => setF({ ...f, guest_name: e.target.value })} /></div>
            <div><Label htmlFor="reservations-2">Téléphone</Label><Input id="reservations-2" value={f.guest_phone} onChange={(e) => setF({ ...f, guest_phone: e.target.value })} /></div>
          </div>
          <div><Label htmlFor="hotel.reservations.tsx-Chambre">Chambre</Label><select id="hotel.reservations.tsx-Chambre" className={selectCls} value={f.room_id} onChange={(e) => pickRoom(e.target.value)}>
              <option value="">— Choisir —</option>
              {rooms.filter((r) => r.status !== "maintenance").map((r) => <option key={r.id} value={r.id}>N° {r.number}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="reservations-3">Arrivée</Label><Input id="reservations-3" type="date" value={f.check_in} onChange={(e) => setF({ ...f, check_in: e.target.value })} /></div>
            <div><Label htmlFor="reservations-4">Départ</Label><Input id="reservations-4" type="date" value={f.check_out} onChange={(e) => setF({ ...f, check_out: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label htmlFor="reservations-5">Prix / nuit</Label><Input id="reservations-5" type="number" min={0} value={f.nightly_rate} onChange={(e) => setF({ ...f, nightly_rate: e.target.value })} /></div>
            <div><Label htmlFor="reservations-6">Acompte</Label><Input id="reservations-6" type="number" min={0} value={f.deposit} onChange={(e) => setF({ ...f, deposit: e.target.value })} /></div>
            <div><Label htmlFor="hotel.reservations.tsx-Paiement">Paiement</Label><select id="hotel.reservations.tsx-Paiement" className={selectCls} value={f.payment_mode} onChange={(e) => setF({ ...f, payment_mode: e.target.value })}>
                <option value="especes">Espèces</option><option value="mobile">Mobile Money</option><option value="carte">Carte</option><option value="credit">Crédit</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter><Button onClick={() => create.mutate()} disabled={create.isPending}>Enregistrer</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FolioDialog({ res, onClose, onCheckout }: {
  res: Res; onClose: () => void; onCheckout: () => Promise<unknown>;
}) {
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [productId, setProductId] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const charges = useQuery({
    queryKey: ["hotel", "charges", res.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("hotel_charges").select("*").eq("reservation_id", res.id).order("created_at");
      if (error) throw error;
      return (data ?? []) as (Charge & { id: string; label: string })[];
    },
  });
  const products = useQuery({
    queryKey: ["hotel", "minibar-products"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("hotel_minibar_catalog");
      if (error) throw error;
      return data ?? [];
    },
  });

  const invoice = stayInvoice(res, charges.data ?? []);

  const addCharge = useMutation({
    mutationFn: async () => {
      const prod = (products.data ?? []).find((p) => p.id === productId);
      if (!prod && (!label.trim() || !amount)) throw new Error("Indiquez un article ou un montant");
      const { error } = await supabase.from("hotel_charges").insert({
        reservation_id: res.id,
        label: prod ? `Minibar : ${prod.name}` : label.trim(),
        unit_price: prod ? Number(prod.sale_price) : Number(amount),
        product_id: prod?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Consommation ajoutée"); setLabel(""); setAmount(""); setProductId(""); qc.invalidateQueries({ queryKey: ["hotel", "charges", res.id] }); },
    onError: (e: Error) => toast.error(e.message.includes("Stock insuffisant") ? "Stock insuffisant pour ce produit" : e.message),
  });

  async function downloadPdf() {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Kitoko Hôtel — Facture de séjour", 14, 18);
    doc.setFontSize(10);
    doc.text(`Facture : ${res.reservation_number}`, 14, 28);
    doc.text(`Client : ${res.guest_name}`, 14, 34);
    doc.text(`Chambre : N° ${res.hotel_rooms?.number} — du ${formatDate(res.check_in)} au ${formatDate(res.check_out)} (${invoice.nights} nuit(s))`, 14, 40);
    autoTable(doc, {
      startY: 46,
      head: [["Désignation", "Qté", "Prix unitaire", "Total"]],
      body: [
        [`Chambre (${invoice.nights} nuit(s))`, String(invoice.nights), formatXOF(Number(res.nightly_rate)), formatXOF(invoice.room)],
        ...(charges.data ?? []).map((c) => [c.label, String(c.quantity), formatXOF(c.unit_price), formatXOF(c.quantity * c.unit_price)]),
      ],
    });
    const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.text(`Total : ${formatXOF(invoice.total)}`, 14, y);
    doc.text(`Acompte : ${formatXOF(invoice.deposit)}`, 14, y + 7);
    doc.text(`Reste à payer : ${formatXOF(invoice.balance)}`, 14, y + 14);
    doc.save(`facture-${res.reservation_number}.pdf`);
  }

  return (
    <Dialog open onOpenChange={(b) => !b && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Séjour {res.reservation_number} — {res.guest_name}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-border p-3 text-sm">
            <p>Chambre N° {res.hotel_rooms?.number} · {invoice.nights} nuit(s) × {formatXOF(Number(res.nightly_rate))} = <b>{formatXOF(invoice.room)}</b></p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Consommations</p>
            {charges.isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
            {charges.error && <Button variant="link" onClick={() => charges.refetch()}>Réessayer le chargement des consommations</Button>}
            {(charges.data ?? []).length === 0 && <p className="text-xs text-muted-foreground">Aucune consommation.</p>}
            {(charges.data ?? []).map((c) => (
              <p key={c.id} className="flex justify-between text-sm"><span>{c.label} × {c.quantity}</span><span>{formatXOF(c.quantity * c.unit_price)}</span></p>
            ))}
            {res.status === "arrivee" && (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <select aria-label="Produit minibar" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={productId} onChange={(e) => setProductId(e.target.value)}>
                  <option value="">Minibar (stock)…</option>
                  {(products.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Input className="w-32" placeholder="ou article libre" value={label} onChange={(e) => setLabel(e.target.value)} />
                <Input className="w-24" type="number" min={0} placeholder="Prix" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Button size="sm" variant="outline" onClick={() => addCharge.mutate()} disabled={addCharge.isPending}><Plus className="size-3.5" /> Ajouter</Button>
              </div>
            )}
          </div>
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="flex justify-between"><span>Total</span><b>{formatXOF(invoice.total)}</b></p>
            <p className="flex justify-between text-muted-foreground"><span>Acompte</span><span>- {formatXOF(invoice.deposit)}</span></p>
            <p className="flex justify-between text-base"><span>Reste à payer</span><b className="text-accent">{formatXOF(invoice.balance)}</b></p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={charges.isLoading || !!charges.error || addCharge.isPending} onClick={downloadPdf}><FileText className="size-4" /> Facture PDF</Button>
          {res.status === "arrivee" && (
            <Button disabled={checkingOut || charges.isLoading || !!charges.error || addCharge.isPending} onClick={async () => { setCheckingOut(true); try { await onCheckout(); onClose(); } catch { /* mutation displays the error */ } finally { setCheckingOut(false); } }}><LogOut className="size-4" /> Départ</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
