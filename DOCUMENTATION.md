# 📖 Documentation Officielle — Harmy'Swing

Bienvenue dans la documentation complète de la plateforme **Harmy'Swing**. Ce document est conçu pour permettre à n'importe quel développeur, utilisateur ou administrateur de comprendre l'architecture du projet et de l'installer facilement sur sa machine localement.

---

## 📌 Sommaire

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Prérequis Système](#3-prérequis-système)
4. [Guide d'Installation & Démarrage Pas-à-Pas](#4-guide-dinstallation--démarrage-pas-à-pas)
5. [Guide des Espaces Utilisateurs (Features)](#5-guide-des-espaces-utilisateurs-features)
6. [Structure du Code Source](#6-structure-du-code-source)
7. [Dépannage & Foire Aux Questions (FAQ)](#7-dépannage--foire-aux-questions-faq)

---

## 1. Présentation du Projet

**Harmy'Swing** est une plateforme SaaS et Marketplace dédiée à la haute couture africaine sur mesure (Wax, Bazin Riche, Kente, Pagne traditionnel).

Le projet résout deux problèmes majeurs :
1. **Pour les Clientes** : Trouver des modèles d'exception, enregistrer et sécuriser leur carnet de mesures numériques, suivre en direct l'avancement de leurs confections (de la réception du tissu à la livraison) et laisser des avis aux ateliers.
2. **Pour les Couturières / Ateliers** : Gérer la production via un tableau Kanban interactif, maîtriser leur comptabilité en **FC** (Francs Congolais), gérer leur carnet de clientes et publier leurs plus belles pièces dans le catalogue.

---

## 2. Architecture Technique

### 🎨 Frontend (Client Web)
- **Framework** : Angular 21 (Mode Standalone & Signals réactifs).
- **Styling** : Tailwind CSS v4 & Glassmorphic Custom Design.
- **Gestion d'état** : Angular Signals & RxJS.
- **Rendu & Build** : Vite / SSR (Prerendering réactif).

### ⚙️ Backend (Serveur API REST & Temps Réel)
- **Langage & Framework** : Java 17 / Spring Boot 3.2.3.
- **Architecture** : Clean Architecture (Architecture Hexagonale / Port & Adapter).
  - `Domain` : Modèles métiers et règles pures.
  - `Application` : Cas d'utilisation (Use Cases) et interfaces de ports.
  - `Infrastructure` : Sécurité JWT, Persistance Spring Data JPA, Stockage Cloudflare R2 / AWS S3 SDK.
  - `Presentation` : Contrôleurs REST et DTOs.
- **Temps réel** : Netty Socket.IO pour la messagerie instantanée.

### 🗄️ Base de Données & Stockage
- **SGBD** : PostgreSQL (Migration automatique Flyway SQL).
- **Stockage de médias** : Cloudflare R2 (compatible AWS S3).
- **Devise monétaire** : FC (Francs Congolais).

---

## 3. Prérequis Système

Avant de procéder à l'installation, assurez-vous d'avoir les éléments suivants configurés sur votre ordinateur :

| Outil | Version Minimale | Commande de Vérification |
| :--- | :--- | :--- |
| **JDK (Java Development Kit)** | Java 17+ | `java -version` |
| **Node.js & npm** | Node.js v18+ / v20+ | `node -v` et `npm -v` |
| **PostgreSQL** | PostgreSQL v14+ | `psql --version` |

---

## 4. Guide d'Installation & Démarrage Pas-à-Pas

### Étape 1 : Cloner le Répertoire
```bash
git clone <URL_DU_DEPOT>
cd harmy
```

### Étape 2 : Préparer la Base de Données PostgreSQL
1. Ouvrez votre terminal PostgreSQL ou votre outil de gestion (pgAdmin, DBeaver).
2. Créez la base de données requise :
   ```sql
   CREATE DATABASE harmy_swing;
   ```
3. *(Optionnel)* Si votre mot de passe utilisateur PostgreSQL local est différent de `2025`, mettez-le à jour dans le fichier `backend/.env` ou `backend/src/main/resources/application.yml` :
   ```env
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=votre_mot_de_passe
   ```

### Étape 3 : Démarrer le Backend (Spring Boot)
Un wrapper Apache Maven 3.9.6 autonome est pré-intégré dans le projet. Vous n'avez pas besoin d'installer Maven manuellement.

Dans un premier terminal :
```powershell
cd backend
.\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
> **Ce que fait le backend au démarrage :**
> - Exécute les migrations Flyway pour créer automatiquement toutes les tables PostgreSQL.
> - Démarre le serveur web Tomcat sur `http://localhost:8080/api/v1`.

### Étape 4 : Démarrer le Frontend (Angular 21)
Dans un **second terminal** à la racine du projet `harmy` :
```powershell
npm run dev
```
*(ou `npm start` pour écouter sur le port 4200)*.

> **Accès à l'application web :**
> Ouvrez votre navigateur et naviguez sur : **`http://localhost:3000`**

---

## 5. Guide des Espaces Utilisateurs (Features)

### 🛍️ Catalogue & Fil d'Actualité (`/catalogue`)
- **Filtres par matières/événements** : Filtrage par Wax, Bazin Riche, Kente Royal, Mariage.
- **Interactions sociales** : Tout utilisateur connecté peut réagir via un « J'aime » ou laisser un commentaire sous les modèles.
- **Publication (Couturières)** : Bouton d'ajout d'une création avec téléversement d'image et indication de prix en **FC**.

### ✂️ Espace Couturière (`/atelier` & `/atelier/kanban`)
- **Tableau Kanban (`/atelier/kanban`)** : Glisser-déposer (Drag & Drop) pour faire avancer les confections de *Tissu Reçu* ➔ *En Couture* ➔ *Prêt Essayage* ➔ *Livré*.
- **Suite Atelier (`/atelier`)** :
  - **Tableau Financier** : Suivi global des recettes, acomptes perçus et soldes restants en **FC**.
  - **Fiches Clientes & Mesures** : Consultation des carnets de mesures partagés par les clientes.
  - **Gestionnaire de Tâches** : Ajout et validation des tâches de coupe et d'assemblage.

### 📐 Espace Cliente (`/client`)
- **Carnet de Mesures Privé** : Saisie sécurisée des mensurations (Buste, Taille, Hanches, Bras).
- **Autorisations de Partage** : Activation/désactivation en 1 clic de l'accès de ses mesures auprès des maisons de couture favoris.
- **Suivi des Confections** : Barre de progression en temps réel pour chaque commande.
- **Demande de Sur-Mesure** : Modal d'envoi d'une nouvelle commande vers un atelier.
- **Évaluations & Avis** : Modal pour noter un atelier de 1 à 5 étoiles et publier un retour d'expérience.

### 💬 Messagerie Instantanée (`/messagerie`)
- Échanges directs entre la cliente et le couturier pour ajuster les détails d'une création.

### 🛡️ Administration (`/admin`)
- Gestion des utilisateurs, modération des contenus et supervision des abonnements d'ateliers.

---

## 6. Structure du Code Source

```text
harmy/
├── backend/                                      # Application Spring Boot (Java 17)
│   ├── maven/apache-maven-3.9.6/                 # Engine Maven autonome
│   ├── src/main/java/com/harmysewing/
│   │   ├── domain/                               # Modèles métiers (User, Atelier, Commande...)
│   │   ├── application/                          # Cas d'usage (Ports IN/OUT, Use Cases)
│   │   ├── infrastructure/                       # Persistence JPA, Securité JWT, S3 Storage
│   │   └── presentation/api/                     # Contrôleurs REST Endpoints
│   ├── src/main/resources/
│   │   ├── application.yml                       # Config Spring Boot
│   │   └── db/migration/                         # Scripts de migration SQL Flyway
│   └── .env                                      # Variables d'environnement Backend
├── src/                                          # Application Client Angular 21
│   ├── app/
│   │   ├── core/                                 # Services API, Guards de rôle, Intercepteurs JWT
│   │   ├── features/                             # Modules applicatifs (catalogue, atelier, client, admin...)
│   │   ├── shared/                               # Directives UI et composants réutilisables
│   │   ├── app.routes.ts                         # Définition des routes et titres
│   │   └── app.ts / app.html                     # En-tête principal & Layout racine
│   └── index.html                                # Point d'entrée HTML
├── package.json                                  # Dépendances & scripts npm
├── README.md                                     # Aperçu synthétique
└── DOCUMENTATION.md                              # Cette documentation complète
```

---

## 7. Dépannage & Foire Aux Questions (FAQ)

### Q1. L'erreur `Connection refused` apparaît au lancement du backend.
> **Solution** : PostgreSQL n'est pas démarré sur votre machine. Démarrez le service PostgreSQL (service Windows ou `sudo service postgresql start` sous Linux) et vérifiez la présence de la base `harmy_swing`.

### Q2. Erreur `Port 8080 is already in use`.
> **Solution** : Un autre serveur utilise le port 8080. Modifiez la variable `PORT` dans le fichier `backend/.env` ou arrêtez l'application en cours sur ce port.

### Q3. Le frontend indique `Http failure response: 0 Unknown Error`.
> **Solution** : Le serveur backend Spring Boot n'est pas en cours d'exécution. Assurez-vous qu'il est démarré et qu'il répond sur `http://localhost:8080/api/v1`.

### Q4. Comment réinitialiser les données de test ?
> **Solution** : Supprimez la base de données PostgreSQL `DROP DATABASE harmy_swing;` puis recrez-la `CREATE DATABASE harmy_swing;`. Au redémarrage du backend, Flyway réappliquera l'ensemble des migrations à neuf.

---
*Documentation générée pour la version de production **Harmy'Swing**.*
