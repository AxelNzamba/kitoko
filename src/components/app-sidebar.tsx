import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LogOut, Shield } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { roleLabels, type AppRole, apps, appFromPath, groupsForApp, appHome } from "@/lib/modules";
import { LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SyncStatusBadge } from "@/components/sync-status";
import { MODULE_TABLES } from "@/lib/sync/module-map";
import { toast } from "sonner";
import { trackEvent } from "@/lib/audit";

type Props = {
  fullName: string | null;
  email: string | null;
  roles: AppRole[];
};

export function AppSidebar({ fullName, email, roles }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const canAccess = (allowed: AppRole[]) =>
    roles.some((r) => allowed.includes(r));

  const primaryRole = roles[0];

  async function handleSignOut() {
    await trackEvent({ module: "connexion", action: "deconnexion", label: "Déconnexion" });
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/60 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold">
            <Shield className="size-4" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              INDUS-ERP
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">
              {appFromPath(pathname) === "hotel" ? "Kitoko Hôtel" : "Kitoko Stock"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <AppSwitcher pathname={pathname} roles={roles} />
        {groupsForApp(appFromPath(pathname)).map((group) => {
          const visibleItems = group.items.filter((i) => canAccess(i.roles));
          if (visibleItems.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const active = pathname === item.to || (item.to !== "/hotel" && pathname.startsWith(item.to + "/"));
                    const Icon = item.icon;
                    const modKey = item.to.replace(/^\//, "");
                    const hasSync = MODULE_TABLES.some((m) => m.key === modKey);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-semibold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <Link to={item.to}>
                            <Icon className="size-4" />
                            <span className="flex-1">{item.title}</span>
                            {hasSync && (
                              <span className="group-data-[collapsible=icon]:hidden">
                                <SyncStatusBadge moduleKey={modKey} />
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <div className="flex items-center gap-3 rounded-md p-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">
            {(fullName || email || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">
              {fullName || email || "Utilisateur"}
            </p>
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-accent">
              {primaryRole ? roleLabels[primaryRole] : "—"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group-data-[collapsible=icon]:hidden"
            title="Déconnexion"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppSwitcher({ pathname, roles }: { pathname: string; roles: AppRole[] }) {
  const current = appFromPath(pathname);
  const visible = apps.filter((a) => roles.some((r) => a.roles.includes(r)));
  return (
    <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-1 rounded-md bg-sidebar-accent/40 p-1">
        <Link
          to="/applications"
          title="Toutes les applications"
          className="rounded p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LayoutGrid className="size-4" />
        </Link>
        {visible.map((a) => {
          const Icon = a.icon;
          const active = a.key === current;
          return (
            <Link
              key={a.key}
              to={appHome(a.key, roles)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
                active ? "bg-accent text-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="size-3.5" />
              {a.key === "stock" ? "Stock" : "Hôtel"}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
