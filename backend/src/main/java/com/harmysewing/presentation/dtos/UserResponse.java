package com.harmysewing.presentation.dtos;

import com.harmysewing.domain.models.Role;
import com.harmysewing.domain.models.User;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String nom,
        String prenom,
        String displayName,
        String email,
        Role role,
        String telephone,
        String phone,
        String whatsapp,
        String photoURL,
        UUID atelierId,
        Map<String, Object> subscription,
        LocalDateTime dateCreation,
        LocalDateTime createdAt
) {
    public static UserResponse fromDomain(User user) {
        return fromDomain(user, null);
    }

    public static UserResponse fromDomain(User user, UUID atelierId) {
        if (user == null) {
            return null;
        }

        Map<String, Object> subscription = new HashMap<>();
        subscription.put("status", user.getSubscriptionStatus() != null ? user.getSubscriptionStatus() : "inactive");
        subscription.put("plan", user.getSubscriptionPlan() != null ? user.getSubscriptionPlan() : "Aucun");
        subscription.put("renewalDate",
                user.getSubscriptionRenewalDate() != null ? user.getSubscriptionRenewalDate().toString() : null);

        return new UserResponse(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole(),
                user.getTelephone(),
                user.getTelephone(),
                user.getWhatsapp(),
                user.getPhotoUrl(),
                atelierId,
                subscription,
                user.getDateCreation(),
                user.getDateCreation()
        );
    }
}
