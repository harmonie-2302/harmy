# 📘 Guide de Démarrage Complet - Harmy'sewing

Ce guide contient toutes les instructions pour installer, configurer et lancer le projet **Harmy'sewing** (Backend Spring Boot + Frontend Angular) dans votre environnement local.

---

## 📋 Prérequis Systemes

Avant de commencer, vérifiez que les outils suivants sont installés sur votre machine :

1. **Java Development Kit (JDK) 17 ou supérieur**
   - Commande de vérification : `java -version`
2. **Node.js (v18+ ou v20+) et npm**
   - Commande de vérification : `node -v` et `npm -v`
3. **PostgreSQL (v14+)**
   - Doit tourner en local sur le port par défaut `5432`.

---

## 🗄️ 1. Initialisation de la Base de Données

Le backend utilise **Flyway** pour exécuter automatiquement les migrations au démarrage, mais la base de données PostgreSQL doit être créée au préalable.

1. Connectez-vous à votre instance PostgreSQL (via `psql`, pgAdmin, ou DBeaver) avec l'utilisateur `postgres`.
2. Exécutez le script d'initialisation présent dans `backend/init-db.sql` ou la commande suivante :
   ```sql
   CREATE DATABASE harmy_swing;
   GRANT ALL PRIVILEGES ON DATABASE harmy_swing TO postgres;
   ```
3. Par défaut, la configuration de connexion est définie dans `backend/src/main/resources/application.yml` et `backend/.env` :
   - **URL** : `jdbc:postgresql://localhost:5432/harmy_swing`
   - **Utilisateur** : `postgres`
   - **Mot de passe** : `2025`

---

## ⚙️ 2. Configuration des Variables d'Environnement

### Backend (`backend/.env`)
Le fichier `backend/.env` est déjà configuré pour l'environnement local. Les principales variables sont :
- `SPRING_DATASOURCE_URL` : URL JDBC de PostgreSQL.
- `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` : Identifiants DB.
- `JWT_SECRET` : Clé secrète servant à signer les tokens d'authentification.
- `CLOUDFLARE_R2_*` : Identifiants de stockage des images de stock / modèles.
- `PORT` : `8080` (Port du serveur backend API REST).

### Frontend (`.env`)
À la racine du projet :
- `APP_URL` : `http://localhost:3000` ou `http://localhost:4200`
- `JWT_SECRET` : Clé JWT partagée.

---

## 🖥️ 3. Démarrage du Backend (Spring Boot)

Le projet inclut une version d'Apache Maven pré-intégrée dans le dossier `backend/maven/apache-maven-3.9.6`. Vous n'avez pas besoin d'installer Maven manuellement !

1. Ouvrez un terminal dans le répertoire `backend` :
   ```powershell
   cd backend
   ```
2. Lancez Spring Boot avec Maven :
   ```powershell
   .\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
   ```
3. Le serveur va :
   - Exécuter les migrations de base de données Flyway (`db/migration`).
   - Démarrer le serveur HTTP Spring Boot sur le port `8080` avec le préfixe d'API `/api/v1`.
   - Démarrer le serveur temps réel Netty Socket.IO.

📌 **Vérification** : Accédez à `http://localhost:8080/api/v1` dans votre navigateur. Vous devriez recevoir une réponse ou vérifier les logs de démarrage.

---

## 💻 4. Démarrage du Frontend (Angular 21)

1. Ouvrez un **second terminal** à la racine du projet `harmy`.
2. (Optionnel) Si les dépendances ne sont pas installées :
   ```powershell
   npm install
   ```
3. Démarrez l'application Angular :
   - Sur le port 4200 (par défaut) :
     ```powershell
     npm start
     ```
   - Ou sur le port 3000 :
     ```powershell
     npm run dev
     ```

📌 **Accès Web** : Ouvrez votre navigateur sur `http://localhost:4200` (ou `http://localhost:3000`).

---

## 🔧 5. Dépannage & Erreurs Courantes

### A. Erreur de connexion PostgreSQL (`Connection refused` ou `Password authentication failed`)
- Assurez-vous que le service PostgreSQL est bien en cours d'exécution dans vos services Windows ou Docker.
- Vérifiez le mot de passe dans `backend/.env` (`SPRING_DATASOURCE_PASSWORD`).
- Assurez-vous que la base de données `harmy_swing` a bien été créée.

### B. Conflit de port (`Port 8080 is already in use`)
- Un autre processus utilise le port 8080. Vous pouvez soit fermer ce processus, soit modifier la variable `PORT` dans `backend/.env`.

### C. Le Frontend n'arrive pas à contacter l'API REST
- Vérifiez que le backend Spring Boot fonctionne correctement sur `http://localhost:8080/api/v1`.
- Le service HTTP frontend (`harmy-api.service.ts`) est configuré pour adresser les requêtes à cette URL.

---

## 📁 Structure Générale du Projet

```text
harmy/
├── backend/                  # Application Spring Boot (Java 17)
│   ├── maven/                # Maven 3.9.6 autonome
│   ├── src/main/java/        # Clean Architecture (Domain, Application, Infrastructure)
│   ├── src/main/resources/   # Application config & migrations Flyway SQL
│   ├── .env                  # Variables d'environnement Backend
│   └── pom.xml               # Fichier de build Maven
├── src/                      # Frontend Angular 21
│   ├── app/                  # Composants, Features (catalogue, atelier, messagerie...)
│   └── main.ts               # Point d'entrée Angular
├── package.json              # Dépendances & scripts Frontend
├── README.md                 # Vue d'ensemble rapide
└── GUIDE_DEMARRAGE.md        # Ce guide complet
```
