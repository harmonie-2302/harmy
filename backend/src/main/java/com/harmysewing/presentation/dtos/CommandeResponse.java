package com.harmysewing.presentation.dtos;

import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.StatutCommande;

import java.time.LocalDateTime;
import java.util.*;

public record CommandeResponse(
        UUID id,
        String reference,
        UUID clientId,
        UUID atelierId,
        UUID carnetMesureId,
        StatutCommande statut,
        String status,
        Double prixTotal,
        Double acompteVerse,
        Double soldeRestant,
        String description,
        LocalDateTime dateCommande,
        LocalDateTime dateLivraisonPrevue,
        String dueDate,
        Map<String, Object> pricing,
        Map<String, Object> timestamps,
        List<Map<String, Object>> events
) {
    public static CommandeResponse fromDomain(Commande commande) {
        if (commande == null) {
            return null;
        }

        double total = commande.getPrixTotal() != null ? commande.getPrixTotal() : 0.0;
        double deposit = commande.getAcompteVerse() != null ? commande.getAcompteVerse() : 0.0;
        double balance = commande.getSoldeRestant() != null ? commande.getSoldeRestant() : Math.max(0.0, total - deposit);
        String statusStr = commande.getStatut() != null ? commande.getStatut().name() : "TISSU_RECU";

        Map<String, Object> pricingMap = new HashMap<>();
        pricingMap.put("total", total);
        pricingMap.put("deposit", deposit);
        pricingMap.put("balance", balance);
        pricingMap.put("currency", "FCFA");

        Map<String, Object> timestampsMap = new HashMap<>();
        timestampsMap.put("createdAt", commande.getDateCommande() != null ? commande.getDateCommande().toString() : LocalDateTime.now().toString());
        timestampsMap.put("updatedAt", LocalDateTime.now().toString());
        timestampsMap.put("deliveredAt", commande.getStatut() == StatutCommande.LIVRE ? LocalDateTime.now().toString() : null);

        List<Map<String, Object>> eventsList = new ArrayList<>();
        Map<String, Object> initEvent = new HashMap<>();
        initEvent.put("type", "CREATED");
        initEvent.put("byUserId", commande.getClient() != null ? commande.getClient().getId().toString() : "System");
        initEvent.put("text", "Commande enregistrée");
        initEvent.put("createdAt", commande.getDateCommande() != null ? commande.getDateCommande().toString() : LocalDateTime.now().toString());
        eventsList.add(initEvent);

        return new CommandeResponse(
                commande.getId(),
                commande.getReference(),
                commande.getClient() != null ? commande.getClient().getId() : null,
                commande.getAtelier() != null ? commande.getAtelier().getId() : null,
                commande.getCarnetMesure() != null ? commande.getCarnetMesure().getId() : null,
                commande.getStatut(),
                statusStr,
                total,
                deposit,
                balance,
                commande.getDescription(),
                commande.getDateCommande(),
                commande.getDateLivraisonPrevue(),
                commande.getDateLivraisonPrevue() != null ? commande.getDateLivraisonPrevue().toString() : null,
                pricingMap,
                timestampsMap,
                eventsList
        );
    }
}
