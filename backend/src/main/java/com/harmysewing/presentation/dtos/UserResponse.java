package com.harmysewing.presentation.dtos;

import com.harmysewing.domain.models.Role;
import com.harmysewing.domain.models.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String nom,
        String prenom,
        String email,
        Role role,
        String telephone,
        LocalDateTime dateCreation
) {
    public static UserResponse fromDomain(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole(),
                user.getTelephone(),
                user.getDateCreation()
        );
    }
}
