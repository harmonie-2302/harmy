package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "atelier_reviews")
public class ReviewJpaEntity {

    @Id
    private UUID id;

    @Column(name = "atelier_id", nullable = false)
    private UUID atelierId;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "rating", nullable = false)
    private Integer rating = 5;

    @Column(name = "text", length = 2000)
    private String text;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "author_id")
    private UUID authorId;

    public ReviewJpaEntity() {
    }

    public ReviewJpaEntity(UUID id, UUID atelierId, String authorName, Integer rating, String text, LocalDateTime createdAt) {
        this(id, atelierId, authorName, rating, text, createdAt, null);
    }

    public ReviewJpaEntity(UUID id, UUID atelierId, String authorName, Integer rating, String text, LocalDateTime createdAt, UUID authorId) {
        this.id = id;
        this.atelierId = atelierId;
        this.authorName = authorName;
        this.rating = rating != null ? rating : 5;
        this.text = text;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.authorId = authorId;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getAtelierId() {
        return atelierId;
    }

    public void setAtelierId(UUID atelierId) {
        this.atelierId = atelierId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
