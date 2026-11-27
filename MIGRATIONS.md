# 🔄 Migrations — INDUS-ERP

> **Dernière mise à jour** : 2026-11-06

---

## 📋 Liste des migrations

| Fichier | Date | Description |
|---------|------|-------------|
| `20260717065147_77542471-7611-4d9f-96fa-0846ea293efd.sql` | 2026-07-17 | Migration initiale (profils, rôles, auth) |
| `20260717065158_c189f4a9-a8d6-457f-a875-7b98637bdfd6.sql` | 2026-07-17 | Révocation permissions fonctions |
| `20260719020743_77c224d5-51c8-49e0-a201-db90ab3a1bda.sql` | 2026-07-19 | Tables métier (catégories, produits, lots, stock, ventes, inventaire) + RLS |
| `20260719020752_c700b03e-b1cc-43e4-bbed-f242b457df42.sql` | 2026-07-19 | Vue lot_stock security_invoker |
| `20260720124929_975bc7bb-7e9b-4dae-b1f9-069c3a4a5d03.sql` | 2026-07-20 | Table clients |
| `20260721090044_99c3daef-896d-45cd-be54-9e9326f984fc.sql` | 2026-07-21 | Table dépenses |
| `20260721090045_fix_rls_policies.sql` | 2026-07-21 | **Fix sécurité RLS** + storage policies + index audit |
| `20260721140000_stock_alerts.sql` | 2026-07-21 | Table des alertes de stock |
| `20260721150000_get_stock_value.sql` | 2026-07-21 | Fonction `get_stock_value()` |
| `20260722082359_4e159739-…sql` | 2026-07-22 | Durcissement RLS (lectures/écritures par rôle) |
| `20260722083716_efb31a1c-…sql` | 2026-07-22 | Ajustements schéma |
| `20260722085544_0a11f45d-…sql` | 2026-07-22 | `has_any_role`, table `audit_log` (legacy, non utilisée), triggers CRDT `bump_field_versions` |
| `20260722090000_features_stock_locations_transfers_returns_credits.sql` | 2026-07-22 | Emplacements, transferts, retours, avoirs |
| `20260724080512_b056ba86-…sql` | 2026-07-24 | `search_path` des fonctions de numérotation, RLS `credits` |
| `20260804070422_816e7d84-…sql` | 2026-08-04 | Numéros de série + commandes fournisseurs |
| `20260805111616_5e731c31-…sql` | 2026-08-05 | SAV : liaison aux numéros de série |
| `20260807131049_d2aa35bc-…sql` | 2026-08-07 | Entrepôts + hiérarchie des emplacements |
| `20260807131105_64c5f503-…sql` | 2026-08-07 | Accès `authenticated` à la vue `lot_stock` |
| `20260808082956_dec25cee-…sql` | 2026-08-08 | Favoris par rôle/entrepôt, statuts de transfert |
| `20260809194327_1780a8fd-…sql` | 2026-08-09 | Corrections de schéma |
| `20261106090000_audit_logs.sql` | 2026-11-06 | **Journal d'activité** : table `audit_logs`, 3 index, triggers sur 12 tables, RLS lecture propriétaire |
| `20261106130000_audit_logs_full_coverage.sql` | 2026-11-06 | Aligne les triggers sur les 27 tables tracées en production (idempotent, ne remplace aucun trigger existant) |

> `audit_log` (2026-07-22) est une table historique **vide et inutilisée** ; le journal
> actif est `audit_logs`. Ne pas confondre les deux.

---

## 📝 Commandes

```bash
# Appliquer les migrations
supabase migration up

# Annuler la dernière migration
supabase migration down

# Créer une nouvelle migration
supabase migration new nom_de_la_migration

# Lister le statut
supabase migration list
```

---

## 📊 État

- **Version actuelle** : 22 fichiers de migration dans `supabase/migrations/`
- **Journal d'activité** : `20261106090000_audit_logs.sql` **appliquée en production**
  (vérifié le 2026-11-06 : table, colonnes, policy, 27 tables avec triggers).
  `20261106130000_audit_logs_full_coverage.sql` aligne le dépôt sur cette couverture
  et reste à pousser (no-op sur la base actuelle, utile pour une reconstruction).
- **Vérifier l'état réel** : `supabase migration list` (compare local et distant).

### Appliquer la migration du journal d'activité

```bash
# 1. Lier le projet si nécessaire
supabase link --project-ref <ref-du-projet>

# 2. Vérifier ce qui sera appliqué
supabase migration list

# 3. Pousser (applique les migrations absentes en distant)
supabase db push

# 4. Contrôle : la table et ses triggers existent
#    Dashboard → Table editor → audit_logs
#    puis dans l'app : /activite → onglet Modifications (l'avertissement doit disparaître)
```

Sans cette migration, l'onglet « Modifications » de `/activite` affiche volontairement un
message explicite au lieu d'une erreur ; le reste de l'application n'est pas affecté.

### Tables volontairement hors audit

Quatre tables publiques n'ont pas de trigger `audit_*` :

| Table | Raison |
|---|---|
| `audit_log` | Journal métier applicatif ; la tracer créerait une boucle récursive. |
| `data_backups` | Télémétrie des sauvegardes, pas une opération métier. |
| `error_logs` | Journaux techniques, à forte volumétrie. |
| `user_favorites` | Préférences d'affichage par utilisateur. |

Toute autre table publique doit être tracée. La liste de référence est celle de
`20261106130000_audit_logs_full_coverage.sql` (27 tables) ; pour vérifier la couverture
réelle :

```sql
select c.relname
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
  and not exists (
    select 1 from pg_trigger t
    where t.tgrelid = c.oid and t.tgname like 'audit_%'
  )
order by 1;
```

---

## 2026-09-15 — Configuration auth (pas de migration SQL)
- Aucune nouvelle migration : 20 migrations inchangées. Configuration auth portée par
  `supabase/config.toml` (site_url, allow-list `/**`, confirmations email, politique de
  mot de passe 8+/majuscule/chiffre, analytics off) — détails dans [DATABASE.md](./DATABASE.md).
- Attention : sous une section inconnue (ex. `[auth.password]`), la CLI ignore la clé
  sans avertissement ; toujours vérifier `docker exec supabase_auth_local env` après restart.

## 2026-08-08 — Transferts & favoris
- `user_favorites` : + `role`, `warehouse_id`, `sort_order`, index et GRANT.
- Type `transfer_status` (brouillon, en_transit, recu, annule).
- Tables `stock_transfers` et `stock_transfer_items` (GRANT + RLS proprietaire/magasinier, suppression proprietaire).
- Fonction `generate_transfer_number()` (TRF-AAAAMMJJ-0001).

## 2026-10-05 — audit_log_modules_and_triggers
Enrichit `audit_log`, policy `audit_log_self_insert`, fonction `log_audit`, 25 triggers, vue `audit_module_usage`.


## Livraison Hôtel — 2026-11-10
Migrations Drizzle 0003–0006 hôtel : rôle, tables/policies/triggers, validation des transitions, verrouillage des réservations, RPC propriétaire set_staff_role et catalogue minibar limité. État appliqué confirmé par lecture et essai utilisateur.
