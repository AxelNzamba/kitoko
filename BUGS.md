# 🐛 Bugs — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## 🟡 Ouverts

*Aucun bug connu pour le moment.*

## ✅ Résolus

| # | Bug | Cause | Solution | Résolu le |
|---|-----|-------|----------|-----------|
| 1 | Comptage d'inventaire impossible depuis le mode terrain | `insert` sur `inventory_counts` avec la colonne inexistante `counted_by` (erreur PostgREST systématique) | Payload corrigé (`session_id`, `lot_id`, `counted_quantity`, `warehouse_id`) | 2026-09-04 |
| 2 | Mode terrain inutilisable sans réseau (listes vides, échecs d'enregistrement) | Toutes les lectures/écritures allaient directement à la Data API sans repli | `src/lib/offline/terrain-offline.ts` : repli sur le miroir Dexie + mise en file d'attente des écritures | 2026-09-04 |
| 3 | Formulaire de nouveau mot de passe inatteignable après clic sur le lien email | `redirectTo=/reset-password` rejeté par GoTrue : allow-list sans motif wildcard (URL exacte sans chemin) → fallback `site_url` racine, utilisateur atterrissait connecté sur le dashboard | `additional_redirect_urls = ["http://localhost:8080/**", …]` dans `supabase/config.toml` | 2026-09-15 |
| 4 | Stack Supabase locale refusait de redémarrer (analytics/storage/studio unhealthy) | `[analytics]` activé : logflare exige le daemon Docker exposé sur tcp://localhost:2375 sur Windows | `[analytics] enabled = false` + restauration des données depuis l'ancien volume `supabase_db_iwvyqwgugqfrulkfjccp` | 2026-09-15 |
| 5 | Test d'intégration produits au verdict non déterministe (échouait avec la stack allumée) | Setup déduisait « base absente » d'un `data === null` ; requêtes anon vs RLS `TO authenticated` ; `.env` n'a que `VITE_SUPABASE_PUBLISHABLE_KEY` (setup lisait l'ancien nom → clé `mock-key` contre la vraie URL) | `src/test/integration/setup.ts` réécrit : ping explicite `/auth/v1/health`, support des deux nommages de clé, création auto de l'utilisateur de test | 2026-09-15 |
| 6 | E2E auth instables en parallèle (course sur les emails Mailpit) | Les 3 suites auth partagent Mailpit et le compte admin, config `fullyParallel: true` | `playwright.config.ts` : `workers: 1` + `fullyParallel: false` | 2026-09-15 |

---

## 📋 Template pour nouveau bug

```markdown
### [BUG-XXX] Titre du bug

**Description** : ...
**Module** : ...
**Date** : ...
**Statut** : 🟡 Ouvert / ✅ Résolu

**Cause** : ...
**Solution** : ...
**Correctif** : ...

**Notes** : ...
```

## Corrigés 2026-10-05
- Conflit « garder ma version » non renvoyé au serveur — cause : `pushOutbox` upsert ignoré ; solution : update puis insert. Résolu.
- Mode terrain : liste des sessions vide — cause : statut `ouvert` au lieu de `ouverte`. Résolu.


## Livraison Hôtel — 2026-11-10
Corrigé : départ fermait la fenêtre avant confirmation serveur ; facture accessible avant fin de chargement des consommations ; tarif conservé après changement de chambre ; rôle Réceptionniste non attribuable. Prévention des chevauchements et transitions de séjour ajoutée.
