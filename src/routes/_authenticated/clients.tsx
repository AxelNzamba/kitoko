import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { Plus, Trash2, Mail, Phone, Pencil, FileDown, MessageCircle, History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { exportToCsv } from "@/lib/csv";
import { openWhatsApp } from "@/lib/whatsapp";
import { readSettings } from "@/lib/app-settings";
import { clientSearchFilter, paymentLabels, summarizeSales } from "@/lib/business-insights";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(255),
  company: z.string().trim().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide").max(255).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  credit_limit: z.string().trim().regex(/^\d*(\.\d+)?$/, "Plafond invalide").optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export const Route = createFileRoute("/_authenticated/clients")({
  component: ClientsPage,
  head: () => ({ meta: [{ title: "Clients — INDUS-ERP" },
      { name: "description", content: "Clients — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Clients — INDUS-ERP" },
      { property: "og:description", content: "Clients — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const CLIENTS_PAGE_SIZE = 20;

function ClientsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editClient, setEditClient] = useState<any | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(CLIENTS_PAGE_SIZE);

  // Debounce : recherche côté serveur sur toutes les pages
  const debouncedQ = useDebounce(q, 250);

  const { data: clientsData = { data: [], count: 0 }, isLoading, isError, refetch } = useQuery({
    queryKey: ["clients", page, pageSize, debouncedQ],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let req = supabase.from("clients").select("*", { count: "exact", head: false }).order("name").range(from, to);
      if (debouncedQ.trim()) req = req.or(clientSearchFilter(debouncedQ));
      const { data, error, count } = await req;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });
  const [historyClient, setHistoryClient] = useState<any | null>(null);

  const clients = clientsData.data;
  const totalClients = clientsData.count;

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Client supprimé"); qc.invalidateQueries({ queryKey: ["clients"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const filtered = clients;

  const handleExportCsv = async () => {
    const { data: allClients, error } = await supabase
      .from("clients")
      .select("*")
      .order("name");
    if (error) { toast.error("Erreur lors de l'export"); return; }
    exportToCsv(
      [
        { key: "name", label: "Nom" },
        { key: "company", label: "Société" },
        { key: "phone", label: "Téléphone" },
        { key: "email", label: "Email" },
        { key: "address", label: "Adresse" },
        { key: "notes", label: "Notes" },
      ],
      (allClients ?? []).map((c: any) => ({
        name: c.name,
        company: c.company ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
        address: c.address ?? "",
        notes: c.notes ?? "",
      })),
      `clients-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const openEdit = (client: any) => {
    setEditClient(client);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fichier clients particuliers et entreprises.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} title="Exporter en CSV">
            <FileDown className="mr-1 size-4" />
            CSV
          </Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditClient(null); } }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditClient(null)}><Plus className="mr-1 size-4" /> Nouveau client</Button>
            </DialogTrigger>
          <ClientForm
            client={editClient}
            onClose={() => { setOpen(false); setEditClient(null); }}
            onSaved={() => {
              qc.invalidateQueries({ queryKey: ["clients"] });
              setOpen(false);
              setEditClient(null);
            }}
          />
        </Dialog>
        </div>
      </div>

      <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Rechercher un client" placeholder="Rechercher un client…" className="max-w-md" />

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Société</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 inline size-4 animate-spin" />Chargement des clients…
              </TableCell></TableRow>
            )}
            {isError && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-destructive">
                Impossible de charger les clients. <Button variant="link" size="sm" onClick={() => refetch()}>Réessayer</Button>
              </TableCell></TableRow>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                {debouncedQ.trim() ? "Aucun client ne correspond à la recherche." : "Aucun client."}
              </TableCell></TableRow>
            )}
            {filtered.map((c: any) => (
              <ClientRow key={c.id} client={c} onHistory={() => setHistoryClient(c)} onEdit={() => openEdit(c)} onDelete={(id) => del.mutate(id)} />
            ))}
          </TableBody>
        </Table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalClients}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
      <ClientHistoryDialog client={historyClient} onClose={() => setHistoryClient(null)} />
    </div>
  );
}

const ClientRow = memo(function ClientRow({ client, onHistory, onEdit, onDelete }: { client: any; onHistory: () => void; onEdit: () => void; onDelete: (id: string) => void }) {
  return (
    <TableRow key={client.id}>
      <TableCell className="font-medium">{client.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{client.company ?? "—"}</TableCell>
      <TableCell className="text-sm">
        <div className="space-y-0.5">
          {client.phone && <div className="flex items-center gap-1"><Phone className="size-3" /> {client.phone}</div>}
          {client.email && <div className="flex items-center gap-1"><Mail className="size-3" /> {client.email}</div>}
          {!client.phone && !client.email && <span className="text-xs text-muted-foreground">—</span>}
        </div>
      </TableCell>
      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{client.address ?? "—"}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {client.phone && (
            <Button
              variant="ghost"
              size="sm"
              title="Contacter sur WhatsApp"
              aria-label="Contacter sur WhatsApp"
              onClick={() =>
                openWhatsApp(
                  client.phone,
                  `Bonjour ${client.name}, ici ${readSettings().companyName}. `,
                )
              }
            >
              <MessageCircle className="size-4 text-emerald-600" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onHistory} title="Historique des achats" aria-label="Historique des achats">
            <History className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Modifier">
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
                <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer <strong>{client.name}</strong> ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(client.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
});

function ClientForm({ client, onClose, onSaved }: { client: any | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!client;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? "",
      company: client?.company ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      address: client?.address ?? "",
      notes: client?.notes ?? "",
      credit_limit: String((client as any)?.credit_limit ?? 0),
    },
  });

  const save = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      const payload = {
        name: values.name.trim(),
        company: values.company?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
        address: values.address?.trim() || null,
        notes: values.notes?.trim() || null,
        credit_limit: Number(values.credit_limit ?? 0),
      };

      if (isEdit) {
        const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(isEdit ? "Client modifié" : "Client créé"); onSaved(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{isEdit ? "Modifier le client" : "Nouveau client"}</DialogTitle></DialogHeader>
      <form onSubmit={form.handleSubmit((values) => save.mutate(values))} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" {...form.register("name")} autoFocus />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company">Société</Label>
          <Input id="company" {...form.register("company")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Adresse</Label>
          <Textarea id="address" rows={2} {...form.register("address")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="credit_limit">Plafond de crédit (0 = pas de crédit)</Label>
          <Input id="credit_limit" type="number" min={0} {...form.register("credit_limit")} />
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit">{isEdit ? "Modifier" : "Créer"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}


function ClientHistoryDialog({ client, onClose }: { client: any | null; onClose: () => void }) {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["client-history", client?.name],
    enabled: !!client,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, number, created_at, payment_mode, total_ht, total_tva, total_ttc, client_name")
        .eq("client_name", client.name)
        .eq("_deleted", false)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
  const sum = summarizeSales(data as any, []);
  const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <Dialog open={!!client} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Historique — {client?.name}</DialogTitle></DialogHeader>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground"><Loader2 className="mr-2 inline size-4 animate-spin" />Chargement…</p>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-destructive">Impossible de charger l’historique.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-border p-3"><div className="text-xs text-muted-foreground">Ventes</div><div className="text-lg font-semibold">{sum.count}</div></div>
              <div className="rounded-md border border-border p-3"><div className="text-xs text-muted-foreground">Total TTC</div><div className="text-lg font-semibold">{fmt(sum.ttc)}</div></div>
              <div className="rounded-md border border-border p-3"><div className="text-xs text-muted-foreground">Panier moyen</div><div className="text-lg font-semibold">{fmt(sum.average)}</div></div>
            </div>
            <div className="max-h-80 overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader><TableRow><TableHead>N°</TableHead><TableHead>Date</TableHead><TableHead>Paiement</TableHead><TableHead className="text-right">TTC</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.length === 0 && <TableRow><TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">Aucune vente enregistrée à ce nom.</TableCell></TableRow>}
                  {data.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-xs">{v.number}</TableCell>
                      <TableCell className="text-sm">{new Date(v.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-sm">{paymentLabels[v.payment_mode] ?? v.payment_mode}</TableCell>
                      <TableCell className="text-right">{fmt(Number(v.total_ttc))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
