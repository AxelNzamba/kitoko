import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
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

export const Route = createFileRoute("/_authenticated/categories")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Catégories — INDUS-ERP" },
      { name: "description", content: "Catégories — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Catégories — INDUS-ERP" },
      { property: "og:description", content: "Catégories — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const CATEGORIES_PAGE_SIZE = 20;

function CategoriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(CATEGORIES_PAGE_SIZE);

  const { data: categoriesData = { data: [], count: 0 } } = useQuery({
    queryKey: ["categories", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: false })
        .order("name")
        .range(from, to);
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
  });

  const categories = categoriesData.data;
  const totalCategories = categoriesData.count;

  const nameById = useMemo(() => new Map(categories.map((c: any) => [c.id, c.name])), [categories]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Catégorie supprimée"); qc.invalidateQueries({ queryKey: ["categories"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catégories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organisation hiérarchique du catalogue.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 size-4" /> Nouvelle catégorie</Button></DialogTrigger>
          <CategoryForm
            categories={categories}
            onClose={() => setOpen(false)}
            onCreated={() => { qc.invalidateQueries({ queryKey: ["categories"] }); setOpen(false); }}
          />
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow><TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                Aucune catégorie.
              </TableCell></TableRow>
            )}
            {categories.map((c: any) => (
              <CategoryRow key={c.id} category={c} parentName={nameById.get(c.parent_id) ?? null} onDelete={(id) => del.mutate(id)} />
            ))}
          </TableBody>
        </Table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalCategories}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

const CategoryRow = memo(function CategoryRow({ category, parentName, onDelete }: { category: any; parentName: string | null; onDelete: (id: string) => void }) {
  return (
    <TableRow key={category.id}>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {parentName ?? <span className="text-xs">racine</span>}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => {
          if (confirm(`Supprimer la catégorie "${category.name}" ?`)) onDelete(category.id);
        }}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

function CategoryForm({
  categories, onClose, onCreated,
}: { categories: any[]; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("categories").insert({
        name: name.trim(),
        parent_id: parentId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Catégorie créée"); onCreated(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }} className="grid gap-4">
        <div className="grid gap-2">
          <Label>Nom *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div className="grid gap-2">
          <Label>Catégorie parente</Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger><SelectValue placeholder="(racine)" /></SelectTrigger>
            <SelectContent>
              {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit">Créer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
