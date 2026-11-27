import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, FileDown } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";

export const SERIAL_STATUSES = [
  { value: "en_stock", label: "En stock" },
  { value: "vendu", label: "Vendu" },
  { value: "retourne", label: "Retourné" },
  { value: "sav", label: "SAV" },
  { value: "rebut", label: "Rebut" },
] as const;

export function serialStatusLabel(v: string): string {
  return SERIAL_STATUSES.find((s) => s.value === v)?.label ?? v;
}

/**
 * Gestion des numéros de série d'un lot : liste, ajout unitaire ou en masse,
 * changement de statut (vendu / retourné / SAV / rebut) et export CSV.
 */
export function SerialNumbersDialog({ lot }: { lot: any }) {
  const qc = useQueryClient();
  const [bulk, setBulk] = useState("");
  const [prefix, setPrefix] = useState(`${lot.lot_number}-`);
  const [count, setCount] = useState("10");

  const { data: serials = [] } = useQuery({
    queryKey: ["serials", lot.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("serial_numbers")
        .select("*, clients:client_id(name), sales:sale_id(number)")
        .eq("lot_id", lot.id)
        .order("serial");
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["serials", lot.id] });

  const add = useMutation({
    mutationFn: async (list: string[]) => {
      if (list.length === 0) throw new Error("Aucun numéro de série valide");
      const { data: u } = await supabase.auth.getUser();
      const rows = list.map((serial) => ({
        lot_id: lot.id,
        product_id: lot.product_id,
        serial,
        status: "en_stock",
        created_by: u.user?.id,
      }));
      const { error } = await (supabase as any).from("serial_numbers").insert(rows);
      if (error) throw error;
      return list.length;
    },
    onSuccess: (n) => { toast.success(`${n} numéro(s) de série ajouté(s)`); setBulk(""); refresh(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("serial_numbers").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Statut mis à jour"); refresh(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("serial_numbers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Numéro supprimé"); refresh(); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const generate = () => {
    const n = Math.max(1, Math.min(500, Number(count) || 0));
    const existing = new Set(serials.map((s: any) => s.serial));
    const list: string[] = [];
    let i = 1;
    while (list.length < n) {
      const candidate = `${prefix}${String(i).padStart(4, "0")}`;
      if (!existing.has(candidate)) list.push(candidate);
      i++;
      if (i > n + 1000) break;
    }
    add.mutate(list);
  };

  const handleExport = () => {
    exportToCsv(
      [
        { key: "serial", label: "N° série" },
        { key: "status", label: "Statut" },
        { key: "client", label: "Client" },
        { key: "sale", label: "Vente" },
        { key: "created_at", label: "Créé le" },
      ],
      serials.map((s: any) => ({
        serial: s.serial,
        status: serialStatusLabel(s.status),
        client: s.clients?.name ?? "",
        sale: s.sales?.number ?? "",
        created_at: formatDateTime(s.created_at),
      })),
      `series-${lot.lot_number}.csv`,
    );
  };

  const counts = SERIAL_STATUSES.map((s) => ({
    ...s,
    n: serials.filter((x: any) => x.status === s.value).length,
  }));

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          Numéros de série — lot <span className="font-mono">{lot.lot_number}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-wrap gap-2 text-xs">
        {counts.map((c) => (
          <span key={c.value} className="rounded bg-muted px-2 py-1">
            {c.label} : <strong>{c.n}</strong>
          </span>
        ))}
      </div>

      <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-xs">Génération automatique</Label>
          <div className="flex gap-2">
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Préfixe" />
            <Input className="w-20" type="number" value={count} onChange={(e) => setCount(e.target.value)} />
            <Button type="button" size="sm" onClick={generate} disabled={add.isPending}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Saisie / collage (un par ligne)</Label>
          <Textarea rows={2} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="SN-0001&#10;SN-0002" />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => add.mutate(bulk.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean))}
            disabled={add.isPending}
          >
            Ajouter la liste
          </Button>
        </div>
      </div>

      <div className="max-h-[320px] overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° série</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Vente</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serials.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Aucun numéro de série pour ce lot.
                </TableCell>
              </TableRow>
            )}
            {serials.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.serial}</TableCell>
                <TableCell>
                  <Select value={s.status} onValueChange={(v) => setStatus.mutate({ id: s.id, status: v })}>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERIAL_STATUSES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs">{s.clients?.name ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">{s.sales?.number ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => del.mutate(s.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleExport} disabled={serials.length === 0}>
          <FileDown className="mr-1 size-4" /> Export CSV
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
