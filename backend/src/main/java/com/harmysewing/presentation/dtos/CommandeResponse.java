package com.harmysewing.presentation.dtos;

import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.StatutCommande;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CommandeResponse(
        UUID id,
        String reference,
        UUID clientId,
        UUID atelierId,
        UUID carnetMesureId,
        UUID customerRefId,
        String customerName,
        String modelCaption,
        StatutCommande statut,
        String status,
        Boolean fabricReceived,
        Double prixTotal,
        Double acompteVerse,
        Double soldeRestant,
        String description,
        LocalDateTime dateCommande,
        LocalDateTime dateLivraisonPrevue,
        String dueDate,
        Map<String, Object> pricing,
        Map<String, Object> timestamps,
        Map<String, Double> measurements,
        List<Map<String, Object>> events
) {
    public static CommandeResponse fromDomain(Commande commande) {
        if (commande == null) {
            return null;
        }

        double total = commande.getPrixTotal() != null ? commande.getPrixTotal() : 0.0;
        double deposit = commande.getAcompteVerse() != null ? commande.getAcompteVerse() : 0.0;
        double balance = commande.getSoldeRestant() != null
                ? commande.getSoldeRestant()
                : Math.max(0.0, total - deposit);
        StatutCommande statut = commande.getStatut() != null ? commande.getStatut() : StatutCommande.TISSU_RECU;

        CarnetMesure carnet = commande.getCarnetMesure();
        String nomCliente = null;
        if (carnet != null && carnet.getNomClient() != null && !carnet.getNomClient().isBlank()) {
            nomCliente = carnet.getNomClient();
        } else if (commande.getClient() != null) {
            nomCliente = commande.getClient().getDisplayName();
        }

        Map<String, Object> pricingMap = new LinkedHashMap<>();
        pricingMap.put("total", total);
        pricingMap.put("deposit", deposit);
        pricingMap.put("balance", balance);
        pricingMap.put("currency", "FC");

        String creation = commande.getDateCommande() != null ? commande.getDateCommande().toString() : null;
        Map<String, Object> timestampsMap = new LinkedHashMap<>();
        timestampsMap.put("createdAt", creation);
        // La date de dernière modification n'est pas persistée : on expose la
        // date de création plutôt qu'un « maintenant » trompeur.
        timestampsMap.put("updatedAt", creation);
        timestampsMap.put("deliveredAt", null);

        List<Map<String, Object>> eventsList = new ArrayList<>();
        Map<String, Object> initEvent = new LinkedHashMap<>();
        initEvent.put("type", "CREATED");
        initEvent.put("byUserId", commande.getClient() != null ? commande.getClient().getId().toString() : null);
        initEvent.put("text", "Commande enregistrée");
        initEvent.put("createdAt", creation);
        eventsList.add(initEvent);

        Map<String, Object> etapeEvent = new LinkedHashMap<>();
        etapeEvent.put("type", statut.name());
        etapeEvent.put("byUserId", null);
        etapeEvent.put("text", libelleStatut(statut));
        etapeEvent.put("createdAt", creation);
        eventsList.add(etapeEvent);

        return new CommandeResponse(
                commande.getId(),
                commande.getReference(),
                commande.getClient() != null ? commande.getClient().getId() : null,
                commande.getAtelier() != null ? commande.getAtelier().getId() : null,
                carnet != null ? carnet.getId() : null,
                carnet != null ? carnet.getCustomerId() : null,
                nomCliente,
                commande.getDescription(),
                statut,
                statut.name(),
                Boolean.TRUE,
                total,
                deposit,
                balance,
                commande.getDescription(),
                commande.getDateCommande(),
                commande.getDateLivraisonPrevue(),
                commande.getDateLivraisonPrevue() != null ? commande.getDateLivraisonPrevue().toString() : null,
                pricingMap,
                timestampsMap,
                carnet != null ? carnet.getMesures() : Map.of(),
                eventsList
        );
    }

    private static String libelleStatut(StatutCommande statut) {
        return switch (statut) {
            case TISSU_RECU -> "Tissu reçu à l'atelier";
            case EN_COUTURE -> "Confection en cours";
            case PRET_POUR_ESSAYAGE -> "Prêt pour l'essayage";
            case LIVRE -> "Commande livrée";
        };
    }
}
