#!/usr/bin/env bash
# Sauvegarde logique de la base Kitoko Stock.
#
# Prérequis : pg_dump (PostgreSQL 15+) et SUPABASE_DB_URL, par exemple :
#   export SUPABASE_DB_URL="postgresql://postgres:motdepasse@db.<projet>.supabase.co:5432/postgres"
#
# Usage : ./scripts/backup.sh
# Sortie : backups/kitoko-<horodatage>.dump + empreinte SHA-256.

set -euo pipefail

: "${SUPABASE_DB_URL:?Définir SUPABASE_DB_URL avant de lancer la sauvegarde}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="${BACKUP_DIR}/kitoko-${STAMP}.dump"

mkdir -p "${BACKUP_DIR}"

echo "→ Sauvegarde vers ${TARGET}"
pg_dump \
  --no-owner \
  --no-privileges \
  --format=custom \
  --compress=9 \
  --file="${TARGET}" \
  "${SUPABASE_DB_URL}"

if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "${TARGET}" > "${TARGET}.sha256"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "${TARGET}" > "${TARGET}.sha256"
fi

echo "✓ Sauvegarde terminée : ${TARGET}"
echo "  Conservez une copie hors site (stockage objet, disque chiffré…)."
