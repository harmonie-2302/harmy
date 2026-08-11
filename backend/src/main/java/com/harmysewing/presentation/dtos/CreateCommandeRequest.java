package com.harmysewing.presentation.dtos;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateCommandeRequest(
        String reference,
        @JsonAlias({"clientId", "customerRefId"})
        UUID clientId,
        UUID atelierId,
        @JsonAlias({"carnetMesureId", "measureBookId"})
        UUID carnetMesureId,
        @JsonAlias({"prixTotal", "total"})
        @PositiveOrZero(message = "Le prix total doit être positif ou nul.")
        Double prixTotal,
        @JsonAlias({"acompteVerse", "deposit"})
        @PositiveOrZero(message = "L'acompte versé doit être positif ou nul.")
        Double acompteVerse,
        @JsonAlias({"description", "modelCaption"})
        String description,
        @JsonAlias({"dateLivraisonPrevue", "dueDate"})
        LocalDateTime dateLivraisonPrevue
) {}
