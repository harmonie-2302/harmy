package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "posts")
public class PostJpaEntity {

    @Id
    private UUID id;

    @Column(name = "author_id")
    private UUID authorId;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_avatar")
    private String authorAvatar;

    @Column(name = "atelier_id")
    private UUID atelierId;

    @Column(name = "caption", nullable = false, length = 2000)
    private String caption;

    @Column(name = "price_hint", nullable = false)
    private Double priceHint;

    @Column(name = "currency", nullable = false)
    private String currency;

    @Column(name = "tags")
    private String tags;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_media", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_url", nullable = false)
    private List<String> media = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "user_id", nullable = false)
    private List<UUID> likes = new ArrayList<>();

    public PostJpaEntity() {
    }

    public PostJpaEntity(UUID id, UUID authorId, String authorName, String authorAvatar, UUID atelierId, String caption, Double priceHint, String currency, String tags, LocalDateTime createdAt, List<String> media, List<UUID> likes) {
        this.id = id;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorAvatar = authorAvatar;
        this.atelierId = atelierId;
        this.caption = caption;
        this.priceHint = priceHint;
        this.currency = currency;
        this.tags = tags;
        this.createdAt = createdAt;
        if (media != null) this.media = media;
        if (likes != null) this.likes = likes;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorAvatar() {
        return authorAvatar;
    }

    public void setAuthorAvatar(String authorAvatar) {
        this.authorAvatar = authorAvatar;
    }

    public UUID getAtelierId() {
        return atelierId;
    }

    public void setAtelierId(UUID atelierId) {
        this.atelierId = atelierId;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Double getPriceHint() {
        return priceHint;
    }

    public void setPriceHint(Double priceHint) {
        this.priceHint = priceHint;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getMedia() {
        return media;
    }

    public void setMedia(List<String> media) {
        this.media = media;
    }

    public List<UUID> getLikes() {
        return likes;
    }

    public void setLikes(List<UUID> likes) {
        this.likes = likes;
    }
}
