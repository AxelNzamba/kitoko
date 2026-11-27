# 🔒 Sécurité — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

> **Rapport d'audit complet** : Voir [`SECURITY_AUDIT_2026-09-15.md`](./SECURITY_AUDIT_2026-09-15.md) (revue OWASP Top 10) et [`SECURITY_AUDIT_2026-07-21.md`](./SECURITY_AUDIT_2026-07-21.md)
> **Version** : 1.0.0

---

## 📋 Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans INDUS-ERP, couvrant l'authentification, l'autorisation, la protection des données et les bonnes pratiques.

---

## 🔐 Authentification (Supabase Auth)

### Mécanisme
- **Fournisseur** : Supabase Auth (email/mot de passe)
- **Type** : JWT (JSON Web Tokens)
- **Session** : Gérée automatiquement par Supabase client SDK
- **Stockage** : Cookies HTTP-only (côté serveur) + localStorage (côté client)

### Politique de mot de passe
- Longueur minimale : **8 caractères** (`minimum_password_length = 8` dans
  `supabase/config.toml` → `GOTRUE_PASSWORD_MIN_LENGTH=8`)
- Complexité : **au moins une minuscule, une majuscule et un chiffre**
  (`password_requirements = "lower_upper_letters_digits"`)
- Source unique côté client : `src/lib/password-policy.ts` (Zod) — message FR clair
  avant l'appel réseau ; le serveur GoTrue reste le garant ultime (refus `422 weak_password`)
- Appliquée **uniquement à l'inscription et à la réinitialisation** — jamais à la
  connexion, pour ne pas verrouiller les comptes créés avant l'activation

### Inscription
- Premier utilisateur = rôle `proprietaire` automatiquement
- Validation des entrées via Zod côté client
- **Confirmation d'email activée en local** (`[auth.email] enable_confirmations = true`,
  production-like) : le lien est capturé par Mailpit (http://127.0.0.1:54324) et
  redirige vers l'application (`site_url` aligné sur http://127.0.0.1:8080,
  allow-list wildcard `/**` requis pour les chemins type `/reset-password`)

---

## 🔑 Autorisation (RLS + Rôles)

### Architecture des rôles

| Rôle | Code | Description | Périmètre |
|------|------|-------------|-----------|
| Propriétaire | `proprietaire` | Accès complet admin | Toutes les opérations |
| Magasinier | `magasinier` | Gestion des stocks | Produits, lots, stock, inventaire |
| Caissier | `caissier` | Point de vente | Ventes uniquement |

### Row Level Security (RLS)

RLS est activé sur **toutes les tables** du schéma `public`. Les politiques sont :

```sql
-- Exemple : Politique de lecture (ouverte à tous les authentifiés)
CREATE POLICY "Lecture pour tous les utilisateurs authentifiés"
ON products FOR SELECT
TO authenticated
USING (true);

-- Exemple : Politique d'écriture (restreinte)
CREATE POLICY "Écriture pour propriétaire et magasinier"
ON products FOR INSERT
TO authenticated
USING (has_role('proprietaire', auth.uid()) OR has_role('magasinier', auth.uid()));
```

### Fonction utilitaire
```sql
CREATE FUNCTION has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE SQL STABLE;
```

---

## 🛡 Protection contre les attaques

### ❌ Injection SQL
- **Protection** : Supabase client SDK utilise des requêtes paramétrées
- **Aucune requête SQL brute** côté application

### ❌ XSS (Cross-Site Scripting)
- **Protection** : React échappe automatiquement les expressions JSX
- **Validation** : Zod pour toutes les entrées utilisateur
- **Headers** : Content-Type appropriés

### ❌ CSRF (Cross-Site Request Forgery)
- **Protection** : Supabase gère les tokens CSRF automatiquement
- **Mécanisme** : JWT signed + SameSite cookies

### ❌ IDOR (Insecure Direct Object Reference)
- **Protection** : RLS vérifie que l'utilisateur a le droit d'accéder aux données
- **Validation** : Les IDs UUID sont non prédictibles

### ❌ Mass Assignment
- **Protection** : Supabase RLS empêche l'insertion/mise à jour non autorisée
- **Validation** : Zod définit exactement les champs autorisés

### ❌ RCE (Remote Code Execution)
- **Protection** : Aucune exécution de code dynamique côté serveur
- **Dépendances** : Revue régulière des vulnérabilités (npm audit)

---

## 🌐 Headers HTTP

Configurés via TanStack Start / Nitro :

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🔄 CORS

- Configuré via Supabase (tableau de bord)
- Domaines autorisés limités au strict nécessaire

---

## 📁 Stockage (Supabase Storage)

### Buckets
| Bucket | Type | Politique |
|--------|------|-----------|
| `product-photos` | Public | Lecture : publique, Écriture : authentifié |
| `certificats` | Public | Lecture : publique, Écriture : authentifié |

### Upload
- Validation côté client (taille, type de fichier)
- URL signée pour les accès temporaires (si besoin)

---

## 📝 Logs et Audit

### Logs d'activité
- **Supabase** : Logs d'authentification (connexions, échecs)
- **Application** : Console.log pour les erreurs SSR (améliorable)
- **Stockage** : Logs d'accès aux fichiers

### Traçabilité
- `created_by` dans les tables clés (stock_movements, sales, expenses)
- `created_at` / `updated_at` sur toutes les tables
- Historique des mouvements de stock complet

---

## 🔐 Chiffrement

- **En transit** : HTTPS (TLS 1.3) via Supabase
- **Au repos** : Chiffrement PostgreSQL par défaut (Supabase)
- **Mots de passe** : Hashés par Supabase Auth (bcrypt)
- **JWT** : Signés avec RS256

---

## 🔑 Gestion des secrets

### Variables d'environnement
```env
VITE_SUPABASE_URL=           # URL du projet Supabase
VITE_SUPABASE_ANON_KEY=      # Clé publique (sans danger côté client)
```

### Règles
- ✅ `.env` dans `.gitignore`
- ✅ Aucun secret commité
- ✅ Clé anon seulement côté client (pas de clé service_role)
- ⚠️ Rotation des clés à planifier

---

## 📊 Sauvegardes

- **Automatique** : Supabase effectue des backups quotidiens
- **Période de rétention** : 7 jours (plan gratuit Supabase)
- **Manuel** : `supabase db dump` pour backup local

---

## 🧪 Audit de sécurité (Checklist)

### OWASP Top 10 (2021)

| # | Catégorie | Statut | Notes |
|---|-----------|--------|-------|
| A01 | Broken Access Control | ✅ | RLS + Rôles (corrigé le 2026-07-21) |
| A02 | Cryptographic Failures | ✅ | HTTPS + TLS |
| A03 | Injection | ✅ | Supabase paramétré |
| A04 | Insecure Design | ⚠️ | Revue régulière nécessaire |
| A05 | Security Misconfiguration | ⚠️ | `.gitignore` corrigé |
| A06 | Vulnerable Components | 🔄 | npm audit — lockfile manquant |
| A07 | Auth Failures | ✅ | Supabase Auth |
| A08 | Data Integrity Failures | ✅ | RLS + Contraintes |
| A09 | Logging Failures | ❌ | Aucune journalisation structurée |
| A10 | SSRF | ✅ | Pas d'appels serveur externes |

### Recommandations prioritaires

1. **🔴 Critique** : ✅ **FAIT** — Correction des politiques RLS pour `stock_movements`, `sales`, `sale_items`, `inventory_sessions`, `inventory_counts`
2. **🔴 Critique** : ✅ **FAIT** — `.env` ajouté au `.gitignore`
3. **🔴 Critique** : ✅ **FAIT (2026-07-21)** — `bun run audit` dans la CI (`.github/workflows/ci.yml`)
4. **🔴 Critique** : ✅ **FAIT (2026-09-15)** — Rate limiting branché sur login (5/min) et signup (3/5 min) via `rateLimiter` dans `auth.tsx` ; middleware CSRF TanStack sur les server functions
5. **🟡 Important** : ✅ **FAIT (2026-09-15)** — Journalisation structurée (`logger`) + Sentry câblé client/serveur/boundary avec contexte utilisateur sans PII
6. **🟡 Important** : Configurer les alertes de sécurité Supabase (dashboard, à faire au déploiement)
7. **🟡 Important** : ✅ **FAIT** — Politiques Storage avec vérification des rôles
8. **🟢 Normal** : ✅ **FAIT (2026-09-15)** — Confirmation email obligatoire (`[auth.email] enable_confirmations = true`)
9. **🟢 Normal** : Implémenter la rotation des clés automatique
10. **🟢 Normal** : ✅ **FAIT** — Index sur `created_by` pour les audits
11. **🔵 Faible** : ✅ **FAIT (2026-09-15)** — Documentation : revue OWASP complète dans `SECURITY_AUDIT_2026-09-15.md`

---

## 🚨 Alertes de sécurité Supabase

### Configuration des alertes

Supabase propose des alertes de sécurité dans le tableau de bord. Voici comment les configurer :

#### 1. Alertes Auth (Authentication)

| Alerte | Seuil recommandé | Action |
|-------|------------------|--------|
| Échecs de connexion | > 5 tentative en 5 min | Vérifier les logs d'accès, bloquer IP si nécessaire |
| Nouveaux utilisateurs | Inattendu | Vérifier la légitimité des inscriptions |
| Changement de mot de passe | Plus de 2 en 1h | Contacter les utilisateurs concernés |

#### 2. Alertes Database

| Alerte | Seuil recommandé | Action |
|-------|------------------|--------|
| Requêtes lentes | > 100ms p95 | Analyser via `EXPLAIN ANALYZE`, ajouter des index |
| Connexions simultanées | > 80% du pool | Scalabilité verticale ou pooling |
| Taille de la base | Croissance > 10%/semaine | Archiver les anciennes données |

#### 3. Alertes Storage

| Alerte | Seuil recommandé | Action |
|-------|------------------|--------|
| Upload par utilisateur anonyme | Toute tentative (non autorisée) | Vérifier les politiques RLS |
| Taille du bucket | > 80% du quota | Nettoyer les fichiers orphelins |

#### 4. Configuration dans Supabase Dashboard

1. Aller dans **Supabase Dashboard** → **Project Settings** → **Notifications**
2. Configurer les webhooks pour les événements critiques :
   - Échecs d'authentification répétés
   - Tentatives d'accès non autorisées (RLS violations)
   - Changements de politiques de sécurité
3. Ajouter une **alerte email** vers l'adresse du propriétaire
4. Activer les **logs** dans **Database** → **Logs Explorer**

#### 5. Vérification périodique

- **Hebdomadaire** : Vérifier les logs d'authentification
- **Mensuelle** : Revue des politiques RLS
- **Trimestrielle** : Audit de sécurité complet

---

## 📋 Procédures

### En cas d'incident
1. Isoler l'incident (révoquer les tokens si nécessaire)
2. Analyser les logs Supabase
3. Corriger la vulnérabilité
4. Déployer le correctif
5. Documenter dans [BUGS.md](./BUGS.md) et [ERRORS_HISTORY.md](./ERRORS_HISTORY.md)

### Revue de sécurité
- À chaque nouvelle fonctionnalité impliquant des données sensibles
- Avant chaque déploiement en production
- Après chaque modification des politiques RLS

## Journal d'audit (2026-10-05)
- `audit_log` : SELECT Propriétaire uniquement ; INSERT authentifié limité à `user_id = auth.uid()` (pas d'usurpation). Les triggers `SECURITY DEFINER` écrivent avec `auth.uid()`.
- Pas de UPDATE/DELETE possible sur le journal côté client (immuable).


## Livraison Hôtel — 2026-11-10
Produits/emplacements limités aux trois rôles Stock, avoirs Propriétaire/Caissier. Réceptionniste obtient seulement le catalogue minibar via RPC contrôlée. Rôles modifiés par RPC owner-only, Propriétaire non modifiable. Charges immuables après enregistrement et réservées aux séjours en cours.
