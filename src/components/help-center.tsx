import { useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CircleHelp, Keyboard, Lightbulb, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { modules, type AppRole } from "@/lib/modules";
import { cn } from "@/lib/utils";

/** Clé locale : le point d'alerte disparaît après la première ouverture. */
const HELP_SEEN_KEY = "kitoko.help.seen";

type HelpAction = { label: string; to: string };

type ModuleGuide = {
  title: string;
  summary: string;
  actions: HelpAction[];
  tips: string[];
};

/**
 * Aide contextuelle par écran.
 * Le contenu reste volontairement statique : il fonctionne hors-ligne et ne
 * dépend d'aucune permission de lecture en base.
 */
const MODULE_GUIDES: Record<string, ModuleGuide> = {
  "/dashboard": {
    title: "Tableau de bord",
    summary:
      "Votre poste de pilotage : chiffre d'affaires, marge, valeur du stock et alertes, mis à jour en temps réel.",
    actions: [
      { label: "Enregistrer une vente", to: "/ventes" },
      { label: "Voir les rapports", to: "/rapports" },
    ],
    tips: [
      "Le sélecteur d'entrepôt en haut filtre tous les indicateurs.",
      "Le bouton « PDF » exporte le tableau de bord pour une réunion.",
      "Basculez « vs Mois préc. » / « vs N-1 » pour comparer les périodes.",
    ],
  },
  "/produits": {
    title: "Produits",
    summary:
      "Le catalogue central : chaque produit porte un SKU, un code-barres et un QR code utilisés partout ailleurs.",
    actions: [
      { label: "Ajouter un produit", to: "/produits" },
      { label: "Scanner un code", to: "/scanner" },
    ],
    tips: [
      "Le SKU et le code-barres sont générés automatiquement si vous les laissez vides.",
      "Renseignez le seuil d'alerte pour être prévenu avant la rupture.",
      "Les photos sont compressées automatiquement à l'import.",
    ],
  },
  "/categories": {
    title: "Catégories",
    summary: "Organisez le catalogue en arborescence pour filtrer et analyser plus vite.",
    actions: [{ label: "Créer une catégorie", to: "/categories" }],
    tips: [
      "Une catégorie peut avoir une catégorie parente pour créer des sous-familles.",
      "Commencez simple : 3 à 6 catégories suffisent pour démarrer.",
    ],
  },
  "/lots": {
    title: "Lots",
    summary:
      "Traçabilité fine : chaque lot est rattaché à un produit et à un fournisseur, avec son certificat.",
    actions: [
      { label: "Créer un lot", to: "/lots" },
      { label: "Consulter les certificats", to: "/certificats" },
    ],
    tips: [
      "Les sorties de stock suivent le FIFO : le lot le plus ancien part en premier.",
      "Un certificat PDF peut être attaché au lot depuis le formulaire.",
    ],
  },
  "/stock": {
    title: "Mouvements de stock",
    summary: "Toutes les entrées et sorties manuelles, avec leur motif, leur entrepôt et leur lot.",
    actions: [
      { label: "Enregistrer une entrée", to: "/stock" },
      { label: "Voir les emplacements", to: "/emplacements" },
    ],
    tips: [
      "Un mouvement ne se modifie pas : créez le mouvement inverse pour corriger.",
      "Les ventes génèrent automatiquement leurs sorties de stock.",
      "Chaque mouvement est horodaté et attribué à son auteur.",
    ],
  },
  "/emplacements": {
    title: "Emplacements",
    summary: "Gérez vos entrepôts et magasins, puis consultez le stock détenu par chacun.",
    actions: [{ label: "Ajouter un emplacement", to: "/emplacements" }],
    tips: [
      "Le stock affiché partout suit l'entrepôt sélectionné dans l'en-tête.",
      "Utilisez « Transferts » pour déplacer de la marchandise entre entrepôts.",
    ],
  },
  "/transferts": {
    title: "Transferts entrepôts",
    summary: "Déplacez du stock d'un emplacement à un autre en conservant la traçabilité.",
    actions: [{ label: "Créer un transfert", to: "/transferts" }],
    tips: [
      "Un transfert décrémente la source et incrémente la destination en une opération.",
      "En cas de coupure réseau, le transfert est mis en file et rejoué à la reconnexion.",
    ],
  },
  "/ventes": {
    title: "Ventes / Point de vente",
    summary:
      "Encaissez rapidement : sélection des produits, remise, mode de paiement et facture PDF immédiate.",
    actions: [
      { label: "Ouvrir le point de vente", to: "/ventes" },
      { label: "Gérer les avoirs", to: "/avoirs" },
    ],
    tips: [
      "Le mode « Kiosque » offre une caisse plein écran, sans navigation.",
      "Chaque vente décrémente le stock et apparaît en temps réel au tableau de bord.",
      "Une vente ne s'annule pas : émettez un avoir pour la contre-passer.",
    ],
  },
  "/clients": {
    title: "Clients",
    summary: "Le répertoire des clients, pour rattacher ventes et historique d'achats.",
    actions: [{ label: "Ajouter un client", to: "/clients" }],
    tips: [
      "Une vente peut être anonyme : le client n'est pas obligatoire.",
      "Renseignez le téléphone pour retrouver un client rapidement à la caisse.",
    ],
  },
  "/achats": {
    title: "Achats",
    summary: "Enregistrez les achats auprès des fournisseurs et suivez-les.",
    actions: [
      { label: "Nouvel achat", to: "/achats" },
      { label: "Voir les fournisseurs", to: "/fournisseurs" },
    ],
    tips: [
      "Un achat réceptionné peut générer l'entrée de stock correspondante.",
      "Les retours fournisseurs se gèrent dans le module « Retours fournisseurs ».",
    ],
  },
  "/commandes-fournisseurs": {
    title: "Commandes fournisseurs",
    summary: "Suivez le cycle brouillon → envoyée → reçue de vos réapprovisionnements.",
    actions: [{ label: "Créer une commande", to: "/commandes-fournisseurs" }],
    tips: [
      "La réception met à jour la commande et ses lignes en une opération.",
      "La réception n'est pas disponible hors-ligne : saisissez une entrée de stock.",
    ],
  },
  "/fournisseurs": {
    title: "Fournisseurs",
    summary: "Les partenaires d'approvisionnement, référencés sur les lots et les achats.",
    actions: [{ label: "Ajouter un fournisseur", to: "/fournisseurs" }],
    tips: ["Renseignez le téléphone et l'adresse pour gagner du temps sur les commandes."],
  },
  "/retours-fournisseurs": {
    title: "Retours fournisseurs",
    summary: "Enregistrez le retour de marchandise défectueuse et son impact sur le stock.",
    actions: [{ label: "Créer un retour", to: "/retours-fournisseurs" }],
    tips: ["Chaque retour documente le motif : une trace utile en cas de litige."],
  },
  "/avoirs": {
    title: "Avoirs",
    summary: "Contre-passez une vente (retour client, erreur de caisse) sans casser l'historique.",
    actions: [{ label: "Créer un avoir", to: "/avoirs" }],
    tips: [
      "Un avoir est la seule façon correcte d'annuler une vente déjà enregistrée.",
      "L'avoir peut réintégrer le stock s'il s'agit d'un retour de marchandise.",
    ],
  },
  "/inventaire": {
    title: "Inventaire",
    summary: "Ouvrez une session, comptez (au clavier ou à la caméra) puis validez les écarts.",
    actions: [{ label: "Démarrer un inventaire", to: "/inventaire" }],
    tips: [
      "Le scan caméra évite les erreurs de saisie sur les longues références.",
      "La validation fige les écarts et crée les mouvements correctifs.",
    ],
  },
  "/scanner": {
    title: "Scanner QR",
    summary: "Un scanner universel : produit, lot ou emplacement, directement à l'écran.",
    actions: [{ label: "Ouvrir le scanner", to: "/scanner" }],
    tips: [
      "Autorisez la caméra dans le navigateur au premier scan.",
      "Sans caméra, saisissez le code-barres dans le champ de recherche.",
    ],
  },
  "/certificats": {
    title: "Certificats",
    summary: "Retrouvez les documents PDF attachés aux lots et aux produits.",
    actions: [{ label: "Voir les lots", to: "/lots" }],
    tips: ["Le certificat est joint au lot depuis le formulaire de création."],
  },
  "/depenses": {
    title: "Dépenses",
    summary: "Le suivi des charges pour calculer le bénéfice net réel de l'activité.",
    actions: [{ label: "Saisir une dépense", to: "/depenses" }],
    tips: [
      "Les dépenses du mois sont déduites du chiffre d'affaires au tableau de bord.",
      "Classez par catégorie pour analyser vos postes de coûts.",
    ],
  },
  "/rapports": {
    title: "Rapports",
    summary: "Analyses consolidées : ventes, marges, stock et performance.",
    actions: [{ label: "Voir le tableau de bord", to: "/dashboard" }],
    tips: ["Les rapports sont exportables en CSV et en PDF selon la vue."],
  },
  "/sav": {
    title: "SAV",
    summary: "Suivez les retours et interventions après-vente.",
    actions: [{ label: "Ouvrir le SAV", to: "/sav" }],
    tips: ["Rattachez le ticket au client pour conserver l'historique complet."],
  },
  "/historique-produit": {
    title: "Historique produit",
    summary: "La vie complète d'un produit : mouvements, ventes et lots sur une seule vue.",
    actions: [{ label: "Voir les produits", to: "/produits" }],
    tips: ["Idéal pour répondre à un client : « quand a-t-il été acheté ? »"],
  },
  "/terrain": {
    title: "Mode terrain",
    summary: "Interface mobile simplifiée pour les opérations en entrepôt, avec cache hors-ligne.",
    actions: [{ label: "Ouvrir le mode terrain", to: "/terrain" }],
    tips: [
      "Ouvrez l'application une première fois en ligne : les données sont ensuite disponibles hors-ligne.",
    ],
  },
  "/utilisateurs": {
    title: "Utilisateurs",
    summary: "Attribuez les rôles : propriétaire, magasinier ou caissier.",
    actions: [{ label: "Gérer les utilisateurs", to: "/utilisateurs" }],
    tips: [
      "Chaque rôle ne voit que les modules autorisés dans le menu.",
      "Le rôle propriétaire ouvre l'accès complet, y compris les rapports.",
    ],
  },
  "/parametres": {
    title: "Paramètres",
    summary: "La configuration de l'entreprise et de l'application.",
    actions: [{ label: "Ouvrir les paramètres", to: "/parametres" }],
    tips: ["Vérifiez la devise et les informations d'entreprise avant la première facture."],
  },
  "/synchronisation": {
    title: "Synchronisation",
    summary: "État du mode hors-ligne : données locales, écritures en attente et conflits.",
    actions: [{ label: "Ouvrir la synchronisation", to: "/synchronisation" }],
    tips: [
      "Les écritures faites hors-ligne sont rejouées dès le retour du réseau.",
      "Le badge de synchronisation du menu indique le retard par module.",
    ],
  },
};

type RoleGuide = {
  title: string;
  steps: { label: string; hint: string; to: string }[];
};

const ROLE_GUIDES: Record<AppRole, RoleGuide> = {
  receptionniste: {
    title: "Réceptionniste — hôtel",
    steps: [
      { label: "Voir le planning", hint: "Chambres libres et occupées.", to: "/hotel" },
      { label: "Créer une réservation", hint: "Client, chambre et dates.", to: "/hotel/reservations" },
      { label: "Faire l'arrivée puis le départ", hint: "La facture se télécharge au départ.", to: "/hotel/reservations" },
      { label: "Suivre le ménage", hint: "Chambre libérée quand c'est fait.", to: "/hotel/menage" },
    ],
  },
  proprietaire: {
    title: "Propriétaire — mise en place complète",
    steps: [
      {
        label: "Créer les catégories",
        hint: "3 à 6 familles suffisent pour démarrer.",
        to: "/categories",
      },
      {
        label: "Ajouter les produits",
        hint: "SKU, code-barres et seuil d'alerte.",
        to: "/produits",
      },
      {
        label: "Renseigner les fournisseurs",
        hint: "Pour les lots et les achats.",
        to: "/fournisseurs",
      },
      {
        label: "Enregistrer l'entrée initiale",
        hint: "Le stock de départ de chaque produit.",
        to: "/stock",
      },
      { label: "Créer les clients", hint: "Facultatif, utile pour le suivi.", to: "/clients" },
      { label: "Faire la première vente", hint: "Puis imprimer la facture PDF.", to: "/ventes" },
      {
        label: "Lancer un inventaire",
        hint: "Pour fiabiliser le stock à la clôture.",
        to: "/inventaire",
      },
    ],
  },
  magasinier: {
    title: "Magasinier — quotidien entrepôt",
    steps: [
      {
        label: "Vérifier les produits et seuils",
        hint: "Repérez les références à réapprovisionner.",
        to: "/produits",
      },
      { label: "Réceptionner les entrées", hint: "Achat, retour ou transfert reçu.", to: "/stock" },
      { label: "Créer les lots", hint: "Un lot par réception, avec le certificat.", to: "/lots" },
      { label: "Compter l'inventaire", hint: "Au clavier ou à la caméra.", to: "/inventaire" },
    ],
  },
  caissier: {
    title: "Caissier — encaissement",
    steps: [
      {
        label: "Vérifier le stock disponible",
        hint: "Le POS signale les ruptures.",
        to: "/produits",
      },
      { label: "Enregistrer la vente", hint: "Produits, remise, mode de paiement.", to: "/ventes" },
      { label: "Scanner un article", hint: "Plus rapide que la recherche.", to: "/scanner" },
      {
        label: "Gérer un retour",
        hint: "Émettre un avoir, jamais supprimer une vente.",
        to: "/avoirs",
      },
    ],
  },
};

const SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Ouvrir la recherche globale (produits, lots, clients, pages)" },
  { keys: ["Ctrl", "K"], description: "Même raccourci sur Windows et Linux" },
  { keys: ["⌘", "B"], description: "Réduire ou afficher le menu latéral" },
  { keys: ["?"], description: "Ouvrir ce centre d'aide" },
  { keys: ["Échap"], description: "Fermer la fenêtre ou le panneau courant" },
];

const FAQ = [
  {
    question: "Comment annuler une vente déjà enregistrée ?",
    answer:
      "Une vente ne se supprime pas. Ouvrez « Avoirs », créez un avoir rattaché à la vente : le stock et les totaux sont contre-passés, et l'historique reste intact.",
  },
  {
    question: "Comment corriger une erreur de stock ?",
    answer:
      "Créez un mouvement inverse dans « Stock » (sortie si vous avez saisi une entrée en trop, et inversement) en indiquant le motif. Chaque mouvement est horodaté et attribué à son auteur.",
  },
  {
    question: "Que se passe-t-il si Internet coupe ?",
    answer:
      "L'application continue de fonctionner avec les données déjà synchronisées. Les écritures partent en file d'attente et sont rejouées à la reconnexion. Le panneau « Synchronisation » et la bannière hors-ligne indiquent l'état exact.",
  },
  {
    question: "Pourquoi certains menus ne sont-ils pas visibles ?",
    answer:
      "L'accès dépend de votre rôle. Le propriétaire voit tout ; le magasinier gère produits, lots, stock et inventaire ; le caissier accède aux ventes, clients, scanner et avoirs.",
  },
  {
    question: "Comment retrouver un article très vite ?",
    answer:
      "Utilisez ⌘K / Ctrl+K : la recherche couvre les produits (nom, SKU, code-barres), les lots, les clients, les fournisseurs et les pages. Le module « Scanner » lit aussi les QR codes à la caméra.",
  },
  {
    question: "Comment changer mon mot de passe ?",
    answer:
      "Déconnectez-vous puis utilisez « Mot de passe oublié » sur l'écran de connexion : un lien de réinitialisation est envoyé par email. La politique impose 8 caractères minimum, une majuscule et un chiffre.",
  },
];

function canAccess(roles: AppRole[], allowed?: AppRole[]) {
  if (!allowed || allowed.length === 0) return true;
  if (roles.length === 0) return true;
  return roles.some((r) => allowed.includes(r));
}

function moduleRolesFor(to: string): AppRole[] | undefined {
  const item = modules.flatMap((g) => g.items).find((i) => i.to === to);
  return item?.roles;
}

function guideFor(pathname: string): ModuleGuide | null {
  if (MODULE_GUIDES[pathname]) return MODULE_GUIDES[pathname];
  const match = Object.keys(MODULE_GUIDES)
    .filter((route) => pathname.startsWith(route + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return match ? MODULE_GUIDES[match] : null;
}

export function HelpCenter({ roles }: { roles: AppRole[] }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const guide = useMemo(() => guideFor(pathname), [pathname]);

  // Le point d'alerte n'apparaît que tant que l'aide n'a pas été ouverte.
  useEffect(() => {
    try {
      setSeen(localStorage.getItem(HELP_SEEN_KEY) === "1");
    } catch {
      setSeen(true);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) {
        return;
      }
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !seen) {
      setSeen(true);
      try {
        localStorage.setItem(HELP_SEEN_KEY, "1");
      } catch {
        /* stockage indisponible : sans conséquence */
      }
    }
  }

  const roleGuide = roles.length > 0 ? ROLE_GUIDES[roles[0]] : ROLE_GUIDES.proprietaire;

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label="Ouvrir le centre d'aide"
        title="Centre d'aide (?)"
        className="relative rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <CircleHelp className="size-4" />
        {!seen && (
          <span className="absolute right-1 top-1 size-2 rounded-full bg-accent" aria-hidden />
        )}
      </button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl"
        >
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-accent" />
              Centre d'aide
            </SheetTitle>
            <SheetDescription>
              Guide rapide d'INDUS-ERP — {roleGuide.title.split(" — ")[0].toLowerCase()}.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="module" className="flex-1 px-5 py-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="module">Cet écran</TabsTrigger>
              <TabsTrigger value="demarrage">Démarrage</TabsTrigger>
              <TabsTrigger value="raccourcis">Raccourcis</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="module" className="mt-4 space-y-4">
              {guide ? (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{guide.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {guide.summary}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Actions essentielles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {guide.actions
                        .filter((a) => canAccess(roles, moduleRolesFor(a.to)))
                        .map((action) => (
                          <Link
                            key={action.to + action.label}
                            to={action.to}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
                          >
                            {action.label}
                            <ArrowRight className="size-3" />
                          </Link>
                        ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                      <Lightbulb className="size-3.5" />À savoir
                    </p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {guide.tips.map((tip) => (
                        <li key={tip} className="flex gap-2">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune aide spécifique pour cet écran. Consultez l'onglet « Démarrage » pour le
                  parcours recommandé.
                </p>
              )}
            </TabsContent>

            <TabsContent value="demarrage" className="mt-4 space-y-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="size-4 text-accent" />
                  {roleGuide.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Suivez ces étapes dans l'ordre : chacune prépare la suivante.
                </p>
              </div>
              <ol className="space-y-2">
                {roleGuide.steps
                  .filter((step) => canAccess(roles, moduleRolesFor(step.to)))
                  .map((step, index) => (
                    <li key={step.label}>
                      <Link
                        to={step.to}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-accent"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground">
                            {step.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {step.hint}
                          </span>
                        </span>
                        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
              </ol>
            </TabsContent>

            <TabsContent value="raccourcis" className="mt-4 space-y-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Keyboard className="size-4 text-accent" />
                Raccourcis clavier
              </p>
              <div className="divide-y divide-border rounded-lg border border-border">
                {SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <span className="flex shrink-0 gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className={cn(
                            "min-w-6 rounded border border-border bg-muted px-1.5 py-0.5",
                            "text-center font-mono text-[10px] font-semibold text-foreground",
                          )}
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Astuce : combinez la recherche globale avec le sélecteur d'entrepôt pour retrouver
                une référence dans un magasin précis.
              </p>
            </TabsContent>

            <TabsContent value="faq" className="mt-4">
              <Accordion type="single" collapsible className="w-full">
                {FAQ.map((item, index) => (
                  <AccordionItem key={item.question} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-sm">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
