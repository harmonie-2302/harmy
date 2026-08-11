-- Script de Migration Flyway V2: Extensions pour Posts, Clients Atelier, Tâches, Avis et Signalements

-- 1. Table Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_avatar VARCHAR(500),
    atelier_id UUID REFERENCES ateliers(id) ON DELETE SET NULL,
    caption VARCHAR(2000) NOT NULL,
    price_hint DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    currency VARCHAR(20) NOT NULL DEFAULT 'FCFA',
    tags VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_atelier ON posts(atelier_id);

-- 2. Table Médias des Posts
CREATE TABLE post_media (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    media_url VARCHAR(1000) NOT NULL,
    media_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (post_id, media_url)
);

-- 3. Table Likes des Posts
CREATE TABLE post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

-- 4. Table Commentaires
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_avatar VARCHAR(500),
    text VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_comments_post ON comments(post_id);

-- 5. Table Clients Atelier Local/Enregistré
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    atelier_id UUID NOT NULL REFERENCES ateliers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'local',
    registered_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    notes VARCHAR(2000),
    bust DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    waist DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    hips DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    arm DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_customers_atelier ON customers(atelier_id);

-- 6. Table Tâches Journalières Atelier
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    atelier_id UUID NOT NULL REFERENCES ateliers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    due_date TIMESTAMP
);

CREATE INDEX idx_tasks_atelier ON tasks(atelier_id);

-- 7. Table Avis Ateliers
CREATE TABLE atelier_reviews (
    id UUID PRIMARY KEY,
    atelier_id UUID NOT NULL REFERENCES ateliers(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    text VARCHAR(2000),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_reviews_atelier ON atelier_reviews(atelier_id);

-- 8. Table Signalements (Reports)
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    post_title VARCHAR(255) NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL
);
