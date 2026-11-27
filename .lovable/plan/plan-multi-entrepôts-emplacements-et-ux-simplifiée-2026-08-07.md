# Plan — Multi-entrepôts, emplacements et UX simplifiée

## Objectif
Rendre INDUS-ERP utilisable avec de nombreux entrepôts en ajoutant :
1. Une couche **entrepôt** au-dessus des emplacements.
2. Un **sélecteur d'entrepôt global** qui filtre tout le logiciel.
3. Des **sous-emplacements** précis (allée / rack / rayon / niveau).
4. Une **recherche globale Cmd+K** et des **favoris** pour naviguer rapidement.
5. Un **mode terrain mobile** avec gros boutons et scan rapide.

---

## 1. Schéma de données

### Nouvelle table `warehouses`
Représente un entrepôt physique (ou un magasin, un dépôt).

```text
warehouses
├── id (uuid, PK)
├── name (text)           -- ex: "Entrepôt Nord Kinshasa"
├── code (text)           -- ex: "ENK"
├── address (text)
├── is_active (boolean)
├── created_at / updated_at
```

### Mise à jour de `stock_locations`
Ajout d'une référence vers `warehouses` et des champs de sous-localisation.

```text
stock_locations
├── warehouse_id (uuid -> warehouses.id)
├── zone (text)           -- ex: "Zone A"
├── aisle (text)          -- allée
├── rack (text)           -- rack
├── bay (text)            -- rayon
├── level (text)          -- niveau
```

### Tables métier liées à l'entrepôt
Les tables suivantes gagnent un `warehouse_id` optionnel pour le filtrage global :
- `lots`
- `stock_movements`
- `inventory_sessions`
- `inventory_counts`
- `purchase_orders`
- `serial_numbers`

Les ventes (`sales`) restent commerciales ; seuls les mouvements de stock qui en découlent portent l'entrepôt.

### Vue `lot_stock_by_warehouse`
Recalcule le stock disponible par lot **et par entrepôt**, en agrégeant les mouvements filtrés sur `warehouse_id`.

---

## 2. Autorisation et RLS

- `warehouses` : lecture pour `proprietaire` et `magasinier` ; écriture pour `proprietaire`.
- `stock_locations` : lecture pour `proprietaire` et `magasinier` ; écriture pour `proprietaire`.
- Les nouvelles colonnes `warehouse_id` sur les tables métier sont filtrées par RLS : un utilisateur ne voit que les lignes de l'entrepôt actif, sauf le propriétaire qui peut tout voir.
- Le rôle `caissier` n'a pas accès aux données d'entrepôt en dehors de la vente.

---

## 3. Sélecteur d'entrepôt global

### Comportement
- Placé dans le header, à côté de la recherche globale.
- Mémorisé dans `localStorage` pour la session utilisateur.
- Quand un entrepôt est sélectionné, toutes les requêtes Supabase des pages concernées incluent `.eq("warehouse_id", selectedWarehouseId)`.
- Un bouton "Tous les entrepôts" permet au propriétaire de voir l'ensemble.

### Stockage
- React Context `WarehouseContext` fourni dans `src/routes/_authenticated/route.tsx`.
- Hook `useSelectedWarehouse()` pour consommer la valeur dans les pages.

---

## 4. Recherche globale Cmd+K

### Composant `GlobalCommandPalette`
- Déclenché par `Cmd+K` / `Ctrl+K` et par l'input du header.
- Indexe en mémoire :
  - Produits (nom, SKU, code-barres)
  - Lots (numéro de lot)
  - Clients (nom, téléphone)
  - Fournisseurs (nom)
  - Pages du menu
- Résultats groupés par catégorie.
- Navigation directe vers la fiche ou la page.

### Implémentation
- Server function `searchGlobal` avec `requireSupabaseAuth` et limite de résultats.
- Debounce 200 ms côté client.

---

## 5. Favoris et raccourcis

### Table `user_favorites`
```text
user_favorites
├── id (uuid, PK)
├── user_id (uuid -> auth.users)
├── type (text)           -- "page" | "product" | "lot" | "client"
├── target (text)         -- URL ou identifiant
├── label (text)
├── created_at
```

### UI
- Section "Accès rapide" en haut du dashboard avec les favoris de l'utilisateur.
- Bouton "Épingler" sur chaque page et chaque fiche (produit, lot, client).
- Persistance via Supabase + cache local Dexie pour offline.

---

## 6. Mode terrain mobile

### Nouvelle route `/terrain`
Accessible depuis le header en mode mobile ou via un raccourci.
Écran plein avec 4 grandes tuiles :
- **Scanner QR**
- **Entrée stock**
- **Sortie stock**
- **Inventaire rapide**

### Optimisations mobile
- Boutons >= 56 px de hauteur.
- Formulaires réduits aux champs essentiels.
- Scan caméra en plein écran.
- Retour haptique / sonore sur action réussie.

---

## 7. Pages modifiées

| Page | Changement |
|------|------------|
| `/dashboard` | Filtre KPIs et alertes par entrepôt ; section "Accès rapide" |
| `/produits` | Affiche le stock total par entrepôt dans la fiche produit |
| `/stock` | Filtre automatique par entrepôt ; colonne emplacement précis |
| `/lots` | Filtre par entrepôt ; affiche l'emplacement de stockage |
| `/emplacements` | Gestion des entrepôts + sous-emplacements (arbre) |
| `/inventaire` | Session liée à un entrepôt ; comptage par emplacement |
| `/commandes-fournisseurs` | Entrepôt de réception par défaut |
| `/scanner` | Affiche l'entrepôt du lot scanné et propose un transfert |
| `/sav` | Filtre les tickets par entrepôt du produit concerné |

---

## 8. Synchronisation offline

- Ajout des nouvelles tables (`warehouses`, `user_favorites`) dans `SYNC_TABLES`.
- Ajout de `warehouse_id` dans les mutations de l'outbox.
- Le conflit CRDT gère les champs `warehouse_id` et `location_id` comme les autres.

---

## 9. Livrables et ordre d'implémentation

1. **Migration SQL** : création de `warehouses`, modification de `stock_locations`, ajout des `warehouse_id`, nouvelle vue, RLS.
2. **Contexte entrepôt** : `WarehouseContext` + sélecteur dans le header.
3. **Pages opérations** : filtrage par entrepôt sur Stock, Lots, Inventaire, Commandes.
4. **Emplacements** : refonte de `/emplacements` avec arbre entrepôt > zone > allée > rack > rayon > niveau.
5. **Recherche globale** : `GlobalCommandPalette` + server function.
6. **Favoris** : table + UI dashboard + bouton d'épingle.
7. **Mode terrain** : nouvelle route `/terrain` optimisée mobile.
8. **Tests** : build TypeScript + navigation Playwright sur les nouvelles routes.

---

## 10. Critères d'acceptation

- [ ] Le sélecteur d'entrepôt filtre au moins Stock, Lots, Inventaire et Dashboard.
- [ ] Un utilisateur peut créer un entrepôt, puis y rattacher des emplacements hiérarchiques.
- [ ] La recherche Cmd+K trouve un produit en moins de 300 ms.
- [ ] Chaque utilisateur peut épingler des pages et les voir sur le dashboard.
- [ ] La route `/terrain` s'affiche correctement sur mobile avec les 4 tuiles.
- [ ] TypeScript compile sans erreur.
- [ ] Aucune régression sur les routes existantes.
