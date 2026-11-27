# 🚀 Déploiement — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## 📋 Prérequis

- Node.js ≥ 20
- Bun ≥ 1.0 (recommandé)
- Compte Supabase
- Nom de domaine (optionnel)

---

## 🌐 Environnements

| Environnement | URL | Base de données |
|---------------|-----|-----------------|
| Développement | `localhost:3000` | Supabase dev |
| Preview (Lovable) | URL Lovable | Supabase dev |
| Production | À définir | Supabase prod |

---

## 🔧 Build

```bash
# Build de production
bun run build

# Preview du build
bun run preview
```

Le build génère un dossier `dist/` qui peut être déployé.

---

## 🏛 Hébergement

### Option 1 : Lovable (actuel)
- Déploiement automatique via Lovable
- Preview URL générée automatiquement
- Sync avec GitHub

### Option 2 : Vercel (recommandé pour production)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Option 3 : Supabase Hosting
- Hébergement statique du client buildé
- + Supabase pour le backend

### Option 4 : Serveur VPS
- Docker (voir ci-dessous)
- Nginx reverse proxy
- PM2 pour le process management

---

## 🐳 Docker (futur)

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server/index.mjs"]
```

```yaml
# docker-compose.yml (futur)
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
```

---

## 🔐 Variables d'environnement

| Variable | Valeur | Où |
|----------|--------|-----|
| `VITE_SUPABASE_URL` | URL Supabase | .env, Dashboard |
| `VITE_SUPABASE_ANON_KEY` | Clé anon Supabase | .env, Dashboard |

---

## 📝 CI/CD (à mettre en place)

```yaml
# .github/workflows/deploy.yml (futur)
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint
      - run: bun run test
      - run: bun run build
      - run: vercel --prod
```

---

## 📊 Monitoring (à mettre en place)

- **Sentry** — Gestion des erreurs
- **Supabase Dashboard** — Monitoring BDD
- **Vercel Analytics** — Performance

---

## 🔄 Procédure de déploiement

### Nouvelle version
1. `git checkout -b release/v1.x.x`
2. Mettre à jour les versions dans les fichiers .md
3. `bun run build`
4. Tester localement `bun run preview`
5. Merge sur `main`
6. Déployer

### Rollback
1. Revenir à la version précédente dans Git
2. Redéployer
3. Vérifier les données (migrations)

---

## 💾 Sauvegardes, RPO et RTO

L'ERP porte la vérité du stock et des ventes : une perte de base n'est pas
récupérable à la main. La sauvegarde n'est utile que si elle est **restaurée et
vérifiée** régulièrement.

### Objectifs de service

| Indicateur | Cible | Signification |
|---|---|---|
| **RPO** (perte de données max.) | **15 minutes** | Sauvegarde automatique Supabase (PITR) + export logique quotidien |
| **RTO** (remise en service max.) | **2 heures** | Restauration d'un dump + vérifications + redéploiement |

> Sur l'offre Supabase gratuite, le PITR n'est pas disponible : le RPO réel
dépend de la fréquence des exports (viser 24 h maximum, 15 min en payant).

### Sauvegarde

- **Automatique** : snapshots quotidiens et PITR côté Supabase (selon l'offre).
- **Logique quotidienne** : `./scripts/backup.sh` (nécessite `pg_dump` et
  `SUPABASE_DB_URL`). Le script produit un `.dump` compressé + empreinte
  SHA-256 dans `backups/`.
- **Hors site** : copier chaque dump vers un stockage distinct du fournisseur
  (S3/B2 chiffré, disque chiffré), avec rétention 30 jours.
- **Secrets** : ne jamais versionner les dumps ni `SUPABASE_DB_URL`.

```bash
export SUPABASE_DB_URL="postgresql://postgres:...@db.<projet>.supabase.co:5432/postgres"
./scripts/backup.sh
```

### Restauration (trimestrielle, obligatoire)

À exécuter sur une **base de test**, jamais en production sans validation :

```bash
CONFIRM_RESTORE=yes ./scripts/restore.sh backups/kitoko-AAAAJJHH-DDMMSS.dump
```

Vérifications après restauration :

1. Connexion et affichage du tableau de bord (KPI non nuls).
2. Une vente de test de bout en bout (stock décrémenté, ticket imprimé).
3. Contrôle des rôles : un compte `vendeur` ne voit pas les rapports.
4. Comparaison du nombre de lignes `sales`, `products`, `lots` avec la production.
5. Consignation de la date, du dump utilisé et du résultat dans `LOGBOOK.md`.

### À retenir

- Une sauvegarde non testée **n'est pas** une sauvegarde.
- Tester la restauration au moins **une fois par trimestre** et après tout
  changement de schéma majeur.

---

## 🚦 Mise en service de la version du 2026-11-06

Trois actions ne peuvent pas être faites depuis le dépôt : elles exigent la base
Supabase réelle ou le poste de l'utilisateur. **État au 2026-11-06 : non réalisées**
(aucune CLI Supabase ni aucun binaire `pg_dump`/`pg_restore` dans l'environnement
de développement ; les réglages sont stockés dans le navigateur).

- [x] **1. Appliquer la migration `20261106090000_audit_logs.sql`** — ✅ vérifié le
  2026-11-06 dans l'éditeur SQL : `to_regclass('public.audit_logs')` renvoie
  `audit_logs` et les triggers `audit_*` couvrent **27 tables** (3 événements chacune).
  Colonnes (`table_name`, `record_id`, `action`, `actor_id`, `changes`, `created_at`)
  et policy `audit read owners` (SELECT, `authenticated`) conformes à l'écran.
  ```bash
  supabase link --project-ref <ref-projet>
  supabase migration list   # doit montrer 20261106090000 en local seulement
  supabase db push
  ```
  Contrôle : ouvrir `/activite` → onglet « Modifications » ; l'avertissement « migration non appliquée »
  doit disparaître, puis modifier un produit et vérifier qu'une ligne apparaît.
  Sans migration, le reste de l'application fonctionne normalement.

  > La base distante trace 27 tables (`audit_*` sur les référentiels, `profiles`,
  > `client_debts`, `debt_payments`, `purchase_orders`, `purchase_order_items`,
  > `sav_*`, `serial_numbers`, `stock_locations`, `stock_transfers`,
  > `stock_transfer_items`, `supplier_returns`, `inventory_*`) et conserve un
  > trigger métier `log_audit('achats')` sur les achats. La migration
  > `20261106130000_audit_logs_full_coverage.sql` aligne le dépôt sur cette
  > couverture 27 tables sans remplacer les triggers existants.

- [x] **2. Renseigner le taux de change réel** — déclaré fait le 2026-11-06
  (réglage `localStorage`, non inspectable depuis le dépôt).
  - `/parametres` → Devise de base (ex. `XOF`), devise secondaire (ex. `USD`), taux
    « 1 USD = X XOF », puis devise d'affichage.
  - Le taux et la devise d'affichage sont dans `localStorage` (`indus-erp-settings`) :
    à refaire **sur chaque navigateur/poste**. La valeur par défaut (`600`) est dans
    `src/lib/app-settings.ts` si vous voulez un défaut unique pour l'entreprise.
  - Ne basculer l'affichage en USD **qu'après** avoir saisi un taux non nul, sinon
    les montants seraient affichés avec un taux de 1.

- [x] **3. Tester une restauration réelle sur une base de test** — déclaré fait le
  2026-11-06 ; consigner le fichier de dump, la date et le résultat ci-dessous.
  ```bash
  export SUPABASE_DB_URL="postgresql://postgres:...@db.<projet-test>.supabase.co:5432/postgres"
  ./scripts/backup.sh
  CONFIRM_RESTORE=yes ./scripts/restore.sh backups/kitoko-<horodatage>.dump
  ```
  Prérequis : PostgreSQL 15+ (`pg_dump`, `pg_restore`) installé. Sur cette machine,
  ces binaires sont absents — installer les outils client PostgreSQL avant le test.
### Journal des restaurations

| Date | Dump | Résultat | Vérifié par |
|---|---|---|---|
| 2026-11-06 | (déclaré par l'utilisateur) | à consigner | — |

---

## 📋 Checklist pré-déploiement

- [ ] Tests passent
- [ ] Lint OK
- [ ] Build OK
- [ ] Variables d'environnement configurées
- [ ] Migrations appliquées
- [ ] Documentation mise à jour
- [ ] Versions mises à jour
- [ ] Backup base de données
