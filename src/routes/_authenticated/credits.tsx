import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { HandCoins, Loader2, MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { formatXOF, formatDate } from "@/lib/format";
import { track } from "@/lib/audit";
import { debtPaid, debtRemaining, debtStatus, debtStatusLabels, whatsappLink, type DebtStatus } from "@/lib/credit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/credits")({
  component: CreditsPage,
  head: () => ({ meta: [
    { title: "Crédits clients — INDUS-ERP" },
    { name: "description", content: "Suivi des ventes à crédit, échéances et relances WhatsApp." },
  
      { property: "og:title", content: "Crédits clients — INDUS-ERP" },
      { property: "og:description", content: "Suivi des ventes à crédit, échéances et relances WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

type DebtRow = {
  id: string; amount: number; due_date: string; created_at: string; notes: string | null;
  clients: { id: string; name: string; phone: string | null } | null;
  sales: { number: string } | null;
  debt_payments: { amount: number }[];
};

const statusVariant: Record<DebtStatus, "default" | "secondary" | "destructive" | "outline"> = {
  soldee: "secondary", en_retard: "destructive", a_echeance: "default", en_cours: "outline",
};

function CreditsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"ouvertes" | "toutes" | "en_retard">("ouvertes");
  const [paying, setPaying] = useState<DebtRow | null>(null);
  const [amount, setAmount] = useState("");

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ["client_debts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_debts")
        .select("id, amount, due_date, created_at, notes, clients:client_id(id, name, phone), sales:sale_id(number), debt_payments(amount)")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as DebtRow[];
    },
  });

  const rows = useMemo(() => data
    .map((d) => ({ d, status: debtStatus({ ...d, payments: d.debt_payments }), rest: debtRemaining({ ...d, payments: d.debt_payments }) }))
    .filter((r) => filter === "toutes" || (filter === "en_retard" ? r.status === "en_retard" : r.status !== "soldee")), [data, filter]);

  const totals = useMemo(() => {
    let open = 0, late = 0;
    for (const d of data) {
      const p = { ...d, payments: d.debt_payments };
      const r = debtRemaining(p);
      open += r;
      if (debtStatus(p) === "en_retard") late += r;
    }
    return { open, late };
  }, [data]);

  const pay = useMutation({
    mutationFn: async () => {
      if (!paying) return;
      const value = Number(amount);
      const rest = debtRemaining({ ...paying, payments: paying.debt_payments });
      if (!(value > 0)) throw new Error("Montant invalide");
      if (value > rest) throw new Error(`Le montant dépasse le reste à payer (${formatXOF(rest)})`);
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("debt_payments").insert({ debt_id: paying.id, amount: value, created_by: u.user?.id });
      if (error) throw error;
      track({ module: "credits", action: "remboursement", label: `Remboursement ${formatXOF(value)} — ${paying.clients?.name ?? ""}`, table: "debt_payments", recordId: paying.id });
    },
    onSuccess: () => { toast.success("Paiement enregistré"); setPaying(null); setAmount(""); qc.invalidateQueries({ queryKey: ["client_debts"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  function reminder(d: DebtRow, rest: number) {
    const msg = `Bonjour ${d.clients?.name ?? ""}, il reste ${formatXOF(rest)} à régler${d.sales ? ` sur la facture ${d.sales.number}` : ""}, échéance le ${formatDate(d.due_date)}. Merci.`;
    const link = whatsappLink(d.clients?.phone, msg);
    if (!link) { toast.error("Ce client n'a pas de numéro de téléphone valide."); return; }
    track({ module: "credits", action: "relance_whatsapp", label: `Relance WhatsApp — ${d.clients?.name ?? ""}`, table: "client_debts", recordId: d.id });
    window.open(link, "_blank", "noopener");
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <HandCoins className="size-6 text-accent" />
        <h1 className="text-2xl font-bold">Crédits clients</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Total dû par les clients</p><p className="text-2xl font-bold">{formatXOF(totals.open)}</p></div>
        <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Dont en retard</p><p className="text-2xl font-bold text-destructive">{formatXOF(totals.late)}</p></div>
      </div>
      <div className="flex gap-2">
        {(["ouvertes", "en_retard", "toutes"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "ouvertes" ? "À payer" : f === "en_retard" ? "En retard" : "Toutes"}
          </Button>
        ))}
      </div>
      {isLoading ? <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" />Chargement…</p>
        : error ? <div className="text-destructive">Impossible de charger les crédits. <Button size="sm" variant="outline" onClick={() => refetch()}>Réessayer</Button></div>
        : rows.length === 0 ? <p className="text-muted-foreground">Aucun crédit. Choisissez « Crédit » comme paiement à la caisse pour en créer.</p>
        : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Client</TableHead><TableHead>Facture</TableHead><TableHead>Échéance</TableHead>
              <TableHead className="text-right">Montant</TableHead><TableHead className="text-right">Payé</TableHead>
              <TableHead className="text-right">Reste</TableHead><TableHead>Statut</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>
              {rows.map(({ d, status, rest }) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.clients?.name ?? "—"}</TableCell>
                  <TableCell>{d.sales?.number ?? "—"}</TableCell>
                  <TableCell>{formatDate(d.due_date)}</TableCell>
                  <TableCell className="text-right">{formatXOF(Number(d.amount))}</TableCell>
                  <TableCell className="text-right">{formatXOF(debtPaid({ ...d, payments: d.debt_payments }))}</TableCell>
                  <TableCell className="text-right font-semibold">{formatXOF(rest)}</TableCell>
                  <TableCell><Badge variant={statusVariant[status]}>{debtStatusLabels[status]}</Badge></TableCell>
                  <TableCell className="flex justify-end gap-1">
                    {status !== "soldee" && <>
                      <Button size="sm" variant="outline" onClick={() => reminder(d, rest)} title="Relancer par WhatsApp"><MessageCircle className="size-4" /></Button>
                      <Button size="sm" onClick={() => { setPaying(d); setAmount(String(rest)); }}><Plus className="mr-1 size-4" />Paiement</Button>
                    </>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={!!paying} onOpenChange={(o) => !o && setPaying(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Paiement de {paying?.clients?.name}</DialogTitle></DialogHeader>
          <div className="grid gap-1">
            <Label>Montant reçu</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <DialogFooter><Button disabled={pay.isPending} onClick={() => pay.mutate()}>{pay.isPending ? "Enregistrement…" : "Enregistrer"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
