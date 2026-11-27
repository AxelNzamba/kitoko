import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notify";
import { formatXOF, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

const CATEGORIES = [
  "Loyer", "Eau", "Électricité", "Transport", "Salaires",
  "Maintenance", "Internet", "Fournitures", "Marketing", "Autre",
];

export const Route = createFileRoute("/_authenticated/depenses")({
  component: DepensesPage,
  head: () => ({ meta: [{ title: "Dépenses — INDUS-ERP" },
      { name: "description", content: "Dépenses — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Dépenses — INDUS-ERP" },
      { property: "og:description", content: "Dépenses — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const EXPENSES_PAGE_SIZE = 20;

function DepensesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(EXPENSES_PAGE_SIZE);

  const { data: expensesData = { data: [], count: 0 } } = useQuery({
    queryKey: ["expenses", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("expenses" as any)
        .select("*", { count: "exact", head: false } as any)
        .order("expense_date", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  const expenses = expensesData.data as any[];
  const totalExpenses = expensesData.count;

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { notify.success("Dépense supprimée"); qc.invalidateQueries({ queryKey: ["expenses"] }); },
    onError: (e: any) => notify.error("Erreur", e.message),
  });

  const filtered = useMemo(() => (
    filter === "all" ? expenses : expenses.filter((e: any) => e.category === filter)
  ), [expenses, filter]);

  const total = useMemo(() => filtered.reduce((s: number, e: any) => s + Number(e.amount), 0), [filtered]);

  const monthTotal = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return expenses
      .filter((e: any) => e.expense_date?.slice(0, 7) === thisMonth)
      .reduce((s: number, e: any) => s + Number(e.amount), 0);
  }, [expenses]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e: any) => map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenses]);
  const maxCat = Math.max(1, ...byCategory.map(([, v]) => v));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dépenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Suivi des charges d'exploitation.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 size-4" /> Nouvelle dépense</Button></DialogTrigger>
          <ExpenseForm onClose={() => setOpen(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ["expenses"] }); setOpen(false); }} />
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Wallet className="size-3.5" /> Total affiché
          </div>
          <p className="mt-2 text-2xl font-bold">{formatXOF(total)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ce mois-ci</p>
          <p className="mt-2 text-2xl font-bold">{formatXOF(monthTotal)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</p>
          <p className="mt-2 text-2xl font-bold">{expenses.length}</p>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Répartition par catégorie</h2>
          <div className="space-y-2">
            {byCategory.map(([cat, v]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs font-medium">{cat}</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(v / maxCat) * 100}%` }} />
                  </div>
                </div>
                <span className="w-28 shrink-0 text-right text-xs font-semibold tabular-nums">{formatXOF(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Label className="text-xs">Filtre catégorie :</Label>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Libellé</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                Aucune dépense.
              </TableCell></TableRow>
            )}
            {filtered.map((e: any) => (
              <ExpenseRow key={e.id} expense={e} onDelete={(id) => del.mutate(id)} />
            ))}
          </TableBody>
        </Table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalExpenses}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

const ExpenseRow = memo(function ExpenseRow({ expense, onDelete }: { expense: any; onDelete: (id: string) => void }) {
  return (
    <TableRow key={expense.id}>
      <TableCell className="text-sm">{formatDate(expense.expense_date)}</TableCell>
      <TableCell>
        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{expense.category}</span>
      </TableCell>
      <TableCell className="text-sm">
        <div className="font-medium">{expense.label}</div>
        {expense.notes && <div className="text-xs text-muted-foreground">{expense.notes}</div>}
      </TableCell>
      <TableCell className="text-right font-semibold tabular-nums">{formatXOF(Number(expense.amount))}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => {
          if (confirm("Supprimer cette dépense ?")) onDelete(expense.id);
        }}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

function ExpenseForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    category: "Loyer",
    label: "",
    amount: "",
    expense_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("expenses" as any).insert({
        category: form.category,
        label: form.label.trim(),
        amount: Number(form.amount),
        expense_date: form.expense_date,
        notes: form.notes.trim() || null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { notify.success("Dépense enregistrée", `${form.label} — ${formatXOF(Number(form.amount))}`); onCreated(); },
    onError: (e: any) => notify.error("Erreur", e.message),
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nouvelle dépense</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (form.label.trim() && Number(form.amount) > 0) create.mutate(); }} className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Catégorie *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Date *</Label>
            <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} required />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Libellé *</Label>
          <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required autoFocus />
        </div>
        <div className="grid gap-2">
          <Label>Montant (F) *</Label>
          <Input type="number" min="0" step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        </div>
        <div className="grid gap-2">
          <Label>Notes</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit">Enregistrer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
