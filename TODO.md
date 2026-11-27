# ✅ TODO — INDUS-ERP

> **Dernière mise à jour** : 2026-11-06

---

## 🚀 Professionnalisation & facilité d'usage (revue 2026-11-06)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| A | Documenter et tester la restauration des sauvegardes (RPO/RTO) | 🟡 | ✅ Doc + scripts (`backup.sh`, `restore.sh`) ; **reste** à exécuter la restauration trimestrielle réelle |
| B | Invitation d'utilisateurs par email (Edge Function + écran `/utilisateurs`) | 🟡 | ⏳ À faire |
| C | Journal d'activité consultable (`audit_logs` + écran dédié) | 🟡 | ✅ Migration appliquée + onglet « Modifications » de `/activite` |
| D | Jeu de données de démonstration (`supabase/seed.sql`) + mode démo | 🟡 | ✅ Script idempotent ; mode démo lecture seule non fait |
| E | E2E métier critiques : vente, inventaire, transfert | 🟡 | ⏳ À faire |
| F | i18n français / lingala / swahili | 🟢 | ⏳ À faire |
| G | Audit d'accessibilité WCAG 2.1 AA (focus, contrastes, cibles tactiles) | 🟢 | ⏳ À faire |
| H | Impressions complémentaires : bon de livraison, planche d'étiquettes QR | 🟢 | 🟡 Planche QR produits déjà présente ; bon de livraison à faire |
| I | Corriger les 3 erreurs TS de `src/test/e2e/_video/record.spec.ts` | 🔵 | ✅ `tsc --noEmit` à zéro |

### Frictions métier traitées le 2026-11-06

| # | Tâche | Statut |
|---|-------|--------|
| J | Double devise (base XOF/CDF + affichage USD/EUR avec taux) | ✅ |
| K | Tickets thermiques 58 / 80 mm | ✅ |
| L | Passerelle WhatsApp (ticket de vente, contact client) | ✅ |
| M | Ergonomie POS : pavé tactile, montant reçu, monnaie rendue | ✅ |

### Mise en service — à faire sur la base réelle (2026-11-06)

| # | Action | Statut |
|---|--------|--------|
| N | Appliquer `20261106090000_audit_logs.sql` (`supabase db push`) | ✅ **Vérifié en base le 2026-11-06** : `audit_logs` présente, colonnes et policy conformes, triggers sur 27 tables (INSERT/UPDATE/DELETE) |
| O | Saisir le taux de change réel et la devise d'affichage dans `/parametres` | ✅ Déclaré fait le 2026-11-06 (réglage navigateur, non vérifiable depuis le dépôt) |
| P | Exécuter une restauration réelle sur une base de test | ✅ Déclaré fait le 2026-11-06 (consigner dump + date dans `LOGBOOK.md`) |

---

## 🔴 Critique

| # | Tâche | Module | Priorité |
|---|-------|--------|----------|
| 1 | ~~Ajouter des tests unitaires~~ ✅ | Global | 🔴 |
| 2 | ~~Vérifier la sécurité RLS sur toutes les tables~~ ✅ | Sécurité | ✅ |

## 🟡 Important

| # | Tâche | Module | Priorité |
|---|-------|--------|----------|
| 5 | ~~Ajouter `npm audit` dans CI/CD~~ ✅ | DevOps | 🟡 |
| 6 | ~~Implémenter Rate Limiting~~ ✅ | Sécurité | 🟡 |
| 7 | ~~Ajouter une journalisation structurée~~ ✅ | Sécurité | 🟡 |
| 8 | ~~Configurer les alertes de sécurité Supabase~~ ✅ | Sécurité | 🟡 |
| 9 | ~~Debounce sur les recherches~~ ✅ | Performance | 🟡 |
| 10 | ~~Memoization des composants de liste~~ ✅ | Performance | 🟡 |
| 11 | ~~Ajouter des tests d'intégration~~ ✅ | Tests | 🟡 |
| 12 | ~~Ajouter des tests E2E~~ ✅ | Tests | 🟡 |
| 13 | ~~Améliorer la couverture de code~~ ✅ | Tests | 🟡 |
| 14 | ~~Ajouter les fonctions d'édition/suppression~~ ✅ | Produits | 🟡 |
| 15 | ~~Ajouter les fonctions d'édition/suppression~~ ✅ | Lots | 🟡 |
| 16 | ~~Ajouter les fonctions d'édition/suppression~~ ✅ | Clients | 🟡 |
| 17 | ~~Ajouter les fonctions d'édition/suppression~~ ✅ | Stock | 🟡 |
| 18 | ~~Alertes stock (in-app + email)~~ ✅ | Stock | 🟡 |
| 19 | ~~Améliorer le formulaire de vente (POS)~~ ✅ | Ventes | 🟡 |
| 20 | ~~Génération QR code batch~~ ✅ | Produits | 🟡 |

## 🟢 Normal

| # | Tâche | Module | Priorité |
|---|-------|--------|----------|
| 21 | ~~Ajouter la recherche avancée (filtres multiples)~~ ✅ | Produits | 🟢 |
| 22 | ~~Ajouter l'export CSV des listes~~ ✅ | Global | 🟢 |
| 23 | ~~Améliorer les notifications toast~~ ✅ | Global | 🟢 |
| 24 | ~~Ajouter des animations UI~~ ✅ | Global | 🟢 |
| 25 | ~~Ajouter les statistiques sur le dashboard~~ ✅ | Dashboard | 🟢 |
| 26 | ~~Ajouter multi-emplacement stock~~ ✅ | Stock | 🟢 |
| 27 | ~~Ajouter les transferts entre emplacements~~ ✅ | Stock | 🟢 |
| 28 | ~~Ajouter les retours fournisseurs~~ ✅ | Achats | 🟢 |
| 29 | ~~Ajouter les avoirs~~ ✅ | Ventes | 🟢 |
| 30 | ~~Ajouter l'envoi de facture par email~~ ✅ | Ventes | 🟢 |
| 31 | ~~Ajouter le mode hors-ligne~~ ✅ | Global | 🟢 |

## 🔵 Faible Priorité

| # | Tâche | Module | Priorité |
|---|-------|--------|----------|
| 33 | ~~Configurer Dependabot (alertes sécurité automatiques)~~ ✅ | DevOps | 🟡 |
| 34 | ~~Analyse de bundle (vite-bundle-visualizer)~~ ✅ | Performance | 🔵 |
| 35 | ~~Ajout des notifications en temps réel (Supabase Realtime)~~ ✅ | Global | 🔵 |
| 36 | ~~Déploiement production (vercel.json + .env.example)~~ ✅ | DevOps | 🔵 |
| 37 | Tests de charge (k6/Artillery) | Performance | 🔵 |
| 41 | ~~Pagination serveur SAV + commandes fournisseurs + transferts, debounce produits, memoization lignes, code splitting recharts/jspdf~~ ✅ | Performance | 🔵 |
| 38 | Documentation API complète | Documentation | 🔵 |
| 39 | Thèmes customs supplémentaires | UI | 🔵 |
| 40 | Internationalisation (i18n) | Global | 🔵 |

## 🔐 Authentification (2026-09-15)

- [x] 🟡 Test d'intégration produits corrigé : setup auto-suffisant (ping /auth/v1/health, création user de test, support VITE_SUPABASE_PUBLISHABLE_KEY), verdict strict avec stack / skip silencieux sans stack — 77/77
- [x] 🔴 Flux « Mot de passe oublié » complet : lien sur /auth, formulaire d'envoi d'email, route /reset-password (nouveau mot de passe), email capturé par Inbucket/Mailpit en local
- [x] 🔴 Réinitialisation du mot de passe du compte admin (perdu) → voir `compte.md`
- [x] 🟡 Confirmation de mot de passe + jauge de robustesse à l'inscription, bouton œil afficher/masquer, écran « confirmez votre email »
- [x] 🟡 `supabase/config.toml` : `site_url` aligné sur http://127.0.0.1:8080 (les liens email pointaient vers le port 3000), analytics désactivé (bloquait le démarrage de la stack sur Windows)
- [x] 🔵 E2E `auth-reset-flow.spec.ts` : cycle complet vérifié (demande → email Mailpit → clic réel sur le lien /verify → nouveau mot de passe → reconnexion), mot de passe admin restauré après test
- [x] 🟡 Politique de mot de passe renforcée (8+, majuscule, chiffre) sur inscription et réinitialisation — Zod partagé + garde-fou serveur GoTrue ; jamais sur la connexion ; E2E faible rejeté
- [x] 🔵 E2E : scénario d'inscription avec clic sur le lien de confirmation (même mécanique que la récupération) — `auth-signup-flow.spec.ts` 4/4, idempotent (purge beforeAll) ; confirmations email activées en local ([auth.email] enable_confirmations)

## 🔌 Hors-ligne (2026-09-04)

- [ ] 🔴 Généraliser la mise en file d'attente des écritures (`insertOrQueue`) aux modules Ventes, Stock, Lots, Inventaire et Transferts
- [ ] 🟡 Ajouter `warehouses` aux tables synchronisées en local
- [ ] 🟡 Vérifier le rechargement hors-ligne sur le site publié (Service Worker)
- [ ] 🟡 Rendre la réception fournisseur rejouable hors-ligne (opération serveur atomique)

## Ajouts 2026-10-05
- [ ] P1 Restaurer le nom du produit PRD-59OF1D (attente utilisateur).
- [ ] P3 Pagination serveur de la page Activité au-delà de 1000 lignes.
- [ ] P3 Purge/archivage automatique du journal (> 12 mois).


## Livraison Hôtel — 2026-11-10
Hôtel livré en ligne. À traiter séparément : permissions de téléchargement photos/certificats ; invitation de comptes par email ; hôtel hors-ligne si demandé ; validation DGI externe. Ces points ne bloquent pas le séjour en ligne testé.
