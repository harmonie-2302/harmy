package com.harmysewing.application.services;

import com.harmysewing.application.ports.out.AtelierRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.domain.models.User;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Garantit qu'une couturière possède toujours un atelier.
 *
 * Les tables customers, tasks et posts référencent ateliers(id) — sans atelier
 * provisionné, aucune création n'était possible depuis l'espace couturier.
 */
public class AtelierProvisioningService {

    private final AtelierRepositoryPort atelierRepository;

    public AtelierProvisioningService(AtelierRepositoryPort atelierRepository) {
        this.atelierRepository = atelierRepository;
    }

    public Optional<Atelier> trouverPourCouturiere(UUID couturiereId) {
        if (couturiereId == null) {
            return Optional.empty();
        }
        return atelierRepository.findByCouturiereId(couturiereId);
    }

    /**
     * Retourne l'atelier de la couturière, en le créant à la volée si nécessaire.
     */
    public Atelier assurerAtelier(User couturiere) {
        if (couturiere == null) {
            throw new DomainException("Utilisateur introuvable pour le provisionnement de l'atelier.");
        }
        if (!couturiere.isCouturiere()) {
            throw new DomainException("Seule une couturière peut disposer d'un atelier.");
        }

        return atelierRepository.findByCouturiereId(couturiere.getId())
                .orElseGet(() -> atelierRepository.save(new Atelier(
                        UUID.randomUUID(),
                        nomAtelierParDefaut(couturiere),
                        "Atelier de confection et de création sur mesure.",
                        null,
                        couturiere.getTelephone(),
                        couturiere,
                        LocalDateTime.now(),
                        null,
                        "RD Congo",
                        "Sur devis",
                        null
                )));
    }

    private String nomAtelierParDefaut(User couturiere) {
        String prenom = couturiere.getPrenom() != null ? couturiere.getPrenom().trim() : "";
        String nom = couturiere.getNom() != null ? couturiere.getNom().trim() : "";
        String identite = (prenom + " " + nom).trim();
        return identite.isBlank() ? "Mon Atelier" : "Atelier " + identite;
    }
}
