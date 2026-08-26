# 🚀 Déploiement Production — Harmy'Swing

Ce dossier contient tout ce qui permet d'exploiter Harmy'Swing sur un serveur
Ubuntu 24.04. Le déploiement de référence tourne sur un VPS DigitalOcean
(2 vCPU / 2 Go de RAM), accessible sur **http://207.154.195.53**.

---

## 1. Architecture de production

Un seul port est exposé au public (**80**). nginx répartit le trafic entre les
trois processus applicatifs, tous à l'écoute uniquement sur `127.0.0.1` :

```text
                 Internet
                    │
                    ▼  port 80
            ┌───────────────┐
            │     nginx     │   reverse proxy + gzip
            └───────┬───────┘
        ┌───────────┼────────────────┐
        ▼           ▼                ▼
   /api/v1/     /socket.io/          /
  127.0.0.1     127.0.0.1        127.0.0.1
    :8080         :9092             :4000
  ┌────────┐   ┌──────────┐   ┌──────────────┐
  │ Spring │   │  Netty   │   │  Angular 21  │
  │  Boot  │   │ SocketIO │   │     SSR      │
  └───┬────┘   └──────────┘   └──────────────┘
      │
      ▼
 ┌────────────┐
 │ PostgreSQL │  base « harmy_swing », migrations Flyway
 └────────────┘
```

Servir l'API et le frontend sur la même origine supprime toute question de
CORS : le frontend compilé en production appelle `/api/v1` en relatif.

## 2. Emplacements sur le serveur

| Chemin | Contenu |
| :--- | :--- |
| `/opt/harmy` | Clone du dépôt + artefacts compilés (`backend.jar`, `dist/`) |
| `/etc/harmy/backend.env` | Secrets backend : base de données, JWT, Cloudflare R2 |
| `/etc/harmy/frontend.env` | `PORT`, `PUBLIC_ORIGIN` pour le rendu SSR |
| `/etc/harmy/backup.env` | Paramètres rclone Google Drive (jamais versionné) |
| `/etc/systemd/system/harmy-backend.service` | Service API Spring Boot |
| `/etc/systemd/system/harmy-frontend.service` | Service frontend SSR |
| `/etc/systemd/system/harmy-backup.timer` | Sauvegarde automatique tous les 5 jours |
| `/var/backups/harmy` | Trois dernières archives locales non chiffrées |
| `/var/www/harmy/uploads` | Copie locale des images téléversées |
| `/etc/nginx/sites-available/harmy` | Reverse proxy |
| `/var/log/nginx/harmy.{access,error}.log` | Journaux nginx |

L'utilisateur système **`harmy`** (sans shell de connexion) possède le code et
exécute les deux services. Les fichiers de secrets ne sont **jamais** versionnés.

## 3. Mettre à jour l'application

Après un `git push` sur `main` :

```bash
ssh root@207.154.195.53
bash /opt/harmy/deploy/deploy.sh
```

Le script récupère `origin/main`, recompile le backend (Maven) et le frontend
(Angular), remplace `backend.jar`, redémarre les deux services et vérifie que
l'API et le SSR répondent.

## 4. Sauvegarde et restauration hors VPS

La sauvegarde automatique est déclenchée tous les 5 jours par
`harmy-backup.timer`. Chaque archive non chiffrée contient la base PostgreSQL, les
images locales, le code et son dépôt Git, les artefacts, les configurations
nginx/systemd, les certificats Let's Encrypt et les secrets backend. Cette
archive est volontairement non chiffrée : protégez strictement le compte Drive,
son partage et les téléchargements locaux, car les secrets sont lisibles.

Les archives sont envoyées vers Google Drive avec `rclone` et OAuth. Aucun mot
de passe Google n'est enregistré sur le serveur. Pour activer le stockage hors
VPS :

```bash
install -o root -g root -m 600 /opt/harmy/deploy/backup.env.example /etc/harmy/backup.env
/opt/harmy/deploy/setup-rclone-backup.sh
```

Le VPS n'ayant pas de navigateur, exécutez d'abord `rclone authorize drive` sur
votre ordinateur. Google ouvre alors la page d'autorisation locale et rclone
affiche un token OAuth JSON. Collez ce token dans l'assistant SSH; il sera
enregistré dans `/etc/harmy/rclone.conf` et renouvelé automatiquement.
Le compte ne reçoit l'accès qu'au remote Drive configuré. Lancez ensuite :

```bash
systemctl start harmy-backup.service
journalctl -u harmy-backup.service -n 100 --no-pager
```

`HARMY_RCLONE_ENABLED=true`, le remote et le dossier Drive sont alors inscrits
dans `/etc/harmy/backup.env`. L'archive est conservée localement dans
`/var/backups/harmy` même si l'envoi échoue. Trois générations locales sont
conservées; Google Drive contient les archives hors fournisseur.

Pour restaurer sur un autre VPS Ubuntu 24.04 :

```bash
scp harmy-*.tar.gz root@NOUVELLE_IP:/root/
scp harmy-*.tar.gz.sha256 root@NOUVELLE_IP:/root/
scp /opt/harmy/deploy/restore.sh root@NOUVELLE_IP:/root/
ssh root@NOUVELLE_IP
sudo bash /root/restore.sh /root/harmy-YYYYMMDD.tar.gz
```

Depuis Google Drive, téléchargez l'archive `.tar.gz` et son fichier `.sha256`,
puis lancez `restore.sh`. Le script vérifie la somme SHA-256 et restaure
l'instance sans demander de secret de déchiffrement.

## 5. Exploitation courante

```bash
# État des services
systemctl status harmy-backend harmy-frontend nginx postgresql

# Journaux en direct
journalctl -u harmy-backend  -f
journalctl -u harmy-frontend -f

# Redémarrage
systemctl restart harmy-backend harmy-frontend

# Accès à la base de données
sudo -u postgres psql harmy_swing
```

## 6. Configuration Angular selon l'environnement

`src/app/core/config/api.config.ts` cible le développement local
(`http://localhost:8080/api/v1`). Lors d'un build `--configuration production`,
`angular.json` le remplace par `api.config.prod.ts`, qui résout l'origine
dynamiquement :

- **navigateur** → `window.location.origin` ;
- **SSR Node** → variable d'environnement `PUBLIC_ORIGIN` (le rendu serveur
  exige des URL absolues).

Aucune URL n'est donc à modifier dans le code pour changer de domaine : il
suffit d'ajuster `PUBLIC_ORIGIN` dans `/etc/harmy/frontend.env`.

## 7. Passer à un nom de domaine et à HTTPS

1. Créer un enregistrement DNS **A** pointant le domaine vers `207.154.195.53`.
2. Sur le serveur :

```bash
# Déclarer le domaine dans nginx
sed -i 's/server_name _;/server_name exemple.com www.exemple.com;/' \
  /etc/nginx/sites-available/harmy
nginx -t && systemctl reload nginx

# Certificat Let's Encrypt (renouvellement automatique inclus)
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d exemple.com -d www.exemple.com --redirect

# Faire pointer le SSR sur la nouvelle origine
sed -i 's|^PUBLIC_ORIGIN=.*|PUBLIC_ORIGIN=https://exemple.com|' \
  /etc/harmy/frontend.env
systemctl restart harmy-frontend
```

## 8. Pare-feu

UFW n'autorise que le SSH (22) et le HTTP/HTTPS (80/443). Les ports
applicatifs 4000, 8080, 9092 et PostgreSQL 5432 ne sont pas joignables depuis
l'extérieur — ils écoutent uniquement sur la boucle locale.

## 9. Dépannage

| Symptôme | Piste |
| :--- | :--- |
| `502 Bad Gateway` sur `/` | Le service SSR est tombé → `journalctl -u harmy-frontend -n 50` |
| `502 Bad Gateway` sur `/api/v1/...` | Le backend est tombé → `journalctl -u harmy-backend -n 50` |
| Backend qui refuse de démarrer | Identifiants base de données dans `/etc/harmy/backend.env`, ou migration Flyway en échec |
| Build frontend tué (`Killed`) | Mémoire insuffisante → vérifier que le swap est actif (`swapon --show`) |
| Sauvegarde en échec | Vérifier `systemctl status harmy-backup.timer`, `journalctl -u harmy-backup.service` et la présence de `/etc/harmy/backup.env` |
| Archive absente de Drive | Tester `systemctl start harmy-backup.service`; vérifier `rclone lsd harmy-drive:Harmy-Swing-Backups` et le timer |
