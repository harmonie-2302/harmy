package com.harmysewing.presentation.dtos;

import com.harmysewing.domain.models.Atelier;
import com.harmysewing.infrastructure.persistence.entities.ReviewJpaEntity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Sérialise un atelier au format attendu par le frontend (interface Atelier).
 * Aucune valeur factice : les champs absents restent vides côté client.
 */
public final class AtelierDtoMapper {

    private AtelierDtoMapper() {
    }

    public static Map<String, Object> toDto(Atelier a, List<ReviewJpaEntity> reviews) {
        Map<String, Object> map = new LinkedHashMap<>();
        String couturiereId = a.getCouturiere() != null ? a.getCouturiere().getId().toString() : null;

        map.put("id", a.getId() != null ? a.getId().toString() : null);
        map.put("ownerId", couturiereId);
        map.put("couturiereId", couturiereId);
        map.put("ownerName", a.getCouturiere() != null ? a.getCouturiere().getDisplayName() : null);
        map.put("ownerPhotoURL", a.getCouturiere() != null ? a.getCouturiere().getPhotoUrl() : null);
        map.put("name", a.getNom() != null ? a.getNom() : "Atelier");
        map.put("bio", a.getDescription() != null ? a.getDescription() : "");
        map.put("phone", a.getTelephone() != null ? a.getTelephone() : "");
        map.put("address", a.getAdresse() != null ? a.getAdresse() : "");

        Map<String, String> location = new HashMap<>();
        location.put("city", a.getVille() != null ? a.getVille() : (a.getAdresse() != null ? a.getAdresse() : ""));
        location.put("country", a.getPays() != null ? a.getPays() : "RD Congo");
        map.put("location", location);

        map.put("pricing", a.getPricing() != null ? a.getPricing() : "Sur devis");
        map.put("portfolioCoverURL", a.getPortfolioCoverUrl() != null ? a.getPortfolioCoverUrl() : "");
        map.put("createdAt", a.getDateCreation() != null ? a.getDateCreation().toString() : null);

        List<Map<String, Object>> reviewDtos = new ArrayList<>();
        double somme = 0.0;
        if (reviews != null) {
            for (ReviewJpaEntity r : reviews) {
                reviewDtos.add(toReviewDto(r));
                somme += r.getRating() != null ? r.getRating() : 0;
            }
        }
        map.put("reviews", reviewDtos);
        map.put("reviewCount", reviewDtos.size());
        // Note moyenne réelle ; 0 tant qu'aucun avis n'a été déposé.
        map.put("rating", reviewDtos.isEmpty() ? 0.0 : Math.round((somme / reviewDtos.size()) * 10.0) / 10.0);

        return map;
    }

    public static Map<String, Object> toReviewDto(ReviewJpaEntity r) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", r.getId() != null ? r.getId().toString() : null);
        dto.put("atelierId", r.getAtelierId() != null ? r.getAtelierId().toString() : null);
        dto.put("authorId", r.getAuthorId() != null ? r.getAuthorId().toString() : null);
        dto.put("authorName", r.getAuthorName());
        dto.put("rating", r.getRating());
        dto.put("text", r.getText() != null ? r.getText() : "");
        dto.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        return dto;
    }
}
