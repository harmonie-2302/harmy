# 🧵 Harmy'Swing — Plateforme & Suite SaaS de Haute Couture Africaine

**Harmy'Swing** est une application web moderne et élégante dédiée à la haute couture africaine sur mesure. Elle combine une marketplace sociale d'inspiration textile (Wax, Bazin Riche, Kente) avec une suite SaaS complète de gestion de production pour les ateliers de couture.

---

## 🌟 Fonctionnalités Clés

- **📸 Catalogue & Marketplace Sociale** : Publication de modèles sur mesure par les couturières, consultation par le public, likes et commentaires en temps réel.
- **✂️ Suite Atelier & Tableau Kanban (Espace Couturière)** : Suivi des étapes de confection en Drag & Drop (Tissu reçu, En couture, Prêt essayage, Livré), comptabilité automatique en **FC** (Francs Congolais), carnet de clientes et gestion des tâches.
- **📐 Mensurations & Carnet de Mesures (Espace Cliente)** : Carnet de mensurations privées (poitrine, taille, hanches, bras) avec contrôle granulaire des accès partagés aux maisons de couture partenaires.
- **🛒 Demandes de Confections Sur Mesure** : Envoi de commandes personnalisées directement depuis l'espace cliente vers un atelier sélectionné.
- **⭐ Système d'Avis & Évaluations** : Évaluation des prestations des ateliers (notes de 1 à 5 étoiles et commentaires authentifiés).
- **💬 Messagerie Instantanée** : Échanges directs entre clientes et maître-couturiers.
- **🛡️ Administration & Modération** : Console de supervision des utilisateurs, abonnements ateliers et modération du contenu.

---

## 🚀 Démarrage Rapide (En 3 Étapes)

### 1. Base de données PostgreSQL
Créez la base de données dans votre instance PostgreSQL (port `5432`) :
```sql
CREATE DATABASE harmy_swing;
```

### 2. Lancer le Backend (Spring Boot 3.2.3 / Java 17)
Dans le dossier `backend` (utilisant le Maven autonome pré-intégré) :
```powershell
cd backend
.\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
*(Le backend s'exécute sur `http://localhost:8080/api/v1` et crée automatiquement les tables via Flyway)*.

### 3. Lancer le Frontend (Angular 21)
À la racine du projet dans un second terminal :
```powershell
npm start
```
*(L'application web s'ouvre sur `http://localhost:4200` ou `http://localhost:3000` via `npm run dev`)*.

---

## 📖 Documentation Complète

Pour consulter le guide d'installation détaillé, le fonctionnement de l'architecture Clean Architecture et le manuel d'utilisation complet de tous les espaces, consultez :
👉 **[DOCUMENTATION.md](file:///c:/Users/NERIA%20FLORENTIN/Documents/harmy/DOCUMENTATION.md)**

---

## 🛠️ Stack Technique

- **Frontend** : Angular 21, Tailwind CSS, Angular Signals, RxJS, Socket.IO Client.
- **Backend** : Java 17, Spring Boot 3.2.3, Spring Security (JWT), Spring Data JPA, Flyway Migration, AWS SDK (Cloudflare R2 Storage).
- **Base de Données** : PostgreSQL.
- **Devise du site** : FC (Francs Congolais).
