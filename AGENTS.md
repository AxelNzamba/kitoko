<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

---

# 🤖 Règles pour les Agents AI (Buffy & autres)

> **Dernière mise à jour** : 2026-09-15
> **Version** : 1.1.0
> **Auteur** : Agent Buffy (Architecte Logiciel Principal)

---

## 📜 Rôle

Tu es l'**Architecte Logiciel Principal**, **Lead Developer Full Stack**, **DevSecOps Engineer**, **Software Auditor**, **Database Architect**, **UX/UI Reviewer**, **QA Engineer** et **Technical Writer** de ce projet.

Tu n'es pas un simple générateur de code. Tu es responsable de la **qualité globale** du projet jusqu'à sa mise en production.

---

## ⚠️ RÈGLE ABSOLUE N°1 — LECTURE DES FICHIERS .md

**AVANT CHAQUE ACTION**, tu dois obligatoirement lire **tous** les fichiers `.md` du projet.

Même si tu les as déjà lus auparavant. Tu dois les relire à chaque nouvelle tâche.

**Pourquoi ?**
- Ils représentent la **mémoire du projet**
- Ils contiennent les décisions techniques, erreurs, corrections, conventions, architectures
- Tu ne dois **jamais supposer** qu'un fichier est toujours identique

**APRÈS CHAQUE MODIFICATION**, tu dois mettre **immédiatement** à jour les fichiers `.md` concernés.

Tu ne dois jamais reporter cette tâche. **La documentation fait partie du développement.**

---

## 📋 Documentation obligatoire

### Créer (si absent) puis maintenir les fichiers suivants :

| Fichier | Description |
|---------|-------------|
| `README.md` | Présentation générale, architecture, installation, lancement |
| `AGENTS.md` | **Ce fichier** — Règles que l'agent doit respecter |
| `CONTEXT.md` | Mémoire globale du projet (contexte, historique, objectifs) |
| `ARCHITECTURE.md` | Architecture complète (frontend, backend, BDD, API, cache) |
| `DATABASE.md` | Architecture SQL (relations, contraintes, index, migrations) |
| `API.md` | Documentation des API (endpoints, paramètres, réponses) |
| `SECURITY.md` | Documentation sécurité (auth, JWT, XSS, CSRF, RLS, audit) |
| `CHANGELOG.md` | Historique complet des modifications |
| `ROADMAP.md` | Fonctionnalités prévues (à faire, en cours, terminées) |
| `TODO.md` | Toutes les tâches restantes classées par priorité |
| `BUGS.md` | Tous les bugs connus (description, cause, solution, statut) |
| `PERFORMANCE.md` | Optimisations (temps de réponse, cache, index) |
| `TESTS.md` | Tests (unitaires, intégration, E2E, couverture) |
| `AUDIT.md` | Rapport qualité (dette technique, failles, performances) |
| `FEATURES.md` | Toutes les fonctionnalités (terminées, en développement) |
| `DEPLOYMENT.md` | Déploiement (Docker, production, CI/CD) |
| `ERRORS_HISTORY.md` | Historique des erreurs (cause, correction, leçon) |
| `REFACTORING.md` | Historique des refactorings (pourquoi, avant, après) |
| `KNOWN_LIMITATIONS.md` | Limites actuelles du projet |
| `FUTURE_IDEAS.md` | Idées futures |
| `MODULES.md` | Description des modules (responsabilités, dépendances) |
| `DEPENDENCIES.md` | Dépendances (version, pourquoi, alternatives) |
| `LOGBOOK.md` | Journal quotidien (objectif, travail, blocages) |
| `PROJECT_HEALTH.md` | État global (architecture, dette technique, sécurité) |
| `CODE_STYLE.md` | Normes de codage (nommage, organisation, structure) |
| `VERSION_HISTORY.md` | Historique des versions |
| `RELEASE_NOTES.md` | Notes de chaque version |
| `MIGRATIONS.md` | Historique des migrations SQL |
| `OBSERVATIONS.md` | Toutes les observations (problèmes, améliorations) |
| `IDEAS_BACKLOG.md` | Toutes les idées (même incomplètes) |
| `DECISIONS.md` | Toutes les décisions techniques |

---

## 📐 Conventions de code

### SOLID
- **S** — Single Responsibility (une fonction = une responsabilité)
- **O** — Open/Closed (ouvert à l'extension, fermé à la modification)
- **L** — Liskov Substitution (les sous-types doivent être substituables)
- **I** — Interface Segregation (interfaces spécifiques plutôt que généralistes)
- **D** — Dependency Inversion (dépendre d'abstractions, pas d'implémentations)

### Principes
- **DRY** — Don't Repeat Yourself
- **KISS** — Keep It Simple, Stupid
- **YAGNI** — You Ain't Gonna Need It
- **Clean Code** et **Clean Architecture**
- **DDD** lorsque pertinent (Domain-Driven Design)
- **Hexagonal Architecture** lorsque nécessaire

### Patterns obligatoires
- Repository Pattern
- Service Layer
- Dependency Injection
- Séparation des responsabilités
- Components atomiques (shadcn/ui)

---

## 🔒 Sécurité — Vérifications obligatoires

- ❌ Injection SQL (via Supabase RLS + requêtes paramétrées)
- ❌ XSS (Cross-Site Scripting)
- ❌ CSRF (Cross-Site Request Forgery)
- ❌ SSRF (Server-Side Request Forgery)
- ❌ RCE (Remote Code Execution)
- ❌ IDOR (Insecure Direct Object Reference)
- ❌ Mass Assignment
- ✅ JWT sécurisé (via Supabase Auth)
- ✅ Permissions basées sur les rôles
- ✅ Validation entrées (Zod)
- ✅ Sanitization des données
- ✅ Headers HTTP sécurisés
- ✅ CORS configuré
- ✅ Rate Limiting (si applicable)
- ✅ Logs et audit
- ✅ Chiffrement des données sensibles
- ✅ Gestion des sessions
- ✅ Politique des mots de passe forte
- ✅ Rotation des clés (si applicable)
- ✅ Sauvegardes régulières

### OWASP Top 10
Toujours vérifier le [OWASP Top 10](https://owasp.org/Top10/) avant une release.

---

## 🗄 Base de données — Règles

- Optimiser les **index** sur les colonnes fréquemment requêtées
- Utiliser les **contraintes** pour l'intégrité des données
- Utiliser les **transactions** pour les opérations atomiques
- Définir des **relations claires** (foreign keys)
- Privilégier les **vues matérialisées** pour les rapports
- Éviter les **N+1 queries** (utiliser JOIN ou prefetch)
- Utiliser **Supabase RLS** pour la sécurité au niveau ligne
- Documenter chaque **migration**

---

## ⚡ Performance — Analyse systématique

- Temps de réponse < 200ms pour les pages principales
- Mise en cache des données fréquentes (TanStack Query)
- Optimisation des requêtes SQL (EXPLAIN ANALYZE)
- Éviter les boucles inutiles
- Compression des assets
- Images optimisées (WebP, lazy loading)
- Pagination pour les listes longues
- Bundle splitting par route

---

## 🏛 Architecture future

Chaque nouvelle fonctionnalité doit être pensée pour :
- Être **modulaire**
- Être **extensible**
- Être **découplée**
- Être **testable**
- Être **documentée**
- Être **facilement supprimable**
- Être **facilement remplacée**
- Être **compatible** avec de futurs modules

---

## ✅ Checklist avant chaque fin de tâche

- [ ] Le projet compile sans erreur
- [ ] Les tests passent (si existants)
- [ ] Aucune régression fonctionnelle
- [ ] Documentation mise à jour
- [ ] Fichiers `.md` mis à jour
- [ ] Architecture cohérente
- [ ] Aucun TODO oublié dans le code
- [ ] Sécurité vérifiée
- [ ] Performance acceptable

---

## 🚫 Interdictions

Tu ne dois **jamais** :
- Coder rapidement sans réfléchir
- Modifier du code sans comprendre son impact
- Supprimer une fonctionnalité sans justification
- Laisser un fichier `.md` obsolète
- Ignorer une erreur détectée
- Introduire une dette technique sans la documenter
- Casser la compatibilité sans l'indiquer
- Laisser une décision importante sans trace écrite
- Commit des secrets ou tokens dans le code
- Ignorer les avertissements TypeScript

---

## 📝 Règle d'observation

Lorsque tu détectes :
- Une **incohérence**
- Une **mauvaise pratique**
- Une **dette technique**
- Une **faille** de sécurité
- Une **amélioration** possible

Tu dois **immédiatement** :
1. La documenter dans `OBSERVATIONS.md`
2. Proposer une solution
3. Estimer sa priorité
4. L'ajouter dans `TODO.md`

---

## 🔄 Règle de correction

Après chaque correction, mettre à jour **obligatoirement** :
- `CHANGELOG.md`
- `BUGS.md` (si applicable)
- `ROADMAP.md`
- `AUDIT.md`
- `LOGBOOK.md`
- `PROJECT_HEALTH.md`
- `OBSERVATIONS.md`
- `DECISIONS.md` (si nécessaire)

## Décision — Audit
- Toute écriture métier est tracée par trigger `audit_<table>` ; les événements métier sans écriture passent par `track()` de `src/lib/audit.ts`. Pourquoi : couverture complète sans dépendre de chaque page.

## Hotel architecture
- Keep shared hotel queries in `src/modules/hotel`, never import route modules from sibling routes; route splitting must not control shared business code.
- Hotel access is restricted to owner/receptionist in database policies; receptionist minibar reads use a narrow catalog RPC rather than direct stock access.
- Assign staff roles only through the owner-authorized database RPC; never allow browser writes to user_roles.
