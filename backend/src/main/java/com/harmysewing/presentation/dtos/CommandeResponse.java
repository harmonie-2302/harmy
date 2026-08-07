package com.harmysewing.presentation.dtos;

import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.StatutCommande;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommandeResponse(
        UUID id,
        String reference,
        UUID clientId,
        UUID atelierId,
        UUID carnetMesureId,
        StatutCommande statut,
        Double prixTotal,
        Double acompteVerse,
        Double soldeRestant,
        String description,
        LocalDateTime dateCommande,
        LocalDateTime dateLivraisonPrevue
) {
    public static CommandeResponse fromDomain(Commande commande) {
        if (commande == null) {
            return null;
        }
        return new CommandeResponse(
                commande.getId(),
                commande.getReference(),
                commande.getClient() != null ? commande.getClient().getId() : null,
                commande.getAtelier() != null ? commande.getAtelier().getId() : null,
                commande.getCarnetMesure() != null ? commande.getCarnetMesure().getId() : null,
                commande.getStatut(),
                commande.getPrixTotal(),
                commande.getAcompteVerse(),
                commande.getSoldeRestant(),
                commande.getDescription(),
                commande.getDateCommande(),
                commande.getDateLivraisonPrevue()
        );
    }
}
