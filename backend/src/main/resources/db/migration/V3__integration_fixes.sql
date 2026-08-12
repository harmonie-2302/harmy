-- Script de Migration Flyway V3: Intégration complète Frontend <-> Backend
-- Objectif: supprimer les blocages structurels qui empêchaient la couturière
-- de créer quoi que ce soit (contraintes NOT NULL sur des FK non provisionnées)
-- et ajouter les colonnes réellement exploitées par l'interface.

-- 1. Profil public de l'atelier (édité par la couturière depuis son espace)
ALTER TABLE ateliers ADD COLUMN ville VARCHAR(255);
ALTER TABLE ateliers ADD COLUMN pays VARCHAR(255);
ALTER TABLE ateliers ADD COLUMN pricing VARCHAR(255);
ALTER TABLE ateliers ADD COLUMN portfolio_cover_url VARCHAR(1000);

UPDATE ateliers SET pays = 'RD Congo' WHERE pays IS NULL;

-- 2. Carnet de mesures: le carnet privé d'une cliente n'appartient à aucune couturière.
--    La contrainte NOT NULL faisait échouer toute création depuis l'espace cliente.
ALTER TABLE carnets_mesures ALTER COLUMN couturiere_id DROP NOT NULL;

-- 2b. Rattachement optionnel d'un carnet à une fiche cliente d'atelier
--     (permet de créer une commande pour une cliente locale non inscrite).
ALTER TABLE carnets_mesures ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX idx_carnets_customer ON carnets_mesures(customer_id);

-- 3. Profil utilisateur + abonnement SaaS (piloté depuis la console d'administration)
ALTER TABLE users ADD COLUMN photo_url VARCHAR(1000);
ALTER TABLE users ADD COLUMN whatsapp VARCHAR(50);
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(100);
ALTER TABLE users ADD COLUMN subscription_renewal_date TIMESTAMP;

-- 4. Avis d'atelier: on conserve l'auteur pour éviter les doublons et permettre l'édition
ALTER TABLE atelier_reviews ADD COLUMN author_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_reviews_author ON atelier_reviews(author_id);

-- 5. Commentaires: auteur identifié
ALTER TABLE comments ADD COLUMN author_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_comments_author ON comments(author_id);
