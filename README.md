# 🧵 Harmy'sewing - Plateforme de Couture Sur Mesure

Harmy'sewing est une application moderne de gestion et de commande de travaux de couture sur mesure, combinant une interface utilisateur fluide et réactive avec un backend robuste basé sur une architecture propre (Clean Architecture).

---

## 🚀 Démarrage Rapide

Pour lancer le projet localement en quelques secondes :

### 1. Base de données PostgreSQL
Assurez-vous que PostgreSQL est en cours d'exécution sur le port `5432` et exécutez :
```sql
CREATE DATABASE harmy_swing;
```

### 2. Démarrer le Backend (Spring Boot)
```powershell
cd backend
.\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
L'API REST sera accessible sur `http://localhost:8080/api/v1`.

### 3. Démarrer le Frontend (Angular 21)
À la racine du projet dans un second terminal :
```powershell
npm start
```
L'application web sera disponible sur `http://localhost:4200` (ou `http://localhost:3000` via `npm run dev`).

---

## 📚 Guide de Démarrage Détaillé

Pour une explication pas-à-pas complète, la gestion des variables d'environnement, l'initialisation de la base de données et le dépannage des erreurs courantes, consultez le [GUIDE_DEMARRAGE.md](file:///c:/Users/NERIA%20FLORENTIN/Documents/harmy/GUIDE_DEMARRAGE.md).

---

## 🛠️ Architecture & Technologies

- **Frontend** : Angular 21, Tailwind CSS v4, Signals, RxJS, Socket.IO Client.
- **Backend** : Spring Boot 3.2.3 (Java 17), Spring Data JPA, Spring Security (JWT), Flyway, Netty Socket.IO, AWS SDK (Cloudflare R2).
- **Base de Données** : PostgreSQL 15+.
- **Build Tools** : Apache Maven 3.9.6 (embarqué dans `backend/maven`), Node.js & npm.
