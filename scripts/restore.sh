#!/usr/bin/env bash
# Restauration d'une sauvegarde Kitoko Stock.
#
# ⚠️ OPÉRATION DESTRUCTIVE : écrase les objets présents dans la base cible.
# À exécuter d'abord sur une base de test, jamais directement en production.
#
# Prérequis : pg_restore, SUPABASE_DB_URL, et CONFIRM_RESTORE=yes.
#
# Usage :
#   CONFIRM_RESTORE=yes ./scripts/restore.sh backups/kitoko-20261106-090000.dump

set -euo pipefail

: "${SUPABASE_DB_URL:?Définir SUPABASE_DB_URL}"

BACKUP_FILE="${1:-}"
if [[ -z "${BACKUP_FILE}" || ! -f "${BACKUP_FILE}" ]]; then
  echo "Usage : CONFIRM_RESTORE=yes $0 <fichier.dump>" >&2
  exit 1
fi

if [[ "${CONFIRM_RESTORE:-}" != "yes" ]]; then
  echo "Refus : définir CONFIRM_RESTORE=yes pour confirmer l'écrasement." >&2
  exit 1
fi

if [[ -f "${BACKUP_FILE}.sha256" ]]; then
  echo "→ Vérification de l'empreinte"
  (cd "$(dirname "${BACKUP_FILE}")" && sha256sum -c "$(basename "${BACKUP_FILE}").sha256")
fi

echo "→ Restauration de ${BACKUP_FILE}"
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="${SUPABASE_DB_URL}" \
  "${BACKUP_FILE}"

echo "✓ Restauration terminée. Vérifier : connexion, tableau de bord, une vente test."
