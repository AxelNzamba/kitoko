# 🔑 Comptes — INDUS-ERP (environnement LOCAL uniquement)

> **Dernière mise à jour** : 2026-09-15

> ⚠️ **Ne jamais committer ce fichier avec de vrais identifiants de production.**
> Ces identifiants ne sont valables que pour la stack Supabase **locale** (Docker).

---

## 👤 Compte administrateur

| Champ | Valeur |
|---|---|
| **Email** | `admin@brightservices.cg` |
| **Mot de passe** | `Bright2026!` |
| **Rôle** | Propriétaire (accès complet) |
| **ID utilisateur** | `2def3f99-8083-4114-a407-9b86268e9317` |
| **Créé le** | 2026-09-13 |

> Le mot de passe a été réinitialisé le 2026-09-15 (l'ancien était perdu — hash bcrypt
> illisible). Réinitialisation effectuée directement en base via :
> ```sql
> UPDATE auth.users
> SET encrypted_password = crypt('Bright2026!', gen_salt('bf', 10)), updated_at = now()
> WHERE email = 'admin@brightservices.cg';
> ```

---

## 🔗 URLs locales

| Service | URL |
|---|---|
| Application (Vite dev) | http://localhost:8080/ |
| Page de connexion | http://localhost:8080/auth |
| Réinitialisation de mot de passe | http://localhost:8080/reset-password |
| Supabase Studio | http://127.0.0.1:54323 |
| API Supabase (Kong) | http://127.0.0.1:54321 |
| PostgreSQL direct | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| **Inbucket** (boîte mail de test) | http://127.0.0.1:54324 |

---

## ✉️ Mot de passe oublié — fonctionnement en local

1. Sur `/auth` → onglet **Connexion** → lien **« Mot de passe oublié ? »**
2. Saisir l'email → Supabase Auth envoie un email de récupération.
3. En local, l'email n'est pas vraiment envoyé : il est capturé par **Mailpit/Inbucket**
   → ouvrir http://127.0.0.1:54324 et cliquer sur le message.
4. Le lien contenu dans l'email redirige vers `/reset-password#...` où un nouveau
   mot de passe peut être défini.

> ✅ **Flux complet testé de bout en bout** (test E2E `auth-reset-flow.spec.ts`, 4/4) :
> demande → email → clic sur le lien → nouveau mot de passe → reconnexion.
> Le mot de passe ci-dessus reste valable après le test (double cycle : temporaire
> puis restauration).

### Comptes créés par les tests E2E

- `signup.e2e@indus-erp.com` / `Signup2026!` — créé et **confirmé** par
  `auth-signup-flow.spec.ts` (purge + re-création à chaque exécution).
- `test@indus-erp.com` / `test-password-123` — utilisateur de test des tests
d'intégration (créé automatiquement par `src/test/integration/setup.ts`).
- `probe.signup@indus-erp.com` — résidu de sonde manuelle, purgé.

### Confirmations email en local

`[auth.email] enable_confirmations = true` est actif (production-like) : un nouvel
inscrit reçoit « Confirm your email address » (visible dans Mailpit) et ne peut se
connecter qu'après avoir cliqué le lien. Les inscriptions créées avant l'activation
restent confirmées.

### Réinitialisation manuelle (sans email)

En cas de problème avec le flux email, réinitialiser directement en base :

```bash
docker exec supabase_db_local psql -U postgres -d postgres \
  -c "UPDATE auth.users SET encrypted_password = crypt('NOUVEAU_MDP', gen_salt('bf', 10)), updated_at = now() WHERE email = 'admin@brightservices.cg';"
```

Puis redémarrer la session côté application (déconnexion/reconnexion).

---

## 🛡️ Rappel sécurité

- **Politique de mot de passe** (nouveaux mots de passe uniquement — inscription et
  réinitialisation) : 8 caractères minimum, au moins une majuscule et un chiffre
  (`src/lib/password-policy.ts` + garde-fou GoTrue `minimum_password_length = 8`,
  `password_requirements = "lower_upper_letters_digits"`). Les comptes créés avant
  l'activation gardent leur mot de passe d'origine.
- Changer ce mot de passe avant toute mise en production.
- Sur l'instance Supabase cloud (production), utiliser le dashboard
  **Authentication → Users → Send password recovery** plutôt qu'un UPDATE SQL.
- Les mots de passe sont hashés bcrypt — jamais stockés en clair.
