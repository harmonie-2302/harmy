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
| `/etc/systemd/system/harmy-backend.service` | Service API Spring Boot |
| `/etc/systemd/system/harmy-frontend.service` | Service frontend SSR |
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

## 4. Exploitation courante

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

## 5. Configuration Angular selon l'environnement

`src/app/core/config/api.config.ts` cible le développement local
(`http://localhost:8080/api/v1`). Lors d'un build `--configuration production`,
`angular.json` le remplace par `api.config.prod.ts`, qui résout l'origine
dynamiquement :

- **navigateur** → `window.location.origin` ;
- **SSR Node** → variable d'environnement `PUBLIC_ORIGIN` (le rendu serveur
  exige des URL absolues).

Aucune URL n'est donc à modifier dans le code pour changer de domaine : il
suffit d'ajuster `PUBLIC_ORIGIN` dans `/etc/harmy/frontend.env`.

## 6. Passer à un nom de domaine et à HTTPS

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

## 7. Pare-feu

UFW n'autorise que le SSH (22) et le HTTP/HTTPS (80/443). Les ports
applicatifs 4000, 8080, 9092 et PostgreSQL 5432 ne sont pas joignables depuis
l'extérieur — ils écoutent uniquement sur la boucle locale.

## 8. Dépannage

| Symptôme | Piste |
| :--- | :--- |
| `502 Bad Gateway` sur `/` | Le service SSR est tombé → `journalctl -u harmy-frontend -n 50` |
| `502 Bad Gateway` sur `/api/v1/...` | Le backend est tombé → `journalctl -u harmy-backend -n 50` |
| Backend qui refuse de démarrer | Identifiants base de données dans `/etc/harmy/backend.env`, ou migration Flyway en échec |
| Build frontend tué (`Killed`) | Mémoire insuffisante → vérifier que le swap est actif (`swapon --show`) |
