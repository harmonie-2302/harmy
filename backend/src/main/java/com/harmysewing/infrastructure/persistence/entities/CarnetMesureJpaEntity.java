package com.harmysewing.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "carnets_mesures")
public class CarnetMesureJpaEntity {

    @Id
    private UUID id;

    @Column(name = "nom_client", nullable = false)
    private String nomClient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private UserJpaEntity cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "couturiere_id")
    private UserJpaEntity couturiere;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "est_local", nullable = false)
    private boolean estLocal;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "carnet_mesures_valeurs", joinColumns = @JoinColumn(name = "carnet_id"))
    @MapKeyColumn(name = "cle_mesure")
    @Column(name = "valeur_mesure")
    private Map<String, Double> mesures = new HashMap<>();

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    public CarnetMesureJpaEntity() {
    }

    public CarnetMesureJpaEntity(UUID id, String nomClient, UserJpaEntity cliente, UserJpaEntity couturiere, boolean estLocal, Map<String, Double> mesures, LocalDateTime dateCreation, LocalDateTime dateModification) {
        this(id, nomClient, cliente, couturiere, estLocal, mesures, dateCreation, dateModification, null);
    }

    public CarnetMesureJpaEntity(UUID id, String nomClient, UserJpaEntity cliente, UserJpaEntity couturiere, boolean estLocal, Map<String, Double> mesures, LocalDateTime dateCreation, LocalDateTime dateModification, UUID customerId) {
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
        this.customerId = customerId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
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

    public UserJpaEntity getCliente() {
        return cliente;
    }

    public void setCliente(UserJpaEntity cliente) {
        this.cliente = cliente;
    }

    public UserJpaEntity getCouturiere() {
        return couturiere;
    }

    public void setCouturiere(UserJpaEntity couturiere) {
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
}
