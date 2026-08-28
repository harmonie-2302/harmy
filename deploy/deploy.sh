#!/usr/bin/env bash
# =====================================================================
# Harmy'Swing — Déploiement / mise à jour de l'application sur le VPS
#
# À exécuter en root sur le serveur :
#     bash /opt/harmy/deploy/deploy.sh
#
# Récupère la dernière version du dépôt, reconstruit le backend et le
# frontend, puis redémarre les services systemd. Idempotent.
# =====================================================================
set -euo pipefail

APP_DIR=/opt/harmy

# Par défaut, on redéploie la branche déjà active sur le serveur : une mise à
# jour ne doit jamais basculer silencieusement le serveur sur une autre branche.
# Pour changer volontairement de branche :
#     HARMY_BRANCH=main bash /opt/harmy/deploy/deploy.sh
BRANCH="${HARMY_BRANCH:-$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD)}"

echo "### 0/6 — Sauvegarde préalable (Backup de la base et des fichiers)"
if [ -f "$APP_DIR/deploy/backup.sh" ]; then
    bash "$APP_DIR/deploy/backup.sh" || echo "⚠️ Sauvegarde partielle ou terminée avec avertissement."
fi

echo
echo "### 1/6 — Récupération du code (branche ${BRANCH})"
cd "$APP_DIR"
sudo -u harmy git fetch --all --prune
sudo -u harmy git checkout -f -B "$BRANCH" "origin/${BRANCH}"
sudo -u harmy git reset --hard "origin/${BRANCH}"
sudo -u harmy git --no-pager log --oneline -1

echo
echo "### 2/6 — Compilation du backend Spring Boot"
cd "$APP_DIR/backend"
sudo -u harmy env HOME=/var/lib/harmy mvn -B -q clean package -DskipTests
install -o harmy -g harmy -m 640 "$APP_DIR"/backend/target/harmy-backend-*.jar "$APP_DIR/backend.jar"
ls -lh "$APP_DIR/backend.jar"

echo
echo "### 3/6 — Compilation du frontend Angular (build de production)"
cd "$APP_DIR"
# NODE_ENV ne doit pas valoir "production" ici, sinon npm ci n'installerait
# pas les devDependencies nécessaires au compilateur Angular.
sudo -u harmy env HOME=/var/lib/harmy NODE_ENV=development npm ci --no-audit --no-fund --legacy-peer-deps
sudo -u harmy env HOME=/var/lib/harmy NODE_ENV=development NG_CLI_ANALYTICS=false CI=true npm run build

echo
echo "### 4/6 — Redémarrage des services"
systemctl restart harmy-backend
systemctl restart harmy-frontend
sleep 18

echo
echo "### 5/6 — Installation de la sauvegarde automatique"
install -d -o root -g root -m 750 /etc/harmy
install -d -o root -g root -m 700 /var/backups/harmy
if [ ! -f /etc/harmy/backup.env ]; then
    install -o root -g root -m 600 "$APP_DIR/deploy/backup.env.example" /etc/harmy/backup.env
    echo "⚠️ /etc/harmy/backup.env créé avec des valeurs d'exemple : configurez rclone."
fi
chown root:root "$APP_DIR/deploy/backup.sh" "$APP_DIR/deploy/restore.sh" "$APP_DIR/deploy/setup-rclone-backup.sh"
chmod 700 "$APP_DIR/deploy/backup.sh" "$APP_DIR/deploy/restore.sh"
chmod 755 "$APP_DIR/deploy/setup-rclone-backup.sh"
install -o root -g root -m 644 "$APP_DIR/deploy/systemd/harmy-backup.service" /etc/systemd/system/harmy-backup.service
install -o root -g root -m 644 "$APP_DIR/deploy/systemd/harmy-backup.timer" /etc/systemd/system/harmy-backup.timer
systemctl daemon-reload
systemctl enable --now harmy-backup.timer
systemctl is-active harmy-backup.timer

echo
echo "### 6/6 — Vérification"
systemctl is-active harmy-backend harmy-frontend
curl -sS -o /dev/null -w 'API  /api/v1/posts -> %{http_code}\n' http://127.0.0.1:8080/api/v1/posts
curl -sS -o /dev/null -w 'SSR  /             -> %{http_code}\n' http://127.0.0.1:4000/
curl -sS -o /dev/null -w 'HTTP public /      -> %{http_code}\n' http://127.0.0.1/

echo
echo "Déploiement terminé."
