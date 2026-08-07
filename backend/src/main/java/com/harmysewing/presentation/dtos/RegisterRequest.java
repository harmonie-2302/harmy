package com.harmysewing.presentation.dtos;

import com.harmysewing.domain.models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Le nom est obligatoire.")
        String nom,
        @NotBlank(message = "Le prénom est obligatoire.")
        String prenom,
        @NotBlank(message = "L'adresse email est obligatoire.")
        @Email(message = "Format d'email invalide.")
        String email,
        @NotBlank(message = "Le mot de passe est obligatoire.")
        @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères.")
        String motDePasse,
        @NotNull(message = "Le rôle est obligatoire.")
        Role role,
        String telephone
) {}
