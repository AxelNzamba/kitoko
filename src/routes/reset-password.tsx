import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { passwordWithConfirmSchema, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — INDUS-ERP" },
      {
        name: "description",
        content: "Définissez un nouveau mot de passe pour votre compte INDUS-ERP.",
      },
    
      { property: "og:title", content: "Nouveau mot de passe — INDUS-ERP" },
      { property: "og:description", content: "Définissez un nouveau mot de passe pour votre compte INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }],
  }),
});

// Politique renforcée également à la réinitialisation : min 8 caractères,
// 1 majuscule, 1 chiffre (partagée avec l'inscription via password-policy).
const resetSchema = passwordWithConfirmSchema;

type Phase = "checking" | "ready" | "invalid" | "done";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handledRef = useRef(false);

  /**
   * Supabase renvoie l'utilisateur ici avec les tokens de récupération dans le hash
   * URL (#access_token=...&refresh_token=...&type=recovery) — mode implicite par
   * défaut. detectSessionInUrl échange le hash contre une session.
   */
  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setPhase(data.session ? "ready" : "invalid");
      })
      .catch(() => setPhase("invalid"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Mot de passe mis à jour");
    setPhase("done");
  }

  if (phase === "checking") {
    return (
      <Shell>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Vérification du lien...
        </div>
      </Shell>
    );
  }

  if (phase === "invalid") {
    return (
      <Shell>
        <div className="space-y-4 text-center py-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <ShieldCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Lien invalide ou expiré</h1>
            <p className="text-sm text-muted-foreground">
              Ce lien de réinitialisation n'est plus valide. Demandez-en un nouveau.
            </p>
          </div>
          <Button type="button" className="w-full" onClick={() => navigate({ to: "/auth" })}>
            Retour à la connexion
          </Button>
        </div>
      </Shell>
    );
  }

  if (phase === "done") {
    return (
      <Shell>
        <div className="space-y-4 text-center py-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Mot de passe mis à jour</h1>
            <p className="text-sm text-muted-foreground">
              Votre nouveau mot de passe est actif. Vous pouvez vous connecter.
            </p>
          </div>
          <Button type="button" className="w-full" onClick={() => navigate({ to: "/auth" })}>
            Se connecter
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-accent/15 text-accent">
            <KeyRound className="size-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Nouveau mot de passe</h1>
          <p className="mt-1 text-sm text-muted-foreground">{PASSWORD_POLICY_MESSAGE}.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-password">Nouveau mot de passe</Label>
          <div className="relative">
            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={PASSWORD_POLICY_MESSAGE}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-confirm">Confirmer le mot de passe</Label>
          <Input
            id="reset-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Mise à jour..." : "Définir le nouveau mot de passe"}
        </Button>
      </form>
    </Shell>
  );
}

/** Conteneur centré, cohérent avec la page /auth. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
