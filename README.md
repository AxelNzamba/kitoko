# Kitoko Stock — INDUS-ERP

> **Gestion de stock industrielle professionnelle pour les entreprises congolaises.**

[![Stack](https://img.shields.io/badge/stack-TanStack%20Start%20%2B%20Supabase-06b6d4)](https://tanstack.com)
[![Language](https://img.shields.io/badge/lang-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/licence-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/statut-Développement-orange)](.)

> **Dernière mise à jour** : 2026-09-15 — auth production-like (mot de passe oublié,
> confirmation email, politique de mot de passe 8+/majuscule/chiffre), 90 tests
> unitaires+intégration, 13 tests E2E auth.

---

## 📋 Sommaire

- [Présentation](#-présentation)
- [Architecture](#-architecture)
- [Modules](#-modules)
- [Installation](#-installation)
- [Lancement](#-lancement)
- [Variables d'environnement](#-variables-denvironnement)
- [Technologies](#-technologies)
- [Structure du projet](#-structure-du-projet)
- [Conventions](#-conventions)
- [Rôles utilisateurs](#-rôles-utilisateurs)
- [Roadmap](#-roadmap)
- [Contribuer](#-contribuer)

---

## 🎯 Présentation

**INDUS-ERP** est un système de gestion d'entreprise (ERP) moderne, conçu spécifiquement pour les besoins des PME industrielles en République Démocratique du Congo.

L'application couvre l'ensemble du cycle de vie des stocks :

- **Achats** — Gestion des fournisseurs et approvisionnements
- **Produits** — Catalogue avec photos, SKU, codes-barres et QR codes
- **Lots & Certificats** — Traçabilité par lot avec upload de documents PDF
- **Stock** — Mouvements d'entrée/sortie avec historique complet
- **Ventes (POS)** — Point de vente intégré avec génération de factures PDF
- **Inventaire** — Sessions d'inventaire avec scan QR code via caméra
- **Rapports** — Tableaux de bord et analyses
- **Utilisateurs** — Gestion des rôles (Propriétaire, Magasinier, Caissier)
- **Authentification complète** — Inscription avec confirmation d'email, connexion,
  mot de passe oublié (réinitialisation par lien email), politique de mot de passe
  (8+ caractères, majuscule, chiffre)

### Objectifs

- ✅ Application moderne, rapide et responsive
- ✅ Architecture prête pour la production
- ✅ Code maintenable et documenté
- ✅ Sécurisé par défaut (RLS, rôles, validation)
- ✅ Traçabilité complète des opérations
- ✅ Interface professionnelle avec design system

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (SSR)                     │
│         TanStack Start + React 19 + Vite 8          │
├─────────────────────────────────────────────────────┤
│                    API Layer                         │
│         TanStack Router (file-based routing)          │
├─────────────────────────────────────────────────────┤
│              Supabase (Backend as a Service)          │
│  ┌──────────┬──────────┬───────────┬──────────────┐  │
│  │  Auth    │ Database │ Storage   │   RLS / SQL   │  │
│  └──────────┴──────────┴───────────┴──────────────┘  │
└─────────────────────────────────────────────────────┘
```

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour les détails complets.

---

## 📦 Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/dashboard` | Vue d'ensemble avec KPIs |
| Produits | `/produits` | Catalogue produits avec QR/barcode |
| Catégories | `/categories` | Gestion des catégories |
| Lots | `/lots` | Gestion des lots et certificats |
| Fournisseurs | `/fournisseurs` | Gestion des fournisseurs |
| Stock | `/stock` | Mouvements de stock |
| Ventes (POS) | `/ventes` | Point de vente avec facture PDF |
| Achats | `/achats` | Gestion des achats |
| Inventaire | `/inventaire` | Sessions avec scan QR |
| Certificats | `/certificats` | Consultation des certificats |
| Clients | `/clients` | Gestion des clients |
| Dépenses | `/depenses` | Suivi des dépenses |
| Rapports | `/rapports` | Analyses et rapports |
| Scanner | `/scanner` | Scan QR code universel |
| Paramètres | `/parametres` | Configuration |
| Utilisateurs | `/utilisateurs` | Gestion des rôles |

---

## 🚀 Installation

### Prérequis

- **Node.js** ≥ 20
- **Bun** ≥ 1.0 (recommandé) ou npm/pnpm
- **Compte Supabase** (projet existant)

### Étapes

```bash
# 1. Cloner le dépôt
git clone <votre-repo>
cd kitoko-stock

# 2. Installer les dépendances
bun install

# 3. Copier les variables d'environnement
cp .env.example .env

# 4. Configurer Supabase
#    - Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env
#    - Appliquer les migrations : supabase migration up

# 5. Lancer en développement
bun run dev
```

---

## 🖥 Lancement

```bash
# Développement
bun run dev

# Build production
bun run build

# Preview du build
bun run preview

# Linting
bun run lint

# Formatage
bun run format
```

---

## 🔐 Variables d'environnement

| Variable | Description | Requise |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL du projet Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ |

---

## 🧰 Technologies

### Frontend
- **React 19** — Bibliothèque UI
- **TanStack Start** — Framework SSR
- **TanStack Router** — Routage type-safe
- **TanStack Query** — Gestion d'état serveur
- **Tailwind CSS v4** — Styles utilitaires
- **shadcn/ui** — Composants réutilisables
- **Lucide React** — Icônes
- **Recharts** — Graphiques

### Backend / BaaS
- **Supabase** — Auth, Database, Storage, RLS
- **PostgreSQL** — Base de données relationnelle

### Utilitaires
- **Zod** — Validation de schémas
- **React Hook Form** — Formulaires
- **date-fns** — Manipulation de dates
- **jspdf** — Génération de PDF
- **html5-qrcode** — Scan de QR codes
- **qrcode.react** — Génération de QR codes
- **JsBarcode** — Génération de codes-barres
- **Sonner** — Notifications toast

---

## 📁 Structure du projet

```
├── src/
│   ├── components/        # Composants UI
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/             # Hooks React
│   ├── integrations/      # Intégrations (Supabase)
│   │   └── supabase/
│   ├── lib/               # Bibliothèques utilitaires
│   │   └── password-policy.ts  # Politique de mot de passe (Zod)
│   ├── routes/            # Routes (file-based)
│   │   ├── auth.tsx           # Connexion / inscription / mot de passe oublié
│   │   ├── reset-password.tsx # Nouveau mot de passe (lien email)
│   │   └── _authenticated/    # Routes protégées
├── supabase/
│   ├── config.toml        # Configuration Supabase
│   └── migrations/        # Migrations SQL
├── .lovable/              # Configuration Lovable
├── AGENTS.md              # Règles pour les agents AI
├── README.md              # Ce fichier
└── *.md                   # Documentation technique
```

---

## 📐 Conventions

- **Langue** : TypeScript strict — pas de JavaScript
- **Style** : Fonctions fléchées, composants nommés
- **Imports** : Alias `@/` pour `src/`
- **État** : TanStack Query pour données serveur
- **CSS** : Tailwind utility-first
- **Validation** : Zod pour toutes les entrées
- **BDD** : Supabase RLS pour la sécurité

Voir [CODE_STYLE.md](./CODE_STYLE.md), [AGENTS.md](./AGENTS.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 👥 Rôles utilisateurs

| Rôle | Capacités |
|------|-----------|
| **Propriétaire** | Accès complet — toutes les opérations |
| **Magasinier** | Produits, lots, stock, inventaire |
| **Caissier** | Ventes (POS) uniquement |

---

## 🗺 Roadmap

Voir [ROADMAP.md](./ROADMAP.md) pour la roadmap complète.

---

## 📄 Licence

Projet privé — Tous droits réservés.
