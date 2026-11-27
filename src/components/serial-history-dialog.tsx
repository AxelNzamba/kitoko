import { useQuery } from "@tanstack/react-query";
import { Boxes, Receipt, Wrench, Tag, Undo2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatDateTime, formatXOF } from "@/lib/format";

export const SERIAL_STATUS_LABEL: Record<string, string> = {
  en_stock: "En stock",
  vendu: "Vendu",
  retourne: "Retourné",
  sav: "En SAV",
  rebut: "Rebut",
};

export function serialStatusTone(status: string): string {
  switch (status) {
    case "en_stock": return "bg-emerald-500/10 text-emerald-600";
    case "vendu": return "bg-blue-500/10 text-blue-600";
    case "sav": return "bg-orange-500/10 text-orange-600";
    case "retourne": return "bg-amber-500/10 text-amber-600";
    default: return "bg-destructive/10 text-destructive";
  }
}

type TimelineEvent = {
  at: string;
  icon: typeof Boxes;
  title: string;
  detail: string;
};

/**
 * Historique complet d'un numéro de série : réception du lot, vente,
 * interventions SAV rattachées et statut courant.
 */
export function SerialHistoryDialog({
  serialId,
  open,
  onOpenChange,
}: {
  serialId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data } = useQuery({
    queryKey: ["serial-history", serialId],
    enabled: !!serialId && open,
    queryFn: async () => {
      const { data: serial, error } = await (supabase as any)
        .from("serial_numbers")
        .select(
          "*, products:product_id(name, sku), lots:lot_id(lot_number, reception_date, suppliers:supplier_id(name)), sales:sale_id(number, created_at, total_ttc), clients:client_id(name)",
        )
        .eq("id", serialId)
        .maybeSingle();
      if (error) throw error;

      const { data: links } = await (supabase as any)
        .from("sav_intervention_serials")
        .select(
          "id, outcome, notes, created_at, sav_interventions:intervention_id(id, intervention_date, technician, description, cost, sav_tickets:ticket_id(ticket_number, type, status))",
        )
        .eq("serial_id", serialId)
        .order("created_at", { ascending: false });

      return { serial, links: links ?? [] };
    },
  });

  const serial = data?.serial;
  const events: TimelineEvent[] = [];

  if (serial) {
    if (serial.lots) {
      events.push({
        at: serial.lots.reception_date ?? serial.created_at,
        icon: Boxes,
        title: `Réception — lot ${serial.lots.lot_number}`,
        detail: serial.lots.suppliers?.name ? `Fournisseur : ${serial.lots.suppliers.name}` : "Entrée en stock",
      });
    }
    if (serial.sales) {
      events.push({
        at: serial.sales.created_at,
        icon: Receipt,
        title: `Vente ${serial.sales.number}`,
        detail: `${serial.clients?.name ?? "Client comptoir"} — ${formatXOF(Number(serial.sales.total_ttc ?? 0))}`,
      });
    }
    for (const l of data?.links ?? []) {
      const iv = l.sav_interventions;
      if (!iv) continue;
      events.push({
        at: iv.intervention_date,
        icon: l.outcome === "rebut" ? Undo2 : Wrench,
        title: `SAV ${iv.sav_tickets?.ticket_number ?? ""} — ${OUTCOME_LABEL[l.outcome] ?? l.outcome}`,
        detail: `${iv.description}${iv.technician ? ` · ${iv.technician}` : ""} · ${formatXOF(Number(iv.cost ?? 0))}`,
      });
    }
  }

  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="size-4" />
            <span className="font-mono">{serial?.serial ?? "Numéro de série"}</span>
            {serial && (
              <Badge className={serialStatusTone(serial.status)} variant="secondary">
                {SERIAL_STATUS_LABEL[serial.status] ?? serial.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {serial && (
          <p className="text-sm text-muted-foreground">
            {serial.products?.name} ({serial.products?.sku})
          </p>
        )}

        <ol className="max-h-[60vh] space-y-3 overflow-auto border-l pl-4">
          {events.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">Aucun événement enregistré.</li>
          )}
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[25px] top-1 flex size-4 items-center justify-center rounded-full bg-primary/10">
                <e.icon className="size-2.5 text-primary" />
              </span>
              <p className="text-sm font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.detail}</p>
              <p className="text-[11px] text-muted-foreground">{formatDate(e.at)}</p>
            </li>
          ))}
        </ol>

        {serial?.notes && (
          <p className="rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">{serial.notes}</p>
        )}
        {serial && (
          <p className="text-right text-[11px] text-muted-foreground">
            Dernière mise à jour : {formatDateTime(serial.updated_at)}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const OUTCOME_LABEL: Record<string, string> = {
  traite: "Traité",
  remplace: "Remplacé",
  repare: "Réparé",
  rebut: "Mis au rebut",
  retourne_client: "Retourné au client",
};
