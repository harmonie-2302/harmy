#!/usr/bin/env bash
# Restauration d'une sauvegarde Harmy'Swing non chiffree sur Ubuntu 24.04.
# Usage: bash restore.sh archive.tar.gz
set -Eeuo pipefail
umask 077

INPUT="${1:-}"
if [ -z "$INPUT" ]; then
    echo "Usage: $0 <archive.tar.gz>" >&2
    exit 1
fi
if [ "$(id -u)" -ne 0 ]; then
    echo "ERREUR: la restauration doit etre executee en root." >&2
    exit 1
fi
WORK_DIR="$(mktemp -d /tmp/harmy-restore-XXXXXX)"
PAYLOAD="$WORK_DIR/payload"
cleanup() { rm -rf "$WORK_DIR"; }
trap cleanup EXIT

if [ -f "${INPUT}.sha256" ]; then
    expected="$(cut -d' ' -f1 "${INPUT}.sha256")"
    actual="$(sha256sum "$INPUT" | cut -d' ' -f1)"
    if [ "$expected" != "$actual" ]; then
        echo "ERREUR: somme SHA-256 invalide." >&2
        exit 1
    fi
fi

mkdir -p "$PAYLOAD"
tar -xzf "$INPUT" -C "$PAYLOAD"
(cd "$PAYLOAD" && sha256sum -c metadata/payload.sha256)

echo "Installation des paquets de base..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx postgresql postgresql-contrib openjdk-17-jre-headless \
    maven curl ca-certificates git openssl python3 sudo

if ! id harmy >/dev/null 2>&1; then
    useradd --system --home-dir /var/lib/harmy --create-home --shell /usr/sbin/nologin harmy
fi

echo "Restauration de l'application..."
install -d -o harmy -g harmy -m 750 /opt/harmy
tar -xzf "$PAYLOAD/application/source.tar.gz" -C /opt/harmy
chown -R harmy:harmy /opt/harmy
if [ -f "$PAYLOAD/application/backend.jar" ]; then
    install -o harmy -g harmy -m 640 "$PAYLOAD/application/backend.jar" /opt/harmy/backend.jar
fi
if [ -f "$PAYLOAD/application/dist.tar.gz" ]; then
    tar -xzf "$PAYLOAD/application/dist.tar.gz" -C /opt/harmy
    chown -R harmy:harmy /opt/harmy/dist
fi

echo "Restauration des images..."
install -d -o harmy -g harmy -m 755 /var/www/harmy/uploads
tar -xzf "$PAYLOAD/uploads/uploads.tar.gz" -C /var/www/harmy
chown -R harmy:harmy /var/www/harmy/uploads
find /var/www/harmy/uploads -type d -exec chmod 755 {} +
find /var/www/harmy/uploads -type f -exec chmod 644 {} +

echo "Restauration de PostgreSQL..."
systemctl enable --now postgresql
# Recrée le rôle applicatif à partir des mêmes variables que le backend.
# PostgreSQL est local au serveur; son mot de passe n'est jamais exposé dans
# la commande ou dans les journaux.
DB_ENV="$PAYLOAD/configuration/etc-harmy/backend.env"
DB_USER="harmy"
DB_PASSWORD=""
if [ -r "$DB_ENV" ]; then
    DB_USER="$(sed -n 's/^SPRING_DATASOURCE_USERNAME=//p' "$DB_ENV" | head -1)"
    DB_PASSWORD="$(sed -n 's/^SPRING_DATASOURCE_PASSWORD=//p' "$DB_ENV" | head -1)"
fi
DB_USER="${DB_USER:-harmy}"
runuser -u postgres -- psql -v ON_ERROR_STOP=1 -d postgres \
    -v db_user="$DB_USER" -v db_password="$DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'db_user', :'db_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'db_user') \gexec
SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'db_user', :'db_password')
WHERE EXISTS (SELECT FROM pg_roles WHERE rolname = :'db_user') \gexec
SQL
runuser -u postgres -- dropdb --if-exists harmy_swing
runuser -u postgres -- createdb -O "$DB_USER" harmy_swing
runuser -u postgres -- pg_restore --clean --if-exists --no-owner --no-acl \
    --role="$DB_USER" -d harmy_swing "$PAYLOAD/database/harmy_swing.dump"
runuser -u postgres -- psql -v ON_ERROR_STOP=1 -d harmy_swing \
    -c "GRANT ALL PRIVILEGES ON DATABASE harmy_swing TO \"$DB_USER\";" >/dev/null

echo "Restauration de la configuration..."
install -d -o root -g root -m 750 /etc/harmy
cp -a "$PAYLOAD/configuration/etc-harmy/." /etc/harmy/
chown -R root:root /etc/harmy
chmod 640 /etc/harmy/*.env 2>/dev/null || true
cp -a "$PAYLOAD/configuration/systemd/." /etc/systemd/system/
cp -a "$PAYLOAD/configuration/nginx/harmy" /etc/nginx/sites-available/harmy
ln -sfn /etc/nginx/sites-available/harmy /etc/nginx/sites-enabled/harmy
rm -f /etc/nginx/sites-enabled/default
if [ -d "$PAYLOAD/configuration/letsencrypt" ]; then
    cp -a "$PAYLOAD/configuration/letsencrypt" /etc/
fi

# L'adresse publique change chez un autre fournisseur. On utilise l'IP locale
# detectee pour que le SSR puisse demarrer; remplacer par le domaine ensuite.
NEW_IP="$(curl -fsS --max-time 10 https://api.ipify.org || hostname -I | awk '{print $1}')"
if [ -f /etc/harmy/frontend.env ]; then
    sed -i "s|^PUBLIC_ORIGIN=.*|PUBLIC_ORIGIN=http://${NEW_IP}|" /etc/harmy/frontend.env
fi

systemctl daemon-reload
nginx -t
systemctl enable --now nginx harmy-backend harmy-frontend

echo
echo "Restauration terminee sur http://${NEW_IP}"
echo "Verifiez ensuite: systemctl status harmy-backend harmy-frontend nginx"
echo "Le fichier /etc/harmy/backup.env n'est jamais inclus: recréez-le sur le nouveau VPS."
