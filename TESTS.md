# 🧪 Tests — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## 📋 Statut actuel

| Type de test | Statut | Couverture | Outil |
|-------------|--------|------------|-------|
| Unitaires | ✅ 88 tests | format, csv, logger, rate-limiter, image, debounce, pagination, password-policy | Vitest |
| Intégration | ✅ 2 tests | products (RLS authentifié, auto-skip sans stack) | Vitest |
| E2E | ✅ 13 tests | auth-flow (5, dont mot de passe faible rejeté) + auth-reset-flow (4) + auth-signup-flow (4) — exécution séquentielle obligatoire (Mailpit/compte admin partagés) | Playwright |
| Performance | ❌ Non implémentés | 0% | Lighthouse (prévu) |

---

## 🎯 Tests implémentés

### Tests d'intégration (2026-09-15 — correctif)

`src/test/integration/setup.ts` est désormais **auto-suffisant** :
- Détection **explicite** de la stack via ping `GET /auth/v1/health` (`supabaseAvailable`) —
  l'ancien schéma déduisait « base absente » d'un `data === null`, verdict non déterministe
  (dépendait des politiques RLS et des variables d'env).
- Support du nouveau nommage de clé : `VITE_SUPABASE_ANON_KEY` **ou**
  `VITE_SUPABASE_PUBLISHABLE_KEY` (le `.env` du projet ne contenait que le second —
  l'ancien setup parlait à la vraie URL avec une clé `mock-key`).
- Création automatique de l'utilisateur de test (`signUp` auto-confirmé en local)
  puis connexion — les politiques RLS ciblent `TO authenticated`.

Deux comportements sans ambiguïté :
- **Stack joignable** → requêtes authentifiées, attentes strictes (`error: null`).
- **Stack absente** → skip silencieux, **aucune requête réseau** (le ping a déjà tranché).

### Tests unitaires (75 tests, 0 échecs)

| Module | Fichier | Tests | Couverture |
|--------|---------|-------|------------|
| format.ts | `src/lib/__tests__/format.test.ts` | 20 | ✅ Complète |
| useDebounce | `src/hooks/__tests__/use-debounce.test.ts` | 9 | ✅ Complète |
| Pagination | `src/components/ui/__tests__/pagination.test.tsx` | 11 | ✅ Complète |
| compressImage | `src/lib/__tests__/image.test.ts` | 9 | ✅ Mocks Canvas |

### Détails des tests

#### format.ts (20 tests)
- `formatXOF` : zéro, petits nombres, séparateur locaux, grands nombres, arrondis, négatifs
- `formatDate` : chaîne ISO, objet Date, jours/mois à un chiffre, fin d'année
- `formatDateTime` : date/heure complète, minuit
- `generateSKU` : préfixe PRD-, longueur, unicité, format alphanumérique
- `generateBarcode` : longueur 13, que des chiffres, unicité
- `generateSaleNumber` : préfixe V, format regex, année courante

#### useDebounce (9 tests)
- Valeur initiale, délai avant mise à jour, reset du timer
- Types variés (string, number, object)
- Délai par défaut (300ms), cleanup au démontage

#### Pagination (11 tests)
- Rendu des infos de page, singulier/pluriel, "Aucun résultat"
- Boutons précédent/suivant disabled, navigation
- Ranges pour différentes pages, dernière page partielle
- Page unique, label de sélecteur de taille

#### compressImage (9 tests)
- Fichier non-image (passthrough), Canvas context null (fallback)
- Conversion JPEG → WebP, redimensionnement, dimensions conservées
- Paramètres par défaut, toBlob null (fallback)

### Phase 2 — Prochains tests à implémenter
- [ ] Tests d'intégration : flux création produit + lot, vente + stock
- [ ] Tests E2E (Playwright) : parcours utilisateur complet

---

## 📐 Configuration (prévue)

```typescript
// vitest.config.ts (futur)
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test-setup.ts"],
  },
});
```

---

## 📊 Métriques cibles

- **Couverture unitaire** : > 80%
- **Couverture intégration** : > 60%
- **Tests E2E** : Scénarios critiques couverts
- **Temps d'exécution** : < 5 min (CI/CD)

## 2026-10-05
- Playwright `/tmp/browser/activite` : page Activité chargée sans erreur, ouvertures de page comptées.
- Vérif API : modification produit → ligne `audit_log` (module produits, utilisateur correct).
- Playwright hors-ligne (`/tmp/browser/offline-e2e`) : saisie terrain, retour réseau, conflits, transferts — OK.


## Livraison Hôtel — 2026-11-10
Six tests hotel.test.ts : nuits, total/solde, chevauchements, occupation, accès Hôtel et séparation Stock. Playwright authentifié : création de type/chambre et séjour, consommation libre, PDF réel, départ, tâche ménage et chambre Libre relue ; aucune erreur JavaScript ; capture mobile 390×844.
