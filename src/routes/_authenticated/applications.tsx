import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/use-current-user";
import { apps, appHome } from "@/lib/modules";

export const Route = createFileRoute("/_authenticated/applications")({
  component: AppsPage,
  head: () => ({
    meta: [
      { title: "Applications — INDUS-ERP" },
      { name: "description", content: "Choisissez votre application INDUS-ERP : stock ou hôtel." },
    
      { property: "og:title", content: "Applications — INDUS-ERP" },
      { property: "og:description", content: "Choisissez votre application INDUS-ERP : stock ou hôtel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }],
  }),
});

function AppsPage() {
  const { roles, loading } = useCurrentUser();
  const visible = apps.filter((a) => roles.some((r) => a.roles.includes(r)));

  return (
    <div className="mx-auto max-w-4xl py-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Vos applications</h1>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.key}
                to={appHome(a.key, roles)}
                className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
              >
                <div className="flex size-16 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="size-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{a.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.tagline}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
