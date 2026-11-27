import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
  Link,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Maximize2, Minimize2, Receipt, QrCode, LogOut } from "lucide-react";
import { toast } from "sonner";
import { track, trackEvent, flushAuditQueue } from "@/lib/audit";
import { NotificationsBell } from "@/components/notifications-bell";
import { HelpCenter } from "@/components/help-center";
import { SyncPanel } from "@/components/sync-panel";
import { OfflineBanner } from "@/components/offline-banner";
import { useSyncEngine } from "@/lib/sync/hooks";
import { isOffline } from "@/lib/offline/session-cache";

import { supabase } from "@/integrations/supabase/client";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { WarehouseProvider } from "@/hooks/use-warehouse";
import { WarehouseSelector } from "@/components/warehouse-selector";
import { CurrencyToggle } from "@/components/currency-toggle";
import { KioskProvider, useKiosk, KIOSK_ROUTES } from "@/hooks/use-kiosk";
import { FavoritesBar, PinCurrentPageButton } from "@/components/favorites-bar";
import { useSmartAlerts } from "@/hooks/use-smart-alerts";
import {
  GlobalCommandPalette,
  SearchTrigger,
} from "@/components/global-command-palette";
import { modules, hotelModules } from "@/lib/modules";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // 1) Session locale (fonctionne sans réseau : lue depuis le stockage).
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user ?? null;
    if (!sessionUser) throw redirect({ to: "/auth" });

    // 2) Hors-ligne : on fait confiance à la session locale pour ne pas
    //    déconnecter l'opérateur en cas de coupure réseau / courant.
    if (isOffline()) return { user: sessionUser };

    // 3) En ligne : vérification serveur. Une erreur réseau (pas une
    //    révocation) ne doit pas déconnecter l'utilisateur.
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        const status = (error as { status?: number }).status;
        if (status === 401 || status === 403) throw redirect({ to: "/auth" });
        return { user: sessionUser };
      }
      if (!data.user) throw redirect({ to: "/auth" });
      return { user: data.user };
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e; // redirect
      return { user: sessionUser };
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <WarehouseProvider>
      <KioskProvider>
        <LayoutShell />
      </KioskProvider>
    </WarehouseProvider>
  );
}

function LayoutShell() {
  const { user, roles } = useCurrentUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const stockScreen = pathname !== "/applications" && !pathname.startsWith("/hotel");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { kiosk } = useKiosk();
  useSyncEngine();
  useSmartAlerts();

  // Renvoi des événements d'audit mis en attente pendant une coupure réseau
  useEffect(() => {
    void flushAuditQueue();
    const onOnline = () => void flushAuditQueue();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  // Suivi d'usage des modules (une entrée par ouverture de page)
  useEffect(() => {
    const mod = pathname.split("/")[1];
    if (mod) track({ module: "navigation", action: "ouverture_module", label: `Ouverture : ${mod}`, details: { page: mod } });
  }, [pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? null;
  const email = user?.email ?? null;

  // Titre courant depuis les modules
  const currentTitle =
    [...hotelModules, ...modules]
      .flatMap((g) => g.items)
      .find((i) => pathname === i.to || (i.to !== "/hotel" && pathname.startsWith(i.to + "/")))?.title ??
    "INDUS-ERP";

  if (kiosk) return <KioskShell />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar fullName={fullName} email={email} roles={roles} />
        <SidebarInset className="flex-1">
          <OfflineBanner />
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="h-5 w-px bg-border" />
            <span className="min-w-0 truncate text-sm font-semibold text-foreground">
              {currentTitle}
            </span>
            {stockScreen && <PinCurrentPageButton />}

            <div className="ml-auto flex items-center gap-3">
              {stockScreen && <SearchTrigger onClick={() => setPaletteOpen(true)} />}
              <CurrencyToggle />
              {stockScreen && <WarehouseSelector />}
              {stockScreen && <KioskToggle />}
              {stockScreen && <SyncPanel />}
              <HelpCenter roles={roles} />
              {stockScreen && <NotificationsBell />}
            </div>
          </header>

          <GlobalCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {stockScreen && <FavoritesBar className="mb-4" />}
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function KioskToggle() {
  const { setKiosk } = useKiosk();
  const { roles } = useCurrentUser();
  const canKiosk =
    roles.length === 0 || roles.includes("caissier") || roles.includes("proprietaire");

  if (!canKiosk) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 gap-2"
      title="Activer le mode kiosque (caisse plein écran)"
      onClick={() => {
        setKiosk(true);
        toast.success("Mode kiosque activé");
      }}
    >
      <Maximize2 className="size-4" />
      <span className="hidden sm:inline">Kiosque</span>
    </Button>
  );
}

/**
 * Mode kiosque : plein écran, sans menus, limité aux écrans vente et scan.
 */
function KioskShell() {
  const { setKiosk } = useKiosk();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const allowed = (KIOSK_ROUTES as readonly string[]).some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  useEffect(() => {
    if (!allowed) navigate({ to: "/ventes", replace: true });
  }, [allowed, navigate]);

  async function handleSignOut() {
    await trackEvent({ module: "connexion", action: "deconnexion", label: "Déconnexion (kiosque)" });
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <OfflineBanner />
      <header className="flex h-16 items-center gap-2 border-b border-border bg-card px-4">
        <span className="text-sm font-bold uppercase tracking-widest text-accent">
          Caisse
        </span>
        <nav className="ml-4 flex gap-2">
          <KioskLink to="/ventes" icon={Receipt} label="Vente" active={pathname.startsWith("/ventes")} />
          <KioskLink to="/scanner" icon={QrCode} label="Scan" active={pathname.startsWith("/scanner")} />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <NotificationsBell />
          <Button
            variant="outline"
            size="lg"
            className="h-12 gap-2"
            onClick={() => {
              setKiosk(false);
              toast.success("Mode kiosque désactivé");
            }}
          >
            <Minimize2 className="size-4" />
            <span className="hidden sm:inline">Quitter le kiosque</span>
          </Button>
          <Button variant="ghost" size="lg" className="h-12" onClick={handleSignOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 p-3 md:p-6">
        {allowed ? <Outlet /> : null}
      </main>
    </div>
  );
}

function KioskLink({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: typeof Receipt;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex h-12 items-center gap-2 rounded-md px-5 text-base font-semibold transition ${
        active
          ? "bg-accent text-accent-foreground"
          : "border border-border text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
