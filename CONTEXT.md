# 📋 Contexte du Projet — Kitoko Stock / INDUS-ERP

> **Dernière mise à jour** : 2026-09-15
> **Version** : 1.1.0

---

## 🏢 Contexte Métier

**INDUS-ERP** est une application de gestion d'entreprise (ERP) destinée aux PME industrielles en République Démocratique du Congo. Le nom "Kitoko" signifie "beau" en lingala — l'objectif est d'offrir un outil à la fois puissant et élégant.

### Problématique
Les PME congolaises utilisent souvent :
- Des solutions papier ou Excel
- Des ERP étrangers non adaptés au contexte local
- Plusieurs outils déconnectés les uns des autres

### Solution
Une application web moderne, responsive, qui couvre l'ensemble des besoins opérationnels :
- Gestion des stocks et approvisionnements
- Point de vente intégré
- Traçabilité par lot avec certificats
- Inventaire via scan QR code
- Rapports et tableaux de bord

---

## 🎯 Objectifs

### Objectif principal
Livrer un ERP fonctionnel, sécurisé, et prêt pour la production.

### Objectifs secondaires
- Application responsive (mobile-first)
- Interface professionnelle avec design system cohérent
- Code maintenable et bien documenté
- Architecture extensible pour ajouter des modules
- Performance optimale même sur connexion limitée

---

## 📅 Historique

### Phase 1 — Fondations (Juillet 2026)
- ✅ Création du projet TanStack Start
- ✅ Configuration Supabase (Auth, Database, Storage)
- ✅ Schéma de base de données complet
- ✅ Types TypeScript générés
- ✅ Design system (Navy industriel + Orange sécurité)
- ✅ Authentification (Connexion / Inscription)
- ✅ Route protégée avec layout sidebar
- ✅ Composants UI (shadcn/ui)
- ✅ Gestion des erreurs SSR
- ✅ (2026-09-15) Mot de passe oublié + reset via email, confirmation d'inscription,
  politique de mot de passe 8+/majuscule/chiffre

### Phase 2 — Modules métier (Juillet 2026)
- ✅ Module Produits (catalogue, QR, barcode)
- ✅ Module Catégories
- ✅ Module Lots & Certificats (upload PDF)
- ✅ Module Stock (entrées/sorties)
- ✅ Module Ventes (POS avec facture PDF)
- ✅ Module Fournisseurs
- ✅ Module Achats
- ✅ Module Clients
- ✅ Module Dépenses
- ✅ Module Inventaire (scan QR)
- ✅ Module Scanner QR
- ✅ Module Rapports
- ✅ Module Utilisateurs (rôles)
- ✅ Module Paramètres

### Phase 3 — Documentation & Professionnalisation (Terminé)
- [x] Documentation complète (.md)
- [x] Tests unitaires et d'intégration (77 tests)
- [x] Audit de sécurité
- [x] Optimisation des performances
- [x] CI/CD + Sentry + Dependabot

### Phase 4 — Fonctionnalités avancées (Terminé)
- [x] Multi-emplacement stock + Transferts
- [x] Retours fournisseurs + Avoirs
- [x] Envoi facture par email
- [x] Mode hors-ligne (PWA)
- [x] Animations UI + Notifications toast améliorées
- [x] Statistiques dashboard (Top 5 produits)

---

## 🚧 Contraintes

### Techniques
- **Hébergement** : Supabase (Backend as a Service)
- **SSR** : TanStack Start avec Vite 8
- **Base de données** : PostgreSQL via Supabase
- **Stockage** : Supabase Storage (photos produits, certificats PDF)
- **Authentification** : Supabase Auth (email/password)
- **Sécurité** : Row Level Security (RLS) Supabase

### Métier
- 3 rôles utilisateurs (Propriétaire, Magasinier, Caissier)
- Langue : Français
- TVA configurable par produit
- FIFO pour la valorisation des sorties de stock
- Codes-barres EAN-like (13 chiffres) générés automatiquement
- QR codes basés sur le SKU

### Non-fonctionnelles
- Accessible depuis téléphone, tablette et ordinateur
- Fonctionne avec une connexion internet standard
- Temps de chargement < 2 secondes

---

## 📄 Plan d'implémentation (Lovable)

> **Note** : Le fichier `.lovable/plan.md` contient le plan d'implémentation détaillé original.
> Consultez-le pour comprendre les décisions prises lors de la création des modules.

Ce plan couvre :
- Schéma de base de données (6 migrations)
- Module Produits, Lots, Stock, Inventaire QR, POS
- Détails techniques (dépendances, hooks React Query, upload storage)
- Périmètre exclu (édition, multi-emplacement, hors-ligne, etc.)

Le plan original est accessible dans [`.lovable/plan.md`](.lovable/plan.md).

---

## 🏗 Architecture

**Pattern** : Architecture monolithique avec SSR hydratation côté client.

```
TanStack Start (SSR) ←→ Supabase (BaaS)
       │                        │
    React 19            PostgreSQL + RLS
       │                        │
   Tailwind CSS         Supabase Auth
       │                        │
   shadcn/ui           Supabase Storage
```

### Flux de données
1. Requête initiale → SSR → HTML rendu sur le serveur
2. Hydratation côté client → React prend le relais
3. Appels API → TanStack Query → Supabase
4. Mutations → TanStack Query → Supabase → Invalidation du cache

---

## 📐 Décisions Architecturales Importantes

| Décision | Raison | Alternative |
|----------|--------|-------------|
| TanStack Start vs Next.js | Bundle plus léger, meilleure DX TypeScript | Next.js (App Router) |
| Supabase vs Firebase | PostgreSQL natif, RLS puissant, prix avantageux | Firebase Firestore |
| shadcn/ui vs MUI | Composants copiables, pas de dépendance lourde | Material UI |
| Tailwind vs CSS Modules | Vitesse de développement, design system cohérent | CSS Modules, Styled Components |
| Zod vs Yup | Meilleure inférence TypeScript | Yup, Joi |
| Bun vs npm | Performance, compatibilité TypeScript native | npm, pnpm |

Voir [DECISIONS.md](./DECISIONS.md) pour l'historique complet des décisions techniques.

---

## 🔗 Dépendances clés

Voir [DEPENDENCIES.md](./DEPENDENCIES.md) pour la liste complète.

---

## 📊 État du projet

| Domaine | État | Score |
|---------|------|-------|
| Architecture | ✅ Stable | 9/10 |
| Base de données | ✅ Complète | 9/10 |
| Frontend | ✅ Fonctionnel | 9/10 |
| Authentification | ✅ Fonctionnelle | 8/10 |
| Sécurité | ✅ Bon | 7/10 |
| Tests | 🟡 Partiel | 6/10 |
| Documentation | ✅ Complète | 9/10 |
| Performance | ✅ Optimisée | 9/10 |

Voir [PROJECT_HEALTH.md](./PROJECT_HEALTH.md) pour l'analyse détaillée.

---

## 👥 Équipe

| Rôle | Personne |
|------|----------|
| Architecte Logiciel Principal | Agent Buffy (AI) |
| Développeur | Agent Buffy (AI) |
| Propriétaire du projet | Utilisateur |

---

## 📝 Notes importantes

1. **Ne jamais pusher de secrets** — les variables d'environnement sont dans `.env`
2. **Toujours documenter** — chaque modification doit laisser une trace
3. **Rester simple** — privilégier la simplicité à la complexité prématurée
4. **Penser production** — chaque décision doit tenir compte du déploiement
