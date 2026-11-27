import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FileBadge, FileText, Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/certificats")({
  component: CertificatsPage,
  head: () => ({ meta: [{ title: "Certificats — INDUS-ERP" },
      { name: "description", content: "Certificats — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Certificats — INDUS-ERP" },
      { property: "og:description", content: "Certificats — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

function CertificatsPage() {
  const [q, setQ] = useState("");

  const { data: lots = [] } = useQuery({
    queryKey: ["lots", "with-cert"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lots")
        .select("id, lot_number, reception_date, certificate_url, products(name, sku), suppliers(name)")
        .not("certificate_url", "is", null)
        .order("reception_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Debounce : évite de re-filtrer à chaque frappe clavier
  const debouncedQ = useDebounce(q, 200);

  const filtered = useMemo(() =>
    lots.filter((l: any) => {
      if (!debouncedQ.trim()) return true;
      const s = debouncedQ.toLowerCase();
      return (
        l.lot_number?.toLowerCase().includes(s) ||
        l.products?.name?.toLowerCase().includes(s) ||
        l.products?.sku?.toLowerCase().includes(s) ||
        l.suppliers?.name?.toLowerCase().includes(s)
      );
    }),
  [lots, debouncedQ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Certificats</h1>
          <p className="mt-1 text-sm text-muted-foreground">Documents de conformité rattachés aux lots.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
          <FileBadge className="size-4 text-accent" />
          <span className="text-sm font-medium">{lots.length}</span>
          <span className="text-xs text-muted-foreground">certificat(s)</span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (produit, lot, fournisseur)…" className="pl-9" />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>N° lot</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Réception</TableHead>
              <TableHead className="text-right">Certificat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                Aucun certificat. Ajoutez un PDF lors de la création d'un lot.
              </TableCell></TableRow>
            )}
            {filtered.map((l: any) => (
              <TableRow key={l.id}>
                <TableCell>
                  {l.products?.name} <span className="text-xs text-muted-foreground">({l.products?.sku})</span>
                </TableCell>
                <TableCell className="font-mono text-xs">{l.lot_number}</TableCell>
                <TableCell className="text-sm">{l.suppliers?.name ?? "—"}</TableCell>
                <TableCell className="text-sm">{formatDate(l.reception_date)}</TableCell>
                <TableCell className="text-right">
                  <a href={l.certificate_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                    <FileText className="size-3.5" /> Consulter le PDF
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
