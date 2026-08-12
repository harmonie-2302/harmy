package com.harmysewing.infrastructure.persistence.entities;

import com.harmysewing.domain.models.Role;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserJpaEntity {

    @Id
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom", nullable = false)
    private String prenom;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "photo_url", length = 1000)
    private String photoUrl;

    @Column(name = "whatsapp")
    private String whatsapp;

    @Column(name = "subscription_status", nullable = false)
    private String subscriptionStatus = "inactive";

    @Column(name = "subscription_plan")
    private String subscriptionPlan;

    @Column(name = "subscription_renewal_date")
    private LocalDateTime subscriptionRenewalDate;

    public UserJpaEntity() {
    }

    public UserJpaEntity(UUID id, String nom, String prenom, String email, String motDePasse, Role role, String telephone, LocalDateTime dateCreation) {
        this(id, nom, prenom, email, motDePasse, role, telephone, dateCreation, null, null, "inactive", null, null);
    }

    public UserJpaEntity(UUID id, String nom, String prenom, String email, String motDePasse, Role role, String telephone,
                         LocalDateTime dateCreation, String photoUrl, String whatsapp, String subscriptionStatus,
                         String subscriptionPlan, LocalDateTime subscriptionRenewalDate) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.role = role;
        this.telephone = telephone;
        this.dateCreation = dateCreation;
        this.photoUrl = photoUrl;
        this.whatsapp = whatsapp;
        this.subscriptionStatus = subscriptionStatus != null ? subscriptionStatus : "inactive";
        this.subscriptionPlan = subscriptionPlan;
        this.subscriptionRenewalDate = subscriptionRenewalDate;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }

    public String getSubscriptionStatus() {
        return subscriptionStatus;
    }

    public void setSubscriptionStatus(String subscriptionStatus) {
        this.subscriptionStatus = subscriptionStatus;
    }

    public String getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(String subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public LocalDateTime getSubscriptionRenewalDate() {
        return subscriptionRenewalDate;
    }

    public void setSubscriptionRenewalDate(LocalDateTime subscriptionRenewalDate) {
        this.subscriptionRenewalDate = subscriptionRenewalDate;
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

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
