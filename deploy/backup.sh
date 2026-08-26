#!/usr/bin/env bash
# Sauvegarde portable non chiffree de l'instance Harmy'Swing.
#
# L'archive contient tout ce qui est necessaire pour reconstruire l'application
# chez un autre fournisseur : base PostgreSQL, images, depot et commit Git,
# code/artefacts, configurations nginx/systemd et secrets d'exploitation.
# A la demande de l'exploitant, les secrets sont inclus en clair dans l'archive.
# Protegez strictement le compte Google Drive et ses telechargements.
set -Eeuo pipefail
umask 077

APP_DIR="${HARMY_APP_DIR:-/opt/harmy}"
UPLOADS_DIR="${HARMY_UPLOADS_DIR:-/var/www/harmy/uploads}"
BACKUP_BASE_DIR="${HARMY_BACKUP_DIR:-/var/backups/harmy}"
CONFIG_FILE="${HARMY_BACKUP_CONFIG:-/etc/harmy/backup.env}"
TIMESTAMP="$(date -u +'%Y%m%dT%H%M%SZ')"
HOST="$(hostname -s)"
WORK_DIR="$(mktemp -d "${BACKUP_BASE_DIR}/.work-${TIMESTAMP}-XXXXXX")"
PAYLOAD_DIR="${WORK_DIR}/payload"
ARCHIVE_BASENAME="harmy-${HOST}-${TIMESTAMP}.tar.gz"
ARCHIVE="${BACKUP_BASE_DIR}/${ARCHIVE_BASENAME}"
CHECKSUM_FILE="${ARCHIVE}.sha256"

cleanup() {
    rm -rf "$WORK_DIR"
}
trap cleanup EXIT

if [ "$(id -u)" -ne 0 ]; then
    echo "ERREUR: cette sauvegarde doit etre executee en root." >&2
    exit 1
fi

install -d -o root -g root -m 700 "$BACKUP_BASE_DIR"
install -d -m 700 \
    "$PAYLOAD_DIR/database" \
    "$PAYLOAD_DIR/application" \
    "$PAYLOAD_DIR/uploads" \
    "$PAYLOAD_DIR/configuration/etc-harmy" \
    "$PAYLOAD_DIR/configuration/systemd" \
    "$PAYLOAD_DIR/configuration/nginx" \
    "$PAYLOAD_DIR/metadata"

if [ ! -r "$CONFIG_FILE" ]; then
    echo "ERREUR: configuration absente: $CONFIG_FILE" >&2
    echo "Installez deploy/backup.env.example puis configurez rclone." >&2
    exit 1
fi

set -a
# shellcheck disable=SC1090
source "$CONFIG_FILE"
set +a

echo "[$(date -Is)] Sauvegarde Harmy'Swing ${TIMESTAMP}"

echo "1/7 - Export PostgreSQL"
if ! command -v pg_dump >/dev/null 2>&1; then
    echo "ERREUR: pg_dump est introuvable." >&2
    exit 1
fi
runuser -u postgres -- pg_dump \
    --format=custom \
    --compress=9 \
    --no-owner \
    --no-acl \
    harmy_swing > "$PAYLOAD_DIR/database/harmy_swing.dump"

echo "2/7 - Copie de l'application et du depot Git"
tar \
    --exclude='./node_modules' \
    --exclude='./backend/target' \
    --exclude='./dist' \
    --exclude='./.angular' \
    --exclude='./backend.jar' \
    -czf "$PAYLOAD_DIR/application/source.tar.gz" \
    -C "$APP_DIR" .

if [ -f "$APP_DIR/backend.jar" ]; then
    install -m 600 "$APP_DIR/backend.jar" "$PAYLOAD_DIR/application/backend.jar"
fi
if [ -d "$APP_DIR/dist" ]; then
    tar -czf "$PAYLOAD_DIR/application/dist.tar.gz" -C "$APP_DIR" dist
fi

echo "3/7 - Copie des images"
if [ -d "$UPLOADS_DIR" ]; then
    tar -czf "$PAYLOAD_DIR/uploads/uploads.tar.gz" \
        -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"
else
    tar -czf "$PAYLOAD_DIR/uploads/uploads.tar.gz" --files-from /dev/null
fi

echo "4/7 - Copie de la configuration serveur"
copy_if_exists() {
    local source="$1"
    local destination="$2"
    if [ -e "$source" ]; then
        cp -a "$source" "$destination"
    fi
}

copy_if_exists /etc/harmy/backend.env "$PAYLOAD_DIR/configuration/etc-harmy/"
copy_if_exists /etc/harmy/frontend.env "$PAYLOAD_DIR/configuration/etc-harmy/"
# backup.env contient la configuration rclone et n'est pas inclus dans
# l'archive : le jeton OAuth rclone est stocke separement dans rclone.conf.
copy_if_exists /etc/systemd/system/harmy-backend.service "$PAYLOAD_DIR/configuration/systemd/"
copy_if_exists /etc/systemd/system/harmy-frontend.service "$PAYLOAD_DIR/configuration/systemd/"
copy_if_exists /etc/systemd/system/harmy-backup.service "$PAYLOAD_DIR/configuration/systemd/"
copy_if_exists /etc/systemd/system/harmy-backup.timer "$PAYLOAD_DIR/configuration/systemd/"
copy_if_exists /etc/nginx/sites-available/harmy "$PAYLOAD_DIR/configuration/nginx/"
copy_if_exists /etc/letsencrypt "$PAYLOAD_DIR/configuration/letsencrypt"

echo "5/7 - Inventaire de restauration"
{
    echo "created_utc=${TIMESTAMP}"
    echo "hostname=${HOST}"
    echo "public_ip=$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || true)"
    echo "os=$(source /etc/os-release && printf '%s %s' "$NAME" "$VERSION_ID")"
    echo "kernel=$(uname -sr)"
    echo "git_branch=$(git -C "$APP_DIR" branch --show-current 2>/dev/null || true)"
    echo "git_commit=$(git -C "$APP_DIR" rev-parse HEAD 2>/dev/null || true)"
    echo "git_remote=$(git -C "$APP_DIR" remote get-url origin 2>/dev/null || true)"
    echo "java=$(java -version 2>&1 | head -1 || true)"
    echo "node=$(node --version 2>/dev/null || true)"
    echo "postgres=$(psql --version 2>/dev/null || true)"
    echo "nginx=$(nginx -v 2>&1 || true)"
} > "$PAYLOAD_DIR/metadata/manifest.env"

systemctl list-unit-files --state=enabled --no-pager \
    > "$PAYLOAD_DIR/metadata/enabled-services.txt" 2>/dev/null || true
dpkg-query -W -f='${binary:Package}\t${Version}\n' \
    > "$PAYLOAD_DIR/metadata/packages.tsv" 2>/dev/null || true
runuser -u postgres -- psql -d harmy_swing -Atc \
    "SELECT 'users='||count(*) FROM users UNION ALL SELECT 'posts='||count(*) FROM posts UNION ALL SELECT 'media='||count(*) FROM post_media;" \
    > "$PAYLOAD_DIR/metadata/database-counts.txt" 2>/dev/null || true
(
    cd "$PAYLOAD_DIR"
    find . -type f ! -path './metadata/payload.sha256' \
        -print0 | sort -z | xargs -0 sha256sum \
        > metadata/payload.sha256
)

echo "6/7 - Compression (archive non chiffree, choix explicite)"
tar -czf "$ARCHIVE" -C "$PAYLOAD_DIR" .
sha256sum "$ARCHIVE" > "$CHECKSUM_FILE"

echo "7/7 - Envoi Google Drive via rclone et retention"
if [ "${HARMY_RCLONE_ENABLED:-false}" = "true" ]; then
    if ! command -v rclone >/dev/null 2>&1; then
        echo "ERREUR: rclone est absent alors que HARMY_RCLONE_ENABLED=true." >&2
        exit 1
    fi
    if [ -z "${HARMY_RCLONE_REMOTE:-}" ] || [ -z "${HARMY_RCLONE_PATH:-}" ]; then
        echo "ERREUR: HARMY_RCLONE_REMOTE et HARMY_RCLONE_PATH sont obligatoires." >&2
        exit 1
    fi
    rclone copy "$ARCHIVE" "$HARMY_RCLONE_REMOTE:$HARMY_RCLONE_PATH" \
        --config "${HARMY_RCLONE_CONFIG:-/etc/harmy/rclone.conf}" \
        --log-level INFO
    rclone copy "$CHECKSUM_FILE" "$HARMY_RCLONE_REMOTE:$HARMY_RCLONE_PATH" \
        --config "${HARMY_RCLONE_CONFIG:-/etc/harmy/rclone.conf}" \
        --log-level INFO
    echo "Archive et checksum envoyes vers $HARMY_RCLONE_REMOTE:$HARMY_RCLONE_PATH"
else
    echo "Envoi Google Drive desactive (HARMY_RCLONE_ENABLED=false)."
fi

# On conserve 3 generations locales; Google Drive constitue la copie hors
# fournisseur.
mapfile -t anciennes < <(find "$BACKUP_BASE_DIR" -maxdepth 1 -type f \
    -name 'harmy-*.tar.gz' -printf '%T@ %p\n' | sort -rn | tail -n +4 | cut -d' ' -f2-)
for archive in "${anciennes[@]}"; do
    rm -f "$archive" "${archive}.sha256"
done

echo "Archive NON chiffree: $ARCHIVE"
echo "SHA-256: $(cut -d' ' -f1 "$CHECKSUM_FILE")"
echo "Taille: $(du -h "$ARCHIVE" | cut -f1)"
echo "Sauvegarde terminee avec succes."
