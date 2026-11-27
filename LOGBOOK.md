# 📓 Journal de Bord — INDUS-ERP

> **Dernière mise à jour** : 2026-11-06

---

## [Session 15] — 2026-11-06

**Objectif** : Fusionner les deux écrans d'audit en un seul écran à onglets.

**Travail effectué** :

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| — | `/activite` devient « Journal d'activité » avec onglets « Actions métier » (`audit_log`) et « Modifications » (`audit_logs`) | `src/routes/_authenticated/activite.tsx` | ✅ |
| — | Suppression de la route `/journal-activite` et de son entrée de menu | `src/routes/_authenticated/journal-activite.tsx`, `src/lib/modules.ts` | ✅ |
| — | Arbre de routes régénéré | `src/routeTree.gen.ts` | ✅ |
| — | Documentation alignée sur la route unique | `CHANGELOG.md`, `DEPLOYMENT.md`, `FEATURES.md`, `MIGRATIONS.md`, `OBSERVATIONS.md`, `TODO.md` | ✅ |

**Validation** : `bun run build` OK, `tsc --noEmit` 0 erreur, ESLint propre sur
`activite.tsx`.

---

## [Session 14] — 2026-11-06

**Objectif** : Vérifier en base l'application de la migration du journal d'activité.

**Preuves fournies par l'utilisateur** (éditeur SQL Lovable, 2026-11-06) :

| Contrôle | Résultat |
|---|---|
| `select to_regclass('public.audit_logs')` | `audit_logs` |
| `information_schema.triggers` (nom `audit%`) | **27 tables**, 3 lignes chacune (INSERT/UPDATE/DELETE) |
| Colonnes `audit_logs` | `id`, `table_name`, `record_id`, `action`, `actor_id`, `changes`, `created_at` — **identiques à l'écran** |
| Policy | `audit read owners`, `SELECT`, rôle `authenticated` — conforme |
| Fonctions des triggers | `audit_row_change()` + `log_audit('achats')` (trigger métier des achats) |
| `pg_policies` requête `polname` | échec 42703 — colonne réelle : `policyname` (requête corrigée) |

**Constat** : migration appliquée et fonctionnelle, schéma compatible avec
`/activite` (onglet « Modifications »). Écart comblé côté dépôt par
`20261106130000_audit_logs_full_coverage.sql`, qui ajoute les triggers manquants
sans toucher aux triggers existants (dont `log_audit('achats')`).

**Déclaré par l'utilisateur le 2026-11-06** : taux de change saisi dans `/parametres`
et restauration de sauvegarde exécutée sur une base de test. Preuves (dump, date,
résultat) à compléter dans le tableau « Journal des restaurations » de
`DEPLOYMENT.md`.

---

## [Session 13] — 2026-11-06

**Objectif** : Vérifier la mise en service (migration d'audit, taux de change,
restauration) et aligner la documentation sur le dépôt réel.

**Constat** : les trois actions **ne sont pas réalisées** et ne peuvent pas l'être
ici : `supabase` et `pg_dump`/`pg_restore` sont absents de l'environnement, et le
taux de change vit dans le `localStorage` du navigateur. Aucune n'a été simulée.

**Travail effectué** :

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| — | Liste complète des 21 migrations + procédure `db push` + note `audit_log` vs `audit_logs` | `MIGRATIONS.md` | ✅ |
| — | Documentation de la table `audit_logs`, de son trigger et de sa RLS | `DATABASE.md` | ✅ |
| — | Checklist de mise en service (3 actions, commandes, contrôles) | `DEPLOYMENT.md` | ✅ |
| — | Suivi explicite des 3 actions non faites | `TODO.md` | ✅ |
| — | Score et volumétrie de tests actualisés | `PROJECT_HEALTH.md` | ✅ |

**Validation** : `tsc --noEmit` 0 erreur ; `bun run build` OK ; 100/102 tests
Vitest (2 échecs d'intégration faute de base Supabase).

---

## [Session 12] — 2026-11-06

**Objectif** : Lever les frictions métier du terrain (double devise, ticket thermique,
WhatsApp, ergonomie caisse) et traiter le backlog de professionnalisation
(sauvegardes, journal d'activité, seed, dette TS).

**Travail effectué** :

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| — | Double devise : stockage en base, conversion à l'affichage, paramètres | `src/lib/currency.ts`, `app-settings.ts`, `components/currency-toggle.tsx`, `routes/_authenticated/route.tsx`, `parametres.tsx`, `format.ts` | ✅ |
| — | Ticket thermique 58/80 mm (impression isolée, auto-impression) | `src/lib/receipt.ts` | ✅ |
| — | WhatsApp : partage de ticket, contact client, normalisation des numéros | `src/lib/whatsapp.ts`, `ventes.tsx`, `clients.tsx` | ✅ |
| — | POS : pavé tactile, montant reçu, monnaie rendue, panneau dernière vente | `src/routes/_authenticated/ventes.tsx` | ✅ |
| — | Journal d'activité (table, triggers, RLS, écran, menu) — écran fusionné dans `/activite` en Session 15 | `supabase/migrations/20261106090000_audit_logs.sql`, `lib/modules.ts` | ✅ |
| — | Jeu de démonstration idempotent | `supabase/seed.sql` | ✅ |
| — | Sauvegarde/restauration + RPO/RTO | `scripts/backup.sh`, `scripts/restore.sh`, `DEPLOYMENT.md` | ✅ |
| — | Dette TS à zéro | `src/test/e2e/_video/record.spec.ts` | ✅ |

**Validation** : `bun run build` OK (route générée), `tsc --noEmit` **0 erreur**,
`vitest run` : 100 tests unitaires passent ; 2 tests d'intégration en échec faute
de base Supabase accessible dans l'environnement. ESLint : seules les alertes
`any` déjà présentes dans le style du dépôt.

---

## [Session 11] — 2026-11-06

**Objectif** : Améliorer la prise en main et le professionnalisme perçu sans toucher au
schéma de données ni aux flux métier existants.

**Travail effectué** :

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| — | Centre d'aide intégré (aide contextuelle, démarrage par rôle, raccourcis, FAQ) | `src/components/help-center.tsx` | ✅ |
| — | Bouton d'aide dans l'en-tête + raccourci `?` + point d'alerte première ouverture | `src/routes/_authenticated/route.tsx` | ✅ |
| — | Carte « Premiers pas » sur dashboard vide (4 étapes, masquable) | `src/components/getting-started-card.tsx`, `dashboard.tsx` | ✅ |
| — | Recommandations priorisées (sauvegardes, invitations, audit, seed, E2E, i18n, a11y) | `OBSERVATIONS.md` | ✅ |

**Validation** : `tsc --noEmit` sans nouvelle erreur (3 erreurs pré-existantes
`record.spec.ts`), ESLint et Prettier propres sur les fichiers créés.

---

## [Session 10] — 2026-09-15

**Objectif** : Remettre l'authentification au niveau production (mot de passe oublié,
confirmation d'email, politique renforcée) et fiabiliser les tests (intégration + E2E).

**Travail effectué** :

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| — | Identifiants admin récupérés/réinitialisés → `compte.md` | `compte.md` | ✅ |
| — | Flux « mot de passe oublié » complet (UI + route) | `src/routes/auth.tsx`, `src/routes/reset-password.tsx` | ✅ |
| — | Inscription : confirmation mdp, jauge, écran « confirmez votre email » | `src/routes/auth.tsx` | ✅ |
| — | Config locale production-like (site_url, allow-list /**, confirmations, politique mdp) | `supabase/config.toml` | ✅ |
| — | Stack locale réparée (analytics off, données restaurées d'un volume à l'autre) | Docker volumes | ✅ |
| — | Test intégration produits : setup auto-suffisant (ping health, création user) | `src/test/integration/setup.ts` | ✅ |
| — | E2E auth : 13 tests (flow 5, reset 4, signup 4) + helpers Mailpit partagés | `src/test/e2e/` | ✅ |
| — | Politique de mot de passe 8+/majuscule/chiffre (Zod + serveur) | `src/lib/password-policy.ts` | ✅ |
| — | Bouton « Tester » retiré des notifications | `src/components/notifications-bell.tsx` | ✅ |
| — | Playwright séquentiel (course Mailpit) | `playwright.config.ts` | ✅ |

**Blocages résolus** : section `[auth.email]` (et non `[auth]`) pour les confirmations ;
clés serveur `minimum_password_length`/`password_requirements` sous `[auth]` racine ;
allow-list GoTrue à wildcards obligatoire pour les redirections avec chemin.

**Validation** : 90/90 unitaires+intégration, 13/13 E2E auth, typecheck propre
(3 erreurs pré-existantes `record.spec.ts`), cycle email→clic→reset vérifié de bout
en bout via Mailpit.

---

## [Session 9] — 2026-07-22

**Objectif** : Livrer le chantier UX + Multi-entrepôts + Mode terrain mobile.

**Travail effectué** :

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| — | Migration multi-entrepôts | `warehouses`, `user_favorites`, colonnes `warehouse_id` | ✅ |
| — | Context entrepôt | `src/hooks/use-warehouse.tsx` | ✅ |
| — | Filtre générique | `src/lib/warehouse-filter.ts` | ✅ |
| — | Sélecteur d'entrepôt | `src/components/warehouse-selector.tsx` | ✅ |
| — | Palette Cmd+K | `src/components/global-command-palette.tsx` | ✅ |
| — | Layout header | `src/routes/_authenticated/route.tsx` | ✅ |
| — | Page Emplacements | `src/routes/_authenticated/emplacements.tsx` | ✅ |
| — | Filtrage Stock | `src/routes/_authenticated/stock.tsx` | ✅ |
| — | Filtrage Lots | `src/routes/_authenticated/lots.tsx` | ✅ |
| — | Filtrage Inventaire | `src/routes/_authenticated/inventaire.tsx` | ✅ |
| — | Filtrage Dashboard | `src/routes/_authenticated/dashboard.tsx` | ✅ |
| — | Mode terrain | `src/routes/_authenticated/terrain.tsx` | ✅ |

**Build** : ✅ TypeScript 0 erreur, production build OK.

---

## [Session 8] — 2026-07-22

**Objectif** : Implémenter 3 tâches de la roadmap : Notifications temps réel (Supabase Realtime), Analyse de bundle, Préparation déploiement production.

**Travail effectué** :

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| — | Hook Realtime + LiveBadge | `src/hooks/use-realtime.tsx` (créé) | ✅ |
| — | Dashboard temps réel | `dashboard.tsx` (souscriptions sales + stock_movements) | ✅ |
| — | Stock temps réel | `stock.tsx` (souscription stock_movements) | ✅ |
| — | Analyse bundle + script | `package.json` (analyze:bundle), rapport généré | ✅ |
| — | Déploiement Vercel | `vercel.json` (créé) | ✅ |
| — | .env.example enrichi | Realtime, Resend, LOG_LEVEL, secrets Vercel | ✅ |
| — | Bundle analysis | Rapport complet (jspdf 399 kB, dashboard 408 kB) | ✅ |

**Fichiers créés** :
- `src/hooks/use-realtime.tsx` — Hook Realtime + composant LiveBadge
- `vercel.json` — Configuration déploiement Vercel (headers sécurité, cache, secrets)

**Fichiers modifiés** :
- `src/routes/_authenticated/dashboard.tsx` — Ajout useRealtimeSubscription + LiveBadge
- `src/routes/_authenticated/stock.tsx` — Ajout useRealtimeSubscription + LiveBadge
- `package.json` — Script analyze:bundle
- `.env.example` — Nouvelles sections documentées

**Build** : ✅ TypeScript 0 erreurs · ✅ 77 tests passent · ✅ Bundle analysis OK

**Temps passé** : ~45min

---

## [Session 7] — 2026-07-22

**Objectif** : Finaliser les 9 tâches restantes du TODO (23-31) : toasts, animations, dashboard stats, multi-emplacement, transferts, retours fournisseurs, avoirs, email facture, PWA.

**Travail effectué** :

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| 23 | Notifications toast | `src/components/ui/sonner.tsx` | ✅ |
| 24 | Animations UI | `src/styles.css` (5 keyframes) | ✅ |
| 25 | Stats dashboard | `dashboard.tsx` (Top 5 produits) | ✅ |
| 26 | Multi-emplacement stock | Migration BDD + `emplacements.tsx` + `stock.tsx` | ✅ |
| 27 | Transferts | `emplacements.tsx` (dialogue transfert) | ✅ |
| 28 | Retours fournisseurs | Migration BDD + `retours-fournisseurs.tsx` | ✅ |
| 29 | Avoirs | Migration BDD + `avoirs.tsx` | ✅ |
| 30 | Email facture | `ventes.tsx` + `avoirs.tsx` | ✅ |
| 31 | Mode hors-ligne | `sw.js` + `manifest.json` + `__root.tsx` | ✅ |

**Fichiers créés** :
- `supabase/migrations/20260722090000_features_stock_locations_transfers_returns_credits.sql` — Migration BDD
- `src/routes/_authenticated/emplacements.tsx` — Gestion des emplacements + transferts
- `src/routes/_authenticated/retours-fournisseurs.tsx` — Retours fournisseurs
- `src/routes/_authenticated/avoirs.tsx` — Avoirs / credits
- `public/sw.js` — Service Worker PWA
- `public/manifest.json` — Manifest PWA
- `public/favicon.svg` — Favicon SVG
- `public/icon.svg` — Icône PWA SVG

**Fichiers modifiés** :
- `src/routes/_authenticated/stock.tsx` — Filtre emplacement + colonne + formulaire
- `src/routes/_authenticated/dashboard.tsx` — Top 5 produits
- `src/routes/_authenticated/ventes.tsx` — Envoi email facture
- `src/styles.css` — Animations CSS
- `src/components/ui/sonner.tsx` — Toaster amélioré
- `src/lib/modules.ts` — Nouveaux items sidebar
- `src/routeTree.gen.ts` — Nouvelles routes
- `src/routes/__root.tsx` — Manifest + SW + favicon
- `public/manifest.json` — Icônes SVG

**Build** : ✅ TypeScript 0 erreurs · ✅ 77 tests passent

**Temps passé** : ~3h

---

## [Session 1] — 2026-07-21

**Objectif** : Audit du projet et création de l'infrastructure documentaire complète.

**Travail effectué** :
1. Lecture de tous les fichiers `.md` existants
2. Analyse du code source (architecture, routes, composants)
3. Création de la documentation complète du projet (30+ fichiers)

**Fichiers créés** :
- `README.md` — Présentation générale
- `AGENTS.md` — Règles pour les agents AI
- `CONTEXT.md` — Contexte et mémoire du projet
- `ARCHITECTURE.md` — Architecture complète
- `DATABASE.md` — Documentation de la base de données
- `SECURITY.md` — Documentation sécurité
- `CODE_STYLE.md` — Normes de codage
- `PERFORMANCE.md` — Optimisations de performance
- `CHANGELOG.md` — Historique des modifications
- `ROADMAP.md` — Roadmap
- `TODO.md` — Tâches restantes
- `BUGS.md` — Bugs connus
- `ERRORS_HISTORY.md` — Historique des erreurs
- `AUDIT.md` — Rapport d'audit
- `FEATURES.md` — Fonctionnalités
- `VERSION_HISTORY.md` — Historique des versions
- `RELEASE_NOTES.md` — Notes de version
- `MIGRATIONS.md` — Migrations SQL
- `OBSERVATIONS.md` — Observations et améliorations
- `PROJECT_HEALTH.md` — Santé globale du projet
- `FUTURE_IDEAS.md` — Idées futures
- `IDEAS_BACKLOG.md` — Backlog d'idées
- `KNOWN_LIMITATIONS.md` — Limites connues
- `MODULES.md` — Description des modules
- `DEPENDENCIES.md` — Dépendances
- `DECISIONS.md` — Décisions techniques
- `REFACTORING.md` — Historique des refactorings
- `DEPLOYMENT.md` — Documentation de déploiement
- `TESTS.md` — Tests
- `LOGBOOK.md` — Ce fichier

**Blocages** : Aucun.

**Temps passé** : ~1h (analyse + création documentation).

---

## [Session 6] — 2026-07-22

**Objectif** : Implémenter 6 tâches prioritaires du TODO (Rate Limiting, Logger, Alertes Sécurité, Tests Intégration, POS, QR codes).

**Travail effectué** :
| Tâche | Fichiers | Statut |
|-------|----------|--------|
| Rate Limiting | `src/lib/rate-limiter.ts` | ✅ |
| Journalisation structurée | `src/lib/logger.ts`, `src/server.ts` | ✅ |
| Alertes sécurité Supabase | `SECURITY.md` | ✅ |
| Tests d'intégration | `src/test/integration/setup.ts`, `products.test.ts` | ✅ |
| Amélioration POS (remises, raccourcis, tri) | `ventes.tsx` | ✅ |
| QR codes batch (dialogue grille) | `produits.tsx` | ✅ |

**Fichiers créés** :
- `src/lib/rate-limiter.ts` — Rate limiter configurable
- `src/lib/logger.ts` — Logger structuré
- `src/test/integration/setup.ts` — Infrastructure tests intégration
- `src/test/integration/products.test.ts` — Premier test intégration

**Fichiers modifiés** :
- `src/server.ts` — Intégration logger
- `src/routes/_authenticated/ventes.tsx` — Remises, raccourcis, tri
- `src/routes/_authenticated/produits.tsx` — QR codes batch
- `SECURITY.md` — Alertes sécurité Supabase

**Build** : ✅ TypeScript OK · ✅ 51 tests passent

**Blocages** : QR code route inexistante (corrigé par dialogue inline).

**Temps passé** : ~2h

---

## [Session 2] — 2026-07-21

**Objectif** : Implémenter les corrections prioritaires du TODO.md.

**Travail effectué** :
1. Configuration du **QueryClient** avec valeurs optimales (staleTime: 30s, gcTime: 5min, retry: 1, refetchOnWindowFocus: false)
2. Création du hook **`useDebounce`** générique
3. Intégration du debounce dans la recherche POS (ventes.tsx) et la barre de recherche globale (route.tsx)
4. Création du composant **`Pagination`** réutilisable avec sélecteur de taille de page
5. Pagination implémentée sur Produits (20/page), Lots (20/page), Mouvements de stock (30/page)
6. Création de l'utilitaire **`compressImage`** pour la compression WebP côté client
7. Intégration de la compression dans l'upload des photos produits
8. Mise à jour de la documentation (CHANGELOG, TODO, PROJECT_HEALTH, OBSERVATIONS, PERFORMANCE)

**Fichiers créés** :
- `src/hooks/use-debounce.ts` — Hook de debounce générique
- `src/components/ui/pagination.tsx` — Composant de pagination réutilisable
- `src/lib/image.ts` — Utilitaire de compression d'image WebP

**Fichiers modifiés** :
- `src/router.tsx` — Configuration QueryClient
- `src/routes/_authenticated/produits.tsx` — Pagination + compression image
- `src/routes/_authenticated/lots.tsx` — Pagination
- `src/routes/_authenticated/stock.tsx` — Pagination
- `src/routes/_authenticated/ventes.tsx` — Debounce recherche
- `src/routes/_authenticated/route.tsx` — Debounce recherche globale

**Build** : ✅ TypeScript compilation OK

**Blocages** : Erreur JSX (balise `</Table>` en double) — corrigée immédiatement.

**Temps passé** : ~30min (implémentation + corrections + documentation).

---

## [Session 3] — 2026-07-21

**Objectif** : Mise en place CI/CD + monitoring Sentry.

**Travail effectué** :
1. Création du pipeline **GitHub Actions** (.github/workflows/ci.yml) avec jobs quality, build, deploy
2. Ajout des scripts `typecheck` + `audit` dans package.json
3. Installation de `@sentry/react@10.67.0` et `@sentry/node@10.67.0`
4. Création du module `src/lib/sentry.ts` pour l'initialisation client/serveur
5. Intégration Sentry dans `__root.tsx` (client) et `server.ts` (serveur) avec capture d'erreurs
6. Création de `.env.example` documentant toutes les variables nécessaires
7. Mise à jour de la documentation (CHANGELOG, TODO, PROJECT_HEALTH)

**Fichiers créés** :
- `.github/workflows/ci.yml` — Pipeline CI/CD complet
- `src/lib/sentry.ts` — Module Sentry (client + serveur)
- `.env.example` — Template d'environnement

**Fichiers modifiés** :
- `package.json` — Dépendances + scripts
- `src/routes/__root.tsx` — Init Sentry client + capture erreurs
- `src/server.ts` — Init Sentry serveur + capture erreurs

**Build** : ✅ TypeScript compilation OK
**Packages** : @sentry/react, @sentry/node installés

**Temps passé** : ~25min (recherche + implémentation + corrections).

## 2026-08-08
Objectif : favoris par rôle, mode kiosque, refonte emplacements, alertes intelligentes, transferts inter-entrepôts.
Travail : migration (favoris étendus, `stock_transfers`, `stock_transfer_items`, `generate_transfer_number`), 6 nouveaux fichiers front, intégration layout + dashboard. TypeScript : 0 erreur.

## 2026-09-04
Objectif : garantir le fonctionnement du mode terrain sans connexion (scans, filtres entrepôt, validations, reprise à la reconnexion).
Travail : audit du mode terrain et des fondations offline ; découverte d'un bug bloquant (`counted_by` inexistant sur `inventory_counts`) ; création de `src/lib/offline/terrain-offline.ts` (repli cache Dexie + outbox) ; refonte des lectures/écritures de `/terrain` ; réception fournisseur désactivée hors-ligne avec explication.
Vérification : TypeScript 0 erreur ; test Playwright — page terrain utilisable hors-ligne, entrée de stock mise en file puis poussée en base à la reconnexion (ligne de test supprimée ensuite).
Blocages : le Service Worker ne peut pas être validé en développement (modules Vite non figés) ; le rechargement complet hors-ligne doit être vérifié sur le site publié.

## 2026-10-05
- Objectif : journaliser toutes les actions métier et créer la page Activité.
- Fait : migration audit, service `audit.ts`, branchement 8 modules, page `/activite`, tests (page sans erreur, trigger produit vérifié).
- Blocage : nom d'origine du produit PRD-59OF1D inconnu (actuellement « Produit à renommer »).


## Livraison Hôtel — 2026-11-10
Essai authentifié : chambre QA, réservation deux nuits à 50, acompte 30, consommation 10, total 110 et solde 80, PDF téléchargé, départ et ménage ; chambre relue Libre. Aucune erreur JavaScript dans le parcours.
