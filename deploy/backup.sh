#!/usr/bin/env bash
# =====================================================================
# Harmy'Swing — Script de Sauvegarde Automatique (Backup) du VPS
#
# À exécuter en root ou avec les droits suffisants.
# Effectue une sauvegarde complète de la base de données PostgreSQL
# et des fichiers d'application/configuration de /opt/harmy dans /var/backups/harmy.
# =====================================================================
set -euo pipefail

APP_DIR="/opt/harmy"
BACKUP_BASE_DIR="/var/backups/harmy"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_BASE_DIR}/backup_${TIMESTAMP}"

echo "====================================================================="
echo "📦 Début de la sauvegarde automatique : ${TIMESTAMP}"
echo "====================================================================="

mkdir -p "${BACKUP_DIR}"

# 1. Sauvegarde de la base de données PostgreSQL
echo "--> 1/3 - Sauvegarde de la base de données PostgreSQL (harmy_swing)..."
if command -v pg_dump &> /dev/null; then
    sudo -u postgres pg_dump harmy_swing > "${BACKUP_DIR}/database_harmy_swing.sql" 2>/dev/null || \
    pg_dump -U postgres harmy_swing > "${BACKUP_DIR}/database_harmy_swing.sql" 2>/dev/null || \
    echo "⚠️ Avertissement : Impossible d'effectuer le dump PostgreSQL direct (vérifier l'accès psql)."
    
    if [ -f "${BACKUP_DIR}/database_harmy_swing.sql" ]; then
        gzip -f "${BACKUP_DIR}/database_harmy_swing.sql"
        echo "✅ Base de données sauvegardée dans : ${BACKUP_DIR}/database_harmy_swing.sql.gz"
    fi
else
    echo "⚠️ pg_dump non trouvé, saut de la sauvegarde PostgreSQL."
fi

# 2. Sauvegarde des fichiers clés de l'application et de configuration
echo "--> 2/3 - Sauvegarde des fichiers de code, configurations et données de /opt/harmy..."
if [ -d "${APP_DIR}" ]; then
    tar --exclude='node_modules' \
        --exclude='backend/target' \
        --exclude='.angular' \
        --exclude='.git' \
        -czf "${BACKUP_DIR}/application_files.tar.gz" -C "${APP_DIR}" .
    echo "✅ Fichiers de l'application sauvegardés dans : ${BACKUP_DIR}/application_files.tar.gz"
fi

# 3. Nettoyage des anciennes sauvegardes (conserver les 10 plus récentes)
echo "--> 3/3 - Nettoyage des anciennes sauvegardes (conservation des 10 plus récentes)..."
ls -dt ${BACKUP_BASE_DIR}/backup_* 2>/dev/null | tail -n +11 | xargs rm -rf 2>/dev/null || true

echo "====================================================================="
echo "✅ Sauvegarde terminée avec succès dans : ${BACKUP_DIR}"
echo "====================================================================="
