import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Rocket, X } from "lucide-react";

const DISMISS_KEY = "kitoko.getting-started.dismissed";

const STEPS = [
  {
    title: "Créer les catégories",
    hint: "Quelques familles suffisent pour organiser le catalogue.",
    to: "/categories",
  },
  {
    title: "Ajouter les produits",
    hint: "SKU, code-barres et seuil d'alerte sont générés ou saisis ici.",
    to: "/produits",
  },
  {
    title: "Enregistrer le stock initial",
    hint: "Une entrée par produit pour démarrer avec les bons niveaux.",
    to: "/stock",
  },
  {
    title: "Faire la première vente",
    hint: "Le stock et le tableau de bord se mettent à jour automatiquement.",
    to: "/ventes",
  },
];

/**
 * Carte « Premiers pas » affichée uniquement tant que l'entreprise n'a ni
 * produit ni vente : elle disparaît d'elle-même et peut être masquée.
 */
export function GettingStartedCard() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* stockage indisponible : la carte revient à la prochaine visite */
    }
  }

  return (
    <section
      aria-labelledby="getting-started-title"
      className="relative rounded-lg border border-accent/30 bg-accent/5 p-5"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Masquer les premiers pas"
        className="absolute right-3 top-3 rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div className="mb-4 flex items-start gap-3 pr-8">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Rocket className="size-4" />
        </div>
        <div>
          <h2 id="getting-started-title" className="text-sm font-semibold text-foreground">
            Premiers pas
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quatre étapes pour rendre l'application opérationnelle. L'aide « ? » de l'en-tête
            détaille chaque module.
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => (
          <Link
            key={step.to}
            to={step.to}
            className="group rounded-md border border-border bg-card p-3 transition hover:border-accent"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
              {index + 1}
            </span>
            <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-foreground">
              {step.title}
              <ArrowRight className="size-3 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
            </span>
            <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
              {step.hint}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
