# 🏗 Architecture — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15
> **Version** : 1.0.0

---

## 📐 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    INDUS-ERP (Application)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Frontend (SSR)                     │   │
│  │         TanStack Start + React 19 + Vite 8          │   │
│  │                                                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │   │
│  │  │  Routes  │ │  Query   │ │   Components     │    │   │
│  │  │  (FSR)   │ │ (RQ)     │ │   (shadcn/ui)    │    │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Supabase (Backend as a Service)          │   │
│  │                                                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │   │
│  │  │   Auth   │ │ Database │ │    Storage       │    │   │
│  │  │ (JWT)    │ │ (PG)     │ │ (Photos/PDFs)    │    │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘    │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │           Row Level Security (RLS)           │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛 Architecture Frontend

### Stack
- **Framework** : TanStack Start (SSR React 19)
- **Routage** : TanStack Router (file-based routing — voir [`src/routes/README.md`](./src/routes/README.md))
- **État serveur** : TanStack Query (React Query v5)
- **Styles** : Tailwind CSS v4
- **Composants** : shadcn/ui (Radix UI primitives)
- **Validation** : Zod
- **Formulaires** : React Hook Form

### Structure des routes (File-based)

```
src/routes/
├── __root.tsx          # Shell global (layout, QueryClient, Toaster)
├── index.tsx           # Page d'accueil (redirection auth)
├── auth.tsx            # Connexion / Inscription
└── _authenticated/     # Routes protégées (layout avec sidebar)
    ├── route.tsx       # Layout authentifié
    ├── dashboard.tsx
    ├── produits.tsx
    ├── categories.tsx
    ├── lots.tsx
    ├── fournisseurs.tsx
    ├── stock.tsx
    ├── ventes.tsx
    ├── achats.tsx
    ├── inventaire.tsx
    ├── certificats.tsx
    ├── clients.tsx
    ├── depenses.tsx
    ├── rapports.tsx
    ├── scanner.tsx
    ├── parametres.tsx
    └── utilisateurs.tsx
```

### Design System

```
Palette : Navy industriel (#1a2a3a) + Orange sécurité (#e8751a)
          + Slate neutres

Typography : Inter (UI) + JetBrains Mono (données)
```

Voir [CODE_STYLE.md](./CODE_STYLE.md) et le fichier `src/styles.css` pour les détails.

---

## 🗄 Architecture Base de Données

### Schéma

```
public
├── profiles              # Profils utilisateurs (liés à auth.users)
├── user_roles            # Rôles (proprietaire, magasinier, caissier)
├── categories            # Catégories de produits (arborescent)
│   └── parent_id → categories.id
├── suppliers             # Fournisseurs
├── products              # Produits
│   └── category_id → categories.id
├── lots                  # Lots par produit
│   ├── product_id → products.id
│   └── supplier_id → suppliers.id
├── stock_movements       # Mouvements de stock
│   ├── product_id → products.id
│   └── lot_id → lots.id
├── sales                 # Ventes
├── sale_items            # Lignes de vente
│   ├── sale_id → sales.id
│   ├── product_id → products.id
│   └── lot_id → lots.id
├── clients               # Clients
├── expenses              # Dépenses
├── inventory_sessions    # Sessions d'inventaire
├── inventory_counts      # Comptages d'inventaire
│   ├── session_id → inventory_sessions.id
│   └── lot_id → lots.id
└── lot_stock (VIEW)      # Vue calculée stock par lot
```

Voir [DATABASE.md](./DATABASE.md) pour les détails complets.

---

## 🔐 Architecture Sécurité

### Authentification
- Supabase Auth (email/password)
- JWT géré par Supabase
- Session persistance via cookies
- (2026-09-15) Routes `/auth` (connexion/inscription/oubli) et `/reset-password`
  (nouveau mot de passe après lien email) ; confirmation d'email activée en local ;
  politique de mot de passe 8+/majuscule/chiffre (`src/lib/password-policy.ts` +
  garde-fou GoTrue) ; liens email redirigés vers l'app via `site_url` + allow-list `/**`

### Autorisation
- Row Level Security (RLS) PostgreSQL
- Rôles : `proprietaire`, `magasinier`, `caissier`
- Fonction `has_role()` pour la vérification côté SQL

### Validation
- Zod pour toutes les entrées utilisateur
- Sanitization côté client et serveur

Voir [SECURITY.md](./SECURITY.md) pour les détails complets.

---

## 📡 Architecture API

Pas d'API REST explicite — les appels se font directement :
- **Supabase client SDK** côté client (après hydratation)
- **Server Functions** TanStack Start pour les opérations SSR

### Patterns de données
- **Lecture** : TanStack Query → `supabase.from('table').select('...')`
- **Écriture** : TanStack Mutation → `supabase.from('table').insert/update`
- **Cache** : Invalidation automatique après mutation
- **Realtime** : Possible via Supabase Realtime (non implémenté)

---

## 💾 Architecture Stockage

### Buckets Supabase Storage
- `product-photos` — Images des produits (public)
- `certificats` — PDF de certificats (public)

---

## 📈 Architecture Performance

### Cache
- **TanStack Query** : Cache automatique — `staleTime` 30 s global, 5 min sur les listes de référence, `gcTime` 7 jours (persistance IndexedDB) — voir [PERFORMANCE.md](./PERFORMANCE.md)
- **React** : Mémoïsation systématique — `React.memo` sur les lignes de liste, `useMemo`/`useCallback` sur les calculs
- **Images** : Compression WebP automatique à l'upload (`compressImage`) + lazy loading
- **Requêtes** : Pagination serveur sur 13 listes (`range()` + `count: "exact"`), debounce des recherches

### Bundle
- **Code splitting** : Par route (TanStack Router) + à la demande pour recharts (dashboard) et jspdf (exports PDF)
- **Tree shaking** : ESM natif

Voir [PERFORMANCE.md](./PERFORMANCE.md) pour les détails.

---

## 🔄 Flux de données

### Requête typique (lecture)
```
1. Utilisateur navigue → Route TanStack
2. Loader SSR optionnel → Supabase (RLS vérifié)
3. HTML rendu côté serveur
4. Hydratation client → TanStack Query prend le relais
5. Re-rendu réactif si données changent
```

### Mutation typique (écriture)
```
1. Utilisateur soumet formulaire → Validation Zod
2. Mutation TanStack Query → Supabase insert/update
3. Vérification RLS (rôle utilisateur)
4. Réponse → Invalidation du cache TanStack Query
5. Notification toast (Sonner)
```

---

## 🔌 Dépendances et services

Voir [DEPENDENCIES.md](./DEPENDENCIES.md).

---

## 🧪 Tests

Voir [TESTS.md](./TESTS.md).

---

## 🚀 Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md).


## Livraison Hôtel — 2026-11-10
INDUS-ERP expose /applications avec Kitoko Stock Management et Kitoko Hôtel. Requêtes hôtel partagées dans src/modules/hotel/queries.ts ; routes hôtel séparées. Le sélecteur conserve les pages Stock existantes.
