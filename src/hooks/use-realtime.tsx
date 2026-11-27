/**
 * Hook Realtime Supabase — Permet de s'abonner aux changements
 * de tables PostgreSQL et de réagir en temps réel.
 *
 * Utilise les fonctionnalités Realtime intégrées de Supabase.
 * Nécessite que Realtime soit activé sur la table concernée (via Supabase Dashboard
 * ou config.toml : [analytics.realtime] ou via l'UI Replication).
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export type RealtimeFilter = {
  /** Nom de la table PostgreSQL (ex: "sales", "stock_movements") */
  table: string;
  /** Filtre optionnel sur l'événement */
  event?: RealtimeEvent;
  /** Filtre optionnel sur une colonne (ex: "product_id=eq.123") */
  filter?: string;
  /** Schéma (par défaut "public") */
  schema?: string;
};

export type RealtimeOptions = {
  /** Callback appelé à chaque changement */
  onPayload?: (payload: RealtimePostgresChangesPayload<any>) => void;
  /** Activer/désactiver la souscription */
  enabled?: boolean;
};

export type RealtimeStatus = "connecting" | "connected" | "error" | "disabled";

/**
 * Hook React pour s'abonner aux changements d'une table Supabase.
 * Se nettoie automatiquement au démontage du composant.
 *
 * @example
 * ```tsx
 * const { status } = useRealtimeSubscription(
 *   { table: "sales" },
 *   { onPayload: () => queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] }) }
 * );
 * ```
 */
export function useRealtimeSubscription(
  filter: RealtimeFilter,
  options: RealtimeOptions = {},
): { status: RealtimeStatus } {
  const { table, event = "*", filter: rowFilter, schema = "public" } = filter;
  const { onPayload, enabled = true } = options;
  const [status, setStatus] = useState<RealtimeStatus>("disabled");
  const callbackRef = useRef(onPayload);
  callbackRef.current = onPayload;

  useEffect(() => {
    if (!enabled) {
      setStatus("disabled");
      return;
    }

    const channelName = `realtime-${schema}-${table}-${event}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        {
          event,
          schema,
          table,
          filter: rowFilter,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          callbackRef.current?.(payload);
        },
      )
      .subscribe((state: string) => {
        if (state === "SUBSCRIBED") setStatus("connected");
        else if (state === "CHANNEL_ERROR") setStatus("error");
        else setStatus("connecting");
      });

    return () => {
      supabase.removeChannel(channel);
      setStatus("disabled");
    };
  }, [table, event, rowFilter, schema, enabled]);

  return { status };
}

/**
 * Indicateur "Live" à afficher dans les en-têtes.
 * Affiche un point vert + "Live" ou "Reconnexion..." selon le statut.
 */
export function LiveBadge({ status }: { status: RealtimeStatus }) {
  if (status === "disabled") return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        status === "connected"
          ? "bg-success/10 text-success"
          : status === "connecting"
            ? "bg-warning/15 text-warning-foreground"
            : "bg-destructive/10 text-destructive"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "connected"
            ? "bg-success animate-pulse"
            : status === "connecting"
              ? "bg-warning"
              : "bg-destructive"
        }`}
      />
      {status === "connected" ? "Live" : status === "connecting" ? "Connexion..." : "Erreur"}
    </span>
  );
}
