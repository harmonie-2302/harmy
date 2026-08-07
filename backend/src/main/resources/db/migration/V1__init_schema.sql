-- Script de Migration Flyway V1: Initialisation du Schéma PostgreSQL Harmy'sewing

-- 1. Table Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    telephone VARCHAR(50),
    date_creation TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Table Ateliers
CREATE TABLE ateliers (
    id UUID PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    adresse VARCHAR(255),
    telephone VARCHAR(50),
    couturiere_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_creation TIMESTAMP NOT NULL
);

CREATE INDEX idx_ateliers_couturiere ON ateliers(couturiere_id);

-- 3. Table Carnets de Mesures
CREATE TABLE carnets_mesures (
    id UUID PRIMARY KEY,
    nom_client VARCHAR(255) NOT NULL,
    cliente_id UUID REFERENCES users(id) ON DELETE SET NULL,
    couturiere_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    est_local BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP NOT NULL,
    date_modification TIMESTAMP
);

CREATE INDEX idx_carnets_couturiere ON carnets_mesures(couturiere_id);
CREATE INDEX idx_carnets_cliente ON carnets_mesures(cliente_id);

-- 4. Table des Valeurs de Mesures (ElementCollection Map)
CREATE TABLE carnet_mesures_valeurs (
    carnet_id UUID NOT NULL REFERENCES carnets_mesures(id) ON DELETE CASCADE,
    cle_mesure VARCHAR(100) NOT NULL,
    valeur_mesure DOUBLE PRECISION,
    PRIMARY KEY (carnet_id, cle_mesure)
);

-- 5. Table Partages de Carnets
CREATE TABLE partages_carnets (
    id UUID PRIMARY KEY,
    carnet_mesure_id UUID NOT NULL REFERENCES carnets_mesures(id) ON DELETE CASCADE,
    couturiere_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_partage TIMESTAMP NOT NULL,
    CONSTRAINT unique_carnet_couturiere UNIQUE (carnet_mesure_id, couturiere_id)
);

-- 6. Table Commandes (Kanban)
CREATE TABLE commandes (
    id UUID PRIMARY KEY,
    reference VARCHAR(255) NOT NULL UNIQUE,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    atelier_id UUID REFERENCES ateliers(id) ON DELETE SET NULL,
    carnet_mesure_id UUID NOT NULL REFERENCES carnets_mesures(id) ON DELETE CASCADE,
    statut VARCHAR(50) NOT NULL,
    prix_total DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    acompte_verse DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    solde_restant DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    description VARCHAR(2000),
    date_commande TIMESTAMP NOT NULL,
    date_livraison_prevue TIMESTAMP
);

CREATE INDEX idx_commandes_atelier ON commandes(atelier_id);
CREATE INDEX idx_commandes_client ON commandes(client_id);
CREATE INDEX idx_commandes_statut ON commandes(statut);

-- 7. Table Messages (Socket.IO Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    expediteur_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contenu VARCHAR(4000) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX idx_messages_room ON messages(room_id);
