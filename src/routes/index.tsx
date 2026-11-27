import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  ssr: false,
  head: () => ({ meta: [{ title: "INDUS-ERP — Applications Kitoko" }, { name: "description", content: "Gestion du stock et des séjours hôteliers avec les applications Kitoko." }, { property: "og:title", content: "INDUS-ERP — Applications Kitoko" }, { property: "og:description", content: "Gestion du stock et des séjours hôteliers avec les applications Kitoko." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
});

function Index() {
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "in" : "out");
    });
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Shield className="size-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            INDUS-ERP
          </p>
        </div>
      </div>
    );
  }

  return <Navigate to={status === "in" ? "/applications" : "/auth"} replace />;
}
