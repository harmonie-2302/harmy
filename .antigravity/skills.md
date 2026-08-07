---
name: harmysewing-comprehensive-skill
description: Guide suprême de l'architecture, du code, des conventions et des règles métier pour le projet Harmy'sewing.
version: 1.0.0
---

# 1. Architecture Complète du Projet

L'application Harmy'sewing s'appuie sur une séparation stricte des responsabilités entre un Backend robuste développé en **Spring Boot (Java 17+)** et un Frontend dynamique en **Angular (v17+)**.

## 1.1. Backend : Clean Architecture (Spring Boot)

Le backend respecte scrupuleusement la **Clean Architecture** (Architecture Hexagonale). L'objectif est d'isoler la logique métier des frameworks techniques (JPA, Spring Web, etc.). Le flux de dépendance va **toujours de l'extérieur vers l'intérieur**.

```mermaid
graph TD
    subgraph Spring Boot Backend
        direction TB
        Presentation[Presentation Layer (REST Controllers)]
        Infrastructure[Infrastructure Layer (JPA, Cloudflare, Socket.IO)]
        Application[Application Layer (Use Cases, Ports In/Out)]
        Domain[Domain Layer (Pure Java Entities)]
        
        Presentation --> Application
        Infrastructure --> Application
        Application --> Domain
    end
```

### Règles Absolues de l'Architecture
- **Domain Layer (`domain`)** : Aucune dépendance externe. Uniquement du pur Java (POJO). Pas de `@Entity`, pas de `@Table`, pas de dépendances Spring.
- **Application Layer (`application`)** : Orchestration des processus métier. Contient les cas d'utilisation (Use Cases) et définit les interfaces des Ports (entrées et sorties). Pas de dépendances techniques fortes.
- **Infrastructure Layer (`infrastructure`)** : Implémente les Ports de sortie (Adapters). Contient les entités JPA, la configuration de base de données, l'intégration Cloudflare R2, et Socket.IO.
- **Presentation Layer (`presentation`)** : Points d'entrée (Contrôleurs REST, Filtres de sécurité). Ne communique qu'avec la couche Application.

## 1.2. Frontend : Standalone Components (Angular 17+)

Le Frontend adopte l'architecture modulaire et légère propre à Angular 17.
- **Zéro NgModule** : Utilisation exclusive des Standalone Components pour optimiser le Lazy Loading et la performance.
- **State Management** : Utilisation des **Angular Signals** pour l'état synchrone local (formulaires, états UI) et **RxJS** pour l'asynchronisme (WebSockets, requêtes HTTP).
- **Styling** : Tailwind CSS couplé à Angular Material (CDK pour le Kanban).

---

# 2. Conventions de Code

> [!IMPORTANT]
> Tout code généré doit être clair, documenté, fortement typé, et respecter les principes SOLID.

## 2.1. Backend (Java / Spring Boot)
- **Principes SOLID** : Classes à responsabilité unique (Single Responsibility). Les Use Cases ne font qu'une seule chose (ex: `CreateOrderUseCase` et non `OrderService` géant).
- **Gestion des Nulls** : Utiliser `Optional<T>` pour les valeurs pouvant être absentes, particulièrement dans les retours de méthodes des Repositories.
- **Immutabilité** : Les objets de transfert (DTOs) doivent être des `Record` Java 14+ (`public record OrderDto(...)`).
- **Constructeurs** : Favoriser l'injection de dépendances par constructeur (Constructor Injection) plutôt que par `@Autowired` sur les champs, idéalement via l'annotation `@RequiredArgsConstructor` de Lombok.
- **Validation** : Les données entrantes doivent être validées à la frontière du système (Controllers) en utilisant `jakarta.validation.constraints` (ex: `@NotNull`, `@Email`).

## 2.2. Frontend (Angular / TypeScript)
- **Typage Strict** : `any` est strictement interdit. Toutes les interfaces, types, retours de fonctions et observables doivent être typés.
- **RxJS / Signals** : Si un état change au fil du temps et impacte le template de manière asynchrone, utilisez les Signals `signal()`, `computed()`, et `effect()`. Si l'état provient d'une source externe asynchrone persistante, utilisez `Observable`.
- **Désabonnement (Unsubscribe)** : Utilisez `takeUntilDestroyed()` ou le `AsyncPipe` (`| async`) dans les templates pour éviter les fuites de mémoire.
- **Chemins absolus** : Utiliser les alias TypeScript (ex: `@core/`, `@features/`) configurés dans `tsconfig.json` plutôt que les chemins relatifs infinis (`../../../`).

---

# 3. Structure des Modules

## 3.1. Structure Backend (Spring Boot)

```text
com.harmysewing
├── domain
│   ├── exceptions        # Exceptions métiers spécifiques
│   └── models            # Entités pures (User, Order, Measurement)
├── application
│   ├── ports
│   │   ├── in            # Interfaces Use Cases (entrées)
│   │   └── out           # Interfaces Repositories & Services externes
│   └── usecases          # Implémentations des Use Cases
├── infrastructure
│   ├── persistence       # Entités JPA, Spring Data Repositories, Adapters
│   ├── storage           # Cloudflare R2 Adapters
│   ├── messaging         # Socket.IO configurations & Adapters
│   └── security          # JWT Filters, Spring Security Config
└── presentation
    ├── api               # REST Controllers
    ├── dtos              # Records et validation (Requêtes/Réponses)
    └── exceptions        # @ControllerAdvice (Global Error Handler)
```

## 3.2. Structure Frontend (Angular)

```text
src/
├── app/
│   ├── core/             # Services Singletons (AuthService, API Interceptors, Guards)
│   ├── shared/           # Composants réutilisables (Boutons, Modales, Directives, Pipes)
│   ├── features/         # Fonctionnalités métier Lazy-loaded
│   │   ├── auth/         # Login, Register
│   │   ├── atelier/      # Kanban, Comptabilité, Agenda
│   │   ├── catalogue/    # Fil d'actualité, Tags
│   │   ├── messagerie/   # Chat Socket.IO
│   │   └── admin/        # Panel de modération
│   ├── app.component.ts
│   └── app.routes.ts     # Routage global (Lazy Loading direct sur composants)
├── environments/         # Configs (URLs d'API, clés publiques)
└── styles/               # Configuration globale Tailwind CSS
```

---

# 4. Règles Métier (Harmy'sewing)

Les règles métier sont sacrées et doivent être encodées dans la couche **Domain** et exécutées par la couche **Application**.

> [!WARNING]
> La non-vérification de ces règles peut entraîner de graves problèmes de facturation et de violation de vie privée.

## 4.1. Commandes et Kanban
- **Création de commande** : Une commande nécessite un `CarnetMesure` valide. Elle commence obligatoirement à l'état `TISSU_RECU`.
- **Kanban** : Le cycle de vie d'une commande est linéaire et strict : `TISSU_RECU` -> `EN_COUTURE` -> `PRET_POUR_ESSAYAGE` -> `LIVRE`.
- **Clôture** : Lors du passage à l'état `LIVRE`, le système doit s'assurer que le solde restant de la commande (`solde_restant`) est strictement égal à 0.

## 4.2. Comptabilité et Paiements
- **Calcul Total** : `prix_total` = `acompte_verse` + `solde_restant`.
- **Validation** : Les acomptes ne peuvent pas être négatifs. Le solde restant ne peut pas être inférieur à zéro.
- **Atomisation** : Tout paiement (enregistrement d'un acompte ou règlement final) doit être exécuté au sein d'une transaction `@Transactional` à la frontière de l'infrastructure pour éviter la corruption de données financières.

## 4.3. Carnets de Mesures
- **Isolation** : Un carnet local (`est_local=true`) appartient exclusivement à la Couturière qui l'a créé. Personne d'autre ne peut le voir.
- **Partage** : Un carnet inscrit (`est_local=false`) appartient à la Cliente. Une Couturière ne peut y accéder que si une entité `PartageCarnet` valide lie le `CarnetMesure.id` à son `Couturiere.id`.

## 4.4. Messagerie (Temps Réel)
- **Authentification Socket** : Chaque connexion WebSockets (Socket.IO) doit valider le token JWT lors du *handshake*.
- **Autorisation d'accès aux salons (Rooms)** : Un utilisateur ne peut rejoindre que les *Rooms* correspondantes aux `DiscussionPrivee` dont il est membre.

---

# 5. Conventions de Nommage

L'uniformité du code garantit sa maintenabilité par de futurs développeurs ou intelligences artificielles.

## 5.1. Java / Spring Boot
- **Classes/Interfaces** : PascalCase (ex: `CreateOrderUseCase`, `OrderRepository`).
- **Méthodes et Variables** : camelCase (ex: `calculateTotalBalance()`, `orderList`).
- **Interfaces Ports In/Out** : 
  - Suffixe `Port` n'est pas strictement requis mais clarifie. Ex: `SaveOrderPort`.
  - Préférer l'utilisation des verbes pour les Ports In (Use cases) (ex: `CreateOrderUseCase`).
- **Implémentations d'Adapters** : Suffixe `Adapter`. (ex: `PostgresOrderAdapter`, `CloudflareStorageAdapter`).
- **Entités JPA** : Suffixe `JpaEntity` (ex: `OrderJpaEntity`) pour ne pas confondre avec l'entité du Domaine (`Order`).
- **Mappers** : Nommer les mappers selon la convention `SourceToTargetMapper` (ex: `OrderDomainToJpaMapper`).

## 5.2. TypeScript / Angular
- **Fichiers de composants** : kebab-case (ex: `order-list.component.ts`).
- **Sélecteurs de composants** : kebab-case avec préfixe `app-` (ex: `<app-order-list>`).
- **Classes/Interfaces** : PascalCase (ex: `OrderList`, `AuthService`).
- **Variables et Fonctions** : camelCase (ex: `fetchOrders()`, `currentUser`).
- **Variables Observables** : Suffixées d'un dollar `$` (ex: `currentUser$ = new BehaviorSubject(null);`).
- **Types Signal** : Inutile de suffixer les Signals. (ex: `const count = signal(0);`).

---

# 6. Structure des API REST

L'API doit respecter les normes RESTful strictes avec l'utilisation sémantique des verbes HTTP et des codes de statut.

## 6.1. Routes & Verbes
- `GET` : Récupérer une ou plusieurs ressources.
- `POST` : Créer une ressource.
- `PUT` : Remplacer entièrement une ressource.
- `PATCH` : Mettre à jour partiellement une ressource (ex: changer le statut Kanban).
- `DELETE` : Supprimer une ressource.

Exemples de routes API :
- `POST /api/v1/auth/register` : Créer un compte
- `POST /api/v1/auth/login` : Authentification
- `GET /api/v1/orders` : Lister les commandes de l'utilisateur connecté
- `POST /api/v1/orders` : Créer une commande
- `PATCH /api/v1/orders/{orderId}/status` : Mettre à jour le statut Kanban
- `GET /api/v1/measurements/{customerId}` : Obtenir le carnet d'un client

## 6.2. Réponses Standardisées
Toutes les réponses de l'API doivent être standardisées, en particulier les erreurs, pour faciliter le traitement côté Frontend.

Exemple de réponse en cas d'erreur métier (Code `400 Bad Request` ou `422 Unprocessable Entity`) :
```json
{
  "timestamp": "2026-08-07T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Le solde restant doit être de 0 avant de livrer la commande.",
  "path": "/api/v1/orders/123/status"
}
```

## 6.3. Pagination et Tri
Les listes volumineuses (ex: catalogue, liste de commandes terminées) doivent implémenter la pagination (ex: `?page=0&size=20&sort=createdAt,desc`).

---

# 7. Règles PostgreSQL & Persistance

> [!TIP]
> PostgreSQL est le cœur des données. La conception du schéma doit optimiser l'intégrité et la rapidité des requêtes.

## 7.1. Intégrité Référentielle
- Toutes les relations inter-entités (OneToMany, ManyToOne) doivent avoir des contraintes de clés étrangères `FOREIGN KEY` appliquées directement sur le schéma SQL.
- Le comportement de suppression (ON DELETE CASCADE, SET NULL) doit être réfléchi : par exemple, si un compte `Couturiere` est supprimé, ses commandes doivent être archivées ou supprimées en cascade pour éviter les commandes orphelines.

## 7.2. Indexation
- Créer des index sur les colonnes fréquemment utilisées dans les clauses `WHERE` : `atelier_id` dans les commandes, `email` dans les utilisateurs (Index UNIQUE).
- Créer des index sur les clés de tri courantes (ex: `date_creation`).

## 7.3. Flyway ou Liquibase (Migrations)
- **Toute modification** du schéma de base de données doit être versionnée à l'aide de scripts de migration SQL (ex: Flyway `V1__init_schema.sql`, `V2__add_status_column.sql`). Ne jamais s'appuyer sur le paramètre JPA `hibernate.hbm2ddl.auto=update` en production.

## 7.4. UUIDs
- Privilégier les UUID (générés via `UUID.randomUUID()` en Java) comme Clés Primaires au lieu d'entiers auto-incrémentés, pour des raisons de sécurité (impossible de deviner le nombre de commandes ou d'utilisateurs par simple incrémentation d'URL).

---

# 8. Standards Angular & UI

Le Frontend doit être fluide, réactif, et appliquer une politique stricte du "Tactile-First" (Mobile-First).

## 8.1. Composants et Logique
- **Smart Components vs Presentational Components** : Séparer les composants qui gèrent la logique (Smart - qui appellent les services, accèdent au routeur) des composants d'affichage (Presentational/Dumb - qui ne reçoivent que des `@Input()` et émettent des `@Output()`).
- Par exemple, `<app-kanban-board>` (Smart) récupère les commandes et les passe à `<app-kanban-column [orders]="filteredOrders" (statusChanged)="update($event)">` (Dumb).

## 8.2. Gestion des Services
- Les services Angular communiquant avec le backend (API) doivent être isolés dans le dossier `core/services`.
- Ne jamais manipuler de données directement dans les composants ; déléguer cette responsabilité aux services (Facade Pattern si nécessaire pour réduire la complexité dans le composant).

## 8.3. Styling (Tailwind + Angular Material)
- Ne pas mélanger aveuglément Tailwind et le CSS encapsulé des composants. Utiliser Tailwind `class="..."` directement dans l'HTML.
- Pour les surcharges de style Angular Material impossibles via Tailwind, utiliser l'encapsulation `::ng-deep` de manière très parcimonieuse, et toujours enveloppée dans la classe hôte `:host { ::ng-deep { ... } }` pour éviter les fuites de style globales.

## 8.4. Intercepteurs (HTTP Interceptors)
- **JwtInterceptor** : Ajoute l'entête `Authorization: Bearer <token>` à toutes les requêtes (sauf `/auth/`).
- **ErrorInterceptor** : Intercepte les erreurs 401 (Non Autorisé) pour rediriger l'utilisateur vers la page de login de manière silencieuse et globale. Intercepte les 403 (Interdit) pour afficher un toast d'alerte (via un composant Snackbar).

## 8.5. Performance
- **Change Detection** : Configurer la stratégie de détection de changement des composants d'affichage sur `ChangeDetectionStrategy.OnPush` pour des performances maximales.
- **Lazy Loading des images** : Toutes les images (modèles, avatars) téléchargées via Cloudflare R2 doivent utiliser l'attribut natif HTML `loading="lazy"`.

---
Fin du fichier `skills.md`. Ce fichier de contexte doit être impérativement fourni à l'IA ou au développeur pour valider chaque PR.
