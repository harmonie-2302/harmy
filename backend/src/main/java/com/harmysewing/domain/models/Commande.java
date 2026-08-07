package com.harmysewing.domain.models;

import com.harmysewing.domain.exceptions.DomainException;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class Commande {

    private UUID id;
    private String reference;
    private User client;
    private Atelier atelier;
    private CarnetMesure carnetMesure;
    private StatutCommande statut;
    private Double prixTotal;
    private Double acompteVerse;
    private Double soldeRestant;
    private String description;
    private LocalDateTime dateCommande;
    private LocalDateTime dateLivraisonPrevue;

    public Commande() {
        this.statut = StatutCommande.TISSU_RECU;
        this.acompteVerse = 0.0;
        this.prixTotal = 0.0;
        this.soldeRestant = 0.0;
    }

    public Commande(UUID id, String reference, User client, Atelier atelier, CarnetMesure carnetMesure, Double prixTotal, Double acompteVerse, String description, LocalDateTime dateCommande, LocalDateTime dateLivraisonPrevue) {
        if (carnetMesure == null) {
            throw new DomainException("Une commande nécessite un carnet de mesures valide.");
        }
        this.id = id;
        this.reference = reference;
        this.client = client;
        this.atelier = atelier;
        this.carnetMesure = carnetMesure;
        this.statut = StatutCommande.TISSU_RECU;
        this.prixTotal = prixTotal != null ? prixTotal : 0.0;
        this.acompteVerse = acompteVerse != null ? acompteVerse : 0.0;
        this.description = description;
        this.dateCommande = dateCommande != null ? dateCommande : LocalDateTime.now();
        this.dateLivraisonPrevue = dateLivraisonPrevue;
        recalculerSolde();
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

    public User getClient() {
        return client;
    }

    public void setClient(User client) {
        this.client = client;
    }

    public Atelier getAtelier() {
        return atelier;
    }

    public void setAtelier(Atelier atelier) {
        this.atelier = atelier;
    }

    public CarnetMesure getCarnetMesure() {
        return carnetMesure;
    }

    public void setCarnetMesure(CarnetMesure carnetMesure) {
        if (carnetMesure == null) {
            throw new DomainException("Une commande nécessite un carnet de mesures valide.");
        }
        this.carnetMesure = carnetMesure;
    }

    public StatutCommande getStatut() {
        return statut;
    }

    public void setStatut(StatutCommande statut) {
        if (StatutCommande.LIVRE.equals(statut) && this.soldeRestant != null && this.soldeRestant > 0) {
            throw new DomainException("Impossible de livrer la commande. Le solde restant doit être égal à 0 (solde actuel: " + this.soldeRestant + ").");
        }
        this.statut = statut;
    }

    public Double getPrixTotal() {
        return prixTotal;
    }

    public void setPrixTotal(Double prixTotal) {
        if (prixTotal != null && prixTotal < 0) {
            throw new DomainException("Le prix total ne peut pas être négatif.");
        }
        this.prixTotal = prixTotal;
        recalculerSolde();
    }

    public Double getAcompteVerse() {
        return acompteVerse;
    }

    public void setAcompteVerse(Double acompteVerse) {
        if (acompteVerse != null && acompteVerse < 0) {
            throw new DomainException("L'acompte ne peut pas être négatif.");
        }
        this.acompteVerse = acompteVerse;
        recalculerSolde();
    }

    public Double getSoldeRestant() {
        return soldeRestant;
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

    public void recalculerSolde() {
        double total = this.prixTotal != null ? this.prixTotal : 0.0;
        double acompte = this.acompteVerse != null ? this.acompteVerse : 0.0;
        this.soldeRestant = Math.max(0.0, total - acompte);
    }

    public void calculerSolde() {
        recalculerSolde();
    }

    public boolean peutEtreLivre() {
        recalculerSolde();
        return this.soldeRestant != null && this.soldeRestant == 0.0;
    }

    public void ajouterPaiement(Double montant) {
        if (montant == null || montant <= 0) {
            throw new DomainException("Le montant du paiement doit être supérieur à zéro.");
        }
        this.acompteVerse = (this.acompteVerse != null ? this.acompteVerse : 0.0) + montant;
        recalculerSolde();
    }

    public void avancerStatutKanban() {
        StatutCommande suivant = this.statut.getNextStatus();
        setStatut(suivant);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Commande commande = (Commande) o;
        return Objects.equals(id, commande.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Commande{" +
                "id=" + id +
                ", reference='" + reference + '\'' +
                ", statut=" + statut +
                ", prixTotal=" + prixTotal +
                ", soldeRestant=" + soldeRestant +
                '}';
    }
}
