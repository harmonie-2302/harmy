package com.harmysewing.domain.models;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class Atelier {

    private UUID id;
    private String nom;
    private String description;
    private String adresse;
    private String telephone;
    private User couturiere;
    private LocalDateTime dateCreation;

    public Atelier() {
    }

    public Atelier(UUID id, String nom, String description, String adresse, String telephone, User couturiere, LocalDateTime dateCreation) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.adresse = adresse;
        this.telephone = telephone;
        this.couturiere = couturiere;
        this.dateCreation = dateCreation;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public User getCouturiere() {
        return couturiere;
    }

    public void setCouturiere(User couturiere) {
        this.couturiere = couturiere;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Atelier atelier = (Atelier) o;
        return Objects.equals(id, atelier.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Atelier{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", adresse='" + adresse + '\'' +
                '}';
    }
}
