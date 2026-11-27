import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Download,
  Eye,
  FileDown,
  RefreshCcw,
  ScrollText,
  ShieldAlert,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useWarehouse } from "@/hooks/use-warehouse";
import { moduleLabels } from "@/lib/audit";
import { exportToCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/activite")({
  component: JournalActivitePage,
  head: () => ({
    meta: [
      { title: "Journal d'activité — INDUS-ERP" },
      {
        name: "description",
        content: "Actions métier et modifications détaillées, par utilisateur, module et entrepôt.",
      },
      { property: "og:title", content: "Journal d'activité — INDUS-ERP" },
      {
        property: "og:description",
        content: "Journal des actions, modifications ligne par ligne et export CSV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

/** Ligne de `audit_log` : actions métier explicites (vente validée, stock ajusté…). */
type LogRow = {
  id: string;
  user_id: string | null;
  action: string;
  module: string | null;
  table_name: string | null;
  record_id: string | null;
  warehouse_id: string | null;
  label: string | null;
  severity: string;
  details: any;
  created_at: string;
};

/** Ligne de `audit_logs` : modifications ligne par ligne capturées par les triggers. */
type ChangeRow = {
  id: string;
  table_name: string;
  record_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  actor_id: string | null;
  changes: unknown;
  created_at: string;
  actor?: { full_name: string | null } | null;
};

const ACTION_LABEL: Record<string, string> = {
  creation: "Création",
  modification: "Modification",
  suppression: "Suppression",
};

const ACTION_LABELS: Record<string, string> = {
  INSERT: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
};

const ACTION_CLASSES: Record<string, string> = {
  INSERT: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  UPDATE: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  DELETE: "border-destructive/30 bg-destructive/10 text-destructive",
};

const TABLE_LABELS: Record<string, string> = {
  products: "Produits",
  categories: "Catégories",
  lots: "Lots",
  stock_movements: "Mouvements de stock",
  stock_locations: "Emplacements",
  stock_transfers: "Transferts",
  stock_transfer_items: "Lignes de transfert",
  sales: "Ventes",
  sale_items: "Lignes de vente",
  clients: "Clients",
  client_debts: "Dettes clients",
  debt_payments: "Règlements de dette",
  suppliers: "Fournisseurs",
  supplier_returns: "Retours fournisseurs",
  expenses: "Dépenses",
  user_roles: "Rôles utilisateurs",
  profiles: "Profils",
  warehouses: "Entrepôts",
  credits: "Avoirs",
  purchase_orders: "Commandes fournisseurs",
  purchase_order_items: "Lignes de commande",
  serial_numbers: "Numéros de série",
  inventory_sessions: "Sessions d'inventaire",
  inventory_counts: "Comptages d'inventaire",
  sav_interventions: "Interventions SAV",
  sav_tickets: "Tickets SAV",
  sav_intervention_serials: "Séries SAV",
};

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function JournalActivitePage() {
  const { roles, loading } = useCurrentUser();
  if (loading) return null;
  if (!roles.includes("proprietaire")) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center text-muted-foreground">
        <ShieldAlert className="size-8" />
        <p className="text-sm">Cette page est réservée au Propriétaire.</p>
      </div>
    );
  }
  return <JournalContent />;
}

function JournalContent() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ScrollText className="size-6 text-accent" /> Journal d'activité
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deux lectures complémentaires : les actions métier déclarées par l'application et les
          modifications ligne par ligne enregistrées par la base.
        </p>
      </div>

      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actions" className="gap-1.5">
            <Activity className="size-4" /> Actions métier
          </TabsTrigger>
          <TabsTrigger value="modifications" className="gap-1.5">
            <ScrollText className="size-4" /> Modifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <ActionsMetierTab />
        </TabsContent>
        <TabsContent value="modifications" className="space-y-4">
          <ModificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActionsMetierTab() {
  const { warehouses } = useWarehouse();
  const [from, setFrom] = useState(daysAgoIso(7));
  const [to, setTo] = useState(daysAgoIso(0));
  const [moduleF, setModuleF] = useState("all");
  const [userF, setUserF] = useState("all");
  const [whF, setWhF] = useState("all");
  const [hideNav, setHideNav] = useState(true);
  const [active, setActive] = useState<LogRow | null>(null);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name");
      if (error) throw error;
      return data ?? [];
    },
  });
  const userName = useMemo(() => {
    const m = new Map(profiles.map((p) => [p.id, p.full_name ?? "—"]));
    return (id: string | null) => (id ? (m.get(id) ?? id.slice(0, 8)) : "Système");
  }, [profiles]);
  const whName = useMemo(() => {
    const m = new Map(warehouses.map((w) => [w.id, w.name]));
    return (id: string | null) => (id ? (m.get(id) ?? "—") : "—");
  }, [warehouses]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["audit_log", from, to, moduleF, userF, whF],
    queryFn: async () => {
      let q = (supabase as any)
        .from("audit_log")
        .select("*")
        .gte("created_at", `${from}T00:00:00`)
        .lte("created_at", `${to}T23:59:59`)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (moduleF !== "all") q = q.eq("module", moduleF);
      if (userF !== "all") q = q.eq("user_id", userF);
      if (whF !== "all") q = q.eq("warehouse_id", whF);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as LogRow[];
    },
  });

  const visible = hideNav ? rows.filter((r) => r.module !== "navigation") : rows;

  const stats = useMemo(() => {
    const byModule = new Map<string, { actions: number; users: Set<string> }>();
    for (const r of rows) {
      const k = r.module ?? "autre";
      const e = byModule.get(k) ?? { actions: 0, users: new Set<string>() };
      e.actions += 1;
      if (r.user_id) e.users.add(r.user_id);
      // l'ouverture de page compte comme usage du module ouvert
      if (k === "navigation" && r.details?.page) {
        const p = String(r.details.page);
        const pe = byModule.get(`page:${p}`) ?? { actions: 0, users: new Set<string>() };
        pe.actions += 1;
        if (r.user_id) pe.users.add(r.user_id);
        byModule.set(`page:${p}`, pe);
      }
      byModule.set(k, e);
    }
    const metier = [...byModule.entries()]
      .filter(([k]) => !k.startsWith("page:") && k !== "navigation")
      .sort((a, b) => b[1].actions - a[1].actions);
    const pages = [...byModule.entries()]
      .filter(([k]) => k.startsWith("page:"))
      .sort((a, b) => b[1].actions - a[1].actions)
      .slice(0, 8);
    return {
      metier,
      pages,
      total: rows.length,
      users: new Set(rows.map((r) => r.user_id).filter(Boolean)).size,
    };
  }, [rows]);

  const exportCsv = () => {
    exportToCsv(
      [
        { key: "date", label: "Date" },
        { key: "module", label: "Module" },
        { key: "action", label: "Action" },
        { key: "libelle", label: "Libellé" },
        { key: "utilisateur", label: "Utilisateur" },
        { key: "entrepot", label: "Entrepôt" },
        { key: "table", label: "Table" },
        { key: "enregistrement", label: "Enregistrement" },
        { key: "gravite", label: "Gravité" },
        { key: "details", label: "Détails" },
      ],
      visible.map((r) => ({
        date: formatDateTime(r.created_at),
        module: moduleLabels[r.module ?? "autre"] ?? r.module,
        action: ACTION_LABEL[r.action] ?? r.action,
        libelle: r.label ?? "",
        utilisateur: userName(r.user_id),
        entrepot: whName(r.warehouse_id),
        table: r.table_name ?? "",
        enregistrement: r.record_id ?? "",
        gravite: r.severity,
        details: JSON.stringify(r.details ?? {}),
      })),
      `activite_${from}_${to}.csv`,
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Actions déclarées par les modules (vente, stock, crédit…), avec l'utilisateur et
          l'entrepôt.
        </p>
        <Button size="sm" onClick={exportCsv} disabled={visible.length === 0}>
          <Download className="mr-1 size-4" /> Exporter en CSV
        </Button>
      </div>

      <section className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1">
          <Label className="text-xs">Du</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Au</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <FilterSelect
          label="Module"
          value={moduleF}
          onChange={setModuleF}
          options={Object.entries(moduleLabels).map(([v, l]) => ({ v, l }))}
        />
        <FilterSelect
          label="Utilisateur"
          value={userF}
          onChange={setUserF}
          options={profiles.map((p) => ({ v: p.id, l: p.full_name ?? p.id.slice(0, 8) }))}
        />
        <FilterSelect
          label="Entrepôt"
          value={whF}
          onChange={setWhF}
          options={warehouses.map((w) => ({ v: w.id, l: w.name }))}
        />
        <label className="flex items-end gap-2 pb-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={hideNav} onChange={(e) => setHideNav(e.target.checked)} />
          Masquer les ouvertures de page
        </label>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Actions sur la période" value={stats.total} />
        <Stat label="Utilisateurs actifs" value={stats.users} />
        <Stat label="Modules utilisés" value={stats.metier.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border bg-card">
          <header className="border-b px-4 py-3 text-sm font-semibold">Actions par module</header>
          <div className="space-y-2 p-4">
            {stats.metier.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune action.</p>
            )}
            {stats.metier.map(([k, v]) => (
              <Bar
                key={k}
                label={moduleLabels[k] ?? k}
                value={v.actions}
                max={stats.metier[0][1].actions}
                sub={`${v.users.size} utilisateur(s)`}
              />
            ))}
          </div>
        </section>
        <section className="rounded-lg border bg-card">
          <header className="border-b px-4 py-3 text-sm font-semibold">
            Pages les plus ouvertes
          </header>
          <div className="space-y-2 p-4">
            {stats.pages.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune ouverture enregistrée.</p>
            )}
            {stats.pages.map(([k, v]) => (
              <Bar
                key={k}
                label={k.slice(5)}
                value={v.actions}
                max={stats.pages[0][1].actions}
                sub={`${v.users.size} utilisateur(s)`}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border bg-card">
        <header className="border-b px-4 py-3 text-sm font-semibold">
          Journal ({visible.length}
          {rows.length >= 1000 ? "+, limité aux 1000 plus récentes" : ""})
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Entrepôt</TableHead>
              <TableHead className="text-right">Détail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Chargement…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Aucune action sur cette période.
                </TableCell>
              </TableRow>
            )}
            {visible.slice(0, 300).map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {formatDateTime(r.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">
                    {moduleLabels[r.module ?? "autre"] ?? r.module}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  <span
                    className={
                      r.severity === "warning"
                        ? "text-warning"
                        : r.severity === "error"
                          ? "text-destructive"
                          : ""
                    }
                  >
                    {ACTION_LABEL[r.action]
                      ? `${ACTION_LABEL[r.action]} · ${r.table_name}`
                      : (r.label ?? r.action)}
                  </span>
                  {ACTION_LABEL[r.action] && r.label && (
                    <span className="block text-[11px] text-muted-foreground">{r.label}</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">{userName(r.user_id)}</TableCell>
                <TableCell className="text-xs">{whName(r.warehouse_id)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => setActive(r)}>
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {visible.length > 300 && (
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">
            300 premières lignes affichées — l'export CSV contient tout.
          </p>
        )}
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        {active && <ActionDetailDialog row={active} userName={userName} whName={whName} />}
      </Dialog>
    </>
  );
}

function ModificationsTab() {
  const [tableFilter, setTableFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<ChangeRow | null>(null);

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<ChangeRow[]>({
    queryKey: ["audit-logs", tableFilter, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select(
          "id, table_name, record_id, action, actor_id, changes, created_at, actor:profiles(full_name)",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (tableFilter !== "all") query = query.eq("table_name", tableFilter);
      if (actionFilter !== "all") query = query.eq("action", actionFilter);
      const { data: rows, error: err } = await query;
      if (err) throw err;
      return (rows ?? []) as ChangeRow[];
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) => {
      const actor = row.actor?.full_name?.toLowerCase() ?? "";
      return (
        row.record_id?.toLowerCase().includes(term) ||
        actor.includes(term) ||
        (TABLE_LABELS[row.table_name] ?? row.table_name).toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const migrationMissing =
    !!error &&
    ((error as { code?: string }).code === "42P01" ||
      /does not exist|n'existe pas/i.test((error as Error).message));

  const tables = useMemo(() => {
    const seen = new Set(Object.keys(TABLE_LABELS));
    data.forEach((row) => seen.add(row.table_name));
    return [...seen].sort((a, b) => (TABLE_LABELS[a] ?? a).localeCompare(TABLE_LABELS[b] ?? b));
  }, [data]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Modifications ligne par ligne enregistrées par la base. 500 dernières opérations.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={`mr-1 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={filtered.length === 0}
            onClick={() =>
              exportToCsv(
                [
                  { key: "created_at", label: "Date" },
                  { key: "action", label: "Action" },
                  { key: "table_name", label: "Table" },
                  { key: "record_id", label: "Enregistrement" },
                  { key: "actor_name", label: "Auteur" },
                ],
                filtered.map((r) => ({
                  created_at: formatDateTime(r.created_at),
                  action: ACTION_LABELS[r.action] ?? r.action,
                  table_name: TABLE_LABELS[r.table_name] ?? r.table_name,
                  record_id: r.record_id ?? "",
                  actor_name: r.actor?.full_name ?? r.actor_id ?? "",
                })),
                "journal-modifications.csv",
              )
            }
          >
            <FileDown className="mr-1 size-4" />
            CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un auteur, un enregistrement…"
          className="max-w-xs"
        />
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Toutes les tables" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les tables</SelectItem>
            {tables.map((table) => (
              <SelectItem key={table} value={table}>
                {TABLE_LABELS[table] ?? table}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Toutes les actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            <SelectItem value="INSERT">Création</SelectItem>
            <SelectItem value="UPDATE">Modification</SelectItem>
            <SelectItem value="DELETE">Suppression</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {migrationMissing && (
        <div className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-foreground">Journal non initialisé</p>
            <p className="mt-1 text-muted-foreground">
              La table <code className="font-mono">audit_logs</code> n'existe pas encore. Appliquez
              la migration <code className="font-mono">20261106090000_audit_logs.sql</code> puis
              rechargez cette page.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Enregistrement</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead className="text-right">Détail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Chargement…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !error && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Aucune opération enregistrée pour ces filtres.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && error && !migrationMissing && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-destructive">
                  Erreur de chargement : {(error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDateTime(row.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={ACTION_CLASSES[row.action]}>
                    {ACTION_LABELS[row.action] ?? row.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {TABLE_LABELS[row.table_name] ?? row.table_name}
                </TableCell>
                <TableCell className="max-w-40 truncate font-mono text-[11px] text-muted-foreground">
                  {row.record_id ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {row.actor?.full_name ?? (row.actor_id ? "Utilisateur" : "Système")}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setDetail(row)}>
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {detail
                ? `${ACTION_LABELS[detail.action] ?? detail.action} · ${TABLE_LABELS[detail.table_name] ?? detail.table_name}`
                : ""}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {formatDateTime(detail.created_at)} · Enregistrement{" "}
                <span className="font-mono">{detail.record_id ?? "—"}</span>
              </p>
              <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-[11px] leading-relaxed">
                {JSON.stringify(detail.changes, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionDetailDialog({
  row,
  userName,
  whName,
}: {
  row: LogRow;
  userName: (id: string | null) => string;
  whName: (id: string | null) => string;
}) {
  const oldV = row.details?.old ?? null;
  const newV = row.details?.new ?? null;
  const isDiff = oldV || newV;
  const keys = isDiff
    ? [...new Set([...Object.keys(oldV ?? {}), ...Object.keys(newV ?? {})])].filter(
        (k) => !k.startsWith("_"),
      )
    : [];
  const changed = (k: string) => JSON.stringify(oldV?.[k]) !== JSON.stringify(newV?.[k]);
  const sorted =
    row.action === "modification"
      ? [...keys.filter(changed), ...keys.filter((k) => !changed(k))]
      : keys;
  const show = (v: unknown) =>
    v === null || v === undefined || v === ""
      ? "—"
      : typeof v === "object"
        ? JSON.stringify(v)
        : String(v);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{row.label ?? row.action}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <span>Date : {formatDateTime(row.created_at)}</span>
        <span>Utilisateur : {userName(row.user_id)}</span>
        <span>Module : {moduleLabels[row.module ?? "autre"] ?? row.module}</span>
        <span>Entrepôt : {whName(row.warehouse_id)}</span>
        {row.table_name && <span>Table : {row.table_name}</span>}
        {row.record_id && <span className="font-mono">Réf. : {row.record_id}</span>}
      </div>
      <div className="max-h-[60vh] overflow-auto">
        {isDiff ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Champ</TableHead>
                <TableHead>Avant</TableHead>
                <TableHead>Après</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((k) => (
                <TableRow
                  key={k}
                  className={row.action === "modification" && changed(k) ? "bg-accent/10" : ""}
                >
                  <TableCell className="font-mono text-[11px]">{k}</TableCell>
                  <TableCell className="max-w-[260px] break-words text-xs">
                    {show(oldV?.[k])}
                  </TableCell>
                  <TableCell className="max-w-[260px] break-words text-xs">
                    {show(newV?.[k])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(row.details ?? {}, null, 2)}
          </pre>
        )}
      </div>
    </DialogContent>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.v} value={o.v}>
              {o.l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  sub,
}: {
  label: string;
  value: number;
  max: number;
  sub: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value} · {sub}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-accent"
          style={{ width: `${Math.max(4, (value / Math.max(1, max)) * 100)}%` }}
        />
      </div>
    </div>
  );
}
