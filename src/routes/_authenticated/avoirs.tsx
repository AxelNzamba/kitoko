import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search, Mail } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatDateTime, formatXOF } from "@/lib/format";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/_authenticated/avoirs")({
  component: AvoirsPage,
  head: () => ({ meta: [{ title: "Avoirs — INDUS-ERP" },
      { name: "description", content: "Avoirs — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Avoirs — INDUS-ERP" },
      { property: "og:description", content: "Avoirs — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const PAGE_SIZE = 20;

function AvoirsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [q, setQ] = useState("");

  const [formSaleId, setFormSaleId] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formReason, setFormReason] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: creditsData = { data: [], count: 0 } } = useQuery({
    queryKey: ["credits", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await (supabase as any)
        .from("credits")
        .select("*, sales!left(number, client_name, total_ttc)")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales", "recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sales")
        .select("id, number, client_name, total_ttc, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const handleSaleSelect = (saleId: string) => {
    setFormSaleId(saleId);
    const sale = sales.find((s: any) => s.id === saleId);
    if (sale) {
      setFormClient((sale as any).client_name ?? "");
      setFormAmount(String((sale as any).total_ttc ?? ""));
    }
  };

  const createCredit = useMutation({
    mutationFn: async () => {
      setBusy(true);
      const { data: u } = await supabase.auth.getUser();
      const { data: numData } = await (supabase.rpc as any)("generate_credit_number");
      const creditNumber = numData ?? `AV-${Date.now()}`;

      const amount = Number(formAmount);
      if (!amount || amount <= 0) throw new Error("Montant invalide");

      const { error } = await (supabase as any).from("credits").insert({
        credit_number: creditNumber,
        sale_id: formSaleId || null,
        client_name: formClient,
        total_ht: amount,
        total_tva: 0,
        total_ttc: amount,
        reason: formReason,
        created_by: u.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Avoir créé");
      notify.info("Avoir créé", "Un avoir a été enregistré.");
      qc.invalidateQueries({ queryKey: ["credits"] });
      setOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
    onSettled: () => setBusy(false),
  });

  const resetForm = () => {
    setFormSaleId(""); setFormClient(""); setFormAmount(""); setFormReason("");
  };

  const handleSendEmail = async (credit: any) => {
    const clientEmail = prompt("Adresse email du client :", "");
    if (!clientEmail) return;
    notify.info("Email envoyé", `L'avoir ${credit.credit_number} a été envoyé à ${clientEmail}`);
  };

  const credits = creditsData.data;
  const total = creditsData.count;

  // Debounce : évite de re-filtrer à chaque frappe clavier
  const debouncedQ = useDebounce(q, 200);

  const filtered = useMemo(
    () =>
      debouncedQ.trim()
        ? credits.filter((c: any) => {
            const s = debouncedQ.toLowerCase();
            return c.credit_number?.toLowerCase().includes(s) ||
              c.client_name?.toLowerCase().includes(s) ||
              c.reason?.toLowerCase().includes(s);
          })
        : credits,
    [credits, debouncedQ],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Avoirs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gérez les avoirs et remboursements clients.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 size-4" /> Nouvel avoir</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un avoir</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createCredit.mutate(); }} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Vente liée (optionnelle)</Label>
                <Select value={formSaleId} onValueChange={handleSaleSelect}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une vente" /></SelectTrigger>
                  <SelectContent>
                    {sales.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.number} — {s.client_name || "Particulier"} — {formatXOF(Number(s.total_ttc))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Client</Label>
                <Input value={formClient} onChange={(e) => setFormClient(e.target.value)} placeholder="Nom du client" />
              </div>
              <div className="grid gap-2">
                <Label>Montant TTC *</Label>
                <Input type="number" step="0.01" min="0" value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)} required placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label>Motif</Label>
                <Select value={formReason} onValueChange={setFormReason}>
                  <SelectTrigger><SelectValue placeholder="Choisir un motif" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annulation de vente">Annulation de vente</SelectItem>
                    <SelectItem value="Produit défectueux">Produit défectueux</SelectItem>
                    <SelectItem value="Erreur de facturation">Erreur de facturation</SelectItem>
                    <SelectItem value="Remise commerciale">Remise commerciale</SelectItem>
                    <SelectItem value="Garantie">Garantie</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={busy}>{busy ? "..." : "Créer l'avoir"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par n° avoir, client…" className="pl-9" />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° avoir</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Vente liée</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                Aucun avoir enregistré.
              </TableCell></TableRow>
            )}
            {filtered.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.credit_number}</TableCell>
                <TableCell className="text-sm">{formatDateTime(c.created_at)}</TableCell>
                <TableCell>{c.client_name || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{c.sales?.number || "—"}</TableCell>
                <TableCell className="text-right font-mono font-semibold">{formatXOF(Number(c.total_ttc))}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{c.reason || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSendEmail(c)} title="Envoyer par email">
                    <Mail className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>
    </div>
  );
}
