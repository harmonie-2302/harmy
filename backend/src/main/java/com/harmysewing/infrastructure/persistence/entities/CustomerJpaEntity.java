package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers")
public class CustomerJpaEntity {

    @Id
    private UUID id;

    @Column(name = "atelier_id", nullable = false)
    private UUID atelierId;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "registered_user_id")
    private UUID registeredUserId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone")
    private String phone;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "bust", nullable = false)
    private Double bust = 0.0;

    @Column(name = "waist", nullable = false)
    private Double waist = 0.0;

    @Column(name = "hips", nullable = false)
    private Double hips = 0.0;

    @Column(name = "arm", nullable = false)
    private Double arm = 0.0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public CustomerJpaEntity() {
    }

    public CustomerJpaEntity(UUID id, UUID atelierId, String type, UUID registeredUserId, String name, String phone, String notes, Double bust, Double waist, Double hips, Double arm, LocalDateTime createdAt) {
        this.id = id;
        this.atelierId = atelierId;
        this.type = type != null ? type : "local";
        this.registeredUserId = registeredUserId;
        this.name = name;
        this.phone = phone;
        this.notes = notes;
        this.bust = bust != null ? bust : 0.0;
        this.waist = waist != null ? waist : 0.0;
        this.hips = hips != null ? hips : 0.0;
        this.arm = arm != null ? arm : 0.0;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UUID getRegisteredUserId() {
        return registeredUserId;
    }

    public void setRegisteredUserId(UUID registeredUserId) {
        this.registeredUserId = registeredUserId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getBust() {
        return bust;
    }

    public void setBust(Double bust) {
        this.bust = bust;
    }

    public Double getWaist() {
        return waist;
    }

    public void setWaist(Double waist) {
        this.waist = waist;
    }

    public Double getHips() {
        return hips;
    }

    public void setHips(Double hips) {
        this.hips = hips;
    }

    public Double getArm() {
        return arm;
    }

    public void setArm(Double arm) {
        this.arm = arm;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
