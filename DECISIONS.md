# 📐 Décisions Techniques — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

Chaque décision importante est documentée avec le contexte, les alternatives et l'impact.

---

## [DEC-001] Choix du Framework

- **Date** : 2026-07-17
- **Sujet** : Choix entre TanStack Start et Next.js

### Contexte
Besoin d'un framework SSR moderne avec routage type-safe.

### Alternatives
1. **Next.js (App Router)** — Plus mature, plus d'écosystème
2. **Remix** — Bon DX, moins populaire
3. **TanStack Start** — Léger, TypeScript natif, routage type-safe

### Décision
**TanStack Start** avec Vite 8.

### Raison
- Bundle plus léger
- TypeScript strict et type-safe routing
- Meilleure intégration avec TanStack Query
- Configuration Lovable pré-intégrée

### Impact
- Routage file-based avec types générés automatiquement
- SSR avec hydratation côté client
- Dépendance à l'écosystème TanStack

---

## [DEC-002] Choix du Backend

- **Date** : 2026-07-17
- **Sujet** : Supabase vs Firebase vs Backend custom

### Contexte
Besoin d'un BaaS avec auth, base de données, stockage.

### Alternatives
1. **Firebase** — Plus mature, Firestore NoSQL
2. **Appwrite** — Open source, auto-hébergé
3. **Supabase** — PostgreSQL natif, RLS puissant

### Décision
**Supabase**.

### Raison
- PostgreSQL relationnel (indispensable pour un ERP)
- RLS (Row Level Security) au niveau ligne
- Prix avantageux pour les PME
- Intégration facile avec TanStack

### Impact
- Schéma relationnel bien défini
- Sécurité au niveau base de données
- Pas de backend à maintenir

---

## [DEC-003] Choix de l'UI Library

- **Date** : 2026-07-17
- **Sujet** : shadcn/ui vs MUI vs Ant Design

### Contexte
Besoin de composants UI professionnels, accessibles, personnalisables.

### Alternatives
1. **MUI** — Très complet, bundle lourd
2. **Ant Design** — Beau mais lourd
3. **shadcn/ui** — Léger, copiable, personnalisable

### Décision
**shadcn/ui** (basé sur Radix UI).

### Raison
- Composants copiés dans le projet (pas de dépendance runtime)
- Basé sur Radix UI (accessible, headless)
- Personnalisable via Tailwind
- Bundle minimal
- Design system cohérent

### Impact
- 60+ composants disponibles
- Personnalisation facile
- Pas de dépendance à une lib lourde
- Maintenance des composants à notre charge

---

## [DEC-004] Design System

- **Date** : 2026-07-17
- **Sujet** : Palette de couleurs et typographie

### Contexte
Besoin d'une identité visuelle professionnelle adaptée à l'industrie.

### Alternatives
1. **Bleu corporate classique** — Sérieux mais banal
2. **Vert/forêt** — Associé à la nature
3. **Navy + Orange sécurité** — Industriel, professionnel

### Décision
**Navy industriel (#1a2a3a) + Orange sécurité (#e8751a)**.

### Raison
- Palette inspirée des équipements industriels
- Contrastes forts pour l'accessibilité
- Identité forte et mémorable
- Fonctionne en thème clair et sombre

### Impact
- Design system cohérent dans tout le projet
- Composants stylés via variables CSS
- Thème clair/sombre avec les mêmes couleurs adaptées

---

## [DEC-005] Validation des données

- **Date** : 2026-07-17
- **Sujet** : Zod vs Yup vs Joi

### Contexte
Besoin de validation côté client pour les formulaires.

### Alternatives
1. **Yup** — Populaire, bonne intégration React Hook Form
2. **Joi** — Puissant mais lourd pour le client
3. **Zod** — Léger, TypeScript natif, excellente inférence

### Décision
**Zod**.

### Raison
- Inférence TypeScript parfaite
- Très bonnes performances
- Intégration React Hook Form via @hookform/resolvers
- Syntaxe intuitive

### Impact
- Types dérivés automatiquement des schémas
- Validation côté client uniquement (RLS côté serveur)
- Bundle minimal

---

## [DEC-006] Génération de PDF

- **Date** : 2026-07-17
- **Sujet** : jsPDF vs pdf-lib vs Puppeteer

### Contexte
Besoin de générer des factures PDF côté client.

### Alternatives
1. **pdf-lib** — Moderne, manipulation PDF
2. **Puppeteer** — Trop lourd pour le client
3. **jsPDF** — Léger, mature, autotable disponible

### Décision
**jsPDF** + **jspdf-autotable**.

### Raison
- Léger (client-side)
- Bibliothèque autotable pour les tableaux
- Mature et documentée

### Impact
- Factures générées côté client
- Pas de serveur nécessaire
- Tables formatées automatiquement

---

## [DEC-007] Scan QR Code

- **Date** : 2026-07-17
- **Sujet** : html5-qrcode vs instascan vs caméra native

### Contexte
Besoin de scanner des QR codes pour l'inventaire et le POS.

### Alternatives
1. **instascan** — Simple, moins maintenu
2. **Caméra native** — Trop spécifique
3. **html5-qrcode** — Maintenu, flexible

### Décision
**html5-qrcode**.

### Raison
- Fonctionne avec la caméra du navigateur
- Supporte QR et codes-barres
- Configuration flexible
- Mature et maintenu

### Impact
- Scan depuis n'importe quel appareil avec caméra
- Fonctionne sur mobile et desktop
- Bibliothèque chargée dynamiquement (lazy)

---

## [DEC-008] Politique de mot de passe renforcée — 2026-09-15

### Contexte
Mots de passe à 6 caractères sans exigence de complexité (défaut Supabase) pour une
application de gestion d'entreprise multi-utilisateurs (Propriétaire/Magasinier/Caissier).

### Alternatives
1. Rester à 6 caractères — rejeté (NIST SP 800-63B recommande 8+, la longueur prime
   sur la complexité)
2. 12 caractères + symboles obligatoires — rejeté pour l'instant (friction utilisateur
   pour des PME ; réévaluer plus tard)
3. **8 caractères + majuscule + chiffre** — retenu

### Décision
- Client : `src/lib/password-policy.ts` (Zod) — source unique, appliquée à l'inscription
  et à la réinitialisation uniquement
- Serveur : `minimum_password_length = 8` + `password_requirements =
  "lower_upper_letters_digits"` dans `supabase/config.toml` (garde-fou ultime)
- **Jamais sur la connexion** : les comptes créés avant l'activation gardent leur mot de
  passe faible sans être bloqués

### Impact
- Comptes existants non impactés (migration zéro)
- 13 tests unitaires + 1 test E2E « mot de passe faible rejeté »
- Le même module expose la jauge de robustesse affichée dans les formulaires

---

## [DEC-009] Tests E2E auth strictement séquentiels — 2026-09-15

### Contexte
Les 3 suites E2E auth (flow, reset, signup) partagent Mailpit et le compte admin.
L'exécution parallèle (défaut Playwright) provoquait des courses : deux suites
demandaient simultanément un email de récupération pour le même compte.

### Décision
`playwright.config.ts` : `workers: 1` + `fullyParallel: false`. Les suites utilisent
déjà `test.describe.configure({ mode: "serial" })` en interne.

### Impact
- Run complet ~1 min (acceptable)
- Fiabilité deterministe : un email attendu ne peut plus être consommé par une autre suite


## Livraison Hôtel — 2026-11-10
Décisions structurelles Hôtel référencées dans AGENTS.md : requêtes hors routes, politiques par rôle, catalogue minibar limité et attribution owner-only.
