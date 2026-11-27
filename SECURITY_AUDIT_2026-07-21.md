# 🔒 Rapport d'Audit de Sécurité — INDUS-ERP

**Date** : 2026-07-21
**Auditeur** : Agent Buffy (Architecte Logiciel Principal)
**Version du projet** : 1.0.0
**Scope** : Code source, base de données (RLS), configuration, dépendances

---

## 📋 Résumé Exécutif

| Domaine | Score | Risque |
|---------|-------|--------|
| RLS PostgreSQL | 8/10 | 🟢 Faible |
| Authentification | 8/10 | 🟢 Faible |
| Autorisation (Rôles) | 7/10 | 🟡 Moyen |
| Protection XSS/CSRF | 9/10 | 🟢 Faible |
| Gestion des secrets | 6/10 | 🟡 Moyen |
| Configuration CORS | 7/10 | 🟡 Moyen |
| Dépendances (npm) | 5/10 | 🟡 Moyen |
| Logging & Monitoring | 4/10 | 🔴 Élevé |

**Score global de sécurité : 6.8/10**

### ✅ Points forts
- React échappe automatiquement les expressions JSX (protection XSS native)
- Toutes les tables ont RLS activé ✅
- Fonctions SECURITY DEFINER avec `SET search_path = public` ✅
- `handle_new_user()` et `update_updated_at_column()` révoquées de PUBLIC ✅
- `lot_stock` view en `security_invoker = on` ✅
- Pas de `dangerouslySetInnerHTML` ou `eval()` dans le code ✅
- Service role key isolé dans `client.server.ts` avec avertissements ✅

### ⚠️ Vulnérabilités corrigées
1. **🔴 Critique**: RLS `stock_movements`, `sales`, `sale_items`, `inventory_sessions`, `inventory_counts` — Politiques INSERT/UPDATE sans vérification de rôle (seulement `auth.uid() IS NOT NULL`)
2. **🔴 Critique**: `.env` manquant dans `.gitignore` — Risque de commit de secrets

### 🔴 Vulnérabilités restantes
3. **🔴 Aucun test de sécurité** — Pas de revue automatisée
4. **🟡 Pas de Rate Limiting** — Vulnérabilité au brute-force
5. **🟡 Pas de journalisation structurée** — Impossible de tracer les incidents
6. **🟡 Pas de monitoring** (Sentry, etc.) — Aveugle en production
7. **🟡 Pas de `npm audit` dans CI/CD** — Vulnérabilités non détectées
8. **🟢 Pas de Content Security Policy (CSP)** headers

---

## 1. Analyse des Politiques RLS

### ✅ Conforme (RLS correctes)
| Table | Lecture | Écriture | Statut |
|-------|---------|----------|--------|
| `profiles` | Propriétaire ✅ | Propriétaire ✅ | ✅ |
| `user_roles` | Propriétaire ✅ | Propriétaire (via trigger) ✅ | ✅ |
| `categories` | Tous ✅ | Propriétaire/Magasinier ✅ | ✅ |
| `suppliers` | Tous ✅ | Propriétaire/Magasinier ✅ | ✅ |
| `products` | Tous ✅ | Propriétaire/Magasinier ✅ | ✅ |
| `lots` | Tous ✅ | Propriétaire/Magasinier ✅ | ✅ |
| `clients` | Tous ✅ | Propriétaire/Caissier ✅ | ✅ |
| `expenses` | Propriétaire ✅ | Propriétaire ✅ | ✅ |

### ⚠️ Corrigées (étaient vulnérables)
| Table | Politique OLD (vulnérable) | Politique NEW (corrigée) |
|-------|---------------------------|--------------------------|
| `stock_movements` | `auth.uid() IS NOT NULL` | `has_role('proprietaire') OR has_role('magasinier')` |
| `sales` | `auth.uid() IS NOT NULL` | `has_role('proprietaire') OR has_role('caissier')` |
| `sale_items` | `auth.uid() IS NOT NULL` | `has_role('proprietaire') OR has_role('caissier')` |
| `inventory_sessions` | `auth.uid() IS NOT NULL` | `has_role('proprietaire') OR has_role('magasinier')` |
| `inventory_counts` | `auth.uid() IS NOT NULL` | `has_role('proprietaire') OR has_role('magasinier')` |

### 🔒 Fonctions de sécurité

| Fonction | Protection | Statut |
|----------|------------|--------|
| `has_role()` | SECURITY DEFINER + SET search_path | ✅ |
| `handle_new_user()` | Révoquée de PUBLIC, anon, authenticated | ✅ |
| `update_updated_at_column()` | Révoquée de PUBLIC, anon, authenticated | ✅ |

---

## 2. Authentification & Sessions

### Supabase Auth
| Aspect | État | Détails |
|--------|------|---------|
| JWT | ✅ | Signé RS256, géré par Supabase |
| Session localStorage | ✅ | `persistSession: true` côté client |
| Session SSR | ✅ | Bearer token via middleware |
| Token refresh | ✅ | `autoRefreshToken: true` |
| Mot de passe min | ⚠️ | 6 caractères (minimum Supabase) |

### Vérification du token (auth-middleware.ts)
```typescript
// ✅ Validation du format JWT (3 parties)
if (token.split('.').length !== 3) throw new Error('Invalid token');

// ✅ Vérification des claims
const { data, error } = await supabase.auth.getClaims(token);
```

---

## 3. Protection XSS/CSRF

| Attaque | Protection | Statut |
|---------|------------|--------|
| XSS (React) | Échappement automatique JSX | ✅ |
| XSS (dangerous HTML) | `dangerouslySetInnerHTML` non utilisé | ✅ |
| XSS (URL) | URLs stockées dans Supabase Storage | ✅ |
| CSRF | JWT Bearer token + SameSite cookies | ✅ |
| SQL Injection | Supabase client SDK (requêtes paramétrées) | ✅ |

---

## 4. Protection des Données

### Chiffrement
| Niveau | Mécanisme | Statut |
|--------|-----------|--------|
| En transit | HTTPS (TLS 1.3) via Supabase | ✅ |
| Au repos | Chiffrement PostgreSQL (Supabase) | ✅ |
| Mots de passe | bcrypt (Supabase Auth) | ✅ |
| JWT | RS256 | ✅ |

### Stockage des fichiers
| Bucket | Accès lecture | Accès écriture | Statut |
|--------|---------------|-----------------|--------|
| `product-photos` | Tous authentifiés ✅ | Authentifié ✅ | ✅ |
| `certificats` | Tous authentifiés ✅ | Authentifié ✅ | ✅ |

⚠️ **Note**: Les buckets storage sont accessibles en écriture par tout utilisateur authentifié. Pour une sécurité renforcée, les politiques storage devraient aussi vérifier les rôles.

---

## 5. Gestion des Secrets

| Secret | Stockage | Risque | Statut |
|--------|----------|--------|--------|
| `VITE_SUPABASE_URL` | `.env` / Dashboard Lovable | Faible (URL publique) | ✅ |
| `VITE_SUPABASE_ANON_KEY` | `.env` / Dashboard Lovable | Faible (clé publique) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard Lovable uniquement | **Élevé** (bypass RLS) | ⚠️ |
| JWT Tokens | localStorage | Moyen (XSS = vol token) | ⚠️ |

### Problème critique (corrigé)
- ❌ `.env` **n'était PAS** dans `.gitignore` avant ce rapport ✅ Maintenant corrigé

### Recommandations
- ✅ Rotation régulière des clés Supabase
- ✅ Ne jamais utiliser `SUPABASE_SERVICE_ROLE_KEY` côté client (prévention par code comments)

---

## 6. Dépendances (npm)

⚠️ **Impossible de scanner** — Aucun fichier lock (bun.lock, package-lock.json) trouvé.

### Recommandations
1. ✅ Générer un fichier lock pour les audits futurs : `bun install --frozen-lockfile`
2. ✅ Ajouter `npm audit` dans le pipeline CI/CD
3. ✅ Mettre à jour régulièrement les dépendances

---

## 7. Headers HTTP & CORS

| Header | Présent | Statut |
|--------|---------|--------|
| `X-Content-Type-Options: nosniff` | ✅ | ✅ |
| `X-Frame-Options: DENY` | ✅ (via Nitro) | ✅ |
| `X-XSS-Protection: 1; mode=block` | ✅ (via Nitro) | ✅ |
| `Referrer-Policy` | ✅ (via Nitro) | ✅ |
| `Content-Security-Policy` | ❌ Non configuré | 🔴 |
| `Strict-Transport-Security` | ❌ Non configuré | 🟡 |

La configuration des headers est gérée par Nitro (serveur SSR TanStack Start).
CORS est configuré via le tableau de bord Supabase (pas dans le code).

---

## 8. Logging & Monitoring

| Aspect | État | Statut |
|--------|------|--------|
| Logs erreurs | `console.error()` uniquement | ❌ |
| Logs auth | Supabase dashboard | ✅ |
| Logs stockage | Supabase dashboard | ✅ |
| Monitoring | Aucun | ❌ |
| Alertes | Aucune | ❌ |
| Sentry / alternative | Non configuré | ❌ |

---

## 9. Recommandations Prioritaires

### 🔴 Critique (action immédiate)
1. ✅ **FAIT** — Correction des politiques RLS pour `stock_movements`, `sales`, `sale_items`, `inventory_sessions`, `inventory_counts`
2. ✅ **FAIT** — Ajout de `.env` dans `.gitignore`
3. 🔴 Ajouter un Content-Security-Policy (CSP) header
4. 🔴 Ajouter Rate Limiting sur les routes d'authentification

### 🟡 Important (courte terme)
5. 🟡 Ajouter `npm audit` dans le pipeline CI/CD
6. 🟡 Configurer Supabase Realtime pour les alertes de sécurité
7. 🟡 Implémenter une journalisation structurée (winston/pino côté serveur)
8. 🟡 Ajouter Sentry (ou alternative) pour le monitoring des erreurs
9. 🟡 Renforcer les politiques Storage avec vérification des rôles
10. 🟡 Ajouter un test de sécurité automatisé (ZAP, etc.)

### 🟢 Normal (moyen terme)
11. 🟢 Générer un fichier lock pour les dépendances
12. 🟢 Configurer Strict-Transport-Security header
13. 🟢 Ajouter la vérification email obligatoire
14. 🟢 Rotation automatique des clés

---

## 10. Conclusion

**Score : 6.8/10** — Base de sécurité solide. Les vulnérabilités critiques (RLS sans vérification de rôle, `.env` non ignoré) ont été corrigées. Les efforts restants doivent se concentrer sur le monitoring, les tests de sécurité automatisés, et le Rate Limiting.
