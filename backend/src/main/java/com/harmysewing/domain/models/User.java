package com.harmysewing.domain.models;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class User {

    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private Role role;
    private String telephone;
    private LocalDateTime dateCreation;
    private String photoUrl;
    private String whatsapp;
    private String subscriptionStatus = "inactive";
    private String subscriptionPlan;
    private LocalDateTime subscriptionRenewalDate;

    public User() {
    }

    public User(UUID id, String nom, String prenom, String email, String motDePasse, Role role, String telephone, LocalDateTime dateCreation) {
        this(id, nom, prenom, email, motDePasse, role, telephone, dateCreation, null, null, "inactive", null, null);
    }

    public User(UUID id, String nom, String prenom, String email, String motDePasse, Role role, String telephone,
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

    /** Nom d'affichage « Prénom Nom » utilisé par l'interface. */
    public String getDisplayName() {
        String p = prenom != null ? prenom.trim() : "";
        String n = nom != null ? nom.trim() : "";
        String complet = (p + " " + n).trim();
        return complet.isBlank() ? email : complet;
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

    public boolean isCouturiere() {
        return Role.COUTURIERE.equals(this.role);
    }

    public boolean isCliente() {
        return Role.CLIENTE.equals(this.role);
    }

    public boolean isAdmin() {
        return Role.ADMIN.equals(this.role);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                '}';
    }
}
