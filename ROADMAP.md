# 🗺 Roadmap — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## ✅ Terminé

### Authentification complète (2026-09-15)
- [x] Mot de passe oublié (demande email → lien `/auth/v1/verify?type=recovery` →
  `/reset-password`)
- [x] Confirmation d'email à l'inscription (activée en local, production-like)
- [x] Politique de mot de passe 8+ / majuscule / chiffre (Zod + GoTrue)
- [x] E2E auth : 13 scénarios (flow, reset avec clic réel email, signup avec confirmation)

---

### Phase 4 : Multi-entrepôts & UX (Juillet 2026)
- [x] Gestion multi-entrepôts (`warehouses`)
- [x] Filtrage automatique des listes par entrepôt actif
- [x] Emplacements hiérarchiques (zone/allée/rack/baie/niveau)
- [x] Transferts entre emplacements
- [x] Mode terrain mobile (`/terrain`)
- [x] Palette de commande globale Cmd+K
- [x] Favoris utilisateur (table `user_favorites`)



### Phase 1 : Fondations (Juillet 2026)
- [x] Création du projet TanStack Start
- [x] Configuration Supabase (Auth, Database, Storage)
- [x] Schéma de base de données complet
- [x] Types TypeScript générés
- [x] Design system (Navy industriel + Orange sécurité)
- [x] Authentification (Connexion / Inscription)
- [x] Route protégée avec layout sidebar
- [x] Composants UI (shadcn/ui)
- [x] Gestion des erreurs SSR

### Phase 2 : Modules Métier (Juillet 2026)
- [x] Module Produits (catalogue, QR, barcode)
- [x] Module Catégories
- [x] Module Lots & Certificats (upload PDF)
- [x] Module Stock (entrées/sorties)
- [x] Module Ventes (POS avec facture PDF)
- [x] Module Fournisseurs
- [x] Module Achats
- [x] Module Clients
- [x] Module Dépenses
- [x] Module Inventaire (scan QR)
- [x] Module Scanner QR
- [x] Module Rapports
- [x] Module Utilisateurs (rôles)
- [x] Module Paramètres

### Phase 3 : Documentation (Juillet 2026)
- [x] README.md
- [x] AGENTS.md
- [x] CONTEXT.md
- [x] ARCHITECTURE.md
- [x] DATABASE.md
- [x] SECURITY.md
- [x] CODE_STYLE.md
- [x] PERFORMANCE.md
- [x] CHANGELOG.md
- [x] TODO.md
- [x] BUGS.md
- [x] ERRORS_HISTORY.md
- [x] ROADMAP.md
- [x] FEATURES.md
- [x] VERSION_HISTORY.md
- [x] RELEASE_NOTES.md
- [x] MIGRATIONS.md
- [x] AUDIT.md
- [x] PROJECT_HEALTH.md
- [x] OBSERVATIONS.md
- [x] IDEAS_BACKLOG.md
- [x] KNOWN_LIMITATIONS.md
- [x] FUTURE_IDEAS.md
- [x] MODULES.md
- [x] DEPENDENCIES.md
- [x] DECISIONS.md
- [x] REFACTORING.md
- [x] LOGBOOK.md
- [x] DEPLOYMENT.md
- [x] TESTS.md
- [x] API.md

### Phase 4 : Professionnalisation (Juillet 2026)
- [x] Tests unitaires (Vitest — 77 tests)
- [x] Tests d'intégration
- [x] Tests E2E (Playwright — configuration + premier test)
- [x] Audit de sécurité complet
- [x] Optimisation des performances (pagination, memo, debounce, animations)
- [x] Mise en place CI/CD (GitHub Actions + Sentry)
- [x] Rate Limiting + Logger structuré + Alertes sécurité Supabase
- [x] Dependabot configuré

### Phase 5 : Fonctionnalités avancées (Juillet 2026)
- [x] Mode hors-ligne (PWA — Service Worker + Manifest)
- [x] Multi-emplacement stock (table BDD + page CRUD + filtre)
- [x] Transferts entre emplacements (dialogue dédié)
- [x] Retours fournisseurs (page CRUD + génération numéro)
- [x] Avoirs (page CRUD + génération numéro + email)
- [x] Envoi de facture par email (template + confirmation)
- [x] Notifications toast améliorées (Sonner enrichi)
- [x] Animations UI (5 keyframes CSS)
- [x] Statistiques dashboard (Top 5 produits)
- [x] Export CSV des listes (Produits, Clients, Stock)

### Phase 6 : Améliorations (Juillet 2026)
- [x] Notifications temps réel (Supabase Realtime — hook useRealtimeSubscription + LiveBadge)
- [x] Analyse de bundle (vite-bundle-visualizer — rapport complet)
- [x] Déploiement production (vercel.json + .env.example + secrets Vercel)
- [ ] Internationalisation (i18n)
- [ ] Thèmes customs supplémentaires
- [ ] Tests de charge
- [ ] Documentation API interactive

### Phase 7 : Production (Octobre 2026)
- [ ] Monitoring (Sentry, etc.)
- [ ] Sauvegardes automatisées
- [ ] Documentation utilisateur
- [ ] Formation

---

## 🎯 Version cible

| Version | Date | Objectif |
|---------|------|----------|
| 1.0.0 | Juillet 2026 | ✅ MVP fonctionnel |
| 1.1.0 | Juillet 2026 | ✅ Fonctionnalités avancées (livré en avance) |
| 1.2.0 | Juillet 2026 | ✅ Realtime, Bundle, Déploiement (3/7 terminées) |
| 2.0.0 | Octobre 2026 | 📅 Production (i18n, thèmes, tests charge) |

---

## Enrichissement — 2026-10-17

- [x] Ventes et clients (historique + recherche serveur ; sélection client au POS restante) : sélection d’un client existant, historique des ventes au nom du client, recherche sur toutes les pages.
- [ ] Pilotage : totaux de ventes conformes au schéma, panier moyen, répartition des paiements, principaux clients, exports fiables.
- [ ] Stock et achats : commandes à recevoir filtrées par entrepôt, quantités restantes et accès aux réceptions.
- [ ] Utilisation : états de chargement et d’erreur explicites, filtres accessibles, disposition adaptable.
- [ ] Tests ciblés et parcours authentifié sans modifier les données métier.

Périmètre : premier enrichissement des modules existants, sans modifier les écritures de stock ni introduire de devis ou de paiements partiels.
- [x] Crédit clients et dettes
- [x] Assistant intelligent
- [x] WhatsApp (liens de relance)
- [ ] WhatsApp automatique depuis un numéro Business (nécessite connexion WhatsApp Business)
