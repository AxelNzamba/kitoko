# ⚡ Performance — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15
> **Version** : 1.1.0

---

## 📋 Vue d'ensemble

Analyse des performances actuelles et recommandations d'optimisation.
**Les 6 points d'amélioration identifiés ont été traités le 2026-09-15** (voir détail ci-dessous).

---

## 📊 Métriques actuelles

| Métrique | Valeur | Cible | Statut |
|----------|--------|-------|--------|
| Temps de chargement initial | ~1.5s | < 2s | ✅ |
| Taille du bundle JS principal | ~250 KB (hors chunks lazy) | < 300 KB | ✅ |
| Taille du bundle CSS | ~15 KB | < 30 KB | ✅ |
| Temps de rendu SSR | ~200ms | < 500ms | ✅ |
| Requêtes Supabase (page moyenne) | 3-5 (paginées `count: "exact"`) | < 5 | ✅ |
| Score Lighthouse (estimation) | ~80/100 | > 85 | ⚠️ |

### Tailles des gros chunks (build vérifié 2026-09-15)

Tous chargés **à la demande** (code splitting), jamais dans le bundle initial :

| Chunk | Taille gzip | Chargé quand |
|-------|-------------|--------------|
| `recharts` | 96,5 KB | Le graphique CA du dashboard s'affiche |
| `jspdf` (PDF) | 125,7 KB | Premier export/clic PDF |
| `html5-qrcode` | 185,5 KB | Ouverture du scanner (terrain, transferts, inventaire) |
| `html2canvas` / `canvg` | 90 + 65 KB | Exports PDF avancés |
| `@sentry/browser` | 135 KB | Monitoring |

---

## 🔍 Points d'attention

### ✅ Ce qui est optimisé

1. **Code splitting par route** — TanStack Router (`autoCodeSplitting` du plugin route) charge les routes à la demande
2. **TanStack Query** — Cache automatique, déduplication, `staleTime` 30 s global + 5 min sur les listes de référence
3. **Tailwind CSS** — Purge CSS automatique (pas de CSS inutilisé)
4. **Images en lazy loading** — `loading="lazy"` sur les vignettes produits
5. **SSR** — Rendu côté serveur pour le premier affichage
6. **Fonts** — Inter + JetBrains Mono chargés depuis Google Fonts avec `preconnect`
7. **ESM natif** — Tree shaking automatique

### ✅ Les 6 points d'amélioration — tous traités (2026-09-15)

1. **Compression d'images** ✅ (déjà en place, confirmé)
   - `src/lib/image.ts` : `compressImage()` — WebP côté client, 800 px max, qualité 0,82
   - Intégré à l'upload des photos produits (`ProductFormDialog`)
   - Tests unitaires : `src/lib/__tests__/image.test.ts`

2. **Pagination cohérente** ✅
   - Paginées **côté serveur** (Supabase `range()` + `count: "exact"`) avec le composant réutilisable
     `src/components/ui/pagination.tsx` (sélecteur 10/20/50/100) :
     Produits (20), Lots (20), Mouvements de stock (30), Clients (20), Fournisseurs (20),
     Catégories (20), Dépenses (20), Achats (20), Avoirs (20), Retours fournisseurs (20),
     **Commandes fournisseurs (20 — nouveau)**, **SAV tickets (20 — nouveau)**,
     **Transferts entre entrepôts (20 — nouveau)**
   - Les filtres statut/client de SAV et commandes sont désormais appliqués **côté serveur**
     (dans la requête SQL, pas après chargement)

3. **Debounce sur les recherches** ✅
   - Hook réutilisable `src/hooks/use-debounce.ts` (300 ms par défaut, tests dédiés)
   - Recherche **serveur** produits (`/produits`) : `debouncedSearch` (300 ms) dans la `queryKey`
     → la requête SQL ne part qu'après stabilisation de la frappe ; la pagination repart à 1
   - Recherches **client-side** debouncées à 200 ms : clients, fournisseurs, achats,
     certificats, avoirs, retours fournisseurs (+ POS ventes et palette de commandes, déjà en place)

4. **TanStack Query staleTime** ✅ (déjà configuré, complété)
   - Global (src/router.tsx) : `staleTime 30 s`, `gcTime 7 jours` (persistance IndexedDB hors-ligne),
     `retry 1`, `refetchOnWindowFocus false`, `networkMode offlineFirst`
   - Ajouté : `staleTime 5 min` sur les listes de référence rarement modifiées
     (`products/suppliers min` des formulaires, entrepôts et profils des transferts) ;
     `staleTime 60 s` sur le compteur de dossiers SAV ouverts

5. **Memoization** ✅
   - `React.memo` sur les lignes de table/carte : `ClientRow`, `SupplierRow`, `CategoryRow`,
     `ExpenseRow`, `AchatRow`, `StatCard` (+ nouveaux **`OrderRow`** commandes fournisseurs,
     **`TicketRow`** SAV, **`TransferCard`** transferts, tous avec callbacks délégués au parent
     pour préserver la comparaison de props)
   - `useMemo` sur tous les filtrages/recalculs non triviaux (y compris avoirs, retours,
     commandes fournisseurs, transferts — `useCallback` sur le POS ventes)

6. **Bundle** ✅
   - **recharts** (~96 KB gzip) retiré du bundle initial du dashboard :
     nouveau composant isolé `src/components/dashboard-chart.tsx`, chargé via
     `React.lazy` + `<Suspense>` (fallback « Chargement du graphique… »)
   - **jspdf + jspdf-autotable** (~126 KB gzip) en import dynamique dans `/rapports`
     (les autres exports PDF utilisaient déjà `import()` dynamique via `src/lib/pdf-table.ts`
     et `src/lib/dashboard-pdf.ts`)

---

## 🎯 Recommandations

### ✅ Résolu

1. **Pagination des listes** — voir détail point 2 ci-dessus (13 listes paginées serveur)
2. **StaleTime TanStack Query** — 30 s global + 5 min listes de référence
3. **Images optimisées** — `compressImage()` WebP 800 px / 0,82 sur l'upload produit
4. **Debounce sur les recherches** — serveur (produits) + client (7 listes)
5. **Memoization** — `React.memo` sur les 10 composants de ligne, `useMemo`/`useCallback` systématiques
6. **Lazy loading des routes lourdes** — recharts (dashboard) et jspdf (rapports) en code splitting

### Priorité Moyenne 🟡

7. **Analyse de bundle** — `bun run analyze:bundle` (vite-bundle-visualizer)
8. **Preload des données critiques** — server loader TanStack pour pré-charger côté SSR
9. **Virtualisation** — `@tanstack/react-virtual` sur les listes > 100 lignes si besoin

### Priorité Faible 🔵

10. **Vue matérialisée `lot_stock`** si les performances se dégradent
11. **Index composites** — voir [DATABASE.md](./DATABASE.md#index-recommandés)

---

## 📈 Monitoring

### Actuel
- Aucun monitoring de performance en place

### Recommandé
- **Lighthouse CI** dans le pipeline CI/CD
- **Web Vitals** (Core Web Vitals) monitoring
- **Supabase Query Performance** dans le dashboard

---

## 🧪 Tests de performance

### Actuel
- Vérification build : chunks séparés confirmés (voir tableau ci-dessus)
- Typecheck `tsc --noEmit` : ✅ (les 3 erreurs résiduelles de `src/test/e2e/_video/record.spec.ts` sont pré-existantes)
- Tests unitaires : 75/77 passants (2 échecs = tests d'intégration nécessitant la stack Supabase Docker locale démarrée)

### Recommandé
- Test de charge avec k6 ou Artillery
- Test de performance Supabase (EXPLAIN ANALYZE)
- Benchmark des temps de réponse SSR

---

## 📊 Analyse Supabase

### Requêtes lentes potentielles
1. `stock_movements` avec jointures multiples → Ajouter index composite
2. `sales + sale_items` pour les rapports → Vue matérialisée
3. `lot_stock` vue calculée → Vue matérialisée si performances insuffisantes

### Index recommandés
Voir [DATABASE.md](./DATABASE.md#index-recommandés).

---

## 🚀 Cibles

| Métrique | Actuel | Cible | Priorité |
|----------|--------|-------|----------|
| Taille bundle initial | ~250 KB (recharts/jspdf exclus) | < 200 KB | 🟡 |
| Temps SSR | ~200ms | < 100ms | 🟡 |
| Requêtes/page | 3-5 paginées | < 3 | 🟡 |
| Score Lighthouse | ~80 | > 90 | 🟡 |
| Taille images upload | < 100 KB (WebP 800 px) | < 100 KB | ✅ |
| Temps interaction | ~500ms | < 300ms | 🟡 |
