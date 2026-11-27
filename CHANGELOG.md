# 📝 CHANGELOG — INDUS-ERP

> **Dernière mise à jour** : 2026-11-06

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

---

## [Non publié]
### Ajouté — Revue métier 2026-11-06
- **Double devise (base + affichage)** : les montants restent stockés dans la devise
  de base (CDF, XOF, XAF, USD, EUR) ; un taux de change configurable permet
  d'afficher les écrans dans une seconde devise.
  - `src/lib/currency.ts` — conversion, formatage, raccourcis d'espèces ;
  - `src/lib/app-settings.ts` — paramètres partagés (devises, ticket, WhatsApp) ;
  - `src/components/currency-toggle.tsx` — bascule rapide dans l'en-tête ;
  - `/parametres` — devises base/secondaire, taux, devise affichée ;
  - `formatXOF` délègue à `formatMoney` : tous les écrans existants suivent la devise
    choisie sans modification (tests `format.test.ts` inchangés).
- **Tickets thermiques 58/80 mm** (`src/lib/receipt.ts`) : HTML monospace optimisé
  imprimante de comptoir (`@page size`), iframe isolée, impression automatique
  optionnelle après une vente, largeur et pied de ticket réglables.
- **Passerelle WhatsApp** (`src/lib/whatsapp.ts`) : normalisation des numéros
  (indicatif par défaut 243), partage du ticket depuis le POS, bouton de contact
  sur la fiche client (`wa.me`).
- **Ergonomie caisse** : pavé numérique tactile, boutons de coupure rapide
  (« Exact », 1 000, 5 000…), montant reçu et **monnaie rendue** calculés en
  devise d'affichage, encaissement en espèces sans quitter le POS.
- **Journal d'activité** : migration `20261106090000_audit_logs.sql` (table,
  index, triggers `INSERT/UPDATE/DELETE` sur 12 tables métier, RLS lecture
  propriétaire) et écran `/activite`, onglet « Modifications » (filtres
table/action, recherche, détail JSON, export CSV, message explicite si la
migration n'est pas appliquée). L'écran `/activite` réunit désormais deux
onglets : « Actions métier » (`audit_log`) et « Modifications » (`audit_logs`) ;
l'ancienne route `/journal-activite` a été supprimée.
- **Jeu de démonstration** `supabase/seed.sql` : entrepôt, catégories, fournisseur,
  6 produits `DEMO-*`, lots, clients, 2 ventes et dépense — idempotent, à exécuter
  manuellement sur une base de test.
- **Alignement de l'audit** : migration `20261106130000_audit_logs_full_coverage.sql`
  — ajoute les triggers manquants pour couvrir les 27 tables réellement tracées en
  production (profils, SAV, commandes fournisseurs, transferts, retours, inventaire),
  sans remplacer les triggers existants.
- **Sauvegardes** : `scripts/backup.sh` (dump compressé + SHA-256) et
  `scripts/restore.sh` (restauration confirmée), section RPO/RTO et procédure de
  test trimestriel dans `DEPLOYMENT.md`.

### Modifié
- **Écran d'audit unifié** : `/activite` regroupe les actions métier (par module,
  entrepôt, sévérité) et les modifications ligne par ligne (triggers `audit_logs`)
  dans deux onglets ; menu simplifié, route `/journal-activite` supprimée.

### Corrigé
- **Tests d'intégration isolés de la production** : `supabaseAvailable` n'accepte plus
  qu'une URL locale (`localhost`, `127.0.0.1`, `[::1]`). Le `.env` pointant sur le projet
  déployé, la suite lançait auparavant `signIn` puis `signUp` sur la base réelle et
  échouait sur « mot de passe faible » ; elle passe désormais en mode dégradé explicite.
  Dérogation volontaire : `ALLOW_REMOTE_TEST_DB=1` avec une base de test dédiée.
- **`audit_logs` typé** : bloc ajouté à `src/integrations/supabase/types.ts`, le cast
  `(supabase as any)` de l'onglet « Modifications » est supprimé ; la requête et la
  jointure `profiles` sont vérifiées par TypeScript.
- **Tables hors audit documentées** : `audit_log`, `data_backups`, `error_logs`,
  `user_favorites` justifiées dans `MIGRATIONS.md`, avec la requête de contrôle de
  couverture.
- **Réglages de devise incohérents** : à l'enregistrement, la devise d'affichage est
  ramenée sur la devise de base si elle n'est plus valide (changement de devise
  base/secondaire), la devise secondaire ne peut pas égaler la base, et l'activation
  d'un affichage secondaire sans taux > 0 est refusée avec un message explicite.
- **Typecheck à zéro** : `src/test/e2e/_video/record.spec.ts` (import `fs` remonté
  au niveau module, typage `Page` et `string`) — plus aucune erreur `tsc`.

### Modifié
- **POS** : plus de génération PDF A4 systématique ; le ticket thermique s'imprime
  selon le réglage, la facture A4 reste disponible à la demande, l'email est
  remplacé par le partage WhatsApp dans le panneau « Dernière vente ».

### Ajouté (précédent)
- **Centre d'aide intégré** (`src/components/help-center.tsx`), accessible depuis
  l'en-tête de tous les écrans authentifiés et par la touche `?` :
  - onglet « Cet écran » — description du module courant et actions essentielles
    filtrées selon le rôle ;
  - onglet « Démarrage » — parcours ordonné par rôle (propriétaire, magasinier,
    caissier) avec liens directs ;
  - onglet « Raccourcis » — ⌘K / Ctrl+K, ⌘B / Ctrl+B, `?`, `Échap` (raccourcis réellement
    implémentés, pas de liste fictive) ;
  - onglet « FAQ » — annulation de vente, correction de stock, mode hors-ligne,
    rôles, recherche, réinitialisation du mot de passe.
  - Contenu statique : fonctionne hors-ligne et n'exige aucune permission de lecture.
  - Point d'alerte sur le bouton tant que l'aide n'a pas été ouverte (localStorage).
- **Carte « Premiers pas »** (`src/components/getting-started-card.tsx`) sur le tableau
  de bord : affichée uniquement quand l'installation n'a ni produit ni vente du mois,
  elle guide les 4 premières actions (catégories, produits, stock initial, première
  vente) et peut être masquée.

- **Politique de mot de passe renforcée** (8+ caractères, 1 majuscule, 1 chiffre) :
  - `src/lib/password-policy.ts` — source unique Zod (`passwordSchema`,
    `passwordWithConfirmSchema`, jauge `passwordStrength`, message FR centralisé),
    appliquée à l'**inscription** (`auth.tsx`) et à la **réinitialisation**
    (`reset-password.tsx`), JAMAIS à la connexion (les comptes existants restent
    accessibles) ; 13 tests unitaires.
  - Garde-fou serveur dans `supabase/config.toml` : `minimum_password_length = 8` +
    `password_requirements = "lower_upper_letters_digits"` (clés de la section `[auth]`
    racine — vérifiées dans le template `supabase init` ; une section `[auth.password]`
    inventée est silencieusement ignorée par la CLI) → `GOTRUE_PASSWORD_MIN_LENGTH=8`,
    refus serveur `422 weak_password` vérifié.
  - Test E2E « mot de passe faible rejeté » dans `auth-flow.spec.ts` (cible le toast
    Sonner pour éviter l'ambiguïté avec le texte d'aide du champ).
  - `playwright.config.ts` : exécution strictement séquentielle (`workers: 1`,
    `fullyParallel: false`) — les suites auth partagent Mailpit et le compte admin,
    l'exécution parallèle provoquait une course sur les emails de récupération.

### Retiré
- **Bouton « Tester » du panneau de notifications** (`notifications-bell.tsx`) : débogage
  devenu inutile en production ; le bouton « Vider » est conservé.

## [1.14.0] — 2026-09-15
### Ajouté
- **Flux « Mot de passe oublié » complet** sur `/auth` : lien « Mot de passe oublié ? »,
  formulaire d'envoi d'email (`resetPasswordForEmail` + `redirectTo: /reset-password`),
  écran de confirmation d'envoi (rappel Inbucket en local), nouvelle route `/reset-password`
  qui échange le hash de récupération contre une session puis permet de définir un nouveau
  mot de passe (`updateUser`) avec états checking/ready/invalid/done.
- **Inscription renforcée** : champ de confirmation du mot de passe (Zod `.refine`),
  jauge de robustesse 4 niveaux, bouton œil afficher/masquer sur tous les champs mot de
  passe, gestion du cas « confirmation email activée » (écran « Confirmez votre email »
  quand Supabase ne renvoie pas de session).
- **Messages d'erreur auth contextualisés** : identifiants incorrects, email non confirmé.
- **`compte.md`** : documentation des identifiants du compte admin local, URLs de la stack
  (app, Studio, Inbucket, PostgreSQL) et procédures de réinitialisation (email + SQL).
- **Test E2E `src/test/e2e/auth-flow.spec.ts`** : 4 scénarios (affichage/toggle, formulaire
  mot de passe oublié, connexion réelle → dashboard, état « lien invalide » de /reset-password).
- **Test E2E `src/test/e2e/auth-signup-flow.spec.ts`** : inscription avec confirmation email
  (flux production-like) — inscription UI → email « Confirm your email address » dans Mailpit
  → connexion REFUSÉE avant confirmation (message contextualisé) → clic réel sur le lien
  `/auth/v1/verify?type=signup` → connexion ACCEPTÉE. Idempotent : email fixe + purge en
  `beforeAll` (DELETE auth.users, profils purgés en cascade).
- **Helpers E2E partagés `src/test/e2e/helpers/mailpit.ts`** : `mailpitCount`,
  `waitForVerifyEmail` (attente + extraction du lien verify par sujet/destinataire),
  `confirmViaVerifyLink`, `loginViaUI` — dédupliqués entre auth-reset-flow et auth-signup-flow.
- **Config locale production-like** : `supabase/config.toml` active `[auth.email]
  enable_confirmations = true` (section correcte — sous `[auth]` racine elle est silencieusement
  ignorée) → `GOTRUE_MAILER_AUTOCONFIRM=false`, un nouvel inscrit doit cliquer le lien reçu
  comme en production. Les utilisateurs existants restent confirmés.

### Corrigé
- **Test d'intégration produits au verdict non déterministe** (`src/test/integration/`) :
  l'ancien setup déduisait « base absente » d'un `data === null`, ce qui dépendait des
  politiques RLS (requêtes **anon** alors que « prod read » cible `TO authenticated`)
  et des variables d'env (`.env` contient `VITE_SUPABASE_PUBLISHABLE_KEY` mais pas
  `VITE_SUPABASE_ANON_KEY` → client construit avec `mock-key` contre la vraie URL).
  Nouveau setup auto-suffisant : ping explicite `/auth/v1/health` (`supabaseAvailable`),
  support des deux nommages de clé, création automatique de l'utilisateur de test
  (auto-confirm local, ou confirmation directe en base si `enable_confirmations`
  est actif), requêtes authentifiées et attentes strictes ; sans stack, skip
  silencieux sans requête réseau. Suite complète : 77/77 ✅ (stack active comme absente).
- **Liens des emails auth pointant vers le port 3000** : `supabase/config.toml` local
  renseigne désormais `site_url = http://127.0.0.1:8080` + `additional_redirect_urls` —
  les liens de récupération/confirmation redirigent vers l'application Vite et non
  l'URL par défaut de Studio.
- **`redirectTo` rejeté par GoTrue (allow-list sans chemin)** : `additional_redirect_urls`
  doit utiliser des wildcards (`http://localhost:8080/**`) — une URL exacte sans chemin
  fait échouer la validation du `redirectTo=/reset-password`, et GoTrue retombe sur
  `site_url` à la racine : l'utilisateur atterrissait connecté sur le dashboard au lieu
  du formulaire de nouveau mot de passe.
- **Stack Supabase locale qui ne démarrait plus après restart** : `[analytics] enabled = false`
  (logflare exige le daemon Docker exposé sur tcp://localhost:2375 sur Windows) ; données
  restaurées depuis l'ancien volume `supabase_db_iwvyqwgugqfrulkfjccp` vers `supabase_db_local`.

### Vérifié
- E2E auth-flow : 4/4 ✅ — connexion admin → dashboard, email « Reset your password » reçu
  dans Mailpit avec `redirect_to=http://127.0.0.1:8080`.
- `tsc --noEmit` : ✅ (3 erreurs pré-existantes dans `src/test/e2e/_video/record.spec.ts`).
- Tests unitaires : 76/77 (1 échec pré-existant : test d'intégration produits qui suppose
  l'absence de Supabase alors que la stack locale tourne).
- **Cycle complet de réinitialisation vérifié de bout en bout** (`auth-reset-flow.spec.ts`,
  4/4 ✅) : demande depuis /auth → email reçu dans Mailpit → clic réel sur le lien
  `/auth/v1/verify` → définition du nouveau mot de passe sur /reset-password → reconnexion.
  Le mot de passe admin est restauré à l'identique après le test (double cycle).

---

## [1.13.0] — 2026-09-15
### Performance — les 6 axes d'optimisation traités
- **Pagination serveur généralisée** : commandes fournisseurs, SAV et transferts désormais paginés
  côté serveur (`range()` + `count: "exact"`, 20/page) avec filtres statut/client appliqués dans la
  requête SQL — plus aucune liste ne charge la totalité des données (13 listes paginées au total).
- **Debounce des recherches** : recherche produits côté serveur debouncée à 300 ms (la `queryKey`
  TanStack Query n'est mise à jour qu'après stabilisation de la frappe) ; recherches client-side
  debouncées à 200 ms sur clients, fournisseurs, achats, certificats, avoirs et retours fournisseurs.
- **Memoization** : `React.memo` sur les lignes de liste commandes fournisseurs (`OrderRow`),
  SAV (`TicketRow`) et transferts (`TransferCard`) ; `useMemo` sur les filtrages qui en étaient dépourvus.
- **Code splitting recharts** : nouveau composant `src/components/dashboard-chart.tsx` chargé via
  `React.lazy` + `Suspense` — recharts (~96 KB gzip) retiré du bundle initial du dashboard.
- **Import dynamique jspdf** : `/rapports` charge jsPDF + autotable (~126 KB gzip) uniquement
  au clic sur l'export PDF.
- **staleTime 5 min** sur les listes de référence des formulaires (produits/fournisseurs « min »,
  entrepôts et profils) ; compteur SAV ouverts à 60 s.

### Vérifié
- `tsc --noEmit` : ✅ (les 3 erreurs de `src/test/e2e/_video/record.spec.ts` sont pré-existantes)
- Tests unitaires : 75/77 (2 timeouts = tests d'intégration nécessitant la stack Supabase Docker locale)
- `vite build` : ✅ chunks `recharts` (96,5 KB gzip) et `jspdf` (125,7 KB gzip) bien séparés

---

## [1.12.0] — 2026-09-04
### Ajouté
- **Couche d'accès hors-ligne du mode terrain** : `src/lib/offline/terrain-offline.ts` (`withOfflineFallback`, `insertOrQueue`, lectures `cachedProducts` / `cachedLotByNumber` / `cachedLotsForProduct` / `cachedOpenSessions`, détection d'erreur réseau `isNetworkError`, identité via session locale).
- **Mode terrain sans réseau** : scan et recherche manuelle résolus depuis le miroir Dexie (mention « données locales »), listes produits/lots/sessions servies par le cache, entrées/sorties et comptages mis en file d'attente (outbox) et rejoués automatiquement au retour du réseau.
- **Réception fournisseur** : explicitement désactivée hors-ligne (opération multi-tables non rejouable) avec message d'orientation vers le mode « Entrée ».

### Corrigé
- **Comptage d'inventaire terrain** : l'insertion utilisait la colonne inexistante `counted_by` sur `inventory_counts` — tout comptage depuis le mode terrain échouait. Colonne supprimée du payload, `warehouse_id` renseigné depuis le lot ou l'entrepôt actif.
- **Écritures terrain** : les refus serveur (RLS, validation) ne sont plus confondus avec une coupure réseau ; seules les vraies coupures déclenchent la mise en file d'attente.
- **Quantités terrain** : refus des valeurs non entières sur entrées, sorties et comptages.

### Vérifié
- Test navigateur : mode terrain reste utilisable après passage hors-ligne (bandeau affiché, aucune erreur console), une entrée de stock saisie hors-ligne est mise en file puis poussée en base dès la reconnexion (outbox 1 → 0, ligne présente côté serveur).

## [1.11.0] — 2026-08-10
### Ajouté
- **Modes d'affichage multiples** : `src/components/view-mode-toggle.tsx` (hook `useViewMode` persistant + 5 modes : très grandes icônes, grandes icônes, mosaïque, détails, liste) appliqué à `/produits` et `/stock` (cartes de mouvements avec icône entrée/sortie, quantité, lot et emplacement).

### Corrigé
- **Mode terrain** : initialisation du scanner après montage du conteneur (plus d'erreur « element not found »), arrêt/nettoyage propre de la caméra, recherche par numéro de lot **ou** SKU/code-barres, sélection explicite du produit et du lot (les entrées/sorties sans scan fonctionnent désormais), quantités validées, filtre entrepôt appliqué aux lots/sessions/commandes, `counted_by` renseigné, statut de commande `partielle` en cas de réception partielle, boutons ≥ 56 px et invalidations de cache correctes.

## [1.10.0] — 2026-08-09
### Ajouté
- **Exports transferts** : `src/lib/transfers-export.ts` + boutons CSV/PDF sur `/transferts` (bons, lignes, quantités expédiées/reçues, source/destination) avec filtres date, magasinier et entrepôt appliqués à la liste et aux exports.
- **Conflits offline spécifiques aux transferts** : colonnes CRDT sur `stock_transfers`/`stock_transfer_items`, `src/lib/sync/transfer-conflicts.ts` (libellés métier, valeurs traduites, recommandation workflow-aware) et résolution guidée dans `/synchronisation`.
- **Contrôles au scan** : quantité entière > 0, refus des lots suivis par numéro de série sans scan unitaire, statut du numéro de série vérifié, appartenance à l'entrepôt source et contrôle du stock disponible, avec messages d'erreur explicites.



## [1.9.0] — 2026-08-08
### Ajouté
- **Favoris & raccourcis par rôle et par entrepôt** : `user_favorites` enrichie (`role`, `warehouse_id`, `sort_order`), hook `use-favorites`, barre « Accès rapide » et bouton d'épinglage dans le header.
- **Mode kiosque caissier** : `use-kiosk`, coquille plein écran limitée à `/ventes` et `/scanner`, menus masqués, sortie explicite.
- **Emplacements** : explorateur arborescent (Entrepôt > Zone > emplacement), recherche avec auto-complétion et création rapide au bon niveau (`components/location-tree.tsx`).
- **Notifications intelligentes par entrepôt** : `use-smart-alerts` (stock critique, commandes fournisseurs en retard, garanties expirant sous 30 jours) + `SmartAlertsCard` sur le tableau de bord.
- **Module Transferts entre entrepôts** : tables `stock_transfers` / `stock_transfer_items`, numérotation `generate_transfer_number()`, route `/transferts` avec scan QR, bon de transfert et double validation source/destination.

## [1.2.0] — 2026-07-22

### 🏭 Multi-entrepôts & Emplacements
- **Table `warehouses`** : Gestion de plusieurs entrepôts/sites de stockage
- **Localisation hiérarchique** : Colonnes `zone`, `aisle`, `rack`, `bay`, `level` sur `stock_locations`
- **Filtre entrepôt** : `useWarehouseFilter` + `WarehouseProvider` pour appliquer `eq('warehouse_id', ...)` sur toutes les requêtes
- **Sélecteur d'entrepôt** : Menu dans le header avec persistance locale et option "Tous les entrepôts" pour le propriétaire
- **Vue `lot_stock_by_warehouse`** : Calcul du stock filtré par entrepôt avec `SECURITY INVOKER`
- **Pages mises à jour** : Stock, Lots, Inventaire, Dashboard, Emplacements

### 📱 Mode terrain (mobile)
- **Route `/terrain`** : Interface mobile optimisée avec grandes tuiles tactiles
- **Scanner intégré** : Démarrage caméra direct depuis le mode terrain
- **Entrée/Sortie rapide** : Compteur +/- et enregistrement en un clic
- **Comptage rapide** : Lien à une session d'inventaire ouverte
- **Réception fournisseur** : Réception simplifiée des commandes en attente

### ⚡ UX globale
- **Palette de commande Cmd+K** : `GlobalCommandPalette` pour rechercher produits, lots, clients, fournisseurs et pages
- **Favoris utilisateur** : Table `user_favorites` prête pour les raccourcis personnalisés

---

## [1.1.0] — 2026-07-22

### 🚀 Nouvelles fonctionnalités

#### 🔔 Notifications toast améliorées (Tâche 23)
- **Composant Sonner** : Toaster enrichi avec `closeButton`, `richColors`, `gap` configurable
- **Classes CSS** : Styles personnalisés pour chaque type (success, error, warning, info)
- **Bouton de fermeture** : Ajouté sur chaque notification

#### ✨ Animations UI (Tâche 24)
- **`animate-page-enter`** : Animation d'entrée des pages (fade-in + slide-up)
- **`animate-row-enter`** : Animation différée des lignes de tableau (staggered)
- **`animate-card-pop`** : Animation d'apparition des cartes KPI
- **`animate-skeleton`** : Animation de chargement (pulse)
- **`animate-pulse-badge`** : Animation de pulse pour les badges de notification
- **Micro-interactions** : Transitions sur tous les boutons/liens, effet `card-hover`
- **Scrollbar personnalisée** : Scrollbar fine aux couleurs du thème

#### 📊 Statistiques dashboard supplémentaires (Tâche 25)
- **Top 5 produits du mois** : Nouveau bloc dans le dashboard classant les produits les plus vendus
- **Agrégation** : Calcul des quantités vendues et du chiffre d'affaires par produit
- **Lien rapide** : Redirection vers la page Produits

#### 📦 Multi-emplacement stock (Tâche 26)
- **Table `stock_locations`** : Nouvelle table PostgreSQL avec RLS
- **Colonne `location_id`** : Ajoutée à `stock_movements` (FK)
- **Page Emplacements** : CRUD complet avec formulaire (nom, description, actif/inactif)
- **Filtre par emplacement** : Selecteur dans l'en-tête de la page Stock
- **Colonne Emplacement** : Affichée dans le tableau des mouvements
- **Champ dans le formulaire** : Sélection de l'emplacement lors de la création/édition d'un mouvement
- **3 emplacements par défaut** : Entrepôt principal, Entrepôt secondaire, Zone de transit

#### 🔄 Transferts entre emplacements (Tâche 27)
- **Dialogue de transfert** : Interface dédiée dans la page Emplacements
- **Double mouvement** : Sortie de l'emplacement source + Entrée vers l'emplacement destination
- **Validation** : Vérification que les emplacements sont différents

#### 📤 Retours fournisseurs (Tâche 28)
- **Table `supplier_returns`** : Nouvelle table avec RLS
- **Page Retours fournisseurs** : CRUD complet avec recherche, pagination
- **Formulaire de retour** : Sélection produit, fournisseur, lot, quantité, motif (dropdown)
- **Numéro automatique** : Fonction SQL `generate_return_number()` — format `RET-YYYYMMDD-XXXX`
- **Mouvement stock** : Création automatique d'une sortie de stock
- **Statuts** : En attente, Effectué, Annulé — avec badges colorés

#### 💰 Avoirs (Tâche 29)
- **Table `credits`** : Nouvelle table avec RLS
- **Page Avoirs** : CRUD complet avec recherche, pagination
- **Formulaire d'avoir** : Lien vers une vente existante, montant TTC, motif (dropdown)
- **Numéro automatique** : Fonction SQL `generate_credit_number()` — format `AV-YYYYMMDD-XXXX`
- **Bouton email** : Envoi de l'avoir par email (prêt pour intégration Resend)

#### 📧 Envoi de facture par email (Tâche 30)
- **Confirmation après vente** : Proposition d'envoi email après validation d'une vente (si client renseigné)
- **Formulaire email** : Saisie de l'adresse email du client
- **Template HTML** : Facture formatée en HTML (tableau des produits, totaux)
- **Prêt pour Resend** : Structure en place, nécessite clé API `VITE_RESEND_API_KEY`

#### 📡 Mode hors-ligne (PWA) (Tâche 31)
- **Service Worker** : `public/sw.js` avec stratégie cache-first (assets) et network-first (données)
- **Manifest** : `public/manifest.json` avec icône SVG, thème orange, standalone display
- **Page hors-ligne** : Message stylé lorsque le réseau est indisponible
- **Méta-tags PWA** : `theme-color`, `apple-mobile-web-app-capable`, viewport
- **Favicon SVG** : Icône INDUS-ERP aux couleurs de la marque
- **Enregistrement SW** : Auto-enregistrement au chargement de l'application

### 📡 Notifications temps réel (Phase 6)
- **Hook `useRealtimeSubscription`** : Hook React générique pour s'abonner aux changements PostgreSQL via Supabase Realtime
- **Composant `LiveBadge`** : Indicateur visuel (vert=Live, orange=Connexion, rouge=Erreur) avec point animé
- **Dashboard temps réel** : Souscriptions aux tables `sales` et `stock_movements` → invalidation automatique des KPIs, graphiques et alertes
- **Stock temps réel** : Souscription à `stock_movements` → mise à jour live des mouvements et vérification des alertes
- **Nettoyage automatique** : Les canaux Realtime sont supprimés au démontage des composants

### 📦 Analyse de bundle (Phase 6)
- **Script `analyze:bundle`** : Ajouté dans package.json (vite-bundle-visualizer)
- **Rapport** : Plus gros chunks identifiés (jspdf 399 kB, dashboard 408 kB, index 643 kB)
- **Recommandations** : Imports dynamiques pour jspdf/html2canvas, remplacer vite-tsconfig-paths par `resolve.tsconfigPaths: true`

### 🚀 Déploiement production (Phase 7)
- **`vercel.json`** : Fichier de configuration Vercel complet avec headers sécurité (CSP, X-Frame-Options), cache immutable pour assets, et secrets d'environnement
- **`.env.example`** : Sections ajoutées pour Realtime, Resend, LOG_LEVEL, et documentation des secrets Vercel

### 🔧 Corrections
- Suppression de code mort dans `stock.tsx` (première requête Supabase inutile)
- Suppression de variable dupliquée `lots` dans `stock.tsx`
- Nettoyage des imports inutilisés (`useMemo` dans dashboard.tsx et stock.tsx)
- Correction du lien favicon (`.ico` → `.svg`)
- Imports inutilisés supprimés dans `retours-fournisseurs.tsx`

### 🧹 Refactoring
- Requête Supabase simplifiée dans `stock.tsx` (suppression de la double requête avec filtre client-side inutile)

---

## [1.0.0] — 2026-07-21

### 🚀 Ajouts

#### Fondations
- Création du projet TanStack Start avec configuration complète
- Mise en place de Supabase (Auth, Database, Storage)
- Design system "Navy industriel + Orange sécurité"
- Thème clair/sombre
- Gestion des erreurs SSR
- Routes protégées avec layout sidebar

#### Authentification
- Page de connexion/inscription
- Gestion des sessions Supabase
- Middleware d'authentification
- Détection et redirection automatique

#### Modules Métier
- **Produits** : Catalogue, SKU auto-généré, QR codes, codes-barres
- **Catégories** : Gestion arborescente
- **Lots** : Traçabilité par lot, certificats PDF
- **Fournisseurs** : Gestion des fournisseurs
- **Stock** : Entrées/sorties avec historique
- **Ventes (POS)** : Point de vente complet avec facture PDF
- **Achats** : Suivi des achats
- **Clients** : Gestion des clients
- **Dépenses** : Suivi des dépenses
- **Inventaire** : Sessions d'inventaire avec scan QR code
- **Scanner** : Scan QR code universel
- **Rapports** : Tableaux de bord et graphiques (Recharts)
- **Utilisateurs** : Gestion des rôles
- **Paramètres** : Configuration

#### Infrastructure
- Composants UI shadcn/ui (60+ composants)
- Hooks React Query pour chaque ressource
- Validation Zod
- Génération PDF (jspdf + jspdf-autotable)
- Scan QR (html5-qrcode)
- Génération QR/barcode (qrcode.react, JsBarcode)

### 📚 Documentation
- Création de la documentation complète du projet :
  - README.md, AGENTS.md, CONTEXT.md
  - ARCHITECTURE.md, DATABASE.md, SECURITY.md
  - CODE_STYLE.md, PERFORMANCE.md
  - CHANGELOG.md, TODO.md, BUGS.md
  - ROADMAP.md, FEATURES.md
  - Et tous les autres documents de référence

### ⚡ Optimisations
- **QueryClient** : Configuration des valeurs par défaut (staleTime: 30s, gcTime: 5min, retry: 1, refetchOnWindowFocus: false)
- **Pagination** : Ajout d'un composant `Pagination` réutilisable avec sélecteur de taille de page
- **Pagination Produits** : La liste des produits utilise désormais `range()` avec comptage exact
- **Pagination Lots** : La liste des lots utilise désormais `range()` avec comptage exact
- **Pagination Stock** : La liste des mouvements utilise désormais `range()` avec comptage exact (remplace l'ancien `limit(200)`)
- **Debounce** : Création du hook `useDebounce` — intégré dans la recherche POS (ventes.tsx, délai 200ms)
- **Compression d'images** : Création de l'utilitaire `compressImage()` — les photos produits uploadées sont converties en WebP (max 800px, qualité 0.82) avant upload Supabase

### 🔒 Sécurité
- **🔴 Audit de sécurité complet** : Rapport détaillé dans `docs/SECURITY_AUDIT_2026-07-21.md`
- **🔴 Correction RLS** : Politiques INSERT/UPDATE de `stock_movements`, `sales`, `sale_items`, `inventory_sessions`, `inventory_counts` — ajout de vérification de rôle (étaient `auth.uid() IS NOT NULL` seulement)
- **🔴 Correction Storage** : Buckets `product-photos` et `certificats` — ajout de vérification de rôle sur INSERT/UPDATE/DELETE
- **🔴 `.gitignore`** : Ajout de `.env` et `.env.*`
- **📊 Index d'audit** : Ajout d'index sur `created_by` dans `stock_movements`, `sales`, `inventory_sessions`

### 🔧 Corrections
- Aucune (première version documentée)

### 🚀 CI/CD & Monitoring
- **GitHub Actions CI/CD** : Workflow complet avec lint, typecheck, build, security audit, et déploiement Vercel
- **Scripts npm** : Ajout de `typecheck` et `audit` dans package.json
- **Sentry** : Initialisation côté client (__root.tsx) et serveur (server.ts) avec capture d'erreurs automatique
- **Variables d'environnement** : Création de `.env.example` avec toutes les variables documentées

### ⚡ Optimisations mémo
- **Pagination** ajoutée sur Clients (20/page), Fournisseurs (20/page), Catégories (20/page), Dépenses (20/page), Achats (20/page)
- **React.memo** sur les composants de ligne (ClientRow, SupplierRow, CategoryRow, ExpenseRow, AchatRow, StatCard)
- **useMemo** optimisé : `filtered` lists, computed values (total, lotsCount, nameById, monthTotal, byCategory, stats)
- **lotsCount** : Passage d'un filter() à chaque render à un useMemo avec Map

### 🚨 Alertes Stock
- **Base de données** : Nouvelle vue `product_stock_levels` (stock total par produit) + fonction `check_stock_alerts()` (retourne les produits sous seuil)
- **Migration** : `20260721140000_stock_alerts.sql` avec index et `security_invoker`
- **Hook `useStockAlerts`** : Requête automatique toutes les 60s avec notification pour les nouveaux produits sous seuil
- **Notifications in-app** : Déclenchement via le système `notify` existant (sonner + cloche) — détection des nouveaux alerts avec localStorage
- **Notifications email** : Fonction `sendStockAlertEmail()` via API Resend (HTML table formaté) — configurable dans Paramètres
- **Déclenchement automatique** : Après chaque entrée/sortie de stock (`stock.tsx`) et après chaque vente (`ventes.tsx`) — invalidation + notification
- **Tableau de bord** : Remplacement des données mock par les vraies alertes. Badge de comptage, icônes `rupture`/`faible`, lien vers produits
- **Paramètres** : Nouvelle section "Alertes stock" avec toggle email et champ email de notification
- **Migration existante** : `lowStockThreshold` renommé pour clarifier son usage

### 🧪 Tests (49 tests — Vitest)
- **Infrastructure** : Configuration Vitest + jsdom + @testing-library/react
- **format.ts** : 20 tests (formatXOF, formatDate, formatDateTime, generateSKU, generateBarcode, generateSaleNumber)
- **useDebounce** : 9 tests (valeurs initiales, délais, reset, types variés, cleanup)
- **Pagination** : 11 tests (rendu, navigation, états disabled, ranges, pages partielles)
- **compressImage** : 9 tests (fallbacks, conversion WebP, redimensionnement, erreurs Canvas)
- **Scripts** : `test`, `test:watch`, `test:coverage` ajoutés dans package.json

### ✏️ Édition & Suppression (RHF + Zod)
- **Produits** : Dialogue d'édition pré-rempli + suppression avec AlertDialog (Zod, RHF)
- **Lots** : Dialogue d'édition pré-rempli + suppression avec AlertDialog (Zod, RHF)
- **Clients** : Dialogue d'édition pré-rempli (Zod, RHF) — suppression déjà existante, migrée vers AlertDialog
- Colonne "Actions" ajoutée aux tableaux Produits et Lots
- Validation Zod robuste avec messages d'erreur personnalisés

### ⚡ Rate Limiting
- **`src/lib/rate-limiter.ts`** : Rate limiter en mémoire avec 5 endpoints configurables (login, signup, stock-movement, sale-create)
- Configurations : `default` 100 req/min, `login` 5 req/min, `signup` 3 req/5min
- Nettoyage automatique des entrées expirées toutes les 60s

### 📝 Journalisation structurée
- **`src/lib/logger.ts`** : Logger avec niveaux (debug → fatal), contexte, métadonnées JSON
- Format : `[TIMESTAMP] LEVEL [context] message {metadata}`
- Intégré dans `server.ts` (remplacement des `console.error`/`console.warn`)
- Variable d'environnement `LOG_LEVEL` pour configurer le niveau minimum

### 🛡️ Alertes sécurité Supabase
- Documentation complète dans `SECURITY.md` : alertes Auth, Database, Storage
- Seuils recommandés et actions à entreprise pour chaque type d'alerte
- Guide de configuration dans le dashboard Supabase

### 🧪 Tests d'intégration
- **Infrastructure** : `src/test/integration/setup.ts` avec client Supabase de test
- **Helper** : `signInAsTestUser()` et `cleanupTestData()`
- **Premier test** : `src/test/integration/products.test.ts` (récupération produits + catégories)
- Dégradation silencieuse si pas de base Supabase configurée (tests ignorés)

### 🛒 POS amélioré
- **Remise par ligne** : Nouveau champ `discount_pct` (0-100%) avec affichage prix barré
- **Remise globale** : Champ % sur le total HT
- **Raccourcis clavier** : F8 focus recherche, F9 validation vente, Échap vide recherche
- **Recherche intelligente** : Résultats triés par pertinence (correspondance début de nom d'abord)
- **Optimisation** : `useCallback` pour les opérations panier

### 📱 QR codes batch
- Bouton "QR codes" dans l'en-tête de la page Produits
- Dialogue affichant une grille de QR codes pour tous les produits de la page
- Bouton d'impression pour export papier

### 📄 Export CSV
- **`src/lib/csv.ts`** : Utilitaire réutilisable (toCsv + downloadCsv + exportToCsv) avec BOM UTF-8 pour compatibilité Excel
- **Produits** : Bouton CSV dans l'en-tête — exporte tous les produits (nom, SKU, catégorie, prix, TVA, stock min, code-barres, description)
- **Clients** : Bouton CSV dans l'en-tête — exporte tous les clients (nom, société, téléphone, email, adresse, notes)
- **Stock** : Bouton CSV dans l'en-tête — exporte tous les mouvements (date, type, produit, SKU, lot, quantité, PU, total, motif)
- Les exports récupèrent l'intégralité des données (pas seulement la page paginée courante)

### ✏️ Édition & Suppression — Stock
- **Mouvements** : Bouton crayon sur chaque ligne ouvre un dialogue pré-rempli pour modifier le mouvement (produit, lot, quantité, PU, motif)
- **Suppression** : Bouton corbeille avec AlertDialog de confirmation (affiche la date et le type)
- **`refreshAll()`** : Extraction d'une fonction commune pour invalider toutes les queries liées au stock (mouvements, lot_stock, alertes)
- `created_by` n'est pas modifié lors de l'édition (préservation de la piste d'audit)

### 🔍 Recherche avancée — Produits
- **Filtres multiples** : Barre de recherche texte (nom/SKU) avec icône et bouton clear, catégorie (Select), fourchette de prix (min/max), statut stock (rupture/faible/normal)
- **Filtres serveur** : La recherche texte et les filtres catégorie/prix sont appliqués côté serveur via la query Supabase (`.or()`, `.eq()`, `.gte()`, `.lte()`) — la pagination reste fonctionnelle avec les filtres
- **Filtre stock côté client** : Le statut stock (rupture/faible/normal) est calculé côté client via `lot_stock` car il dépend de données dérivées
- **Panneau pliable** : Bouton "Filtres" avec badge compteur de filtres actifs — panneau de filtres avancés qui se déploie/rabat
- **Bouton "Effacer"** : Réinitialise tous les filtres en un clic
- **Nouvelle colonne Stock** : Badge coloré (rouge/orange/vert) indiquant le niveau de stock actuel dans le tableau
- **État vide amélioré** : Message différent selon qu'il y a des filtres actifs ou non, avec bouton pour effacer les filtres

### 🧪 Tests E2E (Playwright)
- **Configuration** : `playwright.config.ts` avec chromium, locale fr-FR, reporter HTML
- **Premier test** : `src/test/e2e/login.spec.ts` — vérifie l'affichage de la page de connexion, la validation des champs vides, et le basculement connexion/inscription
- Playwright installé dans les devDependencies (`@playwright/test`)

### 📈 Couverture de code améliorée (77 tests)
- **csv.test.ts** : 9 tests pour `toCsv()` — BOM UTF-8, échappement des guillemets/virgules, valeurs null/multilignes
- **logger.test.ts** : 8 tests — tous les niveaux (debug → fatal), contexte withContext(), métadonnées JSON, timestamp ISO
- **rate-limiter.test.ts** : 9 tests — allow/block, clients/endpoints indépendants, reset, stats, configs spécifiques (login, stock-movement, sale-create)
- **Correctif logger** : `MIN_LEVEL` passe d'une const évaluée au chargement à une fonction `getMinLevel()` lue dynamiquement → les tests peuvent modifier `process.env.LOG_LEVEL`
- **Correctif rate-limiter** : Client isolé (`"stats-client"`) dans le test de stats pour éviter la contamination du compteur du test login
- **Coverage config** : Étendue à 7 fichiers (format, image, csv, logger, rate-limiter, use-debounce, pagination)

### 🧹 Refactoring
- Suppression de code mort (variable `debouncedGlobalSearch` non utilisée dans route.tsx)

## 2026-08-04
- Ajout du Centre de synchronisation (/synchronisation) : état par module, file d attente, conflits fusionnes, resynchronisation manuelle.
- Ajout du suivi par numeros de serie dans les lots (table serial_numbers, statuts en stock/vendu/retourne/SAV/rebut, export CSV).
- Ajout du module SAV (/sav) : tickets garantie/retour/intervention, interventions avec couts, exports CSV et PDF.
- Ajout du suivi des commandes fournisseurs (/commandes-fournisseurs) : creation, reception partielle generant des entrees de stock, statut et historique.
- Exports CSV et PDF pour les mouvements de stock (filtres date + magasinier) et les sessions d inventaire.
- Nouveau helper src/lib/pdf-table.ts (export PDF tabulaire generique).

## [Non publié] — 2026-08-05
### Ajouté
- **SAV ↔ numéros de série** : table `sav_intervention_serials` (RLS par rôle), sélection multiple des séries concernées lors d'une intervention, issue (traité/réparé/remplacé/retourné/rebut) appliquée automatiquement au statut de la série.
- **Historique de série** : `src/components/serial-history-dialog.tsx` — timeline réception → vente → interventions SAV avec statut courant.
- **Historique produit** : nouvelle page `/historique-produit` — timeline unifiée (achats/lots, ventes, mouvements de stock, comptages d'inventaire, numéros de série), filtres type + dates, KPIs et exports CSV/PDF.
- **Résolution de conflits guidée** : store Dexie `pending_conflicts` (v2), détection champ par champ dans `pullAll()`, `resolvePendingConflict()` et arbitrage visuel local/serveur dans le Centre de synchronisation.

## [2026-10-05] Journal d'activité et audit
- Triggers `audit_<table>` (fonction `log_audit`) sur 25 tables métier : création/modification/suppression avec utilisateur, module, entrepôt, avant/après.
- `src/lib/audit.ts` : `track`/`trackEvent` (logger + `audit_log`), file d'attente hors-ligne `indus-erp:audit-queue`, `flushAuditQueue` au retour réseau.
- Événements métier branchés : connexion (succès/échec/déconnexion), ventes, transferts (création/expédition/réception/annulation), inventaire (ouverture/comptage/clôture), SAV, commandes fournisseurs, synchronisation (manuelle, purge, conflits résolus), ouverture de chaque module.
- Page `/activite` (Propriétaire) : stats par module, pages les plus ouvertes, filtres période/module/utilisateur/entrepôt, détail avant/après, export CSV.
- Correction : `engine.ts pushOutbox` — « garder ma version » n'était pas renvoyée au serveur (update puis insert).
- Correction : `terrain.tsx` — sessions d'inventaire filtrées sur `ouverte`.

## 2026-10-15
- Hors-ligne : la liste des entrepôts est conservée localement et reste affichée sans connexion.
- Hors-ligne : réception fournisseur possible en mode terrain (commandes copiées localement, entrées de stock en file d'attente, statut de commande rejoué au retour du réseau — `src/lib/offline/receipts-offline.ts`).
- 2026-10-15 : correctif contexte entrepôt stable entre rechargements à chaud (écran blanc /dashboard).

## 2026-10-15 — Suivi des erreurs et sauvegardes
- Erreurs du site en ligne enregistrées (table `error_logs`, `src/lib/error-tracking.ts`), purge après 90 jours.
- Sauvegarde complète quotidienne à 01:00 UTC (`run_data_backup`, table `data_backups`), conservée 30 jours, bouton manuel.
- Page `/surveillance` « Erreurs & sauvegardes » réservée au Propriétaire.

## 2026-11-02
- Clients : recherche sur toutes les pages, états de chargement/erreur, historique des achats par client (total, panier moyen).

## 2026-11-03
- Ajout : crédit clients (vente à crédit au POS, plafond par client, page Crédits, paiements partiels, relance WhatsApp).
- Ajout : Assistant intelligent (prévision de rupture, quantités à commander, questions libres) via Lovable AI.
- Ajout : récapitulatif WhatsApp après vente à crédit (liens wa.me).


## Livraison Hôtel — 2026-11-10
Module Hôtel finalisé : accueil applications, chambres/types, planning, réservations, arrivée/départ, consommations, facture PDF et ménage automatique. Attribution du rôle Réceptionniste depuis Utilisateurs. Trois lectures trop ouvertes corrigées. Accessibilité des champs et métadonnées des pages complétées.
