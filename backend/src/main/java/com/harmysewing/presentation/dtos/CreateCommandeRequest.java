package com.harmysewing.presentation.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateCommandeRequest(
        String reference,
        UUID clientId,
        UUID atelierId,
        @NotNull(message = "L'identifiant du carnet de mesures est obligatoire.")
        UUID carnetMesureId,
        @NotNull(message = "Le prix total est obligatoire.")
        @PositiveOrZero(message = "Le prix total doit être positif ou nul.")
        Double prixTotal,
        @PositiveOrZero(message = "L'acompte versé doit être positif ou nul.")
        Double acompteVerse,
        String description,
        LocalDateTime dateLivraisonPrevue
) {}
