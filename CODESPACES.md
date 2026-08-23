# Démarrer Harmy'Swing dans GitHub Codespaces

## Avant de créer le Codespace

1. Dans GitHub, ouvrez le dépôt `harmonie-2302/harmy` puis **Settings > Secrets and variables > Codespaces**.
2. Ajoutez les secrets Cloudflare R2 si vous souhaitez tester l'envoi d'images : `CLOUDFLARE_R2_ENDPOINT`, `CLOUDFLARE_R2_BUCKET`, `CLOUDFLARE_R2_ACCESS_KEY`, `CLOUDFLARE_R2_SECRET_KEY` et `CLOUDFLARE_R2_PUBLIC_URL`.
3. Ajoutez aussi un `JWT_SECRET` long et aléatoire. Ne placez jamais ces valeurs dans un commit.

> Les anciennes clés R2 qui avaient été enregistrées dans le projet doivent être révoquées et recréées dans Cloudflare avant toute utilisation partagée du dépôt.

## Créer le Codespace

1. Ouvrez la page GitHub du dépôt, cliquez sur **Code**, puis l'onglet **Codespaces**.
2. Cliquez sur **Create codespace on main**.
3. Attendez la fin de la préparation : le frontend, Java 17, Maven et PostgreSQL sont configurés automatiquement.

## Lancer l'application

Dans le terminal intégré, ouvrez deux terminaux.

Terminal 1 :

```bash
cd backend && mvn spring-boot:run
```

Terminal 2 :

```bash
npm start
```

Ouvrez ensuite l'onglet **Ports**, repérez le port `4200`, puis cliquez sur l'icône d'ouverture dans le navigateur. Le backend est disponible sur le port `8080`.

Les données PostgreSQL du Codespace sont isolées et temporaires : elles ne correspondent pas à une base de production.
