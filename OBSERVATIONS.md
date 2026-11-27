# 👁 Observations — INDUS-ERP

> **Dernière mise à jour** : 2026-11-06

---

## 🎓 Prise en main & professionnalisation — 2026-11-06

| # | Observation | Priorité | Solution proposée | Ajouté le |
|---|-------------|----------|-------------------|-----------|
| 1 | Aucun guidage à la première connexion : un nouvel utilisateur arrive sur des écrans vides sans savoir par où commencer | ✅ Résolu | Centre d'aide contextuel + parcours par rôle + carte « Premiers pas » sur dashboard vide | 2026-11-06 |
| 2 | Aucune documentation utilisateur accessible dans l'app (les `.md` sont pour les développeurs) | ✅ Résolu | Onglets « Cet écran », « Démarrage », « Raccourcis », « FAQ » dans `help-center.tsx` | 2026-11-06 |
| 3 | Sauvegarde/restauration non documentée ni testée alors que l'ERP porte la vérité du stock | ✅ Résolu | `scripts/backup.sh` + `restore.sh`, RPO 15 min / RTO 2 h et procédure de test trimestriel dans `DEPLOYMENT.md` ; **reste à exécuter la restauration réelle** | 2026-11-06 |
| 4 | Création des comptes utilisateurs manuelle : pas d'invitation par email, risque d'erreur et de doublon | 🟡 | Edge Function `invite-user` (service_role serveur) + écran d'invitation dans `/utilisateurs` | 2026-11-06 |
| 5 | Pas de journal d'activité consultable : on sait « quoi » (mouvements) mais pas « qui a changé quoi » sur les référentiels | ✅ Résolu | Table `audit_logs` + triggers + onglet « Modifications » de `/activite` (filtres, détail, CSV) | 2026-11-06 |
| 6 | Aucun jeu de données de démonstration : difficile de montrer la valeur de l'app ou de former sans polluer le réel | ✅ Résolu | `supabase/seed.sql` idempotent (produits `DEMO-*`, lots, clients, ventes) ; mode démo lecture seule non fait | 2026-11-06 |
| 7 | Couverture E2E métier incomplète (auth couverte, pas vente/inventaire/transfert) | 🟡 | 3 scénarios Playwright critiques avec données de test dédiées | 2026-11-06 |
| 8 | Interface uniquement en français, alors que le terrain peut être lingala/swahili | 🟢 | i18n (`react-i18next`) + extraction des chaînes, locales fr/ln/sw | 2026-11-06 |
| 9 | Accessibilité non auditée (focus, contrastes, cibles tactiles, lecteurs d'écran) | 🟢 | Audit WCAG 2.1 AA, corrections focus-visible + labels ARIA manquants | 2026-11-06 |
| 10 | Impression limitée à la facture : ni bon de livraison, ni planche d'étiquettes QR | 🟢 | Templates PDF (bon de livraison, planche d'étiquettes A4) réutilisant `pdf-table.ts` | 2026-11-06 |
| 11 | 3 erreurs TypeScript pré-existantes dans `src/test/e2e/_video/record.spec.ts` | ✅ Résolu | Import `fs` remonté, `Page`/`string` typés — `tsc --noEmit` à zéro | 2026-11-06 |
| 12 | Monnaie unique rigide (XOF) alors que le terrain vit en double devise (USD / CDF) | ✅ Résolu | Stockage en devise de base + taux configurable + bascule d'affichage dans l'en-tête | 2026-11-06 |
| 13 | Facture A4 systématique au comptoir, trop lente pour un commerce | ✅ Résolu | Ticket thermique 58/80 mm imprimé en une action (auto-impression optionnelle) | 2026-11-06 |
| 14 | Aucun canal WhatsApp alors que les PME y gèrent commandes et relances | ✅ Résolu | Partage du ticket et contact client via `wa.me` (indicatif configurable) | 2026-11-06 |
| 15 | Caisse peu adaptée au tactile : pas de pavé numérique ni de monnaie rendue | ✅ Résolu | Pavé tactile, boutons de coupure, montant reçu + monnaie rendue en devise d'affichage | 2026-11-06 |

---

## 🔴 Critiques

| # | Observation | Priorité | Solution proposée | Ajouté le |
|---|-------------|----------|-------------------|-----------|
| 1 | Aucun test unitaire | 🔴 | Ajouter Vitest + tests composants critiques | 2026-07-21 |
| 2 | ~~Pas de pagination sur les listes~~ | ✅ | Pagination implémentée (produits, lots, stock) | 2026-07-21 |
| 3 | ~~Images non optimisées~~ | ✅ | Compression WebP intégrée dans upload produits | 2026-07-21 |
| 4 | **RLS vulnérables** (stock_movements, sales, inventaire) | 🔴 | ✅ **Corrigé** — Vérification de rôle ajoutée | 2026-07-21 |
| 5 | **`.env` pas dans `.gitignore`** | 🔴 | ✅ **Corrigé** — `.env` ajouté | 2026-07-21 |

## 🟡 Importantes

| # | Observation | Priorité | Solution proposée | Ajouté le |
|---|-------------|----------|-------------------|-----------|
| 4 | Pas de CI/CD | 🟡 | GitHub Actions pour build + lint + test | 2026-07-21 |
| 5 | Pas de monitoring | 🟡 | Ajouter Sentry ou alternative | 2026-07-21 |
| 6 | Logging console.log uniquement | 🟡 | Logger structuré (winston/pino) | 2026-07-21 |
| 7 | ~~Pas de staleTime configuré sur QueryClient~~ | ✅ | Configuré (staleTime: 30s global, gcTime 7j, + staleTime 5min listes de référence — 2026-09-15) | 2026-07-21 |
| 8 | ~~Components non memoïsés~~ | ✅ | React.memo sur toutes les lignes de liste (Client/Supplier/Category/Expense/Achat/Order/Ticket/Transfer) + useMemo calculs — finalisé 2026-09-15 | 2026-07-21 |

## 🟢 Normales

| # | Observation | Priorité | Solution proposée | Ajouté le |
|---|-------------|----------|-------------------|-----------|
| 9 | ~~Recherche sans debounce~~ | ✅ | Hook useDebounce intégré (POS, palette, produits serveur 300ms + 6 listes client 200ms — généralisé 2026-09-15) | 2026-07-21 |
| 10 | Pas d'édition/suppression pour produits | 🟢 | Ajouter dialogues édition | 2026-07-21 |
| 11 | Pas d'édition/suppression pour lots | 🟢 | Ajouter dialogues édition | 2026-07-21 |
| 12 | Pas d'export CSV | 🟢 | Utilitaire d'export | 2026-07-21 |
| 13 | Pas d'animations UI | 🟢 | Ajouter transitions Tailwind | 2026-07-21 |

## 🔵 Faibles

| # | Observation | Priorité | Solution proposée | Ajouté le |
|---|-------------|----------|-------------------|-----------|
| 14 | i18n non implémenté | 🔵 | react-i18next | 2026-07-21 |
| 15 | Pas de PWA | 🔵 | Service worker + manifest | 2026-07-21 |
| 16 | Pas de tests de charge | 🔵 | k6/Artillery | 2026-07-21 |

## 🔐 Auth — 2026-09-15

| # | Observation | Priorité | Solution proposée | Ajouté le |
|---|-------------|----------|-------------------|-----------|
| 17 | Politique mot de passe sans exigence de symbole (volontaire, friction PME) | 🔵 | Réévaluer : 12+ caractères ou symboles si retours terrain | 2026-09-15 |
| 18 | Le rate limiter (`src/lib/rate-limiter.ts`, configs login/signup) n'est pas branché sur les formulaires `/auth` | 🟡 | Appeler `rateLimiter.check("login", …)` avant `signInWithPassword` | 2026-09-15 |
| 19 | Pas de vérification de mot de passe compromis (HaveIBeenPwned) | 🔵 | Activer le password checker Supabase ou validation côté client | 2026-09-15 |
| 20 | 3 erreurs TS pré-existantes dans `src/test/e2e/_video/record.spec.ts` | 🔵 | Corriger les imports/types ou exclure du tsconfig | 2026-09-15 |

## 🔌 Hors-ligne — 2026-09-04

| # | Observation | Priorité | Solution proposée | Ajouté le |
|---|-------------|----------|-------------------|-----------|
| 1 | Les écrans autres que `/terrain` (ventes, stock, lots) écrivent encore directement à la Data API : hors-ligne l'enregistrement échoue au lieu d'être mis en file | 🔴 | Généraliser `insertOrQueue` / `withOfflineFallback` module par module | 2026-09-04 |
| 2 | La table `warehouses` n'est pas dans `SYNC_TABLES` : le sélecteur d'entrepôt dépend du cache TanStack Query persisté | 🟡 | Ajouter `warehouses` au miroir Dexie | 2026-09-04 |
| 3 | Le Service Worker ne peut pas être testé en développement | 🟡 | Ajouter une vérification post-publication dans TESTS.md | 2026-09-04 |


## Livraison Hôtel — 2026-11-10
Corrigé P1 : écritures de séjour/transitions insuffisamment contrôlées ; fermeture prématurée du départ ; catalogue minibar exposait les achats au Réceptionniste. Restent P2 : téléchargements photos/certificats accessibles à tout compte connecté, hors périmètre de cette livraison.
