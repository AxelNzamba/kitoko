import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCog, Shield, ShieldCheck, ShieldAlert } from "lucide-react";

import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { roleLabels, type AppRole } from "@/lib/modules";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/utilisateurs")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "Utilisateurs — INDUS-ERP" },
      { name: "description", content: "Utilisateurs — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Utilisateurs — INDUS-ERP" },
      { property: "og:description", content: "Utilisateurs — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const roleIcon: Record<AppRole, any> = {
  proprietaire: ShieldCheck,
  magasinier: Shield,
  caissier: ShieldAlert,
  receptionniste: Shield,
};

const roleColor: Record<AppRole, string> = {
  proprietaire: "text-accent",
  magasinier: "text-sky-500",
  caissier: "text-emerald-500",
  receptionniste: "text-accent",
};

function UsersPage() {
  const qc = useQueryClient();
  const { roles: myRoles } = useCurrentUser();
  const assign = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "magasinier" | "caissier" | "receptionniste" }) => {
      const { error } = await supabase.rpc("set_staff_role", { _user_id: userId, _role: role });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Rôle enregistré"); qc.invalidateQueries({ queryKey: ["all-roles"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const rolesFor = (uid: string) =>
    roles.filter((r: any) => r.user_id === uid).map((r: any) => r.role as AppRole);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profiles.length} compte(s). Nouveaux comptes créés depuis la page d'inscription.
        </p>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <UserCog className="mt-0.5 size-4 text-accent" />
          <div>
            <p className="font-semibold">Rôles disponibles</p>
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              <li>• <strong>Propriétaire</strong> — accès total</li>
              <li>• <strong>Magasinier</strong> — stock, lots, inventaire, certificats</li>
              <li>• <strong>Caissier / Commercial</strong> — ventes, clients, POS</li>
              <li>• <strong>Réceptionniste</strong> — chambres, réservations et ménage</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead>Créé le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                Aucun utilisateur.
              </TableCell></TableRow>
            )}
            {profiles.map((p: any) => {
              const userRoles = rolesFor(p.id);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.phone ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {userRoles.length === 0 && <span className="text-xs text-muted-foreground">Aucun</span>}
                      {userRoles.map((r) => {
                        const Icon = roleIcon[r];
                        return (
                          <span key={r} className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium ${roleColor[r]}`}>
                            <Icon className="size-3" /> {roleLabels[r]}
                          </span>
                        );
                      })}
                    </div>
                    {myRoles.includes("proprietaire") && !userRoles.includes("proprietaire") && (
                      <select aria-label={`Rôle de ${p.full_name ?? "utilisateur"}`} value={userRoles[0] ?? ""} disabled={assign.isPending}
                        className="mt-2 h-9 rounded-md border border-input bg-background px-2 text-sm"
                        onChange={(e) => assign.mutate({ userId: p.id, role: e.target.value as "magasinier" | "caissier" | "receptionniste" })}>
                        <option value="" disabled>Choisir un rôle</option>
                        <option value="magasinier">Magasinier</option><option value="caissier">Caissier / Commercial</option><option value="receptionniste">Réceptionniste</option>
                      </select>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
