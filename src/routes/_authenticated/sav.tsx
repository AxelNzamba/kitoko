import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { Plus, Wrench, FileDown, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/audit";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatDate, formatXOF } from "@/lib/format";
import { exportToCsv } from "@/lib/csv";
import { exportTablePdf } from "@/lib/pdf-table";
import {
  SerialHistoryDialog, SERIAL_STATUS_LABEL, serialStatusTone, OUTCOME_LABEL,
} from "@/components/serial-history-dialog";


export const Route = createFileRoute("/_authenticated/sav")({
  component: SavPage,
  head: () => ({
    meta: [
      { title: "SAV — Garanties, retours et interventions | INDUS-ERP" },
      { name: "description", content: "Gestion du service après-vente : garanties, retours et interventions suivis par client et par produit." },
      { property: "og:title", content: "SAV — Garanties, retours et interventions" },
      { property: "og:description", content: "Suivi SAV par client et par produit avec interventions et coûts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const SAV_PAGE_SIZE = 20;

const TYPES = [
  { value: "garantie", label: "Garantie" },
  { value: "retour", label: "Retour" },
  { value: "intervention", label: "Intervention" },
];
const STATUSES = [
  { value: "ouvert", label: "Ouvert" },
  { value: "en_cours", label: "En cours" },
  { value: "resolu", label: "Résolu" },
  { value: "refuse", label: "Refusé" },
];
const label = (arr: { value: string; label: string }[], v: string) =>
  arr.find((a) => a.value === v)?.label ?? v;

function SavPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(SAV_PAGE_SIZE);

  const { data: ticketData = { data: [], count: 0 } } = useQuery({
    queryKey: ["sav_tickets", page, pageSize, statusFilter, clientFilter],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = (supabase as any)
        .from("sav_tickets")
        .select("*, clients:client_id(name), products:product_id(name, sku), serial_numbers:serial_id(serial)", { count: "exact", head: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (clientFilter !== "all") query = query.eq("client_id", clientFilter);
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });
  const tickets = ticketData.data;
  const totalTickets = ticketData.count;

  const openCountQuery = useQuery({
    queryKey: ["sav_tickets", "open-count"],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from("sav_tickets")
        .select("*", { count: "exact", head: true })
        .in("status", ["ouvert", "en_cours"]);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients", "min"],
    queryFn: async () => (await supabase.from("clients").select("id, name").order("name")).data ?? [],
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products", "min"],
    queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? [],
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("sav_tickets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, id) => { track({ module: "sav", action: "ticket_supprime", label: "Ticket SAV supprimé", severity: "warning", table: "sav_tickets", recordId: id }); toast.success("Ticket supprimé"); qc.invalidateQueries({ queryKey: ["sav_tickets"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("sav_tickets").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { track({ module: "sav", action: "ticket_statut", label: `Ticket SAV → ${v.status}`, table: "sav_tickets", recordId: v.id, details: { statut: v.status } }); toast.success("Statut mis à jour"); qc.invalidateQueries({ queryKey: ["sav_tickets"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const filtered = tickets;

  const rows = filtered.map((t: any) => ({
    number: t.ticket_number,
    date: formatDate(t.created_at),
    type: label(TYPES, t.type),
    status: label(STATUSES, t.status),
    client: t.clients?.name ?? "",
    product: t.products?.name ?? "",
    serial: t.serial_numbers?.serial ?? "",
    warranty: t.warranty_end ? formatDate(t.warranty_end) : "",
    description: t.description ?? "",
  }));

  const headers = [
    { key: "number" as const, label: "N° ticket" },
    { key: "date" as const, label: "Date" },
    { key: "type" as const, label: "Type" },
    { key: "status" as const, label: "Statut" },
    { key: "client" as const, label: "Client" },
    { key: "product" as const, label: "Produit" },
    { key: "serial" as const, label: "N° série" },
    { key: "warranty" as const, label: "Fin garantie" },
    { key: "description" as const, label: "Description" },
  ];

  const openCount = openCountQuery.data ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SAV</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Garanties, retours et interventions — {openCount} dossier(s) en cours.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clients</SelectItem>
              {clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportToCsv(headers, rows, `sav-${new Date().toISOString().slice(0, 10)}.csv`)}>
            <FileDown className="mr-1 size-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportTablePdf({
            title: "Dossiers SAV",
            headers: headers.map((h) => h.label),
            rows: rows.map((r: Record<string, string>) => headers.map((h) => r[h.key] ?? "")),
            filename: `sav-${new Date().toISOString().slice(0, 10)}.pdf`,
            landscape: true,
          })}>
            <FileDown className="mr-1 size-4" /> PDF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1 size-4" /> Nouveau ticket</Button></DialogTrigger>
            <TicketForm
              clients={clients}
              products={products}
              onClose={() => setOpen(false)}
              onSaved={() => { qc.invalidateQueries({ queryKey: ["sav_tickets"] }); setOpen(false); }}
            />
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° ticket</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>N° série</TableHead>
              <TableHead>Garantie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                Aucun dossier SAV.
              </TableCell></TableRow>
            )}
            {filtered.map((t: any) => (
              <TicketRow
                key={t.id}
                ticket={t}
                onOpen={() => setDetail(t)}
                onDelete={(id) => del.mutate(id)}
                onStatus={(id, status) => setStatus.mutate({ id, status })}
              />
            ))}
          </TableBody>
        </Table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalTickets}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        {detail && <InterventionsDialog ticket={detail} />}
      </Dialog>
    </div>
  );
}

/**
 * Ligne de ticket mémoïsée : évite de re-rendre toutes les lignes
 * quand une seule ligne change (statut, interventions…).
 */
const TicketRow = memo(function TicketRow({
  ticket, onOpen, onDelete, onStatus,
}: {
  ticket: any;
  onOpen: () => void;
  onDelete: (id: string) => void;
  onStatus: (id: string, status: string) => void;
}) {
  const underWarranty = ticket.warranty_end && new Date(ticket.warranty_end) >= new Date();
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{ticket.ticket_number}</TableCell>
      <TableCell className="text-xs">{formatDate(ticket.created_at)}</TableCell>
      <TableCell className="text-xs">{label(TYPES, ticket.type)}</TableCell>
      <TableCell>{ticket.clients?.name ?? "—"}</TableCell>
      <TableCell>{ticket.products?.name ?? "—"}</TableCell>
      <TableCell className="font-mono text-xs">{ticket.serial_numbers?.serial ?? "—"}</TableCell>
      <TableCell className="text-xs">
        {ticket.warranty_end ? (
          <span className={underWarranty ? "text-emerald-600" : "text-destructive"}>
            <ShieldCheck className="mr-1 inline size-3.5" />
            {formatDate(ticket.warranty_end)}
          </span>
        ) : "—"}
      </TableCell>
      <TableCell>
        <Select value={ticket.status} onValueChange={(v) => onStatus(ticket.id, v)}>
          <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={onOpen} title="Interventions">
            <Wrench className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(ticket.id)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

function TicketForm({
  clients, products, onClose, onSaved,
}: { clients: any[]; products: any[]; onClose: () => void; onSaved: () => void }) {
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [serialId, setSerialId] = useState("");
  const [type, setType] = useState("garantie");
  const [warrantyEnd, setWarrantyEnd] = useState("");
  const [description, setDescription] = useState("");

  const { data: serials = [] } = useQuery({
    queryKey: ["serials", "product", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("serial_numbers").select("id, serial").eq("product_id", productId).order("serial").limit(500);
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!description.trim()) throw new Error("La description est requise");
      const { data: num, error: numErr } = await (supabase as any).rpc("generate_sav_number");
      if (numErr) throw numErr;
      const { data: u } = await supabase.auth.getUser();
      const { error } = await (supabase as any).from("sav_tickets").insert({
        ticket_number: num,
        client_id: clientId || null,
        product_id: productId || null,
        serial_id: serialId || null,
        type,
        warranty_end: warrantyEnd || null,
        description: description.trim(),
        created_by: u.user?.id,
      });
      if (error) throw error;
      if (serialId) {
        await (supabase as any).from("serial_numbers").update({ status: "sav" }).eq("id", serialId);
      }
    },
    onSuccess: () => { track({ module: "sav", action: "ticket_cree", label: "Ticket SAV créé", table: "sav_tickets" }); toast.success("Ticket SAV créé"); onSaved(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nouveau dossier SAV</DialogTitle></DialogHeader>
      <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <div className="grid gap-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
            <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Produit</Label>
          <Select value={productId} onValueChange={(v) => { setProductId(v); setSerialId(""); }}>
            <SelectTrigger><SelectValue placeholder="Sélectionner un produit" /></SelectTrigger>
            <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {serials.length > 0 && (
          <div className="grid gap-2">
            <Label>Numéro de série</Label>
            <Select value={serialId} onValueChange={setSerialId}>
              <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
              <SelectContent>{serials.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.serial}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <div className="grid gap-2">
          <Label>Fin de garantie</Label>
          <Input type="date" value={warrantyEnd} onChange={(e) => setWarrantyEnd(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Description du problème</Label>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={save.isPending}>Créer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

const OUTCOMES = [
  { value: "traite", label: "Traité" },
  { value: "repare", label: "Réparé" },
  { value: "remplace", label: "Remplacé" },
  { value: "retourne_client", label: "Retourné au client" },
  { value: "rebut", label: "Mis au rebut" },
];

/** Statut à appliquer au numéro de série selon l'issue de l'intervention. */
const OUTCOME_SERIAL_STATUS: Record<string, string | null> = {
  traite: "sav",
  repare: "en_stock",
  remplace: "rebut",
  retourne_client: "vendu",
  rebut: "rebut",
};

function InterventionsDialog({ ticket }: { ticket: any }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [technician, setTechnician] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("0");
  const [outcome, setOutcome] = useState("traite");
  const [selected, setSelected] = useState<string[]>(ticket.serial_id ? [ticket.serial_id] : []);
  const [historySerial, setHistorySerial] = useState<string | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["sav_interventions", ticket.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("sav_interventions").select("*").eq("ticket_id", ticket.id)
        .order("intervention_date", { ascending: false });
      return data ?? [];
    },
  });

  // Numéros de série candidats : ceux du produit du ticket.
  const { data: serials = [] } = useQuery({
    queryKey: ["serials", "sav", ticket.product_id],
    enabled: !!ticket.product_id,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("serial_numbers").select("id, serial, status")
        .eq("product_id", ticket.product_id).order("serial").limit(500);
      return data ?? [];
    },
  });

  // Séries rattachées aux interventions de ce ticket.
  const { data: links = [] } = useQuery({
    queryKey: ["sav_intervention_serials", ticket.id, items.map((i: any) => i.id).join(",")],
    enabled: items.length > 0,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("sav_intervention_serials")
        .select("id, intervention_id, outcome, serial_id, serial_numbers:serial_id(serial, status)")
        .in("intervention_id", items.map((i: any) => i.id));
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!description.trim()) throw new Error("La description est requise");
      const { data: u } = await supabase.auth.getUser();
      const { data: created, error } = await (supabase as any).from("sav_interventions").insert({
        ticket_id: ticket.id,
        intervention_date: date,
        technician: technician || null,
        description: description.trim(),
        cost: Number(cost) || 0,
        created_by: u.user?.id,
      }).select("id").single();
      if (error) throw error;

      if (selected.length > 0) {
        const { error: linkErr } = await (supabase as any).from("sav_intervention_serials").insert(
          selected.map((sid) => ({ intervention_id: created.id, serial_id: sid, outcome })),
        );
        if (linkErr) throw linkErr;

        const newStatus = OUTCOME_SERIAL_STATUS[outcome];
        if (newStatus) {
          await (supabase as any).from("serial_numbers").update({ status: newStatus }).in("id", selected);
        }
      }
    },
    onSuccess: () => {
      track({ module: "sav", action: "intervention_ajoutee", label: "Intervention SAV ajoutée", table: "sav_interventions" });
      toast.success("Intervention ajoutée");
      setDescription(""); setCost("0"); setSelected([]);
      qc.invalidateQueries({ queryKey: ["sav_interventions", ticket.id] });
      qc.invalidateQueries({ queryKey: ["sav_intervention_serials"] });
      qc.invalidateQueries({ queryKey: ["serials"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const total = items.reduce((s: number, i: any) => s + Number(i.cost ?? 0), 0);
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Interventions — {ticket.ticket_number}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{ticket.description}</p>

      <form className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
        <div className="grid gap-2"><Label className="text-xs">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="grid gap-2"><Label className="text-xs">Technicien</Label>
          <Input value={technician} onChange={(e) => setTechnician(e.target.value)} /></div>
        <div className="grid gap-2 sm:col-span-2"><Label className="text-xs">Description</Label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="grid gap-2"><Label className="text-xs">Coût</Label>
          <Input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
        <div className="grid gap-2"><Label className="text-xs">Issue pour les séries</Label>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {OUTCOMES.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {serials.length > 0 && (
          <div className="grid gap-2 sm:col-span-2">
            <Label className="text-xs">
              Numéros de série concernés ({selected.length} sélectionné(s))
            </Label>
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-auto rounded-md border p-2">
              {serials.map((s: any) => {
                const on = selected.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggle(s.id)}
                    className={`rounded-md border px-2 py-1 font-mono text-[11px] transition ${
                      on ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/60"
                    }`}>
                    {s.serial}
                    <span className={`ml-1 rounded px-1 text-[10px] ${serialStatusTone(s.status)}`}>
                      {SERIAL_STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-end sm:col-span-2">
          <Button type="submit" disabled={add.isPending} className="w-full">
            <Plus className="mr-1 size-4" /> Ajouter l'intervention
          </Button>
        </div>
      </form>

      <div className="max-h-72 overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead><TableHead>Technicien</TableHead>
              <TableHead>Description</TableHead><TableHead>N° série</TableHead>
              <TableHead className="text-right">Coût</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                Aucune intervention.
              </TableCell></TableRow>
            )}
            {items.map((i: any) => {
              const mine = links.filter((l: any) => l.intervention_id === i.id);
              return (
                <TableRow key={i.id}>
                  <TableCell className="text-xs">{formatDate(i.intervention_date)}</TableCell>
                  <TableCell className="text-xs">{i.technician ?? "—"}</TableCell>
                  <TableCell className="text-xs">{i.description}</TableCell>
                  <TableCell>
                    {mine.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {mine.map((l: any) => (
                          <button key={l.id} type="button" onClick={() => setHistorySerial(l.serial_id)}
                            className="rounded-md border px-1.5 py-0.5 font-mono text-[10px] hover:bg-muted/60"
                            title={`${OUTCOME_LABEL[l.outcome] ?? l.outcome} — voir l'historique`}>
                            {l.serial_numbers?.serial ?? l.serial_id.slice(0, 6)}
                            <span className={`ml-1 rounded px-1 ${serialStatusTone(l.serial_numbers?.status ?? "")}`}>
                              {SERIAL_STATUS_LABEL[l.serial_numbers?.status ?? ""] ?? "—"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs">{formatXOF(Number(i.cost ?? 0))}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-right text-sm font-semibold">Total interventions : {formatXOF(total)}</p>

      <SerialHistoryDialog
        serialId={historySerial}
        open={!!historySerial}
        onOpenChange={(o) => !o && setHistorySerial(null)}
      />
    </DialogContent>
  );
}

