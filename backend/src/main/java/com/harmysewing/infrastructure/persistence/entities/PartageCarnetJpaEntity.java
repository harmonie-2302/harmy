package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "partages_carnets", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"carnet_mesure_id", "couturiere_id"})
})
public class PartageCarnetJpaEntity {

    @Id
    private UUID id;

    @Column(name = "carnet_mesure_id", nullable = false)
    private UUID carnetMesureId;

    @Column(name = "couturiere_id", nullable = false)
    private UUID couturiereId;

    @Column(name = "date_partage", nullable = false)
    private LocalDateTime datePartage;

    public PartageCarnetJpaEntity() {
    }

    public PartageCarnetJpaEntity(UUID id, UUID carnetMesureId, UUID couturiereId, LocalDateTime datePartage) {
        this.id = id;
        this.carnetMesureId = carnetMesureId;
        this.couturiereId = couturiereId;
        this.datePartage = datePartage;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCarnetMesureId() {
        return carnetMesureId;
    }

    public void setCarnetMesureId(UUID carnetMesureId) {
        this.carnetMesureId = carnetMesureId;
    }

    public UUID getCouturiereId() {
        return couturiereId;
    }

    public void setCouturiereId(UUID couturiereId) {
        this.couturiereId = couturiereId;
    }

    public LocalDateTime getDatePartage() {
        return datePartage;
    }

    public void setDatePartage(LocalDateTime datePartage) {
        this.datePartage = datePartage;
    }
}
