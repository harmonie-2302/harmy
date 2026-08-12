package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comments")
public class CommentJpaEntity {

    @Id
    private UUID id;

    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_avatar")
    private String authorAvatar;

    @Column(name = "text", nullable = false, length = 2000)
    private String text;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "author_id")
    private UUID authorId;

    public CommentJpaEntity() {
    }

    public CommentJpaEntity(UUID id, UUID postId, String authorName, String authorAvatar, String text, LocalDateTime createdAt) {
        this(id, postId, authorName, authorAvatar, text, createdAt, null);
    }

    public CommentJpaEntity(UUID id, UUID postId, String authorName, String authorAvatar, String text, LocalDateTime createdAt, UUID authorId) {
        this.id = id;
        this.postId = postId;
        this.authorName = authorName;
        this.authorAvatar = authorAvatar;
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

    public UUID getPostId() {
        return postId;
    }

    public void setPostId(UUID postId) {
        this.postId = postId;
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
