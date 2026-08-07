package com.harmysewing.domain.models;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class PartageCarnet {

    private UUID id;
    private UUID carnetMesureId;
    private UUID couturiereId;
    private LocalDateTime datePartage;

    public PartageCarnet() {
    }

    public PartageCarnet(UUID id, UUID carnetMesureId, UUID couturiereId, LocalDateTime datePartage) {
        this.id = id;
        this.carnetMesureId = carnetMesureId;
        this.couturiereId = couturiereId;
        this.datePartage = datePartage != null ? datePartage : LocalDateTime.now();
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PartageCarnet that = (PartageCarnet) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
