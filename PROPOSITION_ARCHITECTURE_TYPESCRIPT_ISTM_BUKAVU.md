# Proposition d'architecture full-stack - Plateforme d'inscription ISTM-Bukavu

**Destinataire :** équipe chargée du développement  
**Version :** 1.0 - 26 août 2026  
**Objet :** réaliser une plateforme web d'inscription et de gestion des candidatures, robuste, sécurisée et maintenable, en TypeScript côté client et côté serveur.

## 1. Périmètre fonctionnel retenu

La plateforme numérise le dépôt et le traitement des dossiers de candidature. Elle ne remplace pas la décision académique : les campagnes, filières, niveaux, pièces demandées, échéances et règles d'admissibilité doivent être administrables et validés par l'ISTM avant la mise en production.

### Espace public / candidat

1. Consulter les filières, conditions, pièces requises et campagnes ouvertes.
2. Créer ou reprendre un dossier sécurisé par e-mail (lien à usage unique ou compte candidat).
3. Remplir un formulaire progressif en six étapes :
   - identité ;
   - parcours secondaire et choix académique ;
   - parents / tuteur et personne de référence ;
   - contacts et motivation ;
   - pièces justificatives ;
   - déclaration, récapitulatif et soumission.
4. Enregistrer un brouillon, corriger les erreurs et joindre des documents.
5. Consulter le statut et les demandes de complément sans exposer les notes internes des agents.

### Espace administration

1. Se connecter avec une authentification forte et des rôles.
2. Gérer les campagnes, filières, niveaux, pièces attendues et comptes du personnel.
3. Rechercher, filtrer, ouvrir et instruire les dossiers.
4. Demander un complément, mettre en attente, valider ou rejeter un dossier avec motif.
5. Consulter les documents sans rendre le stockage public.
6. Exporter une liste autorisée (CSV/XLSX) et suivre les indicateurs par campagne.
7. Conserver l'historique des décisions et actions sensibles.

## 2. Décisions d'architecture

| Couche | Choix proposé | Raison |
|---|---|---|
| Frontend | **Next.js (React) + TypeScript**, App Router | Interface rapide, SSR pour les pages publiques, formulaires riches et bonne base SEO/accessibilité. |
| Design system | Tailwind CSS + composants accessibles (shadcn/ui ou équivalent interne) | UI cohérente, responsive et maintenable. |
| Backend | **NestJS + TypeScript**, adaptateur Fastify | Modules clairs, validation, OpenAPI, tests et contrôle d'accès solides. |
| Contrat API | REST JSON versionnée (`/api/v1`) + OpenAPI | Simple à intégrer, documentable et adapté au besoin. |
| Validation partagée | Zod dans un package partagé | Même validation métier côté formulaire et API, sans dupliquer les règles. |
| Base de données | PostgreSQL 16 + Prisma ORM | Transactions, contraintes, migrations versionnées et très bonne intégrité des données. |
| Fichiers | Stockage objet privé S3 compatible (Cloudflare R2 en production, MinIO en local) | Documents hors serveur web, URLs signées temporaires et sauvegardes plus fiables. |
| Files d'attente | Redis + BullMQ | E-mails, antivirus/contrôle de fichiers, exports et relances sans bloquer l'utilisateur. |
| E-mails | SMTP institutionnel ou Resend/Brevo | Confirmation, lien de reprise, changement de statut et demandes de complément. |
| Déploiement | Docker, CI GitHub Actions, Nginx/Caddy, hébergement Linux | Déploiements reproductibles, TLS et séparation des environnements. |

**Principe clé :** un monolithe modulaire NestJS est recommandé pour la première version. Il est plus réaliste qu'une architecture microservices pour une équipe et un périmètre de cette taille. Les modules, les contrats et les workers permettent une évolution ultérieure sans réécriture.

## 3. Vue d'ensemble

```text
Navigateur candidat / agent
          |
          v
apps/web (Next.js, TypeScript)
          |
          | HTTPS - REST /api/v1
          v
apps/api (NestJS, TypeScript)
  |          |              |
  v          v              v
PostgreSQL  S3 prive       Redis/BullMQ ---> e-mails, export, antivirus
             |                 
             +--> URL signee courte pour televerser/consulter une piece
```

Le frontend ne parle jamais directement à PostgreSQL. Les documents ne sont jamais servis depuis un dossier web public : l'API vérifie les droits puis produit une URL signée courte, ou diffuse le fichier de façon contrôlée.

## 4. Monorepo et noms des fichiers

Utiliser `pnpm` workspaces et Turborepo. Toutes les applications et bibliothèques partagent TypeScript strict, ESLint, Prettier et les contrats de données.

```text
istm-bukavu-admissions/
├─ apps/
│  ├─ web/                                      # Next.js - frontend
│  │  ├─ app/
│  │  │  ├─ (public)/
│  │  │  │  ├─ page.tsx                         # accueil
│  │  │  │  ├─ filieres/page.tsx
│  │  │  │  ├─ admission/page.tsx
│  │  │  │  ├─ campagnes/[slug]/page.tsx
│  │  │  │  ├─ candidature/
│  │  │  │  │  ├─ demarrer/page.tsx
│  │  │  │  │  ├─ [applicationId]/page.tsx      # shell du formulaire
│  │  │  │  │  └─ suivi/page.tsx
│  │  │  │  └─ layout.tsx
│  │  │  ├─ (auth)/connexion/page.tsx
│  │  │  ├─ (admin)/admin/
│  │  │  │  ├─ page.tsx                         # tableau de bord
│  │  │  │  ├─ dossiers/page.tsx
│  │  │  │  ├─ dossiers/[applicationId]/page.tsx
│  │  │  │  ├─ campagnes/page.tsx
│  │  │  │  ├─ referentiels/page.tsx
│  │  │  │  ├─ utilisateurs/page.tsx
│  │  │  │  └─ exports/page.tsx
│  │  │  ├─ api/health/route.ts
│  │  │  ├─ layout.tsx
│  │  │  └─ globals.css
│  │  ├─ components/
│  │  │  ├─ application-form/
│  │  │  │  ├─ application-wizard.tsx
│  │  │  │  ├─ step-identity.tsx
│  │  │  │  ├─ step-academic-background.tsx
│  │  │  │  ├─ step-guardians.tsx
│  │  │  │  ├─ step-contact-motivation.tsx
│  │  │  │  ├─ step-documents.tsx
│  │  │  │  ├─ step-declaration.tsx
│  │  │  │  └─ progress-indicator.tsx
│  │  │  ├─ admin/
│  │  │  │  ├─ applications-table.tsx
│  │  │  │  ├─ application-decision-dialog.tsx
│  │  │  │  └─ dashboard-metrics.tsx
│  │  │  └─ ui/                                 # composants génériques accessibles
│  │  ├─ features/
│  │  │  ├─ applications/api.ts
│  │  │  ├─ applications/hooks.ts
│  │  │  ├─ campaigns/api.ts
│  │  │  └─ auth/session.ts
│  │  ├─ lib/
│  │  │  ├─ api-client.ts
│  │  │  ├─ auth.ts
│  │  │  └─ env.ts
│  │  ├─ middleware.ts
│  │  ├─ next.config.ts
│  │  ├─ package.json
│  │  └─ .env.example
│  └─ api/                                      # NestJS - backend
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ app.module.ts
│     │  ├─ config/
│     │  │  ├─ env.schema.ts
│     │  │  ├─ database.config.ts
│     │  │  ├─ storage.config.ts
│     │  │  └─ security.config.ts
│     │  ├─ common/
│     │  │  ├─ decorators/current-user.decorator.ts
│     │  │  ├─ decorators/roles.decorator.ts
│     │  │  ├─ guards/jwt-auth.guard.ts
│     │  │  ├─ guards/roles.guard.ts
│     │  │  ├─ filters/http-exception.filter.ts
│     │  │  ├─ interceptors/audit.interceptor.ts
│     │  │  └─ pipes/zod-validation.pipe.ts
│     │  ├─ modules/
│     │  │  ├─ auth/
│     │  │  │  ├─ auth.module.ts
│     │  │  │  ├─ auth.controller.ts
│     │  │  │  ├─ auth.service.ts
│     │  │  │  ├─ strategies/jwt.strategy.ts
│     │  │  │  └─ dto/login.dto.ts
│     │  │  ├─ applications/
│     │  │  │  ├─ applications.module.ts
│     │  │  │  ├─ applications.controller.ts
│     │  │  │  ├─ applications.service.ts
│     │  │  │  ├─ application-workflow.service.ts
│     │  │  │  ├─ application.repository.ts
│     │  │  │  └─ dto/
│     │  │  ├─ documents/
│     │  │  │  ├─ documents.controller.ts
│     │  │  │  ├─ documents.service.ts
│     │  │  │  ├─ document-scan.processor.ts
│     │  │  │  └─ storage.service.ts
│     │  │  ├─ campaigns/
│     │  │  ├─ catalog/
│     │  │  ├─ users/
│     │  │  ├─ notifications/
│     │  │  ├─ exports/
│     │  │  ├─ audit/
│     │  │  └─ health/
│     │  ├─ prisma/prisma.service.ts
│     │  └─ jobs/
│     │     ├─ jobs.module.ts
│     │     └─ application-reminder.processor.ts
│     ├─ test/
│     │  ├─ applications.e2e-spec.ts
│     │  └─ auth.e2e-spec.ts
│     ├─ package.json
│     └─ .env.example
├─ packages/
│  ├─ contracts/
│  │  ├─ src/application.schema.ts              # Zod + types partagés
│  │  ├─ src/auth.schema.ts
│  │  ├─ src/enums.ts
│  │  └─ src/index.ts
│  ├─ ui/
│  │  ├─ src/button.tsx
│  │  ├─ src/form-field.tsx
│  │  └─ src/index.ts
│  ├─ eslint-config/index.js
│  └─ typescript-config/base.json
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.ts
│  └─ migrations/
├─ infra/
│  ├─ docker/docker-compose.dev.yml
│  ├─ nginx/istm-admissions.conf
│  ├─ minio/init-buckets.sh
│  └─ monitoring/uptime-kuma-compose.yml
├─ docs/
│  ├─ architecture.md
│  ├─ api.md
│  ├─ roles-et-workflow.md
│  ├─ runbook-production.md
│  └─ decision-log.md
├─ .github/workflows/ci.yml
├─ .env.example
├─ docker-compose.yml
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.json
├─ eslint.config.js
└─ README.md
```

## 5. Modèle de données recommandé

Ne pas concentrer toutes les données dans une seule table `candidats`. Le dossier est un objet métier avec son historique et ses documents ; les référentiels académiques doivent rester indépendants.

| Table | Colonnes essentielles | Rôle |
|---|---|---|
| `users` | `id`, `email`, `password_hash`, `role`, `is_active`, `last_login_at` | Comptes administratifs, et candidat si l'option compte candidat est retenue. |
| `academic_years` | `id`, `label`, `starts_on`, `ends_on`, `is_active` | Années académiques. |
| `admission_campaigns` | `id`, `academic_year_id`, `name`, `slug`, `opens_at`, `closes_at`, `status` | Fenêtre d'inscription et règles de campagne. |
| `programs` | `id`, `code`, `name`, `mention`, `is_active` | Filières ISTM, gérées par le personnel autorisé. |
| `study_levels` | `id`, `code`, `label`, `sort_order`, `is_active` | Niveaux de formation. |
| `campaign_programs` | `campaign_id`, `program_id`, `level_id`, `capacity` | Offre effective d'une campagne. |
| `document_requirements` | `id`, `campaign_id`, `code`, `label`, `is_required`, `allowed_mime_types`, `max_size_bytes` | Pièces exigées par campagne, configurables. |
| `applications` | `id`, `reference`, `campaign_id`, `status`, `submitted_at`, `decision_at`, `assigned_to_user_id`, `version` | Dossier, cycle de vie et verrouillage optimiste. |
| `applicant_profiles` | `application_id`, identité, naissance, sexe, adresse, téléphone, e-mail | Informations personnelles du candidat. |
| `academic_backgrounds` | `application_id`, école, option, année, diplôme, pourcentage | Parcours scolaire. |
| `application_choices` | `application_id`, `rank`, `campaign_program_id` | Premier choix obligatoire, second choix éventuel. |
| `guardians` | `id`, `application_id`, `kind`, nom, téléphone, profession | Parent/tuteur et personne de référence. |
| `application_documents` | `id`, `application_id`, `requirement_id`, `object_key`, `original_name`, `mime_type`, `size_bytes`, `scan_status` | Métadonnées, jamais le binaire dans PostgreSQL. |
| `application_declarations` | `application_id`, `accepted_at`, `ip_hash`, `version` | Trace de la déclaration finale. |
| `application_status_history` | `id`, `application_id`, `from_status`, `to_status`, `reason`, `actor_user_id`, `created_at` | Historique complet des décisions. |
| `staff_notes` | `id`, `application_id`, `author_user_id`, `body`, `visibility` | Notes exclusivement internes. |
| `audit_logs` | `id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `metadata`, `created_at` | Traçabilité sécurité et administration. |

### Statuts et transitions

```text
DRAFT -> SUBMITTED -> UNDER_REVIEW -> NEEDS_COMPLEMENT -> SUBMITTED
                                  |-> APPROVED
                                  |-> REJECTED
```

Une transition est exécutée dans une transaction : mise à jour du dossier, insertion dans `application_status_history`, écriture de l'audit et planification de la notification. Le statut n'est jamais modifié directement depuis le contrôleur.

## 6. API REST v1 à livrer

| Domaine | Endpoints principaux |
|---|---|
| Public | `GET /public/campaigns`, `GET /public/campaigns/:slug`, `GET /public/programs` |
| Accès candidat | `POST /candidate-access/request-link`, `POST /candidate-access/verify-link`, `GET /me/applications` |
| Dossiers candidat | `POST /applications`, `GET /applications/:id`, `PATCH /applications/:id`, `POST /applications/:id/submit`, `GET /applications/:id/status` |
| Documents | `POST /applications/:id/documents/upload-intents`, `POST /applications/:id/documents/complete`, `DELETE /applications/:id/documents/:documentId` |
| Auth personnel | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Administration dossiers | `GET /admin/applications`, `GET /admin/applications/:id`, `PATCH /admin/applications/:id/assign`, `POST /admin/applications/:id/transition`, `POST /admin/applications/:id/notes` |
| Référentiels | CRUD `/admin/campaigns`, `/admin/programs`, `/admin/levels`, `/admin/document-requirements` |
| Administration | CRUD `/admin/users`, `GET /admin/dashboard`, `POST /admin/exports/applications` |
| Exploitation | `GET /health/live`, `GET /health/ready` |

Les réponses d'erreur utilisent un format unique : `code`, `message`, `fieldErrors`, `requestId`. La spécification OpenAPI est générée par NestJS et publiée sur `/api/docs` seulement en environnement protégé.

## 7. Sécurité et protection des données

1. **Authentification personnel :** mots de passe Argon2id, cookies `HttpOnly`, `Secure`, `SameSite=Lax`, rotation de refresh token ; MFA à prévoir avant ouverture officielle.
2. **Autorisation :** RBAC minimal `SUPER_ADMIN`, `ADMISSIONS_MANAGER`, `REVIEWER`, `SUPPORT`. Chaque endpoint vérifie explicitement rôle et portée.
3. **Candidat :** lien e-mail signé, expirant et à usage unique pour reprendre un dossier ; un compte candidat permanent peut être activé ensuite si l'ISTM le souhaite.
4. **Fichiers :** liste blanche MIME vérifiée côté serveur, taille configurable, nom objet généré, analyse antivirus asynchrone, bucket privé, URL signée de courte durée. Accepter par défaut PDF/JPEG/PNG, pas les exécutables ni les fichiers Office macro.
5. **Entrées :** validation Zod au frontend et au backend, limites de taille, normalisation, protection anti-CSRF si cookies, rate limiting sur connexion/lien e-mail/soumission.
6. **Données sensibles :** chiffrement TLS, sauvegardes chiffrées, secrets hors dépôt, logs sans mot de passe ni document ni données personnelles complètes.
7. **Traçabilité :** audit obligatoire pour export, consultation de document, changement de statut, création/désactivation de compte et modification de référentiel.
8. **Rétention :** documenter avec l'ISTM la durée de conservation, le traitement des dossiers rejetés et la procédure de suppression/anonymisation.

## 8. Interfaces et règles frontend

- Mobile-first ; toutes les actions essentielles doivent fonctionner sur smartphone et connexion instable.
- Autosauvegarde locale courte et sauvegarde serveur à chaque changement d'étape réussi.
- Chaque étape valide ses champs, mais la soumission finale revalide tout côté API.
- Composant `step-documents.tsx` affiche une exigence par pièce, son état de scan et les erreurs compréhensibles.
- L'administration propose filtres par campagne, statut, filière, niveau, date et texte ; pagination côté serveur obligatoire.
- Les pages d'administration sont protégées par `middleware.ts` pour l'expérience utilisateur **et** par les guards NestJS pour la sécurité réelle.
- La langue par défaut est le français ; préparer `next-intl` uniquement si le multilingue devient nécessaire.

## 9. Plan de réalisation conseillé

| Sprint | Livrable et critères d'acceptation |
|---|---|
| 0 - Cadrage (1 semaine) | Règles institutionnelles confirmées, maquettes, catalogue exact, types de documents, rôles, politique de conservation. |
| 1 - Socle (1 semaine) | Monorepo, Docker local, CI, Prisma, migrations, authentification personnel, OpenAPI, logs et healthchecks. |
| 2 - Référentiels/public (1 semaine) | Campagnes, filières, niveaux, pages publiques, gestion admin des référentiels. |
| 3 - Dossier candidat (2 semaines) | Formulaire six étapes, brouillon/reprise, validation partagée, soumission transactionnelle. |
| 4 - Documents et instruction (2 semaines) | Stockage privé, contrôle des fichiers, tableau de bord, détail dossier, workflow et notifications. |
| 5 - Qualité/exploitation (1 à 2 semaines) | Exports, audit, tests E2E, sauvegardes, documentation, préproduction et recette ISTM. |

## 10. Tests, CI/CD et exploitation

### Tests minimums

- Unitaires : services métier, transitions d'état, permissions et schémas Zod.
- Intégration : Prisma/PostgreSQL, stockage et génération d'URL signées.
- E2E Playwright : création/reprise/soumission d'un dossier, rejet avec motif, demande de complément, accès interdit et téléversement refusé.
- Sécurité : tests de rôles, rate limiting, taille/type de fichier, absence de fuite de fichier privé, dépendances vulnérables.
- Accessibilité : parcours clavier, libellés de champs, contrastes et affichage mobile.

### Pipeline GitHub Actions (`.github/workflows/ci.yml`)

1. `pnpm install --frozen-lockfile`
2. lint, format check et TypeScript strict
3. tests unitaires et intégration avec PostgreSQL temporaire
4. build de `apps/web` et `apps/api`
5. E2E sur environnement éphémère
6. scan des dépendances et build des images Docker
7. déploiement en préproduction après validation ; production uniquement par approbation.

### Sauvegardes et supervision

- Sauvegarde PostgreSQL quotidienne, test de restauration mensuel.
- Versionnement/lifecycle du bucket de documents selon politique approuvée.
- Alertes sur indisponibilité, erreurs 5xx, saturation stockage, échecs de jobs et expiration de certificats.
- Journal de mise en production et procédure de retour arrière dans `docs/runbook-production.md`.

## 11. Variables d'environnement à prévoir

```dotenv
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
APP_URL=https://admissions.istmbukavu.org
API_URL=https://api.admissions.istmbukavu.org
SMTP_URL=smtp://...
S3_ENDPOINT=https://...
S3_REGION=auto
S3_BUCKET=istm-admissions-private
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
ANTIVIRUS_ENABLED=true
```

Les secrets ne doivent jamais être committés. Fournir uniquement `.env.example` dans le dépôt et les injecter via le gestionnaire de secrets de l'hébergeur/CI.

## 12. Points à confirmer avant de coder

1. Liste officielle des filières, niveaux, capacités et campagne académique active.
2. Liste et formats des pièces obligatoires, taille maximale et conditions de rejet.
3. Règles d'acceptation, critères de doublon et signification finale des statuts.
4. Utilisation ou non d'un compte candidat permanent ; la proposition prend en charge un lien e-mail de reprise sans imposer de mot de passe.
5. Comptes/agents autorisés, rôles et validation à plusieurs niveaux éventuelle.
6. Hébergement, nom de domaine, e-mail expéditeur, fournisseur de stockage et budget d'exploitation.
7. Politique institutionnelle de confidentialité, conservation et sauvegarde des données.

## 13. Définition de terminé (MVP exploitable)

Le MVP peut être accepté lorsque : une campagne configurée est consultable ; un candidat peut compléter et reprendre un dossier ; les pièces sont stockées privées et contrôlées ; un agent autorisé peut rechercher et instruire un dossier ; toute décision est historisée et notifiée ; les référentiels ne sont pas codés en dur ; les sauvegardes, tests critiques, documentation de déploiement et recette institutionnelle ont été réalisés.

