#!/usr/bin/env bash
# Configure rclone avec Google Drive sur le VPS.
# Le flux est headless : le script affiche un lien Google, l'utilisateur
# l'ouvre sur son ordinateur, autorise rclone, puis confirme le compte.
set -Eeuo pipefail
umask 077

if [ "$(id -u)" -ne 0 ]; then
    echo "ERREUR: executez ce script en root." >&2
    exit 1
fi

REMOTE="${HARMY_RCLONE_REMOTE_NAME:-harmy-drive}"
RCLONE_CONFIG="/etc/harmy/rclone.conf"
BACKUP_ENV="/etc/harmy/backup.env"

install -d -o root -g root -m 750 /etc/harmy
if ! command -v rclone >/dev/null 2>&1; then
    apt-get update
    apt-get install -y rclone
fi

echo "=== Configuration Google Drive pour rclone ==="
echo
echo "Le navigateur n'est pas necessaire sur le VPS."
echo "Une URL Google va s'afficher ci-dessous. Ouvrez-la sur votre ordinateur,"
echo "connectez-vous au compte Google qui doit recevoir les sauvegardes,"
echo "autorisez rclone, puis revenez ici."
echo

if [ -f "$RCLONE_CONFIG" ] && rclone listremotes --config "$RCLONE_CONFIG" | grep -qx "${REMOTE}:"; then
    echo "Le remote $REMOTE existe deja. Test de connexion..."
    rclone lsd "$REMOTE:" --config "$RCLONE_CONFIG" --max-depth 1
else
    # --auth-no-open-browser force l'affichage de l'URL exploitable en SSH.
    # rclone demande ensuite le code/token OAuth fourni par Google.
    rclone config create "$REMOTE" drive \
        --config "$RCLONE_CONFIG" \
        --auth-no-open-browser \
        --drive-scope drive.file
fi

echo
echo "Test de creation du dossier de sauvegarde..."
rclone mkdir "$REMOTE:Harmy-Swing-Backups" --config "$RCLONE_CONFIG"
rclone lsd "$REMOTE:Harmy-Swing-Backups" --config "$RCLONE_CONFIG" --max-depth 1

if [ ! -f "$BACKUP_ENV" ]; then
    install -o root -g root -m 600 /opt/harmy/deploy/backup.env.example "$BACKUP_ENV"
fi

python3 - "$BACKUP_ENV" "$REMOTE" <<'PY'
import re
import sys

path, remote = sys.argv[1:]
text = open(path, encoding='utf-8').read()

def set_value(text, key, value):
    pattern = re.compile(rf'^{re.escape(key)}=.*$', re.MULTILINE)
    line = f'{key}={value}'
    if pattern.search(text):
        return pattern.sub(line, text)
    return text.rstrip('\n') + '\n' + line + '\n'

text = set_value(text, 'HARMY_RCLONE_ENABLED', 'true')
text = set_value(text, 'HARMY_RCLONE_REMOTE', remote)
text = set_value(text, 'HARMY_RCLONE_PATH', 'Harmy-Swing-Backups')
text = set_value(text, 'HARMY_RCLONE_CONFIG', '/etc/harmy/rclone.conf')
open(path, 'w', encoding='utf-8').write(text)
PY

chown root:root "$RCLONE_CONFIG" "$BACKUP_ENV"
chmod 600 "$RCLONE_CONFIG" "$BACKUP_ENV"
systemctl restart harmy-backup.timer

echo
echo "Configuration rclone terminee."
echo "Remote : $REMOTE:Harmy-Swing-Backups"
echo "Test manuel : systemctl start harmy-backup.service"
echo "Etat : systemctl status harmy-backup.timer"
