import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { Plus, Trash2, Mail, Phone, MapPin, Truck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

export const Route = createFileRoute("/_authenticated/fournisseurs")({
  component: FournisseursPage,
  head: () => ({ meta: [{ title: "Fournisseurs — INDUS-ERP" },
      { name: "description", content: "Fournisseurs — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Fournisseurs — INDUS-ERP" },
      { property: "og:description", content: "Fournisseurs — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const SUPPLIERS_PAGE_SIZE = 20;

function FournisseursPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(SUPPLIERS_PAGE_SIZE);

  const { data: suppliersData = { data: [], count: 0 } } = useQuery({
    queryKey: ["suppliers", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("suppliers")
        .select("*", { count: "exact", head: false })
        .order("name")
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  const { data: lots = [] } = useQuery({
    queryKey: ["lots-by-supplier"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lots").select("supplier_id");
      if (error) throw error;
      return data;
    },
  });

  const suppliers = suppliersData.data;
  const totalSuppliers = suppliersData.count;

  const lotsCount = useMemo(() => {
    const map = new Map<string, number>();
    lots.forEach((l: any) => {
      if (l.supplier_id) map.set(l.supplier_id, (map.get(l.supplier_id) ?? 0) + 1);
    });
    return (id: string) => map.get(id) ?? 0;
  }, [lots]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { notify.success("Fournisseur supprimé"); qc.invalidateQueries({ queryKey: ["suppliers"] }); },
    onError: (e: any) => notify.error("Erreur", e.message),
  });

  // Debounce : évite de re-filtrer la liste à chaque frappe clavier
  const debouncedQ = useDebounce(q, 200);

  const filtered = useMemo(() =>
    suppliers.filter((s: any) => {
      if (!debouncedQ.trim()) return true;
      const t = debouncedQ.toLowerCase();
      return s.name?.toLowerCase().includes(t) || s.phone?.toLowerCase().includes(t) || s.email?.toLowerCase().includes(t);
    }),
  [suppliers, debouncedQ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fournisseurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{totalSuppliers} fournisseur(s) enregistré(s).</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 size-4" /> Nouveau fournisseur</Button></DialogTrigger>
          <SupplierForm onClose={() => setOpen(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ["suppliers"] }); setOpen(false); }} />
        </Dialog>
      </div>

      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="max-w-md" />

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead className="text-center">Lots</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                Aucun fournisseur.
              </TableCell></TableRow>
            )}
            {filtered.map((s: any) => (
              <SupplierRow key={s.id} supplier={s} lotsCount={lotsCount(s.id)} onDelete={(id) => del.mutate(id)} />
            ))}
          </TableBody>
        </Table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalSuppliers}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

const SupplierRow = memo(function SupplierRow({ supplier, lotsCount, onDelete }: { supplier: any; lotsCount: number; onDelete: (id: string) => void }) {
  return (
    <TableRow key={supplier.id}>
      <TableCell>
        <div className="flex items-center gap-2 font-medium">
          <Truck className="size-4 text-muted-foreground" />
          {supplier.name}
        </div>
      </TableCell>
      <TableCell className="text-sm">
        <div className="space-y-0.5">
          {supplier.phone && <div className="flex items-center gap-1"><Phone className="size-3" /> {supplier.phone}</div>}
          {supplier.email && <div className="flex items-center gap-1"><Mail className="size-3" /> {supplier.email}</div>}
          {!supplier.phone && !supplier.email && <span className="text-xs text-muted-foreground">—</span>}
        </div>
      </TableCell>
      <TableCell className="max-w-xs text-sm text-muted-foreground">
        {supplier.address ? <div className="flex items-start gap-1"><MapPin className="mt-0.5 size-3 shrink-0" /> <span className="truncate">{supplier.address}</span></div> : "—"}
      </TableCell>
      <TableCell className="text-center">
        <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
          {lotsCount}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => {
          if (confirm(`Supprimer "${supplier.name}" ?`)) onDelete(supplier.id);
        }}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

function SupplierForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("suppliers").insert({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { notify.success("Fournisseur créé", form.name); onCreated(); },
    onError: (e: any) => notify.error("Erreur", e.message),
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nouveau fournisseur</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) create.mutate(); }} className="grid gap-4">
        <div className="grid gap-2">
          <Label>Nom / Société *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Adresse</Label>
          <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit">Créer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
