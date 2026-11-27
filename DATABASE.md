# 🗄 Base de Données — INDUS-ERP

> **Dernière mise à jour** : 2026-11-06
> **Version** : 1.0.0

---

## 📋 Vue d'ensemble

**SGBD** : PostgreSQL 14.5 (via Supabase)
**Extension** : `pgcrypto` (pour UUID generation)
**Sécurité** : Row Level Security (RLS) activé sur toutes les tables

---

## 🗺 Schéma relationnel

```
┌────────────────────────────────────────────────────────────────────────┐
│                              PROFILES                                   │
│  id (PK, UUID, → auth.users) │ full_name │ phone │ created_at │ upd   │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ 1
                     │
                     │ * (via user_id)
┌────────────────────▼───────────────────────────────────────────────────┐
│                            USER_ROLES                                   │
│  id (PK, UUID) │ user_id │ role (ENUM: proprietaire/magasinier/caissier)│
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                           CATEGORIES                                    │
│  id (PK, UUID) │ name │ parent_id (FK → categories.id) │ created/upd   │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ 1
                     │
                     │ *
┌────────────────────▼───────────────────────────────────────────────────┐
│                            PRODUCTS                                     │
│  id (PK, UUID) │ name │ sku (UNIQUE) │ barcode │ category_id (FK)       │
│  photo_url │ purchase_price │ sale_price │ tva │ stock_min │ desc       │
│  created_at │ updated_at                                                │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ 1
                     │
                     │ *
┌────────────────────▼───────────────────────────────────────────────────┐
│                              LOTS                                       │
│  id (PK, UUID) │ product_id (FK) │ supplier_id (FK) │ lot_number        │
│  reception_date │ quantity │ unit_purchase_price │ certificate_url       │
│  notes │ created_at │ updated_at                                        │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ 1
                     │
                     │ *
┌────────────────────▼───────────────────────────────────────────────────┐
│                        STOCK_MOVEMENTS                                  │
│  id (PK, UUID) │ product_id (FK) │ lot_id (FK) │ type (ENUM: entree/    │
│    sortie/inventaire) │ quantity │ unit_price │ reason │ created_by     │
│  created_at                                                             │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                             SALES                                       │
│  id (PK, UUID) │ number (UNIQUE) │ total_ht │ total_tva │ total_ttc    │
│  payment_mode (ENUM) │ client_name │ created_by │ created_at             │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ 1
                     │
                     │ *
┌────────────────────▼───────────────────────────────────────────────────┐
│                           SALE_ITEMS                                    │
│  id (PK, UUID) │ sale_id (FK) │ product_id (FK) │ lot_id (FK)          │
│  quantity │ unit_price │ tva                                             │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                             SUPPLIERS                                   │
│  id (PK, UUID) │ name │ phone │ email │ address │ created_at │ upd      │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                             CLIENTS                                     │
│  id (PK, UUID) │ name │ phone │ email │ address │ company │ notes       │
│  created_at │ updated_at                                                │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                            EXPENSES                                     │
│  id (PK, UUID) │ label │ amount │ category │ expense_date │ notes       │
│  created_by │ created_at │ updated_at                                   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        INVENTORY_SESSIONS                               │
│  id (PK, UUID) │ name │ status │ created_by │ created_at │ closed_at    │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ 1
                     │
                     │ *
┌────────────────────▼───────────────────────────────────────────────────┐
│                         INVENTORY_COUNTS                                │
│  id (PK, UUID) │ session_id (FK) │ lot_id (FK) │ counted_quantity       │
│  created_at                                                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Tables

### `profiles`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | - | PK → auth.users |
| full_name | TEXT | - | - |
| phone | TEXT | - | - |
| created_at | TIMESTAMPTZ | now() | - |
| updated_at | TIMESTAMPTZ | now() | - |

### `user_roles`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| user_id | UUID | - | NOT NULL |
| role | app_role | - | NOT NULL |
| created_at | TIMESTAMPTZ | now() | - |

### `audit_logs` (2026-11-06)
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| table_name | TEXT | - | NOT NULL |
| record_id | TEXT | - | - |
| action | TEXT | - | NOT NULL, CHECK (`INSERT`/`UPDATE`/`DELETE`) |
| actor_id | UUID | - | FK → profiles.id, ON DELETE SET NULL |
| changes | JSONB | `{}` | NOT NULL (`old` / `new`) |
| created_at | TIMESTAMPTZ | now() | - |

Alimentée par le trigger `audit_row_change()` (`SECURITY DEFINER`) sur 27 tables :
les 12 de la migration initiale (`categories`, `suppliers`, `products`, `lots`,
`stock_movements`, `sales`, `sale_items`, `clients`, `expenses`, `user_roles`,
`warehouses`, `credits`) plus `profiles`, `client_debts`, `debt_payments`,
`purchase_orders`, `purchase_order_items`, `sav_interventions`, `sav_tickets`,
`sav_intervention_serials`, `serial_numbers`, `stock_locations`,
`stock_transfers`, `stock_transfer_items`, `supplier_returns`,
`inventory_sessions`, `inventory_counts`. Les achats gardent leur trigger métier
`log_audit('achats')`.
Aucune politique d'INSERT : l'écriture passe uniquement par le trigger.

> Ne pas confondre avec `audit_log` (2026-07-22), table legacy vide et inutilisée.

### `categories`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| name | TEXT | - | NOT NULL |
| parent_id | UUID | - | FK → categories.id |
| created_at | TIMESTAMPTZ | now() | - |
| updated_at | TIMESTAMPTZ | now() | - |

### `products`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| name | TEXT | - | NOT NULL |
| sku | TEXT | - | UNIQUE, NOT NULL |
| barcode | TEXT | - | UNIQUE |
| category_id | UUID | - | FK → categories.id |
| photo_url | TEXT | - | - |
| purchase_price | NUMERIC | 0 | NOT NULL |
| sale_price | NUMERIC | 0 | NOT NULL |
| tva | NUMERIC | 16 | NOT NULL |
| stock_min | INTEGER | 0 | NOT NULL |
| description | TEXT | - | - |
| created_at | TIMESTAMPTZ | now() | - |
| updated_at | TIMESTAMPTZ | now() | - |

### `lots`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| product_id | UUID | - | FK → products.id, NOT NULL |
| supplier_id | UUID | - | FK → suppliers.id |
| lot_number | TEXT | - | NOT NULL |
| reception_date | DATE | now() | NOT NULL |
| quantity | INTEGER | 0 | NOT NULL |
| unit_purchase_price | NUMERIC | 0 | NOT NULL |
| certificate_url | TEXT | - | - |
| notes | TEXT | - | - |
| created_at | TIMESTAMPTZ | now() | - |
| updated_at | TIMESTAMPTZ | now() | - |

### `stock_movements`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| product_id | UUID | - | FK → products.id, NOT NULL |
| lot_id | UUID | - | FK → lots.id |
| type | movement_type | - | NOT NULL |
| quantity | INTEGER | - | NOT NULL |
| unit_price | NUMERIC | - | - |
| reason | TEXT | - | - |
| created_by | UUID | - | FK → auth.users |
| created_at | TIMESTAMPTZ | now() | - |

### `sales`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| number | TEXT | - | UNIQUE, NOT NULL |
| total_ht | NUMERIC | 0 | NOT NULL |
| total_tva | NUMERIC | 0 | NOT NULL |
| total_ttc | NUMERIC | 0 | NOT NULL |
| payment_mode | TEXT | - | NOT NULL |
| client_name | TEXT | - | - |
| created_by | UUID | - | FK → auth.users |
| created_at | TIMESTAMPTZ | now() | - |

### `sale_items`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| sale_id | UUID | - | FK → sales.id, NOT NULL |
| product_id | UUID | - | FK → products.id, NOT NULL |
| lot_id | UUID | - | FK → lots.id |
| quantity | INTEGER | - | NOT NULL |
| unit_price | NUMERIC | - | NOT NULL |
| tva | NUMERIC | 16 | NOT NULL |

### `suppliers`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| name | TEXT | - | NOT NULL |
| phone | TEXT | - | - |
| email | TEXT | - | - |
| address | TEXT | - | - |
| created_at | TIMESTAMPTZ | now() | - |
| updated_at | TIMESTAMPTZ | now() | - |

### `clients`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| name | TEXT | - | NOT NULL |
| phone | TEXT | - | - |
| email | TEXT | - | - |
| address | TEXT | - | - |
| company | TEXT | - | - |
| notes | TEXT | - | - |
| created_at | TIMESTAMPTZ | now() | - |
| updated_at | TIMESTAMPTZ | now() | - |

### `expenses`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| label | TEXT | - | NOT NULL |
| amount | NUMERIC | - | NOT NULL |
| category | TEXT | - | NOT NULL |
| expense_date | DATE | now() | NOT NULL |
| notes | TEXT | - | - |
| created_by | UUID | - | FK → auth.users |
| created_at | TIMESTAMPTZ | now() | - |
| updated_at | TIMESTAMPTZ | now() | - |

### `inventory_sessions`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| name | TEXT | - | NOT NULL |
| status | TEXT | 'en_cours' | NOT NULL |
| created_by | UUID | - | FK → auth.users |
| created_at | TIMESTAMPTZ | now() | - |
| closed_at | TIMESTAMPTZ | - | - |

### `inventory_counts`
| Colonne | Type | Défaut | Contrainte |
|---------|------|--------|------------|
| id | UUID | gen_random_uuid() | PK |
| session_id | UUID | - | FK → inventory_sessions.id, NOT NULL |
| lot_id | UUID | - | FK → lots.id, NOT NULL |
| counted_quantity | INTEGER | 0 | NOT NULL |
| created_at | TIMESTAMPTZ | now() | - |

---

## 👁 Vues

### `lot_stock`
```sql
CREATE VIEW lot_stock AS
SELECT 
  l.id AS lot_id,
  l.product_id,
  l.lot_number,
  l.quantity AS initial_quantity,
  COALESCE(SUM(
    CASE WHEN sm.type = 'entree' THEN sm.quantity
         WHEN sm.type IN ('sortie', 'inventaire') THEN -sm.quantity
         ELSE 0 END
  ), 0) AS delta,
  l.quantity + COALESCE(SUM(
    CASE WHEN sm.type = 'entree' THEN sm.quantity
         WHEN sm.type IN ('sortie', 'inventaire') THEN -sm.quantity
         ELSE 0 END
  ), 0) AS current_quantity
FROM lots l
LEFT JOIN stock_movements sm ON sm.lot_id = l.id
GROUP BY l.id, l.product_id, l.lot_number, l.quantity;
```

---

## 🔧 Fonctions

### `has_role`
```sql
CREATE FUNCTION has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
```

---

## 🔐 Row Level Security (RLS)

### Politique générale
- **SELECT** : Tout utilisateur authentifié peut lire
- **INSERT/UPDATE/DELETE** : Restreint selon le rôle

### Par table
| Table | Lecture | Écriture |
|-------|---------|----------|
| profiles | Authentifié | Propriétaire uniquement |
| user_roles | Authentifié | Propriétaire uniquement |
| categories | Authentifié | Propriétaire, Magasinier |
| products | Authentifié | Propriétaire, Magasinier |
| lots | Authentifié | Propriétaire, Magasinier |
| suppliers | Authentifié | Propriétaire, Magasinier |
| stock_movements | Authentifié | Propriétaire, Magasinier |
| sales | Authentifié | Propriétaire, Caissier |
| sale_items | Authentifié | Propriétaire, Caissier |
| clients | Authentifié | Propriétaire, Caissier |
| expenses | Authentifié | Propriétaire, Magasinier |
| inventory_sessions | Authentifié | Propriétaire, Magasinier |
| inventory_counts | Authentifié | Propriétaire, Magasinier |
| audit_logs | **Propriétaire uniquement** | Triggers `SECURITY DEFINER` uniquement |

---

## 📊 Index recommandés

```sql
-- Recherche produits
CREATE INDEX idx_products_name ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_products_barcode ON products (barcode);

-- Recherche lots
CREATE INDEX idx_lots_product_id ON lots (product_id);
CREATE INDEX idx_lots_lot_number ON lots (lot_number);

-- Mouvements
CREATE INDEX idx_stock_movements_product_id ON stock_movements (product_id);
CREATE INDEX idx_stock_movements_lot_id ON stock_movements (lot_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements (created_at DESC);

-- Ventes
CREATE INDEX idx_sales_created_at ON sales (created_at DESC);
CREATE INDEX idx_sale_items_sale_id ON sale_items (sale_id);

-- Inventaire
CREATE INDEX idx_inventory_counts_session_id ON inventory_counts (session_id);
```

---

## 🔄 Migrations

Voir [MIGRATIONS.md](./MIGRATIONS.md) pour l'historique complet des migrations.

## sav_intervention_serials (2026-08-05)
Liaison N-N entre `sav_interventions` et `serial_numbers`.
- `intervention_id` → sav_interventions (cascade), `serial_id` → serial_numbers (cascade), unique (intervention_id, serial_id)
- `outcome` : traite | repare | remplace | retourne_client | rebut ; `notes`
- RLS : lecture/ajout pour propriétaire, magasinier, caissier ; modification propriétaire + magasinier ; suppression propriétaire uniquement
- Index : `idx_sis_intervention`, `idx_sis_serial`

---

## Auth — configuration locale (2026-09-15, `supabase/config.toml`)

| Clé | Valeur | Effet |
|-----|--------|-------|
| `site_url` | `http://127.0.0.1:8080` | Les emails (récupération, confirmation) redirigent vers l'app Vite |
| `additional_redirect_urls` | `http://localhost:8080/**`, `http://127.0.0.1:8080/**` | Motifs **wildcard obligatoires** — une URL exacte sans chemin fait rejeter `redirectTo` par GoTrue |
| `[auth.email] enable_confirmations` | `true` | Nouvel inscrit = clic sur « Confirm your email address » avant connexion (section `[auth.email]`, pas `[auth]`) |
| `minimum_password_length` | `8` | Garde-fou serveur (`GOTRUE_PASSWORD_MIN_LENGTH=8`) |
| `password_requirements` | `lower_upper_letters_digits` | Majuscule + minuscule + chiffre requis |
| `[analytics] enabled` | `false` | logflare bloque le démarrage Windows sans daemon Docker sur tcp://localhost:2375 |

Utilisateurs de test (base locale) : `admin@brightservices.cg` / `Bright2026!` (voir
[compte.md](./compte.md)), `test@indus-erp.com` (créé auto par le setup d'intégration),
`signup.e2e@indus-erp.com` (créé/purgé par le E2E signup).

## audit_log (2026-10-05)
Colonnes ajoutées : `module`, `warehouse_id`, `label`, `severity`. Index : created_at, module, user_id, warehouse_id, (table_name, record_id). Fonction `log_audit(module)` + triggers `audit_<table>`. Vue `audit_module_usage` (security_invoker).


## Livraison Hôtel — 2026-11-10
Cinq tables hôtel : hotel_room_types, hotel_rooms, hotel_reservations, hotel_charges, hotel_housekeeping. Rôle receptionniste ajouté. RLS hôtel Propriétaire/Réceptionniste. Verrouillage de chambre avant contrôle des chevauchements. Catalogue minibar dédié (id, nom, prix de vente), accès direct produits réservé aux trois rôles Stock.
