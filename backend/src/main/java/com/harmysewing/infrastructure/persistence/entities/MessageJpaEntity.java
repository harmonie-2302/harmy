package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class MessageJpaEntity {

    @Id
    private UUID id;

    @Column(name = "room_id", nullable = false)
    private String roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediteur_id")
    private UserJpaEntity expediteur;

    @Column(name = "contenu", nullable = false, length = 4000)
    private String contenu;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    public MessageJpaEntity() {
    }

    public MessageJpaEntity(UUID id, String roomId, UserJpaEntity expediteur, String contenu, LocalDateTime timestamp) {
        this.id = id;
        this.roomId = roomId;
        this.expediteur = expediteur;
        this.contenu = contenu;
        this.timestamp = timestamp;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public UserJpaEntity getExpediteur() {
        return expediteur;
    }

    public void setExpediteur(UserJpaEntity expediteur) {
        this.expediteur = expediteur;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
