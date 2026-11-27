# 🛡 Rapport d'Audit Sécurité — Revue OWASP Top 10 (2021)

> **Date** : 2026-09-15
> **Auditeur** : Agent Buffy (Architecte Logiciel Principal)
> **Périmètre** : application INDUS-ERP (TanStack Start + Supabase), code + configuration
> **Référentiel** : [OWASP Top 10:2021](https://owasp.org/Top10/)
> **Rapport précédent** : [SECURITY_AUDIT_2026-07-21.md](./SECURITY_AUDIT_2026-07-21.md)

---

## 📋 Synthèse

| # OWASP | Catégorie | Verdict | Commentaire |
|---------|-----------|---------|-------------|
| A01 | Broken Access Control | ✅ Conforme | RLS sur toutes les tables métier, politiques par rôle, garde client+serveur |
| A02 | Cryptographic Failures | ✅ Conforme | Mots de passe bcrypt (GoTrue), TLS en production, pas de secret côté client |
| A03 | Injection | ✅ Conforme | PostgREST paramétré, Zod sur toutes les entrées de formulaires |
| A04 | Insecure Design | ✅ Conforme | Flux auth production-like, rôles adaptés aux besoins métier |
| A05 | Security Misconfiguration | ⚠️ Partiel | Headers sécurité présents ; CORS/Sentry à finaliser au déploiement |
| A06 | Vulnerable Components | ⚠️ Partiel | `bun run audit` en CI ; aucune vulnérabilité high/critique détectée à ce jour |
| A07 | Auth Failures | ✅ Conforme | Politique 8+/majuscule/chiffre, confirmation email, rate limiting client |
| A08 | Integrity Failures | ✅ Conforme | CI avec lockfile figé (`--frozen-lockfile`), pas de désérialisation non sûre |
| A09 | Logging & Monitoring Failures | ✅ Conforme | Sentry câblé client+serveur+boundary, logs structurés, user context sans PII |
| A10 | SSRF | ✅ Conforme | Aucune URL fournie par l'utilisateur n'est résolue côté serveur |

**Verdict global : application robuste pour une PME. 8/10 catégories pleinement couvertes,
2 partielles (A05, A06) dont la finalisation dépend du déploiement production (secrets,
dashboard Supabase).**

---

## Détail par catégorie

### A01 — Broken Access Control ✅

- **RLS activée** sur toutes les tables métier (products, sales, stock_movements,
  warehouses, user_roles, stock_transfers, supplier_returns, credits, serial_numbers…)
  — politiques `TO authenticated` avec vérification de rôle via `has_role(auth.uid())`
- Séparation Propriétaire / Magasinier / Caissier alignée sur le besoin (POS limité
  aux ventes, kiosque restreint à `/ventes` + `/scanner` via `KIOSK_ROUTES`)
- Route guard `_authenticated` : session locale + vérification serveur `getUser()`,
  401/403 → redirection `/auth` ; les erreurs réseau ne déconnectent pas (mode terrain)
- Storage : buckets `product-photos` / `certificats` avec vérification de rôle sur
  INSERT/UPDATE/DELETE (audit du 2026-07-21)

### A02 — Cryptographic Failures ✅

- Mots de passe hachés bcrypt par Supabase Auth (aucun mot de passe en clair)
- Pas de chiffrement maison ; les secrets (`SERVICE_ROLE_KEY`, tokens Vercel/Sentry)
  restent côté serveur / CI — jamais dans le bundle client
- `.env` correctement exclu du dépôt (`.gitignore`)

### A03 — Injection ✅

- Accès base via supabase-js (PostgREST) : requêtes paramétrées, pas de SQL construit
  par concaténation ; les rares fonctions SQL (`has_role`, triggers) sont des migrations figées
- Validation **Zod** sur tous les formulaires (login, signup, reset, produits, lots,
  clients…) — schémas centralisés (`password-policy.ts`, formulaire par module)
- React échappe le rendu par défaut ; pas de `dangerouslySetInnerHTML` dans le code applicatif

### A04 — Insecure Design ✅

- Confirmation d'email obligatoire avant première connexion (production-like, y compris local)
- Politique de mot de passe appliquée à la création ET à la réinitialisation, jamais à la
  connexion (pas de verrouillage des comptes existants — décision DEC-008)
- Attribution du rôle au premier compte (propriétaire) via trigger SQL, pas côté client

### A05 — Security Misconfiguration ⚠️ (action requise au déploiement)

Présent :
- `vercel.json` : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` caméra/micro/géo
  fermées, cache immutable sur `/assets/*`
- Rate limiting applicatif sur login/signup (client)
- `.env.example` documenté sans vraies valeurs

À faire lors de la mise en production :
1. **Middleware CSRF activé** (fait le 2026-09-15, `src/start.ts`) — vérifier que
   `VITE_APP_URL` correspond au domaine réel déployé (allow-list `origin`)
2. Compléter `Permissions-Policy` avec `camera=(self)` si le scan QR doit rester utilisable
3. Dashboard Supabase : activer les alertes auth (Auth Hooks → détection de pousses de
   comptes, rate limits d'API)
4. Restreindre les clés (`VITE_*` publiques attendues ; `SERVICE_ROLE_KEY` jamais exposée)

### A06 — Vulnerable Components ⚠️ (process continu)

- `bun run audit` (npm audit --audit-level=high) exécuté dans la CI à chaque push
- Dépendances récentes (React 19, Vite 8, TanStack 1.170+, Sentry 10.x)
- Recommandation : activer Dependabot en mode « security updates » (déjà dans le TODO)

### A07 — Identification and Authentication Failures ✅

- **Longueur minimale 8** + majuscule + minuscule + chiffre — client (Zod) **et** serveur
  (`GOTRUE_PASSWORD_MIN_LENGTH=8`, `password_requirements=lower_upper_letters_digits`),
  refus serveur `422 weak_password` vérifié
- **Confirmation d'email** avant activation de la session (connexion refusée sinon)
- **Rate limiting** login (5/min) et signup (3/5 min) côté client — messages FR explicites
- Messages d'erreur génériques (« Identifiants incorrects ») : pas d'énumération de comptes
- Sessions persistées avec rotation automatique du refresh token (supabase-js)
- Le lien de récupération établit une session `type=recovery` ; le changement de mot de
  passe passe par `updateUser` authentifié

### A08 — Software and Data Integrity Failures ✅

- `bun install --frozen-lockfile` en CI (pas de dérive de dépendances)
- Pas d'évaluation de code dynamique (`eval`/`new Function` absents du code applicatif)
- Données hors-ligne : miroir Dexie avec file d'attente + résolution de conflits explicite
  ( Centre de synchronisation) — pas d'écriture serveur aveugle

### A09 — Security Logging and Monitoring Failures ✅

- **Sentry** câblé aux trois niveaux : client (`__root.tsx`), serveur SSR (`server.ts`),
  middleware request (`start.ts`) + `captureException` sur les boundaries
- Contexte utilisateur attaché via `setSentryUser({ id })` — **id seul, jamais d'email**
  (minimisation des PII)
- **Logger structuré** (`logger.info/warn/error`, niveau via `LOG_LEVEL`) à la place des
  `console.*` applicatifs ; les `console.*` restants sont limités au bootstrap
  (`integrations/supabase/client.ts` : message d'erreur de configuration bloquant)
- Sentry volontairement **silencieux en dev** (`beforeSend` retourne null hors production)
  : pas de pollution, à l'inverse les logs structurés restent locaux

### A10 — Server-Side Request Forgery (SSRF) ✅

- Aucune entrée utilisateur n'est utilisée comme URL cible côté serveur
- Les seules requêtes sortantes serveur : API Supabase (URL de config), Resend (clé API),
  Sentry (SDK) — toutes des destinations fixes de configuration

---

## 🎯 Plan d'action résiduel

| # | Action | Priorité | Bloquant production ? |
|---|--------|----------|----------------------|
| 1 | Renseigner `VITE_APP_URL` (domaine final) et vérifier l'allow-list CSRF | 🟡 | Oui |
| 2 | Activer les alertes de sécurité du dashboard Supabase | 🟡 | Non (recommandé) |
| 3 | Dependabot security updates | 🔵 | Non |
| 4 | Choisir/enregistrer le DSN Sentry production (voir ci-dessous) | 🟡 | Non (recommandé) |
| 5 | Re-run `bun run audit` avant chaque release | 🟡 | Non (déjà en CI) |

## 📌 À noter sur le monitoring

Le câblage Sentry est **complet et fonctionnel** : dès que `VITE_SENTRY_DSN` /
`SENTRY_DSN` sont définis (production), les erreurs remontent — rien d'autre à déployer.
En local, Sentry reste volontairement inactif (pas de DSN) : c'est le comportement voulu.
