import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, KeyRound, MailCheck, Shield } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/audit";

import { supabase } from "@/integrations/supabase/client";
import { rateLimiter } from "@/lib/rate-limiter";
import { passwordSchema, passwordStrength, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Connexion — INDUS-ERP" },
      { name: "description", content: "Accédez à votre espace de gestion INDUS-ERP." },
    
      { property: "og:title", content: "Connexion — INDUS-ERP" },
      { property: "og:description", content: "Accédez à votre espace de gestion INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }],
  }),
});

const loginSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Minimum 6 caractères").max(128),
});

const forgotSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
});

// Politique renforcée : min 8 caractères, 1 majuscule, 1 chiffre.
// Uniquement à la création (inscription) — JAMAIS à la connexion.
const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nom trop court").max(100),
    email: z.string().trim().email("Email invalide").max(255),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

/** Mot de passe oublié ? → l'email de récupération redirige vers /reset-password. */
const RESET_REDIRECT = `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`;

function AuthPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"tabs" | "forgot">("tabs");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/applications", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:grid-cols-2">
        {/* Panneau de gauche - identité */}
        <div className="hidden bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Shield className="size-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">INDUS-ERP</p>
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60">
                Gestion de stock industriel
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Gérez toute votre entreprise depuis un seul écran.
            </h1>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Stock, ventes, achats, inventaire, QR codes, certificats et rapports — conçu pour les
              entreprises industrielles modernes.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-foreground/10">
              <Metric value="17" label="Modules" />
              <Metric value="72" label="Écrans" />
              <Metric value="3" label="Rôles" />
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40">
            Version 1.0 — Terminal sécurisé
          </p>
        </div>

        {/* Panneau de droite - formulaires */}
        <div className="p-6 md:p-10">
          <div className="mb-6 md:hidden">
            <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Shield className="size-5" strokeWidth={2.5} />
            </div>
            <p className="mt-3 text-sm font-bold">INDUS-ERP</p>
          </div>

          {view === "forgot" ? (
            <ForgotPasswordForm onBack={() => setView("tabs")} />
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Créer un compte</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <LoginForm
                  onSuccess={() => navigate({ to: "/applications", replace: true })}
                  onForgot={() => setView("forgot")}
                />
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <SignupForm onSuccess={() => navigate({ to: "/applications", replace: true })} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-2xl font-bold text-accent">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-primary-foreground/50">{label}</p>
    </div>
  );
}

/** Bouton œil pour afficher/masquer le mot de passe. */
function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
    >
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

/** Indicateur de robustesse délégué au module partagé password-policy. */
function StrengthMeter({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  if (!password) return null;
  const colors = [
    "bg-destructive",
    "bg-destructive",
    "bg-amber-500",
    "bg-lime-500",
    "bg-emerald-500",
  ];
  return (
    <div className="flex items-center gap-2 pt-1" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? colors[score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function LoginForm({ onSuccess, onForgot }: { onSuccess: () => void; onForgot: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setLoading(true);
    // Rate limiting (OWASP) : 5 tentatives / min / client sur la connexion.
    const limit = rateLimiter.check("login", parsed.data.email.toLowerCase());
    if (!limit.allowed) {
      setLoading(false);
      toast.error(`Trop de tentatives. Réessayez dans ${limit.retryAfter} s.`);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (!error) rateLimiter.reset("login", parsed.data.email.toLowerCase());
    if (error) {
      track({ module: "connexion", action: "connexion_echec", label: "Échec de connexion", severity: "warning", details: { motif: error.message } });
      if (error.message === "Invalid login credentials") {
        toast.error("Identifiants incorrects");
      } else if (error.message.toLowerCase().includes("not confirmed")) {
        toast.error("Email non confirmé — vérifiez votre boîte de réception.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    track({ module: "connexion", action: "connexion", label: "Connexion réussie" });
    toast.success("Connexion réussie");
    onSuccess();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Se connecter</h2>
        <p className="mt-1 text-sm text-muted-foreground">Accédez à votre console de gestion.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nom@entreprise.cd"
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Mot de passe</Label>
          <button
            type="button"
            onClick={onForgot}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-accent hover:underline transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pr-10"
            required
          />
          <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Email invalide");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: RESET_REDIRECT,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Email de récupération envoyé");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <MailCheck className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Vérifiez votre boîte mail</h2>
          <p className="text-sm text-muted-foreground">
            Un lien de réinitialisation a été envoyé à{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          <p className="text-xs text-muted-foreground pt-2">
            En développement local, l'email est capturé par Inbucket (
            <span className="font-mono">http://127.0.0.1:54324</span>).
          </p>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={onBack}>
          <ArrowLeft className="size-4" /> Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-accent/15 text-accent">
          <KeyRound className="size-5" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Mot de passe oublié</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Saisissez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nom@entreprise.cd"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        <ArrowLeft className="size-4" /> Retour à la connexion
      </Button>
    </form>
  );
}

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName, email, password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setLoading(true);
    // Rate limiting (OWASP) : 3 inscriptions / 5 min / client.
    const limit = rateLimiter.check("signup", parsed.data.email.toLowerCase());
    if (!limit.allowed) {
      setLoading(false);
      toast.error(`Trop de tentatives. Réessayez dans ${Math.ceil(limit.retryAfter / 60)} min.`);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Si la confirmation par email est activée : pas de session renvoyée.
    if (!data.session) {
      setAwaitingConfirmation(true);
      return;
    }
    toast.success("Compte créé — bienvenue !");
    onSuccess();
  }

  if (awaitingConfirmation) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <MailCheck className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Confirmez votre email</h2>
          <p className="text-sm text-muted-foreground">
            Un lien de confirmation a été envoyé à{" "}
            <span className="font-medium text-foreground">{email}</span>. Cliquez sur le lien pour
            activer votre compte.
          </p>
          <p className="text-xs text-muted-foreground pt-2">
            En développement local, l'email est visible dans Inbucket (
            <span className="font-mono">http://127.0.0.1:54324</span>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Créer un compte</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Le premier compte créé sera le{" "}
          <span className="font-semibold text-accent">Propriétaire</span>.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nom complet</Label>
        <Input
          id="signup-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jean Mukendi"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nom@entreprise.cd"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={PASSWORD_POLICY_MESSAGE}
            className="pr-10"
            required
          />
          <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        </div>
        <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_MESSAGE}</p>
        <StrengthMeter password={password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
        <Input
          id="signup-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Répétez le mot de passe"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Création..." : "Créer mon compte"}
      </Button>
    </form>
  );
}
