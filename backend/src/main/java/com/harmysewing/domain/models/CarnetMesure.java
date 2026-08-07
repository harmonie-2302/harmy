package com.harmysewing.domain.models;

import com.harmysewing.domain.exceptions.DomainException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public class CarnetMesure {

    private UUID id;
    private String nomClient;
    private User cliente;
    private User couturiere;
    private boolean estLocal;
    private Map<String, Double> mesures = new HashMap<>();
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    public CarnetMesure() {
    }

    public CarnetMesure(UUID id, String nomClient, User cliente, User couturiere, boolean estLocal, Map<String, Double> mesures, LocalDateTime dateCreation, LocalDateTime dateModification) {
        this.id = id;
        this.nomClient = nomClient;
        this.cliente = cliente;
        this.couturiere = couturiere;
        this.estLocal = estLocal;
        if (mesures != null) {
            this.mesures = new HashMap<>(mesures);
        }
        this.dateCreation = dateCreation;
        this.dateModification = dateModification;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNomClient() {
        return nomClient;
    }

    public void setNomClient(String nomClient) {
        this.nomClient = nomClient;
    }

    public User getCliente() {
        return cliente;
    }

    public void setCliente(User cliente) {
        this.cliente = cliente;
    }

    public User getCouturiere() {
        return couturiere;
    }

    public void setCouturiere(User couturiere) {
        this.couturiere = couturiere;
    }

    public boolean isEstLocal() {
        return estLocal;
    }

    public void setEstLocal(boolean estLocal) {
        this.estLocal = estLocal;
    }

    public Map<String, Double> getMesures() {
        return mesures;
    }

    public void setMesures(Map<String, Double> mesures) {
        this.mesures = mesures != null ? new HashMap<>(mesures) : new HashMap<>();
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public void meurePut(String cle, Double valeur) {
        if (valeur != null && valeur < 0) {
            throw new DomainException("Une valeur de mesure ne peut pas être négative.");
        }
        this.mesures.put(cle, valeur);
        this.dateModification = LocalDateTime.now();
    }

    public Double getMesure(String cle) {
        return this.mesures.get(cle);
    }

    public boolean canBeAccessedBy(User user) {
        if (user == null) {
            return false;
        }
        if (user.isAdmin()) {
            return true;
        }
        if (this.couturiere != null && this.couturiere.getId().equals(user.getId())) {
            return true;
        }
        if (!this.estLocal && this.cliente != null && this.cliente.getId().equals(user.getId())) {
            return true;
        }
        return false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CarnetMesure carnet = (CarnetMesure) o;
        return Objects.equals(id, carnet.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "CarnetMesure{" +
                "id=" + id +
                ", nomClient='" + nomClient + '\'' +
                ", estLocal=" + estLocal +
                '}';
    }
}
