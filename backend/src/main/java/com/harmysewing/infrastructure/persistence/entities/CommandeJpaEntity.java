package com.harmysewing.infrastructure.persistence.entities;

import com.harmysewing.domain.models.StatutCommande;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "commandes")
public class CommandeJpaEntity {

    @Id
    private UUID id;

    @Column(name = "reference", nullable = false, unique = true)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private UserJpaEntity client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atelier_id")
    private AtelierJpaEntity atelier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carnet_mesure_id", nullable = false)
    private CarnetMesureJpaEntity carnetMesure;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutCommande statut;

    @Column(name = "prix_total", nullable = false)
    private Double prixTotal;

    @Column(name = "acompte_verse", nullable = false)
    private Double acompteVerse;

    @Column(name = "solde_restant", nullable = false)
    private Double soldeRestant;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "date_commande", nullable = false)
    private LocalDateTime dateCommande;

    @Column(name = "date_livraison_prevue")
    private LocalDateTime dateLivraisonPrevue;

    public CommandeJpaEntity() {
    }

    public CommandeJpaEntity(UUID id, String reference, UserJpaEntity client, AtelierJpaEntity atelier, CarnetMesureJpaEntity carnetMesure, StatutCommande statut, Double prixTotal, Double acompteVerse, Double soldeRestant, String description, LocalDateTime dateCommande, LocalDateTime dateLivraisonPrevue) {
        this.id = id;
        this.reference = reference;
        this.client = client;
        this.atelier = atelier;
        this.carnetMesure = carnetMesure;
        this.statut = statut;
        this.prixTotal = prixTotal;
        this.acompteVerse = acompteVerse;
        this.soldeRestant = soldeRestant;
        this.description = description;
        this.dateCommande = dateCommande;
        this.dateLivraisonPrevue = dateLivraisonPrevue;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public UserJpaEntity getClient() {
        return client;
    }

    public void setClient(UserJpaEntity client) {
        this.client = client;
    }

    public AtelierJpaEntity getAtelier() {
        return atelier;
    }

    public void setAtelier(AtelierJpaEntity atelier) {
        this.atelier = atelier;
    }

    public CarnetMesureJpaEntity getCarnetMesure() {
        return carnetMesure;
    }

    public void setCarnetMesure(CarnetMesureJpaEntity carnetMesure) {
        this.carnetMesure = carnetMesure;
    }

    public StatutCommande getStatut() {
        return statut;
    }

    public void setStatut(StatutCommande statut) {
        this.statut = statut;
    }

    public Double getPrixTotal() {
        return prixTotal;
    }

    public void setPrixTotal(Double prixTotal) {
        this.prixTotal = prixTotal;
    }

    public Double getAcompteVerse() {
        return acompteVerse;
    }

    public void setAcompteVerse(Double acompteVerse) {
        this.acompteVerse = acompteVerse;
    }

    public Double getSoldeRestant() {
        return soldeRestant;
    }

    public void setSoldeRestant(Double soldeRestant) {
        this.soldeRestant = soldeRestant;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateCommande() {
        return dateCommande;
    }

    public void setDateCommande(LocalDateTime dateCommande) {
        this.dateCommande = dateCommande;
    }

    public LocalDateTime getDateLivraisonPrevue() {
        return dateLivraisonPrevue;
    }

    public void setDateLivraisonPrevue(LocalDateTime dateLivraisonPrevue) {
        this.dateLivraisonPrevue = dateLivraisonPrevue;
    }
}
