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
BRANCH="${HARMY_BRANCH:-main}"

echo "### 1/5 — Récupération du code (branche ${BRANCH})"
cd "$APP_DIR"
sudo -u harmy git fetch --all --prune
sudo -u harmy git reset --hard "origin/${BRANCH}"
sudo -u harmy git --no-pager log --oneline -1

echo
echo "### 2/5 — Compilation du backend Spring Boot"
cd "$APP_DIR/backend"
sudo -u harmy env HOME=/var/lib/harmy mvn -B -q clean package -DskipTests
install -o harmy -g harmy -m 640 "$APP_DIR"/backend/target/harmy-backend-*.jar "$APP_DIR/backend.jar"
ls -lh "$APP_DIR/backend.jar"

echo
echo "### 3/5 — Compilation du frontend Angular (build de production)"
cd "$APP_DIR"
# NODE_ENV ne doit pas valoir "production" ici, sinon npm ci n'installerait
# pas les devDependencies nécessaires au compilateur Angular.
sudo -u harmy env HOME=/var/lib/harmy NODE_ENV=development npm ci --no-audit --no-fund
sudo -u harmy env HOME=/var/lib/harmy NODE_ENV=development npm run build

echo
echo "### 4/5 — Redémarrage des services"
systemctl restart harmy-backend
systemctl restart harmy-frontend
sleep 12

echo
echo "### 5/5 — Vérification"
systemctl is-active harmy-backend harmy-frontend
curl -sS -o /dev/null -w 'API  /api/v1/posts -> %{http_code}\n' http://127.0.0.1:8080/api/v1/posts
curl -sS -o /dev/null -w 'SSR  /             -> %{http_code}\n' http://127.0.0.1:4000/
curl -sS -o /dev/null -w 'HTTP public /      -> %{http_code}\n' http://127.0.0.1/

echo
echo "Déploiement terminé."
