package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class TaskJpaEntity {

    @Id
    private UUID id;

    @Column(name = "atelier_id", nullable = false)
    private UUID atelierId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "completed", nullable = false)
    private Boolean completed = false;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    public TaskJpaEntity() {
    }

    public TaskJpaEntity(UUID id, UUID atelierId, String title, Boolean completed, LocalDateTime dueDate) {
        this.id = id;
        this.atelierId = atelierId;
        this.title = title;
        this.completed = completed != null ? completed : false;
        this.dueDate = dueDate;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
}
