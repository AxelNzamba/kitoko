# 📦 Modules — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## 📋 Liste des modules

| Module | Fichier(s) | Description | Dépendances |
|--------|------------|-------------|-------------|
| Multi-entrepôts | `hooks/use-warehouse.tsx`, `lib/warehouse-filter.ts`, `components/warehouse-selector.tsx` | Contexte et filtrage par entrepôt | Supabase |
| Commandes | `components/global-command-palette.tsx` | Recherche globale Cmd+K | Tous modules |
| Mode terrain | `routes/_authenticated/terrain.tsx` | Interface mobile terrain | Scanner, Stock, Inventaire, Achats |
| Emplacements | `routes/_authenticated/emplacements.tsx` | Entrepôts + emplacements hiérarchiques | Stock |


| Module | Fichier(s) | Description | Dépendances |
|--------|------------|-------------|-------------|
| Produits | `routes/_authenticated/produits.tsx` | Catalogue produits | Catégories, Supabase Storage |
| Catégories | `routes/_authenticated/categories.tsx` | Gestion catégories arborescentes | - |
| Lots | `routes/_authenticated/lots.tsx` | Traçabilité par lot | Produits, Fournisseurs |
| Fournisseurs | `routes/_authenticated/fournisseurs.tsx` | Gestion fournisseurs | - |
| Stock | `routes/_authenticated/stock.tsx` | Mouvements de stock | Produits, Lots |
| Ventes (POS) | `routes/_authenticated/ventes.tsx` | Point de vente | Produits, Lots, Clients |
| Achats | `routes/_authenticated/achats.tsx` | Gestion des achats | Fournisseurs, Produits |
| Clients | `routes/_authenticated/clients.tsx` | Gestion des clients | - |
| Dépenses | `routes/_authenticated/depenses.tsx` | Suivi des dépenses | - |
| Inventaire | `routes/_authenticated/inventaire.tsx` | Sessions d'inventaire | Lots |
| Scanner | `routes/_authenticated/scanner.tsx` | Scan QR universel | - |
| Rapports | `routes/_authenticated/rapports.tsx` | Analyses et graphiques | Ventes, Stock, Achats |
| Utilisateurs | `routes/_authenticated/utilisateurs.tsx` | Gestion des rôles | Auth Supabase |
| Auth | `routes/auth.tsx`, `routes/reset-password.tsx`, `lib/password-policy.ts` | Connexion, inscription avec confirmation email, mot de passe oublié, politique 8+/majuscule/chiffre | Supabase Auth, Mailpit (local) |
| Paramètres | `routes/_authenticated/parametres.tsx` | Configuration générale | - |
| Dashboard | `routes/_authenticated/dashboard.tsx` | Vue d'ensemble | Tous modules |
| Certificats | `routes/_authenticated/certificats.tsx` | Consultation certificats | Lots, Storage |

---

## 🏗 Structure d'un module

Chaque module suit le pattern :

```typescript
// 1. Route
export const Route = createFileRoute("/_authenticated/module")({
  component: ModulePage,
  // head, loader, etc.
});

// 2. Composant principal
function ModulePage() {
  // 3. Hooks de données
  const { data, isLoading } = useQuery({ ... });
  
  // 4. États locaux
  const [isOpen, setIsOpen] = useState(false);
  
  // 5. Rendu
  return <div>...</div>;
}

// 6. Sous-composants
function DialogForm() { ... }
function DataTable() { ... }
```

---

## 🔄 Flux de données

```
Route TanStack
    ↓
useQuery / useMutation (TanStack Query)
    ↓
Supabase client SDK (avec RLS)
    ↓
PostgreSQL
    ↓
Cache TanStack Query (invalidation automatique)
    ↓
React re-render
```

| Historique produit | `routes/_authenticated/historique-produit.tsx` | Timeline unifiée d'un produit | Lots, Ventes, Stock, Inventaire, Séries |

| Transferts entrepôts | `routes/_authenticated/transferts.tsx` | Bons de transfert inter-entrepôts avec scan QR et double validation | Entrepôts, Lots, Stock |
| Favoris | `hooks/use-favorites.ts`, `components/favorites-bar.tsx` | Raccourcis par rôle et par entrepôt | Entrepôts, Auth |
| Mode kiosque | `hooks/use-kiosk.tsx`, `routes/_authenticated/route.tsx` | Caisse plein écran limitée vente/scan | Ventes, Scanner |
| Alertes intelligentes | `hooks/use-smart-alerts.ts`, `components/smart-alerts-card.tsx` | Stock critique, retards fournisseurs, garanties | Stock, Achats, SAV |


## Livraison Hôtel — 2026-11-10
Module Hôtel : src/modules/hotel (requêtes partagées), src/lib/hotel.ts (calculs), routes /hotel, /hotel/chambres, /hotel/reservations, /hotel/menage. RLS Propriétaire/Réceptionniste et triggers audit hôtel.
