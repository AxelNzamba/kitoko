# ❌ Historique des Erreurs — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## 2026-09-15 — Session auth/E2E

| Erreur | Cause | Correction | Leçon |
|--------|-------|-------------|-------|
| `PGRST301 Expected 3 parts in JWT; got 1` sur les tests d'intégration | `.env` définit `VITE_SUPABASE_PUBLISHABLE_KEY` mais pas `VITE_SUPABASE_ANON_KEY` → client construit avec `mock-key` contre la vraie URL | Support des deux nommages dans `src/test/integration/setup.ts` | Les variables d'env renommées doivent être cherchées sous leurs deux noms |
| Test produits « échoue quand la stack tourne » | Verdict déduit d'un `data === null` (dépendait des politiques RLS) au lieu d'une détection explicite | Ping `/auth/v1/health` → `supabaseAvailable` | Ne jamais déduire la disponibilité d'un service du résultat d'une requête métier |
| `enable_confirmations = true` ignoré par la CLI | Clé placée sous `[auth]` racine au lieu de `[auth.email]` | Déplacement dans la bonne section | La CLI ignore **silencieusement** les clés inconnues/mal placées — toujours vérifier l'env du conteneur après restart |
| `min_length = 8` sous une section `[auth.password]` inventée : `GOTRUE_PASSWORD_MIN_LENGTH=6` | Clé inexistante dans le schéma de la CLI | Clés réelles : `minimum_password_length` + `password_requirements` (section `[auth]`, confirmées via le template `supabase init`) | Générer le template `supabase init` pour découvrir les clés supportées par sa version de CLI |
| Lien email de récupération → dashboard au lieu de `/reset-password` | `redirectTo` rejeté (allow-list sans wildcard) → fallback `site_url` racine | `additional_redirect_urls` avec motifs `/**` | GoTrue valide les motifs, pas les préfixes |
| Vitest 4 : `Failed to load custom Reporter from basic` | Reporter `basic` supprimé de Vitest 4 | Utiliser le reporter par défaut ou `--reporter=verbose` | Les reporters changent entre major versions |
| `workers: 1` rejeté dans `test.describe.configure` (TS2353) | Le type Playwright local n'expose que `mode`/`retries`/`timeout` | `mode: "serial"` suffit (force 1 worker) | Vérifier les signatures du DSL installé, pas la doc générique |

---

## 📋 Template

```markdown
### [ERR-XXX] Titre de l'erreur

**Date** : 
**Module** : 
**Erreur** : 
**Cause** : 
**Correction** : 
**Leçon** : 
```


## Livraison Hôtel — 2026-11-10
Correction Hôtel : import d’une route comme source de requêtes partagé remplacé par un dossier module ; assertions non-null supprimées ; fermeture du départ après confirmation uniquement.
