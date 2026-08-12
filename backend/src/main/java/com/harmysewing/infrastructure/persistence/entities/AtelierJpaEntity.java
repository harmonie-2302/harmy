package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ateliers")
public class AtelierJpaEntity {

    @Id
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "adresse")
    private String adresse;

    @Column(name = "telephone")
    private String telephone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "couturiere_id", nullable = false)
    private UserJpaEntity couturiere;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "ville")
    private String ville;

    @Column(name = "pays")
    private String pays;

    @Column(name = "pricing")
    private String pricing;

    @Column(name = "portfolio_cover_url", length = 1000)
    private String portfolioCoverUrl;

    public AtelierJpaEntity() {
    }

    public AtelierJpaEntity(UUID id, String nom, String description, String adresse, String telephone, UserJpaEntity couturiere, LocalDateTime dateCreation) {
        this(id, nom, description, adresse, telephone, couturiere, dateCreation, null, null, null, null);
    }

    public AtelierJpaEntity(UUID id, String nom, String description, String adresse, String telephone, UserJpaEntity couturiere,
                            LocalDateTime dateCreation, String ville, String pays, String pricing, String portfolioCoverUrl) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.adresse = adresse;
        this.telephone = telephone;
        this.couturiere = couturiere;
        this.dateCreation = dateCreation;
        this.ville = ville;
        this.pays = pays;
        this.pricing = pricing;
        this.portfolioCoverUrl = portfolioCoverUrl;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public String getPricing() {
        return pricing;
    }

    public void setPricing(String pricing) {
        this.pricing = pricing;
    }

    public String getPortfolioCoverUrl() {
        return portfolioCoverUrl;
    }

    public void setPortfolioCoverUrl(String portfolioCoverUrl) {
        this.portfolioCoverUrl = portfolioCoverUrl;
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

    public UserJpaEntity getCouturiere() {
        return couturiere;
    }

    public void setCouturiere(UserJpaEntity couturiere) {
        this.couturiere = couturiere;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
